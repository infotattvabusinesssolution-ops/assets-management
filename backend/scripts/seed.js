import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Site, Building, Floor, Room, Zone } from '../models/Location.js';
import { Department } from '../models/Department.js';
import { CostCenter } from '../models/CostCenter.js';
import { Employee } from '../models/Employee.js';
import { Category } from '../models/Category.js';
import { AssetClass } from '../models/AssetClass.js';
import { Manufacturer } from '../models/Manufacturer.js';
import { AssetModel } from '../models/Model.js';
import { CustomFieldDefinition } from '../models/CustomFieldDefinition.js';
import { Asset } from '../models/Asset.js';
import { AssetBookValue } from '../models/AssetBookValue.js';
import { AssetTransaction } from '../models/AssetTransaction.js';
import { MaintenanceWorkOrder } from '../models/MaintenanceWorkOrder.js';
import { StocktakeCampaign } from '../models/StocktakeCampaign.js';
import { StocktakeExpectedAsset } from '../models/StocktakeExpectedAsset.js';
import { FloorMap } from '../models/FloorMap.js';
import { AssetMapPosition } from '../models/AssetMapPosition.js';
import { DiscoveryObservation } from '../models/DiscoveryObservation.js';
import { DiscoveryMatch } from '../models/DiscoveryMatch.js';
import { WorkflowDefinition } from '../models/WorkflowDefinition.js';
import { WorkflowInstance } from '../models/WorkflowInstance.js';
import { Warranty } from '../models/Warranty.js';
import { Contract } from '../models/Contract.js';
import { connectDB } from '../config/db.js';

