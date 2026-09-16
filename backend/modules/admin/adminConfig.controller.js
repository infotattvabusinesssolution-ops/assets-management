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

// =========================================================================
// 4. SYSTEM CONFIGURATION PARAMETER REGISTER (Screenshot 1)
// =========================================================================

export let memoryParameters = [
  { id: 'PARAM-001', name: 'Site Name', module: 'General', category: 'Organization', currentValue: 'Dubai HQ', defaultValue: 'Dubai HQ', parameterType: 'Text', status: 'Active', description: 'Primary organizational operational facility name for reports and transactions.' },
  { id: 'PARAM-002', name: 'Default Currency', module: 'General', category: 'Finance', currentValue: 'AED', defaultValue: 'AED', parameterType: 'Lookup', status: 'Active', description: 'Base functional reporting currency used across asset valuation, depreciation and procurement.' },
  { id: 'PARAM-003', name: 'Date Format', module: 'General', category: 'Localization', currentValue: 'dd/MM/yyyy', defaultValue: 'dd/MM/yyyy', parameterType: 'Lookup', status: 'Active', description: 'System-wide calendar display format for asset lifecycle and audit stamps.' },
  { id: 'PARAM-004', name: 'Time Zone', module: 'General', category: 'Localization', currentValue: '(UTC+04:00) Dubai', defaultValue: '(UTC+04:00) Dubai', parameterType: 'Lookup', status: 'Active', description: 'Standard regional timezone used for timestamps, scheduler jobs and audit records.' },
  { id: 'PARAM-005', name: 'Asset Code Prefix', module: 'Asset', category: 'Numbering', currentValue: 'AST', defaultValue: 'AST', parameterType: 'Text', status: 'Active', description: 'Alphanumeric root prefix assigned to auto-generated physical and IT asset tag identifiers.' },
  { id: 'PARAM-006', name: 'Auto Generate Asset Code', module: 'Asset', category: 'Numbering', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Enforces automated sequential asset identifier generation during asset intake and bulk registration.' },
  { id: 'PARAM-007', name: 'Default Asset Status', module: 'Asset', category: 'Defaults', currentValue: 'Active', defaultValue: 'Active', parameterType: 'Lookup', status: 'Active', description: 'Initial lifecycle status assigned to newly registered and capitalized assets.' },
  { id: 'PARAM-008', name: 'Maintenance Work Order Prefix', module: 'Maintenance', category: 'Numbering', currentValue: 'WO', defaultValue: 'WO', parameterType: 'Text', status: 'Active', description: 'Standard prefix assigned to corrective and preventive maintenance tickets.' },
  { id: 'PARAM-009', name: 'Default Warranty Period (Months)', module: 'Maintenance', category: 'Defaults', currentValue: '12', defaultValue: '12', parameterType: 'Number', status: 'Active', description: 'Standard warranty duration populated on asset creation if not provided by purchase contract.' },
  { id: 'PARAM-010', name: 'Enable Email Notifications', module: 'General', category: 'Notifications', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Global master switch for SMTP notification alerts, work order dispatches and threshold alarms.' },
  { id: 'PARAM-011', name: 'Allow Negative Stock', module: 'Inventory', category: 'Controls', currentValue: 'No', defaultValue: 'No', parameterType: 'Boolean', status: 'Active', description: 'Strict warehouse control preventing spare parts stock balances from falling below zero.' },
  { id: 'PARAM-012', name: 'Default Valuation Method', module: 'Inventory', category: 'Finance', currentValue: 'FIFO', defaultValue: 'FIFO', parameterType: 'Lookup', status: 'Active', description: 'Inventory cost accounting method (First In First Out vs Weighted Average Cost).' },
  { id: 'PARAM-013', name: 'Auto Reorder Calculation', module: 'Inventory', category: 'Automation', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Automated nightly calculation of spare parts reorder points based on consumption velocity and lead time.' },
  { id: 'PARAM-014', name: 'Default Lead Time Buffer (Days)', module: 'Inventory', category: 'Procurement', currentValue: '7', defaultValue: '7', parameterType: 'Number', status: 'Active', description: 'Safety lead-time buffer applied in days to spare part stock reorder formula.' },
  { id: 'PARAM-015', name: 'Session Timeout (Minutes)', module: 'General', category: 'Security', currentValue: '30', defaultValue: '30', parameterType: 'Number', status: 'Active', description: 'Automatic user session expiration threshold during inactivity for cybersecurity compliance.' },
  { id: 'PARAM-016', name: 'Max File Upload Size (MB)', module: 'General', category: 'Storage', currentValue: '15', defaultValue: '15', parameterType: 'Number', status: 'Active', description: 'Maximum permitted file attachment size for invoices, warranty certificates and manuals.' },
  { id: 'PARAM-017', name: 'Enable Asset Images', module: 'Asset', category: 'Media', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Permits capturing and uploading photographic evidence for asset condition and verification.' },
  { id: 'PARAM-018', name: 'Max Images Per Asset', module: 'Asset', category: 'Media', currentValue: '5', defaultValue: '5', parameterType: 'Number', status: 'Active', description: 'Maximum number of photographic attachments stored per registered asset.' },
  { id: 'PARAM-019', name: 'Default Depreciation Method', module: 'Asset', category: 'Finance', currentValue: 'Straight Line Method (SLM)', defaultValue: 'Straight Line Method (SLM)', parameterType: 'Lookup', status: 'Active', description: 'Accounting depreciation formula applied to capitalized fixed assets.' },
  { id: 'PARAM-020', name: 'Depreciation Useful Life (Years)', module: 'Asset', category: 'Finance', currentValue: '5', defaultValue: '5', parameterType: 'Number', status: 'Active', description: 'Standard depreciation useful lifespan assigned to IT hardware and office assets.' },
  { id: 'PARAM-021', name: 'Primary RFID Tag Protocol', module: 'Asset', category: 'Tracking', currentValue: 'EPC Gen2 / UHF', defaultValue: 'EPC Gen2 / UHF', parameterType: 'Lookup', status: 'Active', description: 'Standard radio-frequency communication standard for passive smart asset tags.' },
  { id: 'PARAM-022', name: 'Work Order SLA Critical (Hours)', module: 'Maintenance', category: 'SLA', currentValue: '4', defaultValue: '4', parameterType: 'Number', status: 'Active', description: 'Resolution turnaround SLA threshold for Priority 1 critical equipment breakdowns.' },
  { id: 'PARAM-023', name: 'Work Order Auto Escalation', module: 'Maintenance', category: 'Automation', currentValue: 'Yes', defaultValue: 'Yes', parameterType: 'Boolean', status: 'Active', description: 'Automatically re-routes overdue work orders to maintenance supervisor upon SLA breach.' },
  { id: 'PARAM-024', name: 'PM Work Order Advance Days', module: 'Maintenance', category: 'SLA', currentValue: '7', defaultValue: '7', parameterType: 'Number', status: 'Active', description: 'Days in advance to generate preventive maintenance work orders prior to scheduled due date.' }
];

export async function getParametersList(req, res) {
  try {
    const { module, category, parameterType, status, search } = req.query;
    let list = [...memoryParameters];

    if (module && module !== 'All Modules' && module !== 'All') {
      list = list.filter(p => p.module.toLowerCase() === module.toLowerCase());
    }
    if (category && category !== 'All Categories' && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (parameterType && parameterType !== 'All Types' && parameterType !== 'All') {
      list = list.filter(p => p.parameterType.toLowerCase() === parameterType.toLowerCase());
    }
    if (status && status !== 'All Statuses' && status !== 'All') {
      list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.currentValue.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      parameters: list,
      total: list.length,
      allModules: ['General', 'Asset', 'Inventory', 'Maintenance'],
      allCategories: ['Organization', 'Finance', 'Localization', 'Numbering', 'Defaults', 'Notifications', 'Controls', 'Automation', 'Procurement', 'Security', 'Storage', 'Media', 'Tracking', 'SLA']
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createParameter(req, res) {
  try {
    const body = req.body;
    const newId = `PARAM-${String(memoryParameters.length + 1).padStart(3, '0')}`;
    const newParam = {
      id: newId,
      name: body.name || 'New Parameter',
      module: body.module || 'General',
      category: body.category || 'Defaults',
      currentValue: body.currentValue || '',
      defaultValue: body.defaultValue || body.currentValue || '',
      parameterType: body.parameterType || 'Text',
      status: body.status || 'Active',
      description: body.description || ''
    };
    memoryParameters.unshift(newParam);
    res.status(201).json({ success: true, message: `Parameter ${newParam.name} created`, parameter: newParam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateParameter(req, res) {
  try {
    const { id } = req.params;
    const idx = memoryParameters.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Parameter not found' });

    memoryParameters[idx] = { ...memoryParameters[idx], ...req.body, id: memoryParameters[idx].id };
    res.json({ success: true, message: `Parameter ${memoryParameters[idx].name} updated`, parameter: memoryParameters[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteParameter(req, res) {
  try {
    const { id } = req.params;
    const idx = memoryParameters.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Parameter not found' });

    memoryParameters.splice(idx, 1);
    res.json({ success: true, message: 'Parameter removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// =========================================================================
// 5. WORKFLOW & APPROVALS CONSOLE (Screenshot 2)
// =========================================================================

export let memoryWorkflows = [
  {
    id: 'WF-001',
    name: 'Asset Purchase Approval',
    transactionType: 'Asset Procurement',
    description: 'Approval for asset purchase requests based on amount and asset category.',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Requester', role: 'Initiator', action: 'Submit Request', type: 'initiator' },
      { id: 2, title: 'Department Manager', role: 'Approval', action: 'Approve / Reject', type: 'approval' },
      { id: 3, title: 'Asset Manager', role: 'Final Approval', action: 'Approve / Reject', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Department Manager', approvalType: 'Approval', condition: 'Amount ≤ AED 50,000' },
      { level: 2, approverRole: 'Asset Manager', approvalType: 'Approval', condition: 'Amount > AED 50,000' },
      { level: 3, approverRole: 'Finance Manager', approvalType: 'Final Approval', condition: 'All Requests' }
    ]
  },
  {
    id: 'WF-002',
    name: 'Asset Disposal Approval',
    transactionType: 'Asset Disposal',
    description: 'Approval for asset disposal / write-off',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Custodian', role: 'Initiator', action: 'Submit Disposal Request', type: 'initiator' },
      { id: 2, title: 'Asset Manager', role: 'Approval', action: 'Approve / Reject', type: 'approval' },
      { id: 3, title: 'Finance Controller', role: 'Final Approval', action: 'Sign Off Write-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Asset Manager', approvalType: 'Approval', condition: 'All Requests' },
      { level: 2, approverRole: 'Finance Controller', approvalType: 'Final Approval', condition: 'Book Value > AED 10,000' }
    ]
  },
  {
    id: 'WF-003',
    name: 'Asset Transfer Approval',
    transactionType: 'Asset Transfer',
    description: 'Approval for inter-location asset transfer',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Sending Custodian', role: 'Initiator', action: 'Submit Transfer', type: 'initiator' },
      { id: 2, title: 'Receiving Manager', role: 'Approval', action: 'Accept / Reject', type: 'approval' },
      { id: 3, title: 'Asset Administrator', role: 'Final Approval', action: 'Update Custody', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Receiving Department Head', approvalType: 'Approval', condition: 'Inter-Site Transfer' },
      { level: 2, approverRole: 'Asset Administrator', approvalType: 'Final Approval', condition: 'All Transfers' }
    ]
  },
  {
    id: 'WF-004',
    name: 'Work Order Approval',
    transactionType: 'Maintenance',
    description: 'Approval for maintenance work orders',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Technician', role: 'Initiator', action: 'Create Work Order', type: 'initiator' },
      { id: 2, title: 'Maintenance Lead', role: 'Approval', action: 'Validate & Assign', type: 'approval' },
      { id: 3, title: 'Plant Supervisor', role: 'Final Approval', action: 'Sign Off Work Order', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Maintenance Lead', approvalType: 'Approval', condition: 'Estimated Cost ≤ AED 10,000' },
      { level: 2, approverRole: 'Facility Manager', approvalType: 'Approval', condition: 'Estimated Cost > AED 10,000' },
      { level: 3, approverRole: 'Operations Director', approvalType: 'Final Approval', condition: 'Critical Priority Only' }
    ]
  },
  {
    id: 'WF-005',
    name: 'Inventory Adjustment Approval',
    transactionType: 'Inventory',
    description: 'Approval for stock adjustments',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Logistics',
    status: 'Inactive',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Storekeeper', role: 'Initiator', action: 'Submit Stock Adjustment', type: 'initiator' },
      { id: 2, title: 'Inventory Manager', role: 'Final Approval', action: 'Approve / Reject Adjustment', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Warehouse Lead', approvalType: 'Approval', condition: 'Variance Value ≤ AED 5,000' },
      { level: 2, approverRole: 'Inventory Manager', approvalType: 'Final Approval', condition: 'Variance Value > AED 5,000' }
    ]
  },
  {
    id: 'WF-006',
    name: 'Capital Expenditure Approval',
    transactionType: 'Asset Procurement',
    description: 'Capitalized equipment sign-off',
    levelsCount: 4,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Project Lead', role: 'Initiator', action: 'Submit CAPEX Request', type: 'initiator' },
      { id: 2, title: 'Finance Analyst', role: 'Review', action: 'Budget Validation', type: 'approval' },
      { id: 3, title: 'CFO', role: 'Approval', action: 'Financial Authorization', type: 'approval' },
      { id: 4, title: 'Managing Director', role: 'Final Approval', action: 'Executive Sign-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Finance Analyst', approvalType: 'Verification', condition: 'All CAPEX' },
      { level: 2, approverRole: 'CFO', approvalType: 'Approval', condition: 'Amount > AED 100,000' },
      { level: 3, approverRole: 'CEO / Board', approvalType: 'Final Approval', condition: 'Amount > AED 500,000' }
    ]
  },
  {
    id: 'WF-007',
    name: 'Scrap Authorization',
    transactionType: 'Asset Disposal',
    description: 'Hazardous/hazardous scrap disposal sign-off',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Safety Officer', role: 'Initiator', action: 'Inspect & File', type: 'initiator' },
      { id: 2, title: 'HSE Manager', role: 'Approval', action: 'Environmental Sign-off', type: 'approval' },
      { id: 3, title: 'Plant General Manager', role: 'Final Approval', action: 'Approve Destruction', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'HSE Compliance Lead', approvalType: 'Safety Sign-Off', condition: 'All Hazardous Items' },
      { level: 2, approverRole: 'Operations Director', approvalType: 'Final Approval', condition: 'All Scrap Operations' }
    ]
  },
  {
    id: 'WF-008',
    name: 'Inter-Company Asset Move',
    transactionType: 'Asset Transfer',
    description: 'Asset transfer between distinct legal entities',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Source Entity Controller', role: 'Initiator', action: 'Initiate Transfer', type: 'initiator' },
      { id: 2, title: 'Target Entity Controller', role: 'Approval', action: 'Confirm Receipt & Terms', type: 'approval' },
      { id: 3, title: 'Group Tax & Treasury', role: 'Final Approval', action: 'Transfer Pricing Sign-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Source Finance Head', approvalType: 'Approval', condition: 'Entity ≠ Target Entity' },
      { level: 2, approverRole: 'Group Tax Specialist', approvalType: 'Tax Review', condition: 'Cross-Border Move' },
      { level: 3, approverRole: 'Group Financial Controller', approvalType: 'Final Approval', condition: 'All Inter-Company Moves' }
    ]
  },
  {
    id: 'WF-009',
    name: 'High-Cost Work Order Overhaul',
    transactionType: 'Maintenance',
    description: 'Maintenance work order exceeding AED 25,000',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Maintenance Engineer', role: 'Initiator', action: 'Submit Overhaul Proposal', type: 'initiator' },
      { id: 2, title: 'Chief Engineer', role: 'Approval', action: 'Technical Assessment', type: 'approval' },
      { id: 3, title: 'VP Operations', role: 'Final Approval', action: 'Commit Overhaul Budget', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Chief Engineer', approvalType: 'Technical Validation', condition: 'Cost > AED 25,000' },
      { level: 2, approverRole: 'Finance Asset Controller', approvalType: 'Budget Clearance', condition: 'Cost > AED 25,000' },
      { level: 3, approverRole: 'VP Operations', approvalType: 'Final Approval', condition: 'Cost > AED 50,000' }
    ]
  },
  {
    id: 'WF-010',
    name: 'Stock Write-off Approval',
    transactionType: 'Inventory',
    description: 'Inventory discrepancy reconciliation',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Logistics',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Stock Auditor', role: 'Initiator', action: 'File Variance Report', type: 'initiator' },
      { id: 2, title: 'Supply Chain Director', role: 'Approval', action: 'Review Loss Analysis', type: 'approval' },
      { id: 3, title: 'Finance Controller', role: 'Final Approval', action: 'Authorize Ledger Write-Off', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Supply Chain Director', approvalType: 'Investigation Sign-Off', condition: 'All Variances' },
      { level: 2, approverRole: 'Finance Controller', approvalType: 'Final Approval', condition: 'Write-Off Amount > AED 5,000' }
    ]
  },
  {
    id: 'WF-011',
    name: 'Emergency Repair Bypass',
    transactionType: 'Maintenance',
    description: 'Post-facto emergency breakdown approval',
    levelsCount: 2,
    company: 'All Companies',
    businessUnit: 'Operations',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Shift Supervisor', role: 'Initiator', action: 'Submit Post-Repair Audit', type: 'initiator' },
      { id: 2, title: 'Operations Manager', role: 'Final Approval', action: 'Post-Facto Ratification', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Operations Manager', approvalType: 'Approval', condition: 'Emergency Ticket Type' },
      { level: 2, approverRole: 'Health & Safety Lead', approvalType: 'Final Approval', condition: 'Critical Assets Only' }
    ]
  },
  {
    id: 'WF-012',
    name: 'Audit Variance Reconciliation',
    transactionType: 'Verification & Audit',
    description: 'Sign-off for unlocated or damaged audit findings',
    levelsCount: 3,
    company: 'All Companies',
    businessUnit: 'Corporate',
    status: 'Active',
    effectiveFrom: '2025-01-01',
    applicableFor: 'All Companies',
    stages: [
      { id: 1, title: 'Lead Field Auditor', role: 'Initiator', action: 'Submit Audit Reconciliation', type: 'initiator' },
      { id: 2, title: 'Internal Audit Manager', role: 'Approval', action: 'Reconcile Findings', type: 'approval' },
      { id: 3, title: 'Head of Internal Control', role: 'Final Approval', action: 'Close Campaign Reconciliation', type: 'final' }
    ],
    levels: [
      { level: 1, approverRole: 'Internal Audit Manager', approvalType: 'Audit Approval', condition: 'Not Found Assets > 0' },
      { level: 2, approverRole: 'Asset Custody Administrator', approvalType: 'Custody Resolution', condition: 'Wrong Custodian' },
      { level: 3, approverRole: 'Head of Internal Control', approvalType: 'Final Sign-Off', condition: 'All Campaign Closures' }
    ]
  }
];

export async function getWorkflowsList(req, res) {
  try {
    const { transactionType, status, company, businessUnit, search } = req.query;
    let list = [...memoryWorkflows];

    if (transactionType && transactionType !== 'All Transaction Types' && transactionType !== 'All') {
      list = list.filter(w => w.transactionType.toLowerCase() === transactionType.toLowerCase());
    }
    if (status && status !== 'All Statuses' && status !== 'All') {
      list = list.filter(w => w.status.toLowerCase() === status.toLowerCase());
    }
    if (company && company !== 'All Companies' && company !== 'All') {
      list = list.filter(w => w.company === 'All Companies' || w.company.toLowerCase() === company.toLowerCase());
    }
    if (businessUnit && businessUnit !== 'All Business Units' && businessUnit !== 'All') {
      list = list.filter(w => w.businessUnit.toLowerCase() === businessUnit.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.transactionType.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      workflows: list,
      total: list.length,
      allTransactionTypes: ['Asset Procurement', 'Asset Disposal', 'Asset Transfer', 'Maintenance', 'Inventory', 'Verification & Audit']
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getWorkflowById(req, res) {
  try {
    const { id } = req.params;
    const wf = memoryWorkflows.find(w => w.id === id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, workflow: wf });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createWorkflow(req, res) {
  try {
    const body = req.body;
    const newId = `WF-${String(memoryWorkflows.length + 1).padStart(3, '0')}`;
    const newWf = {
      id: newId,
      name: body.name || 'New Approval Workflow',
      transactionType: body.transactionType || 'Asset Procurement',
      description: body.description || 'Approval workflow rule',
      levelsCount: body.levels?.length || body.levelsCount || 2,
      company: body.company || 'All Companies',
      businessUnit: body.businessUnit || 'Corporate',
      status: body.status || 'Active',
      effectiveFrom: body.effectiveFrom || new Date().toISOString().slice(0, 10),
      applicableFor: body.applicableFor || 'All Companies',
      stages: body.stages || [
        { id: 1, title: 'Requester', role: 'Initiator', action: 'Submit Request', type: 'initiator' },
        { id: 2, title: 'Approver', role: 'Approval', action: 'Approve / Reject', type: 'approval' },
        { id: 3, title: 'Manager', role: 'Final Approval', action: 'Approve / Reject', type: 'final' }
      ],
      levels: body.levels || [
        { level: 1, approverRole: 'Department Manager', approvalType: 'Approval', condition: 'All Requests' },
        { level: 2, approverRole: 'Asset Administrator', approvalType: 'Final Approval', condition: 'All Requests' }
      ]
    };
    memoryWorkflows.unshift(newWf);
    res.status(201).json({ success: true, message: `Workflow ${newWf.name} created`, workflow: newWf });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateWorkflow(req, res) {
  try {
    const { id } = req.params;
    const idx = memoryWorkflows.findIndex(w => w.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Workflow not found' });

    memoryWorkflows[idx] = { ...memoryWorkflows[idx], ...req.body, id: memoryWorkflows[idx].id };
    res.json({ success: true, message: `Workflow ${memoryWorkflows[idx].name} updated`, workflow: memoryWorkflows[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleWorkflowStatus(req, res) {
  try {
    const { id } = req.params;
    const wf = memoryWorkflows.find(w => w.id === id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    wf.status = wf.status === 'Active' ? 'Inactive' : 'Active';
    res.json({ success: true, workflow: wf, message: `Workflow status changed to ${wf.status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function testWorkflowSimulation(req, res) {
  try {
    const { id } = req.params;
    const wf = memoryWorkflows.find(w => w.id === id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });

    res.json({
      success: true,
      message: `Workflow test execution simulation for ${wf.name} completed. All ${wf.levelsCount} levels validated successfully with no rule conflicts.`,
      simulationResult: {
        workflowId: wf.id,
        status: 'Pass',
        evaluatedLevels: wf.levels?.length || wf.levelsCount,
        routingPath: wf.stages?.map(s => s.title).join(' -> ') || 'Requester -> Dept Manager -> Asset Manager'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
