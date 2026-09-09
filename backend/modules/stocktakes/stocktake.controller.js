import { StocktakeCampaign } from '../../models/StocktakeCampaign.js';
import { StocktakeExpectedAsset } from '../../models/StocktakeExpectedAsset.js';
import { StocktakeObservation } from '../../models/StocktakeObservation.js';
import { StocktakeException } from '../../models/StocktakeException.js';
import { Asset } from '../../models/Asset.js';
import { withTransaction } from '../../config/db.js';

export async function getCampaigns(req, res, next) {
  try {
    const campaigns = await StocktakeCampaign.find()
      .populate('scope.companyId')
      .populate('scope.siteId')
      .populate('createdBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, campaigns });
  } catch (err) { next(err); }
}

export async function createCampaign(req, res, next) {
  try {
    const { title, scope, mode = 'FULL_CENSUS' } = req.body;
    const campaignNumber = 'STK-' + Date.now().toString(36).toUpperCase();

    const result = await withTransaction(async (session) => {
      const [campaign] = await StocktakeCampaign.create([{
        campaignNumber,
        title,
        scope,
        mode,
        status: 'ACTIVE',
        startDate: new Date(),
        createdBy: req.user._id
      }], { session });

      // Build expected assets population snapshot
      const query = { companyId: scope.companyId, siteId: scope.siteId, active: true };
      if (scope.buildingId) query.buildingId = scope.buildingId;
      if (scope.categoryId) query.categoryId = scope.categoryId;

      const assets = await Asset.find(query);
      const expectedDocs = assets.map(a => ({
        campaignId: campaign._id,
        assetId: a._id,
        expectedSiteId: a.siteId,
        expectedRoomId: a.roomId,
        expectedCustodianId: a.custodianId,
        status: 'PENDING'
      }));

      if (expectedDocs.length > 0) {
        await StocktakeExpectedAsset.insertMany(expectedDocs, { session });
      }

      campaign.stats.totalExpected = assets.length;
      await campaign.save({ session });

      return campaign;
    });

    res.status(201).json({ success: true, campaign: result });
  } catch (err) { next(err); }
}

export async function getCampaignDetails(req, res, next) {
  try {
    const { id } = req.params;
    const campaign = await StocktakeCampaign.findById(id)
      .populate('scope.companyId')
      .populate('scope.siteId')
      .populate('scope.buildingId')
      .populate('scope.categoryId')
      .populate('createdBy');

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const [expectedAssets, observations, exceptions] = await Promise.all([
      StocktakeExpectedAsset.find({ campaignId: id })
        .populate({ path: 'assetId', populate: { path: 'categoryId' } })
        .populate('expectedSiteId')
        .populate('expectedRoomId')
        .populate('expectedCustodianId')
        .limit(300),
      StocktakeObservation.find({ campaignId: id })
        .populate({ path: 'assetId', populate: { path: 'categoryId' } })
        .populate('observedRoomId')
        .populate('observedCustodianId')
        .populate('observedBy')
        .sort({ timestamp: -1 }),
      StocktakeException.find({ campaignId: id })
        .populate({ path: 'assetId', populate: { path: 'categoryId' } })
        .populate('resolvedBy')
        .sort({ createdAt: -1 })
    ]);

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

    const result = await withTransaction(async (session) => {
      // Find matching asset
      let asset = null;
      if (tagNumber) {
        asset = await Asset.findOne({ $or: [{ tagNumber }, { assetId: tagNumber }, { rfidEpc: tagNumber }] });
      } else if (serialNumber) {
        asset = await Asset.findOne({ serialNumber });
      }

      const observation = await StocktakeObservation.create([{
        campaignId: id,
        assetId: asset ? asset._id : null,
        scannedTagNumber: tagNumber,
        scannedSerial: serialNumber,
        scanType,
        observedRoomId,
        observedCustodianId,
        observedCondition: condition,
        observedBy: req.user._id,
        timestamp: new Date()
      }], { session }).then(res => res[0]);

      if (asset) {
        const expected = await StocktakeExpectedAsset.findOne({ campaignId: id, assetId: asset._id });
        let obsStatus = 'VERIFIED_CORRECT';

        if (expected) {
          if (observedRoomId && expected.expectedRoomId && observedRoomId.toString() !== expected.expectedRoomId.toString()) {
            obsStatus = 'RELOCATED';
          }
          expected.status = obsStatus;
          await expected.save({ session });
        }

        // Update campaign stats
        await StocktakeCampaign.findByIdAndUpdate(id, {
          $inc: { 'stats.totalVerified': 1 }
        }, { session });

        if (obsStatus === 'RELOCATED') {
          await StocktakeException.create([{
            campaignId: id,
            assetId: asset._id,
            exceptionType: 'RELOCATED',
            details: { observedRoomId, expectedRoomId: expected ? expected.expectedRoomId : null }
          }], { session });
        }
      } else {
        // Unregistered Asset Observation
        await StocktakeException.create([{
          campaignId: id,
          exceptionType: 'UNREGISTERED',
          details: { scannedTagNumber: tagNumber, scannedSerial: serialNumber }
        }], { session });

        await StocktakeCampaign.findByIdAndUpdate(id, {
          $inc: { 'stats.totalUnregistered': 1 }
        }, { session });
      }

      return observation;
    });

    res.status(201).json({ success: true, observation: result });
  } catch (err) { next(err); }
}

export async function closeCampaign(req, res, next) {
  try {
    const { id } = req.params;
    const campaign = await StocktakeCampaign.findById(id);

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // Mark pending expected assets as MISSING
    const unverified = await StocktakeExpectedAsset.find({ campaignId: id, status: 'PENDING' });
    for (const exp of unverified) {
      exp.status = 'MISSING';
      await exp.save();

      await StocktakeException.create({
        campaignId: id,
        assetId: exp.assetId,
        exceptionType: 'MISSING'
      });

      // Update asset lifecycle status
      await Asset.findByIdAndUpdate(exp.assetId, { lifecycleStatus: 'MISSING' });
    }

    campaign.status = 'CLOSED';
    campaign.stats.totalMissing = unverified.length;
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (err) { next(err); }
}

export async function resolveException(req, res, next) {
  try {
    const { id } = req.params;
    const { resolutionStatus = 'RESOLVED', resolutionNotes } = req.body;

    const exception = await StocktakeException.findById(id);
    if (!exception) return res.status(404).json({ success: false, message: 'Exception not found' });

    exception.resolutionStatus = resolutionStatus;
    exception.resolutionNotes = resolutionNotes || 'Resolved by auditor';
    exception.resolvedBy = req.user._id;
    exception.resolvedAt = new Date();
    await exception.save();

    res.json({ success: true, exception });
  } catch (err) { next(err); }
}

