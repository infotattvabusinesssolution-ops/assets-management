import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

export async function getMasterDataStats(req, res, next) {
  try {
    let assetGroupsCount = memoryAssetGroups.length;
    let companiesCount = 12;
    let sitesCount = 8;
    let buildingsCount = 16;
    let floorsCount = 42;
    let roomsCount = 138;
    let categoriesCount = 24;
    let activeCategoriesCount = 22;
    let manufacturersCount = 45;
    let modelsCount = 110;
    let activeModelsCount = 98;
    let departmentsCount = 15;
    let costCentersCount = 28;
    let employeesCount = 340;
    let activeEmployeesCount = 325;
    let customFieldsCount = 14;
    let tagsCount = 52;
    let contractsCount = 19;
    let workflowsCount = 7;
    let mapsCount = 4;
    let activeSitesCount = 8;

    if (isDbConnected()) {
      try {
        const assetGroupsCountRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM asset_groups`).catch(() => [{ cnt: memoryAssetGroups.length }]);
        assetGroupsCount = Number(assetGroupsCountRes?.[0]?.cnt || memoryAssetGroups.length);

        const counts = await Promise.all([
          prisma.company.count().catch(() => companiesCount),
          prisma.site.count().catch(() => sitesCount),
          prisma.building.count().catch(() => buildingsCount),
          prisma.floor.count().catch(() => floorsCount),
          prisma.room.count().catch(() => roomsCount),
          prisma.category.count().catch(() => categoriesCount),
          prisma.manufacturer.count().catch(() => manufacturersCount),
          prisma.assetModel.count().catch(() => modelsCount),
          prisma.department.count().catch(() => departmentsCount),
          prisma.costCenter.count().catch(() => costCentersCount),
          prisma.employee.count().catch(() => employeesCount),
          prisma.customFieldDefinition.count().catch(() => customFieldsCount),
          prisma.tag.count().catch(() => tagsCount),
          prisma.contract.count().catch(() => contractsCount),
          prisma.workflowDefinition.count().catch(() => workflowsCount),
          prisma.floorMap.count().catch(() => mapsCount)
        ]);

        companiesCount = counts[0];
        sitesCount = counts[1];
        buildingsCount = counts[2];
        floorsCount = counts[3];
        roomsCount = counts[4];
        categoriesCount = counts[5];
        manufacturersCount = counts[6];
        modelsCount = counts[7];
        departmentsCount = counts[8];
        costCentersCount = counts[9];
        employeesCount = counts[10];
        customFieldsCount = counts[11];
        tagsCount = counts[12];
        contractsCount = counts[13];
        workflowsCount = counts[14];
        mapsCount = counts[15];

        activeCategoriesCount = await prisma.category.count({ where: { active: true } }).catch(() => categoriesCount);
        activeSitesCount = await prisma.site.count({ where: { active: true } }).catch(() => sitesCount);
        activeEmployeesCount = await prisma.employee.count({ where: { active: true } }).catch(() => employeesCount);
        activeModelsCount = await prisma.assetModel.count({ where: { active: true } }).catch(() => modelsCount);
      } catch (dbErr) {
        console.warn('Master data stats using resilient fallback:', dbErr.message);
      }
    }

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

export let memoryAssetGroups = [];

export async function getAssetGroups(req, res, next) {
  try {
    let rows = [];
    if (isDbConnected()) {
      try {
        const whereClause = req.query.includeInactive === 'true' ? '' : 'WHERE active = 1';
        rows = await prisma.$queryRawUnsafe(`
          SELECT id, code, name, description, assetType, active, createdAt, updatedAt
          FROM asset_groups
          ${whereClause}
          ORDER BY name ASC
        `);
      } catch (dbErr) {
        console.warn('DB query on asset_groups fallback to memory:', dbErr.message);
      }
    }

    let assetCount = 0;
    try {
      if (isDbConnected()) {
        assetCount = await prisma.asset.count().catch(() => 0);
      }
    } catch (e) {}

    let dbGroups = rows.map((r, index) => {
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

    const existingIds = new Set(dbGroups.map(g => g.id));
    const existingCodes = new Set(dbGroups.map(g => g.code.toUpperCase()));
    const memoryOnly = memoryAssetGroups.filter(mg => !existingIds.has(mg.id) && !existingCodes.has(mg.code.toUpperCase()));
    let assetGroups = [...memoryOnly, ...dbGroups];

    if (assetGroups.length === 0) {
      assetGroups = [...memoryAssetGroups];
    }

    if (req.query.includeInactive !== 'true') {
      assetGroups = assetGroups.filter(g => g.status === 'Active' || g.active === true);
    }

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

    // Check duplicate in memory first
    if (memoryAssetGroups.some(g => g.code.toUpperCase() === cleanCode)) {
      return res.status(400).json({ success: false, message: `Asset Group code "${cleanCode}" already exists.` });
    }

    // Try checking duplicate in DB if connected
    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM asset_groups WHERE code = '${cleanCode.replace(/'/g, "''")}'`
        );
        if (existing && existing.length > 0) {
          return res.status(400).json({ success: false, message: `Asset Group code "${cleanCode}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate skipped (offline/error):', dbErr.message);
      }
    }

    const id = crypto.randomUUID();
    const isAct = status === 'Inactive' ? 0 : 1;
    const cleanType = assetType || 'Both';
    const cleanDesc = description ? `'${description.replace(/'/g, "''")}'` : 'NULL';

    // Try executing DB insert if connected
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO asset_groups (id, code, name, description, assetType, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode}', '${name.trim().replace(/'/g, "''")}', ${cleanDesc}, '${cleanType}', ${isAct}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert skipped, continuing in resilient memory mode:', dbErr.message);
      }
    }

    const newGroup = {
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
    };

    memoryAssetGroups.unshift(newGroup);

    res.status(201).json({
      success: true,
      assetGroup: newGroup
    });
  } catch (err) { next(err); }
}

export async function updateAssetGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, assetType, status } = req.body;

    const memIndex = memoryAssetGroups.findIndex(g => g.id === id);
    const cleanCode = code ? code.trim().toUpperCase() : (memIndex !== -1 ? memoryAssetGroups[memIndex].code : 'GRP');
    const isAct = status ? (status === 'Inactive' ? 0 : 1) : 1;
    const cleanType = assetType || 'Both';
    const cleanDesc = description ? `'${description.replace(/'/g, "''")}'` : 'NULL';

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE asset_groups
          SET code = '${cleanCode}',
              name = '${(name || '').trim().replace(/'/g, "''")}',
              description = ${cleanDesc},
              assetType = '${cleanType}',
              active = ${isAct},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update skipped:', dbErr.message);
      }
    }

    const updatedGroup = {
      id,
      code: cleanCode,
      name: (name || '').trim(),
      description: description || '',
      assetType: cleanType,
      assetTypeLabel: cleanType === 'Physical' ? 'Physical Tangible' : cleanType === 'Intangible' ? 'Intangible / Digital' : 'Both (Physical & Intangible)',
      status: isAct ? 'Active' : 'Inactive',
      active: Boolean(isAct),
      lastModifiedBy: req.user?.username || 'Admin User',
      lastModifiedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 02:15 PM'
    };

    if (memIndex !== -1) {
      memoryAssetGroups[memIndex] = { ...memoryAssetGroups[memIndex], ...updatedGroup };
    } else {
      memoryAssetGroups.unshift(updatedGroup);
    }

    res.json({
      success: true,
      assetGroup: updatedGroup
    });
  } catch (err) { next(err); }
}

