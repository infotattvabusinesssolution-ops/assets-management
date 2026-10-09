import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';
import { randomUUID } from 'node:crypto';

const PRINT_TEMPLATES = [
  { id: 'STANDARD_2X1', name: 'Standard asset barcode', description: 'Code 128 barcode with asset details', widthMm: 50.8, heightMm: 25.4, format: 'BARCODE_128', fields: ['assetNumber', 'assetName', 'serialNumber', 'tagNumber'] },
  { id: 'QR_HIGH_DENSITY', name: 'Asset QR label', description: 'QR code with asset details', widthMm: 50.8, heightMm: 25.4, format: 'QR_CODE', fields: ['assetNumber', 'assetName', 'serialNumber', 'tagNumber'] },
  { id: 'ZEBRA_4X2', name: 'Large asset barcode', description: 'Large Code 128 label with EPC text when available', widthMm: 101.6, heightMm: 50.8, format: 'BARCODE_128', fields: ['assetNumber', 'assetName', 'serialNumber', 'tagNumber', 'rfidEpc'] }
];

// Initial Mock Assets to Tag matching reference functional design
class TaggingServiceStore {
  constructor() {
    this.assets = [];
    this.recentTagged = [];
    this.auditLogs = [];
    this.draftSessions = new Map();

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
        if (rfid) where.OR = [{ rfidEpc: rfid }, { tagNumber: rfid }];
        if (assetNumber) where.assetId = { contains: assetNumber };
        if (serialNumber) where.serialNumber = { contains: serialNumber };
        if (assetName) where.description = { contains: assetName };

        const dbAssets = await prisma.asset.findMany({
        where,
        include: {
          category: true,
          model: true,
          site: true,
          department: true,
          custodian: true
        },
        orderBy: { createdAt: 'desc' }
      });

    const images = dbAssets.length ? await prisma.attachment.findMany({
        where: {
          entityType: { in: ['Asset', 'ASSET'] },
          entityId: { in: dbAssets.flatMap(asset => [asset.id, asset.assetId]) },
          fileType: 'ASSET_IMAGE'
        },
        orderBy: { createdAt: 'desc' }
      }) : [];
      const imageByAssetId = new Map();
      for (const image of images) {
        if (!imageByAssetId.has(image.entityId)) imageByAssetId.set(image.entityId, image.url);
      }
      const printTags = dbAssets.length ? await prisma.tag.findMany({
        where: { assetId: { in: dbAssets.map(asset => asset.id) }, status: { not: 'REPLACED' } },
        orderBy: { updatedAt: 'desc' },
        select: { assetId: true, tagNumber: true, printedDate: true, status: true }
      }) : [];
      const printTagsByAssetId = new Map();
      for (const tag of printTags) {
        const current = printTagsByAssetId.get(tag.assetId) || [];
        current.push(tag);
        printTagsByAssetId.set(tag.assetId, current);
      }

      {
        // Map DB assets into tagging format
        const mapped = dbAssets.map(a => {
          const tags = printTagsByAssetId.get(a.id) || [];
          const printTag = a.tagNumber
            ? tags.find(tag => tag.tagNumber === a.tagNumber)
            : tags.find(tag => ['RESERVED', 'PRINTED'].includes(tag.status));
          return {
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
           imageUrl: imageByAssetId.get(a.id) || imageByAssetId.get(a.assetId) || null,
           printStatus: printTag?.printedDate ? 'Printed' : 'Not Printed',
           printTagNumber: printTag?.tagNumber || null,
          rfidEpc: a.rfidEpc,
          barcode: a.barcode
          };
        });

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
       if (rfid && asset.rfidEpc !== rfid && asset.currentTag !== rfid) return false;
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
       rfidEpc: cleanEpc || (tagType === 'RFID_GEN2' ? cleanTag : null)
    };
  }

