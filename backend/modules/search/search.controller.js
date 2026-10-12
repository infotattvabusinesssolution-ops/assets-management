import prisma from '../../config/prisma.js';

export async function globalSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, results: { assets: [], workOrders: [], stocktakes: [], employees: [] } });
    }

    const queryStr = q.trim();

    const assetScope = req.dataScopeFilter || {};
    const [assets, workOrders, stocktakes, employees] = await Promise.all([
      prisma.asset.findMany({
        where: {
          ...assetScope,
          OR: [
            { assetId: { contains: queryStr } },
            { tagNumber: { contains: queryStr } },
            { barcode: { contains: queryStr } },
            { rfidEpc: { contains: queryStr } },
            { serialNumber: { contains: queryStr } },
            { description: { contains: queryStr } },
            { hostname: { contains: queryStr } },
            { site: { is: { name: { contains: queryStr } } } },
            { category: { is: { name: { contains: queryStr } } } }
          ]
        },
        select: { id: true, assetId: true, description: true, tagNumber: true, barcode: true, serialNumber: true, lifecycleStatus: true, site: { select: { name: true } }, category: { select: { name: true } } },
        orderBy: { assetId: 'asc' },
        take: 20
      }),
      prisma.maintenanceWorkOrder.findMany({
        where: {
          asset: { is: assetScope },
          OR: [
            { workOrderNumber: { contains: queryStr } },
            { description: { contains: queryStr } }
          ]
        },
        take: 5
      }),
      prisma.stocktakeCampaign.findMany({
        where: {
          ...assetScope,
          OR: [
            { campaignNumber: { contains: queryStr } },
            { title: { contains: queryStr } }
          ]
        },
        take: 5
      }),
      prisma.employee.findMany({
        where: {
          ...assetScope,
          OR: [
            { fullName: { contains: queryStr } },
            { employeeCode: { contains: queryStr } },
            { email: { contains: queryStr } }
          ]
        },
        take: 5
      })
    ]);

    res.json({
      success: true,
      results: { assets, workOrders, stocktakes, employees }
    });
  } catch (err) { next(err); }
}
