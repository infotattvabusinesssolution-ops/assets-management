const { PrismaClient } = require('../node_modules/.prisma/maintenance-client-v6');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Companies ---');
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    console.log(`Company: ${c.code} (${c.name}), active: ${c.active}`);
  }

  console.log('\n--- Checking Departments ---');
  const departments = await prisma.department.findMany({
    include: { company: true }
  });
  for (const d of departments) {
    console.log(`Dept: ${d.code} (${d.name}), active: ${d.active}, Company: ${d.company?.name} (active: ${d.company?.active})`);
  }

  console.log('\n--- Syncing Departments under Inactive Companies to active = false ---');
  const result = await prisma.$executeRawUnsafe(`
    UPDATE d
    SET d.active = 0
    FROM departments d
    INNER JOIN companies c ON d.companyId = c.id
    WHERE c.active = 0 AND d.active = 1
  `);
  console.log('Departments updated to inactive:', result);

  const costCenterResult = await prisma.$executeRawUnsafe(`
    UPDATE cc
    SET cc.active = 0
    FROM cost_centers cc
    INNER JOIN companies c ON cc.companyId = c.id
    WHERE c.active = 0 AND cc.active = 1
  `);
  console.log('Cost Centers updated to inactive:', costCenterResult);

  console.log('\n--- Departments after sync ---');
  const deptsAfter = await prisma.department.findMany({
    include: { company: true }
  });
  for (const d of deptsAfter) {
    console.log(`Dept: ${d.code} (${d.name}), active: ${d.active}, Company: ${d.company?.name} (active: ${d.company?.active})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
