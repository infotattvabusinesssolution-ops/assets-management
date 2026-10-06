const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [
    assets,
    users,
    roles,
    employees,
    sites,
    buildings,
    floors,
    rooms,
    zones,
    categories,
    classes,
    manufacturers,
    models,
    transfers,
    floorMaps,
    assetMapPositions,
    campaigns,
    expectedAssets,
    observations,
    exceptions,
    tags,
    readers,
    rtlsLocations,
    rtlsAlerts,
    workOrders,
    contracts,
    auditEvents,
    receipts
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.user.count(),
    prisma.role.count(),
    prisma.employee.count(),
    prisma.site.count(),
    prisma.building.count(),
    prisma.floor.count(),
    prisma.room.count(),
    prisma.zone.count(),
    prisma.category.count(),
    prisma.assetClass.count(),
    prisma.manufacturer.count(),
    prisma.assetModel.count(),
    prisma.assetTransfer.count(),
    prisma.floorMap.count(),
    prisma.assetMapPosition.count(),
    prisma.stocktakeCampaign.count(),
    prisma.stocktakeExpectedAsset.count(),
    prisma.stocktakeObservation.count(),
    prisma.stocktakeException.count(),
    prisma.tag.count(),
    prisma.rtlsReader.count(),
    prisma.rtlsAssetLocation.count(),
    prisma.rtlsAlert.count(),
    prisma.maintenanceWorkOrder.count(),
    prisma.contract.count(),
    prisma.auditEvent.count(),
    prisma.receipt.count()
  ]);

  console.log(JSON.stringify({
    assets,
    users,
    roles,
    employees,
    sites,
    buildings,
    floors,
    rooms,
    zones,
    categories,
    classes,
    manufacturers,
    models,
    transfers,
    floorMaps,
    assetMapPositions,
    campaigns,
    expectedAssets,
    observations,
    exceptions,
    tags,
    readers,
    rtlsLocations,
    rtlsAlerts,
    workOrders,
    contracts,
    auditEvents,
    receipts
  }, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
