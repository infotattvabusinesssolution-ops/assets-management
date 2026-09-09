import { Tag } from '../../models/Tag.js';
import { TagHistory } from '../../models/TagHistory.js';
import { Asset } from '../../models/Asset.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';
import { withTransaction } from '../../config/db.js';

export async function getTags(req, res, next) {
  try {
    const tags = await Tag.find().populate('assetId').sort({ createdAt: -1 });
    res.json({ success: true, tags });
  } catch (err) { next(err); }
}

export async function generateTags(req, res, next) {
  try {
    const { count = 1, tagType = 'BARCODE_128', prefix = 'TAG' } = req.body;
    const generatedTags = [];

    for (let i = 0; i < count; i++) {
      const num = Math.floor(100000 + Math.random() * 900000);
      const tagNumber = `${prefix}-${num}`;
      const rfidEpc = tagType.includes('RFID') ? `E28011606000${num}` : undefined;

      const tag = await Tag.create({
        tagNumber,
        tagType,
        rfidEpc,
        status: 'UNASSIGNED',
        printedDate: new Date()
      });

      generatedTags.push(tag);
    }

    res.status(201).json({ success: true, tags: generatedTags });
  } catch (err) { next(err); }
}

export async function associateTag(req, res, next) {
  try {
    const { assetId, tagNumber, reason = 'Initial Tag Association' } = req.body;

    const result = await withTransaction(async (session) => {
      const asset = await Asset.findById(assetId);
      if (!asset) throw new Error('Asset not found');

      const oldTagNumber = asset.tagNumber;

      let tag = await Tag.findOne({ tagNumber });
      if (!tag) {
        tag = await Tag.create([{
          tagNumber,
          tagType: 'BARCODE_128',
          assetId: asset._id,
          status: 'ACTIVE'
        }], { session }).then(res => res[0]);
      } else {
        tag.assetId = asset._id;
        tag.status = 'ACTIVE';
        await tag.save({ session });
      }

      asset.tagNumber = tagNumber;
      if (tag.rfidEpc) asset.rfidEpc = tag.rfidEpc;
      if (asset.lifecycleStatus === 'RECEIVED') asset.lifecycleStatus = 'TAGGED';
      await asset.save({ session });

      if (oldTagNumber) {
        await TagHistory.create([{
          assetId: asset._id,
          oldTagNumber,
          newTagNumber: tagNumber,
          reason,
          replacedBy: req.user._id
        }], { session });
      }

      await AssetTransaction.create([{
        assetId: asset._id,
        transactionType: 'TAG',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedBy: req.user._id,
        notes: `Tag associated: ${tagNumber}`
      }], { session });

      return { asset, tag };
    });

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
