import { Router } from 'express';
import { login, getProfile, getUsers, getRoles, createUser, updateUser, resetUserPassword, deleteUser } from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, requirePermission('USERS_VIEW'), getUsers);
router.post('/users', authenticateToken, requirePermission('USERS_CREATE'), createUser);
router.put('/users/:id', authenticateToken, requirePermission('USERS_EDIT'), updateUser);
router.post('/users/:id/reset-password', authenticateToken, requirePermission('USERS_EDIT'), resetUserPassword);
router.delete('/users/:id', authenticateToken, requirePermission('USERS_DELETE'), deleteUser);
router.get('/roles', authenticateToken, requirePermission('ROLES_VIEW'), getRoles);

export default router;

