import express from 'express';
import * as rtlsController from './rtls.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// SSE Realtime Stream
router.get('/stream', rtlsController.subscribeStream);

// Public / Gateway Hardware Ingestion Routes (Token / Auth Optional for Edge Readers)
router.post('/events/ingest', rtlsController.ingestEvent);
router.post('/heartbeat', rtlsController.ingestHeartbeat);
router.post('/simulator/trigger', rtlsController.simulateScan);

// Authenticated RTLS Management & Dashboard Routes
router.use(authenticateToken);

router.get('/dashboard', rtlsController.getDashboard);

router.get('/readers', rtlsController.getReaders);
router.post('/readers', rtlsController.createReader);
router.put('/readers/:id', rtlsController.updateReader);
router.delete('/readers/:id', rtlsController.deleteReader);

router.get('/readers/:readerId/antennas', rtlsController.getAntennas);
router.post('/readers/:readerId/antennas', rtlsController.addAntenna);

router.get('/assets/:assetId/location', rtlsController.getAssetLocation);
router.get('/assets/:assetId/movements', rtlsController.getAssetMovements);

router.get('/alerts', rtlsController.getAlerts);
router.post('/alerts/:id/resolve', rtlsController.resolveAlert);

export default router;
