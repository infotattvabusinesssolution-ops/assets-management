import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, apiRequest } from './test-helper.js';
import prisma from '../config/prisma.js';

describe('Bulk Tagging, Print Tags & Receive History Test Suite', () => {
  const createdTestAssetIds = [];
  const createdTestReceiptNumbers = [];
  const createdTestTagNumbers = [];
  let testBulkDraftId = null;

  before(async () => {
    await setupTestEnvironment();
  });

  after(async () => {
    console.log('🧹 Cleaning up test records from Bulk Tagging, Print Tags, and Receive History tests...');
    try {
      // 1. Delete test receipts and line items
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

      // 2. Delete test tags
      await prisma.tag.deleteMany({
        where: {
          OR: [
            ...(createdTestTagNumbers.length > 0 ? [{ tagNumber: { in: createdTestTagNumbers } }] : []),
            { tagNumber: { startsWith: 'TAG-HIST-' } }
          ]
        }
      });

      // 3. Delete created test assets and their dependent relations
      const assets = await prisma.asset.findMany({
        where: {
          OR: [
            ...(createdTestAssetIds.length > 0 ? [{ id: { in: createdTestAssetIds } }, { assetId: { in: createdTestAssetIds } }] : []),
            { assetId: { startsWith: 'AST-REC-' } },
            { poNumber: 'PO-2026-00456' }
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
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    await teardownTestEnvironment();
  });

  // =========================================================================
  // SECTION 1: BULK TAGGING
  // =========================================================================
  describe('Section 1: Bulk Tagging Workbench', () => {
    it('1.1 GET /api/v1/tagging/assets - Should retrieve assets for bulk tagging with status and summary', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/assets');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.assets), 'Must return assets array');
      assert.ok(res.data.assets.length > 0, 'Must have assets in list');
      assert.ok(res.data.summary, 'Must return tagging summary');
      assert.ok(typeof res.data.summary.selected === 'number');
      assert.ok(typeof res.data.summary.tagged === 'number');
      assert.ok(typeof res.data.summary.pending === 'number');

      const firstAsset = res.data.assets[0];
      assert.ok(firstAsset.id);
      assert.ok(firstAsset.assetNumber);
      assert.ok(firstAsset.status);
    });

    it('1.2 POST /api/v1/tagging/generate - Should generate multiple bulk sequential Tag Numbers and RFID EPCs', async () => {
      const count = 5;
      const res = await apiRequest('POST', '/api/v1/tagging/generate', {
        prefix: 'E360000',
        tagType: 'RFID_GEN2',
        count
      });

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.tags));
      assert.equal(res.data.tags.length, count, `Must return exactly ${count} generated tags`);

      // Verify uniqueness and format across generated tags
      const tagSet = new Set();
      const epcSet = new Set();
      for (const t of res.data.tags) {
        assert.ok(t.tagNumber.startsWith('E360000'));
        assert.ok(t.rfidEpc.startsWith('E28011606000'));
        assert.equal(t.tagType, 'RFID_GEN2');
        assert.equal(tagSet.has(t.tagNumber), false, 'Generated tagNumbers must be unique');
        assert.equal(epcSet.has(t.rfidEpc), false, 'Generated rfidEpcs must be unique');
        tagSet.add(t.tagNumber);
        epcSet.add(t.rfidEpc);
      }
    });

    it('1.3 POST /api/v1/tagging/bulk-associate - Should atomically assign tags to multiple assets and update SQL Server', async () => {
      // Create 3 fresh test assets in SQL Server for bulk tagging
      const company = await prisma.company.findFirst({ where: { active: true } });
      const site = await prisma.site.findFirst({ where: { active: true } });
      const category = await prisma.category.findFirst({ where: { active: true } });

      const testAssets = [];
      const testPrefix = Date.now().toString().slice(-6);

      for (let i = 1; i <= 3; i++) {
        const created = await prisma.asset.create({
          data: {
            assetId: `AST-BULK-${testPrefix}-${i}`,
            description: `Bulk Tagging Test Asset #${i}`,
            serialNumber: `SN-BULK-${testPrefix}-${i}`,
            categoryId: category.id,
            companyId: company.id,
            siteId: site.id,
            lifecycleStatus: 'RECEIVED',
            condition: 'NEW'
          }
        });
        createdTestAssetIds.push(created.id);
        testAssets.push(created);
      }

      // Generate 3 unique tags
      const assignments = testAssets.map((asset, idx) => {
        const tagNumber = `TAG-BULK-${testPrefix}-${idx + 1}`;
        const rfidEpc = `E28011606000${testPrefix}${idx + 1}`;
        createdTestTagNumbers.push(tagNumber);
        return {
          assetId: asset.id,
          tagNumber,
          rfidEpc,
          tagType: 'RFID_GEN2'
        };
      });

      const bulkPayload = {
        assignments,
        reason: 'Automated Bulk Tagging Verification',
        notes: 'Bulk assigned via BulkTaggingWorkbench'
      };

      const res = await apiRequest('POST', '/api/v1/tagging/bulk-associate', bulkPayload);

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.equal(res.data.count, 3, 'Must process 3 assignments');
      assert.ok(res.data.message.includes('bulk-tagged 3 asset(s)'));
      assert.ok(res.data.stats, 'Must return updated summary stats');

      // Verify database state for all 3 assets
      for (const a of assignments) {
        const dbAsset = await prisma.asset.findUnique({
          where: { id: a.assetId }
        });
        assert.ok(dbAsset, `Asset ${a.assetId} must exist in DB`);
        assert.equal(dbAsset.tagNumber, a.tagNumber, 'tagNumber must match');
        assert.equal(dbAsset.rfidEpc, a.rfidEpc, 'rfidEpc must match');
        assert.equal(dbAsset.lifecycleStatus, 'TAGGED', 'lifecycleStatus must be TAGGED');

        // Verify active Tag record in dbo.tags
        const dbTag = await prisma.tag.findUnique({
          where: { tagNumber: a.tagNumber }
        });
        assert.ok(dbTag, `Tag ${a.tagNumber} must exist in dbo.tags`);
        assert.equal(dbTag.assetId, a.assetId);
        assert.equal(dbTag.status, 'ACTIVE');

        // Verify audit log in dbo.asset_transactions
        const dbTx = await prisma.assetTransaction.findFirst({
          where: { assetId: a.assetId, transactionType: 'TAG' }
        });
        assert.ok(dbTx, `AssetTransaction must exist for asset ${a.assetId}`);
      }
    });

    it('1.4 POST /api/v1/tagging/draft & GET /api/v1/tagging/draft - Should save and restore bulk tagging draft', async () => {
      const draftData = {
        selectedAssetIds: ['ast-bulk-01', 'ast-bulk-02', 'ast-bulk-03'],
        stagedAssignments: {
          'ast-bulk-01': 'TAG-STAGE-01',
          'ast-bulk-02': 'TAG-STAGE-02'
        },
        notes: 'Bulk tagging staging for Warehouse Dock 2'
      };

      const saveRes = await apiRequest('POST', '/api/v1/tagging/draft', draftData);
      assert.equal(saveRes.status, 200);
      assert.equal(saveRes.data.success, true);
      assert.ok(saveRes.data.draft);
      testBulkDraftId = saveRes.data.draft.draftId;

      const getRes = await apiRequest('GET', '/api/v1/tagging/draft');
      assert.equal(getRes.status, 200);
      assert.equal(getRes.data.success, true);
      assert.ok(getRes.data.draft);
      assert.equal(getRes.data.draft.selectedAssetIds.length, 3);
      assert.equal(getRes.data.draft.notes, 'Bulk tagging staging for Warehouse Dock 2');
    });

    it('1.5 POST /api/v1/tagging/complete - Should validate and complete bulk tagging session', async () => {
      const res = await apiRequest('POST', '/api/v1/tagging/complete', {
        selectedAssetIds: []
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.valid, true);
      assert.ok(res.data.message.includes('completed and verified'));
      assert.ok(res.data.summary);
    });
  });

  // =========================================================================
  // SECTION 2: PRINT TAGS WORKBENCH
  // =========================================================================
  describe('Section 2: Print Tags Workbench', () => {
    it('2.1 GET /api/v1/tagging/templates - Should retrieve industrial label printing templates', async () => {
      const res = await apiRequest('GET', '/api/v1/tagging/templates');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.templates));
      assert.ok(res.data.templates.length >= 4, 'Should have standard templates');

      const std = res.data.templates.find((t) => t.name === 'STANDARD_2X1');
      assert.ok(std, 'Must contain STANDARD_2X1 template');
      assert.ok(std.dimensions);
      assert.ok(std.dpi);

      const rfidMetallic = res.data.templates.find((t) => t.name === 'RFID_GEN2_METALLIC');
      assert.ok(rfidMetallic, 'Must contain RFID_GEN2_METALLIC template');
    });

    it('2.2 POST /api/v1/tagging/print - Should spool print jobs for multiple selected assets', async () => {
      const printPayload = {
        template: 'STANDARD_2X1',
        quantity: 2, // 2 copies per asset
        printer: 'Zebra ZT411 RFID (Warehouse Dock 2)',
        assets: [
          {
            assetNumber: 'AS-2026-00121',
            assetName: 'Dell OptiPlex 7020',
            serialNumber: '7CD1234',
            currentTag: 'TAG-PRNT-001'
          },
          {
            assetNumber: 'AS-2026-00122',
            assetName: 'HP LaserJet Pro',
            serialNumber: 'CNB89001',
            currentTag: 'TAG-PRNT-002'
          }
        ]
      };

      const res = await apiRequest('POST', '/api/v1/tagging/print', printPayload);

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.labels));
      assert.equal(res.data.labels.length, 4, '2 assets x 2 copies = 4 print jobs');

      const job1 = res.data.labels[0];
      assert.ok(job1.jobId.startsWith('PRINT-'));
      assert.equal(job1.tagNumber, 'TAG-PRNT-001');
      assert.equal(job1.labelTemplate, 'STANDARD_2X1');
      assert.equal(job1.printer, 'Zebra ZT411 RFID (Warehouse Dock 2)');
      assert.equal(job1.status, 'PRINT_SENT_TO_SPOOLER');
      assert.ok(job1.printedAt);
    });

    it('2.3 POST /api/v1/tagging/print-labels - Should spool print jobs using tagPrefix generation when unassigned', async () => {
      const res = await apiRequest('POST', '/api/v1/tagging/print-labels', {
        labelTemplate: 'RFID_GEN2_METALLIC',
        printer: 'Zebra ZT411 RFID',
        quantity: 3,
        tagPrefix: 'E360000',
        tagFormat: 'RFID_GEN2',
        assetDetails: {
          assetNumber: 'AS-2026-00199',
          assetName: 'Core Cisco Catalyst Switch',
          serialNumber: 'CSCO-SW-99'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.labels));
      assert.equal(res.data.labels.length, 3);

      for (const label of res.data.labels) {
        assert.ok(label.tagNumber.startsWith('E360000'));
        assert.ok(label.rfidEpc.startsWith('E28011606000'));
        assert.equal(label.labelTemplate, 'RFID_GEN2_METALLIC');
        assert.equal(label.status, 'PRINT_SENT_TO_SPOOLER');
      }
    });
  });

  // =========================================================================
  // SECTION 3: RECEIVE HISTORY
  // =========================================================================
  describe('Section 3: Receive History', () => {
    let testHistoryReceiptNo = null;

    before(async () => {
      // Seed a dedicated receipt in SQL Server for history queries
      testHistoryReceiptNo = `RCV-HIST-TEST-${Date.now()}`;
      createdTestReceiptNumbers.push(testHistoryReceiptNo);

      const itemTag = `TAG-HIST-${Date.now()}-1`;
      const itemSerial = `SN-HIST-${Date.now()}-1`;
      createdTestTagNumbers.push(itemTag);

      const submitRes = await apiRequest('POST', '/api/v1/receiving/submit', {
        mode: 'WITH_PO',
        poNumber: 'PO-2026-00456',
        supplier: 'Dell Technologies',
        receivingDate: '2026-08-21T10:45:00.000Z',
        referenceNo: testHistoryReceiptNo,
        receivingLocation: 'Dubai HQ - IT Store',
        receivedBy: 'Sara Ahmed',
        remarks: 'Batch of workstations and docking units',
        requireApproval: false,
        scannedItems: [
          {
            assetName: 'Dell Latitude 7450',
            serialNumber: itemSerial,
            tagNumber: itemTag,
            status: 'Tagged'
          }
        ]
      });
    });

    it('3.1 GET /api/v1/receiving/history - Should retrieve goods receipts list with aliases', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/history');

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.history), 'Must return history array');
      assert.ok(Array.isArray(res.data.receipts), 'Must return receipts alias array');
      assert.ok(res.data.history.length > 0, 'History must contain at least 1 record');

      const first = res.data.history[0];
      assert.ok(first.receiptNumber);
      assert.ok(first.vendorName);
      assert.ok(first.poNumber);
      assert.ok(first.status);
    });

    it('3.2 GET /api/v1/receiving/history - Should filter by receiveNumber (or q query)', async () => {
      const res = await apiRequest('GET', `/api/v1/receiving/history?q=${testHistoryReceiptNo}`);

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.history.length >= 1);
      const match = res.data.history.find((r) => r.receiptNumber === testHistoryReceiptNo);
      assert.ok(match, `Receipt ${testHistoryReceiptNo} must be found via search`);
      assert.equal(match.vendorName, 'Dell Technologies');
    });

    it('3.3 GET /api/v1/receiving/history - Should filter by receiveType (With PO vs Without PO)', async () => {
      const withPoRes = await apiRequest('GET', '/api/v1/receiving/history?receiveType=With PO');
      assert.equal(withPoRes.status, 200);
      assert.equal(withPoRes.data.success, true);
      for (const r of withPoRes.data.history) {
        assert.ok(r.mode === 'WITH_PO' || r.poNumber !== 'NON-PO', 'Every item must be With PO');
      }

      const withoutPoRes = await apiRequest('GET', '/api/v1/receiving/history?receiveType=Without PO');
      assert.equal(withoutPoRes.status, 200);
      assert.equal(withoutPoRes.data.success, true);
      for (const r of withoutPoRes.data.history) {
        assert.ok(r.mode === 'WITHOUT_PO' || r.poNumber === 'NON-PO', 'Every item must be Without PO');
      }
    });

    it('3.4 GET /api/v1/receiving/history - Should filter by supplier and status', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/history?supplier=Dell&status=COMPLETED');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      for (const r of res.data.history) {
        assert.ok(r.vendorName.toLowerCase().includes('dell'));
        assert.equal(r.status.toUpperCase(), 'COMPLETED');
      }
    });

    it('3.5 GET /api/v1/receiving/history/:id - Should fetch comprehensive detail for a single goods receipt', async () => {
      const res = await apiRequest('GET', `/api/v1/receiving/history/${testHistoryReceiptNo}`);

      assert.equal(res.status, 200, 'Status must be 200 OK');
      assert.equal(res.data.success, true);
      assert.ok(res.data.transaction, 'Must return transaction detail object');
      assert.ok(res.data.receipt, 'Must return receipt alias object');

      const detail = res.data.transaction;
      assert.equal(detail.receiptNumber, testHistoryReceiptNo);
      assert.equal(detail.vendorName, 'Dell Technologies');
      assert.equal(detail.poNumber, 'PO-2026-00456');
      assert.ok(Array.isArray(detail.lineItems), 'Detail must include line items');
    });

    it('3.6 GET /api/v1/receiving/stats - Should return accurate receiving summary KPIs', async () => {
      const res = await apiRequest('GET', '/api/v1/receiving/stats');

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats);
      assert.ok(typeof res.data.stats.totalReceipts === 'number');
      assert.ok(typeof res.data.stats.totalUnitsReceived === 'number');
      assert.ok(typeof res.data.stats.totalPoValuation === 'number');
      assert.ok(typeof res.data.stats.stagedAssetsCount === 'number');
    });
  });
});