async function seed() {
  console.log('🌱 Starting Enterprise FAMS Database Seeding...');
  await connectDB();


  // Clear existing collections
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({}),
    Site.deleteMany({}),
    Building.deleteMany({}),
    Floor.deleteMany({}),
    Room.deleteMany({}),
    Department.deleteMany({}),
    CostCenter.deleteMany({}),
    Employee.deleteMany({}),
    Category.deleteMany({}),
    AssetClass.deleteMany({}),
    Manufacturer.deleteMany({}),
    AssetModel.deleteMany({}),
    CustomFieldDefinition.deleteMany({}),
    Asset.deleteMany({}),
    AssetBookValue.deleteMany({}),
    AssetTransaction.deleteMany({}),
    MaintenanceWorkOrder.deleteMany({}),
    StocktakeCampaign.deleteMany({}),
    StocktakeExpectedAsset.deleteMany({}),
    FloorMap.deleteMany({}),
    AssetMapPosition.deleteMany({}),
    DiscoveryObservation.deleteMany({}),
    DiscoveryMatch.deleteMany({}),
    WorkflowDefinition.deleteMany({}),
    WorkflowInstance.deleteMany({}),
    Warranty.deleteMany({}),
    Contract.deleteMany({})
  ]);

  console.log('🧹 Database cleared');

  // 1. Roles
  const roles = await Role.insertMany([
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
  ]);

  const sysAdminRole = roles.find(r => r.code === 'SYS_ADMIN');
  const assetAdminRole = roles.find(r => r.code === 'ASSET_ADMIN');
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 2. Company & Sites
  const company = await Company.create({
    code: 'CMP-GLOBAL',
    name: 'Infotatwaa Enterprise Corp',
    currency: 'USD',
    taxId: 'TX-99887766'
  });

  const siteA = await Site.create({ companyId: company._id, code: 'SITE-HQ', name: 'Global HQ Campus', city: 'San Francisco', country: 'USA' });
  const siteB = await Site.create({ companyId: company._id, code: 'SITE-EAST', name: 'Innovation Hub East', city: 'New York', country: 'USA' });

  const bldgA = await Building.create({ siteId: siteA._id, code: 'BLDG-A', name: 'Executive Tower A' });
  const floor1 = await Floor.create({ buildingId: bldgA._id, code: 'FL-01', name: 'Floor 1 Lobby & Server Room', floorNumber: 1 });
  const floor2 = await Floor.create({ buildingId: bldgA._id, code: 'FL-02', name: 'Floor 2 Executive Suites', floorNumber: 2 });

  const roomServer = await Room.create({ floorId: floor1._id, code: 'RM-101', name: 'Data Center Server Room 101', roomType: 'DataCenter' });
  const roomOffice = await Room.create({ floorId: floor2._id, code: 'RM-205', name: 'Engineering Open Office 205', roomType: 'Office' });

  // 3. Users & Employees (10 Enterprise Roles)
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
    const createdUser = await User.create({
      username: u.username,
      email: u.email,
      passwordHash,
      fullName: u.fullName,
      roleId: role._id,
      companyId: company._id,
      siteId: siteA._id
    });
    if (u.roleCode === 'SYS_ADMIN') adminUser = createdUser;
  }

  const employee1 = await Employee.create({
    employeeCode: 'EMP-101',
    fullName: 'David Miller',
    email: 'david.m@infotatwaa.com',
    companyId: company._id
  });

  // 4. Categories & Models
  const catIT = await Category.create({ code: 'CAT-IT', name: 'IT Infrastructure & Compute', defaultUsefulLifeMonths: 36 });
  const catFacility = await Category.create({ code: 'CAT-FAC', name: 'Facilities & Heavy Machinery', defaultUsefulLifeMonths: 120 });

  const mfrDell = await Manufacturer.create({ name: 'Dell Technologies', website: 'https://dell.com' });
  const modelDell = await AssetModel.create({
    modelNumber: 'LAT-5540',
    name: 'Dell Latitude 5540 i7 32GB',
    manufacturerId: mfrDell._id,
    categoryId: catIT._id
  });

  // 5. Assets
  const assets = await Asset.insertMany([
    {
      assetId: 'AST-2026-001',
      tagNumber: 'TAG-9001',
      barcode: 'TAG-9001',
      qrCode: 'QR-AST-2026-001',
      rfidEpc: 'E280116060009001',
      serialNumber: 'SN-DELL-9001',
      description: 'Dell PowerEdge R750 Rack Server',
      categoryId: catIT._id,
      manufacturerId: mfrDell._id,
      modelId: modelDell._id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'NEW',
      companyId: company._id,
      siteId: siteA._id,
      buildingId: bldgA._id,
      floorId: floor1._id,
      roomId: roomServer._id,
      custodianId: employee1._id,
      acquisitionValue: 8500.00,
      hostname: 'SRV-DB-PROD01',
      createdBy: adminUser._id
    },
    {
      assetId: 'AST-2026-002',
      tagNumber: 'TAG-9002',
      barcode: 'TAG-9002',
      qrCode: 'QR-AST-2026-002',
      rfidEpc: 'E280116060009002',
      serialNumber: 'SN-DELL-9002',
      description: 'Dell Latitude 5540 Developer Laptop',
      categoryId: catIT._id,
      manufacturerId: mfrDell._id,
      modelId: modelDell._id,
      lifecycleStatus: 'ASSIGNED',
      condition: 'GOOD',
      companyId: company._id,
      siteId: siteA._id,
      buildingId: bldgA._id,
      floorId: floor2._id,
      roomId: roomOffice._id,
      custodianId: employee1._id,
      acquisitionValue: 1850.00,
      hostname: 'DESKTOP-DEV-DM',
      createdBy: adminUser._id
    }
  ]);

  // Book values
  for (const ast of assets) {
    await AssetBookValue.create({
      assetId: ast._id,
      bookType: 'CORPORATE',
      capitalizationDate: new Date(),
      capitalizationValue: ast.acquisitionValue,
      usefulLifeMonths: 60,
      depreciationMethod: 'STRAIGHT_LINE',
      residualValue: 0,
      accumulatedDepreciation: 150.00,
      netBookValue: Number(ast.acquisitionValue) - 150.00
    });
  }

  // 6. Floor Map & Coordinates
  const floorMap = await FloorMap.create({
    title: 'Floor 1 Server Room Architectural Layout',
    floorId: floor1._id,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    zones: [
      { name: 'Server Rack Zone A', points: [{ x: 0.1, y: 0.1 }, { x: 0.4, y: 0.1 }, { x: 0.4, y: 0.4 }, { x: 0.1, y: 0.4 }], color: '#10B981' }
    ]
  });

  await AssetMapPosition.create({
    assetId: assets[0]._id,
    floorMapId: floorMap._id,
    xRatio: 0.25,
    yRatio: 0.25,
    updatedBy: adminUser._id,
    active: true
  });

  // 7. Work Orders
  await MaintenanceWorkOrder.create({
    workOrderNumber: 'WO-2026-01',
    assetId: assets[0]._id,
    workType: 'PREVENTIVE',
    priority: 'HIGH',
    status: 'OPEN',
    description: 'Quarterly Server Fan & Dust Cleaning Inspection',
    createdBy: adminUser._id
  });

  // 8. Stocktake Campaign
  const campaign = await StocktakeCampaign.create({
    campaignNumber: 'STK-2026-Q3',
    title: 'Q3 Enterprise Hardware Census',
    scope: { companyId: company._id, siteId: siteA._id },
    status: 'ACTIVE',
    createdBy: adminUser._id,
    stats: { totalExpected: 2, totalVerified: 1, totalRelocated: 0, totalMissing: 0, totalUnregistered: 0 }
  });

  await StocktakeExpectedAsset.create([
    { campaignId: campaign._id, assetId: assets[0]._id, expectedSiteId: siteA._id, status: 'VERIFIED_CORRECT' },
    { campaignId: campaign._id, assetId: assets[1]._id, expectedSiteId: siteA._id, status: 'PENDING' }
  ]);

  console.log('✅ Enterprise Seed completed successfully!');
  console.log('🔑 Login Credentials: Username: admin | Password: Admin@123');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed Error:', err);
  process.exit(1);
});
