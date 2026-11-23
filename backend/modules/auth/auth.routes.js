import { Router } from 'express';
import {
  login,
  getProfile,
  getUsers,
  getRoles,
  createUser,
  updateUser,
  resetUserPassword,
  changePassword,
  deleteUser,
  forgotPassword,
  resetPasswordWithToken,
  activateLicense
} from './auth.controller.js';
import { getPasswordPolicy } from '../admin/passwordPolicy.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { enforceTenantScope } from '../../middleware/tenantScope.js';

const router = Router();

router.post('/login', login);
router.post('/activate-license', activateLicense);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-with-token', resetPasswordWithToken);
router.get('/password-policy', getPasswordPolicy);

// Authenticated + Tenant Scoped Routes
router.post('/change-password', authenticateToken, enforceTenantScope, changePassword);
router.get('/profile', authenticateToken, enforceTenantScope, getProfile);
router.get('/users', authenticateToken, enforceTenantScope, requirePermission('USERS_VIEW'), getUsers);
router.post('/users', authenticateToken, enforceTenantScope, requirePermission('USERS_CREATE'), createUser);
router.put('/users/:id', authenticateToken, enforceTenantScope, requirePermission('USERS_EDIT'), updateUser);
router.post('/users/:id/reset-password', authenticateToken, enforceTenantScope, requirePermission('USERS_EDIT'), resetUserPassword);
router.delete('/users/:id', authenticateToken, enforceTenantScope, requirePermission('USERS_DELETE'), deleteUser);
router.get('/roles', authenticateToken, enforceTenantScope, requirePermission('ROLES_VIEW'), getRoles);

export default router;
