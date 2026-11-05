require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const COUNTRIES = [
  { code: 'ARE', name: 'United Arab Emirates' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'OMN', name: 'Oman' },
  { code: 'KWT', name: 'Kuwait' },
  { code: 'BHR', name: 'Bahrain' },
  { code: 'USA', name: 'United States' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'IND', name: 'India' },
  { code: 'CAN', name: 'Canada' },
  { code: 'AUS', name: 'Australia' },
  { code: 'DEU', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'SGP', name: 'Singapore' },
  { code: 'JPN', name: 'Japan' },
  { code: 'CHN', name: 'China' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'LBN', name: 'Lebanon' },
  { code: 'MYS', name: 'Malaysia' },
  { code: 'ZAF', name: 'South Africa' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'NLD', name: 'Netherlands' },
  { code: 'CHE', name: 'Switzerland' },
  { code: 'ITA', name: 'Italy' },
  { code: 'ESP', name: 'Spain' },
  { code: 'TUR', name: 'Turkey' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'IDN', name: 'Indonesia' },
  { code: 'PAK', name: 'Pakistan' },
  { code: 'PHL', name: 'Philippines' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'IRL', name: 'Ireland' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'NOR', name: 'Norway' },
  { code: 'DNK', name: 'Denmark' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'AUT', name: 'Austria' },
  { code: 'POL', name: 'Poland' },
  { code: 'PRT', name: 'Portugal' },
  { code: 'GRC', name: 'Greece' }
];

async function main() {
  console.log('Connecting to database...');
  await prisma.$connect();
  console.log('Connected to SQL Server.');

  // Create table if not exists
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
  console.log('Table "countries" verified/created successfully.');

  let insertedCount = 0;
  for (const c of COUNTRIES) {
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM countries WHERE UPPER(code) = '${c.code.toUpperCase()}' OR UPPER(name) = '${c.name.toUpperCase().replace(/'/g, "''")}'`
    );

    if (!existing || existing.length === 0) {
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO countries (id, code, name, active, createdAt, updatedAt)
         VALUES ('${id}', '${c.code}', '${c.name.replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      insertedCount++;
    }
  }

  console.log(`Seeding complete. Inserted ${insertedCount} new countries.`);

  const all = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM countries`);
  console.log('Total countries in DB:', all[0]?.count || all[0]);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error running setup-countries:', err);
  process.exit(1);
});
