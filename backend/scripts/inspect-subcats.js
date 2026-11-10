import { connectDB } from '../config/db.js';
import prisma from '../config/prisma.js';

async function main() {
  await connectDB();

  // Check existing foreign keys on sub_categories
  const fks = await prisma.$queryRawUnsafe(`
    SELECT fk.name as fk_name, tp.name as parent_table, cp.name as parent_column,
           tr.name as ref_table, cr.name as ref_column
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
    JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
    JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
    WHERE tp.name = 'sub_categories'
  `);
  console.log('--- EXISTING FKs ON sub_categories ---');
  console.table(fks);

  // Check categories table definition
  const catCols = await prisma.$queryRawUnsafe(`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'categories' AND COLUMN_NAME IN ('id', 'assetSubGroupId')
  `);
  console.log('--- CATEGORIES COLS ---');
  console.table(catCols);

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
