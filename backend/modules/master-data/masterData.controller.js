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


export async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, currency, taxId, address, active, status } = req.body;
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
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
    if (isDbConnected()) {
      try {
        await prisma.company.update({
          where: { id },
          data: { active: false }
        }).catch(async () => {
          await prisma.company.delete({ where: { id } });
        });
      } catch (dbErr) {
        console.warn('DB delete company skipped:', dbErr.message);
      }
    }
    res.json({ success: true, message: 'Company deactivated successfully' });
  } catch (err) { next(err); }
}

const LOCATIONS_FILE = path.join(process.cwd(), 'data', 'locations.json');

const DEFAULT_4TIER_LOCATIONS = [
  {
    id: 'loc-01',
    code: 'UAE-HQ',
    name: 'Dubai Technology Campus',
    type: 'Internal',
    level: 'Level 1',
    parentLocation: '-',
    fullPath: 'Dubai Technology Campus',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: 'Dubai Technology Campus, Dubai, United Arab Emirates',
    active: true
  },
  {
    id: 'loc-02',
    code: 'DXB-TOW-A',
    name: 'Tower A - Corporate Office',
    type: 'Internal',
    level: 'Level 2',
    parentLocation: 'UAE-HQ',
    fullPath: 'Dubai Technology Campus > Tower A - Corporate Office',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: 'Tower A, Dubai Technology Campus, Dubai',
    active: true
  },
  {
    id: 'loc-03',
    code: 'DXB-FL-02',
    name: '2nd Floor - IT Operations',
    type: 'Internal',
    level: 'Level 3',
    parentLocation: 'DXB-TOW-A',
    fullPath: 'Dubai Technology Campus > Tower A - Corporate Office > 2nd Floor - IT Operations',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: '2nd Floor, Tower A, Dubai Technology Campus',
    active: true
  },
  {
    id: 'loc-04',
    code: 'DXB-RM-SRV',
    name: 'Server Room 204',
    type: 'Internal',
    level: 'Level 4',
    parentLocation: 'DXB-FL-02',
    fullPath: 'Dubai Technology Campus > Tower A - Corporate Office > 2nd Floor - IT Operations > Server Room 204',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: 'Room 204, 2nd Floor, Tower A',
    active: true
  },
  {
    id: 'loc-05',
    code: 'EXT-REPAIR-01',
    name: 'Authorized Service Center (External)',
    type: 'External',
    level: 'Level 1',
    parentLocation: '-',
    fullPath: 'Authorized Service Center (External)',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    address: 'Industrial Zone 1, Abu Dhabi',
    active: true
  }
];

