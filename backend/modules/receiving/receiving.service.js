import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';
import { listPurchaseOrders, findPurchaseOrder, storePurchaseOrder } from './receiving.live.js';

const draftsStore = new Map();

export class ReceivingService {
  /**
   * Search / List available Purchase Orders
   */
  static async getPurchaseOrders(query = '') {
    return listPurchaseOrders(query);
  }

  /**
   * Create a new manual / internal Purchase Order
   */
  static async createPurchaseOrder(payload, user) {
    return storePurchaseOrder(payload, user);
  }

  /**
   * Get specific PO with dynamically computed cumulative receiving counts
   */
  static async getPurchaseOrderByNumber(poNumber) {
    return findPurchaseOrder(poNumber);
  }

  /**
   * Validate serial number uniqueness
   */
  static async validateSerialNumber(serialNumber) {
    const sn = serialNumber?.trim();
    if (!sn) return { valid: false, message: 'Serial number is required' };

    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    if (isSqlServerConnected) {
      try {
        const existing = await prisma.asset.findFirst({
          where: { serialNumber: sn }
        });

        if (existing) {
          return {
            valid: false,
            message: `Serial Number '${sn}' is already registered to asset ${existing.assetId} (${existing.description || 'Active Asset'}).`,
            existingAsset: existing
          };
        }
      } catch (e) { throw e; }
    }

    return { valid: true, message: 'Serial number is unique and available' };
  }

  /**
   * Validate Tag ID / RFID EPC uniqueness
   */
  static async validateTag(tagNumber, rfidEpc, rfidTid) {
    const tag = tagNumber?.trim();
    const epc = rfidEpc?.trim();
    const tid = rfidTid?.trim();

    if (!tag && !epc) {
      return { valid: false, message: 'Either Tag Number or RFID EPC is required' };
    }

    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    if (isSqlServerConnected) {
      try {
        if (tag) {
          const existingTag = await prisma.tag.findFirst({
            where: { tagNumber: tag, status: 'ACTIVE' },
            include: { asset: true }
          });
          if (existingTag && existingTag.assetId) {
            return {
              valid: false,
              message: `Tag '${tag}' is currently active and assigned to asset ${existingTag.asset?.assetId || existingTag.assetId}. Controlled replacement required.`,
              existingTag
            };
          }
        }

        if (epc) {
          const existingEpc = await prisma.tag.findFirst({
            where: { rfidEpc: epc, status: 'ACTIVE' },
            include: { asset: true }
          });
          if (existingEpc && existingEpc.assetId) {
            return {
              valid: false,
              message: `RFID EPC '${epc}' is already active and associated with asset ${existingEpc.asset?.assetId || existingEpc.assetId}. EPCs must remain uniquely controlled.`,
              existingTag: existingEpc
            };
          }
        }
      } catch (e) { throw e; }
    }
    return { valid: true, message: 'Tag / RFID EPC is available for assignment' };
  }

  /**
   * Scan Lookup: Identify model/category or existing PO line from physical scan
   */
  static async scanLookup({ scanValue, poNumber }) {
    const val = scanValue?.trim();
    if (!val) return { success: false, message: 'Scan value is required' };

    // 1. Check if scan matches a part number in the active PO
    if (poNumber) {
      const po = await this.getPurchaseOrderByNumber(poNumber);
      if (po) {
        const matchedLine = po.lineItems.find(
          (l) =>
            l.partNumber.toLowerCase() === val.toLowerCase() ||
            l.model.toLowerCase() === val.toLowerCase()
        );
        if (matchedLine) {
          return {
            success: true,
            type: 'PO_LINE_MATCH',
            matchedLine,
            suggestedAsset: {
              assetName: matchedLine.description,
              category: matchedLine.category,
              model: matchedLine.model,
              partNumber: matchedLine.partNumber,
              imageUrl: matchedLine.imageUrl
            }
          };
        }
      }
    }

    // 2. Lookup existing asset or model in master data
    try {
      const asset = await prisma.asset.findFirst({
        where: {
          OR: [{ serialNumber: val }, { tagNumber: val }, { barcode: val }, { rfidEpc: val }]
        },
        include: { category: true, model: true }
      });

      if (asset) {
        return {
          success: true,
          type: 'EXISTING_ASSET',
          asset
        };
      }
    } catch (e) {
      // offline fallback
    }

    return { success: false, message: 'No matching asset or PO line found.' };
  }

