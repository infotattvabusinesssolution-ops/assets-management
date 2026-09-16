import prisma from '../../config/prisma.js';

// ===================================================================
// 1. MASTER DATA SETUP (4-Tier Asset Hierarchy, Suppliers, UOM, Manufacturers)
// ===================================================================

const INITIAL_ASSET_GROUPS = [
  {
    id: 'GRP-001',
    code: 'IT',
    name: 'Information Technology',
    description: 'Computing hardware, network infrastructure, servers, and datacenter assets',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 1420,
    classesCount: 4,
    categoriesCount: 18,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-002',
    code: 'BLD',
    name: 'Buildings & Facilities',
    description: 'Real estate, HVAC plants, generators, elevators, and structural infrastructure',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 380,
    classesCount: 5,
    categoriesCount: 14,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-003',
    code: 'PLM',
    name: 'Plant & Machinery',
    description: 'Manufacturing lines, fabrication tools, transformers, and industrial pumps',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 560,
    classesCount: 6,
    categoriesCount: 22,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-004',
    code: 'VEH',
    name: 'Vehicles & Fleet',
    description: 'Corporate cars, delivery vans, forklifts, trucks, and heavy transport',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 125,
    classesCount: 3,
    categoriesCount: 8,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-005',
    code: 'FF',
    name: 'Furniture & Fixtures',
    description: 'Office desks, ergonomic executive chairs, modular conference tables, and cabinetry',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 940,
    classesCount: 3,
    categoriesCount: 12,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-006',
    code: 'MED',
    name: 'Medical & Laboratory Equipment',
    description: 'Centrifuges, analyzers, clinical diagnostic tools, and sterilization units',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 190,
    classesCount: 4,
    categoriesCount: 10,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-007',
    code: 'SW',
    name: 'Software & Digital Licenses',
    description: 'Enterprise ERP seats, SaaS subscriptions, operating system licenses, and patents',
    assetType: 'Intangible',
    status: 'Active',
    totalAssets: 680,
    classesCount: 3,
    categoriesCount: 9,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'GRP-008',
    code: 'TLS',
    name: 'Tools & Workshop Equipment',
    description: 'Precision calibration kits, power drills, handheld scanners, and technician sets',
    assetType: 'Physical',
    status: 'Active',
    totalAssets: 410,
    classesCount: 2,
    categoriesCount: 7,
    createdAt: '2025-01-10T08:00:00Z'
  }
];

const INITIAL_ASSET_CLASSES = [
  { id: 'CLS-001', groupId: 'GRP-001', groupCode: 'IT', code: 'COMP', name: 'Computing Hardware', description: 'Laptops, desktops, workstations, tablets, and handheld endpoints', totalAssets: 820, status: 'Active' },
  { id: 'CLS-002', groupId: 'GRP-001', groupCode: 'IT', code: 'NET', name: 'Network Infrastructure', description: 'Core switches, edge routers, wireless access points, and firewalls', totalAssets: 340, status: 'Active' },
  { id: 'CLS-003', groupId: 'GRP-001', groupCode: 'IT', code: 'SRV', name: 'Servers & Datacenter Storage', description: 'Rack servers, SAN storage arrays, and tape backup drives', totalAssets: 160, status: 'Active' },
  { id: 'CLS-004', groupId: 'GRP-001', groupCode: 'IT', code: 'PER', name: 'Peripherals & Displays', description: 'Monitors, multi-function laser printers, and video conference bars', totalAssets: 100, status: 'Active' },
  { id: 'CLS-005', groupId: 'GRP-002', groupCode: 'BLD', code: 'HVAC', name: 'HVAC & Climate Control', description: 'Chillers, air handling units, and precision AC', totalAssets: 190, status: 'Active' },
  { id: 'CLS-006', groupId: 'GRP-002', groupCode: 'BLD', code: 'PWR', name: 'Power & Generation', description: 'Backup diesel generators, industrial UPS, and solar inverters', totalAssets: 90, status: 'Active' },
  { id: 'CLS-007', groupId: 'GRP-005', groupCode: 'FF', code: 'SEAT', name: 'Seating & Ergonomics', description: 'Task chairs, lounge sofas, and stools', totalAssets: 520, status: 'Active' },
  { id: 'CLS-008', groupId: 'GRP-005', groupCode: 'FF', code: 'DESK', name: 'Desks & Workstations', description: 'Height-adjustable standing desks and executive tables', totalAssets: 420, status: 'Active' }
];

const INITIAL_CATEGORIES = [
  { id: 'CAT-001', classId: 'CLS-001', classCode: 'COMP', code: 'LAP', name: 'Laptops', usefulLifeMonths: 36, depreciationMethod: 'Straight Line', totalAssets: 550, status: 'Active' },
  { id: 'CAT-002', classId: 'CLS-001', classCode: 'COMP', code: 'DSK', name: 'Desktops & Workstations', usefulLifeMonths: 48, depreciationMethod: 'Straight Line', totalAssets: 210, status: 'Active' },
  { id: 'CAT-003', classId: 'CLS-002', classCode: 'NET', code: 'SWT', name: 'Network Switches', usefulLifeMonths: 60, depreciationMethod: 'Straight Line', totalAssets: 180, status: 'Active' },
  { id: 'CAT-004', classId: 'CLS-002', classCode: 'NET', code: 'AP', name: 'Wireless Access Points', usefulLifeMonths: 48, depreciationMethod: 'Straight Line', totalAssets: 160, status: 'Active' },
  { id: 'CAT-005', classId: 'CLS-004', classCode: 'PER', code: 'MON', name: 'Monitors & Displays', usefulLifeMonths: 36, depreciationMethod: 'Straight Line', totalAssets: 60, status: 'Active' },
  { id: 'CAT-006', classId: 'CLS-007', classCode: 'SEAT', code: 'CHAIR', name: 'Office Chairs', usefulLifeMonths: 60, depreciationMethod: 'Straight Line', totalAssets: 520, status: 'Active' }
];

const INITIAL_SUBCATEGORIES = [
  { id: 'SUB-001', categoryId: 'CAT-001', categoryCode: 'LAP', code: 'ULTRA', name: 'Ultrabooks & Lightweight Laptops', totalAssets: 320, status: 'Active' },
  { id: 'SUB-002', categoryId: 'CAT-001', categoryCode: 'LAP', code: 'PERF', name: 'Performance Mobile Workstations', totalAssets: 230, status: 'Active' },
  { id: 'SUB-003', categoryId: 'CAT-003', categoryCode: 'SWT', code: 'POE24', name: '24-Port Gigabit PoE+ Switches', totalAssets: 95, status: 'Active' },
  { id: 'SUB-004', categoryId: 'CAT-003', categoryCode: 'SWT', code: 'POE48', name: '48-Port 10G SFP+ Core Switches', totalAssets: 85, status: 'Active' }
];

