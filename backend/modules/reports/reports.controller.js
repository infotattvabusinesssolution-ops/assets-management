import { Asset } from '../../models/Asset.js';
import { MaintenanceWorkOrder } from '../../models/MaintenanceWorkOrder.js';
import { StocktakeCampaign } from '../../models/StocktakeCampaign.js';
import { DiscoveryMatch } from '../../models/DiscoveryMatch.js';
import { Warranty } from '../../models/Warranty.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';

export async function getDashboardKpis(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const baseFilter = { ...scopeFilter, active: true };

    const [
      totalAssets,
      activeAssets,
      missingAssets,
      underMaintenance,
      disposedAssets,
      valueAggregation,
      maintenanceOverdue,
      warrantiesExpiring,
      discoveryAnomalies
    ] = await Promise.all([
      Asset.countDocuments(baseFilter),
      Asset.countDocuments({ ...scopeFilter, active: true, lifecycleStatus: { $in: ['IN_SERVICE', 'ASSIGNED', 'TAGGED', 'IN_STORE', 'OPERATIONAL'] } }),
      Asset.countDocuments({ ...scopeFilter, lifecycleStatus: { $in: ['MISSING', 'LOST_STOLEN'] } }),
      Asset.countDocuments({ ...scopeFilter, active: true, lifecycleStatus: 'UNDER_MAINTENANCE' }),
      Asset.countDocuments({ ...scopeFilter, lifecycleStatus: { $in: ['DISPOSED', 'RETIRED'] } }),
      Asset.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, totalValue: { $sum: { $toDouble: '$acquisitionValue' } } } }
      ]),
      MaintenanceWorkOrder.countDocuments({ status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } }),
      Warranty.countDocuments({ endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }),
      DiscoveryMatch.countDocuments({ status: { $in: ['UNKNOWN', 'CONFLICT'] } })
    ]);

    const totalAssetValue = valueAggregation[0]?.totalValue || 0;

    res.json({
      success: true,
      kpis: {
        totalAssets,
        activeAssets,
        missingAssets,
        underMaintenance,
        disposedAssets,
        totalAssetValue,
        maintenanceOverdue,
        warrantiesExpiring,
        discoveryAnomalies
      }
    });
  } catch (err) { next(err); }
}

// 1. Master Asset Register Report
export async function getAssetRegisterReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId, categoryId, lifecycleStatus, fromDate, toDate } = req.query;

    const filter = { ...scopeFilter, active: true };
    if (siteId) filter.siteId = siteId;
    if (categoryId) filter.categoryId = categoryId;
    if (lifecycleStatus) filter.lifecycleStatus = lifecycleStatus;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const assets = await Asset.find(filter)
      .populate('categoryId', 'name code')
      .populate('companyId', 'name')
      .populate('siteId', 'name code')
      .populate('departmentId', 'name')
      .populate('custodianId', 'firstName lastName employeeCode email')
      .sort({ assetId: 1 })
      .limit(1000);

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 2. Asset Movement & Transfer History Report
export async function getMovementReport(req, res, next) {
  try {
    const { fromDate, toDate, transactionType } = req.query;
    const filter = {};
    if (transactionType) filter.transactionType = transactionType;
    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate);
    }

    const transactions = await AssetTransaction.find(filter)
      .populate({
        path: 'assetId',
        select: 'assetId description tagNumber categoryId siteId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'siteId', select: 'name' }
        ]
      })
      .populate('performedBy', 'username firstName lastName')
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json({ success: true, count: transactions.length, report: transactions });
  } catch (err) { next(err); }
}

// 3. Custodian & Employee Asset Allocation Report
export async function getCustodyReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId, categoryId } = req.query;

    const filter = { ...scopeFilter, custodianId: { $ne: null }, active: true };
    if (siteId) filter.siteId = siteId;
    if (categoryId) filter.categoryId = categoryId;

    const assets = await Asset.find(filter)
      .populate('custodianId', 'firstName lastName employeeCode department email')
      .populate('categoryId', 'name code')
      .populate('siteId', 'name code')
      .populate('departmentId', 'name')
      .sort({ assignedDate: -1 });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 4. Site & Location Distribution Report
