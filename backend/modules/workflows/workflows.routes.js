import { Router } from 'express';
import {
  getDefinitions,
  createDefinition,
  toggleDefinitionStatus,
  getPendingApprovals,
  getWorkflowHistory,
  approveStep
} from './workflows.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/definitions', getDefinitions);
router.post('/definitions', createDefinition);
router.patch('/definitions/:id/toggle', toggleDefinitionStatus);
router.get('/pending', getPendingApprovals);
router.get('/history', getWorkflowHistory);
router.post('/approve/:instanceId', approveStep);

export default router;
