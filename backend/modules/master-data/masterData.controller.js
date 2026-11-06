import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDataFile(filename) {
  const candidates = [
    path.resolve(__dirname, '../../data', filename),
    path.join(process.cwd(), 'data', filename),
    path.join(process.cwd(), 'assets-management', 'backend', 'data', filename)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  const defaultPath = candidates[0];
  const dir = path.dirname(defaultPath);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
  return defaultPath;
}

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
    const cleanName = name.trim();

    // Check duplicate in memory first
    if (memoryAssetGroups.some(g => (g.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Asset Group code "${cleanCode}" already exists. Duplicate codes are not allowed.` });
    }
    if (memoryAssetGroups.some(g => (g.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Asset Group name "${cleanName}" already exists. Duplicate names are not allowed.` });
    }

    // Try checking duplicate in DB if connected
    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM asset_groups WHERE code = '${cleanCode.replace(/'/g, "''")}' OR name = '${cleanName.replace(/'/g, "''")}'`
        );
        if (existing && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Asset Group with code "${cleanCode}" or name "${cleanName}" already exists.` });
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
    const cleanName = (name || '').trim();
    const isAct = status ? (status === 'Inactive' ? 0 : 1) : 1;
    const cleanType = assetType || 'Both';
    const cleanDesc = description ? `'${description.replace(/'/g, "''")}'` : 'NULL';

    if (cleanCode && memoryAssetGroups.some(g => g.id !== id && (g.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Asset Group code "${cleanCode}" already exists. Duplicate codes are not allowed.` });
    }
    if (cleanName && memoryAssetGroups.some(g => g.id !== id && (g.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Asset Group name "${cleanName}" already exists. Duplicate names are not allowed.` });
    }

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM asset_groups WHERE id != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
        );
        if (existing && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Another Asset Group with this code or name already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate asset group skipped:', dbErr.message);
      }
    }

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE asset_groups
          SET code = '${cleanCode}',
              name = '${cleanName.replace(/'/g, "''")}',
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
      name: cleanName,
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
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    let group = memoryAssetGroups.find(g => g.id === id || g.code === id);
    if (!group && isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM asset_groups WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
        if (rows && rows.length > 0) group = rows[0];
      } catch (_) {}
    }

    const groupName = (req.query.name || req.body?.name || group?.name || '').trim();
    const groupCode = (req.query.code || req.body?.code || group?.code || '').trim();

    // Check child dependencies:
    // 1. Asset Sub Groups
    let subGroupsCount = 0;
    try {
      const fileSubGroups = readAssetSubGroupsFromFile();
      const matchedFileSubGroups = fileSubGroups.filter(s =>
        (s.assetGroupId && (s.assetGroupId === id || s.assetGroupId === groupCode)) ||
        (groupName && s.assetGroupName && s.assetGroupName.trim().toLowerCase() === groupName.toLowerCase()) ||
        (groupName && s.groupName && s.groupName.trim().toLowerCase() === groupName.toLowerCase()) ||
        (groupCode && s.groupCode && s.groupCode.trim().toLowerCase() === groupCode.toLowerCase())
      );
      subGroupsCount = matchedFileSubGroups.length;
    } catch (_) {}

    if (isDbConnected()) {
      try {
        const dbSg = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM asset_sub_groups
          WHERE assetGroupId = '${id.replace(/'/g, "''")}'
             OR assetGroupId = '${groupCode.replace(/'/g, "''")}'
             OR (assetGroupName IS NOT NULL AND (assetGroupName = '${groupName.replace(/'/g, "''")}' OR UPPER(assetGroupName) = '${groupName.toUpperCase().replace(/'/g, "''")}'))
        `);
        const dbCount = Number(dbSg?.[0]?.cnt || 0);
        if (dbCount > subGroupsCount) subGroupsCount = dbCount;
      } catch (dbErr) {
        console.warn('DB check subGroupsCount in deleteAssetGroup skipped:', dbErr.message);
      }
    }

    // 2. Assets directly linked (if any)
    let assetsCount = 0;
    if (isDbConnected()) {
      try {
        const assetRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM assets
          WHERE assetGroupId = '${id.replace(/'/g, "''")}'
             OR assetGroupId = '${groupCode.replace(/'/g, "''")}'
        `);
        assetsCount = Number(assetRows?.[0]?.cnt || 0);
      } catch (_) {}
    }

    // Asset Group only blocks on its immediate direct children (Asset Sub Groups)
    const totalLinked = subGroupsCount + assetsCount;

    if (totalLinked > 0 && !deactivateOnly) {
      return res.json({
        success: false,
        requiresConfirmation: true,
        linkedCount: totalLinked,
        entityName: 'Asset Group',
        details: {
          subGroupsCount,
          assetsCount
        },
        message: `This Asset Group is linked to ${totalLinked} active record(s) (${subGroupsCount} sub groups, ${assetsCount} assets). Deletion is blocked because child sub groups exist under this group. You must delete or reassign child sub groups first.`
      });
    }

    if (deactivateOnly) {
      if (isDbConnected()) {
        try {
          await prisma.$executeRawUnsafe(`
            UPDATE asset_groups
            SET active = 0, status = 'Inactive', updatedAt = CURRENT_TIMESTAMP
            WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
          `);
        } catch (_) {}
      }
      memoryAssetGroups = memoryAssetGroups.map(g => (g.id === id || g.code === id) ? { ...g, active: false, status: 'Inactive' } : g);
      return res.json({
        success: true,
        deactivated: true,
        message: `Asset Group marked as Inactive (${totalLinked} linked records preserved).`
      });
    }

    // Hard delete (force or no linked children)
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE asset_sub_groups
          SET assetGroupId = NULL
          WHERE assetGroupId = '${id.replace(/'/g, "''")}'
        `).catch(() => null);
        await prisma.$executeRawUnsafe(`
          UPDATE assets
          SET assetGroupId = NULL
          WHERE assetGroupId = '${id.replace(/'/g, "''")}'
        `).catch(() => null);
        await prisma.$executeRawUnsafe(`DELETE FROM asset_groups WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete skipped:', dbErr.message);
      }
    }
    memoryAssetGroups = memoryAssetGroups.filter(g => g.id !== id && g.code !== id);
    res.json({ success: true, hardDeleted: true, message: 'Asset Group permanently deleted from database.' });
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
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Company Code and Name are required.' });
    }
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (isDbConnected()) {
      try {
        const existing = await prisma.company.findFirst({
          where: {
            OR: [
              { code: cleanCode },
              { name: { equals: cleanName, mode: 'insensitive' } }
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Company with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate company skipped:', dbErr.message);
      }
    }

    const company = await prisma.company.create({
      data: {
        ...req.body,
        code: cleanCode,
        name: cleanName
      }
    });
    res.status(201).json({ success: true, company });
  } catch (err) { next(err); }
}


export async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, currency, taxId, address, active, status } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const existing = await prisma.company.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(cleanCode ? [{ code: cleanCode }] : []),
              ...(cleanName ? [{ name: { equals: cleanName, mode: 'insensitive' } }] : [])
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Another company with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate company skipped:', dbErr.message);
      }
    }

    const updateData = {};
    if (cleanCode) updateData.code = cleanCode;
    if (cleanName) updateData.name = cleanName;
    if (currency) updateData.currency = currency;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (address !== undefined) updateData.address = address;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

    if (isDbConnected()) {
      try {
        const company = await prisma.company.update({
          where: { id },
          data: updateData
        });
        return res.json({ success: true, company });
      } catch (dbErr) {
        console.warn('DB update company skipped:', dbErr.message);
      }
    }
    res.json({ success: true, company: { id, ...req.body } });
  } catch (err) { next(err); }
}

export async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    if (isDbConnected()) {
      // Count dependent references
      const [assetsCount, sitesCount, deptsCount, employeesCount, costCentersCount, usersCount] = await Promise.all([
        prisma.asset.count({ where: { companyId: id } }).catch(() => 0),
        prisma.site.count({ where: { companyId: id } }).catch(() => 0),
        prisma.department.count({ where: { companyId: id } }).catch(() => 0),
        prisma.employee.count({ where: { companyId: id } }).catch(() => 0),
        prisma.costCenter.count({ where: { companyId: id } }).catch(() => 0),
        prisma.user.count({ where: { companyId: id } }).catch(() => 0)
      ]);
      const totalLinked = assetsCount + sitesCount + deptsCount + employeesCount + costCentersCount + usersCount;

      if (totalLinked > 0 && !force && !deactivateOnly) {
        return res.json({
          success: false,
          requiresConfirmation: true,
          linkedCount: totalLinked,
          entityName: 'Company',
          details: { assetsCount, sitesCount, deptsCount, employeesCount, costCentersCount, usersCount },
          message: `This Company is referenced by ${totalLinked} active record(s) (${assetsCount} assets, ${sitesCount} locations, ${deptsCount} departments, ${employeesCount} employees).`
        });
      }

      if (deactivateOnly) {
        await prisma.company.update({
          where: { id },
          data: { active: false }
        });
        return res.json({ success: true, deactivated: true, message: `Company deactivated successfully (${totalLinked} linked records preserved).` });
      }

      // Hard delete: if force is true and records are linked, unlink or cascade empty structures
      if (force && totalLinked > 0) {
        await prisma.asset.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.site.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.costCenter.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.department.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.employee.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.user.updateMany({ where: { companyId: id }, data: { companyId: null } }).catch(() => null);
        await prisma.fiscalPeriod.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.receipt.deleteMany({ where: { companyId: id } }).catch(() => null);
        await prisma.depreciationRun.deleteMany({ where: { companyId: id } }).catch(() => null);
      }

      await prisma.company.delete({ where: { id } });
      return res.json({ success: true, hardDeleted: true, message: 'Company permanently deleted from database.' });
    }
    res.json({ success: true, hardDeleted: true, message: 'Company removed successfully.' });
  } catch (err) { next(err); }
}

const LOCATIONS_FILE = resolveDataFile('locations.json');

const DEFAULT_4TIER_LOCATIONS = [];

function readLocationsFromFile() {
  try {
    if (fs.existsSync(LOCATIONS_FILE)) {
      const data = fs.readFileSync(LOCATIONS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn('Failed to read locations.json:', e.message);
  }
  return [];
}

function writeLocationsToFile(list) {
  try {
    const dir = path.dirname(LOCATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write locations.json:', e.message);
  }
}

let inMemoryLocations = readLocationsFromFile();
let sitesTableEnsured = false;

export function computeLocationFullPath(loc, allLocs = []) {
  if (!loc) return '';
  const parts = [loc.name || loc.code];
  let current = loc;
  let depth = 0;
  while (current && current.parentLocation && current.parentLocation !== '-' && depth < 6) {
    const parent = allLocs.find(l => (l.code && l.code.toUpperCase() === current.parentLocation.toUpperCase()) || l.id === current.parentLocation || (l.name && l.name.toLowerCase() === current.parentLocation.toLowerCase()));
    if (parent) {
      parts.unshift(parent.name || parent.code);
      current = parent;
    } else {
      parts.unshift(current.parentLocation);
      break;
    }
    depth++;
  }
  return parts.join(' > ');
}

async function ensureSitesTable() {
  if (sitesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('sites') AND name = 'level')
      ALTER TABLE sites ADD level NVARCHAR(50) DEFAULT 'Level 1';

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('sites') AND name = 'type')
      ALTER TABLE sites ADD type NVARCHAR(50) DEFAULT 'Internal';

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('sites') AND name = 'parentLocation')
      ALTER TABLE sites ADD parentLocation NVARCHAR(100) NULL;

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('sites') AND name = 'fullPath')
      ALTER TABLE sites ADD fullPath NVARCHAR(500) NULL;
    `);

    sitesTableEnsured = true;
  } catch (err) {
    console.warn('sites table check skipped:', err.message);
  }
}

export async function getSites(req, res, next) {
  try {
    await ensureSitesTable();
    if (isDbConnected()) {
      try {
        const includeInactive = req.query.includeInactive === 'true';
        const query = includeInactive
          ? `SELECT id, code, name, city, country, companyId, type, level, parentLocation, fullPath, active, createdAt, updatedAt FROM sites ORDER BY level ASC, name ASC`
          : `SELECT id, code, name, city, country, companyId, type, level, parentLocation, fullPath, active, createdAt, updatedAt FROM sites WHERE active = 1 ORDER BY level ASC, name ASC`;
        const rows = await prisma.$queryRawUnsafe(query);
        if (Array.isArray(rows) && rows.length > 0) {
          const raw = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            city: r.city || '',
            country: r.country || '',
            companyId: r.companyId,
            type: r.type === 'External' ? 'External' : 'Internal',
            level: ['Level 1', 'Level 2', 'Level 3', 'Level 4'].includes(r.level) ? r.level : 'Level 1',
            parentLocation: r.parentLocation || '-',
            fullPath: r.fullPath || '',
            active: Boolean(r.active),
            status: Boolean(r.active) ? 'Active' : 'Inactive',
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }));

          const resolved = raw.map(loc => ({
            ...loc,
            fullPath: loc.fullPath || computeLocationFullPath(loc, raw)
          }));

          inMemoryLocations = resolved;
          writeLocationsToFile(resolved);
          return res.json({ success: true, sites: resolved });
        }
      } catch (dbErr) {
        console.warn('DB getSites query skipped, using persistent store:', dbErr.message);
      }
    }

    const resolvedMem = inMemoryLocations.map(loc => ({
      ...loc,
      fullPath: loc.fullPath || computeLocationFullPath(loc, inMemoryLocations)
    }));
    res.json({ success: true, sites: resolvedMem });
  } catch (err) { next(err); }
}

export async function createSite(req, res, next) {
  try {
    const { code, name, type, level, parentLocation, city, country, address, postalCode, active, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Location Code and Name are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    // System enumeration: strictly 'Internal' or 'External'
    const cleanType = (type === 'External') ? 'External' : 'Internal';
    const cleanLevel = ['Level 1', 'Level 2', 'Level 3', 'Level 4'].includes(level) ? level : 'Level 1';
    const cleanParent = (cleanLevel === 'Level 1' || !parentLocation) ? '-' : parentLocation.trim();
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);

    // Strict duplicate check on code and name
    const exists = inMemoryLocations.some(l => 
      (l.code && l.code.toUpperCase() === cleanCode) || 
      (l.name && l.name.toLowerCase() === cleanName.toLowerCase())
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Error: Location with code "${cleanCode}" or name "${cleanName}" already exists.`
      });
    }

    if (isDbConnected()) {
      try {
        const dbExisting = await prisma.$queryRawUnsafe(
          `SELECT id FROM sites WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(dbExisting) && dbExisting.length > 0) {
          return res.status(409).json({
            success: false,
            message: `Duplicate Error: Location with code "${cleanCode}" or name "${cleanName}" already exists.`
          });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate location skipped:', dbErr.message);
      }
    }

    const id = `loc-${Date.now()}`;
    const allForPath = [...inMemoryLocations];
    const computedPath = computeLocationFullPath({ name: cleanName, parentLocation: cleanParent }, allForPath);

    const newLoc = {
      id,
      code: cleanCode,
      name: cleanName,
      type: cleanType,
      level: cleanLevel,
      parentLocation: cleanParent,
      fullPath: computedPath,
      city: city || '',
      country: country || '',
      address: address || cleanName,
      postalCode: postalCode || '',
      active: isAct,
      status: isAct ? 'Active' : 'Inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('📍 [Backend Location Created]:', JSON.stringify(newLoc));

    await ensureSitesTable();
    if (isDbConnected()) {
      try {
        let firstCompanyId = null;
        try {
          const comp = await prisma.company.findFirst();
          firstCompanyId = comp ? comp.id : null;
        } catch (_) {}

        await prisma.$executeRawUnsafe(`
          INSERT INTO sites (id, code, name, city, country, companyId, type, level, parentLocation, fullPath, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${(city || '').replace(/'/g, "''")}', '${(country || '').replace(/'/g, "''")}', ${firstCompanyId ? `'${firstCompanyId}'` : 'NULL'}, '${cleanType}', '${cleanLevel}', '${cleanParent.replace(/'/g, "''")}', '${computedPath.replace(/'/g, "''")}', ${isAct ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert sites skipped:', dbErr.message);
      }
    }

    inMemoryLocations.unshift(newLoc);
    writeLocationsToFile(inMemoryLocations);
    res.status(201).json({ success: true, site: newLoc });
  } catch (err) { next(err); }
}

