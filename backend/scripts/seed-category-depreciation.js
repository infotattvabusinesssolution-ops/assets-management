import 'dotenv/config';
import prismaPkg from '../node_modules/.prisma/maintenance-client-v5/index.js';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

function initialAnnualRate(category) {
  const name = `${category.name} ${category.code}`.toLowerCase();
  if (/laptop|notebook/.test(name)) return 5;
  if (/desktop|workstation|pc/.test(name)) return 10;
  if (/mobile|phone|tablet/.test(name)) return 20;
  if (/vehicle|car|truck/.test(name)) return 20;
  if (/furniture|chair|desk/.test(name)) return 10;
  if (/server|network|switch|router|access point/.test(name)) return 10;
  if (/monitor|display|printer|peripheral/.test(name)) return 10;
  return 10;
}

try {
  const categories = await prisma.category.findMany({
    where: { annualDepreciationRatePercent: null },
    select: { id: true, code: true, name: true }
  });
  for (const category of categories) {
    const rate = initialAnnualRate(category);
    await prisma.category.update({
      where: { id: category.id },
      data: {
        depreciationMethod: 'STRAIGHT_LINE',
        annualDepreciationRatePercent: rate,
        defaultUsefulLifeMonths: Math.round(1200 / rate)
      }
    });
    console.log(`${category.name}: ${rate}% annually`);
  }
  console.log(`Configured ${categories.length} categories. Existing configured rates were preserved.`);
  const configuredCategories = await prisma.category.findMany({
    where: { annualDepreciationRatePercent: { not: null } },
    select: { id: true, name: true, annualDepreciationRatePercent: true }
  });
  let booksUpdated = 0;
  for (const category of configuredCategories) {
    const rate = Number(category.annualDepreciationRatePercent);
    const result = await prisma.assetBookValue.updateMany({
      where: { asset: { categoryId: category.id }, isLocked: false, annualDepreciationRatePercent: null },
      data: { annualDepreciationRatePercent: rate, usefulLifeMonths: Math.round(1200 / rate) }
    });
    booksUpdated += result.count;
  }
  console.log(`Configured ${booksUpdated} existing unlocked asset books. Existing book rates were preserved.`);
} finally {
  await prisma.$disconnect();
}
