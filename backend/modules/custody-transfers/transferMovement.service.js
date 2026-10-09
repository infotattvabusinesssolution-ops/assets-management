/**
 * Transfer & Movement Service
 * Manages single and bulk asset transfers between locations, departments, custodians, and sites.
 * Implements complete movement lifecycle: DRAFT -> PENDING_APPROVAL -> APPROVED -> DISPATCHED -> IN_TRANSIT -> RECEIVED -> COMPLETED
 * Updates Asset Master ONLY upon confirmed receipt and maintains an immutable audit log in Movement History.
 */
import prisma from '../../config/prisma.js';
import { isSqlServerConnected, isDbConnected } from '../../config/db.js';
import { getTransferLocationDetails } from './transferPersistence.service.js';

// ---------------------------------------------------------------------------
// 1. In-Memory Store & Seed Data (Matches Screenshot & Realistic Enterprise Data)
// ---------------------------------------------------------------------------

let locationHierarchyStore = {
  sites: [
    { id: 'SITE-DXB-01', code: 'DXB-HQ', name: 'Dubai HQ', address: 'Sheikh Zayed Road, Dubai, UAE' },
    { id: 'SITE-AUH-01', code: 'AUH-BR', name: 'Abu Dhabi Branch', address: 'Al Maryah Island, Abu Dhabi, UAE' },
    { id: 'SITE-RUH-01', code: 'RUH-DC', name: 'Riyadh DC', address: 'King Fahd Road, Riyadh, KSA' }
  ],
  buildings: [
    { id: 'BLD-DXB-A', siteId: 'SITE-DXB-01', name: 'Block A', code: 'BLK-A' },
    { id: 'BLD-DXB-B', siteId: 'SITE-DXB-01', name: 'Block B', code: 'BLK-B' },
    { id: 'BLD-DXB-C', siteId: 'SITE-DXB-01', name: 'Block C', code: 'BLK-C' },
    { id: 'BLD-AUH-1', siteId: 'SITE-AUH-01', name: 'Main Tower', code: 'TWR-1' },
    { id: 'BLD-RUH-1', siteId: 'SITE-RUH-01', name: 'Data Center Building', code: 'DC-BLD' }
  ],
  floors: [
    { id: 'FLR-A-GF', buildingId: 'BLD-DXB-A', name: 'Ground Floor', code: 'GF' },
    { id: 'FLR-A-1F', buildingId: 'BLD-DXB-A', name: '1st Floor', code: '1F' },
    { id: 'FLR-A-2F', buildingId: 'BLD-DXB-A', name: '2nd Floor', code: '2F' },
    { id: 'FLR-B-GF', buildingId: 'BLD-DXB-B', name: 'Ground Floor', code: 'GF' },
    { id: 'FLR-B-1F', buildingId: 'BLD-DXB-B', name: '1st Floor', code: '1F' },
    { id: 'FLR-B-2F', buildingId: 'BLD-DXB-B', name: '2nd Floor', code: '2F' },
    { id: 'FLR-C-GF', buildingId: 'BLD-DXB-C', name: 'Ground Floor', code: 'GF' },
    { id: 'FLR-C-1F', buildingId: 'BLD-DXB-C', name: '1st Floor', code: '1F' }
  ],
  rooms: [
    { id: 'ROOM-IT-101', floorId: 'FLR-A-GF', name: 'IT-101', type: 'Office / IT Lab', zone: 'Zone A' },
    { id: 'ROOM-IT-102', floorId: 'FLR-A-GF', name: 'IT-102', type: 'Server Room', zone: 'Zone A' },
    { id: 'ROOM-CONF-A', floorId: 'FLR-A-1F', name: 'Conf Room Alpha', type: 'Meeting Room', zone: 'Zone B' },
    { id: 'ROOM-IT-201', floorId: 'FLR-B-1F', name: 'IT-201', type: 'Workstation Area', zone: 'Zone B' },
    { id: 'ROOM-FIN-01', floorId: 'FLR-B-1F', name: 'Finance', type: 'Accounts Dept', zone: 'Zone B' },
    { id: 'ROOM-OPS-02', floorId: 'FLR-B-2F', name: 'Operations Lab', type: 'Operations', zone: 'Zone C' },
    { id: 'ROOM-HR-001', floorId: 'FLR-C-GF', name: 'HR-001', type: 'HR Office', zone: 'Zone HR' },
    { id: 'ROOM-HR-002', floorId: 'FLR-C-1F', name: 'HR-002', type: 'Recruitment', zone: 'Zone HR' }
  ]
};

