import { Router } from 'express';
import { login, getProfile, getUsers, getRoles } from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, requirePermission('USERS_VIEW'), getUsers);
router.get('/roles', authenticateToken, requirePermission('ROLES_VIEW'), getRoles);

export default router;
