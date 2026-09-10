import prisma from '../../config/prisma.js';
import * as rtlsService from './rtls.service.js';
import { defaultMockAdapter } from './hardwareAdapter.js';
import { realtimeEngine } from './realtimeEngine.js';

export async function getReaders(req, res, next) {
  try {
    const readers = await prisma.rtlsReader.findMany({
      include: {
        antennas: true,
        _count: { select: { events: true, locations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, readers });
  } catch (err) { next(err); }
}

export async function createReader(req, res, next) {
  try {
    const { readerIdentifier, name, manufacturer, modelName, ipAddress, macAddress, siteId, buildingId, floorId, zoneId } = req.body;
    
    const existing = await prisma.rtlsReader.findUnique({ where: { readerIdentifier } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Reader with identifier ${readerIdentifier} already exists` });
    }

    const reader = await prisma.rtlsReader.create({
      data: {
        readerIdentifier,
        name: name || `Reader ${readerIdentifier}`,
        manufacturer: manufacturer || 'Impinj',
        modelName: modelName || 'Speedway R420',
        ipAddress,
        macAddress,
        siteId,
        buildingId,
        floorId,
        zoneId,
        status: 'ONLINE',
        lastHeartbeat: new Date()
      }
    });

    res.json({ success: true, reader });
  } catch (err) { next(err); }
}

export async function updateReader(req, res, next) {
  try {
    const { id } = req.params;
    const reader = await prisma.rtlsReader.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, reader });
  } catch (err) { next(err); }
}

export async function deleteReader(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.rtlsReader.delete({ where: { id } });
    res.json({ success: true, message: 'Reader deleted successfully' });
  } catch (err) { next(err); }
}

export async function getAntennas(req, res, next) {
  try {
    const { readerId } = req.params;
    const antennas = await prisma.rtlsAntenna.findMany({
      where: { readerId },
      orderBy: { antennaNumber: 'asc' }
    });
    res.json({ success: true, antennas });
  } catch (err) { next(err); }
}

export async function addAntenna(req, res, next) {
  try {
    const { readerId } = req.params;
    const { antennaNumber, name, zoneId, direction } = req.body;

    const antenna = await prisma.rtlsAntenna.create({
      data: {
        readerId,
        antennaNumber: parseInt(antennaNumber, 10),
        name: name || `Antenna ${antennaNumber}`,
        zoneId,
        direction
      }
    });

    res.json({ success: true, antenna });
  } catch (err) { next(err); }
}

export async function ingestEvent(req, res, next) {
  try {
    const { epc, readerIdentifier, readerId, antennaId, antennaNumber, rssi, rawPayload } = req.body;

    if (!epc) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: epc' });
    }

    const result = await rtlsService.processRfidEvent({
      epc,
      readerIdentifier: readerIdentifier || readerId || 'R-DEFAULT',
      antennaNumber: antennaNumber || antennaId || 1,
      rssi: rssi ? parseInt(rssi, 10) : -55,
      rawPayload
    });

    res.json({ success: true, result });
  } catch (err) { next(err); }
}

export async function ingestHeartbeat(req, res, next) {
  try {
    const { readerIdentifier, status, latencyMs, errorInfo } = req.body;
    const result = await rtlsService.processHeartbeat({ readerIdentifier, status, latencyMs, errorInfo });
    res.json({ success: true, result });
  } catch (err) { next(err); }
}

export async function getAssetLocation(req, res, next) {
  try {
    const { assetId } = req.params;

    const location = await prisma.rtlsAssetLocation.findUnique({
      where: { assetId },
      include: {
        asset: true,
        reader: true,
        antenna: true
      }
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'No live RTLS location recorded for this asset' });
    }

    res.json({ success: true, location });
  } catch (err) { next(err); }
}

export async function getAssetMovements(req, res, next) {
  try {
    const { assetId } = req.params;

    const movements = await prisma.rtlsMovement.findMany({
      where: { assetId },
      orderBy: { detectedAt: 'desc' },
      take: 50,
      include: {
        reader: { select: { id: true, name: true, readerIdentifier: true } },
        antenna: { select: { id: true, name: true, antennaNumber: true } }
      }
    });

    res.json({ success: true, movements });
  } catch (err) { next(err); }
}

export async function getDashboard(req, res, next) {
  try {
    const summary = await rtlsService.getDashboardSummary();
    res.json({ success: true, summary });
  } catch (err) { next(err); }
}

export async function getAlerts(req, res, next) {
  try {
    const alerts = await prisma.rtlsAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        reader: { select: { id: true, name: true } }
      }
    });
    res.json({ success: true, alerts });
  } catch (err) { next(err); }
}

export async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'SYS';

    const alert = await prisma.rtlsAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedByUserId: userId
      }
    });

    res.json({ success: true, alert });
  } catch (err) { next(err); }
}

export async function simulateScan(req, res, next) {
  try {
    const { epc, readerIdentifier, antennaNumber, rssi } = req.body;

    const simulatedPayload = await defaultMockAdapter.simulateTagRead({
      epc: epc || 'E280116060009001',
      readerId: readerIdentifier || 'R-1001-SIM',
      antennaId: antennaNumber || 1,
      rssi: rssi || -58
    });

    const result = await rtlsService.processRfidEvent(simulatedPayload);

    res.json({
      success: true,
      message: 'Simulated hardware RFID scan processed successfully',
      simulatedPayload,
      result
    });
  } catch (err) { next(err); }
}

export function subscribeStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'RTLS SSE Stream Connected' })}\n\n`);
  realtimeEngine.addClient(res);

  req.on('close', () => {
    realtimeEngine.removeClient(res);
  });
}
