import 'dotenv/config';
import prisma from '../config/prisma.js';
import { connectDB } from '../config/db.js';

// Repeatable, additive seed. Existing business records are never changed or removed.
async function main() {
  await connectDB();
  const [company, site, category, user] = await Promise.all([
    prisma.company.findFirst({ where: { active: true } }),
    prisma.site.findFirst({ where: { active: true } }),
    prisma.category.findFirst({ where: { active: true } }),
    prisma.user.findFirst({ where: { active: true } })
  ]);
  if (!company || !site || !category || !user) {
    throw new Error('Seed master company, site, category, and user data before working data.');
  }

  const assets = [
    { assetId: 'AST-SEED-1001', description: 'Service desk spare laptop', serialNumber: 'SEED-SN-1001' },
    { assetId: 'AST-SEED-1002', description: 'Warehouse spare monitor', serialNumber: 'SEED-SN-1002' },
    { assetId: 'AST-SEED-1003', description: 'Facilities spare scanner', serialNumber: 'SEED-SN-1003' }
  ];
  let createdAssets = 0;
  for (const asset of assets) {
    const exists = await prisma.asset.findUnique({ where: { assetId: asset.assetId } });
    if (!exists) {
      await prisma.asset.create({ data: {
        ...asset, companyId: company.id, siteId: site.id, categoryId: category.id,
        lifecycleStatus: 'RECEIVED', condition: 'NEW', active: true
      } });
      createdAssets++;
    }
  }

  const poNumber = 'PO-SEED-1001';
  let createdPo = false;
  if (!await prisma.receipt.findFirst({ where: { poNumber, status: 'PURCHASE_ORDER' } })) {
    await prisma.receipt.create({ data: {
      receiptNumber: 'ORDER-SEED-1001', poNumber, vendorName: 'Equipment Supply Co',
      companyId: company.id, siteId: site.id, receivedByUserId: user.id,
      status: 'PURCHASE_ORDER', receivedDate: new Date(),
      lineItems: { create: [{ description: 'Office workstation kit', quantity: 3, unitPrice: 950, categoryId: category.id }] }
    } });
    createdPo = true;
  }

  let createdSchedules = 0;
  if (await prisma.maintenanceSchedule.count() === 0) {
    const eligibleAssets = await prisma.asset.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' }, take: 3 });
    for (const asset of eligibleAssets) {
      const due = new Date();
      due.setMonth(due.getMonth() + 1);
      await prisma.maintenanceSchedule.create({ data: {
        title: `Scheduled service for ${asset.description}`,
        assetId: asset.id,
        frequencyMonths: 6,
        nextDueDate: due,
        active: true
      } });
      createdSchedules++;
    }
  }

  console.log(JSON.stringify({ createdAssets, createdPo, createdSchedules, assetsInDatabase: await prisma.asset.count(), purchaseOrdersInDatabase: await prisma.receipt.count({ where: { status: 'PURCHASE_ORDER' } }), schedulesInDatabase: await prisma.maintenanceSchedule.count() }));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
