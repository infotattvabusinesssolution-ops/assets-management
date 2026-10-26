import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'sparePartsData.json');

// Initial seed data
const SEED_PARTS = [
  {
    id: 'sp-001',
    itemCode: 'SP-HVAC-001',
    itemName: 'Air Filter (AHU)',
    category: 'HVAC',
    unit: 'Piece',
    currentStock: 120,
    reorderLevel: 20,
    maxLevel: 200,
    unitCost: 85.00,
    totalValue: 10200.00,
    status: 'In Stock',
    supplier: 'Al Futtaim Trading LLC',
    location: 'Main Warehouse - Dubai HQ',
    storageBin: 'A1-R3-B2',
    leadTimeDays: 7,
    description: 'Standard AHU air filter with MERV 8 rating used in HVAC systems.',
    remarks: 'Standard item used across all AHU units.',
    attachments: [
      { id: 1, name: 'Datasheet.pdf', fileType: 'PDF', size: '450 KB' },
      { id: 2, name: 'Product Image.jpg', fileType: 'JPG', size: '320 KB' }
    ]
  },
  {
    id: 'sp-002',
    itemCode: 'SP-ELEC-002',
    itemName: 'Circuit Breaker 63A',
    category: 'Electrical',
    unit: 'Piece',
    currentStock: 8,
    reorderLevel: 10,
    maxLevel: 50,
    unitCost: 225.00,
    totalValue: 1800.00,
    status: 'Low Stock',
    supplier: 'Schneider Electric Gulf',
    location: 'Electrical Store - HQ',
    storageBin: 'B2-R1-B4',
    leadTimeDays: 5,
    description: '3-Pole 63A C-curve miniature circuit breaker for LV panels.',
    remarks: 'Reorder initiated for 25 units.',
    attachments: [
      { id: 1, name: 'Breaker_Spec.pdf', size: '610 KB', fileType: 'PDF' }
    ]
  },
  {
    id: 'sp-003',
    itemCode: 'SP-PLUMB-003',
    itemName: 'Ball Valve 1/2"',
    category: 'Plumbing',
    unit: 'Piece',
    currentStock: 0,
    reorderLevel: 5,
    maxLevel: 40,
    unitCost: 45.00,
    totalValue: 0.00,
    status: 'Out of Stock',
    supplier: 'Danfoss Middle East',
    location: 'Plumbing Bay - HQ',
    storageBin: 'C1-R4-B1',
    leadTimeDays: 10,
    description: 'Brass body 1/2 inch female threaded ball valve for chilled water lines.',
    remarks: 'Urgent PR required for upcoming corrective maintenance.',
    attachments: []
  },
  {
    id: 'sp-004',
    itemCode: 'SP-HVAC-004',
    itemName: 'V-Belt B120',
    category: 'HVAC',
    unit: 'Piece',
    currentStock: 35,
    reorderLevel: 10,
    maxLevel: 80,
    unitCost: 75.00,
    totalValue: 2625.00,
    status: 'In Stock',
    supplier: 'Gates Power Transmission',
    location: 'Main Warehouse - Dubai HQ',
    storageBin: 'A2-R2-B1',
    leadTimeDays: 3,
    description: 'Heavy duty rubber V-belt B120 profile for AHU blower drive.',
    remarks: 'Inspect tension quarterly.',
    attachments: []
  },
  {
    id: 'sp-005',
    itemCode: 'SP-FIRE-005',
    itemName: 'Smoke Detector',
    category: 'Fire & Safety',
    unit: 'Piece',
    currentStock: 15,
    reorderLevel: 15,
    maxLevel: 60,
    unitCost: 125.00,
    totalValue: 1875.00,
    status: 'Low Stock',
    supplier: 'Honeywell Fire Systems',
    location: 'Safety Store - HQ',
    storageBin: 'D1-R1-B3',
    leadTimeDays: 14,
    description: 'Addressable optical smoke detector head for fire alarm panels.',
    remarks: 'Civil Defence approved model.',
    attachments: []
  },
  {
    id: 'sp-006',
    itemCode: 'SP-GEN-006',
    itemName: 'Oil Filter',
    category: 'Generators',
    unit: 'Piece',
    currentStock: 62,
    reorderLevel: 20,
    maxLevel: 100,
    unitCost: 40.00,
    totalValue: 2480.00,
    status: 'In Stock',
    supplier: 'Cummins Middle East',
    location: 'Generator Yard Bay',
    storageBin: 'G1-R2-B1',
    leadTimeDays: 4,
    description: 'Spin-on lube oil filter element for 500kVA standby diesel generator.',
    remarks: 'Change during 250-hour service.',
    attachments: []
  },
  {
    id: 'sp-007',
    itemCode: 'SP-CIVIL-007',
    itemName: 'Anchor Bolt M10',
    category: 'Civil',
    unit: 'Piece',
    currentStock: 4,
    reorderLevel: 10,
    maxLevel: 150,
    unitCost: 12.00,
    totalValue: 48.00,
    status: 'Low Stock',
    supplier: 'Hilti UAE',
    location: 'Civil & Hardware Shelf',
    storageBin: 'H3-R1-B2',
    leadTimeDays: 2,
    description: 'Galvanized expansion anchor bolt M10 x 80mm.',
    remarks: 'Heavy machinery mounting.',
    attachments: []
  },
  {
    id: 'sp-008',
    itemCode: 'SP-ELEC-008',
    itemName: 'LED Driver 100W',
    category: 'Electrical',
    unit: 'Piece',
    currentStock: 0,
    reorderLevel: 5,
    maxLevel: 30,
    unitCost: 95.00,
    totalValue: 0.00,
    status: 'Out of Stock',
    supplier: 'Philips Lighting Gulf',
    location: 'Electrical Store - HQ',
    storageBin: 'B1-R4-B2',
    leadTimeDays: 7,
    description: 'Dimmable 100W constant current LED power supply driver.',
    remarks: 'Out of stock, PO issued.',
    attachments: []
  },
  {
    id: 'sp-009',
    itemCode: 'SP-HVAC-009',
    itemName: 'Thermostat',
    category: 'HVAC',
    unit: 'Piece',
    currentStock: 27,
    reorderLevel: 10,
    maxLevel: 50,
    unitCost: 180.00,
    totalValue: 4860.00,
    status: 'In Stock',
    supplier: 'Honeywell Building Solutions',
    location: 'Main Warehouse - Dubai HQ',
    storageBin: 'A3-R1-B4',
    leadTimeDays: 5,
    description: 'Digital touchscreen FCU 2-pipe thermostat with Modbus RS485 communication.',
    remarks: 'BMS compatible model.',
    attachments: []
  },
  {
    id: 'sp-010',
    itemCode: 'SP-PLUMB-010',
    itemName: 'Pipe Connector 1"',
    category: 'Plumbing',
    unit: 'Piece',
    currentStock: 6,
    reorderLevel: 10,
    maxLevel: 60,
    unitCost: 18.00,
    totalValue: 108.00,
    status: 'Low Stock',
    supplier: 'Pegler Yorkshire',
    location: 'Plumbing Bay - HQ',
    storageBin: 'C2-R3-B1',
    leadTimeDays: 4,
    description: 'Compression brass 1 inch straight pipe connector socket.',
    remarks: 'Re-stock pending.',
    attachments: []
  }
];

