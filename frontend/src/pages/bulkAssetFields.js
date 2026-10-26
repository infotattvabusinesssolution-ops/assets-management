// Kept in the same order as New Asset Registration. Documents and image uploads
// are intentionally omitted because a spreadsheet cannot carry their files.
export const bulkAssetFields = [
  ['assetId','Asset ID'], ['assetName','Asset Name'], ['assetType','Asset Type'],
  ['category','Category'], ['subcategory','Subcategory'], ['manufacturer','Manufacturer'],
  ['model','Model'], ['serialNumber','Serial Number'], ['quantity','Quantity'], ['serialNumbers','Serial Numbers'],
  ['description','Description'], ['imageUrl','Asset Image URL'], ['assetGroup','Asset Group'], ['assetClass','Asset Class'],
  ['criticality','Criticality'], ['assetStatus','Status'], ['condition','Condition'],
  ['brand','Brand'], ['modelNumber','Model Number'], ['assetTagBarcode','Asset Tag / Barcode'],
  ['rfidEpc','RFID EPC'], ['tid','RFID TID'], ['company','Company'],
  ['businessUnit','Business Unit'], ['department','Department'], ['costCenter','Cost Center'],
  ['site','Site'], ['building','Building'], ['floor','Floor'], ['room','Room'],
  ['zoneArea','Zone / Area'], ['storageArea','Storage Area'], ['custodian','Custodian'],
  ['alternateCustodian','Alternate Custodian'], ['expectedUser','Expected User'],
  ['acquisitionDate','Acquisition Date'], ['inServiceDate','In Service Date'], ['acquisitionCost','Acquisition Cost'],
  ['purchaseDate','Purchase Date'], ['purchaseCost','Purchase Cost'], ['currency','Currency'],
  ['supplier','Supplier'], ['vendorSupplier','Vendor / Supplier'], ['poInvoiceNo','PO / Invoice No'],
  ['assetBook','Asset Book'], ['depreciationMethod','Depreciation Method'],
  ['usefulLifeYears','Useful Life Years'], ['residualValue','Residual Value'],
  ['underWarranty','Under Warranty'], ['provider','Warranty Provider'],
  ['warrantyType','Warranty Type'], ['warrantyStartDate','Warranty Start Date'], ['warrantyYears','Warranty Years'],
  ['warrantyEndDate','Warranty End Date'], ['coverage','Warranty Coverage'],
  ['contractReference','Contract Reference'], ['enablePm','Enable PM'],
  ['pmTitle','PM Title'], ['pmDescription','PM Description'], ['pmWorkType','PM Work Type'],
  ['pmFrequencyMonths','PM Frequency Months'], ['pmNextDueDate','PM Next Due Date'],
  ['pmChecklistText','PM Checklist'], ['pmActive','PM Active'],
  ['pmAutoGenerateWorkOrders','PM Auto Generate Work Orders'], ['pmAdvanceDays','PM Advance Days'],
  ['linkToDiscovered','Link To Discovered'], ['discoveryId','Discovery ID'],
  ['discoverySource','Discovery Source'], ['hostname','Hostname'], ['ipAddress','IP Address'],
  ['macAddress','MAC Address'], ['discoveredSerial','Discovered Serial'],
  ['firstSeen','First Seen'], ['lastSeen','Last Seen'], ['matchedDiscovery','Matched Discovery'],
  ['project','Project'], ['reference','Reference'], ['notes','Notes'],
  ['costAllocation','Cost Allocation'], ['businessApplication','Business Application'],
  ['remarks','Remarks'], ['tagType','Tag Type'], ['tagStatus','Tag Status'],
  ['approvalRequired','Approval Required'], ['approvalStatus','Approval Status'],
  ['nextApprover','Next Approver'], ['approvalRemarks','Approval Remarks']
];

