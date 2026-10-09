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

const filled = value => String(value ?? '').trim();
const isYes = value => ['yes', 'true', '1', 'on'].includes(filled(value).toLowerCase());
const validDate = value => !value || !Number.isNaN(Date.parse(value));
const findMaster = (list, value, keys = ['name', 'code']) => list.find(item =>
  keys.some(key => filled(item[key]).toLowerCase() === filled(value).toLowerCase()));

const extraRegistrationFields = [
  'assetType','subcategory','quantity','description','assetGroup','assetClass','brand','modelNumber',
  'businessUnit','storageArea','alternateCustodian','expectedUser','assetBook','depreciationMethod',
  'usefulLifeYears','residualValue','project','reference','notes','costAllocation',
  'businessApplication','remarks','tagType','tagStatus','approvalRequired','approvalStatus'
];

async function saveRegistrationDetails(asset, row, category, userId) {
  const assetId = asset.id;
  if (isYes(row.underWarranty)) {
    await prisma.warranty.upsert({ where: { assetId }, create: {
      assetId, providerName: filled(row.provider || row.manufacturer) || null,
      warrantyNumber: filled(row.contractReference) || `WAR-${asset.assetId}`,
      startDate: new Date(row.warrantyStartDate), endDate: new Date(row.warrantyEndDate),
      terms: filled(row.coverage) || null, coverageType: filled(row.warrantyType) || 'FULL'
    }, update: {
      providerName: filled(row.provider || row.manufacturer) || null,
      startDate: new Date(row.warrantyStartDate), endDate: new Date(row.warrantyEndDate),
      terms: filled(row.coverage) || null, coverageType: filled(row.warrantyType) || 'FULL'
    } });
  }
  if (isYes(row.enablePm)) {
    const scheduleData = {
      title: filled(row.pmTitle), description: filled(row.pmDescription) || null,
      workType: filled(row.pmWorkType) || 'PREVENTIVE',
      frequencyMonths: Number(row.pmFrequencyMonths), nextDueDate: new Date(row.pmNextDueDate),
      active: row.pmActive === '' || row.pmActive == null ? true : isYes(row.pmActive),
      autoGenerateWorkOrders: isYes(row.pmAutoGenerateWorkOrders),
      advanceDays: row.pmAdvanceDays === '' || row.pmAdvanceDays == null ? 7 : Number(row.pmAdvanceDays),
      checklistJson: JSON.stringify(filled(row.pmChecklistText).split(/\r?\n|;/).map(x => x.trim()).filter(Boolean))
    };
    const schedule = await prisma.maintenanceSchedule.findFirst({ where: { assetId }, orderBy: { createdAt: 'asc' } });
    if (schedule) await prisma.maintenanceSchedule.update({ where: { id: schedule.id }, data: scheduleData });
    else await prisma.maintenanceSchedule.create({ data: { assetId, ...scheduleData } });
  }
  if (filled(row.hostname || row.ipAddress || row.macAddress || row.discoveredSerial)) {
    const observation = row.discoveryId
      ? await prisma.discoveryObservation.findUnique({ where: { id: row.discoveryId } })
      : await prisma.discoveryObservation.create({ data: {
        discoverySource: filled(row.discoverySource) || 'MANUAL_ENTRY',
        hostname: filled(row.hostname) || null, ipAddress: filled(row.ipAddress) || null,
        macAddress: filled(row.macAddress) || null, serialNumber: filled(row.discoveredSerial) || null,
        firstSeen: row.firstSeen ? new Date(row.firstSeen) : new Date(),
        lastSeen: row.lastSeen ? new Date(row.lastSeen) : new Date()
      } });
    if (observation) {
      await prisma.asset.update({ where: { id: assetId }, data: { discoveryId: observation.id } });
      const match = await prisma.discoveryMatch.findFirst({ where: { matchedAssetId: assetId, observationId: observation.id } });
      if (!match) await prisma.discoveryMatch.create({ data: {
        observationId: observation.id, matchedAssetId: assetId,
        confidenceScore: row.discoveryId ? 100 : 0,
        matchRule: row.discoveryId ? 'USER_SELECTED' : 'MANUAL_ENTRY',
        status: 'CONFIRMED', reviewedByUserId: userId, reviewedAt: new Date()
      } });
    }
  }
  const valueFields = extraRegistrationFields.filter(key => filled(row[key]));
  for (const key of valueFields) {
    const name = `BULK_REG_${key}`;
    const definition = await prisma.customFieldDefinition.upsert({ where: { name },
      create: { name, label: key.replace(/([A-Z])/g, ' $1').trim(), fieldType: 'TEXT' }, update: {} });
    await prisma.assetCustomFieldValue.upsert({
      where: { assetId_customFieldDefId: { assetId, customFieldDefId: definition.id } },
      create: { assetId, customFieldDefId: definition.id, textValue: filled(row[key]) },
      update: { textValue: filled(row[key]) }
    });
  }
  const book = await prisma.assetBookValue.findFirst({ where: { assetId, bookType: 'CORPORATE' } });
  const value = Number(asset.acquisitionValue);
  if (value > 0) {
    const categoryRate = Number(category.annualDepreciationRatePercent || 0);
    const bookData = {
      capitalizationDate: asset.inServiceDate || asset.purchaseDate || new Date(),
      capitalizationValue: value,
      usefulLifeMonths: categoryRate > 0 ? Math.round(1200 / categoryRate) : (category.defaultUsefulLifeMonths || 60),
      depreciationMethod: category.depreciationMethod || 'STRAIGHT_LINE',
      annualDepreciationRatePercent: categoryRate || null,
      residualValue: value * Number(category.defaultResidualValuePercent || 0) / 100,
      netBookValue: value
    };
    if (book) await prisma.assetBookValue.update({ where: { id: book.id }, data: bookData });
    else await prisma.assetBookValue.create({ data: { assetId, bookType: 'CORPORATE', ...bookData, accumulatedDepreciation: 0 } });
  }
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
      const location = String(row.site || row.location || row.Location || '').trim();
      const custodian = row.custodian || row.Custodian || '';
      const rawCost = row.acquisitionCost || row.acquisitionValue || row['Acquisition Value'] || row.purchaseCost || row.cost || 0;
      const currency = row.currency || row.Currency || 'USD';

      const errors = [];
      const warnings = [];
      if (!filled(name)) errors.push('Asset Name is required');
      if (!category || !categories.some(c => isCategoryMatch(c, category))) errors.push('Category not found in master data');
      if (location && !findMaster(sites, location)) errors.push('Site not found in master data');
      if (row.assetId && seenBatchIds.has(assetId)) errors.push('Duplicate Asset ID in upload');
      if (!serialNumber && ['laptop', 'mobile device', 'server'].includes(category.toLowerCase())) errors.push('Serial number is required for this category');
      if (serialNumber && seenBatchSerials.has(serialNumber)) errors.push('Duplicate serial number in upload');
      if (rawCost !== '' && rawCost != null && (!Number.isFinite(Number(rawCost)) || Number(rawCost) < 0)) errors.push('Acquisition Cost must be a nonnegative number');
      if (row.quantity && (!Number.isInteger(Number(row.quantity)) || Number(row.quantity) !== 1)) errors.push('Each asset row must have Quantity 1');
      for (const key of ['acquisitionDate','purchaseDate','warrantyStartDate','warrantyEndDate','pmNextDueDate','firstSeen','lastSeen']) {
        if (!validDate(row[key])) errors.push(`${key} must be a valid date`);
      }
      if (isYes(row.underWarranty) && (!row.warrantyStartDate || !row.warrantyEndDate)) errors.push('Warranty start and end dates are required');
      if (row.warrantyStartDate && row.warrantyEndDate && Date.parse(row.warrantyEndDate) < Date.parse(row.warrantyStartDate)) errors.push('Warranty end date precedes start date');
      if (isYes(row.enablePm)) {
        if (!filled(row.pmTitle) || !row.pmNextDueDate) errors.push('PM Title and Next Due Date are required');
        if (!Number.isInteger(Number(row.pmFrequencyMonths)) || Number(row.pmFrequencyMonths) < 1 || Number(row.pmFrequencyMonths) > 120) errors.push('PM Frequency Months must be 1–120');
        if (row.pmAdvanceDays && (!Number.isInteger(Number(row.pmAdvanceDays)) || Number(row.pmAdvanceDays) < 0 || Number(row.pmAdvanceDays) > 90)) errors.push('PM Advance Days must be 0–90');
      }
      if (custodian && !findMaster(employees, custodian, ['id', 'fullName', 'employeeCode'])) warnings.push(`Custodian [${custodian}] not found; asset will be unassigned`);
      if (serialNumber && existingSerials.has(serialNumber)) warnings.push(`Existing serial [${serialNumber}] will update its asset`);
      if (existingAssetIds.has(assetId)) warnings.push(`Existing Asset ID [${assetId}] will update its asset`);
      status = errors.length ? 'Error' : warnings.length ? 'Warning' : 'Valid';
      remarks = [...errors, ...warnings].join('; ') || '-';
      if (status === 'Error') errorCount++;
      else if (status === 'Warning') warningCount++;
      else validCount++;

      seenBatchIds.add(assetId);
      if (serialNumber) {
        seenBatchSerials.add(serialNumber);
      }

      records.push({
        ...row,
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
        assetStatus: row.assetStatus || row.lifecycleStatus || 'IN_SERVICE',
        condition: row.condition || 'NEW',
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
    const [defaultCompany, defaultSite, categories, sites, employees, manufacturers, companies, departments, costCenters, buildings, floors, rooms, zones] =
      await Promise.all([
        prisma.company.findFirst({ where: { active: true } }),
        prisma.site.findFirst({ where: { active: true } }),
        prisma.category.findMany(),
        prisma.site.findMany(),
        prisma.employee.findMany(), prisma.manufacturer.findMany(), prisma.company.findMany(),
        prisma.department.findMany(), prisma.costCenter.findMany(), prisma.building.findMany(),
        prisma.floor.findMany(), prisma.room.findMany(), prisma.zone.findMany()
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
        const tagNumber = filled(row.assetTagBarcode || row.tagNumber) || null;
        const rawAcq = row.acquisitionCost || row.acquisitionValue || row.purchaseCost || 0;
        const acqValue = Number(rawAcq);
        if (!Number.isFinite(acqValue) || acqValue < 0) throw new Error('Acquisition cost must be a nonnegative number.');
        const currency = row.currency || 'USD';

        // Resolve Category
        let matchedCat = null;
        const rowCatName = row.category || row.Category;
        if (rowCatName) {
          matchedCat = categories.find((c) => isCategoryMatch(c, rowCatName));
        }
        if (!matchedCat) throw new Error('Category not found in master data.');
        const categoryId = matchedCat.id;

        // Resolve Site
        let matchedSite = null;
        const rowLoc = row.site || row.location || row.Location;
        if (rowLoc) {
          matchedSite = sites.find(
            (s) =>
              s.name.toLowerCase() === rowLoc.toLowerCase() ||
              s.name.toLowerCase().includes(rowLoc.toLowerCase()) ||
              rowLoc.toLowerCase().includes(s.name.toLowerCase()) ||
              s.code.toLowerCase() === rowLoc.toLowerCase()
          );
        }
        if (!matchedSite && !rowLoc) matchedSite = defaultSite || sites[0];
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
        const statusValue = filled(row.assetStatus || row.lifecycleStatus || 'IN_SERVICE').toUpperCase().replaceAll(' ', '_');
        const lifecycleStatus = ({ NEW: 'IN_SERVICE', ACTIVE: 'IN_SERVICE' })[statusValue] || statusValue;

        const condition = row.condition ? String(row.condition).toUpperCase() : 'NEW';
        const company = row.company ? findMaster(companies, row.company, ['id','name','code']) : defaultCompany;
        if (!company) throw new Error('Company not found in master data.');
        const resolve = (list, value) => value ? findMaster(list, value, ['id','name','code'])?.id : null;
        const departmentId = resolve(departments, row.department);
        const costCenterId = resolve(costCenters, row.costCenter);
        const buildingId = resolve(buildings, row.building);
        const floorId = resolve(floors, row.floor);
        const roomId = resolve(rooms, row.room);
        const zoneId = resolve(zones, row.zoneArea);
        const manufacturerName = filled(row.manufacturer || row.brand);
        let manufacturer = manufacturerName ? findMaster(manufacturers, manufacturerName, ['id','name']) : null;
        if (manufacturerName && !manufacturer) manufacturer = await prisma.manufacturer.create({ data: { name: manufacturerName } });
        const modelName = filled(row.model || row.modelNumber);
        let assetModel = modelName ? await prisma.assetModel.findFirst({ where: { OR: [{ name: modelName }, { modelNumber: modelName }] } }) : null;
        if (modelName && !assetModel && manufacturer) assetModel = await prisma.assetModel.create({ data: { name: modelName, modelNumber: filled(row.modelNumber) || modelName, manufacturerId: manufacturer.id, categoryId } });
        const assetFields = {
          description: desc, categoryId, companyId: company.id, siteId,
          buildingId, floorId, roomId, zoneId, departmentId, costCenterId, custodianId,
          manufacturerId: manufacturer?.id || null, modelId: assetModel?.id || null,
          serialNumber: rawSerial || null, tagNumber,
          barcode: tagNumber, qrCode: tagNumber, rfidEpc: filled(row.rfidEpc) || null,
          rfidTid: filled(row.tid) || null, lifecycleStatus,
          condition: ['GOOD','FAIR','DAMAGED','NEW','RETIRED'].includes(condition) ? condition : 'NEW',
          criticality: filled(row.criticality || 'MEDIUM').toUpperCase(),
          acquisitionValue: acqValue, currency,
          poNumber: filled(row.poInvoiceNo) || null,
          supplierName: filled(row.supplier || row.vendorSupplier) || null,
          purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : row.acquisitionDate ? new Date(row.acquisitionDate) : null,
          inServiceDate: row.acquisitionDate ? new Date(row.acquisitionDate) : null,
          hostname: filled(row.hostname) || null, ipAddress: filled(row.ipAddress) || null,
          macAddress: filled(row.macAddress) || null, updatedByUserId: finalUserId
        };

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
            data: { ...assetFields, tagNumber: tagNumber || existingAsset.tagNumber,
              barcode: tagNumber || existingAsset.barcode, qrCode: tagNumber || existingAsset.qrCode }
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

          await saveRegistrationDetails(updated, row, matchedCat, finalUserId);
          updatedCount++;
          processedAssetIds.push(updated.assetId);
        } else {
          // Create new asset
          const newAsset = await prisma.asset.create({
            data: { assetId, ...assetFields, createdByUserId: finalUserId }
          });

          await saveRegistrationDetails(newAsset, row, matchedCat, finalUserId);

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
