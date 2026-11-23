import prisma from '../../config/prisma.js';

export async function getDashboardKpis(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const baseFilter = { ...scopeFilter, active: true };
    const { timeRange = '1Y' } = req.query;

    const [
      totalAssets,
      activeAssets,
      missingAssets,
      underMaintenance,
      disposedAssets,
      valueAggregation,
      maintenanceOverdue,
      warrantiesExpiring,
      discoveryAnomalies,
      totalUsers,
      totalReceipts,
      totalFloorMaps,
      totalWorkOrders,
      totalContracts
    ] = await Promise.all([
      prisma.asset.count({ where: baseFilter }).catch(() => 0),
      prisma.asset.count({
        where: {
          ...scopeFilter,
          active: true,
          lifecycleStatus: { in: ['IN_SERVICE', 'ASSIGNED', 'TAGGED', 'IN_STORE'] }
        }
      }).catch(() => 0),
      prisma.asset.count({
        where: {
          ...scopeFilter,
          lifecycleStatus: { in: ['MISSING', 'LOST_STOLEN'] }
        }
      }).catch(() => 0),
      prisma.asset.count({
        where: {
          ...scopeFilter,
          active: true,
          lifecycleStatus: 'UNDER_MAINTENANCE'
        }
      }).catch(() => 0),
      prisma.asset.count({
        where: {
          ...scopeFilter,
          lifecycleStatus: { in: ['DISPOSED', 'RETIRED'] }
        }
      }).catch(() => 0),
      prisma.asset.aggregate({
        _sum: { acquisitionValue: true },
        where: baseFilter
      }).catch(() => ({ _sum: { acquisitionValue: 0 } })),
      prisma.maintenanceWorkOrder.count({
        where: {
          status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
          ...(scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {})
        }
      }).catch(() => 0),
      prisma.warranty.count({
        where: {
          endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          ...(scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {})
        }
      }).catch(() => 0),
      prisma.discoveryMatch.count({
        where: {
          status: { in: ['UNKNOWN', 'CONFLICT'] },
          ...(scopeFilter.companyId ? { matchedAsset: { companyId: scopeFilter.companyId } } : {})
        }
      }).catch(() => 0),
      prisma.user.count({ where: { active: true, ...(scopeFilter.companyId ? { companyId: scopeFilter.companyId } : {}) } }).catch(() => 0),
      prisma.receipt.count({ where: scopeFilter.companyId ? { companyId: scopeFilter.companyId } : {} }).catch(() => 0),
      prisma.floorMap.count({
        where: {
          active: true,
          ...(scopeFilter.companyId ? { floor: { building: { site: { companyId: scopeFilter.companyId } } } } : {})
        }
      }).catch(() => 0),
      prisma.maintenanceWorkOrder.count({ where: scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {} }).catch(() => 0),
      prisma.contract.count({
        where: {
          active: true,
          ...(scopeFilter.companyId ? { coveredAssets: { some: { asset: { companyId: scopeFilter.companyId } } } } : {})
        }
      }).catch(() => 0)
    ]);

    const totalAssetValue = Number(valueAggregation._sum.acquisitionValue || 0);

    // 1. Status Breakdown Counts
    const rawStatusCounts = await prisma.asset.groupBy({
      by: ['lifecycleStatus'],
      _count: { _all: true },
      where: baseFilter
    }).catch(() => []);
    const statusCounts = {};
    rawStatusCounts.forEach(s => {
      statusCounts[s.lifecycleStatus] = s._count._all;
    });

    // 2. Category Distribution & Data
    const rawCatCounts = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
      where: baseFilter
    }).catch(() => []);
    const categoryIds = rawCatCounts.map(c => c.categoryId).filter(Boolean);
    const categories = categoryIds.length > 0
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } } }).catch(() => [])
      : [];
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const categoryCounts = rawCatCounts.map(c => ({
      name: catMap[c.categoryId] || 'General Inventory',
      count: c._count._all
    }));
    const categoryData = rawCatCounts.map(c => {
      const val = c._count._all;
      const pct = totalAssets > 0 ? `${((val / totalAssets) * 100).toFixed(1)}%` : '0%';
      return {
        name: catMap[c.categoryId] || 'General Inventory',
        value: val,
        percentage: pct
      };
    });

    // 3. Location / Site Breakdown
    const rawLocCounts = await prisma.asset.groupBy({
      by: ['siteId'],
      _count: { _all: true },
      where: baseFilter
    }).catch(() => []);
    const siteIds = rawLocCounts.map(l => l.siteId).filter(Boolean);
    const sites = siteIds.length > 0
      ? await prisma.site.findMany({ where: { id: { in: siteIds } } }).catch(() => [])
      : [];
    const siteMap = Object.fromEntries(sites.map(s => [s.id, s.name || s.code]));
    const locationData = rawLocCounts.map(l => ({
      name: siteMap[l.siteId] || 'Unassigned Location',
      count: l._count._all
    }));

    // 4. Maintenance Status Breakdown
    const plannedWorkOrders = await prisma.maintenanceWorkOrder.count({
      where: { status: 'SCHEDULED' }
    }).catch(() => 0);
    const maintTotal = (activeAssets + underMaintenance + maintenanceOverdue + plannedWorkOrders) || 1;
    const maintenanceStatusData = [
      { name: 'In Use', value: activeAssets, percentage: `${((activeAssets / maintTotal) * 100).toFixed(1)}%` },
      { name: 'Under Maintenance', value: underMaintenance, percentage: `${((underMaintenance / maintTotal) * 100).toFixed(1)}%` },
      { name: 'Overdue', value: maintenanceOverdue, percentage: `${((maintenanceOverdue / maintTotal) * 100).toFixed(1)}%` },
      { name: 'Planned', value: plannedWorkOrders, percentage: `${((plannedWorkOrders / maintTotal) * 100).toFixed(1)}%` }
    ];

    // 5. Recent Activities Feed
    const rawTransactions = await prisma.assetTransaction.findMany({
      take: 8,
      orderBy: { timestamp: 'desc' },
      where: scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {},
      include: {
        asset: { select: { assetId: true, description: true } },
        performedBy: { select: { fullName: true, username: true } }
      }
    }).catch(() => []);

    const formatRelativeTime = (date) => {
      if (!date) return 'Recently';
      const diffMs = Date.now() - new Date(date).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    };

    const recentActivities = rawTransactions.map(tx => ({
      id: tx.id,
      title: (tx.transactionType || 'TRANSACTION').replace(/_/g, ' '),
      detail: `${tx.asset?.assetId ? tx.asset.assetId + ' - ' : ''}${tx.asset?.description || 'Asset'}`,
      user: tx.performedBy?.fullName || tx.performedBy?.username || 'System User',
      time: formatRelativeTime(tx.timestamp),
      status: tx.toStatus || 'COMPLETED',
      color: 'text-purple-600 bg-purple-50'
    }));

    // 6. Monthly Trend Buckets
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendBuckets = [];
    for (let i = 8; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      trendBuckets.push({
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        label: months[d.getMonth()],
        acquisitions: 0,
        capex: 0,
        netBookValue: 0
      });
    }

    const allAssetsForTrend = await prisma.asset.findMany({
      where: baseFilter,
      select: { createdAt: true, acquisitionValue: true }
    }).catch(() => []);

    allAssetsForTrend.forEach(a => {
      const aDate = new Date(a.createdAt);
      const bucket = trendBuckets.find(b => b.year === aDate.getFullYear() && b.monthNum === aDate.getMonth());
      if (bucket) {
        bucket.acquisitions += 1;
        bucket.capex += Math.round(Number(a.acquisitionValue || 0) / 1000);
      }
    });

    let accumNbv = 0;
    const financialTrend = trendBuckets.map(b => {
      accumNbv += b.capex;
      return {
        month: b.label,
        netBookValue: accumNbv,
        capex: b.capex,
        opex: Math.round(b.capex * 0.1)
      };
    });

    // 7. Movement Trend Data (Past 9 Months)
    const movementTrendData = trendBuckets.map(b => ({
      month: b.label,
      assigned: 0,
      transferred: 0,
      returned: 0
    }));
    rawTransactions.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      const b = movementTrendData.find(m => {
        const bucket = trendBuckets.find(tb => tb.label === m.month);
        return bucket && bucket.year === txDate.getFullYear() && bucket.monthNum === txDate.getMonth();
      });
      if (b) {
        const type = (tx.transactionType || '').toUpperCase();
        if (type.includes('ASSIGN')) b.assigned += 1;
        else if (type.includes('TRANSFER') || type.includes('MOVE')) b.transferred += 1;
        else if (type.includes('RETURN') || type.includes('CHECKIN')) b.returned += 1;
      }
    });

    // 8. Top 5 Asset Categories / Types
    const topAssetTypes = categoryCounts.slice(0, 5);

    // 9. Warranty Expiry (Next 6 Months)
    const warrantyExpiryData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      warrantyExpiryData.push({
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        month: months[d.getMonth()],
        count: 0
      });
    }
    const rawWarranties = await prisma.warranty.findMany({
      where: {
        endDate: {
          gte: new Date(),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 0)
        }
      },
      select: { endDate: true }
    }).catch(() => []);
    rawWarranties.forEach(w => {
      if (w.endDate) {
        const wDate = new Date(w.endDate);
        const b = warrantyExpiryData.find(m => m.year === wDate.getFullYear() && m.monthNum === wDate.getMonth());
        if (b) b.count += 1;
      }
    });

    // 10. Condition Distribution
    const rawCondCounts = await prisma.asset.groupBy({
      by: ['condition'],
      _count: { _all: true },
      where: baseFilter
    }).catch(() => []);
    const conditionData = rawCondCounts.map(c => {
      const val = c._count._all;
      const pct = totalAssets > 0 ? `${((val / totalAssets) * 100).toFixed(1)}%` : '0%';
      return {
        name: c.condition || 'GOOD',
        value: val,
        percentage: pct
      };
    });

    // 11. Upcoming Maintenance Work Orders
    const rawUpcomingWO = await prisma.maintenanceWorkOrder.findMany({
      where: {
        status: { in: ['OPEN', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS'] },
        ...(scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {})
      },
      take: 5,
      orderBy: { scheduledDate: 'asc' },
      include: {
        asset: { select: { assetId: true, description: true, site: { select: { name: true } } } }
      }
    }).catch(() => []);
    const upcomingMaintenance = rawUpcomingWO.map(wo => {
      const sDate = wo.scheduledDate || wo.dueDate || wo.createdAt;
      const dateTag = sDate ? new Date(sDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Pending';
      return {
        id: wo.id,
        dateTag,
        dateColor: 'bg-purple-100 text-purple-700',
        code: wo.workOrderNumber || wo.asset?.assetId || 'WO-SCHEDULED',
        title: wo.title || 'Inspection & Service',
        location: wo.asset?.site?.name || 'Assigned Facility'
      };
    });

    // 12. Real System Alerts
    const alerts = [];
    if (maintenanceOverdue > 0) {
      alerts.push({ id: 'alert-overdue', type: 'danger', text: `${maintenanceOverdue} asset(s) are overdue for maintenance` });
    }
    if (warrantiesExpiring > 0) {
      alerts.push({ id: 'alert-warranty', type: 'warning', text: `${warrantiesExpiring} asset(s) with warranty expiring in 30 days` });
    }
    if (missingAssets > 0) {
      alerts.push({ id: 'alert-missing', type: 'danger', text: `${missingAssets} asset(s) reported missing or lost` });
    }
    if (underMaintenance > 0) {
      alerts.push({ id: 'alert-maint', type: 'info', text: `${underMaintenance} asset(s) currently under active maintenance` });
    }
    if (discoveryAnomalies > 0) {
      alerts.push({ id: 'alert-disc', type: 'warning', text: `${discoveryAnomalies} unverified discovery candidate(s) detected` });
    }

    // 13. Other Telemetry Counts
    const companySites = scopeFilter.companyId ? await prisma.site.findMany({ where: { companyId: scopeFilter.companyId }, select: { id: true } }).catch(() => []) : [];
    const companySiteIds = companySites.map(s => s.id);
    const readerWhere = scopeFilter.companyId ? { siteId: { in: companySiteIds } } : {};
    const activeReadersCount = await prisma.rtlsReader.count({ where: { status: 'ONLINE', ...readerWhere } }).catch(() => 0);
    const totalReadersCount = await prisma.rtlsReader.count({ where: readerWhere }).catch(() => 0);
    const activeFloorMapsCount = await prisma.floorMap.count({
      where: {
        active: true,
        ...(scopeFilter.companyId ? { floor: { building: { site: { companyId: scopeFilter.companyId } } } } : {})
      }
    }).catch(() => 0);
    const activeWorkOrdersCount = await prisma.maintenanceWorkOrder.count({
      where: {
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
        ...(scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {})
      }
    }).catch(() => 0);

    // 14. Work Order SLA Trend Data
    const rawWorkOrders = await prisma.maintenanceWorkOrder.findMany({
      take: 100,
      where: scopeFilter.companyId ? { asset: { companyId: scopeFilter.companyId } } : {},
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);
    const woTrendMap = {};
    rawWorkOrders.forEach(wo => {
      const m = months[new Date(wo.createdAt).getMonth()];
      if (!woTrendMap[m]) woTrendMap[m] = { completed: 0, overdue: 0, preventive: 0 };
      if (['COMPLETED', 'VERIFIED'].includes(wo.status)) woTrendMap[m].completed += 1;
      if (['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status)) woTrendMap[m].overdue += 1;
      if (wo.workType === 'PREVENTIVE') woTrendMap[m].preventive += 1;
    });

    const workOrderSlaTrend = trendBuckets.slice(-7).map(b => ({
      month: b.label,
      completed: woTrendMap[b.label]?.completed || 0,
      overdue: woTrendMap[b.label]?.overdue || 0,
      preventive: woTrendMap[b.label]?.preventive || 0
    }));

    const analyticsTrend = trendBuckets.map(b => ({
      month: b.label,
      acquisitions: b.acquisitions,
      netBookValue: b.capex
    }));

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
        discoveryAnomalies,
        totalUsers,
        totalReceipts,
        totalFloorMaps,
        totalWorkOrders,
        totalContracts,
        statusCounts,
        categoryCounts,
        categoryData,
        locationData,
        maintenanceStatusData,
        movementTrendData,
        topAssetTypes,
        warrantyExpiryData,
        conditionData,
        financialTrend,
        recentActivities,
        upcomingMaintenance,
        alerts,
        activeReadersCount,
        totalReadersCount,
        activeFloorMapsCount,
        activeWorkOrdersCount,
        analyticsTrend,
        workOrderSlaTrend
      }
    });
  } catch (err) { next(err); }
}

// 1. Master Asset Register Report
export async function getAssetRegisterReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId, categoryId, lifecycleStatus, fromDate, toDate } = req.query;

    const where = { ...scopeFilter, active: true };
    if (siteId) where.siteId = siteId;
    if (categoryId) where.categoryId = categoryId;
    if (lifecycleStatus) where.lifecycleStatus = lifecycleStatus;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true, code: true } },
        company: { select: { name: true } },
        site: { select: { name: true, code: true } },
        department: { select: { name: true } },
        custodian: { select: { fullName: true, employeeCode: true, email: true } }
      },
      orderBy: { assetId: 'asc' },
      take: 1000
    });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 2. Asset Movement & Transfer History Report
