import prisma from '../../config/prisma.js';

// Pre-seeded 1,248 assets repository with exact top 10 matching Screenshot 25
const SEED_ASSETS = [
  {
    id: 'AS-000123',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell Latitude 5440',
    serialNumber: '7F3K2D4',
    tagEpc: 'E28011606000002053A1B4C0',
    assetType: 'IT Equipment',
    category: 'Computers',
    model: 'Latitude 5440',
    manufacturer: 'Dell',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block A > GF',
    fullLocation: 'Dubai HQ > Block A > Ground Floor > Reception',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'Reception',
    assignedTo: 'Ahmed Khan',
    assignedToId: 'EMP-00123',
    department: 'IT Department',
    assignedDate: '15 Aug 2026',
    lastMoved: '10 Sep 2026 10:24',
    lastMovedDate: '10 Sep 2026',
    warrantyExpiry: '15 Aug 2029',
    remarks: 'Company issued laptop',
    image: '/laptop.png'
  },
  {
    id: 'AS-000124',
    assetNumber: 'AS-000124',
    assetName: 'Monitor - Samsung',
    serialNumber: 'SAMS8787',
    tagEpc: 'E28011606000002053A1B4C1',
    assetType: 'IT Equipment',
    category: 'Monitors',
    model: 'Odyssey G7',
    manufacturer: 'Samsung',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block A > GF',
    fullLocation: 'Dubai HQ > Block A > Ground Floor > Workstation 12',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'Workstation 12',
    assignedTo: 'Sara Ali',
    assignedToId: 'EMP-00124',
    department: 'Finance',
    assignedDate: '12 Aug 2026',
    lastMoved: '09 Sep 2026 14:10',
    lastMovedDate: '09 Sep 2026',
    warrantyExpiry: '20 Jul 2028',
    remarks: 'Dual monitor setup',
    image: '/monitor.png'
  },
  {
    id: 'AS-000125',
    assetNumber: 'AS-000125',
    assetName: 'Printer - HP',
    serialNumber: 'CNB47892',
    tagEpc: '-',
    assetType: 'IT Equipment',
    category: 'Printers',
    model: 'LaserJet Pro M404n',
    manufacturer: 'HP',
    status: 'Unassigned',
    currentLocation: 'Dubai HQ > Block B > 1F',
    fullLocation: 'Dubai HQ > Block B > 1st Floor > Print Room',
    site: 'Dubai HQ',
    building: 'Block B',
    floor: '1st Floor',
    room: 'Print Room',
    assignedTo: 'Unassigned',
    assignedToId: null,
    department: 'Unassigned',
    assignedDate: '-',
    lastMoved: '-',
    lastMovedDate: '-',
    warrantyExpiry: '10 Jan 2027',
    remarks: 'Spares inventory',
    image: '/printer.png'
  },
  {
    id: 'AS-000126',
    assetNumber: 'AS-000126',
    assetName: 'Access Point - Cisco',
    serialNumber: 'FCH9384',
    tagEpc: 'E28011606000002053A1B4C2',
    assetType: 'Network Device',
    category: 'Wireless AP',
    model: 'Catalyst 9120',
    manufacturer: 'Cisco',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block B > 1F',
    fullLocation: 'Dubai HQ > Block B > 1st Floor > Hallway East',
    site: 'Dubai HQ',
    building: 'Block B',
    floor: '1st Floor',
    room: 'Hallway East',
    assignedTo: 'IT Team',
    assignedToId: 'DEPT-IT',
    department: 'IT Infrastructure',
    assignedDate: '01 Aug 2026',
    lastMoved: '08 Sep 2026 16:40',
    lastMovedDate: '08 Sep 2026',
    warrantyExpiry: '01 Aug 2030',
    remarks: 'PoE ceiling mount',
    image: '/switch.png'
  },
  {
    id: 'AS-000127',
    assetNumber: 'AS-000127',
    assetName: 'Chair - Office',
    serialNumber: 'HM-88190',
    tagEpc: '-',
    assetType: 'Furniture',
    category: 'Chairs',
    model: 'Aeron Ergonomic',
    manufacturer: 'Herman Miller',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block A > 2F',
    fullLocation: 'Dubai HQ > Block A > 2nd Floor > Exec Office 4',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: '2nd Floor',
    room: 'Exec Office 4',
    assignedTo: 'Fatima Noor',
    assignedToId: 'EMP-00127',
    department: 'Human Resources',
    assignedDate: '10 Aug 2026',
    lastMoved: '07 Sep 2026 09:15',
    lastMovedDate: '07 Sep 2026',
    warrantyExpiry: '10 Aug 2038',
    remarks: 'Ergonomic mesh chair',
    image: '/chair.png'
  },
  {
    id: 'AS-000128',
    assetNumber: 'AS-000128',
    assetName: 'Meeting Table',
    serialNumber: 'MT-4402',
    tagEpc: '-',
    assetType: 'Furniture',
    category: 'Tables',
    model: 'Conference 10-Seater',
    manufacturer: 'Steelcase',
    status: 'Unassigned',
    currentLocation: 'Dubai HQ > Block A > 2F',
    fullLocation: 'Dubai HQ > Block A > 2nd Floor > Storage B',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: '2nd Floor',
    room: 'Storage B',
    assignedTo: 'Unassigned',
    assignedToId: null,
    department: 'Unassigned',
    assignedDate: '-',
    lastMoved: '-',
    lastMovedDate: '-',
    warrantyExpiry: '15 Mar 2031',
    remarks: 'Awaiting room remodel',
    image: '/table.png'
  },
  {
    id: 'AS-000129',
    assetNumber: 'AS-000129',
    assetName: 'iPad - Admin',
    serialNumber: 'DMP89201',
    tagEpc: 'E28011606000002053A1B4C3',
    assetType: 'Mobile Device',
    category: 'Tablets',
    model: 'iPad Air 11 M2',
    manufacturer: 'Apple',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block C > GF',
    fullLocation: 'Dubai HQ > Block C > Ground Floor > Security Post',
    site: 'Dubai HQ',
    building: 'Block C',
    floor: 'Ground Floor',
    room: 'Security Post',
    assignedTo: 'Rashid Mohammed',
    assignedToId: 'EMP-00129',
    department: 'Facilities & Security',
    assignedDate: '20 Aug 2026',
    lastMoved: '10 Sep 2026 11:20',
    lastMovedDate: '10 Sep 2026',
    warrantyExpiry: '20 Aug 2027',
    remarks: 'Visitor badge scanner terminal',
    image: '/tablet.png'
  },
  {
    id: 'AS-000130',
    assetNumber: 'AS-000130',
    assetName: 'Projector - Epson',
    serialNumber: 'EP-9021',
    tagEpc: 'E28011606000002053A1B4C4',
    assetType: 'IT Equipment',
    category: 'AV Equipment',
    model: 'PowerLite L530U',
    manufacturer: 'Epson',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block C > 1F',
    fullLocation: 'Dubai HQ > Block C > 1st Floor > Conference Room A',
    site: 'Dubai HQ',
    building: 'Block C',
    floor: '1st Floor',
    room: 'Conference Room A',
    assignedTo: 'Conference Room',
    assignedToId: 'ROOM-CONF-A',
    department: 'General Operations',
    assignedDate: '18 Jul 2026',
    lastMoved: '06 Sep 2026 11:20',
    lastMovedDate: '06 Sep 2026',
    warrantyExpiry: '18 Jul 2029',
    remarks: 'Ceiling installed laser projector',
    image: '/projector.png'
  },
  {
    id: 'AS-000131',
    assetNumber: 'AS-000131',
    assetName: 'Fire Extinguisher',
    serialNumber: 'FE-CO2-990',
    tagEpc: 'E28011606000002053A1B4C5',
    assetType: 'Safety Equipment',
    category: 'Safety',
    model: '5kg CO2 Extinguisher',
    manufacturer: 'NAFFCO',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block A > GF',
    fullLocation: 'Dubai HQ > Block A > Ground Floor > Fire Exit 2',
    site: 'Dubai HQ',
    building: 'Block A',
    floor: 'Ground Floor',
    room: 'Fire Exit 2',
    assignedTo: 'Facilities Team',
    assignedToId: 'DEPT-FAC',
    department: 'Health & Safety',
    assignedDate: '01 Jan 2026',
    lastMoved: '05 Sep 2026 08:30',
    lastMovedDate: '05 Sep 2026',
    warrantyExpiry: '01 Jan 2031',
    remarks: 'Annual inspection due Dec 2026',
    image: '/extinguisher.png'
  },
  {
    id: 'AS-000132',
    assetNumber: 'AS-000132',
    assetName: 'Switch - Cisco',
    serialNumber: 'FOC2241',
    tagEpc: 'E28011606000002053A1B4C6',
    assetType: 'Network Device',
    category: 'Switches',
    model: 'Catalyst 9300-48P',
    manufacturer: 'Cisco',
    status: 'Assigned',
    currentLocation: 'Dubai HQ > Block B > Server Room',
    fullLocation: 'Dubai HQ > Block B > Basement > Server Room Rack 2',
    site: 'Dubai HQ',
    building: 'Block B',
    floor: 'Basement',
    room: 'Server Room Rack 2',
    assignedTo: 'IT Team',
    assignedToId: 'DEPT-IT',
    department: 'IT Infrastructure',
    assignedDate: '15 Feb 2026',
    lastMoved: '04 Sep 2026 15:45',
    lastMovedDate: '04 Sep 2026',
    warrantyExpiry: '15 Feb 2031',
    remarks: 'Core distribution switch',
    image: '/switch.png'
  }
];

