import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';

import prisma from '../config/prisma.js';

describe('Asset Hierarchy Backend Test Suite', () => {
  async function resetHvacHierarchy() {
    const plant = await prisma.asset.findFirst({ where: { assetId: 'AST-000100' } });
    const chiller = await prisma.asset.findFirst({ where: { assetId: 'AST-000101' } });
    const compA = await prisma.asset.findFirst({ where: { assetId: 'AST-000101-01' } });

    if (plant) {
      await prisma.asset.update({
        where: { id: plant.id },
        data: { parentAssetId: null }
      }).catch(() => {});
    }
    if (plant && chiller) {
      await prisma.asset.update({
        where: { id: chiller.id },
        data: { parentAssetId: plant.id }
      }).catch(() => {});
    }
    if (chiller && compA) {
      await prisma.asset.update({
        where: { id: compA.id },
        data: { parentAssetId: chiller.id }
      }).catch(() => {});
    }
  }

  before(async () => {
    await setupTestEnvironment();
    await resetHvacHierarchy();
  });

  after(async () => {
    await resetHvacHierarchy();
    await teardownTestEnvironment();
  });

  it('1. GET /api/v1/assets/hierarchy/tree - Should build multi-tier recursive hierarchy tree with level & rollup metrics', async () => {
    const res = await apiRequest('GET', '/api/v1/assets/hierarchy/tree');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.tree), 'tree must be an array');
    assert.ok(res.data.tree.length > 0, 'tree must contain root nodes');

    // Find the HVAC Root Plant
    const chillerPlant = res.data.tree.find((node) => node.assetId === 'AST-000100');
    assert.ok(chillerPlant, 'Root Chiller Plant AST-000100 must exist in tree');
    assert.equal(chillerPlant.level, 1, 'Chiller Plant must be Level 1');
    assert.equal(chillerPlant.type, 'System');
    assert.equal(chillerPlant.levelName, 'Parent System');
    assert.ok(chillerPlant.children.length >= 2, 'Chiller Plant must have child units (Chiller 1, Chiller 2, etc.)');

    // Find Level 2 Child: Chiller 1
    const chiller1 = chillerPlant.children.find((c) => c.assetId === 'AST-000101');
    assert.ok(chiller1, 'Chiller 1 AST-000101 must be a direct child of Chiller Plant');
    assert.equal(chiller1.level, 2, 'Chiller 1 must be Level 2');
    assert.equal(chiller1.type, 'Equipment');
    assert.equal(chiller1.levelName, 'Child Asset');
    assert.ok(chiller1.children.length >= 2, 'Chiller 1 must have sub-components');

    // Find Level 3 Sub-component: Compressor Unit A
    const compressorA = chiller1.children.find((c) => c.assetId === 'AST-000101-01');
    assert.ok(compressorA, 'Compressor Unit A AST-000101-01 must be child of Chiller 1');
    assert.equal(compressorA.level, 3, 'Compressor Unit A must be Level 3');
    assert.equal(compressorA.type, 'Component');
    assert.equal(compressorA.levelName, 'Sub-Component');

    // Check Rollup Metrics
    assert.ok(chillerPlant.totalDescendantCount >= 4, 'Root totalDescendantCount should roll up all child assets');
    assert.ok(chillerPlant.totalAcquisitionValue > chillerPlant.acquisitionValue, 'totalAcquisitionValue should roll up children values');
  });

  it('2. POST /api/v1/assets/hierarchy/assign-parent - Should assign parent and log transaction and audit trail', async () => {
    // Assign Ergonomic Chair (AST-000145) under Dell Workstation (AST-000128)
    const payload = {
      assetId: 'AST-000145',
      parentAssetId: 'AST-000128'
    };

    const res = await apiRequest('POST', '/api/v1/assets/hierarchy/assign-parent', payload);

    assert.equal(res.status, 200, 'Assign parent should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(res.data.asset, 'Response should return updated asset');

    // Verify in tree that AST-000145 is now under AST-000128
    const treeRes = await apiRequest('GET', '/api/v1/assets/hierarchy/tree');
    const parentNode = treeRes.data.tree.find((n) => n.assetId === 'AST-000128');
    assert.ok(parentNode, 'Parent workstation should exist');
    const assignedChild = parentNode.children.find((c) => c.assetId === 'AST-000145');
    assert.ok(assignedChild, 'AST-000145 must now appear in AST-000128 children array');
    assert.equal(assignedChild.level, 2, 'Child level must be 2');
  });

  it('3. POST /api/v1/assets/hierarchy/add-child - Should attach a child asset under a parent', async () => {
    // Attach 27" Monitor (AST-000156) under Dell Workstation (AST-000128)
    const payload = {
      parentAssetId: 'AST-000128',
      childAssetId: 'AST-000156'
    };

    const res = await apiRequest('POST', '/api/v1/assets/hierarchy/add-child', payload);

    assert.equal(res.status, 200, 'Add child should return 200 OK');
    assert.equal(res.data.success, true);
    assert.match(res.data.message, /successfully attached under parent/i);
  });

  it('4. POST /api/v1/assets/hierarchy/assign-parent - Should detect and reject circular reference loops', async () => {
    // Attempting to assign Root Chiller Plant (AST-000100) under its own grandchild Compressor Unit A (AST-000101-01)
    const payload = {
      assetId: 'AST-000100',
      parentAssetId: 'AST-000101-01'
    };

    const res = await apiRequest('POST', '/api/v1/assets/hierarchy/assign-parent', payload);

    assert.equal(res.status, 400, 'Circular loop must return HTTP 400 Bad Request');
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Circular Reference Error/i, 'Error message must specify circular reference');
  });

  it('5. POST /api/v1/assets/hierarchy/assign-parent - Should reject self-parenting', async () => {
    const payload = {
      assetId: 'AST-000128',
      parentAssetId: 'AST-000128'
    };

    const res = await apiRequest('POST', '/api/v1/assets/hierarchy/assign-parent', payload);

    assert.equal(res.status, 400, 'Self parenting must return HTTP 400');
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /cannot be assigned as its own parent/i);
  });

  it('6. DELETE /api/v1/assets/hierarchy/:id/remove-parent - Should detach parent and promote asset to standalone root', async () => {
    // Detach AST-000145 from AST-000128
    const res = await apiRequest('DELETE', '/api/v1/assets/hierarchy/AST-000145/remove-parent');

    assert.equal(res.status, 200, 'Remove parent should return 200 OK');
    assert.equal(res.data.success, true);
    assert.match(res.data.message, /Removed parent relationship/i);

    // Verify it is now a root node in tree
    const treeRes = await apiRequest('GET', '/api/v1/assets/hierarchy/tree');
    const rootItem = treeRes.data.tree.find((n) => n.assetId === 'AST-000145');
    assert.ok(rootItem, 'Detached asset should now be present in root list');
    assert.equal(rootItem.level, 1, 'Detached asset should have level 1');
  });

  it('7. GET /api/v1/assets/hierarchy/history - Should retrieve hierarchy audit events log', async () => {
    const res = await apiRequest('GET', '/api/v1/assets/hierarchy/history');

    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.history), 'History should be an array');
    assert.ok(res.data.history.length > 0, 'Should contain recorded hierarchy audit events');

    const actions = res.data.history.map((h) => h.action);
    assert.ok(
      actions.includes('ASSET_HIERARCHY_CHANGE') ||
      actions.includes('ASSET_HIERARCHY_ADD_CHILD') ||
      actions.includes('ASSET_HIERARCHY_REMOVE'),
      'Audit history should include hierarchy change actions'
    );
  });
});