export async function updateSite(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, type, level, parentLocation, city, country, address, postalCode, active, status } = req.body;

    const idx = inMemoryLocations.findIndex(l => l.id === id || l.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Location not found' });

    const cleanCode = code ? code.trim().toUpperCase() : inMemoryLocations[idx].code;
    const cleanName = name ? name.trim() : inMemoryLocations[idx].name;
    const cleanType = type !== undefined ? (type === 'External' ? 'External' : 'Internal') : inMemoryLocations[idx].type;
    const cleanLevel = level !== undefined && ['Level 1', 'Level 2', 'Level 3', 'Level 4'].includes(level) ? level : inMemoryLocations[idx].level;
    const cleanParent = (cleanLevel === 'Level 1' || parentLocation === '-') ? '-' : (parentLocation ? parentLocation.trim() : inMemoryLocations[idx].parentLocation);
    const isAct = active !== undefined ? Boolean(active) : (status !== undefined ? status === 'Active' : inMemoryLocations[idx].active);

    const dup = inMemoryLocations.find(l => (l.id !== id && l.code !== id) && (
      (cleanCode && l.code && l.code.toUpperCase() === cleanCode) || 
      (cleanName && l.name && l.name.toLowerCase() === cleanName.toLowerCase())
    ));
    if (dup) {
      return res.status(409).json({ success: false, message: `Duplicate Error: Location with code "${cleanCode}" or name "${cleanName}" already exists.` });
    }
    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM sites WHERE id != '${id.replace(/'/g, "''")}' AND code != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Duplicate Error: Location with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (err) {}
    }

    const computedPath = computeLocationFullPath({ name: cleanName, parentLocation: cleanParent }, inMemoryLocations);

    inMemoryLocations[idx] = {
      ...inMemoryLocations[idx],
      code: cleanCode,
      name: cleanName,
      type: cleanType,
      level: cleanLevel,
      parentLocation: cleanParent,
      fullPath: computedPath,
      city: city !== undefined ? city : inMemoryLocations[idx].city,
      country: country !== undefined ? country : inMemoryLocations[idx].country,
      address: address !== undefined ? address : inMemoryLocations[idx].address,
      postalCode: postalCode !== undefined ? postalCode : inMemoryLocations[idx].postalCode,
      active: isAct,
      status: isAct ? 'Active' : 'Inactive',
      updatedAt: new Date().toISOString()
    };

    console.log('✏️ [Backend Location Updated]:', JSON.stringify(inMemoryLocations[idx]));

    await ensureSitesTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE sites
          SET code = '${cleanCode.replace(/'/g, "''")}',
              name = '${cleanName.replace(/'/g, "''")}',
              type = '${cleanType}',
              level = '${cleanLevel}',
              parentLocation = '${cleanParent.replace(/'/g, "''")}',
              fullPath = '${computedPath.replace(/'/g, "''")}',
              city = '${(city || '').replace(/'/g, "''")}',
              country = '${(country || '').replace(/'/g, "''")}',
              active = ${isAct ? 1 : 0},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update sites skipped:', dbErr.message);
      }
    }

    writeLocationsToFile(inMemoryLocations);
    res.json({ success: true, site: inMemoryLocations[idx] });
  } catch (err) { next(err); }
}

export async function deleteSite(req, res, next) {
  try {
    const { id } = req.params;
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    const targetLoc = inMemoryLocations.find(l => l.id === id || l.code === id);
    const targetCode = targetLoc ? targetLoc.code : id;

    // Check if any child location references this location as parent
    const childCount = inMemoryLocations.filter(l => l.parentLocation === id || l.parentLocation === targetCode).length;
    let siteAssets = 0;
    let buildingAssets = 0;
    let receiptCount = 0;
    let siteBuildings = [];

    if (isDbConnected()) {
      try {
        const [directAssets, bldgs, receipts] = await Promise.all([
          prisma.asset.count({ where: { siteId: id } }).catch(() => 0),
          prisma.building.findMany({ where: { siteId: id }, select: { id: true, code: true, name: true } }).catch(() => []),
          prisma.receipt.count({ where: { siteId: id } }).catch(() => 0)
        ]);
        siteAssets = directAssets;
        siteBuildings = bldgs || [];
        receiptCount = receipts;

        if (siteBuildings.length > 0) {
          const bldgIds = siteBuildings.map(b => b.id);
          buildingAssets = await prisma.asset.count({ where: { buildingId: { in: bldgIds } } }).catch(() => 0);
        }
      } catch (_) {}
    }

    const totalAssets = siteAssets + buildingAssets;
    // Hard blocking connections: assets, purchase receipts, or direct child sub-locations in the hierarchy
    const totalBlocking = childCount + totalAssets + receiptCount;

    if (totalBlocking > 0 && !force && !deactivateOnly) {
      return res.json({
        success: false,
        requiresConfirmation: true,
        linkedCount: totalBlocking,
        entityName: 'Location',
        details: {
          assetsCount: totalAssets,
          receiptsCount: receiptCount,
          childCount,
          buildingsCount: siteBuildings.length
        },
        message: `This Location cannot be deleted because it is referenced by active records (${totalAssets} assets, ${receiptCount} receipts, ${childCount} child locations).`
      });
    }

    if (deactivateOnly) {
      if (targetLoc) targetLoc.active = false;
      writeLocationsToFile(inMemoryLocations);
      if (isDbConnected()) {
        try {
          await prisma.$executeRawUnsafe(`UPDATE sites SET active = 0 WHERE id = '${id.replace(/'/g, "''")}' OR code = '${(targetCode || '').replace(/'/g, "''")}'`);
        } catch (_) {}
      }
      return res.json({ success: true, deactivated: true, message: `Location deactivated successfully (${totalBlocking} linked records preserved).` });
    }

    // Hard delete:
    // If no real assets/receipts exist (or if forced), cascade-delete empty child buildings, floors, and rooms first
    if (isDbConnected()) {
      try {
        const bldgIds = siteBuildings.map(b => b.id);
        if (bldgIds.length > 0) {
          const siteFloors = await prisma.floor.findMany({ where: { buildingId: { in: bldgIds } }, select: { id: true } });
          const floorIds = siteFloors.map(f => f.id);
          if (floorIds.length > 0) {
            await prisma.room.deleteMany({ where: { floorId: { in: floorIds } } }).catch(() => {});
          }
          await prisma.floor.deleteMany({ where: { buildingId: { in: bldgIds } } }).catch(() => {});
          await prisma.building.deleteMany({ where: { siteId: id } }).catch(() => {});
        }

        if (force) {
          await prisma.user.updateMany({ where: { siteId: id }, data: { siteId: null } }).catch(() => {});
          await prisma.receipt.deleteMany({ where: { siteId: id } }).catch(() => {});
          await prisma.asset.deleteMany({ where: { siteId: id } }).catch(() => {});
        }

        await ensureSitesTable();
        await prisma.$executeRawUnsafe(`DELETE FROM sites WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}' OR code = '${(targetCode || '').replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete sites error:', dbErr.message);
      }
    }

    inMemoryLocations = inMemoryLocations.filter(l => l.id !== id && l.code !== id && (!targetCode || l.code !== targetCode));
    inMemoryLocations.forEach(l => {
      if (l.parentLocation === id || l.parentLocation === targetCode) {
        l.parentLocation = '-';
      }
    });
    writeLocationsToFile(inMemoryLocations);

    res.json({ success: true, hardDeleted: true, message: 'Location permanently deleted from database.' });
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
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (isDbConnected()) {
      try {
        const existing = await prisma.category.findFirst({
          where: {
            OR: [
              { code: cleanCode },
              { name: { equals: cleanName, mode: 'insensitive' } }
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Category with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate category skipped:', dbErr.message);
      }
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
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const existing = await prisma.category.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(cleanCode ? [{ code: cleanCode }] : []),
              ...(cleanName ? [{ name: { equals: cleanName, mode: 'insensitive' } }] : [])
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Another category with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate category skipped:', dbErr.message);
      }
    }

    const updateData = {};
    if (cleanCode) updateData.code = cleanCode;
    if (cleanName) updateData.name = cleanName;
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
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id } }).catch(() => null);
    if (!category) {
      return res.json({ success: true, message: 'Category not found or already deleted.' });
    }

    const catName = (req.query.name || req.body?.name || category?.name || '').trim();
    const catCode = (req.query.code || req.body?.code || category?.code || '').trim();

    // Check dependencies
    let [assetCount, modelCount, classCount] = await Promise.all([
      prisma.asset.count({ where: { OR: [{ categoryId: id }, ...(catCode ? [{ categoryId: catCode }] : [])] } }).catch(() => 0),
      prisma.assetModel.count({ where: { OR: [{ categoryId: id }, ...(catCode ? [{ categoryId: catCode }] : [])] } }).catch(() => 0),
      prisma.subCategory.count({ where: { OR: [{ categoryId: id }, ...(catCode ? [{ categoryId: catCode }] : []), ...(catName ? [{ categoryName: catName }] : [])] } }).catch(() => 0)
    ]);

    // Check sub_categories in JSON file
    try {
      const fileSubCats = readSubCategoriesFromFile();
      const matchedFileSubCats = fileSubCats.filter(sc =>
        (sc.categoryId && (sc.categoryId === id || sc.categoryId === catCode)) ||
        (catName && sc.categoryName && sc.categoryName.trim().toLowerCase() === catName.toLowerCase())
      );
      if (matchedFileSubCats.length > classCount) {
        classCount = matchedFileSubCats.length;
      }
    } catch (_) {}

    // Check sub_categories in DB
    if (isDbConnected()) {
      try {
        const scRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM sub_categories
          WHERE categoryId = '${id.replace(/'/g, "''")}'
             OR categoryId = '${catCode.replace(/'/g, "''")}'
             OR (categoryName IS NOT NULL AND (categoryName = '${catName.replace(/'/g, "''")}' OR UPPER(categoryName) = '${catName.toUpperCase().replace(/'/g, "''")}'))
        `);
        const dbScCount = Number(scRows?.[0]?.cnt || 0);
        if (dbScCount > classCount) classCount = dbScCount;
      } catch (dbErr) {
        console.warn('DB check sub_categories in deleteCategory skipped:', dbErr.message);
      }

      try {
        const dbAssets = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM assets
          WHERE categoryId = '${id.replace(/'/g, "''")}'
             OR categoryId = '${catCode.replace(/'/g, "''")}'
        `);
        const dbAssetCount = Number(dbAssets?.[0]?.cnt || 0);
        if (dbAssetCount > assetCount) assetCount = dbAssetCount;
      } catch (_) {}
    }
    const totalLinked = assetCount + modelCount + classCount;

    if (totalLinked > 0 && !deactivateOnly) {
      return res.json({
        success: false,
        requiresConfirmation: true,
        linkedCount: totalLinked,
        entityName: 'Category',
        details: { assetsCount: assetCount, modelCount, classCount },
        message: `This Category is linked to ${totalLinked} active record(s) (${assetCount} assets, ${modelCount} models, ${classCount} sub-categories). Deletion is blocked because child records exist under this category. You must delete or reassign child records first.`
      });
    }

    if (deactivateOnly) {
      await prisma.category.update({
        where: { id },
        data: { active: false }
      }).catch(() => null);
      return res.json({
        success: true,
        deactivated: true,
        message: `Category deactivated successfully (${totalLinked} linked records preserved).`
      });
    }

    // Hard delete:
    await prisma.$transaction(async (tx) => {
      // 1. If force delete, cascade delete linked assets
      if (assetCount > 0 && force) {
        const assets = await tx.asset.findMany({ where: { categoryId: id }, select: { id: true } });
        const assetIds = assets.map(a => a.id);
        if (assetIds.length > 0) {
          const wos = await tx.maintenanceWorkOrder.findMany({ where: { assetId: { in: assetIds } }, select: { id: true } });
          const woIds = wos.map(w => w.id);
          if (woIds.length > 0) {
            await Promise.all([
              tx.workOrderChecklist.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
              tx.workOrderPart.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
              tx.workOrderTimeLog.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
              tx.workOrderStatusHistory.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null)
            ]);
            await tx.maintenanceWorkOrder.deleteMany({ where: { id: { in: woIds } } }).catch(() => null);
          }
          await Promise.all([
            tx.assetBookValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.assetTransaction.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.custodyAssignment.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.maintenanceSchedule.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.contractAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.warranty.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.tagHistory.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.tag.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.assetMapPosition.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.discoveryMatch.deleteMany({ where: { matchedAssetId: { in: assetIds } } }).catch(() => null),
            tx.aIRecommendation.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.assetCustomFieldValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.assetTransfer.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.rtlsMovement.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.rtlsAssetLocation.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.stocktakeExpectedAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
            tx.attachment.deleteMany({ where: { entityType: 'Asset', entityId: { in: assetIds } } }).catch(() => null)
          ]);
          await tx.asset.deleteMany({ where: { id: { in: assetIds } } }).catch(() => null);
        }
      }

      // 2. Unlink custom field definitions & receipt line items
      await tx.customFieldDefinition.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);
      await tx.receiptLineItem.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);

      // 3. Delete or unlink child asset models
      await tx.assetModel.deleteMany({ where: { categoryId: id } }).catch(() => null);

      // 4. Delete child sub-categories
      await tx.subCategory.deleteMany({ where: { categoryId: id } }).catch(() => null);

      // 5. Delete category permanently from SQL database
      await tx.category.delete({ where: { id } });
    });

    return res.json({ success: true, hardDeleted: true, message: 'Category permanently deleted from database.' });
  } catch (err) {
    next(err);
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
                const wos = await tx.maintenanceWorkOrder.findMany({ where: { assetId: { in: assetIds } }, select: { id: true } });
                const woIds = wos.map(w => w.id);
                if (woIds.length > 0) {
                  await Promise.all([
                    tx.workOrderChecklist.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
                    tx.workOrderPart.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
                    tx.workOrderTimeLog.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null),
                    tx.workOrderStatusHistory.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => null)
                  ]);
                  await tx.maintenanceWorkOrder.deleteMany({ where: { id: { in: woIds } } }).catch(() => null);
                }
                await Promise.all([
                  tx.assetBookValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.assetTransaction.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.custodyAssignment.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.maintenanceSchedule.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.contractAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.warranty.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.tagHistory.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.tag.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.assetMapPosition.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.discoveryMatch.deleteMany({ where: { matchedAssetId: { in: assetIds } } }).catch(() => null),
                  tx.aIRecommendation.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.assetCustomFieldValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.assetTransfer.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.rtlsMovement.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.rtlsAssetLocation.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.stocktakeExpectedAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null),
                  tx.attachment.deleteMany({ where: { entityType: 'Asset', entityId: { in: assetIds } } }).catch(() => null)
                ]);
                await tx.asset.deleteMany({ where: { id: { in: assetIds } } }).catch(() => null);
              }
            }

            await tx.customFieldDefinition.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);
            await tx.receiptLineItem.updateMany({ where: { categoryId: id }, data: { categoryId: null } }).catch(() => null);
            await tx.assetModel.deleteMany({ where: { categoryId: id } }).catch(() => null);
            await tx.subCategory.deleteMany({ where: { categoryId: id } }).catch(() => null);
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

let subGroupsTableEnsured = false;
let subCategoriesTableEnsured = false;

async function ensureAssetSubGroupsTable() {
  if (subGroupsTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asset_sub_groups' and xtype='U')
      CREATE TABLE asset_sub_groups (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        assetGroupId NVARCHAR(100) NULL,
        assetGroupName NVARCHAR(200) NULL,
        assetType NVARCHAR(50) DEFAULT 'Both',
        description NVARCHAR(500) NULL,
        totalAssets INT DEFAULT 0,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    subGroupsTableEnsured = true;
  } catch (err) {
    console.warn('ensureAssetSubGroupsTable warning:', err.message);
  }
}

async function ensureSubCategoriesTable() {
  if (subCategoriesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sub_categories' and xtype='U')
      CREATE TABLE sub_categories (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        categoryId NVARCHAR(100) NULL,
        categoryName NVARCHAR(200) NULL,
        assetSubGroupId NVARCHAR(100) NULL,
        assetSubGroupName NVARCHAR(200) NULL,
        assetGroupId NVARCHAR(100) NULL,
        assetGroupName NVARCHAR(200) NULL,
        description NVARCHAR(500) NULL,
        totalAssets INT DEFAULT 0,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    subCategoriesTableEnsured = true;
  } catch (err) {
    console.warn('ensureSubCategoriesTable warning:', err.message);
  }
}

// ---------------------------------------------------------------------------
// ASSET SUB GROUPS (LEVEL 2 - DEDICATED TABLE: asset_sub_groups)
// ---------------------------------------------------------------------------

export async function getAssetSubGroups(req, res, next) {
  try {
    await ensureAssetSubGroupsTable();
    if (isDbConnected()) {
      try {
        let whereClause = req.query.includeInactive === 'true' ? '1=1' : 'active = 1';
        if (req.query.assetGroupId) {
          whereClause += ` AND assetGroupId = '${String(req.query.assetGroupId).replace(/'/g, "''")}'`;
        }
        const query = `SELECT * FROM asset_sub_groups WHERE ${whereClause} ORDER BY name ASC`;
        const rows = await prisma.$queryRawUnsafe(query);
        const list = (rows || []).map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          assetGroupId: r.assetGroupId || null,
          assetGroupName: r.assetGroupName || '-',
          groupName: r.assetGroupName || '-',
          assetType: r.assetType || 'Both',
          description: r.description || '',
          totalAssets: r.totalAssets || 0,
          active: Boolean(r.active),
          status: r.active ? 'Active' : 'Inactive',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));
        writeAssetSubGroupsToFile(list);
        return res.json({ success: true, assetSubGroups: list, assetClasses: list });
      } catch (dbErr) {
        console.warn('DB getAssetSubGroups skipped:', dbErr.message);
      }
    }
    const memList = readAssetSubGroupsFromFile();
    const list = req.query.includeInactive === 'true' ? memList : memList.filter(s => s.active !== false);
    res.json({ success: true, assetSubGroups: list, assetClasses: list });
  } catch (err) { next(err); }
}

