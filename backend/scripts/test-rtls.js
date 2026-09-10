import dotenv from 'dotenv';
dotenv.config();
import { MockRtlsHardwareAdapter } from '../modules/rtls/hardwareAdapter.js';
import * as rtlsService from '../modules/rtls/rtls.service.js';
import prisma from '../config/prisma.js';

async function runRtlsTests() {
  console.log('🧪 Starting Automated RTLS Unit & Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Hardware Abstraction & Mock Adapter
    const mockAdapter = new MockRtlsHardwareAdapter({ readerIdentifier: 'R-TEST-001' });
    const status = await mockAdapter.getStatus();
    assert(status.status === 'ONLINE' && status.readerIdentifier === 'R-TEST-001', 'Hardware Adapter returns ONLINE status');

    const simulatedPayload = await mockAdapter.simulateTagRead({ epc: 'E280116060009999', readerId: 'R-TEST-001', rssi: -60 });
    assert(simulatedPayload.epc === 'E280116060009999' && simulatedPayload.rssi === -60, 'Hardware Simulator generates valid payload');

    // Test 2: Ingest Unknown EPC Event (Rule Verification: Must NOT auto-create capital asset)
    const unknownResult = await rtlsService.processRfidEvent({
      epc: 'E280-UNKNOWN-TAG-001',
      readerIdentifier: 'R-TEST-GATEWAY-01',
      antennaNumber: 1,
      rssi: -55
    });

    assert(unknownResult.success === true, 'Unknown EPC event processed gracefully');
    assert(unknownResult.unknownEpc === true, 'Unknown EPC flagged correctly');
    
    const createdAssetCheck = await prisma.asset.findFirst({ where: { serialNumber: 'E280-UNKNOWN-TAG-001' } });
    assert(!createdAssetCheck, 'RULE ENFORCED: System NEVER automatically creates a capital asset from an unknown RFID EPC');

    // Test 3: Event De-duplication Logic
    const epcDup = 'E280116060009001';
    const firstCall = await rtlsService.processRfidEvent({
      epc: epcDup,
      readerIdentifier: 'R-DUP-TEST',
      antennaNumber: 1
    });

    const secondCallInstant = await rtlsService.processRfidEvent({
      epc: epcDup,
      readerIdentifier: 'R-DUP-TEST',
      antennaNumber: 1
    });

    assert(secondCallInstant.deduplicated === true, 'Read de-duplication suppresses duplicate reads within 5-second window');

    // Test 4: Reader Heartbeat Logging
    const heartbeatRes = await rtlsService.processHeartbeat({
      readerIdentifier: 'R-TEST-001',
      status: 'ONLINE',
      latencyMs: 12
    });
    assert(heartbeatRes.status === 'ONLINE', 'Reader heartbeat logged successfully');

    // Test 5: Dashboard Summary Aggregation
    const summary = await rtlsService.getDashboardSummary();
    assert(typeof summary.totalReaders === 'number' && typeof summary.unknownEpcCount === 'number', 'RTLS Dashboard metrics aggregated correctly');

  } catch (err) {
    console.error('❌ Test Runner Exception:', err);
    failed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
    await prisma.$disconnect();
    if (failed > 0) process.exit(1);
  }
}

runRtlsTests();
