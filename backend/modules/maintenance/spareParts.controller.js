import { prisma } from '../../config/database.js';

// In-memory fallback dataset for Spare Parts matching screenshot mockup
const MOCK_SPARE_PARTS = [
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

export async function getSpareParts(req, res) {
  try {
    const { category, location, status, search } = req.query;

    let parts = [...MOCK_SPARE_PARTS];

    if (search) {
      const q = search.toLowerCase();
      parts = parts.filter(p =>
        p.itemCode.toLowerCase().includes(q) ||
        p.itemName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'ALL' && category !== 'All Categories') {
      parts = parts.filter(p => p.category === category);
    }

    if (location && location !== 'ALL' && location !== 'All Locations') {
      parts = parts.filter(p => p.location.includes(location));
    }

    if (status && status !== 'ALL' && status !== 'All Status') {
      parts = parts.filter(p => p.status === status);
    }

    const summary = {
      totalItems: 1248,
      inStock: 892,
      lowStock: 78,
      outOfStock: 12,
      totalValueAED: 245630.00
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

export async function createSparePart(req, res) {
  try {
    const body = req.body;
    if (!body.itemName || !body.category) {
      return res.status(400).json({ success: false, message: 'Item Name and Category are required.' });
    }

    const created = {
      id: `sp-${Date.now()}`,
      itemCode: body.itemCode || `SP-${body.category.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      itemName: body.itemName,
      category: body.category,
      unit: body.unit || 'Piece',
      currentStock: parseInt(body.currentStock || 0),
      reorderLevel: parseInt(body.reorderLevel || 10),
      maxLevel: parseInt(body.maxLevel || 100),
      unitCost: parseFloat(body.unitCost || 0),
      totalValue: parseInt(body.currentStock || 0) * parseFloat(body.unitCost || 0),
      status: parseInt(body.currentStock || 0) === 0 ? 'Out of Stock' : (parseInt(body.currentStock || 0) <= parseInt(body.reorderLevel || 10) ? 'Low Stock' : 'In Stock'),
      supplier: body.supplier || 'General Supplier',
      location: body.location || 'Main Warehouse - Dubai HQ',
      storageBin: body.storageBin || 'A1-B1',
      leadTimeDays: parseInt(body.leadTimeDays || 7),
      description: body.description || '',
      remarks: body.remarks || '',
      attachments: []
    };

    MOCK_SPARE_PARTS.unshift(created);

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