const SEED_TRANSACTIONS = [
  {
    id: 1,
    txnNo: 'ST-2025-0001',
    date: '28 Aug 2025',
    fullDate: '28 Aug 2025 11:15 AM',
    type: 'Receipt',
    itemCode: 'SP-HVAC-001',
    itemName: 'Air Filter (AHU)',
    category: 'HVAC',
    unitOfMeasure: 'Piece',
    qty: 50,
    unitCost: 85.00,
    totalValue: 4250.00,
    fromLocation: '-',
    toLocation: 'Main Warehouse',
    locationDisplay: 'Main Warehouse',
    refNo: 'PO-2058',
    workOrder: '-',
    user: 'Ahmed Khan',
    issuedTo: '-',
    remarks: 'Bulk stock receipt from supplier PO-2058 for AHU quarterly maintenance.',
    createdBy: 'Ahmed Khan',
    createdOn: '28 Aug 2025 11:15 AM',
    lastModifiedBy: 'Ahmed Khan',
    lastModifiedOn: '28 Aug 2025 11:15 AM'
  },
  {
    id: 2,
    txnNo: 'ST-2025-0002',
    date: '27 Aug 2025',
    fullDate: '27 Aug 2025 10:30 AM',
    type: 'Issue',
    itemCode: 'SP-ELEC-002',
    itemName: 'Circuit Breaker 63A',
    category: 'Electrical',
    unitOfMeasure: 'Piece',
    qty: 5,
    unitCost: 225.00,
    totalValue: 1125.00,
    fromLocation: 'Main Warehouse',
    toLocation: '-',
    locationDisplay: 'Main Warehouse',
    refNo: 'WO-2025-0145',
    workOrder: 'Chiller Compressor Replacement',
    user: 'Ramesh Nair',
    issuedTo: 'Ahmed Khan (Technician)',
    remarks: 'Issued for chiller compressor replacement work.',
    createdBy: 'Ramesh Nair',
    createdOn: '27 Aug 2025 10:30 AM',
    lastModifiedBy: 'Ramesh Nair',
    lastModifiedOn: '27 Aug 2025 10:30 AM'
  },
  {
    id: 3,
    txnNo: 'ST-2025-0003',
    date: '25 Aug 2025',
    fullDate: '25 Aug 2025 02:20 PM',
    type: 'Transfer',
    itemCode: 'SP-PLUMB-003',
    itemName: 'Ball Valve 1/2"',
    category: 'Plumbing',
    unitOfMeasure: 'Piece',
    qty: 10,
    unitCost: 45.00,
    totalValue: 450.00,
    fromLocation: 'HQ Warehouse',
    toLocation: 'Site A',
    locationDisplay: 'HQ Warehouse → Site A',
    refNo: 'TR-0012',
    workOrder: '-',
    user: 'Sarah Ahmed',
    issuedTo: 'Site A Storekeeper',
    remarks: 'Inter-warehouse stock transfer to fulfill urgent plumbing work at Site A.',
    createdBy: 'Sarah Ahmed',
    createdOn: '25 Aug 2025 02:20 PM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '25 Aug 2025 02:20 PM'
  },
  {
    id: 4,
    txnNo: 'ST-2025-0004',
    date: '23 Aug 2025',
    fullDate: '23 Aug 2025 04:00 PM',
    type: 'Adjustment',
    itemCode: 'SP-GEN-006',
    itemName: 'Oil Filter',
    category: 'Generators',
    unitOfMeasure: 'Piece',
    qty: -3,
    unitCost: 40.00,
    totalValue: -120.00,
    fromLocation: 'Main Warehouse',
    toLocation: '-',
    locationDisplay: 'Main Warehouse',
    refNo: 'ADJ-0008',
    workOrder: '-',
    user: 'John Doe',
    issuedTo: '-',
    remarks: 'Inventory discrepancy adjustment following physical stock audit.',
    createdBy: 'John Doe',
    createdOn: '23 Aug 2025 04:00 PM',
    lastModifiedBy: 'John Doe',
    lastModifiedOn: '23 Aug 2025 04:00 PM'
  },
  {
    id: 5,
    txnNo: 'ST-2025-0005',
    date: '21 Aug 2025',
    fullDate: '21 Aug 2025 09:45 AM',
    type: 'Issue',
    itemCode: 'SP-HVAC-004',
    itemName: 'V-Belt B120',
    category: 'HVAC',
    unitOfMeasure: 'Piece',
    qty: 2,
    unitCost: 75.00,
    totalValue: 150.00,
    fromLocation: 'Main Warehouse',
    toLocation: '-',
    locationDisplay: 'Main Warehouse',
    refNo: 'WO-2025-0138',
    workOrder: 'AHU Motor Belt Change',
    user: 'Ahmed Khan',
    issuedTo: 'Suresh Kumar (Technician)',
    remarks: 'Issued for AHU preventive maintenance replacement.',
    createdBy: 'Ahmed Khan',
    createdOn: '21 Aug 2025 09:45 AM',
    lastModifiedBy: 'Ahmed Khan',
    lastModifiedOn: '21 Aug 2025 09:45 AM'
  },
  {
    id: 6,
    txnNo: 'ST-2025-0006',
    date: '20 Aug 2025',
    fullDate: '20 Aug 2025 01:15 PM',
    type: 'Receipt',
    itemCode: 'SP-FIRE-005',
    itemName: 'Smoke Detector',
    category: 'Fire & Safety',
    unitOfMeasure: 'Piece',
    qty: 100,
    unitCost: 125.00,
    totalValue: 12500.00,
    fromLocation: '-',
    toLocation: 'Main Warehouse',
    locationDisplay: 'Main Warehouse',
    refNo: 'PO-2049',
    workOrder: '-',
    user: 'Fatima Ali',
    issuedTo: '-',
    remarks: 'Stock replenishment order received from Siemens Safety.',
    createdBy: 'Fatima Ali',
    createdOn: '20 Aug 2025 01:15 PM',
    lastModifiedBy: 'Fatima Ali',
    lastModifiedOn: '20 Aug 2025 01:15 PM'
  },
  {
    id: 7,
    txnNo: 'ST-2025-0007',
    date: '18 Aug 2025',
    fullDate: '18 Aug 2025 03:50 PM',
    type: 'Transfer',
    itemCode: 'SP-ELEC-008',
    itemName: 'LED Driver 100W',
    category: 'Electrical',
    unitOfMeasure: 'Piece',
    qty: 20,
    unitCost: 95.00,
    totalValue: 1900.00,
    fromLocation: 'HQ Warehouse',
    toLocation: 'Site B',
    locationDisplay: 'HQ Warehouse → Site B',
    refNo: 'TR-0011',
    workOrder: '-',
    user: 'Ramesh Nair',
    issuedTo: 'Site B Storekeeper',
    remarks: 'Stock allocation transfer for Site B outdoor lighting upgrade.',
    createdBy: 'Ramesh Nair',
    createdOn: '18 Aug 2025 03:50 PM',
    lastModifiedBy: 'Ramesh Nair',
    lastModifiedOn: '18 Aug 2025 03:50 PM'
  },
  {
    id: 8,
    txnNo: 'ST-2025-0008',
    date: '16 Aug 2025',
    fullDate: '16 Aug 2025 10:00 AM',
    type: 'Issue',
    itemCode: 'SP-CIVIL-007',
    itemName: 'Anchor Bolt M10',
    category: 'Civil',
    unitOfMeasure: 'Piece',
    qty: 25,
    unitCost: 12.00,
    totalValue: 300.00,
    fromLocation: 'Site A',
    toLocation: '-',
    locationDisplay: 'Site A',
    refNo: 'WO-2025-0121',
    workOrder: 'Perimeter Fence Fix',
    user: 'Khalid Omar',
    issuedTo: 'Khalid Omar (Civil Eng)',
    remarks: 'Issued for structural anchoring at perimeter wall.',
    createdBy: 'Khalid Omar',
    createdOn: '16 Aug 2025 10:00 AM',
    lastModifiedBy: 'Khalid Omar',
    lastModifiedOn: '16 Aug 2025 10:00 AM'
  },
  {
    id: 9,
    txnNo: 'ST-2025-0009',
    date: '12 Aug 2025',
    fullDate: '12 Aug 2025 11:30 AM',
    type: 'Receipt',
    itemCode: 'SP-HVAC-009',
    itemName: 'Thermostat',
    category: 'HVAC',
    unitOfMeasure: 'Piece',
    qty: 30,
    unitCost: 180.00,
    totalValue: 5400.00,
    fromLocation: '-',
    toLocation: 'Main Warehouse',
    locationDisplay: 'Main Warehouse',
    refNo: 'PO-2045',
    workOrder: '-',
    user: 'Sarah Ahmed',
    issuedTo: '-',
    remarks: 'Honeywell digital thermostats batch delivery received.',
    createdBy: 'Sarah Ahmed',
    createdOn: '12 Aug 2025 11:30 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '12 Aug 2025 11:30 AM'
  },
  {
    id: 10,
    txnNo: 'ST-2025-0010',
    date: '10 Aug 2025',
    fullDate: '10 Aug 2025 04:45 PM',
    type: 'Adjustment',
    itemCode: 'SP-PLUMB-010',
    itemName: 'Pipe Connector 1"',
    category: 'Plumbing',
    unitOfMeasure: 'Piece',
    qty: -5,
    unitCost: 18.00,
    totalValue: -90.00,
    fromLocation: 'Site B',
    toLocation: '-',
    locationDisplay: 'Site B',
    refNo: 'ADJ-0007',
    workOrder: '-',
    user: 'John Doe',
    issuedTo: '-',
    remarks: 'Damaged during transit adjustment write-off.',
    createdBy: 'John Doe',
    createdOn: '10 Aug 2025 04:45 PM',
    lastModifiedBy: 'John Doe',
    lastModifiedOn: '10 Aug 2025 04:45 PM'
  }
];

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading sparePartsData.json:', err);
  }

  const initialData = {
    parts: SEED_PARTS,
    transactions: SEED_TRANSACTIONS,
    reorders: []
  };
  saveData(initialData);
  return initialData;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sparePartsData.json:', err);
  }
}

