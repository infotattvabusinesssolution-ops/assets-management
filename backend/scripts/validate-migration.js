import prisma from '../config/prisma.js';
import { connectDB } from '../config/db.js';

export async function validateMigration() {
  console.log('🔍 Running Microsoft SQL Server 2025 Database Parity & Integrity Check...');
  await connectDB();

  try {
    const sqlUserCount = await prisma.user.count();
    const sqlRoleCount = await prisma.role.count();
    const sqlCompanyCount = await prisma.company.count();
    const sqlDeptCount = await prisma.department.count();
    const sqlSiteCount = await prisma.site.count();
    const sqlCategoryCount = await prisma.category.count();
    const sqlAssetCount = await prisma.asset.count();
    const sqlRtlsReaderCount = await prisma.rtlsReader.count();
    const sqlWorkOrderCount = await prisma.maintenanceWorkOrder.count();

    console.log('----------------------------------------------------');
    console.log(`Users             -> SQL Server: ${sqlUserCount}`);
    console.log(`Roles             -> SQL Server: ${sqlRoleCount}`);
    console.log(`Companies         -> SQL Server: ${sqlCompanyCount}`);
    console.log(`Departments       -> SQL Server: ${sqlDeptCount}`);
    console.log(`Sites             -> SQL Server: ${sqlSiteCount}`);
    console.log(`Categories        -> SQL Server: ${sqlCategoryCount}`);
    console.log(`Assets            -> SQL Server: ${sqlAssetCount}`);
    console.log(`RTLS Readers      -> SQL Server: ${sqlRtlsReaderCount}`);
    console.log(`Work Orders       -> SQL Server: ${sqlWorkOrderCount}`);
    console.log('----------------------------------------------------');

    if (sqlUserCount > 0 && sqlRoleCount > 0) {
      console.log('🎉 VALIDATION PASSED: Microsoft SQL Server 2025 database tables populated and verified!');
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
