import { Router } from 'express';
import {
  getMasterDataStats,
  getAssetGroups, createAssetGroup, updateAssetGroup, deleteAssetGroup,
  getCompanies, createCompany,
  getSites, createSite, updateSite, deleteSite,
  getBuildings, createBuilding,
  getFloors, createFloor,
  getRooms, createRoom,
  getCategories, createCategory, updateCategory, deleteCategory, bulkDeleteCategories,
  getAssetClasses, createAssetClass, updateAssetClass, deleteAssetClass,

  getAssetTypes, createAssetType, updateAssetType, deleteAssetType,
  getDepreciationPolicies, updateDepreciationPolicy,
  getManufacturers, createManufacturer,
  getModels, createModel,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCostCenters, createCostCenter, updateCostCenter, deleteCostCenter,
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

router.get('/asset-groups', getAssetGroups);
router.post('/asset-groups', createAssetGroup);
router.put('/asset-groups/:id', updateAssetGroup);
router.delete('/asset-groups/:id', deleteAssetGroup);

router.get('/companies', getCompanies);
router.post('/companies', createCompany);

router.get('/sites', getSites);
router.post('/sites', createSite);
router.put('/sites/:id', updateSite);
router.delete('/sites/:id', deleteSite);

router.get('/buildings', getBuildings);
router.post('/buildings', createBuilding);

router.get('/floors', getFloors);
router.post('/floors', createFloor);

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.post('/categories/bulk-delete', bulkDeleteCategories);

router.get('/asset-classes', getAssetClasses);
router.post('/asset-classes', createAssetClass);
router.put('/asset-classes/:id', updateAssetClass);
router.delete('/asset-classes/:id', deleteAssetClass);



router.get('/asset-types', getAssetTypes);

router.post('/asset-types', createAssetType);

router.put('/asset-types/:id', updateAssetType);

router.delete('/asset-types/:id', deleteAssetType);

router.get('/depreciation-policies', getDepreciationPolicies);
router.put('/depreciation-policies/:id', updateDepreciationPolicy);

router.get('/manufacturers', getManufacturers);
router.post('/manufacturers', createManufacturer);

router.get('/models', getModels);
router.post('/models', createModel);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/cost-centers', getCostCenters);
router.post('/cost-centers', createCostCenter);
router.put('/cost-centers/:id', updateCostCenter);
router.delete('/cost-centers/:id', deleteCostCenter);

router.get('/employees', getEmployees);
router.post('/employees', createEmployee);

router.get('/custom-fields', getCustomFields);
router.post('/custom-fields', createCustomField);

// Generic Entity management endpoints
router.put('/entities/:entityType/:id', updateMasterEntity);
router.patch('/entities/:entityType/:id/status', toggleMasterEntityStatus);
router.delete('/entities/:entityType/:id', deleteMasterEntity);

export default router;