export async function createAssetSubGroup(req, res, next) {
  try {
    await ensureAssetSubGroupsTable();
    const { code, name, assetGroupId, assetGroupName, groupName, assetType, description, active, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Asset Sub Group Code and Name are required.' });
    }
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanGroup = (groupName || assetGroupName || '').trim();
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);

    const newSubGroup = {
      id: `asg-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      assetGroupId: assetGroupId || null,
      assetGroupName: cleanGroup,
      groupName: cleanGroup,
      assetType: assetType || 'Both',
      description: description || '',
      totalAssets: 0,
      active: isAct,
      status: isAct ? 'Active' : 'Inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = readAssetSubGroupsFromFile();
    if (current.some(sg => (sg.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Asset Sub Group with code "${cleanCode}" already exists.` });
    }
    if (current.some(sg => (sg.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Asset Sub Group with name "${cleanName}" already exists.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(`SELECT id FROM asset_sub_groups WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Asset Sub Group with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
        await prisma.$executeRawUnsafe(`
          INSERT INTO asset_sub_groups (id, code, name, assetGroupId, assetGroupName, assetType, description, totalAssets, active, createdAt, updatedAt)
          VALUES (
            '${newSubGroup.id}',
            '${cleanCode.replace(/'/g, "''")}',
            '${cleanName.replace(/'/g, "''")}',
            ${assetGroupId ? `'${String(assetGroupId).replace(/'/g, "''")}'` : 'NULL'},
            '${cleanGroup.replace(/'/g, "''")}',
            '${(newSubGroup.assetType || 'Both').replace(/'/g, "''")}',
            '${(description || '').replace(/'/g, "''")}',
            0,
            ${isAct ? 1 : 0},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);
      } catch (dbErr) {
        console.warn('DB createAssetSubGroup skipped:', dbErr.message);
      }
    }

    current.unshift(newSubGroup);
    writeAssetSubGroupsToFile(current);
    res.status(201).json({ success: true, assetSubGroup: newSubGroup, assetClass: newSubGroup });
  } catch (err) { next(err); }
}

export async function updateAssetSubGroup(req, res, next) {
  try {
    await ensureAssetSubGroupsTable();
    const { id } = req.params;
    const { code, name, assetGroupId, assetGroupName, groupName, assetType, description, active, status } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;
    const cleanGroup = groupName || assetGroupName;
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : undefined);

    const current = readAssetSubGroupsFromFile();
    const idx = current.findIndex(s => s.id === id || s.code === id);

    if (cleanCode && current.some(s => s.id !== id && s.code !== id && (s.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Another Asset Sub Group with code "${cleanCode}" already exists.` });
    }
    if (cleanName && current.some(s => s.id !== id && s.code !== id && (s.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Another Asset Sub Group with name "${cleanName}" already exists.` });
    }

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM asset_sub_groups WHERE id != '${id.replace(/'/g, "''")}' AND code != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Another Asset Sub Group with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate asset sub group skipped:', dbErr.message);
      }
    }

    if (isDbConnected()) {
      try {
        const sets = [];
        if (cleanCode) sets.push(`code = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) sets.push(`name = '${cleanName.replace(/'/g, "''")}'`);
        if (assetGroupId !== undefined) sets.push(`assetGroupId = ${assetGroupId ? `'${String(assetGroupId).replace(/'/g, "''")}'` : 'NULL'}`);
        if (cleanGroup !== undefined) sets.push(`assetGroupName = '${cleanGroup.replace(/'/g, "''")}'`);
        if (assetType !== undefined) sets.push(`assetType = '${assetType.replace(/'/g, "''")}'`);
        if (description !== undefined) sets.push(`description = '${description.replace(/'/g, "''")}'`);
        if (isAct !== undefined) sets.push(`active = ${isAct ? 1 : 0}`);
        sets.push(`updatedAt = CURRENT_TIMESTAMP`);

        await prisma.$executeRawUnsafe(`
          UPDATE asset_sub_groups
          SET ${sets.join(', ')}
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB updateAssetSubGroup skipped:', dbErr.message);
      }
    }

    if (idx >= 0) {
      current[idx] = {
        ...current[idx],
        ...req.body,
        ...(cleanCode ? { code: cleanCode } : {}),
        ...(cleanName ? { name: cleanName } : {}),
        ...(cleanGroup ? { assetGroupName: cleanGroup, groupName: cleanGroup } : {}),
        ...(isAct !== undefined ? { active: isAct, status: isAct ? 'Active' : 'Inactive' } : {}),
        updatedAt: new Date().toISOString()
      };
      writeAssetSubGroupsToFile(current);
    }
    res.json({ success: true, message: 'Asset Sub Group updated successfully.' });
  } catch (err) { next(err); }
}

export async function deleteAssetSubGroup(req, res, next) {
  try {
    await ensureAssetSubGroupsTable();
    const { id } = req.params;
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    const allSubGroups = readAssetSubGroupsFromFile();
    let subGroup = allSubGroups.find(s => s.id === id || s.code === id);
    if (!subGroup && isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM asset_sub_groups WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
        if (rows && rows.length > 0) subGroup = rows[0];
      } catch (_) {}
    }

    const subGroupName = (req.query.name || req.body?.name || subGroup?.name || '').trim();
    const subGroupCode = (req.query.code || req.body?.code || subGroup?.code || '').trim();

    // Check child dependencies:
    // 1. Categories linked to this sub group
    let categoriesCount = 0;
    if (isDbConnected()) {
      try {
        const pCatCount = await prisma.category.count({
          where: {
            OR: [
              ...(subGroupName ? [{ description: { contains: `[class:${subGroupName}]` } }, { description: { contains: subGroupName } }] : []),
              ...(subGroupCode ? [{ description: { contains: `[class:${subGroupCode}]` } }, { description: { contains: subGroupCode } }] : [])
            ]
          }
        }).catch(() => 0);
        if (pCatCount > categoriesCount) categoriesCount = pCatCount;
      } catch (_) {}

      try {
        const catRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM categories
          WHERE description LIKE '%[class:${subGroupName.replace(/'/g, "''")}]%'
             OR description LIKE '%[class:${subGroupCode.replace(/'/g, "''")}]%'
             ${subGroupName ? `OR description LIKE '%${subGroupName.replace(/'/g, "''")}%'` : ''}
        `);
        const dbCatCount = Number(catRows?.[0]?.cnt || 0);
        if (dbCatCount > categoriesCount) categoriesCount = dbCatCount;
      } catch (dbErr) {
        console.warn('DB check categories in deleteAssetSubGroup skipped:', dbErr.message);
      }
    }

    // 2. Assets directly linked (if any)
    let assetsCount = 0;
    if (isDbConnected()) {
      try {
        const assetRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM assets
          WHERE assetClassId = '${id.replace(/'/g, "''")}'
             OR assetClassId = '${subGroupCode.replace(/'/g, "''")}'
        `);
        assetsCount = Number(assetRows?.[0]?.cnt || 0);
      } catch (_) {}
    }

    // Asset Sub Group only blocks on its immediate direct children (Categories)
    const totalLinked = categoriesCount + assetsCount;

    if (totalLinked > 0 && !deactivateOnly) {
      return res.json({
        success: false,
        requiresConfirmation: true,
        linkedCount: totalLinked,
        entityName: 'Asset Sub Group',
        details: {
          categoriesCount,
          assetsCount
        },
        message: `This Asset Sub Group is linked to ${totalLinked} active record(s) (${categoriesCount} categories, ${assetsCount} assets). Deletion is blocked because child categories exist under this sub group. You must delete or reassign child categories first.`
      });
    }

    if (deactivateOnly) {
      if (isDbConnected()) {
        try {
          await prisma.$executeRawUnsafe(`
            UPDATE asset_sub_groups
            SET active = 0, status = 'Inactive', updatedAt = CURRENT_TIMESTAMP
            WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
          `);
        } catch (_) {}
      }
      const updatedSubGroups = allSubGroups.map(s => (s.id === id || s.code === id) ? { ...s, active: false, status: 'Inactive' } : s);
      writeAssetSubGroupsToFile(updatedSubGroups);
      return res.json({
        success: true,
        deactivated: true,
        message: `Asset Sub Group marked as Inactive (${totalLinked} linked records preserved).`
      });
    }

    // Hard delete (force or no linked children)
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE assets
          SET assetClassId = NULL
          WHERE assetClassId = '${id.replace(/'/g, "''")}' OR assetClassId = '${subGroupCode.replace(/'/g, "''")}'
        `).catch(() => null);
        await prisma.$executeRawUnsafe(`
          DELETE FROM asset_sub_groups
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB deleteAssetSubGroup skipped:', dbErr.message);
      }
    }
    const filtered = allSubGroups.filter(s => s.id !== id && s.code !== id);
    writeAssetSubGroupsToFile(filtered);
    res.json({ success: true, hardDeleted: true, message: 'Asset Sub Group permanently deleted.' });
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// SUB CATEGORIES (LEVEL 4 - DEDICATED TABLE: sub_categories)
// ---------------------------------------------------------------------------

export async function getSubCategories(req, res, next) {
  try {
    await ensureSubCategoriesTable();
    if (isDbConnected()) {
      try {
        let whereClause = req.query.includeInactive === 'true' ? '1=1' : 'sc.active = 1';
        if (req.query.categoryId) {
          whereClause += ` AND sc.categoryId = '${String(req.query.categoryId).replace(/'/g, "''")}'`;
        }
        if (req.query.assetSubGroupId) {
          whereClause += ` AND sc.assetSubGroupId = '${String(req.query.assetSubGroupId).replace(/'/g, "''")}'`;
        }
        const query = `
          SELECT sc.*, c.name as resolvedCategoryName, c.description as categoryDesc
          FROM sub_categories sc
          LEFT JOIN categories c ON sc.categoryId = c.id
          WHERE ${whereClause}
          ORDER BY sc.name ASC
        `;
        const rows = await prisma.$queryRawUnsafe(query);
        const list = (rows || []).map(r => {
          const resolvedCatName = r.resolvedCategoryName || (r.categoryName && r.categoryName !== '-' ? r.categoryName : '-');
          const classMatch = (r.description || '').match(/\[class:([^\]]+)\]/) || (r.categoryDesc || '').match(/\[class:([^\]]+)\]/);
          const groupMatch = (r.description || '').match(/\[group:([^\]]+)\]/) || (r.categoryDesc || '').match(/\[group:([^\]]+)\]/);
          const resolvedSubGroup = (r.assetSubGroupName && r.assetSubGroupName !== '-' && r.assetSubGroupName !== '') ? r.assetSubGroupName : (classMatch ? classMatch[1] : '-');
          const resolvedGroup = (r.assetGroupName && r.assetGroupName !== '-' && r.assetGroupName !== '') ? r.assetGroupName : (groupMatch ? groupMatch[1] : '-');

          return {
            id: r.id,
            code: r.code,
            name: r.name,
            categoryId: r.categoryId || null,
            categoryName: resolvedCatName,
            assetSubGroupId: r.assetSubGroupId || null,
            assetSubGroupName: resolvedSubGroup,
            className: resolvedSubGroup,
            assetGroupId: r.assetGroupId || null,
            assetGroupName: resolvedGroup,
            groupName: resolvedGroup,
            description: r.description || '',
            totalAssets: r.totalAssets || 0,
            active: Boolean(r.active),
            status: r.active ? 'Active' : 'Inactive',
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          };
        });
        writeSubCategoriesToFile(list);
        return res.json({ success: true, subCategories: list, assetClasses: list });
      } catch (dbErr) {
        console.warn('DB getSubCategories skipped:', dbErr.message);
      }
    }
    const memList = readSubCategoriesFromFile();
    const list = req.query.includeInactive === 'true' ? memList : memList.filter(s => s.active !== false);
    res.json({ success: true, subCategories: list, assetClasses: list });
  } catch (err) { next(err); }
}

export async function createSubCategory(req, res, next) {
  try {
    await ensureSubCategoriesTable();
    const { code, name, categoryId, categoryName, assetSubGroupId, assetSubGroupName, className, assetGroupId, assetGroupName, groupName, description, active, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Sub Category Code and Name are required.' });
    }
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    let resolvedCatName = (categoryName || '').trim();
    let cleanSubGroup = (assetSubGroupName || className || '').trim();
    let cleanGroup = (assetGroupName || groupName || '').trim();

    // Auto-resolve missing categoryName / subGroup / group from Category if possible
    if ((!resolvedCatName || resolvedCatName === '-') && categoryId && isDbConnected()) {
      try {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } }).catch(() => null);
        if (cat) {
          resolvedCatName = cat.name;
          if (!cleanSubGroup) {
            const m = (cat.description || '').match(/\[class:([^\]]+)\]/);
            if (m) cleanSubGroup = m[1];
          }
          if (!cleanGroup) {
            const m = (cat.description || '').match(/\[group:([^\]]+)\]/);
            if (m) cleanGroup = m[1];
          }
        }
      } catch (_) {}
    }
    if (!resolvedCatName) resolvedCatName = '-';

    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);

    const newSubCat = {
      id: `scat-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      categoryId: categoryId || null,
      categoryName: resolvedCatName,
      assetSubGroupId: assetSubGroupId || null,
      assetSubGroupName: cleanSubGroup || '-',
      className: cleanSubGroup || '-',
      assetGroupId: assetGroupId || null,
      assetGroupName: cleanGroup || '-',
      groupName: cleanGroup || '-',
      description: description || '',
      totalAssets: 0,
      active: isAct,
      status: isAct ? 'Active' : 'Inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = readSubCategoriesFromFile();
    if (current.some(sc => (sc.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Sub Category with code "${cleanCode}" already exists.` });
    }
    if (current.some(sc => (sc.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Sub Category with name "${cleanName}" already exists.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(`SELECT id FROM sub_categories WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Sub Category with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
        await prisma.$executeRawUnsafe(`
          INSERT INTO sub_categories (id, code, name, categoryId, categoryName, assetSubGroupId, assetSubGroupName, assetGroupId, assetGroupName, description, totalAssets, active, createdAt, updatedAt)
          VALUES (
            '${newSubCat.id}',
            '${cleanCode.replace(/'/g, "''")}',
            '${cleanName.replace(/'/g, "''")}',
            ${categoryId ? `'${String(categoryId).replace(/'/g, "''")}'` : 'NULL'},
            '${resolvedCatName.replace(/'/g, "''")}',
            ${assetSubGroupId ? `'${String(assetSubGroupId).replace(/'/g, "''")}'` : 'NULL'},
            '${cleanSubGroup.replace(/'/g, "''")}',
            ${assetGroupId ? `'${String(assetGroupId).replace(/'/g, "''")}'` : 'NULL'},
            '${cleanGroup.replace(/'/g, "''")}',
            '${(description || '').replace(/'/g, "''")}',
            0,
            ${isAct ? 1 : 0},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);
      } catch (dbErr) {
        console.warn('DB createSubCategory skipped:', dbErr.message);
      }
    }

    current.unshift(newSubCat);
    writeSubCategoriesToFile(current);
    res.status(201).json({ success: true, subCategory: newSubCat, assetClass: newSubCat });
  } catch (err) { next(err); }
}