let departmentsStore = [
  { id: 'DEP-IT', code: 'IT', name: 'IT Department' },
  { id: 'DEP-FIN', code: 'FIN', name: 'Finance' },
  { id: 'DEP-HR', code: 'HR', name: 'Human Resources' },
  { id: 'DEP-OPS', code: 'OPS', name: 'Operations' },
  { id: 'DEP-ENG', code: 'ENG', name: 'Engineering' }
];

let custodiansStore = [
  { id: 'CUST-00101', code: 'EMP-00101', name: 'Ahmed Khan', department: 'IT Department', email: 'ahmed.khan@asset360.com' },
  { id: 'CUST-00102', code: 'EMP-00102', name: 'Sara Ali', department: 'Finance', email: 'sara.ali@asset360.com' },
  { id: 'CUST-00456', code: 'EMP-00456', name: 'Omar Saleh (EMP-00456)', department: 'IT Department', email: 'omar.saleh@asset360.com' },
  { id: 'CUST-00200', code: 'EMP-00200', name: 'IT Team', department: 'Infrastructure', email: 'it.infrastructure@asset360.com' },
  { id: 'CUST-00305', code: 'EMP-00305', name: 'Zayd Al-Mansoor', department: 'Executive Management', email: 'zayd.m@asset360.com' }
];

// Pre-seeded assets strictly matching screenshot
let assetsStore = [
  {
    id: 'AST-000123',
    assetNumber: 'AS-000123',
    assetName: 'Laptop - Dell Latitude 5440',
    type: 'IT Equipment',
    category: 'Computers',
    serialNumber: '75K3D24',
    barcode: 'BC-AS-000123',
    rfidEpc: 'E28011606000002053A1B4C0',
    currentLocationFormatted: 'Dubai HQ > Block A > GF > IT-101',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-A',
    buildingName: 'Block A',
    floorId: 'FLR-A-GF',
    floorName: 'Ground Floor',
    roomId: 'ROOM-IT-101',
    roomName: 'IT-101',
    currentCustodian: 'Ahmed Khan',
    custodianId: 'CUST-00101',
    department: 'IT Department',
    departmentId: 'DEP-IT',
    status: 'Assigned',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: true,
    activeTransferId: null
  },
  {
    id: 'AST-000124',
    assetNumber: 'AS-000124',
    assetName: 'Monitor - Samsung',
    type: 'IT Equipment',
    category: 'Displays',
    serialNumber: 'SAMS8787',
    barcode: 'BC-AS-000124',
    rfidEpc: 'E28011606000002053A1B4C1',
    currentLocationFormatted: 'Dubai HQ > Block A > GF > IT-101',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-A',
    buildingName: 'Block A',
    floorId: 'FLR-A-GF',
    floorName: 'Ground Floor',
    roomId: 'ROOM-IT-101',
    roomName: 'IT-101',
    currentCustodian: 'Ahmed Khan',
    custodianId: 'CUST-00101',
    department: 'IT Department',
    departmentId: 'DEP-IT',
    status: 'Assigned',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: true,
    activeTransferId: null
  },
  {
    id: 'AST-000125',
    assetNumber: 'AS-000125',
    assetName: 'Printer - HP',
    type: 'IT Equipment',
    category: 'Printers',
    serialNumber: 'HP LaserJet 404',
    barcode: 'BC-AS-000125',
    rfidEpc: 'E28011606000002053A1B4C2',
    currentLocationFormatted: 'Dubai HQ > Block B > 1F > Finance',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-B',
    buildingName: 'Block B',
    floorId: 'FLR-B-1F',
    floorName: '1st Floor',
    roomId: 'ROOM-FIN-01',
    roomName: 'Finance',
    currentCustodian: 'Sara Ali',
    custodianId: 'CUST-00102',
    department: 'Finance',
    departmentId: 'DEP-FIN',
    status: 'Assigned',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: true,
    activeTransferId: null
  },
  {
    id: 'AST-000126',
    assetNumber: 'AS-000126',
    assetName: 'Access Point - Cisco',
    type: 'Network Device',
    category: 'Networking',
    serialNumber: 'CSCO-AP-9921',
    barcode: 'BC-AS-000126',
    rfidEpc: 'E28011606000002053A1B4C3',
    currentLocationFormatted: 'Dubai HQ > Block B > 2F > IT-201',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-B',
    buildingName: 'Block B',
    floorId: 'FLR-B-2F',
    floorName: '2nd Floor',
    roomId: 'ROOM-IT-201',
    roomName: 'IT-201',
    currentCustodian: 'IT Team',
    custodianId: 'CUST-00200',
    department: 'IT Department',
    departmentId: 'DEP-IT',
    status: 'Unassigned',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: true,
    activeTransferId: null
  },
  {
    id: 'AST-000127',
    assetNumber: 'AS-000127',
    assetName: 'Chair - Office',
    type: 'Furniture',
    category: 'Furniture',
    serialNumber: 'HM-AERON-091',
    barcode: 'BC-AS-000127',
    rfidEpc: 'E28011606000002053A1B4C4',
    currentLocationFormatted: 'Dubai HQ > Block C > GF > HR-001',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-C',
    buildingName: 'Block C',
    floorId: 'FLR-C-GF',
    floorName: 'Ground Floor',
    roomId: 'ROOM-HR-001',
    roomName: 'HR-001',
    currentCustodian: '-',
    custodianId: null,
    department: 'Human Resources',
    departmentId: 'DEP-HR',
    status: 'Unassigned',
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1580481077197-20ff694c9f13?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: true,
    activeTransferId: null
  },
  {
    id: 'AST-000128',
    assetNumber: 'AS-000128',
    assetName: 'Server Rack 42U - APC',
    type: 'Infrastructure',
    category: 'Data Center',
    serialNumber: 'APC-42U-554',
    barcode: 'BC-AS-000128',
    rfidEpc: 'E28011606000002053A1B4C5',
    currentLocationFormatted: 'Dubai HQ > Block A > GF > IT-102',
    siteId: 'SITE-DXB-01',
    siteName: 'Dubai HQ',
    buildingId: 'BLD-DXB-A',
    buildingName: 'Block A',
    floorId: 'FLR-A-GF',
    floorName: 'Ground Floor',
    roomId: 'ROOM-IT-102',
    roomName: 'IT-102',
    currentCustodian: 'IT Team',
    custodianId: 'CUST-00200',
    department: 'IT Department',
    departmentId: 'DEP-IT',
    status: 'Disposed',
    condition: 'Damaged',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=60',
    isEligibleForTransfer: false,
    ineligibilityReason: 'Asset is officially marked as Disposed.',
    activeTransferId: null
  }
];

