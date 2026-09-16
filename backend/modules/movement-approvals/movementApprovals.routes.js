import { Router } from 'express';
import {
  getMovementApprovals,
  getApprovalKpis,
  getApprovalRequestDetails,
  submitApprovalDecision,
  bulkSubmitDecisions,
  exportMovementApprovals
} from './movementApprovals.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// Middleware: Authenticate Token for all movement approvals endpoints
router.use(authenticateToken);

router.get('/kpis', getApprovalKpis);
router.get('/', getMovementApprovals);
router.get('/:id', getApprovalRequestDetails);
router.post('/:id/decision', submitApprovalDecision);
router.post('/bulk-decision', bulkSubmitDecisions);
router.post('/export', exportMovementApprovals);

export default router;
