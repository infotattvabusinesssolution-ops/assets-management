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

// Enforce authentication on all admin organization routes
router.use(authenticateToken);

// Mount Governance, Config, Integrations, Audit, Notifications, Backup
router.use(adminGovernanceRoutes);

// User Management Routes (Strictly System Administrator only)
router.get('/users', requireRole('SYS_ADMIN'), getAdminUsers);
router.post('/users', requireRole('SYS_ADMIN'), createAdminUser);
router.put('/users/:id', requireRole('SYS_ADMIN'), updateAdminUser);
router.patch('/users/:id/toggle-status', requireRole('SYS_ADMIN'), toggleAdminUserStatus);
router.post('/users/:id/reset-password', requireRole('SYS_ADMIN'), resetAdminUserPassword);
router.delete('/users/:id', requireRole('SYS_ADMIN'), deleteAdminUser);

// Roles & Permissions Routes (Strictly System Administrator only)
router.get('/roles', requireRole('SYS_ADMIN'), getAdminRoles);
router.post('/roles', requireRole('SYS_ADMIN'), createAdminRole);
router.put('/roles/:id', requireRole('SYS_ADMIN'), updateAdminRole);
router.post('/roles/:id/clone', requireRole('SYS_ADMIN'), cloneAdminRole);
router.delete('/roles/:id', requireRole('SYS_ADMIN'), deleteAdminRole);
router.post('/roles/:id/assign-users', requireRole('SYS_ADMIN'), assignUsersToRole);

// Organization Hierarchy Routes (Read allowed for authenticated users; Mutate requires SYS_ADMIN)
router.get('/organization/companies', getCompaniesList);
router.post('/organization/companies', requireRole('SYS_ADMIN'), createCompany);
router.put('/organization/companies/:id', requireRole('SYS_ADMIN'), updateCompany);
router.delete('/organization/companies/:id', requireRole('SYS_ADMIN'), deleteCompany);

router.get('/organization/business-units', getBusinessUnitsList);
router.post('/organization/business-units', requireRole('SYS_ADMIN'), createBusinessUnit);
router.put('/organization/business-units/:id', requireRole('SYS_ADMIN'), updateBusinessUnit);
router.delete('/organization/business-units/:id', requireRole('SYS_ADMIN'), deleteBusinessUnit);

router.get('/organization/departments', getDepartmentsList);
router.post('/organization/departments', requireRole('SYS_ADMIN'), createDepartment);
router.put('/organization/departments/:id', requireRole('SYS_ADMIN'), updateDepartment);
router.delete('/organization/departments/:id', requireRole('SYS_ADMIN'), deleteDepartment);

router.get('/organization/locations', getLocationsList);
router.post('/organization/locations', requireRole('SYS_ADMIN'), createLocation);
router.put('/organization/locations/:id', requireRole('SYS_ADMIN'), updateLocation);
router.delete('/organization/locations/:id', requireRole('SYS_ADMIN'), deleteLocation);

router.get('/organization/cost-centers', getCostCentersList);
router.post('/organization/cost-centers', requireRole('SYS_ADMIN'), createCostCenter);
router.put('/organization/cost-centers/:id', requireRole('SYS_ADMIN'), updateCostCenter);
router.delete('/organization/cost-centers/:id', requireRole('SYS_ADMIN'), deleteCostCenter);

export default router;
