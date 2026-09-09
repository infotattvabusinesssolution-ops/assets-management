import Decimal from 'decimal.js';
import { FiscalPeriod } from '../../models/FiscalPeriod.js';
import { DepreciationRun } from '../../models/DepreciationRun.js';
import { DepreciationEntry } from '../../models/DepreciationEntry.js';
import { AssetBookValue } from '../../models/AssetBookValue.js';
import { Asset } from '../../models/Asset.js';
import { withTransaction } from '../../config/db.js';

export async function getFinancialSummary(req, res, next) {
  try {
    const books = await AssetBookValue.find({ bookType: 'CORPORATE' });
    let totalAssetValue = new Decimal(0);
    let totalAccumulatedDep = new Decimal(0);
    let totalNetBookValue = new Decimal(0);

    for (const b of books) {
      if (b.capitalizationValue) totalAssetValue = totalAssetValue.add(b.capitalizationValue.toString());
      if (b.accumulatedDepreciation) totalAccumulatedDep = totalAccumulatedDep.add(b.accumulatedDepreciation.toString());
      if (b.netBookValue) totalNetBookValue = totalNetBookValue.add(b.netBookValue.toString());
    }

    const [runs, activePeriod] = await Promise.all([
      DepreciationRun.find(),
      FiscalPeriod.findOne({ isClosed: false }).sort({ year: -1, periodNumber: -1 })
    ]);

    const draftRunsCount = runs.filter(r => r.status === 'DRAFT').length;
    const postedRunsCount = runs.filter(r => r.status === 'POSTED').length;

    let currentPeriodDep = new Decimal(0);
    if (activePeriod) {
      const periodRuns = runs.filter(r => r.fiscalPeriodId?.toString() === activePeriod._id.toString());
      for (const pr of periodRuns) {
        if (pr.totalDepreciationAmount) {
          currentPeriodDep = currentPeriodDep.add(pr.totalDepreciationAmount.toString());
        }
      }
    }

    res.json({
      success: true,
      summary: {
        totalAssetValue: totalAssetValue.toString(),
        totalAccumulatedDep: totalAccumulatedDep.toString(),
        totalNetBookValue: totalNetBookValue.toString(),
        currentPeriodDep: currentPeriodDep.toString(),
        draftRunsCount,
        postedRunsCount
      }
    });
  } catch (err) { next(err); }
}

export async function getFiscalPeriods(req, res, next) {
  try {
    const periods = await FiscalPeriod.find().populate('companyId').sort({ year: -1, periodNumber: -1 });
    res.json({ success: true, periods });
  } catch (err) { next(err); }
}

export async function createFiscalPeriod(req, res, next) {
  try {
    const period = await FiscalPeriod.create(req.body);
    res.status(201).json({ success: true, period });
  } catch (err) { next(err); }
}

export async function toggleFiscalPeriodStatus(req, res, next) {
  try {
    const { id } = req.params;
    const period = await FiscalPeriod.findById(id);
    if (!period) return res.status(404).json({ success: false, message: 'Fiscal period not found' });

    period.isClosed = !period.isClosed;
    if (period.isClosed) {
      period.closedAt = new Date();
      period.closedBy = req.user._id;
    } else {
      period.closedAt = undefined;
      period.closedBy = undefined;
    }
    await period.save();

    res.json({ success: true, period });
  } catch (err) { next(err); }
}

