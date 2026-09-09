import { Router } from 'express';
import { getAuditLogs } from './audit.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticateToken);

router.get('/', requirePermission('AUDIT_VIEW'), getAuditLogs);

export default router;
