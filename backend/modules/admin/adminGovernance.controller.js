// Admin Governance, Masters, Integrations, Audit, Notifications, and Backup Controller
// Implements paragraphs 517-539 and 571-827 of Asset360 Wireframe

// ==========================================
// 1. MASTER DATA (4-TIER HIERARCHY & SUPPLIERS)
// ==========================================

export let memoryAssetGroups = [
  { id: 'GRP-001', code: 'IT', name: 'Information Technology', description: 'Computing, networking, telephony and IT peripherals', assetType: 'Both', totalAssets: 1420, status: 'Active', createdBy: 'System', createdOn: '10 Jan 2025' },
  { id: 'GRP-002', code: 'FAC', name: 'Buildings & Facilities', description: 'Premises, structural assets, HVAC and plant equipment', assetType: 'Physical', totalAssets: 340, status: 'Active', createdBy: 'System', createdOn: '10 Jan 2025' },
  { id: 'GRP-003', code: 'PLM', name: 'Plant & Machinery', description: 'Manufacturing, warehouse forklifts and heavy processing units', assetType: 'Physical', totalAssets: 185, status: 'Active', createdBy: 'John Doe', createdOn: '12 Jan 2025' },
  { id: 'GRP-004', code: 'VEH', name: 'Vehicles & Fleet', description: 'Commercial delivery vans, trucks and executive corporate cars', assetType: 'Physical', totalAssets: 64, status: 'Active', createdBy: 'John Doe', createdOn: '15 Jan 2025' },
  { id: 'GRP-005', code: 'FUR', name: 'Furniture & Fixtures', description: 'Desks, ergonomic chairs, executive suites and meeting fixtures', assetType: 'Physical', totalAssets: 890, status: 'Active', createdBy: 'Sarah Ahmed', createdOn: '18 Jan 2025' },
  { id: 'GRP-006', code: 'MED', name: 'Medical Equipment', description: 'Clinical analyzers, biometric sensors and diagnostic gear', assetType: 'Physical', totalAssets: 42, status: 'Active', createdBy: 'System', createdOn: '20 Jan 2025' },
  { id: 'GRP-007', code: 'TOOL', name: 'Specialized Tools & Gauges', description: 'Calibration meters, workshop hand tools and maintenance kits', assetType: 'Physical', totalAssets: 110, status: 'Active', createdBy: 'Ramesh Kumar', createdOn: '22 Jan 2025' },
  { id: 'GRP-008', code: 'SFTW', name: 'Software & Digital Licenses', description: 'Enterprise ERP subscriptions, OS licenses and design software', assetType: 'Intangible', totalAssets: 520, status: 'Active', createdBy: 'Ramesh Kumar', createdOn: '25 Jan 2025' }
];

export let memoryAssetClasses = [
  { id: 'CLS-001', groupId: 'GRP-001', groupCode: 'IT', code: 'COMP', name: 'Computing Hardware', description: 'Laptops, desktops, workstations and server towers', totalAssets: 850, status: 'Active' },
  { id: 'CLS-002', groupId: 'GRP-001', groupCode: 'IT', code: 'NET', name: 'Network Infrastructure', description: 'Switches, routers, firewalls, patch panels and racks', totalAssets: 320, status: 'Active' },
  { id: 'CLS-003', groupId: 'GRP-001', groupCode: 'IT', code: 'PERIPH', name: 'Peripherals & Displays', description: 'Monitors, docking stations, printers and scanners', totalAssets: 250, status: 'Active' },
  { id: 'CLS-004', groupId: 'GRP-002', groupCode: 'FAC', code: 'HVAC', name: 'HVAC & Cooling Systems', description: 'Chillers, air handling units and split units', totalAssets: 120, status: 'Active' },
  { id: 'CLS-005', groupId: 'GRP-004', groupCode: 'VEH', code: 'COMM-VEH', name: 'Commercial Logistics Fleet', description: 'Refrigerated trucks and logistics delivery vans', totalAssets: 48, status: 'Active' }
];

export let memorySuppliers = [
  { id: 'SUP-001', code: 'SUP-DELL', name: 'Dell Technologies Middle East', contact: 'Ahmed Mansoor', email: 'sales.me@dell.com', phone: '+971 4 391 9000', country: 'UAE', rating: '5 Star', status: 'Active' },
  { id: 'SUP-002', code: 'SUP-CISCO', name: 'Cisco Systems Gulf', contact: 'Kareem Fahmy', email: 'orders@cisco.ae', phone: '+971 4 438 1000', country: 'UAE', rating: '5 Star', status: 'Active' },
  { id: 'SUP-003', code: 'SUP-CARRIER', name: 'Carrier Middle East Air Conditioning', contact: 'George Khalil', email: 'service@carrier.ae', phone: '+971 4 282 3000', country: 'UAE', rating: '4 Star', status: 'Active' },
  { id: 'SUP-004', code: 'SUP-ZEBRA', name: 'Zebra Enterprise Solutions', contact: 'Fatima Al Rais', email: 'middleeast@zebra.com', phone: '+971 4 365 2000', country: 'UAE', rating: '5 Star', status: 'Active' }
];

export let memoryUOM = [
  { id: 'UOM-001', code: 'EA', name: 'Each / Unit', isBase: true, precision: 0, status: 'Active' },
  { id: 'UOM-002', code: 'BOX', name: 'Box / Pack', isBase: false, precision: 0, status: 'Active' },
  { id: 'UOM-003', code: 'MTR', name: 'Meter', isBase: true, precision: 2, status: 'Active' },
  { id: 'UOM-004', code: 'SET', name: 'Assembly Set', isBase: true, precision: 0, status: 'Active' },
  { id: 'UOM-005', code: 'LTR', name: 'Liter (Fluids)', isBase: true, precision: 2, status: 'Active' }
];

export let memoryAssetCategories = [
  { id: 'CAT-001', classId: 'CLS-001', code: 'LAPTOP', name: 'Laptops & Ultrabooks', totalAssets: 480, status: 'Active' },
  { id: 'CAT-002', classId: 'CLS-001', code: 'DESK', name: 'Desktop Workstations', totalAssets: 370, status: 'Active' },
  { id: 'CAT-003', classId: 'CLS-002', code: 'SWT', name: 'Managed Core Switches', totalAssets: 180, status: 'Active' },
  { id: 'CAT-004', classId: 'CLS-003', code: 'MON', name: '4K Display Monitors', totalAssets: 250, status: 'Active' },
  { id: 'CAT-005', classId: 'CLS-004', code: 'CHILL', name: 'Industrial Water Chillers', totalAssets: 120, status: 'Active' },
  { id: 'CAT-006', classId: 'CLS-005', code: 'TRK', name: 'Delivery Trucks', totalAssets: 48, status: 'Active' }
];

export let memoryAssetSubcategories = [
  { id: 'SUB-001', categoryId: 'CAT-001', code: 'EXEC-LAP', name: 'Executive Ultrabooks', totalAssets: 120, status: 'Active' },
  { id: 'SUB-002', categoryId: 'CAT-001', code: 'DEV-LAP', name: 'Engineering Workstation Laptops', totalAssets: 360, status: 'Active' },
  { id: 'SUB-003', categoryId: 'CAT-002', code: 'TWR-DSK', name: 'Tower Workstations', totalAssets: 370, status: 'Active' },
  { id: 'SUB-004', categoryId: 'CAT-003', code: 'L3-SWT', name: 'Layer 3 Enterprise Switches', totalAssets: 180, status: 'Active' }
];

export let memoryManufacturers = [
  { id: 'MFG-001', code: 'DELL', name: 'Dell Inc.', country: 'United States', status: 'Active', website: 'https://www.dell.com' },
  { id: 'MFG-002', code: 'HP', name: 'HP Enterprise', country: 'United States', status: 'Active', website: 'https://www.hpe.com' },
  { id: 'MFG-003', code: 'CISCO', name: 'Cisco Systems', country: 'United States', status: 'Active', website: 'https://www.cisco.com' },
  { id: 'MFG-004', code: 'CARRIER', name: 'Carrier Global', country: 'United States', status: 'Active', website: 'https://www.carrier.com' },
  { id: 'MFG-005', code: 'ZEBRA', name: 'Zebra Technologies', country: 'United States', status: 'Active', website: 'https://www.zebra.com' },
  { id: 'MFG-006', code: 'APPLE', name: 'Apple Inc.', country: 'United States', status: 'Active', website: 'https://www.apple.com' }
];

export let memoryEmailSettings = {
  smtpHost: 'smtp.office365.com',
  smtpPort: 587,
  encryption: 'TLS',
  senderName: 'Asset360 Notifications',
  senderEmail: 'asset360-no-reply@infotattva.com',
  dailyLimit: 5000,
  sentToday: 142
};

// ==========================================
// 2. INTEGRATIONS REPOSITORY (PARAGRAPHS 596-650)
// ==========================================