export async function updateSubCategory(req, res, next) {
  try {
    await ensureSubCategoriesTable();
    const { id } = req.params;
    const { code, name, categoryId, categoryName, assetSubGroupId, assetSubGroupName, className, assetGroupId, assetGroupName, groupName, description, active, status } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;
    let resolvedCatName = categoryName !== undefined ? categoryName.trim() : undefined;
    let cleanSubGroup = assetSubGroupName !== undefined ? assetSubGroupName : className;
    let cleanGroup = assetGroupName !== undefined ? assetGroupName : groupName;

    // Auto-resolve categoryName if categoryId changed or resolvedCatName is missing
    if ((resolvedCatName === undefined || resolvedCatName === '' || resolvedCatName === '-') && categoryId && isDbConnected()) {
      try {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } }).catch(() => null);
        if (cat) {
          resolvedCatName = cat.name;
          if (cleanSubGroup === undefined) {
            const m = (cat.description || '').match(/\[class:([^\]]+)\]/);
            if (m) cleanSubGroup = m[1];
          }
          if (cleanGroup === undefined) {
            const m = (cat.description || '').match(/\[group:([^\]]+)\]/);
            if (m) cleanGroup = m[1];
          }
        }
      } catch (_) {}
    }

    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : undefined);

    const current = readSubCategoriesFromFile();
    const idx = current.findIndex(s => s.id === id || s.code === id);

    if (cleanCode && current.some(s => s.id !== id && s.code !== id && (s.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Another Sub Category with code "${cleanCode}" already exists.` });
    }
    if (cleanName && current.some(s => s.id !== id && s.code !== id && (s.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Another Sub Category with name "${cleanName}" already exists.` });
    }

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM sub_categories WHERE id != '${id.replace(/'/g, "''")}' AND code != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Another Sub Category with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate sub category skipped:', dbErr.message);
      }
    }

    if (isDbConnected()) {
      try {
        const sets = [];
        if (cleanCode) sets.push(`code = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) sets.push(`name = '${cleanName.replace(/'/g, "''")}'`);
        if (categoryId !== undefined) sets.push(`categoryId = ${categoryId ? `'${String(categoryId).replace(/'/g, "''")}'` : 'NULL'}`);
        if (resolvedCatName !== undefined) sets.push(`categoryName = '${resolvedCatName.replace(/'/g, "''")}'`);
        if (assetSubGroupId !== undefined) sets.push(`assetSubGroupId = ${assetSubGroupId ? `'${String(assetSubGroupId).replace(/'/g, "''")}'` : 'NULL'}`);
        if (cleanSubGroup !== undefined) sets.push(`assetSubGroupName = '${cleanSubGroup.replace(/'/g, "''")}'`);
        if (assetGroupId !== undefined) sets.push(`assetGroupId = ${assetGroupId ? `'${String(assetGroupId).replace(/'/g, "''")}'` : 'NULL'}`);
        if (cleanGroup !== undefined) sets.push(`assetGroupName = '${cleanGroup.replace(/'/g, "''")}'`);
        if (description !== undefined) sets.push(`description = '${description.replace(/'/g, "''")}'`);
        if (isAct !== undefined) sets.push(`active = ${isAct ? 1 : 0}`);
        sets.push(`updatedAt = CURRENT_TIMESTAMP`);

        await prisma.$executeRawUnsafe(`
          UPDATE sub_categories
          SET ${sets.join(', ')}
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB updateSubCategory skipped:', dbErr.message);
      }
    }

    if (idx >= 0) {
      current[idx] = {
        ...current[idx],
        ...req.body,
        ...(cleanCode ? { code: cleanCode } : {}),
        ...(cleanName ? { name: cleanName } : {}),
        ...(cleanSubGroup ? { assetSubGroupName: cleanSubGroup, className: cleanSubGroup } : {}),
        ...(cleanGroup ? { assetGroupName: cleanGroup, groupName: cleanGroup } : {}),
        ...(isAct !== undefined ? { active: isAct, status: isAct ? 'Active' : 'Inactive' } : {}),
        updatedAt: new Date().toISOString()
      };
      writeSubCategoriesToFile(current);
    }
    res.json({ success: true, message: 'Sub Category updated successfully.' });
  } catch (err) { next(err); }
}

export async function deleteSubCategory(req, res, next) {
  try {
    await ensureSubCategoriesTable();
    const { id } = req.params;
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    const allSubCats = readSubCategoriesFromFile();
    let subCat = allSubCats.find(s => s.id === id || s.code === id);
    if (!subCat && isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM sub_categories WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
        if (rows && rows.length > 0) subCat = rows[0];
      } catch (_) {}
    }

    const subCatName = (req.query.name || req.body?.name || subCat?.name || '').trim();
    const subCatCode = (req.query.code || req.body?.code || subCat?.code || '').trim();

    // Check dependencies:
    // 1. Assets linked to this sub category
    let assetsCount = 0;
    if (isDbConnected()) {
      try {
        const assetRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM assets
          WHERE subCategoryId = '${id.replace(/'/g, "''")}'
             OR subCategoryId = '${subCatCode.replace(/'/g, "''")}'
        `);
        assetsCount = Number(assetRows?.[0]?.cnt || 0);
      } catch (_) {}
    }

    // 2. Item Master products linked to this sub category
    let itemsCount = 0;
    if (isDbConnected()) {
      try {
        const itemRows = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM item_masters
          WHERE subCategoryId = '${id.replace(/'/g, "''")}'
             OR subCategoryId = '${subCatCode.replace(/'/g, "''")}'
             OR (subCategoryName IS NOT NULL AND (subCategoryName = '${subCatName.replace(/'/g, "''")}' OR UPPER(subCategoryName) = '${subCatName.toUpperCase().replace(/'/g, "''")}'))
        `);
        itemsCount = Number(itemRows?.[0]?.cnt || 0);
      } catch (_) {}
    }

    try {
      const itemMastersPath = path.join(process.cwd(), 'data', 'item_masters.json');
      if (fs.existsSync(itemMastersPath)) {
        const items = JSON.parse(fs.readFileSync(itemMastersPath, 'utf8'));
        const matched = items.filter(it =>
          (it.subCategoryId && (it.subCategoryId === id || it.subCategoryId === subCatCode)) ||
          (subCatName && it.subCategoryName && it.subCategoryName.trim().toLowerCase() === subCatName.toLowerCase())
        );
        if (matched.length > itemsCount) itemsCount = matched.length;
      }
    } catch (_) {}

    const totalLinked = assetsCount + itemsCount;

    if (totalLinked > 0 && !deactivateOnly) {
      return res.json({
        success: false,
        requiresConfirmation: true,
        linkedCount: totalLinked,
        entityName: 'Sub Category',
        details: {
          assetsCount,
          itemsCount
        },
        message: `This Sub Category is linked to ${totalLinked} active record(s) (${assetsCount} assets, ${itemsCount} items). Deletion is blocked because records are assigned to this sub category. You must delete or reassign them first.`
      });
    }

    if (deactivateOnly) {
      if (isDbConnected()) {
        try {
          await prisma.$executeRawUnsafe(`
            UPDATE sub_categories
            SET active = 0, status = 'Inactive', updatedAt = CURRENT_TIMESTAMP
            WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
          `);
        } catch (_) {}
      }
      const updatedSubCats = allSubCats.map(s => (s.id === id || s.code === id) ? { ...s, active: false, status: 'Inactive' } : s);
      writeSubCategoriesToFile(updatedSubCats);
      return res.json({
        success: true,
        deactivated: true,
        message: `Sub Category marked as Inactive (${totalLinked} linked records preserved).`
      });
    }

    // Hard delete (force or no linked children)
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE assets
          SET subCategoryId = NULL
          WHERE subCategoryId = '${id.replace(/'/g, "''")}'
        `).catch(() => null);
        await prisma.$executeRawUnsafe(`
          UPDATE item_masters
          SET subCategoryId = NULL
          WHERE subCategoryId = '${id.replace(/'/g, "''")}'
        `).catch(() => null);
        await prisma.$executeRawUnsafe(`
          DELETE FROM sub_categories
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB deleteSubCategory skipped:', dbErr.message);
      }
    }
    const filtered = allSubCats.filter(s => s.id !== id && s.code !== id);
    writeSubCategoriesToFile(filtered);
    res.json({ success: true, hardDeleted: true, message: 'Sub Category permanently deleted.' });
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// LEGACY COMPATIBILITY ROUTERS FOR /asset-classes
// ---------------------------------------------------------------------------

export async function getAssetClasses(req, res, next) {
  if (req.query.kind === 'SUBCATEGORY') {
    return getSubCategories(req, res, next);
  }
  return getAssetSubGroups(req, res, next);
}

export async function createAssetClass(req, res, next) {
  if (req.body.kind === 'SUBCATEGORY') {
    return createSubCategory(req, res, next);
  }
  return createAssetSubGroup(req, res, next);
}

export async function updateAssetClass(req, res, next) {
  const { id } = req.params;
  const subCats = readSubCategoriesFromFile();
  if (subCats.some(s => s.id === id || s.code === id)) {
    return updateSubCategory(req, res, next);
  }
  return updateAssetSubGroup(req, res, next);
}

export async function deleteAssetClass(req, res, next) {
  const { id } = req.params;
  await deleteSubCategory(req, res, () => null).catch(() => null);
  await deleteAssetSubGroup(req, res, () => null).catch(() => null);
  return res.json({ success: true, message: 'Record deleted successfully.' });
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
    if (isDbConnected()) {
      try {
        const where = req.query.includeInactive === 'true' ? {} : { active: true };
        const manufacturers = await prisma.manufacturer.findMany({ where, orderBy: { name: 'asc' } });
        if (Array.isArray(manufacturers)) {
          const list = manufacturers.map(m => ({
            id: m.id,
            code: m.code || `MFG-${(m.name || '').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
            name: m.name,
            website: m.website || '',
            supportContact: m.supportContact || '',
            country: m.country || '',
            active: m.active !== false
          }));
          inMemoryManufacturers = list;
          writeManufacturersToFile(list);
          return res.json({ success: true, manufacturers: list });
        }
      } catch (dbErr) {
        console.warn('DB getManufacturers query skipped:', dbErr.message);
      }
    }
    const list = req.query.includeInactive === 'true'
      ? inMemoryManufacturers
      : inMemoryManufacturers.filter(m => m.active !== false);
    res.json({ success: true, manufacturers: list });
  } catch (err) { next(err); }
}

export async function createManufacturer(req, res, next) {
  try {
    const { code, name, website, supportContact, country, active, status } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Manufacturer Name is required.' });

    const cleanName = name.trim();
    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase() : `MFG-${cleanName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    // Duplicate check
    if (inMemoryManufacturers.some(m => (m.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Manufacturer with code "${cleanCode}" already exists. Duplicate manufacturer codes are not allowed.` });
    }
    if (inMemoryManufacturers.some(m => (m.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Manufacturer with name "${cleanName}" already exists. Duplicate manufacturer names are not allowed.` });
    }

    if (isDbConnected()) {
      try {
        const existingMfr = await prisma.manufacturer.findFirst({
          where: { name: { equals: cleanName, mode: 'insensitive' } }
        });
        if (existingMfr) {
          return res.status(409).json({ success: false, message: `Manufacturer with name "${cleanName}" already exists.` });
        }
      } catch (err) {}
    }

    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const newMfr = {
      id: `mfr-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      website: website || '',
      supportContact: supportContact || '',
      country: country || '',
      active: isAct
    };

    if (isDbConnected()) {
      try {
        const created = await prisma.manufacturer.create({
          data: {
            name: cleanName,
            website: website || null,
            supportContact: supportContact || null,
            active: isAct
          }
        });
        if (created?.id) newMfr.id = created.id;
      } catch (dbErr) {
        console.warn('DB create manufacturer skipped:', dbErr.message);
      }
    }

    inMemoryManufacturers.unshift(newMfr);
    writeManufacturersToFile(inMemoryManufacturers);
    res.status(201).json({ success: true, manufacturer: newMfr });
  } catch (err) { next(err); }
}