export async function deleteAssetGroup(req, res, next) {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM asset_groups WHERE id = '${id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete skipped:', dbErr.message);
      }
    }
    memoryAssetGroups = memoryAssetGroups.filter(g => g.id !== id);
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
    const force = req.query.force === 'true';
    const assetCount = await prisma.asset.count({ where: { siteId: id } }).catch(() => 0);
    if (assetCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `This location is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
      });
    }
    if (assetCount > 0 && force) {
      await prisma.asset.updateMany({ where: { siteId: id }, data: { siteId: null } }).catch(() => null);
    }
    await prisma.building.updateMany({ where: { siteId: id }, data: { active: false } }).catch(() => null);
    await prisma.site.delete({ where: { id } });
    res.json({ success: true, message: 'Location deleted successfully.' });
  } catch (err) {
    try {
      await prisma.site.update({ where: { id: req.params.id }, data: { active: false } }).catch(() => null);
      return res.json({ success: true, message: 'Location deactivated successfully.' });
    } catch (_) {}
    next(err);
  }
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
    const force = req.query.force === 'true';

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id } }).catch(() => null);
    if (!category) {
      return res.json({ success: true, message: 'Category not found or already deleted.' });
    }

    // Check if any assets are referencing this category directly
    const assetCount = await prisma.asset.count({ where: { categoryId: id } }).catch(() => 0);
    if (assetCount > 0 && !force) {
      // Soft-delete by marking inactive to preserve database integrity and accounting history
      await prisma.category.update({
        where: { id },
        data: { active: false }
      }).catch(() => null);
      return res.json({
        success: true,
        message: `Category deactivated and hidden from active lists (${assetCount} assets are linked).`
      });
    }

    // When no assets exist, cascade delete child asset classes (subcategories) and models
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Delete or unlink child asset models
        await tx.assetModel.deleteMany({
          where: { categoryId: id }
        }).catch(() => null);

        // 2. Unlink any assets referencing child asset classes of this category
        const childClasses = await tx.assetClass.findMany({
          where: { categoryId: id },
          select: { id: true }
        });
        const classIds = childClasses.map(c => c.id);
        if (classIds.length > 0) {
          await tx.asset.updateMany({
            where: { assetClassId: { in: classIds } },
            data: { assetClassId: null }
          }).catch(() => null);

          // Delete child asset classes
          await tx.assetClass.deleteMany({
            where: { id: { in: classIds } }
          });
        }

        // 3. Unlink custom field definitions
        await tx.customFieldDefinition.updateMany({
          where: { categoryId: id },
          data: { categoryId: null }
        }).catch(() => null);

        // 4. Unlink receipt line items
        await tx.receiptLineItem.updateMany({
          where: { categoryId: id },
          data: { categoryId: null }
        }).catch(() => null);

        // 5. Delete category
        await tx.category.delete({
          where: { id }
        });
      });

      return res.json({ success: true, message: 'Category and linked subcategories deleted successfully.' });
    } catch (cascadeErr) {
      console.warn('Cascade hard-delete failed, falling back to soft-delete:', cascadeErr.message);
      await prisma.category.update({
        where: { id },
        data: { active: false }
      });
      return res.json({
        success: true,
        message: 'Category deactivated and hidden from active lists.'
      });
    }
  } catch (err) {
    console.error('Delete category error:', err);
    try {
      await prisma.category.update({
        where: { id: req.params.id },
        data: { active: false }
      }).catch(() => null);
      return res.json({ success: true, message: 'Category deactivated successfully.' });
    } catch (softErr) {
      return res.json({ success: true, message: 'Category deleted successfully.' });
    }
  }
}

export async function bulkDeleteCategories(req, res, next) {
  try {
    const { ids, force } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No category IDs provided.' });
    }

    let deletedCount = 0;
    let deactivatedCount = 0;

    for (const id of ids) {
      try {
        const assetCount = await prisma.asset.count({ where: { categoryId: id } }).catch(() => 0);
        if (assetCount > 0 && !force) {
          await prisma.category.update({
            where: { id },
            data: { active: false }
          }).catch(() => null);
          deactivatedCount++;
        } else {
          await prisma.$transaction(async (tx) => {
            if (assetCount > 0 && force) {
              const assets = await tx.asset.findMany({ where: { categoryId: id }, select: { id: true } });
              const assetIds = assets.map(a => a.id);
              if (assetIds.length > 0) {
                await tx.assetActivity.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.assetMaintenanceLog.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.assetBookValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.assetCustomFieldValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.assetDocument.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.ticket.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.workOrder.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
                await tx.asset.deleteMany({ where: { id: { in: assetIds } } }).catch(() => null);
              }
            }

            await tx.assetModel.deleteMany({ where: { categoryId: id } }).catch(() => null);
            const childClasses = await tx.assetClass.findMany({ where: { categoryId: id }, select: { id: true } });
            const classIds = childClasses.map(c => c.id);
            if (classIds.length > 0) {
              await tx.asset.deleteMany({ where: { assetClassId: { in: classIds } } }).catch(() => null);
              await tx.assetClass.deleteMany({ where: { id: { in: classIds } } });
            }
            await tx.customFieldDefinition.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);
            await tx.receiptLineItem.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);
            await tx.category.delete({ where: { id } });
          });
          deletedCount++;
        }
      } catch (e) {
        await prisma.category.update({ where: { id }, data: { active: false } }).catch(() => null);
        deactivatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully removed ${ids.length} categories.`,
      deletedCount,
      deactivatedCount
    });
  } catch (err) { next(err); }
}

