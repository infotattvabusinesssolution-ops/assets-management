import { Company } from '../../models/Company.js';
import { Site, Building, Floor, Room, Zone } from '../../models/Location.js';
import { Department } from '../../models/Department.js';
import { CostCenter } from '../../models/CostCenter.js';
import { Employee } from '../../models/Employee.js';
import { Category } from '../../models/Category.js';
import { AssetClass } from '../../models/AssetClass.js';
import { Manufacturer } from '../../models/Manufacturer.js';
import { AssetModel } from '../../models/Model.js';
import { CustomFieldDefinition } from '../../models/CustomFieldDefinition.js';
import { Tag } from '../../models/Tag.js';
import { Contract } from '../../models/Contract.js';
import { WorkflowDefinition } from '../../models/WorkflowDefinition.js';
import { FloorMap } from '../../models/FloorMap.js';
import { Asset } from '../../models/Asset.js';

// Helper map for model mapping
const MODEL_MAP = {
  company: Company,
  site: Site,
  building: Building,
  floor: Floor,
  room: Room,
  zone: Zone,
  category: Category,
  asset_class: AssetClass,
  manufacturer: Manufacturer,
  model: AssetModel,
  department: Department,
  cost_center: CostCenter,
  employee: Employee,
  custom_field: CustomFieldDefinition
};

export async function getMasterDataStats(req, res, next) {
  try {
    const [
      companiesCount,
      sitesCount,
      buildingsCount,
      floorsCount,
      roomsCount,
      categoriesCount,
      manufacturersCount,
      modelsCount,
      departmentsCount,
      costCentersCount,
      employeesCount,
      customFieldsCount,
      tagsCount,
      contractsCount,
      workflowsCount,
      mapsCount
    ] = await Promise.all([
      Company.countDocuments(),
      Site.countDocuments(),
      Building.countDocuments(),
      Floor.countDocuments(),
      Room.countDocuments(),
      Category.countDocuments(),
      Manufacturer.countDocuments(),
      AssetModel.countDocuments(),
      Department.countDocuments(),
      CostCenter.countDocuments(),
      Employee.countDocuments(),
      CustomFieldDefinition.countDocuments(),
      Tag.countDocuments(),
      Contract.countDocuments(),
      WorkflowDefinition.countDocuments(),
      FloorMap.countDocuments()
    ]);

    const activeCategoriesCount = await Category.countDocuments({ active: { $ne: false } });
    const activeSitesCount = await Site.countDocuments({ active: { $ne: false } });
    const activeEmployeesCount = await Employee.countDocuments({ active: { $ne: false } });
    const activeModelsCount = await AssetModel.countDocuments({ active: { $ne: false } });

    const totalMasterRecords = companiesCount + sitesCount + buildingsCount + floorsCount + roomsCount +
      categoriesCount + manufacturersCount + modelsCount + departmentsCount + costCentersCount +
      employeesCount + customFieldsCount;

    res.json({
      success: true,
      stats: {
        totalMasterRecords,
        companiesCount,
        sitesCount,
        buildingsCount,
        floorsCount,
        roomsCount,
        categoriesCount,
        activeCategoriesCount,
        manufacturersCount,
        modelsCount,
        activeModelsCount,
        departmentsCount,
        costCentersCount,
        employeesCount,
        activeEmployeesCount,
        customFieldsCount,
        tagsCount,
        contractsCount,
        workflowsCount,
        mapsCount,
        activeSitesCount,
        lastUpdated: new Date()
      }
    });
  } catch (err) { next(err); }
}

export async function getCompanies(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const companies = await Company.find(filter).sort({ name: 1 });
    res.json({ success: true, companies });
  } catch (err) { next(err); }
}

export async function createCompany(req, res, next) {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, company });
  } catch (err) { next(err); }
}

export async function getSites(req, res, next) {
  try {
    const query = req.query.companyId ? { companyId: req.query.companyId } : {};
    if (req.query.includeInactive !== 'true') {
      query.active = { $ne: false };
    }
    const sites = await Site.find(query).populate('companyId').sort({ name: 1 });
    res.json({ success: true, sites });
  } catch (err) { next(err); }
}

export async function createSite(req, res, next) {
  try {
    const site = await Site.create(req.body);
    res.status(201).json({ success: true, site });
  } catch (err) { next(err); }
}

export async function getBuildings(req, res, next) {
  try {
    const query = req.query.siteId ? { siteId: req.query.siteId } : {};
    if (req.query.includeInactive !== 'true') {
      query.active = { $ne: false };
    }
    const buildings = await Building.find(query).sort({ name: 1 });
    res.json({ success: true, buildings });
  } catch (err) { next(err); }
}

