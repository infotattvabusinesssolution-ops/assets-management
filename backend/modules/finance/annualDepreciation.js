import Decimal from 'decimal.js';

export function completedDepreciationYears(startDate, throughDate) {
  const start = new Date(startDate);
  const through = new Date(throughDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(through.getTime())) return 0;
  const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const throughDay = Date.UTC(through.getUTCFullYear(), through.getUTCMonth(), through.getUTCDate());
  if (throughDay < startDay) return 0;
  let years = through.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(Date.UTC(
    start.getUTCFullYear() + years, start.getUTCMonth(), start.getUTCDate()
  ));
  if (throughDay < anniversary.getTime()) years--;
  return Math.max(0, years);
}

export function annualDepreciationDue({ capitalizationValue, residualValue, accumulatedDepreciation,
  netBookValue, annualRatePercent, usefulLifeMonths, capitalizationDate, throughDate }) {
  const years = completedDepreciationYears(capitalizationDate, throughDate);
  if (years < 1) return new Decimal(0);

  const cost = new Decimal(capitalizationValue || 0);
  const residual = new Decimal(residualValue || 0);
  const accumulated = new Decimal(accumulatedDepreciation || 0);
  const net = new Decimal(netBookValue ?? capitalizationValue ?? 0);
  const depreciableBase = Decimal.max(0, cost.sub(residual));
  const rate = new Decimal(annualRatePercent || 0);
  const annualAmount = rate.gt(0)
    ? cost.mul(rate).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : depreciableBase.mul(12).div(usefulLifeMonths || 60).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const targetAccumulated = Decimal.min(depreciableBase, annualAmount.mul(years));
  return Decimal.max(0, Decimal.min(targetAccumulated.sub(accumulated), net.sub(residual)));
}