// Helper to calculate status
function calculateStockStatus(currentStock, reorderLevel) {
  const stock = parseInt(currentStock || 0);
  const reorder = parseInt(reorderLevel || 10);
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorder) return 'Low Stock';
  return 'In Stock';
}

// 1. GET /maintenance/spare-parts
export async function getSpareParts(req, res) {
  try {
    const { category, location, status, search } = req.query;
    const store = loadData();
    let parts = [...store.parts];

    if (search) {
      const q = search.toLowerCase();
      parts = parts.filter(p =>
        (p.itemCode && p.itemCode.toLowerCase().includes(q)) ||
        (p.itemName && p.itemName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.supplier && p.supplier.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'ALL' && category !== 'All Categories') {
      parts = parts.filter(p => p.category === category);
    }

    if (location && location !== 'ALL' && location !== 'All Locations') {
      parts = parts.filter(p => p.location && p.location.includes(location));
    }

    if (status && status !== 'ALL' && status !== 'All Status') {
      parts = parts.filter(p => p.status === status);
    }

    // Dynamic Summary KPIs based on all current items
    const allParts = store.parts;
    const totalItems = allParts.length;
    const inStock = allParts.filter(p => p.status === 'In Stock').length;
    const lowStock = allParts.filter(p => p.status === 'Low Stock').length;
    const outOfStock = allParts.filter(p => p.status === 'Out of Stock').length;
    const totalValueAED = allParts.reduce((sum, p) => sum + (parseFloat(p.totalValue) || 0), 0);

    const summary = {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalValueAED: Math.round(totalValueAED * 100) / 100
    };

    return res.json({
      success: true,
      summary,
      count: parts.length,
      parts
    });
  } catch (err) {
    console.error('Error fetching spare parts:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching spare parts' });
  }
}

// 2. POST /maintenance/spare-parts (Create)
export async function createSparePart(req, res) {
  try {
    const body = req.body;
    if (!body.itemName || !body.category) {
      return res.status(400).json({ success: false, message: 'Item Name and Category are required.' });
    }

    const store = loadData();
    const currentStock = parseInt(body.currentStock || 0);
    const reorderLevel = parseInt(body.reorderLevel || 10);
    const maxLevel = parseInt(body.maxLevel || 100);
    const unitCost = parseFloat(body.unitCost || 0);
    const totalValue = Math.round(currentStock * unitCost * 100) / 100;
    const status = calculateStockStatus(currentStock, reorderLevel);

    const created = {
      id: `sp-${Date.now()}`,
      itemCode: body.itemCode?.trim() || `SP-${body.category.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      itemName: body.itemName.trim(),
      category: body.category,
      unit: body.unit || 'Piece',
      currentStock,
      reorderLevel,
      maxLevel,
      unitCost,
      totalValue,
      status,
      supplier: body.supplier || 'General Supplier',
      location: body.location || 'Main Warehouse - Dubai HQ',
      storageBin: body.storageBin || 'A1-B1',
      leadTimeDays: parseInt(body.leadTimeDays || 7),
      description: body.description || '',
      remarks: body.remarks || '',
      attachments: []
    };

    store.parts.unshift(created);
    saveData(store);

    return res.json({
      success: true,
      message: `Spare part ${created.itemCode} created successfully!`,
      part: created
    });
  } catch (err) {
    console.error('Error creating spare part:', err);
    return res.status(500).json({ success: false, message: 'Error creating spare part' });
  }
}

// 3. PUT /maintenance/spare-parts/:id (Update)
export async function updateSparePart(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const store = loadData();

    const idx = store.parts.findIndex(p => p.id === id || p.itemCode === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }

    const existing = store.parts[idx];
    const currentStock = body.currentStock !== undefined ? parseInt(body.currentStock) : existing.currentStock;
    const reorderLevel = body.reorderLevel !== undefined ? parseInt(body.reorderLevel) : existing.reorderLevel;
    const maxLevel = body.maxLevel !== undefined ? parseInt(body.maxLevel) : existing.maxLevel;
    const unitCost = body.unitCost !== undefined ? parseFloat(body.unitCost) : existing.unitCost;
    const totalValue = Math.round(currentStock * unitCost * 100) / 100;
    const status = calculateStockStatus(currentStock, reorderLevel);

    const updated = {
      ...existing,
      itemCode: body.itemCode || existing.itemCode,
      itemName: body.itemName || existing.itemName,
      category: body.category || existing.category,
      unit: body.unit || existing.unit,
      currentStock,
      reorderLevel,
      maxLevel,
      unitCost,
      totalValue,
      status,
      supplier: body.supplier !== undefined ? body.supplier : existing.supplier,
      location: body.location !== undefined ? body.location : existing.location,
      storageBin: body.storageBin !== undefined ? body.storageBin : existing.storageBin,
      leadTimeDays: body.leadTimeDays !== undefined ? parseInt(body.leadTimeDays) : existing.leadTimeDays,
      description: body.description !== undefined ? body.description : existing.description,
      remarks: body.remarks !== undefined ? body.remarks : existing.remarks
    };

    store.parts[idx] = updated;
    saveData(store);

    return res.json({
      success: true,
      message: `Spare part ${updated.itemCode} updated successfully!`,
      part: updated
    });
  } catch (err) {
    console.error('Error updating spare part:', err);
    return res.status(500).json({ success: false, message: 'Error updating spare part' });
  }
}

// 4. DELETE /maintenance/spare-parts/:id (Delete)
export async function deleteSparePart(req, res) {
  try {
    const { id } = req.params;
    const store = loadData();
    const initialLen = store.parts.length;

    store.parts = store.parts.filter(p => p.id !== id && p.itemCode !== id);
    if (store.parts.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }

    saveData(store);
    return res.json({
      success: true,
      message: 'Spare part deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting spare part:', err);
    return res.status(500).json({ success: false, message: 'Error deleting spare part' });
  }
}

// 5. POST /maintenance/spare-parts/bulk-delete
export async function bulkDeleteSpareParts(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided for deletion.' });
    }

    const store = loadData();
    store.parts = store.parts.filter(p => !ids.includes(p.id) && !ids.includes(p.itemCode));
    saveData(store);

    return res.json({
      success: true,
      message: `${ids.length} spare parts deleted successfully.`
    });
  } catch (err) {
    console.error('Error bulk deleting spare parts:', err);
    return res.status(500).json({ success: false, message: 'Error deleting spare parts' });
  }
}

// 6. GET /maintenance/stock-transactions (Stock Ledger)
export async function getStockTransactions(req, res) {
  try {
    const { type, location, search, fromDate, toDate } = req.query;
    const store = loadData();
    let txns = [...store.transactions];

    if (search) {
      const q = search.toLowerCase();
      txns = txns.filter(t =>
        (t.txnNo && t.txnNo.toLowerCase().includes(q)) ||
        (t.itemCode && t.itemCode.toLowerCase().includes(q)) ||
        (t.itemName && t.itemName.toLowerCase().includes(q)) ||
        (t.refNo && t.refNo.toLowerCase().includes(q)) ||
        (t.user && t.user.toLowerCase().includes(q)) ||
        (t.issuedTo && t.issuedTo.toLowerCase().includes(q))
      );
    }

    if (type && type !== 'All') {
      txns = txns.filter(t => t.type === type);
    }

    if (location && location !== 'All Locations') {
      txns = txns.filter(t => t.locationDisplay && t.locationDisplay.includes(location));
    }

    // Dynamic Transaction summary KPIs
    const allTxns = store.transactions;
    const summary = {
      totalTxns: allTxns.length,
      stockIn: allTxns.filter(t => t.type === 'Receipt').length,
      stockOut: allTxns.filter(t => t.type === 'Issue').length,
      transfers: allTxns.filter(t => t.type === 'Transfer').length,
      adjustments: allTxns.filter(t => t.type === 'Adjustment').length
    };

    return res.json({
      success: true,
      summary,
      count: txns.length,
      transactions: txns
    });
  } catch (err) {
    console.error('Error fetching stock transactions:', err);
    return res.status(500).json({ success: false, message: 'Error fetching stock transactions' });
  }
}

// 7. POST /maintenance/stock-transactions (Record transaction & update stock)
export async function createStockTransaction(req, res) {
  try {
    const body = req.body;
    if (!body.itemCode || !body.type || !body.qty) {
      return res.status(400).json({ success: false, message: 'Item, transaction type, and quantity are required.' });
    }

    const qty = parseInt(body.qty);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number.' });
    }

    const store = loadData();
    // Find matching spare part
    const partIdx = store.parts.findIndex(p => p.itemCode === body.itemCode || p.id === body.itemCode);
    if (partIdx === -1) {
      return res.status(404).json({ success: false, message: `Spare part ${body.itemCode} not found in inventory.` });
    }

    const part = store.parts[partIdx];
    const unitCost = parseFloat(body.unitCost || part.unitCost || 0);

    // Validate stock on hand for issues
    if ((body.type === 'Issue' || body.type === 'Scrap') && part.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock on hand! Available: ${part.currentStock} ${part.unit}, Requested: ${qty} ${part.unit}.`
      });
    }

    // Synchronize inventory stock levels
    if (body.type === 'Receipt' || body.type === 'Return') {
      part.currentStock += qty;
    } else if (body.type === 'Issue' || body.type === 'Scrap') {
      part.currentStock -= qty;
    } else if (body.type === 'Adjustment') {
      // If adjustment direction specified
      if (body.adjType === 'Decrease') {
        part.currentStock = Math.max(0, part.currentStock - qty);
      } else {
        part.currentStock += qty;
      }
    }
    // Update total value & status
    part.totalValue = Math.round(part.currentStock * part.unitCost * 100) / 100;
    part.status = calculateStockStatus(part.currentStock, part.reorderLevel);
    store.parts[partIdx] = part;

    // Create Transaction Record
    const nextSeq = store.transactions.length + 1;
    const year = new Date().getFullYear();
    const txnNo = `ST-${year}-${String(nextSeq).padStart(4, '0')}`;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullDateStr = `${todayStr} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const fromLocation = body.fromLocation || (body.type === 'Receipt' ? '-' : (body.location || part.location));
    const toLocation = body.toLocation || (body.type === 'Issue' ? '-' : (body.destination || part.location));
    const locationDisplay = body.type === 'Transfer'
      ? `${fromLocation} → ${toLocation}`
      : (body.location || part.location);

    const totalTxnValue = Math.round(qty * unitCost * 100) / 100;

    const newTxn = {
      id: nextSeq,
      txnNo,
      date: todayStr,
      fullDate: fullDateStr,
      type: body.type,
      itemCode: part.itemCode,
      itemName: part.itemName,
      category: part.category,
      unitOfMeasure: part.unit,
      qty,
      unitCost,
      totalValue: totalTxnValue,
      fromLocation,
      toLocation,
      locationDisplay,
      refNo: body.refNo || (body.type === 'Receipt' ? `PO-${Math.floor(1000 + Math.random() * 9000)}` : `WO-${year}-${Math.floor(100 + Math.random() * 900)}`),
      workOrder: body.workOrder || '-',
      user: req.user?.fullName || req.user?.username || 'System Administrator',
      issuedTo: body.issuedTo || '-',
      remarks: body.remarks || `Stock ${body.type} of ${qty} ${part.unit} for ${part.itemName}.`,
      createdBy: req.user?.fullName || req.user?.username || 'System Administrator',
      createdOn: fullDateStr,
      lastModifiedBy: req.user?.fullName || req.user?.username || 'System Administrator',
      lastModifiedOn: fullDateStr
    };

    store.transactions.unshift(newTxn);
    saveData(store);

    return res.json({
      success: true,
      message: `Stock Transaction ${txnNo} recorded! ${part.itemName} stock updated to ${part.currentStock} ${part.unit}.`,
      transaction: newTxn,
      updatedPart: part
    });
  } catch (err) {
    console.error('Error creating stock transaction:', err);
    return res.status(500).json({ success: false, message: 'Error recording stock transaction' });
  }
}

// 8. GET /maintenance/reorder-planning
export async function getReorderPlanning(req, res) {
  try {
    const store = loadData();
    // Items that need reorder: currentStock <= reorderLevel
    const toReorder = store.parts.filter(p => p.currentStock <= p.reorderLevel);

    const reorderItems = toReorder.map((part, idx) => {
      const deficit = Math.max(0, part.maxLevel - part.currentStock);
      const recommendedQty = deficit > 0 ? deficit : (part.reorderLevel * 2);
      const estimatedCost = Math.round(recommendedQty * part.unitCost * 100) / 100;

      return {
        id: idx + 1,
        partId: part.id,
        itemCode: part.itemCode,
        itemName: part.itemName,
        category: part.category,
        currentStock: part.currentStock,
        reorderLevel: part.reorderLevel,
        maxLevel: part.maxLevel,
        recommendedQty,
        leadTimeDays: part.leadTimeDays || 7,
        unitCost: part.unitCost,
        estimatedCost,
        supplier: part.supplier,
        primarySupplierFull: part.supplier,
        preferredLocation: part.location,
        status: part.currentStock === 0 ? 'Urgent / Out of Stock' : 'To Reorder',
        remarks: part.remarks || `Stock level (${part.currentStock}) is at or below reorder threshold (${part.reorderLevel}).`,
        stockHistory: [
          { month: 'May', val: Math.min(part.maxLevel, part.currentStock + 40) },
          { month: 'Jun', val: Math.min(part.maxLevel, part.currentStock + 25) },
          { month: 'Jul', val: Math.min(part.maxLevel, part.currentStock + 12) },
          { month: 'Aug', val: Math.min(part.maxLevel, part.currentStock + 5) },
          { month: 'Sep', val: Math.min(part.maxLevel, part.currentStock + 2) },
          { month: 'Current', val: part.currentStock }
        ]
      };
    });

    const totalEstValue = reorderItems.reduce((acc, item) => acc + item.estimatedCost, 0);

    const summary = {
      partsToReorder: reorderItems.length,
      pendingPRs: store.reorders?.length || 2,
      onOrder: 3,
      expected30Days: reorderItems.length,
      estimatedValueAED: totalEstValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };

    return res.json({
      success: true,
      summary,
      count: reorderItems.length,
      items: reorderItems
    });
  } catch (err) {
    console.error('Error fetching reorder planning:', err);
    return res.status(500).json({ success: false, message: 'Error fetching reorder planning' });
  }
}

// 9. POST /maintenance/reorder/create-pr
export async function createPurchaseRequisition(req, res) {
  try {
    const { items, justification, urgency, deliveryLocation, notes } = req.body;
    const store = loadData();
    const prNumber = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalEstimatedCost = (items || []).reduce((acc, it) => acc + (Number(it.estimatedCost) || (Number(it.recommendedQty || it.quantity || 0) * Number(it.unitCost || 0))), 0);

    const prRecord = {
      id: `pr-${Date.now()}`,
      prNumber,
      createdAt: new Date().toISOString(),
      requestedBy: req.user?.fullName || req.user?.username || 'System Administrator',
      status: 'Submitted for Approval',
      urgency: urgency || 'Normal',
      deliveryLocation: deliveryLocation || 'Main Warehouse - Dubai HQ',
      justification: justification || 'Automated Stock Replenishment based on Reorder Planning thresholds.',
      notes: notes || '',
      items: items || [],
      totalEstimatedCost
    };

    if (!store.reorders) store.reorders = [];
    store.reorders.unshift(prRecord);
    saveData(store);

    return res.json({
      success: true,
      message: `Purchase Requisition ${prNumber} created successfully!`,
      pr: prRecord
    });
  } catch (err) {
    console.error('Error creating PR:', err);
    return res.status(500).json({ success: false, message: 'Error creating Purchase Requisition' });
  }
}
