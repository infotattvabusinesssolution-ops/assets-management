import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { bulkAssetFields, bulkAssetSampleRows, parseBulkAssetRows } from '../src/pages/bulkAssetFields.js';

test('downloaded three-row Excel example can be parsed with all registration columns', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Asset Upload Template');
  sheet.columns = bulkAssetFields.map(([key, header]) => ({ key, header }));
  bulkAssetSampleRows.forEach(row => sheet.addRow(row));
  const bytes = await workbook.xlsx.writeBuffer();

  const uploaded = new ExcelJS.Workbook();
  await uploaded.xlsx.load(bytes);
  const parsedRows = [];
  uploaded.worksheets[0].eachRow(row => parsedRows.push(
    Array.from({ length: uploaded.worksheets[0].columnCount }, (_, index) =>
      String(row.getCell(index + 1).value ?? '').trim())
  ));
  const records = parseBulkAssetRows(parsedRows);
  assert.equal(records.length, 3);
  assert.equal(records[0].assetName, 'Bulk Sample Laptop');
  assert.equal(records[0].pmTitle, 'Laptop quarterly inspection');
  assert.equal(records[0].warrantyEndDate, '2028-10-09');
  assert.equal(records[1].category, 'Monitor');
  assert.equal(records[2].category, 'Generator');
  assert.ok(records.every(record => !record.assetTagBarcode && !record.rfidEpc));
  assert.ok(bulkAssetFields.every(([, header]) => !/document/i.test(header)));
});
