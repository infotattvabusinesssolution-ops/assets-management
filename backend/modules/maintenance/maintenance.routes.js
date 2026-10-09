import { Router } from 'express';
import { 
  getMaintenanceSummary, 
  getMaintenanceAssets,
  getMaintenanceTechnicians,
  getWorkOrders, 
  getWorkOrderById,
  updateWorkOrder,
  createWorkOrder, 
  updateWorkOrderStatus,
  addTimeLog,
  addPartsUsed,
  closeWorkOrder,
  getAssetMaintenanceHistory,
  getSchedules, 
  createSchedule,
  updateSchedule
} from './maintenance.controller.js';
import {
  getServiceProviders,
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  toggleServiceProviderStatus,
  addProviderContract,
  updateProviderContract,
  deleteProviderContract,
  saveProviderContractCoverage,
  saveProviderChild,
  deleteProviderChild
} from './serviceProvider.controller.js';
import { getSpareParts, createSparePart } from './spareParts.controller.js';
import { listPlans, getPlan, createPlan, updatePlan, addPlanTask, deletePlanTask, addPlanComment, generatePlan } from './maintenancePlans.controller.js';
import { getPreventiveDashboard, generatePreventiveWorkOrders } from './preventive.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { enforceDataScope } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticateToken);
router.use(enforceDataScope);

router.get('/summary', getMaintenanceSummary);
router.get('/assets', getMaintenanceAssets);
router.get('/technicians', getMaintenanceTechnicians);

router.get('/preventive', getPreventiveDashboard);
router.post('/preventive/generate', generatePreventiveWorkOrders);
router.post('/preventive/:id/generate', generatePreventiveWorkOrders);

router.get('/plans', listPlans);
router.post('/plans', createPlan);
router.get('/plans/:id', getPlan);
router.put('/plans/:id', updatePlan);
router.post('/plans/:id/checklist', addPlanTask);
router.delete('/plans/:id/checklist/:taskId', deletePlanTask);
router.post('/plans/:id/comments', addPlanComment);
router.post('/plans/:id/generate', generatePlan);

router.get('/work-orders', getWorkOrders);
router.get('/work-orders/:id', getWorkOrderById);
router.post('/work-orders', createWorkOrder);
router.put('/work-orders/:id/status', updateWorkOrderStatus);
router.put('/work-orders/:id', updateWorkOrder);
router.post('/work-orders/:id/time-logs', addTimeLog);
router.post('/work-orders/:id/parts', addPartsUsed);
router.post('/work-orders/:id/close', closeWorkOrder);

router.get('/assets/:assetId/history', getAssetMaintenanceHistory);

router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);

// Service Provider Routes
router.get('/service-providers', getServiceProviders);
router.get('/service-providers/:id', getServiceProviderById);
router.post('/service-providers', createServiceProvider);
router.put('/service-providers/:id', updateServiceProvider);
router.patch('/service-providers/:id/status', toggleServiceProviderStatus);
router.post('/service-providers/:id/contracts', addProviderContract);
router.put('/service-providers/:id/contracts/:contractId', updateProviderContract);
router.delete('/service-providers/:id/contracts/:contractId', deleteProviderContract);
router.put('/service-providers/:id/contracts/:contractId/coverage', saveProviderContractCoverage);
router.post('/service-providers/:id/:section', saveProviderChild);
router.put('/service-providers/:id/:section/:itemId', saveProviderChild);
router.delete('/service-providers/:id/:section/:itemId', deleteProviderChild);

// Spare Parts Routes
router.get('/spare-parts', getSpareParts);
router.post('/spare-parts', createSparePart);

export default router;

