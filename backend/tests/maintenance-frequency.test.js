import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceDueDate } from '../modules/maintenance/maintenanceFrequency.js';

test('maintenance plans advance by the selected calendar unit', () => {
  const start = new Date('2026-01-15T12:00:00Z');
  assert.equal(advanceDueDate(start, 'DAYS', 10).toISOString(), '2026-01-25T12:00:00.000Z');
  assert.equal(advanceDueDate(start, 'WEEKS', 2).toISOString(), '2026-01-29T12:00:00.000Z');
  assert.equal(advanceDueDate(start, 'MONTHS', 3).toISOString(), '2026-04-15T12:00:00.000Z');
  assert.equal(advanceDueDate(start, 'YEARS', 1).toISOString(), '2027-01-15T12:00:00.000Z');
  assert.equal(start.toISOString(), '2026-01-15T12:00:00.000Z');
});

test('month and year recurrence clamp dates at month end', () => {
  assert.equal(advanceDueDate(new Date('2026-01-31T12:00:00Z'), 'MONTHS', 1).toISOString(), '2026-02-28T12:00:00.000Z');
  assert.equal(advanceDueDate(new Date('2024-02-29T12:00:00Z'), 'YEARS', 1).toISOString(), '2025-02-28T12:00:00.000Z');
});
