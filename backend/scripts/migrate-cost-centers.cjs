const prismaPkg = require('../node_modules/.prisma/maintenance-client-v6/index.js');
const prisma = new prismaPkg.PrismaClient();

async function main() {
  console.log('Altering cost_centers table in MS SQL Server...');
  const queries = [
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'cost_centers' AND COLUMN_NAME = 'type')
      ALTER TABLE cost_centers ADD type NVARCHAR(100) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'cost_centers' AND COLUMN_NAME = 'manager')
      ALTER TABLE cost_centers ADD manager NVARCHAR(255) NULL;`,
    `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'cost_centers' AND COLUMN_NAME = 'description')
      ALTER TABLE cost_centers ADD description NVARCHAR(MAX) NULL;`
  ];

  for (const q of queries) {
    await prisma.$executeRawUnsafe(q);
  }
  console.log('Cost centers columns added successfully!');

  const cols = await prisma.$queryRawUnsafe(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'cost_centers'"
  );
  console.log('cost_centers columns now:', cols.map(c => c.COLUMN_NAME).join(', '));
}

main()
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
