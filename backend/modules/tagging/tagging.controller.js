import prisma from '../../config/prisma.js';

export async function getTags(req, res, next) {
  try {
    const tags = await prisma.tag.findMany({
      include: { 
        asset: {
          include: {
            category: true,
            site: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, tags });
  } catch (err) { next(err); }
}

export async function getTaggingStats(req, res, next) {
  try {
    const totalTags = await prisma.tag.count();
    const activeAssignedTags = await prisma.tag.count({ where: { status: 'ACTIVE' } });
    const unassignedTags = await prisma.tag.count({ where: { status: 'UNASSIGNED' } });
    const rfidTagsCount = await prisma.tag.count({ where: { rfidEpc: { not: null } } });
    
    // Total assets requiring tagging (RECEIVED status)
    const pendingTaggingAssets = await prisma.asset.count({
      where: { lifecycleStatus: 'RECEIVED' }
    });

    res.json({
      success: true,
      stats: {
        totalTags,
        activeAssignedTags,
        unassignedTags,
        rfidTagsCount,
        pendingTaggingAssets
      }
    });
  } catch (err) { next(err); }
}

export async function generateTags(req, res, next) {
  try {
    const { count = 1, tagType = 'BARCODE_128', prefix = 'TAG' } = req.body;
    const generatedTags = [];

    for (let i = 0; i < count; i++) {
      const num = Math.floor(100000 + Math.random() * 900000);
      const tagNumber = `${prefix}-${num}`;
      const rfidEpc = tagType.includes('RFID') ? `E28011606000${num}` : null;

      const tag = await prisma.tag.create({
        data: {
          tagNumber,
          tagType,
          rfidEpc,
          status: 'UNASSIGNED',
          printedDate: new Date()
        }
      });

      generatedTags.push(tag);
    }

    res.status(201).json({ success: true, tags: generatedTags });
  } catch (err) { next(err); }
}

export async function associateTag(req, res, next) {
  try {
    const { assetId, tagNumber, tagType = 'BARCODE_128', reason = 'Initial Tag Association' } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Find asset by id, assetId, or code
      const asset = await tx.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId: assetId }] }
      });
      
      if (!asset) throw new Error('Asset not found');

      const oldTagNumber = asset.tagNumber;
      const num = Math.floor(100000 + Math.random() * 900000);
      const generatedRfid = tagType.includes('RFID') ? `E28011606000${num}` : (asset.rfidEpc || null);

      let tag = await tx.tag.findUnique({ where: { tagNumber } });
      if (!tag) {
        tag = await tx.tag.create({
          data: {
            tagNumber,
            tagType,
            rfidEpc: generatedRfid,
            assetId: asset.id,
            status: 'ACTIVE',
            printedDate: new Date()
          }
        });
      } else {
        tag = await tx.tag.update({
          where: { id: tag.id },
          data: {
            assetId: asset.id,
            status: 'ACTIVE',
            tagType,
            rfidEpc: generatedRfid || tag.rfidEpc
          }
        });
      }

      const updatedAsset = await tx.asset.update({
        where: { id: asset.id },
        data: {
          tagNumber,
          barcode: tagNumber,
          rfidEpc: tag.rfidEpc || asset.rfidEpc,
          lifecycleStatus: (asset.lifecycleStatus === 'RECEIVED' || asset.lifecycleStatus === 'REQUESTED') ? 'TAGGED' : asset.lifecycleStatus
        }
      });

      if (oldTagNumber && oldTagNumber !== tagNumber) {
        await tx.tagHistory.create({
          data: {
            assetId: asset.id,
            oldTagNumber,
            newTagNumber: tagNumber,
            reason,
            replacedByUserId: req.user.id
          }
        });
      }

      await tx.assetTransaction.create({
        data: {
          assetId: asset.id,
          transactionType: 'TAG',
          fromStatus: asset.lifecycleStatus,
          toStatus: updatedAsset.lifecycleStatus,
          performedByUserId: req.user.id,
          notes: `Tag associated: ${tagNumber} (${tagType})`
        }
      });

      return { asset: updatedAsset, tag };
    });

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getTagHistory(req, res, next) {
  try {
    const history = await prisma.tagHistory.findMany({
      include: {
        asset: true,
        replacedBy: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, history });
  } catch (err) { next(err); }
}
