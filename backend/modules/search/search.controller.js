import prisma from '../../config/prisma.js';

export async function globalSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, results: { assets: [], workOrders: [], stocktakes: [], employees: [] } });
    }

    const queryStr = q.trim();

    const [assets, workOrders, stocktakes, employees] = await Promise.all([
      prisma.asset.findMany({
        where: {
          OR: [
            { assetId: { contains: queryStr } },
            { tagNumber: { contains: queryStr } },
            { serialNumber: { contains: queryStr } },
            { description: { contains: queryStr } },
            { hostname: { contains: queryStr } }
          ]
        },
        take: 10
      }),
      prisma.maintenanceWorkOrder.findMany({
        where: {
          OR: [
            { workOrderNumber: { contains: queryStr } },
            { description: { contains: queryStr } }
          ]
        },
        take: 5
      }),
      prisma.stocktakeCampaign.findMany({
        where: {
          OR: [
            { campaignNumber: { contains: queryStr } },
            { title: { contains: queryStr } }
          ]
        },
        take: 5
      }),
      prisma.employee.findMany({
        where: {
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
