import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Company } from '../models/Company.js';
import { Site, Building, Floor, Room } from '../models/Location.js';
import { Department } from '../models/Department.js';
import { CostCenter } from '../models/CostCenter.js';
import { Employee } from '../models/Employee.js';
import { Category } from '../models/Category.js';
import { Manufacturer } from '../models/Manufacturer.js';
import { AssetModel } from '../models/Model.js';
import { Asset } from '../models/Asset.js';
import { AssetBookValue } from '../models/AssetBookValue.js';

export async function ensureDefaultSeed() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('🌱 No users found in database. Auto-seeding initial data...');

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
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // 2. Company & Sites
    const company = await Company.create({
      code: 'CMP-GLOBAL',
      name: 'Infotatwaa Enterprise Corp',
      currency: 'USD',
      taxId: 'TX-99887766'
    });

    const siteA = await Site.create({ companyId: company._id, code: 'SITE-HQ', name: 'Global HQ Campus', city: 'San Francisco', country: 'USA' });
    const bldgA = await Building.create({ siteId: siteA._id, code: 'BLDG-A', name: 'Executive Tower A' });
    const floor1 = await Floor.create({ buildingId: bldgA._id, code: 'FL-01', name: 'Floor 1 Lobby & Server Room', floorNumber: 1 });
    const roomServer = await Room.create({ floorId: floor1._id, code: 'RM-101', name: 'Data Center Server Room 101', roomType: 'DataCenter' });

    // 3. User Accounts for all 10 Roles
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
        siteId: siteA._id,
        active: true
      });
      if (u.roleCode === 'SYS_ADMIN') adminUser = createdUser;
    }

    const employee1 = await Employee.create({
      employeeCode: 'EMP-101',
      fullName: 'David Miller',
      email: 'david.m@infotatwaa.com',
      companyId: company._id
    });

    // 4. Categories & Assets
    const catIT = await Category.create({ code: 'CAT-IT', name: 'IT Infrastructure & Compute', defaultUsefulLifeMonths: 36 });
    const mfrDell = await Manufacturer.create({ name: 'Dell Technologies', website: 'https://dell.com' });
    const modelDell = await AssetModel.create({
      modelNumber: 'LAT-5540',
      name: 'Dell Latitude 5540 i7 32GB',
      manufacturerId: mfrDell._id,
      categoryId: catIT._id
    });

    const asset1 = await Asset.create({
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
    });

    await AssetBookValue.create({
      assetId: asset1._id,
      bookType: 'CORPORATE',
      capitalizationDate: new Date(),
      capitalizationValue: asset1.acquisitionValue,
      usefulLifeMonths: 60,
      depreciationMethod: 'STRAIGHT_LINE',
      residualValue: 0,
      accumulatedDepreciation: 150.00,
      netBookValue: Number(asset1.acquisitionValue) - 150.00
    });

    console.log('✅ Auto-seeding completed successfully! Login with admin / Admin@123');
  } catch (err) {
    console.error('❌ Auto-seeding failed:', err.message);
  }
}
