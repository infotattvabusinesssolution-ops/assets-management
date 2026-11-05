import { Router } from 'express';
import {
  getMasterDataStats,
  getAssetGroups, createAssetGroup, updateAssetGroup, deleteAssetGroup,
  getCompanies, createCompany, updateCompany, deleteCompany,
  getSites, createSite, updateSite, deleteSite,
  getBuildings, createBuilding,
  getFloors, createFloor,
  getRooms, createRoom,
  getCategories, createCategory, updateCategory, deleteCategory, bulkDeleteCategories,
  getAssetClasses, createAssetClass, updateAssetClass, deleteAssetClass,
  getAssetSubGroups, createAssetSubGroup, updateAssetSubGroup, deleteAssetSubGroup,
  getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory,
  getAssetTypes, createAssetType, updateAssetType, deleteAssetType,
  getDepreciationPolicies, updateDepreciationPolicy,
  getManufacturers, createManufacturer, updateManufacturer, deleteManufacturer,
  getBrands, createBrand, updateBrand, deleteBrand,
  getModels, createModel,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCostCenters, createCostCenter, updateCostCenter, deleteCostCenter,
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getCustomFields, createCustomField,
  updateMasterEntity,
  toggleMasterEntityStatus,
  deleteMasterEntity,
  getItemMasters, getItemMasterById, createItemMaster, updateItemMaster, deleteItemMaster,
  getUoms, createUom, updateUom, deleteUom,
  getDisposalStatuses, createDisposalStatus, updateDisposalStatus, deleteDisposalStatus,
  getCountries, createCountry
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
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

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

// Asset Sub Groups (Dedicated Level 2)
router.get('/asset-sub-groups', getAssetSubGroups);
router.post('/asset-sub-groups', createAssetSubGroup);
router.put('/asset-sub-groups/:id', updateAssetSubGroup);
router.delete('/asset-sub-groups/:id', deleteAssetSubGroup);

// Sub Categories (Dedicated Level 4)
router.get('/sub-categories', getSubCategories);
router.post('/sub-categories', createSubCategory);
router.put('/sub-categories/:id', updateSubCategory);
router.delete('/sub-categories/:id', deleteSubCategory);

router.get('/subcategories', getSubCategories);
router.post('/subcategories', createSubCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// Backward compatibility routes for /asset-classes
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
router.put('/manufacturers/:id', updateManufacturer);
router.delete('/manufacturers/:id', deleteManufacturer);

// Brands (Master Data)
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

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
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

router.get('/custodians', getEmployees);
router.post('/custodians', createEmployee);
router.put('/custodians/:id', updateEmployee);
router.delete('/custodians/:id', deleteEmployee);

router.get('/custom-fields', getCustomFields);
router.post('/custom-fields', createCustomField);

// Generic Entity management endpoints
router.put('/entities/:entityType/:id', updateMasterEntity);
router.patch('/entities/:entityType/:id/status', toggleMasterEntityStatus);
router.delete('/entities/:entityType/:id', deleteMasterEntity);

// Item Masters
router.get('/items', getItemMasters);
router.get('/items/:id', getItemMasterById);
router.post('/items', createItemMaster);
router.put('/items/:id', updateItemMaster);
router.delete('/items/:id', deleteItemMaster);

// Units of Measure (UOM)
router.get('/uoms', getUoms);
router.post('/uoms', createUom);
router.put('/uoms/:id', updateUom);
router.delete('/uoms/:id', deleteUom);

// Disposal Statuses (Master Data)
router.get('/disposal-statuses', getDisposalStatuses);
router.post('/disposal-statuses', createDisposalStatus);
router.put('/disposal-statuses/:id', updateDisposalStatus);
router.delete('/disposal-statuses/:id', deleteDisposalStatus);

// Countries (Dynamic Master Data Lookup / Enum)
router.get('/countries', getCountries);
router.post('/countries', createCountry);

export default router;
