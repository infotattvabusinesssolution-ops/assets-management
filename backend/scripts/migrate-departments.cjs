const prismaPkg = require('../node_modules/.prisma/maintenance-client-v6/index.js');
const prisma = new prismaPkg.PrismaClient();

async function main() {
  console.log('Altering departments table in MS SQL Server...');
  const queries = [
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'type')
      ALTER TABLE departments ADD type NVARCHAR(100) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'parentDepartment')
      ALTER TABLE departments ADD parentDepartment NVARCHAR(255) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'location')
      ALTER TABLE departments ADD location NVARCHAR(255) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'manager')
      ALTER TABLE departments ADD manager NVARCHAR(255) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'email')
      ALTER TABLE departments ADD email NVARCHAR(255) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'phone')
      ALTER TABLE departments ADD phone NVARCHAR(100) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments' AND COLUMN_NAME = 'description')
      ALTER TABLE departments ADD description NVARCHAR(MAX) NULL;`
  ];

  for (const q of queries) {
    await prisma.$executeRawUnsafe(q);
  }
  console.log('Departments columns added successfully!');

  const cols = await prisma.$queryRawUnsafe(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'departments'"
  );
  console.log('Departments columns now:', cols.map(c => c.COLUMN_NAME).join(', '));
}

main()
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