// Generate additional records up to 1,248 assets
function generateFullAssetPopulation() {
  const list = [...SEED_ASSETS];
  const types = ['IT Equipment', 'Furniture', 'Network Device', 'Mobile Device', 'Safety Equipment', 'Vehicle'];
  const locations = [
    'Dubai HQ > Block A > GF',
    'Dubai HQ > Block A > 1F',
    'Dubai HQ > Block A > 2F',
    'Dubai HQ > Block B > 1F',
    'Dubai HQ > Block B > Server Room',
    'Dubai HQ > Block C > GF',
    'Dubai HQ > Block C > 1F',
    'Abu Dhabi Branch > Floor 3',
    'Sharjah Warehouse > Bay 4'
  ];
  const custodians = ['Ahmed Khan', 'Sara Ali', 'Fatima Noor', 'Rashid Mohammed', 'Omar Saleh', 'Layla Hassan', 'IT Team', 'Facilities Team', 'Unassigned'];

  for (let i = 133; i <= 1248; i++) {
    const numStr = String(i).padStart(6, '0');
    const assetNumber = `AS-${numStr}`;
    const type = types[i % types.length];
    const isAssigned = i % 8 !== 0;
    const assignedUser = isAssigned ? custodians[i % (custodians.length - 1)] : 'Unassigned';

    list.push({
      id: assetNumber,
      assetNumber,
      assetName: `${type} Unit #${i}`,
      serialNumber: `SN-${i * 37}`,
      tagEpc: `E28011606000002053A1B4${(i % 99).toString(16).padStart(2, '0').toUpperCase()}`,
      assetType: type,
      category: type === 'IT Equipment' ? 'Laptops' : type === 'Furniture' ? 'Chairs' : 'General',
      model: `Model ${i % 20 + 1}`,
      manufacturer: i % 2 === 0 ? 'Dell' : 'HP',
      status: isAssigned ? 'Assigned' : 'Unassigned',
      currentLocation: locations[i % locations.length],
      fullLocation: `${locations[i % locations.length]} > Zone ${i % 5 + 1}`,
      site: 'Dubai HQ',
      building: `Block ${String.fromCharCode(65 + (i % 3))}`,
      floor: `${(i % 3) + 1}F`,
      room: `Room ${i % 20 + 101}`,
      assignedTo: assignedUser,
      assignedToId: isAssigned ? `EMP-${i % 200 + 100}` : null,
      department: isAssigned ? 'IT Department' : 'Unassigned',
      assignedDate: '10 Aug 2026',
      lastMoved: `${(i % 28) + 1} Aug 2026 10:00`,
      lastMovedDate: `${(i % 28) + 1} Aug 2026`,
      warrantyExpiry: '15 Aug 2029',
      remarks: 'Operational asset',
      image: '/laptop.png'
    });
  }
  return list;
}

let assetsStore = generateFullAssetPopulation();

// Pending Approvals Store (12 items matching Screenshot 25)
let pendingApprovalsStore = [
  { requestId: 'REQ-00045', assetNo: 'AS-000128', assetName: 'Meeting Table', requestType: 'Transfer', requestedBy: 'Sara Ali', date: '10 Sep 2026', status: 'Pending', fromLocation: 'Block A > 2F', toLocation: 'Block C > 1F', newCustodian: 'Sara Ali' },
  { requestId: 'REQ-00044', assetNo: 'AS-000132', assetName: 'Switch - Cisco', requestType: 'Transfer', requestedBy: 'Omar Saleh', date: '09 Sep 2026', status: 'Pending', fromLocation: 'Block B > Server Room', toLocation: 'Block A > IDF-1', newCustodian: 'IT Team' },
  { requestId: 'REQ-00043', assetNo: 'AS-000125', assetName: 'Printer - HP', requestType: 'Assignment', requestedBy: 'IT Team', date: '09 Sep 2026', status: 'Pending', fromLocation: 'Block B > 1F', toLocation: 'Block A > HR Area', newCustodian: 'Fatima Noor' },
  { requestId: 'REQ-00042', assetNo: 'AS-000129', assetName: 'iPad - Admin', requestType: 'Transfer', requestedBy: 'Rashid Mohammed', date: '08 Sep 2026', status: 'Pending', fromLocation: 'Block C > GF', toLocation: 'Block A > Security HQ', newCustodian: 'Rashid Mohammed' },
  { requestId: 'REQ-00041', assetNo: 'AS-000127', assetName: 'Chair - Office', requestType: 'Transfer', requestedBy: 'Fatima Noor', date: '08 Sep 2026', status: 'Pending', fromLocation: 'Block A > 2F', toLocation: 'Block B > 3F', newCustodian: 'Omar Saleh' },
  { requestId: 'REQ-00040', assetNo: 'AS-000130', assetName: 'Projector - Epson', requestType: 'Transfer', requestedBy: 'Layla Hassan', date: '07 Sep 2026', status: 'Pending', fromLocation: 'Block C > 1F', toLocation: 'Abu Dhabi Branch', newCustodian: 'Branch Manager' },
  { requestId: 'REQ-00039', assetNo: 'AS-000131', assetName: 'Fire Extinguisher', requestType: 'Transfer', requestedBy: 'Facilities Team', date: '07 Sep 2026', status: 'Pending', fromLocation: 'Block A > GF', toLocation: 'Sharjah Warehouse', newCustodian: 'Warehouse Supervisor' },
  { requestId: 'REQ-00038', assetNo: 'AS-000123', assetName: 'Laptop - Dell', requestType: 'Assignment', requestedBy: 'Ahmed Khan', date: '06 Sep 2026', status: 'Pending', fromLocation: 'Block A > GF', toLocation: 'Block A > IT Desk', newCustodian: 'Ahmed Khan' },
  { requestId: 'REQ-00037', assetNo: 'AS-000124', assetName: 'Monitor - Samsung', requestType: 'Transfer', requestedBy: 'Sara Ali', date: '06 Sep 2026', status: 'Pending', fromLocation: 'Block A > GF', toLocation: 'Block B > Finance', newCustodian: 'Sara Ali' },
  { requestId: 'REQ-00036', assetNo: 'AS-000126', assetName: 'Access Point - Cisco', requestType: 'Transfer', requestedBy: 'IT Team', date: '05 Sep 2026', status: 'Pending', fromLocation: 'Block B > 1F', toLocation: 'Block B > Rooftop', newCustodian: 'Network Team' },
  { requestId: 'REQ-00035', assetNo: 'AS-000133', assetName: 'Desktop - HP Elite', requestType: 'Assignment', requestedBy: 'John Doe', date: '05 Sep 2026', status: 'Pending', fromLocation: 'Block A > IT Store', toLocation: 'Block A > Legal Dept', newCustodian: 'Zainab Qasim' },
  { requestId: 'REQ-00034', assetNo: 'AS-000134', assetName: 'Barcode Scanner - Zebra', requestType: 'Transfer', requestedBy: 'Warehouse Team', date: '04 Sep 2026', status: 'Pending', fromLocation: 'Sharjah Warehouse', toLocation: 'Dubai HQ Store', newCustodian: 'Store Manager' }
];

