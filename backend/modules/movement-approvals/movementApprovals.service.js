import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// Pre-seeded realistic movement approval requests matching Screenshot 28
const INITIAL_APPROVAL_REQUESTS = [
  {
    id: 'REQ-00045',
    requestNumber: 'REQ-00045',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 2 - Department Head',
    currentLevelNum: 2,
    totalLevels: 3,
    assetNo: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    assetCategory: 'IT Hardware > Laptops',
    serialNumber: 'SN-DL-88219',
    fromLocation: 'Block A > GF',
    fromLocationFull: 'Dubai HQ > Block A > Ground Floor',
    toLocation: 'Block B > 1F',
    toLocationFull: 'Dubai HQ > Block B > 1st Floor',
    site: 'Dubai HQ',
    department: 'IT Department',
    requestedBy: 'Sara Ali',
    requestedByRole: 'Senior IT Specialist',
    requestedByEmail: 'sara.ali@asset360.com',
    newCustodian: 'Ahmed Khan',
    newCustodianDept: 'IT Infrastructure',
    requestDate: '10 Sep 2026',
    requestTime: '10:24',
    effectiveDate: '10 Sep 2026',
    reason: 'Department Restructure',
    remarks: 'Transfer to new IT floor as per department move.',
    isOverdue: false,
    slaDueDate: '12 Sep 2026 18:00',
    supportingDocuments: [
      { id: 'doc-1', name: 'transfer_request_form.pdf', size: '450 KB', url: '#' },
      { id: 'doc-2', name: 'floor_plan.png', size: '1.2 MB', url: '#' }
    ],
    assets: [
      {
        id: 'ast-1',
        assetNo: 'AS-000123',
        name: 'Laptop - Dell 5440',
        category: 'IT Hardware > Laptops',
        serialNumber: 'SN-DL-88219',
        model: 'Latitude 5440',
        manufacturer: 'Dell',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block A > Ground Floor',
        currentCustodian: 'Sara Ali'
      }
    ],
    workflowStages: [
      {
        level: 1,
        title: 'Direct Supervisor',
        approverName: 'Sara Al-Mansoori',
        approverRole: 'IT Operations Lead',
        status: 'Approved',
        actionDate: '09 Sep 2026 14:30',
        comments: 'Verified and approved for departmental alignment.',
        isCurrent: false
      },
      {
        level: 2,
        title: 'Department Head',
        approverName: 'John Doe',
        approverRole: 'Head of Information Technology',
        status: 'Pending',
        actionDate: null,
        comments: null,
        isCurrent: true
      },
      {
        level: 3,
        title: 'Asset Administrator / Facilities',
        approverName: 'Facilities & Logistics Team',
        approverRole: 'Asset Administrator',
        status: 'Pending',
        actionDate: null,
        comments: null,
        isCurrent: false
      }
    ],
    history: [
      {
        id: 'h-1',
        action: 'Request Submitted',
        performedBy: 'Sara Ali',
        role: 'Requester',
        timestamp: '10 Sep 2026 10:24',
        comments: 'Submitted transfer request for workstation relocation.',
        documents: ['transfer_request_form.pdf', 'floor_plan.png']
      },
      {
        id: 'h-2',
        action: 'Level 1 Approved',
        performedBy: 'Sara Al-Mansoori',
        role: 'Direct Supervisor',
        timestamp: '09 Sep 2026 14:30',
        comments: 'Verified and approved for departmental alignment.',
        documents: []
      }
    ]
  },
  {
    id: 'REQ-00044',
    requestNumber: 'REQ-00044',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Direct Supervisor',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000127',
    assetName: 'Chair - Office',
    assetCategory: 'Furniture > Seating',
    serialNumber: 'SN-FN-33910',
    fromLocation: 'Block A > 2F',
    fromLocationFull: 'Dubai HQ > Block A > 2nd Floor',
    toLocation: 'Block C > 2F',
    toLocationFull: 'Dubai HQ > Block C > 2nd Floor',
    site: 'Dubai HQ',
    department: 'Finance',
    requestedBy: 'Omar Saleh',
    requestedByRole: 'Accountant',
    requestedByEmail: 'omar.saleh@asset360.com',
    newCustodian: 'Omar Saleh',
    newCustodianDept: 'Finance',
    requestDate: '09 Sep 2026',
    requestTime: '15:10',
    effectiveDate: '09 Sep 2026',
    reason: 'Desk Reallocation',
    remarks: 'Relocating ergonomic chair to new workstation.',
    isOverdue: false,
    slaDueDate: '11 Sep 2026 18:00',
    supportingDocuments: [
      { id: 'doc-3', name: 'internal_memo.pdf', size: '210 KB', url: '#' }
    ],
    assets: [
      {
        id: 'ast-2',
        assetNo: 'AS-000127',
        name: 'Chair - Office',
        category: 'Furniture > Seating',
        serialNumber: 'SN-FN-33910',
        model: 'Aeron Ergonomic Chair',
        manufacturer: 'Herman Miller',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block A > 2nd Floor',
        currentCustodian: 'Omar Saleh'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Direct Supervisor', approverName: 'Fatima Al-Nuaimi', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Facilities Manager', approverName: 'Khalid Hassan', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-3', action: 'Request Submitted', performedBy: 'Omar Saleh', timestamp: '09 Sep 2026 15:10', comments: 'Office chair reallocation request.' }
    ]
  },
  {
    id: 'REQ-00043',
    requestNumber: 'REQ-00043',
    requestType: 'Assignment',
    transferType: 'Initial Custody Assignment',
    status: 'Pending',
    currentStage: 'Level 1 - Asset Manager',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000125',
    assetName: 'Printer - HP',
    assetCategory: 'Office Equipment > Printers',
    serialNumber: 'SN-HP-99412',
    fromLocation: '-',
    fromLocationFull: 'Central IT Store - Warehouse',
    toLocation: 'IT Department',
    toLocationFull: 'Dubai HQ > Block A > IT Operations Room',
    site: 'Dubai HQ',
    department: 'IT Department',
    requestedBy: 'IT Team',
    requestedByRole: 'IT Helpdesk',
    requestedByEmail: 'helpdesk@asset360.com',
    newCustodian: 'IT Department Shared',
    newCustodianDept: 'IT Department',
    requestDate: '09 Sep 2026',
    requestTime: '11:45',
    effectiveDate: '09 Sep 2026',
    reason: 'Shared Team Printer',
    remarks: 'Deploying high capacity printer for development team.',
    isOverdue: false,
    slaDueDate: '11 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-3',
        assetNo: 'AS-000125',
        name: 'Printer - HP',
        category: 'Office Equipment > Printers',
        serialNumber: 'SN-HP-99412',
        model: 'LaserJet Pro M404n',
        manufacturer: 'HP',
        condition: 'Brand New',
        currentStatus: 'In Store',
        currentLocation: 'Central IT Store - Warehouse',
        currentCustodian: '-'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Asset Manager', approverName: 'John Smith', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Department Head', approverName: 'John Doe', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-4', action: 'Request Submitted', performedBy: 'IT Team', timestamp: '09 Sep 2026 11:45', comments: 'Requested new printer allocation.' }
    ]
  },
  {
    id: 'REQ-00042',
    requestNumber: 'REQ-00042',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 2 - Facilities Lead',
    currentLevelNum: 2,
    totalLevels: 2,
    assetNo: 'AS-000129',
    assetName: 'Projector - Epson',
    assetCategory: 'AV Equipment > Projectors',
    serialNumber: 'SN-EP-77410',
    fromLocation: 'Block C > 1F',
    fromLocationFull: 'Dubai HQ > Block C > Room 104',
    toLocation: 'Conference Room',
    toLocationFull: 'Dubai HQ > Executive Wing > Main Boardroom',
    site: 'Dubai HQ',
    department: 'Marketing',
    requestedBy: 'Layla Hassan',
    requestedByRole: 'Marketing Manager',
    requestedByEmail: 'layla.hassan@asset360.com',
    newCustodian: 'Facilities AV Pool',
    newCustodianDept: 'Facilities',
    requestDate: '08 Sep 2026',
    requestTime: '09:20',
    effectiveDate: '08 Sep 2026',
    reason: 'Executive Conference Setup',
    remarks: 'Relocating 4K projector to main conference room for quarterly investor meeting.',
    isOverdue: true,
    slaDueDate: '09 Sep 2026 18:00',
    supportingDocuments: [
      { id: 'doc-4', name: 'av_requirement_ticket.pdf', size: '320 KB', url: '#' }
    ],
    assets: [
      {
        id: 'ast-4',
        assetNo: 'AS-000129',
        name: 'Projector - Epson',
        category: 'AV Equipment > Projectors',
        serialNumber: 'SN-EP-77410',
        model: 'EB-L200F Full HD Laser',
        manufacturer: 'Epson',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block C > Room 104',
        currentCustodian: 'Layla Hassan'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Department Head', approverName: 'Layla Hassan', status: 'Approved', actionDate: '08 Sep 2026 09:30', isCurrent: false },
      { level: 2, title: 'Facilities Lead', approverName: 'Khalid Hassan', status: 'Pending', isCurrent: true }
    ],
    history: [
      { id: 'h-5', action: 'Request Submitted', performedBy: 'Layla Hassan', timestamp: '08 Sep 2026 09:20', comments: 'Projector move request.' }
    ]
  },
  {
    id: 'REQ-00041',
    requestNumber: 'REQ-00041',
    requestType: 'Custodian Transfer',
    transferType: 'Employee Reassignment',
    status: 'Pending',
    currentStage: 'Level 1 - Line Manager',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000132',
    assetName: 'Monitor - Samsung',
    assetCategory: 'IT Peripherals > Monitors',
    serialNumber: 'SN-SM-22910',
    fromLocation: '-',
    fromLocationFull: 'Dubai HQ > Desk 42',
    toLocation: '-',
    toLocationFull: 'Dubai HQ > Desk 49',
    site: 'Dubai HQ',
    department: 'Sales',
    requestedBy: 'Rashid Mohammed',
    requestedByRole: 'Sales Executive',
    requestedByEmail: 'rashid.m@asset360.com',
    newCustodian: 'Tariq Al-Amiri',
    newCustodianDept: 'Sales',
    requestDate: '08 Sep 2026',
    requestTime: '16:00',
    effectiveDate: '08 Sep 2026',
    reason: 'Staff Onboarding',
    remarks: 'Handing over secondary display to new team recruit.',
    isOverdue: true,
    slaDueDate: '09 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-5',
        assetNo: 'AS-000132',
        name: 'Monitor - Samsung',
        category: 'IT Peripherals > Monitors',
        serialNumber: 'SN-SM-22910',
        model: 'ViewFinity S8 27"',
        manufacturer: 'Samsung',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Desk 42',
        currentCustodian: 'Rashid Mohammed'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Line Manager', approverName: 'Salim Al-Bader', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Asset Admin', approverName: 'John Smith', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-6', action: 'Request Submitted', performedBy: 'Rashid Mohammed', timestamp: '08 Sep 2026 16:00', comments: 'Custodian handover.' }
    ]
  },
  {
    id: 'REQ-00040',
    requestNumber: 'REQ-00040',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Network Team Lead',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000126',
    assetName: 'Access Point - Cisco',
    assetCategory: 'Networking > Access Points',
    serialNumber: 'SN-CS-AP991',
    fromLocation: 'Block B > 1F',
    fromLocationFull: 'Dubai HQ > Block B > 1st Floor East',
    toLocation: 'Block B > 3F',
    toLocationFull: 'Dubai HQ > Block B > 3rd Floor Executive Wing',
    site: 'Dubai HQ',
    department: 'IT Infrastructure',
    requestedBy: 'Fatima Noor',
    requestedByRole: 'Network Engineer',
    requestedByEmail: 'fatima.noor@asset360.com',
    newCustodian: 'IT Infrastructure',
    newCustodianDept: 'IT Infrastructure',
    requestDate: '07 Sep 2026',
    requestTime: '13:15',
    effectiveDate: '07 Sep 2026',
    reason: 'Wi-Fi Coverage Expansion',
    remarks: 'Upgrading RF coverage in executive boardroom area.',
    isOverdue: false,
    slaDueDate: '10 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-6',
        assetNo: 'AS-000126',
        name: 'Access Point - Cisco',
        category: 'Networking > Access Points',
        serialNumber: 'SN-CS-AP991',
        model: 'Catalyst 9120AXI',
        manufacturer: 'Cisco Systems',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block B > 1st Floor East',
        currentCustodian: 'IT Infrastructure'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Network Team Lead', approverName: 'Ali Raza', status: 'Pending', isCurrent: true },
      { level: 2, title: 'IT Director', approverName: 'John Doe', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-7', action: 'Request Submitted', performedBy: 'Fatima Noor', timestamp: '07 Sep 2026 13:15', comments: 'RF reallocation.' }
    ]
  },
  {
    id: 'REQ-00039',
    requestNumber: 'REQ-00039',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Facilities Supervisor',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000128',
    assetName: 'Meeting Table',
    assetCategory: 'Furniture > Tables',
    serialNumber: 'SN-FN-TBL881',
    fromLocation: 'Block A > 2F',
    fromLocationFull: 'Dubai HQ > Block A > Room 208',
    toLocation: 'Block A > 3F',
    toLocationFull: 'Dubai HQ > Block A > Room 310',
    site: 'Dubai HQ',
    department: 'Operations',
    requestedBy: 'Ahmed Khan',
    requestedByRole: 'Operations Analyst',
    requestedByEmail: 'ahmed.khan@asset360.com',
    newCustodian: 'Operations Team',
    newCustodianDept: 'Operations',
    requestDate: '06 Sep 2026',
    requestTime: '10:00',
    effectiveDate: '06 Sep 2026',
    reason: 'Meeting Room Expansion',
    remarks: 'Relocating 8-seater conference table to newly partitioned discussion space.',
    isOverdue: false,
    slaDueDate: '10 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-7',
        assetNo: 'AS-000128',
        name: 'Meeting Table',
        category: 'Furniture > Tables',
        serialNumber: 'SN-FN-TBL881',
        model: 'Executive 8-Person Conference Table',
        manufacturer: 'Steelcase',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block A > Room 208',
        currentCustodian: 'Operations Team'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Facilities Supervisor', approverName: 'Khalid Hassan', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Operations Director', approverName: 'Sultan Al-Mehairi', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-8', action: 'Request Submitted', performedBy: 'Ahmed Khan', timestamp: '06 Sep 2026 10:00', comments: 'Table transfer request.' }
    ]
  },
  {
    id: 'REQ-00038',
    requestNumber: 'REQ-00038',
    requestType: 'Assignment',
    transferType: 'Safety Equipment Deployment',
    status: 'Pending',
    currentStage: 'Level 1 - HSE Compliance Lead',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher',
    assetCategory: 'Safety & Security > Fire Protection',
    serialNumber: 'SN-SF-FE0092',
    fromLocation: '-',
    fromLocationFull: 'Safety Central Store',
    toLocation: 'Facilities Team',
    toLocationFull: 'Dubai HQ > Block C > Mechanical Room',
    site: 'Dubai HQ',
    department: 'Facilities',
    requestedBy: 'Mohammed Rashid',
    requestedByRole: 'HSE Officer',
    requestedByEmail: 'm.rashid@asset360.com',
    newCustodian: 'Facilities Maintenance',
    newCustodianDept: 'Facilities',
    requestDate: '06 Sep 2026',
    requestTime: '14:20',
    effectiveDate: '06 Sep 2026',
    reason: 'Annual Safety Standard Compliance',
    remarks: 'Routine commissioning of replacement CO2 unit for mechanical room.',
    isOverdue: false,
    slaDueDate: '10 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-8',
        assetNo: 'AS-000130',
        name: 'Fire Extinguisher',
        category: 'Safety & Security > Fire Protection',
        serialNumber: 'SN-SF-FE0092',
        model: 'CO2 5kg Industrial Extinguisher',
        manufacturer: 'NAFFCO',
        condition: 'Brand New',
        currentStatus: 'In Store',
        currentLocation: 'Safety Central Store',
        currentCustodian: '-'
      }
    ],
    workflowStages: [
      { level: 1, title: 'HSE Compliance Lead', approverName: 'Eng. Mansoor', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Facilities Director', approverName: 'Khalid Hassan', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-9', action: 'Request Submitted', performedBy: 'Mohammed Rashid', timestamp: '06 Sep 2026 14:20', comments: 'Safety unit assignment.' }
    ]
  },
  {
    id: 'REQ-00037',
    requestNumber: 'REQ-00037',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Network Operations Lead',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco',
    assetCategory: 'Networking > Switches',
    serialNumber: 'SN-CS-SW7741',
    fromLocation: 'Server Room',
    fromLocationFull: 'Dubai HQ > Data Center > Rack 03',
    toLocation: 'IT-201',
    toLocationFull: 'Dubai HQ > Block B > Wiring Closet IT-201',
    site: 'Dubai HQ',
    department: 'IT Infrastructure',
    requestedBy: 'Sara Ali',
    requestedByRole: 'Senior IT Specialist',
    requestedByEmail: 'sara.ali@asset360.com',
    newCustodian: 'Network Team',
    newCustodianDept: 'IT Infrastructure',
    requestDate: '05 Sep 2026',
    requestTime: '08:45',
    effectiveDate: '05 Sep 2026',
    reason: 'Edge Switch Replacement',
    remarks: 'Deploying managed 48-port switch to replace failed edge node.',
    isOverdue: true,
    slaDueDate: '07 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-9',
        assetNo: 'AS-000131',
        name: 'Switch - Cisco',
        category: 'Networking > Switches',
        serialNumber: 'SN-CS-SW7741',
        model: 'Catalyst 9300-48P PoE+',
        manufacturer: 'Cisco Systems',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Data Center > Rack 03',
        currentCustodian: 'Network Team'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Network Operations Lead', approverName: 'Ali Raza', status: 'Pending', isCurrent: true },
      { level: 2, title: 'IT Director', approverName: 'John Doe', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-10', action: 'Request Submitted', performedBy: 'Sara Ali', timestamp: '05 Sep 2026 08:45', comments: 'Switch transfer.' }
    ]
  },
  {
    id: 'REQ-00036',
    requestNumber: 'REQ-00036',
    requestType: 'Transfer',
    transferType: 'Location Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Department Head',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000124',
    assetName: 'Monitor - Samsung',
    assetCategory: 'IT Peripherals > Monitors',
    serialNumber: 'SN-SM-88492',
    fromLocation: 'Block A > GF',
    fromLocationFull: 'Dubai HQ > Block A > Ground Floor',
    toLocation: 'Block A > 1F',
    toLocationFull: 'Dubai HQ > Block A > 1st Floor Desk 12',
    site: 'Dubai HQ',
    department: 'Finance',
    requestedBy: 'Omar Saleh',
    requestedByRole: 'Accountant',
    requestedByEmail: 'omar.saleh@asset360.com',
    newCustodian: 'Omar Saleh',
    newCustodianDept: 'Finance',
    requestDate: '05 Sep 2026',
    requestTime: '11:30',
    effectiveDate: '05 Sep 2026',
    reason: 'Desk Reassignment',
    remarks: 'Relocating dual screen setup to new floor assignment.',
    isOverdue: false,
    slaDueDate: '08 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-10',
        assetNo: 'AS-000124',
        name: 'Monitor - Samsung',
        category: 'IT Peripherals > Monitors',
        serialNumber: 'SN-SM-88492',
        model: 'UltraSharp 27" QHD',
        manufacturer: 'Samsung',
        condition: 'Good',
        currentStatus: 'In Service',
        currentLocation: 'Dubai HQ > Block A > Ground Floor',
        currentCustodian: 'Omar Saleh'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Department Head', approverName: 'Fatima Al-Nuaimi', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Asset Admin', approverName: 'John Smith', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-11', action: 'Request Submitted', performedBy: 'Omar Saleh', timestamp: '05 Sep 2026 11:30', comments: 'Desk move.' }
    ]
  },
  {
    id: 'REQ-00035',
    requestNumber: 'REQ-00035',
    requestType: 'Transfer',
    transferType: 'Inter-Site Transfer',
    status: 'Pending',
    currentStage: 'Level 1 - Warehouse Manager',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000133',
    assetName: 'Barcode Scanner - Zebra',
    assetCategory: 'Handhelds > Scanners',
    serialNumber: 'SN-ZB-99102',
    fromLocation: 'Warehouse',
    fromLocationFull: 'Dubai Central Warehouse > Dock 1',
    toLocation: 'Retail Store',
    toLocationFull: 'Downtown Retail Outlet > POS Register 02',
    site: 'Dubai Central Warehouse',
    department: 'Supply Chain',
    requestedBy: 'John Smith',
    requestedByRole: 'Warehouse Lead',
    requestedByEmail: 'john.smith@asset360.com',
    newCustodian: 'Downtown Store Manager',
    newCustodianDept: 'Retail Operations',
    requestDate: '04 Sep 2026',
    requestTime: '16:40',
    effectiveDate: '04 Sep 2026',
    reason: 'Stock Audit Equipment Dispatch',
    remarks: 'Temporary loan of rugged scanner for monthly stock count.',
    isOverdue: false,
    slaDueDate: '08 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-11',
        assetNo: 'AS-000133',
        name: 'Barcode Scanner - Zebra',
        category: 'Handhelds > Scanners',
        serialNumber: 'SN-ZB-99102',
        model: 'TC52 Rugged Mobile Computer',
        manufacturer: 'Zebra Technologies',
        condition: 'Good',
        currentStatus: 'In Store',
        currentLocation: 'Dubai Central Warehouse > Dock 1',
        currentCustodian: 'John Smith'
      }
    ],
    workflowStages: [
      { level: 1, title: 'Warehouse Manager', approverName: 'John Smith', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Supply Chain Director', approverName: 'Sultan Al-Mehairi', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-12', action: 'Request Submitted', performedBy: 'John Smith', timestamp: '04 Sep 2026 16:40', comments: 'Store scanner dispatch.' }
    ]
  },
  {
    id: 'REQ-00034',
    requestNumber: 'REQ-00034',
    requestType: 'Assignment',
    transferType: 'Executive Assignment',
    status: 'Pending',
    currentStage: 'Level 1 - IT Director',
    currentLevelNum: 1,
    totalLevels: 2,
    assetNo: 'AS-000134',
    assetName: 'iPhone 15 Pro',
    assetCategory: 'Mobile Devices > Smartphones',
    serialNumber: 'SN-AP-IP15P99',
    fromLocation: '-',
    fromLocationFull: 'Secure IT Vault',
    toLocation: 'Sara Ali',
    toLocationFull: 'Executive Wing > Office 302',
    site: 'Dubai HQ',
    department: 'Management',
    requestedBy: 'Admin User',
    requestedByRole: 'Executive Assistant',
    requestedByEmail: 'admin@asset360.com',
    newCustodian: 'Sara Ali',
    newCustodianDept: 'Management',
    requestDate: '03 Sep 2026',
    requestTime: '09:00',
    effectiveDate: '03 Sep 2026',
    reason: 'Executive Mobile Allocation',
    remarks: 'Authorized executive mobile device assignment.',
    isOverdue: false,
    slaDueDate: '07 Sep 2026 18:00',
    supportingDocuments: [],
    assets: [
      {
        id: 'ast-12',
        assetNo: 'AS-000134',
        name: 'iPhone 15 Pro',
        category: 'Mobile Devices > Smartphones',
        serialNumber: 'SN-AP-IP15P99',
        model: 'iPhone 15 Pro 256GB Titanium',
        manufacturer: 'Apple',
        condition: 'Brand New',
        currentStatus: 'In Store',
        currentLocation: 'Secure IT Vault',
        currentCustodian: '-'
      }
    ],
    workflowStages: [
      { level: 1, title: 'IT Director', approverName: 'John Doe', status: 'Pending', isCurrent: true },
      { level: 2, title: 'Finance Controller', approverName: 'Rashid Finance', status: 'Pending', isCurrent: false }
    ],
    history: [
      { id: 'h-13', action: 'Request Submitted', performedBy: 'Admin User', timestamp: '03 Sep 2026 09:00', comments: 'Executive phone assignment.' }
    ]
  }
];

