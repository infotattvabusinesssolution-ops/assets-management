import prisma from '../../config/prisma.js';

export async function getCampaigns(req, res, next) {
  try {
    const campaigns = await prisma.stocktakeCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, campaigns });
  } catch (err) { next(err); }
}

export async function createCampaign(req, res, next) {
  try {
    const { title, scope = {}, mode = 'FULL_CENSUS', startDate, endDate } = req.body;
    const campaignNumber = 'STK-' + Date.now().toString(36).toUpperCase();
    const userId = req.user?.id || req.user?._id;

    let companyId = scope.companyId;
    let siteId = scope.siteId;

    if (!companyId) {
      const defaultCompany = await prisma.company.findFirst({ where: { active: true } });
      companyId = defaultCompany?.id;
    }

    if (!siteId && !scope.allowAllSites) {
      const defaultSite = await prisma.site.findFirst({ where: { active: true } });
      siteId = defaultSite?.id;
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'A valid Company entity is required to launch a stocktake campaign.'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const campaign = await tx.stocktakeCampaign.create({
        data: {
          campaignNumber,
          title,
          companyId,
          siteId: siteId || (await tx.site.findFirst({ where: { active: true } }))?.id || '',
          buildingId: scope.buildingId || null,
          categoryId: scope.categoryId || null,
          mode: mode || 'FULL_CENSUS',
          status: 'ACTIVE',
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          createdByUserId: userId
        }
      });

      const whereClause = { active: true };
      if (companyId) whereClause.companyId = companyId;
      if (siteId) whereClause.siteId = siteId;
      if (scope.buildingId) whereClause.buildingId = scope.buildingId;
      if (scope.categoryId) whereClause.categoryId = scope.categoryId;

      const assets = await tx.asset.findMany({ where: whereClause });

      if (assets.length > 0) {
        await tx.stocktakeExpectedAsset.createMany({
          data: assets.map(a => ({
            campaignId: campaign.id,
            assetId: a.id,
            expectedSiteId: a.siteId,
            expectedRoomId: a.roomId,
            expectedCustodianId: a.custodianId,
            status: 'PENDING'
          }))
        });
      }

      const updatedCampaign = await tx.stocktakeCampaign.update({
        where: { id: campaign.id },
        data: { totalExpected: assets.length }
      });

      return updatedCampaign;
    });

    res.status(201).json({ success: true, campaign: result });
  } catch (err) { next(err); }
}