export async function getDepreciationRuns(req, res, next) {
  try {
    const runs = await DepreciationRun.find()
      .populate('companyId')
      .populate('fiscalPeriodId')
      .populate('postedBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, runs });
  } catch (err) { next(err); }
}

export async function getRunDetails(req, res, next) {
  try {
    const { id } = req.params;
    const depRun = await DepreciationRun.findById(id)
      .populate('companyId')
      .populate('fiscalPeriodId')
      .populate('postedBy');

    if (!depRun) return res.status(404).json({ success: false, message: 'Depreciation run not found' });

    const entries = await DepreciationEntry.find({ depreciationRunId: id })
      .populate({ path: 'assetId', populate: { path: 'categoryId' } })
      .sort({ createdAt: 1 });

    res.json({ success: true, depRun, entries });
  } catch (err) { next(err); }
}

export async function runDepreciation(req, res, next) {
  try {
    const { companyId, fiscalPeriodId, bookType = 'CORPORATE' } = req.body;
    const runNumber = 'DEP-' + Date.now().toString(36).toUpperCase();

    const period = await FiscalPeriod.findById(fiscalPeriodId);
    if (!period || period.isClosed) {
      return res.status(400).json({ success: false, message: 'Cannot calculate depreciation for a closed or invalid fiscal period' });
    }

    const result = await withTransaction(async (session) => {
      const [depRun] = await DepreciationRun.create([{
        runNumber,
        companyId,
        fiscalPeriodId,
        bookType,
        status: 'DRAFT'
      }], { session });

      // Fetch active assets in company
      const assets = await Asset.find({ companyId, active: true });
      let totalProcessed = 0;
      let totalDepAmount = new Decimal(0);
      const entriesDocs = [];

      for (const asset of assets) {
        const bookVal = await AssetBookValue.findOne({ assetId: asset._id, bookType });
        if (!bookVal) continue;

        const capVal = new Decimal(bookVal.capitalizationValue ? bookVal.capitalizationValue.toString() : '0');
        const resVal = new Decimal(bookVal.residualValue ? bookVal.residualValue.toString() : '0');
        const accumDep = new Decimal(bookVal.accumulatedDepreciation ? bookVal.accumulatedDepreciation.toString() : '0');
        const nbv = new Decimal(bookVal.netBookValue ? bookVal.netBookValue.toString() : capVal.toString());

        if (nbv.lte(resVal)) continue; // Fully depreciated

        const depreciableBase = capVal.sub(resVal);
        const usefulMonths = bookVal.usefulLifeMonths || 60;
        
        // Monthly straight-line calculation with exact financial precision
        let monthlyDep = depreciableBase.div(usefulMonths).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        if (nbv.sub(monthlyDep).lt(resVal)) {
          monthlyDep = nbv.sub(resVal);
        }

        const closingNbv = nbv.sub(monthlyDep);
        const newAccumDep = accumDep.add(monthlyDep);

        entriesDocs.push({
          depreciationRunId: depRun._id,
          assetId: asset._id,
          fiscalPeriodId,
          openingNetBookValue: nbv.toString(),
          depreciationAmount: monthlyDep.toString(),
          accumulatedDepreciation: newAccumDep.toString(),
          closingNetBookValue: closingNbv.toString(),
          isPosted: false
        });

        totalProcessed++;
        totalDepAmount = totalDepAmount.add(monthlyDep);
      }

      if (entriesDocs.length > 0) {
        await DepreciationEntry.insertMany(entriesDocs, { session });
      }

      depRun.totalAssetsProcessed = totalProcessed;
      depRun.totalDepreciationAmount = totalDepAmount.toString();
      await depRun.save({ session });

      return { depRun, entriesCount: entriesDocs.length };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function postDepreciationRun(req, res, next) {
  try {
    const { id } = req.params;

    const depRunCheck = await DepreciationRun.findById(id);
    if (!depRunCheck || depRunCheck.status === 'POSTED') {
      return res.status(400).json({ success: false, message: 'Depreciation run not found or already posted' });
    }

    const period = await FiscalPeriod.findById(depRunCheck.fiscalPeriodId);
    if (period && period.isClosed) {
      return res.status(400).json({ success: false, message: 'Cannot post depreciation run for a closed fiscal period' });
    }

    const result = await withTransaction(async (session) => {
      const depRun = await DepreciationRun.findById(id).session(session);

      const entries = await DepreciationEntry.find({ depreciationRunId: id }).session(session);
      for (const entry of entries) {
        await AssetBookValue.findOneAndUpdate(
          { assetId: entry.assetId, bookType: depRun.bookType },
          {
            accumulatedDepreciation: entry.accumulatedDepreciation,
            netBookValue: entry.closingNetBookValue
          },
          { session }
        );
        entry.isPosted = true;
        await entry.save({ session });
      }

      depRun.status = 'POSTED';
      depRun.postedAt = new Date();
      depRun.postedBy = req.user._id;
      await depRun.save({ session });

      return depRun;
    });

    res.json({ success: true, depreciationRun: result });
  } catch (err) { next(err); }
}
