const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const INITIAL_GROUPS = [
  {
    code: 'IT',
    name: 'Information Technology',
    description: 'IT hardware and software assets including laptops, desktops, servers, network devices and related accessories.',
    assetType: 'Both',
    active: true
  },
  {
    code: 'BLD',
    name: 'Buildings & Facilities',
    description: 'Buildings, facilities and infrastructure including office premises, warehouses, and HVAC systems.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'PLANT',
    name: 'Plant & Machinery',
    description: 'Production and plant equipment, manufacturing lines, generators, and heavy machinery.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'VEH',
    name: 'Vehicles',
    description: 'Fleet vehicles and transport equipment including delivery vans, corporate cars, and forklifts.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'FF&E',
    name: 'Furniture, Fixtures & Equipment',
    description: 'Office furniture and fixtures including executive desks, ergonomic seating, and conference tables.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'MED',
    name: 'Medical Equipment',
    description: 'Hospital and clinical equipment, diagnostic tools, patient monitors, and lab apparatus.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'TOOL',
    name: 'Tools & Accessories',
    description: 'Tools and small equipment used for maintenance, repairs, and daily operations.',
    assetType: 'Physical',
    active: true
  },
  {
    code: 'SW',
    name: 'Software Assets',
    description: 'Licensed software and subscriptions including ERP platforms, design suites, and cloud applications.',
    assetType: 'Intangible',
    active: true
  },
  {
    code: 'LIC',
    name: 'Licenses',
    description: 'Regulatory and operational licenses, patents, copyrights, and commercial permits.',
    assetType: 'Intangible',
    active: true
  },
  {
    code: 'OTH',
    name: 'Other Assets',
    description: 'Miscellaneous assets not categorized in standard groups.',
    assetType: 'Both',
    active: false
  }
];

async function main() {
  console.log('--- 1. Creating asset_groups table in SQL Server if missing ---');
  await prisma.$executeRawUnsafe(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'asset_groups')
    BEGIN
      CREATE TABLE asset_groups (
        id NVARCHAR(36) PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        assetType NVARCHAR(50) NOT NULL DEFAULT 'Both',
        active BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      PRINT 'Table asset_groups created successfully.';
    END
    ELSE
    BEGIN
      PRINT 'Table asset_groups already exists.';
    END
  `);

  console.log('--- 2. Seeding default Asset Groups ---');
  for (const grp of INITIAL_GROUPS) {
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM asset_groups WHERE code = '${grp.code.replace(/'/g, "''")}'`
    );
    if (existing && existing.length > 0) {
      console.log(`- Skipping existing group: ${grp.code}`);
    } else {
      const id = crypto.randomUUID();
      const desc = grp.description ? `'${grp.description.replace(/'/g, "''")}'` : 'NULL';
      await prisma.$executeRawUnsafe(`
        INSERT INTO asset_groups (id, code, name, description, assetType, active, createdAt, updatedAt)
        VALUES ('${id}', '${grp.code}', '${grp.name.replace(/'/g, "''")}', ${desc}, '${grp.assetType}', ${grp.active ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      console.log(`+ Inserted group: ${grp.code} - ${grp.name}`);
    }
  }

  const all = await prisma.$queryRawUnsafe(`SELECT code, name, assetType, active FROM asset_groups ORDER BY name ASC`);
  console.log(`Total Asset Groups now in DB: ${all.length}`);
  console.log(all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
