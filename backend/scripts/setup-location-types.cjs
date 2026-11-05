require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const INITIAL_LOCATION_TYPES = [
  { code: 'INTERNAL', name: 'Internal', description: 'Company Owned / Leased' },
  { code: 'EXTERNAL', name: 'External', description: 'Client Site / 3rd Party / Vendor' }
];

async function main() {
  console.log('Connecting to database...');
  await prisma.$connect();
  console.log('Connected to SQL Server.');

  // Create location_types table if not exists
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
  console.log('Table "location_types" verified/created successfully.');

  let insertedCount = 0;
  for (const t of INITIAL_LOCATION_TYPES) {
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM location_types WHERE UPPER(code) = '${t.code.toUpperCase()}' OR UPPER(name) = '${t.name.toUpperCase().replace(/'/g, "''")}'`
    );

    if (!existing || existing.length === 0) {
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO location_types (id, code, name, description, active, createdAt, updatedAt)
         VALUES ('${id}', '${t.code}', '${t.name.replace(/'/g, "''")}', '${(t.description || '').replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      insertedCount++;
    }
  }

  console.log(`Seeding complete. Inserted ${insertedCount} new location types.`);

  const all = await prisma.$queryRawUnsafe(`SELECT * FROM location_types`);
  console.log('Location Types in DB:', all);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error running setup-location-types:', err);
  process.exit(1);
});
