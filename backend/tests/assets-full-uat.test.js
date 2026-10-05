import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../config/prisma.js';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';

describe('Assets Complete 7-Tab End-to-End UAT Suite (Dynamic Seeding & Automatic Cleanup)', () => {
  const token = `${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

  // Dynamic asset IDs generated for this test run
  const DYNAMIC_IDS = {
    regAssetId: `AST-UAT-REG-${token}`,
    newAssetId: `AST-UAT-NEW-${token}`,
    myAssetId: `AST-UAT-MY-${token}`,
    parentAssetId: `AST-UAT-PAR-${token}`,
    childAssetId: `AST-UAT-CHD-${token}`,
    subChildAssetId: `AST-UAT-SUB-${token}`,
    bulkAssetAId: `AST-UAT-BLK-A-${token}`,
    bulkAssetBId: `AST-UAT-BLK-B-${token}`,
    approvalAssetId: `AST-UAT-APP-${token}`
  };

  // Track created records for guaranteed teardown cleanup
  const createdAssetIds = [];
  const createdWorkflowInstanceIds = [];
  const createdImportJobIds = [];
  const createdWorkOrderIds = [];
  const createdTransferIds = [];

  let initialTotalAssets = 0;
  let testUser = null;
  let defaultCategory = null;
  let defaultSite = null;
  let defaultEmployee = null;
  let seededParent = null;

  before(async () => {
    await setupTestEnvironment();

    // Capture initial asset count
    initialTotalAssets = await prisma.asset.count();
    console.log(`📊 Initial DB Asset Count before UAT: ${initialTotalAssets}`);

    // Resolve system user and default relations
    testUser = await prisma.user.findFirst({
      where: { OR: [{ username: 'admin' }, { role: { code: 'SYS_ADMIN' } }] }
    });
    defaultCategory = await prisma.category.findFirst({ where: { active: true } });
    if (!defaultCategory) defaultCategory = await prisma.category.findFirst();
    defaultSite = await prisma.site.findFirst({ where: { active: true } });
    if (!defaultSite) defaultSite = await prisma.site.findFirst();

    // Ensure an employee exists for custodian foreign key
    defaultEmployee = await prisma.employee.findFirst({ where: { active: true } });
    if (!defaultEmployee) {
      defaultEmployee = await prisma.employee.create({
        data: {
          employeeCode: `EMP-UAT-${token}`,
          fullName: 'UAT Test Custodian',
          email: `uat.${token}@example.com`,
          companyId: defaultSite.companyId
        }
      });
    }

    // -------------------------------------------------------------------------
    // SEED DYNAMIC DATA RANDOMLY FOR UAT
    // -------------------------------------------------------------------------
    console.log(`🌱 Seeding dynamic test assets with unique token: ${token}...`);

    // 1. Seed Asset for Tab 1 (Register) & Tab 4 (Edit / Update)
    const seededReg = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.regAssetId,
        tagNumber: `TAG-REG-${token}`,
        serialNumber: `SN-REG-${token}`,
        barcode: `BC-REG-${token}`,
        description: `Dell Latitude 7450 UAT Register Asset [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 4200.0,
        currency: 'USD',
        lifecycleStatus: 'RECEIVED',
        condition: 'NEW',
        criticality: 'HIGH',
        createdByUserId: testUser?.id
      }
    });
    createdAssetIds.push(seededReg.id);

    // 2. Seed Asset for Tab 3 (My Assets) - Assigned to employee / creator
    const seededMy = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.myAssetId,
        tagNumber: `TAG-MY-${token}`,
        serialNumber: `SN-MY-${token}`,
        barcode: `BC-MY-${token}`,
        description: `MacBook Pro M3 Max Self-Service Asset [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 7500.0,
        currency: 'USD',
        lifecycleStatus: 'IN_SERVICE',
        condition: 'EXCELLENT',
        criticality: 'HIGH',
        createdByUserId: testUser?.id,
        custodianId: defaultEmployee.id
      }
    });
    createdAssetIds.push(seededMy.id);

    // Create an active custody assignment for My Assets
    await prisma.custodyAssignment.create({
      data: {
        assetId: seededMy.id,
        custodianId: defaultEmployee.id,
        issuedByUserId: testUser?.id,
        issuedDate: new Date(),
        active: true,
        acknowledged: false,
        conditionAtIssue: 'EXCELLENT'
      }
    });

    // 3. Seed Hierarchy Assets (Parent, Child, Sub-Child) for Tab 6
    seededParent = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.parentAssetId,
        tagNumber: `TAG-PAR-${token}`,
        serialNumber: `SN-PAR-${token}`,
        barcode: `BC-PAR-${token}`,
        description: `Enterprise Chiller Assembly Plant [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 85000.0,
        currency: 'USD',
        lifecycleStatus: 'IN_SERVICE',
        condition: 'GOOD',
        createdByUserId: testUser?.id
      }
    });
    createdAssetIds.push(seededParent.id);

    const seededChild = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.childAssetId,
        tagNumber: `TAG-CHD-${token}`,
        serialNumber: `SN-CHD-${token}`,
        barcode: `BC-CHD-${token}`,
        description: `Compressor Sub-Unit A [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 24000.0,
        currency: 'USD',
        lifecycleStatus: 'IN_SERVICE',
        condition: 'GOOD',
        createdByUserId: testUser?.id
      }
    });
    createdAssetIds.push(seededChild.id);

    const seededSubChild = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.subChildAssetId,
        tagNumber: `TAG-SUB-${token}`,
        serialNumber: `SN-SUB-${token}`,
        barcode: `BC-SUB-${token}`,
        description: `Pneumatic Valve Module [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 4500.0,
        currency: 'USD',
        lifecycleStatus: 'IN_SERVICE',
        condition: 'GOOD',
        createdByUserId: testUser?.id
      }
    });
    createdAssetIds.push(seededSubChild.id);

    // 4. Seed Asset for Tab 7 (Asset Approvals)
    const seededAppr = await prisma.asset.create({
      data: {
        assetId: DYNAMIC_IDS.approvalAssetId,
        tagNumber: `TAG-APP-${token}`,
        serialNumber: `SN-APP-${token}`,
        barcode: `BC-APP-${token}`,
        description: `CapEx Production Server Cluster [${token}]`,
        categoryId: defaultCategory.id,
        companyId: defaultSite.companyId,
        siteId: defaultSite.id,
        acquisitionValue: 35000.0,
        currency: 'USD',
        lifecycleStatus: 'RECEIVED',
        condition: 'NEW',
        createdByUserId: testUser?.id
      }
    });
    createdAssetIds.push(seededAppr.id);

    console.log(`✅ Seeded ${createdAssetIds.length} dynamic test assets successfully.`);
  });

  after(async () => {
    // -------------------------------------------------------------------------
    // CLEAN UP & DELETE DYNAMIC TEST DATA
    // -------------------------------------------------------------------------
    console.log('\n🧹 Cleaning up dynamic test assets and related UAT records...');

    try {
      // 1. Delete Workflow Instances & Actions created during UAT
      if (createdWorkflowInstanceIds.length > 0) {
        await prisma.approvalAction.deleteMany({
          where: { workflowInstanceId: { in: createdWorkflowInstanceIds } }
        }).catch(() => {});
        await prisma.workflowInstance.deleteMany({
          where: { id: { in: createdWorkflowInstanceIds } }
        }).catch(() => {});
      }

      // 2. Delete Import Jobs created during UAT
      if (createdImportJobIds.length > 0) {
        await prisma.importJobRow.deleteMany({
          where: { importJobId: { in: createdImportJobIds } }
        }).catch(() => {});
        await prisma.importJob.deleteMany({
          where: { id: { in: createdImportJobIds } }
        }).catch(() => {});
      }

      // 3. Delete Transferred Records & Work Orders created during UAT
      if (createdWorkOrderIds.length > 0) {
        await prisma.maintenanceWorkOrder.deleteMany({
          where: { id: { in: createdWorkOrderIds } }
        }).catch(() => {});
      }
      if (createdTransferIds.length > 0) {
        await prisma.assetTransfer.deleteMany({
          where: { id: { in: createdTransferIds } }
        }).catch(() => {});
      }

      // 4. Delete all created assets with fast batch delete operations
      if (createdAssetIds.length > 0) {
        const assetIds = createdAssetIds;
        await prisma.asset.updateMany({ where: { id: { in: assetIds } }, data: { parentAssetId: null } }).catch(() => {});
        await prisma.assetBookValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.assetTransaction.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.custodyAssignment.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.maintenanceWorkOrder.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.maintenanceSchedule.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.contractAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.warranty.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.tagHistory.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.tag.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.assetMapPosition.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.discoveryMatch.deleteMany({ where: { matchedAssetId: { in: assetIds } } }).catch(() => {});
        await (prisma.aiRecommendation || prisma.aIRecommendation)?.deleteMany?.({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.assetCustomFieldValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.assetTransfer.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.rtlsMovement.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.rtlsAssetLocation.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => {});
        await prisma.auditEvent.deleteMany({ where: { entityId: { in: assetIds } } }).catch(() => {});
        await prisma.asset.deleteMany({ where: { id: { in: assetIds } } }).catch(() => {});
      }
    } catch (e) {
      console.warn('Warning during batch asset cleanup:', e.message);
    }

    const finalCount = await prisma.asset.count().catch(() => 0);
    console.log(`✅ Cleanup finished. DB Asset Count: ${finalCount} (Initial was ${initialTotalAssets})`);

    await teardownTestEnvironment();
  });

  // =========================================================================
  // SUB-TAB 1: ASSET REGISTER (/assets)
  // =========================================================================
  it('TAB 1: Asset Register - Should list assets, provide search/filters, KPI summary & Asset 360 profile', async () => {
    // 1. Fetch asset list with search filter matching dynamic asset
    const listRes = await apiRequest('GET', `/api/v1/assets?search=${token}`);
    assert.equal(listRes.status, 200, 'Should return 200 OK');
    assert.equal(listRes.data.success, true);
    assert.ok(Array.isArray(listRes.data.assets), 'Assets should be an array');
    assert.ok(listRes.data.assets.length >= 1, 'Should find seeded dynamic asset');

    // 2. Validate KPI counts structure
    assert.ok(listRes.data.kpiCounts, 'Response should contain kpiCounts');
    assert.ok(typeof listRes.data.kpiCounts.total === 'number');
    assert.ok(typeof listRes.data.kpiCounts.inUse === 'number');
    assert.ok(typeof listRes.data.kpiCounts.maintenance === 'number');

    // 3. Fetch full 360° profile by human-readable asset ID
    const profileRes = await apiRequest('GET', `/api/v1/assets/${DYNAMIC_IDS.regAssetId}/360`);
    assert.equal(profileRes.status, 200);
    assert.equal(profileRes.data.success, true);
    assert.ok(profileRes.data.asset360);
    assert.equal(profileRes.data.asset360.asset.assetId, DYNAMIC_IDS.regAssetId);
    assert.equal(profileRes.data.asset360.asset.lifecycleStatus, 'RECEIVED');

    // 4. Test lifecycle status transition: RECEIVED -> UNDER_MAINTENANCE
    const patchRes = await apiRequest('PATCH', `/api/v1/assets/${DYNAMIC_IDS.regAssetId}/lifecycle`, {
      toStatus: 'UNDER_MAINTENANCE',
      notes: 'Transitioned via Asset Register quick-action menu'
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.success, true);
    assert.equal(patchRes.data.asset.lifecycleStatus, 'UNDER_MAINTENANCE');
  });

  // =========================================================================
  // SUB-TAB 2: NEW ASSET REGISTRATION (/assets/new)
  // =========================================================================
  it('TAB 2: New Asset Registration - Should retrieve master data and register a complete enterprise asset', async () => {
    // 1. Fetch categories and sites master data
    const catRes = await apiRequest('GET', '/api/v1/master-data/categories');
    assert.equal(catRes.status, 200);
    assert.ok(Array.isArray(catRes.data.categories));

    const siteRes = await apiRequest('GET', '/api/v1/master-data/sites');
    assert.equal(siteRes.status, 200);
    assert.ok(Array.isArray(siteRes.data.sites));

    // 2. Register brand new dynamic asset with complete metadata
    const payload = {
      assetId: DYNAMIC_IDS.newAssetId,
      assetName: `High-End Workstation Unit [${token}]`,
      description: `High-End Workstation Unit [${token}]`,
      category: defaultCategory.name,
      categoryId: defaultCategory.id,
      manufacturer: 'Dell',
      model: 'Precision 7780',
      serialNumber: `SN-NEW-${token}`,
      tagNumber: `TAG-NEW-${token}`,
      barcode: `BC-NEW-${token}`,
      rfidEpc: `EPC-NEW-${token}`,
      site: defaultSite.name,
      acquisitionCost: 6800.0,
      currency: 'USD',
      condition: 'NEW',
      criticality: 'HIGH',
      lifecycleStatus: 'IN_SERVICE',
      underWarranty: true,
      warrantyStartDate: '2026-01-01',
      warrantyEndDate: '2029-01-01',
      provider: 'Dell ProSupport Plus',
      notes: 'Registered via New Asset Registration form'
    };

    const createRes = await apiRequest('POST', '/api/v1/assets', payload);
    assert.equal(createRes.status, 201, 'Should return 201 Created');
    assert.equal(createRes.data.success, true);
    assert.ok(createRes.data.asset);
    assert.equal(createRes.data.asset.assetId, DYNAMIC_IDS.newAssetId);

    // Track for cleanup
    createdAssetIds.push(createRes.data.asset.id);

    // 3. Verify Corporate Book Value was automatically initialized
    const verifyRes = await apiRequest('GET', `/api/v1/assets/${DYNAMIC_IDS.newAssetId}/360`);
    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.data.asset360.bookValues.length >= 1, 'Should auto-create Corporate Book Value record');
    assert.equal(Number(verifyRes.data.asset360.bookValues[0].capitalizationValue), 6800.0);
    assert.equal(Number(verifyRes.data.asset360.bookValues[0].netBookValue), 6800.0);
  });

  // =========================================================================
  // SUB-TAB 3: MY ASSETS (/assets/my-assets)
  // =========================================================================
  it('TAB 3: My Assets - Should list assigned assets, support acknowledgement, transfers, returns & issues', async () => {
    // 1. Fetch My Assets endpoint
    const myRes = await apiRequest('GET', '/api/v1/assets/my-assets');
    assert.equal(myRes.status, 200);
    assert.equal(myRes.data.success, true);
    assert.ok(Array.isArray(myRes.data.assets));
    assert.ok(myRes.data.kpiCounts);
    assert.ok(myRes.data.tabCounts);

    // 2. Acknowledge Receipt of assigned asset
    const ackRes = await apiRequest('POST', `/api/v1/assets/${DYNAMIC_IDS.myAssetId}/acknowledge`, {
      status: 'ACKNOWLEDGED',
      condition: 'EXCELLENT',
      remarks: 'Self-service physical custody confirmed'
    });
    assert.equal(ackRes.status, 200);
    assert.equal(ackRes.data.success, true);

    // 3. Submit Asset Transfer Request
    const trfRes = await apiRequest('POST', `/api/v1/assets/${DYNAMIC_IDS.myAssetId}/transfer-request`, {
      targetEmployee: 'Operations Lead',
      targetLocation: 'Dubai HQ Floor 4',
      reason: 'Project relocation to Stage 2'
    });
    assert.equal(trfRes.status, 200);
    assert.equal(trfRes.data.success, true);
    assert.ok(trfRes.data.transfer);
    createdTransferIds.push(trfRes.data.transfer.id);

    // 4. Report Maintenance Issue and create Work Order
    const issueRes = await apiRequest('POST', `/api/v1/assets/${DYNAMIC_IDS.myAssetId}/report-issue`, {
      issueType: 'CORRECTIVE',
      severity: 'HIGH',
      description: 'Display backlight flickering intermittently',
      isUnusable: true
    });
    assert.equal(issueRes.status, 200);
    assert.equal(issueRes.data.success, true);
    assert.ok(issueRes.data.workOrder);
    createdWorkOrderIds.push(issueRes.data.workOrder.id);

    // 5. Submit Return Request
    const returnRes = await apiRequest('POST', `/api/v1/assets/${DYNAMIC_IDS.myAssetId}/return-request`, {
      reason: 'Role rotation completed',
      returnStore: 'Central IT Depot',
      condition: 'FAIR'
    });
    assert.equal(returnRes.status, 200);
    assert.equal(returnRes.data.success, true);
    assert.equal(returnRes.data.asset.lifecycleStatus, 'PENDING_RETURN');

    // 6. Submit Requisition for New Asset
    const reqRes = await apiRequest('POST', '/api/v1/assets/request-asset', {
      category: 'Laptop',
      costCenter: 'IT-001',
      justification: 'Hardware upgrade for cloud development'
    });
    assert.equal(reqRes.status, 200);
    assert.equal(reqRes.data.success, true);
  });

  // =========================================================================
  // SUB-TAB 4: ASSET EDIT / UPDATE (/assets/edit/:id)
  // =========================================================================
  it('TAB 4: Asset Edit / Update - Should modify technical & financial fields, record diffs & reject duplicates', async () => {
    // 1. Update asset fields
    const editPayload = {
      assetName: `Dell Latitude 7450 [Updated ${token}]`,
      description: `Dell Latitude 7450 [Updated ${token}]`,
      condition: 'FAIR',
      criticality: 'MEDIUM',
      acquisitionValue: 4650.0,
      currency: 'AED',
      notes: 'RAM upgraded to 64GB and tested in QA lab'
    };

    const updateRes = await apiRequest('PUT', `/api/v1/assets/${DYNAMIC_IDS.regAssetId}`, editPayload);
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.success, true);
    assert.equal(updateRes.data.asset.condition, 'FAIR');
    assert.equal(Number(updateRes.data.asset.acquisitionValue), 4650.0);
    assert.ok(Array.isArray(updateRes.data.changedFields));

    // 2. Verify Audit Trail and Transaction were recorded
    const verify360 = await apiRequest('GET', `/api/v1/assets/${DYNAMIC_IDS.regAssetId}/360`);
    assert.equal(verify360.status, 200);
    const editTx = verify360.data.asset360.transactions.find((t) => t.transactionType === 'MASTER_EDIT');
    assert.ok(editTx, 'MASTER_EDIT transaction should exist');

    // 3. Attempt duplicate serial number rejection
    const dupRes = await apiRequest('PUT', `/api/v1/assets/${DYNAMIC_IDS.regAssetId}`, {
      serialNumber: `SN-MY-${token}` // Already taken by MyAsset
    });
    assert.equal(dupRes.status, 400, 'Should reject duplicate serial number');
  });

  // =========================================================================
  // SUB-TAB 5: BULK UPLOAD (/assets/bulk-upload)
  // =========================================================================
  it('TAB 5: Bulk Upload - Should validate spreadsheet rows, ingest batch into database & log history', async () => {
    // 1. Validate rows (testing valid, warning, and error rows)
    const validatePayload = {
      rows: [
        {
          row: 1,
          name: `Bulk Workstation Alpha [${token}]`,
          category: defaultCategory.name,
          serialNumber: `SN-BLK-A-${token}`,
          location: defaultSite.name,
          acquisitionValue: 3100,
          currency: 'USD'
        },
        {
          row: 2,
          name: '', // Empty name -> Error
          category: defaultCategory.name,
          serialNumber: `SN-BLK-ERR-${token}`
        },
        {
          row: 3,
          name: `Bulk Server Beta [${token}]`,
          category: defaultCategory.name,
          serialNumber: `SN-NEW-${token}` // Existing serial -> Warning
        }
      ]
    };

    const valRes = await apiRequest('POST', '/api/v1/imports/validate', validatePayload);
    assert.equal(valRes.status, 200);
    assert.equal(valRes.data.success, true);
    assert.equal(valRes.data.validCount, 1);
    assert.equal(valRes.data.errorCount, 1);
    assert.equal(valRes.data.warningCount, 1);

    // 2. Submit valid batch for persistence
    const submitPayload = {
      batchReference: `BATCH-UAT-${token}`,
      fileName: `uat_bulk_assets_${token}.xlsx`,
      rows: [
        {
          row: 1,
          name: `Bulk Workstation Alpha [${token}]`,
          category: defaultCategory.name,
          serialNumber: `SN-BLK-A-${token}`,
          location: defaultSite.name,
          acquisitionValue: 3100,
          currency: 'USD',
          status: 'Valid'
        },
        {
          row: 2,
          name: `Bulk Workstation Beta [${token}]`,
          category: defaultCategory.name,
          serialNumber: `SN-BLK-B-${token}`,
          location: defaultSite.name,
          acquisitionValue: 3900,
          currency: 'USD',
          status: 'Valid'
        }
      ]
    };

    const subRes = await apiRequest('POST', '/api/v1/imports/submit', submitPayload);
    assert.equal(subRes.status, 200);
    assert.equal(subRes.data.success, true);
    assert.equal(subRes.data.createdCount, 2);
    assert.ok(subRes.data.jobId);
    createdImportJobIds.push(subRes.data.jobId);

    // Locate created assets to track for cleanup
    const searchBulk = await apiRequest('GET', `/api/v1/assets?search=SN-BLK-A-${token}`);
    assert.equal(searchBulk.status, 200);
    searchBulk.data.assets.forEach((a) => {
      if (!createdAssetIds.includes(a.id)) createdAssetIds.push(a.id);
    });

    const searchBulkB = await apiRequest('GET', `/api/v1/assets?search=SN-BLK-B-${token}`);
    assert.equal(searchBulkB.status, 200);
    searchBulkB.data.assets.forEach((a) => {
      if (!createdAssetIds.includes(a.id)) createdAssetIds.push(a.id);
    });

    // 3. Check upload history
    const histRes = await apiRequest('GET', '/api/v1/imports/history');
    assert.equal(histRes.status, 200);
    assert.ok(Array.isArray(histRes.data.history));
    const recentJob = histRes.data.history.find((j) => j.id === subRes.data.jobId || j.fileName.includes(token));
    assert.ok(recentJob, 'Import job must appear in upload history');
  });

  // =========================================================================
  // SUB-TAB 6: ASSET HIERARCHY (/assets/hierarchy)
  // =========================================================================
  it('TAB 6: Asset Hierarchy - Should structure multi-level tree, link parent-child, prevent loops & detach', async () => {
    // 1. Assign Parent: Child -> Parent
    const assignRes = await apiRequest('POST', '/api/v1/assets/hierarchy/assign-parent', {
      assetId: DYNAMIC_IDS.childAssetId,
      parentAssetId: DYNAMIC_IDS.parentAssetId
    });
    assert.equal(assignRes.status, 200);
    assert.equal(assignRes.data.success, true);
    assert.equal(assignRes.data.asset.parentAssetId, seededParent.id);

    // 2. Add Child under Child: Sub-Child -> Child (Creating Level 3)
    const addChildRes = await apiRequest('POST', '/api/v1/assets/hierarchy/add-child', {
      parentAssetId: DYNAMIC_IDS.childAssetId,
      childAssetId: DYNAMIC_IDS.subChildAssetId
    });
    assert.equal(addChildRes.status, 200);
    assert.equal(addChildRes.data.success, true);

    // 3. Test loop / circular hierarchy prevention: Make Parent a child of Sub-Child
    const loopRes = await apiRequest('POST', '/api/v1/assets/hierarchy/assign-parent', {
      assetId: DYNAMIC_IDS.parentAssetId,
      parentAssetId: DYNAMIC_IDS.subChildAssetId
    });
    assert.equal(loopRes.status, 400, 'Should reject circular hierarchy loop');
    assert.match(loopRes.data.message, /Circular Reference Error|circular relationship loop/i);

    // 4. Verify Hierarchy Tree rollup metrics
    const treeRes = await apiRequest('GET', `/api/v1/assets/hierarchy/tree?search=${token}`);
    assert.equal(treeRes.status, 200);
    const parentNode = treeRes.data.tree.find((n) => n.assetId === DYNAMIC_IDS.parentAssetId);
    assert.ok(parentNode, 'Parent must be present in tree');
    assert.equal(parentNode.children.length, 1);
    assert.equal(parentNode.children[0].assetId, DYNAMIC_IDS.childAssetId);
    assert.equal(parentNode.children[0].children[0].assetId, DYNAMIC_IDS.subChildAssetId);

    // Rollup value should include parent (85,000) + child (24,000) + subchild (4,500) = 113,500
    assert.equal(parentNode.totalAcquisitionValue, 113500);

    // 5. Detach child from parent
    const detachRes = await apiRequest('DELETE', `/api/v1/assets/hierarchy/${DYNAMIC_IDS.childAssetId}/remove-parent`);
    assert.equal(detachRes.status, 200);
    assert.equal(detachRes.data.success, true);
    assert.equal(detachRes.data.asset.parentAssetId, null);
  });

  // =========================================================================
  // SUB-TAB 7: ASSET APPROVALS (/assets/approvals)
  // =========================================================================
  it('TAB 7: Asset Approvals - Should initiate multi-tier approval, execute approvals & transition asset', async () => {
    // 1. Fetch workflow definitions
    const defRes = await apiRequest('GET', '/api/v1/workflows/definitions');
    assert.equal(defRes.status, 200);
    assert.ok(defRes.data.definitions.length >= 1);

    // 2. Submit new approval request for CapEx asset
    const createReqRes = await apiRequest('POST', '/api/v1/workflows/create', {
      transactionType: 'New Asset Registration',
      assetId: DYNAMIC_IDS.approvalAssetId,
      assetName: `CapEx Server Cluster [${token}]`,
      remarks: 'Automated E2E multi-tier approval verification',
      requestNo: `APR-UAT-${token}`
    });
    assert.equal(createReqRes.status, 201);
    assert.equal(createReqRes.data.success, true);
    assert.ok(createReqRes.data.instance);
    const instanceId = createReqRes.data.instance.id;
    createdWorkflowInstanceIds.push(instanceId);

    // 3. Query Pending Approvals
    const pendingRes = await apiRequest('GET', '/api/v1/workflows/pending');
    assert.equal(pendingRes.status, 200);
    const foundPending = pendingRes.data.requests.find((r) => r.assetId === DYNAMIC_IDS.approvalAssetId);
    assert.ok(foundPending, 'Request should be in pending list');

    // 4. Query All Approvals
    const allRes = await apiRequest('GET', '/api/v1/workflows/all');
    assert.equal(allRes.status, 200);
    assert.ok(allRes.data.requests.some((r) => r.assetId === DYNAMIC_IDS.approvalAssetId));

    // 5. Dynamically execute approval steps until final approval
    let currentStatus = 'PENDING';
    let approvalLoops = 0;
    while (currentStatus === 'PENDING' && approvalLoops < 8) {
      approvalLoops++;
      const stepRes = await apiRequest('POST', `/api/v1/workflows/approve/${instanceId}`, {
        decision: 'APPROVE',
        comments: `Tier ${approvalLoops} approval verification passed`
      });
      assert.equal(stepRes.status, 200);
      assert.equal(stepRes.data.success, true);
      currentStatus = stepRes.data.instance.status;
    }

    assert.equal(currentStatus, 'APPROVED', 'Workflow instance must achieve final status APPROVED');

    // 6. Verify Asset automatically transitioned to IN_SERVICE
    const finalAsset = await apiRequest('GET', `/api/v1/assets/${DYNAMIC_IDS.approvalAssetId}/360`);
    assert.equal(finalAsset.status, 200);
    assert.equal(finalAsset.data.asset360.asset.lifecycleStatus, 'IN_SERVICE');

    // 7. Verify Workflow History contains the approved item
    const histRes = await apiRequest('GET', '/api/v1/workflows/history');
    assert.equal(histRes.status, 200);
    const approvedHist = histRes.data.requests.find((r) => r.assetId === DYNAMIC_IDS.approvalAssetId);
    assert.ok(approvedHist, 'Approved request must be present in workflow history');
    assert.equal(approvedHist.status, 'Approved');
  });
});
