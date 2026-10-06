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
  'OVERDUE',
  'PENDING_DISPOSAL',
  'DISPOSAL',
  'MISSING',
  'LOST_STOLEN',
  'DAMAGED',
  'RETIRED',
  'DISPOSED'
];

export async function resolveDbUserId(reqUser) {
  let userId = reqUser?.id;
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        { username: reqUser?.username || 'admin' }
      ]
    }
  });
  if (dbUser) return dbUser.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser ? firstUser.id : (userId || 'user-001');
}

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
        { assetId: { contains: search } },
        { tagNumber: { contains: search } },
        { serialNumber: { contains: search } },
        { description: { contains: search } },
        { hostname: { contains: search } }
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

    const baseWhere = { ...req.dataScopeFilter };

    const [assets, total, countInUse, countMaintenance, countDisposed, countOverdue, countPendingDisposal] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true,
          company: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          department: true,
          costCenter: true,
          custodian: true,
          manufacturer: true,
          model: true,
          warranty: true
        },
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        skip,
        take
      }),
      prisma.asset.count({ where }),
      prisma.asset.count({ where: { ...baseWhere, lifecycleStatus: { in: ['IN_SERVICE', 'ASSIGNED', 'In Use'] } } }),
      prisma.asset.count({ where: { ...baseWhere, lifecycleStatus: { in: ['UNDER_MAINTENANCE', 'Under Maintenance'] } } }),
      prisma.asset.count({ where: { ...baseWhere, lifecycleStatus: { in: ['DISPOSED', 'RETIRED', 'Disposed'] } } }),
      prisma.asset.count({ where: { ...baseWhere, lifecycleStatus: { in: ['OVERDUE', 'Overdue', 'MISSING'] } } }),
      prisma.asset.count({ where: { ...baseWhere, lifecycleStatus: { in: ['DISPOSAL', 'PENDING_DISPOSAL', 'Pending Disposal'] } } })
    ]);

    const totalPortfolio = await prisma.asset.count({ where: baseWhere });

    res.json({
      success: true,
      assets,
      kpiCounts: {
        total: totalPortfolio,
        inUse: countInUse,
        inUsePct: totalPortfolio > 0 ? `${((countInUse / totalPortfolio) * 100).toFixed(1)}%` : '0%',
        maintenance: countMaintenance,
        maintPct: totalPortfolio > 0 ? `${((countMaintenance / totalPortfolio) * 100).toFixed(1)}%` : '0%',
        pendingDisposal: countPendingDisposal,
        pendingDisposalPct: totalPortfolio > 0 ? `${((countPendingDisposal / totalPortfolio) * 100).toFixed(1)}%` : '0%',
        disposed: countDisposed,
        disposedPct: totalPortfolio > 0 ? `${((countDisposed / totalPortfolio) * 100).toFixed(1)}%` : '0%',
        overdue: countOverdue,
        overduePct: totalPortfolio > 0 ? `${((countOverdue / totalPortfolio) * 100).toFixed(1)}%` : '0%'
      },
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

    const assetIncludes = {
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
    };

    let asset = await prisma.asset.findUnique({
      where: { id },
      include: assetIncludes
    });

    if (!asset) {
      asset = await prisma.asset.findFirst({
        where: { assetId: id },
        include: assetIncludes
      });
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset [${id}] not found` });
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
    const rawCategory = req.body.categoryId || req.body.category || 'Laptop';
    const rawCompany = req.body.companyId || req.body.company;
    const rawSite = req.body.siteId || req.body.site;
    const rawDept = req.body.departmentId || req.body.department;
    const rawCostCenter = req.body.costCenterId || req.body.costCenter;
    const rawCustodian = req.body.custodianId || req.body.custodian;
    const rawMfr = req.body.manufacturerId || req.body.manufacturer || req.body.brand || null;
    const rawModel = req.body.modelId || req.body.model || req.body.modelNumber || null;

    // 1. Resolve or auto-create Category
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: rawCategory },
          { code: rawCategory },
          { name: rawCategory }
        ]
      }
    });
    if (!category) {
      category = await prisma.category.findFirst({ where: { active: true } });
    }
    if (!category) {
      category = await prisma.category.create({
        data: {
          code: 'CAT-' + rawCategory.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8),
          name: rawCategory
        }
      });
    }
    const categoryId = category.id;

    // 2. Resolve or fallback Company
    let company = null;
    if (rawCompany) {
      company = await prisma.company.findFirst({
        where: {
          OR: [
            { id: rawCompany },
            { code: rawCompany },
            { name: rawCompany }
          ]
        }
      });
    }
    if (!company) {
      company = await prisma.company.findFirst({ where: { active: true } });
    }
    if (!company) {
      company = await prisma.company.create({
        data: {
          code: 'CMP-DEFAULT',
          name: 'Corporate HQ'
        }
      });
    }
    const companyId = company.id;

    // 3. Resolve or fallback Site
    let site = null;
    if (rawSite) {
      site = await prisma.site.findFirst({
        where: {
          OR: [
            { id: rawSite },
            { code: rawSite },
            { name: rawSite }
          ]
        }
      });
    }
    if (!site) {
      site = await prisma.site.findFirst({ where: { active: true } });
    }
    if (!site) {
      site = await prisma.site.create({
        data: {
          companyId,
          code: 'SITE-MAIN',
          name: 'Main Site Campus'
        }
      });
    }
    const siteId = site.id;

    // 4. Resolve Department & Cost Center if provided
    let departmentId = null;
    if (rawDept) {
      const dept = await prisma.department.findFirst({
        where: { OR: [{ id: rawDept }, { code: rawDept }, { name: rawDept }] }
      });
      if (dept) departmentId = dept.id;
    }

    let costCenterId = null;
    if (rawCostCenter) {
      const cc = await prisma.costCenter.findFirst({
        where: { OR: [{ id: rawCostCenter }, { code: rawCostCenter }, { name: rawCostCenter }] }
      });
      if (cc) costCenterId = cc.id;
    }

    // 5. Resolve Custodian / Employee if provided
    let custodianId = null;
    if (rawCustodian) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { id: rawCustodian },
            { employeeCode: rawCustodian },
            { fullName: { contains: rawCustodian } }
          ]
        }
      });
      if (emp) custodianId = emp.id;
    }

    // 6. Resolve or auto-create Manufacturer
    let manufacturerId = null;
    if (rawMfr) {
      let mfr = await prisma.manufacturer.findFirst({
        where: { OR: [{ id: rawMfr }, { name: rawMfr }] }
      });
      if (!mfr) {
        mfr = await prisma.manufacturer.create({
          data: { name: rawMfr }
        });
      }
      manufacturerId = mfr.id;
    }

    // 7. Resolve or auto-create Model
    let modelId = null;
    if (rawModel && manufacturerId) {
      let mdl = await prisma.assetModel.findFirst({
        where: {
          OR: [
            { id: rawModel },
            { name: rawModel },
            { modelNumber: rawModel }
          ]
        }
      });
      if (!mdl) {
        mdl = await prisma.assetModel.create({
          data: {
            name: rawModel,
            modelNumber: req.body.modelNumber || rawModel,
            manufacturerId,
            categoryId
          }
        });
      }
      modelId = mdl.id;
    }

    // Parse financial values safely
    const rawVal = req.body.acquisitionValue || req.body.acquisitionCost || req.body.purchaseCost || 0;
    const acqValue = typeof rawVal === 'string' ? parseFloat(rawVal.replace(/[^0-9.-]+/g, '')) || 0 : Number(rawVal) || 0;

    // Check / Generate Unique Asset ID
    let assetId = req.body.assetId;
    if (!assetId || assetId === 'AUTO') {
      const count = await prisma.asset.count();
      assetId = `AST-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`;
    }
    const existingAssetWithId = await prisma.asset.findUnique({ where: { assetId } });
    if (existingAssetWithId) {
      assetId = `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 89999 + 10000)}`;
    }

    const tagNumber = req.body.tagNumber || req.body.assetTagBarcode || req.body.barcode || `TAG-${assetId}`;
    const barcode = req.body.barcode || req.body.assetTagBarcode || tagNumber;

    // Map lifecycle status
    let lifecycleStatus = req.body.lifecycleStatus || 'IN_SERVICE';
    if (lifecycleStatus === 'New' || lifecycleStatus === 'Active') lifecycleStatus = 'IN_SERVICE';
    if (lifecycleStatus === 'Draft') lifecycleStatus = 'RECEIVED';
    // Resolve DB user for foreign key audit & transaction integrity
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    if (userInDb) finalUserId = userInDb.id;
    else {
      const anyUser = await prisma.user.findFirst();
      finalUserId = anyUser ? anyUser.id : null;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newAsset = await tx.asset.create({
        data: {
          assetId,
          description: req.body.description || req.body.assetName || req.body.name || 'New Enterprise Asset',
          categoryId,
          companyId,
          siteId,
          buildingId: req.body.buildingId || null,
          floorId: req.body.floorId || null,
          roomId: req.body.roomId || null,
          zoneId: req.body.zoneId || null,
          departmentId,
          costCenterId,
          custodianId,
          manufacturerId,
          modelId,
          tagNumber,
          barcode,
          qrCode: req.body.qrCode || barcode,
          rfidEpc: req.body.rfidEpc || null,
          serialNumber: req.body.serialNumber || null,
          lifecycleStatus,
          condition: req.body.condition || 'NEW',
          criticality: req.body.criticality || 'MEDIUM',
          acquisitionValue: acqValue,
          currency: req.body.currency || 'USD',
          poNumber: req.body.poNumber || req.body.poInvoiceNo || null,
          supplierName: req.body.supplierName || req.body.supplier || req.body.vendorSupplier || null,
          purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : null,
          inServiceDate: req.body.inServiceDate ? new Date(req.body.inServiceDate) : null,
          hostname: req.body.hostname || null,
          macAddress: req.body.macAddress || null,
          ipAddress: req.body.ipAddress || null,
          createdByUserId: finalUserId,
          updatedByUserId: finalUserId
        }
      });

      const childOperations = [];

      // 1. Initial Corporate Book Value (only if capitalized value is provided)
      if (acqValue > 0) {
        childOperations.push(
          tx.assetBookValue.create({
            data: {
              assetId: newAsset.id,
              bookType: 'CORPORATE',
              capitalizationDate: new Date(),
              capitalizationValue: acqValue,
              usefulLifeMonths: parseInt(req.body.usefulLifeYears, 10) * 12 || 60,
              depreciationMethod: req.body.depreciationMethod === 'Straight Line' ? 'STRAIGHT_LINE' : 'STRAIGHT_LINE',
              residualValue: parseFloat(req.body.residualValue) || 0,
              accumulatedDepreciation: 0,
              netBookValue: acqValue
            }
          })
        );
      }

      // 2. Initial Asset Transaction Log
      childOperations.push(
        tx.assetTransaction.create({
          data: {
            assetId: newAsset.id,
            transactionType: 'RECEIVE',
            fromStatus: 'NONE',
            toStatus: newAsset.lifecycleStatus,
            performedByUserId: finalUserId,
            notes: req.body.notes || 'Asset Registration via Asset 360 Form'
          }
        }),

        // 3. Audit Log Event
        tx.auditEvent.create({
          data: {
            userId: finalUserId,
            action: 'ASSET_CREATE',
            entityType: 'Asset',
            entityId: newAsset.id,
            afterState: JSON.stringify({ assetId: newAsset.assetId, description: newAsset.description, status: newAsset.lifecycleStatus }).slice(0, 250)
          }
        })
      );

      // 4. Custody Assignment if Custodian is specified
      if (custodianId && finalUserId) {
        childOperations.push(
          tx.custodyAssignment.create({
            data: {
              assetId: newAsset.id,
              custodianId,
              issuedByUserId: finalUserId,
              issuedDate: new Date(),
              active: true,
              acknowledged: false,
              conditionAtIssue: newAsset.condition
            }
          })
        );
      }

      // 5. Warranty Setup if specified
      if (req.body.underWarranty && req.body.warrantyStartDate && req.body.warrantyEndDate) {
        childOperations.push(
          tx.warranty.create({
            data: {
              assetId: newAsset.id,
              providerName: req.body.provider || req.body.providerName || rawMfr || 'Standard Warranty',
              warrantyNumber: req.body.warrantyNumber || req.body.contractReference || `WAR-${assetId}`,
              startDate: new Date(req.body.warrantyStartDate),
              endDate: new Date(req.body.warrantyEndDate),
              terms: req.body.coverage || 'Parts & Labour',
              coverageType: req.body.warrantyType || 'FULL'
            }
          })
        );
      }

      await Promise.all(childOperations);

      return newAsset;
    }, { timeout: 30000, maxWait: 10000 });

    res.status(201).json({ success: true, asset: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;

    // Find asset by UUID or assetId
    let oldAsset = await prisma.asset.findUnique({
      where: { id },
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

    if (!oldAsset) {
      oldAsset = await prisma.asset.findFirst({
        where: { assetId: id },
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
      rfidTid,
      condition,
      lifecycleStatus,
      status,
      criticality,
      acquisitionValue,
      acquisitionCost,
      currency,
      hostname,
      ipAddress,
      macAddress,
      healthScore,
      poNumber,
      supplierName,
      supplier,
      purchaseDate,
      inServiceDate,
      acquisitionDate,
      category,
      categoryId,
      manufacturer,
      manufacturerId,
      model,
      modelId,
      custodian,
      custodianId,
      site,
      siteId,
      buildingId,
      floorId,
      roomId,
      notes,
      isDraft
    } = req.body;

    // Uniqueness validation for Serial Number, Tag, RFID EPC if changed
    if (serialNumber && serialNumber !== oldAsset.serialNumber) {
      const duplicate = await prisma.asset.findFirst({
        where: { serialNumber, NOT: { id: oldAsset.id } }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Serial Number [${serialNumber}] is already assigned to asset ${duplicate.assetId}.`
        });
      }
    }

    if (tagNumber && tagNumber !== oldAsset.tagNumber) {
      const duplicate = await prisma.asset.findFirst({
        where: { tagNumber, NOT: { id: oldAsset.id } }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Tag Number [${tagNumber}] is already assigned to asset ${duplicate.assetId}.`
        });
      }
    }

    if (rfidEpc && rfidEpc !== oldAsset.rfidEpc) {
      const duplicate = await prisma.asset.findFirst({
        where: { rfidEpc, NOT: { id: oldAsset.id } }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `RFID EPC [${rfidEpc}] is already assigned to asset ${duplicate.assetId}.`
        });
      }
    }

    // Resolve User for audit and foreign keys
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    if (userInDb) finalUserId = userInDb.id;
    else {
      const anyUser = await prisma.user.findFirst();
      finalUserId = anyUser ? anyUser.id : null;
    }

    // Build update data
    const updateData = {};

    // Basic Info
    if (description !== undefined || assetName !== undefined) {
      updateData.description = description || assetName || oldAsset.description;
    }
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (tagNumber !== undefined) updateData.tagNumber = tagNumber;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (qrCode !== undefined) updateData.qrCode = qrCode;
    if (rfidEpc !== undefined) updateData.rfidEpc = rfidEpc;
    if (rfidTid !== undefined) updateData.rfidTid = rfidTid;

    // Condition normalization
    if (condition !== undefined) {
      const condUpper = String(condition).toUpperCase();
      if (['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'RETIRED'].includes(condUpper)) {
        updateData.condition = condUpper;
      } else {
        updateData.condition = condUpper === 'IN USE' ? 'GOOD' : condUpper;
      }
    }

    // Lifecycle Status normalization
    const rawStatus = lifecycleStatus || status;
    if (rawStatus !== undefined) {
      const statusMap = {
        'In Use': 'IN_SERVICE',
        'IN USE': 'IN_SERVICE',
        'Active': 'IN_SERVICE',
        'ACTIVE': 'IN_SERVICE',
        'IN_SERVICE': 'IN_SERVICE',
        'Under Maintenance': 'UNDER_MAINTENANCE',
        'UNDER_MAINTENANCE': 'UNDER_MAINTENANCE',
        'Pending Return': 'PENDING_RETURN',
        'PENDING_RETURN': 'PENDING_RETURN',
        'In Store': 'IN_STORE',
        'IN_STORE': 'IN_STORE',
        'Assigned': 'ASSIGNED',
        'ASSIGNED': 'ASSIGNED',
        'Retired': 'RETIRED',
        'RETIRED': 'RETIRED',
        'Disposed': 'DISPOSED',
        'DISPOSED': 'DISPOSED'
      };
      updateData.lifecycleStatus = statusMap[rawStatus] || rawStatus;
    }

    if (criticality !== undefined) {
      updateData.criticality = String(criticality).toUpperCase();
    }

    // Financial Values
    const rawAcq = acquisitionValue !== undefined ? acquisitionValue : acquisitionCost;
    if (rawAcq !== undefined) {
      const val = typeof rawAcq === 'string' ? parseFloat(rawAcq.replace(/[^0-9.-]+/g, '')) || 0 : Number(rawAcq) || 0;
      updateData.acquisitionValue = val;
    }
    if (currency !== undefined) updateData.currency = currency;
    if (poNumber !== undefined) updateData.poNumber = poNumber;
    const finalSupplier = supplierName || supplier;
    if (finalSupplier !== undefined) updateData.supplierName = finalSupplier;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    const finalInService = inServiceDate || acquisitionDate;
    if (finalInService !== undefined) updateData.inServiceDate = finalInService ? new Date(finalInService) : null;

    // Technical Details
    if (hostname !== undefined) updateData.hostname = hostname;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (macAddress !== undefined) updateData.macAddress = macAddress;
    if (healthScore !== undefined) updateData.healthScore = parseInt(healthScore, 10) || oldAsset.healthScore;

    // Relational lookups: Category
    const rawCategory = categoryId || category;
    if (rawCategory) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ id: rawCategory }, { code: rawCategory }, { name: rawCategory }] }
      });
      if (cat) updateData.categoryId = cat.id;
    }

    // Relational lookups: Manufacturer
    const rawManufacturer = manufacturerId || manufacturer;
    if (rawManufacturer) {
      let mfr = await prisma.manufacturer.findFirst({
        where: { OR: [{ id: rawManufacturer }, { name: rawManufacturer }] }
      });
      if (!mfr && typeof rawManufacturer === 'string') {
        mfr = await prisma.manufacturer.create({ data: { name: rawManufacturer } });
      }
      if (mfr) updateData.manufacturerId = mfr.id;
    }

    // Relational lookups: Model
    const rawMdl = modelId || model;
    if (rawMdl) {
      let mdl = await prisma.assetModel.findFirst({
        where: { OR: [{ id: rawMdl }, { name: rawMdl }, { modelNumber: rawMdl }] }
      });
      if (!mdl && typeof rawMdl === 'string' && (updateData.manufacturerId || oldAsset.manufacturerId)) {
        mdl = await prisma.assetModel.create({
          data: {
            name: rawMdl,
            modelNumber: rawMdl,
            manufacturerId: updateData.manufacturerId || oldAsset.manufacturerId,
            categoryId: updateData.categoryId || oldAsset.categoryId
          }
        });
      }
      if (mdl) updateData.modelId = mdl.id;
    }

    // Relational lookups: Custodian / Employee
    const rawCustodian = custodianId || custodian;
    if (rawCustodian) {
      const emp = await prisma.employee.findFirst({
        where: { OR: [{ id: rawCustodian }, { employeeCode: rawCustodian }, { fullName: rawCustodian }] }
      });
      if (emp) updateData.custodianId = emp.id;
    }

    // Relational lookups: Site / Building / Room
    const rawSite = siteId || site;
    if (rawSite) {
      const s = await prisma.site.findFirst({
        where: { OR: [{ id: rawSite }, { code: rawSite }, { name: rawSite }] }
      });
      if (s) updateData.siteId = s.id;
    }
    if (buildingId !== undefined) updateData.buildingId = buildingId || null;
    if (floorId !== undefined) updateData.floorId = floorId || null;
    if (roomId !== undefined) updateData.roomId = roomId || null;

    updateData.updatedByUserId = finalUserId;

    // Detect changed fields for audit log
    const changedFields = [];
    Object.keys(updateData).forEach((key) => {
      if (key !== 'updatedByUserId' && String(oldAsset[key]) !== String(updateData[key])) {
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
        transactionType: isDraft ? 'DRAFT_SAVED' : 'MASTER_EDIT',
        fromStatus: oldAsset.lifecycleStatus,
        toStatus: updatedAsset.lifecycleStatus,
        performedByUserId: finalUserId || 'usr-default',
        notes: notes || (isDraft
          ? `Draft changes saved for asset [${oldAsset.assetId}].`
          : `Asset Master updated. Modified fields: ${changedFields.map((f) => f.field).join(', ') || 'None'}`)
      }
    });

    // Write Audit Event record
    const beforeDiff = changedFields.length > 0
      ? JSON.stringify(changedFields.reduce((acc, f) => { acc[f.field] = f.old; return acc; }, {}))
      : JSON.stringify({ assetId: oldAsset.assetId, description: oldAsset.description, status: oldAsset.lifecycleStatus });

    const afterDiff = changedFields.length > 0
      ? JSON.stringify(changedFields.reduce((acc, f) => { acc[f.field] = f.new; return acc; }, {}))
      : JSON.stringify({ assetId: updatedAsset.assetId, description: updatedAsset.description, status: updatedAsset.lifecycleStatus });

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: isDraft ? 'ASSET_DRAFT_SAVE' : 'ASSET_EDIT_UPDATE',
        entityType: 'Asset',
        entityId: updatedAsset.id,
        beforeState: beforeDiff.slice(0, 240),
        afterState: afterDiff.slice(0, 240)
      }
    });

    res.json({
      success: true,
      message: isDraft
        ? `Draft saved for asset [${updatedAsset.assetId}].`
        : `Asset [${updatedAsset.assetId}] master information updated successfully with complete audit trail.`,
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
    const finalUserId = await resolveDbUserId(req.user);

    if (!ASSET_STATUSES.includes(toStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status [${toStatus}]` });
    }

    let asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      asset = await prisma.asset.findFirst({ where: { assetId: id } });
    }
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const fromStatus = asset.lifecycleStatus;
    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        lifecycleStatus: toStatus,
        updatedByUserId: finalUserId
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: updatedAsset.id,
        transactionType: 'STATUS_CHANGE',
        fromStatus,
        toStatus,
        performedByUserId: finalUserId,
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
            { assetId: { contains: search } },
            { tagNumber: { contains: search } },
            { serialNumber: { contains: search } },
            { barcode: { contains: search } },
            { qrCode: { contains: search } },
            { rfidEpc: { contains: search } },
            { description: { contains: search } },
            { hostname: { contains: search } }
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
    const finalUserId = await resolveDbUserId(req.user);

    let asset = await prisma.asset.findUnique({
      where: { id },
      include: { custodyAssignments: { where: { active: true }, take: 1 } }
    });
    if (!asset) {
      asset = await prisma.asset.findFirst({
        where: { assetId: id },
        include: { custodyAssignments: { where: { active: true }, take: 1 } }
      });
    }

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
      where: { id: asset.id },
      data: {
        condition: condition || asset.condition,
        updatedByUserId: finalUserId
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: status === 'ACKNOWLEDGED' ? 'CUSTODY_ACKNOWLEDGE' : 'CUSTODY_REJECT',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: finalUserId,
        notes: remarks || `Asset acknowledgement status: ${status}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: status === 'ACKNOWLEDGED' ? 'ASSET_ACKNOWLEDGE' : 'ASSET_ACKNOWLEDGE_REJECT',
        entityType: 'Asset',
        entityId: asset.id,
        afterState: JSON.stringify({ status, condition, remarks }).slice(0, 240)
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
    const finalUserId = await resolveDbUserId(req.user);

    let asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      asset = await prisma.asset.findFirst({ where: { assetId: id } });
    }
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const transferNumber = 'TRF-REQ-' + Math.floor(Math.random() * 89999 + 10000);

    const transfer = await prisma.assetTransfer.create({
      data: {
        transferNumber,
        assetId: asset.id,
        transferType: 'SELF_SERVICE_REQUEST',
        status: 'PENDING_APPROVAL',
        reason: reason || 'Self-service transfer request',
        requestedByUserId: finalUserId
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'TRANSFER_REQUESTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: finalUserId,
        notes: `Transfer requested to ${targetEmployee || 'Employee'} (${targetLocation || 'Location'}). Reason: ${reason || 'N/A'}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_TRANSFER_REQUEST',
        entityType: 'AssetTransfer',
        entityId: transfer.id,
        afterState: JSON.stringify({ transferNumber, targetEmployee, targetLocation, reason }).slice(0, 240)
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
    const finalUserId = await resolveDbUserId(req.user);

    let asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      asset = await prisma.asset.findFirst({ where: { assetId: id } });
    }
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        lifecycleStatus: 'PENDING_RETURN',
        condition: condition || asset.condition,
        updatedByUserId: finalUserId
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'RETURN_REQUESTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: 'PENDING_RETURN',
        performedByUserId: finalUserId,
        notes: `Return initiated to store [${returnStore || 'Default Store'}]. Reason: ${reason || 'N/A'}. Condition: ${condition || asset.condition}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_RETURN_REQUEST',
        entityType: 'Asset',
        entityId: asset.id,
        afterState: JSON.stringify({ returnStore, condition, reason, remarks }).slice(0, 240)
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
    const finalUserId = await resolveDbUserId(req.user);

    let asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      asset = await prisma.asset.findFirst({ where: { assetId: id } });
    }
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const workOrderNumber = 'WO-' + Math.floor(Math.random() * 89999 + 10000);

    const workOrder = await prisma.maintenanceWorkOrder.create({
      data: {
        workOrderNumber,
        assetId: asset.id,
        workType: issueType || 'CORRECTIVE',
        priority: severity ? severity.toUpperCase() : 'MEDIUM',
        status: 'OPEN',
        description: description || 'Issue reported from My Assets self-service workspace',
        createdByUserId: finalUserId
      }
    });

    let newStatus = asset.lifecycleStatus;
    if (isUnusable) {
      newStatus = 'UNDER_MAINTENANCE';
      await prisma.asset.update({
        where: { id: asset.id },
        data: { lifecycleStatus: 'UNDER_MAINTENANCE', condition: 'DAMAGED' }
      });
    }

    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'ISSUE_REPORTED',
        fromStatus: asset.lifecycleStatus,
        toStatus: newStatus,
        performedByUserId: finalUserId,
        notes: `Issue [${issueType || 'Malfunction'}] reported (Work Order ${workOrderNumber}). Severity: ${severity}`
      }
    });

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_ISSUE_REPORT',
        entityType: 'MaintenanceWorkOrder',
        entityId: workOrder.id,
        afterState: JSON.stringify({ issueType, severity, description, workOrderNumber }).slice(0, 240)
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
    const finalUserId = await resolveDbUserId(req.user);

    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'SELF_SERVICE_ASSET_REQUEST',
        entityType: 'AssetRequest',
        afterState: JSON.stringify({ category, requiredDate, costCenter, justification, specifications }).slice(0, 240)
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
    const asset = await prisma.asset.findFirst({ where: { OR: [{ id }, { assetId: id }] } });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { entityType: { in: ['Asset', 'ASSET'] }, entityId: { in: [asset.id, asset.assetId] } },
      orderBy: { createdAt: 'desc' }
    });
    const documents = attachments.map(file => ({
      id: file.id, name: file.fileName, type: file.fileType || 'Document',
      size: file.fileSize ? (file.fileSize / 1024).toFixed(1) + ' KB' : '',
      date: file.createdAt, url: file.url
    }));

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
    let existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.asset.findFirst({ where: { assetId: id } });
    }

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const assetDbId = existing.id;

    // Parallel cascade delete of all child relations before removing core asset
    await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.assetBookValue.deleteMany({ where: { assetId: assetDbId } }),
        tx.assetTransaction.deleteMany({ where: { assetId: assetDbId } }),
        tx.custodyAssignment.deleteMany({ where: { assetId: assetDbId } }),
        tx.maintenanceWorkOrder.deleteMany({ where: { assetId: assetDbId } }),
        tx.maintenanceSchedule.deleteMany({ where: { assetId: assetDbId } }),
        tx.contractAsset.deleteMany({ where: { assetId: assetDbId } }),
        tx.warranty.deleteMany({ where: { assetId: assetDbId } }),
        tx.tagHistory.deleteMany({ where: { assetId: assetDbId } }),
        tx.tag.deleteMany({ where: { assetId: assetDbId } }),
        tx.assetMapPosition.deleteMany({ where: { assetId: assetDbId } }),
        tx.discoveryMatch.deleteMany({ where: { matchedAssetId: assetDbId } }),
        tx.aIRecommendation.deleteMany({ where: { assetId: assetDbId } }),
        tx.assetCustomFieldValue.deleteMany({ where: { assetId: assetDbId } }),
        tx.assetTransfer.deleteMany({ where: { assetId: assetDbId } }),
        tx.rtlsMovement.deleteMany({ where: { assetId: assetDbId } }),
        tx.rtlsAssetLocation.deleteMany({ where: { assetId: assetDbId } }),
        tx.asset.updateMany({ where: { parentAssetId: assetDbId }, data: { parentAssetId: null } })
      ]);

      await tx.asset.delete({ where: { id: assetDbId } });

      let deleteUserId = req.user?.id;
      const dbUser = await tx.user.findFirst({
        where: {
          OR: [
            ...(deleteUserId ? [{ id: deleteUserId }] : []),
            { username: req.user?.username || 'admin' }
          ]
        }
      });
      deleteUserId = dbUser ? dbUser.id : null;

      await tx.auditEvent.create({
        data: {
          userId: deleteUserId,
          action: 'ASSET_DELETE',
          entityType: 'Asset',
          entityId: assetDbId,
          beforeState: JSON.stringify({ assetId: existing.assetId, description: existing.description }).slice(0, 250)
        }
      });
    }, { timeout: 30000, maxWait: 10000 });

    res.json({ success: true, message: `Asset ${existing.assetId} deleted successfully` });
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
        { assetId: { contains: search } },
        { description: { contains: search } },
        { serialNumber: { contains: search } },
        { tagNumber: { contains: search } }
      ];
    }

    const allAssets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        company: true,
        site: true,
        building: true,
        floor: true,
        room: true,
        custodian: true,
        department: true,
        costCenter: true,
        manufacturer: true,
        model: true,
        warranty: true
      },
      orderBy: { assetId: 'asc' }
    });

    const formatStatus = (st) => {
      if (st === 'IN_SERVICE') return 'In Use';
      if (st === 'UNDER_MAINTENANCE') return 'Under Maintenance';
      if (st === 'PENDING_RETURN') return 'Pending Return';
      if (st === 'IN_STORE') return 'In Store';
      if (st === 'ASSIGNED') return 'In Use';
      if (st === 'RECEIVED') return 'In Store';
      if (st === 'RETIRED') return 'Retired';
      if (st === 'DISPOSED') return 'Disposed';
      return st || '-';
    };

    const formatCondition = (c) => {
      if (!c) return '-';
      return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    };

    // Index all assets by id and assetId
    const nodeMap = new Map();
    allAssets.forEach((a) => {
      const locationParts = [a.site?.name, a.building?.name, a.floor?.name, a.room?.name].filter(Boolean);
      const node = {
        id: a.id,
        dbId: a.id,
        assetId: a.assetId,
        name: a.description || a.assetId,
        category: a.category?.name || '-',
        categoryId: a.categoryId,
        type: '-',
        level: 1,
        levelName: 'Parent System',
        status: formatStatus(a.lifecycleStatus),
        condition: formatCondition(a.condition),
        criticality: a.criticality || 'MEDIUM',
        location: locationParts.length > 0 ? locationParts.join(', ') : '-',
        custodian: a.custodian?.fullName || 'Unassigned',
        custodianId: a.custodianId,
        custodianCode: a.custodian?.employeeCode || null,
        custodianEmail: a.custodian?.email || null,
        department: a.department?.name || '-',
        departmentId: a.departmentId,
        costCenter: a.costCenter?.name || a.costCenter?.code || '-',
        costCenterId: a.costCenterId,
        siteName: a.site?.name || '-',
        siteId: a.siteId,
        buildingName: a.building?.name || '-',
        buildingId: a.buildingId,
        floorName: a.floor?.name || '-',
        floorId: a.floorId,
        roomName: a.room?.name || '-',
        roomId: a.roomId,
        tagNumber: a.tagNumber || '-',
        barcode: a.barcode || a.tagNumber || '-',
        rfidEpc: a.rfidEpc || '-',
        supplierName: a.supplierName || '-',
        poNumber: a.poNumber || '-',
        model: a.model?.name || '-',
        serialNumber: a.serialNumber || '-',
        manufacturer: a.manufacturer?.name || '-',
        purchaseDate: a.purchaseDate
          ? new Date(a.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-',
        warrantyExpiry: a.warranty?.endDate ? new Date(a.warranty.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        warrantyProvider: a.warranty?.providerName || '-',
        parentAssetId: null,
        parentAssetName: null,
        rawParentId: a.parentAssetId,
        acquisitionValue: parseFloat(a.acquisitionValue) || 0,
        currency: a.currency || 'USD',
        children: []
      };
      nodeMap.set(a.id, node);
      nodeMap.set(a.assetId, node);
    });

    // Build hierarchy links
    const rootNodes = [];
    allAssets.forEach((a) => {
      const node = nodeMap.get(a.id);
      if (a.parentAssetId && nodeMap.has(a.parentAssetId)) {
        const parentNode = nodeMap.get(a.parentAssetId);
        node.parentAssetId = parentNode.assetId;
        node.parentAssetName = parentNode.name;
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Recursively calculate levels, levelNames, types, and descendant rollups
    function processHierarchy(nodes, currentLevel = 1) {
      nodes.forEach((n) => {
        n.level = currentLevel;
        if (currentLevel === 1) {
          n.type = 'System';
          n.levelName = 'Parent System';
        } else if (currentLevel === 2) {
          n.type = 'Equipment';
          n.levelName = 'Child Asset';
        } else {
          n.type = 'Component';
          n.levelName = 'Sub-Component';
        }

        if (n.children && n.children.length > 0) {
          processHierarchy(n.children, currentLevel + 1);
          n.childCount = n.children.length;
          n.totalDescendantCount = n.children.reduce((acc, c) => acc + 1 + (c.totalDescendantCount || 0), 0);
          n.totalAcquisitionValue = n.acquisitionValue + n.children.reduce((acc, c) => acc + (c.totalAcquisitionValue || c.acquisitionValue || 0), 0);
        } else {
          n.childCount = 0;
          n.totalDescendantCount = 0;
          n.totalAcquisitionValue = n.acquisitionValue;
        }
      });
    }

    processHierarchy(rootNodes, 1);

    // If search is active, also include search matches in root if not already there
    res.json({
      success: true,
      tree: rootNodes,
      assets: allAssets,
      totalCount: allAssets.length,
      rootCount: rootNodes.length
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
      return res.status(400).json({
        success: false,
        message: 'Validation Error: An asset cannot be assigned as its own parent.'
      });
    }

    // Resolve User for audit
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    finalUserId = userInDb ? userInDb.id : (await prisma.user.findFirst())?.id || null;

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId: assetId }] }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset [${assetId}] not found.` });
    }

    let parentAsset = null;
    if (parentAssetId) {
      parentAsset = await prisma.asset.findFirst({
        where: { OR: [{ id: parentAssetId }, { assetId: parentAssetId }] }
      });
      if (!parentAsset) {
        return res.status(404).json({
          success: false,
          message: `Parent asset [${parentAssetId}] not found in database.`
        });
      }

      if (parentAsset.id === asset.id || parentAsset.assetId === asset.assetId) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: An asset cannot be assigned as its own parent.'
        });
      }

      // Check circular reference (prevent loop A -> B -> A)
      let currentParentId = parentAsset.parentAssetId;
      let depth = 0;
      while (currentParentId && depth < 30) {
        if (currentParentId === asset.id || currentParentId === asset.assetId) {
          return res.status(400).json({
            success: false,
            message: `Circular Reference Error: Assigning ${asset.assetId} under ${parentAsset.assetId} creates a circular relationship loop.`
          });
        }
        const ancestor = await prisma.asset.findFirst({
          where: { OR: [{ id: currentParentId }, { assetId: currentParentId }] }
        });
        if (!ancestor) break;
        if (ancestor.id === asset.id || ancestor.assetId === asset.assetId) {
          return res.status(400).json({
            success: false,
            message: `Circular Reference Error: Assigning ${asset.assetId} under ${parentAsset.assetId} creates a circular relationship loop.`
          });
        }
        currentParentId = ancestor.parentAssetId;
        depth++;
      }
    }

    const previousParentId = asset.parentAssetId;
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        parentAssetId: parentAsset ? parentAsset.id : null,
        updatedByUserId: finalUserId
      },
      include: {
        parentAsset: true,
        category: true,
        custodian: true
      }
    });

    // Record Asset Transaction
    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'HIERARCHY_CHANGE',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: finalUserId || 'usr-default',
        notes: parentAsset
          ? `Hierarchy updated: Assigned under parent [${parentAsset.assetId}] (${parentAsset.description})`
          : `Hierarchy updated: Removed parent relationship`
      }
    });

    // Record Audit Log for relationship change
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_HIERARCHY_CHANGE',
        entityType: 'Asset',
        entityId: asset.id,
        beforeState: JSON.stringify({ parentAssetId: previousParentId }),
        afterState: JSON.stringify({ parentAssetId: parentAsset ? parentAsset.id : null, parentAssetIdCode: parentAsset?.assetId })
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

    // Resolve User for audit
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    finalUserId = userInDb ? userInDb.id : (await prisma.user.findFirst())?.id || null;

    const [parent, child] = await Promise.all([
      prisma.asset.findFirst({ where: { OR: [{ id: parentAssetId }, { assetId: parentAssetId }] } }),
      prisma.asset.findFirst({ where: { OR: [{ id: childAssetId }, { assetId: childAssetId }] } })
    ]);

    if (!parent || !child) {
      return res.status(404).json({
        success: false,
        message: `Parent [${parentAssetId}] or Child [${childAssetId}] asset not found in database.`
      });
    }

    if (parent.id === child.id || parent.assetId === child.assetId) {
      return res.status(400).json({ success: false, message: 'Validation Error: An asset cannot be added as a child of itself.' });
    }

    // Circular check: Verify parent is not already a descendant of child
    let currentParentId = parent.parentAssetId;
    let depth = 0;
    while (currentParentId && depth < 30) {
      if (currentParentId === child.id || currentParentId === child.assetId) {
        return res.status(400).json({
          success: false,
          message: `Circular Reference Error: Cannot attach ${child.assetId} under ${parent.assetId} because ${parent.assetId} is already a descendant of ${child.assetId}.`
        });
      }
      const ancestor = await prisma.asset.findFirst({
        where: { OR: [{ id: currentParentId }, { assetId: currentParentId }] }
      });
      if (!ancestor) break;
      if (ancestor.id === child.id || ancestor.assetId === child.assetId) {
        return res.status(400).json({
          success: false,
          message: `Circular Reference Error: Cannot attach ${child.assetId} under ${parent.assetId} because ${parent.assetId} is already a descendant of ${child.assetId}.`
        });
      }
      currentParentId = ancestor.parentAssetId;
      depth++;
    }

    const previousParentId = child.parentAssetId;
    const updatedChild = await prisma.asset.update({
      where: { id: child.id },
      data: {
        parentAssetId: parent.id,
        updatedByUserId: finalUserId
      },
      include: {
        parentAsset: true,
        category: true,
        custodian: true
      }
    });

    // Write Asset Transaction
    await prisma.assetTransaction.create({
      data: {
        assetId: child.id,
        transactionType: 'HIERARCHY_ATTACH_CHILD',
        fromStatus: child.lifecycleStatus,
        toStatus: child.lifecycleStatus,
        performedByUserId: finalUserId || 'usr-default',
        notes: `Attached as child asset under parent [${parent.assetId}] (${parent.description})`
      }
    });

    // Write Audit Log
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_HIERARCHY_ADD_CHILD',
        entityType: 'Asset',
        entityId: child.id,
        beforeState: JSON.stringify({ parentAssetId: previousParentId }),
        afterState: JSON.stringify({ parentAssetId: parent.id, parentAssetIdCode: parent.assetId })
      }
    });

    res.json({
      success: true,
      message: `Child asset ${child.assetId} successfully attached under parent ${parent.assetId}.`,
      asset: updatedChild
    });
  } catch (err) {
    next(err);
  }
}

