import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// Sample ERP Purchase Orders for integration / lookup
export const MOCK_ERP_PURCHASE_ORDERS = [
  {
    poNumber: 'PO-2026-00123',
    supplier: 'Dell Technologies',
    poDate: '2026-08-12',
    expectedDeliveryDate: '2026-08-20',
    currency: 'USD',
    paymentTerms: 'Net 30',
    status: 'IN_PROGRESS',
    lineItems: [
      {
        id: 'line-01',
        itemNumber: 1,
        description: 'Dell Latitude 7450',
        partNumber: 'DL7450',
        category: 'Laptop',
        model: 'Latitude 7450',
        orderedQty: 10,
        unitPrice: 1450.00,
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
        preReceivedQty: 10, // Already received in prior delivery
      },
      {
        id: 'line-02',
        itemNumber: 2,
        description: 'Dell 27" Monitor',
        partNumber: 'U2723QE',
        category: 'Peripherals',
        model: 'UltraSharp U2723QE',
        orderedQty: 5,
        unitPrice: 580.00,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
        preReceivedQty: 3,
      },
      {
        id: 'line-03',
        itemNumber: 3,
        description: 'Dell Docking Station',
        partNumber: 'WD19S',
        category: 'Accessories',
        model: 'WD19S 180W',
        orderedQty: 5,
        unitPrice: 220.00,
        imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&q=80',
        preReceivedQty: 0,
      },
      {
        id: 'line-04',
        itemNumber: 4,
        description: 'Keyboard & Mouse',
        partNumber: 'KM7321W',
        category: 'Peripherals',
        model: 'Premier Multi-Device',
        orderedQty: 10,
        unitPrice: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
        preReceivedQty: 0,
      },
      {
        id: 'line-05',
        itemNumber: 5,
        description: 'Laptop Bag',
        partNumber: 'CN-460-BBDL',
        category: 'Accessories',
        model: 'Dell Pro Slim 15',
        orderedQty: 10,
        unitPrice: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
        preReceivedQty: 0,
      }
    ]
  },
  {
    poNumber: 'PO-2026-00124',
    supplier: 'Cisco Systems Inc.',
    poDate: '2026-08-15',
    expectedDeliveryDate: '2026-08-25',
    currency: 'USD',
    paymentTerms: 'Net 45',
    status: 'PENDING',
    lineItems: [
      {
        id: 'line-11',
        itemNumber: 1,
        description: 'Catalyst 9300 48-Port Switch',
        partNumber: 'C9300-48P-A',
        category: 'Networking',
        model: 'Catalyst 9300',
        orderedQty: 4,
        unitPrice: 4800.00,
        imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&q=80',
        preReceivedQty: 0,
      },
      {
        id: 'line-12',
        itemNumber: 2,
        description: 'Cisco SFP+ 10G Transceiver',
        partNumber: 'SFP-10G-SR',
        category: 'Networking',
        model: '10GBASE-SR',
        orderedQty: 16,
        unitPrice: 280.00,
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
        preReceivedQty: 0,
      }
    ]
  },
  {
    poNumber: 'PO-2026-00125',
    supplier: 'Apple Inc.',
    poDate: '2026-08-18',
    expectedDeliveryDate: '2026-08-28',
    currency: 'USD',
    paymentTerms: 'Prepaid',
    status: 'PENDING',
    lineItems: [
      {
        id: 'line-21',
        itemNumber: 1,
        description: 'MacBook Pro 16" M3 Max',
        partNumber: 'MBP16-M3MAX',
        category: 'Laptop',
        model: 'MacBook Pro 16',
        orderedQty: 6,
        unitPrice: 3499.00,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
        preReceivedQty: 0,
      }
    ]
  }
];

