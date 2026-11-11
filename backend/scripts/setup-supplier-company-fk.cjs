const { PrismaClient } = require('../node_modules/.prisma/maintenance-client-v6');
const prisma = new PrismaClient();

async function main() {
  console.log('1. Checking current column types...');
  const cols = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME IN ('service_providers', 'companies') AND COLUMN_NAME IN ('id', 'companyId')
  `);
  console.log('Columns:', cols);

  console.log('\n2. Altering service_providers.companyId to NVARCHAR(1000) NULL...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE service_providers ALTER COLUMN companyId NVARCHAR(1000) NULL;
  `);
  console.log('Altered column successfully.');

  console.log('\n3. Checking if any orphaned companyId exists...');
  const orphans = await prisma.$queryRawUnsafe(`
    SELECT sp.id, sp.providerCode, sp.providerName, sp.companyId
    FROM service_providers sp
    LEFT JOIN companies c ON sp.companyId = c.id
    WHERE sp.companyId IS NOT NULL AND c.id IS NULL
  `);
  console.log('Orphan service_providers:', orphans);
  if (orphans.length > 0) {
    console.log('Setting invalid companyId to NULL...');
    await prisma.$executeRawUnsafe(`
      UPDATE service_providers
      SET companyId = NULL
      WHERE companyId NOT IN (SELECT id FROM companies)
    `);
  }

  console.log('\n4. Creating foreign key FK_service_providers_companies...');
  // Check if FK already exists
  const existingFk = await prisma.$queryRawUnsafe(`
    SELECT name FROM sys.foreign_keys WHERE name = 'FK_service_providers_companies'
  `);
  if (existingFk.length > 0) {
    console.log('FK already exists. Dropping first...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE service_providers DROP CONSTRAINT FK_service_providers_companies;
    `);
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE service_providers
    ADD CONSTRAINT FK_service_providers_companies
    FOREIGN KEY (companyId) REFERENCES companies(id)
    ON DELETE NO ACTION ON UPDATE NO ACTION;
  `);
  console.log('FK_service_providers_companies created successfully!');

  console.log('\n5. Verifying foreign key...');
  const verifyFk = await prisma.$queryRawUnsafe(`
    SELECT fk.name AS constraint_name,
           tp.name AS parent_table,
           cp.name AS parent_column,
           ref.name AS referenced_table,
           cr.name AS referenced_column
    FROM sys.foreign_keys fk
    INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
    INNER JOIN sys.tables ref ON fk.referenced_object_id = ref.object_id
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
    WHERE fk.name = 'FK_service_providers_companies'
  `);
  console.log('Verified FK:', verifyFk);

  console.log('\n6. Syncing supplier status for inactive companies...');
  const synced = await prisma.$executeRawUnsafe(`
    UPDATE sp
    SET sp.status = 'INACTIVE'
    FROM service_providers sp
    INNER JOIN companies c ON sp.companyId = c.id
    WHERE c.active = 0 AND sp.status = 'ACTIVE'
  `);
  console.log('Suppliers updated to INACTIVE:', synced);
}

main().catch(console.error).finally(() => prisma.$disconnect());

