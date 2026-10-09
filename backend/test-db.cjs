const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => {
    console.log('✅ CONNECTION SUCCESSFUL');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ CONNECTION FAILED:');
    console.error(err.message);
    process.exit(1);
  });
