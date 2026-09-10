import prisma from '../../config/prisma.js';

export async function getDisposedAssets(req, res, next) {
  try {
    const assets = await prisma.asset.findMany({
      where: { lifecycleStatus: { in: ['RETIRED', 'DISPOSED'] } },
      include: {
        category: true,
        company: true,
        site: true,
        building: true,
        room: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const assetIds = assets.map(a => a.id);
    const transactions = await prisma.assetTransaction.findMany({
      where: {
        assetId: { in: assetIds },
        transactionType: 'DISPOSE'
      },
      include: {
        performedBy: { select: { id: true, username: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const txMap = new Map();
    transactions.forEach(t => {
      if (!txMap.has(t.assetId)) {
        txMap.set(t.assetId, t);
      }
    });

    const enrichedAssets = assets.map(a => ({
      ...a,
      disposalTx: txMap.get(a.id) || null
    }));

    res.json({ success: true, assets: enrichedAssets });
  } catch (err) { next(err); }
}

export async function getDisposalSummary(req, res, next) {
  try {
    const [allAssets, disposeTxs] = await Promise.all([
      prisma.asset.findMany({ select: { lifecycleStatus: true, active: true } }),
      prisma.assetTransaction.findMany({ where: { transactionType: 'DISPOSE' }, select: { notes: true } })
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
    const userId = req.user?.id || req.user?._id;

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.lifecycleStatus === 'DISPOSED' || asset.lifecycleStatus === 'RETIRED' || asset.active === false) {
      return res.status(400).json({
        success: false,
        message: `This asset (${asset.tagNumber || asset.assetId}) has already been disposed of or retired.`
      });
    }

    const previousStatus = asset.lifecycleStatus || 'IN_SERVICE';

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        lifecycleStatus: 'DISPOSED',
        active: false,
        updatedByUserId: userId
      }
    });

    const tx = await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'DISPOSE',
        fromStatus: previousStatus,
        toStatus: 'DISPOSED',
        performedByUserId: userId,
        notes: `Disposed via ${method}. Proceeds: $${estimatedProceeds}. Reason: ${reason}`
      }
    });

    const populatedAsset = await prisma.asset.findUnique({
      where: { id: asset.id },
      include: {
        category: true,
        company: true,
        site: true,
        building: true,
        room: true
      }
    });

    res.json({
      success: true,
      asset: { ...populatedAsset, disposalTx: tx }
    });
  } catch (err) { next(err); }
}