// Seed 28 Approved (This Month) records
const APPROVED_HISTORY = Array.from({ length: 28 }).map((_, idx) => ({
  id: `REQ-APP-${String(idx + 1).padStart(3, '0')}`,
  requestNumber: `REQ-APP-${String(idx + 1).padStart(3, '0')}`,
  requestType: idx % 2 === 0 ? 'Transfer' : 'Assignment',
  transferType: 'Standard Movement',
  status: 'Approved',
  currentStage: 'Completed',
  currentLevelNum: 2,
  totalLevels: 2,
  assetNo: `AS-HIST-${String(idx + 100)}`,
  assetName: `Approved Asset ${idx + 1}`,
  assetCategory: 'IT Hardware',
  serialNumber: `SN-APP-${idx + 1000}`,
  fromLocation: 'Block A',
  toLocation: 'Block B',
  site: 'Dubai HQ',
  department: 'IT Department',
  requestedBy: 'Staff Member',
  requestDate: '02 Sep 2026',
  requestTime: '10:00',
  isOverdue: false
}));

// Seed 4 Rejected (This Month) records
const REJECTED_HISTORY = Array.from({ length: 4 }).map((_, idx) => ({
  id: `REQ-REJ-${String(idx + 1).padStart(3, '0')}`,
  requestNumber: `REQ-REJ-${String(idx + 1).padStart(3, '0')}`,
  requestType: 'Transfer',
  transferType: 'Location Transfer',
  status: 'Rejected',
  currentStage: 'Terminated',
  currentLevelNum: 1,
  totalLevels: 2,
  assetNo: `AS-REJ-${String(idx + 200)}`,
  assetName: `Rejected Request ${idx + 1}`,
  assetCategory: 'Furniture',
  serialNumber: `SN-REJ-${idx + 2000}`,
  fromLocation: 'Block C',
  toLocation: 'Block D',
  site: 'Dubai HQ',
  department: 'Facilities',
  requestedBy: 'Staff Member',
  requestDate: '01 Sep 2026',
  requestTime: '11:00',
  isOverdue: false,
  rejectionReason: 'Not aligned with floor space allocation policy.'
}));

