// Repeatable end-to-end sample: validates and imports three untagged assets
// through the same HTTP endpoints used by the Bulk Upload page.
const base = process.env.BULK_API_URL || 'http://localhost:5000/api/v1';
const token = process.env.BULK_API_TOKEN || 'demo-check';
const stamp = '20261010';

const samples = [
  {
    row: 2, assetId: `AST-BULK-${stamp}-01`, assetName: 'Bulk Sample Laptop',
    category: 'Laptop', serialNumber: `BULK-${stamp}-LAP`, quantity: '1',
    manufacturer: 'Dell', model: 'Latitude 5540', criticality: 'HIGH',
    company: 'Infotatwaa Enterprise Corp', site: 'Dubai HQ Campus',
    acquisitionDate: '2026-10-10', acquisitionCost: '2450', currency: 'AED',
    condition: 'NEW', assetStatus: 'IN_SERVICE', underWarranty: 'Yes',
    provider: 'Dell', warrantyStartDate: '2026-10-10', warrantyEndDate: '2028-10-09',
    coverage: 'Parts and labour', enablePm: 'Yes', pmTitle: 'Laptop quarterly inspection',
    pmWorkType: 'INSPECTION', pmFrequencyMonths: '3', pmNextDueDate: '2027-01-10',
    pmChecklistText: 'Inspect battery;Check cooling', pmActive: 'Yes', pmAdvanceDays: '7',
    hostname: `bulk-laptop-${stamp}`, ipAddress: '10.20.30.41',
    project: 'Bulk Upload Verification', notes: 'Seeded via bulk upload verification'
  },
  {
    row: 3, assetId: `AST-BULK-${stamp}-02`, assetName: 'Bulk Sample Monitor',
    category: 'Monitor', serialNumber: `BULK-${stamp}-MON`, quantity: '1',
    manufacturer: 'Samsung', model: 'ViewFinity S7', criticality: 'MEDIUM',
    site: 'Dubai HQ Campus', acquisitionCost: '750', currency: 'AED',
    condition: 'GOOD', assetStatus: 'IN_STORE',
    businessApplication: 'Display equipment', reference: 'SAMPLE-MON-01'
  },
  {
    row: 4, assetId: `AST-BULK-${stamp}-03`, assetName: 'Bulk Sample Generator',
    category: 'Generator', serialNumber: `BULK-${stamp}-GEN`, quantity: '1',
    manufacturer: 'Caterpillar', model: 'G3516', criticality: 'CRITICAL',
    site: 'Abu Dhabi Operations Hub', acquisitionCost: '18500', currency: 'AED',
    condition: 'NEW', assetStatus: 'IN_SERVICE', enablePm: 'Yes',
    pmTitle: 'Generator preventive service', pmWorkType: 'PREVENTIVE',
    pmFrequencyMonths: '6', pmNextDueDate: '2027-04-10',
    pmChecklistText: 'Inspect fuel system;Change filters', pmActive: 'Yes',
    pmAutoGenerateWorkOrders: 'No', pmAdvanceDays: '14'
  }
];

async function request(method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = await response.json();
  if (!response.ok || result.success === false) throw new Error(`${path}: ${response.status} ${JSON.stringify(result)}`);
  return result;
}

const validation = await request('POST', '/imports/validate', { rows: samples });
if (validation.errorCount) throw new Error(`Validation failed: ${JSON.stringify(validation.records.map(row => ({ row: row.row, remarks: row.remarks })))}`);
const imported = await request('POST', '/imports/submit', {
  rows: validation.records, fileName: 'Bulk_Upload_3_Samples.xlsx',
  batchReference: `BATCH-BULK-VERIFY-${stamp}`
});
if (imported.failedCount || imported.createdCount + imported.updatedCount !== 3) {
  throw new Error(`Import failed: ${JSON.stringify(imported)}`);
}
for (const sample of samples) {
  const result = await request('GET', `/assets?search=${encodeURIComponent(sample.assetId)}`);
  const asset = result.assets?.find(item => item.assetId === sample.assetId);
  if (!asset) throw new Error(`${sample.assetId} is missing from Asset Register`);
  if (asset.tagNumber || asset.barcode || asset.qrCode) throw new Error(`${sample.assetId} was tagged unexpectedly`);
  const detail = await request('GET', `/assets/${encodeURIComponent(sample.assetId)}/360`);
  if (sample.enablePm === 'Yes' && !detail.asset360?.schedules?.length) throw new Error(`${sample.assetId} has no preventive schedule`);
  if (sample.underWarranty === 'Yes' && !detail.asset360?.warranty) throw new Error(`${sample.assetId} has no warranty`);
  if (!detail.asset360?.bookValues?.some(book => Number(book.capitalizationValue) === Number(sample.acquisitionCost))) {
    throw new Error(`${sample.assetId} has no matching category book value`);
  }
  if (sample.project && !detail.asset360?.asset?.customFieldValues?.some(value => value.customFieldDef?.name === 'BULK_REG_project' && value.textValue === sample.project)) {
    throw new Error(`${sample.assetId} did not retain its extra registration fields`);
  }
  console.log(`${sample.assetId}: registered untagged; category=${asset.category?.name || sample.category}`);
}
console.log(JSON.stringify({ validated: validation.validCount + validation.warningCount, created: imported.createdCount, updated: imported.updatedCount, failed: imported.failedCount, jobId: imported.jobId }));
