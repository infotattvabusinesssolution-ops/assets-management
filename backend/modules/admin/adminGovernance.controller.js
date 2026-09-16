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
    name: 'SAP S/4HANA Finance & Fixed Assets',
    externalSystem: 'SAP S/4HANA',
    systemType: 'ERP Systems',
    direction: 'Bi-directional',
    frequency: 'Hourly',
    lastSync: 'Today 04:15 PM',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 1240,
    errorCount: 0,
    endpointUrl: 'https://sap-gateway.asset360.internal/odata/v4/AssetAccounting',
    authType: 'OAuth 2.0 Client Credentials',
    description: 'Synchronizes capitalized asset cost, depreciation postings, and purchase invoice references.'
  },
  {
    id: 'INT-002',
    name: 'Workday Employee & Custodian Sync',
    externalSystem: 'Workday HCM',
    systemType: 'HR Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: 'Today 02:00 AM',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 850,
    errorCount: 0,
    endpointUrl: 'https://wd5-impl-services1.workday.com/ccx/service/customreport2/asset360_workers',
    authType: 'OAuth 2.0 Bearer Token',
    description: 'Synchronizes employee master data, designations, business units, and department heads for asset custody.'
  },
  {
    id: 'INT-003',
    name: 'ServiceNow ITSM & CMDB Integration',
    externalSystem: 'ServiceNow',
    systemType: 'IT Service Management',
    direction: 'Bi-directional',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Warning',
    recordsProcessed: 4120,
    errorCount: 2,
    endpointUrl: 'https://asset360.service-now.com/api/now/table/cmdb_ci_hardware',
    authType: 'API Key & Mutual TLS',
    description: 'Links Asset360 hardware tags with ServiceNow Configuration Items and incident tickets.'
  },
  {
    id: 'INT-004',
    name: 'Microsoft Entra ID Directory & SSO',
    externalSystem: 'Microsoft Entra ID',
    systemType: 'Identity & Security',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: '10 mins ago',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 48,
    errorCount: 0,
    endpointUrl: 'https://graph.microsoft.com/v1.0/users',
    authType: 'Microsoft Graph Client Secret',
    description: 'Enterprise SSO, SCIM automated user provisioning, and role group synchronization.'
  },
  {
    id: 'INT-005',
    name: 'Impinj RFID Speedway Gateway',
    externalSystem: 'Impinj Speedway',
    systemType: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 14890,
    errorCount: 0,
    endpointUrl: 'mqtt://rfid-broker.asset360.internal:1883/rfid/gateways/#',
    authType: 'TLS Certificate & Token',
    description: 'High-speed fixed portal RFID tag antenna reads for real-time warehouse location tracking.'
  },
  {
    id: 'INT-006',
    name: 'Oracle Fusion Procurement',
    externalSystem: 'Oracle Cloud ERP',
    systemType: 'ERP Systems',
    direction: 'Inbound',
    frequency: 'Daily',
    lastSync: 'Yesterday 11:30 PM',
    status: 'Inactive',
    lastResult: 'Idle',
    recordsProcessed: 0,
    errorCount: 0,
    endpointUrl: 'https://fa-internal.oraclecloud.com/fscmRestApi/resources/11.13.18.05/purchaseOrders',
    authType: 'Basic Auth (Masked)',
    description: 'Automated retrieval of approved purchase orders and supplier delivery schedules.'
  },
  {
    id: 'INT-007',
    name: 'Aruba Meridian RTLS Positioning',
    externalSystem: 'Aruba Meridian',
    systemType: 'IoT & Devices',
    direction: 'Inbound',
    frequency: 'Real-time',
    lastSync: 'Just now',
    status: 'Active',
    lastResult: 'Success',
    recordsProcessed: 8450,
    errorCount: 1,
    endpointUrl: 'wss://meridian.arubanetworks.com/api/v1/tracking/stream',
    authType: 'App Token (Masked)',
    description: 'Live BLE asset positioning on indoor building floor maps with geofence breach triggers.'
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
    name: 'Work Order Assignment Notification',
    module: 'Maintenance',
    eventType: 'WorkOrderAssigned',
    subject: 'Work Order Assigned: {{WO_No}} - {{Priority}} Priority (Asset: {{Asset_Name}})',
    status: 'Active',
    lastModified: '12 Sep 2025',
    recipientsRule: 'Assigned Technician (To), Maintenance Manager (CC)',
    bodyText: 'Hello {{Recipient_Name}},\n\nYou have been assigned Work Order {{WO_No}} for asset {{Asset_Name}} at {{Location}}.\nPriority: {{Priority}}\nDue Date: {{Due_Date}}\n\nPlease review and execute at {{Work_Order_Link}}.\n\nAsset360 Automated Notification',
    bodyHtml: '<p>Hello <strong>{{Recipient_Name}}</strong>,</p><p>You have been assigned Work Order <span style="color:#6C2BD9; font-weight:bold;">{{WO_No}}</span> for asset <strong>{{Asset_Name}}</strong> at {{Location}}.</p><ul><li><strong>Priority:</strong> {{Priority}}</li><li><strong>Due Date:</strong> {{Due_Date}}</li></ul><p><a href="{{Work_Order_Link}}" style="display:inline-block; padding:8px 16px; background:#6C2BD9; color:#fff; text-decoration:none; border-radius:6px;">View Work Order</a></p><hr/><p style="font-size:11px; color:#888;">Asset360 Enterprise Asset Management System</p>'
  },
  {
    id: 'TMPL-002',
    name: 'Asset Transfer Approval Required',
    module: 'Movements',
    eventType: 'TransferApprovalRequired',
    subject: 'Action Required: Approval for Asset Transfer {{Transfer_ID}} ({{Asset_Name}})',
    status: 'Active',
    lastModified: '10 Sep 2025',
    recipientsRule: 'Department Approver / Asset Manager (To)',
    bodyText: 'Dear {{Recipient_Name}},\n\nA transfer request {{Transfer_ID}} has been initiated for asset {{Asset_No}} ({{Asset_Name}}) from {{From_Location}} to {{To_Location}} by {{Requester}}.\n\nPlease log in to review and authorize.',
    bodyHtml: '<p>Dear <strong>{{Recipient_Name}}</strong>,</p><p>An asset transfer request <strong>{{Transfer_ID}}</strong> requires your authorization:</p><ul><li><strong>Asset:</strong> {{Asset_No}} - {{Asset_Name}}</li><li><strong>From:</strong> {{From_Location}}</li><li><strong>To:</strong> {{To_Location}}</li><li><strong>Requester:</strong> {{Requester}}</li></ul><p><a href="{{Approval_Link}}" style="padding:8px 16px; background:#6C2BD9; color:#fff; text-decoration:none; border-radius:6px;">Approve or Reject Transfer</a></p>'
  },
  {
    id: 'TMPL-003',
    name: 'Asset Warranty Expiry Alert (30 Days)',
    module: 'Assets',
    eventType: 'WarrantyExpiry30Days',
    subject: 'Warranty Expiry Warning: Asset {{Asset_No}} ({{Asset_Name}}) expires on {{Due_Date}}',
    status: 'Active',
    lastModified: '08 Sep 2025',
    recipientsRule: 'Asset Custodian (To), Procurement Team (CC)',
    bodyText: 'Attention {{Recipient_Name}},\n\nThe warranty for asset {{Asset_No}} ({{Asset_Name}}) will expire in 30 days on {{Due_Date}}. Please check if extended warranty or AMC is required.',
    bodyHtml: '<p>Attention <strong>{{Recipient_Name}}</strong>,</p><p>The manufacturer warranty for asset <strong>{{Asset_No}} ({{Asset_Name}})</strong> is scheduled to expire in 30 days on <strong>{{Due_Date}}</strong>.</p><p>Supplier: {{Supplier_Name}}</p>'
  },
  {
    id: 'TMPL-004',
    name: 'Low Stock Reorder Threshold Alert',
    module: 'Inventory',
    eventType: 'LowStockAlert',
    subject: 'Inventory Alert: Part {{Part_No}} ({{Part_Name}}) below reorder level',
    status: 'Active',
    lastModified: '05 Sep 2025',
    recipientsRule: 'Inventory Controller (To), Warehouse Manager (CC)',
    bodyText: 'Alert:\n\nSpare part {{Part_No}} ({{Part_Name}}) at warehouse {{Warehouse}} has reached balance {{Current_Stock}}, below the reorder point of {{Reorder_Level}}.\n\nPlease raise procurement requisition.',
    bodyHtml: '<p style="color:#B91C1C; font-weight:bold;">Low Stock Alert</p><p>Spare part <strong>{{Part_No}} ({{Part_Name}})</strong> at warehouse <strong>{{Warehouse}}</strong> is below minimum reorder point.</p><ul><li>Current Stock: {{Current_Stock}}</li><li>Reorder Point: {{Reorder_Level}}</li></ul>'
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
  { id: 'BAK-20250916-001', name: 'Daily Automated Database Backup', type: 'Full', size: '4.82 GB', startTime: '16 Sep 2025 02:00 AM', duration: '8m 42s', status: 'Success', createdBy: 'Scheduled Daemon', integrityChecked: true },
  { id: 'BAK-20250915-001', name: 'Daily Automated Database Backup', type: 'Full', size: '4.79 GB', startTime: '15 Sep 2025 02:00 AM', duration: '8m 35s', status: 'Success', createdBy: 'Scheduled Daemon', integrityChecked: true },
  { id: 'BAK-20250914-001', name: 'Daily Automated Database Backup', type: 'Full', size: '4.75 GB', startTime: '14 Sep 2025 02:00 AM', duration: '8m 50s', status: 'Success', createdBy: 'Scheduled Daemon', integrityChecked: true },
  { id: 'BAK-20250913-002', name: 'Pre-Upgrade Manual Snapshot', type: 'Full', size: '4.74 GB', startTime: '13 Sep 2025 06:15 PM', duration: '9m 10s', status: 'Success', createdBy: 'John Doe', integrityChecked: true },
  { id: 'BAK-20250913-001', name: 'Daily Automated Database Backup', type: 'Full', size: '4.72 GB', startTime: '13 Sep 2025 02:00 AM', duration: '8m 20s', status: 'Success', createdBy: 'Scheduled Daemon', integrityChecked: true }
];