let movementApprovalsStore = [
  ...INITIAL_APPROVAL_REQUESTS,
  ...APPROVED_HISTORY,
  ...REJECTED_HISTORY
];

export class MovementApprovalsService {
  /**
   * Get KPI Summary counts
   * Calibrated exact metrics:
   * - 12 Pending Approvals
   * - 28 Approved (This Month)
   * - 4 Rejected (This Month)
   * - 3 Overdue Requests
   */
  static async getKpis() {
    const pending = movementApprovalsStore.filter(r => r.status === 'Pending').length;
    const approved = movementApprovalsStore.filter(r => r.status === 'Approved').length;
    const rejected = movementApprovalsStore.filter(r => r.status === 'Rejected').length;
    const overdue = movementApprovalsStore.filter(r => r.status === 'Pending' && r.isOverdue).length;

    return {
      pendingApprovals: pending,
      approvedThisMonth: approved,
      rejectedThisMonth: rejected,
      overdueRequests: overdue
    };
  }

  /**
   * Query approval requests with filtering, searching, and pagination
   */
  static async getApprovalRequests(query = {}) {
    const {
      requestType = 'All',
      status = 'Pending',
      site = 'All Sites',
      department = 'All Departments',
      requestedBy = 'All Users',
      dateFrom = '',
      dateTo = '',
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'requestDate',
      sortDir = 'desc'
    } = query;

    let filtered = [...movementApprovalsStore];

    // Status filter
    if (status && status !== 'All' && status !== 'ALL') {
      filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    // Request Type filter
    if (requestType && requestType !== 'All' && requestType !== 'ALL') {
      filtered = filtered.filter(r => r.requestType.toLowerCase() === requestType.toLowerCase());
    }

    // Site filter
    if (site && site !== 'All Sites' && site !== 'ALL') {
      filtered = filtered.filter(r => r.site?.toLowerCase().includes(site.toLowerCase()));
    }

    // Department filter
    if (department && department !== 'All Departments' && department !== 'ALL') {
      filtered = filtered.filter(r => r.department?.toLowerCase() === department.toLowerCase());
    }

    // Requested By filter
    if (requestedBy && requestedBy !== 'All Users' && requestedBy !== 'ALL') {
      filtered = filtered.filter(r => r.requestedBy?.toLowerCase().includes(requestedBy.toLowerCase()));
    }

    // Search input (Request ID, Asset No, Asset Name, Requested By)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r =>
        r.requestNumber?.toLowerCase().includes(q) ||
        r.assetNo?.toLowerCase().includes(q) ||
        r.assetName?.toLowerCase().includes(q) ||
        r.requestedBy?.toLowerCase().includes(q) ||
        r.fromLocation?.toLowerCase().includes(q) ||
        r.toLocation?.toLowerCase().includes(q)
      );
    }

