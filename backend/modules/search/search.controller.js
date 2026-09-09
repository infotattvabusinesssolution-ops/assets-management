import { Asset } from '../../models/Asset.js';
import { MaintenanceWorkOrder } from '../../models/MaintenanceWorkOrder.js';
import { StocktakeCampaign } from '../../models/StocktakeCampaign.js';
import { Employee } from '../../models/Employee.js';

export async function globalSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, results: { assets: [], workOrders: [], stocktakes: [], employees: [] } });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [assets, workOrders, stocktakes, employees] = await Promise.all([
      Asset.find({
        $or: [
          { assetId: regex },
          { tagNumber: regex },
          { serialNumber: regex },
          { description: regex },
          { hostname: regex }
        ]
      }).limit(10),
      MaintenanceWorkOrder.find({
        $or: [
          { workOrderNumber: regex },
          { description: regex }
        ]
      }).limit(5),
      StocktakeCampaign.find({
        $or: [
          { campaignNumber: regex },
          { title: regex }
        ]
      }).limit(5),
      Employee.find({
        $or: [
          { fullName: regex },
          { employeeCode: regex },
          { email: regex }
        ]
      }).limit(5)
    ]);

    res.json({
      success: true,
      results: { assets, workOrders, stocktakes, employees }
    });
  } catch (err) { next(err); }
}
