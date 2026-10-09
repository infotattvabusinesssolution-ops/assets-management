const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDiscovery() {
  try {
    await prisma.$connect();
    console.log('Connected to DB. Deleting matches...');
    await prisma.discoveryMatch.deleteMany({});
    console.log('Deleting observations...');
    await prisma.discoveryObservation.deleteMany({});
    console.log('✅ Successfully removed all discovered devices from the database!');
  } catch (err) {
    console.error('❌ Failed to clear database:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearDiscovery();
