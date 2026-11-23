import express from 'express';
import { createCredential, getCredentials, deleteCredential } from './credential.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('SYS_ADMIN', 'IT_MANAGER'));

router.post('/', createCredential);
router.get('/', getCredentials);
router.delete('/:id', deleteCredential);

export default router;