export let memoryIntegrations = [
  {
    id: 'INT-001',
    name: 'SAP S/4HANA Integration',
    externalSystem: 'SAP S/4HANA',
    systemType: 'ERP',
    category: 'ERP Systems',
    direction: 'Bi-directional',
    frequency: 'Real-time',
    lastSync: '10 Sep 2026 10:15',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 1240,
    errorCount: 0,
    endpointUrl: 'https://sap-gateway.asset360.internal/odata/v4/AssetAccounting',
    protocol: 'OData v4',
    timeout: 30,
    retryPolicy: '3 retries with exponential backoff',
    authType: 'OAuth 2.0 Client Credentials',
    clientId: 'asset360_sap_prod',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Real-time bidirectional synchronization of capital asset masters, cost centers, asset capitalization, and depreciation ledger entries.',
    mappings: [
      { sourceField: 'ANLN1', targetField: 'assetNumber', transformation: 'Direct Mapping', required: true, sampleValue: '10004820' },
      { sourceField: 'TXT50', targetField: 'assetName', transformation: 'Direct Mapping', required: true, sampleValue: 'Chiller Unit Plant B' },
      { sourceField: 'KOSTL', targetField: 'costCenter', transformation: 'Uppercase', required: true, sampleValue: 'CC-OPS-01' },
      { sourceField: 'AKTIV', targetField: 'capitalizationDate', transformation: 'Format Date (YYYY-MM-DD)', required: false, sampleValue: '2024-03-15' },
      { sourceField: 'KANSW', targetField: 'purchaseCost', transformation: 'Number (2 decimals)', required: false, sampleValue: '45000.00' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-01', startTime: '10 Sep 2026 10:14:50', endTime: '10 Sep 2026 10:15:02', direction: 'Bi-directional', received: 124, processed: 124, success: 124, failed: 0, status: 'Success', triggeredBy: 'Real-time Webhook' },
      { executionId: 'EXEC-2026-0910-00', startTime: '10 Sep 2026 09:15:00', endTime: '10 Sep 2026 09:15:15', direction: 'Bi-directional', received: 98, processed: 98, success: 98, failed: 0, status: 'Success', triggeredBy: 'Scheduled Daemon' }
    ]
  },
  {
    id: 'INT-002',
    name: 'Oracle Fusion Integration',
    externalSystem: 'Oracle Fusion',
    systemType: 'ERP',
    category: 'ERP Systems',
    direction: 'Bi-directional',
    frequency: 'Hourly',
    lastSync: '10 Sep 2026 09:30',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 680,
    errorCount: 0,
    endpointUrl: 'https://fa-internal.oraclecloud.com/fscmRestApi/resources/11.13.18.05/fixedAssets',
    protocol: 'REST API (HTTPS)',
    timeout: 45,
    retryPolicy: '3 retries',
    authType: 'OAuth 2.0 Client Credentials',
    clientId: 'oracle_fusion_asset_client',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Hourly synchronization of fixed asset registries, purchase orders, and supplier invoice capitalization references.',
    mappings: [
      { sourceField: 'AssetNumber', targetField: 'assetNumber', transformation: 'Direct Mapping', required: true, sampleValue: 'AST-ORA-091' },
      { sourceField: 'Description', targetField: 'assetName', transformation: 'Direct Mapping', required: true, sampleValue: 'Air Handling Unit 2A' },
      { sourceField: 'CostCenter', targetField: 'costCenter', transformation: 'Direct Mapping', required: true, sampleValue: 'CC-HVAC' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-02', startTime: '10 Sep 2026 09:30:00', endTime: '10 Sep 2026 09:30:22', direction: 'Bi-directional', received: 45, processed: 45, success: 45, failed: 0, status: 'Success', triggeredBy: 'Scheduled (Hourly)' }
    ]
  },
  {
    id: 'INT-003',
    name: 'IFS Cloud Integration',
    externalSystem: 'IFS Cloud',
    systemType: 'ERP',
    category: 'ERP Systems',
    direction: 'Bi-directional',
    frequency: 'Hourly',
    lastSync: '09 Sep 2026 18:45',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 430,
    errorCount: 0,
    endpointUrl: 'https://ifs-app.asset360.internal/main/ifsapplications/projection/v1/EquipmentObjectsHandling.svc',
    protocol: 'OData v4',
    timeout: 30,
    retryPolicy: '3 retries',
    authType: 'OAuth 2.0 Bearer Token',
    clientId: 'ifs_asset360_connector',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'Dubai HQ',
    description: 'Equipment object synchronization, maintenance service contracts, and plant hierarchy exchange.',
    mappings: [
      { sourceField: 'MchCode', targetField: 'assetNumber', transformation: 'Prefix (IFS-)', required: true, sampleValue: 'PUMP-001' },
      { sourceField: 'MchName', targetField: 'assetName', transformation: 'Direct Mapping', required: true, sampleValue: 'Water Circulation Pump' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0909-08', startTime: '09 Sep 2026 18:45:00', endTime: '09 Sep 2026 18:45:18', direction: 'Bi-directional', received: 28, processed: 28, success: 28, failed: 0, status: 'Success', triggeredBy: 'Scheduled' }
    ]
  },
  {
    id: 'INT-004',
    name: 'Azure AD Authentication',
    externalSystem: 'Microsoft Azure AD',
    systemType: 'Identity',
    category: 'Identity & Security',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: '10 Sep 2026 11:00',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 120,
    errorCount: 0,
    endpointUrl: 'https://graph.microsoft.com/v1.0/users',
    protocol: 'Microsoft Graph REST',
    timeout: 15,
    retryPolicy: '5 retries',
    authType: 'Microsoft Graph Client Secret',
    clientId: 'azure_ad_asset360_sso',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Enterprise SSO, SCIM automated user provisioning, role group synchronization, and security token issuance.',
    mappings: [
      { sourceField: 'userPrincipalName', targetField: 'email', transformation: 'Lowercase', required: true, sampleValue: 'john.doe@asset360.com' },
      { sourceField: 'displayName', targetField: 'fullName', transformation: 'Direct Mapping', required: true, sampleValue: 'John Doe' },
      { sourceField: 'department', targetField: 'department', transformation: 'Direct Mapping', required: false, sampleValue: 'Information Technology' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-03', startTime: '10 Sep 2026 11:00:00', endTime: '10 Sep 2026 11:00:05', direction: 'Inbound', received: 12, processed: 12, success: 12, failed: 0, status: 'Success', triggeredBy: 'SCIM Webhook' }
    ]
  },
  {
    id: 'INT-005',
    name: 'ServiceNow Integration',
    externalSystem: 'ServiceNow',
    systemType: 'ITSM',
    category: 'IT Service Management',
    direction: 'Outbound',
    frequency: 'Hourly',
    lastSync: '10 Sep 2026 08:20',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 890,
    errorCount: 0,
    endpointUrl: 'https://asset360.service-now.com/api/now/table/cmdb_ci_hardware',
    protocol: 'REST API (HTTPS)',
    timeout: 30,
    retryPolicy: '3 retries',
    authType: 'API Key & Mutual TLS',
    clientId: 'sn_it_asset_bridge',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Publishes hardware asset records, serial numbers, and life-cycle state changes to ServiceNow CMDB.',
    mappings: [
      { sourceField: 'assetNumber', targetField: 'asset_tag', transformation: 'Direct Mapping', required: true, sampleValue: 'AST-000104' },
      { sourceField: 'serialNumber', targetField: 'serial_number', transformation: 'Direct Mapping', required: true, sampleValue: 'SN-DELL-8991' },
      { sourceField: 'status', targetField: 'install_status', transformation: 'Status Translation', required: true, sampleValue: 'In Use' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-04', startTime: '10 Sep 2026 08:20:00', endTime: '10 Sep 2026 08:20:30', direction: 'Outbound', received: 60, processed: 60, success: 60, failed: 0, status: 'Success', triggeredBy: 'Scheduled (Hourly)' }
    ]
  },
  {
    id: 'INT-006',
    name: 'Zebra RFID Devices',
    externalSystem: 'Zebra Technologies',
    systemType: 'IoT',
    category: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: '10 Sep 2026 10:50',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 14890,
    errorCount: 0,
    endpointUrl: 'mqtt://rfid-broker.asset360.internal:1883/rfid/gateways/#',
    protocol: 'MQTT Protocol',
    timeout: 10,
    retryPolicy: 'Persistent MQTT Session',
    authType: 'TLS Certificate & Token',
    clientId: 'zebra_fx9600_broker',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'Dubai HQ',
    description: 'High-speed fixed portal RFID tag antenna reads for automated warehouse entrance/exit gate verification.',
    mappings: [
      { sourceField: 'epcHex', targetField: 'rfidTagId', transformation: 'Hex to EPC', required: true, sampleValue: 'E280116060000204' },
      { sourceField: 'antennaPort', targetField: 'dockDoor', transformation: 'Port Mapping', required: true, sampleValue: 'Port-1' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-05', startTime: '10 Sep 2026 10:50:00', endTime: '10 Sep 2026 10:50:02', direction: 'Inbound', received: 420, processed: 420, success: 420, failed: 0, status: 'Success', triggeredBy: 'Event Stream' }
    ]
  },
  {
    id: 'INT-007',
    name: 'Teltonika GPS Tracking',
    externalSystem: 'Teltonika',
    systemType: 'IoT',
    category: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Every 15 mins',
    lastSync: '10 Sep 2026 10:45',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 3200,
    errorCount: 0,
    endpointUrl: 'https://telematics.asset360.internal/api/v2/fleet/telemetry',
    protocol: 'REST API (HTTPS)',
    timeout: 20,
    retryPolicy: '3 retries',
    authType: 'API Key & Mutual TLS',
    clientId: 'teltonika_fleet_gw',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Automated GPS telematics feed from vehicle trackers for live fleet positioning, odometer reads, and geofence alerts.',
    mappings: [
      { sourceField: 'imei', targetField: 'trackerImei', transformation: 'Direct Mapping', required: true, sampleValue: '862044039182341' },
      { sourceField: 'latitude', targetField: 'gpsLatitude', transformation: 'Float (6 decimals)', required: true, sampleValue: '25.204849' },
      { sourceField: 'longitude', targetField: 'gpsLongitude', transformation: 'Float (6 decimals)', required: true, sampleValue: '55.270783' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-06', startTime: '10 Sep 2026 10:45:00', endTime: '10 Sep 2026 10:45:08', direction: 'Inbound', received: 85, processed: 85, success: 85, failed: 0, status: 'Success', triggeredBy: 'Scheduled (15 mins)' }
    ]
  },
  {
    id: 'INT-008',
    name: 'HR Employee Sync',
    externalSystem: 'Workday',
    systemType: 'HR',
    category: 'HR Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: '09 Sep 2026 23:10',
    status: 'Success',
    lastResult: 'Success',
    recordsProcessed: 1250,
    errorCount: 0,
    endpointUrl: 'https://wd5-impl-services1.workday.com/ccx/service/customreport2/asset360_workers',
    protocol: 'REST API (JSON)',
    timeout: 60,
    retryPolicy: '3 retries',
    authType: 'OAuth 2.0 Bearer Token',
    clientId: 'workday_hcm_connector',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Synchronizes employee master data, designations, business units, and department heads for asset custody accountability.',
    mappings: [
      { sourceField: 'Worker_ID', targetField: 'employeeNumber', transformation: 'Direct Mapping', required: true, sampleValue: 'EMP-00108' },
      { sourceField: 'Legal_Name', targetField: 'fullName', transformation: 'Direct Mapping', required: true, sampleValue: 'Fatima Al-Mansoori' },
      { sourceField: 'Cost_Center', targetField: 'costCenter', transformation: 'Direct Mapping', required: true, sampleValue: 'CC-FIN-01' },
      { sourceField: 'Status', targetField: 'employmentStatus', transformation: 'Status Translation', required: true, sampleValue: 'Active' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0909-09', startTime: '09 Sep 2026 23:10:00', endTime: '09 Sep 2026 23:11:42', direction: 'Inbound', received: 1250, processed: 1250, success: 1250, failed: 0, status: 'Success', triggeredBy: 'Scheduled Nightly' }
    ]
  },
  {
    id: 'INT-009',
    name: 'Email Server (SMTP)',
    externalSystem: 'Microsoft 365',
    systemType: 'Communication',
    category: 'Other Systems',
    direction: 'Outbound',
    frequency: 'Real-time',
    lastSync: '10 Sep 2026 11:05',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 520,
    errorCount: 0,
    endpointUrl: 'smtp.office365.com:587',
    protocol: 'SMTP / TLS',
    timeout: 15,
    retryPolicy: '3 retries with queue backoff',
    authType: 'OAuth 2.0 Modern Auth',
    clientId: 'm365_mail_daemon',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Outbound transactional mail gateway for notification alerts, work order dispatches, and warranty warnings.',
    mappings: [
      { sourceField: 'recipientEmail', targetField: 'to', transformation: 'Direct Mapping', required: true, sampleValue: 'tech@asset360.com' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-07', startTime: '10 Sep 2026 11:05:00', endTime: '10 Sep 2026 11:05:01', direction: 'Outbound', received: 1, processed: 1, success: 1, failed: 0, status: 'Success', triggeredBy: 'Alert Trigger' }
    ]
  },
  {
    id: 'INT-010',
    name: 'Barcode Label Printing',
    externalSystem: 'NiceLabel',
    systemType: 'Other',
    category: 'Other Systems',
    direction: 'Outbound',
    frequency: 'On Demand',
    lastSync: '10 Sep 2026 09:40',
    status: 'Inactive',
    lastResult: 'Idle',
    recordsProcessed: 0,
    errorCount: 0,
    endpointUrl: 'https://nicelabel-server.asset360.internal/api/v1/print/jobs',
    protocol: 'REST API (HTTPS)',
    timeout: 30,
    retryPolicy: '1 retry',
    authType: 'API Key (Masked)',
    clientId: 'nicelabel_print_agent',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'Dubai HQ',
    description: 'Dispatches automated print commands for QR codes, 1D code 128 barcodes, and RFID inlay encoding to industrial thermal printers.',
    mappings: [
      { sourceField: 'assetNumber', targetField: 'BARCODE_DATA', transformation: 'Direct Mapping', required: true, sampleValue: 'AST-000104' },
      { sourceField: 'assetName', targetField: 'ASSET_LABEL', transformation: 'Substring (35)', required: true, sampleValue: 'Chiller Unit' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-08', startTime: '10 Sep 2026 09:40:00', endTime: '10 Sep 2026 09:40:05', direction: 'Outbound', received: 15, processed: 15, success: 15, failed: 0, status: 'Success', triggeredBy: 'Manual Batch Print' }
    ]
  },
  {
    id: 'INT-011',
    name: 'Jira Asset Maintenance',
    externalSystem: 'Atlassian Jira',
    systemType: 'ITSM',
    category: 'IT Service Management',
    direction: 'Bi-directional',
    frequency: 'Real-time',
    lastSync: '10 Sep 2026 07:15',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 215,
    errorCount: 0,
    endpointUrl: 'https://asset360.atlassian.net/rest/api/3/issue',
    protocol: 'REST API (HTTPS)',
    timeout: 30,
    retryPolicy: '3 retries',
    authType: 'API Token & Basic Auth',
    clientId: 'jira_asset_bridge',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'All Companies',
    description: 'Syncs maintenance work orders with Jira Service Management tickets and field technician comments.',
    mappings: [
      { sourceField: 'workOrderNumber', targetField: 'customfield_10010', transformation: 'Direct Mapping', required: true, sampleValue: 'WO-2026-00482' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0910-09', startTime: '10 Sep 2026 07:15:00', endTime: '10 Sep 2026 07:15:04', direction: 'Bi-directional', received: 8, processed: 8, success: 8, failed: 0, status: 'Success', triggeredBy: 'Webhook' }
    ]
  },
  {
    id: 'INT-012',
    name: 'Infor EAM Connector',
    externalSystem: 'Infor',
    systemType: 'ERP',
    category: 'ERP Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: '08 Sep 2026 20:00',
    status: 'Warning',
    lastResult: 'Warning',
    recordsProcessed: 89,
    errorCount: 2,
    endpointUrl: 'https://infor-eam.asset360.internal/web/services/AssetService',
    protocol: 'SOAP Web Service',
    timeout: 60,
    retryPolicy: '3 retries',
    authType: 'Basic Auth (Masked)',
    clientId: 'infor_eam_service',
    maskedSecret: '••••••••••••••••••••••••••••••••',
    company: 'Asset360 Holdings',
    description: 'Periodic import of plant asset structural hierarchy and technical equipment specifications from Infor EAM.',
    mappings: [
      { sourceField: 'EQUIPMENT_ID', targetField: 'assetNumber', transformation: 'Direct Mapping', required: true, sampleValue: 'INF-8812' }
    ],
    syncHistory: [
      { executionId: 'EXEC-2026-0908-10', startTime: '08 Sep 2026 20:00:00', endTime: '08 Sep 2026 20:01:12', direction: 'Inbound', received: 91, processed: 89, success: 89, failed: 2, status: 'Warning', triggeredBy: 'Scheduled' }
    ]
  }
];

// ==========================================
// 3. AUDIT LOGS REPOSITORY (PARAGRAPHS 651-700)
// ==========================================

export let memoryAuditLogs = [
  {
    id: 'LOG-00984',
    timestamp: '16 Sep 2025 04:32 PM',
    user: 'John Doe',
    userId: 'USR-001',
    userRole: 'System Administrator',
    module: 'Administration',
    submodule: 'User Management',
    action: 'Update',
    recordId: 'USR-007',
    description: 'Deactivated user account Khalid Hassan and revoked active access session.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    ipAddress: '192.168.1.104',
    device: 'Chrome 128 / Windows 11',
    oldValue: { status: 'Active', accountStatus: 'Active' },
    newValue: { status: 'Inactive', accountStatus: 'Locked' }
  },
  {
    id: 'LOG-00983',
    timestamp: '16 Sep 2025 03:15 PM',
    user: 'Sarah Ahmed',
    userId: 'USR-002',
    userRole: 'Asset Manager',
    module: 'Assets',
    submodule: 'Asset Register',
    action: 'Update',
    recordId: 'AST-000128',
    description: 'Asset AST-000128 location transferred from Old Warehouse to Main Store.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    ipAddress: '192.168.1.112',
    device: 'Safari / macOS',
    oldValue: { location: 'Old Warehouse DXB', custodian: 'Omar Rahman' },
    newValue: { location: 'Main Store Dubai HQ', custodian: 'Sarah Ahmed' }
  },
  {
    id: 'LOG-00982',
    timestamp: '16 Sep 2025 01:45 PM',
    user: 'Ramesh Kumar',
    userId: 'USR-003',
    userRole: 'Maintenance Manager',
    module: 'Maintenance',
    submodule: 'Work Orders',
    action: 'Create',
    recordId: 'WO-2025-00482',
    description: 'Created emergency corrective work order for Chiller CH-002 compressor fault.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    ipAddress: '192.168.1.118',
    device: 'Edge / Windows 11',
    oldValue: null,
    newValue: { workOrderNo: 'WO-2025-00482', priority: 'Critical', asset: 'CH-002', assignedTo: 'Omar Rahman' }
  },
  {
    id: 'LOG-00981',
    timestamp: '16 Sep 2025 11:20 AM',
    user: 'System Process',
    userId: 'SYS-001',
    userRole: 'Scheduler',
    module: 'Integrations',
    submodule: 'Workday Sync',
    action: 'Sync',
    recordId: 'INT-002',
    description: 'Scheduled batch synchronization completed: 850 worker records checked, 0 errors.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    ipAddress: '127.0.0.1 (Local Daemon)',
    device: 'System Background Worker',
    oldValue: null,
    newValue: { recordsProcessed: 850, syncResult: 'SUCCESS' }
  },
  {
    id: 'LOG-00980',
    timestamp: '16 Sep 2025 09:10 AM',
    user: 'Chen Wei',
    userId: 'USR-010',
    userRole: 'Inventory User',
    module: 'Inventory',
    submodule: 'Stock Transactions',
    action: 'Issue',
    recordId: 'STK-2025-00382',
    description: 'Issued 4x Replacement Air Filters (FLT-HVAC-01) against Work Order WO-2025-00479.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Abu Dhabi Office',
    ipAddress: '192.168.2.45',
    device: 'Zebra MC3300 Handheld / Android 13',
    oldValue: { stockBalance: 24 },
    newValue: { stockBalance: 20 }
  },
  {
    id: 'LOG-00979',
    timestamp: '15 Sep 2025 05:50 PM',
    user: 'Priya Nair',
    userId: 'USR-004',
    userRole: 'Audit Manager',
    module: 'Verification & Audit',
    submodule: 'Audit Management',
    action: 'Approve',
    recordId: 'AUD-2025-0003',
    description: 'Approved Q3 Physical Asset Census Verification Campaign for Jebel Ali Warehouse.',
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Jebel Ali Warehouse',
    ipAddress: '192.168.1.125',
    device: 'Chrome / Windows 11',
    oldValue: { auditStatus: 'Pending Approval' },
    newValue: { auditStatus: 'Approved & Scheduled' }
  },
  {
    id: 'LOG-00978',
    timestamp: '15 Sep 2025 02:15 PM',
    user: 'Unknown User',
    userId: 'ANON-AUTH',
    userRole: 'Unauthenticated',
    module: 'Security & Access',
    submodule: 'Authentication',
    action: 'Login',
    recordId: 'SEC-ATTEMPT-012',
    description: 'Failed login attempt for username: admin_root with invalid password credentials.',
    status: 'Failed',
    company: 'Global Scope',
    location: 'External Gateway',
    ipAddress: '185.220.101.5',
    device: 'Python Requests / Unknown Client',
    oldValue: null,
    newValue: { failureReason: 'Invalid credentials', lockAttemptCount: 3 }
  }
];

// Add 30 more realistic historical logs for deep pagination & filtering
for (let i = 1; i <= 30; i++) {
  const acts = ['Update', 'Create', 'Export', 'Sync', 'Approve'];
  const mods = ['Assets', 'Maintenance', 'Inventory', 'Administration', 'Verification & Audit'];
  const users = ['John Doe', 'Sarah Ahmed', 'Ramesh Kumar', 'System Process'];
  const dates = ['14 Sep 2025', '13 Sep 2025', '12 Sep 2025', '11 Sep 2025', '10 Sep 2025'];

  memoryAuditLogs.push({
    id: `LOG-009${70 - i}`,
    timestamp: `${dates[i % dates.length]} 10:${String(10 + i).padStart(2, '0')} AM`,
    user: users[i % users.length],
    userId: `USR-00${(i % 3) + 1}`,
    userRole: 'Enterprise Operator',
    module: mods[i % mods.length],
    submodule: 'Lifecycle Operation',
    action: acts[i % acts.length],
    recordId: `AST-000${200 + i}`,
    description: `Audit transaction ${i}: routine parameter verification or inspection entry completed.`,
    status: 'Success',
    company: 'Asset360 Holdings',
    location: 'Dubai HQ',
    ipAddress: `192.168.1.${50 + i}`,
    device: 'Chrome / Windows 11',
    oldValue: { verified: false },
    newValue: { verified: true }
  });
}

// ==========================================
// 4. EMAIL NOTIFICATIONS (PARAGRAPHS 701-766)
// ==========================================

export let memoryTemplates = [
  {
    id: 'TMPL-001',
    name: 'Work Order Assignment',
    module: 'Maintenance',
    eventType: 'Work Order Created',
    status: 'Active',
    lastModified: '10 Sep 2026',
    subject: 'New Work Order Assigned - {{WO_No}}',
    description: 'Notification sent to the assigned technician when a new work order is created.',
    recipientsRule: 'Assigned Technician (To), Maintenance Supervisor (CC)',
    bodyText: 'Dear {{User_Name}},\n\nA new work order has been assigned to you.\n\nWork Order Number : {{WO_No}}\nAsset             : {{Asset_Name}}\nPriority          : {{Priority}}\nDue Date          : {{Due_Date}}\nLocation          : {{Location}}\n\nPlease login to Asset360 to view the details.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{User_Name}},</p><p>A new work order has been assigned to you.</p><table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;"><tr><td style="width:160px; font-weight:600; color:#475569; padding:4px 0;">Work Order Number</td><td style="color:#0f172a;">: {{WO_No}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Asset</td><td style="color:#0f172a;">: {{Asset_Name}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Priority</td><td style="color:#0f172a;">: {{Priority}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Due Date</td><td style="color:#0f172a;">: {{Due_Date}}</td></tr><tr><td style="font-weight:600; color:#475569; padding:4px 0;">Location</td><td style="color:#0f172a;">: {{Location}}</td></tr></table><p>Please login to Asset360 to view the details.</p><p style="margin-top:20px;">Regards,<br/><strong>Asset360 Team</strong></p>',
    availablePlaceholders: ['{{WO_No}}', '{{WO_Description}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Priority}}', '{{Due_Date}}', '{{Location}}', '{{Assigned_To}}', '{{Created_By}}', '{{Company}}', '{{Link}}']
  },
  {
    id: 'TMPL-002',
    name: 'Work Order Completion',
    module: 'Maintenance',
    eventType: 'Work Order Completed',
    status: 'Active',
    lastModified: '10 Sep 2026',
    subject: 'Work Order Completed - {{WO_No}} ({{Asset_Name}})',
    description: 'Triggered when a work order is marked as resolved/completed by maintenance staff.',
    recipientsRule: 'Asset Custodian (To), Maintenance Manager (CC)',
    bodyText: 'Dear {{User_Name}},\n\nWork Order {{WO_No}} has been successfully completed.\n\nAsset: {{Asset_Name}} ({{Asset_No}})\nCompleted Date: {{Due_Date}}\nResolution Notes: Scheduled servicing finished.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{User_Name}},</p><p>Work Order <strong>{{WO_No}}</strong> for asset <strong>{{Asset_Name}}</strong> has been successfully completed.</p><p>Please review and close the task in Asset360.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{WO_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Completed_Date}}', '{{Resolution_Notes}}', '{{Technician}}']
  },
  {
    id: 'TMPL-003',
    name: 'PM Due Reminder',
    module: 'Maintenance',
    eventType: 'Preventive Maintenance Due',
    status: 'Active',
    lastModified: '09 Sep 2026',
    subject: 'Preventive Maintenance Due in {{Days_Remaining}} Days: {{Asset_Name}}',
    description: 'Automated advance notice for upcoming scheduled preventive maintenance tasks.',
    recipientsRule: 'Maintenance Planner & Assigned Crew (To)',
    bodyText: 'Dear Maintenance Team,\n\nPreventive maintenance is due for asset {{Asset_Name}} ({{Asset_No}}) on {{Due_Date}}.\n\nLocation: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Maintenance Team,</p><p>Scheduled preventive maintenance is due for <strong>{{Asset_Name}}</strong> ({{Asset_No}}) on <strong>{{Due_Date}}</strong>.</p><p>Location: {{Location}}</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{PM_Schedule}}', '{{Location}}']
  },
  {
    id: 'TMPL-004',
    name: 'PM Overdue Alert',
    module: 'Maintenance',
    eventType: 'Preventive Maintenance Overdue',
    status: 'Active',
    lastModified: '09 Sep 2026',
    subject: 'URGENT: Preventive Maintenance Overdue for {{Asset_Name}} ({{Asset_No}})',
    description: 'High-priority escalation when preventive maintenance is past its designated schedule.',
    recipientsRule: 'Plant Operations Head & Maintenance Director (To)',
    bodyText: 'Attention,\n\nPM schedule {{PM_Schedule}} for {{Asset_Name}} is overdue by {{Overdue_Days}} days. Immediate action required.\n\nLocation: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p style="color:#dc2626; font-weight:bold;">ESCALATION: Preventive Maintenance Overdue</p><p>Asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) at <strong>{{Location}}</strong> has overdue maintenance.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Overdue_Days}}', '{{Location}}', '{{Escalation_Manager}}']
  },
  {
    id: 'TMPL-005',
    name: 'Asset Transfer Approval',
    module: 'Assets',
    eventType: 'Transfer Approval Required',
    status: 'Active',
    lastModified: '08 Sep 2026',
    subject: 'Action Required: Asset Custody Transfer Approval - {{Transfer_No}}',
    description: 'Sent to line managers when an asset transfer request is initiated.',
    recipientsRule: 'Department Head & Approver (To)',
    bodyText: 'Dear {{Approver_Name}},\n\nAn asset transfer request has been submitted for {{Asset_Name}} ({{Asset_No}}).\n\nTransfer No: {{Transfer_No}}\nFrom Location: {{From_Location}}\nTo Location: {{To_Location}}\n\nPlease review in Asset360.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{Approver_Name}},</p><p>An asset custody transfer request requires your review and approval:</p><ul><li>Transfer: {{Transfer_No}}</li><li>Asset: {{Asset_Name}} ({{Asset_No}})</li><li>Destination: {{To_Location}}</li></ul><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Transfer_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{From_Location}}', '{{To_Location}}', '{{Requester}}']
  },
  {
    id: 'TMPL-006',
    name: 'Asset Transfer Completed',
    module: 'Assets',
    eventType: 'Transfer Completed',
    status: 'Active',
    lastModified: '08 Sep 2026',
    subject: 'Asset Transfer Completed: {{Transfer_No}} - {{Asset_Name}}',
    description: 'Confirmation sent once receiving custodian acknowledges delivery and inspection.',
    recipientsRule: 'Requester, Origin Custodian, Destination Custodian (To)',
    bodyText: 'Dear Team,\n\nTransfer {{Transfer_No}} has been finalized. Asset {{Asset_Name}} is now registered at {{To_Location}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Team,</p><p>Transfer <strong>{{Transfer_No}}</strong> for asset <strong>{{Asset_Name}}</strong> has been successfully accepted and closed.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Transfer_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{To_Location}}', '{{New_Custodian}}']
  },
  {
    id: 'TMPL-007',
    name: 'Asset Custodian Change',
    module: 'Assets',
    eventType: 'Custodian Updated',
    status: 'Active',
    lastModified: '07 Sep 2026',
    subject: 'Asset Custodian Assignment Notification - {{Asset_No}}',
    description: 'Notifies employee of new primary responsibility for an assigned fixed asset.',
    recipientsRule: 'New Custodian (To), HR Department (CC)',
    bodyText: 'Dear {{New_Custodian}},\n\nYou have been assigned as custodian for {{Asset_Name}} ({{Asset_No}}).\n\nLocation: {{Location}}\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{New_Custodian}},</p><p>You are officially registered as the primary custodian for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}).</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{New_Custodian}}', '{{Location}}', '{{Company}}']
  },
  {
    id: 'TMPL-008',
    name: 'Low Stock Alert',
    module: 'Inventory',
    eventType: 'Reorder Level',
    status: 'Active',
    lastModified: '06 Sep 2026',
    subject: 'Inventory Reorder Alert: {{Part_No}} ({{Part_Name}}) below minimum threshold',
    description: 'Alerts storekeepers when consumable or spare part balance drops below reorder point.',
    recipientsRule: 'Warehouse Storekeeper & Purchasing Officer (To)',
    bodyText: 'Attention,\n\nStock level for {{Part_Name}} ({{Part_No}}) at warehouse {{Location}} has reached {{Current_Stock}}, below reorder level {{Reorder_Level}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p style="color:#b45309; font-weight:bold;">Inventory Reorder Alert</p><p>Part <strong>{{Part_Name}}</strong> ({{Part_No}}) at {{Location}} is below threshold.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Part_No}}', '{{Part_Name}}', '{{Current_Stock}}', '{{Reorder_Level}}', '{{Location}}']
  },
  {
    id: 'TMPL-009',
    name: 'Stock Received',
    module: 'Inventory',
    eventType: 'Goods Receipt',
    status: 'Active',
    lastModified: '06 Sep 2026',
    subject: 'Goods Receipt Note Generated: {{GRN_No}} for PO {{PO_No}}',
    description: 'Confirmation of verified delivery inward against purchase order.',
    recipientsRule: 'Procurement Manager & Warehouse Supervisor (To)',
    bodyText: 'Dear Team,\n\nGRN {{GRN_No}} has been generated for Purchase Order {{PO_No}}.\n\nSupplier: {{Supplier}}\nReceived Date: {{Due_Date}}\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Team,</p><p>Goods Receipt Note <strong>{{GRN_No}}</strong> has been generated against PO <strong>{{PO_No}}</strong>.</p><p>Supplier: {{Supplier}}</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{GRN_No}}', '{{PO_No}}', '{{Supplier}}', '{{Due_Date}}', '{{Location}}']
  },
  {
    id: 'TMPL-010',
    name: 'Asset Warranty Expiry',
    module: 'Assets',
    eventType: 'Warranty Expiry',
    status: 'Active',
    lastModified: '05 Sep 2026',
    subject: 'Warranty Expiry Warning (30 Days): Asset {{Asset_No}} ({{Asset_Name}})',
    description: 'Advance notice for OEM manufacturer warranty lapse.',
    recipientsRule: 'Asset Custodian & Procurement Team (To)',
    bodyText: 'Dear Custodian,\n\nThe warranty for asset {{Asset_Name}} ({{Asset_No}}) will expire on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Custodian,</p><p>The manufacturer warranty for asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) is expiring on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}', '{{Supplier}}']
  },
  {
    id: 'TMPL-011',
    name: 'Contract / AMC Expiry',
    module: 'Maintenance',
    eventType: 'Contract Expiry',
    status: 'Active',
    lastModified: '05 Sep 2026',
    subject: 'Annual Maintenance Contract Renewal Due: {{Contract_No}}',
    description: 'Sent 60 days before service agreement or vendor SLA lapses.',
    recipientsRule: 'Contracts Administrator & Legal Team (To)',
    bodyText: 'Dear Team,\n\nAMC Contract {{Contract_No}} with vendor {{Supplier}} expires on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Team,</p><p>Annual Maintenance Contract <strong>{{Contract_No}}</strong> with vendor <strong>{{Supplier}}</strong> expires on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Contract_No}}', '{{Supplier}}', '{{Due_Date}}', '{{Company}}']
  },
  {
    id: 'TMPL-012',
    name: 'Asset Verification Assignment',
    module: 'Verification',
    eventType: 'Audit Assigned',
    status: 'Inactive',
    lastModified: '04 Sep 2026',
    subject: 'Physical Stocktake Assignment: {{Audit_Name}} ({{Location}})',
    description: 'Notice dispatched to field auditor when an audit cycle is scheduled.',
    recipientsRule: 'Lead Auditor & Field Verification Team (To)',
    bodyText: 'Dear Auditor,\n\nYou have been assigned to conduct physical verification for audit {{Audit_Name}} at {{Location}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Auditor,</p><p>You have been assigned to verification audit <strong>{{Audit_Name}}</strong> at <strong>{{Location}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Audit_Name}}', '{{Location}}', '{{Audit_Date}}', '{{Lead_Auditor}}']
  },
  {
    id: 'TMPL-013',
    name: 'Asset Verification Discrepancy',
    module: 'Verification',
    eventType: 'Audit Discrepancy Found',
    status: 'Active',
    lastModified: '04 Sep 2026',
    subject: 'Audit Exception Alert: Unreconciled Assets in {{Audit_Name}}',
    description: 'Notifies internal audit and finance upon discovering missing or unverified assets.',
    recipientsRule: 'Internal Audit Head, Finance Director (To)',
    bodyText: 'Dear Management,\n\nAudit {{Audit_Name}} has reported exceptions requiring review.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Management,</p><p>Audit <strong>{{Audit_Name}}</strong> has flagged exception records during verification.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Audit_Name}}', '{{Exception_Count}}', '{{Location}}']
  },
  {
    id: 'TMPL-014',
    name: 'Asset Disposal Approval',
    module: 'Assets',
    eventType: 'Disposal Request Created',
    status: 'Active',
    lastModified: '03 Sep 2026',
    subject: 'Approval Needed: Asset Retirement & Disposal Request {{Disposal_No}}',
    description: 'Disposal authorization workflow notification for end-of-life capital assets.',
    recipientsRule: 'Finance Controller & Asset Disposal Committee (To)',
    bodyText: 'Dear Committee,\n\nDisposal request {{Disposal_No}} for asset {{Asset_Name}} requires authorization.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Committee,</p><p>Asset disposal request <strong>{{Disposal_No}}</strong> for {{Asset_Name}} requires review.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Disposal_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Net_Book_Value}}']
  },
  {
    id: 'TMPL-015',
    name: 'Asset Disposal Completed',
    module: 'Assets',
    eventType: 'Disposal Certified',
    status: 'Active',
    lastModified: '03 Sep 2026',
    subject: 'Asset Deregistration & Disposal Certified: {{Disposal_No}}',
    description: 'Official certificate dispatched upon certified scrap, sale, or recycling.',
    recipientsRule: 'Fixed Asset Accountant & Compliance Officer (To)',
    bodyText: 'Dear Team,\n\nAsset {{Asset_Name}} ({{Asset_No}}) has been written off and removed from active ledger.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Team,</p><p>Asset <strong>{{Asset_Name}}</strong> ({{Asset_No}}) disposal has been executed.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Disposal_No}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Scrap_Value}}']
  },
  {
    id: 'TMPL-016',
    name: 'Asset Check-Out Alert',
    module: 'Assets',
    eventType: 'Asset Checked Out',
    status: 'Active',
    lastModified: '02 Sep 2026',
    subject: 'Tool / Equipment Check-Out: {{Asset_Name}} by {{User_Name}}',
    description: 'Temporary loan check-out confirmation to borrower and tool crib manager.',
    recipientsRule: 'Borrower (To), Tool Crib Supervisor (CC)',
    bodyText: 'Dear {{User_Name}},\n\nYou checked out {{Asset_Name}} ({{Asset_No}}). Expected return: {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{User_Name}},</p><p>You checked out <strong>{{Asset_Name}}</strong> ({{Asset_No}}). Expected return: <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Due_Date}}']
  },
  {
    id: 'TMPL-017',
    name: 'Asset Check-In Confirmation',
    module: 'Assets',
    eventType: 'Asset Returned',
    status: 'Active',
    lastModified: '02 Sep 2026',
    subject: 'Tool / Equipment Returned: {{Asset_Name}} ({{Asset_No}})',
    description: 'Receipt given to user when borrowed tool is verified and returned in good condition.',
    recipientsRule: 'Borrower (To)',
    bodyText: 'Dear {{User_Name}},\n\nReturn acknowledged for {{Asset_Name}} ({{Asset_No}}). Condition: Verified Good.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear {{User_Name}},</p><p>Return verified for <strong>{{Asset_Name}}</strong> ({{Asset_No}}).</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{User_Name}}', '{{Asset_Name}}', '{{Asset_No}}', '{{Return_Date}}']
  },
  {
    id: 'TMPL-018',
    name: 'Asset Maintenance Overdue',
    module: 'Maintenance',
    eventType: 'Maintenance Delayed',
    status: 'Active',
    lastModified: '01 Sep 2026',
    subject: 'SLA Breach Warning: Work Order {{WO_No}} Overdue',
    description: 'Corrective maintenance work order has exceeded allowed resolution timeframe.',
    recipientsRule: 'Maintenance Lead & Operations Manager (To)',
    bodyText: 'Warning:\n\nWO {{WO_No}} for {{Asset_Name}} is unresolved past target due date {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p style="color:#b91c1c;">SLA Breach: Work Order <strong>{{WO_No}}</strong> is past due.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{WO_No}}', '{{Asset_Name}}', '{{Due_Date}}', '{{Assigned_To}}']
  },
  {
    id: 'TMPL-019',
    name: 'PO Approval Notification',
    module: 'Inventory',
    eventType: 'PO Pending Approval',
    status: 'Active',
    lastModified: '01 Sep 2026',
    subject: 'Purchase Order Approval Required: {{PO_No}} (Amount: {{Amount}})',
    description: 'Sent to designated financial authority for purchase order release.',
    recipientsRule: 'Procurement Approver (To)',
    bodyText: 'Dear Approver,\n\nPurchase Order {{PO_No}} totaling {{Amount}} requires your sign-off.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Dear Approver,</p><p>PO <strong>{{PO_No}}</strong> for {{Amount}} is pending your approval.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{PO_No}}', '{{Amount}}', '{{Supplier}}', '{{Requester}}']
  },
  {
    id: 'TMPL-020',
    name: 'PO Goods Inward Receipt',
    module: 'Inventory',
    eventType: 'Goods Inspected',
    status: 'Active',
    lastModified: '31 Aug 2026',
    subject: 'Inspection Complete for Delivery against PO {{PO_No}}',
    description: 'Quality inspection passed for newly arrived asset batch.',
    recipientsRule: 'Receiving Team & Requester (To)',
    bodyText: 'Quality inspection passed for order {{PO_No}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Quality inspection passed for order <strong>{{PO_No}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{PO_No}}', '{{GRN_No}}', '{{Location}}']
  },
  {
    id: 'TMPL-021',
    name: 'License Renewal Warning',
    module: 'Assets',
    eventType: 'Software License Expiring',
    status: 'Active',
    lastModified: '30 Aug 2026',
    subject: 'Software License Expiry in 15 Days: {{Software_Name}} ({{Seat_Count}} seats)',
    description: 'Notifies IT software asset manager about approaching license seat expiration.',
    recipientsRule: 'IT Asset Manager & CIO Office (To)',
    bodyText: 'Attention:\n\nLicense for {{Software_Name}} expires on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Attention: License for <strong>{{Software_Name}}</strong> expires on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Software_Name}}', '{{Seat_Count}}', '{{Due_Date}}']
  },
  {
    id: 'TMPL-022',
    name: 'Insurance Policy Expiry',
    module: 'Assets',
    eventType: 'Policy Expiry Warning',
    status: 'Active',
    lastModified: '29 Aug 2026',
    subject: 'Asset Insurance Policy Expiration Alert: {{Policy_No}}',
    description: 'Sent 45 days prior to fleet or facility insurance policy termination.',
    recipientsRule: 'Risk Management & Finance Director (To)',
    bodyText: 'Dear Risk Manager,\n\nInsurance Policy {{Policy_No}} expires on {{Due_Date}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>Insurance Policy <strong>{{Policy_No}}</strong> expires on <strong>{{Due_Date}}</strong>.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Policy_No}}', '{{Due_Date}}', '{{Company}}']
  },
  {
    id: 'TMPL-023',
    name: 'Security Incident Alert',
    module: 'Administration',
    eventType: 'Failed Login Threshold',
    status: 'Inactive',
    lastModified: '28 Aug 2026',
    subject: 'Security Notice: Multiple Failed Sign-in Attempts for {{User_Name}}',
    description: 'Dispatched when abnormal credential failure triggers rate limit / lockout threshold.',
    recipientsRule: 'Security Operations & User (To)',
    bodyText: 'Security Notice: 5 consecutive failed logins detected for {{User_Name}}.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p style="color:#b91c1c;">Security Notice: Failed logins detected for {{User_Name}}.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{User_Name}}', '{{IP_Address}}', '{{Timestamp}}']
  },
  {
    id: 'TMPL-024',
    name: 'System Backup Alert',
    module: 'Administration',
    eventType: 'Scheduled Backup Completed',
    status: 'Active',
    lastModified: '27 Aug 2026',
    subject: 'Daily Database & Asset Archive Backup Completed Successfully',
    description: 'System health notification sent after nightly automated backup validation.',
    recipientsRule: 'System Administrators (To)',
    bodyText: 'System Notice: Nightly backup finished with 100% integrity verification.\n\nRegards,\nAsset360 Team',
    bodyHtml: '<p>System Notice: Nightly backup finished with 100% integrity verification.</p><p>Regards,<br/>Asset360 Team</p>',
    availablePlaceholders: ['{{Backup_ID}}', '{{Size}}', '{{Duration}}']
  }
];