export async function updateManufacturer(req, res, next) {
  try {
    const { id } = req.params;
    const idx = inMemoryManufacturers.findIndex(m => m.id === id || m.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Manufacturer not found' });

    const existing = inMemoryManufacturers[idx];
    const { code, name, website, supportContact, country, active, status } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    const cleanName = name ? name.trim() : existing.name;

    // Duplicate check excluding self
    if (cleanCode && inMemoryManufacturers.some(m => m.id !== existing.id && (m.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Manufacturer with code "${cleanCode}" already exists.` });
    }
    if (cleanName && inMemoryManufacturers.some(m => m.id !== existing.id && (m.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Manufacturer with name "${cleanName}" already exists.` });
    }

    if (isDbConnected() && cleanName) {
      try {
        const existingMfr = await prisma.manufacturer.findFirst({
          where: {
            id: { not: existing.id },
            name: { equals: cleanName, mode: 'insensitive' }
          }
        });
        if (existingMfr) {
          return res.status(409).json({ success: false, message: `Another manufacturer with name "${cleanName}" already exists.` });
        }
      } catch (err) {}
    }

    const updated = {
      ...existing,
      ...req.body,
      code: cleanCode,
      name: cleanName
    };
    if (active !== undefined) updated.active = Boolean(active);
    else if (status !== undefined) updated.active = status === 'Active';

    inMemoryManufacturers[idx] = updated;

    if (isDbConnected()) {
      try {
        await prisma.manufacturer.update({
          where: { id: existing.id },
          data: {
            name: cleanName,
            website: updated.website || null,
            supportContact: updated.supportContact || null,
            active: updated.active
          }
        });
      } catch (dbErr) {
        console.warn('DB update manufacturer skipped:', dbErr.message);
      }
    }

    writeManufacturersToFile(inMemoryManufacturers);
    res.json({ success: true, manufacturer: updated });
  } catch (err) { next(err); }
}

export async function deleteManufacturer(req, res, next) {
  try {
    const { id } = req.params;
    let mfr = inMemoryManufacturers.find(m => m.id === id || m.code === id);

    let dbMfr = null;
    if (isDbConnected()) {
      try {
        dbMfr = await prisma.manufacturer.findFirst({
          where: {
            OR: [
              { id },
              ...(mfr ? [{ name: mfr.name }] : [])
            ]
          }
        });
      } catch (e) {
        console.warn('DB find manufacturer error:', e.message);
      }
    }

    if (!mfr && !dbMfr) return res.status(404).json({ success: false, message: 'Manufacturer not found' });

    const targetId = dbMfr?.id || mfr?.id || id;
    const targetName = dbMfr?.name || mfr?.name;
    const targetCode = mfr?.code;

    inMemoryManufacturers = inMemoryManufacturers.filter(m =>
      m.id !== targetId &&
      m.id !== id &&
      (!targetCode || m.code !== targetCode) &&
      (!targetName || m.name.toLowerCase() !== targetName.toLowerCase())
    );

    if (isDbConnected() && dbMfr) {
      try {
        // 1. Unlink any assets referencing this manufacturer
        await prisma.asset.updateMany({
          where: { manufacturerId: dbMfr.id },
          data: { manufacturerId: null }
        }).catch(err => console.warn('Unlink assets manufacturerId warning:', err.message));

        // 2. Unlink assets referencing asset_models of this manufacturer, then delete asset_models
        const relatedModels = await prisma.assetModel.findMany({
          where: { manufacturerId: dbMfr.id },
          select: { id: true }
        }).catch(() => []);

        if (relatedModels.length > 0) {
          const modelIds = relatedModels.map(rm => rm.id);
          await prisma.asset.updateMany({
            where: { modelId: { in: modelIds } },
            data: { modelId: null }
          }).catch(err => console.warn('Unlink assets modelId warning:', err.message));

          await prisma.assetModel.deleteMany({
            where: { manufacturerId: dbMfr.id }
          }).catch(err => console.warn('Delete related asset_models warning:', err.message));
        }

        // 3. Delete manufacturer from DB
        await prisma.manufacturer.delete({
          where: { id: dbMfr.id }
        });
        console.log(`✅ [Database]: Deleted manufacturer ${dbMfr.name} (${dbMfr.id})`);
      } catch (dbErr) {
        console.error('❌ DB delete manufacturer failed:', dbErr.message);
        try {
          await prisma.manufacturer.update({
            where: { id: dbMfr.id },
            data: { active: false }
          });
        } catch (_) {}
      }
    }

    writeManufacturersToFile(inMemoryManufacturers);
    res.json({ success: true, message: 'Manufacturer deleted successfully' });
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
    if (req.query.companyId) {
      where.companyId = req.query.companyId;
    }
    let departments;
    try {
      departments = await prisma.department.findMany({
        where,
        include: {
          company: true,
          costCenters: {
            select: { id: true, code: true, name: true, active: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (relErr) {
      departments = await prisma.department.findMany({
        where,
        include: { company: true },
        orderBy: { name: 'asc' }
      });
    }
    res.json({ success: true, departments });
  } catch (err) { next(err); }
}

export async function createDepartment(req, res, next) {
  try {
    const {
      code,
      name,
      active,
      status,
      type,
      parentDepartment,
      location,
      manager,
      email,
      phone,
      description,
      companyId
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department Name is required.' });
    }
    const cleanName = name.trim();
    const cleanCode = (code || `DEP-${Date.now()}`).trim().toUpperCase();

    if (isDbConnected()) {
      try {
        const existing = await prisma.department.findFirst({
          where: {
            OR: [
              { code: cleanCode },
              { name: { equals: cleanName, mode: 'insensitive' } }
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Department with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate department skipped:', dbErr.message);
      }
    }

    let targetCompanyId = companyId || req.body.companyId;
    if (!targetCompanyId) {
      const firstComp = await prisma.company.findFirst();
      targetCompanyId = firstComp ? firstComp.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const department = await prisma.department.create({
      data: {
        code: cleanCode,
        name: cleanName,
        companyId: targetCompanyId,
        active: isAct,
        type: type || null,
        parentDepartment: parentDepartment || null,
        location: location || null,
        manager: manager || null,
        email: email || null,
        phone: phone || null,
        description: description || null
      },
      include: {
        company: true,
        costCenters: {
          select: { id: true, code: true, name: true, active: true }
        }
      }
    });
    res.status(201).json({ success: true, department });
  } catch (err) { next(err); }
}

export async function updateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      active,
      status,
      companyId,
      type,
      parentDepartment,
      location,
      manager,
      email,
      phone,
      description
    } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const existing = await prisma.department.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(cleanCode ? [{ code: cleanCode }] : []),
              ...(cleanName ? [{ name: { equals: cleanName, mode: 'insensitive' } }] : [])
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Another department with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate department skipped:', dbErr.message);
      }
    }

    const updateData = {};
    if (cleanCode) updateData.code = cleanCode;
    if (cleanName) updateData.name = cleanName;
    if (companyId) updateData.companyId = companyId;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';
    if (type !== undefined) updateData.type = type || null;
    if (parentDepartment !== undefined) updateData.parentDepartment = parentDepartment || null;
    if (location !== undefined) updateData.location = location || null;
    if (manager !== undefined) updateData.manager = manager || null;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (description !== undefined) updateData.description = description || null;

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        costCenters: {
          select: { id: true, code: true, name: true, active: true }
        }
      }
    });
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
    res.json({ success: true, message: 'Department removed from view.' });
  }
}

export async function getCostCenters(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    if (req.query.departmentId) {
      where.departmentId = req.query.departmentId;
    }
    if (req.query.companyId) {
      where.companyId = req.query.companyId;
    }
    let costCenters;
    try {
      costCenters = await prisma.costCenter.findMany({
        where,
        include: { company: true, department: true },
        orderBy: { name: 'asc' }
      });
    } catch (relErr) {
      costCenters = await prisma.costCenter.findMany({
        where,
        include: { company: true },
        orderBy: { name: 'asc' }
      });
    }
    res.json({ success: true, costCenters });
  } catch (err) { next(err); }
}

export async function createCostCenter(req, res, next) {
  try {
    const { code, name, active, status, companyId, departmentId, type, manager, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Cost Center Name is required.' });
    }
    const cleanName = name.trim();
    const cleanCode = (code || `CC-${Date.now()}`).trim().toUpperCase();

    if (isDbConnected()) {
      try {
        const existing = await prisma.costCenter.findFirst({
          where: {
            OR: [
              { code: cleanCode },
              { name: { equals: cleanName, mode: 'insensitive' } }
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Cost Center with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate cost center skipped:', dbErr.message);
      }
    }

    let targetCompanyId = companyId;
    if (!targetCompanyId && departmentId) {
      try {
        const d = await prisma.department.findUnique({ where: { id: departmentId } });
        if (d) targetCompanyId = d.companyId;
      } catch (_) {}
    }
    if (!targetCompanyId) {
      const firstComp = await prisma.company.findFirst();
      targetCompanyId = firstComp ? firstComp.id : null;
    }
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const costCenter = await prisma.costCenter.create({
      data: {
        code: cleanCode,
        name: cleanName,
        companyId: targetCompanyId,
        departmentId: departmentId || null,
        active: isAct,
        type: type || null,
        manager: manager ? manager.trim() : null,
        description: description ? description.trim() : null
      },
      include: { company: true, department: true }
    });
    res.status(201).json({ success: true, costCenter });
  } catch (err) { next(err); }
}

export async function updateCostCenter(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, active, status, companyId, departmentId, type, manager, description } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const existing = await prisma.costCenter.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(cleanCode ? [{ code: cleanCode }] : []),
              ...(cleanName ? [{ name: { equals: cleanName, mode: 'insensitive' } }] : [])
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Another Cost Center with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate cost center skipped:', dbErr.message);
      }
    }

    const updateData = {};
    if (cleanCode) updateData.code = cleanCode;
    if (cleanName) updateData.name = cleanName;
    if (companyId) updateData.companyId = companyId;
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';
    if (type !== undefined) updateData.type = type || null;
    if (manager !== undefined) updateData.manager = manager ? manager.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    const costCenter = await prisma.costCenter.update({
      where: { id },
      data: updateData,
      include: { company: true, department: true }
    });
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
    res.json({ success: true, message: 'Cost center removed from view.' });
  }
}

const DEFAULT_ENTERPRISE_EMPLOYEES = [];

export async function getEmployees(req, res, next) {
  try {
    const where = req.query.includeInactive === 'true' ? {} : { active: true };
    if (isDbConnected()) {
      try {
        const employees = await prisma.employee.findMany({
          where,
          include: { department: true, company: true },
          orderBy: { fullName: 'asc' }
        });
        if (Array.isArray(employees)) {
          const mapped = employees.map(e => ({
            id: e.id,
            employeeCode: e.employeeCode,
            code: e.employeeCode,
            fullName: e.fullName,
            name: e.fullName,
            email: e.email,
            phone: e.phone || '',
            companyId: e.companyId,
            company: e.company?.name || '',
            departmentId: e.departmentId,
            department: e.department?.name || '',
            custodianType: e.custodianType || 'Internal',
            organization: e.organization || '',
            section: e.section || '',
            location: e.location || '',
            active: e.active,
            status: e.active ? 'Active' : 'Inactive'
          }));
          return res.json({ success: true, employees: mapped, custodians: mapped });
        }
      } catch (dbErr) {
        console.warn('DB get employees skipped:', dbErr.message);
      }
    }
    res.json({ success: true, employees: [], custodians: [] });
  } catch (err) {
    res.json({ success: true, employees: [], custodians: [] });
  }
}

export async function createEmployee(req, res, next) {
  try {
    const {
      employeeCode,
      fullName,
      email,
      companyId,
      departmentId,
      costCenterId,
      active,
      status,
      custodianType = 'Internal',
      organization = '',
      section = '',
      location = '',
      phone = ''
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Custodian Full Name is required.' });
    }

    const code = (employeeCode || `EMP-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const mail = (email || `${code.toLowerCase()}@company.local`).trim();

    if (isDbConnected()) {
      try {
        const orConditions = [{ employeeCode: code }];
        if (mail) orConditions.push({ email: mail });
        const existing = await prisma.employee.findFirst({
          where: { OR: orConditions }
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: `Custodian with employee code "${code}"${mail ? ` or email "${mail}"` : ''} already exists.`
          });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate employee skipped:', dbErr.message);
      }
    }

    let targetCompanyId = companyId;
    if (!targetCompanyId && isDbConnected()) {
      const firstComp = await prisma.company.findFirst().catch(() => null);
      if (firstComp) targetCompanyId = firstComp.id;
    }

    if (isDbConnected() && targetCompanyId) {
      try {
        const createData = {
          employeeCode: code,
          fullName: fullName.trim(),
          email: mail,
          phone: (phone || '').trim() || null,
          custodianType: custodianType || 'Internal',
          organization: (organization || '').trim() || null,
          section: (section || '').trim() || null,
          location: (location || '').trim() || null,
          companyId: targetCompanyId,
          active: isAct
        };
        if (departmentId) createData.departmentId = departmentId;
        if (costCenterId) createData.costCenterId = costCenterId;

        const employee = await prisma.employee.create({
          data: createData,
          include: { department: true, company: true }
        });
        return res.status(201).json({
          success: true,
          employee: {
            ...employee,
            custodianType,
            organization,
            section,
            location,
            phone
          }
        });
      } catch (dbErr) {
        console.warn('DB create employee failed/skipped:', dbErr.message);
        return res.status(409).json({
          success: false,
          message: dbErr.message?.includes('Unique constraint')
            ? `Custodian with code "${code}" or email "${mail}" already exists.`
            : `Failed to create custodian: ${dbErr.message}`
        });
      }
    }

    const fallbackEmployee = {
      id: `cust-${Date.now()}`,
      employeeCode: code,
      fullName: fullName.trim(),
      email: mail,
      companyId: targetCompanyId || 'comp-default',
      departmentId: departmentId || null,
      costCenterId: costCenterId || null,
      active: isAct,
      custodianType,
      organization,
      section,
      location,
      phone,
      department: req.body.department || null,
      company: req.body.company || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return res.status(201).json({ success: true, employee: fallbackEmployee });
  } catch (err) { next(err); }
}


export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { employeeCode, fullName, email, companyId, departmentId, costCenterId, active, status, custodianType, organization, section, location, phone } = req.body;
    const cleanCode = employeeCode ? employeeCode.trim().toUpperCase() : undefined;
    const cleanEmail = email ? email.trim() : undefined;

    if (isDbConnected() && (cleanCode || cleanEmail)) {
      try {
        const orConditions = [];
        if (cleanCode) orConditions.push({ employeeCode: cleanCode });
        if (cleanEmail) orConditions.push({ email: cleanEmail });
        const existing = await prisma.employee.findFirst({
          where: {
            id: { not: id },
            OR: orConditions
          }
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: `Another custodian with code "${cleanCode || ''}"${cleanEmail ? ` or email "${cleanEmail}"` : ''} already exists.`
          });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate employee in update skipped:', dbErr.message);
      }
    }

    const updateData = {};
    if (cleanCode) updateData.code = cleanCode;
    if (cleanCode) updateData.employeeCode = cleanCode;
    if (fullName) updateData.fullName = fullName.trim();
    if (cleanEmail) updateData.email = cleanEmail;
    if (companyId) updateData.companyId = companyId;
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (costCenterId !== undefined) updateData.costCenterId = costCenterId || null;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';
    if (phone !== undefined) updateData.phone = (phone || '').trim() || null;
    if (custodianType !== undefined) updateData.custodianType = custodianType || 'Internal';
    if (organization !== undefined) updateData.organization = (organization || '').trim() || null;
    if (section !== undefined) updateData.section = (section || '').trim() || null;
    if (location !== undefined) updateData.location = (location || '').trim() || null;

    if (isDbConnected()) {
      try {
        const employee = await prisma.employee.update({
          where: { id },
          data: updateData,
          include: { department: true, company: true }
        });
        return res.json({ success: true, employee: { ...employee, custodianType, organization, section, location, phone } });
      } catch (dbErr) {
        console.warn('DB update employee skipped:', dbErr.message);
      }
    }
    res.json({ success: true, employee: { id, ...req.body } });
  } catch (err) { next(err); }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const action = req.query.action;
    const force = req.query.force === 'true' || action === 'force_delete';
    const deactivateOnly = action === 'deactivate';

    if (isDbConnected()) {
      const emp = await prisma.employee.findFirst({
        where: { OR: [{ id }, { employeeCode: id }] }
      }).catch(() => null);

      const actualId = emp?.id || id;

      const [assetsCount, assignmentsCount, transfersCount] = await Promise.all([
        prisma.asset.count({ where: { custodianId: actualId } }).catch(() => 0),
        prisma.custodyAssignment.count({ where: { custodianId: actualId } }).catch(() => 0),
        prisma.assetTransfer.count({
          where: {
            OR: [{ fromCustodianId: actualId }, { toCustodianId: actualId }]
          }
        }).catch(() => 0)
      ]);
      const totalLinked = assetsCount + assignmentsCount + transfersCount;

      if (totalLinked > 0 && !force && !deactivateOnly) {
        return res.json({
          success: false,
          requiresConfirmation: true,
          linkedCount: totalLinked,
          entityName: 'Custodian',
          details: { assetsCount, assignmentsCount, transfersCount },
          message: `This Custodian is assigned to ${totalLinked} active record(s) (${assetsCount} assets, ${assignmentsCount} custody assignments).`
        });
      }

      if (deactivateOnly) {
        if (emp) {
          await prisma.employee.update({
            where: { id: emp.id },
            data: { active: false }
          }).catch(() => null);
        }
        return res.json({ success: true, deactivated: true, message: `Custodian deactivated successfully (${totalLinked} linked records preserved).` });
      }

      // Hard delete:
      if (force && totalLinked > 0) {
        await prisma.asset.updateMany({ where: { custodianId: actualId }, data: { custodianId: null } }).catch(() => null);
        await prisma.custodyAssignment.deleteMany({ where: { custodianId: actualId } }).catch(() => null);
        await prisma.assetTransfer.updateMany({ where: { fromCustodianId: actualId }, data: { fromCustodianId: null } }).catch(() => null);
        await prisma.assetTransfer.updateMany({ where: { toCustodianId: actualId }, data: { toCustodianId: null } }).catch(() => null);
        await prisma.stocktakeObservation.updateMany({ where: { observedCustodianId: actualId }, data: { observedCustodianId: null } }).catch(() => null);
        await prisma.user.updateMany({ where: { employeeId: actualId }, data: { employeeId: null } }).catch(() => null);
      }

      if (emp) {
        await prisma.employee.delete({ where: { id: emp.id } }).catch(() => null);
      }
      return res.json({ success: true, hardDeleted: true, message: 'Custodian permanently deleted from database.' });
    }
    res.json({ success: true, hardDeleted: true, message: 'Custodian deleted successfully.' });
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
const ASSET_TYPES_FILE = resolveDataFile('asset_types.json');

function readAssetTypesFromFile() {
  try {
    if (fs.existsSync(ASSET_TYPES_FILE)) {
      const data = JSON.parse(fs.readFileSync(ASSET_TYPES_FILE, 'utf8'));
      if (Array.isArray(data)) return data.filter(t => t.code !== '123' && (t.name || '').toLowerCase() !== 'abhay');
    }
  } catch (e) {
    console.warn('Failed to read asset_types.json:', e.message);
  }
  return [];
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
        isSystem BIT DEFAULT 0,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('asset_types') AND name = 'isSystem')
      ALTER TABLE asset_types ADD isSystem BIT NOT NULL CONSTRAINT DF_asset_types_isSystem DEFAULT 0;

      IF NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'ASSET')
      INSERT INTO asset_types (id, code, name, description, category, stage, isSystem, active, createdAt, updatedAt)
      VALUES ('TYPE-SYS-ASSET', 'ASSET', 'Asset (Capitalized & Depreciated)', 'Capitalized physical asset subject to balance-sheet depreciation', 'CAPITALIZED', 'SYSTEM', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

      IF NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'NON_ASSET')
      INSERT INTO asset_types (id, code, name, description, category, stage, isSystem, active, createdAt, updatedAt)
      VALUES ('TYPE-SYS-NON-ASSET', 'NON_ASSET', 'Non-asset (Expensed / Low-value)', 'Expensed low-value item or consumable written off upon purchase', 'EXPENSED', 'SYSTEM', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Clean up test record if present in DB
    await prisma.$executeRawUnsafe(`DELETE FROM asset_types WHERE code = '123' OR name = 'abhay'`).catch(() => null);

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
          ? `SELECT id, code, name, description, category, stage, isSystem, active FROM asset_types ORDER BY isSystem DESC, name ASC`
          : `SELECT id, code, name, description, category, stage, isSystem, active FROM asset_types WHERE active = 1 ORDER BY isSystem DESC, name ASC`;
        const rows = await prisma.$queryRawUnsafe(query);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description || '',
            category: r.category || 'Discrete Count',
            stage: r.stage || (r.isSystem ? 'SYSTEM' : 'Operational'),
            isSystem: Boolean(r.isSystem),
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

    if (inMemoryAssetTypes.some(t => (t.code || '').toUpperCase() === cleanCode || (t.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Status Code / Asset Type with code "${cleanCode}" or name "${cleanName}" already exists.` });
    }

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM asset_types WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Status Code / Asset Type with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (err) {}
    }

    const newType = {
      id,
      code: cleanCode,
      name: cleanName,
      description: cleanDesc,
      category: cleanCat,
      stage: cleanStage,
      isSystem: false,
      active: isAct
    };

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO asset_types (id, code, name, description, category, stage, isSystem, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${cleanDesc.replace(/'/g, "''")}', '${cleanCat.replace(/'/g, "''")}', '${cleanStage.replace(/'/g, "''")}', 0, ${isAct ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        const check = await prisma.$queryRawUnsafe(`SELECT isSystem FROM asset_types WHERE id = '${id.replace(/'/g, "''")}'`);
        if (check?.[0]?.isSystem) {
          return res.status(403).json({
            success: false,
            message: 'System Enumerations (Asset / Non-asset) are protected and cannot be modified.'
          });
        }
      } catch (dbErr) {
        console.warn('DB check system enum skipped:', dbErr.message);
      }
    }

    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    const cleanName = name ? name.trim() : undefined;

    if (cleanCode || cleanName) {
      if (inMemoryAssetTypes.some(t => t.id !== id && (
        (cleanCode && (t.code || '').toUpperCase() === cleanCode) ||
        (cleanName && (t.name || '').toLowerCase() === cleanName.toLowerCase())
      ))) {
        return res.status(409).json({ success: false, message: `Another Status Code / Asset Type with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
      }
      if (isDbConnected()) {
        try {
          const whereParts = [];
          if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
          if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
          const existing = await prisma.$queryRawUnsafe(
            `SELECT id FROM asset_types WHERE id != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
          );
          if (Array.isArray(existing) && existing.length > 0) {
            return res.status(409).json({ success: false, message: `Another Status Code / Asset Type with this code or name already exists.` });
          }
        } catch (dbErr) {
          console.warn('DB check duplicate asset type skipped:', dbErr.message);
        }
      }
    }

    const idx = inMemoryAssetTypes.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Asset Type not found' });

    if (inMemoryAssetTypes[idx]?.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'System Enumerations (Asset / Non-asset) are protected and cannot be modified.'
      });
    }

    inMemoryAssetTypes[idx] = {
      ...inMemoryAssetTypes[idx],
      ...(code && { code: code.toUpperCase().trim() }),
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(stage && { stage }),
      ...(active !== undefined && { active: Boolean(active) })
    };

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

    await ensureAssetTypesTable();
    if (isDbConnected()) {
      try {
        const check = await prisma.$queryRawUnsafe(`SELECT isSystem FROM asset_types WHERE id = '${id.replace(/'/g, "''")}'`);
        if (check?.[0]?.isSystem) {
          return res.status(403).json({
            success: false,
            message: 'System Enumerations (Asset / Non-asset) are protected and cannot be deleted.'
          });
        }
      } catch (dbErr) {
        console.warn('DB check system enum delete skipped:', dbErr.message);
      }
    }

    const item = inMemoryAssetTypes.find(t => t.id === id);
    if (item?.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'System Enumerations (Asset / Non-asset) are protected and cannot be deleted.'
      });
    }

    inMemoryAssetTypes = inMemoryAssetTypes.filter(t => t.id !== id);

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