// Recent Assignments & Movements Store (Matching Screenshot 25)
let recentMovementsStore = [
  { id: 'REC-01', dateTime: '10 Sep 2026 10:24', assetNo: 'AS-000123', assetName: 'Laptop - Dell Latitude 5440', action: 'Assigned', from: '-', to: '-', by: 'Ahmed Khan', status: 'Completed' },
  { id: 'REC-02', dateTime: '10 Sep 2026 09:15', assetNo: 'AS-000127', assetName: 'Chair - Office', action: 'Transferred', from: 'Block A > GF', to: 'Block A > 2F', by: 'Fatima Noor', status: 'Completed' },
  { id: 'REC-03', dateTime: '09 Sep 2026 16:40', assetNo: 'AS-000125', assetName: 'Printer - HP', action: 'Assigned', from: '-', to: '-', by: 'Omar Saleh', status: 'Completed' },
  { id: 'REC-04', dateTime: '09 Sep 2026 11:20', assetNo: 'AS-000130', assetName: 'Projector - Epson', action: 'Transferred', from: 'Block C > 1F', to: 'Conference Room', by: 'Layla Hassan', status: 'Completed' },
  { id: 'REC-05', dateTime: '08 Sep 2026 14:05', assetNo: 'AS-000126', assetName: 'Access Point - Cisco', action: 'Assigned', from: '-', to: '-', by: 'IT Team', status: 'Completed' },
  { id: 'REC-06', dateTime: '08 Sep 2026 10:00', assetNo: 'AS-000124', assetName: 'Monitor - Samsung', action: 'Assigned', from: '-', to: '-', by: 'Sara Ali', status: 'Completed' },
  { id: 'REC-07', dateTime: '07 Sep 2026 16:30', assetNo: 'AS-000131', assetName: 'Fire Extinguisher', action: 'Transferred', from: 'Warehouse', to: 'Block A > GF', by: 'Facilities Team', status: 'Completed' },
  { id: 'REC-08', dateTime: '06 Sep 2026 12:15', assetNo: 'AS-000129', assetName: 'iPad - Admin', action: 'Assigned', from: '-', to: '-', by: 'Rashid Mohammed', status: 'Completed' },
  { id: 'REC-09', dateTime: '05 Sep 2026 15:40', assetNo: 'AS-000132', assetName: 'Switch - Cisco', action: 'Transferred', from: 'Staging Area', to: 'Server Room', by: 'IT Team', status: 'Completed' },
  { id: 'REC-10', dateTime: '04 Sep 2026 09:30', assetNo: 'AS-000128', assetName: 'Meeting Table', action: 'Transferred', from: 'Block B > 2F', to: 'Block A > 2F', by: 'Facilities Team', status: 'Completed' }
];

