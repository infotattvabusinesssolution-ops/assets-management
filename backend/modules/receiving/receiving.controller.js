import prisma from '../../config/prisma.js';
import { ReceivingService } from './receiving.service.js';
import { listPurchaseOrders, findPurchaseOrder, storePurchaseOrder, listSuppliers } from './receiving.live.js';

export async function getReceipts(req, res, next) {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { status: { not: 'PURCHASE_ORDER' } },
      include: {
        company: true,
        site: true,
        lineItems: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, receipts });
  } catch (err) {
    // If DB offline, fallback to ReceivingService mock history
    try {
      const history = await ReceivingService.getHistory();
      res.json({ success: true, receipts: history });
    } catch (fallbackErr) {
      next(err);
    }
  }
}

export async function getReceivingStats(req, res, next) {
  try {
    const totalReceipts = await prisma.receipt.count({ where: { status: { not: 'PURCHASE_ORDER' } } });
    const receipts = await prisma.receipt.findMany({
      where: { status: { not: 'PURCHASE_ORDER' } },
      include: { lineItems: true }
    });

    let totalUnitsReceived = 0;
    let totalPoValuation = 0;

    for (const r of receipts) {
      for (const line of r.lineItems) {
        const qty = line.quantity || (line.serialNumbers ? line.serialNumbers.length : 1);
        const price = parseFloat(line.unitPrice) || 0;
        totalUnitsReceived += qty;
        totalPoValuation += qty * price;
      }
    }

    const stagedAssetsCount = await prisma.asset.count({
      where: { lifecycleStatus: 'RECEIVED' }
    });

    res.json({
      success: true,
      stats: {
        totalReceipts,
        totalUnitsReceived,
        totalPoValuation,
        stagedAssetsCount
      }
    });
  } catch (err) { next(err); }
}

export async function getReceiptById(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findFirst({
      where: { OR: [{ id }, { receiptNumber: id }] },
      include: {
        company: true,
        site: true,
        lineItems: {
          include: { category: true }
        }
      }
    });

    if (!receipt) {
      const fallback = await ReceivingService.getHistoryDetail(id);
      if (fallback) return res.json({ success: true, receipt: fallback });
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.json({ success: true, receipt });
  } catch (err) {
    const fallback = await ReceivingService.getHistoryDetail(req.params.id, req.user?.id, req.user);
    if (fallback) return res.json({ success: true, receipt: fallback });
    next(err);
  }
}

// ----------------------------------------------------
// NEW WORKFLOW & RECEIVING & TAGGING ENDPOINTS
// ----------------------------------------------------

export async function getPurchaseOrders(req, res, next) {
  try {
    const { q } = req.query;
    const orders = await listPurchaseOrders(q);
    res.json({ success: true, purchaseOrders: orders });
  } catch (err) { next(err); }
}

export async function getPurchaseOrderByNumber(req, res, next) {
  try {
    const { poNumber } = req.params;
    const po = await findPurchaseOrder(poNumber);
    if (!po) {
      return res.status(404).json({ success: false, message: `PO '${poNumber}' not found in ERP/Integration source.` });
    }
    res.json({ success: true, purchaseOrder: po });
  } catch (err) { next(err); }
}

