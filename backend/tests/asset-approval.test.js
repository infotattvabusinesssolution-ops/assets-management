import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';

describe('Asset Approval Backend Test Suite', () => {
  let createdRequestNo = '';
  let createdInstanceId = '';

  before(async () => {
    await setupTestEnvironment();
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  it('1. GET /api/v1/workflows/definitions - Should retrieve enterprise workflow approval definitions and steps', async () => {
    const res = await apiRequest('GET', '/api/v1/workflows/definitions');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.definitions), 'definitions should be an array');
    assert.ok(res.data.definitions.length >= 1, 'Should have at least 1 workflow definition');

    const regDef = res.data.definitions.find((d) => d.transactionType === 'New Asset Registration');
    assert.ok(regDef, 'New Asset Registration workflow definition must exist');
    assert.ok(Array.isArray(regDef.steps), 'Definition should have steps array');
    assert.ok(regDef.steps.length >= 2, 'Definition should contain multiple approval steps');
  });

  it('2. GET /api/v1/workflows/pending - Should fetch pending asset approval requests with rich metadata', async () => {
    const res = await apiRequest('GET', '/api/v1/workflows/pending');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.requests), 'requests should be an array');
    assert.ok(res.data.requests.length >= 1, 'Should have at least 1 pending approval request');

    const sampleReq = res.data.requests[0];
    assert.ok(sampleReq.requestNo, 'Request should have requestNo');
    assert.ok(sampleReq.transactionType, 'Request should have transactionType');
    assert.ok(sampleReq.assetId, 'Request should have assetId');
    assert.ok(sampleReq.currentLevel, 'Request should have currentLevel');
    assert.ok(Array.isArray(sampleReq.workflowSteps), 'Request should have workflowSteps array');
    assert.equal(sampleReq.status, 'Pending', 'Status should be Pending');
  });

  it('3. POST /api/v1/workflows/create - Should create a new multi-tier asset approval request', async () => {
    const payload = {
      transactionType: 'New Asset Registration',
      assetId: 'AST-000145',
      assetName: 'Ergonomic Chair - CapEx Registration',
      remarks: 'Automated test capex registration submission',
      requestNo: `APR-TEST-${Date.now()}`
    };

    const res = await apiRequest('POST', '/api/v1/workflows/create', payload);

    assert.equal(res.status, 201, 'Should return 201 Created');
    assert.equal(res.data.success, true);
    assert.ok(res.data.instance, 'Should return created workflow instance');
    assert.equal(res.data.instance.currentStepNumber, 1, 'Initial step should be 1');
    assert.equal(res.data.instance.status, 'PENDING');

    createdRequestNo = res.data.requestNo;
    createdInstanceId = res.data.instance.id;
  });

  it('4. POST /api/v1/workflows/approve/:id - Should approve Step 1 and advance request to Step 2', async () => {
    const payload = {
      decision: 'APPROVE',
      comments: 'Asset Manager verification completed successfully.'
    };

    const res = await apiRequest('POST', `/api/v1/workflows/approve/${createdInstanceId}`, payload);

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(res.data.action, 'Should record approval action');
    assert.equal(res.data.action.decision, 'APPROVE');
    assert.equal(res.data.instance.currentStepNumber, 2, 'Should advance to step 2');
    assert.equal(res.data.instance.status, 'PENDING', 'Should remain PENDING until final tier');
  });

  it('5. POST /api/v1/workflows/approve/:id - Should reject approval request and record rejection audit trail', async () => {
    // Create a temporary request to test rejection
    const createRes = await apiRequest('POST', '/api/v1/workflows/create', {
      transactionType: 'Asset Edit/Update',
      assetId: 'AST-000156',
      assetName: '27" Monitor Specs Amendment',
      remarks: 'Proposed RAM/GPU change'
    });
    assert.equal(createRes.status, 201);
    const rejectTargetId = createRes.data.instance.id;

    const res = await apiRequest('POST', `/api/v1/workflows/approve/${rejectTargetId}`, {
      decision: 'REJECT',
      comments: 'Amendment declined by department lead: specs do not match budget allocation.'
    });

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.equal(res.data.instance.status, 'REJECTED');
    assert.equal(res.data.action.decision, 'REJECT');
  });

  it('6. POST /api/v1/workflows/approve/:id - Should return request for correction', async () => {
    // Create a temporary request to test return
    const createRes = await apiRequest('POST', '/api/v1/workflows/create', {
      transactionType: 'Disposal',
      assetId: 'AST-000201',
      assetName: 'Surface Pro 9 Retirement',
      remarks: 'Device retirement request'
    });
    assert.equal(createRes.status, 201);
    const returnTargetId = createRes.data.instance.id;

    const res = await apiRequest('POST', `/api/v1/workflows/approve/${returnTargetId}`, {
      decision: 'RETURN',
      comments: 'Please attach sign-off degaussing certificate.'
    });

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.equal(res.data.instance.status, 'RETURNED');
    assert.equal(res.data.action.decision, 'RETURN');
  });

  it('7. POST /api/v1/workflows/approve/:id - Should grant final approval, complete workflow, and update asset to IN_SERVICE', async () => {
    // Continue createdInstanceId: currently at Step 2
    // Approve Step 2
    const step2Res = await apiRequest('POST', `/api/v1/workflows/approve/${createdInstanceId}`, {
      decision: 'APPROVE',
      comments: 'Department Head signed off.'
    });
    assert.equal(step2Res.status, 200);

    // Approve Step 3
    const step3Res = await apiRequest('POST', `/api/v1/workflows/approve/${createdInstanceId}`, {
      decision: 'APPROVE',
      comments: 'Finance cost-center budget verified.'
    });
    assert.equal(step3Res.status, 200);

    // Approve Step 4 (Final Approval)
    const finalRes = await apiRequest('POST', `/api/v1/workflows/approve/${createdInstanceId}`, {
      decision: 'APPROVE',
      comments: 'Final executive executive approval granted.'
    });

    assert.equal(finalRes.status, 200, 'Final approval should return 200 OK');
    assert.equal(finalRes.data.success, true);
    assert.equal(finalRes.data.instance.status, 'APPROVED', 'Workflow instance status must be APPROVED');

    // Verify Asset is now IN_SERVICE
    const assetRes = await apiRequest('GET', '/api/v1/assets/AST-000145/360');
    assert.equal(assetRes.status, 200);
    assert.equal(assetRes.data.asset360.asset.lifecycleStatus, 'IN_SERVICE');

    // Verify AssetTransaction logged APPROVAL_GRANTED
    const tx = assetRes.data.asset360.transactions.find((t) => t.transactionType === 'APPROVAL_GRANTED');
    assert.ok(tx, 'AssetTransaction with type APPROVAL_GRANTED should be recorded in DB');
  });

  it('8. GET /api/v1/workflows/history - Should fetch completed, approved, and rejected workflow history', async () => {
    const res = await apiRequest('GET', '/api/v1/workflows/history');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.requests), 'History requests should be an array');
    assert.ok(res.data.requests.length >= 1, 'Should contain completed workflow records');

    const statuses = res.data.requests.map((r) => r.status);
    assert.ok(
      statuses.includes('Approved') || statuses.includes('Rejected') || statuses.includes('Returned'),
      'History must include Approved, Rejected, or Returned items'
    );
  });
});
