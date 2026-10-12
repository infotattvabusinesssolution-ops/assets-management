export const FREQUENCY_LIMITS = Object.freeze({ DAYS: 365, WEEKS: 52, MONTHS: 120, YEARS: 10 });

export function advanceDueDate(date, unit, interval) {
  if (!Number.isInteger(interval) || interval < 1 || !FREQUENCY_LIMITS[unit]) {
    throw new Error('Invalid maintenance frequency.');
  }
  const next = new Date(date);
  if (unit === 'DAYS' || unit === 'WEEKS') {
    next.setUTCDate(next.getUTCDate() + interval * (unit === 'WEEKS' ? 7 : 1));
  } else {
    const day = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + interval * (unit === 'YEARS' ? 12 : 1));
    const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
    next.setUTCDate(Math.min(day, lastDay));
  }
  return next;
}