  /**
   * Save Incomplete Receiving Session as Draft
   */
  static async saveDraft(draftData, userId) {
    const draftId = draftData.id || `DRAFT-${Date.now().toString(36).toUpperCase()}`;
    const draftRecord = {
      ...draftData,
      id: draftId,
      userId,
      updatedAt: new Date().toISOString()
    };
    draftsStore.set(draftId, draftRecord);
    return draftRecord;
  }

  static async getDrafts(userId) {
    return Array.from(draftsStore.values()).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }

  static async getDraftById(id) {
    return draftsStore.get(id) || null;
  }

  static async deleteDraft(id) {
    return draftsStore.delete(id);
  }

  /**
   * Final Submission of Receiving Transaction (Receive with PO or Receive without PO)
   */
  static async submitReceivingTransaction(payload, user) {
    const {
      mode = 'WITH_PO', // WITH_PO or WITHOUT_PO
      poNumber,
      supplier,
      receivingDate = new Date(),
      receivingLocation,
      receivedBy,
      referenceNo,
      remarks,
      nonPoReason,
      scannedItems = [],
      poLineItems = [],
      requireApproval = true
    } = payload;

    if (!supplier?.trim() || !receivingLocation?.trim() || !Array.isArray(scannedItems) || !scannedItems.length) throw new Error('Supplier, location, and at least one scanned asset are required.');
    if (mode === 'WITH_PO' && !poNumber) throw new Error('Select a purchase order first.');
    const grnNumber = referenceNo || `GRN-${Date.now()}`;

    const transactionRecord = {
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      receiptNumber: grnNumber,
      mode,
      poNumber: mode === 'WITH_PO' ? poNumber : 'NON-PO',
      vendorName: supplier,
      receivingLocation: receivingLocation,
      receivedBy: receivedBy || user?.fullName || user?.username,
      receivedDate: receivingDate,
      status: requireApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
      remarks: remarks || (mode === 'WITHOUT_PO' ? `Non-PO: ${nonPoReason || 'Direct Receipt'}` : 'Received via Receiving & Tagging Workbench'),
      lineItems: poLineItems.length > 0 ? poLineItems : [
        {
          itemDescription: 'Received Inventory Assets',
          partNumber: 'GEN-01',
          orderedQty: scannedItems.length,
          receivedQty: scannedItems.length,
          pendingQty: 0,
          status: 'Completed',
          assets: scannedItems
        }
      ],
      scannedAssets: scannedItems,
      summary: {
        poItems: poLineItems.length || 1,
        unitsReceived: scannedItems.length,
        unitsTagged: scannedItems.filter(s => s.tagNumber || s.rfidEpc).length,
        unitsPending: 0
      },
      auditTrail: [
        {
          action: 'RECEIVE_TRANSACTION_SUBMITTED',
          timestamp: new Date().toISOString(),
          user: user?.fullName || 'John Doe',
          details: `Processed ${scannedItems.length} units under ${grnNumber}. Routing to approval: ${requireApproval}`
        }
      ]
    };

    if (!isSqlServerConnected) throw new Error('Database is unavailable. Receipt was not saved.');
    if (mode === 'WITH_PO' && !(await findPurchaseOrder(poNumber))) throw new Error('Purchase order was not found.');

    // If draft exists, remove draft
    if (payload.draftId) {
      draftsStore.delete(payload.draftId);
    }

    // If database is available, persist through Prisma transaction
    if (isSqlServerConnected) {
      try {
        let company = await prisma.company.findFirst({ where: { active: true } });
        if (!company) company = await prisma.company.findFirst();

        let site = await prisma.site.findFirst({ where: { active: true } });
        if (!site) site = await prisma.site.findFirst();

        let category = await prisma.category.findFirst({ where: { active: true } });
        if (!category) category = await prisma.category.findFirst();

        // Resolve user to a valid dbo.users record to satisfy foreign key constraints
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(user?.id ? [{ id: user.id }] : []),
              { username: user?.username || 'admin' }
            ]
          }
        });
        const firstUser = dbUser || (await prisma.user.findFirst());
        const dbUserId = firstUser ? firstUser.id : (user?.id || 'usr-default');

        if (!company || !site || !category || !firstUser) throw new Error('Receiving reference data is incomplete.');
        {
          await prisma.$transaction(async (tx) => {
            const receipt = await tx.receipt.create({
              data: {
                receiptNumber: grnNumber,
                poNumber: transactionRecord.poNumber,
                vendorName: transactionRecord.vendorName,
                companyId: company.id,
                siteId: site.id,
                status: requireApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
                receivedByUserId: dbUserId
              }
            });

            for (let idx = 0; idx < scannedItems.length; idx++) {
              const item = scannedItems[idx];
              const uniqueSuffix = `${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}${idx + 1}`;
              const assetId = item.assetId || `AST-REC-${uniqueSuffix}`;
              const tagNum = (item.tagNumber && item.tagNumber !== '-') ? item.tagNumber : `TAG-${uniqueSuffix}`;

              let itemCategory = category;
              if (item.category) {
                const foundCat = await tx.category.findFirst({
                  where: {
                    OR: [
                      { name: { contains: item.category } },
                      { code: { contains: item.category } }
                    ]
                  }
                });
                if (foundCat) itemCategory = foundCat;
              }

              const asset = await tx.asset.create({
                data: {
                  assetId,
                  description: item.assetName || item.description || 'Received Physical Asset',
                  serialNumber: item.serialNumber || `SN-${uniqueSuffix}`,
                  tagNumber: tagNum,
                  barcode: tagNum,
                  rfidEpc: item.rfidEpc || null,
                  rfidTid: item.rfidTid || null,
                  categoryId: itemCategory.id,
                  companyId: company.id,
                  siteId: site.id,
                  supplierName: transactionRecord.vendorName,
                  poNumber: transactionRecord.poNumber,
                  lifecycleStatus: requireApproval ? 'RECEIVED' : 'TAGGED',
                  condition: 'NEW',
                  createdByUserId: dbUserId
                }
              });

              // Create active Tag record
              await tx.tag.upsert({
                where: { tagNumber: tagNum },
                update: {
                  assetId: asset.id,
                  status: 'ACTIVE',
                  ...(item.rfidEpc ? { rfidEpc: item.rfidEpc } : {})
                },
                create: {
                  tagNumber: tagNum,
                  tagType: item.rfidEpc ? 'RFID_EPC' : 'BARCODE_128',
                  ...(item.rfidEpc ? { rfidEpc: item.rfidEpc } : {}),
                  assetId: asset.id,
                  status: 'ACTIVE',
                  printedDate: new Date()
                }
              });

              // Record transaction event in AssetTransaction
              await tx.assetTransaction.create({
                data: {
                  assetId: asset.id,
                  transactionType: 'RECEIVE_AND_TAG',
                  fromStatus: 'NONE',
                  toStatus: asset.lifecycleStatus,
                  performedByUserId: dbUserId,
                  notes: `Received via ${grnNumber} (PO: ${transactionRecord.poNumber}). Tag assigned: ${tagNum}`
                }
              });

              // Record line item in receipt_line_items
              await tx.receiptLineItem.create({
                data: {
                  receiptId: receipt.id,
                  description: item.assetName || item.description || 'Received Item',
                  quantity: 1,
                  categoryId: itemCategory.id,
                  serialNumbers: item.serialNumber || '',
                  createdAssetIds: asset.id
                }
              });
            }
          });
        }
      } catch (dbErr) {
        throw dbErr;
      }
    }

    return transactionRecord;
  }

  /**
   * Search / Query Receiving History
   */
  static async getHistory(filters = {}) {
    const { q, poNumber, supplier, location, status } = filters;
    if (!isSqlServerConnected) throw new Error('Database is unavailable.');
    let records = [];

    // Fetch from Prisma if SQL Server is connected
    if (isSqlServerConnected) {
      try {
        const dbReceipts = await prisma.receipt.findMany({
          where: { status: { not: 'PURCHASE_ORDER' } },
          include: { company: true, site: true, lineItems: true },
          orderBy: { createdAt: 'desc' }
        });
        if (dbReceipts && dbReceipts.length > 0) {
          const dbRecords = dbReceipts.map((r) => ({
            id: r.id,
            receiptNumber: r.receiptNumber,
            mode: r.poNumber === 'NON-PO' ? 'WITHOUT_PO' : 'WITH_PO',
            poNumber: r.poNumber,
            vendorName: r.vendorName,
            receivingLocation: r.site?.name || 'Main IT Store',
            receivedBy: r.receivedByUserId || 'System',
            receivedDate: r.receivedDate ? r.receivedDate.toISOString() : new Date().toISOString(),
            status: r.status,
            remarks: `Receipt ${r.receiptNumber}`,
            lineItems: r.lineItems || [],
            scannedAssets: [],
            summary: {
              poItems: r.lineItems?.length || 0,
              unitsReceived: r.lineItems?.reduce((acc, l) => acc + (l.quantity || 1), 0) || 0,
              unitsTagged: r.lineItems?.length || 0,
              unitsPending: 0
            }
          }));

          records = dbRecords;
        }
      } catch (e) { throw e; }
    }

    if (q) {
      const term = q.toLowerCase();
      records = records.filter(
        (r) =>
          r.receiptNumber.toLowerCase().includes(term) ||
          r.poNumber.toLowerCase().includes(term) ||
          r.vendorName.toLowerCase().includes(term) ||
          (r.remarks && r.remarks.toLowerCase().includes(term))
      );
    }

    if (poNumber) {
      records = records.filter((r) => r.poNumber.toLowerCase().includes(poNumber.toLowerCase()));
    }

    if (filters.receiveNumber) {
      records = records.filter((r) => r.receiptNumber.toLowerCase().includes(filters.receiveNumber.toLowerCase()));
    }

    if (supplier && supplier !== 'All' && supplier !== 'All Suppliers') {
      records = records.filter((r) => r.vendorName.toLowerCase().includes(supplier.toLowerCase()));
    }

    if (location && location !== 'All' && location !== 'All Locations') {
      records = records.filter((r) => (r.receivingLocation || '').toLowerCase().includes(location.toLowerCase()));
    }

    if (status && status !== 'All' && status !== 'All Status') {
      records = records.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    if (filters.receiveType && filters.receiveType !== 'All' && filters.receiveType !== 'All Types') {
      const type = filters.receiveType.toLowerCase();
      if (type.includes('with po') || type === 'with_po') {
        records = records.filter((r) => r.mode === 'WITH_PO' || r.poNumber !== 'NON-PO');
      } else if (type.includes('without po') || type === 'without_po' || type.includes('non-po')) {
        records = records.filter((r) => r.mode === 'WITHOUT_PO' || r.poNumber === 'NON-PO');
      }
    }

    if (filters.receivedBy && filters.receivedBy !== 'All' && filters.receivedBy !== 'All Users') {
      records = records.filter((r) => (r.receivedBy || '').toLowerCase().includes(filters.receivedBy.toLowerCase()));
    }

    if (filters.fromDate) {
      records = records.filter((r) => new Date(r.receivedDate) >= new Date(filters.fromDate));
    }

    if (filters.toDate) {
      records = records.filter((r) => new Date(r.receivedDate) <= new Date(filters.toDate));
    }

    return records;
  }

  static async getHistoryDetail(id) {
    if (isSqlServerConnected) {
      try {
        const dbReceipt = await prisma.receipt.findFirst({
          where: { status: { not: 'PURCHASE_ORDER' }, OR: [{ id }, { receiptNumber: id }] },
          include: { company: true, site: true, lineItems: { include: { category: true } } }
        });
        if (dbReceipt) {
          return {
            id: dbReceipt.id,
            receiptNumber: dbReceipt.receiptNumber,
            mode: dbReceipt.poNumber === 'NON-PO' ? 'WITHOUT_PO' : 'WITH_PO',
            poNumber: dbReceipt.poNumber,
            vendorName: dbReceipt.vendorName,
            receivingLocation: dbReceipt.site?.name || 'Main IT Store',
            receivedBy: dbReceipt.receivedByUserId,
            receivedDate: dbReceipt.receivedDate ? dbReceipt.receivedDate.toISOString() : new Date().toISOString(),
            status: dbReceipt.status,
            remarks: `Receipt ${dbReceipt.receiptNumber}`,
            lineItems: dbReceipt.lineItems || [],
            scannedAssets: [],
            summary: {
              poItems: dbReceipt.lineItems?.length || 0,
              unitsReceived: dbReceipt.lineItems?.reduce((acc, l) => acc + (l.quantity || 1), 0) || 0,
              unitsTagged: dbReceipt.lineItems?.length || 0,
              unitsPending: 0
            }
          };
        }
      } catch (e) { throw e; }
    }
    return null;
  }

  /**
   * Get Configurable Reasons for Non-PO Receipt from Master Data
   */
  static async getNonPoReasons() {
    return [
      { id: 'REASON-01', code: 'INITIAL_STOCK', name: 'Initial stock / Donation / Transfer', description: 'Initial stock intake, legacy asset registration, donor contribution or inter-site transfer' },
      { id: 'REASON-02', code: 'DONATION', name: 'Donated Equipment / Grants', description: 'Asset provided by charitable donation or research grant without PO' },
      { id: 'REASON-03', code: 'TRANSFER', name: 'Inter-Department / Entity Transfer', description: 'Internal custody transfer from another business unit or affiliate' },
      { id: 'REASON-04', code: 'REPLACEMENT', name: 'Vendor Replacement / Warranty RMA', description: 'Direct equipment replacement received under SLA/RMA agreement' },
      { id: 'REASON-05', code: 'LEGACY_AUDIT', name: 'Found During Physical Audit', description: 'Unregistered physical asset discovered during stocktake or floor audit' },
      { id: 'REASON-06', code: 'DIRECT_PURCHASE', name: 'Petty Cash / Direct P-Card Purchase', description: 'Immediate operational purchase not processed through ERP procurement' },
      { id: 'REASON-07', code: 'LOAN_DEMO', name: 'Vendor Loan / Evaluation Unit', description: 'Trial or proof-of-concept hardware provided by vendor' }
    ];
  }

  /**
   * Get Configurable Master Suppliers / Sources
   */
  static async getSuppliers() {
    return [
      { id: 'SUP-01', code: 'DELL', name: 'Dell Technologies', contact: 'dell-enterprise@dell.com' },
      { id: 'SUP-02', code: 'APPLE', name: 'Apple Inc.', contact: 'enterprise@apple.com' },
      { id: 'SUP-03', code: 'CISCO', name: 'Cisco Systems Inc.', contact: 'hardware@cisco.com' },
      { id: 'SUP-04', code: 'HPE', name: 'HP Enterprise', contact: 'orders@hpe.com' },
      { id: 'SUP-05', code: 'LENOVO', name: 'Lenovo Global', contact: 'commercial@lenovo.com' },
      { id: 'SUP-06', code: 'SAMSUNG', name: 'Samsung Electronics', contact: 'b2b@samsung.com' },
      { id: 'SUP-07', code: 'LOGITECH', name: 'Logitech International', contact: 'support@logitech.com' },
      { id: 'SUP-08', code: 'MICROSOFT', name: 'Microsoft Surface Commercial', contact: 'surface@microsoft.com' },
      { id: 'SUP-09', code: 'INTERNAL', name: 'Internal Transfer (HQ Warehouse)', contact: 'logistics@asset360.internal' },
      { id: 'SUP-10', code: 'GOVT_DONOR', name: 'Government Grant / Partner Donor', contact: 'grants@donor.org' }
    ];
  }

  /**
   * Comprehensive Server-Side Batch Validation for Proceed to Review
   */
  static async validateReceivingBatch(payload) {
    const {
      supplier,
      receivingDate,
      receivingLocation,
      receivedBy,
      reason,
      items = []
    } = payload;

    const errors = [];
    const warnings = [];
    const duplicates = [];

    // Header validations
    if (!supplier || !supplier.trim()) {
      errors.push({ field: 'supplier', message: 'Supplier / Source is required.' });
    }
    if (!receivingDate) {
      errors.push({ field: 'receivingDate', message: 'Receiving Date is required.' });
    }
    if (!receivingLocation || !receivingLocation.trim()) {
      errors.push({ field: 'receivingLocation', message: 'Receiving Location is required.' });
    }
    if (!receivedBy || !receivedBy.trim()) {
      errors.push({ field: 'receivedBy', message: 'Received By field is required.' });
    }
    if (!reason || !reason.trim()) {
      errors.push({ field: 'reason', message: 'Reason for Non-PO Receipt is required.' });
    }

    if (!items || items.length === 0) {
      errors.push({ field: 'items', message: 'At least one asset must be received in the batch.' });
      return {
        valid: false,
        summary: { totalItems: 0, taggedCount: 0, pendingCount: 0, errorCount: errors.length, warningCount: 0, duplicateCount: 0 },
        errors,
        warnings,
        duplicates
      };
    }

    // Check duplicate serial numbers within the batch
    const seenSerials = new Set();
    const seenTags = new Set();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sn = item.serialNumber?.trim();
      const tag = item.tagNumber?.trim();

      if (!sn) {
        errors.push({ itemIndex: i, field: 'serialNumber', message: `Row #${i + 1}: Serial Number is missing.` });
      } else {
        if (seenSerials.has(sn.toLowerCase())) {
          duplicates.push({ itemIndex: i, serialNumber: sn, message: `Duplicate Serial Number '${sn}' found within this receiving batch.` });
          errors.push({ itemIndex: i, field: 'serialNumber', message: `Serial Number '${sn}' is duplicated in current session.` });
        } else {
          seenSerials.add(sn.toLowerCase());
          // Validate against database / mock store
          const snCheck = await this.validateSerialNumber(sn);
          if (!snCheck.valid) {
            duplicates.push({ itemIndex: i, serialNumber: sn, message: snCheck.message });
            errors.push({ itemIndex: i, field: 'serialNumber', message: snCheck.message });
          }
        }
      }

      // Check tag assignment
      if (tag && tag !== '-') {
        if (seenTags.has(tag.toLowerCase())) {
          duplicates.push({ itemIndex: i, tagNumber: tag, message: `Tag Number '${tag}' is assigned to multiple assets in this batch.` });
          errors.push({ itemIndex: i, field: 'tagNumber', message: `Duplicate Tag '${tag}' in current session.` });
        } else {
          seenTags.add(tag.toLowerCase());
          const tagCheck = await this.validateTag(tag, item.rfidEpc);
          if (!tagCheck.valid) {
            errors.push({ itemIndex: i, field: 'tagNumber', message: tagCheck.message });
          }
        }
      } else {
        warnings.push({ itemIndex: i, field: 'tagNumber', message: `Row #${i + 1} (${item.serialNumber || 'Unserialized'}): Tag has not been assigned yet (Status: Pending).` });
      }
    }

    const taggedCount = items.filter(it => it.tagNumber && it.tagNumber !== '-' && it.status === 'Tagged').length;
    const pendingCount = items.length - taggedCount;

    return {
      valid: errors.length === 0,
      summary: {
        totalItems: items.length,
        taggedCount,
        pendingCount,
        errorCount: errors.length,
        warningCount: warnings.length,
        duplicateCount: duplicates.length
      },
      errors,
      warnings,
      duplicates
    };
  }
}
