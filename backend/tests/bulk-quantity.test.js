import test from 'node:test';
import assert from 'node:assert/strict';
import { expandBulkAssetRows } from '../modules/imports/expandBulkAssetRows.js';

test('quantity row becomes distinct assets with unique serials and IDs', () => {
  const items = expandBulkAssetRows([{
    row: 4, assetName: 'Laptop', assetType: 'IT Equipment', category: 'Laptop',
    subcategory: 'Ultrabook', quantity: 3, serialNumbers: 'SN-1;SN-2;SN-3',
    custodian: 'Jane Doe', acquisitionCost: 2500
  }]);
  assert.equal(items.length, 3);
  assert.deepEqual(items.map(item => item.serialNumber), ['SN-1', 'SN-2', 'SN-3']);
  assert.equal(new Set(items.map(item => item.assetId)).size, 3);
  assert.ok(items.every(item => item.row === 4 && item.quantity === 1 && item.custodian === 'Jane Doe'));
});

test('quantity row rejects missing or repeated item serials and shared tags', () => {
  for (const row of [
    { quantity: 3, serialNumbers: 'SN-1;SN-2' },
    { quantity: 2, serialNumbers: 'SN-1;sn-1' },
    { quantity: 2, serialNumbers: 'SN-1;SN-2', assetTagBarcode: 'TAG-1' }
  ]) {
    const result = expandBulkAssetRows([{ row: 2, ...row }]);
    assert.equal(result.length, 1);
    assert.ok(result[0].batchExpansionError);
  }
});
