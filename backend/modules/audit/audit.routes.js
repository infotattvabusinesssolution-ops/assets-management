import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from './audit.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getAuditLogs);
router.get('/logs', getAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