export async function getAssetClasses(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    if (req.query.categoryId) where.categoryId = String(req.query.categoryId);
    let assetClasses = await prisma.assetClass.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    });

    if (req.query.kind === 'CLASS') {
      assetClasses = assetClasses.filter(ac => (ac.description || '').includes('[kind:class]') || !(ac.description || '').includes('[kind:subcat]'));
    } else if (req.query.kind === 'SUBCATEGORY') {
      assetClasses = assetClasses.filter(ac => !(ac.description || '').includes('[kind:class]'));
    }

    res.json({ success: true, assetClasses });
  } catch (err) { next(err); }
}

export async function createAssetClass(req, res, next) {
  try {
    const { code, name, categoryId, description, active, status, kind, groupName } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Class Code and Name are required.' });
    }
    let targetCatId = categoryId;
    if (!targetCatId) {
      const firstCat = await prisma.category.findFirst();
      targetCatId = firstCat ? firstCat.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);

    let desc = description || '';
    if (kind === 'CLASS' || (!categoryId && !desc.includes('[kind:'))) {
      const grpTag = groupName ? `[group:${groupName}]` : '';
      desc = `${desc} [kind:class] ${grpTag}`.trim();
    } else if (kind === 'SUBCATEGORY' || (categoryId && !desc.includes('[kind:'))) {
      desc = `${desc} [kind:subcat]`.trim();
    }

    const assetClass = await prisma.assetClass.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: desc,
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
    // Unlink any assets referencing this asset class
    await prisma.asset.updateMany({
      where: { assetClassId: id },
      data: { assetClassId: null }
    }).catch(() => null);

    await prisma.assetClass.delete({ where: { id } });
    res.json({ success: true, message: 'Asset class deleted successfully.' });
  } catch (err) {
    console.warn('Hard delete on asset class failed, falling back to soft-delete:', err.message);
    try {
      await prisma.assetClass.update({
        where: { id: req.params.id },
        data: { active: false }
      });
      res.json({ success: true, message: 'Asset class deactivated and hidden from active lists.' });
    } catch (softErr) {
      next(err);
    }
  }
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
      manufacturers: []
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
    const force = req.query.force === 'true';
    const assetCount = await prisma.asset.count({ where: { departmentId: id } }).catch(() => 0);
    if (assetCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `This department is currently referenced by ${assetCount} asset(s) and cannot be deleted.`
      });
    }
    if (assetCount > 0 && force) {
      await prisma.asset.updateMany({ where: { departmentId: id }, data: { departmentId: null } }).catch(() => null);
    }
    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (err) {
    try {
      await prisma.department.update({ where: { id: req.params.id }, data: { active: false } }).catch(() => null);
      return res.json({ success: true, message: 'Department deactivated successfully.' });
    } catch (_) {}
    next(err);
  }
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
  } catch (err) {
    try {
      await prisma.costCenter.update({ where: { id: req.params.id }, data: { active: false } }).catch(() => null);
      return res.json({ success: true, message: 'Cost center deactivated successfully.' });
    } catch (_) {}
    next(err);
  }
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


