import prisma from '../../config/prisma.js';

// Pre-seeded campaign metadata matching Screenshot 28
const CAMPAIGN_AUD_2026_0008 = {
  id: 'AUD-2026-0008',
  auditId: 'AUD-2026-0008',
  campaignNumber: 'AUD-2026-0008',
  auditName: 'HQ Annual IT Asset Audit 2026',
  title: 'HQ Annual IT Asset Audit 2026',
  auditType: 'Physical Verification',
  mode: 'FULL_CENSUS',
  location: 'Dubai HQ - Block B',
  site: 'Dubai HQ',
  building: 'Block B',
  startDate: '2026-09-01',
  endDate: '2026-09-15',
  period: '01 Sep 2026 - 15 Sep 2026',
  plannedStartDate: '01 Sep 2026',
  plannedEndDate: '15 Sep 2026',
  status: 'In Progress',
  statusCode: 'IN_PROGRESS',
  progress: 65,
  totalAssets: 600,
  totalExpected: 600,
  totalVerified: 390,
  totalPending: 180,
  totalNotFound: 12,
  totalWrongLocation: 10,
  totalWrongCustodian: 5,
  totalUnregistered: 2,
  totalDamaged: 1,
  totalExceptions: 30,
  exceptionsCount: 30,
  notFoundCount: 12,
  leadAuditor: 'John Doe',
  assignedTeam: 'Internal Audit & IT Compliance'
};

// Seeded 10 rows matching Screenshot 28 exactly
const SEEDED_ASSETS = [
  {
    id: 'exp-123',
    assetNo: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    assetType: 'IT Equipment',
    category: 'Laptops',
    model: 'Dell Latitude 5440',
    serialNumber: '75K3D23',
    tagEpc: 'E28011606000002053A1B4B9',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 10:24',
    verifiedBy: 'John Doe',
    department: 'IT',
    remarks: 'Verified in user workstation, tag intact',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-124',
    assetNo: 'AS-000124',
    assetName: 'Monitor - Samsung',
    assetType: 'IT Equipment',
    category: 'Laptops', // In Screenshot 28 Asset Details panel it displays "Laptop - Dell Latitude 5440" / Laptops
    model: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Omar Saleh',
    condition: 'Good',
    verificationStatus: 'Moved',
    lastVerified: '10 Sep 2026 11:05',
    verifiedBy: 'John Doe',
    department: 'IT',
    remarks: 'Found in 2nd floor desk assigned to Omar Saleh without transfer record',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-125',
    assetNo: 'AS-000125',
    assetName: 'Printer - HP',
    assetType: 'IT Equipment',
    category: 'Printers',
    model: 'HP LaserJet Enterprise M507',
    serialNumber: 'CNB1L78912',
    tagEpc: 'E28011606000002053A1B4C1',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Layla Hassan',
    verifiedCustodian: 'Layla Hassan',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 09:50',
    verifiedBy: 'John Doe',
    department: 'Finance',
    remarks: 'Physical printer operational and barcode scanned',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-126',
    assetNo: 'AS-000126',
    assetName: 'Chair - Office',
    assetType: 'Furniture',
    category: 'Chairs',
    model: 'Herman Miller Aeron',
    serialNumber: 'HM-991204',
    tagEpc: 'E28011606000002053A1B4C2',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: '-',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: '-',
    condition: 'Unknown',
    verificationStatus: 'Not Found',
    lastVerified: '-',
    verifiedBy: null,
    department: 'Human Resources',
    remarks: 'Desk empty during room scan; user claims chair was sent for repairs',
    thumbnail: '/laptop.png',
    verified: false
  },
  {
    id: 'exp-127',
    assetNo: 'AS-000127',
    assetName: 'Meeting Table',
    assetType: 'Furniture',
    category: 'Conference Furniture',
    model: 'Steelcase Media:scape 8-Person',
    serialNumber: 'SC-441209',
    tagEpc: 'E28011606000002053A1B4C3',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block C > GF > CONF-01',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: 'Omar Saleh',
    condition: 'Good',
    verificationStatus: 'Wrong Location',
    lastVerified: '10 Sep 2026 09:30',
    verifiedBy: 'John Doe',
    department: 'Administration',
    remarks: 'Relocated to ground floor conference room without movement ticket',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-128',
    assetNo: 'AS-000128',
    assetName: 'Projector - Epson',
    assetType: 'IT Equipment',
    category: 'AV Equipment',
    model: 'Epson EB-2250U Full HD',
    serialNumber: 'EP-559102',
    tagEpc: 'E28011606000002053A1B4C4',
    systemLocation: 'Block C > 1F > CONF-01',
    verifiedLocation: 'Block C > 1F > CONF-01',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 08:45',
    verifiedBy: 'John Doe',
    department: 'Facilities',
    remarks: 'Ceiling mount secure, test projection verified',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-129',
    assetNo: 'AS-000129',
    assetName: 'Access Point - Cisco',
    assetType: 'Network Equipment',
    category: 'Wireless AP',
    model: 'Cisco Catalyst 9120AX',
    serialNumber: 'FOC24190AB',
    tagEpc: 'E28011606000002053A1B4C5',
    systemLocation: 'Block B > 3F > IT-301',
    verifiedLocation: 'Block B > 3F > IT-301',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 11:15',
    verifiedBy: 'John Doe',
    department: 'Network Operations',
    remarks: 'RFID handheld picked up EPC from ceiling bracket',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-130',
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher',
    assetType: 'Safety Equipment',
    category: 'Safety',
    model: 'NAFFCO CO2 5KG Portable',
    serialNumber: 'NF-661201',
    tagEpc: 'E28011606000002053A1B4C6',
    systemLocation: 'Block A > GF > Lobby',
    verifiedLocation: 'Block A > GF > Lobby',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    condition: 'Damaged',
    verificationStatus: 'Damaged',
    lastVerified: '10 Sep 2026 10:05',
    verifiedBy: 'John Doe',
    department: 'HSE',
    remarks: 'Pressure gauge needle in red zone; safety seal broken',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-131',
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco',
    assetType: 'Network Equipment',
    category: 'Switches',
    model: 'Cisco Catalyst 2960-X 48 Port',
    serialNumber: 'FCW2149L01',
    tagEpc: 'E28011606000002053A1B4C7',
    systemLocation: 'Block C > 2F > IT-201',
    verifiedLocation: 'Block C > 2F > IT-201',
    systemCustodian: '-',
    verifiedCustodian: '-',
    condition: 'Good',
    verificationStatus: 'Unregistered',
    lastVerified: '10 Sep 2026 12:20',
    verifiedBy: 'John Doe',
    department: 'Network Operations',
    remarks: 'Active un-tagged switch mounted in server rack, not in campaign snapshot',
    thumbnail: '/laptop.png',
    verified: true
  },
  {
    id: 'exp-132',
    assetNo: 'AS-000132',
    assetName: 'iPad - Apple',
    assetType: 'IT Equipment',
    category: 'Tablets',
    model: 'Apple iPad Pro 12.9" 256GB',
    serialNumber: 'DMPZK819L',
    tagEpc: 'E28011606000002053A1B4C8',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    condition: 'Good',
    verificationStatus: 'Verified',
    lastVerified: '10 Sep 2026 08:10',
    verifiedBy: 'John Doe',
    department: 'Executive Office',
    remarks: 'In custody of Sara Ali, serial and barcode verified',
    thumbnail: '/laptop.png',
    verified: true
  }
];

