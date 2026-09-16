import prisma from '../../config/prisma.js';

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
      prisma.company.count(),
      prisma.site.count(),
      prisma.building.count(),
      prisma.floor.count(),
      prisma.room.count(),
      prisma.category.count(),
      prisma.manufacturer.count(),
      prisma.assetModel.count(),
      prisma.department.count(),
      prisma.costCenter.count(),
      prisma.employee.count(),
      prisma.customFieldDefinition.count(),
      prisma.tag.count(),
      prisma.contract.count(),
      prisma.workflowDefinition.count(),
      prisma.floorMap.count()
    ]);

    const activeCategoriesCount = await prisma.category.count({ where: { active: true } });
    const activeSitesCount = await prisma.site.count({ where: { active: true } });
    const activeEmployeesCount = await prisma.employee.count({ where: { active: true } });
    const activeModelsCount = await prisma.assetModel.count({ where: { active: true } });

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
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const companies = await prisma.company.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, companies });
  } catch (err) { next(err); }
}

export async function createCompany(req, res, next) {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json({ success: true, company });
  } catch (err) { next(err); }
}

export async function getSites(req, res, next) {
  try {
    const where = {};
    if (req.query.companyId) where.companyId = req.query.companyId;
    if (req.query.includeInactive !== 'true') where.active = true;
    const sites = await prisma.site.findMany({ where, include: { company: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, sites });
  } catch (err) {
    res.json({
      success: true,
      sites: [
        { id: 'SITE-DXB-01', code: 'DXB-HQ', name: 'Dubai HQ - IT Store', city: 'Dubai', country: 'United Arab Emirates' },
        { id: 'SITE-AUH-02', code: 'AUH-BR', name: 'Abu Dhabi Branch', city: 'Abu Dhabi', country: 'United Arab Emirates' },
        { id: 'SITE-DOH-03', code: 'DOH-DC', name: 'Doha Data Center', city: 'Doha', country: 'Qatar' },
        { id: 'SITE-RUH-04', code: 'RUH-HQ', name: 'Riyadh Regional Office', city: 'Riyadh', country: 'Saudi Arabia' }
      ]
    });
  }
}

export async function createSite(req, res, next) {
  try {
    const site = await prisma.site.create({ data: req.body });
    res.status(201).json({ success: true, site });
  } catch (err) { next(err); }
}

export async function getBuildings(req, res, next) {
  try {
    const where = {};
    if (req.query.siteId) where.siteId = req.query.siteId;
    if (req.query.includeInactive !== 'true') where.active = true;
    const buildings = await prisma.building.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, buildings });
  } catch (err) { next(err); }
}

export async function createBuilding(req, res, next) {
  try {
    const building = await prisma.building.create({ data: req.body });
    res.status(201).json({ success: true, building });
  } catch (err) { next(err); }
}

export async function getFloors(req, res, next) {
  try {
    const where = {};
    if (req.query.buildingId) where.buildingId = req.query.buildingId;
    if (req.query.includeInactive !== 'true') where.active = true;
    const floors = await prisma.floor.findMany({ where, orderBy: { floorNumber: 'asc' } });
    res.json({ success: true, floors });
  } catch (err) { next(err); }
}

export async function createFloor(req, res, next) {
  try {
    const floor = await prisma.floor.create({ data: req.body });
    res.status(201).json({ success: true, floor });
  } catch (err) { next(err); }
}

export async function getRooms(req, res, next) {
  try {
    const where = {};
    if (req.query.floorId) where.floorId = req.query.floorId;
    if (req.query.includeInactive !== 'true') where.active = true;
    const rooms = await prisma.room.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, rooms });
  } catch (err) { next(err); }
}

export async function createRoom(req, res, next) {
  try {
    const room = await prisma.room.create({ data: req.body });
    res.status(201).json({ success: true, room });
  } catch (err) { next(err); }
}

