import { Router } from 'express';
import { 
  getMaintenanceSummary, 
  getWorkOrders, 
  createWorkOrder, 
  updateWorkOrderStatus,
  addTimeLog,
  addPartsUsed,
  closeWorkOrder,
  getAssetMaintenanceHistory,
  getSchedules, 
  createSchedule 
} from './maintenance.controller.js';
import {
  getServiceProviders,
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  toggleServiceProviderStatus,
  addProviderContract
} from './serviceProvider.controller.js';
import { getSpareParts, createSparePart } from './spareParts.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/summary', getMaintenanceSummary);

router.get('/work-orders', getWorkOrders);
router.post('/work-orders', createWorkOrder);
router.put('/work-orders/:id/status', updateWorkOrderStatus);
router.put('/work-orders/:id', updateWorkOrderStatus);
router.post('/work-orders/:id/time-logs', addTimeLog);
router.post('/work-orders/:id/parts', addPartsUsed);
router.post('/work-orders/:id/close', closeWorkOrder);

router.get('/assets/:assetId/history', getAssetMaintenanceHistory);

router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);

// Service Provider Routes
router.get('/service-providers', getServiceProviders);
router.get('/service-providers/:id', getServiceProviderById);
router.post('/service-providers', createServiceProvider);
router.put('/service-providers/:id', updateServiceProvider);
router.patch('/service-providers/:id/status', toggleServiceProviderStatus);
router.post('/service-providers/:id/contracts', addProviderContract);

// Spare Parts Routes
router.get('/spare-parts', getSpareParts);
router.post('/spare-parts', createSparePart);

export default router;