// Additional synthetic assets to make the list 600 items for realistic pagination & searching
function generateCampaignAssets() {
  const assets = [...SEEDED_ASSETS];
  const types = ['IT Equipment', 'Furniture', 'Network Equipment', 'Safety Equipment', 'Office Appliance'];
  const categories = ['Laptops', 'Monitors', 'Desktops', 'Workstations', 'Chairs', 'Tables', 'Storage Cabinets', 'Switches', 'Routers', 'Access Points', 'Printers'];
  const locations = [
    'Block B > 1F > IT-101',
    'Block B > 2F > IT-201',
    'Block B > 3F > IT-301',
    'Block C > 1F > CONF-01',
    'Block C > 2F > IT-201',
    'Block A > GF > Lobby',
    'Block A > 1F > HR-102',
    'Block B > GF > DataCenter-01'
  ];
  const custodians = ['Sara Ali', 'Omar Saleh', 'Layla Hassan', 'Ahmed Khan', 'Farhan Zaidi', 'Noor Al-Hadi', 'Fatima Noor', 'Rashid Al-Maktoum'];
  const departments = ['IT', 'Finance', 'Human Resources', 'Administration', 'Facilities', 'Network Operations', 'HSE', 'Executive Office'];

  for (let i = 133; i <= 600; i++) {
    const numStr = String(i).padStart(6, '0');
    const type = types[i % types.length];
    const cat = categories[i % categories.length];
    const loc = locations[i % locations.length];
    const cust = custodians[i % custodians.length];
    const dept = departments[i % departments.length];

    let status = 'Pending';
    let verifiedLoc = '-';
    let verifiedCust = '-';
    let lastVer = '-';
    let verified = false;

    // Distribute remaining 380 verified assets out of 600
    if (i <= 400) {
      status = 'Verified';
      verifiedLoc = loc;
      verifiedCust = cust;
      lastVer = `09 Sep 2026 ${String(8 + (i % 9)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`;
      verified = true;
    } else if (i === 401 || i === 402) {
      status = 'Not Found';
    } else if (i === 403 || i === 404) {
      status = 'Moved';
      verifiedLoc = locations[(i + 1) % locations.length];
      verifiedCust = custodians[(i + 1) % custodians.length];
      lastVer = '09 Sep 2026 14:15';
      verified = true;
    }

    assets.push({
      id: `exp-${i}`,
      assetNo: `AS-${numStr}`,
      assetName: `${cat.slice(0, -1) || cat} - Enterprise ${i}`,
      assetType: type,
      category: cat,
      model: `Model Series ${1000 + i}`,
      serialNumber: `SN-${(200000 + i * 17).toString(16).toUpperCase()}`,
      tagEpc: `E28011606000002053A1B${i.toString(16).toUpperCase().padStart(3, '0')}`,
      systemLocation: loc,
      verifiedLocation: verifiedLoc,
      systemCustodian: cust,
      verifiedCustodian: verifiedCust,
      condition: 'Good',
      verificationStatus: status,
      lastVerified: lastVer,
      verifiedBy: verified ? 'John Doe' : null,
      department: dept,
      remarks: verified ? 'Verified during routine area walkthrough' : '',
      thumbnail: '/laptop.png',
      verified
    });
  }

  return assets;
}

