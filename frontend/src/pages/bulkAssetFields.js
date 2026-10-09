// Kept in the same order as New Asset Registration. Documents and image uploads
// are intentionally omitted because a spreadsheet cannot carry their files.
export const bulkAssetFields = [
  ['assetId','Asset ID'], ['assetName','Asset Name'], ['assetType','Asset Type'],
  ['category','Category'], ['subcategory','Subcategory'], ['manufacturer','Manufacturer'],
  ['model','Model'], ['serialNumber','Serial Number'], ['quantity','Quantity'],
  ['description','Description'], ['assetGroup','Asset Group'], ['assetClass','Asset Class'],
  ['criticality','Criticality'], ['assetStatus','Status'], ['condition','Condition'],
  ['brand','Brand'], ['modelNumber','Model Number'], ['assetTagBarcode','Asset Tag / Barcode'],
  ['rfidEpc','RFID EPC'], ['tid','RFID TID'], ['company','Company'],
  ['businessUnit','Business Unit'], ['department','Department'], ['costCenter','Cost Center'],
  ['site','Site'], ['building','Building'], ['floor','Floor'], ['room','Room'],
  ['zoneArea','Zone / Area'], ['storageArea','Storage Area'], ['custodian','Custodian'],
  ['alternateCustodian','Alternate Custodian'], ['expectedUser','Expected User'],
  ['acquisitionDate','Acquisition Date'], ['acquisitionCost','Acquisition Cost'],
  ['purchaseDate','Purchase Date'], ['purchaseCost','Purchase Cost'], ['currency','Currency'],
  ['supplier','Supplier'], ['vendorSupplier','Vendor / Supplier'], ['poInvoiceNo','PO / Invoice No'],
  ['assetBook','Asset Book'], ['depreciationMethod','Depreciation Method'],
  ['usefulLifeYears','Useful Life Years'], ['residualValue','Residual Value'],
  ['underWarranty','Under Warranty'], ['provider','Warranty Provider'],
  ['warrantyType','Warranty Type'], ['warrantyStartDate','Warranty Start Date'],
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
  ['approvalRequired','Approval Required'], ['approvalStatus','Approval Status']
];

export const normalizeBulkHeader = value => String(value ?? '').replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
