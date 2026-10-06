const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = {
    assets: await prisma.asset.count(),
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    employees: await prisma.employee.count(),
    transfers: await prisma.assetTransfer.count(),
    sites: await prisma.site.count(),
    buildings: await prisma.building.count(),
    floors: await prisma.floor.count(),
    rooms: await prisma.room.count(),
    zones: await prisma.zone.count(),
    categories: await prisma.category.count(),
    classes: await prisma.assetClass.count(),
    manufacturers: await prisma.manufacturer.count(),
    models: await prisma.assetModel.count(),
    workOrders: await prisma.maintenanceWorkOrder.count(),
    floorMaps: await prisma.floorMap.count(),
    assetMapPositions: await prisma.assetMapPosition.count(),
    stocktakes: await prisma.stocktakeCampaign.count(),
    stocktakeExpected: await prisma.stocktakeExpectedAsset.count(),
    tags: await prisma.tag.count(),
    rtlsReaders: await prisma.rtlsReader.count(),
    rtlsLocations: await prisma.rtlsAssetLocation.count(),
    rtlsAlerts: await prisma.rtlsAlert.count(),
    auditEvents: await prisma.auditEvent.count(),
    discoveryObservations: await prisma.discoveryObservation.count(),
    receipts: await prisma.receipt.count()
  };
  console.log('CURRENT DATABASE COUNTS:', JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
