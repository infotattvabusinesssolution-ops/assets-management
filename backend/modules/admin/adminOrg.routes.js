import { Router } from 'express';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  resetAdminUserPassword,
  deleteAdminUser,
  getAdminRoles,
  createAdminRole,
  updateAdminRole,
  cloneAdminRole,
  deleteAdminRole,
  assignUsersToRole,
  getCompaniesList,
  getBusinessUnitsList,
  getDepartmentsList,
  getLocationsList,
  getCostCentersList,
  createCompany,
  updateCompany,
  deleteCompany,
  createBusinessUnit,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createLocation,
  updateLocation,
  deleteLocation,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  updateBusinessUnit,
  deleteBusinessUnit
} from './adminOrg.controller.js';

import adminGovernanceRoutes from './adminGovernance.routes.js';
import { authenticateToken } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

// Mount Governance, Config, Integrations, Audit, Notifications, Backup
router.use(adminGovernanceRoutes);

// User Management Routes (Strictly System Administrator only)
router.get('/users', authenticateToken, requireRole('SYS_ADMIN'), getAdminUsers);
router.post('/users', authenticateToken, requireRole('SYS_ADMIN'), createAdminUser);
router.put('/users/:id', authenticateToken, requireRole('SYS_ADMIN'), updateAdminUser);
router.patch('/users/:id/toggle-status', authenticateToken, requireRole('SYS_ADMIN'), toggleAdminUserStatus);
router.post('/users/:id/reset-password', authenticateToken, requireRole('SYS_ADMIN'), resetAdminUserPassword);
router.delete('/users/:id', authenticateToken, requireRole('SYS_ADMIN'), deleteAdminUser);

// Roles & Permissions Routes (Strictly System Administrator only)
router.get('/roles', authenticateToken, requireRole('SYS_ADMIN'), getAdminRoles);
router.post('/roles', authenticateToken, requireRole('SYS_ADMIN'), createAdminRole);
router.put('/roles/:id', authenticateToken, requireRole('SYS_ADMIN'), updateAdminRole);
router.post('/roles/:id/clone', authenticateToken, requireRole('SYS_ADMIN'), cloneAdminRole);
router.delete('/roles/:id', authenticateToken, requireRole('SYS_ADMIN'), deleteAdminRole);
router.post('/roles/:id/assign-users', authenticateToken, requireRole('SYS_ADMIN'), assignUsersToRole);

// Organization Hierarchy Routes
router.get('/organization/companies', getCompaniesList);
router.post('/organization/companies', createCompany);
router.put('/organization/companies/:id', updateCompany);
router.delete('/organization/companies/:id', deleteCompany);

router.get('/organization/business-units', getBusinessUnitsList);
router.post('/organization/business-units', createBusinessUnit);
router.put('/organization/business-units/:id', updateBusinessUnit);
router.delete('/organization/business-units/:id', deleteBusinessUnit);

router.get('/organization/departments', getDepartmentsList);
router.post('/organization/departments', createDepartment);
router.put('/organization/departments/:id', updateDepartment);
router.delete('/organization/departments/:id', deleteDepartment);

router.get('/organization/locations', getLocationsList);
router.post('/organization/locations', createLocation);
router.put('/organization/locations/:id', updateLocation);
router.delete('/organization/locations/:id', deleteLocation);

router.get('/organization/cost-centers', getCostCentersList);
router.post('/organization/cost-centers', createCostCenter);
router.put('/organization/cost-centers/:id', updateCostCenter);
router.delete('/organization/cost-centers/:id', deleteCostCenter);

export default router;