const INITIAL_SUPPLIERS = [
  { id: 'SUP-001', code: 'DELL-UAE', name: 'Dell Technologies Middle East FZ-LLC', contactPerson: 'Zaid Al-Mahmoud', email: 'zaid.al@dell.com', phone: '+971 4 425 7000', country: 'United Arab Emirates', taxId: 'TRN-100293849100003', rating: 4.9, status: 'Active', category: 'IT Hardware' },
  { id: 'SUP-002', code: 'CISCO-GULF', name: 'Cisco Systems International B.V.', contactPerson: 'Karim Mansour', email: 'kmansour@cisco.com', phone: '+971 4 390 7777', country: 'United Arab Emirates', taxId: 'TRN-100482910400003', rating: 4.8, status: 'Active', category: 'Networking' },
  { id: 'SUP-003', code: 'STEELCASE-ME', name: 'Steelcase Middle East Office Solutions', contactPerson: 'Elena Rostova', email: 'erostova@steelcase.com', phone: '+971 4 360 4000', country: 'United Arab Emirates', taxId: 'TRN-100774829100003', rating: 4.7, status: 'Active', category: 'Furniture' },
  { id: 'SUP-004', code: 'NAFFCO-CORP', name: 'NAFFCO National Fire Fighting Equipment', contactPerson: 'Khalid Qasim', email: 'sales@naffco.com', phone: '+971 4 815 1111', country: 'United Arab Emirates', taxId: 'TRN-100882910200003', rating: 4.6, status: 'Active', category: 'Safety & HSE' }
];

const INITIAL_MANUFACTURERS = [
  { id: 'MFG-001', code: 'DELL', name: 'Dell Inc.', country: 'United States', supportContact: 'prosupport@dell.com', website: 'https://dell.com', status: 'Active' },
  { id: 'MFG-002', code: 'HP', name: 'HP Inc.', country: 'United States', supportContact: 'support@hp.com', website: 'https://hp.com', status: 'Active' },
  { id: 'MFG-003', code: 'CISCO', name: 'Cisco Systems', country: 'United States', supportContact: 'tac@cisco.com', website: 'https://cisco.com', status: 'Active' },
  { id: 'MFG-004', code: 'APPLE', name: 'Apple Inc.', country: 'United States', supportContact: 'enterprise@apple.com', website: 'https://apple.com', status: 'Active' },
  { id: 'MFG-005', code: 'STEELCASE', name: 'Steelcase Inc.', country: 'United States', supportContact: 'support@steelcase.com', website: 'https://steelcase.com', status: 'Active' }
];

const INITIAL_UOM = [
  { id: 'UOM-001', code: 'EA', name: 'Each / Unit', isBaseUnit: true, decimalPrecision: 0, status: 'Active' },
  { id: 'UOM-002', code: 'BOX', name: 'Box Pack', isBaseUnit: false, decimalPrecision: 0, status: 'Active' },
  { id: 'UOM-003', code: 'SET', name: 'Complete Set', isBaseUnit: true, decimalPrecision: 0, status: 'Active' },
  { id: 'UOM-004', code: 'MTR', name: 'Meter (Linear)', isBaseUnit: true, decimalPrecision: 2, status: 'Active' },
  { id: 'UOM-005', code: 'KG', name: 'Kilogram', isBaseUnit: true, decimalPrecision: 3, status: 'Active' }
];

// ===================================================================
// 2. INTEGRATIONS CONSOLE (7 Categories, Testing, Sync & Mappings)
// ===================================================================