export let memoryDeliveryLogs = [
  { id: 'NOTIF-091', timestamp: '16 Sep 2025 04:10 PM', template: 'Work Order Assignment Notification', recipient: 'omar.rahman@asset360.com', subject: 'Work Order Assigned: WO-2025-00482 - Critical Priority', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-090', timestamp: '16 Sep 2025 03:20 PM', template: 'Asset Transfer Approval Required', recipient: 'sarah.ahmed@asset360.com', subject: 'Action Required: Approval for Asset Transfer TRF-2025-00091', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-089', timestamp: '16 Sep 2025 01:15 PM', template: 'Low Stock Reorder Threshold Alert', recipient: 'chen.wei@asset360.com', subject: 'Inventory Alert: Part FLT-HVAC-01 below reorder level', status: 'Delivered', retryCount: 0 },
  { id: 'NOTIF-088', timestamp: '15 Sep 2025 11:45 AM', template: 'Asset Warranty Expiry Alert (30 Days)', recipient: 'john.doe@asset360.com', subject: 'Warranty Expiry Warning: Asset AST-000104 expires on 15 Oct 2025', status: 'Delivered', retryCount: 0 }
];

// ==========================================
// 5. BACKUP & SCHEDULER (PARAGRAPHS 767-816)
// ==========================================

