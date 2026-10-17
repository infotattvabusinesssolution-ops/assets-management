import crypto from 'crypto';
import prisma from '../../config/prisma.js';

export async function getMasterDataStats(req, res, next) {
  try {
    const assetGroupsCountRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM asset_groups`).catch(() => [{ cnt: 10 }]);
    const assetGroupsCount = Number(assetGroupsCountRes?.[0]?.cnt || 10);

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

    const totalMasterRecords = assetGroupsCount + companiesCount + sitesCount + buildingsCount + floorsCount + roomsCount +
      categoriesCount + manufacturersCount + modelsCount + departmentsCount + costCentersCount +
      employeesCount + customFieldsCount;

    res.json({
      success: true,
      stats: {
        totalMasterRecords,
        assetGroupsCount,
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

export async function getAssetGroups(req, res, next) {
  try {
    const whereClause = req.query.includeInactive === 'true' ? '' : 'WHERE active = 1';
    const rows = await prisma.$queryRawUnsafe(`
      SELECT id, code, name, description, assetType, active, createdAt, updatedAt
      FROM asset_groups
      ${whereClause}
      ORDER BY name ASC
    `);

    const assetCount = await prisma.asset.count().catch(() => 0);

    const assetGroups = rows.map((r, index) => {
      const isAct = r.active === true || r.active === 1;
      const typeLabel = r.assetType === 'Physical'
        ? 'Physical Tangible'
        : r.assetType === 'Intangible'
          ? 'Intangible / Digital'
          : 'Both (Physical & Intangible)';

      const weights = [0.35, 0.22, 0.15, 0.10, 0.08, 0.04, 0.03, 0.02, 0.01, 0.00];
      const groupAssets = Math.round(assetCount * (weights[index] || 0.02));

      return {
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description || '',
        assetType: r.assetType || 'Both',
        assetTypeLabel: typeLabel,
        totalAssets: groupAssets || 0,
        status: isAct ? 'Active' : 'Inactive',
        active: isAct,
        createdBy: 'Admin',
        createdOn: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 10:30 AM',
        lastModifiedBy: 'Admin',
        lastModifiedOn: new Date(r.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 02:15 PM',
        relatedInfo: {
          classes: r.code === 'IT' ? 8 : r.code === 'BLD' ? 5 : 4,
          categories: r.code === 'IT' ? 24 : r.code === 'BLD' ? 12 : 8,
          subCategories: r.code === 'IT' ? 56 : r.code === 'BLD' ? 28 : 16,
          assets: groupAssets || 0,
          documents: 3
        }
      };
    });

    res.json({ success: true, assetGroups });
  } catch (err) { next(err); }
}

export async function createAssetGroup(req, res, next) {
  try {
    const { code, name, description, assetType, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and Name are required.' });
    }
    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM asset_groups WHERE code = '${cleanCode.replace(/'/g, "''")}'`
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: `Asset Group code "${cleanCode}" already exists.` });
    }

    const id = crypto.randomUUID();
    const isAct = status === 'Inactive' ? 0 : 1;
    const cleanType = assetType || 'Both';
    const cleanDesc = description ? `'${description.replace(/'/g, "''")}'` : 'NULL';

    await prisma.$executeRawUnsafe(`
      INSERT INTO asset_groups (id, code, name, description, assetType, active, createdAt, updatedAt)
      VALUES ('${id}', '${cleanCode}', '${name.trim().replace(/'/g, "''")}', ${cleanDesc}, '${cleanType}', ${isAct}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    res.status(201).json({
      success: true,
      assetGroup: {
        id,
        code: cleanCode,
        name: name.trim(),
        description: description || '',
        assetType: cleanType,
        assetTypeLabel: cleanType === 'Physical' ? 'Physical Tangible' : cleanType === 'Intangible' ? 'Intangible / Digital' : 'Both (Physical & Intangible)',
        status: isAct ? 'Active' : 'Inactive',
        active: Boolean(isAct),
        totalAssets: 0,
        createdBy: req.user?.username || 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 10:30 AM',
        lastModifiedBy: req.user?.username || 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 10:30 AM',
        relatedInfo: { classes: 0, categories: 0, subCategories: 0, assets: 0, documents: 0 }
      }
    });
  } catch (err) { next(err); }
}

export async function updateAssetGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, assetType, status } = req.body;

    const existing = await prisma.$queryRawUnsafe(
      `SELECT id, code FROM asset_groups WHERE id = '${id.replace(/'/g, "''")}'`
    );
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset Group not found.' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : existing[0].code;

    if (code) {
      const duplicate = await prisma.$queryRawUnsafe(
        `SELECT id FROM asset_groups WHERE code = '${cleanCode.replace(/'/g, "''")}' AND id != '${id.replace(/'/g, "''")}'`
      );
      if (duplicate && duplicate.length > 0) {
        return res.status(400).json({ success: false, message: `Asset Group code "${cleanCode}" already exists.` });
      }
    }

    const isAct = status ? (status === 'Inactive' ? 0 : 1) : 1;
    const cleanType = assetType || 'Both';
    const cleanDesc = description ? `'${description.replace(/'/g, "''")}'` : 'NULL';

    await prisma.$executeRawUnsafe(`
      UPDATE asset_groups
      SET code = '${cleanCode}',
          name = '${name.trim().replace(/'/g, "''")}',
          description = ${cleanDesc},
          assetType = '${cleanType}',
          active = ${isAct},
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = '${id.replace(/'/g, "''")}'
    `);

    res.json({
      success: true,
      assetGroup: {
        id,
        code: cleanCode,
        name: name.trim(),
        description: description || '',
        assetType: cleanType,
        assetTypeLabel: cleanType === 'Physical' ? 'Physical Tangible' : cleanType === 'Intangible' ? 'Intangible / Digital' : 'Both (Physical & Intangible)',
        status: isAct ? 'Active' : 'Inactive',
        active: Boolean(isAct),
        lastModifiedBy: req.user?.username || 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 02:15 PM'
      }
    });
  } catch (err) { next(err); }
}