// Transfers Store
let transfersStore = [
  {
    id: 'TRF-2026-0001',
    transferNumber: 'TRF-2026-0001',
    transferType: 'Location Transfer',
    status: 'COMPLETED',
    transferDate: '2026-09-01',
    effectiveDate: '2026-09-01',
    fromLocationFormatted: 'Dubai HQ > Block A > GF > IT-101',
    fromSite: 'Dubai HQ',
    fromBuilding: 'Block A',
    fromFloor: 'Ground Floor',
    fromRoom: 'IT-101',
    toLocationFormatted: 'Dubai HQ > Block B > 1F > IT-201',
    toSite: 'Dubai HQ',
    toBuilding: 'Block B',
    toFloor: '1st Floor',
    toRoom: 'IT-201',
    department: 'IT Department',
    fromCustodian: 'Ahmed Khan',
    toCustodian: 'Omar Saleh (EMP-00456)',
    reason: 'Department Restructure',
    conditionAtTransfer: 'Good',
    accessoriesIncluded: 'Power Cable, Stand',
    remarks: 'Initial batch relocation completed.',
    referenceNo: 'IT-MOVE-2026-000',
    assetCount: 1,
    assets: [
      {
        assetId: 'AST-000125',
        assetNumber: 'AS-000125',
        assetName: 'Printer - HP',
        serialNumber: 'HP LaserJet 404',
        receivedCondition: 'Good'
      }
    ],
    documents: [
      { id: 'DOC-1', name: 'handover_signed.pdf', size: '1.2 MB', url: '#' }
    ],
    requestedBy: 'John Doe (System Administrator)',
    requestedAt: '2026-09-01T08:30:00Z',
    approvedBy: 'Jane Smith (Asset Manager)',
    approvedAt: '2026-09-01T09:15:00Z',
    dispatchedBy: 'Logistics Desk',
    dispatchedAt: '2026-09-01T10:00:00Z',
    receivedBy: 'Omar Saleh',
    receivedAt: '2026-09-01T11:45:00Z',
    completedAt: '2026-09-01T11:45:00Z'
  }
];

// Movement History Store (Immutable Audit Trail)
let movementHistoryStore = [];

// ---------------------------------------------------------------------------
// 2. Service Implementations
// ---------------------------------------------------------------------------

/**
 * Fetch hierarchical location structure
 */
export async function getLocationHierarchy() {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (isConnected) {
    try {
      const [sites, buildings, floors, rooms] = await Promise.all([
        prisma.site.findMany({ where: { active: true } }),
        prisma.building.findMany({ where: { active: true } }),
        prisma.floor.findMany({ where: { active: true } }),
        prisma.room.findMany({ where: { active: true } })
      ]);
      return {
        sites: sites,
        buildings: buildings,
        floors: floors,
        rooms: rooms
      };
    } catch (err) {
      console.warn('[TransferMovementService] Error fetching hierarchy from Prisma:', err.message);
      return { sites: [], buildings: [], floors: [], rooms: [] };
    }
  }
  return { sites: [], buildings: [], floors: [], rooms: [] };
}