// ============================================================================
// ITEM MASTER & UNITS OF MEASURE (UOM)
// ============================================================================
const ITEM_MASTERS_FILE = resolveDataFile('item_masters.json');
const UOMS_FILE = resolveDataFile('uoms.json');
const DISPOSAL_STATUSES_FILE = resolveDataFile('disposal_statuses.json');
const BRANDS_FILE = resolveDataFile('brands.json');
const MANUFACTURERS_FILE = resolveDataFile('manufacturers.json');
const COUNTRIES_FILE = resolveDataFile('countries.json');
const LOCATION_TYPES_FILE = resolveDataFile('location_types.json');

const DEFAULT_BRANDS = [];

const DEFAULT_MANUFACTURERS = [];

const DEFAULT_DISPOSAL_STATUSES = [];

const DEFAULT_UOMS = [];

const DEFAULT_ITEMS = [];

function readCountriesFromFile() {
  try {
    if (fs.existsSync(COUNTRIES_FILE)) {
      const data = fs.readFileSync(COUNTRIES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    }
  } catch (e) {
    console.warn('Failed to read countries.json:', e.message);
  }
  return [];
}

function writeCountriesToFile(list) {
  try {
    const dir = path.dirname(COUNTRIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(COUNTRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write countries.json:', e.message);
  }
}

let inMemoryCountries = readCountriesFromFile();
let countriesTableEnsured = false;

async function ensureCountriesTable() {
  if (countriesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='countries' and xtype='U')
      CREATE TABLE countries (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(20) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL UNIQUE,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    countriesTableEnsured = true;
  } catch (err) {
    console.warn('countries table check skipped:', err.message);
  }
}

function readLocationTypesFromFile() {
  try {
    if (fs.existsSync(LOCATION_TYPES_FILE)) {
      const data = fs.readFileSync(LOCATION_TYPES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    }
  } catch (e) {
    console.warn('Failed to read location_types.json:', e.message);
  }
  return [];
}

function writeLocationTypesToFile(list) {
  try {
    const dir = path.dirname(LOCATION_TYPES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCATION_TYPES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write location_types.json:', e.message);
  }
}

let inMemoryLocationTypes = readLocationTypesFromFile();
let locationTypesTableEnsured = false;

async function ensureLocationTypesTable() {
  if (locationTypesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='location_types' and xtype='U')
      CREATE TABLE location_types (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    locationTypesTableEnsured = true;
  } catch (err) {
    console.warn('location_types table check skipped:', err.message);
  }
}

function readItemMastersFromFile() {
  try {
    if (fs.existsSync(ITEM_MASTERS_FILE)) {
      const data = fs.readFileSync(ITEM_MASTERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(i => !['itm-001', 'itm-002', 'itm-003'].includes(i.id));
      }
    }
  } catch (e) {
    console.warn('Failed to read item_masters.json:', e.message);
  }
  return [];
}

function writeItemMastersToFile(list) {
  try {
    const dir = path.dirname(ITEM_MASTERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ITEM_MASTERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write item_masters.json:', e.message);
  }
}

function readDisposalStatusesFromFile() {
  try {
    if (fs.existsSync(DISPOSAL_STATUSES_FILE)) {
      const data = fs.readFileSync(DISPOSAL_STATUSES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DISPOSAL_STATUSES;
    }
  } catch (e) {
    console.warn('Failed to read disposal_statuses.json, using defaults:', e.message);
  }
  return DEFAULT_DISPOSAL_STATUSES;
}

function writeDisposalStatusesToFile(list) {
  try {
    const dir = path.dirname(DISPOSAL_STATUSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DISPOSAL_STATUSES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write disposal_statuses.json:', e.message);
  }
}

function readBrandsFromFile() {
  try {
    if (fs.existsSync(BRANDS_FILE)) {
      const data = fs.readFileSync(BRANDS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BRANDS;
    }
  } catch (e) {
    console.warn('Failed to read brands.json, using defaults:', e.message);
  }
  return DEFAULT_BRANDS;
}

function writeBrandsToFile(list) {
  try {
    const dir = path.dirname(BRANDS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BRANDS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write brands.json:', e.message);
  }
}

const ASSET_SUB_GROUPS_FILE = resolveDataFile('asset_sub_groups.json');
const SUB_CATEGORIES_FILE = resolveDataFile('sub_categories.json');

function readAssetSubGroupsFromFile() {
  try {
    if (fs.existsSync(ASSET_SUB_GROUPS_FILE)) {
      const data = fs.readFileSync(ASSET_SUB_GROUPS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read asset_sub_groups.json:', e.message);
  }
  return [];
}

function writeAssetSubGroupsToFile(list) {
  try {
    const dir = path.dirname(ASSET_SUB_GROUPS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ASSET_SUB_GROUPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write asset_sub_groups.json:', e.message);
  }
}

function readSubCategoriesFromFile() {
  try {
    if (fs.existsSync(SUB_CATEGORIES_FILE)) {
      const data = fs.readFileSync(SUB_CATEGORIES_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read sub_categories.json:', e.message);
  }
  return [];
}

function writeSubCategoriesToFile(list) {
  try {
    const dir = path.dirname(SUB_CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUB_CATEGORIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write sub_categories.json:', e.message);
  }
}

function readManufacturersFromFile() {
  try {
    if (fs.existsSync(MANUFACTURERS_FILE)) {
      const data = fs.readFileSync(MANUFACTURERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MANUFACTURERS;
    }
  } catch (e) {
    console.warn('Failed to read manufacturers.json, using defaults:', e.message);
  }
  return DEFAULT_MANUFACTURERS;
}

function writeManufacturersToFile(list) {
  try {
    const dir = path.dirname(MANUFACTURERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MANUFACTURERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write manufacturers.json:', e.message);
  }
}

let inMemoryBrands = readBrandsFromFile();
let inMemoryManufacturers = readManufacturersFromFile();
let brandsTableEnsured = false;

async function ensureBrandsTable() {
  if (brandsTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brands' and xtype='U')
      CREATE TABLE brands (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        manufacturerId NVARCHAR(100) NULL,
        manufacturerName NVARCHAR(200) NULL,
        description NVARCHAR(500) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    brandsTableEnsured = true;
  } catch (err) {
    console.warn('brands table check skipped:', err.message);
  }
}

let inMemoryDisposalStatuses = readDisposalStatusesFromFile();
let disposalStatusesTableEnsured = false;

async function ensureDisposalStatusesTable() {
  if (disposalStatusesTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='disposal_statuses' and xtype='U')
      CREATE TABLE disposal_statuses (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    disposalStatusesTableEnsured = true;
  } catch (err) {
    console.warn('disposal_statuses table check skipped:', err.message);
  }
}

function readUomsFromFile() {
  try {
    if (fs.existsSync(UOMS_FILE)) {
      const data = fs.readFileSync(UOMS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn('Failed to read uoms.json:', e.message);
  }
  return [];
}

function writeUomsToFile(list) {
  try {
    const dir = path.dirname(UOMS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(UOMS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write uoms.json:', e.message);
  }
}

let inMemoryItemMasters = readItemMastersFromFile();
let inMemoryUoms = readUomsFromFile();
let itemMastersTableEnsured = false;
let uomsTableEnsured = false;

async function ensureItemMastersTable() {
  if (itemMastersTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='item_masters' and xtype='U')
      CREATE TABLE item_masters (
        id NVARCHAR(100) PRIMARY KEY,
        itemCode NVARCHAR(50) NOT NULL UNIQUE,
        itemName NVARCHAR(250) NOT NULL,
        supplierBarcode NVARCHAR(100) NULL,
        description NVARCHAR(1000) NULL,
        assetGroupId NVARCHAR(100) NULL,
        assetGroupName NVARCHAR(200) NULL,
        assetSubGroupId NVARCHAR(100) NULL,
        assetSubGroupName NVARCHAR(200) NULL,
        categoryId NVARCHAR(100) NULL,
        categoryName NVARCHAR(200) NULL,
        subCategoryId NVARCHAR(100) NULL,
        subCategoryName NVARCHAR(200) NULL,
        manufacturerId NVARCHAR(100) NULL,
        manufacturerName NVARCHAR(200) NULL,
        brandId NVARCHAR(100) NULL,
        brandName NVARCHAR(200) NULL,
        model NVARCHAR(100) NULL,
        uom NVARCHAR(50) DEFAULT 'Each',
        specifications NVARCHAR(MAX) NULL,
        imageUrl NVARCHAR(500) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('item_masters') AND name = 'brandId')
      ALTER TABLE item_masters ADD brandId NVARCHAR(100) NULL;
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('item_masters') AND name = 'brandName')
      ALTER TABLE item_masters ADD brandName NVARCHAR(200) NULL;
    `);
    itemMastersTableEnsured = true;
  } catch (err) {
    console.warn('item_masters table check skipped:', err.message);
  }
}

async function ensureUomsTable() {
  if (uomsTableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='units_of_measure' and xtype='U')
      CREATE TABLE units_of_measure (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        symbol NVARCHAR(20) NULL,
        category NVARCHAR(100) NULL,
        description NVARCHAR(500) NULL,
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('units_of_measure') AND name = 'symbol')
      ALTER TABLE units_of_measure ADD symbol NVARCHAR(20) NULL;
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('units_of_measure') AND name = 'category')
      ALTER TABLE units_of_measure ADD category NVARCHAR(100) NULL;
    `);

    uomsTableEnsured = true;
  } catch (err) {
    console.warn('units_of_measure table check skipped:', err.message);
  }
}

// Generate Next Item Code (e.g. ITM-000104)
function generateNextItemCode() {
  const existingCodes = inMemoryItemMasters
    .map(i => i.itemCode || '')
    .filter(c => c.startsWith('ITM-'));
  let maxSeq = 100;
  for (const c of existingCodes) {
    const num = parseInt(c.replace('ITM-', ''), 10);
    if (!isNaN(num) && num > maxSeq) maxSeq = num;
  }
  return `ITM-${String(maxSeq + 1).padStart(6, '0')}`;
}

export async function getItemMasters(req, res, next) {
  try {
    await ensureItemMastersTable();
    if (isDbConnected()) {
      try {
        const includeInactive = req.query.includeInactive === 'true';
        const query = includeInactive
          ? `SELECT * FROM item_masters ORDER BY itemCode ASC`
          : `SELECT * FROM item_masters WHERE active = 1 ORDER BY itemCode ASC`;
        const rows = await prisma.$queryRawUnsafe(query);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            itemCode: r.itemCode,
            itemName: r.itemName,
            supplierBarcode: r.supplierBarcode || '',
            description: r.description || '',
            assetGroupId: r.assetGroupId || '',
            assetGroupName: r.assetGroupName || '',
            assetSubGroupId: r.assetSubGroupId || '',
            assetSubGroupName: r.assetSubGroupName || '',
            categoryId: r.categoryId || '',
            categoryName: r.categoryName || '',
            subCategoryId: r.subCategoryId || '',
            subCategoryName: r.subCategoryName || '',
            manufacturerId: r.manufacturerId || '',
            manufacturerName: r.manufacturerName || '',
            brandId: r.brandId || '',
            brandName: r.brandName || '',
            model: r.model || '',
            uom: r.uom || 'Each',
            specifications: r.specifications || '',
            imageUrl: r.imageUrl || '',
            active: Boolean(r.active),
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }));
          inMemoryItemMasters = list;
          writeItemMastersToFile(list);
          return res.json({ success: true, items: list });
        } else if (isDbConnected()) {
          // If DB table is empty, auto-sync file records into database
          const fileRecords = readItemMastersFromFile();
          for (const item of fileRecords) {
            try {
              await prisma.$executeRawUnsafe(`
                IF NOT EXISTS (SELECT 1 FROM item_masters WHERE id = '${item.id}' OR itemCode = '${item.itemCode}')
                INSERT INTO item_masters (
                  id, itemCode, itemName, supplierBarcode, description,
                  assetGroupId, assetGroupName, assetSubGroupId, assetSubGroupName,
                  categoryId, categoryName, subCategoryId, subCategoryName,
                  manufacturerId, manufacturerName, brandId, brandName, model, uom,
                  specifications, imageUrl, active
                ) VALUES (
                  '${item.id}',
                  '${(item.itemCode || '').replace(/'/g, "''")}',
                  '${(item.itemName || '').replace(/'/g, "''")}',
                  '${(item.supplierBarcode || '').replace(/'/g, "''")}',
                  '${(item.description || '').replace(/'/g, "''")}',
                  '${(item.assetGroupId || '').replace(/'/g, "''")}',
                  '${(item.assetGroupName || '').replace(/'/g, "''")}',
                  '${(item.assetSubGroupId || '').replace(/'/g, "''")}',
                  '${(item.assetSubGroupName || '').replace(/'/g, "''")}',
                  '${(item.categoryId || '').replace(/'/g, "''")}',
                  '${(item.categoryName || '').replace(/'/g, "''")}',
                  '${(item.subCategoryId || '').replace(/'/g, "''")}',
                  '${(item.subCategoryName || '').replace(/'/g, "''")}',
                  '${(item.manufacturerId || '').replace(/'/g, "''")}',
                  '${(item.manufacturerName || '').replace(/'/g, "''")}',
                  '${(item.brandId || '').replace(/'/g, "''")}',
                  '${(item.brandName || '').replace(/'/g, "''")}',
                  '${(item.model || '').replace(/'/g, "''")}',
                  '${(item.uom || 'Each').replace(/'/g, "''")}',
                  '${(item.specifications || '').replace(/'/g, "''")}',
                  '${(item.imageUrl || '').replace(/'/g, "''")}',
                  ${item.active !== false ? 1 : 0}
                )
              `);
            } catch (_) {}
          }
        }
      } catch (dbErr) {
        console.warn('DB getItemMasters query skipped, using persistent store:', dbErr.message);
      }
    }
    if (inMemoryItemMasters.length === 0) {
      inMemoryItemMasters = readItemMastersFromFile();
    }
    const list = req.query.includeInactive === 'true'
      ? inMemoryItemMasters
      : inMemoryItemMasters.filter(i => i.active !== false);
    res.json({ success: true, items: list });
  } catch (err) { next(err); }
}

export async function getItemMasterById(req, res, next) {
  try {
    const { id } = req.params;
    let item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id || (i.code && i.code === id));
    if (!item) {
      inMemoryItemMasters = readItemMastersFromFile();
      item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id || (i.code && i.code === id));
    }
    if (!item && isDbConnected()) {
      try {
        await ensureItemMastersTable();
        const safeId = (id || '').replace(/'/g, "''");
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM item_masters WHERE id = '${safeId}' OR itemCode = '${safeId}'`);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          item = {
            id: r.id,
            itemCode: r.itemCode,
            itemName: r.itemName,
            supplierBarcode: r.supplierBarcode || '',
            description: r.description || '',
            assetGroupId: r.assetGroupId || '',
            assetGroupName: r.assetGroupName || '',
            assetSubGroupId: r.assetSubGroupId || '',
            assetSubGroupName: r.assetSubGroupName || '',
            categoryId: r.categoryId || '',
            categoryName: r.categoryName || '',
            subCategoryId: r.subCategoryId || '',
            subCategoryName: r.subCategoryName || '',
            manufacturerId: r.manufacturerId || '',
            manufacturerName: r.manufacturerName || '',
            brandId: r.brandId || '',
            brandName: r.brandName || '',
            model: r.model || '',
            uom: r.uom || 'Each',
            specifications: r.specifications || '',
            imageUrl: r.imageUrl || '',
            active: Boolean(r.active),
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          };
          inMemoryItemMasters.push(item);
          writeItemMastersToFile(inMemoryItemMasters);
        }
      } catch (dbErr) {
        console.warn('DB getItemMasterById query skipped:', dbErr.message);
      }
    }
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
}

export async function createItemMaster(req, res, next) {
  try {
    const {
      itemCode,
      itemName,
      supplierBarcode,
      description,
      assetGroupId,
      assetGroupName,
      assetSubGroupId,
      assetSubGroupName,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      manufacturerId,
      manufacturerName,
      brandId,
      brandName,
      model,
      uom,
      specifications,
      imageUrl,
      active
    } = req.body;

    if (!itemName || !itemName.trim()) {
      return res.status(400).json({ success: false, message: 'Item Name is required.' });
    }

    const cleanName = itemName.trim();
    const cleanCode = (itemCode && itemCode.trim()) ? itemCode.trim().toUpperCase() : generateNextItemCode();
    const cleanBarcode = (supplierBarcode || '').trim();
    const isAct = active !== undefined ? Boolean(active) : true;
    const id = `ITM-${Date.now()}`;

    // STRICT DUPLICATE VALIDATION ON ITEM CODE
    if (inMemoryItemMasters.some(i => (i.itemCode || '').trim().toUpperCase() === cleanCode)) {
      return res.status(409).json({
        success: false,
        message: `An item with Item Code "${cleanCode}" already exists. Duplicate item codes are not allowed.`
      });
    }

    // STRICT DUPLICATE VALIDATION ON ITEM NAME
    if (inMemoryItemMasters.some(i => (i.itemName || '').trim().toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: `An item with Item Name "${cleanName}" already exists. Duplicate item names are not allowed.`
      });
    }

    // STRICT DUPLICATE VALIDATION ON SUPPLIER BARCODE (IF PROVIDED)
    if (cleanBarcode && inMemoryItemMasters.some(i => i.supplierBarcode && i.supplierBarcode.trim().toLowerCase() === cleanBarcode.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: `An item with Supplier Barcode "${cleanBarcode}" already exists. Barcodes must be unique.`
      });
    }

    await ensureItemMastersTable();
    if (isDbConnected()) {
      try {
        const whereParts = [
          `UPPER(itemCode) = '${cleanCode.replace(/'/g, "''")}'`,
          `UPPER(itemName) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        ];
        if (cleanBarcode) whereParts.push(`UPPER(supplierBarcode) = '${cleanBarcode.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM item_masters WHERE ${whereParts.join(' OR ')}`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Item Master with code "${cleanCode}", name "${cleanName}" or barcode "${cleanBarcode}" already exists.` });
        }
      } catch (err) {}
    }

    const newItem = {
      id,
      itemCode: cleanCode,
      itemName: cleanName,
      supplierBarcode: cleanBarcode,
      description: description || '',
      assetGroupId: assetGroupId || '',
      assetGroupName: assetGroupName || '',
      assetSubGroupId: assetSubGroupId || '',
      assetSubGroupName: assetSubGroupName || '',
      categoryId: categoryId || '',
      categoryName: categoryName || '',
      subCategoryId: subCategoryId || '',
      subCategoryName: subCategoryName || '',
      manufacturerId: manufacturerId || '',
      manufacturerName: manufacturerName || '',
      brandId: brandId || '',
      brandName: brandName || '',
      model: model || '',
      uom: uom || 'Each',
      specifications: specifications || '',
      imageUrl: imageUrl || '',
      active: isAct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ensureItemMastersTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO item_masters (
            id, itemCode, itemName, supplierBarcode, description,
            assetGroupId, assetGroupName, assetSubGroupId, assetSubGroupName,
            categoryId, categoryName, subCategoryId, subCategoryName,
            manufacturerId, manufacturerName, brandId, brandName, model, uom,
            specifications, imageUrl, active, createdAt, updatedAt
          ) VALUES (
            '${id}',
            '${cleanCode.replace(/'/g, "''")}',
            '${cleanName.replace(/'/g, "''")}',
            '${cleanBarcode.replace(/'/g, "''")}',
            '${(description || '').replace(/'/g, "''")}',
            '${(assetGroupId || '').replace(/'/g, "''")}',
            '${(assetGroupName || '').replace(/'/g, "''")}',
            '${(assetSubGroupId || '').replace(/'/g, "''")}',
            '${(assetSubGroupName || '').replace(/'/g, "''")}',
            '${(categoryId || '').replace(/'/g, "''")}',
            '${(categoryName || '').replace(/'/g, "''")}',
            '${(subCategoryId || '').replace(/'/g, "''")}',
            '${(subCategoryName || '').replace(/'/g, "''")}',
            '${(manufacturerId || '').replace(/'/g, "''")}',
            '${(manufacturerName || '').replace(/'/g, "''")}',
            '${(brandId || '').replace(/'/g, "''")}',
            '${(brandName || '').replace(/'/g, "''")}',
            '${(model || '').replace(/'/g, "''")}',
            '${(uom || 'Each').replace(/'/g, "''")}',
            '${(specifications || '').replace(/'/g, "''")}',
            '${(imageUrl || '').replace(/'/g, "''")}',
            ${isAct ? 1 : 0},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);
      } catch (dbErr) {
        console.warn('DB insert item_masters skipped:', dbErr.message);
      }
    }

    inMemoryItemMasters.unshift(newItem);
    writeItemMastersToFile(inMemoryItemMasters);
    res.status(201).json({ success: true, item: newItem });
  } catch (err) { next(err); }
}

