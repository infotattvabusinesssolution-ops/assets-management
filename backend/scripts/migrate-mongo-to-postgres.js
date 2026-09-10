import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma.js';

// ID Map: Mongo ObjectId String -> PostgreSQL UUID
const idMap = new Map();

function getId(mongoId) {
  if (!mongoId) return null;
  const strId = mongoId.toString();
  if (!idMap.has(strId)) {
    idMap.set(strId, uuidv4());
  }
  return idMap.get(strId);
}

export async function runMigration() {
  console.log('🚀 Starting MongoDB to PostgreSQL Data Migration Process...');

  let mongoose;
  try {
    mongoose = (await import('mongoose')).default;
  } catch (err) {
    console.error('❌ Mongoose is not installed or available. Migration requires Mongoose for source reads.');
    process.exit(1);
  }

  // Import source Mongoose Models dynamically
  const { User } = await import('../models/User.js');
  const { Role } = await import('../models/Role.js');
  const { Company } = await import('../models/Company.js');
  const { Department } = await import('../models/Department.js');
  const { CostCenter } = await import('../models/CostCenter.js');
  const { Site, Building, Floor, Room, Zone } = await import('../models/Location.js');
  const { Employee } = await import('../models/Employee.js');
  const { AssetClass } = await import('../models/AssetClass.js');
  const { Category } = await import('../models/Category.js');
  const { Manufacturer } = await import('../models/Manufacturer.js');
  const { AssetModel } = await import('../models/Model.js');
  const { Asset } = await import('../models/Asset.js');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fams-db';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`✅ Connected to source MongoDB at ${mongoUri}`);

  try {
    // 1. Roles
    const roles = await Role.find({});
    console.log(`Migrating ${roles.length} Roles...`);
    for (const r of roles) {
      const id = getId(r._id);
      await prisma.role.upsert({
        where: { code: r.code },
        update: {},
        create: {
          id,
          legacyMongoId: r._id.toString(),
          name: r.name,
          code: r.code,
          description: r.description,
          permissions: r.permissions || [],
          isSystem: r.isSystem ?? false,
          active: r.active ?? true,
          createdAt: r.createdAt || new Date(),
          updatedAt: r.updatedAt || new Date()
        }
      });
    }

    // 2. Companies
    const companies = await Company.find({});
    console.log(`Migrating ${companies.length} Companies...`);
    for (const c of companies) {
      const id = getId(c._id);
      await prisma.company.upsert({
        where: { code: c.code },
        update: {},
        create: {
          id,
          legacyMongoId: c._id.toString(),
          code: c.code,
          name: c.name,
          currency: c.currency || 'USD',
          taxId: c.taxId,
          address: c.address,
          active: c.active ?? true,
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date()
        }
      });
    }

    // 3. Departments
    const departments = await Department.find({});
    console.log(`Migrating ${departments.length} Departments...`);
    for (const d of departments) {
      const id = getId(d._id);
      await prisma.department.upsert({
        where: { companyId_code: { companyId: getId(d.companyId), code: d.code } },
        update: {},
        create: {
          id,
          legacyMongoId: d._id.toString(),
          companyId: getId(d.companyId),
          code: d.code,
          name: d.name,
          active: d.active ?? true,
          createdAt: d.createdAt || new Date(),
          updatedAt: d.updatedAt || new Date()
        }
      });
    }

    // 4. Cost Centers
    const costCenters = await CostCenter.find({});
    console.log(`Migrating ${costCenters.length} Cost Centers...`);
    for (const cc of costCenters) {
      const id = getId(cc._id);
      await prisma.costCenter.upsert({
        where: { companyId_code: { companyId: getId(cc.companyId), code: cc.code } },
        update: {},
        create: {
          id,
          legacyMongoId: cc._id.toString(),
          companyId: getId(cc.companyId),
          code: cc.code,
          name: cc.name,
          active: cc.active ?? true,
          createdAt: cc.createdAt || new Date(),
          updatedAt: cc.updatedAt || new Date()
        }
      });
    }

    // 5. Sites, Buildings, Floors, Rooms, Zones
    const sites = await Site.find({});
    console.log(`Migrating ${sites.length} Sites...`);
    for (const s of sites) {
      await prisma.site.upsert({
        where: { companyId_code: { companyId: getId(s.companyId), code: s.code } },
        update: {},
        create: {
          id: getId(s._id),
          legacyMongoId: s._id.toString(),
          companyId: getId(s.companyId),
          code: s.code,
          name: s.name,
          city: s.city,
          country: s.country,
          active: s.active ?? true,
          createdAt: s.createdAt || new Date(),
          updatedAt: s.updatedAt || new Date()
        }
      });
    }

    // 6. Categories, AssetClasses, Manufacturers, AssetModels
    const categories = await Category.find({});
    console.log(`Migrating ${categories.length} Categories...`);
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { code: cat.code },
        update: {},
        create: {
          id: getId(cat._id),
          legacyMongoId: cat._id.toString(),
          code: cat.code,
          name: cat.name,
          description: cat.description,
          depreciationMethod: cat.depreciationMethod || 'STRAIGHT_LINE',
          defaultUsefulLifeMonths: cat.defaultUsefulLifeMonths || 60,
          defaultResidualValuePercent: cat.defaultResidualValuePercent || 0,
          isSerialized: cat.isSerialized ?? true,
          active: cat.active ?? true,
          createdAt: cat.createdAt || new Date(),
          updatedAt: cat.updatedAt || new Date()
        }
      });
    }

    // 7. Users
    const users = await User.find({});
    console.log(`Migrating ${users.length} Users...`);
    for (const u of users) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
        create: {
          id: getId(u._id),
          legacyMongoId: u._id.toString(),
          username: u.username,
          email: u.email,
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          phone: u.phone,
          roleId: getId(u.roleId),
          companyId: getId(u.companyId),
          siteId: getId(u.siteId),
          departmentId: getId(u.departmentId),
          costCenterId: getId(u.costCenterId),
          employeeId: getId(u.employeeId),
          active: u.active ?? true,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt || new Date(),
          updatedAt: u.updatedAt || new Date()
        }
      });
    }

    // 8. Core Assets
    const assets = await Asset.find({});
    console.log(`Migrating ${assets.length} Core Assets...`);
    for (const a of assets) {
      await prisma.asset.upsert({
        where: { assetId: a.assetId },
        update: {},
        create: {
          id: getId(a._id),
          legacyMongoId: a._id.toString(),
          assetId: a.assetId,
          legacyId: a.legacyId,
          tagNumber: a.tagNumber,
          barcode: a.barcode,
          qrCode: a.qrCode,
          rfidEpc: a.rfidEpc,
          rfidTid: a.rfidTid,
          serialNumber: a.serialNumber,
          description: a.description,
          categoryId: getId(a.categoryId),
          assetClassId: getId(a.assetClassId),
          manufacturerId: getId(a.manufacturerId),
          modelId: getId(a.modelId),
          parentAssetId: getId(a.parentAssetId),
          lifecycleStatus: a.lifecycleStatus || 'RECEIVED',
          condition: a.condition || 'NEW',
          criticality: a.criticality || 'MEDIUM',
          companyId: getId(a.companyId),
          siteId: getId(a.siteId),
          buildingId: getId(a.buildingId),
          floorId: getId(a.floorId),
          roomId: getId(a.roomId),
          zoneId: getId(a.zoneId),
          departmentId: getId(a.departmentId),
          costCenterId: getId(a.costCenterId),
          custodianId: getId(a.custodianId),
          assignedDate: a.assignedDate,
          poNumber: a.poNumber,
          supplierName: a.supplierName,
          purchaseDate: a.purchaseDate,
          inServiceDate: a.inServiceDate,
          acquisitionValue: parseFloat(a.acquisitionValue ? a.acquisitionValue.toString() : 0),
          currency: a.currency || 'USD',
          hostname: a.hostname,
          macAddress: a.macAddress,
          ipAddress: a.ipAddress,
          discoveryId: a.discoveryId,
          healthScore: a.healthScore ?? 100,
          createdByUserId: getId(a.createdBy),
          updatedByUserId: getId(a.updatedBy),
          active: a.active ?? true,
          createdAt: a.createdAt || new Date(),
          updatedAt: a.updatedAt || new Date()
        }
      });
    }

    console.log('✅ MongoDB to PostgreSQL Data Migration Completed Successfully!');
  } catch (error) {
    console.error('❌ Data Migration Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    if (mongoose) await mongoose.disconnect();
  }
}

if (process.argv[1].endsWith('migrate-mongo-to-postgres.js')) {
  runMigration();
}
