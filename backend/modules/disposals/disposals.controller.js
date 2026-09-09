import { Asset } from '../../models/Asset.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';

export async function getDisposedAssets(req, res, next) {
  try {
    const assets = await Asset.find({ lifecycleStatus: { $in: ['RETIRED', 'DISPOSED'] } })
      .populate('categoryId')
      .populate('companyId')
      .populate('siteId')
      .populate('buildingId')
      .populate('roomId')
      .sort({ updatedAt: -1 });

    const assetIds = assets.map(a => a._id);
    const transactions = await AssetTransaction.find({ 
      assetId: { $in: assetIds }, 
      transactionType: 'DISPOSE' 
    })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    const txMap = new Map();
    transactions.forEach(t => {
      if (!txMap.has(t.assetId.toString())) {
        txMap.set(t.assetId.toString(), t);
      }
    });

    const enrichedAssets = assets.map(a => {
      const tx = txMap.get(a._id.toString());
      return {
        ...a.toObject(),
        disposalTx: tx || null
      };
    });

    res.json({ success: true, assets: enrichedAssets });
  } catch (err) { next(err); }
}

export async function getDisposalSummary(req, res, next) {
  try {
    const [allAssets, disposeTxs] = await Promise.all([
      Asset.find(),
      AssetTransaction.find({ transactionType: 'DISPOSE' })
    ]);

    let activeCandidatesCount = 0;
    let disposedCount = 0;
    let retiredCount = 0;

    allAssets.forEach(a => {
      if (a.lifecycleStatus === 'DISPOSED') disposedCount++;
      else if (a.lifecycleStatus === 'RETIRED') retiredCount++;
      else if (a.active !== false) activeCandidatesCount++;
    });

    let totalProceeds = 0;
    disposeTxs.forEach(tx => {
      if (tx.notes) {
        const match = tx.notes.match(/Proceeds:\s*\$?([\d.]+)/i);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (!isNaN(val)) totalProceeds += val;
        }
      }
    });

    res.json({
      success: true,
      summary: {
        activeCandidatesCount,
        disposedCount,
        retiredCount,
        totalProceeds
      }
    });
  } catch (err) { next(err); }
}

export async function initiateDisposal(req, res, next) {
  try {
    const { assetId, method = 'SCRAP', estimatedProceeds = 0, reason } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.lifecycleStatus === 'DISPOSED' || asset.lifecycleStatus === 'RETIRED' || asset.active === false) {
      return res.status(400).json({ 
        success: false, 
        message: `This asset (${asset.tagNumber || asset.assetId}) has already been disposed of or retired.` 
      });
    }

    const previousStatus = asset.lifecycleStatus || 'ACTIVE';

    asset.lifecycleStatus = 'DISPOSED';
    asset.active = false;
    asset.updatedBy = req.user._id;
    await asset.save();

    const tx = await AssetTransaction.create({
      assetId: asset._id,
      transactionType: 'DISPOSE',
      fromStatus: previousStatus,
      toStatus: 'DISPOSED',
      performedBy: req.user._id,
      notes: `Disposed via ${method}. Proceeds: $${estimatedProceeds}. Reason: ${reason}`
    });

    const populatedAsset = await Asset.findById(asset._id)
      .populate('categoryId')
      .populate('companyId')
      .populate('siteId')
      .populate('buildingId')
      .populate('roomId');

    res.json({ 
      success: true, 
      asset: { ...populatedAsset.toObject(), disposalTx: tx } 
    });
  } catch (err) { next(err); }
}

