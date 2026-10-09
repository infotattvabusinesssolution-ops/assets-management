import 'dotenv/config';
import prismaPkg from '../node_modules/.prisma/maintenance-client-v5/index.js';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();
const templates = [
  { category: 'Generator', months: 3, dueInDays: 5, type: 'PREVENTIVE', auto: false, tasks: ['Check oil and coolant levels', 'Inspect battery and connections', 'Record load test results'] },
  { category: 'HVAC Equipment', months: 3, dueInDays: 21, type: 'PREVENTIVE', auto: true, tasks: ['Clean or replace filters', 'Inspect cooling performance', 'Record operating measurements'] },
  { category: 'HVAC Component', months: 6, dueInDays: 35, type: 'INSPECTION', auto: true, tasks: ['Inspect component condition', 'Check connections and visible wear'] },
  { category: 'Vehicle', months: 6, dueInDays: 45, type: 'INSPECTION', auto: true, tasks: ['Check tyres, brakes and lights', 'Inspect fluid levels'] },
  { category: 'Laptop', months: 12, dueInDays: 65, type: 'PREVENTIVE', auto: true, tasks: ['Inspect physical and battery condition', 'Confirm normal startup and operation'] }
];

try {
  let created = 0;
  for (const template of templates) {
    const asset = await prisma.asset.findFirst({
      where: { active: true, category: { name: template.category }, lifecycleStatus: { notIn: ['DISPOSED', 'RETIRED'] }, assetId: { not: { startsWith: 'AST-BLK' } } },
      select: { id: true, assetId: true, description: true }, orderBy: { assetId: 'asc' }
    });
    if (!asset) { console.log(`Skipped ${template.category}: no eligible registered asset.`); continue; }
    const existing = await prisma.maintenanceSchedule.findFirst({ where: { assetId: asset.id, title: { startsWith: 'Scheduled ' } }, select: { id: true } });
    if (existing) { console.log(`Already present for ${asset.assetId}`); continue; }
    const nextDueDate = new Date();
    nextDueDate.setUTCDate(nextDueDate.getUTCDate() + template.dueInDays);
    nextDueDate.setUTCHours(12, 0, 0, 0);
    const schedule = await prisma.maintenanceSchedule.create({ data: {
      title: `Scheduled ${template.category} service`,
      description: `Routine ${template.type.toLowerCase()} maintenance for ${asset.description}.`,
      workType: template.type, assetId: asset.id, frequencyMonths: template.months,
      nextDueDate, active: true, autoGenerateWorkOrders: template.auto, advanceDays: 7,
      checklistJson: JSON.stringify(template.tasks)
    } });
    console.log(`Created schedule ${schedule.id} for ${asset.assetId}`);
    created++;
  }
  console.log(`Created ${created} preventive schedules.`);
} finally {
  await prisma.$disconnect();
}
