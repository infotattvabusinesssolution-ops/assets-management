import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { connectDB, isDbConnected } from '../config/db.js';

export async function masterSeedAll() {
  console.log('🌱 Starting Comprehensive Enterprise FAMS Master Seeding...');
  await connectDB();

  if (!isDbConnected()) {
    console.error('❌ Cannot seed: Database is not connected.');
    process.exit(1);
  }

  // 1. Roles
  console.log('👑 Seeding Roles...');
  const rolesData = [
    { name: 'System Administrator', code: 'SYS_ADMIN', permissions: JSON.stringify(['*']), isSystem: true },
    { name: 'Asset Administrator', code: 'ASSET_ADMIN', permissions: JSON.stringify(['ASSETS_VIEW', 'ASSETS_CREATE', 'ASSETS_EDIT', 'ASSETS_TRANSITION', 'MOVEMENTS_VIEW', 'MOVEMENTS_APPROVE']) },
    { name: 'Finance Asset Controller', code: 'FINANCE', permissions: JSON.stringify(['ASSETS_VIEW', 'FINANCE_VIEW', 'FINANCE_RUN', 'REPORTS_VIEW']) },
    { name: 'IT Asset Manager', code: 'IT_MANAGER', permissions: JSON.stringify(['ASSETS_VIEW', 'DISCOVERY_VIEW', 'DISCOVERY_MATCH', 'MAPS_VIEW']) },
    { name: 'Facilities Manager', code: 'FACILITIES', permissions: JSON.stringify(['ASSETS_VIEW', 'MAPS_VIEW', 'MAPS_EDIT', 'MAINTENANCE_VIEW']) },
    { name: 'Store Receiving', code: 'RECEIVING', permissions: JSON.stringify(['RECEIVING_VIEW', 'RECEIVING_CREATE', 'TAGGING_VIEW']) },
    { name: 'Custodian', code: 'CUSTODIAN', permissions: JSON.stringify(['MY_ASSETS_VIEW', 'ASSETS_VIEW', 'MOVEMENTS_VIEW']) },
    { name: 'Maintenance Technician', code: 'TECHNICIAN', permissions: JSON.stringify(['WORK_ORDERS_VIEW', 'WORK_ORDERS_EDIT']) },
    { name: 'Auditor', code: 'AUDITOR', permissions: JSON.stringify(['ASSETS_VIEW', 'AUDIT_VIEW', 'STOCKTAKES_VIEW', 'REPORTS_VIEW']) },
    { name: 'Management', code: 'MANAGEMENT', permissions: JSON.stringify(['REPORTS_VIEW', 'DASHBOARD_VIEW']) }
  ];

  for (const r of rolesData) {
    const existing = await prisma.role.findFirst({ where: { code: r.code } });
    if (!existing) {
      await prisma.role.create({ data: r });
    }
  }

  const allRoles = await prisma.role.findMany();
  const sysAdminRole = allRoles.find(r => r.code === 'SYS_ADMIN') || allRoles[0];

  // 2. Company
  console.log('🏢 Seeding Company...');
  let company = await prisma.company.findFirst({ where: { code: 'CMP-GLOBAL' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        code: 'CMP-GLOBAL',
        name: 'Infotatwaa Enterprise Corp',
        currency: 'AED',
        taxId: 'TX-99887766'
      }
    });
  }

  // 3. Multi-Site Location Hierarchy
  console.log('📍 Seeding Sites, Buildings, Floors, Rooms & Zones...');
  const sitesData = [
    { code: 'SITE-HQ', name: 'Dubai HQ Campus', city: 'Dubai', country: 'United Arab Emirates' },
    { code: 'SITE-AUH', name: 'Abu Dhabi Operations Hub', city: 'Abu Dhabi', country: 'United Arab Emirates' },
    { code: 'SITE-SHJ', name: 'Sharjah Distribution Center', city: 'Sharjah', country: 'United Arab Emirates' }
  ];

  const sites = [];
  for (const s of sitesData) {
    let site = await prisma.site.findFirst({ where: { companyId: company.id, code: s.code } });
    if (!site) {
      site = await prisma.site.create({
        data: { ...s, companyId: company.id, active: true }
      });
    }
    sites.push(site);
  }

  const siteHQ = sites[0];
  const siteAUH = sites[1];
  const siteSHJ = sites[2];

  // Buildings
  const buildingsData = [
    { siteId: siteHQ.id, code: 'BLDG-A', name: 'Executive Tower A' },
    { siteId: siteHQ.id, code: 'BLDG-B', name: 'Operations Block B' },
    { siteId: siteAUH.id, code: 'BLDG-AUH-1', name: 'Al Maryah Financial Tower' },
    { siteId: siteSHJ.id, code: 'BLDG-SHJ-1', name: 'Logistics Warehouse Hub C' }
  ];

  const buildings = [];
  for (const b of buildingsData) {
    let bldg = await prisma.building.findFirst({ where: { siteId: b.siteId, code: b.code } });
    if (!bldg) {
      bldg = await prisma.building.create({
        data: { ...b, active: true }
      });
    }
    buildings.push(bldg);
  }

  const bldgA = buildings[0];
  const bldgB = buildings[1];

  // Floors
  const floorsData = [
    { buildingId: bldgA.id, code: 'FL-01', name: 'Floor 1 Lobby & Server Room', floorNumber: 1 },
    { buildingId: bldgA.id, code: 'FL-02', name: 'Floor 2 Executive Suites', floorNumber: 2 },
    { buildingId: bldgA.id, code: 'FL-03', name: 'Floor 3 Workstation Area', floorNumber: 3 },
    { buildingId: bldgB.id, code: 'FL-B-GF', name: 'Ground Floor Operations & Store', floorNumber: 0 },
    { buildingId: bldgB.id, code: 'FL-B-01', name: 'Floor 1 IT Support Desk', floorNumber: 1 }
  ];

  const floors = [];
  for (const f of floorsData) {
    let flr = await prisma.floor.findFirst({ where: { buildingId: f.buildingId, code: f.code } });
    if (!flr) {
      flr = await prisma.floor.create({
        data: { ...f, active: true }
      });
    }
    floors.push(flr);
  }

  const floor1 = floors[0];
  const floor2 = floors[1];
  const floor3 = floors[2];
  const floorB0 = floors[3];

  // Rooms
  const roomsData = [
    { floorId: floor1.id, code: 'RM-101', name: 'Data Center Server Room 101', roomType: 'DataCenter' },
    { floorId: floor2.id, code: 'RM-205', name: 'Executive Suite 205', roomType: 'Office' },
    { floorId: floor3.id, code: 'RM-PLANT', name: 'Plant Room', roomType: 'Utility' },
    { floorId: floor3.id, code: 'RM-312', name: 'Room 312 Workstation Area', roomType: 'Office' },
    { floorId: floorB0.id, code: 'RM-STORE', name: 'IT Central Store Room', roomType: 'Storage' },
    { floorId: floorB0.id, code: 'RM-DISPATCH', name: 'Logistics Receiving Bay', roomType: 'Storage' }
  ];

  const rooms = [];
  for (const r of roomsData) {
    let rm = await prisma.room.findFirst({ where: { floorId: r.floorId, code: r.code } });
    if (!rm) {
      rm = await prisma.room.create({
        data: { ...r, active: true }
      });
    }
    rooms.push(rm);
  }

  const roomServer = rooms[0];
  const roomOffice = rooms[1];
  const roomPlant = rooms[2];
  const room312 = rooms[3];
  const roomStore = rooms[4];

  // 4. Departments & Cost Centers
  console.log('👥 Seeding Departments & Cost Centers...');
  const deptsData = [
    { code: 'DEP-IT', name: 'Information Technology' },
    { code: 'DEP-FAC', name: 'Facilities & Infrastructure' },
    { code: 'DEP-FIN', name: 'Finance & Accounts' },
    { code: 'DEP-OPS', name: 'Supply Chain & Operations' },
    { code: 'DEP-HR', name: 'Human Resources' }
  ];

  const departments = [];
  for (const d of deptsData) {
    let dept = await prisma.department.findFirst({ where: { companyId: company.id, code: d.code } });
    if (!dept) {
      dept = await prisma.department.create({
        data: { ...d, companyId: company.id, active: true }
      });
    }
    departments.push(dept);
  }

  const deptIT = departments[0];
  const deptFac = departments[1];
  const deptFin = departments[2];

  const costCentersData = [
    { code: 'CC-IT01', name: 'IT Operational Capex' },
    { code: 'CC-FAC01', name: 'Facilities Infrastructure Capex' },
    { code: 'CC-FIN01', name: 'Corporate Finance & Audit' },
    { code: 'CC-OPS01', name: 'Logistics & Supply Chain' }
  ];

  const costCenters = [];
  for (const c of costCentersData) {
    let cc = await prisma.costCenter.findFirst({ where: { companyId: company.id, code: c.code } });
    if (!cc) {
      cc = await prisma.costCenter.create({
        data: { ...c, companyId: company.id, active: true }
      });
    }
    costCenters.push(cc);
  }

  // 5. Employees / Custodians
  console.log('👤 Seeding Employees / Custodians...');
  const employeesData = [
    { employeeCode: 'EMP-101', fullName: 'John Doe', email: 'john.doe@infotatwaa.com', departmentId: deptIT.id },
    { employeeCode: 'EMP-102', fullName: 'David Miller', email: 'david.m@infotatwaa.com', departmentId: deptIT.id },
    { employeeCode: 'EMP-103', fullName: 'Jane Smith', email: 'jane.smith@infotatwaa.com', departmentId: deptFac.id },
    { employeeCode: 'EMP-104', fullName: 'Ahmed Khan', email: 'ahmed.khan@infotatwaa.com', departmentId: deptFac.id },
    { employeeCode: 'EMP-105', fullName: 'Sara Ali', email: 'sara.ali@infotatwaa.com', departmentId: deptFin.id },
    { employeeCode: 'EMP-106', fullName: 'Omar Saleh', email: 'omar.saleh@infotatwaa.com', departmentId: deptIT.id },
    { employeeCode: 'EMP-107', fullName: 'Farhan Zaidi', email: 'farhan.z@infotatwaa.com', departmentId: deptFac.id },
    { employeeCode: 'EMP-108', fullName: 'Fatima Al-Nuaimi', email: 'fatima.n@infotatwaa.com', departmentId: departments[4].id }
  ];

  const employees = [];
  for (const e of employeesData) {
    let emp = await prisma.employee.findFirst({ where: { employeeCode: e.employeeCode } });
    if (!emp) {
      emp = await prisma.employee.create({
        data: { ...e, companyId: company.id, active: true }
      });
    }
    employees.push(emp);
  }

  const empJohn = employees[0];
  const empDavid = employees[1];
  const empJane = employees[2];
  const empAhmed = employees[3];
  const empSara = employees[4];

  // 6. Users
  console.log('🔑 Seeding Users with Password@123 / Admin@123...');
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const usersData = [
    { username: 'admin', email: 'admin@infotatwaa.com', fullName: 'System Administrator', roleCode: 'SYS_ADMIN', departmentId: deptIT.id },
    { username: 'asset_admin', email: 'assetadmin@infotatwaa.com', fullName: 'Asset Administrator', roleCode: 'ASSET_ADMIN', departmentId: deptIT.id },
    { username: 'finance', email: 'finance@infotatwaa.com', fullName: 'Finance Controller', roleCode: 'FINANCE', departmentId: deptFin.id },
    { username: 'it_manager', email: 'itmanager@infotatwaa.com', fullName: 'IT Asset Manager', roleCode: 'IT_MANAGER', departmentId: deptIT.id },
    { username: 'facilities', email: 'facilities@infotatwaa.com', fullName: 'Facilities Manager', roleCode: 'FACILITIES', departmentId: deptFac.id },
    { username: 'receiving', email: 'receiving@infotatwaa.com', fullName: 'Store Receiving Lead', roleCode: 'RECEIVING', departmentId: deptIT.id },
    { username: 'custodian', email: 'custodian@infotatwaa.com', fullName: 'John Doe', roleCode: 'CUSTODIAN', departmentId: deptIT.id },
    { username: 'technician', email: 'technician@infotatwaa.com', fullName: 'Maintenance Technician', roleCode: 'TECHNICIAN', departmentId: deptFac.id },
    { username: 'auditor', email: 'auditor@infotatwaa.com', fullName: 'Compliance Auditor', roleCode: 'AUDITOR', departmentId: deptFin.id },
    { username: 'management', email: 'management@infotatwaa.com', fullName: 'Executive Management', roleCode: 'MANAGEMENT', departmentId: deptIT.id }
  ];

  let adminUser = null;
  for (const u of usersData) {
    const role = allRoles.find(r => r.code === u.roleCode) || sysAdminRole;
    let user = await prisma.user.findFirst({ where: { username: u.username } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: u.username,
          email: u.email,
          fullName: u.fullName,
          passwordHash,
          roleId: role.id,
          companyId: company.id,
          siteId: siteHQ.id,
          departmentId: u.departmentId,
          active: true
        }
      });
    } else {
      // Ensure password hash is valid
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, active: true }
      });
    }
    if (u.username === 'admin') adminUser = user;
  }

  // 7. Categories, Manufacturers & Models
  console.log('🏷️ Seeding Categories, Manufacturers & Asset Models...');
  const categoriesData = [
    { code: 'CAT-LAPTOP', name: 'Laptop', defaultUsefulLifeMonths: 36 },
    { code: 'CAT-DESKTOP', name: 'Desktop', defaultUsefulLifeMonths: 48 },
    { code: 'CAT-SERVER', name: 'Server', defaultUsefulLifeMonths: 60 },
    { code: 'CAT-PRINTER', name: 'Printer', defaultUsefulLifeMonths: 36 },
    { code: 'CAT-DISPLAY', name: 'Monitor', defaultUsefulLifeMonths: 36 },
    { code: 'CAT-VEHICLE', name: 'Vehicle', defaultUsefulLifeMonths: 60 },
    { code: 'CAT-HVAC', name: 'HVAC Unit', defaultUsefulLifeMonths: 120 },
    { code: 'CAT-GEN', name: 'Generator', defaultUsefulLifeMonths: 120 },
    { code: 'CAT-FURN', name: 'Furniture', defaultUsefulLifeMonths: 60 },
    { code: 'CAT-CHILLER', name: 'Chiller Plant', defaultUsefulLifeMonths: 180 },
    { code: 'CAT-ACCESS', name: 'Accessory', defaultUsefulLifeMonths: 24 }
  ];

  const categories = [];
  for (const c of categoriesData) {
    let cat = await prisma.category.findFirst({ where: { code: c.code } });
    if (!cat) {
      cat = await prisma.category.create({ data: { ...c, active: true } });
    }
    categories.push(cat);
  }

  const mfrsData = [
    { name: 'Dell Technologies', website: 'https://dell.com' },
    { name: 'HP Inc', website: 'https://hp.com' },
    { name: 'Apple', website: 'https://apple.com' },
    { name: 'Lenovo', website: 'https://lenovo.com' },
    { name: 'Samsung', website: 'https://samsung.com' },
    { name: 'Cisco Systems', website: 'https://cisco.com' },
    { name: 'Carrier Corporation', website: 'https://carrier.com' },
    { name: 'Caterpillar Inc', website: 'https://cat.com' },
    { name: 'Toyota Motors', website: 'https://toyota.com' }
  ];

  const manufacturers = [];
  for (const m of mfrsData) {
    let mfr = await prisma.manufacturer.findFirst({ where: { name: m.name } });
    if (!mfr) {
      mfr = await prisma.manufacturer.create({ data: { ...m, active: true } });
    }
    manufacturers.push(mfr);
  }

  const modelsData = [
    { modelNumber: 'LAT-7450', name: 'Dell Latitude 7450', mfrIdx: 0, catIdx: 0 },
    { modelNumber: 'LAT-5540', name: 'Dell Latitude 5540', mfrIdx: 0, catIdx: 0 },
    { modelNumber: 'MBP-16', name: 'Apple MacBook Pro 16 M3 Max', mfrIdx: 2, catIdx: 0 },
    { modelNumber: 'PE-R750', name: 'Dell PowerEdge R750 Rack Server', mfrIdx: 0, catIdx: 2 },
    { modelNumber: 'LJ-M404', name: 'HP LaserJet Pro M404dn', mfrIdx: 1, catIdx: 3 },
    { modelNumber: 'ODY-G7', name: 'Samsung Odyssey G7 32"', mfrIdx: 4, catIdx: 4 },
    { modelNumber: 'HILUX-4X4', name: 'Toyota Hilux 4x4 Double Cab', mfrIdx: 8, catIdx: 5 },
    { modelNumber: 'AQ-19XR', name: 'Carrier AquaEdge 19XR Centrifugal Chiller', mfrIdx: 6, catIdx: 9 },
    { modelNumber: 'CAT-C15', name: 'CAT C15 500kVA Diesel Generator', mfrIdx: 7, catIdx: 7 }
  ];

  const models = [];
  for (const mod of modelsData) {
    let model = await prisma.assetModel.findFirst({ where: { modelNumber: mod.modelNumber } });
    if (!model) {
      model = await prisma.assetModel.create({
        data: {
          modelNumber: mod.modelNumber,
          name: mod.name,
          manufacturerId: manufacturers[mod.mfrIdx].id,
          categoryId: categories[mod.catIdx].id,
          active: true
        }
      });
    }
    models.push(model);
  }

  // 8. Assets
  console.log('💻 Seeding Core Real Assets with Custody Assignments...');
  const assetDefinitions = [
    {
      assetId: 'AST-2026-91417',
      tagNumber: 'QR-AST-2026-91417',
      barcode: 'QR-AST-2026-91417',
      rfidEpc: 'E2801160600012348',
      serialNumber: 'DL7450-92118',
      description: 'Dell Latitude 7450 laptop for IT department use.',
      categoryIdx: 0,
      mfrIdx: 0,
      modelIdx: 0,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: room312.id,
      departmentId: deptIT.id,
      custodianId: empJohn.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 4500.00
    },
    {
      assetId: 'AST-2026-91418',
      tagNumber: 'QR-AST-2026-91418',
      barcode: 'QR-AST-2026-91418',
      rfidEpc: 'E2801160600012349',
      serialNumber: 'DL5540-88124',
      description: 'Dell Latitude 5540 Developer Laptop',
      categoryIdx: 0,
      mfrIdx: 0,
      modelIdx: 1,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: room312.id,
      departmentId: deptIT.id,
      custodianId: empDavid.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'New',
      acquisitionValue: 5200.00
    },
    {
      assetId: 'AST-2026-91419',
      tagNumber: 'QR-AST-2026-91419',
      barcode: 'QR-AST-2026-91419',
      rfidEpc: 'E2801160600012350',
      serialNumber: 'MBP16-99210',
      description: 'MacBook Pro 16 M3 Max Designer Workstation',
      categoryIdx: 0,
      mfrIdx: 2,
      modelIdx: 2,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor2.id,
      roomId: roomOffice.id,
      departmentId: deptIT.id,
      custodianId: empJohn.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 12500.00
    },
    {
      assetId: 'AST-2026-91420',
      tagNumber: 'QR-AST-2026-91420',
      barcode: 'QR-AST-2026-91420',
      rfidEpc: 'E2801160600012351',
      serialNumber: 'SN-R750-001',
      description: 'Dell PowerEdge R750 Production Database Host',
      categoryIdx: 2,
      mfrIdx: 0,
      modelIdx: 3,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor1.id,
      roomId: roomServer.id,
      departmentId: deptIT.id,
      custodianId: empDavid.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 34000.00
    },
    {
      assetId: 'AST-2026-91421',
      tagNumber: 'QR-AST-2026-91421',
      barcode: 'QR-AST-2026-91421',
      rfidEpc: 'E2801160600012352',
      serialNumber: 'HPLJ-404-921',
      description: 'HP LaserJet Pro M404 Network Printer',
      categoryIdx: 3,
      mfrIdx: 1,
      modelIdx: 4,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: room312.id,
      departmentId: deptIT.id,
      custodianId: empJohn.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 1450.00
    },
    {
      assetId: 'AST-2026-91422',
      tagNumber: 'QR-AST-2026-91422',
      barcode: 'QR-AST-2026-91422',
      rfidEpc: 'E2801160600012353',
      serialNumber: 'SAM-G7-4921',
      description: 'Samsung Odyssey G7 32" Curved 4K Monitor',
      categoryIdx: 4,
      mfrIdx: 4,
      modelIdx: 5,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: room312.id,
      departmentId: deptIT.id,
      custodianId: empJohn.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 2800.00
    },
    {
      assetId: 'AST-2026-91423',
      tagNumber: 'QR-AST-2026-91423',
      barcode: 'QR-AST-2026-91423',
      rfidEpc: 'E2801160600012354',
      serialNumber: 'TOY-HLX-4912',
      description: 'Toyota Hilux 4x4 Site Logistics Pickup',
      categoryIdx: 5,
      mfrIdx: 8,
      modelIdx: 6,
      siteId: siteSHJ.id,
      buildingId: buildings[3].id,
      floorId: null,
      roomId: null,
      departmentId: deptFac.id,
      custodianId: empAhmed.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 115000.00
    },
    {
      assetId: 'AST-2026-91424',
      tagNumber: 'QR-AST-2026-91424',
      barcode: 'QR-AST-2026-91424',
      rfidEpc: 'E2801160600012355',
      serialNumber: 'CAR-CHILL-912',
      description: 'Carrier AquaEdge 19XR Central HVAC Chiller',
      categoryIdx: 9,
      mfrIdx: 6,
      modelIdx: 7,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: roomPlant.id,
      departmentId: deptFac.id,
      custodianId: empJane.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 450000.00
    },
    {
      assetId: 'AST-2026-91425',
      tagNumber: 'QR-AST-2026-91425',
      barcode: 'QR-AST-2026-91425',
      rfidEpc: 'E2801160600012356',
      serialNumber: 'CAT-GEN-500KVA',
      description: 'CAT C15 500kVA Diesel Standby Generator',
      categoryIdx: 7,
      mfrIdx: 7,
      modelIdx: 8,
      siteId: siteHQ.id,
      buildingId: bldgA.id,
      floorId: floor3.id,
      roomId: roomPlant.id,
      departmentId: deptFac.id,
      custodianId: empJane.id,
      lifecycleStatus: 'IN_SERVICE',
      condition: 'Good',
      acquisitionValue: 285000.00
    }
  ];

  const seededAssets = [];
  for (const def of assetDefinitions) {
    let asset = await prisma.asset.findFirst({ where: { assetId: def.assetId } });
    if (!asset) {
      asset = await prisma.asset.create({
        data: {
          assetId: def.assetId,
          tagNumber: def.tagNumber,
          barcode: def.barcode,
          qrCode: def.tagNumber,
          rfidEpc: def.rfidEpc,
          serialNumber: def.serialNumber,
          description: def.description,
          categoryId: categories[def.categoryIdx].id,
          manufacturerId: manufacturers[def.mfrIdx].id,
          modelId: models[def.modelIdx].id,
          siteId: def.siteId,
          buildingId: def.buildingId,
          floorId: def.floorId,
          roomId: def.roomId,
          departmentId: def.departmentId,
          custodianId: def.custodianId,
          companyId: company.id,
          lifecycleStatus: def.lifecycleStatus,
          condition: def.condition,
          acquisitionValue: def.acquisitionValue,
          currency: 'AED',
          createdByUserId: adminUser?.id,
          active: true
        }
      });
    } else {
      // Ensure relations are up to date
      asset = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          custodianId: def.custodianId,
          departmentId: def.departmentId,
          siteId: def.siteId,
          buildingId: def.buildingId,
          floorId: def.floorId,
          roomId: def.roomId,
          lifecycleStatus: def.lifecycleStatus
        }
      });
    }
    seededAssets.push(asset);
  }

  // 9. Custody Assignments & Movement History in DB
  console.log('📦 Seeding Asset Transfers & History in Database...');
  const transferDefinitions = [
    {
      transferNumber: 'TRF-2026-001',
      assetId: seededAssets[0].id,
      transferType: 'Location Transfer',
      fromSiteId: siteHQ.id,
      toSiteId: siteAUH.id,
      fromCustodianId: empDavid.id,
      toCustodianId: empJohn.id,
      status: 'COMPLETED',
      reason: 'Relocation to Abu Dhabi Operations Hub',
      requestedByUserId: adminUser?.id
    },
    {
      transferNumber: 'TRF-2026-002',
      assetId: seededAssets[1].id,
      transferType: 'Custodian Reassignment',
      fromSiteId: siteHQ.id,
      toSiteId: siteHQ.id,
      fromCustodianId: empDavid.id,
      toCustodianId: empJohn.id,
      status: 'COMPLETED',
      reason: 'New developer onboarded to IT Department',
      requestedByUserId: adminUser?.id
    },
    {
      transferNumber: 'TRF-2026-003',
      assetId: seededAssets[2].id,
      transferType: 'Location Transfer',
      fromSiteId: siteHQ.id,
      toSiteId: siteHQ.id,
      fromCustodianId: empJohn.id,
      toCustodianId: empSara.id,
      status: 'PENDING_APPROVAL',
      reason: 'Finance workstation upgrade request',
      requestedByUserId: adminUser?.id
    },
    {
      transferNumber: 'TRF-2026-004',
      assetId: seededAssets[4].id,
      transferType: 'Inter-Site Transfer',
      fromSiteId: siteHQ.id,
      toSiteId: siteSHJ.id,
      fromCustodianId: empJohn.id,
      toCustodianId: empAhmed.id,
      status: 'IN_TRANSIT',
      reason: 'Logistics center printing support',
      requestedByUserId: adminUser?.id
    }
  ];

  for (const t of transferDefinitions) {
    const existing = await prisma.assetTransfer.findFirst({ where: { transferNumber: t.transferNumber } });
    if (!existing) {
      await prisma.assetTransfer.create({
        data: {
          transferNumber: t.transferNumber,
          assetId: t.assetId,
          transferType: t.transferType,
          fromCompanyId: company.id,
          toCompanyId: company.id,
          fromSiteId: t.fromSiteId,
          toSiteId: t.toSiteId,
          fromCustodianId: t.fromCustodianId,
          toCustodianId: t.toCustodianId,
          status: t.status,
          reason: t.reason,
          requestedByUserId: t.requestedByUserId || adminUser?.id,
          dispatchDate: new Date(),
          receiveDate: t.status === 'COMPLETED' ? new Date() : null
        }
      });
    }
  }

  // 10. Summary
  const counts = {
    companies: await prisma.company.count(),
    sites: await prisma.site.count(),
    buildings: await prisma.building.count(),
    floors: await prisma.floor.count(),
    rooms: await prisma.room.count(),
    departments: await prisma.department.count(),
    costCenters: await prisma.costCenter.count(),
    employees: await prisma.employee.count(),
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    categories: await prisma.category.count(),
    manufacturers: await prisma.manufacturer.count(),
    assetModels: await prisma.assetModel.count(),
    assets: await prisma.asset.count(),
    transfers: await prisma.assetTransfer.count()
  };

  console.log('✅ Enterprise FAMS Master Seeding Completed Successfully!');
  console.log('📊 Current Live Database Record Counts:');
  console.log(JSON.stringify(counts, null, 2));
}

if (process.argv[1]?.endsWith('master-seed-all.js')) {
  masterSeedAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Master Seeding Error:', err);
      process.exit(1);
    });
}