export let memoryBackups = [
  {
    id: 'BAK-20260910-001',
    name: 'Full Backup - 20260910',
    type: 'Full',
    size: '18.5 GB',
    startTime: '10 Sep 2026 02:00 AM',
    endTime: '10 Sep 2026 02:35 AM',
    duration: '35 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260910.bak',
    checksum: '3f8a7c9d5e2b1...',
    notes: 'Scheduled daily full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Full System Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Backup job BAK-20260910-001 queued by System Daemon' },
      { time: '02:00:05 AM', message: 'Snapshot lock acquired on Asset360_Production' },
      { time: '02:18:22 AM', message: 'Database binary dump completed (18.5 GB)' },
      { time: '02:29:40 AM', message: 'SHA-256 Checksum computed: 3f8a7c9d5e2b1...' },
      { time: '02:35:00 AM', message: 'Transfer to secure target verified. Status: SUCCESS' }
    ]
  },
  {
    id: 'BAK-20260909-001',
    name: 'Incremental - 20260909',
    type: 'Incremental',
    size: '2.1 GB',
    startTime: '09 Sep 2026 02:00 AM',
    endTime: '09 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260909.bak',
    checksum: '7c4e1b8a9d0f2...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:02 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'Incremental block written (2.1 GB)' }
    ]
  },
  {
    id: 'BAK-20260908-001',
    name: 'Incremental - 20260908',
    type: 'Incremental',
    size: '2.3 GB',
    startTime: '08 Sep 2026 02:00 AM',
    endTime: '08 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260908.bak',
    checksum: '9e2b1a8f4c7d5...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.3 GB)' }
    ]
  },
  {
    id: 'BAK-20260907-001',
    name: 'Full Backup - 20260907',
    type: 'Full',
    size: '18.2 GB',
    startTime: '07 Sep 2026 02:00 AM',
    endTime: '07 Sep 2026 02:40 AM',
    duration: '40 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260907.bak',
    checksum: '5b1a8f4c7d9e2...',
    notes: 'Scheduled weekly full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Full System Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:00 AM', message: 'Full database backup initiated' },
      { time: '02:40:00 AM', message: 'Completed successfully (18.2 GB)' }
    ]
  },
  {
    id: 'BAK-20260906-001',
    name: 'Incremental - 20260906',
    type: 'Incremental',
    size: '2.0 GB',
    startTime: '06 Sep 2026 02:00 AM',
    endTime: '06 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260906.bak',
    checksum: '1a8f4c7d9e2b5...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.0 GB)' }
    ]
  },
  {
    id: 'BAK-20260905-001',
    name: 'Incremental - 20260905',
    type: 'Incremental',
    size: '2.4 GB',
    startTime: '05 Sep 2026 02:00 AM',
    endTime: '05 Sep 2026 02:13 AM',
    duration: '13 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260905.bak',
    checksum: '4c7d9e2b5a1a8...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:13:00 AM', message: 'Incremental block written (2.4 GB)' }
    ]
  },
  {
    id: 'BAK-20260904-001',
    name: 'Incremental - 20260904',
    type: 'Incremental',
    size: '2.2 GB',
    startTime: '04 Sep 2026 02:00 AM',
    endTime: '04 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Failed',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260904.bak',
    checksum: '—',
    notes: 'I/O disk timeout during file stream flush',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: false,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'ERROR: Disk I/O timeout during flush. Exit code 5.' }
    ]
  },
  {
    id: 'BAK-20260903-001',
    name: 'Full Backup - 20260903',
    type: 'Full',
    size: '18.1 GB',
    startTime: '03 Sep 2026 02:00 AM',
    endTime: '03 Sep 2026 02:38 AM',
    duration: '38 mins',
    status: 'Success',
    location: '/backups/full/2026/09/Asset360_Full_20260903.bak',
    checksum: 'd9e2b5a1a84c7...',
    notes: 'Scheduled weekly full backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Full System Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:00 AM', message: 'Full database backup initiated' },
      { time: '02:38:00 AM', message: 'Completed successfully (18.1 GB)' }
    ]
  },
  {
    id: 'BAK-20260902-001',
    name: 'Incremental - 20260902',
    type: 'Incremental',
    size: '2.0 GB',
    startTime: '02 Sep 2026 02:00 AM',
    endTime: '02 Sep 2026 02:11 AM',
    duration: '11 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260902.bak',
    checksum: 'e2b5a1a84c7d9...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:11:00 AM', message: 'Incremental block written (2.0 GB)' }
    ]
  },
  {
    id: 'BAK-20260901-001',
    name: 'Incremental - 20260901',
    type: 'Incremental',
    size: '2.3 GB',
    startTime: '01 Sep 2026 02:00 AM',
    endTime: '01 Sep 2026 02:12 AM',
    duration: '12 mins',
    status: 'Success',
    location: '/backups/incremental/2026/09/Asset360_Inc_20260901.bak',
    checksum: 'b5a1a84c7d9e2...',
    notes: 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: 'Daily Differential/Incremental Backup',
    integrityChecked: true,
    logs: [
      { time: '02:00:01 AM', message: 'Differential snapshot started' },
      { time: '02:12:00 AM', message: 'Incremental block written (2.3 GB)' }
    ]
  }
];

