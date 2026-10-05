import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';
import { connectDB, isDbConnected } from '../config/db.js';

export async function seedDynamicAssets() {
  console.log('🌱 Starting Dynamic Asset & Hierarchy Seeding for Enterprise FAMS...');
  await connectDB();

  if (!isDbConnected()) {
    console.error('❌ Cannot seed: Database is not connected.');
    return;
  }

  // 1. Get or create Admin User
  let adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  const adminUserId = adminUser?.id || null;
  console.log(`👤 Using Admin User ID: ${adminUserId}`);

  // 2. Company & Sites
  let company = await prisma.company.findFirst({ where: { code: 'CMP-GLOBAL' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        code: 'CMP-GLOBAL',
        name: 'Infotatwaa Enterprise Corp',
        currency: 'USD',
        taxId: 'TX-99887766'
      }
    });
  }

  let siteHQ = await prisma.site.findFirst({ where: { companyId: company.id, code: 'SITE-HQ' } });
  if (!siteHQ) {
    siteHQ = await prisma.site.create({
      data: {
        companyId: company.id,
        code: 'SITE-HQ',
        name: 'Dubai HQ Campus',
        city: 'Dubai',
        country: 'United Arab Emirates'
      }
    });
  }

  let bldgA = await prisma.building.findFirst({ where: { siteId: siteHQ.id, code: 'BLDG-A' } });
  if (!bldgA) {
    bldgA = await prisma.building.create({
      data: { siteId: siteHQ.id, code: 'BLDG-A', name: 'Building A' }
    });
  }

  let floor3 = await prisma.floor.findFirst({ where: { buildingId: bldgA.id, code: 'FL-03' } });
  if (!floor3) {
    floor3 = await prisma.floor.create({
      data: { buildingId: bldgA.id, code: 'FL-03', name: 'Floor 3', floorNumber: 3 }
    });
  }

  let roomPlant = await prisma.room.findFirst({ where: { floorId: floor3.id, code: 'RM-PLANT' } });
  if (!roomPlant) {
    roomPlant = await prisma.room.create({
      data: { floorId: floor3.id, code: 'RM-PLANT', name: 'Plant Room', roomType: 'Utility' }
    });
  }

  let room312 = await prisma.room.findFirst({ where: { floorId: floor3.id, code: 'RM-312' } });
  if (!room312) {
    room312 = await prisma.room.create({
      data: { floorId: floor3.id, code: 'RM-312', name: 'Room 312 Workstation Area', roomType: 'Office' }
    });
  }
  console.log('📍 Site, Building, Floor & Rooms resolved.');

  // 3. Departments & Cost Centers
  let deptIT = await prisma.department.findFirst({ where: { companyId: company.id, code: 'DEP-IT' } });
  if (!deptIT) {
    deptIT = await prisma.department.create({
      data: { companyId: company.id, code: 'DEP-IT', name: 'Information Technology' }
    });
  }

  let deptFacilities = await prisma.department.findFirst({ where: { companyId: company.id, code: 'DEP-FAC' } });
  if (!deptFacilities) {
    deptFacilities = await prisma.department.create({
      data: { companyId: company.id, code: 'DEP-FAC', name: 'Facilities & Infrastructure' }
    });
  }

  let costCenterIT = await prisma.costCenter.findFirst({ where: { companyId: company.id, code: 'CC-IT01' } });
  if (!costCenterIT) {
    costCenterIT = await prisma.costCenter.create({
      data: { companyId: company.id, code: 'CC-IT01', name: 'IT Operational Capex' }
    });
  }

  // 4. Employees / Custodians
  let empJohn = await prisma.employee.findFirst({ where: { employeeCode: 'EMP-JOHN' } });
  if (!empJohn) {
    empJohn = await prisma.employee.create({
      data: {
        employeeCode: 'EMP-JOHN',
        fullName: 'John Doe',
        email: 'john.doe@infotatwaa.com',
        companyId: company.id,
        departmentId: deptIT.id,
        costCenterId: costCenterIT.id
      }
    });
  }

  let empFacilities = await prisma.employee.findFirst({ where: { employeeCode: 'EMP-FAC' } });
  if (!empFacilities) {
    empFacilities = await prisma.employee.create({
      data: {
        employeeCode: 'EMP-FAC',
        fullName: 'Facilities Team',
        email: 'facilities@infotatwaa.com',
        companyId: company.id,
        departmentId: deptFacilities.id
      }
    });
  }
  console.log('👥 Employees & Custodians resolved.');

  // 5. Categories
  const categoriesToEnsure = [
    { code: 'HVAC-SYS', name: 'HVAC System', defaultUsefulLifeMonths: 120, isSerialized: true },
    { code: 'HVAC-EQP', name: 'HVAC Equipment', defaultUsefulLifeMonths: 84, isSerialized: true },
    { code: 'HVAC-CMP', name: 'HVAC Component', defaultUsefulLifeMonths: 60, isSerialized: true },
    { code: 'IT-LAPTOP', name: 'Laptop', defaultUsefulLifeMonths: 36, isSerialized: true },
    { code: 'IT-MOBILE', name: 'Mobile Device', defaultUsefulLifeMonths: 24, isSerialized: true },
    { code: 'IT-MONITOR', name: 'Monitor', defaultUsefulLifeMonths: 48, isSerialized: true },
    { code: 'IT-TABLET', name: 'Tablet', defaultUsefulLifeMonths: 36, isSerialized: true },
    { code: 'IT-INFRA', name: 'IT Infrastructure', defaultUsefulLifeMonths: 60, isSerialized: true },
    { code: 'FURNITURE', name: 'Furniture', defaultUsefulLifeMonths: 84, isSerialized: false },
    { code: 'PRINTER', name: 'Printer', defaultUsefulLifeMonths: 48, isSerialized: true }
  ];

  const catMap = {};
  for (const c of categoriesToEnsure) {
    let cat = await prisma.category.findFirst({ where: { OR: [{ code: c.code }, { name: c.name }] } });
    if (!cat) {
      cat = await prisma.category.create({ data: c });
    }
    catMap[c.code] = cat;
    catMap[c.name] = cat;
  }
  console.log('🏷️ Categories resolved.');

  // 6. Manufacturers
  const mfrNames = ['Dell', 'Trane', 'Copeland', 'Baltimore Aircoil', 'Grundfos', 'Apple', 'Microsoft', 'Samsung', 'Cisco', 'HP', 'Herman Miller'];
  const mfrMap = {};
  for (const name of mfrNames) {
    let mfr = await prisma.manufacturer.findFirst({ where: { name } });
    if (!mfr) {
      mfr = await prisma.manufacturer.create({
        data: { name, website: `https://www.${name.toLowerCase().replace(/ /g, '')}.com` }
      });
    }
    mfrMap[name] = mfr;
  }
  console.log('🏭 Manufacturers resolved.');

  // Helper to upsert asset
  async function saveAsset(data) {
    if (!data.tagNumber) {
      data.tagNumber = `TAG-${data.assetId}`;
    }
    const existing = await prisma.asset.findFirst({
      where: { assetId: data.assetId }
    });

    if (existing) {
      return await prisma.asset.update({
        where: { id: existing.id },
        data: {
          ...data,
          updatedByUserId: adminUserId
        }
      });
    } else {
      const created = await prisma.asset.create({
        data: {
          ...data,
          createdByUserId: adminUserId,
          updatedByUserId: adminUserId
        }
      });

      // Corporate book value
      if (data.acquisitionValue) {
        const capVal = Number(data.acquisitionValue);
        const resVal = parseFloat((capVal * 0.1).toFixed(2));
        const existingBook = await prisma.assetBookValue.findFirst({
          where: { assetId: created.id, bookType: 'CORPORATE' }
        });
        if (!existingBook) {
          await prisma.assetBookValue.create({
            data: {
              assetId: created.id,
              bookType: 'CORPORATE',
              capitalizationDate: data.inServiceDate || new Date(),
              capitalizationValue: capVal,
              usefulLifeMonths: 48,
              residualValue: resVal,
              accumulatedDepreciation: 0,
              netBookValue: capVal
            }
          });
        }
      }

      // Initial transaction
      await prisma.assetTransaction.create({
        data: {
          assetId: created.id,
          transactionType: 'INITIAL_REGISTRATION',
          toStatus: created.lifecycleStatus,
          performedByUserId: adminUserId || 'usr-default',
          notes: `System registered asset [${created.assetId}] - ${created.description}`
        }
      });

      return created;
    }
  }

  // 7. Seed HVAC System Hierarchy:
  console.log('❄️ Seeding HVAC System Hierarchy...');
  // Root Level 1: AST-000100 Main Chiller Plant
  const chillerPlant = await saveAsset({
    assetId: 'AST-000100',
    description: 'Main Chiller Plant',
    categoryId: catMap['HVAC-SYS'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'CRITICAL',
    serialNumber: 'TRN-SYS-900',
    tagNumber: 'TAG-TRN-100',
    barcode: 'BC-TRN-100',
    qrCode: 'QR-TRN-100',
    rfidEpc: 'E28011700000001TRN100',
    acquisitionValue: 125000.00,
    currency: 'AED',
    poNumber: 'PO-2021-0091',
    supplierName: 'Trane Gulf HVAC Systems',
    purchaseDate: new Date('2021-01-15'),
    inServiceDate: new Date('2021-02-01'),
    parentAssetId: null
  });

  // Level 2 Child: AST-000101 Chiller Unit - 1
  const chiller1 = await saveAsset({
    assetId: 'AST-000101',
    description: 'Chiller Unit - 1',
    categoryId: catMap['HVAC-EQP'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'TRN-250-001',
    tagNumber: 'TAG-TRN-101',
    barcode: 'BC-TRN-101',
    qrCode: 'QR-TRN-101',
    rfidEpc: 'E28011700000001TRN101',
    acquisitionValue: 48000.00,
    currency: 'AED',
    poNumber: 'PO-2022-0044',
    purchaseDate: new Date('2022-01-12'),
    inServiceDate: new Date('2022-01-20'),
    parentAssetId: chillerPlant.id
  });

  // Level 3 Sub-components of Chiller 1
  await saveAsset({
    assetId: 'AST-000101-01',
    description: 'Compressor Unit A',
    categoryId: catMap['HVAC-CMP'].id,
    manufacturerId: mfrMap['Copeland'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'COP-15-881',
    tagNumber: 'TAG-COP-881',
    barcode: 'BC-COP-881',
    acquisitionValue: 8500.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chiller1.id
  });

  await saveAsset({
    assetId: 'AST-000101-02',
    description: 'Condenser Coil Module',
    categoryId: catMap['HVAC-CMP'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    serialNumber: 'TRN-CND-02',
    tagNumber: 'TAG-TRN-CND02',
    barcode: 'BC-TRN-CND02',
    acquisitionValue: 6200.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chiller1.id
  });

  await saveAsset({
    assetId: 'AST-000101-03',
    description: 'Symbio 800 Control Panel',
    categoryId: catMap['HVAC-CMP'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'SYM-800-441',
    tagNumber: 'TAG-SYM-441',
    barcode: 'BC-SYM-441',
    acquisitionValue: 4500.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chiller1.id
  });

  // Level 2 Child: AST-000102 Chiller Unit - 2
  const chiller2 = await saveAsset({
    assetId: 'AST-000102',
    description: 'Chiller Unit - 2',
    categoryId: catMap['HVAC-EQP'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'TRN-250-002',
    tagNumber: 'TAG-TRN-102',
    barcode: 'BC-TRN-102',
    qrCode: 'QR-TRN-102',
    acquisitionValue: 48000.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chillerPlant.id
  });

  // Level 3 Sub-components of Chiller 2
  await saveAsset({
    assetId: 'AST-000102-01',
    description: 'Compressor Unit B',
    categoryId: catMap['HVAC-CMP'].id,
    manufacturerId: mfrMap['Copeland'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'COP-15-882',
    acquisitionValue: 8500.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chiller2.id
  });

  await saveAsset({
    assetId: 'AST-000102-02',
    description: 'Condenser Secondary Coil',
    categoryId: catMap['HVAC-CMP'].id,
    manufacturerId: mfrMap['Trane'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    serialNumber: 'TRN-CND-03',
    acquisitionValue: 6200.00,
    currency: 'AED',
    purchaseDate: new Date('2022-01-12'),
    parentAssetId: chiller2.id
  });

  // Level 2 Child: AST-000103 Cooling Tower
  await saveAsset({
    assetId: 'AST-000103',
    description: 'Cooling Tower BAC FXV 400',
    categoryId: catMap['HVAC-EQP'].id,
    manufacturerId: mfrMap['Baltimore Aircoil'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'HIGH',
    serialNumber: 'BAC-400-99',
    acquisitionValue: 32000.00,
    currency: 'AED',
    purchaseDate: new Date('2021-02-10'),
    parentAssetId: chillerPlant.id
  });

  // Level 2 Child: AST-000104 Pump Set
  await saveAsset({
    assetId: 'AST-000104',
    description: 'Pump Set Grundfos TPE 100',
    categoryId: catMap['HVAC-EQP'].id,
    manufacturerId: mfrMap['Grundfos'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: roomPlant.id,
    custodianId: empFacilities.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    serialNumber: 'GRN-100-11',
    acquisitionValue: 14500.00,
    currency: 'AED',
    purchaseDate: new Date('2021-02-10'),
    parentAssetId: chillerPlant.id
  });

  // 8. Seed Workstations, Laptops & Mobile Assets (for Asset Edit & My Assets)
  console.log('💻 Seeding Workstations, Laptops & Mobile Assets...');
  // AST-000128: Dell Latitude 7450 (Primary asset in AssetEdit)
  await saveAsset({
    assetId: 'AST-000128',
    description: 'Dell Latitude 7450',
    categoryId: catMap['Laptop'].id,
    manufacturerId: mfrMap['Dell'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: room312.id,
    departmentId: deptIT.id,
    costCenterId: costCenterIT.id,
    custodianId: empJohn.id,
    assignedDate: new Date('2024-01-10'),
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    serialNumber: 'DL7450-92118',
    tagNumber: 'TAG-000128',
    barcode: 'QR-000128',
    qrCode: 'QR-000128',
    rfidEpc: 'E28011700000001A2B3C',
    rfidTid: 'TID-99018241',
    acquisitionValue: 4500.00,
    currency: 'AED',
    poNumber: 'PO-2024-00128',
    supplierName: 'Dell Technologies UAE',
    purchaseDate: new Date('2024-01-10'),
    inServiceDate: new Date('2024-01-15'),
    hostname: 'WKSTN-DL7450-01',
    ipAddress: '10.20.4.128',
    macAddress: '00:1A:2B:3C:4D:99',
    healthScore: 98,
    parentAssetId: null
  });

  // AST-000131: iPhone 15 Pro
  await saveAsset({
    assetId: 'AST-000131',
    description: 'iPhone 15 Pro',
    categoryId: catMap['Mobile Device'].id,
    manufacturerId: mfrMap['Apple'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: room312.id,
    custodianId: empJohn.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'LOW',
    serialNumber: 'IP15P-88192',
    tagNumber: 'TAG-000131',
    barcode: 'QR-000131',
    qrCode: 'QR-000131',
    acquisitionValue: 4000.00,
    currency: 'AED',
    purchaseDate: new Date('2024-01-12'),
    parentAssetId: null
  });

  // AST-000145: Ergonomic Chair
  await saveAsset({
    assetId: 'AST-000145',
    description: 'Ergonomic Chair',
    categoryId: catMap['Furniture'].id,
    manufacturerId: mfrMap['Herman Miller'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: room312.id,
    custodianId: empJohn.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'LOW',
    serialNumber: 'CH-2024-991',
    tagNumber: 'TAG-000145',
    barcode: 'BC-000145',
    acquisitionValue: 1200.00,
    currency: 'AED',
    purchaseDate: new Date('2024-01-15'),
    parentAssetId: null
  });

  // AST-000156: 27" Monitor
  await saveAsset({
    assetId: 'AST-000156',
    description: '27" Monitor UltraSharp',
    categoryId: catMap['Monitor'].id,
    manufacturerId: mfrMap['Dell'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: room312.id,
    custodianId: empJohn.id,
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    serialNumber: 'MON27-55123',
    tagNumber: 'TAG-000156',
    barcode: 'BC-000156',
    acquisitionValue: 1800.00,
    currency: 'AED',
    purchaseDate: new Date('2024-01-15'),
    parentAssetId: null
  });

  // AST-000201: Surface Pro 9
  await saveAsset({
    assetId: 'AST-000201',
    description: 'Surface Pro 9',
    categoryId: catMap['Tablet'].id,
    manufacturerId: mfrMap['Microsoft'].id,
    companyId: company.id,
    siteId: siteHQ.id,
    buildingId: bldgA.id,
    floorId: floor3.id,
    roomId: room312.id,
    custodianId: empJohn.id,
    lifecycleStatus: 'UNDER_MAINTENANCE',
    condition: 'FAIR',
    criticality: 'MEDIUM',
    serialNumber: 'SF9-90123',
    tagNumber: 'TAG-000201',
    barcode: 'BC-000201',
    acquisitionValue: 3800.00,
    currency: 'AED',
    purchaseDate: new Date('2023-11-20'),
    parentAssetId: null
  });

  // 8. Workflow Definitions & Approval Requests
  console.log('📋 Seeding Workflow Approval Definitions & Dynamic Approval Requests...');
  const wfDefs = [
    {
      name: 'New Asset Registration Approval',
      transactionType: 'New Asset Registration',
      steps: [
        { stepNumber: 1, name: 'Asset Manager', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { stepNumber: 2, name: 'Department Head', approverRoleCode: 'MANAGEMENT', slaHours: 48 },
        { stepNumber: 3, name: 'Finance', approverRoleCode: 'FINANCE', slaHours: 48 },
        { stepNumber: 4, name: 'Final Approval', approverRoleCode: 'SYS_ADMIN', slaHours: 72 }
      ]
    },
    {
      name: 'Asset Edit/Update Approval',
      transactionType: 'Asset Edit/Update',
      steps: [
        { stepNumber: 1, name: 'Asset Manager', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { stepNumber: 2, name: 'Department Head', approverRoleCode: 'MANAGEMENT', slaHours: 48 },
        { stepNumber: 3, name: 'Finance', approverRoleCode: 'FINANCE', slaHours: 48 }
      ]
    },
    {
      name: 'Asset Assignment/Transfer Approval',
      transactionType: 'Asset Assignment/Transfer',
      steps: [
        { stepNumber: 1, name: 'Asset Manager', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { stepNumber: 2, name: 'Department Head', approverRoleCode: 'MANAGEMENT', slaHours: 48 }
      ]
    },
    {
      name: 'Disposal Approval',
      transactionType: 'Disposal',
      steps: [
        { stepNumber: 1, name: 'Asset Manager', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { stepNumber: 2, name: 'Finance', approverRoleCode: 'FINANCE', slaHours: 48 },
        { stepNumber: 3, name: 'Final Approval', approverRoleCode: 'SYS_ADMIN', slaHours: 72 }
      ]
    }
  ];

  const defMap = {};
  for (const def of wfDefs) {
    let existingDef = await prisma.workflowDefinition.findFirst({
      where: { transactionType: def.transactionType }
    });

    if (!existingDef) {
      existingDef = await prisma.workflowDefinition.create({
        data: {
          name: def.name,
          transactionType: def.transactionType,
          valueThreshold: 0,
          active: true
        }
      });

      for (const s of def.steps) {
        await prisma.workflowStep.create({
          data: {
            workflowDefinitionId: existingDef.id,
            stepNumber: s.stepNumber,
            name: s.name,
            approverRoleCode: s.approverRoleCode,
            slaHours: s.slaHours
          }
        });
      }
    }
    defMap[def.transactionType] = existingDef;
  }

  // Seed sample Workflow Instances if not present
  const ast128 = await prisma.asset.findFirst({ where: { assetId: 'AST-000128' } });
  const ast156 = await prisma.asset.findFirst({ where: { assetId: 'AST-000156' } });
  const ast131 = await prisma.asset.findFirst({ where: { assetId: 'AST-000131' } });

  // 1. APR-2026-001 (New Asset Registration - Pending Step 1)
  let inst1 = await prisma.workflowInstance.findFirst({ where: { legacyMongoId: 'APR-2026-001' } });
  if (!inst1 && defMap['New Asset Registration'] && ast128) {
    inst1 = await prisma.workflowInstance.create({
      data: {
        legacyMongoId: 'APR-2026-001',
        workflowDefinitionId: defMap['New Asset Registration'].id,
        entityType: 'Asset',
        entityId: ast128.id,
        currentStepNumber: 1,
        status: 'PENDING',
        requestedByUserId: adminUserId || 'usr-default'
      }
    });
  }

  // 2. APR-2026-002 (Asset Edit/Update - Pending Step 3 with actions for steps 1 & 2)
  let inst2 = await prisma.workflowInstance.findFirst({ where: { legacyMongoId: 'APR-2026-002' } });
  if (!inst2 && defMap['Asset Edit/Update'] && ast156) {
    inst2 = await prisma.workflowInstance.create({
      data: {
        legacyMongoId: 'APR-2026-002',
        workflowDefinitionId: defMap['Asset Edit/Update'].id,
        entityType: 'Asset',
        entityId: ast156.id,
        currentStepNumber: 3,
        status: 'PENDING',
        requestedByUserId: adminUserId || 'usr-default'
      }
    });

    if (adminUserId) {
      await prisma.approvalAction.createMany({
        data: [
          {
            workflowInstanceId: inst2.id,
            stepNumber: 1,
            approverUserId: adminUserId,
            decision: 'APPROVE',
            comments: 'Asset Manager initial review approved.'
          },
          {
            workflowInstanceId: inst2.id,
            stepNumber: 2,
            approverUserId: adminUserId,
            decision: 'APPROVE',
            comments: 'Department Head verified specifications.'
          }
        ]
      });
    }
  }

  // 3. APR-2026-003 (Assignment/Transfer - Completed/Approved)
  let inst3 = await prisma.workflowInstance.findFirst({ where: { legacyMongoId: 'APR-2026-003' } });
  if (!inst3 && defMap['Asset Assignment/Transfer'] && ast131) {
    inst3 = await prisma.workflowInstance.create({
      data: {
        legacyMongoId: 'APR-2026-003',
        workflowDefinitionId: defMap['Asset Assignment/Transfer'].id,
        entityType: 'Asset',
        entityId: ast131.id,
        currentStepNumber: 2,
        status: 'APPROVED',
        requestedByUserId: adminUserId || 'usr-default'
      }
    });

    if (adminUserId) {
      await prisma.approvalAction.createMany({
        data: [
          {
            workflowInstanceId: inst3.id,
            stepNumber: 1,
            approverUserId: adminUserId,
            decision: 'APPROVE',
            comments: 'Transfer custody approved by manager.'
          },
          {
            workflowInstanceId: inst3.id,
            stepNumber: 2,
            approverUserId: adminUserId,
            decision: 'APPROVE',
            comments: 'Department Head final transfer approved.'
          }
        ]
      });
    }
  }

  console.log('✅ Dynamic asset seeding & workflows completed successfully!');
  const finalCount = await prisma.asset.count();
  const instCount = await prisma.workflowInstance.count();
  console.log(`📊 Total Assets: ${finalCount} | Total Workflow Instances: ${instCount}`);
}

// If run directly
if (process.argv[1]?.endsWith('seed-dynamic-assets.js')) {
  seedDynamicAssets()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
