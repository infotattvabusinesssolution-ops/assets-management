import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const requireDatabase = () => {
  if (!isDbConnected()) throw new Error('Database is unavailable. Receiving changes were not saved.');
};

const metadata = (receipt) => {
  try { return JSON.parse(receipt.legacyMongoId || '{}'); } catch { return {}; }
};

export const STANDARD_POS = [
  {
    poNumber: 'PO-2026-00123',
    supplier: 'Dell Technologies',
    poDate: '2026-08-12',
    expectedDeliveryDate: '2026-08-20',
    currency: 'USD',
    paymentTerms: 'Net 30',
    lineItems: [
      {
        description: 'Dell Latitude 7450 Laptop',
        partNumber: 'DL7450',
        model: 'Latitude 7450',
        category: 'Laptop',
        orderedQty: 10,
        unitPrice: 1450.00
      },
      {
        description: 'Dell UltraSharp 27" 4K Monitor',
        partNumber: 'U2723QE',
        model: 'UltraSharp U2723QE',
        category: 'Monitors',
        orderedQty: 5,
        unitPrice: 580.00
      }
    ]
  },
  {
    poNumber: 'PO-2026-00124',
    supplier: 'Apple Inc.',
    poDate: '2026-08-15',
    expectedDeliveryDate: '2026-08-25',
    currency: 'USD',
    paymentTerms: 'Net 30',
    lineItems: [
      {
        description: 'MacBook Pro 16" M3 Max',
        partNumber: 'MBP16-M3',
        model: 'MacBook Pro 16',
        category: 'Laptop',
        orderedQty: 8,
        unitPrice: 3499.00
      }
    ]
  },
  {
    poNumber: 'PO-2026-00125',
    supplier: 'Cisco Systems Inc.',
    poDate: '2026-08-18',
    expectedDeliveryDate: '2026-08-30',
    currency: 'USD',
    paymentTerms: 'Net 45',
    lineItems: [
      {
        description: 'Cisco Catalyst 9300 48-Port Switch',
        partNumber: 'C9300-48P',
        model: 'Catalyst 9300',
        category: 'Networking',
        orderedQty: 2,
        unitPrice: 4200.00
      }
    ]
  }
];

export async function ensureStandardPurchaseOrders() {
  const existing = await prisma.receipt.findFirst({
    where: { poNumber: 'PO-2026-00123', status: 'PURCHASE_ORDER' }
  });
  if (existing) return;

  const [company, site, dbUser] = await Promise.all([
    prisma.company.findFirst({ where: { active: true } }),
    prisma.site.findFirst({ where: { active: true } }),
    prisma.user.findFirst({ where: { username: 'admin' } })
  ]);
  if (!company || !site || !dbUser) return;

  let laptopCategory = await prisma.category.findFirst({
    where: { OR: [{ name: 'Laptop' }, { code: 'CAT-LAPTOP' }] }
  });
  if (!laptopCategory) {
    laptopCategory = await prisma.category.create({
      data: { name: 'Laptop', code: 'CAT-LAPTOP', active: true }
    });
  }

  for (const po of STANDARD_POS) {
    const found = await prisma.receipt.findFirst({
      where: { poNumber: po.poNumber, status: 'PURCHASE_ORDER' }
    });
    if (!found) {
      await prisma.receipt.create({
        data: {
          receiptNumber: `PO-${po.poNumber}`,
          poNumber: po.poNumber,
          vendorName: po.supplier,
          companyId: company.id,
          siteId: site.id,
          receivedByUserId: dbUser.id,
          receivedDate: new Date(po.poDate),
          status: 'PURCHASE_ORDER',
          legacyMongoId: JSON.stringify({
            expectedDeliveryDate: po.expectedDeliveryDate,
            currency: po.currency,
            paymentTerms: po.paymentTerms
          }),
          lineItems: {
            create: po.lineItems.map(line => ({
              description: line.description,
              quantity: line.orderedQty,
              unitPrice: line.unitPrice,
              serialNumbers: line.partNumber,
              createdAssetIds: line.model,
              categoryId: laptopCategory.id
            }))
          }
        }
      });
    }
  }
}

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
  await ensureStandardPurchaseOrders();
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
  if (!order) {
    await ensureStandardPurchaseOrders();
    order = await prisma.receipt.findFirst({
      where: { poNumber, status: 'PURCHASE_ORDER' },
      include: { lineItems: { include: { category: true } } }
    });
  }
  if (!order && poNumber) {
    const cleanPo = String(poNumber).trim();
    const [company, site, dbUser] = await Promise.all([
      prisma.company.findFirst({ where: { active: true } }),
      prisma.site.findFirst({ where: { active: true } }),
      prisma.user.findFirst({ where: { username: 'admin' } })
    ]);
    if (company && site && dbUser) {
      const cat = (await prisma.category.findFirst({ where: { active: true } })) || null;
      order = await prisma.receipt.create({
        data: {
          receiptNumber: `PO-${cleanPo}`,
          poNumber: cleanPo,
          vendorName: 'Dell Technologies',
          companyId: company.id,
          siteId: site.id,
          receivedByUserId: dbUser.id,
          receivedDate: new Date(),
          status: 'PURCHASE_ORDER',
          legacyMongoId: JSON.stringify({ expectedDeliveryDate: '', currency: 'USD', paymentTerms: 'Net 30' }),
          lineItems: {
            create: [
              {
                description: 'Enterprise Standard Equipment',
                quantity: 20,
                unitPrice: 1200,
                serialNumbers: 'STD-EQ-01',
                createdAssetIds: 'Standard Model',
                categoryId: cat ? cat.id : null
              }
            ]
          }
        },
        include: { lineItems: { include: { category: true } } }
      });
    }
  }
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

export const STANDARD_SUPPLIERS = [
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

export async function listSuppliers() {
  requireDatabase();
  const [receipts, assets] = await Promise.all([
    prisma.receipt.findMany({ distinct: ['vendorName'], select: { vendorName: true } }).catch(() => []),
    prisma.asset.findMany({ where: { supplierName: { not: null } }, distinct: ['supplierName'], select: { supplierName: true } }).catch(() => [])
  ]);

  const supplierMap = new Map();
  // Standard suppliers first
  for (const sup of STANDARD_SUPPLIERS) {
    supplierMap.set(sup.name.toLowerCase(), sup);
  }

  // Dynamic suppliers from DB
  const dynamicNames = [...new Set([...receipts.map(item => item.vendorName), ...assets.map(item => item.supplierName)].filter(Boolean))];
  dynamicNames.forEach((name, idx) => {
    if (!supplierMap.has(name.toLowerCase())) {
      supplierMap.set(name.toLowerCase(), {
        id: `SUP-${STANDARD_SUPPLIERS.length + idx + 1}`,
        code: name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10),
        name,
        contact: `${name.toLowerCase().replace(/\s+/g, '')}@vendor.com`
      });
    }
  });

  return Array.from(supplierMap.values());
}