// Add entries up to 28 backups to match total count
for (let i = 11; i <= 28; i++) {
  const day = String(31 - i).padStart(2, '0');
  const isFull = i % 7 === 0;
  memoryBackups.push({
    id: `BAK-202608${day}-001`,
    name: `${isFull ? 'Full Backup' : 'Incremental'} - 202608${day}`,
    type: isFull ? 'Full' : 'Incremental',
    size: isFull ? '18.0 GB' : '2.1 GB',
    startTime: `${day} Aug 2026 02:00 AM`,
    endTime: `${day} Aug 2026 02:${isFull ? '36' : '12'} AM`,
    duration: isFull ? '36 mins' : '12 mins',
    status: i === 22 ? 'Failed' : 'Success',
    location: `/backups/${isFull ? 'full' : 'incremental'}/2026/08/Asset360_${isFull ? 'Full' : 'Inc'}_202608${day}.bak`,
    checksum: `a7f${i}b8c9d0e1...`,
    notes: isFull ? 'Scheduled weekly full backup' : 'Scheduled daily incremental backup',
    createdBy: 'System Scheduler',
    scheduleName: isFull ? 'Daily Full System Backup' : 'Daily Differential/Incremental Backup',
    integrityChecked: i !== 22,
    logs: [
      { time: '02:00:00 AM', message: 'Automated backup process started.' },
      { time: `02:${isFull ? '36' : '12'}:00 AM`, message: i === 22 ? 'Failed due to storage timeout.' : 'Finished successfully.' }
    ]
  });
}

