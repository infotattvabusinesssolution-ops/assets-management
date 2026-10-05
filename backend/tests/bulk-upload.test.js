import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';

describe('Bulk Upload Backend Test Suite', () => {
  before(async () => {
    await setupTestEnvironment();
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  it('1. POST /api/v1/imports/validate - Should validate batch with valid, warning, and error rows', async () => {
    const payload = {
      rows: [
        {
          row: 1,
          name: 'Precision 5820 Tower Workstation',
          category: 'Laptop',
          serialNumber: 'SN-BULK-VALID-001',
          location: 'Dubai HQ',
          custodian: 'John Doe',
          acquisitionValue: 4500,
          currency: 'USD'
        },
        {
          row: 2,
          name: '', // Missing name -> Error
          category: 'Laptop',
          serialNumber: 'SN-BULK-NONAME-002',
          location: 'Dubai HQ',
          acquisitionValue: 3000
        },
        {
          row: 3,
          name: 'Anonymous Serialized Laptop',
          category: 'Laptop',
          serialNumber: '', // Missing serial for Laptop -> Error
          location: 'Dubai HQ'
        },
        {
          row: 4,
          name: 'Duplicate In Batch Laptop',
          category: 'Laptop',
          serialNumber: 'SN-BULK-VALID-001', // Duplicate in same batch -> Error
          location: 'Dubai HQ'
        },
        {
          row: 5,
          name: 'Dell Latitude 7450 Existing Update',
          category: 'Laptop',
          serialNumber: 'DL7450-92118', // Already in DB (from AST-000128) -> Warning
          location: 'Dubai HQ'
        },
        {
          row: 6,
          name: 'Unrecognized Custodian Asset',
          category: 'Monitor',
          serialNumber: 'SN-BULK-CUST-006',
          custodian: 'NonExistent Person XYZ' // Non-existent employee -> Warning
        }
      ]
    };

    const res = await apiRequest('POST', '/api/v1/imports/validate', payload);

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.equal(res.data.totalRecords, 6);
    assert.ok(res.data.validCount >= 1, 'Should have at least 1 valid record');
    assert.ok(res.data.errorCount >= 3, 'Should detect at least 3 errors (empty name, missing serial, batch duplicate)');
    assert.ok(res.data.warningCount >= 2, 'Should detect warnings for existing serial and unassigned custodian');

    const records = res.data.records;
    assert.equal(records[0].status, 'Valid');
    assert.equal(records[1].status, 'Error');
    assert.equal(records[2].status, 'Error');
    assert.equal(records[3].status, 'Error');
    assert.equal(records[4].status, 'Warning');
    assert.equal(records[5].status, 'Warning');
  });

  it('2. POST /api/v1/imports/submit - Should persist new assets and create Book Values & ImportJob record', async () => {
    const testSerialA = `SN-IMPORT-NEW-${Date.now()}-A`;
    const testSerialB = `SN-IMPORT-NEW-${Date.now()}-B`;

    const payload = {
      batchReference: `BATCH-TEST-${Date.now()}`,
      fileName: 'automated_test_assets.xlsx',
      rows: [
        {
          row: 1,
          name: 'Test Bulk Enterprise Asset Alpha',
          category: 'Laptop',
          serialNumber: testSerialA,
          location: 'Dubai HQ',
          custodian: 'John Doe',
          acquisitionValue: 3200,
          currency: 'USD',
          status: 'Valid'
        },
        {
          row: 2,
          name: 'Test Bulk Enterprise Asset Beta',
          category: 'Server',
          serialNumber: testSerialB,
          location: 'Dubai HQ',
          custodian: 'John Doe',
          acquisitionValue: 8500,
          currency: 'USD',
          status: 'Valid'
        }
      ]
    };

    const res = await apiRequest('POST', '/api/v1/imports/submit', payload);

    assert.equal(res.status, 200, 'Submit import should return 200 OK');
    assert.equal(res.data.success, true);
    assert.equal(res.data.createdCount, 2, 'Should create 2 new assets');
    assert.equal(res.data.failedCount, 0, 'Should have 0 failures');
    assert.ok(res.data.jobId, 'Should return generated import job ID');

    // Verify Asset 360 can find the newly imported asset by serial or ID
    const searchRes = await apiRequest('GET', `/api/v1/assets?search=${testSerialA}`);
    assert.equal(searchRes.status, 200);
    assert.ok(searchRes.data.assets.length > 0, 'Newly created asset must be searchable in database');
    const assetA = searchRes.data.assets.find((a) => a.serialNumber === testSerialA);
    assert.ok(assetA, 'Asset Alpha must exist in DB');
    assert.equal(assetA.description, 'Test Bulk Enterprise Asset Alpha');
    assert.equal(Number(assetA.acquisitionValue), 3200);
  });

  it('3. POST /api/v1/imports/submit - Should update existing asset when serial number matches', async () => {
    const payload = {
      batchReference: `BATCH-UPDATE-${Date.now()}`,
      fileName: 'update_existing.xlsx',
      rows: [
        {
          row: 1,
          name: 'Dell Latitude 7450 - Bulk Updated Specs',
          category: 'Laptop',
          serialNumber: 'DL7450-92118', // Matches AST-000128
          location: 'Dubai HQ',
          custodian: 'John Doe',
          acquisitionValue: 6100,
          currency: 'AED',
          status: 'Warning' // marked as warning since serial exists
        }
      ]
    };

    const res = await apiRequest('POST', '/api/v1/imports/submit', payload);

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.updatedCount, 1, 'Should update 1 existing asset');

    // Verify updated asset in DB
    const getRes = await apiRequest('GET', '/api/v1/assets/AST-000128/360');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.asset360.asset.description, 'Dell Latitude 7450 - Bulk Updated Specs');
  });

  it('4. GET /api/v1/imports/history - Should fetch real upload history and execution stats', async () => {
    const res = await apiRequest('GET', '/api/v1/imports/history');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.history), 'History should be an array of jobs');
    assert.ok(res.data.history.length > 0, 'History should contain our recent import jobs');

    const recentJob = res.data.history[0];
    assert.ok(recentJob.fileName, 'Job should have fileName');
    assert.ok(recentJob.status, 'Job should have status');
    assert.ok(typeof recentJob.totalRecords === 'number', 'totalRecords must be a number');
  });
});