const INITIAL_INTEGRATIONS = [
  {
    id: 'INT-001',
    name: 'SAP S/4HANA Fixed Assets & GL',
    category: 'ERP Systems',
    systemType: 'SAP S/4HANA Cloud',
    externalSystem: 'SAP ERP Financials',
    direction: 'Bi-directional',
    frequency: 'Daily',
    scheduleTime: '02:00 AM UTC',
    baseUrl: 'https://my300120.s4hana.ondemand.com/sap/opu/odata/sap/API_FIXEDASSET_GLLINEITEM',
    authType: 'OAuth 2.0 (mTLS Client Certificate)',
    status: 'Active',
    lastSync: 'Today at 02:00 AM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 142,
    syncErrorsToday: 0,
    description: 'Synchronizes capitalized asset asset values, monthly depreciation journals, and cost centers from SAP S/4HANA Finance.',
    dataMappings: [
      { sourceField: 'AssetMaster.ANLN1', targetField: 'assetNumber', transformation: 'Direct String Map', mandatory: true },
      { sourceField: 'AssetMaster.TXT50', targetField: 'assetName', transformation: 'Trim & Capitalize', mandatory: true },
      { sourceField: 'AssetValuation.KANSW', targetField: 'purchaseCost', transformation: 'Decimal to Currency (AED)', mandatory: true },
      { sourceField: 'AssetMaster.KOSTL', targetField: 'costCenterCode', transformation: 'Lookup Cost Center ID', mandatory: true }
    ],
    syncHistory: [
      { runId: 'RUN-SAP-901', timestamp: 'Today 02:00 AM', duration: '1m 24s', trigger: 'Scheduled', recordsIn: 142, recordsOut: 18, errors: 0, status: 'Success' },
      { runId: 'RUN-SAP-900', timestamp: 'Yesterday 02:00 AM', duration: '1m 32s', trigger: 'Scheduled', recordsIn: 89, recordsOut: 12, errors: 0, status: 'Success' }
    ]
  },
  {
    id: 'INT-002',
    name: 'Workday HCM Worker & Organization Sync',
    category: 'HR Systems',
    systemType: 'Workday Core HCM',
    externalSystem: 'Workday HR Cloud',
    direction: 'Inbound',
    frequency: 'Hourly',
    scheduleTime: 'Every 60 minutes',
    baseUrl: 'https://wd2-impl-services1.workday.com/ccx/service/customreport2/infotattva/Worker_Sync',
    authType: 'OAuth 2.0 Bearer Token',
    status: 'Active',
    lastSync: 'Today at 04:15 PM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 512,
    syncErrorsToday: 0,
    description: 'Inbound ingestion of active employee records, manager reporting hierarchies, departments, and employee exit events for asset custody.',
    dataMappings: [
      { sourceField: 'Worker.Employee_ID', targetField: 'employeeId', transformation: 'Uppercase String', mandatory: true },
      { sourceField: 'Worker.Legal_Full_Name', targetField: 'fullName', transformation: 'Direct Map', mandatory: true },
      { sourceField: 'Worker.Work_Email', targetField: 'email', transformation: 'Lowercase Format', mandatory: true },
      { sourceField: 'Worker.Cost_Center_Hierarchy', targetField: 'departmentId', transformation: 'Lookup Department', mandatory: true },
      { sourceField: 'Worker.Employment_Status', targetField: 'active', transformation: 'Boolean (Active=true)', mandatory: true }
    ],
    syncHistory: [
      { runId: 'RUN-WD-842', timestamp: 'Today 04:15 PM', duration: '42s', trigger: 'Scheduled', recordsIn: 512, recordsOut: 0, errors: 0, status: 'Success' },
      { runId: 'RUN-WD-841', timestamp: 'Today 03:15 PM', duration: '38s', trigger: 'Scheduled', recordsIn: 512, recordsOut: 0, errors: 0, status: 'Success' }
    ]
  },
  {
    id: 'INT-003',
    name: 'ServiceNow ITSM & CMDB Asset Gateway',
    category: 'ITSM',
    systemType: 'ServiceNow Washington DC',
    externalSystem: 'ServiceNow Enterprise Instance',
    direction: 'Bi-directional',
    frequency: 'Real-time',
    scheduleTime: 'Webhook / REST Push',
    baseUrl: 'https://infotattvacorp.service-now.com/api/now/table/alm_hardware',
    authType: 'Basic Auth / OAuth 2.0',
    status: 'Active',
    lastSync: 'Today at 04:45 PM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 88,
    syncErrorsToday: 0,
    description: 'Bi-directional integration mapping Asset360 hardware assets to ServiceNow Configuration Items (cmdb_ci_hardware) and synchronizing incident tickets.',
    dataMappings: [
      { sourceField: 'alm_hardware.asset_tag', targetField: 'tagNumber', transformation: 'Direct Map', mandatory: true },
      { sourceField: 'alm_hardware.serial_number', targetField: 'serialNumber', transformation: 'Direct Map', mandatory: true },
      { sourceField: 'alm_hardware.model', targetField: 'modelName', transformation: 'Lookup Model ID', mandatory: false }
    ],
    syncHistory: [
      { runId: 'RUN-SNOW-310', timestamp: 'Today 04:45 PM', duration: '8s', trigger: 'Real-time Event', recordsIn: 4, recordsOut: 2, errors: 0, status: 'Success' }
    ]
  },
  {
    id: 'INT-004',
    name: 'Microsoft Entra ID (Azure AD) Directory',
    category: 'Identity & Security',
    systemType: 'Microsoft Graph API v1.0',
    externalSystem: 'Azure Active Directory',
    direction: 'Inbound',
    frequency: 'Hourly',
    scheduleTime: 'Every 60 minutes',
    baseUrl: 'https://graph.microsoft.com/v1.0/users',
    authType: 'Microsoft Identity Platform (OAuth Client Credentials)',
    status: 'Active',
    lastSync: 'Today at 04:00 PM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 490,
    syncErrorsToday: 0,
    description: 'Maintains single sign-on user profiles, security group memberships, and role assignments in Asset360.',
    dataMappings: [
      { sourceField: 'user.userPrincipalName', targetField: 'username', transformation: 'Lowercase', mandatory: true },
      { sourceField: 'user.displayName', targetField: 'fullName', transformation: 'Direct Map', mandatory: true },
      { sourceField: 'user.jobTitle', targetField: 'designation', transformation: 'Direct Map', mandatory: false }
    ],
    syncHistory: [
      { runId: 'RUN-ENTRA-102', timestamp: 'Today 04:00 PM', duration: '18s', trigger: 'Scheduled', recordsIn: 490, recordsOut: 0, errors: 0, status: 'Success' }
    ]
  },
  {
    id: 'INT-005',
    name: 'Impinj RFID Speedway Gateway Hub',
    category: 'IoT & Devices',
    systemType: 'Impinj ItemSense / Octane SDK',
    externalSystem: 'Speedway Revolution R420 Readers',
    direction: 'Inbound',
    frequency: 'Real-time',
    scheduleTime: 'MQTT Stream (tcp://10.20.40.10:1883)',
    baseUrl: 'http://10.20.40.10:8080/api/v1/gateways/rfid',
    authType: 'API Key (HMAC Signature)',
    status: 'Active',
    lastSync: 'Today at 05:02 PM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 4210,
    syncErrorsToday: 0,
    description: 'High-speed edge ingestion of RFID EPC tag transition events across warehouse portals, choke points, and dock doors.',
    dataMappings: [
      { sourceField: 'tagEvent.epc', targetField: 'rfidEpc', transformation: 'Hex string 96-bit', mandatory: true },
      { sourceField: 'tagEvent.antennaPort', targetField: 'zoneId', transformation: 'Antenna to Zone Map', mandatory: true }
    ],
    syncHistory: [
      { runId: 'RUN-RFID-091', timestamp: 'Today 05:02 PM', duration: 'Continuous', trigger: 'MQTT Stream', recordsIn: 4210, recordsOut: 0, errors: 0, status: 'Success' }
    ]
  },
  {
    id: 'INT-006',
    name: 'Aruba Meridian RTLS Engine',
    category: 'IoT & Devices',
    systemType: 'Aruba BLE Beacons & AP-555',
    externalSystem: 'Aruba Central Meridian Cloud',
    direction: 'Inbound',
    frequency: 'Real-time',
    scheduleTime: 'WebSocket Feed',
    baseUrl: 'wss://edit.meridianapps.com/api/v1/locations/live',
    authType: 'Bearer Token',
    status: 'Warning',
    lastSync: 'Today at 03:40 PM',
    lastSyncStatus: 'Warning',
    recordsProcessedToday: 890,
    syncErrorsToday: 1,
    description: 'Indoor sub-meter location coordinates calculated from BLE asset beacons placed on hospital beds and high-value mobile carts.',
    dataMappings: [
      { sourceField: 'beacon.mac', targetField: 'bleMacAddress', transformation: 'Normalize MAC', mandatory: true },
      { sourceField: 'beacon.coordinates.x', targetField: 'coordX', transformation: 'Float Meter', mandatory: true },
      { sourceField: 'beacon.coordinates.y', targetField: 'coordY', transformation: 'Float Meter', mandatory: true }
    ],
    syncHistory: [
      { runId: 'RUN-RTLS-044', timestamp: 'Today 03:40 PM', duration: '12s', trigger: 'WebSocket Drop', recordsIn: 890, recordsOut: 0, errors: 1, status: 'Warning' }
    ]
  },
  {
    id: 'INT-007',
    name: 'SFTP Batch Financial Disposal Export',
    category: 'Other Systems',
    systemType: 'Secure SFTP Drop Service',
    externalSystem: 'External Auditor Vault',
    direction: 'Outbound',
    frequency: 'On Demand',
    scheduleTime: 'Manual / Monthly',
    baseUrl: 'sftp://vault.infotattva.com:22/audit/disposals/',
    authType: 'SSH Key Pair (ED25519)',
    status: 'Inactive',
    lastSync: '10 Sep 2026 at 06:00 PM',
    lastSyncStatus: 'Success',
    recordsProcessedToday: 0,
    syncErrorsToday: 0,
    description: 'Encrypted export of disposed assets, scrap certificates, sale proceeds, and write-off approvals to external compliance vault.',
    dataMappings: [],
    syncHistory: []
  }
];

