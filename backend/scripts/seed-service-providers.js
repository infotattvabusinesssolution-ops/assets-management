import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import prismaPkg from '../node_modules/.prisma/maintenance-client-v5/index.js';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

try {
  const contracts = await prisma.contract.findMany({ where: { providerName: { not: '' } }, orderBy: { providerName: 'asc' } });
  let created = 0;
  for (const contract of contracts) {
    const name = contract.providerName.trim();
    if (!name) continue;
    const existing = await prisma.serviceProvider.findFirst({ where: { providerName: name } });
    if (existing) { console.log(`Already present: ${name}`); continue; }
    const company = await prisma.company.findFirst({ select: { id: true }, orderBy: { name: 'asc' } });
    await prisma.serviceProvider.create({ data: {
      providerCode: `SP-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      providerName: name, providerType: 'AMC_PROVIDER', status: 'DRAFT',
      companyId: company?.id || null,
      notes: { create: { text: `Imported from existing contract ${contract.contractNumber}. Complete and verify contact details before activation.`, authorName: 'System Seed' } }
    } });
    console.log(`Created provider from contract ${contract.contractNumber}: ${name}`);
    created++;
  }
  console.log(`Created ${created} providers.`);
} finally {
  await prisma.$disconnect();
}
