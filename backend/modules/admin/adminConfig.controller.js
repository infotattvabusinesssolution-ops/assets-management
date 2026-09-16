// System Configuration Controller
// Implements paragraphs 553-570 of Asset360 Wireframe

export let memoryConfig = {
  general: {
    appName: 'Asset360 Enterprise Asset Management',
    logoUrl: '/logo.svg',
    timezone: 'Asia/Dubai (GMT+04:00)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour (hh:mm A)',
    currency: 'AED',
    sessionTimeout: 30,
    maxUploadSizeMB: 15,
    supportedLanguages: ['English', 'Arabic']
  },
  asset: {
    defaultStatus: 'In Service',
    autoGenerateCode: true,
    codePrefix: 'AST',
    codeFormat: '{PREFIX}-{YYYY}-{SEQ:6}',
    startingSequence: 100001,
    mandatoryFields: ['Asset Name', 'Category', 'Location', 'Purchase Date', 'Cost Center'],
    enableImages: true,
    maxImages: 5,
    defaultWarrantyMonths: 12,
    depreciationMethod: 'Straight Line Method (SLM)',
    taggingTechnology: ['Barcode 1D', 'QR Code 2D', 'UHF RFID EPC Gen2'],
    rfidEncodingPrefix: '360EPC'
  },
  inventory: {
    defaultTransactionType: 'Standard Issue',
    allowNegativeStock: false,
    autoReorderCalc: true,
    reorderFormula: '(Daily Consumption * Lead Time) + Safety Stock',
    leadTimeBufferDays: 7,
    valuationMethod: 'FIFO - First In First Out',
    defaultWarehouse: 'Jebel Ali Warehouse',
    sparePartImageMandatory: false,
    uomPrecision: 2
  },
  maintenance: {
    woNumberingScheme: 'WO-{YYYY}-{SEQ:5}',
    defaultPriority: 'Medium',
    defaultType: 'Preventive',
    slaResponseHours: { Critical: 1, High: 4, Medium: 8, Low: 24 },
    slaResolutionHours: { Critical: 4, High: 12, Medium: 24, Low: 72 },
    autoEscalate: true,
    requireSignOff: true,
    requireSparePartConfirmation: true,
    autoGeneratePMDays: 7
  }
};