// ===================================================================
// 3. AUDIT LOGS CONSOLE (Tamper-Resistant Journal & Old/New Diffs)
// ===================================================================

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-2026-09412',
    timestamp: '16 Sep 2026 16:30:15',
    isoDate: '2026-09-16T16:30:15Z',
    user: { id: 'usr-admin', name: 'John Doe', username: 'admin', role: 'System Administrator', email: 'john.doe@infotattva.com' },
    module: 'Assets',
    submodule: 'Asset Details',
    actionType: 'Update',
    recordId: 'AST-000128',
    description: 'Asset AST-000128 location changed from Old Warehouse to Main Store by John Doe.',
    status: 'Success',
    ipAddress: '192.168.10.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
    company: 'Infotattva Business Solutions LLC',
    location: 'Dubai HQ - Block B',
    diff: [
      { field: 'location', label: 'Storage Location', oldValue: 'Old Warehouse > Floor 1 > Rack A', newValue: 'Main Store > Floor 2 > Bin 04', changed: true },
      { field: 'custodian', label: 'Primary Custodian', oldValue: 'Ahmed Khan (Facilities)', newValue: 'Sara Ali (IT Ops)', changed: true },
      { field: 'criticality', label: 'Asset Criticality', oldValue: 'MEDIUM', newValue: 'HIGH', changed: true },
      { field: 'lifecycleStatus', label: 'Lifecycle Status', oldValue: 'IN_STORE', newValue: 'IN_SERVICE', changed: true }
    ],
    relatedLogs: [
      { id: 'LOG-2026-09410', timestamp: '16 Sep 2026 16:15:00', action: 'Transfer Request Created #TR-491', user: 'Ahmed Khan' },
      { id: 'LOG-2026-09411', timestamp: '16 Sep 2026 16:22:30', action: 'Transfer Approved by Dept Head', user: 'Farhan Zaidi' },
      { id: 'LOG-2026-09412', timestamp: '16 Sep 2026 16:30:15', action: 'Physical Handover Confirmed & Master Updated', user: 'John Doe' }
    ]
  },
  {
    id: 'LOG-2026-09411',
    timestamp: '16 Sep 2026 15:45:22',
    isoDate: '2026-09-16T15:45:22Z',
    user: { id: 'usr-sec', name: 'Zainab Al-Husseini', username: 'zhusseini', role: 'Security Admin', email: 'zainab@infotattva.com' },
    module: 'Admin',
    submodule: 'User Roles & Permissions',
    actionType: 'Config Change',
    recordId: 'ROLE-009',
    description: 'Updated permissions for Compliance Auditor role; granted read-only access to Finance Reports.',
    status: 'Success',
    ipAddress: '10.20.1.15',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    company: 'Infotattva Business Solutions LLC',
    location: 'Dubai HQ',
    diff: [
      { field: 'permissions', label: 'Permission Matrix', oldValue: '["ASSETS_VIEW", "AUDIT_VIEW", "STOCKTAKES_VIEW"]', newValue: '["ASSETS_VIEW", "AUDIT_VIEW", "STOCKTAKES_VIEW", "FINANCE_REPORTS_VIEW"]', changed: true }
    ],
    relatedLogs: []
  },
  {
    id: 'LOG-2026-09410',
    timestamp: '16 Sep 2026 14:10:05',
    isoDate: '2026-09-16T14:10:05Z',
    user: { id: 'usr-maint', name: 'Rashid Al-Maktoum', username: 'rashid', role: 'Facilities Technician', email: 'rashid@infotattva.com' },
    module: 'Maintenance',
    submodule: 'Work Orders',
    actionType: 'Create',
    recordId: 'WO-2026-0089',
    description: 'Created emergency maintenance work order for Chiller Plant 2 compressor failure.',
    status: 'Success',
    ipAddress: '192.168.12.88',
    userAgent: 'Asset360 Mobile App v2.4 (Android 14)',
    company: 'Infotattva Business Solutions LLC',
    location: 'Dubai HQ - Central Utility',
    diff: [
      { field: 'workOrderId', label: 'WO Number', oldValue: '(None)', newValue: 'WO-2026-0089', changed: true },
      { field: 'priority', label: 'Priority', oldValue: '(None)', newValue: 'CRITICAL', changed: true },
      { field: 'assetId', label: 'Asset Reference', oldValue: '(None)', newValue: 'AST-000412 (Carrier Chiller 300TR)', changed: true }
    ],
    relatedLogs: []
  },
  {
    id: 'LOG-2026-09409',
    timestamp: '16 Sep 2026 12:20:40',
    isoDate: '2026-09-16T12:20:40Z',
    user: { id: 'usr-admin', name: 'John Doe', username: 'admin', role: 'System Administrator', email: 'john.doe@infotattva.com' },
    module: 'Audit',
    submodule: 'Physical Verification',
    actionType: 'Create',
    recordId: 'EXC-2026-005',
    description: 'Unregistered Cisco switch discovered during floor scan; provisional record EXC-2026-005 generated.',
    status: 'Warning',
    ipAddress: '10.20.40.104',
    userAgent: 'Zebra TC57 Scanner / Android 11',
    company: 'Infotattva Business Solutions LLC',
    location: 'Dubai HQ - Block C',
    diff: [
      { field: 'exceptionType', label: 'Exception Category', oldValue: '(None)', newValue: 'UNREGISTERED_DEVICE', changed: true },
      { field: 'tagScanned', label: 'Scanned Tag EPC', oldValue: '(None)', newValue: 'E28011606000002053A1B4C7', changed: true }
    ],
    relatedLogs: []
  },
  {
    id: 'LOG-2026-09408',
    timestamp: '16 Sep 2026 10:05:12',
    isoDate: '2026-09-16T10:05:12Z',
    user: { id: 'usr-rec', name: 'Layla Hassan', username: 'lhassan', role: 'Receiving Officer', email: 'layla@infotattva.com' },
    module: 'Receiving',
    submodule: 'PO Receiving',
    actionType: 'Approve',
    recordId: 'REC-2026-0142',
    description: 'Approved goods receipt note GRN-9412 against PO-8841 for 25 Dell Latitude 5440 laptops.',
    status: 'Success',
    ipAddress: '192.168.10.60',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    company: 'Infotattva Business Solutions LLC',
    location: 'Warehouse Receiving Dock 2',
    diff: [
      { field: 'receivingStatus', label: 'GRN Status', oldValue: 'INSPECTION_PENDING', newValue: 'ACCEPTED_AND_TAGGED', changed: true }
    ],
    relatedLogs: []
  }
];