export let memoryRecentActivities = [
  { id: 'ACT-001', dateTime: '10 Sep 2026 02:35 AM', activity: 'Backup Completed', status: 'Success', message: 'Full backup completed successfully. Size: 18.5 GB' },
  { id: 'ACT-002', dateTime: '10 Sep 2026 02:00 AM', activity: 'Backup Started', status: 'Success', message: 'Full backup started.' },
  { id: 'ACT-003', dateTime: '09 Sep 2026 02:12 AM', activity: 'Backup Completed', status: 'Success', message: 'Incremental backup completed successfully. Size: 2.1 GB' },
  { id: 'ACT-004', dateTime: '09 Sep 2026 02:00 AM', activity: 'Backup Started', status: 'Success', message: 'Incremental backup started.' },
  { id: 'ACT-005', dateTime: '08 Sep 2026 02:11 AM', activity: 'Backup Completed', status: 'Success', message: 'Incremental backup completed successfully. Size: 2.3 GB' },
  { id: 'ACT-006', dateTime: '07 Sep 2026 02:40 AM', activity: 'Backup Completed', status: 'Success', message: 'Full backup completed successfully. Size: 18.2 GB' },
  { id: 'ACT-007', dateTime: '04 Sep 2026 02:12 AM', activity: 'Backup Failed', status: 'Failed', message: 'Incremental backup failed: I/O disk timeout during file stream flush.' }
];

