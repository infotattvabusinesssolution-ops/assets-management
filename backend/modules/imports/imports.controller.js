import { ImportJob } from '../../models/Integration.js';
import { Asset } from '../../models/Asset.js';
import { Company } from '../../models/Company.js';
import { Site } from '../../models/Location.js';
import { Category } from '../../models/Category.js';


export async function processImport(req, res, next) {
  try {
    const { rows = [], entityType = 'ASSET' } = req.body;

    const job = await ImportJob.create({
      fileName: `Import_${Date.now()}.csv`,
      entityType,
      totalRows: rows.length,
      status: 'PROCESSING',
      createdBy: req.user._id
    });

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // Find default company/site/category if missing in row
    const defaultCompany = await Company.findOne({ active: true });
    const defaultSite = await Site.findOne({ active: true });
    const defaultCategory = await Category.findOne({ active: true });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.description) {
          throw new Error('Description is required');
        }

        await Asset.create({
          assetId: row.assetId || 'AST-IMP-' + Date.now().toString(36) + i,
          description: row.description,
          serialNumber: row.serialNumber,
          tagNumber: row.tagNumber,
          acquisitionValue: row.acquisitionValue || 0,
          companyId: defaultCompany ? defaultCompany._id : null,
          siteId: defaultSite ? defaultSite._id : null,
          categoryId: defaultCategory ? defaultCategory._id : null,
          lifecycleStatus: 'IN_SERVICE',
          createdBy: req.user._id
        });

        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({ row: i + 1, error: err.message });
      }
    }

    job.processedRows = rows.length;
    job.successRows = successCount;
    job.failedRows = failedCount;
    job.errors = errors;
    job.status = failedCount === 0 ? 'COMPLETED' : 'FAILED';
    await job.save();

    res.json({ success: true, job });
  } catch (err) { next(err); }
}
