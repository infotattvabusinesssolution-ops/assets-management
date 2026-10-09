import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import prismaPkg from '../node_modules/.prisma/maintenance-client-v5/index.js';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

// Each template targets a category that actually exists in the asset register.
// Re-running this script leaves existing plans and user edits intact.
const templates = [
  { category: 'HVAC Equipment', name: 'HVAC Equipment Quarterly Service', workType: 'PREVENTIVE', frequencyMonths: 3, dueInDays: 30, description: 'Inspect cooling performance, clean filters and check operating condition.', tasks: ['Inspect filters and clean or replace as needed', 'Check cooling performance and operating condition', 'Record observations and corrective actions'] },
  { category: 'HVAC Component', name: 'HVAC Component Inspection', workType: 'INSPECTION', frequencyMonths: 6, dueInDays: 45, description: 'Inspect registered HVAC components and document their condition.', tasks: ['Inspect component condition', 'Check connections and visible wear', 'Record measurements and findings'] },
  { category: 'Generator', name: 'Generator Preventive Service', workType: 'PREVENTIVE', frequencyMonths: 3, dueInDays: 35, description: 'Perform scheduled checks for the registered standby generator.', tasks: ['Check oil and coolant levels', 'Inspect battery and connections', 'Run and record a load test'] },
  { category: 'Vehicle', name: 'Fleet Vehicle Inspection', workType: 'INSPECTION', frequencyMonths: 6, dueInDays: 60, description: 'Inspect the registered site vehicle and record any service needs.', tasks: ['Check tyres, brakes and lights', 'Inspect fluids and visible leaks', 'Record odometer and findings'] },
  { category: 'Laptop', name: 'Laptop Annual Health Check', workType: 'PREVENTIVE', frequencyMonths: 12, dueInDays: 75, description: 'Review condition and operation of registered laptops.', tasks: ['Inspect physical and battery condition', 'Confirm device starts and operates normally', 'Record issues for follow-up'] }
];

try {
  const user = await prisma.user.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' }, select: { id: true } });
  if (!user) throw new Error('No active user exists to own seeded plans.');
  let created = 0;
  for (const template of templates) {
    const asset = await prisma.asset.findFirst({ where: { active: true, category: { name: template.category }, lifecycleStatus: { notIn: ['DISPOSED', 'RETIRED'] } }, select: { companyId: true, categoryId: true } });
    if (!asset) { console.log(`Skipped ${template.name}: no matching registered assets.`); continue; }
    const existing = await prisma.maintenancePlan.findFirst({ where: { companyId: asset.companyId, name: template.name }, select: { id: true } });
    if (existing) { console.log(`Already present: ${template.name}`); continue; }
    const nextDueDate = new Date();
    nextDueDate.setUTCDate(nextDueDate.getUTCDate() + template.dueInDays);
    nextDueDate.setUTCHours(12, 0, 0, 0);
    const plan = await prisma.maintenancePlan.create({ data: {
      planNumber: `MP-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      companyId: asset.companyId, name: template.name, description: template.description,
      workType: template.workType, applyToRule: 'CATEGORY', categoryId: asset.categoryId,
      frequencyMonths: template.frequencyMonths, nextDueDate, active: true,
      autoCreateWorkOrders: true, advanceDays: 7, createdByUserId: user.id,
      checklist: { create: template.tasks.map((task, sortOrder) => ({ task, sortOrder })) },
      events: { create: { action: 'CREATED', details: 'Seeded from registered asset category', actorName: 'System Seed' } }
    } });
    console.log(`Created ${plan.planNumber}: ${plan.name}`);
    created++;
  }
  console.log(`Created ${created} maintenance plans.`);
} finally {
  await prisma.$disconnect();
}