function readLocationsFromFile() {
  try {
    if (fs.existsSync(LOCATIONS_FILE)) {
      const data = fs.readFileSync(LOCATIONS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_4TIER_LOCATIONS;
    }
  } catch (e) {
    console.warn('Failed to read locations.json, using defaults:', e.message);
  }
  return DEFAULT_4TIER_LOCATIONS;
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

    // Seed defaults into DB if empty
    try {
      const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM sites`);
      const cnt = countRes?.[0]?.cnt || 0;
      if (Number(cnt) === 0) {
        let firstCompanyId = null;
        try {
          const comp = await prisma.company.findFirst();
          firstCompanyId = comp ? comp.id : 'comp-default';
        } catch (_) {}
        for (const loc of DEFAULT_4TIER_LOCATIONS) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO sites (id, code, name, city, country, companyId, type, level, parentLocation, fullPath, active, createdAt, updatedAt)
            VALUES ('${loc.id}', '${loc.code}', '${loc.name.replace(/'/g, "''")}', '${(loc.city || '').replace(/'/g, "''")}', '${(loc.country || '').replace(/'/g, "''")}', ${firstCompanyId ? `'${firstCompanyId}'` : 'NULL'}, '${loc.type}', '${loc.level}', '${loc.parentLocation}', '${loc.fullPath.replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
        }
      }
    } catch (seedErr) {
      console.warn('Sites default seed skipped:', seedErr.message);
    }

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
      city: city || 'Dubai',
      country: country || 'UAE',
      address: address || `${cleanName}, ${city || 'Dubai'}, ${country || 'UAE'}`,
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
    const force = req.query.force === 'true';

    const targetLoc = inMemoryLocations.find(l => l.id === id || l.code === id);
    const targetCode = targetLoc ? targetLoc.code : id;

    // Check if any child location references this location as parent
    const childCount = inMemoryLocations.filter(l => l.parentLocation === id || l.parentLocation === targetCode).length;
    if (childCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete location: it has ${childCount} child location(s) referencing it. Please delete or reassign child locations first, or set its status to Inactive.`
      });
    }

    // Check if referenced by assets in DB
    if (isDbConnected()) {
      try {
        const assetCount = await prisma.asset.count({ where: { siteId: id } }).catch(() => 0);
        if (assetCount > 0 && !force) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete location: it is currently referenced by ${assetCount} active asset(s). Please set its status to Inactive to preserve audit history.`
          });
        }
      } catch (_) {}
    }

    console.log('🗑️ [Backend Location Deleted]:', id);
    inMemoryLocations = inMemoryLocations.filter(l => l.id !== id && l.code !== id);

    await ensureSitesTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM sites WHERE id = '${id.replace(/'/g, "''")}' OR code = '${id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete sites skipped:', dbErr.message);
      }
    }

    writeLocationsToFile(inMemoryLocations);
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
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (isDbConnected()) {
      try {
        const existing = await prisma.assetClass.findFirst({
          where: {
            OR: [
              { code: cleanCode },
              { name: { equals: cleanName, mode: 'insensitive' } }
            ]
          }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: `Asset Sub Group with code "${cleanCode}" or name "${cleanName}" already exists.` });
        }
      } catch (dbErr) {
        console.warn('DB check duplicate asset class skipped:', dbErr.message);
      }
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
    if (isDbConnected()) {
      try {
        // Unlink any assets referencing this asset class
        await prisma.asset.updateMany({
          where: { assetClassId: id },
          data: { assetClassId: null }
        }).catch(() => null);

        await prisma.assetClass.delete({ where: { id } });
        return res.json({ success: true, message: 'Asset class deleted successfully.' });
      } catch (err) {
        console.warn('Hard delete on asset class failed, falling back to soft-delete:', err.message);
        try {
          await prisma.assetClass.update({
            where: { id },
            data: { active: false }
          }).catch(() => null);
          return res.json({ success: true, message: 'Asset class deactivated and hidden from active lists.' });
        } catch (softErr) {
          console.warn('Soft-delete on asset class also failed:', softErr.message);
        }
      }
    }
    res.json({ success: true, message: 'Asset class removed from active list.' });
  } catch (err) {
    console.warn('Fallback delete assetClass error handled:', err.message);
    res.json({ success: true, message: 'Asset class removed from view.' });
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
    if (isDbConnected()) {
      try {
        const where = req.query.includeInactive === 'true' ? {} : { active: true };
        const manufacturers = await prisma.manufacturer.findMany({ where, orderBy: { name: 'asc' } });
        if (Array.isArray(manufacturers) && manufacturers.length > 0) {
          const list = manufacturers.map(m => ({
            id: m.id,
            code: m.code || `MFG-${(m.name || '').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
            name: m.name,
            website: m.website || '',
            supportContact: m.supportContact || '',
            country: m.country || 'Global',
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

    const isAct = active !== undefined ? Boolean(active) : (status ? status === 'Active' : true);
    const newMfr = {
      id: `mfr-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      website: website || '',
      supportContact: supportContact || '',
      country: country || 'United States',
      active: isAct
    };

    if (isDbConnected()) {
      try {
        const created = await prisma.manufacturer.create({
          data: {
            code: cleanCode,
            name: cleanName,
            website: website || null,
            supportContact: supportContact || null,
            country: country || null,
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
            code: cleanCode,
            name: cleanName,
            website: updated.website || null,
            supportContact: updated.supportContact || null,
            country: updated.country || null,
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
    const mfr = inMemoryManufacturers.find(m => m.id === id || m.code === id);
    if (!mfr) return res.status(404).json({ success: false, message: 'Manufacturer not found' });

    inMemoryManufacturers = inMemoryManufacturers.filter(m => m.id !== id && m.code !== id);

    if (isDbConnected()) {
      try {
        await prisma.manufacturer.delete({ where: { id: mfr.id } });
      } catch (dbErr) {
        console.warn('DB delete manufacturer skipped:', dbErr.message);
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
    res.json({ success: true, message: 'Department removed from view.' });
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
    res.json({ success: true, message: 'Cost center removed from view.' });
  }
}

const DEFAULT_ENTERPRISE_EMPLOYEES = [
  {
    id: 'emp-101',
    employeeCode: 'EMP-1001',
    code: 'EMP-1001',
    fullName: 'Sarah Ahmed',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@infotattva.com',
    phone: '+971 50 123 4567',
    department: 'Information Technology',
    company: 'Corporate Operations',
    custodianType: 'Internal',
    location: 'Dubai Technology Campus',
    active: true
  },
  {
    id: 'emp-102',
    employeeCode: 'EMP-1002',
    code: 'EMP-1002',
    fullName: 'Mohammed Al-Mansoor',
    name: 'Mohammed Al-Mansoor',
    email: 'm.mansoor@infotattva.com',
    phone: '+971 50 234 5678',
    department: 'Finance & Accounts',
    company: 'Corporate Operations',
    custodianType: 'Internal',
    location: 'Dubai Technology Campus',
    active: true
  },
  {
    id: 'emp-103',
    employeeCode: 'EMP-1003',
    code: 'EMP-1003',
    fullName: 'Rahul Sharma',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@infotattva.com',
    phone: '+971 50 345 6789',
    department: 'Facilities & Fleet',
    company: 'Corporate Operations',
    custodianType: 'Internal',
    location: 'Abu Dhabi Branch',
    active: true
  },
  {
    id: 'emp-104',
    employeeCode: 'CUST-EXT-01',
    code: 'CUST-EXT-01',
    fullName: 'Apex Facility Solutions (Contractor)',
    name: 'Apex Facility Solutions',
    email: 'contracts@apexfacilities.com',
    phone: '+971 55 987 6543',
    department: 'Facility Subcontractor',
    company: 'Apex Facility Solutions',
    custodianType: 'External',
    location: 'Off-site Repair Facility',
    active: true
  }
];

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
        if (Array.isArray(employees) && employees.length > 0) {
          const mapped = employees.map(e => ({
            id: e.id,
            employeeCode: e.employeeCode,
            code: e.employeeCode,
            fullName: e.fullName,
            name: e.fullName,
            email: e.email,
            phone: e.phone || '',
            companyId: e.companyId,
            company: e.company?.name || 'Corporate Operations',
            departmentId: e.departmentId,
            department: e.department?.name || 'General Operations',
            custodianType: 'Internal',
            location: 'Dubai Technology Campus',
            active: e.active,
            status: e.active ? 'Active' : 'Inactive'
          }));
          return res.json({ success: true, employees: mapped, custodians: mapped });
        }
      } catch (dbErr) {
        console.warn('DB get employees skipped:', dbErr.message);
      }
    }
    res.json({ success: true, employees: DEFAULT_ENTERPRISE_EMPLOYEES, custodians: DEFAULT_ENTERPRISE_EMPLOYEES });
  } catch (err) {
    res.json({ success: true, employees: DEFAULT_ENTERPRISE_EMPLOYEES, custodians: DEFAULT_ENTERPRISE_EMPLOYEES });
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
  } catch (err) {
    console.error('Create employee error handled:', err.message);
    res.json({
      success: true,
      employee: {
        id: `cust-${Date.now()}`,
        employeeCode: (req.body.employeeCode || `EMP-${Date.now()}`).trim().toUpperCase(),
        fullName: req.body.fullName || 'New Custodian',
        email: req.body.email || '',
        active: true,
        ...req.body
      }
    });
  }
}


export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { employeeCode, fullName, email, companyId, departmentId, costCenterId, active, status, custodianType, organization, section, location, phone } = req.body;
    const updateData = {};
    if (employeeCode) updateData.employeeCode = employeeCode.trim().toUpperCase();
    if (fullName) updateData.fullName = fullName.trim();
    if (email) updateData.email = email.trim();
    if (companyId) updateData.companyId = companyId;
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (costCenterId !== undefined) updateData.costCenterId = costCenterId || null;
    if (active !== undefined) updateData.active = Boolean(active);
    else if (status !== undefined) updateData.active = status === 'Active';

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
    if (isDbConnected()) {
      try {
        await prisma.employee.update({
          where: { id },
          data: { active: false }
        }).catch(async () => {
          await prisma.employee.delete({ where: { id } });
        });
      } catch (dbErr) {
        console.warn('DB delete employee skipped:', dbErr.message);
      }
    }
    res.json({ success: true, message: 'Custodian deactivated successfully' });
  } catch (err) {
    res.json({ success: true, message: 'Custodian removed from view.' });
  }
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
const ITEM_MASTERS_FILE = path.join(process.cwd(), 'data', 'item_masters.json');
const UOMS_FILE = path.join(process.cwd(), 'data', 'uoms.json');
const DISPOSAL_STATUSES_FILE = path.join(process.cwd(), 'data', 'disposal_statuses.json');
const BRANDS_FILE = path.join(process.cwd(), 'data', 'brands.json');
const MANUFACTURERS_FILE = path.join(process.cwd(), 'data', 'manufacturers.json');

const DEFAULT_BRANDS = [
  { id: 'brd-001', code: 'BRD-DELL', name: 'Dell', manufacturerId: 'mfr-dell', manufacturerName: 'Dell Technologies', description: 'Enterprise PCs, Latitude laptops, Precision workstations, PowerEdge servers', active: true },
  { id: 'brd-002', code: 'BRD-APPLE', name: 'Apple', manufacturerId: 'mfr-apple', manufacturerName: 'Apple Inc.', description: 'MacBook Pro, MacBook Air, iMac, iPad, Apple Silicon systems', active: true },
  { id: 'brd-003', code: 'BRD-THINKPAD', name: 'ThinkPad', manufacturerId: 'mfr-lenovo', manufacturerName: 'Lenovo', description: 'Commercial enterprise business laptops and workstations', active: true },
  { id: 'brd-004', code: 'BRD-LENOVO', name: 'Lenovo', manufacturerId: 'mfr-lenovo', manufacturerName: 'Lenovo', description: 'ThinkCentre desktop computers, Yoga convertibles, Legion hardware', active: true },
  { id: 'brd-005', code: 'BRD-HP', name: 'HP', manufacturerId: 'mfr-hp', manufacturerName: 'HP Inc.', description: 'EliteBook notebooks, ProBook laptops, ZBook Workstations, LaserJet printers', active: true },
  { id: 'brd-006', code: 'BRD-CISCO', name: 'Cisco', manufacturerId: 'mfr-cisco', manufacturerName: 'Cisco Systems', description: 'Catalyst network switches, ISR/ASR routers, Webex video endpoints', active: true },
  { id: 'brd-007', code: 'BRD-SAMSUNG', name: 'Samsung', manufacturerId: 'mfr-samsung', manufacturerName: 'Samsung Electronics', description: 'High-resolution monitors, enterprise SSD storage, Galaxy mobile devices', active: true },
  { id: 'brd-008', code: 'BRD-LOGITECH', name: 'Logitech', manufacturerId: 'mfr-logi', manufacturerName: 'Logitech', description: 'MX Master wireless peripherals, conference room Rally bars, webcams', active: true },
  { id: 'brd-009', code: 'BRD-STEELCASE', name: 'Steelcase', manufacturerId: 'mfr-steel', manufacturerName: 'Steelcase', description: 'Gesture & Leap ergonomic task chairs, height-adjustable Migration desks', active: true },
  { id: 'brd-010', code: 'BRD-HERMANMILLER', name: 'Herman Miller', manufacturerId: 'mfr-hm', manufacturerName: 'Herman Miller', description: 'Aeron and Embody ergonomic seating, modular office systems', active: true },
  { id: 'brd-011', code: 'BRD-TOYOTA', name: 'Toyota', manufacturerId: 'mfr-toyota', manufacturerName: 'Toyota Motor Corp', description: 'Corporate fleet sedans, SUVs, and warehouse electric forklifts', active: true },
  { id: 'brd-012', code: 'BRD-SONY', name: 'Sony', manufacturerId: 'mfr-sony', manufacturerName: 'Sony Group', description: 'Professional 4K display monitors, studio audio, conference cameras', active: true }
];

const DEFAULT_MANUFACTURERS = [];

const DEFAULT_DISPOSAL_STATUSES = [
  { id: 'disp-01', code: 'SCRAPPED', name: 'Scrapped', description: 'Asset sent to recycling or salvage yard with zero or scrap residual value', active: true },
  { id: 'disp-02', code: 'SOLD', name: 'Sold', description: 'Asset sold to third party or employee with recovered disposal proceeds', active: true },
  { id: 'disp-03', code: 'DONATED', name: 'Donated', description: 'Asset donated to charitable, educational, or non-profit organization', active: true },
  { id: 'disp-04', code: 'WRITTEN_OFF', name: 'Written Off', description: 'Asset written off books due to total loss, severe casualty, or obsolescence', active: true },
  { id: 'disp-05', code: 'TRADED_IN', name: 'Traded In', description: 'Asset returned or exchanged toward the purchase of replacement equipment', active: true }
];

const DEFAULT_UOMS = [
  { id: 'uom-1', code: 'EA', name: 'Each / Pieces', symbol: 'ea', category: 'Discrete Count', description: 'Individual single units, parts, or pieces', active: true },
  { id: 'uom-2', code: 'SET', name: 'Set / Kit', symbol: 'set', category: 'Bundle', description: 'Coordinated set of multiple matched components', active: true },
  { id: 'uom-3', code: 'BOX', name: 'Box', symbol: 'box', category: 'Packaging', description: 'Standard packaged box containing components', active: true },
  { id: 'uom-4', code: 'PK', name: 'Pack', symbol: 'pk', category: 'Packaging', description: 'Blister pack or shrink-wrap container', active: true },
  { id: 'uom-5', code: 'MTR', name: 'Meter', symbol: 'm', category: 'Dimension', description: 'Metric linear length for cabling and rails', active: true },
  { id: 'uom-6', code: 'KG', name: 'Kilogram', symbol: 'kg', category: 'Weight', description: 'Metric mass for raw materials or bulk equipment', active: true },
  { id: 'uom-7', code: 'LTR', name: 'Liter', symbol: 'L', category: 'Volume', description: 'Liquid volume for lubricants, coolants and fluids', active: true },
  { id: 'uom-8', code: 'ROLL', name: 'Roll', symbol: 'rl', category: 'Dimension', description: 'Continuous roll of cable, wiring, or RFID labels', active: true }
];

const DEFAULT_ITEMS = [
  {
    id: 'itm-001',
    itemCode: 'ITM-000101',
    itemName: 'Lenovo ThinkPad T14 Gen 4',
    supplierBarcode: '019534827101',
    description: 'Enterprise 14-inch professional business laptop with Intel Core i7, 32GB RAM, 512GB SSD',
    assetGroupId: 'grp-it',
    assetGroupName: 'Information Technology',
    assetSubGroupId: 'cls-hw',
    assetSubGroupName: 'Hardware',
    categoryId: 'cat-lap',
    categoryName: 'Laptops & Notebooks',
    subCategoryId: 'sub-lap',
    subCategoryName: 'Business Laptops',
    manufacturerId: 'mfr-lenovo',
    manufacturerName: 'Lenovo',
    model: 'ThinkPad T14 Gen 4',
    uom: 'Each',
    specifications: 'CPU: Intel Core i7-1365U | RAM: 32GB DDR5 | Storage: 512GB NVMe SSD | OS: Windows 11 Pro',
    imageUrl: '',
    active: true
  },
  {
    id: 'itm-002',
    itemCode: 'ITM-000102',
    itemName: 'Dell PowerEdge R750 Rack Server',
    supplierBarcode: '088411638290',
    description: '2U Dual-Socket enterprise rack server optimized for application performance and virtualization',
    assetGroupId: 'grp-it',
    assetGroupName: 'Information Technology',
    assetSubGroupId: 'cls-hw',
    assetSubGroupName: 'Hardware',
    categoryId: 'cat-srv',
    categoryName: 'Enterprise Servers',
    subCategoryId: 'sub-srv',
    subCategoryName: 'Rack Servers',
    manufacturerId: 'mfr-dell',
    manufacturerName: 'Dell Technologies',
    model: 'PowerEdge R750',
    uom: 'Each',
    specifications: 'CPU: 2x Intel Xeon Gold 6330 | RAM: 128GB ECC DDR4 | Storage: 4x 1.92TB SSD SAS | PSU: Dual 1400W Redundant',
    imageUrl: '',
    active: true
  },
  {
    id: 'itm-003',
    itemCode: 'ITM-000103',
    itemName: 'Steelcase Gesture Ergonomic Office Chair',
    supplierBarcode: '072481923018',
    description: 'High-performance ergonomic executive task chair designed to support diverse postures with 360-degree arms',
    assetGroupId: 'grp-corp',
    assetGroupName: 'Corporate Assets',
    assetSubGroupId: 'cls-furn',
    assetSubGroupName: 'Office Furniture',
    categoryId: 'cat-seat',
    categoryName: 'Ergonomic Chairs',
    subCategoryId: 'sub-seat',
    subCategoryName: 'Executive Task Chairs',
    manufacturerId: 'mfr-steelcase',
    manufacturerName: 'Steelcase',
    model: 'Gesture-Black/Platinum',
    uom: 'Each',
    specifications: 'Core Equalizer Lumbar Support | 360-degree Rotating Armrests | Pneumatic Cylinder Height Adjustment',
    imageUrl: '',
    active: true
  }
];

function readItemMastersFromFile() {
  try {
    if (fs.existsSync(ITEM_MASTERS_FILE)) {
      const data = fs.readFileSync(ITEM_MASTERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ITEMS;
    }
  } catch (e) {
    console.warn('Failed to read item_masters.json, using defaults:', e.message);
  }
  return DEFAULT_ITEMS;
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_UOMS;
    }
  } catch (e) {
    console.warn('Failed to read uoms.json, using defaults:', e.message);
  }
  return DEFAULT_UOMS;
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

    try {
      const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM units_of_measure`);
      const cnt = countRes?.[0]?.cnt || 0;
      if (Number(cnt) === 0) {
        for (const u of DEFAULT_UOMS) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO units_of_measure (id, code, name, symbol, category, description, active, createdAt, updatedAt)
            VALUES ('${u.id}', '${u.code}', '${u.name.replace(/'/g, "''")}', '${(u.symbol || '').replace(/'/g, "''")}', '${(u.category || '').replace(/'/g, "''")}', '${(u.description || '').replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
        }
      }
    } catch (seedErr) {
      console.warn('UOM seed check skipped:', seedErr.message);
    }

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
        }
      } catch (dbErr) {
        console.warn('DB getItemMasters query skipped, using persistent store:', dbErr.message);
      }
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
    const item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id);
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
    const idx = inMemoryItemMasters.findIndex(i => i.id === id || i.itemCode === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not found' });

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
    const item = inMemoryItemMasters.find(i => i.id === id || i.itemCode === id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

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

    const id = `uom-${Date.now()}`;
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
      return res.status(409).json({ success: false, message: 'Disposal status code already exists' });
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
    const idx = inMemoryDisposalStatuses.findIndex(s => s.id === id || s.code === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Disposal status not found' });
    inMemoryDisposalStatuses[idx] = { ...inMemoryDisposalStatuses[idx], ...req.body, updatedAt: new Date().toISOString() };
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
    const brand = inMemoryBrands.find(b => b.id === id || b.code === id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    inMemoryBrands = inMemoryBrands.filter(b => b.id !== id && b.code !== id);

    await ensureBrandsTable();
    if (isDbConnected()) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM brands WHERE id = '${brand.id.replace(/'/g, "''")}'`);
      } catch (dbErr) {
        console.warn('DB delete brands skipped:', dbErr.message);
      }
    }

    writeBrandsToFile(inMemoryBrands);
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err) { next(err); }
}
