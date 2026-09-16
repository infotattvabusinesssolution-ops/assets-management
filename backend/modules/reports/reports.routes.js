import { Router } from 'express';
import {
  getDashboardKpis,
  getAssetRegisterReport,
  getMovementReport,
  getCustodyReport,
  getLocationDistributionReport,
  getDepreciationReport,
  getExceptionsReport,
  getDiscoveryReport,
  getMaintenanceReport,
  getWarrantyReport,
  getDisposalReport
} from './reports.controller.js';
import * as analyticsController from './reportingAnalytics.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { enforceDataScope } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticateToken);
router.use(enforceDataScope);

// Management Intelligence & Analytics Endpoints (Matching Screenshots)
router.get('/analytics/dashboard', analyticsController.getDashboardAnalytics);
router.get('/analytics/drill-down', analyticsController.getDrillDownRecords);
router.patch('/analytics/scheduled/:id/toggle', analyticsController.toggleScheduledReport);
router.post('/analytics/scheduled', analyticsController.createScheduledReport);
router.post('/analytics/ai-query', analyticsController.queryAiAnalytics);

router.get('/dashboard', getDashboardKpis);
router.get('/asset-register', getAssetRegisterReport);
router.get('/movement', getMovementReport);
router.get('/custody', getCustodyReport);
router.get('/location-distribution', getLocationDistributionReport);
router.get('/depreciation', getDepreciationReport);
router.get('/exceptions', getExceptionsReport);
router.get('/discovery', getDiscoveryReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/warranties', getWarrantyReport);
router.get('/disposals', getDisposalReport);

export default router;
