import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';
import prisma from '../config/prisma.js';

describe('Receiving & Tagging Backend End-to-End Test Suite', () => {
  const createdTestAssetIds = [];
  const createdTestReceiptNumbers = [];
  const createdTestTagNumbers = [];
  let testDraftId = null;

  before(async () => {
    await setupTestEnvironment();
  });

  after(async () => {
    // Clean up all dynamically generated test records
    console.log('🧹 Cleaning up test receipts, tags, and assets...');
    try {
      // 1. Delete receipt line items & receipts
      if (createdTestReceiptNumbers.length > 0) {
        const testReceipts = await prisma.receipt.findMany({
          where: { receiptNumber: { in: createdTestReceiptNumbers } }
        });
        const rIds = testReceipts.map((r) => r.id);
        if (rIds.length > 0) {
          await prisma.receiptLineItem.deleteMany({ where: { receiptId: { in: rIds } } });
          await prisma.receipt.deleteMany({ where: { id: { in: rIds } } });
        }
      }

      // 2. Delete test tags and tag histories
      if (createdTestTagNumbers.length > 0) {
        await prisma.tag.deleteMany({ where: { tagNumber: { in: createdTestTagNumbers } } });
      }

      // 3. Delete created test assets and their dependent relations
      if (createdTestAssetIds.length > 0) {
        const assets = await prisma.asset.findMany({
          where: {
            OR: [
              { id: { in: createdTestAssetIds } },
              { assetId: { in: createdTestAssetIds } }
            ]
          }
        });
        const assetUuids = assets.map((a) => a.id);
        if (assetUuids.length > 0) {
          await prisma.tagHistory.deleteMany({ where: { assetId: { in: assetUuids } } });
          await prisma.assetTransaction.deleteMany({ where: { assetId: { in: assetUuids } } });
          await prisma.tag.deleteMany({ where: { assetId: { in: assetUuids } } });
          await prisma.asset.deleteMany({ where: { id: { in: assetUuids } } });
        }
      }
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    await teardownTestEnvironment();
  });

  // =========================================================================
  // MODULE 1: RECEIVE WITH PURCHASE ORDER (PO)
  // =========================================================================
  describe('Module 1: Receive with PO', () => {
    it('1.1 GET /api/v1/receiving/purchase-orders - Should list ERP purchase orders', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/purchase-orders');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true, 'Response success should be true');
      assert.ok(Array.isArray(res.data.purchaseOrders), 'Should return purchaseOrders array');
      assert.ok(res.data.purchaseOrders.length > 0, 'Should have at least 1 purchase order');

      const po = res.data.purchaseOrders[0];
      assert.ok(po.poNumber, 'PO must have a poNumber');
      assert.ok(po.supplier, 'PO must have a supplier');
      assert.ok(Array.isArray(po.lineItems), 'PO must have lineItems array');
    });

    it('1.2 GET /api/v1/receiving/purchase-orders/:poNumber - Should fetch PO details and computed line quantities', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/purchase-orders/PO-2026-00123');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true, 'Response success should be true');
      assert.ok(res.data.purchaseOrder, 'Should return purchaseOrder object');

      const po = res.data.purchaseOrder;
      assert.equal(po.poNumber, 'PO-2026-00123');
      assert.equal(po.supplier, 'Dell Technologies');
      assert.ok(po.lineItems.length >= 2, 'Should have multiple line items');

      const item1 = po.lineItems.find((l) => l.partNumber === 'DL7450');
      assert.ok(item1, 'Should find Dell Latitude line item');
      assert.equal(item1.orderedQty, 10);
      assert.ok(typeof item1.receivedQty === 'number', 'receivedQty should be a number');
      assert.ok(typeof item1.pendingQty === 'number', 'pendingQty should be a number');
    });

    it('1.3 POST /api/v1/receiving/validate-serial - Should validate serial uniqueness against database', async () => {
      const uniqueSerial = `SN-TEST-PO-${Date.now()}`;
      const validRes = await apiRequest('POST', '/api/v1/receiving/validate-serial', {
        serialNumber: uniqueSerial
      });

      assert.equal(validRes.status, 200, 'Status must be 200 OK');
      assert.equal(validRes.data.success, true);
      assert.equal(validRes.data.valid, true, 'Serial must be reported as valid/available');

      // Test duplicate serial validation against existing DB asset
      const existingAsset = await prisma.asset.findFirst({
        where: { serialNumber: { not: null } }
      });

      if (existingAsset?.serialNumber) {
        const dupRes = await apiRequest('POST', '/api/v1/receiving/validate-serial', {
          serialNumber: existingAsset.serialNumber
        });
        assert.equal(dupRes.data.valid, false, 'Duplicate serial must be reported as invalid');
        assert.ok(dupRes.data.message.includes('already registered'), 'Should state serial is already registered');
      }
    });

    it('1.4 POST /api/v1/receiving/validate-tag - Should validate tag / RFID EPC availability', async () => {
      const uniqueTag = `TAG-TEST-PO-${Date.now()}`;
      const res = await apiRequest('POST', '/api/v1/receiving/validate-tag', {
        tagNumber: uniqueTag,
        rfidEpc: `E28011606000${Date.now().toString().slice(-5)}`
      });

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.equal(res.data.valid, true, 'Tag must be available');
    });

    it('1.5 POST /api/v1/receiving/scan-lookup - Should match PO line item from scanned part/model', async () => {
      const res = await apiRequest('POST', '/api/v1/receiving/scan-lookup', {
        scanValue: 'DL7450',
        poNumber: 'PO-2026-00123'
      });

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.equal(res.data.type, 'PO_LINE_MATCH', 'Should detect PO_LINE_MATCH');
      assert.ok(res.data.suggestedAsset, 'Should return suggestedAsset');
      assert.equal(res.data.suggestedAsset.category, 'Laptop');
    });

    it('1.6 POST /api/v1/receiving/submit - Should submit Receive with PO and persist to SQL Server', async () => {
      const testGrnNumber = `TEST-GRN-PO-${Date.now()}`;
      const testSerial = `SN-PO-RCV-${Date.now()}`;
      const testTag = `TAG-PO-RCV-${Date.now()}`;
      const testEpc = `E28011606${Date.now().toString().slice(-7)}`;

      createdTestReceiptNumbers.push(testGrnNumber);
      createdTestTagNumbers.push(testTag);

      const payload = {
        mode: 'WITH_PO',
        poNumber: 'PO-2026-00123',
        supplier: 'Dell Technologies',
        receivingDate: new Date().toISOString(),
        receivingLocation: 'Dubai HQ - IT Store',
        receivedBy: 'Test Quality Engineer',
        referenceNo: testGrnNumber,
        remarks: 'E2E Automated Receive with PO Verification',
        requireApproval: false,
        scannedItems: [
          {
            assetName: 'Dell Latitude 7450 (PO Intake)',
            description: 'Dell Latitude 7450 Enterprise Laptop',
            category: 'Laptop',
            model: 'Latitude 7450',
            serialNumber: testSerial,
            tagNumber: testTag,
            rfidEpc: testEpc,
            status: 'Tagged'
          }
        ],
        poLineItems: [
          {
            id: 'line-01',
            itemNumber: 1,
            description: 'Dell Latitude 7450',
            partNumber: 'DL7450',
            category: 'Laptop',
            orderedQty: 10,
            receivedQty: 1
          }
        ]
      };

      const res = await apiRequest('POST', '/api/v1/receiving/submit', payload);

      assert.equal(res.status, 201, 'Status must be 201 Created');
      assert.equal(res.data.success, true, 'Submission must succeed');
      assert.ok(res.data.receipt, 'Receipt object must be returned');
      assert.equal(res.data.receipt.receiptNumber, testGrnNumber);

      // Verify persistence in SQL Server
      const dbReceipt = await prisma.receipt.findFirst({
        where: { receiptNumber: testGrnNumber },
        include: { lineItems: true }
      });

      assert.ok(dbReceipt, 'Receipt must exist in SQL Server dbo.receipts');
      assert.equal(dbReceipt.poNumber, 'PO-2026-00123');
      assert.equal(dbReceipt.status, 'COMPLETED');
      assert.ok(dbReceipt.lineItems.length >= 1, 'Receipt must have line items created');

      const dbAsset = await prisma.asset.findFirst({
        where: { tagNumber: testTag }
      });

      assert.ok(dbAsset, 'Created asset must exist in SQL Server dbo.assets');
      createdTestAssetIds.push(dbAsset.id);
      assert.equal(dbAsset.serialNumber, testSerial);
      assert.equal(dbAsset.lifecycleStatus, 'TAGGED');
      assert.equal(dbAsset.rfidEpc, testEpc);

      // Verify active tag in dbo.tags
      const dbTag = await prisma.tag.findUnique({
        where: { tagNumber: testTag }
      });
      assert.ok(dbTag, 'Tag record must exist in SQL Server dbo.tags');
      assert.equal(dbTag.assetId, dbAsset.id);
      assert.equal(dbTag.status, 'ACTIVE');

      // Verify audit transaction in dbo.asset_transactions
      const dbTx = await prisma.assetTransaction.findFirst({
        where: { assetId: dbAsset.id, transactionType: 'RECEIVE_AND_TAG' }
      });
      assert.ok(dbTx, 'AssetTransaction audit log must exist');
      assert.ok(dbTx.notes.includes(testGrnNumber));
    });

    it('1.7 GET /api/v1/receiving/history & GET /api/v1/receiving/history/:id - Should find posted receipt in history', async () => {
      const testGrn = createdTestReceiptNumbers[0];
      const res = await apiRequest('GET', `/api/v1/receiving/history?q=${testGrn}`);

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.receipts));
      const found = res.data.receipts.find((r) => r.receiptNumber === testGrn);
      assert.ok(found, `Receipt ${testGrn} must be present in history`);

      const detailRes = await apiRequest('GET', `/api/v1/receiving/history/${testGrn}`);
      assert.equal(detailRes.status, 200);
      assert.equal(detailRes.data.success, true);
      assert.equal(detailRes.data.receipt.receiptNumber, testGrn);
    });

    it('1.8 GET /api/v1/receiving/stats - Should return receiving summary metrics', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/stats');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats, 'Response must contain stats');
      assert.ok(typeof res.data.stats.totalReceipts === 'number');
      assert.ok(typeof res.data.stats.totalUnitsReceived === 'number');
    });
  });

  // =========================================================================
  // MODULE 2: RECEIVE WITHOUT PURCHASE ORDER (NON-PO)
  // =========================================================================
  describe('Module 2: Receive without PO', () => {
    it('2.1 GET /api/v1/receiving/non-po-reasons - Should return non-PO intake reasons list', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/non-po-reasons');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.reasons), 'Should return reasons array');
      assert.ok(res.data.reasons.length >= 5, 'Should have standard non-PO reasons');

      const initialStock = res.data.reasons.find((r) => r.code === 'INITIAL_STOCK');
      assert.ok(initialStock, 'Should contain INITIAL_STOCK reason');
    });

    it('2.2 GET /api/v1/receiving/suppliers - Should return suppliers master list', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/suppliers');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.suppliers), 'Should return suppliers array');
      assert.ok(res.data.suppliers.length >= 5, 'Should have standard suppliers');
    });

    it('2.3 POST /api/v1/receiving/validate-batch - Should validate batch prior to review modal', async () => {
      const validBatchPayload = {
        supplier: 'Dell Technologies',
        receivingDate: '2026-08-21',
        receivingLocation: 'Dubai HQ - IT Store',
        receivedBy: 'John Doe',
        reason: 'Initial stock / Donation / Transfer',
        items: [
          {
            serialNumber: `SN-BATCH-TEST-${Date.now()}`,
            assetName: 'Dell Latitude 7450',
            tagNumber: `E360000${Date.now().toString().slice(-5)}`,
            status: 'Tagged'
          }
        ]
      };

      const res = await apiRequest('POST', '/api/v1/receiving/validate-batch', validBatchPayload);

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.valid, true, 'Valid batch should pass validation');
      assert.equal(res.data.summary.totalItems, 1);
      assert.equal(res.data.summary.taggedCount, 1);
      assert.equal(res.data.summary.errorCount, 0);
    });

    it('2.4 POST /api/v1/receiving/drafts & GET & DELETE - Should manage receiving session drafts', async () => {
      const draftPayload = {
        id: `DRAFT-TEST-${Date.now()}`,
        mode: 'WITHOUT_PO',
        supplier: 'Apple Inc.',
        referenceNo: 'DN-TEST-DRAFT',
        receivingLocation: 'Dubai HQ - IT Store',
        scannedItems: [
          {
            assetName: 'MacBook Pro 16"',
            serialNumber: 'MBP-DRAFT-01',
            status: 'Pending'
          }
        ]
      };

      // Save draft
      const saveRes = await apiRequest('POST', '/api/v1/receiving/drafts', draftPayload);
      assert.equal(saveRes.status, 200);
      assert.equal(saveRes.data.success, true);
      testDraftId = saveRes.data.draft.id;

      // Get draft by ID
      const getRes = await apiRequest('GET', `/api/v1/receiving/drafts/${testDraftId}`);
      assert.equal(getRes.status, 200);
      assert.equal(getRes.data.success, true);
      assert.equal(getRes.data.draft.referenceNo, 'DN-TEST-DRAFT');

      // Delete draft
      const delRes = await apiRequest('DELETE', `/api/v1/receiving/drafts/${testDraftId}`);
      assert.equal(delRes.status, 200);
      assert.equal(delRes.data.success, true);
    });

    it('2.5 POST /api/v1/receiving/submit - Should submit Receive without PO and persist to SQL Server', async () => {
      const testNonPoGrn = `TEST-GRN-NONPO-${Date.now()}`;
      const testSerial = `SN-NONPO-${Date.now()}`;
      const testTag = `TAG-NONPO-${Date.now()}`;
      const testEpc = `E28011606${Date.now().toString().slice(-7)}`;

      createdTestReceiptNumbers.push(testNonPoGrn);
      createdTestTagNumbers.push(testTag);

      const nonPoPayload = {
        mode: 'WITHOUT_PO',
        poNumber: 'NON-PO',
        supplier: 'Direct Hardware Supplier',
        receivingDate: new Date().toISOString(),
        referenceNo: testNonPoGrn,
        receivingLocation: 'Dubai HQ - Warehouse Dock 2',
        receivedBy: 'Jane Logistics',
        nonPoReason: 'Initial stock / Donation / Transfer',
        remarks: 'Direct delivery donation from regional partner',
        requireApproval: false,
        scannedItems: [
          {
            assetName: 'HP LaserJet Enterprise Printer (Non-PO)',
            description: 'HP Enterprise Workgroup Laser Printer',
            category: 'Printer',
            model: 'LaserJet Enterprise',
            serialNumber: testSerial,
            tagNumber: testTag,
            rfidEpc: testEpc,
            status: 'Tagged'
          }
        ]
      };

      const res = await apiRequest('POST', '/api/v1/receiving/submit', nonPoPayload);

      assert.equal(res.status, 201, 'Status must be 201 Created');
      assert.equal(res.data.success, true);
      assert.ok(res.data.receipt);
      assert.equal(res.data.receipt.mode, 'WITHOUT_PO');
      assert.equal(res.data.receipt.poNumber, 'NON-PO');

      // Verify DB persistence
      const dbReceipt = await prisma.receipt.findFirst({
        where: { receiptNumber: testNonPoGrn }
      });
      assert.ok(dbReceipt, 'Non-PO receipt must exist in SQL Server');
      assert.equal(dbReceipt.poNumber, 'NON-PO');

      const dbAsset = await prisma.asset.findFirst({
        where: { tagNumber: testTag }
      });
      assert.ok(dbAsset, 'Non-PO asset must exist in SQL Server');
      createdTestAssetIds.push(dbAsset.id);
      assert.equal(dbAsset.serialNumber, testSerial);
      assert.equal(dbAsset.lifecycleStatus, 'TAGGED');

      // Verify Tag record
      const dbTag = await prisma.tag.findUnique({
        where: { tagNumber: testTag }
      });
      assert.ok(dbTag, 'Tag record must be active in SQL Server');
      assert.equal(dbTag.assetId, dbAsset.id);
    });
  });

  // =========================================================================
  // MODULE 3: TAG ASSETS
  // =========================================================================
  describe('Module 3: Tag Assets', () => {
    it('3.1 GET /api/v1/tagging/assets - Should return assets with tagging status and summary', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/assets');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.assets), 'Should return assets list');
      assert.ok(res.data.assets.length > 0, 'Should return at least 1 asset');
      assert.ok(res.data.summary, 'Should return summary stats');
      assert.ok(typeof res.data.summary.tagged === 'number');
      assert.ok(typeof res.data.summary.pending === 'number');

      const asset = res.data.assets[0];
      assert.ok(asset.id, 'Asset must have id');
      assert.ok(asset.assetNumber, 'Asset must have assetNumber');
      assert.ok(asset.status, 'Asset must have tagging status (Tagged or Not Tagged)');
    });

    it('3.2 POST /api/v1/tagging/generate - Should generate sequential Tag Number and RFID EPC', async () => {
      const res = await apiRequest('POST', '/api/v1/tagging/generate', {
        prefix: 'E360000',
        tagType: 'RFID_GEN2',
        count: 2
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.tags));
      assert.equal(res.data.tags.length, 2);

      const tag1 = res.data.tags[0];
      assert.ok(tag1.tagNumber.startsWith('E360000'));
      assert.ok(tag1.rfidEpc.startsWith('E28011606000'));
      assert.equal(tag1.tagType, 'RFID_GEN2');
    });

    it('3.3 POST /api/v1/tagging/validate - Should validate tag availability before association', async () => {
      const newTag = `E36-VALID-${Date.now()}`;
      const res = await apiRequest('POST', '/api/v1/tagging/validate', {
        tagNumber: newTag,
        tagType: 'RFID_GEN2'
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.valid, true);
      assert.equal(res.data.tagNumber, newTag);
    });

    it('3.4 POST /api/v1/tagging/associate - Should assign tag to asset and update SQL Server database', async () => {
      // Find an untagged asset or create a test asset to associate tag
      const existingAssetsRes = await apiRequest('GET', '/api/v1/tagging/assets');
      let targetAsset = existingAssetsRes.data.assets.find((a) => a.status === 'Not Tagged');

      // If no untagged asset available, create a fresh test asset in SQL Server
      if (!targetAsset) {
        const company = await prisma.company.findFirst({ where: { active: true } });
        const site = await prisma.site.findFirst({ where: { active: true } });
        const category = await prisma.category.findFirst({ where: { active: true } });

        const created = await prisma.asset.create({
          data: {
            assetId: `AST-TAGTEST-${Date.now().toString().slice(-6)}`,
            description: 'Untagged QA Asset For Association Test',
            serialNumber: `SN-TAGTEST-${Date.now()}`,
            categoryId: category.id,
            companyId: company.id,
            siteId: site.id,
            lifecycleStatus: 'RECEIVED',
            condition: 'NEW'
          }
        });
        createdTestAssetIds.push(created.id);
        targetAsset = { id: created.id, assetNumber: created.assetId, assetName: created.description };
      }

      const assignedTag = `E36-TEST-${Date.now()}`;
      const assignedEpc = `E28011606000${Date.now().toString().slice(-5)}`;
      createdTestTagNumbers.push(assignedTag);

      const associatePayload = {
        assetId: targetAsset.id,
        tagNumber: assignedTag,
        tagType: 'RFID_GEN2',
        rfidEpc: assignedEpc,
        reason: 'Initial Tag Association E2E Test',
        notes: 'Assigned via Tag Assets Workbench'
      };

      const res = await apiRequest('POST', '/api/v1/tagging/associate', associatePayload);

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(res.data.message.includes('successfully assigned'));
      assert.equal(res.data.asset.currentTag, assignedTag);
      assert.equal(res.data.asset.status, 'Tagged');

      // Verify SQL Server was updated
      const updatedDbAsset = await prisma.asset.findFirst({
        where: { OR: [{ id: targetAsset.id }, { assetId: targetAsset.assetNumber }] }
      });
      assert.ok(updatedDbAsset, 'Asset must exist in DB');
      assert.equal(updatedDbAsset.tagNumber, assignedTag);
      assert.equal(updatedDbAsset.lifecycleStatus, 'TAGGED');

      // Verify Tag record created in DB
      const dbTag = await prisma.tag.findUnique({
        where: { tagNumber: assignedTag }
      });
      assert.ok(dbTag, 'Tag record must be active in DB');
      assert.equal(dbTag.status, 'ACTIVE');

      // Verify Tag transaction log
      const dbTx = await prisma.assetTransaction.findFirst({
        where: { assetId: updatedDbAsset.id, transactionType: 'TAG' }
      });
      assert.ok(dbTx, 'Tag assignment transaction must be logged in asset_transactions');
    });

    it('3.5 GET /api/v1/tagging/recent - Should return recently tagged assets', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/recent');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.recent), 'Should return recent tagged array');
      assert.ok(res.data.recent.length > 0, 'Should have recent tagged assets');

      const recentItem = res.data.recent[0];
      assert.ok(recentItem.assetNumber);
      assert.ok(recentItem.tagNumber);
      assert.equal(recentItem.status, 'Tagged');
    });

    it('3.6 GET /api/v1/tagging/stats - Should return tagging statistics', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/stats');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats);
      assert.ok(typeof res.data.stats.selected === 'number');
      assert.ok(typeof res.data.stats.tagged === 'number');
      assert.ok(typeof res.data.stats.pending === 'number');
    });

    it('3.7 POST /api/v1/tagging/print-labels - Should generate print spool jobs', async () => {
      const res = await apiRequest('POST', '/api/v1/tagging/print-labels', {
        labelTemplate: 'STANDARD_2X1',
        printer: 'Zebra ZT411 RFID',
        quantity: 2,
        tagPrefix: 'E360000',
        tagFormat: 'RFID_GEN2'
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.labels));
      assert.equal(res.data.labels.length, 2);
      assert.equal(res.data.labels[0].status, 'PRINT_SENT_TO_SPOOLER');
    });

    it('3.8 POST /api/v1/tagging/draft & GET /api/v1/tagging/draft - Should save and restore tagging draft', async () => {
      const draftPayload = {
        selectedAssetIds: ['ast-01', 'ast-02'],
        stagedAssignments: { 'ast-01': 'TAG-STAGE-01' },
        notes: 'In progress floor tagging audit'
      };

      const saveRes = await apiRequest('POST', '/api/v1/tagging/draft', draftPayload);
      assert.equal(saveRes.status, 200);
      assert.equal(saveRes.data.success, true);

      const getRes = await apiRequest('GET', '/api/v1/tagging/draft');
      assert.equal(getRes.status, 200);
      assert.equal(getRes.data.success, true);
      assert.ok(getRes.data.draft);
      assert.equal(getRes.data.draft.notes, 'In progress floor tagging audit');
    });

    it('3.9 POST /api/v1/tagging/complete - Should complete tagging session successfully', async () => {
      const res = await apiRequest('POST', '/api/v1/tagging/complete', {
        selectedAssetIds: []
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.valid, true);
      assert.ok(res.data.message.includes('completed and verified'));
    });

    it('3.10 GET /api/v1/tagging/audit - Should retrieve complete tagging audit log', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/audit');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.history));
      assert.ok(res.data.history.length > 0, 'Audit history should record tagging events');
    });
  });
});
