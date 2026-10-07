import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// Initial Mock Assets to Tag matching reference functional design
class TaggingServiceStore {
  constructor() {
    this.assets = [];
    this.recentTagged = [];
    this.auditLogs = [];
    this.draftSessions = new Map();
    this.nextTagSeq = 12345;

    this.settings = {
      defaultPrinter: 'Zebra ZT411 RFID (Warehouse Dock 2)',
      tagFormat: 'RFID_GEN2',
      numberingScheme: 'E36_PREFIX_SEQ',
      prefix: 'E360000',
      labelTemplate: 'STANDARD_2X1',
      dpi: 300,
      scannerInterface: 'KEYBOARD_WEDGE',
      rfidPowerLevel: 'HIGH_27DBM',
      autoAssignAfterScan: true
    };
  }

  // Format date helper matching screenshot: '21 Aug 2026 11:20'
  formatDisplayTime(date = new Date()) {
    const d = new Date(date);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${mins}`;
  }

  // Search & Filter Assets
  async getEligibleAssets(filters = {}) {
    const {
      assetNumber = '',
      barcode = '',
      rfid = '',
      assetName = '',
      serialNumber = '',
      category = '',
      location = '',
      department = '',
      tagStatus = '',
      custodian = '',
      assetStatus = ''
    } = filters;

    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    {
        const where = {};
        if (barcode) where.OR = [{ barcode }, { assetId: barcode }];
        if (rfid) where.rfidEpc = rfid;
        if (assetNumber) where.assetId = { contains: assetNumber };
        if (serialNumber) where.serialNumber = { contains: serialNumber };
        if (assetName) where.description = { contains: assetName };

        const dbAssets = await prisma.asset.findMany({
        where,
        include: {
          category: true,
          site: true,
          department: true,
          custodian: true
        },
        orderBy: { createdAt: 'desc' }
      });

      {
        // Map DB assets into tagging format
        const mapped = dbAssets.map((a, idx) => ({
          id: a.id,
          assetNumber: a.assetId,
          assetName: a.description || a.model?.name || 'Enterprise Asset',
          category: a.category?.name || 'General Hardware',
          location: a.site?.name || '',
          department: a.department?.name || '',
          serialNumber: a.serialNumber || '',
          currentTag: a.tagNumber || '-',
          status: a.tagNumber ? 'Tagged' : 'Not Tagged',
          custodian: a.custodian?.fullName || '',
          assetStatus: a.active ? 'Active' : 'Inactive',
          imageUrl: a.imageUrl || null,
          rfidEpc: a.rfidEpc,
          barcode: a.barcode
        }));

        // Merge with our in-memory store so changes made in session are reflected
        return this.filterAssetsList(mapped, filters);
      }
  }
  }

  filterAssetsList(list, filters) {
    const {
      assetNumber = '',
      barcode = '',
      rfid = '',
      assetName = '',
      serialNumber = '',
      category = '',
      location = '',
      department = '',
      tagStatus = '',
      custodian = '',
      assetStatus = ''
    } = filters;

    return list.filter(asset => {
      if (barcode && asset.barcode !== barcode && asset.assetNumber !== barcode) return false;
      if (rfid && asset.rfidEpc !== rfid) return false;
      if (assetNumber && !asset.assetNumber.toLowerCase().includes(assetNumber.toLowerCase())) {
        return false;
      }
      if (assetName && !asset.assetName.toLowerCase().includes(assetName.toLowerCase())) {
        return false;
      }
      if (serialNumber && !asset.serialNumber.toLowerCase().includes(serialNumber.toLowerCase())) {
        return false;
      }
      if (category && category !== 'All Categories' && asset.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (location && location !== 'All Locations' && asset.location.toLowerCase() !== location.toLowerCase()) {
        return false;
      }
      if (department && department !== 'All Departments' && asset.department?.toLowerCase() !== department.toLowerCase()) {
        return false;
      }
      if (custodian && custodian !== 'All Custodians' && asset.custodian?.toLowerCase() !== custodian.toLowerCase()) {
        return false;
      }
      if (tagStatus && tagStatus !== 'All' && tagStatus !== 'All Statuses') {
        if (tagStatus.toLowerCase() === 'not tagged' && asset.status !== 'Not Tagged') return false;
        if (tagStatus.toLowerCase() === 'tagged' && asset.status !== 'Tagged') return false;
      }
      if (assetStatus && assetStatus !== 'All' && asset.assetStatus.toLowerCase() !== assetStatus.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  // Validate Tag ID / RFID EPC
  async validateTag(tagNumber, tagType = 'RFID_GEN2', rfidEpc = null, currentAssetId = null) {
    if (!tagNumber || tagNumber.trim() === '') {
      return {
        valid: false,
        status: 'INVALID',
        message: 'Tag identifier is mandatory and cannot be empty.'
      };
    }

    const cleanTag = tagNumber.trim();
    const cleanEpc = rfidEpc ? rfidEpc.trim() : null;

    // Check if tag is already associated with another asset
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const existingAsset = this.assets.find(a => 
      (a.currentTag === cleanTag || (cleanEpc && a.rfidEpc === cleanEpc)) && 
      a.id !== currentAssetId && 
      a.assetNumber !== currentAssetId
    );

    if (existingAsset) {
      return {
        valid: false,
        status: 'DUPLICATE_CONFLICT',
        message: `Tag "${cleanTag}" is already associated with asset ${existingAsset.assetNumber} (${existingAsset.assetName}). Tag reassignment requires supervisor override.`
      };
    }

    // Check DB if connected
    if (isSqlServerConnected) {
      try {
        const dbTag = await prisma.tag.findUnique({
          where: { tagNumber: cleanTag },
          include: { asset: true }
        });

        if (dbTag && dbTag.asset && dbTag.asset.id !== currentAssetId) {
          return {
            valid: false,
            status: 'DUPLICATE_CONFLICT',
            message: `Tag "${cleanTag}" is already associated with asset ${dbTag.asset.assetId}.`
          };
        }
        const assetWithTag = await prisma.asset.findFirst({ where: { OR: [{ tagNumber: cleanTag }, { rfidEpc: cleanTag }] } });
        if (assetWithTag && assetWithTag.id !== currentAssetId) return { valid: false, status: 'DUPLICATE_CONFLICT', message: `Tag is assigned to ${assetWithTag.assetId}.` };
      } catch (e) { throw e; }
    }

    return {
      valid: true,
      status: 'Valid Tag / Ready to Assign',
      message: 'Tag ID verified and available for assignment.',
      tagNumber: cleanTag,
      rfidEpc: cleanEpc || `E28011606000${cleanTag.replace(/\D/g, '').slice(-5) || '12345'}`
    };
  }

  // Generate Unique Tag Number & RFID EPC
  async generateTagNumber(prefix = this.settings.prefix || 'E360000', tagType = 'RFID_GEN2') {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const seq = Date.now() + this.nextTagSeq++;
    const tagNumber = `${prefix}${seq}`;
    if (await prisma.tag.findUnique({ where: { tagNumber } })) return this.generateTagNumber(prefix, tagType);
    const rfidEpc = `E28011606000${seq}`;
    return { tagNumber, rfidEpc, tagType };
  }

  // Assign Tag to Asset
  async associateTag(payload, user = { id: 'usr-default', fullName: 'John Doe', username: 'jdoe' }) {
    const {
      assetId,
      tagNumber,
      tagType = 'RFID_GEN2',
      rfidEpc = null,
      reason = 'Initial Tag Association',
      notes = ''
    } = payload;

    // First validate
    const validation = await this.validateTag(tagNumber, tagType, rfidEpc, assetId);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    let targetAssetIndex = this.assets.findIndex(a => a.id === assetId || a.assetNumber === assetId);
    let targetAsset = targetAssetIndex >= 0 ? this.assets[targetAssetIndex] : null;

    if (!targetAsset && isSqlServerConnected) {
      try {
        const dbAsset = await prisma.asset.findFirst({
          where: { OR: [{ id: assetId }, { assetId: assetId }] },
          include: { category: true, site: true, department: true, custodian: true }
        });
        if (dbAsset) {
          targetAsset = {
            id: dbAsset.id,
            assetNumber: dbAsset.assetId,
            assetName: dbAsset.description || 'Enterprise Asset',
            category: dbAsset.category?.name || 'General Hardware',
            location: dbAsset.site?.name || 'Dubai HQ',
            department: dbAsset.department?.name || 'IT Operations',
            serialNumber: dbAsset.serialNumber || `SN-${dbAsset.id.slice(0, 8)}`,
            currentTag: dbAsset.tagNumber || '-',
            status: dbAsset.tagNumber ? 'Tagged' : 'Not Tagged',
            custodian: dbAsset.custodian?.fullName || 'John Doe',
            assetStatus: dbAsset.active ? 'Active' : 'Inactive',
            rfidEpc: dbAsset.rfidEpc,
            barcode: dbAsset.barcode
          };
          this.assets.push(targetAsset);
          targetAssetIndex = this.assets.length - 1;
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!targetAsset) {
      throw new Error(`Target asset not found: ${assetId}`);
    }

    const previousTag = targetAsset.currentTag === '-' ? null : targetAsset.currentTag;
    const finalEpc = validation.rfidEpc;
    const nowTime = this.formatDisplayTime();

    // Update in-memory asset
    const updatedAsset = {
      ...targetAsset,
      currentTag: tagNumber,
      status: 'Tagged',
      rfidEpc: finalEpc,
      barcode: tagNumber
    };
    if (targetAssetIndex >= 0) {
      this.assets[targetAssetIndex] = updatedAsset;
    }

    // Add to Recent Tagged Assets at top
    const recentEntry = {
      id: `rec-${Date.now()}`,
      time: nowTime,
      timestamp: new Date().toISOString(),
      assetNumber: updatedAsset.assetNumber,
      assetName: updatedAsset.assetName,
      serialNumber: updatedAsset.serialNumber,
      tagNumber: tagNumber,
      rfidEpc: finalEpc,
      taggedBy: user.fullName || user.username || 'John Doe',
      status: 'Tagged'
    };
    this.recentTagged.unshift(recentEntry);
    if (this.recentTagged.length > 20) {
      this.recentTagged.pop();
    }

    // Write audit event
    const auditRecord = {
      id: `audit-${Date.now()}`,
      action: previousTag ? 'REPLACE_TAG' : 'ASSIGN_TAG',
      assetId: updatedAsset.assetNumber,
      assetName: updatedAsset.assetName,
      tagId: tagNumber,
      rfidEpc: finalEpc,
      previousTag: previousTag || 'None',
      newTag: tagNumber,
      reason,
      notes,
      user: user.fullName || user.username || 'John Doe',
      userId: user.id || 'usr-default',
      timestamp: new Date().toISOString(),
      timeFormatted: nowTime
    };
    this.auditLogs.unshift(auditRecord);

    // Also persistent write to Prisma if connected
    if (isSqlServerConnected) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(user?.id ? [{ id: user.id }] : []),
              { username: user?.username || 'admin' }
            ]
          }
        });
        const firstUser = dbUser || (await prisma.user.findFirst());
        const dbUserId = firstUser ? firstUser.id : (user.id || 'usr-default');

        await prisma.$transaction(async (tx) => {
          const dbAsset = await tx.asset.findFirst({
            where: { OR: [{ id: assetId }, { assetId: assetId }] }
          });

          if (dbAsset) {
            await tx.asset.update({
              where: { id: dbAsset.id },
              data: {
                tagNumber,
                rfidEpc: finalEpc || null,
                barcode: tagNumber,
                lifecycleStatus: 'TAGGED'
              }
            });

            // Upsert Tag
            await tx.tag.upsert({
              where: { tagNumber },
              update: {
                assetId: dbAsset.id,
                status: 'ACTIVE',
                ...(finalEpc ? { rfidEpc: finalEpc } : {})
              },
              create: {
                tagNumber,
                tagType,
                ...(finalEpc ? { rfidEpc: finalEpc } : {}),
                assetId: dbAsset.id,
                status: 'ACTIVE',
                printedDate: new Date()
              }
            });

            if (previousTag) {
              await tx.tagHistory.create({
                data: {
                  assetId: dbAsset.id,
                  oldTagNumber: previousTag,
                  newTagNumber: tagNumber,
                  reason,
                  replacedByUserId: dbUserId
                }
              });
            }

            await tx.assetTransaction.create({
              data: {
                assetId: dbAsset.id,
                transactionType: 'TAG',
                fromStatus: dbAsset.lifecycleStatus,
                toStatus: 'TAGGED',
                performedByUserId: dbUserId,
                notes: `Tag Assigned: ${tagNumber} (${tagType})`
              }
            });
          }
        });
      } catch (dbErr) {
        throw dbErr;
      }
    }

    const currentStats = await this.getTaggingSummary();

    return {
      success: true,
      message: `Tag "${tagNumber}" successfully assigned to ${updatedAsset.assetName} (${updatedAsset.assetNumber})!`,
      asset: updatedAsset,
      recentTagged: await this.getRecentTagged(10),
      stats: currentStats
    };
  }

  // Get Tagging Summary Counts
  async getTaggingSummary() {
    if (isSqlServerConnected) {
      try {
        const total = await prisma.asset.count({ where: { active: true } });
        const tagged = await prisma.asset.count({ where: { active: true, tagNumber: { not: null } } });
        const pending = Math.max(0, total - tagged);
        return {
          selected: total,
          tagged,
          pending,
          failed: 0
        };
      } catch (e) { throw e; }
    }
    throw new Error('Database is unavailable.');
  }

  // Get Recent Tagged Assets
  async getRecentTagged(limit = 10) {
    if (isSqlServerConnected) {
      try {
        const dbTags = await prisma.tag.findMany({
          where: { assetId: { not: null } },
          include: { asset: true },
          orderBy: { updatedAt: 'desc' },
          take: limit
        });
        if (dbTags && dbTags.length > 0) {
          const dbRecent = dbTags.map(t => ({
            id: t.id,
            time: this.formatDisplayTime(t.updatedAt),
            timestamp: t.updatedAt.toISOString(),
            assetNumber: t.asset?.assetId || 'Unknown',
            assetName: t.asset?.description || 'Enterprise Asset',
            serialNumber: t.asset?.serialNumber || 'N/A',
            tagNumber: t.tagNumber,
            rfidEpc: t.rfidEpc || '',
            taggedBy: 'System / User',
            status: 'Tagged'
          }));
          return dbRecent;
        }
      } catch (e) { throw e; }
      return [];
    }
    throw new Error('Database is unavailable.');
  }

  // Print Labels (Kept separate from assignment)
  async printLabels(params = {}) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const assets = Array.isArray(params.assets) ? params.assets : [];
    const quantity = Math.max(1, Math.min(100, Number(params.quantity) || 1));
    if (!assets.length) throw new Error('Choose at least one asset to print.');

    const labels = [];
    for (const selected of assets) {
      const id = selected.id || selected.assetId || selected.assetNumber;
      const asset = await prisma.asset.findFirst({ where: { OR: [{ id }, { assetId: id }] } });
      if (!asset) throw new Error(`Asset ${id} was not found in the database.`);

      let tagNumber = asset.tagNumber;
      let rfidEpc = asset.rfidEpc;
      if (!tagNumber) {
        const generated = await this.generateTagNumber(params.tagPrefix || this.settings.prefix, params.tagFormat || 'RFID_GEN2');
        tagNumber = generated.tagNumber;
        rfidEpc = generated.rfidEpc;
        await prisma.tag.create({ data: {
          tagNumber, rfidEpc, tagType: params.tagFormat || 'RFID_GEN2',
          status: 'UNASSIGNED', printedDate: new Date()
        } });
      } else {
        await prisma.tag.upsert({
          where: { tagNumber },
          update: { printedDate: new Date() },
          create: { tagNumber, assetId: asset.id, tagType: rfidEpc ? 'RFID_GEN2' : 'BARCODE_128', status: 'ACTIVE', printedDate: new Date() }
        });
      }

      for (let copy = 0; copy < quantity; copy++) {
        labels.push({
          assetId: asset.id, assetNumber: asset.assetId, assetName: asset.description,
          serialNumber: asset.serialNumber || '', tagNumber, rfidEpc: rfidEpc || '',
          copy: copy + 1, template: params.template || this.settings.labelTemplate
        });
      }
    }
    return { success: true, labels, tags: labels, message: `${labels.length} label(s) prepared for browser printing.` };
  }

  // Get Industrial Label Templates
  getPrintTemplates() {
    return [
      { id: 'TPL-01', name: 'STANDARD_2X1', description: 'Standard 2" x 1" Thermal Barcode Label', dimensions: '2.00 x 1.00 in', dpi: 300, barcodeType: 'Code 128' },
      { id: 'TPL-02', name: 'RFID_GEN2_METALLIC', description: 'On-Metal RFID Tag (DogBone / Monza R6)', dimensions: '3.00 x 1.00 in', dpi: 300, barcodeType: 'RFID + DataMatrix' },
      { id: 'TPL-03', name: 'COMPACT_1X05', description: 'Asset Mini-Tag for Mobile & Peripherals', dimensions: '1.25 x 0.50 in', dpi: 600, barcodeType: 'QR Code' },
      { id: 'TPL-04', name: 'TAMPER_EVIDENT', description: 'Destructible Vinyl Security Tag', dimensions: '2.50 x 0.75 in', dpi: 300, barcodeType: 'Code 128 + Hologram' }
    ];
  }

  // Bulk Assign Tags to Multiple Assets
  async bulkAssociateTags(payload, user = { id: 'usr-default', fullName: 'John Doe', username: 'jdoe' }) {
    const { assignments = [], reason = 'Bulk Tag Association', notes = '' } = payload;
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      throw new Error('No assignments provided for bulk tagging.');
    }

    const results = [];
    for (const item of assignments) {
      const res = await this.associateTag({
        assetId: item.assetId || item.id,
        tagNumber: item.tagNumber,
        tagType: item.tagType || 'RFID_GEN2',
        rfidEpc: item.rfidEpc || null,
        reason,
        notes
      }, user);
      results.push(res);
    }

    const summary = await this.getTaggingSummary();

    return {
      success: true,
      message: `Successfully bulk-tagged ${results.length} asset(s).`,
      count: results.length,
      assignments: results.map((r) => r.asset),
      stats: summary
    };
  }

  // Save tagging drafts in SQL Server so they survive API restarts.
  async saveDraft(sessionData, user = {}) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const draftId = `draft-${user.id || 'default'}`;
    const draft = {
      draftId, userId: user.id || null, savedAt: new Date().toISOString(),
      selectedAssetIds: sessionData.selectedAssetIds || [],
      stagedAssignments: sessionData.stagedAssignments || {},
      notes: sessionData.notes || ''
    };
    const dbUser = user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
    await prisma.auditEvent.create({ data: {
      userId: dbUser?.id || null, action: 'SAVE_DRAFT', entityType: 'TAGGING_DRAFT',
      entityId: draftId, afterState: JSON.stringify(draft)
    } });
    return { success: true, draft, message: 'Tagging draft saved.' };
  }

  async getDraft(user = {}) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const row = await prisma.auditEvent.findFirst({
      where: { entityType: 'TAGGING_DRAFT', entityId: `draft-${user.id || 'default'}` },
      orderBy: { timestamp: 'desc' }
    });
    return row?.afterState ? JSON.parse(row.afterState) : null;
  }

  // Complete Tagging Session
  async completeTagging(payload = {}, user = { id: 'usr-default', fullName: 'John Doe' }) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const ids = Array.isArray(payload.selectedAssetIds) ? payload.selectedAssetIds : [];
    
    if (ids.length > 0) {
      const assets = await prisma.asset.findMany({
        where: { OR: [{ id: { in: ids } }, { assetId: { in: ids } }] },
        select: { id: true, assetId: true, tagNumber: true }
      });
      const untagged = assets.filter(asset => !asset.tagNumber);
      if (untagged.length) {
        return {
          success: false,
          valid: false,
          message: `${untagged.length} selected asset(s) still need a tag.`,
          warnings: untagged.map(asset => asset.assetId)
        };
      }
    }

    return {
      success: true,
      valid: true,
      message: 'Tagging session completed and verified successfully. Asset register and tagging history updated.',
      summary: await this.getTaggingSummary(),
      warnings: []
    };
  }

  // Add Asset Manually
  async addManualAsset(assetData) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    if (!assetData.assetName?.trim()) throw new Error('Asset name is required.');
    const [company, site, category] = await Promise.all([
      prisma.company.findFirst({ where: { active: true } }),
      prisma.site.findFirst({ where: assetData.location ? { name: assetData.location } : { active: true } }),
      prisma.category.findFirst({ where: assetData.category ? { name: assetData.category } : { active: true } })
    ]);
    if (!company || !site || !category) throw new Error('Select a valid site and category.');
    const assetNumber = assetData.assetNumber?.trim() || `AST-MAN-${Date.now()}`;
    const created = await prisma.asset.create({ data: {
      assetId: assetNumber, description: assetData.assetName.trim(),
      serialNumber: assetData.serialNumber?.trim() || null,
      categoryId: category.id, companyId: company.id, siteId: site.id,
      lifecycleStatus: 'RECEIVED', condition: 'NEW'
    }});
    const result = await this.getEligibleAssets({ assetNumber: created.assetId });
    return result.find(asset => asset.id === created.id);

  }

  // Import Assets from File
  async importAssets(rows = []) {
    const imported = [];
    for (const row of rows) {
      if (!row.assetName && !row.assetNumber) continue;
      const asset = await this.addManualAsset(row);
      imported.push(asset);
    }
    return {
      success: true,
      count: imported.length,
      assets: imported
    };
  }

  // Get Audit History
  async getAuditHistory() {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const transactions = await prisma.assetTransaction.findMany({
      where: { transactionType: 'TAG' }, include: { asset: true },
      orderBy: { createdAt: 'desc' }, take: 50
    });
    return transactions.map(tx => ({
      id: tx.id, action: 'ASSIGN_TAG', assetId: tx.asset?.assetId,
      assetName: tx.asset?.description, tagId: tx.asset?.tagNumber,
      notes: tx.notes, timestamp: tx.createdAt.toISOString(),
      timeFormatted: this.formatDisplayTime(tx.createdAt)
    }));
  }

  // Settings
  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }
}

export const TaggingService = new TaggingServiceStore();
