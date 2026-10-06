const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Fast seeding remaining discovery observations and work orders...');

  const users = await prisma.user.findMany();
  const adminUser = users.find(u => u.username === 'admin') || users[0];
  const assets = await prisma.asset.findMany();

  // 1. Seed Discovery Observations
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
    console.log('✅ Discovery observations created.');
  }

  // 2. Work Orders
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
    console.log('✅ Work orders created.');
  }

  // 3. Contracts
  const existingContracts = await prisma.contract.count();
  if (existingContracts === 0) {
    await prisma.contract.create({
      data: {
        contractNumber: 'AMC-2026-DELL-01',
        title: 'Dell ProSupport Plus Enterprise Server & Storage AMC',
        contractType: 'ANNUAL_MAINTENANCE',
        providerName: 'Dell Technologies Middle East',
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-12-31T23:59:59Z'),
        cost: 185000.00,
        slaDetails: '4-hour on-site hardware replacement SLA',
        active: true
      }
    });
    console.log('✅ Contract created.');
  }

  console.log('🎉 Fast seed completed successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
