import prisma from '../../config/prisma.js';
import { realtimeEngine } from './realtimeEngine.js';

// In-memory de-duplication cache: EPC + Reader + Antenna -> Last Processed Timestamp (ms)
const deduplicationCache = new Map();
const DEDUPLICATION_WINDOW_MS = 5000; // 5 seconds default

/**
 * Normalizes and processes an incoming raw/gateway RFID read event.
 */
export async function processRfidEvent({ epc, readerIdentifier, antennaNumber = 1, rssi = -55, rawPayload = {} }) {
  const nowMs = Date.now();
  const dedupKey = `${epc}:${readerIdentifier}:${antennaNumber}`;
  const lastProcessedTime = deduplicationCache.get(dedupKey);

  // 1. De-duplication check
  if (lastProcessedTime && (nowMs - lastProcessedTime < DEDUPLICATION_WINDOW_MS)) {
    return {
      success: true,
      deduplicated: true,
      message: `Event deduplicated (within ${DEDUPLICATION_WINDOW_MS}ms window)`
    };
  }

  deduplicationCache.set(dedupKey, nowMs);

  // Clean old entries from cache every 100 events
  if (deduplicationCache.size > 500) {
    const cutoff = nowMs - DEDUPLICATION_WINDOW_MS;
    for (const [key, time] of deduplicationCache.entries()) {
      if (time < cutoff) deduplicationCache.delete(key);
    }
  }

  // 2. Resolve Reader and Antenna
  let reader = await prisma.rtlsReader.findFirst({
    where: { OR: [{ readerIdentifier }, { id: readerIdentifier }] }
  });

  if (!reader) {
    // Auto-provision reader if first seen from authorized simulator/gateway
    const defaultSite = await prisma.site.findFirst({ where: { active: true } });
    reader = await prisma.rtlsReader.create({
      data: {
        readerIdentifier: readerIdentifier || 'R-AUTO-' + Date.now().toString(36),
        name: `Reader ${readerIdentifier}`,
        siteId: defaultSite?.id || 'DEFAULT',
        status: 'ONLINE',
        lastHeartbeat: new Date()
      }
    });
  } else {
    // Touch heartbeat
    await prisma.rtlsReader.update({
      where: { id: reader.id },
      data: { lastHeartbeat: new Date(), status: 'ONLINE' }
    });
  }

  // Resolve Antenna under Reader
  const antennaNumInt = parseInt(antennaNumber, 10) || 1;
  let antenna = await prisma.rtlsAntenna.findUnique({
    where: {
      readerId_antennaNumber: {
        readerId: reader.id,
        antennaNumber: antennaNumInt
      }
    }
  });

  if (!antenna) {
    antenna = await prisma.rtlsAntenna.create({
      data: {
        readerId: reader.id,
        antennaNumber: antennaNumInt,
        name: `Antenna ${antennaNumInt}`,
        zoneId: reader.zoneId || null
      }
    });
  }

  // Target Zone: Antenna Zone takes priority, fallback to Reader Zone
  const targetZoneId = antenna.zoneId || reader.zoneId;

  // 3. Resolve EPC to Asset
  let asset = await prisma.asset.findFirst({
    where: { OR: [{ rfidEpc: epc }, { barcode: epc }, { tagNumber: epc }] },
    include: { zone: true, room: true, floor: true, building: true, site: true }
  });

  if (!asset) {
    // Check Tag table
    const tag = await prisma.tag.findFirst({
      where: { OR: [{ rfidEpc: epc }, { tagNumber: epc }] }
    });

    if (tag && tag.assetId) {
      asset = await prisma.asset.findUnique({
        where: { id: tag.assetId },
        include: { zone: true, room: true, floor: true, building: true, site: true }
      });
    }
  }

  // Log raw RFID event
  const rfidEvent = await prisma.rfidEvent.create({
    data: {
      epc,
      readerId: reader.id,
      antennaId: antenna.id,
      rssi,
      rawPayload,
      timestamp: new Date(),
      processingStatus: asset ? 'PROCESSED' : 'UNKNOWN_EPC'
    }
  });

  // 4. Handle Unknown EPC (CRITICAL RULE: Never auto-create asset from unknown RFID)
  if (!asset) {
    // Check if open UNKNOWN_EPC alert exists
    const existingAlert = await prisma.rtlsAlert.findFirst({
      where: {
        alertType: 'UNKNOWN_EPC',
        message: { contains: epc },
        status: 'OPEN'
      }
    });

    if (!existingAlert) {
      const newAlert = await prisma.rtlsAlert.create({
        data: {
          alertType: 'UNKNOWN_EPC',
          severity: 'MEDIUM',
          message: `Unregistered RFID EPC detected: ${epc} at Reader ${reader.name}`,
          readerId: reader.id,
          zoneId: targetZoneId,
          status: 'OPEN'
        }
      });
      realtimeEngine.notifyAlert(newAlert);
    }

    return {
      success: true,
      processed: false,
      unknownEpc: true,
      epc,
      message: `Unknown RFID EPC ${epc} logged. Alert created for manual review.`
    };
  }

  // 5. Update Current Live Location & Movement Timeline
  const currentLoc = await prisma.rtlsAssetLocation.findUnique({
    where: { assetId: asset.id }
  });

  const previousZoneId = currentLoc ? currentLoc.zoneId : asset.zoneId;
  const isZoneChanged = previousZoneId !== targetZoneId;

  let updatedLocation;
  if (currentLoc) {
    updatedLocation = await prisma.rtlsAssetLocation.update({
      where: { assetId: asset.id },
      data: {
        zoneId: targetZoneId,
        readerId: reader.id,
        antennaId: antenna.id,
        confidence: rssi > -65 ? 95 : rssi > -80 ? 80 : 60,
        lastSeen: new Date(),
        source: 'RFID_RTLS'
      }
    });
  } else {
    updatedLocation = await prisma.rtlsAssetLocation.create({
      data: {
        assetId: asset.id,
        zoneId: targetZoneId,
        readerId: reader.id,
        antennaId: antenna.id,
        confidence: rssi > -65 ? 95 : rssi > -80 ? 80 : 60,
        firstSeen: new Date(),
        lastSeen: new Date(),
        source: 'RFID_RTLS'
      }
    });
  }

  // Record movement log if zone changed
  let movement = null;
  if (isZoneChanged) {
    movement = await prisma.rtlsMovement.create({
      data: {
        assetId: asset.id,
        fromZoneId: previousZoneId,
        toZoneId: targetZoneId,
        readerId: reader.id,
        antennaId: antenna.id,
        detectedAt: new Date(),
        direction: 'TRANSIT',
        confidence: updatedLocation.confidence,
        eventId: rfidEvent.id
      }
    });
    realtimeEngine.notifyMovement(movement);
  }

  // 6. Geofencing Alert Checks
  if (targetZoneId) {
    const zoneObj = await prisma.zone.findUnique({ where: { id: targetZoneId } });
    if (zoneObj && (zoneObj.name.toLowerCase().includes('restricted') || zoneObj.name.toLowerCase().includes('secure'))) {
      const alert = await prisma.rtlsAlert.create({
        data: {
          alertType: 'RESTRICTED_ZONE_ENTRY',
          severity: 'HIGH',
          message: `Security Alert: Asset ${asset.assetId} (${asset.description}) entered restricted zone "${zoneObj.name}"`,
          assetId: asset.id,
          readerId: reader.id,
          zoneId: targetZoneId,
          status: 'OPEN'
        }
      });
      realtimeEngine.notifyAlert(alert);
    }
  }

  // Notify real-time clients
  const locationPayload = {
    assetId: asset.id,
    assetCode: asset.assetId,
    description: asset.description,
    tagNumber: asset.tagNumber || asset.rfidEpc,
    zoneId: targetZoneId,
    readerId: reader.id,
    readerName: reader.name,
    antennaId: antenna.id,
    lastSeen: updatedLocation.lastSeen,
    confidence: updatedLocation.confidence
  };

  realtimeEngine.notifyLocationUpdate(locationPayload);

  return {
    success: true,
    processed: true,
    assetId: asset.id,
    assetCode: asset.assetId,
    zoneChanged: isZoneChanged,
    location: updatedLocation,
    movement
  };
}