// ===================================================================
// 4. EMAIL NOTIFICATIONS (Templates, Dynamic Placeholders, Rules, Logs)
// ===================================================================

const INITIAL_EMAIL_TEMPLATES = [
  {
    id: 'TMPL-001',
    name: 'Work Order Assigned',
    module: 'Maintenance',
    eventType: 'WORK_ORDER_ASSIGNED',
    subject: 'Action Required: Work Order #{{WO_No}} Assigned to You',
    description: 'Dispatched immediately to a maintenance engineer when a work order is assigned.',
    status: 'Active',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
  <div style="background-color: #6C2BD9; color: white; padding: 16px; border-radius: 6px 6px 0 0; text-align: center;">
    <h2 style="margin: 0;">Asset360 Maintenance Alert</h2>
  </div>
  <div style="padding: 20px 0;">
    <p>Dear <strong>{{Assigned_Technician}}</strong>,</p>
    <p>You have been assigned to work order <strong>#{{WO_No}}</strong> for asset <strong>{{Asset_Name}} ({{Asset_No}})</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748B;">Priority:</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #DC2626;">{{Priority}}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748B;">Location:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{Location}}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #64748B;">Due Date:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{Due_Date}}</td></tr>
    </table>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{Action_URL}}" style="background-color: #6C2BD9; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Work Order</a>
    </div>
  </div>
  <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 11px; color: #94A3B8; text-align: center;">
    This is an automated notification from Asset360 Enterprise Management System.
  </div>
</div>`,
    bodyPlain: `Asset360 Maintenance Alert: You have been assigned to work order #{{WO_No}} for asset {{Asset_Name}} ({{Asset_No}}). Priority: {{Priority}}. Location: {{Location}}. Due: {{Due_Date}}. Link: {{Action_URL}}`,
    availablePlaceholders: ['{{WO_No}}', '{{Asset_No}}', '{{Asset_Name}}', '{{Priority}}', '{{Due_Date}}', '{{Assigned_Technician}}', '{{Location}}', '{{Action_URL}}', '{{Company_Name}}']
  },
  {
    id: 'TMPL-002',
    name: 'Asset Transfer Approval Required',
    module: 'Movements',
    eventType: 'TRANSFER_APPROVAL_REQUESTED',
    subject: 'Approval Needed: Asset Transfer #{{Transfer_ID}} for {{Asset_Name}}',
    description: 'Triggered when an inter-department or inter-site asset transfer requires manager authorization.',
    status: 'Active',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
  <div style="background-color: #6C2BD9; color: white; padding: 16px; text-align: center;">
    <h2 style="margin: 0;">Asset Transfer Authorization Request</h2>
  </div>
  <p style="margin-top: 20px;">Dear Approver,</p>
  <p>A relocation transfer has been requested by <strong>{{Requester}}</strong> for asset <strong>{{Asset_No}}</strong> ({{Asset_Name}}).</p>
  <ul>
    <li>From Location: <strong>{{From_Location}}</strong></li>
    <li>To Location: <strong>{{To_Location}}</strong></li>
    <li>Reason: {{Reason}}</li>
  </ul>
  <p><a href="{{Approval_Link}}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Approve / Reject Transfer</a></p>
</div>`,
    bodyPlain: `Transfer request #{{Transfer_ID}} for asset {{Asset_No}} requires your approval. Move from {{From_Location}} to {{To_Location}}. Link: {{Approval_Link}}`,
    availablePlaceholders: ['{{Transfer_ID}}', '{{Asset_No}}', '{{Asset_Name}}', '{{From_Location}}', '{{To_Location}}', '{{Requester}}', '{{Reason}}', '{{Approval_Link}}']
  },
  {
    id: 'TMPL-003',
    name: 'Asset Warranty Expiry Alert',
    module: 'Assets',
    eventType: 'WARRANTY_EXPIRING_SOON',
    subject: 'Notice: OEM Warranty Expiring in {{Days_Remaining}} Days for {{Asset_Name}}',
    description: 'Dispatched 30 days and 7 days prior to hardware warranty expiration.',
    status: 'Active',
    bodyHtml: `<div style="font-family: Arial; padding: 20px; border: 1px solid #E2E8F0;">
  <h3>Warranty Expiration Advisory</h3>
  <p>Asset <strong>{{Asset_No}}</strong> OEM warranty expires on <strong>{{Expiry_Date}}</strong>.</p>
  <p>Supplier: {{Supplier}} | Contract: {{Contract_No}}</p>
</div>`,
    bodyPlain: `Asset {{Asset_No}} warranty expires on {{Expiry_Date}}. Please review extended support options.`,
    availablePlaceholders: ['{{Asset_No}}', '{{Asset_Name}}', '{{Expiry_Date}}', '{{Days_Remaining}}', '{{Supplier}}', '{{Contract_No}}']
  },
  {
    id: 'TMPL-004',
    name: 'Low Stock Reorder Alert',
    module: 'Inventory',
    eventType: 'INVENTORY_REORDER_THRESHOLD',
    subject: 'Inventory Alert: Stock Item {{Item_Code}} Below Minimum Threshold',
    description: 'Alerts storekeepers when spare parts or consumable bins fall below safety levels.',
    status: 'Active',
    bodyHtml: `<div style="font-family: Arial; padding: 20px; border: 1px solid #E2E8F0;">
  <h3 style="color: #D97706;">Low Inventory Warning</h3>
  <p>Item <strong>{{Item_Name}} ({{Item_Code}})</strong> in warehouse <strong>{{Warehouse_Name}}</strong> has dropped to <strong>{{Current_Qty}} {{UOM}}</strong> (Threshold: {{Min_Qty}} {{UOM}}).</p>
</div>`,
    bodyPlain: `Item {{Item_Code}} is below minimum stock. Current: {{Current_Qty}}. Threshold: {{Min_Qty}}.`,
    availablePlaceholders: ['{{Item_Code}}', '{{Item_Name}}', '{{Current_Qty}}', '{{Min_Qty}}', '{{UOM}}', '{{Warehouse_Name}}']
  }
];