export async function getLocationDistributionReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId } = req.query;

    const filter = { ...scopeFilter, active: true };
    if (siteId) filter.siteId = siteId;

    const assets = await Asset.find(filter)
      .populate('siteId', 'name code')
      .populate('buildingId', 'name')
      .populate('floorId', 'name')
      .populate('roomId', 'name')
      .populate('categoryId', 'name')
      .sort({ siteId: 1, buildingId: 1 });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 5. Depreciation & Net Book Value Report
export async function getDepreciationReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { categoryId, siteId } = req.query;

    const filter = { ...scopeFilter, active: true };
    if (categoryId) filter.categoryId = categoryId;
    if (siteId) filter.siteId = siteId;

    const assets = await Asset.find(filter)
      .populate('categoryId', 'name code')
      .populate('siteId', 'name code');

    const reportData = assets.map(a => {
      const cost = Number(a.acquisitionValue || 0);
      const purchaseDate = a.purchaseDate || a.inServiceDate || a.createdAt;
      const yearsInService = purchaseDate ? Math.max(0, (new Date() - new Date(purchaseDate)) / (365.25 * 24 * 3600 * 1000)) : 0;
      const usefulLife = 5;
      const annualDep = usefulLife > 0 ? cost / usefulLife : 0;
      const accumDep = Math.min(cost, annualDep * yearsInService);
      const netBookValue = Math.max(0, cost - accumDep);

      return {
        _id: a._id,
        assetId: a.assetId,
        description: a.description,
        categoryName: a.categoryId?.name || 'Unassigned',
        siteName: a.siteId?.name || 'N/A',
        acquisitionDate: purchaseDate,
        acquisitionValue: cost,
        usefulLifeYears: usefulLife,
        accumulatedDepreciation: Math.round(accumDep * 100) / 100,
        netBookValue: Math.round(netBookValue * 100) / 100,
        lifecycleStatus: a.lifecycleStatus
      };
    });

    res.json({ success: true, count: reportData.length, report: reportData });
  } catch (err) { next(err); }
}

// 6. Missing & Exception Alerts Report
export async function getExceptionsReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const filter = { ...scopeFilter, lifecycleStatus: { $in: ['MISSING', 'LOST_STOLEN', 'DAMAGED', 'UNSERVICEABLE'] } };

    const assets = await Asset.find(filter)
      .populate('categoryId', 'name')
      .populate('siteId', 'name')
      .populate('custodianId', 'firstName lastName email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 7. IT Network Discovery Reconciliation Report
export async function getDiscoveryReport(req, res, next) {
  try {
    const matches = await DiscoveryMatch.find()
      .populate('observationId')
      .populate({
        path: 'matchedAssetId',
        select: 'assetId description tagNumber categoryId siteId hostname ipAddress macAddress',
        populate: { path: 'siteId', select: 'name' }
      })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, count: matches.length, report: matches });
  } catch (err) { next(err); }
}

// 8. Maintenance History & Cost Log Report
export async function getMaintenanceReport(req, res, next) {
  try {
    const { status, workType, fromDate, toDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (workType) filter.workType = workType;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const workOrders = await MaintenanceWorkOrder.find(filter)
      .populate('assetId', 'assetId description tagNumber siteId categoryId')
      .populate('assignedTechnicianId', 'firstName lastName username')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: workOrders.length, report: workOrders });
  } catch (err) { next(err); }
}

// 9. Warranty & SLA Expiry Schedule Report
export async function getWarrantyReport(req, res, next) {
  try {
    const { fromDate, toDate } = req.query;
    const filter = {};
    if (fromDate || toDate) {
      filter.endDate = {};
      if (fromDate) filter.endDate.$gte = new Date(fromDate);
      if (toDate) filter.endDate.$lte = new Date(toDate);
    }

    const warranties = await Warranty.find(filter)
      .populate({
        path: 'assetId',
        select: 'assetId description tagNumber categoryId siteId supplierName',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'siteId', select: 'name' }
        ]
      })
      .sort({ endDate: 1 });

    res.json({ success: true, count: warranties.length, report: warranties });
  } catch (err) { next(err); }
}

// 10. Disposed Asset Gain/Loss Summary Report
export async function getDisposalReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const filter = { ...scopeFilter, lifecycleStatus: { $in: ['DISPOSED', 'RETIRED'] } };

    const assets = await Asset.find(filter)
      .populate('categoryId', 'name')
      .populate('siteId', 'name')
      .populate('companyId', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}
