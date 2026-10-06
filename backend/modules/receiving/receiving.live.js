import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const requireDatabase = () => {
  if (!isDbConnected()) throw new Error('Database is unavailable. Receiving changes were not saved.');
};

const metadata = (receipt) => {
  try { return JSON.parse(receipt.legacyMongoId || '{}'); } catch { return {}; }
};

const mapOrder = (order, receipts = []) => {
  const meta = metadata(order);
  return {
    poNumber: order.poNumber,
    supplier: order.vendorName,
    poDate: order.receivedDate ? order.receivedDate.toISOString().slice(0, 10) : '',
    expectedDeliveryDate: meta.expectedDeliveryDate || '',
    currency: meta.currency || 'USD',
    paymentTerms: meta.paymentTerms || '',
    status: order.status,
    lineItems: order.lineItems.map((line, index) => {
      const orderedQty = line.quantity || 0;
      const receivedQty = receipts.flatMap(receipt => receipt.lineItems || []).filter(item =>
        item.description === line.description || item.serialNumbers === line.serialNumbers
      ).reduce((sum, item) => sum + (item.quantity || 0), 0);
      const pendingQty = Math.max(0, orderedQty - receivedQty);
      return {
        id: line.id,
        itemNumber: index + 1,
        description: line.description || '',
        partNumber: line.serialNumbers || '',
        model: line.createdAssetIds || '',
        category: line.category?.name || 'Laptop',
        orderedQty,
        receivedQty,
        pendingQty,
        unitPrice: Number(line.unitPrice || 0),
        status: pendingQty === 0 ? 'Completed' : receivedQty ? 'In Progress' : 'Pending'
      };
    })
  };
};

export async function listPurchaseOrders(query = '') {
  requireDatabase();
  const orders = await prisma.receipt.findMany({
    where: {
      status: 'PURCHASE_ORDER',
      ...(query ? {
        OR: [
          { poNumber: { contains: query } },
          { vendorName: { contains: query } }
        ]
      } : {})
    },
    include: { lineItems: { include: { category: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return orders.map(order => mapOrder(order));
}

export async function findPurchaseOrder(poNumber) {
  requireDatabase();
  let order = await prisma.receipt.findFirst({
    where: { poNumber, status: 'PURCHASE_ORDER' },
    include: { lineItems: { include: { category: true } } }
  });
  if (!order) return null;
  const receipts = await prisma.receipt.findMany({
    where: { poNumber, status: { not: 'PURCHASE_ORDER' } },
    include: { lineItems: true }
  });
  return mapOrder(order, receipts);
}

export async function storePurchaseOrder(payload, user) {
  requireDatabase();
  const poNumber = String(payload.poNumber || '').trim().toUpperCase();
  const supplier = String(payload.supplier || '').trim();
  const lines = Array.isArray(payload.lineItems) ? payload.lineItems : [];
  if (!poNumber || !supplier || !lines.length || lines.some(line => !line.description?.trim() || Number(line.orderedQty) <= 0)) {
    throw new Error('PO number, supplier, and valid line items are required.');
  }
  if (await prisma.receipt.findFirst({ where: { poNumber, status: 'PURCHASE_ORDER' } })) {
    throw new Error('Purchase order number already exists.');
  }
  const [company, site, dbUser] = await Promise.all([
    prisma.company.findFirst({ where: { active: true } }),
    prisma.site.findFirst({ where: { active: true } }),
    prisma.user.findFirst({ where: user?.id ? { id: user.id } : { username: 'admin' } })
  ]);
  if (!company || !site || !dbUser) throw new Error('Company, site, and user records are required to save a PO.');
  const categories = await prisma.category.findMany();
  const saved = await prisma.receipt.create({
    data: {
      receiptNumber: `PO-${poNumber}`,
      poNumber,
      vendorName: supplier,
      companyId: company.id,
      siteId: site.id,
      receivedByUserId: dbUser.id,
      receivedDate: payload.poDate ? new Date(payload.poDate) : new Date(),
      status: 'PURCHASE_ORDER',
      legacyMongoId: JSON.stringify({
        expectedDeliveryDate: payload.expectedDeliveryDate || '',
        currency: payload.currency || 'USD',
        paymentTerms: payload.paymentTerms || ''
      }),
      lineItems: {
        create: lines.map(line => ({
          description: String(line.description).trim(),
          quantity: Number(line.orderedQty),
          unitPrice: Number(line.unitPrice || 0),
          serialNumbers: line.partNumber || '',
          createdAssetIds: line.model || '',
          categoryId: categories.find(category => category.name.toLowerCase() === String(line.category || '').toLowerCase())?.id || categories[0]?.id || null
        }))
      }
    },
    include: { lineItems: { include: { category: true } } }
  });
  return mapOrder(saved);
}

export async function listSuppliers() {
  requireDatabase();
  const [receipts, assets] = await Promise.all([
    prisma.receipt.findMany({ distinct: ['vendorName'], select: { vendorName: true } }).catch(() => []),
    prisma.asset.findMany({ where: { supplierName: { not: null } }, distinct: ['supplierName'], select: { supplierName: true } }).catch(() => [])
  ]);

  const names = [...new Set([...receipts.map(item => item.vendorName), ...assets.map(item => item.supplierName)].filter(Boolean))].sort();
  return names.map((name) => ({ id: name, code: name.toUpperCase().replace(/[^A-Z0-9]/g, '_'), name, contact: '' }));
}