export let memoryScheduledJobs = [
  { id: 'JOB-001', name: 'Daily Database Full Backup', jobType: 'Backup', module: 'Administration', frequency: 'Daily (02:00 AM)', lastRun: '10 Sep 2026 02:00 AM', nextRun: '11 Sep 2026 02:00 AM', lastResult: 'Success', status: 'Active', retention: '30 Days', target: 'Azure Blob Primary' },
  { id: 'JOB-002', name: 'Hourly Differential Backup', jobType: 'Backup', module: 'Administration', frequency: 'Hourly (XX:00)', lastRun: '10 Sep 2026 04:00 PM', nextRun: '10 Sep 2026 05:00 PM', lastResult: 'Success', status: 'Active', retention: '7 Days', target: 'Local NAS' },
  { id: 'JOB-003', name: 'Preventive Maintenance Ticket Auto-Generation', jobType: 'Maintenance', module: 'Maintenance', frequency: 'Daily (01:00 AM)', lastRun: '10 Sep 2026 01:00 AM', nextRun: '11 Sep 2026 01:00 AM', lastResult: 'Success (14 tickets generated)', status: 'Active', retention: '90 Days', target: 'System DB' },
  { id: 'JOB-004', name: 'Warranty & AMC Expiry Scanner', jobType: 'Compliance', module: 'Contracts', frequency: 'Daily (06:00 AM)', lastRun: '10 Sep 2026 06:00 AM', nextRun: '11 Sep 2026 06:00 AM', lastResult: 'Success (3 alerts sent)', status: 'Active', retention: '365 Days', target: 'Notifications Engine' },
  { id: 'JOB-005', name: 'Outbound Notification Dispatcher Queue', jobType: 'Notifications', module: 'Administration', frequency: 'Every 5 Minutes', lastRun: '10 Sep 2026 04:35 PM', nextRun: '10 Sep 2026 04:40 PM', lastResult: 'Success (0 pending)', status: 'Active', retention: '14 Days', target: 'SMTP Queue' },
  { id: 'JOB-006', name: 'Daily Executive Operations Report Summary', jobType: 'Reports', module: 'Reports & Analytics', frequency: 'Daily (07:00 AM)', lastRun: '10 Sep 2026 07:00 AM', nextRun: '11 Sep 2026 07:00 AM', lastResult: 'Success', status: 'Active', retention: '180 Days', target: 'Executive Portal' },
  { id: 'JOB-007', name: 'Auto-Discovery Subnet Scan Sweep', jobType: 'Discovery', module: 'Auto Discovery', frequency: 'Daily (03:00 AM)', lastRun: '10 Sep 2026 03:00 AM', nextRun: '11 Sep 2026 03:00 AM', lastResult: 'Success (42 devices detected)', status: 'Active', retention: '60 Days', target: 'CMDB Buffer' }
];

// ==========================================
// CONTROLLER HANDLERS
// ==========================================

// Master Data Handlers
export async function getMasterDataGroups(req, res) {
  res.json({ success: true, groups: memoryAssetGroups, total: memoryAssetGroups.length });
}

export async function createMasterDataGroup(req, res) {
  const data = req.body;
  const newGroup = {
    id: `GRP-${String(memoryAssetGroups.length + 1).padStart(3, '0')}`,
    code: data.code,
    name: data.name,
    description: data.description || '',
    assetType: data.assetType || 'Physical',
    totalAssets: 0,
    status: data.status || 'Active',
    createdBy: req.user?.name || 'Administrator',
    createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };
  memoryAssetGroups.push(newGroup);
  res.status(201).json({ success: true, group: newGroup, message: 'Asset Group created successfully' });
}

export async function updateMasterDataGroup(req, res) {
  const { id } = req.params;
  const index = memoryAssetGroups.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Group not found' });
  memoryAssetGroups[index] = { ...memoryAssetGroups[index], ...req.body };
  res.json({ success: true, group: memoryAssetGroups[index], message: 'Group updated successfully' });
}

export async function deleteMasterDataGroup(req, res) {
  const { id } = req.params;
  const group = memoryAssetGroups.find(g => g.id === id);
  if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
  if (group.totalAssets > 0) {
    return res.status(400).json({ success: false, message: `Cannot delete group "${group.name}" with active assets (${group.totalAssets}). Please deactivate or reassign assets first.` });
  }
  memoryAssetGroups = memoryAssetGroups.filter(g => g.id !== id);
  res.json({ success: true, message: `Group "${group.name}" deleted successfully` });
}

export async function getMasterDataHierarchy(req, res) {
  const totalAssets = memoryAssetGroups.reduce((acc, g) => acc + (g.totalAssets || 0), 0);
  res.json({
    success: true,
    groups: memoryAssetGroups,
    classes: memoryAssetClasses,
    categories: memoryAssetCategories,
    subcategories: memoryAssetSubcategories,
    totals: {
      groupsCount: memoryAssetGroups.length,
      classesCount: memoryAssetClasses.length,
      categoriesCount: memoryAssetCategories.length,
      subcategoriesCount: memoryAssetSubcategories.length,
      totalAssets
    }
  });
}

export async function getMasterDataClasses(req, res) {
  res.json({ success: true, classes: memoryAssetClasses });
}

export async function getMasterDataSuppliers(req, res) {
  res.json({ success: true, suppliers: memorySuppliers });
}

export async function getMasterDataManufacturers(req, res) {
  res.json({ success: true, manufacturers: memoryManufacturers });
}

export async function getMasterDataUOM(req, res) {
  res.json({ success: true, uom: memoryUOM });
}

export async function validateMasterDataImport(req, res) {
  const { records = [], entityType = 'ASSET_GROUP' } = req.body;
  const results = records.map((r, i) => {
    const valid = !!(r.code && r.name);
    return {
      row: i + 1,
      valid,
      errors: valid ? [] : [!r.code ? 'Code is mandatory' : 'Name is mandatory'],
      data: r
    };
  });
  const validCount = results.filter(r => r.valid).length;
  res.json({
    success: true,
    totalRows: records.length,
    validCount,
    errorCount: records.length - validCount,
    results
  });
}

export async function commitBulkMasterDataImport(req, res) {
  const { entityType, validRecords = [], rows = [] } = req.body;
  const records = validRecords.length ? validRecords : rows;
  if (entityType === 'ASSET_GROUP') {
    records.forEach(r => {
      memoryAssetGroups.push({
        id: `GRP-${String(memoryAssetGroups.length + 1).padStart(3, '0')}`,
        code: r.code,
        name: r.name,
        description: r.description || '',
        assetType: r.assetType || 'Physical',
        totalAssets: 0,
        status: 'Active',
        createdBy: 'Bulk Import Wizard',
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
    });
  }
  res.json({
    success: true,
    committedCount: records.length,
    message: `Successfully imported ${records.length} ${entityType || 'master'} records into repository.`,
    summary: { total: records.length, success: records.length, failed: 0, skipped: 0 }
  });
}

// Integrations Handlers
export async function getIntegrationsList(req, res) {
  const { systemType, category, search, status, direction, company } = req.query;
  const filterCat = category || systemType;
  let list = [...memoryIntegrations];

  if (filterCat && filterCat !== 'All' && filterCat !== 'All Integrations' && filterCat !== 'All Types') {
    const catLower = filterCat.toLowerCase();
    list = list.filter(i => {
      if (catLower.includes('erp')) return i.systemType === 'ERP' || i.category === 'ERP Systems';
      if (catLower.includes('hr')) return i.systemType === 'HR' || i.category === 'HR Systems';
      if (catLower.includes('service') || catLower === 'itsm') return i.systemType === 'ITSM' || i.category === 'IT Service Management';
      if (catLower.includes('identity') || catLower.includes('security')) return i.systemType === 'Identity' || i.category === 'Identity & Security';
      if (catLower.includes('iot') || catLower.includes('device')) return i.systemType === 'IoT' || i.category === 'IoT & Devices';
      if (catLower.includes('other')) return i.systemType === 'Other' || i.systemType === 'Communication' || i.category === 'Other Systems';
      return i.systemType.toLowerCase() === catLower || i.category.toLowerCase() === catLower;
    });
  }

  if (status && status !== 'All' && status !== 'All Statuses') {
    list = list.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }

  if (direction && direction !== 'All') {
    list = list.filter(i => i.direction.toLowerCase() === direction.toLowerCase());
  }

  if (company && company !== 'All Companies') {
    list = list.filter(i => i.company === 'All Companies' || i.company === company);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.externalSystem.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.systemType.toLowerCase().includes(q)
    );
  }

  const activeCount = memoryIntegrations.filter(i => i.status === 'Active').length;
  res.json({
    success: true,
    integrations: list,
    total: list.length,
    kpis: {
      totalConfigured: memoryIntegrations.length,
      activeInterfaces: activeCount,
      lastSuccessfulSync: '10 Sep 2026 11:05',
      syncErrorsToday: memoryIntegrations.filter(i => i.lastResult === 'Failed' || i.lastResult === 'Warning').length
    }
  });
}

export async function testIntegrationConnection(req, res) {
  const { id } = req.params;
  const item = memoryIntegrations.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Integration interface not found' });

  // Simulate realistic network handshake
  res.json({
    success: true,
    message: `Connection to ${item.externalSystem} handshake verified successfully (HTTP 200 OK, latency: 42ms).`,
    endpoint: item.endpointUrl,
    authVerified: true
  });
}

export async function runIntegrationSync(req, res) {
  const { id } = req.params;
  const item = memoryIntegrations.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Integration interface not found' });

  item.lastSync = 'Just now';
  item.status = 'Active';
  item.lastResult = 'Success';
  item.recordsProcessed += Math.floor(10 + Math.random() * 50);

  res.json({ success: true, message: `Sync job initiated asynchronously for ${item.name}`, integration: item });
}

export async function toggleIntegrationStatus(req, res) {
  const { id } = req.params;
  const item = memoryIntegrations.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Integration not found' });

  item.status = item.status === 'Active' ? 'Inactive' : 'Active';
  res.json({ success: true, integration: item, message: `Integration status changed to ${item.status}` });
}

export async function createIntegration(req, res) {
  const body = req.body;
  const newId = `INT-${String(memoryIntegrations.length + 1).padStart(3, '0')}`;
  const newItem = {
    id: newId,
    name: body.name || 'New External Interface',
    externalSystem: body.externalSystem || 'External Platform',
    systemType: body.systemType || 'ERP',
    category: body.category || `${body.systemType || 'ERP'} Systems`,
    direction: body.direction || 'Bi-directional',
    frequency: body.frequency || 'Hourly',
    lastSync: 'Pending First Run',
    status: body.status || 'Active',
    lastResult: 'Success',
    recordsProcessed: 0,
    errorCount: 0,
    endpointUrl: body.endpointUrl || 'https://api.external.com',
    protocol: body.protocol || 'REST API (HTTPS)',
    timeout: body.timeout || 30,
    retryPolicy: body.retryPolicy || '3 retries',
    authType: body.authType || 'OAuth 2.0 Client Credentials',
    clientId: body.clientId || '',
    maskedSecret: '••••••••••••••••••••••••',
    company: body.company || 'All Companies',
    description: body.description || 'Configured integration interface.',
    mappings: body.mappings || [
      { sourceField: 'id', targetField: 'assetNumber', transformation: 'Direct Mapping', required: true, sampleValue: 'AST-1001' }
    ],
    syncHistory: []
  };
  memoryIntegrations.unshift(newItem);
  res.status(201).json({ success: true, message: `Integration ${newItem.name} created successfully`, integration: newItem });
}

export async function updateIntegration(req, res) {
  const { id } = req.params;
  const itemIndex = memoryIntegrations.findIndex(i => i.id === id);
  if (itemIndex === -1) return res.status(404).json({ success: false, error: 'Integration not found' });

  const existing = memoryIntegrations[itemIndex];
  const updated = { ...existing, ...req.body, id: existing.id };
  if (req.body.clientSecret) {
    updated.maskedSecret = '••••••••••••••••••••••••';
  }
  memoryIntegrations[itemIndex] = updated;
  res.json({ success: true, message: `Integration ${updated.name} updated successfully`, integration: updated });
}

export async function deleteIntegration(req, res) {
  const { id } = req.params;
  const item = memoryIntegrations.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Integration not found' });

  // Soft deactivate if has execution history to preserve audit integrity
  if (item.syncHistory && item.syncHistory.length > 0) {
    item.status = 'Inactive';
    return res.json({ success: true, message: `Integration has sync history and was deactivated instead of deleted to maintain audit integrity.`, integration: item });
  }

  const idx = memoryIntegrations.findIndex(i => i.id === id);
  memoryIntegrations.splice(idx, 1);
  res.json({ success: true, message: `Integration deleted successfully` });
}

export async function retrySyncErrors(req, res) {
  const { id } = req.params;
  const item = memoryIntegrations.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Integration not found' });

  item.errorCount = 0;
  item.lastResult = 'Success';
  item.status = 'Active';
  res.json({ success: true, message: `Failed records for ${item.name} queued for reprocessing successfully.` });
}

// Audit Logs Handlers
export async function getAuditLogsList(req, res) {
  const { module, action, status, search, page = 1, limit = 10 } = req.query;
  let list = [...memoryAuditLogs];

  if (module && module !== 'All Modules') {
    list = list.filter(l => l.module.toLowerCase() === module.toLowerCase());
  }
  if (action && action !== 'All Actions') {
    list = list.filter(l => l.action.toLowerCase() === action.toLowerCase());
  }
  if (status && status !== 'All Status') {
    list = list.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(l =>
      l.description.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      l.recordId.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginated = list.slice(startIndex, startIndex + parseInt(limit));

  const normalized = paginated.map(l => ({
    ...l,
    actionType: l.actionType || l.action,
    user: typeof l.user === 'string' ? {
      name: l.user,
      username: l.user.toLowerCase().replace(/\s+/g, '.'),
      role: l.userRole || 'System User',
      email: `${l.user.toLowerCase().replace(/\s+/g, '.')}@asset360.com`
    } : l.user,
    diff: l.diff || (l.oldValue && l.newValue ? Object.keys(l.newValue).map(k => ({
      label: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      oldValue: typeof l.oldValue[k] === 'object' ? JSON.stringify(l.oldValue[k]) : String(l.oldValue[k] ?? '—'),
      newValue: typeof l.newValue[k] === 'object' ? JSON.stringify(l.newValue[k]) : String(l.newValue[k] ?? '—')
    })) : [])
  }));

  res.json({ success: true, logs: normalized, total, page: parseInt(page), limit: parseInt(limit) });
}

// Email Notifications Handlers
export async function getEmailTemplates(req, res) {
  res.json({ success: true, templates: memoryTemplates });
}

export async function updateEmailTemplate(req, res) {
  const { id } = req.params;
  const index = memoryTemplates.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Template not found' });
  memoryTemplates[index] = { ...memoryTemplates[index], ...req.body };
  res.json({ success: true, template: memoryTemplates[index], message: 'Template saved successfully' });
}

export async function getEmailSettings(req, res) {
  res.json({ success: true, settings: memoryEmailSettings });
}

export async function updateEmailSettings(req, res) {
  memoryEmailSettings = { ...memoryEmailSettings, ...req.body };
  res.json({ success: true, settings: memoryEmailSettings, message: 'Notification settings updated successfully' });
}

export async function sendTestEmail(req, res) {
  const { templateId, testEmail } = req.body;
  const template = memoryTemplates.find(t => t.id === templateId);
  if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

  memoryDeliveryLogs.unshift({
    id: `NOTIF-09${memoryDeliveryLogs.length + 1}`,
    timestamp: 'Just now',
    template: template.name,
    recipient: testEmail || 'admin@asset360.com',
    subject: `[TEST EMAIL] ${template.subject.replace('{{WO_No}}', 'WO-TEST-999').replace('{{Priority}}', 'High').replace('{{Asset_Name}}', 'Dell Latitude 7440')}`,
    status: 'Delivered',
    retryCount: 0
  });

  res.json({ success: true, message: `Test email dispatched successfully to ${testEmail || 'admin@asset360.com'}` });
}

export async function getEmailDeliveryLogs(req, res) {
  res.json({ success: true, logs: memoryDeliveryLogs });
}

// Backup & Scheduler Handlers
export async function getBackupHealthAndList(req, res) {
  const { search, type, status, page = 1, limit = 10 } = req.query;
  let filtered = [...memoryBackups];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q))
    );
  }
  if (type && type !== 'All') {
    filtered = filtered.filter(b => b.type.toLowerCase() === type.toLowerCase());
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(b => b.status.toLowerCase() === status.toLowerCase());
  }

  const total = filtered.length;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    kpis: {
      lastBackup: '10 Sep 2026 02:00 AM',
      lastBackupType: 'Full Backup',
      totalBackups30Days: 28,
      successfulCount: 26,
      failedCount: 2,
      storageUsedGb: 125,
      storageCapacityGb: 500,
      storagePercentage: 25,
      nextScheduledBackup: '11 Sep 2026 02:00 AM',
      nextScheduledType: 'Full Backup (Daily)'
    },
    backups: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    recentActivities: memoryRecentActivities
  });
}

