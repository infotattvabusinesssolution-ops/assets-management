import prisma from '../../config/prisma.js';

function isCategoryMatch(c, catName) {
  if (!catName || !c) return false;
  const cn = catName.toLowerCase().trim();
  const name = (c.name || '').toLowerCase().trim();
  const code = (c.code || '').toLowerCase().trim();
  return (
    name === cn ||
    code === cn ||
    name.includes(cn) ||
    cn.includes(name) ||
    (cn === 'server' && (name.includes('infra') || code.includes('infra'))) ||
    (cn === 'servers' && (name.includes('infra') || code.includes('infra')))
  );
}

/**
 * Validate Bulk Import Records (Pre-upload validation)
 */
export async function validateBulkImport(req, res, next) {
  try {
    const { rows = [] } = req.body;

    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    const records = [];

    // Pre-fetch existing master data for validation
    const [existingAssets, categories, sites, employees] = await Promise.all([
      prisma.asset.findMany({ select: { assetId: true, serialNumber: true, tagNumber: true, rfidEpc: true } }),
      prisma.category.findMany({ select: { id: true, name: true, code: true } }),
      prisma.site.findMany({ select: { id: true, name: true, code: true } }),
      prisma.employee.findMany({ select: { id: true, fullName: true, employeeCode: true } })
    ]);

    const existingAssetIds = new Set(existingAssets.map((a) => a.assetId));
    const existingSerials = new Set(existingAssets.map((a) => a.serialNumber).filter(Boolean));
    const seenBatchSerials = new Set();
    const seenBatchIds = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = row.row || i + 1;
      let status = 'Valid';
      let remarks = '-';

      const assetId = String(row.assetId || row.AssetID || '').trim() || `AST-BLK-${Date.now()}-${rowNum}`;
      const name = row.assetName || row.name || row.Description || row.description || '';
      const category = String(row.category || row.Category || '').trim();
      const serialNumber = row.serialNumber || row.SerialNumber || row['Serial Number'] || '';
      const location = String(row.location || row.Location || row.site || '').trim();
      const custodian = row.custodian || row.Custodian || '';
      const rawCost = row.acquisitionValue || row['Acquisition Value'] || row.acquisitionCost || row.cost || 0;
      const currency = row.currency || row.Currency || 'USD';

      // Validation logic
      if (!name || name.trim() === '') {
        status = 'Error';
        remarks = 'Asset Name / Description is required';
        errorCount++;
      } else if (!category || !categories.some(c => isCategoryMatch(c, category))) {
        status = 'Error'; remarks = 'Category not found in master data'; errorCount++;
      } else if (location === 'Invalid' || location === 'Unknown') {
        status = 'Error';
        remarks = 'Invalid location reference';
        errorCount++;
      } else if (location && location !== '-' && location !== 'Unassigned' && !sites.some(site => site.name.toLowerCase() === location.toLowerCase() || site.name.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase().includes(site.name.toLowerCase()) || site.code.toLowerCase() === location.toLowerCase())) {
        status = 'Error'; remarks = 'Site not found in master data'; errorCount++;
      } else if (row.assetId && seenBatchIds.has(row.assetId)) {
        status = 'Error'; remarks = 'Duplicate Asset ID within the same upload batch'; errorCount++;
      } else if (!serialNumber && (category === 'Laptop' || category === 'Mobile Device' || category === 'Server')) {
        status = 'Error';
        remarks = 'Serial number is required for serialized category';
        errorCount++;
      } else if (serialNumber && seenBatchSerials.has(serialNumber)) {
        status = 'Error';
        remarks = `Duplicate serial number [${serialNumber}] within the same upload batch`;
        errorCount++;
      } else if (custodian && !employees.some((e) => e.fullName.toLowerCase().includes(custodian.toLowerCase()))) {
        status = 'Warning';
        remarks = `Custodian [${custodian}] not found. Will be unassigned.`;
        warningCount++;
      } else if (serialNumber && existingSerials.has(serialNumber)) {
        status = 'Warning';
        remarks = `Existing Serial Number [${serialNumber}]. Record will update existing master.`;
        warningCount++;
      } else {
        status = 'Valid';
        remarks = '-';
        validCount++;
      }

      seenBatchIds.add(assetId);
      if (serialNumber) {
        seenBatchSerials.add(serialNumber);
      }

      records.push({
        row: rowNum,
        status,
        assetId,
        name,
        category,
        serialNumber,
        location,
        custodian,
        acquisitionValue: Number(rawCost) || 0,
        currency,
        remarks
      });
    }

    res.json({
      success: true,
      totalRecords: rows.length,
      validCount,
      warningCount,
      errorCount,
      records
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit Bulk Import: Actually Creates or Updates Assets in the Database
 */
export async function submitBulkImport(req, res, next) {
  try {
    const { rows = [], batchReference, fileName } = req.body;
    if (!Array.isArray(rows) || !rows.length || rows.some(row => !['Valid', 'Warning', 'Error'].includes(row.status))) {
      return res.status(400).json({ success: false, message: 'Validate a nonempty file before submitting.' });
    }

    // Resolve User for audit
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    finalUserId = userInDb ? userInDb.id : (await prisma.user.findFirst())?.id || null;

    const batchRef =
      batchReference ||
      `BATCH-UP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 899 + 100)}`;
    const finalFileName = fileName || 'Unknown file';

    // Fetch master defaults
    const [defaultCompany, defaultSite, defaultCategory, categories, sites, employees, manufacturers] =
      await Promise.all([
        prisma.company.findFirst({ where: { active: true } }),
        prisma.site.findFirst({ where: { active: true } }),
        prisma.category.findFirst({ where: { active: true } }),
        prisma.category.findMany(),
        prisma.site.findMany(),
        prisma.employee.findMany(),
        prisma.manufacturer.findMany()
      ]);

    if (!defaultCompany) return res.status(400).json({ success: false, message: 'An active company is required before importing assets.' });
    const companyId = defaultCompany.id;

    let createdCount = 0;
    let updatedCount = 0;
    const validationErrors = rows.filter(row => row.status === 'Error' || row.status === 'ERROR');
    let failedCount = validationErrors.length;
    const errors = validationErrors.map(row => ({ row: row.row, remarks: row.remarks || 'Validation error' }));
    const processedAssetIds = [];

    // Filter out rows marked as Error unless all are passed
    const rowsToProcess = rows.filter((r) => r.status !== 'Error' && r.status !== 'ERROR');

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      try {
        const desc = row.name || row.assetName || row.description || row.Description;
        const rawSerial = row.serialNumber !== '-' ? row.serialNumber : null;
        if (!rawSerial && ['Laptop', 'Mobile Device', 'Server'].includes(row.category)) {
          throw new Error('Serial number is required for this category.');
        }
        let assetId = String(row.assetId || row.AssetID || '').trim() || `AST-BLK-${Date.now()}-${row.row || i + 1}`;
        if (!desc || !row.category) throw new Error('Asset name and category are required.');
        const tagNumber = row.tagNumber || `TAG-${assetId}`;
        const rawAcq = row.acquisitionValue || row.acquisitionCost || row['Acquisition Value'] || 0;
        const acqValue = typeof rawAcq === 'string' ? parseFloat(rawAcq.replace(/[^0-9.-]+/g, '')) || 0 : Number(rawAcq) || 0;
        const currency = row.currency || 'USD';

        // Resolve Category
        let matchedCat = null;
        const rowCatName = row.category || row.Category;
        if (rowCatName) {
          matchedCat = categories.find((c) => isCategoryMatch(c, rowCatName));
        }
        if (!matchedCat) {
          matchedCat = defaultCategory || categories[0];
        }
        if (!matchedCat) throw new Error('Category not found in master data.');
        const categoryId = matchedCat.id;

        // Resolve Site
        let matchedSite = null;
        const rowLoc = row.location || row.Location || row.site;
        if (rowLoc) {
          matchedSite = sites.find(
            (s) =>
              s.name.toLowerCase() === rowLoc.toLowerCase() ||
              s.name.toLowerCase().includes(rowLoc.toLowerCase()) ||
              rowLoc.toLowerCase().includes(s.name.toLowerCase()) ||
              s.code.toLowerCase() === rowLoc.toLowerCase()
          );
        }
        if (!matchedSite) {
          matchedSite = defaultSite || sites[0];
        }
        if (!matchedSite) throw new Error('Site not found in master data.');
        const siteId = matchedSite.id;

        // Resolve Custodian
        let custodianId = null;
        const rowCust = row.custodian || row.Custodian;
        if (rowCust && rowCust !== 'Unassigned' && rowCust !== '-') {
          const emp = employees.find(
            (e) =>
              e.fullName.toLowerCase().includes(rowCust.toLowerCase()) ||
              e.employeeCode.toLowerCase() === rowCust.toLowerCase()
          );
          if (emp) custodianId = emp.id;
        }

        // Map status and condition
        let lifecycleStatus = 'IN_SERVICE';
        if (row.status === 'Under Maintenance') lifecycleStatus = 'UNDER_MAINTENANCE';
        else if (row.status === 'In Store') lifecycleStatus = 'IN_STORE';

        const condition = row.condition ? String(row.condition).toUpperCase() : 'GOOD';

        // Check if asset already exists by serialNumber or assetId
        let existingAsset = null;
        if (rawSerial) {
          existingAsset = await prisma.asset.findFirst({ where: { serialNumber: rawSerial } });
        }
        if (!existingAsset && row.assetId) {
          existingAsset = await prisma.asset.findFirst({ where: { assetId: row.assetId } });
        }

        if (existingAsset) {
          // Update existing asset
          const updated = await prisma.asset.update({
            where: { id: existingAsset.id },
            data: {
              description: desc,
              categoryId: categoryId || existingAsset.categoryId,
              siteId: siteId || existingAsset.siteId,
              custodianId: custodianId || existingAsset.custodianId,
              condition: ['GOOD', 'FAIR', 'DAMAGED', 'NEW'].includes(condition) ? condition : existingAsset.condition,
              lifecycleStatus,
              acquisitionValue: acqValue || existingAsset.acquisitionValue,
              currency,
              updatedByUserId: finalUserId
            }
          });

          await prisma.assetTransaction.create({
            data: {
              assetId: existingAsset.id,
              transactionType: 'BULK_UPDATE',
              fromStatus: existingAsset.lifecycleStatus,
              toStatus: updated.lifecycleStatus,
              performedByUserId: finalUserId || 'usr-default',
              notes: `Asset updated via Bulk Upload batch [${batchRef}]. Source file: ${finalFileName}`
            }
          });

          updatedCount++;
          processedAssetIds.push(updated.assetId);
        } else {
          // Create new asset
          const newAsset = await prisma.asset.create({
            data: {
              assetId,
              description: desc,
              categoryId,
              companyId,
              siteId,
              custodianId,
              serialNumber: rawSerial || `SN-${assetId}`,
              tagNumber,
              barcode: tagNumber,
              qrCode: tagNumber,
              lifecycleStatus,
              condition: ['GOOD', 'FAIR', 'DAMAGED', 'NEW'].includes(condition) ? condition : 'NEW',
              criticality: 'MEDIUM',
              acquisitionValue: acqValue,
              currency,
              createdByUserId: finalUserId,
              updatedByUserId: finalUserId
            }
          });

          // Corporate Book Value with netBookValue
          if (acqValue > 0) {
            await prisma.assetBookValue.create({
              data: {
                assetId: newAsset.id,
                bookType: 'CORPORATE',
                capitalizationDate: new Date(),
                capitalizationValue: acqValue,
                usefulLifeMonths: 48,
                residualValue: parseFloat((acqValue * 0.1).toFixed(2)),
                accumulatedDepreciation: 0,
                netBookValue: acqValue
              }
            });
          }

          // Initial Registration Transaction
          await prisma.assetTransaction.create({
            data: {
              assetId: newAsset.id,
              transactionType: 'BULK_IMPORT',
              toStatus: lifecycleStatus,
              performedByUserId: finalUserId || 'usr-default',
              notes: `Asset registered via Bulk Upload batch [${batchRef}]. Source file: ${finalFileName}`
            }
          });

          createdCount++;
          processedAssetIds.push(newAsset.assetId);
        }
      } catch (rowErr) {
        failedCount++;
        errors.push({ row: row.row || i + 1, remarks: rowErr.message });
      }
    }

    const totalProcessed = createdCount + updatedCount;

    // Create ImportJob record
    const job = await prisma.importJob.create({
      data: {
        fileName: finalFileName,
        entityType: 'ASSET_BULK_UPLOAD',
        totalRows: rows.length,
        status: failedCount === 0 ? 'COMPLETED' : totalProcessed > 0 ? 'PARTIAL' : 'FAILED',
        createdByUserId: finalUserId,
        processedRows: totalProcessed + failedCount,
        successRows: totalProcessed,
        failedRows: failedCount,
        errors: errors.length > 0 ? JSON.stringify(errors) : null
      }
    });

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_BULK_UPLOAD',
        entityType: 'ImportJob',
        entityId: job.id,
        afterState: JSON.stringify({
          batchRef,
          fileName: finalFileName,
          total: rows.length,
          created: createdCount,
          updated: updatedCount,
          failed: failedCount
        }).slice(0, 240)
      }
    });

    res.json({
      success: true,
      message: `Bulk upload batch [${batchRef}] processed successfully! ${createdCount} created, ${updatedCount} updated.`,
      batchReference: batchRef,
      processedCount: rows.length,
      successCount: totalProcessed,
      createdCount,
      updatedCount,
      failedCount,
      jobId: job.id,
      job
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload and Validate File directly (CSV / Text parsing)
 */
export async function uploadAndValidateBulkFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const content = req.file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file must have a header row and at least one data row.' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) continue;

      const rowObj = { row: i + 1 };
      headers.forEach((h, colIdx) => {
        rowObj[h] = parts[colIdx] || '';
      });

      // Normalize common keys
      rowObj.assetId = rowObj.assetId || rowObj['Asset ID'] || rowObj.AssetID;
      rowObj.name = rowObj.name || rowObj.assetName || rowObj['Asset Name'] || rowObj.Description || rowObj.description;
      rowObj.category = rowObj.category || rowObj.Category;
      rowObj.serialNumber = rowObj.serialNumber || rowObj['Serial Number'] || rowObj.SerialNumber;
      rowObj.location = rowObj.location || rowObj.Location || rowObj.Site || rowObj.site;
      rowObj.custodian = rowObj.custodian || rowObj.Custodian;
      rowObj.acquisitionValue = rowObj.acquisitionValue || rowObj['Acquisition Value'] || rowObj.Cost || 0;
      rowObj.currency = rowObj.currency || rowObj.Currency || 'USD';

      parsedRows.push(rowObj);
    }

    req.body.rows = parsedRows;
    return validateBulkImport(req, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Upload History
 */
export async function getUploadHistory(req, res, next) {
  try {
    const jobs = await prisma.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { createdBy: true }
    });

    const events = jobs.length ? await prisma.auditEvent.findMany({
      where: { action: 'ASSET_BULK_UPLOAD', entityType: 'ImportJob', entityId: { in: jobs.map(job => job.id) } },
      orderBy: { timestamp: 'desc' }
    }) : [];
    const batchRefs = new Map();
    events.forEach(event => {
      try {
        const details = JSON.parse(event.afterState || '{}');
        if (!batchRefs.has(event.entityId) && details.batchRef) batchRefs.set(event.entityId, details.batchRef);
      } catch { /* Older audit payloads may not be JSON. */ }
    });
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      batchRef: batchRefs.get(job.id) || job.id,
      fileName: job.fileName,
      uploadedBy: job.createdBy?.fullName || job.createdBy?.username || '-',
      uploadDate: job.createdAt
        ? new Date(job.createdAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-',
      totalRecords: job.totalRows || 0,
      successCount: job.successRows || 0,
      failedCount: job.failedRows || 0,
      status: job.status === 'COMPLETED' ? 'Completed' : job.status === 'PARTIAL' ? 'Partial' : job.status === 'PENDING' ? 'Pending' : 'Failed'
    }));

    res.json({
      success: true,
      history: formattedJobs
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Legacy processImport fallback
 */
export async function processImport(req, res, next) {
  return submitBulkImport(req, res, next);
}