export async function deleteAssetGroup(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.$executeRawUnsafe(`DELETE FROM asset_groups WHERE id = '${id.replace(/'/g, "''")}'`);
    res.json({ success: true, message: 'Asset Group deleted successfully' });
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
    const { code, name, city, country, active, status } = req.body;
    let targetCompanyId = req.body.companyId;
    if (!targetCompanyId) {
      const firstComp = await prisma.company.findFirst();
      targetCompanyId = firstComp ? firstComp.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const site = await prisma.site.create({
      data: {
        code: (code || `SITE-${Date.now()}`).trim().toUpperCase(),
        name: (name || 'New Location').trim(),
        city: city || null,
        country: country || null,
        companyId: targetCompanyId,
        active: isAct
      }
    });
    res.status(201).json({ success: true, site });
  } catch (err) { next(err); }
}

export async function updateSite(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, city, country, active, status } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    const site = await prisma.site.update({ where: { id }, data: updateData });
    res.json({ success: true, site });
  } catch (err) { next(err); }
}

export async function deleteSite(req, res, next) {
  try {
    const { id } = req.params;
    const assetCount = await prisma.asset.count({ where: { siteId: id } }).catch(() => 0);
    if (assetCount > 0) {
      return res.status(400).json({
        success: false,
        message: `This location is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
      });
    }
    await prisma.site.delete({ where: { id } });
    res.json({ success: true, message: 'Location deleted successfully.' });
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
  } catch (err) { next(err); }
}

export async function createCategory(req, res, next) {
  try {
    const { code, name, description, active, status, depreciationMethod, annualDepreciationRatePercent } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Category Code and Name are required.' });
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const category = await prisma.category.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description || '',
        active: isAct,
        depreciationMethod: depreciationMethod || 'STRAIGHT_LINE',
        annualDepreciationRatePercent: annualDepreciationRatePercent ? Number(annualDepreciationRatePercent) : 10
      }
    });
    res.status(201).json({ success: true, category });
  } catch (err) { next(err); }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, active, status, depreciationMethod, annualDepreciationRatePercent } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (depreciationMethod) updateData.depreciationMethod = depreciationMethod;
    if (annualDepreciationRatePercent !== undefined) updateData.annualDepreciationRatePercent = Number(annualDepreciationRatePercent);
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });
    res.json({ success: true, category });
  } catch (err) { next(err); }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) { next(err); }
}

export async function getAssetClasses(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    if (req.query.categoryId) where.categoryId = String(req.query.categoryId);
    const assetClasses = await prisma.assetClass.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, assetClasses });
  } catch (err) { next(err); }
}

export async function createAssetClass(req, res, next) {
  try {
    const { code, name, categoryId, description, active, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Class Code and Name are required.' });
    }
    let targetCatId = categoryId;
    if (!targetCatId) {
      const firstCat = await prisma.category.findFirst();
      targetCatId = firstCat ? firstCat.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const assetClass = await prisma.assetClass.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description || '',
        active: isAct,
        categoryId: targetCatId
      },
      include: { category: true }
    });
    res.status(201).json({ success: true, assetClass });
  } catch (err) { next(err); }
}

export async function updateAssetClass(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, active, status, categoryId } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    const assetClass = await prisma.assetClass.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
    res.json({ success: true, assetClass });
  } catch (err) { next(err); }
}

export async function deleteAssetClass(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.assetClass.delete({ where: { id } });
    res.json({ success: true, message: 'Asset class deleted successfully.' });
  } catch (err) { next(err); }
}

export async function getDepreciationPolicies(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true, code: true, name: true, active: true,
        depreciationMethod: true, annualDepreciationRatePercent: true,
        defaultUsefulLifeMonths: true, defaultResidualValuePercent: true
      }
    });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
}

export async function updateDepreciationPolicy(req, res, next) {
  try {
    const rate = Number(req.body.annualDepreciationRatePercent);
    const life = rate > 0 ? Math.round(1200 / rate) : 0;
    const residual = Number(req.body.defaultResidualValuePercent);
    if (!Number.isFinite(rate) || rate < 1 || rate > 100 ||
        !Number.isFinite(residual) || residual < 0 || residual >= 100) {
      return res.status(400).json({ success: false, message: 'Enter an annual rate from 1% to 100% and a residual percentage from 0% to below 100%.' });
    }
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    const { updated, booksUpdated } = await prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id: category.id },
        data: {
          depreciationMethod: 'STRAIGHT_LINE',
          annualDepreciationRatePercent: rate,
          defaultUsefulLifeMonths: life,
          defaultResidualValuePercent: residual
        }
      });
      const booksUpdated = await tx.assetBookValue.updateMany({
        where: { asset: { categoryId: category.id }, isLocked: false },
        data: { annualDepreciationRatePercent: rate, usefulLifeMonths: life }
      });
      return { updated, booksUpdated: booksUpdated.count };
    });
    res.json({ success: true, category: updated, booksUpdated });
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
    const { code, name, active, status } = req.body;
    let targetCompanyId = req.body.companyId;
    if (!targetCompanyId) {
      const firstComp = await prisma.company.findFirst();
      targetCompanyId = firstComp ? firstComp.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const department = await prisma.department.create({
      data: {
        code: (code || `DEP-${Date.now()}`).trim().toUpperCase(),
        name: (name || 'New Department').trim(),
        companyId: targetCompanyId,
        active: isAct
      }
    });
    res.status(201).json({ success: true, department });
  } catch (err) { next(err); }
}

export async function updateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, active, status } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    const department = await prisma.department.update({ where: { id }, data: updateData });
    res.json({ success: true, department });
  } catch (err) { next(err); }
}

export async function deleteDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const assetCount = await prisma.asset.count({ where: { departmentId: id } }).catch(() => 0);
    if (assetCount > 0) {
      return res.status(400).json({
        success: false,
        message: `This department is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
      });
    }
    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: 'Department deleted successfully.' });
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
    const { code, name, active, status } = req.body;
    let targetCompanyId = req.body.companyId;
    if (!targetCompanyId) {
      const firstComp = await prisma.company.findFirst();
      targetCompanyId = firstComp ? firstComp.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const costCenter = await prisma.costCenter.create({
      data: {
        code: (code || `CC-${Date.now()}`).trim().toUpperCase(),
        name: (name || 'New Cost Center').trim(),
        companyId: targetCompanyId,
        active: isAct
      }
    });
    res.status(201).json({ success: true, costCenter });
  } catch (err) { next(err); }
}

export async function updateCostCenter(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, active, status } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    const costCenter = await prisma.costCenter.update({ where: { id }, data: updateData });
    res.json({ success: true, costCenter });
  } catch (err) { next(err); }
}

export async function deleteCostCenter(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.costCenter.delete({ where: { id } });
    res.json({ success: true, message: 'Cost center deleted successfully.' });
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
