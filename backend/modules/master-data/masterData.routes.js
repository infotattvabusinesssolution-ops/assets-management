import { Router } from 'express';
import {
  getMasterDataStats,
  getCompanies, createCompany,
  getSites, createSite,
  getBuildings, createBuilding,
  getFloors, createFloor,
  getRooms, createRoom,
  getCategories, createCategory,
  getManufacturers, createManufacturer,
  getModels, createModel,
  getDepartments, createDepartment,
  getCostCenters, createCostCenter,
  getEmployees, createEmployee,
  getCustomFields, createCustomField,
  updateMasterEntity,
  toggleMasterEntityStatus,
  deleteMasterEntity
} from './masterData.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stats', getMasterDataStats);

router.get('/companies', getCompanies);
router.post('/companies', createCompany);

router.get('/sites', getSites);
router.post('/sites', createSite);

router.get('/buildings', getBuildings);
router.post('/buildings', createBuilding);

router.get('/floors', getFloors);
router.post('/floors', createFloor);

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);

router.get('/categories', getCategories);
router.post('/categories', createCategory);

router.get('/manufacturers', getManufacturers);
router.post('/manufacturers', createManufacturer);

router.get('/models', getModels);
router.post('/models', createModel);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

router.get('/cost-centers', getCostCenters);
router.post('/cost-centers', createCostCenter);

router.get('/employees', getEmployees);
router.post('/employees', createEmployee);

router.get('/custom-fields', getCustomFields);
router.post('/custom-fields', createCustomField);

// Generic Entity management endpoints
router.put('/entities/:entityType/:id', updateMasterEntity);
router.patch('/entities/:entityType/:id/status', toggleMasterEntityStatus);
router.delete('/entities/:entityType/:id', deleteMasterEntity);

export default router;