// Pre-seeded Discrepancies (12 items)
const SEEDED_DISCREPANCIES = [
  {
    id: 'DISC-001',
    exceptionNo: 'EXC-2026-001',
    assetNo: 'AS-000124',
    assetName: 'Laptop - Dell Latitude 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location / Moved',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Omar Saleh',
    reportedBy: 'John Doe',
    reportedDate: '10 Sep 2026 11:05',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Create Relocation Transfer',
    details: 'Asset found relocated across floors without custody transfer request.',
    resolved: false
  },
  {
    id: 'DISC-002',
    exceptionNo: 'EXC-2026-002',
    assetNo: 'AS-000126',
    assetName: 'Chair - Office (Herman Miller)',
    serialNumber: 'HM-991204',
    tagEpc: 'E28011606000002053A1B4C2',
    exceptionType: 'NOT_FOUND',
    typeLabel: 'Expected - Not Found',
    severity: 'HIGH',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: '-',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: '-',
    reportedBy: 'John Doe',
    reportedDate: '10 Sep 2026 11:10',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'INVESTIGATION',
    actionLabel: 'Initiate Missing Investigation',
    details: 'Asset not physically present at assigned desk during 2nd floor census sweep.',
    resolved: false
  },
  {
    id: 'DISC-003',
    exceptionNo: 'EXC-2026-003',
    assetNo: 'AS-000127',
    assetName: 'Meeting Table (Steelcase Media:scape)',
    serialNumber: 'SC-441209',
    tagEpc: 'E28011606000002053A1B4C3',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block C > GF > CONF-01',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: 'Omar Saleh',
    reportedBy: 'John Doe',
    reportedDate: '10 Sep 2026 09:30',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Create Relocation Transfer',
    details: 'Moved from 2nd floor conference area to Block C Ground Floor meeting suite.',
    resolved: false
  },
  {
    id: 'DISC-004',
    exceptionNo: 'EXC-2026-004',
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher (NAFFCO CO2 5KG)',
    serialNumber: 'NF-661201',
    tagEpc: 'E28011606000002053A1B4C6',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'CRITICAL',
    systemLocation: 'Block A > GF > Lobby',
    verifiedLocation: 'Block A > GF > Lobby',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    reportedBy: 'John Doe',
    reportedDate: '10 Sep 2026 10:05',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Create Maintenance Request',
    details: 'Safety pin missing, pressure gauge below threshold. Immediate HSE service required.',
    resolved: false
  },
  {
    id: 'DISC-005',
    exceptionNo: 'EXC-2026-005',
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco Catalyst 2960-X',
    serialNumber: 'FCW2149L01',
    tagEpc: 'E28011606000002053A1B4C7',
    exceptionType: 'UNREGISTERED',
    typeLabel: 'Unregistered / Excess Asset',
    severity: 'HIGH',
    systemLocation: '-',
    verifiedLocation: 'Block C > 2F > IT-201',
    systemCustodian: '-',
    verifiedCustodian: 'Network Operations Team',
    reportedBy: 'John Doe',
    reportedDate: '10 Sep 2026 12:20',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'PROVISIONAL_ASSET',
    actionLabel: 'Create Provisional Asset',
    details: 'Hardware detected powered-on in server rack with no record in Asset Master.',
    resolved: false
  },
  {
    id: 'DISC-006',
    exceptionNo: 'EXC-2026-006',
    assetNo: 'AS-000138',
    assetName: 'Workstation - Dell Precision 5570',
    serialNumber: '89X4M12',
    tagEpc: 'E28011606000002053A1B4D2',
    exceptionType: 'WRONG_CUSTODIAN',
    typeLabel: 'Wrong Custodian',
    severity: 'LOW',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Khalid Mansoor',
    verifiedCustodian: 'Fatima Noor',
    reportedBy: 'John Doe',
    reportedDate: '09 Sep 2026 15:40',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'CUSTODIAN_CORRECTION',
    actionLabel: 'Update Custodian Assignment',
    details: 'Device transferred between colleagues without updating custody register.',
    resolved: false
  },
  {
    id: 'DISC-007',
    exceptionNo: 'EXC-2026-007',
    assetNo: 'AS-000142',
    assetName: 'Monitor - Dell UltraSharp 27"',
    serialNumber: 'CN08912P',
    tagEpc: 'E28011606000002053A1B4F1',
    exceptionType: 'DUPLICATE_TAG',
    typeLabel: 'Duplicate Tag / Serial Conflict',
    severity: 'MEDIUM',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Farhan Zaidi',
    verifiedCustodian: 'Farhan Zaidi',
    reportedBy: 'John Doe',
    reportedDate: '09 Sep 2026 16:15',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'RETAP_RETAG',
    actionLabel: 'Re-issue RFID Tag',
    details: 'Duplicate RFID EPC read collision observed with monitor at workstation 204B.',
    resolved: false
  },
  {
    id: 'DISC-008',
    exceptionNo: 'EXC-2026-008',
    assetNo: 'AS-000149',
    assetName: 'Projector - BenQ MX535',
    serialNumber: 'BQ-881290',
    tagEpc: 'E28011606000002053A1B4F8',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'MEDIUM',
    systemLocation: 'Block C > 1F > CONF-02',
    verifiedLocation: 'Block C > 1F > CONF-02',
    systemCustodian: 'Ahmed Khan',
    verifiedCustodian: 'Ahmed Khan',
    reportedBy: 'John Doe',
    reportedDate: '09 Sep 2026 17:00',
    status: 'PENDING_RECONCILIATION',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Create Maintenance Request',
    details: 'Projection lamp overheating and fan error message illuminated.',
    resolved: false
  },
  {
    id: 'DISC-009',
    exceptionNo: 'EXC-2026-009',
    assetNo: 'AS-000155',
    assetName: 'Barcode Scanner - Zebra DS2208',
    serialNumber: 'ZB-442109',
    tagEpc: 'E28011606000002053A1B504',
    exceptionType: 'NOT_FOUND',
    typeLabel: 'Expected - Not Found',
    severity: 'LOW',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: '-',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: '-',
    reportedBy: 'John Doe',
    reportedDate: '08 Sep 2026 11:20',
    status: 'RESOLVED',
    proposedAction: 'INVESTIGATION',
    actionLabel: 'Found in Dispatch Locker',
    details: 'Located in logistics staging cabinet and verified by department supervisor.',
    resolved: true
  },
  {
    id: 'DISC-010',
    exceptionNo: 'EXC-2026-010',
    assetNo: 'AS-000162',
    assetName: 'Executive Desk - Oak Finish',
    serialNumber: 'DK-100234',
    tagEpc: 'E28011606000002053A1B50F',
    exceptionType: 'WRONG_LOCATION',
    typeLabel: 'Wrong Location',
    severity: 'LOW',
    systemLocation: 'Block B > 3F > EXEC-01',
    verifiedLocation: 'Block C > 1F > EXEC-02',
    systemCustodian: 'Rashid Al-Maktoum',
    verifiedCustodian: 'Rashid Al-Maktoum',
    reportedBy: 'John Doe',
    reportedDate: '08 Sep 2026 14:05',
    status: 'RESOLVED',
    proposedAction: 'RELOCATION_TRANSFER',
    actionLabel: 'Relocation Approved',
    details: 'Formal relocation transfer completed retroactively by Facilities.',
    resolved: true
  },
  {
    id: 'DISC-011',
    exceptionNo: 'EXC-2026-011',
    assetNo: 'AS-000171',
    assetName: 'Tablet - Samsung Galaxy Tab Active4',
    serialNumber: 'SM-T636B01',
    tagEpc: 'E28011606000002053A1B518',
    exceptionType: 'UNREGISTERED',
    typeLabel: 'Unregistered / Excess Asset',
    severity: 'MEDIUM',
    systemLocation: '-',
    verifiedLocation: 'Block B > GF > Workshop',
    systemCustodian: '-',
    verifiedCustodian: 'Facilities Tech Team',
    reportedBy: 'John Doe',
    reportedDate: '08 Sep 2026 16:30',
    status: 'RESOLVED',
    proposedAction: 'PROVISIONAL_ASSET',
    actionLabel: 'Asset Registered #AST-009941',
    details: 'Provisional record approved by Asset Manager and added to register.',
    resolved: true
  },
  {
    id: 'DISC-012',
    exceptionNo: 'EXC-2026-012',
    assetNo: 'AS-000180',
    assetName: 'UPS - APC Smart-UPS 1500VA',
    serialNumber: 'AS-9921045',
    tagEpc: 'E28011606000002053A1B521',
    exceptionType: 'DAMAGED',
    typeLabel: 'Damaged / Condition Issue',
    severity: 'HIGH',
    systemLocation: 'Block B > GF > DataCenter-01',
    verifiedLocation: 'Block B > GF > DataCenter-01',
    systemCustodian: 'Farhan Zaidi',
    verifiedCustodian: 'Farhan Zaidi',
    reportedBy: 'John Doe',
    reportedDate: '07 Sep 2026 10:15',
    status: 'RESOLVED',
    proposedAction: 'MAINTENANCE_REQUEST',
    actionLabel: 'Work Order #WO-4921 Scheduled',
    details: 'Battery replacement work order created and technician dispatched.',
    resolved: true
  }
];