export async function getMovementReport(req, res, next) {
  try {
    const { fromDate, toDate, transactionType } = req.query;
    const where = {};
    if (transactionType) where.transactionType = transactionType;
    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = new Date(fromDate);
      if (toDate) where.timestamp.lte = new Date(toDate);
    }

    const transactions = await prisma.assetTransaction.findMany({
      where,
      include: {
        asset: {
          select: {
            assetId: true,
            description: true,
            tagNumber: true,
            category: { select: { name: true } },
            site: { select: { name: true } }
          }
        },
        performedBy: { select: { username: true, fullName: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    res.json({ success: true, count: transactions.length, report: transactions });
  } catch (err) { next(err); }
}

// 3. Custodian & Employee Asset Allocation Report
export async function getCustodyReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId, categoryId } = req.query;

    const where = { ...scopeFilter, custodianId: { not: null }, active: true };
    if (siteId) where.siteId = siteId;
    if (categoryId) where.categoryId = categoryId;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        custodian: { select: { fullName: true, employeeCode: true, email: true } },
        category: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
        department: { select: { name: true } }
      },
      orderBy: { assignedDate: 'desc' }
    });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 4. Site & Location Distribution Report
export async function getLocationDistributionReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { siteId } = req.query;

    const where = { ...scopeFilter, active: true };
    if (siteId) where.siteId = siteId;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        site: { select: { name: true, code: true } },
        building: { select: { name: true } },
        floor: { select: { name: true } },
        room: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: [{ siteId: 'asc' }, { buildingId: 'asc' }]
    });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 5. Depreciation & Net Book Value Report
