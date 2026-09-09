import { Router } from 'express';
import { 
  getMaintenanceSummary, 
  getWorkOrders, 
  createWorkOrder, 
  updateWorkOrder, 
  getSchedules, 
  createSchedule 
} from './maintenance.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/summary', getMaintenanceSummary);

router.get('/work-orders', getWorkOrders);
router.post('/work-orders', createWorkOrder);
router.put('/work-orders/:id', updateWorkOrder);

router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);

export default router;
