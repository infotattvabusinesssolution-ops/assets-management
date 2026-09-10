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
    const oldAsset = await prisma.asset.findUnique({ where: { id } });

    if (!oldAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        ...req.body,
        updatedByUserId: req.user.id
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user.id,
        action: 'ASSET_UPDATE',
        entityType: 'Asset',
        entityId: updatedAsset.id,
        beforeState: oldAsset,
        afterState: updatedAsset
      }
    });

    res.json({ success: true, asset: updatedAsset });
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
