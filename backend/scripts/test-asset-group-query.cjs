const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Prisma models available:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
  const raw = await prisma.$queryRawUnsafe('SELECT * FROM asset_groups');
  console.log('Raw query count:', raw.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
