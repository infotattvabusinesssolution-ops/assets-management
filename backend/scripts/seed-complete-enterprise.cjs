const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running Complete Enterprise Database Seeding for all modules...');

  // 1. Fetch Company, Sites, Floors, Rooms, Categories, Employees, Users, Assets
  const company = await prisma.company.findFirst({ where: { code: 'CMP-GLOBAL' } });
  if (!company) throw new Error('Company CMP-GLOBAL not found. Run master-seed-all.js first.');

  const sites = await prisma.site.findMany();
  const siteHQ = sites.find(s => s.code === 'SITE-HQ') || sites[0];
  const buildings = await prisma.building.findMany();
  const bldgA = buildings.find(b => b.code === 'BLDG-A') || buildings[0];
  const floors = await prisma.floor.findMany();
  const flr1 = floors.find(f => f.code === 'FL-01') || floors[0];
  const flr2 = floors.find(f => f.code === 'FL-02') || floors[1] || floors[0];
  const rooms = await prisma.room.findMany();
  const rmServer = rooms.find(r => r.code === 'RM-101') || rooms[0];
  const rmExec = rooms.find(r => r.code === 'RM-205') || rooms[1] || rooms[0];
  const employees = await prisma.employee.findMany();
  const users = await prisma.user.findMany();
  const adminUser = users.find(u => u.username === 'admin') || users[0];
  const assets = await prisma.asset.findMany();
  const categories = await prisma.category.findMany();

  console.log(`Loaded base: ${sites.length} sites, ${floors.length} floors, ${rooms.length} rooms, ${assets.length} assets, ${employees.length} employees.`);

  // 2. Seed Zones
  console.log('📍 Seeding Zones...');
  const zonesData = [
    { roomId: rmServer.id, code: 'ZN-SRV-A', name: 'Server Rack Row A' },
    { roomId: rmServer.id, code: 'ZN-SRV-B', name: 'Server Rack Row B & UPS' },
    { roomId: rmServer.id, code: 'ZN-STG', name: 'IT Staging & Deployment Bench' },
    { roomId: rmExec.id, code: 'ZN-EXEC-DIR', name: 'Executive Director Suites' },
    { roomId: rmExec.id, code: 'ZN-CONF-BRD', name: 'Boardroom AV Setup' },
    { roomId: rooms[3]?.id || rmServer.id, code: 'ZN-OPS-DESK', name: 'Open Workstations Area' },
    { roomId: rooms[4]?.id || rmServer.id, code: 'ZN-STORE-SEC', name: 'Secure IT Storage Cage' },
    { roomId: rooms[5]?.id || rmServer.id, code: 'ZN-DOCK-RECV', name: 'Receiving Loading Dock' }
  ];

  const seededZones = [];
  for (const z of zonesData) {
    let zone = await prisma.zone.findFirst({ where: { roomId: z.roomId, code: z.code } });
    if (!zone) {
      zone = await prisma.zone.create({
        data: { roomId: z.roomId, code: z.code, name: z.name, active: true }
      });
    }
    seededZones.push(zone);
  }
  console.log(`✅ ${seededZones.length} Zones ready.`);

  // 3. Seed Asset Classes
  console.log('🏷️ Seeding Asset Classes...');
  const catIT = categories.find(c => c.code === 'CAT-IT') || categories[0];
  const catNetwork = categories.find(c => c.code === 'CAT-NET') || categories[1] || categories[0];
  const catFurn = categories.find(c => c.code === 'CAT-FURN') || categories[2] || categories[0];

  const classData = [
    { categoryId: catIT.id, code: 'CLS-SRV', name: 'Enterprise Rack Servers' },
    { categoryId: catIT.id, code: 'CLS-LPT', name: 'Mobile Workstations & Laptops' },
    { categoryId: catIT.id, code: 'CLS-DSK', name: 'Desktop High Performance Units' },
    { categoryId: catNetwork.id, code: 'CLS-SWT', name: 'Core & Distribution Switches' },
    { categoryId: catNetwork.id, code: 'CLS-FW', name: 'Next-Gen Firewalls & Gateways' },
    { categoryId: catFurn.id, code: 'CLS-DSK-EXEC', name: 'Ergonomic Executive Desks' },
    { categoryId: catFurn.id, code: 'CLS-CHR-CONF', name: 'Conference Leather Seating' }
  ];

  for (const cls of classData) {
    const existing = await prisma.assetClass.findFirst({ where: { code: cls.code } });
    if (!existing) {
      await prisma.assetClass.create({
        data: {
          code: cls.code,
          name: cls.name,
          categoryId: cls.categoryId,
          description: `Standard classification for ${cls.name}`,
          active: true
        }
      });
    }
  }

  // 4. Seed Tags for All Assets
  console.log('🏷️ Seeding Tags for all assets...');
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const tagNum = a.tagNumber || `TAG-${String(i + 1).padStart(6, '0')}`;
    const epc = a.rfidEpc || `E28011606000002053A1B${String(i + 1).padStart(3, '0')}`;

    let tag = await prisma.tag.findFirst({
      where: {
        OR: [
          { tagNumber: tagNum },
          { rfidEpc: epc },
          { assetId: a.id }
        ]
      }
    });

    if (!tag) {
      await prisma.tag.create({
        data: {
          tagNumber: tagNum,
          tagType: 'RFID_GEN2_AND_BARCODE',
          rfidEpc: epc,
          assetId: a.id,
          status: 'ASSIGNED',
          printedDate: new Date('2026-01-15T09:00:00Z')
        }
      });
    }
  }

  // 5. Seed Floor Maps, Zones & Asset Map Positions
  console.log('🗺️ Seeding Floor Maps & Spatial Positions...');
  let floorMap1 = await prisma.floorMap.findFirst({ where: { floorId: flr1.id } });
  if (!floorMap1) {
    floorMap1 = await prisma.floorMap.create({
      data: {
        floorId: flr1.id,
        title: 'Executive Tower A - Floor 1 Data Center & Lobby Map',
        imageUrl: '/maps/floor-1-datacenter.svg',
        widthMeters: 80,
        heightMeters: 50,
        active: true
      }
    });
  }

  let floorMap2 = await prisma.floorMap.findFirst({ where: { floorId: flr2.id } });
  if (!floorMap2) {
    floorMap2 = await prisma.floorMap.create({
      data: {
        floorId: flr2.id,
        title: 'Executive Tower A - Floor 2 Executive Suites & Boardroom Map',
        imageUrl: '/maps/floor-2-executive.svg',
        widthMeters: 80,
        heightMeters: 50,
        active: true
      }
    });
  }

  // Floor Map Zones
  const existingMapZones = await prisma.floorMapZone.findMany({ where: { floorMapId: floorMap1.id } });
  if (existingMapZones.length === 0) {
    await prisma.floorMapZone.createMany({
      data: [
        {
          floorMapId: floorMap1.id,
          zoneId: seededZones[0].id,
          name: 'Server Rack A Enclosure',
          color: '#3B82F6',
          points: JSON.stringify([{ x: 0.1, y: 0.1 }, { x: 0.35, y: 0.1 }, { x: 0.35, y: 0.4 }, { x: 0.1, y: 0.4 }])
        },
        {
          floorMapId: floorMap1.id,
          zoneId: seededZones[1].id,
          name: 'UPS & Power Bay',
          color: '#10B981',
          points: JSON.stringify([{ x: 0.4, y: 0.1 }, { x: 0.65, y: 0.1 }, { x: 0.65, y: 0.4 }, { x: 0.4, y: 0.4 }])
        },
        {
          floorMapId: floorMap1.id,
          zoneId: seededZones[2].id,
          name: 'IT Staging Bench',
          color: '#F59E0B',
          points: JSON.stringify([{ x: 0.1, y: 0.5 }, { x: 0.45, y: 0.5 }, { x: 0.45, y: 0.85 }, { x: 0.1, y: 0.85 }])
        },
        {
          floorMapId: floorMap1.id,
          zoneId: seededZones[3]?.id || seededZones[0].id,
          name: 'Security Reception Desk',
          color: '#8B5CF6',
          points: JSON.stringify([{ x: 0.55, y: 0.55 }, { x: 0.85, y: 0.55 }, { x: 0.85, y: 0.85 }, { x: 0.55, y: 0.85 }])
        }
      ]
    });
  }

  // Asset Map Positions for first 30 assets
  console.log('📌 Placing assets onto Floor Map 1 & 2...');
  for (let i = 0; i < Math.min(assets.length, 30); i++) {
    const a = assets[i];
    const existingPos = await prisma.assetMapPosition.findUnique({ where: { assetId: a.id } });
    if (!existingPos) {
      const targetMap = i < 18 ? floorMap1 : floorMap2;
      const targetZone = seededZones[i % seededZones.length];
      const col = i % 5;
      const row = Math.floor(i / 5);
      const xRatio = 0.15 + (col * 0.16) + (Math.random() * 0.04);
      const yRatio = 0.18 + (row * 0.12) + (Math.random() * 0.04);

      await prisma.assetMapPosition.create({
        data: {
          assetId: a.id,
          floorMapId: targetMap.id,
          zoneId: targetZone.id,
          xRatio: Number(xRatio.toFixed(4)),
          yRatio: Number(yRatio.toFixed(4)),
          updatedByUserId: adminUser.id,
          active: true
        }
      });
    }
  }

  // 6. Seed RTLS Readers, Locations & Movements
  console.log('📡 Seeding RTLS Hardware Readers & Detected Positions...');
  const readers = await prisma.rtlsReader.findMany();
  for (let i = 0; i < Math.min(assets.length, 25); i++) {
    const a = assets[i];
    const existingLoc = await prisma.rtlsAssetLocation.findUnique({ where: { assetId: a.id } });
    const reader = readers[i % readers.length];
    if (!existingLoc && reader) {
      await prisma.rtlsAssetLocation.create({
        data: {
          assetId: a.id,
          zoneId: seededZones[i % seededZones.length].id,
          readerId: reader.id,
          confidence: 92 + (i % 8),
          firstSeen: new Date(Date.now() - 3600000 * 24 * (i + 1)),
          lastSeen: new Date(Date.now() - 60000 * (i * 3 + 2)),
          source: 'RFID_FIXED_PORTAL',
          xRatio: 0.2 + (i * 0.02),
          yRatio: 0.3 + (i * 0.015)
        }
      });

      // Add movement detection
      await prisma.rtlsMovement.create({
        data: {
          assetId: a.id,
          fromZoneId: seededZones[(i + 1) % seededZones.length].id,
          toZoneId: seededZones[i % seededZones.length].id,
          readerId: reader.id,
          detectedAt: new Date(Date.now() - 1000 * 60 * (i * 15 + 10)),
          direction: 'INBOUND',
          confidence: 95
        }
      });
    }
  }

  // 7. Seed Stocktake Campaigns & Expected Assets & Observations
  console.log('📋 Seeding Stocktake Campaigns & Observations...');
  let audit1 = await prisma.stocktakeCampaign.findFirst({ where: { campaignNumber: 'AUD-2026-0008' } });
  if (!audit1) {
    audit1 = await prisma.stocktakeCampaign.create({
      data: {
        campaignNumber: 'AUD-2026-0008',
        title: 'HQ Annual IT Asset Audit 2026',
        companyId: company.id,
        siteId: siteHQ.id,
        buildingId: bldgA.id,
        floorId: flr1.id,
        mode: 'FULL_CENSUS',
        status: 'COMPLETED',
        startDate: new Date('2026-09-01T08:00:00Z'),
        endDate: new Date('2026-09-15T18:00:00Z'),
        createdByUserId: adminUser.id,
        totalExpected: assets.length,
        totalVerified: Math.floor(assets.length * 0.8),
        totalRelocated: 4,
        totalMissing: 2,
        totalUnregistered: 1
      }
    });
  }

  let audit2 = await prisma.stocktakeCampaign.findFirst({ where: { campaignNumber: 'AUD-2026-0009' } });
  if (!audit2) {
    audit2 = await prisma.stocktakeCampaign.create({
      data: {
        campaignNumber: 'AUD-2026-0009',
        title: 'Q4 Operations Hardware & Facilities Verification',
        companyId: company.id,
        siteId: siteHQ.id,
        buildingId: bldgA.id,
        floorId: flr2.id,
        mode: 'CYCLE_COUNT',
        status: 'IN_PROGRESS',
        startDate: new Date('2026-10-01T08:00:00Z'),
        endDate: new Date('2026-10-20T18:00:00Z'),
        createdByUserId: adminUser.id,
        totalExpected: 35,
        totalVerified: 22,
        totalRelocated: 2,
        totalMissing: 1,
        totalUnregistered: 0
      }
    });
  }

  // Populate expected assets for AUD-2026-0008
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const exists = await prisma.stocktakeExpectedAsset.findUnique({
      where: {
        campaignId_assetId: {
          campaignId: audit1.id,
          assetId: a.id
        }
      }
    });

    const isVerified = i < Math.floor(assets.length * 0.8);
    const isRelocated = i >= Math.floor(assets.length * 0.8) && i < Math.floor(assets.length * 0.8) + 4;
    const isMissing = i >= Math.floor(assets.length * 0.8) + 4 && i < Math.floor(assets.length * 0.8) + 6;
    const status = isVerified ? 'VERIFIED' : isRelocated ? 'RELOCATED' : isMissing ? 'MISSING' : 'PENDING';

    if (!exists) {
      await prisma.stocktakeExpectedAsset.create({
        data: {
          campaignId: audit1.id,
          assetId: a.id,
          expectedSiteId: a.siteId,
          expectedRoomId: a.roomId,
          expectedCustodianId: a.custodianId,
          status
        }
      });

      if (isVerified || isRelocated) {
        await prisma.stocktakeObservation.create({
          data: {
            campaignId: audit1.id,
            assetId: a.id,
            scannedTagNumber: a.tagNumber,
            scannedSerial: a.serialNumber,
            scanType: 'RFID_HANDHELD',
            observedRoomId: isRelocated ? rmExec.id : a.roomId,
            observedCustodianId: a.custodianId,
            observedCondition: 'EXCELLENT',
            observedByUserId: adminUser.id,
            timestamp: new Date('2026-09-10T11:20:00Z')
          }
        });
      }

      if (isRelocated || isMissing) {
        await prisma.stocktakeException.create({
          data: {
            campaignId: audit1.id,
            assetId: a.id,
            exceptionType: isRelocated ? 'LOCATION_MISMATCH' : 'MISSING_UNACCOUNTED',
            details: isRelocated ? 'Found in Executive Wing instead of Server Lab' : 'Not located during physical barcode/RFID sweep',
            resolutionStatus: 'OPEN'
          }
        });
      }
    }
  }

  // 8. Seed Discovery Observations & Matches
  console.log('🔍 Seeding Network Discovery Observations & Automated Matches...');
  const existingObs = await prisma.discoveryObservation.count();
  if (existingObs === 0) {
    const discoveryItems = [
      { hostname: 'dxb-srv-app01', ip: '10.20.10.15', mac: '00:50:56:A1:B2:C1', os: 'Windows Server 2022', ram: 64, mfg: 'Dell', model: 'PowerEdge R750', serial: '75K3D23' },
      { hostname: 'dxb-srv-db01', ip: '10.20.10.16', mac: '00:50:56:A1:B2:C2', os: 'Red Hat Enterprise Linux 9', ram: 128, mfg: 'Dell', model: 'PowerEdge R750', serial: '75K3D24' },
      { hostname: 'dxb-sw-core01', ip: '10.20.10.1', mac: '00:1E:13:B5:44:01', os: 'Cisco IOS-XE 17.6', ram: 16, mfg: 'Cisco', model: 'Catalyst 9300', serial: 'FCW2345L0AB' },
      { hostname: 'dxb-fw-edge01', ip: '10.20.10.254', mac: '00:09:0F:77:88:99', os: 'FortiOS 7.4', ram: 8, mfg: 'Fortinet', model: 'FortiGate 100F', serial: 'FG100FTK210045' },
      { hostname: 'dxb-lt-jd01', ip: '10.20.30.45', mac: '3C:06:30:11:22:33', os: 'macOS 14.5 Sonoma', ram: 32, mfg: 'Apple', model: 'MacBook Pro 16"', serial: 'C02G1234MD6R' },
      { hostname: 'dxb-lt-sa01', ip: '10.20.30.46', mac: '48:2A:E3:44:55:66', os: 'Windows 11 Enterprise', ram: 16, mfg: 'Dell', model: 'Latitude 5440', serial: '88J2D44' },
      { hostname: 'dxb-prn-fl1', ip: '10.20.40.10', mac: '00:1B:78:99:AA:BB', os: 'HP FutureSmart 5', ram: 4, mfg: 'HP', model: 'LaserJet Enterprise M608', serial: 'CNB1N12345' },
      { hostname: 'dxb-lt-ak01', ip: '10.20.30.48', mac: '60:45:BD:77:88:99', os: 'Windows 11 Enterprise', ram: 32, mfg: 'Lenovo', model: 'ThinkPad P1 Gen 6', serial: 'PF45A123' },
      { hostname: 'dxb-ap-fl1-01', ip: '10.20.50.11', mac: '00:26:98:C1:D2:E3', os: 'Cisco AP-OS 8.10', ram: 2, mfg: 'Cisco', model: 'Catalyst 9120AX', serial: 'FOC24110XYZ' },
      { hostname: 'dxb-nas-bldgA', ip: '10.20.10.50', mac: '00:11:32:88:99:00', os: 'Synology DSM 7.2', ram: 32, mfg: 'Synology', model: 'RackStation RS3621', serial: '2180Q7R00123' }
    ];

    for (let i = 0; i < discoveryItems.length; i++) {
      const d = discoveryItems[i];
      const matchingAsset = assets.find(a =>
        (d.serial && a.serialNumber && a.serialNumber.toLowerCase() === d.serial.toLowerCase()) ||
        (d.hostname && a.assetId && a.assetId.toLowerCase().includes(d.hostname.toLowerCase()))
      ) || assets[i % assets.length];

      const obs = await prisma.discoveryObservation.create({
        data: {
          discoverySource: 'NETWORK_SNMP_AGENT',
          ipAddress: d.ip,
          macAddress: d.mac,
          hostname: d.hostname,
          serialNumber: d.serial,
          manufacturer: d.mfg,
          modelName: d.model,
          osFamily: d.os.split(' ')[0],
          osVersion: d.os,
          ramGb: d.ram,
          storageGb: d.ram * 8,
          loggedOnUser: adminUser.username,
          firstSeen: new Date(Date.now() - 3600000 * 48),
          lastSeen: new Date()
        }
      });

      if (matchingAsset) {
        await prisma.discoveryMatch.create({
          data: {
            observationId: obs.id,
            matchedAssetId: matchingAsset.id,
            confidenceScore: 96,
            matchRule: 'SERIAL_NUMBER_EXACT_MATCH',
            status: 'CONFIRMED',
            reviewedByUserId: adminUser.id,
            reviewedAt: new Date()
          }
        });
      }
    }
  }

  // 9. Seed Work Orders
  console.log('🔧 Seeding Maintenance Work Orders...');
  const existingWOs = await prisma.maintenanceWorkOrder.count();
  if (existingWOs < 5) {
    const woData = [
      {
        workOrderNumber: 'WO-2026-003',
        assetId: assets[0].id,
        workType: 'PREVENTIVE',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        description: 'Quarterly Datacenter Server Preventative Maintenance: clean heatsinks, firmware updates, redundant power supply stress test.',
        scheduledDate: new Date('2026-10-06T09:00:00Z'),
        cost: 1200.00
      },
      {
        workOrderNumber: 'WO-2026-004',
        assetId: assets[1]?.id || assets[0].id,
        workType: 'CORRECTIVE',
        priority: 'CRITICAL',
        status: 'OPEN',
        description: 'Replace UPS Battery Pack in Server Room 101: battery health alarm triggered on cell module 3B.',
        scheduledDate: new Date('2026-10-08T10:00:00Z'),
        cost: 3500.00
      },
      {
        workOrderNumber: 'WO-2026-005',
        assetId: assets[2]?.id || assets[0].id,
        workType: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'OPEN',
        description: 'Core Switch Fiber Transceiver Upgrade: upgrade 10G SFP+ to 25G on uplink ports 49-52.',
        scheduledDate: new Date('2026-10-12T14:00:00Z'),
        cost: 2400.00
      }
    ];

    for (const w of woData) {
      const existing = await prisma.maintenanceWorkOrder.findFirst({ where: { workOrderNumber: w.workOrderNumber } });
      if (!existing) {
        await prisma.maintenanceWorkOrder.create({
          data: {
            ...w,
            createdByUserId: adminUser.id,
            assignedTechnicianId: adminUser.id
          }
        });
      }
    }
  }

  // 10. Seed Workflow Definitions & Workflow Instances
  console.log('⚡ Seeding Workflow Definitions & Approval Requests...');
  let wf = await prisma.workflowDefinition.findFirst({ where: { transactionType: 'ASSET_TRANSFER' } });
  if (!wf) {
    wf = await prisma.workflowDefinition.create({
      data: {
        name: 'Standard Asset Movement & Custody Approval',
        transactionType: 'ASSET_TRANSFER',
        valueThreshold: 5000.00,
        active: true
      }
    });

    await prisma.workflowStep.createMany({
      data: [
        { workflowDefinitionId: wf.id, stepNumber: 1, name: 'Current Custodian / Department Head Release', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { workflowDefinitionId: wf.id, stepNumber: 2, name: 'Receiving Custodian / Site Manager Acceptance', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 }
      ]
    });
  }

  // Link pending transfers to workflow instances
  const pendingTransfers = await prisma.assetTransfer.findMany({ where: { status: 'PENDING_APPROVAL' } });
  for (const pt of pendingTransfers) {
    let instance = await prisma.workflowInstance.findFirst({ where: { entityId: pt.id } });
    if (!instance) {
      instance = await prisma.workflowInstance.create({
        data: {
          workflowDefinitionId: wf.id,
          entityType: 'ASSET_TRANSFER',
          entityId: pt.id,
          currentStepNumber: 1,
          status: 'PENDING',
          requestedByUserId: pt.requestedByUserId || adminUser.id
        }
      });
    }
  }

  console.log('🎉 Database Seeding for All Modules Completed Successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
