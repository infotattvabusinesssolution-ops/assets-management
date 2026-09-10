import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { connectDB } from '../config/db.js';
import { seedRtlsData } from './seedRtls.js';

async function seed() {
  console.log('🌱 Starting Enterprise FAMS Database Seeding (PostgreSQL via Prisma)...');
  await connectDB();

  // Clear existing records in reverse dependency order
  console.log('🧹 Clearing existing database records...');
  await prisma.assetBookValue.deleteMany({});
  await prisma.assetTransaction.deleteMany({});
  await prisma.assetMapPosition.deleteMany({});
  await prisma.maintenanceWorkOrder.deleteMany({});
  await prisma.stocktakeExpectedAsset.deleteMany({});
  await prisma.stocktakeCampaign.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.assetModel.deleteMany({});
  await prisma.manufacturer.deleteMany({});
  await prisma.assetClass.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✨ Cleaned table records');

  // 1. Roles
  const rolesData = [
    { name: 'System Administrator', code: 'SYS_ADMIN', permissions: ['*'], isSystem: true },
    { name: 'Asset Administrator', code: 'ASSET_ADMIN', permissions: ['ASSETS_VIEW', 'ASSETS_CREATE', 'ASSETS_EDIT', 'ASSETS_TRANSITION'] },
    { name: 'Finance Asset Controller', code: 'FINANCE', permissions: ['ASSETS_VIEW', 'FINANCE_VIEW', 'FINANCE_RUN'] },
    { name: 'IT Asset Manager', code: 'IT_MANAGER', permissions: ['ASSETS_VIEW', 'DISCOVERY_VIEW', 'DISCOVERY_MATCH'] },
    { name: 'Facilities Manager', code: 'FACILITIES', permissions: ['ASSETS_VIEW', 'MAPS_VIEW', 'MAPS_EDIT'] },
    { name: 'Store Receiving', code: 'RECEIVING', permissions: ['RECEIVING_VIEW', 'RECEIVING_CREATE'] },
    { name: 'Custodian', code: 'CUSTODIAN', permissions: ['MY_ASSETS_VIEW'] },
    { name: 'Maintenance Technician', code: 'TECHNICIAN', permissions: ['WORK_ORDERS_VIEW', 'WORK_ORDERS_EDIT'] },
    { name: 'Auditor', code: 'AUDITOR', permissions: ['ASSETS_VIEW', 'AUDIT_VIEW'] },
    { name: 'Management', code: 'MANAGEMENT', permissions: ['REPORTS_VIEW', 'DASHBOARD_VIEW'] }
  ];

  const roles = [];
  for (const r of rolesData) {
    const createdRole = await prisma.role.create({ data: r });
    roles.push(createdRole);
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 2. Company & Sites
  const company = await prisma.company.create({
    data: {
      code: 'CMP-GLOBAL',
      name: 'Infotatwaa Enterprise Corp',
      currency: 'USD',
      taxId: 'TX-99887766'
    }
  });

  const siteA = await prisma.site.create({
    data: {
      companyId: company.id,
      code: 'SITE-HQ',
      name: 'Global HQ Campus',
      city: 'San Francisco',
      country: 'USA'
    }
  });

  const bldgA = await prisma.building.create({
    data: {
      siteId: siteA.id,
      code: 'BLDG-A',
      name: 'Executive Tower A'
    }
  });

  const floor1 = await prisma.floor.create({
    data: {
      buildingId: bldgA.id,
      code: 'FL-01',
      name: 'Floor 1 Lobby & Server Room',
      floorNumber: 1
    }
  });

  const floor2 = await prisma.floor.create({
    data: {
      buildingId: bldgA.id,
      code: 'FL-02',
      name: 'Floor 2 Executive Suites',
      floorNumber: 2
    }
  });

  const roomServer = await prisma.room.create({
    data: {
      floorId: floor1.id,
      code: 'RM-101',
      name: 'Data Center Server Room 101',
      roomType: 'DataCenter'
    }
  });

  const roomOffice = await prisma.room.create({
    data: {
      floorId: floor2.id,
      code: 'RM-205',
      name: 'Engineering Open Office 205',
      roomType: 'Office'
    }
  });

  // 3. Users & Employees
  const usersToCreate = [
    { username: 'admin', email: 'admin@infotatwaa.com', fullName: 'System Administrator', roleCode: 'SYS_ADMIN' },
    { username: 'asset_admin', email: 'assetadmin@infotatwaa.com', fullName: 'Asset Administrator', roleCode: 'ASSET_ADMIN' },
    { username: 'finance', email: 'finance@infotatwaa.com', fullName: 'Finance Controller', roleCode: 'FINANCE' },
    { username: 'it_manager', email: 'itmanager@infotatwaa.com', fullName: 'IT Asset Manager', roleCode: 'IT_MANAGER' },
    { username: 'facilities', email: 'facilities@infotatwaa.com', fullName: 'Facilities Manager', roleCode: 'FACILITIES' },
    { username: 'receiving', email: 'receiving@infotatwaa.com', fullName: 'Store Receiving Lead', roleCode: 'RECEIVING' },
    { username: 'custodian', email: 'custodian@infotatwaa.com', fullName: 'Asset Custodian', roleCode: 'CUSTODIAN' },
    { username: 'technician', email: 'technician@infotatwaa.com', fullName: 'Maintenance Technician', roleCode: 'TECHNICIAN' },
    { username: 'auditor', email: 'auditor@infotatwaa.com', fullName: 'Compliance Auditor', roleCode: 'AUDITOR' },
    { username: 'management', email: 'management@infotatwaa.com', fullName: 'Executive Management', roleCode: 'MANAGEMENT' }
  ];

  let adminUser = null;
  for (const u of usersToCreate) {
    const role = roles.find(r => r.code === u.roleCode);
    const createdUser = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        roleId: role.id,
        companyId: company.id,
        siteId: siteA.id
      }
    });
    if (u.roleCode === 'SYS_ADMIN') adminUser = createdUser;
  }

  const employee1 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-101',
      fullName: 'David Miller',
      email: 'david.m@infotatwaa.com',
      companyId: company.id
    }
  });

  // 4. Categories & Models
  const catIT = await prisma.category.create({
    data: {
      code: 'CAT-IT',
      name: 'IT Infrastructure & Compute',
      defaultUsefulLifeMonths: 36
    }
  });

  const mfrDell = await prisma.manufacturer.create({
    data: {
      name: 'Dell Technologies',
      website: 'https://dell.com'
    }
  });

  const modelDell = await prisma.assetModel.create({
    data: {
      modelNumber: 'LAT-5540',
      name: 'Dell Latitude 5540 i7 32GB',
      manufacturerId: mfrDell.id,
      categoryId: catIT.id
    }
  });

  // 5. Assets
  const asset1 = await prisma.asset.create({
    data: {
      assetId: 'AST-2026-001',
      tagNumber: 'TAG-9001',
      barcode: 'TAG-9001',
      qrCode: 'QR-AST-2026-001',
      rfidEpc: 'E280116060009001',
      serialNumber: 'SN-DELL-9001',
      description: 'Dell PowerEdge R750 Rack Server',
      categoryId: catIT.id,
      manufacturerId: mfrDell.id,
      modelId: modelDell.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'NEW',
      companyId: company.id,
      siteId: siteA.id,
      buildingId: bldgA.id,
      floorId: floor1.id,
      roomId: roomServer.id,
      custodianId: employee1.id,
      acquisitionValue: 8500.00,
      hostname: 'SRV-DB-PROD01',
      createdByUserId: adminUser.id
    }
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetId: 'AST-2026-002',
      tagNumber: 'TAG-9002',
      barcode: 'TAG-9002',
      qrCode: 'QR-AST-2026-002',
      rfidEpc: 'E280116060009002',
      serialNumber: 'SN-DELL-9002',
      description: 'Dell Latitude 5540 Developer Laptop',
      categoryId: catIT.id,
      manufacturerId: mfrDell.id,
      modelId: modelDell.id,
      lifecycleStatus: 'ASSIGNED',
      condition: 'GOOD',
      companyId: company.id,
      siteId: siteA.id,
      buildingId: bldgA.id,
      floorId: floor2.id,
      roomId: roomOffice.id,
      custodianId: employee1.id,
      acquisitionValue: 1850.00,
      hostname: 'DESKTOP-DEV-DM',
      createdByUserId: adminUser.id
    }
  });

  // Book values
  await prisma.assetBookValue.create({
    data: {
      assetId: asset1.id,
      bookType: 'CORPORATE',
      capitalizationDate: new Date(),
      capitalizationValue: asset1.acquisitionValue,
      usefulLifeMonths: 60,
      depreciationMethod: 'STRAIGHT_LINE',
      residualValue: 0,
      accumulatedDepreciation: 150.00,
      netBookValue: 8350.00
    }
  });

  await prisma.assetBookValue.create({
    data: {
      assetId: asset2.id,
      bookType: 'CORPORATE',
      capitalizationDate: new Date(),
      capitalizationValue: asset2.acquisitionValue,
      usefulLifeMonths: 60,
      depreciationMethod: 'STRAIGHT_LINE',
      residualValue: 0,
      accumulatedDepreciation: 50.00,
      netBookValue: 1800.00
    }
  });

  await seedRtlsData();

  console.log('✅ Enterprise PostgreSQL Seed completed successfully!');
  console.log('🔑 Login Credentials: Username: admin | Password: Admin@123');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed Error:', err);
  process.exit(1);
});
