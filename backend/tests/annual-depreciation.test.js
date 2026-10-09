import test from 'node:test';
import assert from 'node:assert/strict';
import { annualDepreciationDue, completedDepreciationYears } from '../modules/finance/annualDepreciation.js';

const book = {
  capitalizationValue: 1000,
  residualValue: 100,
  accumulatedDepreciation: 0,
  netBookValue: 1000,
  annualRatePercent: 5,
  usefulLifeMonths: 240,
  capitalizationDate: '2025-10-09T12:00:00Z'
};

test('no depreciation is due before the first anniversary', () => {
  assert.equal(annualDepreciationDue({ ...book, throughDate: '2026-10-08T23:59:59Z' }).toString(), '0');
  assert.equal(annualDepreciationDue({ ...book, throughDate: '2026-10-09T00:00:00Z' }).toString(), '50');
});

test('completed years catch up once without repeating posted depreciation', () => {
  assert.equal(annualDepreciationDue({ ...book, throughDate: '2027-10-09T00:00:00Z' }).toString(), '100');
  assert.equal(annualDepreciationDue({ ...book, accumulatedDepreciation: 50, netBookValue: 950, throughDate: '2027-10-09T00:00:00Z' }).toString(), '50');
});

test('annual depreciation stops at the residual value', () => {
  assert.equal(annualDepreciationDue({ ...book, accumulatedDepreciation: 875, netBookValue: 125, throughDate: '2045-10-09T00:00:00Z' }).toString(), '25');
});

test('leap day anniversary completes on March 1 in a non-leap year', () => {
  assert.equal(completedDepreciationYears('2024-02-29', '2025-02-28'), 0);
  assert.equal(completedDepreciationYears('2024-02-29', '2025-03-01'), 1);
});
