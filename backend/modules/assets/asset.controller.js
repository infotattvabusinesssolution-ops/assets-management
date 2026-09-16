import prisma from '../../config/prisma.js';

export const ASSET_STATUSES = [
  'REQUESTED',
  'ORDERED',
  'RECEIVED',
  'TAGGED',
  'IN_STORE',
  'IN_SERVICE',
  'ASSIGNED',
  'IN_TRANSIT',
  'UNDER_MAINTENANCE',
  'MISSING',
  'LOST_STOLEN',
  'DAMAGED',
  'RETIRED',
  'DISPOSED'
];

export async function getAssets(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      categoryId,
      siteId,
      companyId,
      custodianId,
      condition,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = { ...req.dataScopeFilter };

    if (search) {
      where.OR = [
        { assetId: { contains: search, mode: 'insensitive' } },
        { tagNumber: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { hostname: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.lifecycleStatus = status;
    if (categoryId) where.categoryId = categoryId;
    if (siteId) where.siteId = siteId;
    if (companyId) where.companyId = companyId;
    if (custodianId) where.custodianId = custodianId;
    if (condition) where.condition = condition;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true,
          company: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          custodian: true,
          manufacturer: true,
          model: true
        },
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        skip,
        take
      }),
      prisma.asset.count({ where })
    ]);

    res.json({
      success: true,
      assets,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getAsset360(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        assetClass: true,
        company: true,
        site: true,
        building: true,
        floor: true,
        room: true,
        zone: true,
        department: true,
        costCenter: true,
        custodian: true,
        manufacturer: true,
        model: true,
        parentAsset: true
      }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const [
      bookValues,
      transactions,
      workOrders,
      stocktakeObservations,
      mapPosition,
      discoveryMatch,
      warranty,
      auditEvents
    ] = await Promise.all([
      prisma.assetBookValue.findMany({ where: { assetId: asset.id } }),
      prisma.assetTransaction.findMany({
        where: { assetId: asset.id },
        include: { performedBy: true },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.maintenanceWorkOrder.findMany({
        where: { assetId: asset.id },
        include: { assignedTechnician: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stocktakeObservation.findMany({
        where: { assetId: asset.id },
        include: { campaign: true, observedCustodian: true },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.assetMapPosition.findFirst({
        where: { assetId: asset.id, active: true },
        include: { floorMap: true }
      }),
      prisma.discoveryMatch.findFirst({
        where: { matchedAssetId: asset.id },
        include: { observation: true }
      }),
      prisma.warranty.findUnique({ where: { assetId: asset.id } }),
      prisma.auditEvent.findMany({
        where: { entityId: asset.id },
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: 50
      })
    ]);

    res.json({
      success: true,
      asset360: {
        asset,
        bookValues,
        transactions,
        workOrders,
        stocktakeObservations,
        mapPosition,
        discoveryMatch,
        warranty,
        auditEvents
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createAsset(req, res, next) {
  try {
    let { categoryId, companyId, siteId } = req.body;

    // Resolve categoryId if code passed or missing
    let category = null;
    if (categoryId) {
      category = await prisma.category.findFirst({
        where: { OR: [{ id: categoryId }, { code: categoryId }] }
      });
    }
    if (!category) {
      category = await prisma.category.findFirst({ where: { active: true } });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Please create an Asset Category in Master Data first.' });
    }
    categoryId = category.id;

    // Resolve companyId if code passed or missing
    let company = null;
    if (companyId) {
      company = await prisma.company.findFirst({
        where: { OR: [{ id: companyId }, { code: companyId }] }
      });
    }
    if (!company) {
      company = await prisma.company.findFirst({ where: { active: true } });
    }
    if (!company) {
      return res.status(400).json({ success: false, message: 'Please create a Company Entity in Master Data first.' });
    }
    companyId = company.id;

    // Resolve siteId if code passed or missing
    let site = null;
    if (siteId) {
      site = await prisma.site.findFirst({
        where: { OR: [{ id: siteId }, { code: siteId }] }
      });
    }
    if (!site) {
      site = await prisma.site.findFirst({ where: { active: true } });
    }
    if (!site) {
      return res.status(400).json({ success: false, message: 'Please create a Site Campus in Master Data first.' });
    }
    siteId = site.id;

    const result = await prisma.$transaction(async (tx) => {
      const assetId = req.body.assetId || ('AST-2026-' + Math.floor(Math.random() * 899 + 100));
      const acqValue = parseFloat(req.body.acquisitionValue) || 0;

      const newAsset = await tx.asset.create({
        data: {
          assetId,
          description: req.body.description || 'New Asset',
          categoryId,
          companyId,
          siteId,
          buildingId: req.body.buildingId || null,
          floorId: req.body.floorId || null,
          roomId: req.body.roomId || null,
          zoneId: req.body.zoneId || null,
          departmentId: req.body.departmentId || null,
          costCenterId: req.body.costCenterId || null,
          custodianId: req.body.custodianId || null,
          manufacturerId: req.body.manufacturerId || null,
          modelId: req.body.modelId || null,
          tagNumber: req.body.tagNumber || null,
          barcode: req.body.barcode || req.body.tagNumber || null,
          qrCode: req.body.qrCode || null,
          rfidEpc: req.body.rfidEpc || null,
          serialNumber: req.body.serialNumber || null,
          lifecycleStatus: req.body.lifecycleStatus || 'RECEIVED',
          condition: req.body.condition || 'NEW',
          criticality: req.body.criticality || 'MEDIUM',
          acquisitionValue: acqValue,
          currency: req.body.currency || 'USD',
          poNumber: req.body.poNumber || null,
          supplierName: req.body.supplierName || null,
          purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : null,
          inServiceDate: req.body.inServiceDate ? new Date(req.body.inServiceDate) : null,
          hostname: req.body.hostname || null,
          macAddress: req.body.macAddress || null,
          ipAddress: req.body.ipAddress || null,
          createdByUserId: req.user.id,
          updatedByUserId: req.user.id
        }
      });

      await tx.assetBookValue.create({
        data: {
          assetId: newAsset.id,
          bookType: 'CORPORATE',
          capitalizationDate: req.body.inServiceDate ? new Date(req.body.inServiceDate) : new Date(),
          capitalizationValue: acqValue,
          usefulLifeMonths: req.body.usefulLifeMonths || 60,
          depreciationMethod: 'STRAIGHT_LINE',
          residualValue: 0,
          accumulatedDepreciation: 0,
          netBookValue: acqValue
        }
      });

      await tx.assetTransaction.create({
        data: {
          assetId: newAsset.id,
          transactionType: 'RECEIVE',
          fromStatus: 'NONE',
          toStatus: newAsset.lifecycleStatus,
          performedByUserId: req.user.id,
          notes: 'Initial Asset Registration'
        }
      });

      await tx.auditEvent.create({
        data: {
          userId: req.user.id,
          action: 'ASSET_CREATE',
          entityType: 'Asset',
          entityId: newAsset.id,
          afterState: newAsset
        }
      });

      return newAsset;
    });

    res.status(201).json({ success: true, asset: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;

    // Find asset by UUID or assetId
    let oldAsset = await prisma.asset.findUnique({ where: { id } });
    if (!oldAsset) {
      oldAsset = await prisma.asset.findFirst({ where: { assetId: id } });
    }

    if (!oldAsset) {
      return res.status(404).json({ success: false, message: `Asset [${id}] not found` });
    }

    const {
      assetName,
      description,
      serialNumber,
      tagNumber,
      barcode,
      qrCode,
      rfidEpc,
      condition,
      lifecycleStatus,
      criticality,
      acquisitionValue,
      currency,
      hostname,
      ipAddress,
      macAddress,
      notes,
      requiresApproval
    } = req.body;

    // Uniqueness validation for Serial Number, Tag, Barcode, QR, RFID if changed
    if (serialNumber && serialNumber !== oldAsset.serialNumber) {
      const duplicate = await prisma.asset.findFirst({ where: { serialNumber, NOT: { id: oldAsset.id } } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Serial Number [${serialNumber}] is already assigned to asset ${duplicate.assetId}.` });
      }
    }

    if (tagNumber && tagNumber !== oldAsset.tagNumber) {
      const duplicate = await prisma.asset.findFirst({ where: { tagNumber, NOT: { id: oldAsset.id } } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Tag Number [${tagNumber}] is already assigned to asset ${duplicate.assetId}.` });
      }
    }

    if (rfidEpc && rfidEpc !== oldAsset.rfidEpc) {
      const duplicate = await prisma.asset.findFirst({ where: { rfidEpc, NOT: { id: oldAsset.id } } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `RFID EPC [${rfidEpc}] is already assigned to asset ${duplicate.assetId}.` });
      }
    }

    // Build update data
    const updateData = {};
    if (description !== undefined) updateData.description = description || assetName || oldAsset.description;
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (tagNumber !== undefined) updateData.tagNumber = tagNumber;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (qrCode !== undefined) updateData.qrCode = qrCode;
    if (rfidEpc !== undefined) updateData.rfidEpc = rfidEpc;
    if (condition !== undefined) updateData.condition = condition;
    if (lifecycleStatus !== undefined) updateData.lifecycleStatus = lifecycleStatus;
    if (criticality !== undefined) updateData.criticality = criticality;
    if (acquisitionValue !== undefined) updateData.acquisitionValue = parseFloat(acquisitionValue) || oldAsset.acquisitionValue;
    if (currency !== undefined) updateData.currency = currency;
    if (hostname !== undefined) updateData.hostname = hostname;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (macAddress !== undefined) updateData.macAddress = macAddress;
    updateData.updatedByUserId = req.user.id;

    // Detect changed fields for audit log
    const changedFields = [];
    Object.keys(updateData).forEach((key) => {
      if (key !== 'updatedByUserId' && oldAsset[key] !== updateData[key]) {
        changedFields.push({
          field: key,
          oldValue: oldAsset[key],
          newValue: updateData[key]
        });
      }
    });

    const updatedAsset = await prisma.asset.update({
      where: { id: oldAsset.id },
      data: updateData,
      include: {
        category: true,
        company: true,
        site: true,
        building: true,
        floor: true,
        room: true,
        custodian: true,
        manufacturer: true,
        model: true
      }
    });

    // Write Asset Transaction record
    await prisma.assetTransaction.create({
      data: {
        assetId: oldAsset.id,
        transactionType: 'MASTER_EDIT',
        fromStatus: oldAsset.lifecycleStatus,
        toStatus: updatedAsset.lifecycleStatus,
        performedByUserId: req.user.id,
        notes: notes || `Asset Master updated. Modified fields: ${changedFields.map(f => f.field).join(', ') || 'None'}`
      }
    });

    // Write Audit Event record
    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_EDIT_UPDATE',
        entityType: 'Asset',
        entityId: updatedAsset.id,
        beforeState: JSON.stringify(oldAsset),
        afterState: JSON.stringify(updatedAsset)
      }
    });

    res.json({
      success: true,
      message: 'Asset master information updated successfully with complete audit trail.',
      asset: updatedAsset,
      changedFields
    });
  } catch (err) {
    next(err);
  }
}

export async function transitionLifecycle(req, res, next) {
  try {
    const { id } = req.params;
    const { toStatus, notes } = req.body;

    if (!ASSET_STATUSES.includes(toStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status [${toStatus}]` });
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const fromStatus = asset.lifecycleStatus;
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        lifecycleStatus: toStatus,
        updatedByUserId: req.user.id
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: updatedAsset.id,
        transactionType: 'STATUS_CHANGE',
        fromStatus,
        toStatus,
        performedByUserId: req.user.id,
        notes: notes || `Lifecycle state changed from ${fromStatus} to ${toStatus}`
      }
    });

    res.json({ success: true, asset: updatedAsset });
  } catch (err) {
    next(err);
  }
}

export async function getMyAssets(req, res, next) {
  try {
    const userId = req.user?.id || 'usr-default';
    const employeeId = req.user?.employeeId || null;

    const {
      page = 1,
      limit = 20,
      search,
      status,
      categoryId,
      condition,
      manufacturerId,
      siteId,
      kpi,
      tab,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const baseCustodianWhere = {
      ...req.dataScopeFilter,
      OR: [
        ...(employeeId ? [{ custodianId: employeeId }] : []),
        { custodianId: userId },
        { createdByUserId: userId }
      ]
    };

    const where = { ...baseCustodianWhere };

    // KPI Card Quick Filters
    if (kpi === 'IN_USE') {
      where.lifecycleStatus = { in: ['ASSIGNED', 'IN_SERVICE', 'In Use'] };
    } else if (kpi === 'MAINTENANCE') {
      where.lifecycleStatus = { in: ['UNDER_MAINTENANCE', 'Under Maintenance'] };
    } else if (kpi === 'OVERDUE') {
      where.lifecycleStatus = { in: ['OVERDUE', 'Overdue'] };
    } else if (kpi === 'PENDING_RETURN') {
      where.lifecycleStatus = { in: ['PENDING_RETURN', 'Pending Return', 'IN_TRANSIT'] };
    }

    // Lifecycle Navigation Tab Filters
    if (tab === 'ASSIGNED') {
      where.lifecycleStatus = { in: ['ASSIGNED', 'IN_SERVICE', 'In Use', 'UNDER_MAINTENANCE', 'Under Maintenance'] };
    } else if (tab === 'MAINTENANCE') {
      where.lifecycleStatus = { in: ['UNDER_MAINTENANCE', 'Under Maintenance'] };
    } else if (tab === 'PENDING_RETURN') {
      where.lifecycleStatus = { in: ['PENDING_RETURN', 'Pending Return', 'IN_TRANSIT'] };
    } else if (tab === 'RETURNED') {
      where.lifecycleStatus = { in: ['RETURNED', 'Returned', 'RETIRED', 'DISPOSED', 'IN_STORE'] };
    } else if (tab === 'REQUESTED') {
      where.lifecycleStatus = { in: ['REQUESTED', 'Requested', 'ORDERED'] };
    }

    // Explicit field filters
    if (status && status !== 'All') where.lifecycleStatus = status;
    if (categoryId && categoryId !== 'All') where.categoryId = categoryId;
    if (condition && condition !== 'All') where.condition = condition;
    if (manufacturerId && manufacturerId !== 'All') where.manufacturerId = manufacturerId;
    if (siteId && siteId !== 'All') where.siteId = siteId;

    // Search filter across ID, name, tag, serial, barcode, QR, RFID
    if (search) {
      where.AND = [
        {
          OR: [
            { assetId: { contains: search, mode: 'insensitive' } },
            { tagNumber: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
            { qrCode: { contains: search, mode: 'insensitive' } },
            { rfidEpc: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { hostname: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    // Parallel execution for assets, total count, KPI counts, and tab counts
    const [assets, total, countInUse, countMaintenance, countOverdue, countPendingReturn, countReturned, countRequested] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true,
          company: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          custodian: true,
          manufacturer: true,
          model: true,
          custodyAssignments: {
            where: { active: true },
            take: 1
          }
        },
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        skip,
        take
      }),
      prisma.asset.count({ where }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['ASSIGNED', 'IN_SERVICE', 'In Use'] } } }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['UNDER_MAINTENANCE', 'Under Maintenance'] } } }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['OVERDUE', 'Overdue'] } } }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['PENDING_RETURN', 'Pending Return', 'IN_TRANSIT'] } } }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['RETURNED', 'Returned', 'RETIRED', 'DISPOSED', 'IN_STORE'] } } }),
      prisma.asset.count({ where: { ...baseCustodianWhere, lifecycleStatus: { in: ['REQUESTED', 'Requested', 'ORDERED'] } } })
    ]);

    const totalPortfolio = countInUse + countMaintenance + countOverdue + countPendingReturn + countReturned;

    const kpiCounts = {
      total: totalPortfolio || total || 0,
      inUse: countInUse,
      inUsePct: totalPortfolio > 0 ? `${((countInUse / totalPortfolio) * 100).toFixed(1)}%` : '0%',
      maintenance: countMaintenance,
      maintPct: totalPortfolio > 0 ? `${((countMaintenance / totalPortfolio) * 100).toFixed(1)}%` : '0%',
      overdue: countOverdue,
      overduePct: totalPortfolio > 0 ? `${((countOverdue / totalPortfolio) * 100).toFixed(1)}%` : '0%',
      pendingReturn: countPendingReturn,
      pendingPct: totalPortfolio > 0 ? `${((countPendingReturn / totalPortfolio) * 100).toFixed(1)}%` : '0%'
    };

    const tabCounts = {
      assigned: countInUse + countMaintenance,
      maintenance: countMaintenance,
      pendingReturn: countPendingReturn,
      returned: countReturned,
      requested: countRequested,
      history: totalPortfolio
    };

    res.json({
      success: true,
      assets,
      kpiCounts,
      tabCounts,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function acknowledgeAsset(req, res, next) {
  try {
    const { id } = req.params;
    const { status = 'ACKNOWLEDGED', condition, remarks } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { custodyAssignments: { where: { active: true }, take: 1 } }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const assignment = asset.custodyAssignments[0];
    if (assignment) {
      await prisma.custodyAssignment.update({
        where: { id: assignment.id },
        data: {
          acknowledged: status === 'ACKNOWLEDGED',
          acknowledgementDate: new Date(),
          conditionAtIssue: condition || asset.condition
        }
      });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        condition: condition || asset.condition,
        updatedByUserId: req.user.id
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: id,
        transactionType: status === 'ACKNOWLEDGED' ? 'CUSTODY_ACKNOWLEDGE' : 'CUSTODY_REJECT',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: req.user.id,
        notes: remarks || `Asset acknowledgement status: ${status}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: status === 'ACKNOWLEDGED' ? 'ASSET_ACKNOWLEDGE' : 'ASSET_ACKNOWLEDGE_REJECT',
        entityType: 'Asset',
        entityId: id,
        afterState: { status, condition, remarks }
      }
    });

    res.json({
      success: true,
      message: status === 'ACKNOWLEDGED' ? 'Asset receipt acknowledged successfully' : 'Discrepancy reported for asset',
      asset: updatedAsset
    });
  } catch (err) {
    next(err);
  }
}

export async function requestAssetTransfer(req, res, next) {
  try {
    const { id } = req.params;
    const { targetEmployee, targetLocation, reason, remarks } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const transferNumber = 'TRF-REQ-' + Math.floor(Math.random() * 89999 + 10000);

    const transfer = await prisma.assetTransfer.create({
      data: {
        transferNumber,
        assetId: id,
        transferType: 'SELF_SERVICE_REQUEST',
        status: 'PENDING_APPROVAL',
        reason: reason || 'Self-service transfer request',
        requestedByUserId: req.user.id
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: id,
        transactionType: 'TRANSFER_REQUESTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: req.user.id,
        notes: `Transfer requested to ${targetEmployee || 'Employee'} (${targetLocation || 'Location'}). Reason: ${reason || 'N/A'}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_TRANSFER_REQUEST',
        entityType: 'AssetTransfer',
        entityId: transfer.id,
        afterState: { transferNumber, targetEmployee, targetLocation, reason }
      }
    });

    res.json({
      success: true,
      message: 'Transfer request submitted successfully and queued for approval.',
      transfer
    });
  } catch (err) {
    next(err);
  }
}

export async function requestAssetReturn(req, res, next) {
  try {
    const { id } = req.params;
    const { reason, returnStore, condition, accessories, remarks } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        lifecycleStatus: 'PENDING_RETURN',
        condition: condition || asset.condition,
        updatedByUserId: req.user.id
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: id,
        transactionType: 'RETURN_REQUESTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: 'PENDING_RETURN',
        performedByUserId: req.user.id,
        notes: `Return initiated to store [${returnStore || 'Default Store'}]. Reason: ${reason || 'N/A'}. Condition: ${condition || asset.condition}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_RETURN_REQUEST',
        entityType: 'Asset',
        entityId: id,
        afterState: { returnStore, condition, reason, remarks }
      }
    });

    res.json({
      success: true,
      message: 'Asset return request submitted successfully.',
      asset: updatedAsset
    });
  } catch (err) {
    next(err);
  }
}

export async function reportAssetIssue(req, res, next) {
  try {
    const { id } = req.params;
    const { issueType, severity = 'MEDIUM', description, isUnusable } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const workOrderNumber = 'WO-' + Math.floor(Math.random() * 89999 + 10000);

    const workOrder = await prisma.maintenanceWorkOrder.create({
      data: {
        workOrderNumber,
        assetId: id,
        workType: issueType || 'CORRECTIVE',
        priority: severity ? severity.toUpperCase() : 'MEDIUM',
        status: 'OPEN',
        description: description || 'Issue reported from My Assets self-service workspace',
        createdByUserId: req.user.id
      }
    });

    let newStatus = asset.lifecycleStatus;
    if (isUnusable) {
      newStatus = 'UNDER_MAINTENANCE';
      await prisma.asset.update({
        where: { id },
        data: { lifecycleStatus: 'UNDER_MAINTENANCE', condition: 'DAMAGED' }
      });
    }

    await prisma.assetTransaction.create({
      data: {
        assetId: id,
        transactionType: 'ISSUE_REPORTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: newStatus,
        performedByUserId: req.user.id,
        notes: `Issue [${issueType || 'Malfunction'}] reported (Work Order ${workOrderNumber}). Severity: ${severity}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_ISSUE_REPORT',
        entityType: 'MaintenanceWorkOrder',
        entityId: workOrder.id,
        afterState: { issueType, severity, description, workOrderNumber }
      }
    });

    res.json({
      success: true,
      message: `Issue reported successfully. Work Order ${workOrderNumber} created.`,
      workOrder
    });
  } catch (err) {
    next(err);
  }
}

export async function requestNewAsset(req, res, next) {
  try {
    const { category, requiredDate, costCenter, justification, specifications } = req.body;

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'SELF_SERVICE_ASSET_REQUEST',
        entityType: 'AssetRequest',
        afterState: { category, requiredDate, costCenter, justification, specifications }
      }
    });

    res.json({
      success: true,
      message: `Asset request for category '${category || 'General'}' submitted into approval workflow.`
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssetDocuments(req, res, next) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const documents = [
      { id: 'doc-1', name: `${asset.assetId}_Warranty_Certificate.pdf`, type: 'Warranty', size: '420 KB', date: '2024-01-15' },
      { id: 'doc-2', name: `${asset.assetId}_Assignment_Form.pdf`, type: 'Custody', size: '280 KB', date: '2024-01-18' },
      { id: 'doc-3', name: 'User_Manual_Guide.pdf', type: 'Manual', size: '1.4 MB', date: '2023-11-10' }
    ];

    res.json({
      success: true,
      documents
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAsset(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.asset.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await prisma.asset.delete({ where: { id } });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_DELETE',
        entityType: 'Asset',
        entityId: id,
        beforeState: existing
      }
    });

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getAssetHierarchyTree(req, res, next) {
  try {
    const { search } = req.query;
    const where = { ...req.dataScopeFilter };

    if (search) {
      where.OR = [
        { assetId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const allAssets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        company: true,
        site: true,
        building: true,
        room: true,
        custodian: true,
        manufacturer: true,
        model: true
      },
      orderBy: { assetId: 'asc' }
    });

    res.json({
      success: true,
      assets: allAssets
    });
  } catch (err) {
    next(err);
  }
}

export async function assignParentAsset(req, res, next) {
  try {
    const { assetId, parentAssetId } = req.body;

    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required.' });
    }

    if (assetId === parentAssetId) {
      return res.status(400).json({ success: false, message: 'Validation Error: An asset cannot be assigned as its own parent.' });
    }

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId: assetId }] }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    let parentAsset = null;
    if (parentAssetId) {
      parentAsset = await prisma.asset.findFirst({
        where: { OR: [{ id: parentAssetId }, { assetId: parentAssetId }] }
      });
      if (!parentAsset) {
        return res.status(404).json({ success: false, message: 'Parent asset not found in database.' });
      }

      // Check circular reference (prevent loop A -> B -> A)
      let currentParent = parentAsset;
      let depth = 0;
      while (currentParent && depth < 20) {
        if (currentParent.id === asset.id || currentParent.assetId === asset.assetId) {
          return res.status(400).json({
            success: false,
            message: `Circular Reference Error: Assigning ${asset.assetId} under ${parentAsset.assetId} creates a circular relationship loop.`
          });
        }
        if (!currentParent.parentAssetId) break;
        currentParent = await prisma.asset.findUnique({ where: { id: currentParent.parentAssetId } });
        depth++;
      }
    }

    const previousParentId = asset.parentAssetId;
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: { parentAssetId: parentAsset ? parentAsset.id : null }
    });

    // Record Audit Log for relationship change
    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_HIERARCHY_CHANGE',
        entityType: 'Asset',
        entityId: asset.id,
        beforeState: { parentAssetId: previousParentId },
        afterState: { parentAssetId: parentAsset ? parentAsset.id : null }
      }
    });

    res.json({
      success: true,
      message: `Successfully ${parentAsset ? `assigned ${asset.assetId} under parent ${parentAsset.assetId}` : `removed parent from ${asset.assetId}`}.`,
      asset: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function addChildAsset(req, res, next) {
  try {
    const { parentAssetId, childAssetId } = req.body;

    if (!parentAssetId || !childAssetId) {
      return res.status(400).json({ success: false, message: 'Parent Asset ID and Child Asset ID are required.' });
    }

    if (parentAssetId === childAssetId) {
      return res.status(400).json({ success: false, message: 'Validation Error: An asset cannot be added as a child of itself.' });
    }

    const [parent, child] = await Promise.all([
      prisma.asset.findFirst({ where: { OR: [{ id: parentAssetId }, { assetId: parentAssetId }] } }),
      prisma.asset.findFirst({ where: { OR: [{ id: childAssetId }, { assetId: childAssetId }] } })
    ]);

    if (!parent || !child) {
      return res.status(404).json({ success: false, message: 'Parent or Child asset not found.' });
    }

    const updatedChild = await prisma.asset.update({
      where: { id: child.id },
      data: { parentAssetId: parent.id }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_HIERARCHY_ADD_CHILD',
        entityType: 'Asset',
        entityId: child.id,
        beforeState: { parentAssetId: child.parentAssetId },
        afterState: { parentAssetId: parent.id }
      }
    });

    res.json({
      success: true,
      message: `Child asset ${child.assetId} successfully attached under ${parent.assetId}.`,
      asset: updatedChild
    });
  } catch (err) {
    next(err);
  }
}

export async function removeParentRelationship(req, res, next) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id }, { assetId: id }] }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const previousParentId = asset.parentAssetId;
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: { parentAssetId: null }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_HIERARCHY_REMOVE',
        entityType: 'Asset',
        entityId: asset.id,
        beforeState: { parentAssetId: previousParentId },
        afterState: { parentAssetId: null }
      }
    });

    res.json({
      success: true,
      message: `Removed parent relationship for ${asset.assetId}.`,
      asset: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function getHierarchyAuditHistory(req, res, next) {
  try {
    const history = await prisma.auditEvent.findMany({
      where: {
        action: { in: ['ASSET_HIERARCHY_CHANGE', 'ASSET_HIERARCHY_ADD_CHILD', 'ASSET_HIERARCHY_REMOVE'] }
      },
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      history
    });
  } catch (err) {
    next(err);
  }
}