export let memoryScheduledJobs = [
  { id: 'JOB-001', name: 'Daily Database Full Backup', jobType: 'Backup', module: 'Administration', frequency: 'Daily (02:00 AM)', lastRun: '16 Sep 2025 02:00 AM', nextRun: '17 Sep 2025 02:00 AM', lastResult: 'Success', status: 'Active' },
  { id: 'JOB-002', name: 'Hourly Differential Backup', jobType: 'Backup', module: 'Administration', frequency: 'Hourly (XX:00)', lastRun: '16 Sep 2025 04:00 PM', nextRun: '16 Sep 2025 05:00 PM', lastResult: 'Success', status: 'Active' },
  { id: 'JOB-003', name: 'Preventive Maintenance Ticket Auto-Generation', jobType: 'Maintenance', module: 'Maintenance', frequency: 'Daily (01:00 AM)', lastRun: '16 Sep 2025 01:00 AM', nextRun: '17 Sep 2025 01:00 AM', lastResult: 'Success (14 tickets generated)', status: 'Active' },
  { id: 'JOB-004', name: 'Warranty & AMC Expiry Scanner', jobType: 'Compliance', module: 'Contracts', frequency: 'Daily (06:00 AM)', lastRun: '16 Sep 2025 06:00 AM', nextRun: '17 Sep 2025 06:00 AM', lastResult: 'Success (3 alerts sent)', status: 'Active' },
  { id: 'JOB-005', name: 'Outbound Notification Dispatcher Queue', jobType: 'Notifications', module: 'Administration', frequency: 'Every 5 Minutes', lastRun: '16 Sep 2025 04:35 PM', nextRun: '16 Sep 2025 04:40 PM', lastResult: 'Success (0 pending)', status: 'Active' },
  { id: 'JOB-006', name: 'Daily Executive Operations Report Summary', jobType: 'Reports', module: 'Reports & Analytics', frequency: 'Daily (07:00 AM)', lastRun: '16 Sep 2025 07:00 AM', nextRun: '17 Sep 2025 07:00 AM', lastResult: 'Success', status: 'Active' },
  { id: 'JOB-007', name: 'Auto-Discovery Subnet Scan Sweep', jobType: 'Discovery', module: 'Auto Discovery', frequency: 'Daily (03:00 AM)', lastRun: '16 Sep 2025 03:00 AM', nextRun: '17 Sep 2025 03:00 AM', lastResult: 'Success (42 devices detected)', status: 'Active' }
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
  const { systemType, category, search } = req.query;
  const filterCat = category || systemType;
  let list = [...memoryIntegrations];
  if (filterCat && filterCat !== 'All' && filterCat !== 'All Integrations') {
    list = list.filter(i => {
      if (filterCat === 'ITSM') return i.systemType === 'IT Service Management' || i.systemType === 'ITSM';
      return i.systemType.toLowerCase() === filterCat.toLowerCase();
    });
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.externalSystem.toLowerCase().includes(q));
  }
  const activeCount = memoryIntegrations.filter(i => i.status === 'Active').length;
  res.json({
    success: true,
    integrations: list,
    total: list.length,
    kpis: {
      totalConfigured: memoryIntegrations.length,
      activeInterfaces: activeCount,
      lastSuccessfulSync: 'Today at 04:45 PM',
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
  const health = {
    lastSuccessfulBackup: memoryBackups[0]?.startTime || 'Today 02:00 AM',
    totalBackups30Days: memoryBackups.length,
    successRate: '100%',
    storageUsedGB: 23.84,
    storageCapacityGB: 500,
    nextScheduledBackup: 'Tomorrow 02:00 AM'
  };
  res.json({
    success: true,
    health,
    kpis: {
      lastBackup: health.lastSuccessfulBackup,
      totalBackups30Days: 28,
      successRate: 98.5,
      storageUsedGb: health.storageUsedGB,
      storageCapacityGb: health.storageCapacityGB,
      nextScheduledBackup: health.nextScheduledBackup
    },
    backups: memoryBackups
  });
}

export async function createManualBackup(req, res) {
  const { name, type = 'Full', notes = '' } = req.body;
  const newBackup = {
    id: `BAK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(memoryBackups.length + 1).padStart(3, '0')}`,
    name: name || 'Manual Ad-Hoc Database Snapshot',
    type,
    size: '4.85 GB',
    startTime: 'Just now',
    duration: 'Processing...',
    status: 'In Progress',
    createdBy: req.user?.name || 'Administrator',
    integrityChecked: true,
    notes
  };

  memoryBackups.unshift(newBackup);

  // Mark success after 2 seconds simulation
  setTimeout(() => {
    newBackup.status = 'Success';
    newBackup.duration = '7m 45s';
  }, 2000);

  res.status(201).json({ success: true, backup: newBackup, message: 'Manual backup process initiated in background.' });
}

export async function getScheduledJobs(req, res) {
  res.json({ success: true, jobs: memoryScheduledJobs });
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