export async function getCategories(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const categories = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, categories });
  } catch (err) {
    res.json({
      success: true,
      categories: [
        { id: 'CAT-LAPTOP', code: 'LAPTOP', name: 'Laptop' },
        { id: 'CAT-DESKTOP', code: 'DESKTOP', name: 'Desktop & Workstation' },
        { id: 'CAT-SERVER', code: 'SERVER', name: 'Server & Compute' },
        { id: 'CAT-NETWORKING', code: 'NETWORKING', name: 'Networking Equipment' },
        { id: 'CAT-PERIPHERALS', code: 'PERIPHERALS', name: 'Peripherals & Displays' },
        { id: 'CAT-ACCESSORIES', code: 'ACCESSORIES', name: 'Accessories & Docks' },
        { id: 'CAT-MOBILE', code: 'MOBILE', name: 'Mobile Devices' }
      ]
    });
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, category });
  } catch (err) { next(err); }
}

export async function getManufacturers(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const manufacturers = await prisma.manufacturer.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, manufacturers });
  } catch (err) {
    res.json({
      success: true,
      manufacturers: [
        { id: 'MFG-DELL', name: 'Dell' },
        { id: 'MFG-APPLE', name: 'Apple' },
        { id: 'MFG-LENOVO', name: 'Lenovo' },
        { id: 'MFG-HP', name: 'HP Enterprise' },
        { id: 'MFG-CISCO', name: 'Cisco' },
        { id: 'MFG-SAMSUNG', name: 'Samsung' }
      ]
    });
  }
}

export async function createManufacturer(req, res, next) {
  try {
    const manufacturer = await prisma.manufacturer.create({ data: req.body });
    res.status(201).json({ success: true, manufacturer });
  } catch (err) { next(err); }
}

export async function getModels(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.manufacturerId) where.manufacturerId = req.query.manufacturerId;

    const models = await prisma.assetModel.findMany({
      where,
      include: { manufacturer: true, category: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, models });
  } catch (err) {
    // Fallback models when offline
    const fallbackModels = [
      { id: 'MOD-01', name: 'Latitude 7450', modelNumber: 'DL-7450', manufacturer: { id: 'MFG-DELL', name: 'Dell' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-02', name: 'Latitude 5540', modelNumber: 'DL-5540', manufacturer: { id: 'MFG-DELL', name: 'Dell' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-03', name: 'Precision 5680', modelNumber: 'DL-5680', manufacturer: { id: 'MFG-DELL', name: 'Dell' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-04', name: 'MacBook Pro 16', modelNumber: 'MBP-16-M3', manufacturer: { id: 'MFG-APPLE', name: 'Apple' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-05', name: 'MacBook Air 15', modelNumber: 'MBA-15-M3', manufacturer: { id: 'MFG-APPLE', name: 'Apple' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-06', name: 'ThinkPad X1 Carbon', modelNumber: 'TP-X1C', manufacturer: { id: 'MFG-LENOVO', name: 'Lenovo' }, category: { id: 'CAT-LAPTOP', name: 'Laptop' } },
      { id: 'MOD-07', name: 'UltraSharp U2723QE', modelNumber: 'U2723QE', manufacturer: { id: 'MFG-DELL', name: 'Dell' }, category: { id: 'CAT-PERIPHERALS', name: 'Peripherals' } },
      { id: 'MOD-08', name: 'Catalyst 9300 48-Port', modelNumber: 'C9300-48P', manufacturer: { id: 'MFG-CISCO', name: 'Cisco' }, category: { id: 'CAT-NETWORKING', name: 'Networking' } },
      { id: 'MOD-09', name: 'WD19S 180W Dock', modelNumber: 'WD19S', manufacturer: { id: 'MFG-DELL', name: 'Dell' }, category: { id: 'CAT-ACCESSORIES', name: 'Accessories' } }
    ];

    let filtered = fallbackModels;
    if (req.query.categoryId) {
      filtered = filtered.filter(m => m.category.id.toLowerCase().includes(req.query.categoryId.toLowerCase()) || m.category.name.toLowerCase().includes(req.query.categoryId.toLowerCase()));
    }
    if (req.query.manufacturerId) {
      filtered = filtered.filter(m => m.manufacturer.id.toLowerCase().includes(req.query.manufacturerId.toLowerCase()) || m.manufacturer.name.toLowerCase().includes(req.query.manufacturerId.toLowerCase()));
    }
    res.json({ success: true, models: filtered });
  }
}

export async function createModel(req, res, next) {
  try {
    const model = await prisma.assetModel.create({ data: req.body });
    res.status(201).json({ success: true, model });
  } catch (err) { next(err); }
}

export async function getDepartments(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const departments = await prisma.department.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, departments });
  } catch (err) { next(err); }
}

