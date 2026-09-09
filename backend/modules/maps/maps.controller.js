import { FloorMap } from '../../models/FloorMap.js';
import { AssetMapPosition } from '../../models/AssetMapPosition.js';
import { Asset } from '../../models/Asset.js';

export async function getFloorMaps(req, res, next) {
  try {
    const maps = await FloorMap.find().populate('floorId').sort({ createdAt: -1 });
    res.json({ success: true, maps });
  } catch (err) { next(err); }
}

export async function getFloorMapByFloor(req, res, next) {
  try {
    const { floorId } = req.params;
    const map = await FloorMap.findOne({ floorId }).populate('floorId');
    if (!map) return res.status(404).json({ success: false, message: 'Floor map not found' });

    const positions = await AssetMapPosition.find({ floorMapId: map._id, active: true })
      .populate({
        path: 'assetId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'siteId', select: 'name' },
          { path: 'buildingId', select: 'name' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .populate('updatedBy', 'name email');

    res.json({ success: true, map, positions });
  } catch (err) { next(err); }
}

export async function createFloorMap(req, res, next) {
  try {
    const map = await FloorMap.create(req.body);
    res.status(201).json({ success: true, map });
  } catch (err) { next(err); }
}

export async function setAssetPosition(req, res, next) {
  try {
    const { assetId, floorMapId, xRatio, yRatio, zoneId } = req.body;

    await AssetMapPosition.updateMany(
      { assetId, active: true },
      { active: false }
    );

    const position = await AssetMapPosition.create({
      assetId,
      floorMapId,
      xRatio: Math.max(0, Math.min(1, parseFloat(xRatio))),
      yRatio: Math.max(0, Math.min(1, parseFloat(yRatio))),
      zoneId,
      updatedBy: req.user._id,
      active: true
    });

    const populated = await AssetMapPosition.findById(position._id)
      .populate({
        path: 'assetId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'siteId', select: 'name' },
          { path: 'buildingId', select: 'name' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .populate('updatedBy', 'name email');

    res.status(201).json({ success: true, position: populated });
  } catch (err) { next(err); }
}

export async function locateAssetOnMap(req, res, next) {
  try {
    const { assetId } = req.params;

    const asset = await Asset.findOne({ $or: [{ _id: assetId }, { assetId }, { tagNumber: assetId }] })
      .populate('categoryId', 'name')
      .populate('siteId', 'name')
      .populate('buildingId', 'name')
      .populate('roomId', 'name');

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const position = await AssetMapPosition.findOne({ assetId: asset._id, active: true })
      .populate({
        path: 'floorMapId',
        populate: { path: 'floorId' }
      });

    if (!position) {
      return res.status(404).json({ success: false, message: 'Asset position is not mapped yet', asset });
    }

    res.json({ success: true, asset, position });
  } catch (err) { next(err); }
}