    const totalRecords = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return {
      requests: paginated,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        startIndex: startIndex + 1,
        endIndex: Math.min(startIndex + limitNum, totalRecords)
      }
    };
  }

  /**
   * Get single approval request details by ID
   */
  static async getApprovalRequestById(id) {
    const req = movementApprovalsStore.find(
      r => r.id === id || r.requestNumber === id
    );
    if (!req) return null;
    return req;
  }

  /**
   * Process Approval Decision (Approve, Reject, Request Changes)
   * Enforces:
   * 1. Concurrency Guard: must be in Pending state
   * 2. Mandatory comments on Reject & Request Changes
   * 3. Workflow Progression: intermediate level vs final execution
   * 4. Complete Audit Trail & Separation from Asset Master
   */
  static async processDecision({
    requestId,
    decision,
    comments = '',
    attachments = [],
    notifyRequester = true,
    notifyNextApprover = true,
    additionalRecipients = [],
    user
  }) {
    const req = movementApprovalsStore.find(
      r => r.id === requestId || r.requestNumber === requestId
    );

    if (!req) {
      const err = new Error('Movement approval request not found');
      err.statusCode = 404;
      throw err;
    }

    // 1. Concurrency & duplicate decision protection
    if (req.status !== 'Pending') {
      const err = new Error(
        `Request ${req.requestNumber} is already ${req.status} and cannot be processed again.`
      );
      err.statusCode = 400;
      throw err;
    }

    const approverName = user?.fullName || user?.username || 'John Doe (System Administrator)';
    const approverRole = user?.role?.name || 'Department Head';
    const timestamp = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // 2. Validate mandatory comments on Reject and Request Changes
    const normalizedDecision = decision.toUpperCase();
    if (['REJECT', 'REQUEST_CHANGES', 'SEND_BACK'].includes(normalizedDecision)) {
      if (!comments || !comments.trim()) {
        const err = new Error(
          `Comments are mandatory when rejecting or requesting changes on a request.`
        );
        err.statusCode = 422;
        throw err;
      }
    }

    let decisionResult = {};

    // 3. Process according to decision type
    if (normalizedDecision === 'APPROVE') {
      const currentLevel = req.workflowStages.find(s => s.isCurrent) || req.workflowStages[req.currentLevelNum - 1];
      if (currentLevel) {
        currentLevel.status = 'Approved';
        currentLevel.actionDate = `${formattedDate} ${formattedTime}`;
        currentLevel.comments = comments || 'Approved without additional remarks.';
        currentLevel.isCurrent = false;
      }

      // Check if there is a next level
      const nextLevelIndex = req.currentLevelNum; // 0-indexed next
      if (nextLevelIndex < req.workflowStages.length) {
        // Proceed to next level
        req.currentLevelNum += 1;
        const nextStage = req.workflowStages[nextLevelIndex];
        nextStage.isCurrent = true;
        nextStage.status = 'Pending';
        req.currentStage = `Level ${req.currentLevelNum} - ${nextStage.title}`;
        req.status = 'Pending';

        decisionResult = {
          status: 'Pending',
          stage: req.currentStage,
          isFinal: false,
          message: `Approved at Level ${req.currentLevelNum - 1}. Request advanced to ${nextStage.title}.`
        };
      } else {
        // Final approval reached!
        req.status = 'Approved';
        req.currentStage = 'Approved - Ready for Dispatch / Execution';
        req.executionStage = 'DISPATCH_READY';
        req.approvalDate = `${formattedDate} ${formattedTime}`;

        // Note: As required by the specification:
        // "Most importantly, an approval action should not directly modify the Asset Master
        // unless the configured workflow determines that the movement has reached its effective completion stage."
        // We preserve the Asset Master until physical Dispatch/Receipt confirmation.

        decisionResult = {
          status: 'Approved',
          stage: req.currentStage,
          isFinal: true,
          message: `Final approval granted. Movement progressed to execution stage (${req.currentStage}).`
        };
      }
    } else if (normalizedDecision === 'REJECT') {
      // Rejection terminates the workflow without altering Asset Master
      req.status = 'Rejected';
      req.currentStage = 'Terminated (Rejected)';
      req.rejectionReason = comments;
      req.rejectedBy = approverName;
      req.rejectionDate = `${formattedDate} ${formattedTime}`;

      const currentLevel = req.workflowStages.find(s => s.isCurrent);
      if (currentLevel) {
        currentLevel.status = 'Rejected';
        currentLevel.actionDate = `${formattedDate} ${formattedTime}`;
        currentLevel.comments = comments;
        currentLevel.isCurrent = false;
      }

      decisionResult = {
        status: 'Rejected',
        stage: req.currentStage,
        message: 'Request rejected. Approval workflow terminated; Asset Master untouched.'
      };
    } else if (normalizedDecision === 'REQUEST_CHANGES' || normalizedDecision === 'SEND_BACK') {
      // Return to requester for correction while preserving request & history
      req.status = 'Changes Requested';
      req.currentStage = 'Returned to Requester for Changes';
      req.changeRequestNotes = comments;
      req.returnedBy = approverName;

      const currentLevel = req.workflowStages.find(s => s.isCurrent);
      if (currentLevel) {
        currentLevel.status = 'Changes Requested';
        currentLevel.actionDate = `${formattedDate} ${formattedTime}`;
        currentLevel.comments = comments;
      }

      decisionResult = {
        status: 'Changes Requested',
        stage: req.currentStage,
        message: 'Request returned to requester for clarification and updates.'
      };
    } else {
      const err = new Error(`Unsupported approval decision '${decision}'.`);
      err.statusCode = 400;
      throw err;
    }

    // 4. Attach optional uploaded documents
    if (Array.isArray(attachments) && attachments.length > 0) {
      if (!req.supportingDocuments) req.supportingDocuments = [];
      attachments.forEach((att, idx) => {
        req.supportingDocuments.push({
          id: `att-${Date.now()}-${idx}`,
          name: att.name || `attachment_${idx + 1}.pdf`,
          size: att.size || '500 KB',
          url: att.url || '#'
        });
      });
    }

    // 5. Append detailed chronological audit trail
    const historyEntry = {
      id: `h-${Date.now()}`,
      action: `${normalizedDecision === 'APPROVE' ? 'Approved' : normalizedDecision === 'REJECT' ? 'Rejected' : 'Changes Requested'} by ${approverName}`,
      performedBy: approverName,
      role: approverRole,
      timestamp: `${formattedDate} ${formattedTime}`,
      comments: comments || 'No comments provided',
      documents: attachments.map(a => a.name || 'document'),
      decision: normalizedDecision
    };

    if (!req.history) req.history = [];
    req.history.unshift(historyEntry);

    // 6. Record notifications dispatched
    const notificationSummary = {
      requesterNotified: !!notifyRequester,
      nextApproverNotified: !!notifyNextApprover,
      additionalRecipientsNotified: additionalRecipients
    };

    return {
      success: true,
      request: req,
      decisionResult,
      notifications: notificationSummary
    };
  }

  /**
   * Bulk Process Decisions
   */
  static async bulkProcessDecisions({ requestIds = [], decision, comments = '', user }) {
    const results = [];
    for (const id of requestIds) {
      try {
        const res = await this.processDecision({
          requestId: id,
          decision,
          comments,
          user
        });
        results.push({ id, success: true, status: res.request.status });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }
    return {
      total: requestIds.length,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Export Movement Approvals Dataset
   */
  static async exportApprovals({ format = 'xlsx', status = 'All' }) {
    let dataset = [...movementApprovalsStore];
    if (status && status !== 'All') {
      dataset = dataset.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    return {
      fileName: `Movement_Approvals_${new Date().toISOString().slice(0, 10)}.${format}`,
      format,
      totalRecords: dataset.length,
      records: dataset.map(r => ({
        requestNumber: r.requestNumber,
        requestType: r.requestType,
        assetNo: r.assetNo,
        assetName: r.assetName,
        fromLocation: r.fromLocation,
        toLocation: r.toLocation,
        requestedBy: r.requestedBy,
        requestDate: r.requestDate,
        status: r.status,
        currentStage: r.currentStage
      }))
    };
  }
}

export default MovementApprovalsService;