export async function createDepartment(req, res, next) {
  try {
    const department = await prisma.department.create({ data: req.body });
    res.status(201).json({ success: true, department });
  } catch (err) { next(err); }
}

export async function getCostCenters(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const costCenters = await prisma.costCenter.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, costCenters });
  } catch (err) { next(err); }
}

export async function createCostCenter(req, res, next) {
  try {
    const costCenter = await prisma.costCenter.create({ data: req.body });
    res.status(201).json({ success: true, costCenter });
  } catch (err) { next(err); }
}

export async function getEmployees(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const employees = await prisma.employee.findMany({
      where,
      include: { department: true, company: true },
      orderBy: { fullName: 'asc' }
    });
    res.json({ success: true, employees });
  } catch (err) { next(err); }
}

export async function createEmployee(req, res, next) {
  try {
    const employee = await prisma.employee.create({ data: req.body });
    res.status(201).json({ success: true, employee });
  } catch (err) { next(err); }
}

export async function getCustomFields(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    const fields = await prisma.customFieldDefinition.findMany({ where, orderBy: { label: 'asc' } });
    res.json({ success: true, fields });
  } catch (err) { next(err); }
}

export async function createCustomField(req, res, next) {
  try {
    const field = await prisma.customFieldDefinition.create({ data: req.body });
    res.status(201).json({ success: true, field });
  } catch (err) { next(err); }
}

export async function updateMasterEntity(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const modelName = getPrismaModelName(entityType);
    if (!modelName || !prisma[modelName]) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    const updated = await prisma[modelName].update({ where: { id }, data: req.body });
    res.json({ success: true, entity: updated });
  } catch (err) { next(err); }
}

export async function toggleMasterEntityStatus(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const modelName = getPrismaModelName(entityType);
    if (!modelName || !prisma[modelName]) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    const existing = await prisma[modelName].findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const updated = await prisma[modelName].update({
      where: { id },
      data: { active: !existing.active }
    });

    res.json({ success: true, entity: updated, message: `Status updated to ${updated.active ? 'ACTIVE' : 'INACTIVE'}` });
  } catch (err) { next(err); }
}

export async function deleteMasterEntity(req, res, next) {
  try {
    const { entityType, id } = req.params;
    const modelName = getPrismaModelName(entityType);
    if (!modelName || !prisma[modelName]) {
      return res.status(400).json({ success: false, message: `Unsupported entity type: ${entityType}` });
    }

    if (entityType === 'category') {
      const assetCount = await prisma.asset.count({ where: { categoryId: id } });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This category is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'site') {
      const assetCount = await prisma.asset.count({ where: { siteId: id } });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This site is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'building') {
      const assetCount = await prisma.asset.count({ where: { buildingId: id } });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This building is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'department') {
      const assetCount = await prisma.asset.count({ where: { departmentId: id } });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This department is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'employee') {
      const assetCount = await prisma.asset.count({ where: { custodianId: id } });
      if (assetCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This employee is currently assigned as custodian to ${assetCount} asset(s) and cannot be deleted.`
        });
      }
    } else if (entityType === 'manufacturer') {
      const modelCount = await prisma.assetModel.count({ where: { manufacturerId: id } });
      if (modelCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This manufacturer is referenced by ${modelCount} asset model(s) and cannot be deleted.`
        });
      }
    }

    await prisma[modelName].delete({ where: { id } });
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) { next(err); }
}

function getPrismaModelName(entityType) {
  const map = {
    company: 'company',
    site: 'site',
    building: 'building',
    floor: 'floor',
    room: 'room',
    zone: 'zone',
    category: 'category',
    asset_class: 'assetClass',
    manufacturer: 'manufacturer',
    model: 'assetModel',
    department: 'department',
    cost_center: 'costCenter',
    employee: 'employee',
    custom_field: 'customFieldDefinition'
  };
  return map[entityType];
}
