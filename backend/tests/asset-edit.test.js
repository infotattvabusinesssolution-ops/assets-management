import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';

describe('Asset Edit / Update Backend Test Suite', () => {
  before(async () => {
    await setupTestEnvironment();
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  it('1. GET /api/v1/assets/:id/360 - Should fetch comprehensive Asset 360 profile by human-readable assetId', async () => {
    const res = await apiRequest('GET', '/api/v1/assets/AST-000128/360');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true, 'Response success should be true');
    assert.ok(res.data.asset360, 'Response should contain asset360 property');

    const { asset, bookValues, transactions, auditEvents } = res.data.asset360;
    assert.equal(asset.assetId, 'AST-000128', 'Asset ID must match AST-000128');
    assert.ok(asset.description.includes('Dell Latitude'), 'Asset description should contain Dell Latitude');
    assert.ok(Array.isArray(bookValues), 'bookValues should be an array');
    assert.ok(Array.isArray(transactions), 'transactions should be an array');
    assert.ok(Array.isArray(auditEvents), 'auditEvents should be an array');
  });

  it('2. PUT /api/v1/assets/:id - Should update asset core, technical, financial, and condition fields', async () => {
    const updatePayload = {
      assetName: 'Dell Latitude 7450 - Executive Workstation Edition',
      description: 'Dell Latitude 7450 - Executive Workstation Edition',
      condition: 'EXCELLENT',
      healthScore: 98,
      acquisitionValue: 5800.50,
      currency: 'AED',
      notes: 'Upgraded RAM and SSD for lead architect.',
      brand: 'Dell',
      processor: 'Intel Core Ultra 7 165H',
      ram: '32GB DDR5',
      storage: '1TB NVMe PCIe 4.0 SSD',
      operatingSystem: 'Windows 11 Enterprise'
    };

    const res = await apiRequest('PUT', '/api/v1/assets/AST-000128', updatePayload);

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true, 'Update should be successful');
    assert.ok(res.data.asset, 'Response should return updated asset');

    const updated = res.data.asset;
    assert.equal(updated.description, updatePayload.description);
    assert.equal(updated.condition, 'EXCELLENT');
    assert.equal(Number(updated.acquisitionValue), 5800.50);
    assert.equal(updated.currency, 'AED');
  });

  it('3. GET /api/v1/assets/:id/360 - Should verify Audit Log and Transaction history were generated for the update', async () => {
    const res = await apiRequest('GET', '/api/v1/assets/AST-000128/360');

    assert.equal(res.status, 200);
    const { transactions, auditEvents } = res.data.asset360;

    const updateTx = transactions.find((t) => t.transactionType === 'MASTER_EDIT' || t.transactionType === 'UPDATE');
    assert.ok(updateTx, 'An asset transaction with type MASTER_EDIT should be logged');

    const updateAudit = auditEvents.find((a) => a.action === 'ASSET_EDIT_UPDATE' || a.action === 'ASSET_UPDATE');
    assert.ok(updateAudit, 'An audit log event with action ASSET_EDIT_UPDATE should be recorded');
  });

  it('4. PUT /api/v1/assets/:id - Should reject duplicate serial number if already taken by another asset', async () => {
    // AST-000131 has serialNumber 'IP15P-88192'
    const duplicatePayload = {
      serialNumber: 'IP15P-88192'
    };

    const res = await apiRequest('PUT', '/api/v1/assets/AST-000128', duplicatePayload);

    assert.equal(res.status, 400, 'Should reject duplicate serial number with HTTP 400');
    assert.equal(res.data.success, false, 'Response success should be false');
    assert.match(res.data.message, /Serial Number .* is already assigned/i, 'Error message should explain serial conflict');
  });

  it('5. PUT /api/v1/assets/:id - Should reject duplicate tag number if already taken by another asset', async () => {
    // AST-000131 has tagNumber 'TAG-000131'
    const duplicatePayload = {
      tagNumber: 'TAG-000131'
    };

    const res = await apiRequest('PUT', '/api/v1/assets/AST-000128', duplicatePayload);

    assert.equal(res.status, 400, 'Should reject duplicate tag number with HTTP 400');
    assert.equal(res.data.success, false, 'Response success should be false');
    assert.match(res.data.message, /Tag Number .* is already assigned/i, 'Error message should explain tag conflict');
  });

  it('6. PUT /api/v1/assets/:id - Should allow saving asset in Draft mode', async () => {
    const draftPayload = {
      notes: 'Initial draft configuration awaiting final PO clearance.',
      isDraft: true
    };

    const res = await apiRequest('PUT', '/api/v1/assets/AST-000128', draftPayload);

    assert.equal(res.status, 200, 'Draft update should return 200 OK');
    assert.equal(res.data.success, true);
    assert.match(res.data.message, /Draft saved for asset|updated successfully/i);
  });

  it('7. PUT /api/v1/assets/:id - Should return 404 Not Found for non-existent asset ID', async () => {
    const res = await apiRequest('PUT', '/api/v1/assets/NON-EXISTENT-XYZ-9999', {
      description: 'Ghost Asset'
    });

    assert.equal(res.status, 404, 'Should return 404 for unknown asset');
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /not found/i);
  });
});