/**
 * Reader Heartbeat Logging & Offline Monitoring
 */
export async function processHeartbeat({ readerIdentifier, status = 'ONLINE', latencyMs = 15, errorInfo = null }) {
  let reader = await prisma.rtlsReader.findFirst({
    where: { OR: [{ readerIdentifier }, { id: readerIdentifier }] }
  });

  if (!reader) {
    const defaultSite = await prisma.site.findFirst({ where: { active: true } });
    reader = await prisma.rtlsReader.create({
      data: {
        readerIdentifier: readerIdentifier || 'R-AUTO-' + Date.now().toString(36),
        name: `Reader ${readerIdentifier}`,
        siteId: defaultSite?.id || 'DEFAULT',
        status,
        lastHeartbeat: new Date()
      }
    });
  } else {
    await prisma.rtlsReader.update({
      where: { id: reader.id },
      data: {
        status,
        lastHeartbeat: new Date()
      }
    });
  }

  const heartbeat = await prisma.rtlsReaderHeartbeat.create({
    data: {
      readerId: reader.id,
      status,
      latencyMs: parseInt(latencyMs, 10) || 15,
      errorInfo,
      timestamp: new Date()
    }
  });

  if (status === 'OFFLINE' || status === 'DEGRADED') {
    const alert = await prisma.rtlsAlert.create({
      data: {
        alertType: 'READER_OFFLINE',
        severity: status === 'OFFLINE' ? 'HIGH' : 'MEDIUM',
        message: `Reader Warning: Reader "${reader.name}" status changed to ${status}`,
        readerId: reader.id,
        status: 'OPEN'
      }
    });
    realtimeEngine.notifyAlert(alert);
  }

  realtimeEngine.notifyHeartbeat(heartbeat);

  return heartbeat;
}