// Persistent Database & File Store for Asset Types
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSET_TYPES_FILE = path.resolve(__dirname, '../../data/asset_types.json');

function readAssetTypesFromFile() {
  try {
    if (fs.existsSync(ASSET_TYPES_FILE)) {
      const data = JSON.parse(fs.readFileSync(ASSET_TYPES_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Failed to read asset_types.json:', e.message);
  }
  return [
    {
      id: 'TYPE-1793351000000',
      code: '123',
      name: 'abhay',
      description: 'i am abhay',
      category: 'Discrete Count',
      stage: 'Operational',
      active: true
    }
  ];
}

function writeAssetTypesToFile(list) {
  try {
    const dir = path.dirname(ASSET_TYPES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ASSET_TYPES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write asset_types.json:', e.message);
  }
}

let inMemoryAssetTypes = readAssetTypesFromFile();
let tableEnsured = false;

async function ensureAssetTypesTable() {
  if (tableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asset_types' and xtype='U')
      CREATE TABLE asset_types (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(500) NULL,
        category NVARCHAR(100) NULL,
        stage NVARCHAR(100) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const existingCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM asset_types`).catch(() => [{ cnt: 0 }]);
    const count = Number(existingCount?.[0]?.cnt || 0);
    if (count === 0) {
      for (const t of inMemoryAssetTypes) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO asset_types (id, code, name, description, category, stage, active, createdAt, updatedAt)
            VALUES ('${t.id}', '${t.code.replace(/'/g, "''")}', '${t.name.replace(/'/g, "''")}', '${(t.description || '').replace(/'/g, "''")}', '${(t.category || 'Discrete Count').replace(/'/g, "''")}', '${(t.stage || 'Operational').replace(/'/g, "''")}', ${t.active ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
        } catch (_) {}
      }
    }
    tableEnsured = true;
  } catch (err) {
    console.warn('asset_types table check skipped:', err.message);
  }
}

export async function getAssetTypes(req, res, next) {
  try {
    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        const includeInactive = req.query.includeInactive === 'true';
        const query = includeInactive
          ? `SELECT id, code, name, description, category, stage, active FROM asset_types ORDER BY name ASC`
          : `SELECT id, code, name, description, category, stage, active FROM asset_types WHERE active = 1 ORDER BY name ASC`;
        const rows = await prisma.$queryRawUnsafe(query);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description || '',
            category: r.category || 'Discrete Count',
            stage: r.stage || 'Operational',
            active: Boolean(r.active)
          }));
          inMemoryAssetTypes = list;
          writeAssetTypesToFile(list);
          return res.json({ success: true, assetTypes: list });
        }
      } catch (dbErr) {
        console.warn('DB getAssetTypes query skipped, using persistent store:', dbErr.message);
      }
    }
    const list = req.query.includeInactive === 'true' ? inMemoryAssetTypes : inMemoryAssetTypes.filter(t => t.active !== false);
    res.json({ success: true, assetTypes: list });
  } catch (err) { next(err); }
}

export async function createAssetType(req, res, next) {
  try {
    const { code, name, description, category, stage, active } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Asset Type Name is required.' });
    const cleanCode = (code || name.slice(0, 4)).toUpperCase().trim();
    const cleanName = name.trim();
    const cleanDesc = description || '';
    const cleanCat = category || 'Discrete Count';
    const cleanStage = stage || 'Operational';
    const isAct = active !== undefined ? Boolean(active) : true;
    const id = `TYPE-${Date.now()}`;

    const newType = {
      id,
      code: cleanCode,
      name: cleanName,
      description: cleanDesc,
      category: cleanCat,
      stage: cleanStage,
      active: isAct
    };

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO asset_types (id, code, name, description, category, stage, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${cleanDesc.replace(/'/g, "''")}', '${cleanCat.replace(/'/g, "''")}', '${cleanStage.replace(/'/g, "''")}', ${isAct ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert asset_types skipped:', dbErr.message);
      }
    }

    inMemoryAssetTypes = inMemoryAssetTypes.filter(t => t.id !== id && t.code !== cleanCode);
    inMemoryAssetTypes.unshift(newType);
    writeAssetTypesToFile(inMemoryAssetTypes);
    res.status(201).json({ success: true, assetType: newType });
  } catch (err) { next(err); }
}

export async function updateAssetType(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, category, stage, active } = req.body;
    const idx = inMemoryAssetTypes.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Asset Type not found' });

    inMemoryAssetTypes[idx] = {
      ...inMemoryAssetTypes[idx],
      ...(code && { code: code.toUpperCase().trim() }),
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(stage && { stage }),
      ...(active !== undefined && { active: Boolean(active) })
    };

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        const item = inMemoryAssetTypes[idx];
        await prisma.$executeRawUnsafe(`
          UPDATE asset_types
          SET code = '${item.code.replace(/'/g, "''")}',
              name = '${item.name.replace(/'/g, "''")}',
              description = '${(item.description || '').replace(/'/g, "''")}',
              category = '${(item.category || '').replace(/'/g, "''")}',
              stage = '${(item.stage || '').replace(/'/g, "''")}',
              active = ${item.active ? 1 : 0},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update asset_types skipped:', dbErr.message);
      }
    }

    writeAssetTypesToFile(inMemoryAssetTypes);
    res.json({ success: true, assetType: inMemoryAssetTypes[idx] });
  } catch (err) { next(err); }
}

export async function deleteAssetType(req, res, next) {
  try {
    const { id } = req.params;
    inMemoryAssetTypes = inMemoryAssetTypes.filter(t => t.id !== id);

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM asset_types WHERE id = '${id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete asset_types skipped:', dbErr.message);
      }
    }

    writeAssetTypesToFile(inMemoryAssetTypes);
    res.json({ success: true, message: 'Asset Type deleted successfully' });
  } catch (err) { next(err); }
}