export async function createChildAsset(req, res, next) {
  try {
    const {
      parentAssetId,
      name,
      description,
      categoryId: rawCategory,
      serialNumber,
      tagNumber: rawTag,
      barcode: rawBarcode,
      rfidEpc,
      manufacturer: rawMfr,
      model: rawModel,
      condition = 'NEW',
      criticality = 'MEDIUM',
      acquisitionValue: rawVal,
      currency = 'USD',
      purchaseDate,
      warrantyExpiry,
      inheritLocation = true,
      inheritCustodian = true,
      siteId: customSiteId,
      buildingId: customBuildingId,
      floorId: customFloorId,
      roomId: customRoomId,
      departmentId: customDeptId,
      costCenterId: customCostCenterId,
      custodianId: customCustodianId,
      supplierName: rawSupplier,
      poNumber: rawPoNumber,
      warrantyProvider: rawWarrantyProvider,
      warrantyCoverage: rawWarrantyCoverage
    } = req.body;

    if (!parentAssetId) {
      return res.status(400).json({ success: false, message: 'Parent Asset ID is required.' });
    }

    const assetTitle = (name || description || '').trim();
    if (!assetTitle) {
      return res.status(400).json({ success: false, message: 'Child Asset Name / Description is required.' });
    }

    // 1. Find Parent Asset
    const parent = await prisma.asset.findFirst({
      where: { OR: [{ id: parentAssetId }, { assetId: parentAssetId }] },
      include: {
        category: true,
        site: true,
        building: true,
        floor: true,
        room: true,
        department: true,
        costCenter: true,
        custodian: true,
        company: true
      }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: `Parent asset [${parentAssetId}] not found in database.`
      });
    }

    // 2. Resolve User for audit & createdBy
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    finalUserId = userInDb ? userInDb.id : (await prisma.user.findFirst())?.id || null;

    // 3. Resolve Category
    const categoryQuery = rawCategory || parent.categoryId;
    let category = null;
    if (categoryQuery) {
      category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: categoryQuery },
            { code: categoryQuery },
            { name: categoryQuery }
          ]
        }
      });
    }
    if (!category) {
      category = await prisma.category.findFirst({ where: { active: true } });
    }
    if (!category) {
      category = await prisma.category.create({
        data: {
          code: 'CAT-CHILD',
          name: 'Components & Accessories'
        }
      });
    }
    const categoryId = category.id;

    // 4. Resolve Manufacturer & Model
    let manufacturerId = null;
    if (rawMfr) {
      let mfr = await prisma.manufacturer.findFirst({
        where: { OR: [{ id: rawMfr }, { name: rawMfr }] }
      });
      if (!mfr) {
        mfr = await prisma.manufacturer.create({ data: { name: rawMfr } });
      }
      manufacturerId = mfr.id;
    }

    let modelId = null;
    if (rawModel) {
      let mdl = await prisma.assetModel.findFirst({
        where: { OR: [{ id: rawModel }, { name: rawModel }, { modelNumber: rawModel }] }
      });
      if (!mdl) {
        mdl = await prisma.assetModel.create({
          data: {
            name: rawModel,
            modelNumber: rawModel,
            manufacturerId,
            categoryId
          }
        });
      }
      modelId = mdl.id;
    }

    // 5. Generate Unique Child Asset ID
    const count = await prisma.asset.count();
    let assetId = `AST-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`;
    const existing = await prisma.asset.findUnique({ where: { assetId } });
    if (existing) {
      assetId = `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 89999 + 10000)}`;
    }

    const tagNumber = rawTag || `TAG-${assetId}`;
    const barcode = rawBarcode || tagNumber;

    // 6. Resolve Location & Custody (Inherit or Custom)
    const companyId = parent.companyId || (await prisma.company.findFirst())?.id;
    const siteId = inheritLocation ? parent.siteId : (customSiteId || parent.siteId);
    const buildingId = inheritLocation ? parent.buildingId : (customBuildingId || parent.buildingId);
    const floorId = inheritLocation ? parent.floorId : (customFloorId || parent.floorId);
    const roomId = inheritLocation ? parent.roomId : (customRoomId || parent.roomId);

    let departmentId = inheritCustodian ? parent.departmentId : (customDeptId || parent.departmentId);
    let costCenterId = inheritCustodian ? parent.costCenterId : (customCostCenterId || parent.costCenterId);
    let custodianId = inheritCustodian ? parent.custodianId : (customCustodianId || parent.custodianId);

    // If explicit custodian employee selected, auto-link their department / cost center if empty
    if (!inheritCustodian && customCustodianId) {
      const emp = await prisma.employee.findUnique({ where: { id: customCustodianId } });
      if (emp) {
        custodianId = emp.id;
        if (!customDeptId && emp.departmentId) departmentId = emp.departmentId;
        if (!customCostCenterId && emp.costCenterId) costCenterId = emp.costCenterId;
      }
    }

    // 7. Parse financial values safely
    const acqValue = typeof rawVal === 'string' ? parseFloat(rawVal.replace(/[^0-9.-]+/g, '')) || 0 : Number(rawVal) || 0;

    // 8. Create child asset in Transaction
    const newChild = await prisma.$transaction(async (tx) => {
      const created = await tx.asset.create({
        data: {
          assetId,
          description: assetTitle,
          parentAssetId: parent.id,
          categoryId,
          companyId,
          siteId,
          buildingId,
          floorId,
          roomId,
          departmentId,
          costCenterId,
          custodianId,
          manufacturerId,
          modelId,
          tagNumber,
          barcode,
          qrCode: barcode,
          rfidEpc: rfidEpc || null,
          serialNumber: serialNumber || null,
          supplierName: rawSupplier || null,
          poNumber: rawPoNumber || null,
          lifecycleStatus: 'IN_SERVICE',
          condition: (['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'RETIRED'].includes(String(condition).toUpperCase())) ? String(condition).toUpperCase() : 'NEW',
          criticality: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(String(criticality).toUpperCase())) ? String(criticality).toUpperCase() : 'MEDIUM',
          acquisitionValue: acqValue,
          currency: currency || parent.currency || 'USD',
          purchaseDate: purchaseDate ? new Date(purchaseDate) : (parent.purchaseDate || new Date()),
          createdByUserId: finalUserId,
          updatedByUserId: finalUserId
        },
        include: {
          parentAsset: true,
          category: true,
          custodian: true,
          department: true,
          costCenter: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          warranty: true
        }
      });

      if (custodianId) {
        await tx.custodyAssignment.create({
          data: {
            assetId: created.id,
            custodianId,
            issuedByUserId: finalUserId,
            issuedDate: new Date(),
            active: true,
            acknowledged: false,
            conditionAtIssue: created.condition
          }
        });
      }

      if (warrantyExpiry) {
        await tx.warranty.create({
          data: {
            assetId: created.id,
            startDate: purchaseDate ? new Date(purchaseDate) : (parent.purchaseDate || new Date()),
            endDate: new Date(warrantyExpiry),
            providerName: rawWarrantyProvider || rawMfr || 'OEM Supplier',
            warrantyNumber: `WAR-${created.assetId}`,
            terms: rawWarrantyCoverage || 'Parts & Labor',
            coverageType: 'FULL'
          }
        });
      }

      if (acqValue > 0) {
        await tx.assetBookValue.create({
          data: {
            assetId: created.id,
            bookType: 'CORPORATE',
            capitalizationDate: new Date(),
            capitalizationValue: acqValue,
            usefulLifeMonths: 60,
            depreciationMethod: 'STRAIGHT_LINE',
            residualValue: 0,
            accumulatedDepreciation: 0,
            netBookValue: acqValue
          }
        });
      }

      await tx.assetTransaction.create({
        data: {
          assetId: created.id,
          transactionType: 'HIERARCHY_ATTACH_CHILD',
          fromStatus: 'NEW',
          toStatus: 'IN_SERVICE',
          performedByUserId: finalUserId || 'usr-default',
          notes: `Created and linked as child asset under parent [${parent.assetId}] (${parent.description})`
        }
      });

      await tx.auditEvent.create({
        data: {
          userId: finalUserId,
          action: 'ASSET_HIERARCHY_ADD_CHILD',
          entityType: 'Asset',
          entityId: created.id,
          beforeState: JSON.stringify({ parentAssetId: null }),
          afterState: JSON.stringify({ parentAssetId: parent.id, parentAssetIdCode: parent.assetId, name: assetTitle })
        }
      });

      return created;
    });

    res.status(201).json({
      success: true,
      message: `Child asset [${newChild.assetId}] successfully created and linked under parent [${parent.assetId}].`,
      asset: newChild
    });
  } catch (err) {
    next(err);
  }
}