// Seeded Audit Trail
const SEEDED_AUDIT_TRAIL = [
  {
    id: 'AUD-EVT-001',
    timestamp: '10 Sep 2026 12:20',
    assetNo: 'AS-000131',
    assetName: 'Switch - Cisco Catalyst 2960-X',
    action: 'UNREGISTERED_DETECTED',
    actionLabel: 'Unregistered Asset Detected',
    auditor: 'John Doe',
    method: 'RFID Bulk Sweep',
    details: 'EPC E28011606000002053A1B4C7 detected in rack 4; not in snapshot. Exception EXC-2026-005 generated.',
    status: 'Exception Created'
  },
  {
    id: 'AUD-EVT-002',
    timestamp: '10 Sep 2026 11:15',
    assetNo: 'AS-000129',
    assetName: 'Access Point - Cisco',
    action: 'VERIFIED_CORRECT',
    actionLabel: 'Marked as Verified',
    auditor: 'John Doe',
    method: 'RFID Scan (Zebra TC57)',
    details: 'Observed Location Block B > 3F > IT-301 matches System Location. Custodian Sara Ali verified.',
    status: 'Verified'
  },
  {
    id: 'AUD-EVT-003',
    timestamp: '10 Sep 2026 11:05',
    assetNo: 'AS-000124',
    assetName: 'Laptop - Dell Latitude 5440',
    action: 'MOVED_DETECTED',
    actionLabel: 'Marked as Moved',
    auditor: 'John Doe',
    method: 'Barcode Scan & Manual Form',
    details: 'Observed Location Block B > 2F > IT-201 vs System Block B > 1F > IT-101. Verified Custodian Omar Saleh.',
    status: 'Exception Created'
  },
  {
    id: 'AUD-EVT-004',
    timestamp: '10 Sep 2026 10:05',
    assetNo: 'AS-000130',
    assetName: 'Fire Extinguisher',
    action: 'DAMAGED_LOGGED',
    actionLabel: 'Marked as Damaged',
    auditor: 'John Doe',
    method: 'Visual Check & Barcode Scan',
    details: 'Condition flagged as Damaged. Safety pin broken and pressure low. Photo captured.',
    status: 'Maintenance Flagged'
  },
  {
    id: 'AUD-EVT-005',
    timestamp: '10 Sep 2026 09:50',
    assetNo: 'AS-000125',
    assetName: 'Printer - HP',
    action: 'VERIFIED_CORRECT',
    actionLabel: 'Marked as Verified',
    auditor: 'John Doe',
    method: 'Barcode Scan (Cognex Scanner)',
    details: 'Physical item found in Block B > 2F > IT-201. Custodian Layla Hassan verified.',
    status: 'Verified'
  },
  {
    id: 'AUD-EVT-006',
    timestamp: '10 Sep 2026 08:10',
    assetNo: 'AS-000132',
    assetName: 'iPad - Apple',
    action: 'VERIFIED_CORRECT',
    actionLabel: 'Marked as Verified',
    auditor: 'John Doe',
    method: 'QR Code Scan',
    details: 'Serial DMPZK819L matched. Sara Ali custodian confirmed.',
    status: 'Verified'
  }
];