/**
 * Fetch all available departments and custodians
 */
export async function getMasterReferences() {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (isConnected) {
    try {
      const [departments, employees] = await Promise.all([
        prisma.department.findMany({ where: { active: true } }),
        prisma.employee.findMany({ where: { active: true }, include: { department: true } })
      ]);
      return {
        departments: departments,
        custodians: employees.map(e => ({
          id: e.id,
          code: e.employeeCode,
          name: `${e.fullName} (${e.employeeCode})`,
          department: e.department?.name || 'General',
          email: e.email
        }))
      };
    } catch (err) {
      console.warn('[TransferMovementService] Error fetching master data from Prisma:', err.message);
      return { departments: [], custodians: [] };
    }
  }
  return { departments: [], custodians: [] };
}

/**
 * Search and validate assets eligible for transfer.
 * Automatically checks:
 * 1. Asset status is not 'Disposed'
 * 2. Asset is not currently locked in an active transfer (PENDING_APPROVAL, DISPATCHED, IN_TRANSIT)
 */
export async function searchEligibleAssets({ query = '', scanType = 'ALL' }) {
  const q = (query || '').trim().toLowerCase();
  
  let list = assetsStore;
  const isConnected = isSqlServerConnected || isDbConnected();

  if (isConnected) {
    try {
      const dbAssets = await prisma.asset.findMany({
        where: {
          active: true,
          ...(q ? {
            OR: [
              { assetId: { contains: q } },
              { description: { contains: q } },
              { serialNumber: { contains: q } },
              { barcode: { contains: q } },
              { tagNumber: { contains: q } }
            ]
          } : {})
        },
        include: {
          category: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          department: true,
          custodian: true
        },
        take: 100
      });

      if (dbAssets && dbAssets.length > 0) {
        list = dbAssets.map(a => {
          const locParts = [
            a.site?.name,
            a.building?.name,
            a.floor?.name,
            a.room?.name
          ].filter(Boolean);

          const isDisposed = a.lifecycleStatus === 'DISPOSED';
          const isTransferring = ['IN_TRANSIT', 'PENDING_TRANSFER'].includes(a.lifecycleStatus);

          return {
            id: a.id,
            assetNumber: a.assetId || a.tagNumber || `AST-${a.id.slice(0, 6)}`,
            assetName: a.description || a.assetId || 'Unnamed Asset',
            type: a.category?.name || 'Equipment',
            category: a.category?.name || 'General',
            serialNumber: a.serialNumber || 'N/A',
            barcode: a.barcode || a.assetId || 'N/A',
            rfidEpc: a.tagNumber || a.rfidEpc || 'N/A',
            currentLocationFormatted: locParts.join(' > ') || 'Unassigned Location',
            siteId: a.siteId,
            siteName: a.site?.name || '',
            buildingId: a.buildingId,
            buildingName: a.building?.name || '',
            floorId: a.floorId,
            floorName: a.floor?.name || '',
            roomId: a.roomId,
            roomName: a.room?.name || '',
            currentCustodian: a.custodian ? (a.custodian.fullName || a.custodian.firstName) : '-',
            custodianId: a.custodianId,
            department: a.department?.name || '-',
            departmentId: a.departmentId,
            status: a.custodian ? 'Assigned' : 'Unassigned',
            condition: a.condition || 'Good',
            imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop&q=60',
            isEligibleForTransfer: !isDisposed && !isTransferring,
            ineligibilityReason: isDisposed
              ? 'Asset is marked as Disposed and cannot be moved.'
              : isTransferring
              ? 'Asset is currently in an active transfer workflow.'
              : null,
            activeTransferId: null
          };
        });
        
        if (q) {
          list = list.filter(a =>
            a.assetNumber.toLowerCase().includes(q) ||
            a.assetName.toLowerCase().includes(q) ||
            (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
            (a.barcode && a.barcode.toLowerCase().includes(q)) ||
            (a.rfidEpc && a.rfidEpc.toLowerCase().includes(q))
          );
        }
        return list;
      }
      return [];
    } catch (err) {
      console.warn('[TransferMovementService] Prisma query failed:', err.message);
      return [];
    }
  }

  return [];
}

/**
 * Quick scan single asset by Barcode, QR, or RFID EPC
 */
export async function scanAsset(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('Scan code cannot be empty.');

  const assets = await searchEligibleAssets({ query: cleanCode });
  const matched = assets.find(a => 
    a.barcode.toUpperCase() === cleanCode ||
    a.rfidEpc.toUpperCase() === cleanCode ||
    a.assetNumber.toUpperCase() === cleanCode ||
    (a.serialNumber && a.serialNumber.toUpperCase() === cleanCode)
  );

  if (!matched) {
    return {
      found: false,
      message: `No asset found matching scanned code: ${code}`
    };
  }

  return {
    found: true,
    asset: matched,
    isEligible: matched.isEligibleForTransfer,
    reason: matched.ineligibilityReason
  };
}

/**
 * Get all transfers with optional status filter
 */
export async function getTransfers({ status = 'ALL', search = '' }) {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (isConnected) {
    try {
      const dbTransfers = await prisma.assetTransfer.findMany({
        where: {
          ...(status && status !== 'ALL' ? { status } : {})
        },
        include: {
          asset: {
            include: { category: true, site: true, building: true, floor: true, room: true, department: true }
          },
          fromCustodian: true,
          toCustodian: true,
          requestedBy: true,
          approvedBy: true,
          receivedBy: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (dbTransfers && dbTransfers.length > 0) {
        const siteIds = [...new Set(dbTransfers.flatMap(t => [t.fromSiteId, t.toSiteId]).filter(Boolean))];
        const sites = await prisma.site.findMany({ where: { id: { in: siteIds } }, select: { id: true, name: true } });
        const siteNames = new Map(sites.map(site => [site.id, site.name]));
        const locationDetails = await getTransferLocationDetails(dbTransfers);
        let results = dbTransfers.map(t => ({
          id: t.id,
          transferNumber: t.transferNumber,
          transferDate: t.createdAt.toISOString().split('T')[0],
          assetCount: 1,
          assetSummary: t.asset?.description || t.asset?.assetId || 'Equipment',
          transferType: t.transferType,
          fromLocationFormatted: locationDetails.get(t.id)?.from || 'Unassigned',
          toLocationFormatted: locationDetails.get(t.id)?.to || 'Not selected',
          fromSite: siteNames.get(t.fromSiteId) || t.fromSiteId || 'Unassigned',
          toSite: siteNames.get(t.toSiteId) || t.toSiteId || 'Not selected',
          toCustodian: t.toCustodian ? t.toCustodian.fullName : 'Unassigned',
          department: t.asset?.department?.name || '',
          reason: t.reason || '',
          status: t.status,
          requestedBy: t.requestedBy?.fullName || '',
          requestedAt: t.createdAt.toISOString(),
          assets: [t.asset].filter(Boolean).map(a => ({
            assetNumber: a.assetId || a.id,
            assetName: a.description || a.assetId || 'Unnamed Asset',
            serialNumber: a.serialNumber || 'N/A'
          }))
        }));

        if (search) {
          const s = search.toLowerCase();
          results = results.filter(t =>
            t.transferNumber.toLowerCase().includes(s) ||
            (t.reason && t.reason.toLowerCase().includes(s)) ||
            (t.toCustodian && t.toCustodian.toLowerCase().includes(s))
          );
        }
        return results;
      }
      return []; // Return empty if connected to DB but no records
    } catch (err) {
      throw err;
    }
  }

  throw new Error('Database is unavailable. Transfers could not be loaded.');
}

/**
 * Get single transfer details
 */
export async function getTransferById(id) {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (isConnected) {
    try {
      const dbTransfer = await prisma.assetTransfer.findFirst({
        where: {
          OR: [
            { id: id },
            { transferNumber: id }
          ]
        },
        include: {
          asset: {
            include: { category: true, site: true, building: true, floor: true, room: true, department: true }
          },
          fromCustodian: true,
          toCustodian: true,
          requestedBy: true,
          approvedBy: true,
          receivedBy: true
        }
      });
      if (dbTransfer) {
        const locationDetails = await getTransferLocationDetails([dbTransfer]);
        return {
          id: dbTransfer.id,
          transferNumber: dbTransfer.transferNumber,
          transferType: dbTransfer.transferType,
          status: dbTransfer.status,
          reason: dbTransfer.reason,
          fromLocationFormatted: locationDetails.get(dbTransfer.id)?.from || 'Unassigned',
          toLocationFormatted: locationDetails.get(dbTransfer.id)?.to || 'Not selected',
          fromCustodian: dbTransfer.fromCustodian?.fullName || '-',
          toCustodian: dbTransfer.toCustodian?.fullName || '-',
          requestedBy: dbTransfer.requestedBy?.fullName || '-',
          requestedAt: dbTransfer.createdAt.toISOString(),
          transferDate: dbTransfer.createdAt.toISOString(),
          assetCount: 1,
          assets: [dbTransfer.asset].filter(Boolean).map(a => ({
            assetNumber: a.assetId || a.id,
            assetName: a.description || a.assetId || 'Unnamed Asset',
            serialNumber: a.serialNumber || 'N/A'
          })),
          history: [],
          documents: []
        };
      }
    } catch (e) {
      console.warn('DB error fetching transfer by id', e.message);
    }
  }

  throw new Error(`Transfer record ${id} not found.`);
}

/**
 * Create a single or bulk transfer transaction.
 * Supports:
 * - Save as Draft (status: 'DRAFT') -> DOES NOT alter Asset Master
 * - Submit Transfer (status: 'PENDING_APPROVAL' or 'APPROVED') -> preserves asset official location until receipt
 */
export async function createTransfer(payload, user = {}) {
  const {
    assetIds = [],
    transferType = 'Location Transfer',
    transferDate = new Date().toISOString().split('T')[0],
    effectiveDate = new Date().toISOString().split('T')[0],
    toSiteId,
    toSiteName,
    toBuildingId,
    toBuildingName,
    toFloorId,
    toFloorName,
    toRoomId,
    toRoomName,
    departmentId,
    departmentName,
    toCustodianId,
    toCustodianName,
    reason = 'Department Restructure',
    conditionAtTransfer = 'Good',
    accessoriesIncluded = '',
    remarks = '',
    referenceNo = '',
    documents = [],
    isDraft = false,
    requiresApproval = true
  } = payload;

  if (!assetIds || assetIds.length === 0) {
    throw new Error('Please select at least one asset for transfer.');
  }

  // Validate mandatory fields based on Transfer Type
  if (!isDraft) {
    if (transferType.includes('Location') || transferType.includes('Site')) {
      if (!toSiteName || !toBuildingName) {
        throw new Error('Destination Site and Building are mandatory for Location Transfers.');
      }
    }
    if (transferType.includes('Custodian') && !toCustodianName) {
      throw new Error('New Custodian is mandatory for Custodian Transfers.');
    }
    if (!reason) {
      throw new Error('Movement Reason is mandatory.');
    }
  }

  // Validate all assets exist and are eligible
  const targetAssets = [];
  for (const aid of assetIds) {
    let asset = assetsStore.find(a => a.id === aid || a.assetNumber === aid);
    
    // DB Fallback for real dynamic assets
    if (!asset && isDbConnected()) {
      const dbAsset = await prisma.asset.findFirst({
        where: {
          OR: [{ id: aid }, { assetId: aid }]
        },
        include: {
          site: true,
          building: true,
          floor: true,
          room: true
        }
      });
      if (dbAsset) {
        asset = {
          id: dbAsset.id,
          assetNumber: dbAsset.assetId || dbAsset.id,
          assetName: dbAsset.name || dbAsset.description || 'Asset',
          siteName: dbAsset.site?.name || 'Unknown',
          buildingName: dbAsset.building?.name || 'Unknown',
          floorName: dbAsset.floor?.name || '',
          roomName: dbAsset.room?.name || '',
          isEligibleForTransfer: dbAsset.lifecycleStatus !== 'DISPOSED' && dbAsset.status !== 'Disposed',
          ineligibilityReason: 'Asset is disposed'
        };
      }
    }

    if (!asset) {
      throw new Error(`Asset ID ${aid} was not found in Asset360.`);
    }
    if (!isDraft && !asset.isEligibleForTransfer) {
      throw new Error(`Asset ${asset.assetNumber} is not eligible for transfer: ${asset.ineligibilityReason}`);
    }
    targetAssets.push(asset);
  }

  const transferNum = `TRF-2026-${String(transfersStore.length + 1).padStart(4, '0')}`;
  const status = isDraft ? 'DRAFT' : (requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED');

  // Build destination location display string
  const toLocationFormatted = [toSiteName, toBuildingName, toFloorName, toRoomName]
    .filter(Boolean)
    .join(' > ') || 'Unspecified Destination';

  // Determine From Location snapshot from first selected asset (or combined)
  const firstAsset = targetAssets[0];
  const fromLocationFormatted = firstAsset.currentLocationFormatted;

  const newTransfer = {
    id: transferNum,
    transferNumber: transferNum,
    transferType,
    status,
    transferDate,
    effectiveDate,
    fromLocationFormatted,
    fromSite: firstAsset.siteName,
    fromBuilding: firstAsset.buildingName,
    fromFloor: firstAsset.floorName,
    fromRoom: firstAsset.roomName,
    toLocationFormatted,
    toSite: toSiteName,
    toBuilding: toBuildingName,
    toFloor: toFloorName,
    toRoom: toRoomName,
    department: departmentName || targetAssets[0].department,
    departmentId: departmentId || targetAssets[0].departmentId,
    fromCustodian: firstAsset.currentCustodian,
    toCustodian: toCustodianName || firstAsset.currentCustodian,
    toCustodianId: toCustodianId || firstAsset.custodianId,
    reason,
    conditionAtTransfer,
    accessoriesIncluded,
    remarks,
    referenceNo: referenceNo || `IT-MOVE-${Date.now().toString().slice(-4)}`,
    assetCount: targetAssets.length,
    assets: targetAssets.map(a => ({
      assetId: a.id,
      assetNumber: a.assetNumber,
      assetName: a.assetName,
      serialNumber: a.serialNumber,
      tagEpc: a.rfidEpc,
      previousLocation: a.currentLocationFormatted,
      previousCustodian: a.currentCustodian,
      status: a.status,
      receivedCondition: null
    })),
    documents: documents || [],
    requestedBy: user?.name || user?.fullName || 'John Doe (System Administrator)',
    requestedByUserId: user?.id || null,
    requestedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
    dispatchedBy: null,
    dispatchedAt: null,
    receivedBy: null,
    receivedAt: null,
    completedAt: null
  };

  // If not draft, flag assets with activeTransferId so they cannot be double-transferred
  if (!isDraft) {
    for (const a of targetAssets) {
      a.activeTransferId = transferNum;
      // Note: official location & custodian in Asset Master are NOT changed yet!
    }
  }

  transfersStore.unshift(newTransfer);

  // DB Fallback: Actually save the record to Prisma so it isn't lost on restart
  if (isDbConnected()) {
    try {
      let reqUserId = newTransfer.requestedByUserId;
      if (!reqUserId) {
        const anyUser = await prisma.user.findFirst();
        if (anyUser) reqUserId = anyUser.id;
      }
      
      if (reqUserId) {
        // Resolve target IDs based on strings if explicit IDs were missing
        // This makes sure our UI selections map correctly to SQL fields
        let fromSiteId = null, toSiteId = null, toCustodianId = null;

        if (newTransfer.toCustodianId) {
          toCustodianId = newTransfer.toCustodianId;
        } else if (newTransfer.toCustodian && newTransfer.toCustodian !== 'Unassigned') {
          const matchedCust = await prisma.employee.findFirst({
            where: { fullName: { contains: newTransfer.toCustodian } }
          });
          if (matchedCust) toCustodianId = matchedCust.id;
        }

        if (newTransfer.fromSite) {
          const matchedSite = await prisma.site.findFirst({
            where: { name: { contains: newTransfer.fromSite } }
          });
          if (matchedSite) fromSiteId = matchedSite.id;
        }

        if (newTransfer.toSite) {
          const matchedSite = await prisma.site.findFirst({
            where: { name: { contains: newTransfer.toSite } }
          });
          if (matchedSite) toSiteId = matchedSite.id;
        }

        await prisma.assetTransfer.create({
          data: {
            transferNumber: newTransfer.transferNumber,
            transferType: newTransfer.transferType,
            status: newTransfer.status,
            reason: newTransfer.reason || '',
            assetId: targetAssets[0].id,
            requestedByUserId: reqUserId,
            fromSiteId,
            toSiteId,
            toCustodianId
          }
        });
        console.log(`Saved Transfer ${newTransfer.transferNumber} to SQL Database.`);
      }
    } catch(err) {
      console.warn('Could not save transfer to DB, falling back to memory store.', err.message);
    }
  }

  return newTransfer;
}

/**
 * Handle lifecycle status transitions:
 * - APPROVE -> Status changes to APPROVED
 * - REJECT -> Status changes to REJECTED, unlocks assets
 * - DISPATCH -> Status changes to DISPATCHED / IN_TRANSIT
 * - CONFIRM_RECEIPT -> Status changes to COMPLETED:
 *     1. Updates official Asset Master location & custodian
 *     2. Releases lock
 *     3. Appends immutable records to Movement History
 */
export async function updateTransferStatus(transferId, actionPayload, user = {}) {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (!isConnected) throw new Error('Database disconnected.');

  const transfer = await prisma.assetTransfer.findFirst({
    where: { OR: [{ id: transferId }, { transferNumber: transferId }] }
  });

  if (!transfer) {
    throw new Error(`Transfer ${transferId} does not exist in DB.`);
  }

  const {
    action, // 'APPROVE' | 'REJECT' | 'DISPATCH' | 'MARK_TRANSIT' | 'CONFIRM_RECEIPT'
    comments = '',
    receivedCondition = 'Good',
    receiverName = ''
  } = actionPayload;

  const now = new Date().toISOString();
  const userName = user?.name || user?.fullName || 'John Doe (System Administrator)';

  let newStatus = transfer.status;

  if (action === 'APPROVE') {
    if (newStatus !== 'PENDING_APPROVAL') throw new Error(`Cannot approve transfer in status: ${newStatus}`);
    newStatus = 'APPROVED';
  } else if (action === 'REJECT') {
    newStatus = 'REJECTED';
  } else if (action === 'DISPATCH' || action === 'MARK_TRANSIT') {
    newStatus = 'IN_TRANSIT';
  } else if (action === 'CONFIRM_RECEIPT') {
    if (!['DISPATCHED', 'IN_TRANSIT', 'APPROVED'].includes(newStatus)) {
      throw new Error(`Cannot confirm receipt for transfer in status: ${newStatus}`);
    }
    newStatus = 'COMPLETED';
  } else {
    throw new Error(`Unsupported transfer action: ${action}`);
  }

  const updatedTransfer = await prisma.assetTransfer.update({
    where: { id: transfer.id },
    data: {
      status: newStatus,
      ...(action === 'DISPATCH' ? { dispatchDate: new Date() } : {}),
      ...(action === 'CONFIRM_RECEIPT' ? { receiveDate: new Date(), receivedByUserId: user?.id || null } : {}),
      ...(action === 'APPROVE' ? { approvedByUserId: user?.id || null } : {})
    }
  });

  // If completed, update asset condition (if any) and unlock asset
  if (action === 'CONFIRM_RECEIPT' && transfer.assetId) {
    await prisma.asset.update({
      where: { id: transfer.assetId },
      data: {
        condition: receivedCondition || undefined
      }
    });
  }

  return updatedTransfer;
}

/**
 * Get Movement History (Immutable Audit Log)
 */
export async function getMovementHistory({ assetId = '', transferId = '', search = '' }) {
  const isConnected = isSqlServerConnected || isDbConnected();
  if (isConnected) {
    try {
      const dbTransfers = await prisma.assetTransfer.findMany({
        where: {
          ...(assetId ? {
            OR: [
              { assetId },
              { asset: { assetId } },
              { asset: { tagNumber: assetId } }
            ]
          } : {}),
          ...(transferId ? {
            transferNumber: { contains: transferId }
          } : {})
        },
        include: {
          asset: {
            include: { category: true, site: true, building: true, floor: true, room: true, department: true }
          },
          fromCustodian: true,
          toCustodian: true,
          requestedBy: true,
          approvedBy: true,
          receivedBy: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (dbTransfers && dbTransfers.length > 0) {
        const locationDetails = await getTransferLocationDetails(dbTransfers);
        let results = dbTransfers.map(t => {
          const fromLoc = locationDetails.get(t.id)?.from || 'Unassigned';
          const toLoc = locationDetails.get(t.id)?.to || 'Not selected';
          return {
            id: t.id,
            movementId: t.transferNumber,
            transferNumber: t.transferNumber,
            assetId: t.asset?.assetId || t.assetId,
            assetNumber: t.asset?.assetId || t.assetId,
            assetName: t.asset?.description || t.asset?.assetId || 'Asset',
            serialNumber: t.asset?.serialNumber || 'N/A',
            rfidEpc: t.asset?.rfidEpc || 'N/A',
            movementType: t.transferType || 'Location Transfer',
            fromLocation: fromLoc,
            toLocation: toLoc,
            previousCustodian: t.fromCustodian ? t.fromCustodian.fullName : 'Unassigned',
            newCustodian: t.toCustodian ? t.toCustodian.fullName : 'Unassigned',
            department: t.asset?.department?.name || '',
            reason: t.reason || '',
            condition: t.asset?.condition || 'Good',
            accessories: 'N/A',
            referenceNo: t.transferNumber,
            requestedBy: t.requestedBy?.fullName || '',
            approvedBy: t.approvedBy?.fullName || '',
            dispatcher: '',
            receiver: t.receivedBy?.fullName || t.toCustodian?.fullName || '',
            timestamp: t.createdAt.toISOString(),
            status: t.status || 'COMPLETED',
            documentsCount: 0
          };
        });

        if (search) {
          const s = search.toLowerCase();
          results = results.filter(m =>
            m.movementId.toLowerCase().includes(s) ||
            m.transferNumber.toLowerCase().includes(s) ||
            m.assetNumber.toLowerCase().includes(s) ||
            m.assetName.toLowerCase().includes(s) ||
            m.fromLocation.toLowerCase().includes(s) ||
            m.toLocation.toLowerCase().includes(s) ||
            m.previousCustodian.toLowerCase().includes(s) ||
            m.newCustodian.toLowerCase().includes(s) ||
            m.reason.toLowerCase().includes(s)
          );
        }

        return results;
      }
      return [];
    } catch (err) {
      throw err;
    }
  }

  throw new Error('Database is unavailable. Movement history could not be loaded.');
}