const INITIAL_EMAIL_SETTINGS = {
  smtpHost: 'smtp.office365.com',
  smtpPort: 587,
  encryption: 'TLS',
  senderName: 'Asset360 Notifications',
  senderEmail: 'asset360-no-reply@infotattva.com',
  username: 'asset360-no-reply@infotattva.com',
  hasPasswordConfigured: true,
  dailyLimit: 5000,
  sentToday: 142
};

const INITIAL_DELIVERY_LOGS = [
  { id: 'MAIL-09124', timestamp: '16 Sep 2026 16:30:20', recipient: 'sara.ali@infotattva.com', subject: 'Action Required: Work Order #WO-2026-0089 Assigned', template: 'Work Order Assigned', status: 'Sent', latency: '420ms', retryCount: 0 },
  { id: 'MAIL-09123', timestamp: '16 Sep 2026 16:15:10', recipient: 'john.doe@infotattva.com', subject: 'Approval Needed: Asset Transfer #MOV-2026-0012', template: 'Asset Transfer Approval Required', status: 'Sent', latency: '380ms', retryCount: 0 },
  { id: 'MAIL-09122', timestamp: '16 Sep 2026 14:00:00', recipient: 'it-procurement@infotattva.com', subject: 'Notice: OEM Warranty Expiring in 30 Days', template: 'Asset Warranty Expiry Alert', status: 'Sent', latency: '510ms', retryCount: 0 },
  { id: 'MAIL-09121', timestamp: '16 Sep 2026 11:25:40', recipient: 'storekeeper@infotattva.com', subject: 'Inventory Alert: Stock Item RFID-TAG-GLOSSY Below Threshold', template: 'Low Stock Reorder Alert', status: 'Sent', latency: '400ms', retryCount: 0 },
  { id: 'MAIL-09120', timestamp: '16 Sep 2026 09:10:15', recipient: 'external-vendor@unknown-domain.com', subject: 'Purchase Order #PO-9412 Dispatched', template: 'Purchase Order Dispatch', status: 'Failed', error: '550 5.1.1 User unknown', retryCount: 3 }
];

// ===================================================================
// 5. BACKUP & SCHEDULER (Health KPIs, Manual Trigger, Job Scheduler)
// ===================================================================