export const normalizeBulkHeader = value => String(value ?? '').replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const bulkAssetSampleRows = [
  {
    assetId: 'AST-BULK-20261010-01', assetName: 'Bulk Sample Laptop', category: 'Laptop',
    serialNumber: 'BULK-20261010-LAP', quantity: 1, manufacturer: 'Dell', model: 'Latitude 5540',
    criticality: 'HIGH', company: 'Infotatwaa Enterprise Corp', site: 'Dubai HQ Campus',
    acquisitionDate: '2026-10-10', acquisitionCost: 2450, currency: 'AED', condition: 'NEW',
    assetStatus: 'IN_SERVICE', underWarranty: 'Yes', provider: 'Dell',
    warrantyStartDate: '2026-10-10', warrantyEndDate: '2028-10-09', coverage: 'Parts and labour',
    enablePm: 'Yes', pmTitle: 'Laptop quarterly inspection', pmWorkType: 'INSPECTION',
    pmFrequencyMonths: 3, pmNextDueDate: '2027-01-10',
    pmChecklistText: 'Inspect battery;Check cooling', pmActive: 'Yes', pmAdvanceDays: 7,
    hostname: 'bulk-laptop-20261010', ipAddress: '10.20.30.41',
    project: 'Bulk Upload Verification', notes: 'Seeded via bulk upload verification'
  },
  {
    assetId: 'AST-BULK-20261010-02', assetName: 'Bulk Sample Monitor', category: 'Monitor',
    serialNumber: 'BULK-20261010-MON', quantity: 1, manufacturer: 'Samsung', model: 'ViewFinity S7',
    criticality: 'MEDIUM', site: 'Dubai HQ Campus', acquisitionCost: 750, currency: 'AED',
    condition: 'GOOD', assetStatus: 'IN_STORE', businessApplication: 'Display equipment',
    reference: 'SAMPLE-MON-01'
  },
  {
    assetId: 'AST-BULK-20261010-03', assetName: 'Bulk Sample Generator', category: 'Generator',
    serialNumber: 'BULK-20261010-GEN', quantity: 1, manufacturer: 'Caterpillar', model: 'G3516',
    criticality: 'CRITICAL', site: 'Abu Dhabi Operations Hub', acquisitionCost: 18500,
    currency: 'AED', condition: 'NEW', assetStatus: 'IN_SERVICE', enablePm: 'Yes',
    pmTitle: 'Generator preventive service', pmWorkType: 'PREVENTIVE', pmFrequencyMonths: 6,
    pmNextDueDate: '2027-04-10', pmChecklistText: 'Inspect fuel system;Change filters',
    pmActive: 'Yes', pmAutoGenerateWorkOrders: 'No', pmAdvanceDays: 14
  }
];

export function parseBulkAssetRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];

  // 1. Locate the header row: find the first non-empty row that contains known column headers
  let headerRowIndex = rows.findIndex(row => {
    if (!Array.isArray(row) || !row.some(Boolean)) return false;
    const normalized = row.map(normalizeBulkHeader);
    return normalized.some(cell => 
      ['assetname', 'name', 'category', 'serialnumber', 'assetid', 'site', 'location', 'description'].includes(cell)
    );
  });

  // Fallback: If no recognized header names found, pick the first row that has non-empty values
  if (headerRowIndex < 0) {
    headerRowIndex = rows.findIndex(row => Array.isArray(row) && row.some(Boolean));
  }
  if (headerRowIndex < 0) return [];

  const headers = (rows[headerRowIndex] || []).map(normalizeBulkHeader);
  const field = (values, ...names) => {
    const index = headers.findIndex(header => names.includes(header));
    return index < 0 ? '' : (values[index] || '');
  };

  return rows.slice(headerRowIndex + 1)
    .map((values, index) => ({ values, row: headerRowIndex + index + 2 }))
    .filter(({ values }) => Array.isArray(values) && values.some(Boolean))
    .map(({ values, row }) => {
      const details = Object.fromEntries(bulkAssetFields.map(([key, header]) =>
        [key, field(values, normalizeBulkHeader(header), normalizeBulkHeader(key))]));
      return {
        ...details, row,
        assetId: details.assetId || field(values, 'id'),
        name: details.assetName || field(values, 'name', 'assetdescription', 'itemname'),
        category: details.category || field(values, 'assetcategory'),
        serialNumber: details.serialNumber || field(values, 'serialno', 'sn', 'serial'),
        site: details.site || field(values, 'location', 'facility', 'campus'),
        location: details.site || field(values, 'location', 'facility', 'campus'),
        acquisitionValue: details.acquisitionCost || field(values, 'acquisitionvalue', 'cost', 'price', 'value'),
        currency: details.currency || 'AED', status: 'Unvalidated',
        remarks: 'Awaiting server validation'
      };
    });
}