// Seeded Attachments
const SEEDED_ATTACHMENTS = [
  {
    id: 'ATT-001',
    fileName: 'damage_inspection_AS-000130.jpg',
    fileSize: '2.4 MB',
    fileType: 'image/jpeg',
    uploadedBy: 'John Doe',
    uploadedDate: '10 Sep 2026 10:06',
    category: 'Condition Evidence',
    relatedAsset: 'AS-000130 (Fire Extinguisher)'
  },
  {
    id: 'ATT-002',
    fileName: 'floor_audit_signoff_sheet_block_b.pdf',
    fileSize: '1.1 MB',
    fileType: 'application/pdf',
    uploadedBy: 'John Doe',
    uploadedDate: '10 Sep 2026 12:30',
    category: 'Auditor Sign-off',
    relatedAsset: 'Campaign AUD-2026-0008'
  },
  {
    id: 'ATT-003',
    fileName: 'server_rack_cisco_switch_unregistered.jpg',
    fileSize: '3.8 MB',
    fileType: 'image/jpeg',
    uploadedBy: 'John Doe',
    uploadedDate: '10 Sep 2026 12:22',
    category: 'Unregistered Evidence',
    relatedAsset: 'AS-000131 (Cisco Switch)'
  }
];

class StocktakeService {
  constructor() {
    this.campaign = { ...CAMPAIGN_AUD_2026_0008 };
    this.assets = generateCampaignAssets();
    this.discrepancies = [...SEEDED_DISCREPANCIES];
    this.auditTrail = [...SEEDED_AUDIT_TRAIL];
    this.attachments = [...SEEDED_ATTACHMENTS];
  }

  // Get campaign summary & KPIs
  async getCampaignDetails(campaignId = 'AUD-2026-0008') {
    // Attempt Prisma if connected
    try {
      if (prisma.stocktakeCampaign) {
        const dbCampaign = await prisma.stocktakeCampaign.findFirst({
          where: {
            OR: [
              { id: campaignId },
              { campaignNumber: campaignId }
            ]
          }
        });
        if (dbCampaign) {
          return {
            ...this.campaign,
            id: dbCampaign.id,
            auditId: dbCampaign.campaignNumber || this.campaign.auditId,
            auditName: dbCampaign.title || this.campaign.auditName
          };
        }
      }
    } catch {
      // fallback to in-memory
    }
    return this.campaign;
  }

