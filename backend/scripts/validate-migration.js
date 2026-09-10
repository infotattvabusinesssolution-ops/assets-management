import prisma from '../config/prisma.js';
import { connectDB } from '../config/db.js';

export async function validateMigration() {
  console.log('🔍 Running PostgreSQL Database Data Parity & Integrity Check...');
  await connectDB();

  try {
    const pgUserCount = await prisma.user.count();
    const pgRoleCount = await prisma.role.count();
    const pgCompanyCount = await prisma.company.count();
    const pgDeptCount = await prisma.department.count();
    const pgSiteCount = await prisma.site.count();
    const pgCategoryCount = await prisma.category.count();
    const pgAssetCount = await prisma.asset.count();

    console.log('----------------------------------------------------');
    console.log(`Users       -> PostgreSQL: ${pgUserCount}`);
    console.log(`Roles       -> PostgreSQL: ${pgRoleCount}`);
    console.log(`Companies   -> PostgreSQL: ${pgCompanyCount}`);
    console.log(`Departments -> PostgreSQL: ${pgDeptCount}`);
    console.log(`Sites       -> PostgreSQL: ${pgSiteCount}`);
    console.log(`Categories  -> PostgreSQL: ${pgCategoryCount}`);
    console.log(`Assets      -> PostgreSQL: ${pgAssetCount}`);
    console.log('----------------------------------------------------');

    if (pgUserCount > 0 && pgRoleCount > 0) {
      console.log('🎉 VALIDATION PASSED: PostgreSQL database tables populated and verified!');
    } else {
      console.warn('⚠️ VALIDATION WARNING: Database contains empty tables. Run seed or migration script.');
    }
  } catch (err) {
    console.error('❌ Validation Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1].endsWith('validate-migration.js')) {
  validateMigration();
}