/**
 * Returns Summary Dashboard Metrics for RTLS
 */
export async function getDashboardSummary() {
  const [readers, locations, unknownEvents, alerts, recentMovements] = await Promise.all([
    prisma.rtlsReader.findMany({ select: { id: true, status: true, lastHeartbeat: true } }),
    prisma.rtlsAssetLocation.count(),
    prisma.rfidEvent.count({ where: { processingStatus: 'UNKNOWN_EPC' } }),
    prisma.rtlsAlert.findMany({ where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.rtlsMovement.findMany({
      orderBy: { detectedAt: 'desc' },
      take: 10,
      include: {
        asset: { select: { id: true, assetId: true, description: true, tagNumber: true } },
        reader: { select: { id: true, name: true } }
      }
    })
  ]);

  const nowMs = Date.now();
  const TEN_MINS_MS = 10 * 60 * 1000;

  let onlineCount = 0;
  let offlineCount = 0;
  let degradedCount = 0;

  readers.forEach(r => {
    const isStale = (nowMs - new Date(r.lastHeartbeat).getTime()) > TEN_MINS_MS;
    if (r.status === 'OFFLINE' || isStale) offlineCount++;
    else if (r.status === 'DEGRADED') degradedCount++;
    else onlineCount++;
  });

  return {
    totalReaders: readers.length,
    onlineReaders: onlineCount,
    offlineReaders: offlineCount,
    degradedReaders: degradedCount,
    totalTrackedAssets: locations,
    unknownEpcCount: unknownEvents,
    openAlertsCount: alerts.length,
    openAlerts: alerts,
    recentMovements
  };
}
