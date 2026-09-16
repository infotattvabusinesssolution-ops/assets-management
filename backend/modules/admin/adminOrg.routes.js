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
  getCompaniesList,
  getBusinessUnitsList,
  getDepartmentsList,
  getLocationsList,
  getCostCentersList,
  createCompany,
  createDepartment,
  createLocation,
  createCostCenter
} from './adminOrg.controller.js';

import adminGovernanceRoutes from './adminGovernance.routes.js';

const router = Router();

// Mount Governance, Config, Integrations, Audit, Notifications, Backup
router.use(adminGovernanceRoutes);

// User Management Routes
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.patch('/users/:id/toggle-status', toggleAdminUserStatus);
router.post('/users/:id/reset-password', resetAdminUserPassword);
router.delete('/users/:id', deleteAdminUser);

// Roles & Permissions Routes
router.get('/roles', getAdminRoles);
router.post('/roles', createAdminRole);
router.put('/roles/:id', updateAdminRole);
router.post('/roles/:id/clone', cloneAdminRole);
router.delete('/roles/:id', deleteAdminRole);

// Organization Hierarchy Routes
router.get('/organization/companies', getCompaniesList);
router.post('/organization/companies', createCompany);

router.get('/organization/business-units', getBusinessUnitsList);

router.get('/organization/departments', getDepartmentsList);
router.post('/organization/departments', createDepartment);

router.get('/organization/locations', getLocationsList);
router.post('/organization/locations', createLocation);

router.get('/organization/cost-centers', getCostCentersList);
router.post('/organization/cost-centers', createCostCenter);

export default router;