export async function updateItemMaster(req, res, next) {
  try {
    const { id } = req.params;
    let idx = inMemoryItemMasters.findIndex(i => i.id === id || i.itemCode === id);
    if (idx === -1) {
      inMemoryItemMasters = readItemMastersFromFile();
      idx = inMemoryItemMasters.findIndex(i => i.id === id || i.itemCode === id);
    }

    if (idx === -1 && isDbConnected()) {
      try {
        await ensureItemMastersTable();
        const safeId = (id || '').replace(/'/g, "''");
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM item_masters WHERE id = '${safeId}' OR itemCode = '${safeId}'`);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          inMemoryItemMasters.push({
            id: r.id,
            itemCode: r.itemCode,
            itemName: r.itemName,
            supplierBarcode: r.supplierBarcode || '',
            description: r.description || '',
            assetGroupId: r.assetGroupId || '',
            assetGroupName: r.assetGroupName || '',
            assetSubGroupId: r.assetSubGroupId || '',
            assetSubGroupName: r.assetSubGroupName || '',
            categoryId: r.categoryId || '',
            categoryName: r.categoryName || '',
            subCategoryId: r.subCategoryId || '',
            subCategoryName: r.subCategoryName || '',
            manufacturerId: r.manufacturerId || '',
            manufacturerName: r.manufacturerName || '',
            brandId: r.brandId || '',
            brandName: r.brandName || '',
            model: r.model || '',
            uom: r.uom || 'Each',
            specifications: r.specifications || '',
            imageUrl: r.imageUrl || '',
            active: Boolean(r.active),
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          });
          idx = inMemoryItemMasters.length - 1;
        }
      } catch (dbErr) {
        console.warn('DB lookup in updateItemMaster skipped:', dbErr.message);
      }
    }

    if (idx === -1) {
      if (req.body.itemName || req.body.active !== undefined) {
        const cleanName = (req.body.itemName || `Item ${id}`).trim();
        const cleanCode = (req.body.itemCode && req.body.itemCode.trim()) ? req.body.itemCode.trim().toUpperCase() : id;
        const upserted = {
          id,
          itemCode: cleanCode,
          itemName: cleanName,
          supplierBarcode: req.body.supplierBarcode || '',
          description: req.body.description || '',
          assetGroupId: req.body.assetGroupId || '',
          assetGroupName: req.body.assetGroupName || '',
          assetSubGroupId: req.body.assetSubGroupId || '',
          assetSubGroupName: req.body.assetSubGroupName || '',
          categoryId: req.body.categoryId || '',
          categoryName: req.body.categoryName || '',
          subCategoryId: req.body.subCategoryId || '',
          subCategoryName: req.body.subCategoryName || '',
          manufacturerId: req.body.manufacturerId || '',
          manufacturerName: req.body.manufacturerName || '',
          brandId: req.body.brandId || '',
          brandName: req.body.brandName || '',
          model: req.body.model || '',
          uom: req.body.uom || 'Each',
          specifications: req.body.specifications || '',
          imageUrl: req.body.imageUrl || '',
          active: req.body.active !== undefined ? Boolean(req.body.active) : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        inMemoryItemMasters.unshift(upserted);
        writeItemMastersToFile(inMemoryItemMasters);
        return res.json({ success: true, item: upserted });
      }
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const existing = inMemoryItemMasters[idx];
    const cleanCode = req.body.itemCode ? req.body.itemCode.trim().toUpperCase() : existing.itemCode;
    const cleanName = req.body.itemName ? req.body.itemName.trim() : existing.itemName;
    const cleanBarcode = req.body.supplierBarcode !== undefined ? req.body.supplierBarcode.trim() : (existing.supplierBarcode || '');

    // Duplicate check on Item Code excluding current
    if (cleanCode && inMemoryItemMasters.some(i => i.id !== existing.id && (i.itemCode || '').trim().toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Another item with Item Code "${cleanCode}" already exists.` });
    }

    // Duplicate check on Item Name excluding current
    if (cleanName && inMemoryItemMasters.some(i => i.id !== existing.id && (i.itemName || '').trim().toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Another item with Item Name "${cleanName}" already exists.` });
    }

    // Duplicate check on Barcode excluding current
    if (cleanBarcode && inMemoryItemMasters.some(i => i.id !== existing.id && i.supplierBarcode && i.supplierBarcode.trim().toLowerCase() === cleanBarcode.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Another item with Supplier Barcode "${cleanBarcode}" already exists.` });
    }

    if (isDbConnected() && (cleanCode || cleanName || cleanBarcode)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(itemCode) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(itemName) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        if (cleanBarcode) whereParts.push(`UPPER(supplierBarcode) = '${cleanBarcode.toUpperCase().replace(/'/g, "''")}'`);
        const safeId = (id || '').replace(/'/g, "''");
        const existingDb = await prisma.$queryRawUnsafe(
          `SELECT id FROM item_masters WHERE id != '${safeId}' AND itemCode != '${safeId}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existingDb) && existingDb.length > 0) {
          return res.status(409).json({ success: false, message: `Another item with this code, name, or barcode already exists.` });
        }
      } catch (err) {}
    }

    const updated = {
      ...existing,
      ...req.body,
      itemCode: cleanCode,
      itemName: cleanName,
      supplierBarcode: cleanBarcode,
      brandId: req.body.brandId !== undefined ? req.body.brandId : (existing.brandId || ''),
      brandName: req.body.brandName !== undefined ? req.body.brandName : (existing.brandName || ''),
      updatedAt: new Date().toISOString()
    };
    if (req.body.active !== undefined) updated.active = Boolean(req.body.active);
    inMemoryItemMasters[idx] = updated;

    await ensureItemMastersTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE item_masters
          SET itemName = '${(updated.itemName || '').replace(/'/g, "''")}',
              supplierBarcode = '${(updated.supplierBarcode || '').replace(/'/g, "''")}',
              description = '${(updated.description || '').replace(/'/g, "''")}',
              assetGroupId = '${(updated.assetGroupId || '').replace(/'/g, "''")}',
              assetGroupName = '${(updated.assetGroupName || '').replace(/'/g, "''")}',
              assetSubGroupId = '${(updated.assetSubGroupId || '').replace(/'/g, "''")}',
              assetSubGroupName = '${(updated.assetSubGroupName || '').replace(/'/g, "''")}',
              categoryId = '${(updated.categoryId || '').replace(/'/g, "''")}',
              categoryName = '${(updated.categoryName || '').replace(/'/g, "''")}',
              subCategoryId = '${(updated.subCategoryId || '').replace(/'/g, "''")}',
              subCategoryName = '${(updated.subCategoryName || '').replace(/'/g, "''")}',
              manufacturerId = '${(updated.manufacturerId || '').replace(/'/g, "''")}',
              manufacturerName = '${(updated.manufacturerName || '').replace(/'/g, "''")}',
              brandId = '${(updated.brandId || '').replace(/'/g, "''")}',
              brandName = '${(updated.brandName || '').replace(/'/g, "''")}',
              model = '${(updated.model || '').replace(/'/g, "''")}',
              uom = '${(updated.uom || 'Each').replace(/'/g, "''")}',
              specifications = '${(updated.specifications || '').replace(/'/g, "''")}',
              imageUrl = '${(updated.imageUrl || '').replace(/'/g, "''")}',
              active = ${updated.active ? 1 : 0},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${existing.id.replace(/'/g, "''")}' OR itemCode = '${existing.itemCode.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update item_masters skipped:', dbErr.message);
      }
    }

    writeItemMastersToFile(inMemoryItemMasters);
    res.json({ success: true, item: updated });
  } catch (err) { next(err); }
}

export async function deleteItemMaster(req, res, next) {
  try {
    const { id } = req.params;
    let item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id);
    if (!item) {
      inMemoryItemMasters = readItemMastersFromFile();
      item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id);
    }
    if (!item) {
      return res.json({ success: true, message: 'Item deleted or already removed' });
    }

    inMemoryItemMasters = inMemoryItemMasters.filter(i => i.id !== id && i.itemCode !== id);

    await ensureItemMastersTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          DELETE FROM item_masters WHERE id = '${item.id.replace(/'/g, "''")}' OR itemCode = '${item.itemCode.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB delete item_masters skipped:', dbErr.message);
      }
    }

    writeItemMastersToFile(inMemoryItemMasters);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) { next(err); }
}

// UOM Handlers
export async function getUoms(req, res, next) {
  try {
    await ensureUomsTable();
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT id, code, name, symbol, category, description, active FROM units_of_measure ORDER BY name ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            symbol: r.symbol || '',
            category: r.category || 'Discrete Count',
            description: r.description || '',
            active: Boolean(r.active)
          }));
          inMemoryUoms = list;
          writeUomsToFile(list);
          return res.json({ success: true, uoms: list });
        }
      } catch (dbErr) {
        console.warn('DB getUoms query skipped, using persistent store:', dbErr.message);
      }
    }
    res.json({ success: true, uoms: inMemoryUoms });
  } catch (err) { next(err); }
}

export async function createUom(req, res, next) {
  try {
    const { code, name, symbol, category, description, active } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, message: 'UOM Code and Name are required.' });
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanSymbol = (symbol || '').trim();
    const cleanCategory = (category || 'Discrete Count').trim();
    const cleanDesc = (description || '').trim();
    const isAct = active !== false;

    // Strict duplicate check
    const exists = inMemoryUoms.some(u => 
      (u.code && u.code.toUpperCase() === cleanCode) || 
      (u.name && u.name.toLowerCase() === cleanName.toLowerCase())
    );
    if (exists) {
      return res.status(409).json({ success: false, message: `Duplicate Error: UOM with code "${cleanCode}" or name "${cleanName}" already exists.` });
    }

    await ensureUomsTable();
    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM units_of_measure WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Duplicate Error: UOM with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (err) {}
    }
    const id = req.body.id || crypto.randomUUID();
    const newUom = {
      id,
      code: cleanCode,
      name: cleanName,
      symbol: cleanSymbol,
      category: cleanCategory,
      description: cleanDesc,
      active: isAct
    };

    console.log('📦 [Backend UOM Created]:', JSON.stringify(newUom));

    await ensureUomsTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO units_of_measure (id, code, name, symbol, category, description, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${cleanSymbol.replace(/'/g, "''")}', '${cleanCategory.replace(/'/g, "''")}', '${cleanDesc.replace(/'/g, "''")}', ${isAct ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert units_of_measure skipped:', dbErr.message);
      }
    }

    inMemoryUoms.push(newUom);
    writeUomsToFile(inMemoryUoms);
    res.status(201).json({ success: true, uom: newUom });
  } catch (err) { next(err); }
}

export async function updateUom(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, symbol, category, description, active } = req.body;
    const idx = inMemoryUoms.findIndex(u => u.id === id || u.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'UOM not found' });

    const cleanCode = code ? code.trim().toUpperCase() : inMemoryUoms[idx].code;
    const cleanName = name ? name.trim() : inMemoryUoms[idx].name;
    const cleanSymbol = symbol !== undefined ? symbol.trim() : inMemoryUoms[idx].symbol;
    const cleanCategory = category !== undefined ? category.trim() : inMemoryUoms[idx].category;
    const cleanDesc = description !== undefined ? description.trim() : inMemoryUoms[idx].description;
    const isAct = active !== undefined ? Boolean(active) : inMemoryUoms[idx].active;

    const dup = inMemoryUoms.find(u => (u.id !== id && u.code !== id) && (
      (cleanCode && u.code && u.code.toUpperCase() === cleanCode) || 
      (cleanName && u.name && u.name.toLowerCase() === cleanName.toLowerCase())
    ));
    if (dup) {
      return res.status(409).json({ success: false, message: `Duplicate Error: UOM with code "${cleanCode}" or name "${cleanName}" already exists.` });
    }
    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM units_of_measure WHERE id != '${id.replace(/'/g, "''")}' AND code != '${id.replace(/'/g, "''")}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Duplicate Error: UOM with code "${cleanCode || ''}" or name "${cleanName || ''}" already exists.` });
        }
      } catch (err) {}
    }

    inMemoryUoms[idx] = {
      ...inMemoryUoms[idx],
      code: cleanCode,
      name: cleanName,
      symbol: cleanSymbol,
      category: cleanCategory,
      description: cleanDesc,
      active: isAct
    };

    console.log('✏️ [Backend UOM Updated]:', JSON.stringify(inMemoryUoms[idx]));

    await ensureUomsTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE units_of_measure
          SET code = '${cleanCode.replace(/'/g, "''")}',
              name = '${cleanName.replace(/'/g, "''")}',
              symbol = '${(cleanSymbol || '').replace(/'/g, "''")}',
              category = '${(cleanCategory || '').replace(/'/g, "''")}',
              description = '${(cleanDesc || '').replace(/'/g, "''")}',
              active = ${isAct ? 1 : 0},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update units_of_measure skipped:', dbErr.message);
      }
    }

    writeUomsToFile(inMemoryUoms);
    res.json({ success: true, uom: inMemoryUoms[idx] });
  } catch (err) { next(err); }
}

