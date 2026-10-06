import prisma, { setDbConnected } from './backend/config/prisma.js';

async function main() {
  setDbConnected(true);
  const cats = await prisma.category.findMany({ select: { id: true, name: true, code: true } });
  const sites = await prisma.site.findMany({ select: { id: true, name: true, code: true } });
  const emps = await prisma.employee.findMany({ select: { id: true, fullName: true, employeeCode: true }, take: 10 });
  console.log('Categories:', cats);
  console.log('Sites:', sites);
  console.log('Employees:', emps);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
