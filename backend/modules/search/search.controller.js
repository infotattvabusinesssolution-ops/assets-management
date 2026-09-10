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
            { assetId: { contains: queryStr, mode: 'insensitive' } },
            { tagNumber: { contains: queryStr, mode: 'insensitive' } },
            { serialNumber: { contains: queryStr, mode: 'insensitive' } },
            { description: { contains: queryStr, mode: 'insensitive' } },
            { hostname: { contains: queryStr, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      prisma.maintenanceWorkOrder.findMany({
        where: {
          OR: [
            { workOrderNumber: { contains: queryStr, mode: 'insensitive' } },
            { description: { contains: queryStr, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.stocktakeCampaign.findMany({
        where: {
          OR: [
            { campaignNumber: { contains: queryStr, mode: 'insensitive' } },
            { title: { contains: queryStr, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.employee.findMany({
        where: {
          OR: [
            { fullName: { contains: queryStr, mode: 'insensitive' } },
            { employeeCode: { contains: queryStr, mode: 'insensitive' } },
            { email: { contains: queryStr, mode: 'insensitive' } }
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