export async function getDepreciationReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const { categoryId, siteId } = req.query;

    const where = { ...scopeFilter, active: true };
    if (categoryId) where.categoryId = categoryId;
    if (siteId) where.siteId = siteId;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true, code: true, annualDepreciationRatePercent: true, defaultUsefulLifeMonths: true } },
        site: { select: { name: true, code: true } },
        bookValues: { where: { bookType: 'CORPORATE' }, take: 1 }
      }
    });

    const reportData = assets.map(a => {
      const book = a.bookValues?.[0];
      const cost = Number(book?.capitalizationValue ?? a.acquisitionValue ?? 0);
      const purchaseDate = book?.capitalizationDate || a.purchaseDate || a.inServiceDate || a.createdAt;
      const usefulLifeMonths = book?.usefulLifeMonths || a.category?.defaultUsefulLifeMonths || 60;
      const annualRatePercent = Number(book?.annualDepreciationRatePercent ?? a.category?.annualDepreciationRatePercent ?? 0);
      const accumDep = Number(book?.accumulatedDepreciation || 0);
      const netBookValue = Number(book?.netBookValue ?? cost);

      return {
        id: a.id,
        assetId: a.assetId,
        description: a.description,
        categoryName: a.category?.name || 'Unassigned',
        siteName: a.site?.name || 'N/A',
        acquisitionDate: purchaseDate,
        acquisitionValue: cost,
        usefulLifeYears: usefulLifeMonths / 12,
        annualDepreciationRatePercent: annualRatePercent,
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
    const where = {
      ...scopeFilter,
      lifecycleStatus: { in: ['MISSING', 'LOST_STOLEN', 'DAMAGED', 'UNSERVICEABLE'] }
    };

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true } },
        site: { select: { name: true } },
        custodian: { select: { fullName: true, email: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}

// 7. IT Network Discovery Reconciliation Report
export async function getDiscoveryReport(req, res, next) {
  try {
    const matches = await prisma.discoveryMatch.findMany({
      include: {
        observation: true,
        matchedAsset: {
          select: {
            assetId: true,
            description: true,
            tagNumber: true,
            hostname: true,
            ipAddress: true,
            macAddress: true,
            site: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    res.json({ success: true, count: matches.length, report: matches });
  } catch (err) { next(err); }
}

// 8. Maintenance History & Cost Log Report
export async function getMaintenanceReport(req, res, next) {
  try {
    const { status, workType, fromDate, toDate } = req.query;
    const where = {};
    if (status) where.status = status;
    if (workType) where.workType = workType;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const workOrders = await prisma.maintenanceWorkOrder.findMany({
      where,
      include: {
        asset: { select: { assetId: true, description: true, tagNumber: true } },
        assignedTechnician: { select: { fullName: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: workOrders.length, report: workOrders });
  } catch (err) { next(err); }
}

// 9. Warranty & SLA Expiry Schedule Report
export async function getWarrantyReport(req, res, next) {
  try {
    const { fromDate, toDate } = req.query;
    const where = {};
    if (fromDate || toDate) {
      where.endDate = {};
      if (fromDate) where.endDate.gte = new Date(fromDate);
      if (toDate) where.endDate.lte = new Date(toDate);
    }

    const warranties = await prisma.warranty.findMany({
      where,
      include: {
        asset: {
          select: {
            assetId: true,
            description: true,
            tagNumber: true,
            supplierName: true,
            category: { select: { name: true } },
            site: { select: { name: true } }
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });

    res.json({ success: true, count: warranties.length, report: warranties });
  } catch (err) { next(err); }
}

// 10. Disposed Asset Gain/Loss Summary Report
export async function getDisposalReport(req, res, next) {
  try {
    const scopeFilter = req.dataScopeFilter || {};
    const where = { ...scopeFilter, lifecycleStatus: { in: ['DISPOSED', 'RETIRED'] } };

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true } },
        site: { select: { name: true } },
        company: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, count: assets.length, report: assets });
  } catch (err) { next(err); }
}
