/**
 * Audit Management Service
 * Administrative control center for planning, scheduling, scoping, assigning,
 * snapshotting, approving, and closing physical asset verification campaigns.
 */
import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// ---------------------------------------------------------------------------
// 1. In-Memory Store & Seed Campaigns (Aligns with Screenshot AUD-2026-0013 & AUD-2026-0008)
// ---------------------------------------------------------------------------

let auditsStore = [
  {
    id: 'AUD-2026-0013',
    auditId: 'AUD-2026-0013',
    referenceNo: 'AUD-2026-0013',
    auditName: 'HQ Annual IT Asset Audit 2026',
    auditType: 'Physical Verification',
    samplingMethod: 'Full Count (All Assets)',
    verificationMethod: 'Barcode / RFID / Manual Entry',
    description: 'Annual physical verification of all IT assets at Dubai HQ including laptops, desktops, monitors and peripherals.',
    auditObjective: 'Verify asset existence, location and condition. Identify discrepancies and update records.',
    company: 'Dubai HQ',
    companyId: 'COMP-DXB',
    businessUnit: 'IT Department',
    currency: 'AED',
    status: 'Draft',
    statusCode: 'DRAFT',
    progress: 0,
    plannedStartDate: '2026-09-01',
    plannedEndDate: '2026-09-15',
    formattedStartDate: '01 Sep 2026',
    formattedEndDate: '15 Sep 2026',
    allowUnregistered: true,
    capturePhotos: true,
    auditInstructions: 'Ensure all assets are verified. Capture condition and actual location. Report discrepancies.',
    notifyUsers: 'Assigned Users',
    notifyEmail: true,
    additionalRecipients: ['it.compliance@asset360.com'],
    scopeType: 'By Location',
    scopeCriteria: {
      selectedLocations: [
        { code: 'BLK-B', name: 'Block B', type: 'Building' },
        { code: 'IT-101', name: 'IT Floor - 1', type: 'Floor' }
      ],
      assetGroup: 'IT Equipment',
      assetCategory: 'Laptops, Desktops, Monitors',
      assetStatus: 'All',
      includeSubLocations: true
    },
    assignedUsers: [
      { id: 'usr-1', name: 'John Doe', role: 'Lead Auditor', locationScope: 'Block B' },
      { id: 'usr-2', name: 'Sarah Jenkins', role: 'Field Auditor', locationScope: 'IT Floor - 1' }
    ],
    estimatedAssets: 600,
    totalExpected: 600,
    totalVerified: 0,
    totalPending: 600,
    totalNotFound: 0,
    totalExcess: 0,
    totalRelocated: 0,
    totalExceptions: 0,
    expectedAssetsSnapshot: [],
    approvals: [
      { step: 1, role: 'Audit Lead', approver: 'John Doe', status: 'Approved', date: '2026-08-28' },
      { step: 2, role: 'Asset Director', approver: 'Hassan Al-Majid', status: 'Pending', date: null }
    ],
    attachments: [
      { id: 'att-1', name: 'IT_Audit_Scope_Checklist_2026.pdf', size: '1.4 MB', uploadedBy: 'John Doe', date: '2026-08-27' },
      { id: 'att-2', name: 'HQ_Floor_Plan_Block_B.png', size: '3.2 MB', uploadedBy: 'John Doe', date: '2026-08-27' }
    ],
    notes: 'Phase 1 kickoff meeting completed on Aug 28. Awaiting director sign-off.',
    createdBy: 'John Doe (System Administrator)',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-01T08:30:00Z'
  },
  {
    id: 'AUD-2026-0008',
    auditId: 'AUD-2026-0008',
    referenceNo: 'AUD-2026-0008',
    auditName: 'HQ Annual IT Asset Audit 2026',
    auditType: 'Physical Verification',
    samplingMethod: 'Full Count (All Assets)',
    verificationMethod: 'Barcode / RFID / Manual Entry',
    description: 'Active physical verification campaign across Dubai HQ facilities.',
    auditObjective: 'Comprehensive inventory census and discrepancy detection.',
    company: 'Dubai HQ',
    companyId: 'COMP-DXB',
    businessUnit: 'IT Department',
    currency: 'AED',
    status: 'In Progress',
    statusCode: 'IN_PROGRESS',
    progress: 65,
    plannedStartDate: '2026-09-01',
    plannedEndDate: '2026-09-15',
    formattedStartDate: '01 Sep 2026',
    formattedEndDate: '15 Sep 2026',
    allowUnregistered: true,
    capturePhotos: true,
    auditInstructions: 'Ensure all assets are verified. Capture condition and actual location. Report discrepancies.',
    notifyUsers: 'Assigned Users',
    notifyEmail: true,
    additionalRecipients: [],
    scopeType: 'By Location',
    scopeCriteria: {
      selectedLocations: [
        { code: 'BLK-B', name: 'Block B', type: 'Building' }
      ],
      assetGroup: 'IT Equipment',
      assetCategory: 'Laptops, Desktops, Monitors',
      assetStatus: 'All',
      includeSubLocations: true
    },
    assignedUsers: [
      { id: 'usr-1', name: 'John Doe', role: 'Lead Auditor', locationScope: 'Block B' }
    ],
    estimatedAssets: 600,
    totalExpected: 600,
    totalVerified: 390,
    totalPending: 198,
    totalNotFound: 12,
    totalExcess: 3,
    totalRelocated: 8,
    totalExceptions: 12,
    expectedAssetsSnapshot: [
      { id: 'exp-123', assetNo: 'AS-000123', assetName: 'Laptop - Dell 5440', status: 'Verified' },
      { id: 'exp-124', assetNo: 'AS-000124', assetName: 'Monitor - Samsung', status: 'Moved' },
      { id: 'exp-125', assetNo: 'AS-000125', assetName: 'Printer - HP', status: 'Verified' }
    ],
    approvals: [
      { step: 1, role: 'Audit Lead', approver: 'John Doe', status: 'Approved', date: '2026-08-25' },
      { step: 2, role: 'Asset Director', approver: 'Hassan Al-Majid', status: 'Approved', date: '2026-08-26' }
    ],
    attachments: [
      { id: 'att-3', name: 'Audit_Charter_Approved.pdf', size: '2.1 MB', uploadedBy: 'Hassan Al-Majid', date: '2026-08-26' }
    ],
    notes: 'Execution currently at 65% across 1F and 2F workstations.',
    createdBy: 'John Doe',
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'AUD-2026-0005',
    auditId: 'AUD-2026-0005',
    referenceNo: 'AUD-2026-0005',
    auditName: 'Executive Floor Q2 Verification',
    auditType: 'Cycle Count',
    samplingMethod: 'Sample Count',
    verificationMethod: 'RFID',
    description: 'Quarterly executive suite inventory check and compliance confirmation.',
    auditObjective: 'Verify high-criticality executive computing assets and AV gear.',
    company: 'Dubai HQ',
    companyId: 'COMP-DXB',
    businessUnit: 'Executive Administration',
    currency: 'AED',
    status: 'Closed',
    statusCode: 'CLOSED',
    progress: 100,
    plannedStartDate: '2026-06-01',
    plannedEndDate: '2026-06-05',
    formattedStartDate: '01 Jun 2026',
    formattedEndDate: '05 Jun 2026',
    allowUnregistered: false,
    capturePhotos: true,
    auditInstructions: 'Executive escort required for verification in suites 301-310.',
    notifyUsers: 'Assigned Users',
    notifyEmail: true,
    additionalRecipients: [],
    scopeType: 'By Location',
    scopeCriteria: {
      selectedLocations: [
        { code: 'BLK-C', name: 'Block C - Executive Floor', type: 'Floor' }
      ],
      assetGroup: 'Executive IT & AV',
      assetCategory: 'Laptops, Tablets, Displays',
      assetStatus: 'In Service',
      includeSubLocations: false
    },
    assignedUsers: [
      { id: 'usr-1', name: 'John Doe', role: 'Lead Auditor', locationScope: 'Block C' }
    ],
    estimatedAssets: 120,
    totalExpected: 120,
    totalVerified: 120,
    totalPending: 0,
    totalNotFound: 0,
    totalExcess: 0,
    totalRelocated: 0,
    totalExceptions: 0,
    expectedAssetsSnapshot: [],
    approvals: [
      { step: 1, role: 'Executive Secretary', approver: 'Mona Al-Zahra', status: 'Approved', date: '2026-05-28' },
      { step: 2, role: 'Chief Audit Executive', approver: 'Tariq Mansour', status: 'Approved', date: '2026-05-29' }
    ],
    attachments: [
      { id: 'att-4', name: 'Signed_Reconciliation_Report_Q2.pdf', size: '3.8 MB', uploadedBy: 'Tariq Mansour', date: '2026-06-06' }
    ],
    notes: 'Audit closed with zero variances. 100% reconciliation confirmed.',
    createdBy: 'John Doe',
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-06-06T16:00:00Z'
  }
];