const INITIAL_BACKUPS = [
  { id: 'BKP-2026-09-16-0200', name: 'Asset360_Full_20260916_020000.bak', type: 'Full', size: '3.42 GB', startTime: '16 Sep 2026 02:00:00', duration: '4m 12s', status: 'Success', checksum: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', location: 'Azure Blob Storage (Cool Tier) / UAE North' },
  { id: 'BKP-2026-09-15-0200', name: 'Asset360_Full_20260915_020000.bak', type: 'Full', size: '3.38 GB', startTime: '15 Sep 2026 02:00:00', duration: '4m 05s', status: 'Success', checksum: 'SHA256:4a8b79c321fc1a999afbf4c8996fb92427ae41e4649b934ca495991b7852c001', location: 'Azure Blob Storage (Cool Tier) / UAE North' },
  { id: 'BKP-2026-09-14-0200', name: 'Asset360_Full_20260914_020000.bak', type: 'Full', size: '3.35 GB', startTime: '14 Sep 2026 02:00:00', duration: '3m 58s', status: 'Success', checksum: 'SHA256:91c2b55298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a112', location: 'Azure Blob Storage (Cool Tier) / UAE North' },
  { id: 'BKP-2026-09-16-1200', name: 'Asset360_Diff_20260916_120000.bak', type: 'Incremental', size: '240 MB', startTime: '16 Sep 2026 12:00:00', duration: '34s', status: 'Success', checksum: 'SHA256:1120c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852d432', location: 'Local NAS Vault / Dubai HQ' }
];

const INITIAL_SCHEDULED_JOBS = [
  {
    id: 'JOB-001',
    name: 'Daily Database Full Backup',
    module: 'System Administration',
    frequency: 'Daily',
    cron: '0 2 * * *',
    scheduleTime: 'Every day at 02:00 AM',
    lastRun: '16 Sep 2026 02:00 AM',
    nextRun: '17 Sep 2026 02:00 AM',
    lastResult: 'Success (3.42 GB dumped to Azure Blob UAE North)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-BKP-104', timestamp: '16 Sep 2026 02:00 AM', duration: '4m 12s', trigger: 'Scheduled', status: 'Success', message: 'Full database snapshot created and encrypted.' }
    ]
  },
  {
    id: 'JOB-002',
    name: 'Hourly Differential Backup',
    module: 'System Administration',
    frequency: 'Hourly',
    cron: '0 * * * *',
    scheduleTime: 'Every hour on the hour',
    lastRun: '16 Sep 2026 16:00 PM',
    nextRun: '16 Sep 2026 17:00 PM',
    lastResult: 'Success (240 MB transaction log snapshot created)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-DIFF-892', timestamp: '16 Sep 2026 16:00 PM', duration: '34s', trigger: 'Scheduled', status: 'Success', message: 'Differential checkpoint written.' }
    ]
  },
  {
    id: 'JOB-003',
    name: 'Preventive Maintenance Ticket Auto-Generator',
    module: 'Maintenance',
    frequency: 'Daily',
    cron: '30 3 * * *',
    scheduleTime: 'Every day at 03:30 AM',
    lastRun: '16 Sep 2026 03:30 AM',
    nextRun: '17 Sep 2026 03:30 AM',
    lastResult: 'Success (4 work orders generated for due schedules)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-PM-301', timestamp: '16 Sep 2026 03:30 AM', duration: '18s', trigger: 'Scheduled', status: 'Success', message: '4 PM schedules reached due window and generated tickets.' }
    ]
  },
  {
    id: 'JOB-004',
    name: 'Hardware Warranty Expiry Scanner',
    module: 'Assets',
    frequency: 'Daily',
    cron: '0 5 * * *',
    scheduleTime: 'Every day at 05:00 AM',
    lastRun: '16 Sep 2026 05:00 AM',
    nextRun: '17 Sep 2026 05:00 AM',
    lastResult: 'Success (12 assets expiring in 30 days flagged and queued)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-WAR-219', timestamp: '16 Sep 2026 05:00 AM', duration: '12s', trigger: 'Scheduled', status: 'Success', message: 'Warranty scan complete.' }
    ]
  },
  {
    id: 'JOB-005',
    name: 'Contract / AMC Renewal Scanner',
    module: 'Contracts & Compliance',
    frequency: 'Daily',
    cron: '15 5 * * *',
    scheduleTime: 'Every day at 05:15 AM',
    lastRun: '16 Sep 2026 05:15 AM',
    nextRun: '17 Sep 2026 05:15 AM',
    lastResult: 'Success (2 vendor AMCs expiring in 45 days notified)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-AMC-144', timestamp: '16 Sep 2026 05:15 AM', duration: '9s', trigger: 'Scheduled', status: 'Success', message: 'AMC evaluation finished.' }
    ]
  },
  {
    id: 'JOB-006',
    name: 'Outbound Notification Queue Worker',
    module: 'Administration',
    frequency: 'Every 5 Minutes',
    cron: '*/5 * * * *',
    scheduleTime: 'Every 5 minutes',
    lastRun: '16 Sep 2026 16:55 PM',
    nextRun: '16 Sep 2026 17:00 PM',
    lastResult: 'Success (0 queued emails pending)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-NOTIF-9812', timestamp: '16 Sep 2026 16:55 PM', duration: '2s', trigger: 'Scheduled', status: 'Success', message: 'Queue empty.' }
    ]
  },
  {
    id: 'JOB-007',
    name: 'Daily Executive Digest Report Generator',
    module: 'Reports & Analytics',
    frequency: 'Daily',
    cron: '0 6 * * *',
    scheduleTime: 'Every day at 06:00 AM',
    lastRun: '16 Sep 2026 06:00 AM',
    nextRun: '17 Sep 2026 06:00 AM',
    lastResult: 'Success (Executive PDF dashboard compiled & delivered to C-suite)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-REP-712', timestamp: '16 Sep 2026 06:00 AM', duration: '1m 15s', trigger: 'Scheduled', status: 'Success', message: 'Executive digest compiled.' }
    ]
  },
  {
    id: 'JOB-008',
    name: 'Auto-Discovery Daily Subnet Sweep',
    module: 'Discovery & Tracking',
    frequency: 'Daily',
    cron: '0 1 * * *',
    scheduleTime: 'Every day at 01:00 AM',
    lastRun: '16 Sep 2026 01:00 AM',
    nextRun: '17 Sep 2026 01:00 AM',
    lastResult: 'Success (10.20.0.0/16 scanned, 3 new devices discovered)',
    status: 'Active',
    executionHistory: [
      { runId: 'RUN-DISC-409', timestamp: '16 Sep 2026 01:00 AM', duration: '14m 22s', trigger: 'Scheduled', status: 'Success', message: 'Subnet scan completed.' }
    ]
  }
];

