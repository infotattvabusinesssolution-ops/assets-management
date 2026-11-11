import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';
import { connectDB, isDbConnected } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Connecting to database...');
  await connectDB();

  if (!isDbConnected()) {
    console.error('❌ Database connection failed.');
    process.exit(1);
  }

  console.log('Ensuring `currencies` table exists in database...');
  await prisma.$executeRawUnsafe(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='currencies' and xtype='U')
    BEGIN
      CREATE TABLE currencies (
        id NVARCHAR(100) PRIMARY KEY,
        code NVARCHAR(20) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL UNIQUE,
        symbol NVARCHAR(20),
        active BIT DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    END
  `);

  console.log('✅ Table `currencies` created / confirmed.');

  // Check rows
  const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM currencies`);
  const count = Number(countResult?.[0]?.count ?? countResult?.[0]?.[''] ?? 0);
  console.log(`Current records in currencies: ${count}`);

  if (count === 0) {
    const jsonPath = path.resolve(__dirname, '../data/currencies.json');
    if (fs.existsSync(jsonPath)) {
      const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`Seeding ${list.length} initial currencies...`);
      for (const cur of list) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO currencies (id, code, name, symbol, active, createdAt, updatedAt)
            VALUES ('${cur.id}', '${cur.code}', '${cur.name.replace(/'/g, "''")}', '${(cur.symbol || cur.code).replace(/'/g, "''")}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
        } catch (e) {
          console.warn(`Could not insert ${cur.code}:`, e.message);
        }
      }
      console.log('✅ All currencies seeded successfully.');
    }
  }

  const rows = await prisma.$queryRawUnsafe(`SELECT code, name, symbol FROM currencies ORDER BY code ASC`);
  console.log('Current currencies in DB table:');
  console.table(rows);

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