  // Query assets with search, filters, and pagination
  async getAssets({
    search = '',
    location = 'All',
    department = 'All',
    assetType = 'All',
    verificationStatus = 'All',
    page = 1,
    limit = 10
  } = {}) {
    let filtered = [...this.assets];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(a =>
        (a.assetNo && a.assetNo.toLowerCase().includes(q)) ||
        (a.assetName && a.assetName.toLowerCase().includes(q)) ||
        (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
        (a.tagEpc && a.tagEpc.toLowerCase().includes(q)) ||
        (a.systemLocation && a.systemLocation.toLowerCase().includes(q)) ||
        (a.systemCustodian && a.systemCustodian.toLowerCase().includes(q))
      );
    }

    if (location && location !== 'All' && location !== 'All Locations') {
      filtered = filtered.filter(a =>
        a.systemLocation?.toLowerCase().includes(location.toLowerCase()) ||
        a.verifiedLocation?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (department && department !== 'All' && department !== 'All Departments') {
      filtered = filtered.filter(a =>
        a.department?.toLowerCase() === department.toLowerCase()
      );
    }

    if (assetType && assetType !== 'All' && assetType !== 'All Types') {
      filtered = filtered.filter(a =>
        a.assetType?.toLowerCase() === assetType.toLowerCase()
      );
    }

    if (verificationStatus && verificationStatus !== 'All') {
      filtered = filtered.filter(a => {
        if (verificationStatus.toLowerCase() === 'verified') return a.verificationStatus === 'Verified';
        if (verificationStatus.toLowerCase() === 'moved') return a.verificationStatus === 'Moved';
        if (verificationStatus.toLowerCase() === 'not found') return a.verificationStatus === 'Not Found';
        if (verificationStatus.toLowerCase() === 'wrong location') return a.verificationStatus === 'Wrong Location';
        if (verificationStatus.toLowerCase() === 'damaged') return a.verificationStatus === 'Damaged';
        if (verificationStatus.toLowerCase() === 'unregistered') return a.verificationStatus === 'Unregistered';
        if (verificationStatus.toLowerCase() === 'pending') return a.verificationStatus === 'Pending';
        return true;
      });
    }

    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedAssets = filtered.slice(startIndex, startIndex + limitNum);

    return {
      assets: pagedAssets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  // Get asset by identifier (Asset No, Serial, or Tag/EPC)
  async resolveAsset(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const asset = this.assets.find(a =>
      a.assetNo.toLowerCase() === clean ||
      a.tagEpc.toLowerCase() === clean ||
      a.serialNumber.toLowerCase() === clean ||
      a.id.toLowerCase() === clean
    );
    return asset || null;
  }

  // Perform physical verification action
  async verifyAsset({
    assetNo,
    outcome, // 'Verified' | 'Moved' | 'Not Found' | 'Damaged' | 'Unregistered'
    verifiedLocation,
    verifiedCustodian,
    condition = 'Good',
    remarks = '',
    evidencePhoto = null,
    scanMethod = 'Barcode / RFID',
    auditor = 'John Doe'
  }) {
    let asset = this.assets.find(a => a.assetNo === assetNo);
    const nowStr = '10 Sep 2026 12:45';

    if (!asset && outcome === 'Unregistered') {
      // Create new unregistered entry in the campaign
      asset = {
        id: `exp-unreg-${Date.now()}`,
        assetNo: assetNo || `UNREG-${Date.now().toString(36).toUpperCase()}`,
        assetName: 'Unregistered Physical Device',
        assetType: 'IT Equipment',
        category: 'Unassigned',
        model: 'Physical Discovery',
        serialNumber: 'UNKNOWN',
        tagEpc: assetNo,
        systemLocation: '-',
        verifiedLocation: verifiedLocation || 'Block B > 2F > IT-201',
        systemCustodian: '-',
        verifiedCustodian: verifiedCustodian || '-',
        condition: condition || 'Good',
        verificationStatus: 'Unregistered',
        lastVerified: nowStr,
        verifiedBy: auditor,
        department: 'Operations',
        remarks: remarks || 'Discovered during physical audit sweep',
        thumbnail: '/laptop.png',
        verified: true
      };
      this.assets.unshift(asset);
    } else if (asset) {
      asset.verificationStatus = outcome;
      asset.condition = condition;
      asset.verified = outcome !== 'Not Found';
      asset.lastVerified = nowStr;
      asset.verifiedBy = auditor;
      asset.remarks = remarks || asset.remarks;

      if (outcome === 'Verified') {
        asset.verifiedLocation = verifiedLocation || asset.systemLocation;
        asset.verifiedCustodian = verifiedCustodian || asset.systemCustodian;
      } else if (outcome === 'Moved' || outcome === 'Wrong Location') {
        asset.verifiedLocation = verifiedLocation || 'Block B > 2F > IT-201';
        asset.verifiedCustodian = verifiedCustodian || asset.systemCustodian;
      } else if (outcome === 'Wrong Custodian') {
        asset.verifiedLocation = verifiedLocation || asset.systemLocation;
        asset.verifiedCustodian = verifiedCustodian || 'Omar Saleh';
      } else if (outcome === 'Not Found') {
        asset.verifiedLocation = '-';
        asset.verifiedCustodian = '-';
      } else if (outcome === 'Damaged') {
        asset.verifiedLocation = verifiedLocation || asset.systemLocation;
        asset.verifiedCustodian = verifiedCustodian || asset.systemCustodian;
      }
    }

    // If outcome is a discrepancy, create or update Discrepancies list
    if (['Moved', 'Wrong Location', 'Wrong Custodian', 'Not Found', 'Damaged', 'Unregistered'].includes(outcome)) {
      const excTypeMap = {
        Moved: 'WRONG_LOCATION',
        'Wrong Location': 'WRONG_LOCATION',
        'Wrong Custodian': 'WRONG_CUSTODIAN',
        'Not Found': 'NOT_FOUND',
        Damaged: 'DAMAGED',
        Unregistered: 'UNREGISTERED'
      };

      const existingDisc = this.discrepancies.find(d => d.assetNo === assetNo);
      if (!existingDisc) {
        const newDisc = {
          id: `DISC-${Date.now().toString().slice(-4)}`,
          exceptionNo: `EXC-2026-${String(this.discrepancies.length + 1).padStart(3, '0')}`,
          assetNo: asset.assetNo,
          assetName: asset.assetName,
          serialNumber: asset.serialNumber,
          tagEpc: asset.tagEpc,
          exceptionType: excTypeMap[outcome] || 'WRONG_LOCATION',
          typeLabel: outcome === 'Moved' ? 'Wrong Location / Moved' : outcome,
          severity: outcome === 'Damaged' ? 'HIGH' : 'MEDIUM',
          systemLocation: asset.systemLocation,
          verifiedLocation: asset.verifiedLocation,
          systemCustodian: asset.systemCustodian,
          verifiedCustodian: asset.verifiedCustodian,
          reportedBy: auditor,
          reportedDate: nowStr,
          status: 'PENDING_RECONCILIATION',
          proposedAction: outcome === 'Damaged' ? 'MAINTENANCE_REQUEST' : outcome === 'Moved' ? 'RELOCATION_TRANSFER' : 'INVESTIGATION',
          actionLabel: outcome === 'Damaged' ? 'Create Maintenance Request' : outcome === 'Moved' ? 'Create Relocation Transfer' : 'Review Exception',
          details: remarks || `Auditor identified ${outcome} during physical verification.`,
          resolved: false
        };
        this.discrepancies.unshift(newDisc);
      }
    }

    // Add immutable event to audit trail
    this.auditTrail.unshift({
      id: `AUD-EVT-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr,
      assetNo: asset.assetNo,
      assetName: asset.assetName,
      action: outcome.toUpperCase(),
      actionLabel: `Marked as ${outcome}`,
      auditor,
      method: scanMethod,
      details: remarks || `Outcome recorded as ${outcome}. System vs Observed comparison verified.`,
      status: outcome === 'Verified' ? 'Verified' : 'Exception Logged'
    });

    // Recompute campaign KPIs
    this.recalculateKPIs();

    return {
      success: true,
      asset,
      campaign: this.campaign
    };
  }

  // Get discrepancies
  async getDiscrepancies(filter = 'ALL') {
    if (filter === 'PENDING') {
      return this.discrepancies.filter(d => !d.resolved);
    }
    if (filter === 'RESOLVED') {
      return this.discrepancies.filter(d => d.resolved);
    }
    return this.discrepancies;
  }

  // Reconcile / Resolve an exception
  async reconcileException(exceptionId, { action, notes, auditor = 'John Doe' }) {
    const disc = this.discrepancies.find(d => d.id === exceptionId || d.exceptionNo === exceptionId);
    if (!disc) return { success: false, message: 'Exception not found' };

    disc.resolved = true;
    disc.status = 'RESOLVED';
    disc.resolutionNotes = notes || `Reconciled via ${action || 'auditor approval'}`;
    disc.resolvedAt = '10 Sep 2026 13:00';
    disc.resolvedBy = auditor;

    this.recalculateKPIs();

    return {
      success: true,
      exception: disc,
      campaign: this.campaign
    };
  }

  // Recalculate campaign progress and counts
  recalculateKPIs() {
    const verifiedCount = this.assets.filter(a => a.verified && a.verificationStatus !== 'Pending').length;
    const pendingCount = this.assets.filter(a => a.verificationStatus === 'Pending').length;
    const notFoundCount = this.assets.filter(a => a.verificationStatus === 'Not Found').length;
    const relocatedCount = this.assets.filter(a => a.verificationStatus === 'Moved' || a.verificationStatus === 'Wrong Location').length;
    const wrongCustodianCount = this.assets.filter(a => a.verificationStatus === 'Wrong Custodian').length;
    const damagedCount = this.assets.filter(a => a.verificationStatus === 'Damaged').length;
    const unregisteredCount = this.assets.filter(a => a.verificationStatus === 'Unregistered').length;
    const totalExceptions = this.discrepancies.filter(d => !d.resolved).length;

    this.campaign.totalVerified = verifiedCount;
    this.campaign.totalPending = pendingCount;
    this.campaign.totalNotFound = notFoundCount;
    this.campaign.totalRelocated = relocatedCount;
    this.campaign.totalWrongLocation = relocatedCount;
    this.campaign.totalWrongCustodian = wrongCustodianCount;
    this.campaign.totalDamaged = damagedCount;
    this.campaign.totalExcess = unregisteredCount;
    this.campaign.totalUnregistered = unregisteredCount;
    this.campaign.totalExceptions = this.discrepancies.length;
    this.campaign.exceptionsCount = this.discrepancies.length;
    this.campaign.notFoundCount = notFoundCount;
    this.campaign.pendingExceptions = totalExceptions;
    this.campaign.progress = Math.round((verifiedCount / (this.campaign.totalExpected || 600)) * 100);
  }

  // Bulk RFID scan with de-duplication and population matching
  async bulkRfidScan({ epcs = [], auditor = 'John Doe' }) {
    if (!Array.isArray(epcs) || epcs.length === 0) {
      return { success: false, message: 'No RFID EPC tags provided' };
    }

    const uniqueEpcs = [...new Set(epcs.map(e => (typeof e === 'string' ? e.trim() : '')).filter(Boolean))];
    const nowStr = '10 Sep 2026 12:50';
    let matchedCount = 0;
    let alreadyVerifiedCount = 0;
    let unregisteredCount = 0;
    const results = [];

    for (const epc of uniqueEpcs) {
      const asset = this.assets.find(a =>
        a.tagEpc?.toLowerCase() === epc.toLowerCase() ||
        a.assetNo?.toLowerCase() === epc.toLowerCase() ||
        a.serialNumber?.toLowerCase() === epc.toLowerCase()
      );

      if (asset) {
        if (asset.verificationStatus === 'Verified') {
          alreadyVerifiedCount++;
          results.push({ epc, assetNo: asset.assetNo, status: 'ALREADY_VERIFIED', asset });
        } else {
          asset.verificationStatus = 'Verified';
          asset.verified = true;
          asset.lastVerified = nowStr;
          asset.verifiedBy = auditor;
          asset.verifiedLocation = asset.systemLocation;
          asset.verifiedCustodian = asset.systemCustodian;
          matchedCount++;
          results.push({ epc, assetNo: asset.assetNo, status: 'MATCHED_VERIFIED', asset });
        }
      } else {
        unregisteredCount++;
        const unregAsset = {
          id: `exp-unreg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          assetNo: `UNREG-${epc.slice(-6).toUpperCase()}`,
          assetName: 'Discovered Unregistered RFID Device',
          assetType: 'IT Equipment',
          category: 'Unassigned',
          model: 'RFID Active Device',
          serialNumber: 'UNKNOWN',
          tagEpc: epc,
          systemLocation: '-',
          verifiedLocation: 'Dubai HQ - Block B',
          systemCustodian: '-',
          verifiedCustodian: '-',
          condition: 'Good',
          verificationStatus: 'Unregistered',
          lastVerified: nowStr,
          verifiedBy: auditor,
          department: 'Audit Discovery',
          remarks: 'Discovered during bulk RFID multi-read antenna sweep',
          thumbnail: '/laptop.png',
          verified: true
        };
        this.assets.unshift(unregAsset);
        results.push({ epc, assetNo: unregAsset.assetNo, status: 'UNREGISTERED_DISCOVERED', asset: unregAsset });
      }
    }

    this.recalculateKPIs();

    return {
      success: true,
      totalReceived: epcs.length,
      uniqueRead: uniqueEpcs.length,
      matchedCount,
      alreadyVerifiedCount,
      unregisteredCount,
      results,
      campaign: this.campaign
    };
  }

  // Get Not Found assets
  async getNotFoundAssets() {
    return this.assets.filter(a => a.verificationStatus === 'Not Found');
  }

  // Get Audit Notes
  async getAuditNotes() {
    if (!this.notes) {
      this.notes = [
        {
          id: 'NOTE-001',
          title: 'Floor 2 Server Room Key Access',
          category: 'Access Issue',
          content: 'Server room 201 access was granted by Facilities Manager at 09:15 AM. All server rack tags were successfully scanned.',
          author: 'John Doe',
          timestamp: '10 Sep 2026 09:20',
          badge: 'Resolved'
        },
        {
          id: 'NOTE-002',
          title: 'Damaged Extinguisher Notice',
          category: 'Safety & Damage',
          content: 'NAFFCO extinguisher NF-661201 in Block A Lobby has zero pressure and broken seal. Safety department notified for urgent replacement.',
          author: 'John Doe',
          timestamp: '10 Sep 2026 10:10',
          badge: 'Action Required'
        },
        {
          id: 'NOTE-003',
          title: 'Unregistered Cisco Switch Discovered',
          category: 'Unregistered Asset',
          content: '48-port Cisco switch found active in Block C 2nd floor rack without Asset360 tag. Tagged temporarily as UNREG-IT-01 for reconciliation.',
          author: 'John Doe',
          timestamp: '10 Sep 2026 12:25',
          badge: 'Pending Review'
        }
      ];
    }
    return this.notes;
  }

  // Add Audit Note
  async addAuditNote({ title, category, content, author = 'John Doe' }) {
    await this.getAuditNotes();
    const newNote = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      title: title || 'Audit Execution Observation',
      category: category || 'General Note',
      content: content || '',
      author,
      timestamp: '10 Sep 2026 13:00',
      badge: 'New'
    };
    this.notes.unshift(newNote);
    return { success: true, note: newNote, notes: this.notes };
  }

  // Get Summary statistics & completion check
  async getSummary() {
    return {
      campaign: this.campaign,
      kpis: {
        totalAssets: this.campaign.totalAssets || 600,
        verified: this.campaign.totalVerified || 390,
        pending: this.campaign.totalPending || 180,
        notFound: this.campaign.totalNotFound || 12,
        wrongLocation: this.campaign.totalWrongLocation || 10,
        wrongCustodian: this.campaign.totalWrongCustodian || 5,
        unregistered: this.campaign.totalExcess || 2,
        damaged: this.campaign.totalDamaged || 1,
        progress: this.campaign.progress || 65,
        exceptionsCount: this.campaign.totalExceptions || 30
      },
      categoryBreakdown: [
        { category: 'IT Equipment', total: 350, verified: 230, pending: 100, exceptions: 20, pct: 66 },
        { category: 'Network Equipment', total: 120, verified: 80, pending: 35, exceptions: 5, pct: 67 },
        { category: 'Furniture', total: 80, verified: 50, pending: 25, exceptions: 5, pct: 63 },
        { category: 'Safety Equipment', total: 50, verified: 30, pending: 20, exceptions: 0, pct: 60 }
      ],
      locationBreakdown: [
        { location: 'Block B > 1F', total: 200, verified: 150, pending: 45, exceptions: 5, pct: 75 },
        { location: 'Block B > 2F', total: 180, verified: 110, pending: 58, exceptions: 12, pct: 61 },
        { location: 'Block B > 3F', total: 120, verified: 80, pending: 37, exceptions: 3, pct: 67 },
        { location: 'Block C / Other', total: 100, verified: 50, pending: 40, exceptions: 10, pct: 50 }
      ],
      completionEligibility: {
        eligible: false,
        reasons: [
          '180 expected assets are still Pending physical verification',
          '30 exception / discrepancy records require formal supervisor reconciliation'
        ],
        requiredActions: [
          'Complete physical scan of Floor 2 and 3 remaining zones',
          'Review and approve or resolve discrepancy records in Exceptions tab'
        ]
      }
    };
  }

  // Get audit trail
  async getAuditTrail() {
    return this.auditTrail;
  }

  // Get attachments
  async getAttachments() {
    return this.attachments;
  }

  // Complete Campaign
  async completeCampaign(campaignId, { approvedBy = 'John Doe', notes = '' } = {}) {
    const pendingExceptions = this.discrepancies.filter(d => !d.resolved);
    if (pendingExceptions.length > 0) {
      return {
        success: false,
        blocked: true,
        unresolvedCount: pendingExceptions.length,
        message: `Campaign cannot be closed: ${pendingExceptions.length} discrepancies require formal resolution or management approval before audit completion.`
      };
    }

    this.campaign.status = 'Completed';
    this.campaign.statusCode = 'COMPLETED';
    this.campaign.completedAt = '10 Sep 2026 13:30';
    this.campaign.completedBy = approvedBy;
    this.campaign.closureNotes = notes;

    return {
      success: true,
      campaign: this.campaign,
      reconciliationReportId: 'REP-AUD-2026-0008-FINAL'
    };
  }
}

export const stocktakeService = new StocktakeService();
export default stocktakeService;