export async function createBuilding(req, res, next) {
  try {
    const building = await Building.create(req.body);
    res.status(201).json({ success: true, building });
  } catch (err) { next(err); }
}

export async function getFloors(req, res, next) {
  try {
    const query = req.query.buildingId ? { buildingId: req.query.buildingId } : {};
    if (req.query.includeInactive !== 'true') {
      query.active = { $ne: false };
    }
    const floors = await Floor.find(query).sort({ floorNumber: 1 });
    res.json({ success: true, floors });
  } catch (err) { next(err); }
}

export async function createFloor(req, res, next) {
  try {
    const floor = await Floor.create(req.body);
    res.status(201).json({ success: true, floor });
  } catch (err) { next(err); }
}

export async function getRooms(req, res, next) {
  try {
    const query = req.query.floorId ? { floorId: req.query.floorId } : {};
    if (req.query.includeInactive !== 'true') {
      query.active = { $ne: false };
    }
    const rooms = await Room.find(query).sort({ name: 1 });
    res.json({ success: true, rooms });
  } catch (err) { next(err); }
}

export async function createRoom(req, res, next) {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (err) { next(err); }
}

export async function getCategories(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
}

export async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) { next(err); }
}

export async function getManufacturers(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const manufacturers = await Manufacturer.find(filter).sort({ name: 1 });
    res.json({ success: true, manufacturers });
  } catch (err) { next(err); }
}

export async function createManufacturer(req, res, next) {
  try {
    const manufacturer = await Manufacturer.create(req.body);
    res.status(201).json({ success: true, manufacturer });
  } catch (err) { next(err); }
}

export async function getModels(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const models = await AssetModel.find(filter).populate('manufacturerId').populate('categoryId').sort({ name: 1 });
    res.json({ success: true, models });
  } catch (err) { next(err); }
}

export async function createModel(req, res, next) {
  try {
    const model = await AssetModel.create(req.body);
    res.status(201).json({ success: true, model });
  } catch (err) { next(err); }
}

export async function getDepartments(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const departments = await Department.find(filter).sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) { next(err); }
}

export async function createDepartment(req, res, next) {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (err) { next(err); }
}

export async function getCostCenters(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const costCenters = await CostCenter.find(filter).sort({ name: 1 });
    res.json({ success: true, costCenters });
  } catch (err) { next(err); }
}

export async function createCostCenter(req, res, next) {
  try {
    const costCenter = await CostCenter.create(req.body);
    res.status(201).json({ success: true, costCenter });
  } catch (err) { next(err); }
}

export async function getEmployees(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const employees = await Employee.find(filter).populate('departmentId').populate('companyId').sort({ fullName: 1 });
    res.json({ success: true, employees });
  } catch (err) { next(err); }
}

export async function createEmployee(req, res, next) {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, employee });
  } catch (err) { next(err); }
}

export async function getCustomFields(req, res, next) {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { active: { $ne: false } };
    const fields = await CustomFieldDefinition.find(filter).sort({ label: 1 });
    res.json({ success: true, fields });
  } catch (err) { next(err); }
}

export async function createCustomField(req, res, next) {
  try {
    const field = await CustomFieldDefinition.create(req.body);
    res.status(201).json({ success: true, field });
  } catch (err) { next(err); }
}

export async function updateMasterEntity(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const Model = MODEL_MAP[entityType];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, entity: updated });
  } catch (err) { next(err); }
}

export async function toggleMasterEntityStatus(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const Model = MODEL_MAP[entityType];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    const existing = await Model.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const newStatus = !existing.active;
    existing.active = newStatus;
    await existing.save();

    res.json({ success: true, entity: existing, message: `Status updated to ${newStatus ? 'ACTIVE' : 'INACTIVE'}` });
  } catch (err) { next(err); }
}

export async function deleteMasterEntity(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const Model = MODEL_MAP[entityType];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    // Dependency check against Asset model
    if (entityType === 'category') {
      const assetCount = await Asset.countDocuments({ categoryId: id });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This category is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'site') {
      const assetCount = await Asset.countDocuments({ siteId: id });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This site is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'building') {
      const assetCount = await Asset.countDocuments({ buildingId: id });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This building is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'department') {
      const assetCount = await Asset.countDocuments({ departmentId: id });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This department is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'employee') {
      const assetCount = await Asset.countDocuments({ custodianId: id });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This employee is currently assigned as custodian to ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'manufacturer') {
      const modelCount = await AssetModel.countDocuments({ manufacturerId: id });
      if (modelCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This manufacturer is referenced by ${modelCount} asset model(s) and cannot be deleted.`
        });
      }
    }

    await Model.findByIdAndDelete(id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) { next(err); }
}