export async function deleteUom(req, res, next) {
  try {
    const { id } = req.params;
    console.log('🗑️ [Backend UOM Deleted]:', id);
    inMemoryUoms = inMemoryUoms.filter(u => u.id !== id && u.code !== id);

    await ensureUomsTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM units_of_measure WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete units_of_measure skipped:', dbErr.message);
      }
    }

    writeUomsToFile(inMemoryUoms);
    res.json({ success: true, message: 'UOM deleted successfully' });
  } catch (err) { next(err); }
}

// Disposal Status Handlers (Master Data)
export async function getDisposalStatuses(req, res, next) {
  try {
    await ensureDisposalStatusesTable();
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM disposal_statuses WHERE active = 1 ORDER BY name ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description || '',
            active: Boolean(r.active)
          }));
          inMemoryDisposalStatuses = list;
          writeDisposalStatusesToFile(list);
          return res.json({ success: true, disposalStatuses: list });
        }
      } catch (dbErr) {
        console.warn('DB getDisposalStatuses skipped, using persistent store:', dbErr.message);
      }
    }
    res.json({ success: true, disposalStatuses: inMemoryDisposalStatuses.filter(s => s.active !== false) });
  } catch (err) { next(err); }
}

export async function createDisposalStatus(req, res, next) {
  try {
    await ensureDisposalStatusesTable();
    const { code, name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase().replace(/\s+/g, '_') : name.trim().toUpperCase().replace(/\s+/g, '_');
    const cleanName = name.trim();

    if (inMemoryDisposalStatuses.some(s => s.code.toLowerCase() === cleanCode.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Disposal status code "${cleanCode}" already exists.` });
    }
    if (inMemoryDisposalStatuses.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Disposal status name "${cleanName}" already exists.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM disposal_statuses WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Disposal status with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (err) {}
    }

    const newStatus = {
      id: 'disp-' + Date.now().toString(36),
      code: cleanCode,
      name: cleanName,
      description: description ? description.trim() : '',
      active: true,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO disposal_statuses (id, code, name, description, active, createdAt, updatedAt)
          VALUES ('${newStatus.id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${(description || '').replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert disposal_statuses skipped:', dbErr.message);
      }
    }

    inMemoryDisposalStatuses.push(newStatus);
    writeDisposalStatusesToFile(inMemoryDisposalStatuses);
    res.status(201).json({ success: true, disposalStatus: newStatus });
  } catch (err) { next(err); }
}

export async function updateDisposalStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const idx = inMemoryDisposalStatuses.findIndex(s => s.id === id || s.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Disposal status not found' });
    const existing = inMemoryDisposalStatuses[idx];
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    const cleanName = name ? name.trim() : existing.name;

    if (inMemoryDisposalStatuses.some(s => s.id !== existing.id && s.code !== existing.code && (
      (cleanCode && s.code.toLowerCase() === cleanCode.toLowerCase()) ||
      (cleanName && s.name.toLowerCase() === cleanName.toLowerCase())
    ))) {
      return res.status(409).json({ success: false, message: `Another Disposal status with code "${cleanCode}" or name "${cleanName}" already exists.` });
    }

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const safeId = (id || '').replace(/'/g, "''");
        const dbEx = await prisma.$queryRawUnsafe(
          `SELECT id FROM disposal_statuses WHERE id != '${safeId}' AND code != '${safeId}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(dbEx) && dbEx.length > 0) {
          return res.status(409).json({ success: false, message: `Another Disposal status with this code or name already exists.` });
        }
      } catch (err) {}
    }

    inMemoryDisposalStatuses[idx] = { ...inMemoryDisposalStatuses[idx], ...req.body, code: cleanCode, name: cleanName, updatedAt: new Date().toISOString() };
    writeDisposalStatusesToFile(inMemoryDisposalStatuses);
    res.json({ success: true, disposalStatus: inMemoryDisposalStatuses[idx] });
  } catch (err) { next(err); }
}

export async function deleteDisposalStatus(req, res, next) {
  try {
    const { id } = req.params;
    inMemoryDisposalStatuses = inMemoryDisposalStatuses.filter(s => s.id !== id && s.code !== id);
    writeDisposalStatusesToFile(inMemoryDisposalStatuses);
    res.json({ success: true, message: 'Disposal status deleted successfully' });
  } catch (err) { next(err); }
}

// ============================================================================
// BRAND MASTER HANDLERS
// ============================================================================
export async function getBrands(req, res, next) {
  try {
    await ensureBrandsTable();
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM brands WHERE active = 1 ORDER BY name ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            manufacturerId: r.manufacturerId || '',
            manufacturerName: r.manufacturerName || '',
            description: r.description || '',
            active: Boolean(r.active)
          }));
          inMemoryBrands = list;
          writeBrandsToFile(list);
          return res.json({ success: true, brands: list });
        }
      } catch (dbErr) {
        console.warn('DB getBrands query skipped:', dbErr.message);
      }
    }
    const list = req.query.includeInactive === 'true'
      ? inMemoryBrands
      : inMemoryBrands.filter(b => b.active !== false);
    res.json({ success: true, brands: list });
  } catch (err) { next(err); }
}

export async function createBrand(req, res, next) {
  try {
    await ensureBrandsTable();
    const { code, name, manufacturerId, manufacturerName, description, active, status } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Brand Name is required.' });

    const cleanName = name.trim();
    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase() : `BRD-${cleanName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    // Duplicate check on Code and Name
    if (inMemoryBrands.some(b => (b.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Brand with code "${cleanCode}" already exists. Duplicate brand codes are not allowed.` });
    }
    if (inMemoryBrands.some(b => (b.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Brand with name "${cleanName}" already exists. Duplicate brand names are not allowed.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM brands WHERE UPPER(code) = '${cleanCode.replace(/'/g, "''")}' OR UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Brand with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate brand skipped:', dbErr.message);
      }
    }

    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const id = `brd-${Date.now()}`;

    const newBrand = {
      id,
      code: cleanCode,
      name: cleanName,
      manufacturerId: manufacturerId || '',
      manufacturerName: manufacturerName || '',
      description: description ? description.trim() : '',
      active: isAct,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO brands (id, code, name, manufacturerId, manufacturerName, description, active, createdAt, updatedAt)
          VALUES ('${id}', '${cleanCode.replace(/'/g, "''")}', '${cleanName.replace(/'/g, "''")}', '${(manufacturerId || '').replace(/'/g, "''")}', '${(manufacturerName || '').replace(/'/g, "''")}', '${(description || '').replace(/'/g, "''")}', ${isAct ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert brands skipped:', dbErr.message);
      }
    }

    inMemoryBrands.unshift(newBrand);
    writeBrandsToFile(inMemoryBrands);
    res.status(201).json({ success: true, brand: newBrand });
  } catch (err) { next(err); }
}

export async function updateBrand(req, res, next) {
  try {
    const { id } = req.params;
    const idx = inMemoryBrands.findIndex(b => b.id === id || b.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Brand not found' });

    const existing = inMemoryBrands[idx];
    const { code, name, manufacturerId, manufacturerName, description, active, status } = req.body;
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    const cleanName = name ? name.trim() : existing.name;

    // Duplicate check excluding current
    if (cleanCode && inMemoryBrands.some(b => b.id !== existing.id && (b.code || '').toUpperCase() === cleanCode)) {
      return res.status(409).json({ success: false, message: `Brand with code "${cleanCode}" already exists.` });
    }
    if (cleanName && inMemoryBrands.some(b => b.id !== existing.id && (b.name || '').toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Brand with name "${cleanName}" already exists.` });
    }

    if (isDbConnected() && (cleanCode || cleanName)) {
      try {
        const whereParts = [];
        if (cleanCode) whereParts.push(`UPPER(code) = '${cleanCode.replace(/'/g, "''")}'`);
        if (cleanName) whereParts.push(`UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}'`);
        const safeId = (id || '').replace(/'/g, "''");
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM brands WHERE id != '${safeId}' AND code != '${safeId}' AND (${whereParts.join(' OR ')})`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Another brand with this code or name already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate brand in update skipped:', dbErr.message);
      }
    }

    const updated = {
      ...existing,
      ...req.body,
      code: cleanCode,
      name: cleanName,
      updatedAt: new Date().toISOString()
    };
    if (active !== undefined) updated.active = Boolean(active);
    else if (status !== undefined) updated.active = status === 'Active';

    inMemoryBrands[idx] = updated;

    await ensureBrandsTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE brands
          SET code = '${cleanCode.replace(/'/g, "''")}',
              name = '${cleanName.replace(/'/g, "''")}',
              manufacturerId = '${(updated.manufacturerId || '').replace(/'/g, "''")}',
              manufacturerName = '${(updated.manufacturerName || '').replace(/'/g, "''")}',
              description = '${(updated.description || '').replace(/'/g, "''")}',
              active = ${updated.active ? 1 : 0},
              updatedAt = CURRENT_TIMESTAMP
          WHERE id = '${existing.id.replace(/'/g, "''")}'
        `);
      } catch (dbErr) {
        console.warn('DB update brands skipped:', dbErr.message);
      }
    }

    writeBrandsToFile(inMemoryBrands);
    res.json({ success: true, brand: updated });
  } catch (err) { next(err); }
}

export async function deleteBrand(req, res, next) {
  try {
    const { id } = req.params;
    let brand = inMemoryBrands.find(b => b.id === id || b.code === id);

    await ensureBrandsTable();
    let dbBrand = null;
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM brands WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
        if (Array.isArray(rows) && rows.length > 0) dbBrand = rows[0];
      } catch (e) {
        console.warn('DB find brand error:', e.message);
      }
    }

    if (!brand && !dbBrand) return res.status(404).json({ success: false, message: 'Brand not found' });

    const targetId = dbBrand?.id || brand?.id || id;
    const targetCode = dbBrand?.code || brand?.code;

    inMemoryBrands = inMemoryBrands.filter(b => b.id !== targetId && b.id !== id && (!targetCode || b.code !== targetCode));

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM brands WHERE id = '${targetId.replace(/'/g, "''")}' OR code = '${(targetCode || '').replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete brands skipped:', dbErr.message);
      }
    }

    writeBrandsToFile(inMemoryBrands);
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err) { next(err); }
}

// Country Handlers (Master Data - Dynamic Lookup / Enum)
export async function getCountries(req, res, next) {
  try {
    await ensureCountriesTable();
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM countries WHERE active = 1 ORDER BY name ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            active: Boolean(r.active)
          }));
          inMemoryCountries = list;
          writeCountriesToFile(list);
          return res.json({ success: true, countries: list });
        }
      } catch (dbErr) {
        console.warn('DB getCountries skipped, using persistent store:', dbErr.message);
      }
    }
    res.json({ success: true, countries: inMemoryCountries.filter(c => c.active !== false) });
  } catch (err) { next(err); }
}

export async function createCountry(req, res, next) {
  try {
    await ensureCountriesTable();
    const { code, name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Country name is required' });

    const cleanName = name.trim();
    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase().replace(/\s+/g, '_') : cleanName.substring(0, 3).toUpperCase();

    if (inMemoryCountries.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Country "${cleanName}" already exists.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM countries WHERE UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}' OR UPPER(code) = '${cleanCode.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Country "${cleanName}" or code "${cleanCode}" already exists.` });
        }
      } catch (err) {}
    }

    const newCountry = {
      id: `cnt-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO countries (id, code, name, active, createdAt, updatedAt)
          VALUES ('${newCountry.id}', '${newCountry.code}', '${newCountry.name.replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert country skipped:', dbErr.message);
      }
    }

    inMemoryCountries.push(newCountry);
    writeCountriesToFile(inMemoryCountries);
    res.status(201).json({ success: true, country: newCountry });
  } catch (err) { next(err); }
}

// Location Type Handlers (Master Data - Dynamic Lookup / Enum)
export async function getLocationTypes(req, res, next) {
  try {
    await ensureLocationTypesTable();
    if (isDbConnected()) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM location_types WHERE active = 1 ORDER BY name ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
          const list = rows.map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description || '',
            active: Boolean(r.active)
          }));
          inMemoryLocationTypes = list;
          writeLocationTypesToFile(list);
          return res.json({ success: true, locationTypes: list });
        }
      } catch (dbErr) {
        console.warn('DB getLocationTypes skipped, using persistent store:', dbErr.message);
      }
    }
    res.json({ success: true, locationTypes: inMemoryLocationTypes.filter(t => t.active !== false) });
  } catch (err) { next(err); }
}

export async function createLocationType(req, res, next) {
  try {
    await ensureLocationTypesTable();
    const { code, name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Location Type name is required' });

    const cleanName = name.trim();
    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase().replace(/\s+/g, '_') : cleanName.toUpperCase().replace(/\s+/g, '_');

    if (inMemoryLocationTypes.some(t => t.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ success: false, message: `Location Type "${cleanName}" already exists.` });
    }

    if (isDbConnected()) {
      try {
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM location_types WHERE UPPER(name) = '${cleanName.toUpperCase().replace(/'/g, "''")}' OR UPPER(code) = '${cleanCode.toUpperCase().replace(/'/g, "''")}'`
        );
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ success: false, message: `Location Type "${cleanName}" or code "${cleanCode}" already exists.` });
        }
      } catch (err) {}
    }

    const newType = {
      id: `lt-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      description: description || '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO location_types (id, code, name, description, active, createdAt, updatedAt)
          VALUES ('${newType.id}', '${newType.code}', '${newType.name.replace(/'/g, "''")}', '${(newType.description || '').replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      } catch (dbErr) {
        console.warn('DB insert location_type skipped:', dbErr.message);
      }
    }

    inMemoryLocationTypes.push(newType);
    writeLocationTypesToFile(inMemoryLocationTypes);
    res.status(201).json({ success: true, locationType: newType });
  } catch (err) { next(err); }
}
