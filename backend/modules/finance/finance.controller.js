import Decimal from 'decimal.js';
import prisma from '../../config/prisma.js';

export async function getFinancialSummary(req, res, next) {
  try {
    const books = await prisma.assetBookValue.findMany({ where: { bookType: 'CORPORATE' } });
    let totalAssetValue = new Decimal(0);
    let totalAccumulatedDep = new Decimal(0);
    let totalNetBookValue = new Decimal(0);

    for (const b of books) {
      if (b.capitalizationValue) totalAssetValue = totalAssetValue.add(b.capitalizationValue.toString());
      if (b.accumulatedDepreciation) totalAccumulatedDep = totalAccumulatedDep.add(b.accumulatedDepreciation.toString());
      if (b.netBookValue) totalNetBookValue = totalNetBookValue.add(b.netBookValue.toString());
    }

    const [runs, activePeriod] = await Promise.all([
      prisma.depreciationRun.findMany(),
      prisma.fiscalPeriod.findFirst({
        where: { isClosed: false },
        orderBy: [{ year: 'desc' }, { periodNumber: 'desc' }]
      })
    ]);

    const draftRunsCount = runs.filter(r => r.status === 'DRAFT').length;
    const postedRunsCount = runs.filter(r => r.status === 'POSTED').length;

    let currentPeriodDep = new Decimal(0);
    if (activePeriod) {
      const periodRuns = runs.filter(r => r.fiscalPeriodId === activePeriod.id);
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
    const periods = await prisma.fiscalPeriod.findMany({
      include: { company: true },
      orderBy: [{ year: 'desc' }, { periodNumber: 'desc' }]
    });
    res.json({ success: true, periods });
  } catch (err) { next(err); }
}

export async function createFiscalPeriod(req, res, next) {
  try {
    const { companyId, year, periodNumber, periodName, startDate, endDate } = req.body;
    const period = await prisma.fiscalPeriod.create({
      data: {
        companyId,
        year: parseInt(year, 10),
        periodNumber: parseInt(periodNumber, 10),
        periodName: periodName || `P${periodNumber}-${year}`,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
    res.status(201).json({ success: true, period });
  } catch (err) { next(err); }
}

export async function toggleFiscalPeriodStatus(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const period = await prisma.fiscalPeriod.findUnique({ where: { id } });
    if (!period) return res.status(404).json({ success: false, message: 'Fiscal period not found' });

    const newClosed = !period.isClosed;
    const updated = await prisma.fiscalPeriod.update({
      where: { id },
      data: {
        isClosed: newClosed,
        closedAt: newClosed ? new Date() : null,
        closedByUserId: newClosed ? userId : null
      }
    });

    res.json({ success: true, period: updated });
  } catch (err) { next(err); }
}

export async function getDepreciationRuns(req, res, next) {
  try {
    const runs = await prisma.depreciationRun.findMany({
      include: {
        company: true,
        fiscalPeriod: true,
        postedBy: { select: { id: true, username: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, runs });
  } catch (err) { next(err); }
}

export async function getRunDetails(req, res, next) {
  try {
    const { id } = req.params;
    const depRun = await prisma.depreciationRun.findUnique({
      where: { id },
      include: {
        company: true,
        fiscalPeriod: true,
        postedBy: { select: { id: true, username: true, fullName: true } }
      }
    });

    if (!depRun) return res.status(404).json({ success: false, message: 'Depreciation run not found' });

    const entries = await prisma.depreciationEntry.findMany({
      where: { depreciationRunId: id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, depRun, entries });
  } catch (err) { next(err); }
}

export async function runDepreciation(req, res, next) {
  try {
    const { companyId, fiscalPeriodId, bookType = 'CORPORATE' } = req.body;
    const runNumber = 'DEP-' + Date.now().toString(36).toUpperCase();

    const period = await prisma.fiscalPeriod.findUnique({ where: { id: fiscalPeriodId } });
    if (!period || period.isClosed) {
      return res.status(400).json({ success: false, message: 'Cannot calculate depreciation for a closed or invalid fiscal period' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const depRun = await tx.depreciationRun.create({
        data: {
          runNumber,
          companyId,
          fiscalPeriodId,
          bookType,
          status: 'DRAFT'
        }
      });

      const assets = await tx.asset.findMany({ where: { companyId, active: true } });
      let totalProcessed = 0;
      let totalDepAmount = new Decimal(0);
      const entriesDocs = [];

      for (const asset of assets) {
        const bookVal = await tx.assetBookValue.findUnique({
          where: { assetId_bookType: { assetId: asset.id, bookType } }
        });
        if (!bookVal) continue;

        const capVal = new Decimal(bookVal.capitalizationValue ? bookVal.capitalizationValue.toString() : '0');
        const resVal = new Decimal(bookVal.residualValue ? bookVal.residualValue.toString() : '0');
        const accumDep = new Decimal(bookVal.accumulatedDepreciation ? bookVal.accumulatedDepreciation.toString() : '0');
        const nbv = new Decimal(bookVal.netBookValue ? bookVal.netBookValue.toString() : capVal.toString());

        if (nbv.lte(resVal)) continue;

        const depreciableBase = capVal.sub(resVal);
        const usefulMonths = bookVal.usefulLifeMonths || 60;

        let monthlyDep = depreciableBase.div(usefulMonths).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

        if (nbv.sub(monthlyDep).lt(resVal)) {
          monthlyDep = nbv.sub(resVal);
        }

        const closingNbv = nbv.sub(monthlyDep);
        const newAccumDep = accumDep.add(monthlyDep);

        entriesDocs.push({
          depreciationRunId: depRun.id,
          assetId: asset.id,
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
        await tx.depreciationEntry.createMany({ data: entriesDocs });
      }

      const updatedRun = await tx.depreciationRun.update({
        where: { id: depRun.id },
        data: {
          totalAssetsProcessed: totalProcessed,
          totalDepreciationAmount: totalDepAmount.toString()
        }
      });

      return { depRun: updatedRun, entriesCount: entriesDocs.length };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function postDepreciationRun(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const depRunCheck = await prisma.depreciationRun.findUnique({ where: { id } });
    if (!depRunCheck || depRunCheck.status === 'POSTED') {
      return res.status(400).json({ success: false, message: 'Depreciation run not found or already posted' });
    }

    const period = await prisma.fiscalPeriod.findUnique({ where: { id: depRunCheck.fiscalPeriodId } });
    if (period && period.isClosed) {
      return res.status(400).json({ success: false, message: 'Cannot post depreciation run for a closed fiscal period' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const entries = await tx.depreciationEntry.findMany({ where: { depreciationRunId: id } });
      for (const entry of entries) {
        await tx.assetBookValue.update({
          where: { assetId_bookType: { assetId: entry.assetId, bookType: depRunCheck.bookType } },
          data: {
            accumulatedDepreciation: entry.accumulatedDepreciation,
            netBookValue: entry.closingNetBookValue
          }
        });
        await tx.depreciationEntry.update({
          where: { id: entry.id },
          data: { isPosted: true }
        });
      }

      const updatedRun = await tx.depreciationRun.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
          postedByUserId: userId
        }
      });

      return updatedRun;
    });

    res.json({ success: true, depreciationRun: result });
  } catch (err) { next(err); }
}