export let memoryNumberingSchemes = [
  { id: 'num-asset', entity: 'Asset Code / Tag', prefix: 'AST', length: 6, current: 100128, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'AST-2025-100128' },
  { id: 'num-wo', entity: 'Work Order ID', prefix: 'WO', length: 5, current: 482, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'WO-2025-00482' },
  { id: 'num-pmp', entity: 'Preventive Maintenance Plan', prefix: 'PMP', length: 4, current: 12, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Never', sample: 'PMP-2025-0012' },
  { id: 'num-aud', entity: 'Audit / Verification Campaign', prefix: 'AUD', length: 4, current: 3, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'AUD-2025-0003' },
  { id: 'num-trf', entity: 'Transfer / Movement Request', prefix: 'TRF', length: 5, current: 91, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'TRF-2025-00091' },
  { id: 'num-dsp', entity: 'Disposal Ticket', prefix: 'DSP', length: 5, current: 14, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'DSP-2025-00014' },
  { id: 'num-stk', entity: 'Stock Transaction Voucher', prefix: 'STK', length: 5, current: 382, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'STK-2025-00382' },
  { id: 'num-rec', entity: 'PO Receipt / GRN', prefix: 'REC', length: 5, current: 199, includeYear: true, includeMonth: false, separator: '-', resetRule: 'Yearly', sample: 'REC-2025-00199' }
];

export let memoryLookups = [
  // Asset Condition
  { id: 'lk-01', category: 'Asset Condition', code: 'COND_NEW', value: 'New / Unused', sequence: 1, status: 'Active', description: 'Brand new item received from supplier' },
  { id: 'lk-02', category: 'Asset Condition', code: 'COND_EXC', value: 'Excellent', sequence: 2, status: 'Active', description: 'Operates perfectly with minimal signs of use' },
  { id: 'lk-03', category: 'Asset Condition', code: 'COND_GOOD', value: 'Good', sequence: 3, status: 'Active', description: 'Normal operational condition with ordinary wear' },
  { id: 'lk-04', category: 'Asset Condition', code: 'COND_FAIR', value: 'Fair', sequence: 4, status: 'Active', description: 'Functional but requires maintenance attention soon' },
  { id: 'lk-05', category: 'Asset Condition', code: 'COND_POOR', value: 'Poor', sequence: 5, status: 'Active', description: 'Heavy degradation or frequent breakdowns' },
  { id: 'lk-06', category: 'Asset Condition', code: 'COND_SCRAP', value: 'Scrap / Beyond Repair', sequence: 6, status: 'Active', description: 'Not economically repairable' },

  // Asset Criticality
  { id: 'lk-07', category: 'Asset Criticality', code: 'CRIT_BIZ', value: 'Business Critical', sequence: 1, status: 'Active', description: 'Downtime immediately halts revenue operations' },
  { id: 'lk-08', category: 'Asset Criticality', code: 'CRIT_ESS', value: 'Essential', sequence: 2, status: 'Active', description: 'High operational impact' },
  { id: 'lk-09', category: 'Asset Criticality', code: 'CRIT_NORM', value: 'Normal', sequence: 3, status: 'Active', description: 'Standard operational asset' },
  { id: 'lk-10', category: 'Asset Criticality', code: 'CRIT_LOW', value: 'Low Impact', sequence: 4, status: 'Active', description: 'Non-critical peripheral' },

  // Movement Reason
  { id: 'lk-11', category: 'Movement Reason', code: 'MOV_DEPT', value: 'Inter-department Transfer', sequence: 1, status: 'Active', description: 'Transferring to another functional team' },
  { id: 'lk-12', category: 'Movement Reason', code: 'MOV_RELOC', value: 'Office Relocation', sequence: 2, status: 'Active', description: 'Relocation to new branch or facility' },
  { id: 'lk-13', category: 'Movement Reason', code: 'MOV_TEMP', value: 'Temporary Custody', sequence: 3, status: 'Active', description: 'Short-term project assignment' },
  { id: 'lk-14', category: 'Movement Reason', code: 'MOV_REP', value: 'Sent for Repair / Calibration', sequence: 4, status: 'Active', description: 'External workshop service' },

  // Disposal Reason
  { id: 'lk-15', category: 'Disposal Reason', code: 'DSP_OBS', value: 'Technological Obsolescence', sequence: 1, status: 'Active', description: 'Replaced by newer standards' },
  { id: 'lk-16', category: 'Disposal Reason', code: 'DSP_DAM', value: 'Damaged Beyond Economic Repair', sequence: 2, status: 'Active', description: 'Repair exceeds book value' },
  { id: 'lk-17', category: 'Disposal Reason', code: 'DSP_EOL', value: 'End of Useful Lifecycle', sequence: 3, status: 'Active', description: 'Completed depreciation and useful lifespan' },
  { id: 'lk-18', category: 'Disposal Reason', code: 'DSP_LOST', value: 'Lost or Stolen', sequence: 4, status: 'Active', description: 'Missing post physical audit investigation' }
];

export async function getSystemConfig(req, res) {
  try {
    res.json({ success: true, config: memoryConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateSystemConfigSection(req, res) {
  try {
    const { section } = req.params;
    if (!memoryConfig[section]) {
      return res.status(400).json({ success: false, error: `Invalid config section: ${section}` });
    }
    memoryConfig[section] = { ...memoryConfig[section], ...req.body };
    res.json({ success: true, message: `${section} settings updated successfully`, config: memoryConfig[section] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getNumberingSchemes(req, res) {
  try {
    res.json({ success: true, schemes: memoryNumberingSchemes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateNumberingScheme(req, res) {
  try {
    const { id } = req.params;
    const index = memoryNumberingSchemes.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Scheme not found' });

    const updated = { ...memoryNumberingSchemes[index], ...req.body };
    const currentYear = new Date().getFullYear();
    const formattedSeq = String(updated.current + 1).padStart(updated.length, '0');
    updated.sample = `${updated.prefix}${updated.separator}${updated.includeYear ? currentYear + updated.separator : ''}${formattedSeq}`;

    memoryNumberingSchemes[index] = updated;
    res.json({ success: true, scheme: updated, message: 'Numbering scheme updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getLookups(req, res) {
  try {
    const { category, status } = req.query;
    let list = [...memoryLookups];
    if (category && category !== 'All') list = list.filter(l => l.category === category);
    if (status && status !== 'All') list = list.filter(l => l.status === status);
    res.json({ success: true, lookups: list, categories: [...new Set(memoryLookups.map(l => l.category))] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createLookup(req, res) {
  try {
    const { category, code, value, description } = req.body;
    if (!category || !code || !value) return res.status(400).json({ success: false, error: 'Category, code and value are required' });

    const newLookup = {
      id: `lk-${Date.now()}`,
      category,
      code,
      value,
      sequence: memoryLookups.filter(l => l.category === category).length + 1,
      status: 'Active',
      description: description || ''
    };

    memoryLookups.push(newLookup);
    res.status(201).json({ success: true, lookup: newLookup, message: 'Lookup item added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleLookupStatus(req, res) {
  try {
    const { id } = req.params;
    const lookup = memoryLookups.find(l => l.id === id);
    if (!lookup) return res.status(404).json({ success: false, error: 'Lookup item not found' });
    lookup.status = lookup.status === 'Active' ? 'Inactive' : 'Active';
    res.json({ success: true, lookup, message: `Lookup status changed to ${lookup.status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