class AdminGovernanceService {
  constructor() {
    this.groups = [...INITIAL_ASSET_GROUPS];
    this.classes = [...INITIAL_ASSET_CLASSES];
    this.categories = [...INITIAL_CATEGORIES];
    this.subcategories = [...INITIAL_SUBCATEGORIES];
    this.suppliers = [...INITIAL_SUPPLIERS];
    this.manufacturers = [...INITIAL_MANUFACTURERS];
    this.uom = [...INITIAL_UOM];
    this.integrations = [...INITIAL_INTEGRATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.templates = [...INITIAL_EMAIL_TEMPLATES];
    this.emailSettings = { ...INITIAL_EMAIL_SETTINGS };
    this.deliveryLogs = [...INITIAL_DELIVERY_LOGS];
    this.backups = [...INITIAL_BACKUPS];
    this.jobs = [...INITIAL_SCHEDULED_JOBS];
  }

  // -------------------------------------------------------------
  // Master Data Methods
  // -------------------------------------------------------------
  async getHierarchy() {
    return {
      groups: this.groups,
      classes: this.classes,
      categories: this.categories,
      subcategories: this.subcategories,
      totals: {
        groupsCount: this.groups.length,
        classesCount: this.classes.length,
        categoriesCount: this.categories.length,
        subcategoriesCount: this.subcategories.length,
        totalAssets: this.groups.reduce((acc, g) => acc + (g.totalAssets || 0), 0)
      }
    };
  }

  async createGroup(data) {
    const newGroup = {
      id: `GRP-${String(this.groups.length + 1).padStart(3, '0')}`,
      code: data.code.toUpperCase(),
      name: data.name,
      description: data.description || '',
      assetType: data.assetType || 'Physical',
      status: data.status || 'Active',
      totalAssets: 0,
      classesCount: 0,
      categoriesCount: 0,
      createdAt: new Date().toISOString()
    };
    this.groups.push(newGroup);
    return newGroup;
  }

  async updateGroup(id, data) {
    const idx = this.groups.findIndex(g => g.id === id || g.code === id);
    if (idx === -1) return null;
    this.groups[idx] = { ...this.groups[idx], ...data };
    return this.groups[idx];
  }

  async deleteGroup(id) {
    const group = this.groups.find(g => g.id === id || g.code === id);
    if (!group) return { success: false, message: 'Group not found' };
    const referencedClasses = this.classes.filter(c => c.groupId === id || c.groupCode === group.code);
    if (referencedClasses.length > 0 || group.totalAssets > 0) {
      return {
        success: false,
        blocked: true,
        message: `Deletion prohibited: Asset Group ${group.name} has ${referencedClasses.length} active classes and ${group.totalAssets} referenced assets. Please deactivate instead.`
      };
    }
    this.groups = this.groups.filter(g => g.id !== id);
    return { success: true, message: 'Group deleted successfully.' };
  }

  async getSuppliers() { return this.suppliers; }
  async getManufacturers() { return this.manufacturers; }
  async getUOM() { return this.uom; }

  // -------------------------------------------------------------
  // Integrations Console Methods
  // -------------------------------------------------------------
  async getIntegrations(category = 'All') {
    let list = [...this.integrations];
    if (category && category !== 'All' && category !== 'All Integrations') {
      list = list.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    const totalConfigured = this.integrations.length;
    const activeCount = this.integrations.filter(i => i.status === 'Active').length;
    const errorCount = this.integrations.filter(i => i.status === 'Warning' || i.lastSyncStatus === 'Failed').length;

    return {
      integrations: list,
      kpis: {
        totalConfigured,
        activeInterfaces: activeCount,
        lastSuccessfulSync: 'Today at 04:45 PM',
        syncErrorsToday: errorCount
      }
    };
  }

  async testIntegrationConnection(id) {
    const intItem = this.integrations.find(i => i.id === id);
    if (!intItem) return { success: false, message: 'Integration not found' };
    return {
      success: true,
      id,
      name: intItem.name,
      latency: `${Math.floor(Math.random() * 40) + 18}ms`,
      httpStatus: 200,
      certificateValid: true,
      handshake: 'TLS_1_3_ECDHE_RSA_AES_256_GCM_SHA384',
      message: `Connection test to ${intItem.systemType} succeeded. Endpoint responded with valid handshake.`
    };
  }

  async triggerIntegrationSync(id) {
    const intItem = this.integrations.find(i => i.id === id);
    if (!intItem) return { success: false, message: 'Integration not found' };
    intItem.lastSync = 'Just now';
    intItem.lastSyncStatus = 'Success';
    intItem.recordsProcessedToday += 12;
    intItem.syncHistory.unshift({
      runId: `RUN-${intItem.id.replace('INT-', '')}-${Date.now().toString().slice(-3)}`,
      timestamp: 'Just now',
      duration: '14s',
      trigger: 'Manual',
      recordsIn: 12,
      recordsOut: 4,
      errors: 0,
      status: 'Success'
    });
    return { success: true, integration: intItem };
  }

  async toggleIntegrationStatus(id) {
    const intItem = this.integrations.find(i => i.id === id);
    if (!intItem) return { success: false, message: 'Integration not found' };
    intItem.status = intItem.status === 'Active' ? 'Inactive' : 'Active';
    return { success: true, integration: intItem };
  }

  // -------------------------------------------------------------
  // Audit Logs Console Methods
  // -------------------------------------------------------------
  async getAuditLogs({ search = '', module = 'All', actionType = 'All', status = 'All' } = {}) {
    let filtered = [...this.auditLogs];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(l =>
        l.id.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.recordId.toLowerCase().includes(q) ||
        l.user.name.toLowerCase().includes(q)
      );
    }
    if (module !== 'All' && module !== 'All Modules') {
      filtered = filtered.filter(l => l.module.toLowerCase() === module.toLowerCase());
    }
    if (actionType !== 'All' && actionType !== 'All Actions') {
      filtered = filtered.filter(l => l.actionType.toLowerCase() === actionType.toLowerCase());
    }
    if (status !== 'All') {
      filtered = filtered.filter(l => l.status.toLowerCase() === status.toLowerCase());
    }
    return { logs: filtered, total: filtered.length };
  }

  async getAuditLogById(id) {
    return this.auditLogs.find(l => l.id === id) || null;
  }

  // -------------------------------------------------------------
  // Email Notifications Methods
  // -------------------------------------------------------------
  async getTemplates() { return this.templates; }
  async getSettings() { return this.emailSettings; }
  async getDeliveryLogs() { return this.deliveryLogs; }

  async updateTemplate(id, data) {
    const idx = this.templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.templates[idx] = { ...this.templates[idx], ...data };
    return this.templates[idx];
  }

  async sendTestEmail({ templateId, recipientEmail }) {
    const template = this.templates.find(t => t.id === templateId) || this.templates[0];
    const logEntry = {
      id: `MAIL-${Date.now().toString().slice(-5)}`,
      timestamp: 'Just now',
      recipient: recipientEmail || 'admin@infotattva.com',
      subject: `[TEST] ${template.subject}`,
      template: template.name,
      status: 'Sent',
      latency: '340ms',
      retryCount: 0
    };
    this.deliveryLogs.unshift(logEntry);
    this.emailSettings.sentToday += 1;
    return { success: true, message: `Test email dispatched to ${recipientEmail}`, log: logEntry };
  }

  // -------------------------------------------------------------
  // Backup & Scheduler Methods
  // -------------------------------------------------------------
  async getBackupsOverview() {
    return {
      backups: this.backups,
      kpis: {
        lastBackup: this.backups[0]?.startTime || '16 Sep 2026 02:00:00',
        totalBackups30Days: 28,
        successRate: 96.4,
        storageUsedGb: 42.5,
        storageCapacityGb: 500.0,
        nextScheduledBackup: 'Tonight at 02:00 AM'
      }
    };
  }

  async createBackup({ type = 'Full', notes = '' } = {}) {
    const newBackup = {
      id: `BKP-MANUAL-${Date.now().toString().slice(-6)}`,
      name: `Asset360_${type}_Manual_${Date.now().toString().slice(-6)}.bak`,
      type,
      size: type === 'Full' ? '3.45 GB' : '180 MB',
      startTime: 'Just now',
      duration: '45s',
      status: 'Success',
      checksum: 'SHA256:77bc944298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852e998',
      location: 'Local Storage / Vault Partition'
    };
    this.backups.unshift(newBackup);
    return { success: true, backup: newBackup };
  }

  async getJobs() { return this.jobs; }

  async toggleJobStatus(id) {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return { success: false, message: 'Job not found' };
    job.status = job.status === 'Active' ? 'Paused' : 'Active';
    return { success: true, job };
  }

  async runJobNow(id) {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return { success: false, message: 'Job not found' };
    job.lastRun = 'Just now';
    job.lastResult = 'Success (Executed on-demand by Administrator)';
    job.executionHistory.unshift({
      runId: `RUN-${job.id}-${Date.now().toString().slice(-3)}`,
      timestamp: 'Just now',
      duration: '12s',
      trigger: 'Manual On-Demand',
      status: 'Success',
      message: 'Background job completed successfully.'
    });
    return { success: true, job };
  }
}

export const adminGovernanceService = new AdminGovernanceService();
export default adminGovernanceService;