export async function createManualBackup(req, res) {
  const { name, type = 'Full', notes = '', retention = '30 Days' } = req.body;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  const newBackup = {
    id: `BAK-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(memoryBackups.length + 1).padStart(3, '0')}`,
    name: name || `${type} Backup - ${now.toISOString().slice(0, 10).replace(/-/g, '')}`,
    type,
    size: type === 'Full' ? '18.6 GB' : '2.2 GB',
    startTime: `${dateStr} ${timeStr}`,
    endTime: `${dateStr} ${timeStr}`,
    duration: type === 'Full' ? '32 mins' : '10 mins',
    status: 'Success',
    location: `/backups/${type.toLowerCase()}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/Asset360_${type}_${Date.now()}.bak`,
    checksum: '4a9b2c8e1f0d3...',
    notes: notes || `Manual ${type} backup initiated by ${req.user?.name || 'Administrator'}`,
    createdBy: req.user?.name || 'System Administrator',
    scheduleName: 'Manual Ad-Hoc Trigger',
    integrityChecked: true,
    logs: [
      { time: timeStr, message: `Manual ${type} backup requested.` },
      { time: timeStr, message: 'Snapshot completed and checksum verified. Status: SUCCESS' }
    ]
  };

  memoryBackups.unshift(newBackup);

  memoryRecentActivities.unshift({
    id: `ACT-${Date.now()}`,
    dateTime: `${dateStr} ${timeStr}`,
    activity: 'Backup Completed',
    status: 'Success',
    message: `Manual ${type} backup completed successfully. Size: ${newBackup.size}`
  });

  res.status(201).json({ success: true, backup: newBackup, message: 'Manual backup completed successfully.' });
}

export async function restoreBackup(req, res) {
  const { id } = req.params;
  const backup = memoryBackups.find(b => b.id === id);
  if (!backup) return res.status(404).json({ success: false, error: 'Backup not found' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  memoryRecentActivities.unshift({
    id: `ACT-${Date.now()}`,
    dateTime: `${dateStr} ${timeStr}`,
    activity: 'Restore Completed',
    status: 'Success',
    message: `Database restored from ${backup.name} (${backup.size}). Target: Production Database.`
  });

  res.json({
    success: true,
    message: `System restored successfully from ${backup.name}. Database integrity verified.`,
    restoredAt: new Date().toISOString()
  });
}

export async function verifyBackupIntegrity(req, res) {
  const { id } = req.params;
  const backup = memoryBackups.find(b => b.id === id);
  if (!backup) return res.status(404).json({ success: false, error: 'Backup not found' });

  backup.integrityChecked = true;
  backup.checksum = backup.checksum !== '—' ? backup.checksum : '3f8a7c9d5e2b144fa901c23...';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  memoryRecentActivities.unshift({
    id: `ACT-${Date.now()}`,
    dateTime: `${dateStr} ${timeStr}`,
    activity: 'Backup Verified',
    status: 'Success',
    message: `Checksum integrity verification passed for ${backup.name}. Checksum: ${backup.checksum}`
  });

  res.json({
    success: true,
    message: `Integrity check PASSED for ${backup.name}. Checksum verified.`,
    checksum: backup.checksum
  });
}

export async function deleteBackupRecord(req, res) {
  const { id } = req.params;
  const backup = memoryBackups.find(b => b.id === id);
  if (!backup) return res.status(404).json({ success: false, error: 'Backup not found' });

  memoryBackups = memoryBackups.filter(b => b.id !== id);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  memoryRecentActivities.unshift({
    id: `ACT-${Date.now()}`,
    dateTime: `${dateStr} ${timeStr}`,
    activity: 'Backup Deleted',
    status: 'Success',
    message: `Backup archive ${backup.name} deleted by Administrator per retention policy.`
  });

  res.json({ success: true, message: `Backup ${backup.name} removed successfully.` });
}

export async function getScheduledJobs(req, res) {
  res.json({ success: true, jobs: memoryScheduledJobs });
}

export async function createScheduledJob(req, res) {
  const data = req.body;
  const newJob = {
    id: `JOB-${String(memoryScheduledJobs.length + 1).padStart(3, '0')}`,
    name: data.name,
    jobType: data.jobType || 'Backup',
    module: data.module || 'Administration',
    frequency: data.frequency || 'Daily (02:00 AM)',
    lastRun: 'Never',
    nextRun: 'Tomorrow at 02:00 AM',
    lastResult: 'Idle',
    status: 'Active',
    retention: data.retention || '30 Days',
    target: data.target || 'Azure Blob Primary'
  };
  memoryScheduledJobs.push(newJob);
  res.status(201).json({ success: true, job: newJob, message: 'Scheduled job created successfully.' });
}

export async function toggleJobStatus(req, res) {
  const { id } = req.params;
  const job = memoryScheduledJobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  job.status = job.status === 'Active' ? 'Paused' : 'Active';
  res.json({ success: true, job, message: `Job ${job.name} status is now ${job.status}` });
}

export async function triggerJobRunNow(req, res) {
  const { id } = req.params;
  const job = memoryScheduledJobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  job.lastRun = 'Just now';
  job.lastResult = 'Success (Manual Run)';
  res.json({ success: true, job, message: `Job ${job.name} triggered successfully.` });
}