// Seeded master locations tree matching screenshot
export const AVAILABLE_LOCATIONS_TREE = [
  {
    id: 'loc-dxb',
    name: 'Dubai HQ',
    code: 'DXB-HQ',
    type: 'Site',
    children: [
      { id: 'loc-dxb-a', name: 'Block A', code: 'BLK-A', type: 'Building' },
      { id: 'loc-dxb-b', name: 'Block B', code: 'BLK-B', type: 'Building' },
      { id: 'loc-dxb-c', name: 'Block C', code: 'BLK-C', type: 'Building' }
    ]
  },
  { id: 'loc-jbl', name: 'Jebel Ali Logistics Hub', code: 'JBL-WH', type: 'Site', children: [] },
  { id: 'loc-auh', name: 'Abu Dhabi Branch', code: 'AUH-BR', type: 'Site', children: [] },
  { id: 'loc-shj', name: 'Sharjah Operations Center', code: 'SHJ-OPS', type: 'Site', children: [] },
  { id: 'loc-aln', name: 'Al Ain Distribution Center', code: 'ALN-DC', type: 'Site', children: [] }
];

// ---------------------------------------------------------------------------
// 2. Service Logic
// ---------------------------------------------------------------------------

/**
 * Get all audits with multi-parameter filtering
 */