// In-memory store for drafts, simulated transactions, and offline resilience
const draftsStore = new Map();
const mockReceiptsStore = [
  {
    id: 'REC-HIST-001',
    receiptNumber: 'GRN-2026-00456',
    poNumber: 'PO-2026-00123',
    vendorName: 'Dell Technologies',
    receivingLocation: 'Dubai HQ - IT Store',
    receivedBy: 'John Doe',
    receivedDate: '2026-08-21T10:30:00Z',
    status: 'COMPLETED',
    remarks: 'Received in good condition. Partial batch 1 of 2.',
    lineItems: [
      {
        itemDescription: 'Dell Latitude 7450',
        partNumber: 'DL7450',
        orderedQty: 10,
        receivedQty: 10,
        pendingQty: 0,
        status: 'Completed',
        assets: [
          { serialNumber: 'DL7450-001', tagNumber: 'E36000012345', rfidEpc: 'E2801160600012345', status: 'Tagged' },
          { serialNumber: 'DL7450-002', tagNumber: 'E36000012346', rfidEpc: 'E2801160600012346', status: 'Tagged' },
          { serialNumber: 'DL7450-003', tagNumber: 'E36000012347', rfidEpc: 'E2801160600012347', status: 'Tagged' }
        ]
      },
      {
        itemDescription: 'Dell 27" Monitor',
        partNumber: 'U2723QE',
        orderedQty: 5,
        receivedQty: 3,
        pendingQty: 2,
        status: 'In Progress',
        assets: [
          { serialNumber: 'MON27-8801', tagNumber: 'E36000012380', rfidEpc: 'E2801160600012380', status: 'Tagged' },
          { serialNumber: 'MON27-8802', tagNumber: 'E36000012381', rfidEpc: 'E2801160600012381', status: 'Tagged' },
          { serialNumber: 'MON27-8803', tagNumber: 'E36000012382', rfidEpc: 'E2801160600012382', status: 'Tagged' }
        ]
      }
    ],
    summary: {
      poItems: 5,
      unitsReceived: 13,
      unitsTagged: 3,
      unitsPending: 2
    },
    auditTrail: [
      { action: 'PO_FETCHED', timestamp: '2026-08-21T09:45:00Z', user: 'John Doe', details: 'Retrieved PO-2026-00123 from ERP integration' },
      { action: 'ASSET_VERIFIED', timestamp: '2026-08-21T10:15:00Z', user: 'John Doe', details: 'Verified physical units for Dell Latitude 7450' },
      { action: 'TAGS_ASSIGNED', timestamp: '2026-08-21T10:25:00Z', user: 'John Doe', details: 'Associated Barcode & RFID EPC tags E36000012345-47' },
      { action: 'SUBMITTED', timestamp: '2026-08-21T10:30:00Z', user: 'John Doe', details: 'GRN-2026-00456 posted. Routed to Asset Approval.' }
    ]
  }
];