export async function removeParentRelationship(req, res, next) {
  try {
    const { id } = req.params;

    // Resolve User for audit
    let finalUserId = req.user?.id;
    const userInDb = await prisma.user.findFirst({
      where: {
        OR: [
          ...(finalUserId ? [{ id: finalUserId }] : []),
          { username: req.user?.username || 'admin' }
        ]
      }
    });
    finalUserId = userInDb ? userInDb.id : (await prisma.user.findFirst())?.id || null;

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id }, { assetId: id }] }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset [${id}] not found.` });
    }

    const previousParentId = asset.parentAssetId;
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        parentAssetId: null,
        updatedByUserId: finalUserId
      }
    });

    // Record Asset Transaction
    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'HIERARCHY_REMOVE_PARENT',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: finalUserId || 'usr-default',
        notes: `Detached from parent asset. Now a standalone root asset.`
      }
    });

    // Record Audit Log
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'ASSET_HIERARCHY_REMOVE',
        entityType: 'Asset',
        entityId: asset.id,
        beforeState: JSON.stringify({ parentAssetId: previousParentId }),
        afterState: JSON.stringify({ parentAssetId: null })
      }
    });

    res.json({
      success: true,
      message: `Removed parent relationship for [${asset.assetId}]. Asset is now a standalone root system.`,
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
        action: {
          in: ['ASSET_HIERARCHY_CHANGE', 'ASSET_HIERARCHY_ADD_CHILD', 'ASSET_HIERARCHY_REMOVE', 'ASSET_HIERARCHY_ASSIGN_PARENT']
        },
        ...(req.query.assetId ? { entityId: req.query.assetId } : {})
      },
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const parseState = value => {
      try { return JSON.parse(value || '{}'); } catch { return {}; }
    };
    const formatted = history.map((h) => ({
      id: h.id,
      previousParent: parseState(h.beforeState).parentAssetId || null,
      newParent: parseState(h.afterState).parentAssetIdCode || parseState(h.afterState).parentAssetId || null,
      action: h.action,
      entityId: h.entityId,
      user: h.user ? h.user.fullName || h.user.username : 'System Administrator',
      timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString('en-GB') : '-',
      details: typeof h.afterState === 'string' ? h.afterState : JSON.stringify(h.afterState)
    }));

    res.json({
      success: true,
      history: formatted
    });
  } catch (err) {
    next(err);
  }
}