export async function getAudits({ search = '', status = 'ALL', auditType = 'ALL', entity = 'ALL', location = 'ALL' }) {
  let list = [...auditsStore];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a =>
      a.auditId.toLowerCase().includes(q) ||
      a.auditName.toLowerCase().includes(q) ||
      a.referenceNo.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'ALL') {
    list = list.filter(a => a.status.toLowerCase() === status.toLowerCase() || a.statusCode === status);
  }

  if (auditType && auditType !== 'ALL') {
    list = list.filter(a => a.auditType.toLowerCase() === auditType.toLowerCase());
  }

  if (entity && entity !== 'ALL') {
    list = list.filter(a => a.company.toLowerCase() === entity.toLowerCase());
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get single audit by ID with all details
 */
export async function getAuditById(id) {
  const audit = auditsStore.find(a => a.id === id || a.auditId === id || a.referenceNo === id);
  if (!audit) {
    throw new Error(`Audit campaign ${id} not found.`);
  }
  return audit;
}

/**
 * Dynamically calculate estimated asset population based on scope criteria
 */
export async function estimateScope(scopePayload) {
  const { selectedLocations = [], assetGroup, assetCategory, assetStatus, includeSubLocations } = scopePayload;

  let baseCount = 300;
  if (selectedLocations.some(l => l.code === 'BLK-B' || l.name?.includes('Block B'))) {
    baseCount += 300;
  }
  if (selectedLocations.some(l => l.code === 'IT-101' || l.name?.includes('IT Floor'))) {
    baseCount += 150;
  }

  if (assetCategory && assetCategory.toLowerCase().includes('laptop')) {
    baseCount = Math.round(baseCount * 0.85);
  }

  return {
    estimatedAssets: Math.max(50, baseCount),
    scopeBreakdown: {
      laptops: Math.round(baseCount * 0.45),
      monitors: Math.round(baseCount * 0.35),
      printers: Math.round(baseCount * 0.10),
      networkDevices: Math.round(baseCount * 0.10)
    }
  };
}

/**
 * Create a new physical verification audit (Draft or Pending Approval)
 */
export async function createAudit(payload, user = {}) {
  const {
    auditName,
    auditType = 'Physical Verification',
    referenceNo,
    description = '',
    auditObjective = '',
    company = 'Dubai HQ',
    businessUnit = 'IT Department',
    currency = 'AED',
    plannedStartDate,
    plannedEndDate,
    verificationMethod = 'Barcode / RFID / Manual Entry',
    samplingMethod = 'Full Count (All Assets)',
    allowUnregistered = true,
    capturePhotos = true,
    auditInstructions = '',
    notifyUsers = 'Assigned Users',
    notifyEmail = true,
    additionalRecipients = [],
    scopeType = 'By Location',
    scopeCriteria = {},
    assignedUsers = [],
    attachments = [],
    isDraft = false
  } = payload;

  if (!auditName && !isDraft) {
    throw new Error('Audit Name is required.');
  }

  const generatedId = referenceNo || `AUD-2026-${String(auditsStore.length + 10).padStart(4, '0')}`;
  const status = isDraft ? 'Draft' : 'Pending Approval';
  const statusCode = isDraft ? 'DRAFT' : 'PENDING_APPROVAL';

  // Compute estimated assets
  const estimate = await estimateScope(scopeCriteria);

  const newAudit = {
    id: generatedId,
    auditId: generatedId,
    referenceNo: generatedId,
    auditName: auditName || `New Verification Audit - ${generatedId}`,
    auditType,
    samplingMethod,
    verificationMethod,
    description,
    auditObjective,
    company,
    businessUnit,
    currency,
    status,
    statusCode,
    progress: 0,
    plannedStartDate: plannedStartDate || new Date().toISOString().split('T')[0],
    plannedEndDate: plannedEndDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    formattedStartDate: plannedStartDate || '01 Sep 2026',
    formattedEndDate: plannedEndDate || '15 Sep 2026',
    allowUnregistered: Boolean(allowUnregistered),
    capturePhotos: Boolean(capturePhotos),
    auditInstructions,
    notifyUsers,
    notifyEmail: Boolean(notifyEmail),
    additionalRecipients,
    scopeType,
    scopeCriteria: {
      selectedLocations: scopeCriteria.selectedLocations || [
        { code: 'BLK-B', name: 'Block B', type: 'Building' },
        { code: 'IT-101', name: 'IT Floor - 1', type: 'Floor' }
      ],
      assetGroup: scopeCriteria.assetGroup || 'IT Equipment',
      assetCategory: scopeCriteria.assetCategory || 'Laptops, Desktops, Monitors',
      assetStatus: scopeCriteria.assetStatus || 'All',
      includeSubLocations: scopeCriteria.includeSubLocations !== undefined ? scopeCriteria.includeSubLocations : true
    },
    assignedUsers: assignedUsers.length > 0 ? assignedUsers : [
      { id: 'usr-1', name: user?.name || user?.fullName || 'John Doe', role: 'Lead Auditor', locationScope: 'All Scoped Locations' }
    ],
    estimatedAssets: estimate.estimatedAssets,
    totalExpected: estimate.estimatedAssets,
    totalVerified: 0,
    totalPending: estimate.estimatedAssets,
    totalNotFound: 0,
    totalExcess: 0,
    totalRelocated: 0,
    totalExceptions: 0,
    expectedAssetsSnapshot: [], // Frozen only on activation!
    approvals: [
      { step: 1, role: 'Audit Lead', approver: user?.fullName || 'John Doe', status: 'Approved', date: new Date().toISOString().split('T')[0] },
      { step: 2, role: 'Asset Director', approver: 'Hassan Al-Majid', status: isDraft ? 'Not Submitted' : 'Pending', date: null }
    ],
    attachments: attachments || [],
    notes: `Audit created by ${user?.fullName || 'System Administrator'} on ${new Date().toLocaleDateString()}`,
    createdBy: user?.fullName || 'John Doe (System Administrator)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  auditsStore.unshift(newAudit);

  return newAudit;
}

/**
 * Handle audit status transitions:
 * - SUBMIT_APPROVAL: Status -> Pending Approval
 * - APPROVE: Status -> Approved
 * - REJECT: Status -> Draft with remarks
 * - START_AUDIT: Status -> In Progress & FREEZES expected asset snapshot!
 * - CLOSE_AUDIT: Validates unresolved exceptions and closes campaign
 */
export async function updateAuditStatus(id, actionPayload, user = {}) {
  const audit = auditsStore.find(a => a.id === id || a.auditId === id);
  if (!audit) {
    throw new Error(`Audit campaign ${id} not found.`);
  }

  const { action, comments = '', approverName = '' } = actionPayload;
  const userName = user?.fullName || user?.name || approverName || 'John Doe';
  const now = new Date().toISOString();

  switch (action) {
    case 'SUBMIT_APPROVAL': {
      audit.status = 'Pending Approval';
      audit.statusCode = 'PENDING_APPROVAL';
      audit.approvals[1].status = 'Pending';
      break;
    }

    case 'APPROVE': {
      audit.status = 'Approved';
      audit.statusCode = 'APPROVED';
      if (audit.approvals[1]) {
        audit.approvals[1].status = 'Approved';
        audit.approvals[1].approver = userName;
        audit.approvals[1].date = now.split('T')[0];
      }
      break;
    }

    case 'REJECT': {
      audit.status = 'Draft';
      audit.statusCode = 'DRAFT';
      if (audit.approvals[1]) {
        audit.approvals[1].status = 'Rejected';
        audit.approvals[1].date = now.split('T')[0];
      }
      audit.notes = `Approval rejected: ${comments}`;
      break;
    }

    case 'START_AUDIT': {
      if (!['Approved', 'Not Started', 'Draft'].includes(audit.status)) {
        throw new Error(`Cannot start audit in status: ${audit.status}`);
      }

      audit.status = 'In Progress';
      audit.statusCode = 'IN_PROGRESS';

      // FREEZE EXPECTED ASSET POPULATION SNAPSHOT
      // This guarantees changes in Asset Master do not modify the original audit baseline!
      if (!audit.expectedAssetsSnapshot || audit.expectedAssetsSnapshot.length === 0) {
        audit.expectedAssetsSnapshot = [
          {
            id: 'exp-123',
            assetNo: 'AS-000123',
            assetName: 'Laptop - Dell Latitude 5440',
            serialNumber: '75K3D24',
            tagEpc: 'E28011606000002053A1B4C0',
            expectedLocation: 'Dubai HQ > Block B > 1F > IT-101',
            expectedCustodian: 'Sara Ali',
            status: 'Pending'
          },
          {
            id: 'exp-124',
            assetNo: 'AS-000124',
            assetName: 'Monitor - Samsung',
            serialNumber: 'SAMS8787',
            tagEpc: 'E28011606000002053A1B4C1',
            expectedLocation: 'Dubai HQ > Block B > 1F > IT-101',
            expectedCustodian: 'Sara Ali',
            status: 'Pending'
          },
          {
            id: 'exp-125',
            assetNo: 'AS-000125',
            assetName: 'Printer - HP',
            serialNumber: 'HP LaserJet 404',
            tagEpc: 'E28011606000002053A1B4C2',
            expectedLocation: 'Dubai HQ > Block B > 2F > IT-201',
            expectedCustodian: 'Layla Hassan',
            status: 'Pending'
          }
        ];
        audit.totalExpected = audit.estimatedAssets;
        audit.totalPending = audit.estimatedAssets;
      }
      break;
    }

    case 'CLOSE_AUDIT': {
      // Governance check: check for unresolved exceptions
      if (audit.totalExceptions > 0 && actionPayload.forceClose !== true) {
        // Can only close if exceptions are approved/resolved
        throw new Error(`Cannot close audit: Campaign has ${audit.totalExceptions} unresolved exceptions. Resolve exceptions or request director override.`);
      }

      audit.status = 'Closed';
      audit.statusCode = 'CLOSED';
      audit.progress = 100;
      audit.closedAt = now;
      audit.closedBy = userName;
      audit.finalReconciliationReport = {
        generatedOn: now,
        signoffAuditor: userName,
        totalExpected: audit.totalExpected,
        totalVerified: audit.totalVerified,
        totalExceptions: audit.totalExceptions,
        discrepancyResolutionRate: '100%',
        reportCertificateNo: `CERT-${audit.auditId}-${Date.now().toString().slice(-4)}`
      };
      break;
    }

    case 'CANCEL_AUDIT': {
      audit.status = 'Closed';
      audit.statusCode = 'CANCELLED';
      audit.notes = `Audit cancelled by ${userName}: ${comments}`;
      break;
    }

    default:
      throw new Error(`Unsupported audit status action: ${action}`);
  }

  audit.updatedAt = now;
  return audit;
}
