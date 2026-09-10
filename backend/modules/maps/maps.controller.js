import prisma from '../../config/prisma.js';

export async function getFloorMaps(req, res, next) {
  try {
    const maps = await prisma.floorMap.findMany({
      include: { floor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, maps });
  } catch (err) { next(err); }
}

export async function getFloorMapByFloor(req, res, next) {
  try {
    const { floorId } = req.params;
    const map = await prisma.floorMap.findUnique({
      where: { floorId },
      include: { floor: true }
    });
    if (!map) return res.status(404).json({ success: false, message: 'Floor map not found' });

    const positions = await prisma.assetMapPosition.findMany({
      where: { floorMapId: map.id, active: true },
      include: {
        asset: {
          include: {
            category: { select: { name: true } },
            site: { select: { name: true } },
            building: { select: { name: true } },
            room: { select: { name: true } }
          }
        }
      }
    });

    res.json({ success: true, map, positions });
  } catch (err) { next(err); }
}

export async function createFloorMap(req, res, next) {
  try {
    const { title, floorId, imageUrl, widthMeters, heightMeters } = req.body;
    const map = await prisma.floorMap.create({
      data: {
        title,
        floorId,
        imageUrl,
        widthMeters: widthMeters || 50,
        heightMeters: heightMeters || 30
      }
    });
    res.status(201).json({ success: true, map });
  } catch (err) { next(err); }
}

export async function setAssetPosition(req, res, next) {
  try {
    const { assetId, floorMapId, xRatio, yRatio, zoneId } = req.body;
    const userId = req.user?.id || req.user?._id;

    await prisma.assetMapPosition.updateMany({
      where: { assetId, active: true },
      data: { active: false }
    });

    const position = await prisma.assetMapPosition.create({
      data: {
        assetId,
        floorMapId,
        xRatio: Math.max(0, Math.min(1, parseFloat(xRatio))),
        yRatio: Math.max(0, Math.min(1, parseFloat(yRatio))),
        zoneId: zoneId || null,
        updatedByUserId: userId,
        active: true
      },
      include: {
        asset: {
          include: {
            category: { select: { name: true } },
            site: { select: { name: true } },
            building: { select: { name: true } },
            room: { select: { name: true } }
          }
        }
      }
    });

    res.status(201).json({ success: true, position });
  } catch (err) { next(err); }
}

export async function locateAssetOnMap(req, res, next) {
  try {
    const { assetId } = req.params;

    const asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { id: assetId },
          { assetId },
          { tagNumber: assetId }
        ]
      },
      include: {
        category: { select: { name: true } },
        site: { select: { name: true } },
        building: { select: { name: true } },
        room: { select: { name: true } }
      }
    });

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const position = await prisma.assetMapPosition.findFirst({
      where: { assetId: asset.id, active: true },
      include: {
        floorMap: {
          include: { floor: true }
        }
      }
    });

    if (!position) {
      return res.status(404).json({ success: false, message: 'Asset position is not mapped yet', asset });
    }

    res.json({ success: true, asset, position });
  } catch (err) { next(err); }
}