export class ReceivingService {
  /**
   * Search / List available Purchase Orders
   */
  static async getPurchaseOrders(query = '') {
    const q = query.trim().toLowerCase();
    let orders = MOCK_ERP_PURCHASE_ORDERS;
    if (q) {
      orders = orders.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplier.toLowerCase().includes(q)
      );
    }
    return orders;
  }

  /**
   * Get specific PO with dynamically computed cumulative receiving counts
   */
  static async getPurchaseOrderByNumber(poNumber) {
    const foundPo = MOCK_ERP_PURCHASE_ORDERS.find(
      (p) => p.poNumber.toUpperCase() === poNumber.trim().toUpperCase()
    );

    if (!foundPo) {
      return null;
    }

    // Try fetching actual completed receipts from Prisma DB if connected
    let completedReceipts = [];
    if (isSqlServerConnected) {
      try {
        completedReceipts = await prisma.receipt.findMany({
          where: { poNumber: foundPo.poNumber, status: 'COMPLETED' },
          include: { lineItems: true }
        });
      } catch (e) {
        completedReceipts = mockReceiptsStore.filter(
          (r) => r.poNumber === foundPo.poNumber && r.status === 'COMPLETED'
        );
      }
    } else {
      completedReceipts = mockReceiptsStore.filter(
        (r) => r.poNumber === foundPo.poNumber && r.status === 'COMPLETED'
      );
    }

    // Calculate cumulative received quantities per line item
    const computedLines = foundPo.lineItems.map((line) => {
      let cumulativeReceived = line.preReceivedQty || 0;

      // Add quantities from DB receipts if any additional
      for (const rec of completedReceipts) {
        if (rec.lineItems) {
          for (const item of rec.lineItems) {
            const desc = item.description || item.itemDescription || '';
            if (desc.toLowerCase().includes(line.partNumber.toLowerCase()) || desc.toLowerCase().includes(line.description.toLowerCase())) {
              cumulativeReceived = Math.max(cumulativeReceived, item.quantity || item.receivedQty || 0);
            }
          }
        }
      }

      const pendingQty = Math.max(0, line.orderedQty - cumulativeReceived);
      let status = 'Pending';
      if (cumulativeReceived >= line.orderedQty) {
        status = 'Completed';
      } else if (cumulativeReceived > 0) {
        status = 'In Progress';
      }

      return {
        ...line,
        receivedQty: cumulativeReceived,
        pendingQty,
        status
      };
    });

    return {
      ...foundPo,
      lineItems: computedLines
    };
  }

  /**
   * Validate serial number uniqueness
   */
  static async validateSerialNumber(serialNumber) {
    const sn = serialNumber?.trim();
    if (!sn) return { valid: false, message: 'Serial number is required' };

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
      } catch (e) {
        // Fallback
      }
    }

    // In offline/mock mode check mock store
    for (const rec of mockReceiptsStore) {
      for (const line of rec.lineItems || []) {
        for (const a of line.assets || []) {
          if (a.serialNumber?.toLowerCase() === sn.toLowerCase()) {
            return {
              valid: false,
              message: `Serial Number '${sn}' is already registered in receipt ${rec.receiptNumber}.`
            };
          }
        }
      }
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
      } catch (e) {
        // Fallback
      }
    }
      // Local fallback check
      for (const rec of mockReceiptsStore) {
        for (const line of rec.lineItems || []) {
          for (const a of line.assets || []) {
            if ((tag && a.tagNumber === tag) || (epc && a.rfidEpc === epc)) {
              return {
                valid: false,
                message: `Tag / EPC is already assigned in transaction ${rec.receiptNumber}.`
              };
            }
          }
        }
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

    // 3. Fallback: Parse common barcode / serial prefixes
    let assetName = 'Dell Latitude 7450';
    let category = 'Laptop';
    let model = 'Latitude 7450';
    let imageUrl = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80';

    if (val.toLowerCase().includes('mon') || val.toLowerCase().includes('u2723')) {
      assetName = 'Dell 27" Monitor';
      category = 'Peripherals';
      model = 'UltraSharp U2723QE';
      imageUrl = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80';
    } else if (val.toLowerCase().includes('dock') || val.toLowerCase().includes('wd19')) {
      assetName = 'Dell Docking Station';
      category = 'Accessories';
      model = 'WD19S 180W';
      imageUrl = 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&q=80';
    }

    return {
      success: true,
      type: 'SERIAL_PARSED',
      suggestedAsset: {
        serialNumber: val,
        assetName,
        category,
        model,
        imageUrl,
        tagNumber: `E360000${Math.floor(10000 + Math.random() * 90000)}`,
        rfidEpc: `E28011606000${Math.floor(10000 + Math.random() * 90000)}`
      }
    };
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

    const grnNumber = referenceNo || `GRN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const transactionRecord = {
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      receiptNumber: grnNumber,
      mode,
      poNumber: mode === 'WITH_PO' ? (poNumber || 'PO-2026-00123') : 'NON-PO',
      vendorName: supplier || 'Generic Supplier',
      receivingLocation: receivingLocation || 'Dubai HQ - IT Store',
      receivedBy: receivedBy || user?.fullName || 'John Doe',
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

    // Store in mock/memory store
    mockReceiptsStore.unshift(transactionRecord);

    // If draft exists, remove draft
    if (payload.draftId) {
      draftsStore.delete(payload.draftId);
    }

    // If database is available, persist through Prisma transaction
    if (isSqlServerConnected) {
      try {
        let company = await prisma.company.findFirst({ where: { active: true } });
        let site = await prisma.site.findFirst({ where: { active: true } });
        let category = await prisma.category.findFirst({ where: { active: true } });

        if (company && site) {
          await prisma.$transaction(async (tx) => {
            const receipt = await tx.receipt.create({
              data: {
                receiptNumber: grnNumber,
                poNumber: transactionRecord.poNumber,
                vendorName: transactionRecord.vendorName,
                companyId: company.id,
                siteId: site.id,
                status: requireApproval ? 'PENDING_APPROVAL' : 'COMPLETED',
                receivedByUserId: user?.id || company.id
              }
            });

            for (const item of scannedItems) {
              const assetId = `AST-2026-${Math.floor(1000 + Math.random() * 8999)}`;
              const tagNum = item.tagNumber || `TAG-${Math.floor(10000 + Math.random() * 90000)}`;

              const asset = await tx.asset.create({
                data: {
                  assetId,
                  description: item.assetName || item.description || 'Received Physical Asset',
                  serialNumber: item.serialNumber,
                  tagNumber: tagNum,
                  barcode: tagNum,
                  rfidEpc: item.rfidEpc || null,
                  rfidTid: item.rfidTid || null,
                  categoryId: category ? category.id : undefined,
                  companyId: company.id,
                  siteId: site.id,
                  supplierName: transactionRecord.vendorName,
                  poNumber: transactionRecord.poNumber,
                  lifecycleStatus: requireApproval ? 'RECEIVED' : 'TAGGED',
                  condition: 'NEW',
                  createdByUserId: user?.id || null
                }
              });

              // Create active Tag record
              await tx.tag.upsert({
                where: { tagNumber: tagNum },
                update: {
                  assetId: asset.id,
                  status: 'ACTIVE',
                  rfidEpc: item.rfidEpc || null,
                  rfidTid: item.rfidTid || null
                },
                create: {
                  tagNumber: tagNum,
                  tagType: item.rfidEpc ? 'RFID_EPC' : 'BARCODE_128',
                  rfidEpc: item.rfidEpc || null,
                  rfidTid: item.rfidTid || null,
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
                  performedByUserId: user?.id || company.id,
                  notes: `Received via ${grnNumber} (PO: ${transactionRecord.poNumber}). Tag assigned: ${tagNum}`
                }
              });
            }
          });
        }
      } catch (dbErr) {
        console.warn('Prisma DB sync warning (persisted in offline store):', dbErr.message);
      }
    }

    return transactionRecord;
  }

  /**
   * Search / Query Receiving History
   */
  static async getHistory(filters = {}) {
    const { q, poNumber, supplier, location, status } = filters;
    let records = [...mockReceiptsStore];

    // Try fetching from Prisma if possible
    if (isSqlServerConnected) {
      try {
        const dbReceipts = await prisma.receipt.findMany({
          include: { company: true, site: true, lineItems: true },
          orderBy: { createdAt: 'desc' }
        });
        if (dbReceipts && dbReceipts.length > 0) {
          // Merge or populate
        }
      } catch (e) {
        // Use records from mock store
      }
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

    if (supplier) {
      records = records.filter((r) => r.vendorName.toLowerCase().includes(supplier.toLowerCase()));
    }

    if (location) {
      records = records.filter((r) => (r.receivingLocation || '').toLowerCase().includes(location.toLowerCase()));
    }

    if (status) {
      records = records.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    return records;
  }

  static async getHistoryDetail(id) {
    const found = mockReceiptsStore.find(
      (r) => r.id === id || r.receiptNumber === id
    );
    return found || null;
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