// Movement History Store (24 Historical Records matching Screenshot and Enterprise FSD)
let movementHistoryStore = [
  {
    movementId: 'MOV-2026-0012',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block A > GF / IT-101',
    toLocation: 'Block B > 1F / IT-201',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Sara Ali',
    movementDate: '10 Sep 2026',
    movementTime: '10:24',
    status: 'Completed',
    requestedBy: 'Sara Ali',
    approvedBy: 'John Doe (System Admin)',
    dispatchedBy: 'Logistics Team',
    receivedBy: 'Sara Ali',
    reason: 'Department transfer from IT Operations to Finance Systems',
    condition: 'Good',
    accessories: '65W USB-C Charger, Targus Carrying Bag',
    site: 'Dubai HQ',
    department: 'Finance',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    timeline: [
      { stage: 'Requested', time: '10 Sep 2026 08:30', user: 'Sara Ali', status: 'Completed', note: 'Transfer request submitted via portal' },
      { stage: 'Approved', time: '10 Sep 2026 09:10', user: 'John Doe (System Admin)', status: 'Completed', note: 'Standard approval granted' },
      { stage: 'Dispatched', time: '10 Sep 2026 09:45', user: 'Internal Courier', status: 'Completed', note: 'Handed over with gate pass #GP-9421' },
      { stage: 'In Transit', time: '10 Sep 2026 10:00', user: 'Courier Transit', status: 'Completed', note: 'En route between Block A and Block B' },
      { stage: 'Received', time: '10 Sep 2026 10:20', user: 'Sara Ali', status: 'Completed', note: 'Inspected and accepted in good order' },
      { stage: 'Completed', time: '10 Sep 2026 10:24', user: 'Asset360 Automated Workflow', status: 'Completed', note: 'Master Asset Register effective location updated' }
    ],
    workflow: [
      { level: 'Level 1: Department Manager', approver: 'Farhan Zaidi', decision: 'Approved', timestamp: '10 Sep 2026 08:45', comments: 'Budget and headcount transfer approved' },
      { level: 'Level 2: Asset Administrator', approver: 'John Doe', decision: 'Approved', timestamp: '10 Sep 2026 09:10', comments: 'Serial #75K3D24 verified in Asset Master' }
    ],
    documents: [
      { name: 'movement_cancel_form.pdf', size: '320 KB', type: 'PDF Document', date: '10 Sep 2026' },
      { name: 'handover_ack_signed.pdf', size: '480 KB', type: 'Signed Receipt', date: '10 Sep 2026' },
      { name: 'equipment_inspection_pass.pdf', size: '215 KB', type: 'QA Checklist', date: '10 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0011',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Custodian Transfer',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: 'Sara Ali',
    toCustodian: 'Omar Saleh',
    movementDate: '15 Aug 2026',
    movementTime: '14:10',
    status: 'Completed',
    requestedBy: 'Omar Saleh',
    approvedBy: 'IT Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Temporary custody handover for project auditing',
    condition: 'Good',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    timeline: [
      { stage: 'Requested', time: '15 Aug 2026 13:00', user: 'Omar Saleh', status: 'Completed', note: 'Custody reassignment requested' },
      { stage: 'Approved', time: '15 Aug 2026 13:35', user: 'IT Manager', status: 'Completed', note: 'Approved for audit task' },
      { stage: 'Completed', time: '15 Aug 2026 14:10', user: 'Omar Saleh', status: 'Completed', note: 'Digital signature verified' }
    ],
    workflow: [
      { level: 'Line Manager Approval', approver: 'Tariq Mansoor', decision: 'Approved', timestamp: '15 Aug 2026 13:35', comments: 'Temporary assignment approved' }
    ],
    documents: [
      { name: 'custodian_handover_form.pdf', size: '185 KB', type: 'PDF Document', date: '15 Aug 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0010',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block C > 2F / IT-301',
    toLocation: 'Block A > GF / IT-101',
    fromCustodian: 'Omar Saleh',
    toCustodian: 'Omar Saleh',
    movementDate: '01 Jul 2026',
    movementTime: '09:30',
    status: 'Completed',
    requestedBy: 'Omar Saleh',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Desk relocation to Ground Floor Helpdesk Area',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'IT-101' },
    timeline: [
      { stage: 'Requested', time: '01 Jul 2026 08:45', user: 'Omar Saleh', status: 'Completed', note: 'Desk shift requested' },
      { stage: 'Approved', time: '01 Jul 2026 09:00', user: 'Facilities Manager', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '01 Jul 2026 09:30', user: 'Omar Saleh', status: 'Completed', note: 'Relocated to Workstation GF-12' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '01 Jul 2026 09:00', comments: 'Space allocated' }
    ],
    documents: [
      { name: 'internal_relocation_pass.pdf', size: '210 KB', type: 'PDF Document', date: '01 Jul 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0009',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Assignment',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '15 Jun 2026',
    movementTime: '11:15',
    status: 'Completed',
    requestedBy: 'HR Operations',
    approvedBy: 'IT Manager',
    receivedBy: 'Omar Saleh',
    reason: 'Employee onboard asset issuance',
    condition: 'Good',
    accessories: 'Charger, Mouse, Backpack',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '15 Jun 2026 09:30', user: 'HR Team', status: 'Completed', note: 'New hire equipment allocation' },
      { stage: 'Approved', time: '15 Jun 2026 10:15', user: 'IT Manager', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '15 Jun 2026 11:15', user: 'Omar Saleh', status: 'Completed', note: 'Handover form signed' }
    ],
    workflow: [
      { level: 'HR & IT Approval', approver: 'Amina Al-Nuaimi', decision: 'Approved', timestamp: '15 Jun 2026 10:15', comments: 'Standard employee issue' }
    ],
    documents: [
      { name: 'employee_handover_signed.pdf', size: '390 KB', type: 'PDF Document', date: '15 Jun 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0008',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Store - Main',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '12 May 2026',
    movementTime: '16:40',
    status: 'Completed',
    requestedBy: 'IT Asset Team',
    approvedBy: 'Store Supervisor',
    receivedBy: 'Omar Saleh',
    reason: 'Transferred from warehouse staging to operational department pool',
    condition: 'Good',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'Ground Floor', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '12 May 2026 14:00', user: 'Store Keeper', status: 'Completed', note: 'Release from storage' },
      { stage: 'Approved', time: '12 May 2026 15:10', user: 'Store Supervisor', status: 'Completed', note: 'Approved' },
      { stage: 'Completed', time: '12 May 2026 16:40', user: 'Omar Saleh', status: 'Completed', note: 'Staging complete' }
    ],
    workflow: [
      { level: 'Warehouse Dispatch', approver: 'Bilal Qureshi', decision: 'Approved', timestamp: '12 May 2026 15:10', comments: 'Issued from buffer stock' }
    ],
    documents: [
      { name: 'warehouse_issue_slip.pdf', size: '175 KB', type: 'PDF Document', date: '12 May 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0007',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Maintenance Return',
    fromLocation: 'Service Center',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: '-',
    toCustodian: 'Omar Saleh',
    movementDate: '25 Apr 2026',
    movementTime: '11:00',
    status: 'Completed',
    requestedBy: 'Dell Authorized Service',
    approvedBy: 'IT Support Lead',
    receivedBy: 'Omar Saleh',
    reason: 'Returned from keyboard replacement and diagnostic under warranty',
    condition: 'Excellent',
    accessories: 'Charger',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'External', building: 'Dell Service Center', floor: 'GF', room: 'Service Lab' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Service Complete', time: '25 Apr 2026 09:30', user: 'Dell Technician', status: 'Completed', note: 'Repaired and QA passed' },
      { stage: 'Dispatched', time: '25 Apr 2026 10:15', user: 'Courier', status: 'Completed', note: 'Delivered to HQ' },
      { stage: 'Completed', time: '25 Apr 2026 11:00', user: 'Omar Saleh', status: 'Completed', note: 'Reintegrated into active pool' }
    ],
    workflow: [
      { level: 'Service Acceptance', approver: 'Rashid Mohammed', decision: 'Approved', timestamp: '25 Apr 2026 10:45', comments: 'Diagnostic report verified' }
    ],
    documents: [
      { name: 'service_job_card_signed.pdf', size: '410 KB', type: 'PDF Document', date: '25 Apr 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0006',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Sent for Maintenance',
    fromLocation: 'Block C > 2F / IT-301',
    toLocation: 'Service Center',
    fromCustodian: 'Omar Saleh',
    toCustodian: '-',
    movementDate: '10 Apr 2026',
    movementTime: '09:20',
    status: 'Completed',
    requestedBy: 'IT Helpdesk',
    approvedBy: 'Facilities / IT Manager',
    receivedBy: 'Dell Authorized Service',
    reason: 'Warranty repair: keyboard key stickiness diagnostic',
    condition: 'Fair',
    accessories: 'Laptop only (no charger)',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    destHierarchy: { site: 'External', building: 'Dell Service Center', floor: 'GF', room: 'Service Lab' },
    timeline: [
      { stage: 'Incident Raised', time: '10 Apr 2026 08:30', user: 'Omar Saleh', status: 'Completed', note: 'Ticket #INC-4920 opened' },
      { stage: 'Approved for RMA', time: '10 Apr 2026 08:55', user: 'IT Lead', status: 'Completed', note: 'Dell dispatch generated' },
      { stage: 'Completed', time: '10 Apr 2026 09:20', user: 'Logistics Courier', status: 'Completed', note: 'Dispatched to vendor' }
    ],
    workflow: [
      { level: 'RMA Approval', approver: 'Rashid Mohammed', decision: 'Approved', timestamp: '10 Apr 2026 08:55', comments: 'Covered under ProSupport' }
    ],
    documents: [
      { name: 'rma_dispatch_order.pdf', size: '280 KB', type: 'PDF Document', date: '10 Apr 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0005',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Custodian Transfer',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Omar Saleh',
    movementDate: '05 Mar 2026',
    movementTime: '15:45',
    status: 'Completed',
    requestedBy: 'Ahmed Khan',
    approvedBy: 'IT Team Lead',
    receivedBy: 'Omar Saleh',
    reason: 'Inter-team duty rotation custody handover',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Handover Initiated', time: '05 Mar 2026 15:00', user: 'Ahmed Khan', status: 'Completed', note: 'Duty rotation transfer' },
      { stage: 'Completed', time: '05 Mar 2026 15:45', user: 'Omar Saleh', status: 'Completed', note: 'Custody accepted' }
    ],
    workflow: [
      { level: 'Team Lead Approval', approver: 'Farhan Zaidi', decision: 'Approved', timestamp: '05 Mar 2026 15:20', comments: 'Approved' }
    ],
    documents: [
      { name: 'custody_shift_slip.pdf', size: '190 KB', type: 'PDF Document', date: '05 Mar 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0004',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Block B > 1F / IT-201',
    toLocation: 'Block C > 2F / IT-301',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Ahmed Khan',
    movementDate: '12 Jan 2026',
    movementTime: '10:15',
    status: 'Completed',
    requestedBy: 'Ahmed Khan',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Ahmed Khan',
    reason: 'Department team seat shifting to Block C expansion',
    condition: 'Good',
    accessories: 'Charger, Bag',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '2nd Floor', room: 'IT-301' },
    timeline: [
      { stage: 'Requested', time: '12 Jan 2026 09:00', user: 'Ahmed Khan', status: 'Completed', note: 'Floor seat move' },
      { stage: 'Completed', time: '12 Jan 2026 10:15', user: 'Ahmed Khan', status: 'Completed', note: 'Relocated' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '12 Jan 2026 09:30', comments: 'Seat updated' }
    ],
    documents: [
      { name: 'internal_movement_record.pdf', size: '160 KB', type: 'PDF Document', date: '12 Jan 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0003',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Assignment',
    fromLocation: '-',
    toLocation: '-',
    fromCustodian: '-',
    toCustodian: 'Ahmed Khan',
    movementDate: '05 Jan 2026',
    movementTime: '08:30',
    status: 'Completed',
    requestedBy: 'HR Onboarding',
    approvedBy: 'System Administrator',
    receivedBy: 'Ahmed Khan',
    reason: 'Initial assignment to developer on joining date',
    condition: 'New',
    accessories: 'Charger, Backpack, Mouse, Headset',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    timeline: [
      { stage: 'Requested', time: '05 Jan 2026 08:00', user: 'HR Onboarding', status: 'Completed', note: 'Issued on joining' },
      { stage: 'Completed', time: '05 Jan 2026 08:30', user: 'Ahmed Khan', status: 'Completed', note: 'Handover form signed' }
    ],
    workflow: [
      { level: 'Administrator Approval', approver: 'John Doe', decision: 'Approved', timestamp: '05 Jan 2026 08:15', comments: 'Asset released' }
    ],
    documents: [
      { name: 'initial_issue_slip.pdf', size: '295 KB', type: 'PDF Document', date: '05 Jan 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0002',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Location Transfer',
    fromLocation: 'Receiving Bay',
    toLocation: 'Store - Main',
    fromCustodian: '-',
    toCustodian: 'Store Keeper',
    movementDate: '02 Jan 2026',
    movementTime: '14:00',
    status: 'Completed',
    requestedBy: 'Receiving Team',
    approvedBy: 'Store Supervisor',
    receivedBy: 'Store Keeper',
    reason: 'Post-tagging buffer inventory intake',
    condition: 'New',
    accessories: 'Factory Sealed Box',
    site: 'Dubai HQ',
    department: 'Warehouse',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Receiving Bay' },
    destHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Store - Main' },
    timeline: [
      { stage: 'Tagged & Verified', time: '02 Jan 2026 13:00', user: 'RFID Operator', status: 'Completed', note: 'Tag EPC programmed' },
      { stage: 'Stored', time: '02 Jan 2026 14:00', user: 'Store Keeper', status: 'Completed', note: 'Placed on Shelf B-12' }
    ],
    workflow: [
      { level: 'QA Verification', approver: 'Store Supervisor', decision: 'Approved', timestamp: '02 Jan 2026 13:45', comments: 'Serial matched' }
    ],
    documents: [
      { name: 'tagging_compliance_sheet.pdf', size: '145 KB', type: 'PDF Document', date: '02 Jan 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0001',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Assignment',
    fromLocation: 'Supplier (Dell)',
    toLocation: 'Receiving Bay',
    fromCustodian: '-',
    toCustodian: 'Receiving Team',
    movementDate: '01 Jan 2026',
    movementTime: '10:00',
    status: 'Completed',
    requestedBy: 'Procurement (PO-2026-00123)',
    approvedBy: 'Finance Controller',
    receivedBy: 'Store Receiving',
    reason: 'Initial PO delivery receipt and intake',
    condition: 'New',
    accessories: 'Complete factory kit',
    site: 'Dubai HQ',
    department: 'Warehouse',
    sourceHierarchy: { site: 'External', building: 'Dell Technologies', floor: 'Dispatch', room: '-' },
    destHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Receiving Bay' },
    timeline: [
      { stage: 'PO Created', time: '20 Dec 2025 10:00', user: 'Procurement Officer', status: 'Completed', note: 'PO-2026-00123' },
      { stage: 'Delivered', time: '01 Jan 2026 09:30', user: 'Dell Logistics', status: 'Completed', note: 'Delivery Note #DN-8812' },
      { stage: 'GRN Registered', time: '01 Jan 2026 10:00', user: 'Store Receiving', status: 'Completed', note: 'GRN-2026-001 created' }
    ],
    workflow: [
      { level: 'Finance Approval', approver: 'Finance Controller', decision: 'Approved', timestamp: '22 Dec 2025 14:00', comments: 'Budget verified' }
    ],
    documents: [
      { name: 'goods_receipt_note.pdf', size: '520 KB', type: 'PDF Document', date: '01 Jan 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0013',
    assetNumber: 'AS-000124',
    assetName: 'Monitor - Samsung',
    serialNumber: 'SAMS8787',
    tagEpc: 'E28011606000002053A1B4C1',
    movementType: 'Assignment',
    fromLocation: 'Store - Main',
    toLocation: 'Block A > GF / Workstation 12',
    fromCustodian: '-',
    toCustodian: 'Sara Ali',
    movementDate: '10 Sep 2026',
    movementTime: '14:10',
    status: 'Completed',
    requestedBy: 'Finance Team',
    approvedBy: 'IT Lead',
    receivedBy: 'Sara Ali',
    reason: 'Dual monitor setup allocation for financial analyst',
    condition: 'Good',
    accessories: 'HDMI Cable, DisplayPort Cable, Power Cable',
    site: 'Dubai HQ',
    department: 'Finance',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'Workstation 12' },
    timeline: [
      { stage: 'Requested', time: '10 Sep 2026 11:00', user: 'Sara Ali', status: 'Completed', note: 'Peripherals request' },
      { stage: 'Completed', time: '10 Sep 2026 14:10', user: 'Sara Ali', status: 'Completed', note: 'Installed at workstation' }
    ],
    workflow: [
      { level: 'IT Approval', approver: 'John Doe', decision: 'Approved', timestamp: '10 Sep 2026 12:30', comments: 'Approved' }
    ],
    documents: [
      { name: 'monitor_handover_slip.pdf', size: '180 KB', type: 'PDF Document', date: '10 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0014',
    assetNumber: 'AS-000125',
    assetName: 'Printer - HP',
    serialNumber: 'CNB47892',
    tagEpc: '-',
    movementType: 'Location Transfer',
    fromLocation: 'Block A > 1F',
    toLocation: 'Block B > 1F / Print Room',
    fromCustodian: 'Unassigned',
    toCustodian: 'Unassigned',
    movementDate: '09 Sep 2026',
    movementTime: '16:40',
    status: 'Completed',
    requestedBy: 'Facilities Team',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Unassigned',
    reason: 'Consolidated network print center relocation',
    condition: 'Good',
    accessories: 'Power Cable, Network Cable',
    site: 'Dubai HQ',
    department: 'Facilities',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: '1st Floor', room: 'Hallway' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'Print Room' },
    timeline: [
      { stage: 'Requested', time: '09 Sep 2026 14:30', user: 'Facilities', status: 'Completed', note: 'Print room centralization' },
      { stage: 'Completed', time: '09 Sep 2026 16:40', user: 'Facilities Tech', status: 'Completed', note: 'Installed and network online' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '09 Sep 2026 15:00', comments: 'Centralization project' }
    ],
    documents: [
      { name: 'printer_relocation_order.pdf', size: '205 KB', type: 'PDF Document', date: '09 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0015',
    assetNumber: 'AS-000126',
    assetName: 'Access Point - Cisco',
    serialNumber: 'FCH9384',
    tagEpc: 'E28011606000002053A1B4C2',
    movementType: 'Site Transfer',
    fromLocation: 'Sharjah Hub',
    toLocation: 'Dubai HQ > Block B > 1F',
    fromCustodian: 'IT Team',
    toCustodian: 'IT Team',
    movementDate: '08 Sep 2026',
    movementTime: '09:00',
    status: 'In Transit',
    requestedBy: 'Network Engineer',
    approvedBy: 'IT Infrastructure Director',
    dispatchedBy: 'Courier Direct',
    receivedBy: 'Pending Receipt (Dubai HQ)',
    reason: 'Site-to-site equipment reallocation for Wi-Fi 6 coverage enhancement',
    condition: 'Good',
    accessories: 'Mounting bracket, PoE Injector',
    site: 'Dubai HQ',
    department: 'Operations',
    sourceHierarchy: { site: 'Sharjah Hub', building: 'Main Office', floor: '1F', room: 'Staging' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'Hallway East' },
    timeline: [
      { stage: 'Requested', time: '08 Sep 2026 07:30', user: 'Network Engineer', status: 'Completed', note: 'Inter-site transfer request' },
      { stage: 'Approved', time: '08 Sep 2026 08:00', user: 'IT Director', status: 'Completed', note: 'Approved' },
      { stage: 'Dispatched', time: '08 Sep 2026 08:30', user: 'Logistics Courier', status: 'Completed', note: 'Waybill #WB-9012' },
      { stage: 'In Transit', time: '08 Sep 2026 09:00', user: 'Transit Vehicle #4', status: 'Active', note: 'En route between Sharjah and Dubai' },
      { stage: 'Received', time: 'Pending', user: 'Dubai Receiving', status: 'Pending', note: 'Awaiting arrival at destination' }
    ],
    workflow: [
      { level: 'Site Transfer Approval', approver: 'IT Director', decision: 'Approved', timestamp: '08 Sep 2026 08:00', comments: 'Inter-site transfer authorized' }
    ],
    documents: [
      { name: 'inter_site_gatepass.pdf', size: '310 KB', type: 'PDF Document', date: '08 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0016',
    assetNumber: 'AS-000127',
    assetName: 'Chair - Office',
    serialNumber: '-',
    tagEpc: '-',
    movementType: 'Location Transfer',
    fromLocation: 'Block A > GF',
    toLocation: 'Block A > 2F',
    fromCustodian: 'Fatima Noor',
    toCustodian: 'Fatima Noor',
    movementDate: '07 Sep 2026',
    movementTime: '09:15',
    status: 'Completed',
    requestedBy: 'Fatima Noor',
    approvedBy: 'Facilities Lead',
    receivedBy: 'Fatima Noor',
    reason: 'Ergonomic task chair relocation to new workstation on Floor 2',
    condition: 'Good',
    accessories: 'Headrest',
    site: 'Dubai HQ',
    department: 'HR',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'GF-HR' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: '2nd Floor', room: 'HR Suite 204' },
    timeline: [
      { stage: 'Requested', time: '07 Sep 2026 08:30', user: 'Fatima Noor', status: 'Completed', note: 'Desk shift' },
      { stage: 'Completed', time: '07 Sep 2026 09:15', user: 'Fatima Noor', status: 'Completed', note: 'Moved and positioned' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Facilities Lead', decision: 'Approved', timestamp: '07 Sep 2026 08:45', comments: 'Approved' }
    ],
    documents: [
      { name: 'facilities_movement_permit.pdf', size: '140 KB', type: 'PDF Document', date: '07 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0017',
    assetNumber: 'AS-000128',
    assetName: 'Meeting Table',
    serialNumber: '-',
    tagEpc: '-',
    movementType: 'Location Transfer',
    fromLocation: 'Block B > 2F',
    toLocation: 'Block A > 2F',
    fromCustodian: 'Facilities Team',
    toCustodian: 'Facilities Team',
    movementDate: '06 Sep 2026',
    movementTime: '11:30',
    status: 'Completed',
    requestedBy: 'Executive Secretariat',
    approvedBy: 'Facilities Manager',
    receivedBy: 'Facilities Team',
    reason: 'Conference room re-arrangement for board meeting',
    condition: 'Good',
    accessories: 'Cable management grommets',
    site: 'Dubai HQ',
    department: 'Facilities',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '2nd Floor', room: 'Breakout 201' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: '2nd Floor', room: 'Boardroom A' },
    timeline: [
      { stage: 'Requested', time: '06 Sep 2026 10:00', user: 'Executive Secretariat', status: 'Completed', note: 'Boardroom prep' },
      { stage: 'Completed', time: '06 Sep 2026 11:30', user: 'Internal Movers', status: 'Completed', note: 'Moved and leveled' }
    ],
    workflow: [
      { level: 'Facilities Manager Approval', approver: 'Hamad Sultan', decision: 'Approved', timestamp: '06 Sep 2026 10:30', comments: 'Movers scheduled' }
    ],
    documents: [
      { name: 'boardroom_setup_order.pdf', size: '175 KB', type: 'PDF Document', date: '06 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0018',
    assetNumber: 'AS-000129',
    assetName: 'iPad - Admin',
    serialNumber: 'DMN7821',
    tagEpc: '-',
    movementType: 'Assignment',
    fromLocation: 'Store - Main',
    toLocation: 'Executive Suite',
    fromCustodian: '-',
    toCustodian: 'Rashid Mohammed',
    movementDate: '05 Sep 2026',
    movementTime: '14:20',
    status: 'Completed',
    requestedBy: 'Executive Office',
    approvedBy: 'IT Director',
    receivedBy: 'Rashid Mohammed',
    reason: 'Executive tablet issuance for executive committee meetings',
    condition: 'New',
    accessories: 'Apple Pencil, Smart Keyboard Folio, Fast Charger',
    site: 'Dubai HQ',
    department: 'Management',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: '3rd Floor', room: 'Executive Suite 301' },
    timeline: [
      { stage: 'Requested', time: '05 Sep 2026 11:00', user: 'Executive Secretary', status: 'Completed', note: 'Executive issue' },
      { stage: 'Completed', time: '05 Sep 2026 14:20', user: 'Rashid Mohammed', status: 'Completed', note: 'Handed over and MDM enrolled' }
    ],
    workflow: [
      { level: 'Executive Approval', approver: 'IT Director', decision: 'Approved', timestamp: '05 Sep 2026 11:30', comments: 'VIP issuance' }
    ],
    documents: [
      { name: 'executive_handover_signed.pdf', size: '360 KB', type: 'PDF Document', date: '05 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0019',
    assetNumber: 'AS-000130',
    assetName: 'Projector - Epson',
    serialNumber: 'EP-9842',
    tagEpc: '-',
    movementType: 'Location Transfer',
    fromLocation: 'Block C > 1F',
    toLocation: 'Conference Room 1',
    fromCustodian: 'Layla Hassan',
    toCustodian: 'Layla Hassan',
    movementDate: '04 Sep 2026',
    movementTime: '16:00',
    status: 'Completed',
    requestedBy: 'Marketing Team',
    approvedBy: 'Facilities Lead',
    receivedBy: 'Layla Hassan',
    reason: 'Marketing product showcase presentation setup',
    condition: 'Good',
    accessories: 'Remote Control, HDMI Cable, Power Cord, Case',
    site: 'Dubai HQ',
    department: 'Marketing',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block C', floor: '1st Floor', room: 'Marketing 102' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'Conference Room 1' },
    timeline: [
      { stage: 'Requested', time: '04 Sep 2026 14:00', user: 'Layla Hassan', status: 'Completed', note: 'Showcase setup' },
      { stage: 'Completed', time: '04 Sep 2026 16:00', user: 'Layla Hassan', status: 'Completed', note: 'Testing complete' }
    ],
    workflow: [
      { level: 'Facilities Approval', approver: 'Facilities Lead', decision: 'Approved', timestamp: '04 Sep 2026 14:30', comments: 'Approved' }
    ],
    documents: [
      { name: 'conference_equipment_permit.pdf', size: '195 KB', type: 'PDF Document', date: '04 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0020',
    assetNumber: 'AS-000131',
    assetName: 'Fire Extinguisher',
    serialNumber: '-',
    tagEpc: '-',
    movementType: 'Location Transfer',
    fromLocation: 'Warehouse',
    toLocation: 'Block A > GF',
    fromCustodian: 'Facilities Team',
    toCustodian: 'Facilities Team',
    movementDate: '03 Sep 2026',
    movementTime: '10:45',
    status: 'Completed',
    requestedBy: 'HSE Officer',
    approvedBy: 'HSE Manager',
    receivedBy: 'Facilities Team',
    reason: 'Routine quarterly fire safety replenishment and station mounting',
    condition: 'Good',
    accessories: 'Mounting bracket, Inspection Tag',
    site: 'Dubai HQ',
    department: 'Facilities',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Warehouse', floor: 'GF', room: 'Safety Store' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'Ground Floor', room: 'Corridor Post 4' },
    timeline: [
      { stage: 'Requested', time: '03 Sep 2026 09:00', user: 'HSE Officer', status: 'Completed', note: 'Safety audit replacement' },
      { stage: 'Completed', time: '03 Sep 2026 10:45', user: 'Safety Tech', status: 'Completed', note: 'Mounted and certified' }
    ],
    workflow: [
      { level: 'Safety Compliance', approver: 'HSE Manager', decision: 'Approved', timestamp: '03 Sep 2026 09:30', comments: 'Pressure tested' }
    ],
    documents: [
      { name: 'hse_inspection_certificate.pdf', size: '240 KB', type: 'PDF Document', date: '03 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0021',
    assetNumber: 'AS-000132',
    assetName: 'Switch - Cisco',
    serialNumber: 'SW-4801',
    tagEpc: '-',
    movementType: 'Site Transfer',
    fromLocation: 'Dubai HQ > Staging Area',
    toLocation: 'Abu Dhabi Branch > Server Room',
    fromCustodian: 'IT Team',
    toCustodian: 'IT Team',
    movementDate: '02 Sep 2026',
    movementTime: '08:30',
    status: 'In Transit',
    requestedBy: 'Network Infrastructure Lead',
    approvedBy: 'IT Infrastructure Director',
    dispatchedBy: 'Secure Courier Express',
    receivedBy: 'Pending Receipt (Abu Dhabi)',
    reason: 'Core switch deployment for Abu Dhabi site network upgrade',
    condition: 'New',
    accessories: 'Rack ears, Dual Power Supplies, Console Cable',
    site: 'Abu Dhabi Branch',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'GF', room: 'Staging Area' },
    destHierarchy: { site: 'Abu Dhabi Branch', building: 'Main Office', floor: 'Basement', room: 'Server Room' },
    timeline: [
      { stage: 'Requested', time: '01 Sep 2026 14:00', user: 'Network Lead', status: 'Completed', note: 'Abu Dhabi upgrade' },
      { stage: 'Approved', time: '01 Sep 2026 16:30', user: 'IT Director', status: 'Completed', note: 'Approved' },
      { stage: 'Dispatched', time: '02 Sep 2026 07:45', user: 'Logistics', status: 'Completed', note: 'Waybill #AD-5512' },
      { stage: 'In Transit', time: '02 Sep 2026 08:30', user: 'Transit Vehicle #1', status: 'Active', note: 'En route to Abu Dhabi' },
      { stage: 'Received', time: 'Pending', user: 'Abu Dhabi IT', status: 'Pending', note: 'Awaiting delivery confirmation' }
    ],
    workflow: [
      { level: 'Director Approval', approver: 'IT Director', decision: 'Approved', timestamp: '01 Sep 2026 16:30', comments: 'Critical infrastructure move' }
    ],
    documents: [
      { name: 'inter_branch_dispatch_order.pdf', size: '350 KB', type: 'PDF Document', date: '02 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0022',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Inter-company Transfer',
    fromLocation: 'Infotattwa UAE',
    toLocation: 'Infotattwa KSA',
    fromCustodian: 'Sara Ali',
    toCustodian: 'Pending Receipt',
    movementDate: '01 Sep 2026',
    movementTime: '12:00',
    status: 'Pending Receipt',
    requestedBy: 'Regional Operations Manager',
    approvedBy: 'Group Finance & Legal',
    dispatchedBy: 'DHL Global Forwarding',
    receivedBy: 'Pending Receipt (KSA Office)',
    reason: 'Cross-border inter-company asset transfer for Riyadh regional office launch',
    condition: 'Good',
    accessories: 'Charger, Multi-country adapter plug, Carrying Case',
    site: 'Riyadh DC',
    department: 'Operations',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'IT-201' },
    destHierarchy: { site: 'Riyadh DC', building: 'Olaya Tower', floor: '14F', room: 'Finance Suite' },
    timeline: [
      { stage: 'Requested', time: '28 Aug 2026 10:00', user: 'Operations Manager', status: 'Completed', note: 'Inter-entity transfer' },
      { stage: 'Approved', time: '30 Aug 2026 11:30', user: 'Group Legal & Tax', status: 'Completed', note: 'Customs declaration ready' },
      { stage: 'Dispatched', time: '01 Sep 2026 10:00', user: 'DHL International', status: 'Completed', note: 'Tracking #DHL-994182' },
      { stage: 'Pending Receipt', time: '01 Sep 2026 12:00', user: 'KSA Store Keeper', status: 'Active', note: 'Customs clearance complete; awaiting local receipt' }
    ],
    workflow: [
      { level: 'Group Tax & Customs Approval', approver: 'Sami Haddad', decision: 'Approved', timestamp: '30 Aug 2026 11:30', comments: 'Customs duty cleared' }
    ],
    documents: [
      { name: 'commercial_invoice_crossborder.pdf', size: '420 KB', type: 'PDF Document', date: '01 Sep 2026' },
      { name: 'customs_declaration_form.pdf', size: '510 KB', type: 'PDF Document', date: '01 Sep 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0023',
    assetNumber: 'AS-000127',
    assetName: 'Chair - Office',
    serialNumber: '-',
    tagEpc: '-',
    movementType: 'Disposal Movement',
    fromLocation: 'Block A > 2F',
    toLocation: 'Scrap Yard',
    fromCustodian: 'Fatima Noor',
    toCustodian: 'Disposal Vendor',
    movementDate: '28 Aug 2026',
    movementTime: '15:30',
    status: 'Cancelled',
    requestedBy: 'Junior Facilities Assistant',
    approvedBy: 'Facilities Manager (Rejected)',
    receivedBy: '-',
    reason: 'Requested for write-off but found to be completely repairable with caster replacement',
    condition: 'Good',
    accessories: '-',
    site: 'Dubai HQ',
    department: 'Facilities',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: '2nd Floor', room: 'HR 204' },
    destHierarchy: { site: 'Scrap Yard', building: 'Yard B', floor: 'Ground', room: '-' },
    timeline: [
      { stage: 'Requested', time: '28 Aug 2026 11:00', user: 'Facilities Assistant', status: 'Completed', note: 'Disposal proposed' },
      { stage: 'Rejected / Cancelled', time: '28 Aug 2026 15:30', user: 'Facilities Manager', status: 'Cancelled', note: 'Repair work order created instead; disposal cancelled' }
    ],
    workflow: [
      { level: 'Disposal Committee Review', approver: 'Hamad Sultan', decision: 'Rejected', timestamp: '28 Aug 2026 15:30', comments: 'Asset is in good condition; caster replaced in-house.' }
    ],
    documents: [
      { name: 'disposal_cancellation_memo.pdf', size: '165 KB', type: 'PDF Document', date: '28 Aug 2026' }
    ],
    bulkAssets: []
  },
  {
    movementId: 'MOV-2026-0024',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    serialNumber: '75K3D24',
    tagEpc: 'E28011606000002053A1B4C0',
    movementType: 'Bulk Transfer',
    fromLocation: 'Block A > Store',
    toLocation: 'Block B > Floor 1',
    fromCustodian: 'Store Keeper',
    toCustodian: 'IT Deployment Pool',
    movementDate: '25 Aug 2026',
    movementTime: '10:00',
    status: 'Completed',
    requestedBy: 'IT Project Manager',
    approvedBy: 'IT Infrastructure Director',
    receivedBy: 'IT Deployment Team',
    reason: 'Batch relocation of 15 developer laptops for Project Falcon release team',
    condition: 'Good',
    accessories: 'Standard accessories kit',
    site: 'Dubai HQ',
    department: 'IT Department',
    sourceHierarchy: { site: 'Dubai HQ', building: 'Block A', floor: 'GF', room: 'Store - Main' },
    destHierarchy: { site: 'Dubai HQ', building: 'Block B', floor: '1st Floor', room: 'Deployment Lab' },
    timeline: [
      { stage: 'Bulk Request Raised', time: '24 Aug 2026 15:00', user: 'Project Manager', status: 'Completed', note: 'Batch of 15 assets requested' },
      { stage: 'Batch Approved', time: '25 Aug 2026 09:00', user: 'IT Director', status: 'Completed', note: 'Bulk move authorized' },
      { stage: 'Completed', time: '25 Aug 2026 10:00', user: 'Deployment Team', status: 'Completed', note: 'All 15 units verified and tagged' }
    ],
    workflow: [
      { level: 'Bulk Transfer Approval', approver: 'IT Director', decision: 'Approved', timestamp: '25 Aug 2026 09:00', comments: 'Project Falcon release allocation' }
    ],
    documents: [
      { name: 'bulk_transfer_manifest.pdf', size: '540 KB', type: 'PDF Document', date: '25 Aug 2026' }
    ],
    bulkAssets: [
      { assetNumber: 'AS-000123', assetName: 'Laptop - Dell 5440', serialNumber: '75K3D24', status: 'Transferred' },
      { assetNumber: 'AS-000124', assetName: 'Monitor - Samsung', serialNumber: 'SAMS8787', status: 'Transferred' },
      { assetNumber: 'AS-000126', assetName: 'Access Point - Cisco', serialNumber: 'FCH9384', status: 'Transferred' }
    ]
  }
];


export class CustodyTransfersService {
  /**
   * Get KPI Summary Cards data matching Screenshot 25
   */
  static async getKpis() {
    const totalAssets = assetsStore.length; // 1248
    const assignedAssets = assetsStore.filter(a => a.status === 'Assigned').length; // 1102
    const unassignedAssets = totalAssets - assignedAssets; // 146
    const pendingTransfers = pendingApprovalsStore.length; // 12
    const transfersThisMonth = 78;

    return {
      totalAssets,
      assignedAssets,
      assignedPercentage: 88,
      unassignedAssets,
      unassignedPercentage: 12,
      pendingTransfers,
      transfersThisMonth
    };
  }

  /**
   * Get Assets list with comprehensive server-side filtering, searching & pagination
   */
  static async getAssets(params = {}) {
    const {
      search = '',
      site = 'All Sites',
      building = 'All Buildings',
      location = 'All Locations',
      assetType = 'All Types',
      department = 'All Departments',
      assignedTo = 'All Users',
      status = 'All Status',
      page = 1,
      limit = 10,
      sortBy = 'assetNumber',
      sortOrder = 'asc'
    } = params;

    let filtered = [...assetsStore];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.assetNumber?.toLowerCase().includes(q) ||
        a.assetName?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.tagEpc?.toLowerCase().includes(q)
      );
    }

    if (site && site !== 'All Sites') {
      filtered = filtered.filter(a => a.site === site);
    }
    if (building && building !== 'All Buildings') {
      filtered = filtered.filter(a => a.building === building);
    }
    if (location && location !== 'All Locations') {
      filtered = filtered.filter(a => a.currentLocation?.includes(location));
    }
    if (assetType && assetType !== 'All Types') {
      filtered = filtered.filter(a => a.assetType === assetType);
    }
    if (department && department !== 'All Departments') {
      filtered = filtered.filter(a => a.department === department);
    }
    if (assignedTo && assignedTo !== 'All Users') {
      filtered = filtered.filter(a => a.assignedTo === assignedTo);
    }
    if (status && status !== 'All Status') {
      filtered = filtered.filter(a => a.status === status);
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (sortOrder === 'desc') {
        return valB.localeCompare(valA);
      }
      return valA.localeCompare(valB);
    });

    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      assets: paginated
    };
  }

  /**
   * Get Single Asset Details with sub-tabs
   */
  static async getAssetById(assetId) {
    const asset = assetsStore.find(a => a.id === assetId || a.assetNumber === assetId);
    if (!asset) return null;

    const assignmentInfo = {
      assignedTo: asset.assignedTo,
      assignedToId: asset.assignedToId,
      department: asset.department,
      assignedDate: asset.assignedDate,
      purpose: 'Regular Employee Issue',
      conditionAtIssue: 'Good',
      accessories: 'Charger, Bag, Power Cord',
      acknowledged: true,
      acknowledgementDate: asset.assignedDate
    };

    const history = movementHistoryStore.filter(h => h.assetNumber === asset.assetNumber);

    return {
      ...asset,
      assignmentInfo,
      movementHistory: history
    };
  }

  /**
   * Submit Asset Assignment
   */
  static async submitAssignment(payload, user) {
    const {
      assetId,
      assignmentType = 'Employee',
      assignedTo,
      department,
      location = 'Dubai HQ',
      building = 'Block A',
      floor = 'Ground Floor',
      room = 'IT-101',
      assignmentDate = new Date().toISOString().slice(0, 10),
      expectedReturnDate,
      assignmentPurpose = 'Regular Use',
      conditionAtIssue = 'Good',
      accessoriesIncluded,
      remarks,
      signatureData,
      photoEvidence,
      requireApproval = false,
      isDraft = false
    } = payload;

    const asset = assetsStore.find(a => a.id === assetId || a.assetNumber === assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);

    const assignmentId = `ASN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const timestamp = new Date().toISOString();

    if (isDraft) {
      return {
        success: true,
        isDraft: true,
        assignmentId,
        message: 'Assignment saved as draft successfully.'
      };
    }

    if (requireApproval) {
      const requestId = `REQ-${String(Math.floor(10000 + Math.random() * 90000))}`;
      const approvalReq = {
        requestId,
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        requestType: 'Assignment',
        requestedBy: user?.name || assignedTo || 'Ahmed Khan',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending',
        fromLocation: asset.currentLocation,
        toLocation: `${location} > ${building} > ${floor}`,
        newCustodian: assignedTo
      };
      pendingApprovalsStore.unshift(approvalReq);

      return {
        success: true,
        requireApproval: true,
        requestId,
        message: 'Assignment submitted for workflow approval.'
      };
    }

    // Update Asset Master directly
    const previousCustodian = asset.assignedTo;
    const previousLocation = asset.currentLocation;

    asset.status = 'Assigned';
    asset.assignedTo = assignedTo;
    asset.department = department || asset.department;
    asset.site = location;
    asset.building = building;
    asset.floor = floor;
    asset.room = room;
    asset.currentLocation = `${location} > ${building} > ${floor}`;
    asset.fullLocation = `${location} > ${building} > ${floor} > ${room}`;
    asset.assignedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    asset.lastMovedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Record in Recent Activity
    recentMovementsStore.unshift({
      id: `REC-${Date.now().toString().slice(-4)}`,
      dateTime: asset.lastMoved,
      assetNo: asset.assetNumber,
      assetName: asset.assetName,
      action: 'Assigned',
      from: previousLocation,
      to: asset.currentLocation,
      by: user?.name || assignedTo || 'Ahmed Khan',
      status: 'Completed'
    });

    // Record in Movement History
    movementHistoryStore.unshift({
      movementId: `MOV-${Date.now().toString().slice(-6)}`,
      assetNumber: asset.assetNumber,
      assetName: asset.assetName,
      movementType: 'Custodian Assignment',
      fromLocation: previousLocation,
      toLocation: asset.fullLocation,
      previousCustodian,
      newCustodian: assignedTo,
      movementDate: asset.lastMoved,
      requestedBy: user?.name || 'System Admin',
      approvedBy: 'Auto-Approved (Direct Issue)',
      receivedBy: assignedTo,
      reason: assignmentPurpose,
      condition: conditionAtIssue,
      status: 'Completed',
      remarks: remarks || accessoriesIncluded || 'Assigned'
    });

    return {
      success: true,
      assignmentId,
      asset,
      message: 'Asset assigned successfully.'
    };
  }

  /**
   * Submit Asset Transfer / Movement
   */
  static async submitTransfer(payload, user) {
    const {
      assetIds = [],
      transferType = 'Location Transfer', // Location, Department, Custodian, Site-to-Site, Inter-Company, Bulk
      destinationSite = 'Dubai HQ',
      destinationBuilding = 'Block A',
      destinationFloor = '1st Floor',
      destinationRoom = 'Room 101',
      destinationDepartment,
      newCustodian,
      effectiveDate = new Date().toISOString().slice(0, 10),
      reason = 'Inter-department reallocation',
      condition = 'Good',
      requireDispatch = false,
      requireApproval = false
    } = payload;

    const movementId = `MOV-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const timestamp = new Date().toISOString();

    const affectedAssets = [];

    for (const assetId of assetIds) {
      const asset = assetsStore.find(a => a.id === assetId || a.assetNumber === assetId);
      if (!asset) continue;

      if (requireApproval) {
        pendingApprovalsStore.unshift({
          requestId: `REQ-${String(Math.floor(10000 + Math.random() * 90000))}`,
          assetNo: asset.assetNumber,
          assetName: asset.assetName,
          requestType: 'Transfer',
          requestedBy: user?.name || 'Authorized Requester',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pending',
          fromLocation: asset.currentLocation,
          toLocation: `${destinationSite} > ${destinationBuilding} > ${destinationFloor}`,
          newCustodian: newCustodian || asset.assignedTo
        });
        continue;
      }

      const prevLocation = asset.currentLocation;
      const prevCustodian = asset.assignedTo;

      if (requireDispatch) {
        asset.status = 'In Transit';
        asset.remarks = `In transit to ${destinationSite} (${destinationRoom})`;
      } else {
        asset.currentLocation = `${destinationSite} > ${destinationBuilding} > ${destinationFloor}`;
        asset.fullLocation = `${destinationSite} > ${destinationBuilding} > ${destinationFloor} > ${destinationRoom}`;
        asset.site = destinationSite;
        asset.building = destinationBuilding;
        asset.floor = destinationFloor;
        asset.room = destinationRoom;
        if (destinationDepartment) asset.department = destinationDepartment;
        if (newCustodian) asset.assignedTo = newCustodian;
      }

      asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      asset.lastMovedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      recentMovementsStore.unshift({
        id: `REC-${Date.now().toString().slice(-4)}`,
        dateTime: asset.lastMoved,
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        action: 'Transferred',
        from: prevLocation,
        to: asset.currentLocation,
        by: user?.name || 'Operator',
        status: requireDispatch ? 'In Transit' : 'Completed'
      });

      movementHistoryStore.unshift({
        movementId,
        assetNumber: asset.assetNumber,
        assetName: asset.assetName,
        movementType: transferType,
        fromLocation: prevLocation,
        toLocation: asset.fullLocation,
        previousCustodian: prevCustodian,
        newCustodian: newCustodian || prevCustodian,
        movementDate: asset.lastMoved,
        requestedBy: user?.name || 'Operations',
        approvedBy: 'Standard Approval',
        receivedBy: requireDispatch ? 'Pending Receipt' : (newCustodian || prevCustodian),
        reason,
        condition,
        status: requireDispatch ? 'In Transit' : 'Completed',
        remarks: `Transfer ${transferType}`
      });

      affectedAssets.push(asset);
    }

    return {
      success: true,
      movementId,
      totalMoved: affectedAssets.length,
      assets: affectedAssets,
      message: requireApproval ? 'Transfer request submitted for approval.' : 'Transfer completed successfully.'
    };
  }

  /**
   * Confirm Receipt of In-Transit Asset
   */
  static async confirmReceipt(transferId, payload, user) {
    const { assetNumber, receivedCondition = 'Good', remarks } = payload;
    const asset = assetsStore.find(a => a.assetNumber === assetNumber);
    if (!asset) throw new Error('Asset not found');

    asset.status = 'Assigned';
    asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      success: true,
      message: 'Receipt confirmed. Asset Master updated to active destination.',
      asset
    };
  }

  /**
   * Process Pending Approval Action (Approve / Reject)
   */
  static async processApproval(requestId, action, remarks, user) {
    const idx = pendingApprovalsStore.findIndex(p => p.requestId === requestId);
    if (idx === -1) throw new Error('Approval request not found');

    const req = pendingApprovalsStore[idx];
    pendingApprovalsStore.splice(idx, 1);

    const asset = assetsStore.find(a => a.assetNumber === req.assetNo);

    if (action === 'APPROVE' && asset) {
      asset.currentLocation = req.toLocation;
      if (req.newCustodian) asset.assignedTo = req.newCustodian;
      asset.status = 'Assigned';

      recentMovementsStore.unshift({
        id: `REC-${Date.now().toString().slice(-4)}`,
        dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 12:00',
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        action: req.requestType === 'Assignment' ? 'Assigned' : 'Transferred',
        from: req.fromLocation,
        to: req.toLocation,
        by: req.requestedBy,
        status: 'Completed'
      });
    }

    return {
      success: true,
      requestId,
      action,
      message: `Request ${requestId} has been ${action === 'APPROVE' ? 'Approved' : 'Rejected'}.`
    };
  }

  /**
   * Get Pending Approvals list
   */
  static async getPendingApprovals() {
    return pendingApprovalsStore;
  }

  /**
   * Get Recent Assignments & Movements list
   */
  static async getRecentMovements() {
    return recentMovementsStore;
  }

  /**
   * Get Movement History list with server-side filters, search, pagination & KPIs
   */
  static async getMovementHistory(params = {}) {
    const {
      search = '',
      assetNo = '',
      movementType = 'All',
      site = 'All Sites',
      department = 'All Departments',
      custodian = 'All',
      status = 'All',
      fromDate = '',
      toDate = '',
      page = 1,
      limit = 10
    } = params;

    let filtered = [...movementHistoryStore];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(m =>
        m.movementId.toLowerCase().includes(q) ||
        m.assetNumber.toLowerCase().includes(q) ||
        m.assetName.toLowerCase().includes(q) ||
        (m.serialNumber && m.serialNumber.toLowerCase().includes(q)) ||
        (m.fromLocation && m.fromLocation.toLowerCase().includes(q)) ||
        (m.toLocation && m.toLocation.toLowerCase().includes(q)) ||
        (m.fromCustodian && m.fromCustodian.toLowerCase().includes(q)) ||
        (m.toCustodian && m.toCustodian.toLowerCase().includes(q))
      );
    }

    if (assetNo && assetNo.trim() && assetNo !== 'All') {
      const a = assetNo.trim().toLowerCase();
      filtered = filtered.filter(m => m.assetNumber.toLowerCase() === a);
    }

    if (movementType && movementType !== 'All') {
      filtered = filtered.filter(m => m.movementType.toLowerCase() === movementType.toLowerCase());
    }

    if (site && site !== 'All Sites' && site !== 'All') {
      filtered = filtered.filter(m => m.site && m.site.toLowerCase() === site.toLowerCase());
    }

    if (department && department !== 'All Departments' && department !== 'All') {
      filtered = filtered.filter(m => m.department && m.department.toLowerCase() === department.toLowerCase());
    }

    if (custodian && custodian !== 'All') {
      const c = custodian.toLowerCase();
      filtered = filtered.filter(m =>
        (m.fromCustodian && m.fromCustodian.toLowerCase().includes(c)) ||
        (m.toCustodian && m.toCustodian.toLowerCase().includes(c))
      );
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(m => m.status.toLowerCase() === status.toLowerCase());
    }

    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    const kpis = {
      totalMovements: movementHistoryStore.length,
      completed: movementHistoryStore.filter(m => m.status === 'Completed').length,
      inTransit: movementHistoryStore.filter(m => m.status === 'In Transit').length,
      pendingReceipt: movementHistoryStore.filter(m => m.status === 'Pending Receipt').length,
      cancelledRejected: movementHistoryStore.filter(m => m.status === 'Cancelled' || m.status === 'Rejected').length
    };

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      kpis,
      history: paginated
    };
  }

  /**
   * Get Single Movement Record by ID with full timeline, workflow & documents
   */
  static async getMovementById(movementId) {
    const movement = movementHistoryStore.find(m => m.movementId === movementId);
    if (!movement) return null;

    const asset = assetsStore.find(a => a.assetNumber === movement.assetNumber);

    return {
      ...movement,
      assetDetails: asset || null
    };
  }
}

export default CustodyTransfersService;
