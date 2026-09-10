import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';

export async function seedRtlsData() {
  console.log('📡 Seeding RTLS Fixed Readers, Antennas, and Live Asset Locations...');

  const site = await prisma.site.findFirst({ where: { active: true } });
  if (!site) {
    console.log('⚠️ No active Site found for RTLS seeding.');
    return;
  }

  const building = await prisma.building.findFirst({ where: { siteId: site.id } });
  const floor = await prisma.floor.findFirst({ where: { buildingId: building?.id } });
  const zones = await prisma.zone.findMany({ take: 4 });

  // 1. Create Sample Fixed Readers
  const readersData = [
    {
      readerIdentifier: 'R-MAIN-ENTRANCE-01',
      name: 'Main Entrance Gateway Reader',
      manufacturer: 'Impinj',
      modelName: 'Speedway R420',
      ipAddress: '192.168.10.50',
      macAddress: '00:16:25:AA:11:01',
      siteId: site.id,
      buildingId: building?.id,
      floorId: floor?.id,
      zoneId: zones[0]?.id || null,
      status: 'ONLINE',
      firmwareVersion: 'v5.14.0'
    },
    {
      readerIdentifier: 'R-WAREHOUSE-BAY-02',
      name: 'Warehouse Loading Bay Portal',
      manufacturer: 'Zebra',
      modelName: 'FX9600 4-Port',
      ipAddress: '192.168.10.51',
      macAddress: '00:16:25:AA:11:02',
      siteId: site.id,
      buildingId: building?.id,
      floorId: floor?.id,
      zoneId: zones[1]?.id || null,
      status: 'ONLINE',
      firmwareVersion: 'v3.8.2'
    },
    {
      readerIdentifier: 'R-IT-SERVER-ROOM-03',
      name: 'IT Server Room Gate Reader',
      manufacturer: 'Alien Technology',
      modelName: 'ALR-F800 Enterprise',
      ipAddress: '192.168.10.52',
      macAddress: '00:16:25:AA:11:03',
      siteId: site.id,
      buildingId: building?.id,
      floorId: floor?.id,
      zoneId: zones[2]?.id || null,
      status: 'ONLINE',
      firmwareVersion: 'v2.1.0'
    },
    {
      readerIdentifier: 'R-RESTRICTED-LAB-04',
      name: 'Restricted R&D Lab Reader',
      manufacturer: 'Impinj',
      modelName: 'xSpan Portal',
      ipAddress: '192.168.10.53',
      macAddress: '00:16:25:AA:11:04',
      siteId: site.id,
      buildingId: building?.id,
      floorId: floor?.id,
      zoneId: zones[3]?.id || null,
      status: 'DEGRADED',
      firmwareVersion: 'v5.14.0'
    }
  ];

  for (const r of readersData) {
    const reader = await prisma.rtlsReader.upsert({
      where: { readerIdentifier: r.readerIdentifier },
      update: { status: r.status, lastHeartbeat: new Date() },
      create: r
    });

    // Create 2 Antennas per Reader
    await prisma.rtlsAntenna.upsert({
      where: { readerId_antennaNumber: { readerId: reader.id, antennaNumber: 1 } },
      update: {},
      create: {
        readerId: reader.id,
        antennaNumber: 1,
        name: `${reader.name} - Antenna 1 (Entry)`,
        zoneId: r.zoneId,
        direction: 'INBOUND'
      }
    });

    await prisma.rtlsAntenna.upsert({
      where: { readerId_antennaNumber: { readerId: reader.id, antennaNumber: 2 } },
      update: {},
      create: {
        readerId: reader.id,
        antennaNumber: 2,
        name: `${reader.name} - Antenna 2 (Exit)`,
        zoneId: r.zoneId,
        direction: 'OUTBOUND'
      }
    });
  }

  // 2. Assign Sample Live RTLS Locations to Existing Assets
  const assets = await prisma.asset.findMany({ take: 10 });
  const readers = await prisma.rtlsReader.findMany({ include: { antennas: true } });

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const assignedReader = readers[i % readers.length];
    const assignedAntenna = assignedReader.antennas[0];

    await prisma.rtlsAssetLocation.upsert({
      where: { assetId: asset.id },
      update: {
        zoneId: assignedReader.zoneId,
        readerId: assignedReader.id,
        antennaId: assignedAntenna?.id,
        lastSeen: new Date()
      },
      create: {
        assetId: asset.id,
        zoneId: assignedReader.zoneId,
        readerId: assignedReader.id,
        antennaId: assignedAntenna?.id,
        confidence: 95,
        firstSeen: new Date(),
        lastSeen: new Date(),
        source: 'RFID_RTLS',
        xRatio: 0.2 + (i * 0.08),
        yRatio: 0.3 + (i * 0.05)
      }
    });
  }

  // 3. Create Initial Alerts
  const sampleAlert = await prisma.rtlsAlert.findFirst({ where: { alertType: 'UNKNOWN_EPC' } });
  if (!sampleAlert && readers[0]) {
    await prisma.rtlsAlert.create({
      data: {
        alertType: 'UNKNOWN_EPC',
        severity: 'MEDIUM',
        message: 'Unregistered RFID Tag Detected (EPC: E280116060009999) at Main Entrance Gateway',
        readerId: readers[0].id,
        status: 'OPEN'
      }
    });
  }

  console.log('✅ RTLS Fixed Readers, Antennas, and Asset Locations seeded successfully.');
}

if (process.argv[1].endsWith('seedRtls.js')) {
  seedRtlsData().catch(console.error).finally(() => prisma.$disconnect());
}