export async function getCampaignDetails(req, res, next) {
  try {
    const { id } = req.params;
    const campaign = await prisma.stocktakeCampaign.findUnique({ where: { id } });

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const [rawExpectedAssets, rawObservations, rawExceptions] = await Promise.all([
      prisma.stocktakeExpectedAsset.findMany({
        where: { campaignId: id },
        take: 300
      }),
      prisma.stocktakeObservation.findMany({
        where: { campaignId: id },
        include: { observedCustodian: true },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.stocktakeException.findMany({
        where: { campaignId: id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const assetIds = [
      ...new Set([
        ...rawExpectedAssets.map(e => e.assetId).filter(Boolean),
        ...rawObservations.map(o => o.assetId).filter(Boolean),
        ...rawExceptions.map(ex => ex.assetId).filter(Boolean)
      ])
    ];

    const siteIds = [...new Set(rawExpectedAssets.map(e => e.expectedSiteId).filter(Boolean))];
    const roomIds = [...new Set(rawExpectedAssets.map(e => e.expectedRoomId).filter(Boolean))];

    const [assets, sites, rooms] = await Promise.all([
      assetIds.length > 0 ? prisma.asset.findMany({ where: { id: { in: assetIds } } }) : [],
      siteIds.length > 0 ? prisma.site.findMany({ where: { id: { in: siteIds } } }) : [],
      roomIds.length > 0 ? prisma.room.findMany({ where: { id: { in: roomIds } } }) : []
    ]);

    const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));
    const siteMap = Object.fromEntries(sites.map(s => [s.id, s]));
    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r]));

    const expectedAssets = rawExpectedAssets.map(exp => ({
      ...exp,
      assetId: assetMap[exp.assetId] || { id: exp.assetId, assetId: exp.assetId, description: 'Asset' },
      expectedSiteId: siteMap[exp.expectedSiteId] || (exp.expectedSiteId ? { name: exp.expectedSiteId } : null),
      expectedRoomId: roomMap[exp.expectedRoomId] || (exp.expectedRoomId ? { name: exp.expectedRoomId } : null)
    }));

    const observations = rawObservations.map(obs => ({
      ...obs,
      assetId: obs.assetId ? (assetMap[obs.assetId] || { id: obs.assetId, description: 'Asset' }) : null
    }));

    const exceptions = rawExceptions.map(ex => ({
      ...ex,
      assetId: ex.assetId ? (assetMap[ex.assetId] || { id: ex.assetId, description: 'Asset' }) : null
    }));

    res.json({
      success: true,
      campaign,
      expectedAssets,
      observations,
      exceptions
    });
  } catch (err) { next(err); }
}

export async function recordObservation(req, res, next) {
  try {
    const { id } = req.params; // campaignId
    const { tagNumber, serialNumber, scanType = 'BARCODE', observedRoomId, observedCustodianId, condition } = req.body;
    const userId = req.user?.id || req.user?._id;

    const result = await prisma.$transaction(async (tx) => {
      let asset = null;
      if (tagNumber) {
        asset = await tx.asset.findFirst({
          where: {
            OR: [
              { tagNumber },
              { assetId: tagNumber },
              { rfidEpc: tagNumber }
            ]
          }
        });
      } else if (serialNumber) {
        asset = await tx.asset.findFirst({ where: { serialNumber } });
      }

      const observation = await tx.stocktakeObservation.create({
        data: {
          campaignId: id,
          assetId: asset ? asset.id : null,
          scannedTagNumber: tagNumber || null,
          scannedSerial: serialNumber || null,
          scanType,
          observedRoomId: observedRoomId || null,
          observedCustodianId: observedCustodianId || null,
          observedCondition: condition || null,
          observedByUserId: userId,
          timestamp: new Date()
        }
      });

      if (asset) {
        const expected = await tx.stocktakeExpectedAsset.findUnique({
          where: { campaignId_assetId: { campaignId: id, assetId: asset.id } }
        });

        let obsStatus = 'VERIFIED_CORRECT';
        if (expected) {
          if (observedRoomId && expected.expectedRoomId && observedRoomId !== expected.expectedRoomId) {
            obsStatus = 'RELOCATED';
          }
          await tx.stocktakeExpectedAsset.update({
            where: { id: expected.id },
            data: { status: obsStatus }
          });
        }

        await tx.stocktakeCampaign.update({
          where: { id },
          data: { totalVerified: { increment: 1 } }
        });

        if (obsStatus === 'RELOCATED') {
          await tx.stocktakeException.create({
            data: {
              campaignId: id,
              assetId: asset.id,
              exceptionType: 'RELOCATED',
              details: { observedRoomId, expectedRoomId: expected ? expected.expectedRoomId : null }
            }
          });
        }
      } else {
        await tx.stocktakeException.create({
          data: {
            campaignId: id,
            exceptionType: 'UNREGISTERED',
            details: { scannedTagNumber: tagNumber, scannedSerial: serialNumber }
          }
        });

        await tx.stocktakeCampaign.update({
          where: { id },
          data: { totalUnregistered: { increment: 1 } }
        });
      }

      return observation;
    });

    res.status(201).json({ success: true, observation: result });
  } catch (err) { next(err); }
}

export async function closeCampaign(req, res, next) {
  try {
    const { id } = req.params;
    const campaign = await prisma.stocktakeCampaign.findUnique({ where: { id } });

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const unverified = await prisma.stocktakeExpectedAsset.findMany({
      where: { campaignId: id, status: 'PENDING' }
    });

    for (const exp of unverified) {
      await prisma.stocktakeExpectedAsset.update({
        where: { id: exp.id },
        data: { status: 'MISSING' }
      });

      await prisma.stocktakeException.create({
        data: {
          campaignId: id,
          assetId: exp.assetId,
          exceptionType: 'MISSING'
        }
      });

      await prisma.asset.update({
        where: { id: exp.assetId },
        data: { lifecycleStatus: 'MISSING' }
      });
    }

    const updatedCampaign = await prisma.stocktakeCampaign.update({
      where: { id },
      data: {
        status: 'CLOSED',
        totalMissing: unverified.length,
        endDate: new Date()
      }
    });

    res.json({ success: true, campaign: updatedCampaign });
  } catch (err) { next(err); }
}

export async function resolveException(req, res, next) {
  try {
    const { id } = req.params;
    const { resolutionStatus = 'RESOLVED', resolutionNotes } = req.body;
    const userId = req.user?.id || req.user?._id;

    const exception = await prisma.stocktakeException.findUnique({ where: { id } });
    if (!exception) return res.status(404).json({ success: false, message: 'Exception not found' });

    const updated = await prisma.stocktakeException.update({
      where: { id },
      data: {
        resolutionStatus,
        resolutionNotes: resolutionNotes || 'Resolved by auditor',
        resolvedByUserId: userId,
        resolvedAt: new Date()
      }
    });

    res.json({ success: true, exception: updated });
  } catch (err) { next(err); }
}
