import prisma from '../../config/prisma.js';

export async function processImport(req, res, next) {
  try {
    const { rows = [], entityType = 'ASSET' } = req.body;
    const userId = req.user?.id || req.user?._id;

    const job = await prisma.importJob.create({
      data: {
        fileName: `Import_${Date.now()}.csv`,
        entityType,
        totalRows: rows.length,
        status: 'PROCESSING',
        createdByUserId: userId
      }
    });

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    const defaultCompany = await prisma.company.findFirst({ where: { active: true } });
    const defaultSite = await prisma.site.findFirst({ where: { active: true } });
    const defaultCategory = await prisma.category.findFirst({ where: { active: true } });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.description) {
          throw new Error('Description is required');
        }

        await prisma.asset.create({
          data: {
            assetId: row.assetId || 'AST-IMP-' + Date.now().toString(36) + i,
            description: row.description,
            serialNumber: row.serialNumber || null,
            tagNumber: row.tagNumber || null,
            acquisitionValue: row.acquisitionValue || 0,
            companyId: defaultCompany ? defaultCompany.id : null,
            siteId: defaultSite ? defaultSite.id : null,
            categoryId: defaultCategory ? defaultCategory.id : null,
            lifecycleStatus: 'IN_SERVICE',
            createdByUserId: userId
          }
        });

        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({ row: i + 1, error: err.message });
      }
    }

    const updatedJob = await prisma.importJob.update({
      where: { id: job.id },
      data: {
        processedRows: rows.length,
        successRows: successCount,
        failedRows: failedCount,
        errors,
        status: failedCount === 0 ? 'COMPLETED' : 'FAILED'
      }
    });

    res.json({ success: true, job: updatedJob });
  } catch (err) { next(err); }
}
