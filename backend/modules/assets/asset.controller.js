import { Asset, ASSET_STATUSES } from '../../models/Asset.js';
import { AssetBookValue } from '../../models/AssetBookValue.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';
import { MaintenanceWorkOrder } from '../../models/MaintenanceWorkOrder.js';
import { StocktakeObservation } from '../../models/StocktakeObservation.js';
import { AssetMapPosition } from '../../models/AssetMapPosition.js';
import { DiscoveryMatch } from '../../models/DiscoveryMatch.js';
import { Warranty } from '../../models/Warranty.js';
import { Contract } from '../../models/Contract.js';
import { AuditEvent } from '../../models/AuditEvent.js';
import { withTransaction } from '../../config/db.js';

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

    const filter = { ...req.dataScopeFilter };

    if (search) {
      filter.$or = [
        { assetId: new RegExp(search, 'i') },
        { tagNumber: new RegExp(search, 'i') },
        { serialNumber: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { hostname: new RegExp(search, 'i') }
      ];
    }
    if (status) filter.lifecycleStatus = status;
    if (categoryId) filter.categoryId = categoryId;
    if (siteId) filter.siteId = siteId;
    if (companyId) filter.companyId = companyId;
    if (custodianId) filter.custodianId = custodianId;
    if (condition) filter.condition = condition;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('categoryId')
        .populate('companyId')
        .populate('siteId')
        .populate('buildingId')
        .populate('floorId')
        .populate('roomId')
        .populate('custodianId')
        .populate('manufacturerId')
        .populate('modelId')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Asset.countDocuments(filter)
    ]);

    res.json({
      success: true,
      assets,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getAsset360(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate('categoryId')
      .populate('assetClassId')
      .populate('companyId')
      .populate('siteId')
      .populate('buildingId')
      .populate('floorId')
      .populate('roomId')
      .populate('zoneId')
      .populate('departmentId')
      .populate('costCenterId')
      .populate('custodianId')
      .populate('manufacturerId')
      .populate('modelId')
      .populate('parentAssetId');

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
      AssetBookValue.find({ assetId: asset._id }),
      AssetTransaction.find({ assetId: asset._id }).populate('performedBy').sort({ timestamp: -1 }),
      MaintenanceWorkOrder.find({ assetId: asset._id }).populate('assignedTechnicianId').sort({ createdAt: -1 }),
      StocktakeObservation.find({ assetId: asset._id }).populate('campaignId').populate('observedBy').sort({ timestamp: -1 }),
      AssetMapPosition.findOne({ assetId: asset._id, active: true }).populate('floorMapId'),
      DiscoveryMatch.findOne({ matchedAssetId: asset._id }).populate('observationId'),
      Warranty.findOne({ assetId: asset._id }),
      AuditEvent.find({ entityId: asset._id }).populate('userId').sort({ timestamp: -1 }).limit(50)
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
    const result = await withTransaction(async (session) => {
      // Auto-generate Asset ID if missing
      if (!req.body.assetId) {
        req.body.assetId = 'AST-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
      }

      req.body.createdBy = req.user._id;
      req.body.updatedBy = req.user._id;

      const [asset] = await Asset.create([req.body], { session });

      // Create Corporate Financial Book Value record
      const acqValue = req.body.acquisitionValue || 0;
      await AssetBookValue.create([{
        assetId: asset._id,
        bookType: 'CORPORATE',
        capitalizationDate: req.body.inServiceDate || new Date(),
        capitalizationValue: acqValue,
        usefulLifeMonths: req.body.usefulLifeMonths || 60,
        depreciationMethod: 'STRAIGHT_LINE',
        residualValue: 0,
        accumulatedDepreciation: 0,
        netBookValue: acqValue
      }], { session });

      // Log initial transaction
      await AssetTransaction.create([{
        assetId: asset._id,
        transactionType: 'RECEIVE',
        fromStatus: 'NONE',
        toStatus: asset.lifecycleStatus,
        performedBy: req.user._id,
        notes: 'Initial Asset Registration'
      }], { session });

      // Append Audit event
      await AuditEvent.create([{
        userId: req.user._id,
        action: 'ASSET_CREATE',
        entityType: 'Asset',
        entityId: asset._id,
        afterState: asset.toObject()
      }], { session });

      return asset;
    });

    res.status(201).json({ success: true, asset: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;
    const oldAsset = await Asset.findById(id);

    if (!oldAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    req.body.updatedBy = req.user._id;
    const updatedAsset = await Asset.findByIdAndUpdate(id, req.body, { new: true });

    await AuditEvent.create({
      userId: req.user._id,
      action: 'ASSET_UPDATE',
      entityType: 'Asset',
      entityId: updatedAsset._id,
      beforeState: oldAsset.toObject(),
      afterState: updatedAsset.toObject()
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

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const fromStatus = asset.lifecycleStatus;
    asset.lifecycleStatus = toStatus;
    asset.updatedBy = req.user._id;
    await asset.save();

    await AssetTransaction.create({
      assetId: asset._id,
      transactionType: 'STATUS_CHANGE',
      fromStatus,
      toStatus,
      performedBy: req.user._id,
      notes: notes || `Lifecycle state changed from ${fromStatus} to ${toStatus}`
    });

    res.json({ success: true, asset });
  } catch (err) {
    next(err);
  }
}