export async function createPurchaseOrder(req, res, next) {
  try {
    const newPo = await storePurchaseOrder(req.body, req.user);
    res.status(201).json({ success: true, purchaseOrder: newPo, message: 'Purchase Order created successfully.' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
}

export async function validateSerialNumber(req, res, next) {
  try {
    const { serialNumber } = req.body;
    const result = await ReceivingService.validateSerialNumber(serialNumber);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function validateTagNumber(req, res, next) {
  try {
    const { tagNumber, rfidEpc, rfidTid } = req.body;
    const result = await ReceivingService.validateTag(tagNumber, rfidEpc, rfidTid);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getNonPoReasons(req, res, next) {
  try {
    const reasons = await ReceivingService.getNonPoReasons();
    res.json({ success: true, reasons });
  } catch (err) { next(err); }
}

export async function getSuppliers(req, res, next) {
  try {
    const suppliers = await listSuppliers();
    res.json({ success: true, suppliers });
  } catch (err) { next(err); }
}

export async function validateReceivingBatch(req, res, next) {
  try {
    const result = await ReceivingService.validateReceivingBatch(req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function scanLookup(req, res, next) {
  try {
    const { scanValue, poNumber } = req.body;
    const result = await ReceivingService.scanLookup({ scanValue, poNumber });
    res.json(result);
  } catch (err) { next(err); }
}

export async function submitReceiving(req, res, next) {
  try {
    const result = await ReceivingService.submitReceivingTransaction(req.body, req.user);
    res.status(201).json({ success: true, receipt: result, message: 'Receiving transaction successfully submitted.' });
  } catch (err) { next(err); }
}

export async function saveDraft(req, res, next) {
  try {
    const draft = await ReceivingService.saveDraft(req.body, req.user?.id || 'anonymous');
    res.json({ success: true, draft, message: 'Draft saved successfully.' });
  } catch (err) { next(err); }
}

export async function getDrafts(req, res, next) {
  try {
    const drafts = await ReceivingService.getDrafts(req.user?.id);
    res.json({ success: true, drafts });
  } catch (err) { next(err); }
}

export async function getDraftById(req, res, next) {
  try {
    const draft = await ReceivingService.getDraftById(req.params.id, req.user?.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found.' });
    res.json({ success: true, draft });
  } catch (err) { next(err); }
}

export async function deleteDraft(req, res, next) {
  try {
    await ReceivingService.deleteDraft(req.params.id, req.user?.id);
    res.json({ success: true, message: 'Draft removed successfully.' });
  } catch (err) { next(err); }
}

export async function getReceivingHistory(req, res, next) {
  try {
    const result = await ReceivingService.getHistoryPage(req.query, req.user?.id, req.user);
    res.json({ success: true, history: result.records, receipts: result.records, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  } catch (err) { next(err); }
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

async function logReceivingHistoryAction(req, action, entityId, details) {
  try {
    await prisma.auditEvent.create({
      data: {
        userId: req.user?.id || null,
        action,
        entityType: 'RECEIVING_HISTORY',
        entityId: entityId || null,
        afterState: JSON.stringify(details),
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null
      }
    });
  } catch {
    // Keep a read/export action available if optional audit storage is unavailable.
  }
}

export async function exportReceivingHistory(req, res, next) {
  try {
    const records = await ReceivingService.getHistoryRecords(req.query, req.user?.id, req.user);
    await logReceivingHistoryAction(req, 'EXPORT', null, { recordCount: records.length, filters: req.query });
    const rows = [
      ['Receive Number', 'Receive Date', 'PO Number', 'Supplier', 'Receive Type', 'Items', 'Tagged', 'Pending Tagging', 'Status', 'Location', 'Received By'],
      ...records.map((record) => [record.receiptNumber, record.receivedDate, record.poNumber, record.vendorName, record.mode === 'WITHOUT_PO' ? 'Without PO' : 'With PO', record.summary.unitsReceived, record.summary.unitsTagged, record.summary.unitsPending, record.status, record.receivingLocation, record.receivedBy])
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="receiving-history.csv"');
    res.send(`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`);
  } catch (err) { next(err); }
}

export async function exportReceivingHistoryReport(req, res, next) {
  try {
    const record = await ReceivingService.getHistoryDetail(req.params.id, req.user?.id);
    if (!record) return res.status(404).json({ success: false, message: 'Transaction history record not found.' });
    await logReceivingHistoryAction(req, 'REPORT_GENERATED', record.id, { receiptNumber: record.receiptNumber, itemCount: record.summary.unitsReceived });
    const rows = [
      ['Receive Number', 'Receive Date', 'PO Number', 'Supplier', 'Receive Type', 'Status', 'Location', 'Received By', 'Remarks', 'Asset ID', 'Asset Name', 'Category', 'Serial Number', 'Tag Number', 'RFID EPC', 'Tag Status'],
      ...record.lineItems.map((item) => [record.receiptNumber, record.receivedDate, record.poNumber, record.vendorName, record.mode === 'WITHOUT_PO' ? 'Without PO' : 'With PO', record.status, record.receivingLocation, record.receivedBy, record.remarks, item.assetNumber, item.description, item.category, item.serialNumber, item.tagNumber, item.rfidEpc, item.tagStatus])
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${String(record.receiptNumber).replace(/[^a-z0-9._-]/gi, '_')}-report.csv"`);
    res.send(`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`);
  } catch (err) { next(err); }
}

export async function getReceivingHistoryById(req, res, next) {
  try {
    const detail = await ReceivingService.getHistoryDetail(req.params.id, req.user?.id);
    if (!detail) return res.status(404).json({ success: false, message: 'Transaction history record not found.' });
    res.json({ success: true, transaction: detail, receipt: detail });
  } catch (err) { next(err); }
}

export async function createReceipt(req, res, next) {
  try {
    let { companyId, siteId, poNumber, vendorName, packingSlip, receivingDock, lineItems } = req.body;

    let company = await prisma.company.findFirst({ where: { active: true } });
    if (!company) {
      const fallbackResult = await ReceivingService.submitReceivingTransaction(req.body, req.user);
      return res.status(201).json({ success: true, ...fallbackResult });
    }
    companyId = company.id;

    let site = await prisma.site.findFirst({ where: { active: true } });
    if (!site) site = { id: company.id };
    siteId = site.id;

    let defaultCategory = await prisma.category.findFirst({ where: { active: true } });

    const result = await prisma.$transaction(async (tx) => {
      const receiptNumber = 'REC-' + Date.now().toString(36).toUpperCase();

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          poNumber: poNumber || 'PO-2026-GEN',
          vendorName: vendorName || 'Generic Supplier',
          companyId,
          siteId,
          status: 'COMPLETED',
          receivedByUserId: req.user?.id || companyId
        }
      });

      const allCreatedAssetIds = [];

      if (lineItems && lineItems.length > 0) {
        for (const item of lineItems) {
          let itemCategoryId = defaultCategory ? defaultCategory.id : null;
          const serials = (item.serialNumbers && item.serialNumbers.length > 0) 
            ? item.serialNumbers 
            : ['SN-AUTO-' + Math.floor(Math.random() * 89999 + 10000)];

          const unitVal = parseFloat(item.unitPrice) || 0;
          const lineAssetIds = [];

          for (const sn of serials) {
            const assetId = 'AST-2026-' + Math.floor(Math.random() * 8999 + 1000);
            const tagNumber = 'TAG-' + Math.floor(Math.random() * 8999 + 1000);

            const asset = await tx.asset.create({
              data: {
                assetId,
                description: item.description || 'Received Inventory Item',
                serialNumber: sn,
                tagNumber,
                barcode: tagNumber,
                categoryId: itemCategoryId,
                companyId,
                siteId,
                buildingId: receivingDock || null,
                supplierName: vendorName || 'Generic Supplier',
                poNumber: poNumber || null,
                acquisitionValue: unitVal,
                lifecycleStatus: 'RECEIVED',
                condition: item.condition || 'NEW',
                createdByUserId: req.user?.id || null
              }
            });

            await tx.assetTransaction.create({
              data: {
                assetId: asset.id,
                transactionType: 'RECEIVE',
                fromStatus: 'NONE',
                toStatus: 'RECEIVED',
                performedByUserId: req.user?.id || companyId,
                notes: `Received via Goods Receipt ${receiptNumber} (PO: ${poNumber || 'N/A'})`
              }
            });

            lineAssetIds.push(asset.id);
            allCreatedAssetIds.push(asset.id);
          }

          await tx.receiptLineItem.create({
            data: {
              receiptId: receipt.id,
              description: item.description || 'Received Inventory Item',
              quantity: serials.length,
              unitPrice: unitVal,
              categoryId: itemCategoryId,
              serialNumbers: JSON.stringify(serials),
              createdAssetIds: JSON.stringify(lineAssetIds)
            }
          });
        }
      }

      return { receipt, createdAssetIds: allCreatedAssetIds };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    // Gracefully handle in mock service if DB transaction fails
    const fallbackResult = await ReceivingService.submitReceivingTransaction(req.body, req.user);
    res.status(201).json({ success: true, ...fallbackResult });
  }
}

export async function deleteReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findFirst({
      where: { OR: [{ id }, { receiptNumber: id }] }
    });

    if (receipt) {
      await prisma.receiptLineItem.deleteMany({ where: { receiptId: receipt.id } });
      await prisma.receipt.delete({ where: { id: receipt.id } });
    }
    await ReceivingService.deleteDraft(id);

    res.json({ success: true, message: 'Goods receipt deleted successfully' });
  } catch (err) { next(err); }
}