  // Generate Unique Tag Number & RFID EPC
  async generateTagNumber(prefix = this.settings.prefix || 'E360000', tagType = 'RFID_GEN2') {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const suffix = randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
    const tagNumber = `${prefix}${suffix}`;
    if (await prisma.tag.findUnique({ where: { tagNumber } })) return this.generateTagNumber(prefix, tagType);
    const rfidEpc = `E28011606000${suffix}`;
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
              if (previousTag !== tagNumber) {
                await tx.tag.updateMany({
                  where: { tagNumber: previousTag, assetId: dbAsset.id },
                  data: { assetId: null, status: 'REPLACED' }
                });
              }
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
  async printLabels(params = {}, { markPrinted = true } = {}) {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const assets = Array.isArray(params.assets) ? params.assets : [];
    const quantity = Math.max(1, Math.min(100, Number(params.quantity) || 1));
    if (!assets.length) throw new Error('Choose at least one asset to print.');
    const template = PRINT_TEMPLATES.find(item => item.id === (params.template || 'STANDARD_2X1'));
    if (!template) throw new Error('Choose a supported label template.');

    const labels = [];
    for (const selected of assets) {
      const id = selected.id || selected.assetId || selected.assetNumber;
      if (!id) throw new Error('Each selected asset needs an ID.');
      const asset = await prisma.asset.findFirst({ where: { OR: [{ id }, { assetId: id }] } });
      if (!asset) throw new Error(`Asset ${id} was not found in the database.`);

      let tagNumber = asset.tagNumber;
      let rfidEpc = asset.rfidEpc;
      if (!tagNumber) {
        let reserved = await prisma.tag.findFirst({
          where: { assetId: asset.id, status: { not: 'REPLACED' } },
          orderBy: { createdAt: 'asc' }
        });
        if (params.reprintOnly && !reserved) throw new Error(`Asset ${asset.assetId} has no existing printed tag to reprint.`);
        if (!reserved) {
          for (let attempt = 0; attempt < 3 && !reserved; attempt++) {
            const generated = await this.generateTagNumber(params.tagPrefix || this.settings.prefix, 'BARCODE_128');
            try {
              reserved = await prisma.tag.create({ data: {
                tagNumber: generated.tagNumber, tagType: template.format,
                assetId: asset.id, status: 'RESERVED'
              } });
            } catch (error) {
              if (error.code !== 'P2002') throw error;
            }
          }
          if (!reserved) throw new Error(`Could not reserve a unique tag for ${asset.assetId}.`);
        }
        tagNumber = reserved.tagNumber;
        rfidEpc = reserved.rfidEpc;
        if (markPrinted) await prisma.tag.update({
          where: { id: reserved.id }, data: { status: 'PRINTED', printedDate: new Date() }
        });
      } else if (markPrinted) {
        const existingTag = await prisma.tag.findUnique({ where: { tagNumber } });
        if (existingTag?.assetId && existingTag.assetId !== asset.id) {
          throw new Error(`Tag ${tagNumber} belongs to another asset.`);
        }
        if (params.reprintOnly) {
          if (existingTag?.assetId === asset.id) await prisma.tag.update({ where: { id: existingTag.id }, data: { printedDate: new Date() } });
        } else {
          await prisma.tag.upsert({
            where: { tagNumber },
            update: { assetId: asset.id, status: 'ACTIVE', printedDate: new Date() },
            create: { tagNumber, assetId: asset.id, tagType: rfidEpc ? 'RFID_GEN2' : template.format, status: 'ACTIVE', printedDate: new Date() }
          });
        }
      }

      for (let copy = 0; copy < quantity; copy++) {
        labels.push({
          assetId: asset.id, assetNumber: asset.assetId, assetName: asset.description,
          serialNumber: asset.serialNumber || '', tagNumber, rfidEpc: rfidEpc || '',
          copy: copy + 1, template
        });
      }
    }
    return { success: true, labels, tags: labels, template, message: `${labels.length} label(s) prepared for browser printing.` };
  }

  // Label layouts supported by the browser renderer.
  getPrintTemplates() {
    return PRINT_TEMPLATES;
  }

  async getPrintHistory() {
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const tags = await prisma.tag.findMany({
      where: { printedDate: { not: null } }, include: { asset: true },
      orderBy: { printedDate: 'desc' }, take: 100
    });
    return tags.map(tag => ({
      id: tag.id, assetNumber: tag.asset?.assetId || '', assetName: tag.asset?.description || '',
      tagNumber: tag.tagNumber, printedDate: tag.printedDate, status: tag.status
    }));
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
    const assetNumber = assetData.assetNumber?.trim() || `AST-MAN-${randomUUID().slice(0, 8).toUpperCase()}`;
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
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    const assetNumbers = rows.map(row => String(row.assetNumber || '').trim()).filter(Boolean);
    const serialNumbers = rows.map(row => String(row.serialNumber || '').trim()).filter(Boolean);
    const existingRows = await prisma.asset.findMany({
      where: { OR: [
        ...(assetNumbers.length ? [{ assetId: { in: assetNumbers } }] : []),
        ...(serialNumbers.length ? [{ serialNumber: { in: serialNumbers } }] : [])
      ] },
      select: { id: true, assetId: true, serialNumber: true }
    });
    const byNumber = new Map(existingRows.map(asset => [asset.assetId, asset]));
    const bySerial = new Map();
    for (const asset of existingRows) {
      if (asset.serialNumber) bySerial.set(asset.serialNumber, asset);
    }
    const rowAssetIds = [];
    const seenImportKeys = new Set();
    for (const row of rows) {
      const assetNumber = String(row.assetNumber || '').trim();
      const serialNumber = String(row.serialNumber || '').trim();
      if (!assetNumber && !serialNumber) throw new Error('Each row needs an asset number or serial number.');
      const key = (assetNumber || serialNumber).toLowerCase();
      if (seenImportKeys.has(key)) throw new Error(`Duplicate asset in file: ${assetNumber || serialNumber}`);
      seenImportKeys.add(key);
      const existing = assetNumber ? byNumber.get(assetNumber) : bySerial.get(serialNumber);
      if (!existing && (!row.assetName?.trim() || !row.category?.trim() || !row.location?.trim())) {
        throw new Error(`Asset ${assetNumber || serialNumber} is not registered. Add Asset Name, Category, and Location to create it.`);
      }
      rowAssetIds.push(existing?.id || null);
    }
    const newRows = rows.filter((_, index) => !rowAssetIds[index]);
    if (newRows.length) {
      const [categories, sites] = await Promise.all([
        prisma.category.findMany({ where: { name: { in: newRows.map(row => row.category.trim()) } }, select: { name: true } }),
        prisma.site.findMany({ where: { name: { in: newRows.map(row => row.location.trim()) } }, select: { name: true } })
      ]);
      const validCategories = new Map(categories.map(category => [category.name.toLowerCase(), category.name]));
      const validSites = new Map(sites.map(site => [site.name.toLowerCase(), site.name]));
      for (const row of newRows) {
        const category = validCategories.get(row.category.trim().toLowerCase());
        const site = validSites.get(row.location.trim().toLowerCase());
        if (!category || !site) {
          throw new Error(`Asset ${row.assetNumber || row.serialNumber}: choose an existing Category and Location.`);
        }
        row.category = category;
        row.location = site;
      }
    }
    for (let index = 0; index < rows.length; index++) {
      if (rowAssetIds[index]) continue;
      const created = await this.addManualAsset(rows[index]);
      rowAssetIds[index] = created.id;
    }
    const mapped = await this.getEligibleAssets();
    const byId = new Map(mapped.map(asset => [asset.id, asset]));
    const imported = rowAssetIds.map(id => byId.get(id));
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
