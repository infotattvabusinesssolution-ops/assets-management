import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// ==========================================
// SEED DATA PRE-LOADED WITH SCREENSHOT MATCH
// ==========================================

export let memoryUsers = [
  {
    id: 'USR-001',
    name: 'John Doe',
    username: 'jdoe',
    email: 'john.doe@asset360.com',
    phone: '+971 50 123 4567',
    employeeId: 'EMP-00101',
    role: 'System Administrator',
    roleId: 'ROLE-001',
    department: 'Information Technology',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-1001',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '10 Sep 2025 09:15 AM',
    createdDate: '2025-01-10',
    assignedLocations: ['Dubai HQ', 'Jebel Ali Warehouse'],
    assignedCompanies: ['Asset360 Holdings', 'Wavelogix FZC']
  },
  {
    id: 'USR-002',
    name: 'Sarah Ahmed',
    username: 'sahmed',
    email: 'sarah.ahmed@asset360.com',
    phone: '+971 50 234 5678',
    employeeId: 'EMP-00102',
    role: 'Asset Manager',
    roleId: 'ROLE-002',
    department: 'Finance',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-1002',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '09 Sep 2025 11:20 AM',
    createdDate: '2025-01-12',
    assignedLocations: ['Dubai HQ'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-003',
    name: 'Ramesh Kumar',
    username: 'rkumar',
    email: 'ramesh.kumar@asset360.com',
    phone: '+971 50 345 6789',
    employeeId: 'EMP-00103',
    role: 'Maintenance Manager',
    roleId: 'ROLE-003',
    department: 'Information Technology',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-1001',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '08 Sep 2025 04:45 PM',
    createdDate: '2025-01-15',
    assignedLocations: ['Dubai HQ', 'Abu Dhabi Office'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-004',
    name: 'Priya Nair',
    username: 'pnair',
    email: 'priya.nair@asset360.com',
    phone: '+971 50 456 7890',
    employeeId: 'EMP-00104',
    role: 'Inventory Manager',
    roleId: 'ROLE-004',
    department: 'Human Resources',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-1003',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: false,
    lastLogin: '07 Sep 2025 02:10 PM',
    createdDate: '2025-01-18',
    assignedLocations: ['Dubai HQ'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-005',
    name: 'Ahmed Al Marri',
    username: 'amarri',
    email: 'ahmed.marri@asset360.com',
    phone: '+971 50 567 8901',
    employeeId: 'EMP-00105',
    role: 'Audit Manager',
    roleId: 'ROLE-005',
    department: 'Operations',
    location: 'Jebel Ali',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    costCenter: 'CC-2001',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '06 Sep 2025 10:30 AM',
    createdDate: '2025-01-20',
    assignedLocations: ['Jebel Ali Warehouse', 'Dubai HQ'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-006',
    name: 'Fatima Saeed',
    username: 'fsaeed',
    email: 'fatima.saeed@asset360.com',
    phone: '+971 50 678 9012',
    employeeId: 'EMP-00106',
    role: 'Standard User',
    roleId: 'ROLE-006',
    department: 'Logistics',
    location: 'Sharjah',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    costCenter: 'CC-2003',
    userType: 'Portal User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: false,
    lastLogin: '05 Sep 2025 08:45 AM',
    createdDate: '2025-01-22',
    assignedLocations: ['Sharjah Warehouse'],
    assignedCompanies: ['Wavelogix FZC']
  },
  {
    id: 'USR-007',
    name: 'Khalid Hassan',
    username: 'khassan',
    email: 'khalid.h@asset360.com',
    phone: '+971 50 789 0123',
    employeeId: 'EMP-00107',
    role: 'Supervisor',
    roleId: 'ROLE-009',
    department: 'Facilities',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    costCenter: 'CC-2002',
    userType: 'Contractor',
    status: 'Inactive',
    accountStatus: 'Locked',
    mfaEnabled: false,
    lastLogin: '28 Aug 2025 03:15 PM',
    createdDate: '2025-01-25',
    assignedLocations: ['Dubai HQ'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-008',
    name: 'Lina George',
    username: 'lgeorge',
    email: 'lina.george@asset360.com',
    phone: '+971 50 890 1234',
    employeeId: 'EMP-00108',
    role: 'Report Viewer',
    roleId: 'ROLE-007',
    department: 'Finance',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-1004',
    userType: 'Portal User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '27 Aug 2025 01:25 PM',
    createdDate: '2025-01-28',
    assignedLocations: ['Dubai HQ'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-009',
    name: 'Omar Rahman',
    username: 'orahman',
    email: 'omar.rahman@asset360.com',
    phone: '+971 50 901 2345',
    employeeId: 'EMP-00109',
    role: 'Maintenance Technician',
    roleId: 'ROLE-009',
    department: 'Maintenance',
    location: 'Jebel Ali',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    costCenter: 'CC-2002',
    userType: 'Mobile User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: false,
    lastLogin: '25 Aug 2025 11:05 AM',
    createdDate: '2025-02-01',
    assignedLocations: ['Jebel Ali Warehouse'],
    assignedCompanies: ['Asset360 Holdings']
  },
  {
    id: 'USR-010',
    name: 'Chen Wei',
    username: 'cwei',
    email: 'chen.wei@asset360.com',
    phone: '+971 50 012 3456',
    employeeId: 'EMP-00110',
    role: 'Inventory User',
    roleId: 'ROLE-004',
    department: 'Warehouse',
    location: 'Abu Dhabi',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    costCenter: 'CC-2004',
    userType: 'System User',
    status: 'Active',
    accountStatus: 'Active',
    mfaEnabled: true,
    lastLogin: '22 Aug 2025 09:40 AM',
    createdDate: '2025-02-05',
    assignedLocations: ['Abu Dhabi Office'],
    assignedCompanies: ['Asset360 Holdings']
  }
];

// Add 38 more realistic mock users so total is 48 (matching Screenshot 1: "Showing 1 to 10 of 48 records")
for (let i = 11; i <= 48; i++) {
  const depts = ['Information Technology', 'Finance', 'Human Resources', 'Operations', 'Maintenance', 'Procurement', 'Logistics', 'Quality Assurance'];
  const locs = ['Dubai HQ', 'Jebel Ali Warehouse', 'Abu Dhabi Office', 'Sharjah Warehouse', 'Riyadh Office'];
  const cmps = ['Asset360 Holdings', 'Wavelogix FZC', 'd.code Solutions LLC', 'Digital ID Solutions FZ LLC'];
  const roles = ['Standard User', 'Read Only User', 'Contractor', 'Asset Manager', 'Maintenance Technician'];
  const types = ['System User', 'Portal User', 'Mobile User', 'Contractor'];

  memoryUsers.push({
    id: `USR-${String(i).padStart(3, '0')}`,
    name: `User ${i} Candidate`,
    username: `user${i}`,
    email: `user.${i}@asset360.com`,
    phone: `+971 50 ${100 + i} ${1000 + i}`,
    employeeId: `EMP-00${100 + i}`,
    role: roles[i % roles.length],
    roleId: `ROLE-00${(i % 5) + 1}`,
    department: depts[i % depts.length],
    location: locs[i % locs.length],
    company: cmps[i % cmps.length],
    businessUnit: 'Corporate Services',
    costCenter: `CC-100${(i % 5) + 1}`,
    userType: types[i % types.length],
    status: i % 7 === 0 ? 'Inactive' : 'Active',
    accountStatus: i % 7 === 0 ? 'Locked' : 'Active',
    mfaEnabled: i % 2 === 0,
    lastLogin: `${15 - (i % 12)} Aug 2025 10:${String(i % 60).padStart(2, '0')} AM`,
    createdDate: `2025-02-${String((i % 20) + 1).padStart(2, '0')}`,
    assignedLocations: [locs[i % locs.length]],
    assignedCompanies: [cmps[i % cmps.length]]
  });
}

// ==========================================
// ROLES & PERMISSION MATRIX (SCREENSHOT 2)
// ==========================================

export const DEFAULT_PERMISSIONS = {
  assets: {
    name: 'Asset Management',
    screens: {
      assetRegister: { name: 'Asset Register', actions: ['View', 'Create', 'Edit', 'Delete', 'Export', 'Import'] },
      assetForm: { name: 'New Asset Registration', actions: ['View', 'Create', 'Edit'] },
      myAssets: { name: 'My Assets', actions: ['View', 'Transfer'] },
      assetHierarchy: { name: 'Asset Hierarchy', actions: ['View', 'Edit'] },
      assetApprovals: { name: 'Asset Approvals', actions: ['View', 'Approve', 'Reject'] }
    }
  },
  movements: {
    name: 'Assignment & Movement',
    screens: {
      transferMovement: { name: 'Transfer & Movement', actions: ['View', 'Create', 'Execute', 'Approve', 'Export'] },
      assignAsset: { name: 'Assign Asset', actions: ['View', 'Assign', 'Edit'] },
      movementApprovals: { name: 'Movement Approvals', actions: ['View', 'Approve', 'Reject'] },
      movementHistory: { name: 'Movement History', actions: ['View', 'Export'] }
    }
  },
  audit: {
    name: 'Verification & Audit',
    screens: {
      auditManagement: { name: 'Audit Management', actions: ['View', 'Create', 'Edit', 'Delete', 'Assign'] },
      auditExecution: { name: 'Audit Execution', actions: ['View', 'Execute', 'Verify'] },
      auditReport: { name: 'Audit Reports', actions: ['View', 'Export'] }
    }
  },
  maintenance: {
    name: 'Maintenance',
    screens: {
      workOrders: { name: 'Work Orders', actions: ['View', 'Create', 'Edit', 'Execute', 'Approve', 'Delete'] },
      preventiveMaintenance: { name: 'Preventive Maintenance', actions: ['View', 'Create', 'Edit', 'Schedule'] }
    }
  },
  administration: {
    name: 'Administration',
    screens: {
      userManagement: { name: 'User Management', actions: ['View', 'Create', 'Edit', 'Delete', 'Administer'] },
      rolesPermissions: { name: 'Roles & Permissions', actions: ['View', 'Create', 'Edit', 'Delete', 'Administer'] },
      companyOrg: { name: 'Company & Organization', actions: ['View', 'Create', 'Edit', 'Delete', 'Administer'] },
      systemConfig: { name: 'System Configuration', actions: ['View', 'Edit', 'Administer'] },
      masterData: { name: 'Master Data Setup', actions: ['View', 'Create', 'Edit', 'Delete', 'Import', 'Export'] },
      integrations: { name: 'Integrations', actions: ['View', 'Edit', 'Execute', 'Administer'] },
      auditLogs: { name: 'Audit Logs', actions: ['View', 'Export'] },
      notifications: { name: 'Email Notifications', actions: ['View', 'Create', 'Edit', 'Administer'] },
      backupScheduler: { name: 'Backup & Scheduler', actions: ['View', 'Execute', 'Administer'] }
    }
  }
};

export let memoryRoles = [
  {
    id: 'ROLE-001',
    name: 'System Administrator',
    description: 'Full system access and configuration',
    roleType: 'System Role',
    userCount: 5,
    status: 'Active',
    dateCreated: '15 Jan 2025',
    createdBy: 'System',
    isSystem: true,
    permissions: { all: true }
  },
  {
    id: 'ROLE-002',
    name: 'Asset Manager',
    description: 'Manage assets and asset lifecycle',
    roleType: 'Custom Role',
    userCount: 8,
    status: 'Active',
    dateCreated: '20 Jan 2025',
    createdBy: 'John Doe',
    isSystem: false,
    permissions: {
      assets: ['View', 'Create', 'Edit', 'Delete', 'Export', 'Import', 'Approve'],
      movements: ['View', 'Create', 'Execute', 'Approve', 'Export'],
      audit: ['View', 'Create', 'Export'],
      administration: ['View']
    }
  },
  {
    id: 'ROLE-003',
    name: 'Maintenance Manager',
    description: 'Manage maintenance operations',
    roleType: 'Custom Role',
    userCount: 6,
    status: 'Active',
    dateCreated: '25 Jan 2025',
    createdBy: 'Sarah Ahmed',
    isSystem: false,
    permissions: {
      maintenance: ['View', 'Create', 'Edit', 'Execute', 'Approve', 'Schedule'],
      assets: ['View', 'Edit'],
      movements: ['View']
    }
  },
  {
    id: 'ROLE-004',
    name: 'Inventory Manager',
    description: 'Manage inventory and spare parts',
    roleType: 'Custom Role',
    userCount: 4,
    status: 'Active',
    dateCreated: '28 Jan 2025',
    createdBy: 'Ramesh Kumar',
    isSystem: false,
    permissions: {
      assets: ['View', 'Edit'],
      movements: ['View', 'Create', 'Execute'],
      inventory: ['View', 'Create', 'Edit', 'Execute', 'Export']
    }
  },
  {
    id: 'ROLE-005',
    name: 'Audit Manager',
    description: 'Access to audit and verification modules',
    roleType: 'Custom Role',
    userCount: 3,
    status: 'Active',
    dateCreated: '02 Feb 2025',
    createdBy: 'Priya Nair',
    isSystem: false,
    permissions: {
      audit: ['View', 'Create', 'Edit', 'Delete', 'Assign', 'Execute', 'Verify', 'Export'],
      assets: ['View', 'Export']
    }
  },
  {
    id: 'ROLE-006',
    name: 'Standard User',
    description: 'Basic access for daily operations',
    roleType: 'System Role',
    userCount: 28,
    status: 'Active',
    dateCreated: '10 Feb 2025',
    createdBy: 'System',
    isSystem: true,
    permissions: {
      assets: ['View'],
      movements: ['View', 'Create']
    }
  },
  {
    id: 'ROLE-007',
    name: 'Read Only User',
    description: 'View-only access to assigned data',
    roleType: 'System Role',
    userCount: 12,
    status: 'Active',
    dateCreated: '12 Feb 2025',
    createdBy: 'John Doe',
    isSystem: true,
    permissions: {
      assets: ['View'],
      movements: ['View'],
      audit: ['View'],
      maintenance: ['View']
    }
  },
  {
    id: 'ROLE-008',
    name: 'External Auditor',
    description: 'Limited access for external auditors',
    roleType: 'Custom Role',
    userCount: 2,
    status: 'Inactive',
    dateCreated: '15 Feb 2025',
    createdBy: 'Sarah Ahmed',
    isSystem: false,
    permissions: {
      audit: ['View', 'Verify', 'Export'],
      assets: ['View', 'Export']
    }
  },
  {
    id: 'ROLE-009',
    name: 'Contractor',
    description: 'Access to specific modules',
    roleType: 'Custom Role',
    userCount: 3,
    status: 'Active',
    dateCreated: '18 Feb 2025',
    createdBy: 'Ramesh Kumar',
    isSystem: false,
    permissions: {
      maintenance: ['View', 'Execute']
    }
  },
  {
    id: 'ROLE-010',
    name: 'Guest User',
    description: 'Temporary access',
    roleType: 'System Role',
    userCount: 1,
    status: 'Inactive',
    dateCreated: '20 Feb 2025',
    createdBy: 'System',
    isSystem: true,
    permissions: {
      assets: ['View']
    }
  }
];

// ==========================================
// ORGANIZATIONAL HIERARCHY (SCREENSHOTS 3, 4, 5)
// ==========================================

export let memoryCompanies = [
  { id: 'CMP-001', name: 'Asset360 Holdings', code: 'A360', type: 'Holding', region: 'UAE', businessUnitsCount: 5, locationsCount: 12, status: 'Active', createdOn: '10 Jan 2025', parentCompany: null },
  { id: 'CMP-002', name: 'Wavelogix FZC', code: 'WLF', type: 'Operating', region: 'UAE', businessUnitsCount: 3, locationsCount: 8, status: 'Active', createdOn: '12 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-003', name: 'd.code Solutions LLC', code: 'DCS', type: 'Operating', region: 'UAE', businessUnitsCount: 2, locationsCount: 5, status: 'Active', createdOn: '15 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-004', name: 'Digital ID Solutions FZ LLC', code: 'DIS', type: 'Operating', region: 'UAE', businessUnitsCount: 2, locationsCount: 4, status: 'Active', createdOn: '18 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-005', name: 'Aasaan Environmental Services', code: 'AES', type: 'Operating', region: 'KSA', businessUnitsCount: 3, locationsCount: 7, status: 'Active', createdOn: '22 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-006', name: 'CodeIQ Technologies', code: 'CIQ', type: 'Operating', region: 'Qatar', businessUnitsCount: 1, locationsCount: 3, status: 'Inactive', createdOn: '25 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-007', name: 'Middle East Operations', code: 'MEO', type: 'Region', region: 'UAE', businessUnitsCount: 0, locationsCount: 0, status: 'Active', createdOn: '28 Jan 2025', parentCompany: 'Asset360 Holdings' },
  { id: 'CMP-008', name: 'International Ventures', code: 'INV', type: 'Region', region: 'Other', businessUnitsCount: 0, locationsCount: 0, status: 'Active', createdOn: '01 Feb 2025', parentCompany: 'Asset360 Holdings' }
];

export let memoryBusinessUnits = [
  { id: 'BU-001', code: 'CS', name: 'Corporate Services', company: 'Asset360 Holdings', companyId: 'CMP-001', head: 'Ramesh Kumar', status: 'Active', createdOn: '10 Jan 2025' },
  { id: 'BU-002', code: 'OPS', name: 'Operations', company: 'Asset360 Holdings', companyId: 'CMP-001', head: 'Ahmed Al Marri', status: 'Active', createdOn: '10 Jan 2025' },
  { id: 'BU-003', code: 'COMM', name: 'Commercial', company: 'Asset360 Holdings', companyId: 'CMP-001', head: 'Omar Rahman', status: 'Active', createdOn: '11 Jan 2025' },
  { id: 'BU-004', code: 'TECH', name: 'Technology Solutions', company: 'Wavelogix FZC', companyId: 'CMP-002', head: 'Sarah Ahmed', status: 'Active', createdOn: '12 Jan 2025' },
  { id: 'BU-005', code: 'SALES', name: 'Sales & Consulting', company: 'd.code Solutions LLC', companyId: 'CMP-003', head: 'Priya Nair', status: 'Active', createdOn: '15 Jan 2025' },
  { id: 'BU-006', code: 'SUPPORT', name: 'Customer Support', company: 'Asset360 Holdings', companyId: 'CMP-001', head: 'John Doe', status: 'Active', createdOn: '18 Jan 2025' }
];

export let memoryDepartments = [
  { id: 'DEP-001', name: 'Information Technology', code: 'IT', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Ramesh Kumar', location: 'Dubai HQ', costCenter: 'CC-1001', status: 'Active', createdOn: '10 Jan 2025', type: 'Technical' },
  { id: 'DEP-002', name: 'Finance', code: 'FIN', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Sarah Ahmed', location: 'Dubai HQ', costCenter: 'CC-1002', status: 'Active', createdOn: '10 Jan 2025', type: 'Administrative' },
  { id: 'DEP-003', name: 'Human Resources', code: 'HR', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Priya Nair', location: 'Dubai HQ', costCenter: 'CC-1003', status: 'Active', createdOn: '11 Jan 2025', type: 'Administrative' },
  { id: 'DEP-004', name: 'Operations', code: 'OPS', businessUnit: 'Operations', company: 'Asset360 Holdings', departmentHead: 'Ahmed Al Marri', location: 'Jebel Ali', costCenter: 'CC-2001', status: 'Active', createdOn: '12 Jan 2025', type: 'Operational' },
  { id: 'DEP-005', name: 'Maintenance', code: 'MNT', businessUnit: 'Operations', company: 'Asset360 Holdings', departmentHead: 'Khalid Hassan', location: 'Jebel Ali', costCenter: 'CC-2002', status: 'Active', createdOn: '12 Jan 2025', type: 'Operational' },
  { id: 'DEP-006', name: 'Procurement', code: 'PRC', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Lina George', location: 'Dubai HQ', costCenter: 'CC-1004', status: 'Active', createdOn: '13 Jan 2025', type: 'Operational' },
  { id: 'DEP-007', name: 'Sales & Business Development', code: 'SBD', businessUnit: 'Commercial', company: 'Asset360 Holdings', departmentHead: 'Omar Rahman', location: 'Dubai HQ', costCenter: 'CC-3001', status: 'Active', createdOn: '14 Jan 2025', type: 'Commercial' },
  { id: 'DEP-008', name: 'Logistics', code: 'LOG', businessUnit: 'Operations', company: 'Wavelogix FZC', departmentHead: 'Fatima Saeed', location: 'Sharjah', costCenter: 'CC-2003', status: 'Active', createdOn: '15 Jan 2025', type: 'Operational' },
  { id: 'DEP-009', name: 'Health, Safety & Environment', code: 'HSE', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Mohammed Ali', location: 'Dubai HQ', costCenter: 'CC-1005', status: 'Inactive', createdOn: '16 Jan 2025', type: 'Compliance' },
  { id: 'DEP-010', name: 'Quality Assurance', code: 'QA', businessUnit: 'Operations', company: 'Asset360 Holdings', departmentHead: 'Saeed Al Hashmi', location: 'Abu Dhabi', costCenter: 'CC-2004', status: 'Active', createdOn: '17 Jan 2025', type: 'Compliance' },
  { id: 'DEP-011', name: 'Facilities Management', code: 'FAC', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Ahmed Al Marri', location: 'Dubai HQ', costCenter: 'CC-1006', status: 'Active', createdOn: '18 Jan 2025', type: 'Operational' },
  { id: 'DEP-012', name: 'Internal Audit', code: 'AUD', businessUnit: 'Corporate Services', company: 'Asset360 Holdings', departmentHead: 'Priya Nair', location: 'Dubai HQ', costCenter: 'CC-1007', status: 'Active', createdOn: '19 Jan 2025', type: 'Compliance' }
];

export let memoryLocations = [
  { id: 'LOC-001', name: 'Dubai HQ', code: 'DXB-HQ', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', city: 'Dubai', country: 'UAE', locationType: 'Head Office', status: 'Active' },
  { id: 'LOC-002', name: 'Jebel Ali Warehouse', code: 'DXB-WH1', company: 'Asset360 Holdings', businessUnit: 'Operations', city: 'Jebel Ali', country: 'UAE', locationType: 'Warehouse', status: 'Active' },
  { id: 'LOC-003', name: 'Abu Dhabi Office', code: 'AUH-OF1', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', city: 'Abu Dhabi', country: 'UAE', locationType: 'Office', status: 'Active' },
  { id: 'LOC-004', name: 'Sharjah Warehouse', code: 'SHJ-WH1', company: 'Wavelogix FZC', businessUnit: 'Operations', city: 'Sharjah', country: 'UAE', locationType: 'Warehouse', status: 'Active' },
  { id: 'LOC-005', name: 'Riyadh Office', code: 'RUH-OF1', company: 'd.code Solutions LLC', businessUnit: 'Sales & Consulting', city: 'Riyadh', country: 'KSA', locationType: 'Office', status: 'Active' },
  { id: 'LOC-006', name: 'Doha Office', code: 'DOH-OF1', company: 'Digital ID Solutions', businessUnit: 'Sales & Consulting', city: 'Doha', country: 'Qatar', locationType: 'Office', status: 'Inactive' },
  { id: 'LOC-007', name: 'Muscat Service Center', code: 'MCT-SVC', company: 'Asset360 Holdings', businessUnit: 'Customer Support', city: 'Muscat', country: 'Oman', locationType: 'Service Center', status: 'Active' },
  { id: 'LOC-008', name: 'Dammam Warehouse', code: 'DMM-WH1', company: 'Wavelogix FZC', businessUnit: 'Operations', city: 'Dammam', country: 'KSA', locationType: 'Warehouse', status: 'Active' },
  { id: 'LOC-009', name: 'Fujairah Site', code: 'FUJ-ST1', company: 'Aasaan Environmental Services', businessUnit: 'Operations', city: 'Fujairah', country: 'UAE', locationType: 'Site', status: 'Active' },
  { id: 'LOC-010', name: 'Al Ain Office', code: 'AAN-OF1', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', city: 'Al Ain', country: 'UAE', locationType: 'Office', status: 'Active' },
  { id: 'LOC-011', name: 'Ras Al Khaimah Depot', code: 'RAK-DP1', company: 'Asset360 Holdings', businessUnit: 'Operations', city: 'Ras Al Khaimah', country: 'UAE', locationType: 'Warehouse', status: 'Active' },
  { id: 'LOC-012', name: 'Jeddah Branch', code: 'JED-OF1', company: 'Aasaan Environmental Services', businessUnit: 'Sales & Consulting', city: 'Jeddah', country: 'KSA', locationType: 'Office', status: 'Active' },
  { id: 'LOC-013', name: 'Manama Service Center', code: 'BAH-SVC1', company: 'Asset360 Holdings', businessUnit: 'Customer Support', city: 'Manama', country: 'Bahrain', locationType: 'Service Center', status: 'Active' },
  { id: 'LOC-014', name: 'Kuwait City Hub', code: 'KWT-HUB1', company: 'Asset360 Holdings', businessUnit: 'Operations', city: 'Kuwait City', country: 'Kuwait', locationType: 'Site', status: 'Active' },
  { id: 'LOC-015', name: 'London Liaison Office', code: 'LON-OF1', company: 'International Ventures', businessUnit: 'Corporate Services', city: 'London', country: 'Other', locationType: 'Office', status: 'Active' }
];

export let memoryCostCenters = [
  { id: 'CC-001', code: 'CC-1001', name: 'IT Operations & Infrastructure', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', department: 'Information Technology', location: 'Dubai HQ', costCenterType: 'Operational', currency: 'AED', status: 'Active' },
  { id: 'CC-002', code: 'CC-1002', name: 'Financial Management', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', department: 'Finance', location: 'Dubai HQ', costCenterType: 'Administrative', currency: 'AED', status: 'Active' },
  { id: 'CC-003', code: 'CC-1003', name: 'Talent & Human Capital', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', department: 'Human Resources', location: 'Dubai HQ', costCenterType: 'Administrative', currency: 'AED', status: 'Active' },
  { id: 'CC-004', code: 'CC-2001', name: 'Supply Chain & Warehousing', company: 'Asset360 Holdings', businessUnit: 'Operations', department: 'Operations', location: 'Jebel Ali', costCenterType: 'Operational', currency: 'AED', status: 'Active' },
  { id: 'CC-005', code: 'CC-2002', name: 'Facilities & Plant Maintenance', company: 'Asset360 Holdings', businessUnit: 'Operations', department: 'Maintenance', location: 'Jebel Ali', costCenterType: 'Operational', currency: 'AED', status: 'Active' },
  { id: 'CC-006', code: 'CC-1004', name: 'Strategic Procurement', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', department: 'Procurement', location: 'Dubai HQ', costCenterType: 'Operational', currency: 'AED', status: 'Active' },
  { id: 'CC-007', code: 'CC-3001', name: 'Regional Commercial & Sales', company: 'Asset360 Holdings', businessUnit: 'Commercial', department: 'Sales & Business Development', location: 'Dubai HQ', costCenterType: 'Commercial', currency: 'AED', status: 'Active' },
  { id: 'CC-008', code: 'CC-2003', name: 'Freight Logistics Sharjah', company: 'Wavelogix FZC', businessUnit: 'Operations', department: 'Logistics', location: 'Sharjah', costCenterType: 'Operational', currency: 'AED', status: 'Active' },
  { id: 'CC-009', code: 'CC-1005', name: 'Health & Safety Operations', company: 'Asset360 Holdings', businessUnit: 'Corporate Services', department: 'Health, Safety & Environment', location: 'Dubai HQ', costCenterType: 'Compliance', currency: 'AED', status: 'Inactive' },
  { id: 'CC-010', code: 'CC-2004', name: 'Quality Assurance Lab', company: 'Asset360 Holdings', businessUnit: 'Operations', department: 'Quality Assurance', location: 'Abu Dhabi', costCenterType: 'Compliance', currency: 'AED', status: 'Active' }
];

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

export async function getAdminUsers(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      role = '',
      department = '',
      location = '',
      company = '',
      userType = '',
      accountStatus = '',
      mfaEnabled = '',
      permissionType = '',
      fromLastLogin = '',
      toLastLogin = '',
      fromCreatedDate = '',
      toCreatedDate = ''
    } = req.query;

    let filtered = [...memoryUsers];

    // Status filter
    if (status && status !== 'All' && status !== 'ALL') {
      filtered = filtered.filter(u => u.status.toLowerCase() === status.toLowerCase());
    }

    // Role filter
    if (role && role !== 'All Roles' && role !== 'ALL') {
      filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase() || u.roleId === role);
    }

    // Department filter
    if (department && department !== 'All Departments' && department !== 'ALL') {
      filtered = filtered.filter(u => u.department.toLowerCase() === department.toLowerCase());
    }

    // Location filter
    if (location && location !== 'All Locations' && location !== 'ALL') {
      filtered = filtered.filter(u => u.location.toLowerCase() === location.toLowerCase());
    }

    // Company filter
    if (company && company !== 'All Companies' && company !== 'ALL') {
      filtered = filtered.filter(u => u.company.toLowerCase() === company.toLowerCase());
    }

    // User type
    if (userType && userType !== 'All Users' && userType !== 'ALL') {
      filtered = filtered.filter(u => u.userType.toLowerCase() === userType.toLowerCase());
    }

    // Account status
    if (accountStatus && accountStatus !== 'All') {
      filtered = filtered.filter(u => u.accountStatus.toLowerCase() === accountStatus.toLowerCase());
    }

    // MFA Enabled
    if (mfaEnabled && mfaEnabled !== 'All') {
      const isMfa = mfaEnabled === 'true' || mfaEnabled === 'Enabled' || mfaEnabled === 'Yes';
      filtered = filtered.filter(u => Boolean(u.mfaEnabled) === isMfa);
    }

    // Search query
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      users: paginated,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAdminUser(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.email || !data.username) {
      return res.status(400).json({ success: false, error: 'Name, username, and email are required fields.' });
    }

    const newUser = {
      id: `USR-${String(memoryUsers.length + 1).padStart(3, '0')}`,
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone || '+971 50 000 0000',
      employeeId: data.employeeId || `EMP-00${memoryUsers.length + 101}`,
      role: data.role || 'Standard User',
      roleId: data.roleId || 'ROLE-006',
      department: data.department || 'Information Technology',
      location: data.location || 'Dubai HQ',
      company: data.company || 'Asset360 Holdings',
      businessUnit: data.businessUnit || 'Corporate Services',
      costCenter: data.costCenter || 'CC-1001',
      userType: data.userType || 'System User',
      status: data.status || 'Active',
      accountStatus: 'Active',
      mfaEnabled: Boolean(data.mfaEnabled),
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
      assignedLocations: data.assignedLocations || [data.location || 'Dubai HQ'],
      assignedCompanies: data.assignedCompanies || [data.company || 'Asset360 Holdings']
    };

    memoryUsers.unshift(newUser);
    res.status(201).json({ success: true, user: newUser, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAdminUser(req, res) {
  try {
    const { id } = req.params;
    const index = memoryUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    memoryUsers[index] = { ...memoryUsers[index], ...req.body, id };
    res.json({ success: true, user: memoryUsers[index], message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleAdminUserStatus(req, res) {
  try {
    const { id } = req.params;
    const user = memoryUsers.find(u => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    user.accountStatus = user.status === 'Active' ? 'Active' : 'Locked';

    res.json({ success: true, user, message: `User status changed to ${user.status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function resetAdminUserPassword(req, res) {
  try {
    const { id } = req.params;
    const user = memoryUsers.find(u => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const tempPassword = `Pass@${Math.floor(100000 + Math.random() * 900000)}`;
    res.json({
      success: true,
      message: `Password reset successfully for ${user.name}`,
      tempPassword,
      instructions: 'A temporary password has been generated. The user will be prompted to change it upon next login.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteAdminUser(req, res) {
  try {
    const { id } = req.params;
    const user = memoryUsers.find(u => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Safety: prevent deletion of primary administrator
    if (user.role === 'System Administrator' && user.id === 'USR-001') {
      return res.status(400).json({ success: false, error: 'Primary System Administrator account cannot be deleted.' });
    }

    memoryUsers = memoryUsers.filter(u => u.id !== id);
    res.json({ success: true, message: 'User record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// ROLES & PERMISSIONS ENDPOINTS
// ==========================================

export async function getAdminRoles(req, res) {
  try {
    const { search = '', status = '', roleType = '', module = '', createdBy = '' } = req.query;
    let filtered = [...memoryRoles];

    if (status && status !== 'All Status' && status !== 'ALL') {
      filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (roleType && roleType !== 'All Types' && roleType !== 'ALL') {
      filtered = filtered.filter(r => r.roleType.toLowerCase() === roleType.toLowerCase());
    }

    if (createdBy && createdBy !== 'All Users') {
      filtered = filtered.filter(r => r.createdBy.toLowerCase() === createdBy.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      roles: filtered,
      total: filtered.length,
      availableModules: DEFAULT_PERMISSIONS
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAdminRole(req, res) {
  try {
    const data = req.body;
    if (!data.name) return res.status(400).json({ success: false, error: 'Role name is required' });

    const newRole = {
      id: `ROLE-${String(memoryRoles.length + 1).padStart(3, '0')}`,
      name: data.name,
      description: data.description || '',
      roleType: 'Custom Role',
      userCount: 0,
      status: data.status || 'Active',
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdBy: req.user?.name || 'Administrator',
      isSystem: false,
      permissions: data.permissions || {}
    };

    memoryRoles.push(newRole);
    res.status(201).json({ success: true, role: newRole, message: 'Role created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAdminRole(req, res) {
  try {
    const { id } = req.params;
    const index = memoryRoles.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Role not found' });

    if (memoryRoles[index].isSystem && req.body.name && req.body.name !== memoryRoles[index].name) {
      return res.status(400).json({ success: false, error: 'System Role names cannot be renamed.' });
    }

    memoryRoles[index] = { ...memoryRoles[index], ...req.body, id };
    res.json({ success: true, role: memoryRoles[index], message: 'Role permissions updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function cloneAdminRole(req, res) {
  try {
    const { id } = req.params;
    const source = memoryRoles.find(r => r.id === id);
    if (!source) return res.status(404).json({ success: false, error: 'Source role not found' });

    const cloned = {
      id: `ROLE-${String(memoryRoles.length + 1).padStart(3, '0')}`,
      name: `${source.name} (Copy)`,
      description: `Cloned from ${source.name}. ${source.description}`,
      roleType: 'Custom Role',
      userCount: 0,
      status: 'Active',
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdBy: req.user?.name || 'Administrator',
      isSystem: false,
      permissions: JSON.parse(JSON.stringify(source.permissions || {}))
    };

    memoryRoles.push(cloned);
    res.status(201).json({ success: true, role: cloned, message: 'Role cloned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteAdminRole(req, res) {
  try {
    const { id } = req.params;
    const role = memoryRoles.find(r => r.id === id);
    if (!role) return res.status(404).json({ success: false, error: 'Role not found' });

    if (role.isSystem) {
      return res.status(400).json({ success: false, error: 'System roles cannot be deleted.' });
    }

    if (role.userCount > 0) {
      return res.status(400).json({ success: false, error: `Cannot delete role. It is currently assigned to ${role.userCount} users.` });
    }

    memoryRoles = memoryRoles.filter(r => r.id !== id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// ORGANIZATION HIERARCHY ENDPOINTS
// ==========================================

export async function getCompaniesList(req, res) {
  try {
    const { search = '', status = '', region = '', type = '' } = req.query;
    let list = [...memoryCompanies];

    if (status && status !== 'All Status' && status !== 'ALL') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (region && region !== 'All Regions' && region !== 'ALL') {
      list = list.filter(c => c.region.toLowerCase() === region.toLowerCase());
    }
    if (type && type !== 'All Types' && type !== 'ALL') {
      list = list.filter(c => c.type.toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }

    res.json({ success: true, companies: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBusinessUnitsList(req, res) {
  try {
    const { companyId = '', search = '', status = '' } = req.query;
    let list = [...memoryBusinessUnits];

    if (companyId) list = list.filter(b => b.companyId === companyId || b.company === companyId);
    if (status && status !== 'All Status') list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
    }

    res.json({ success: true, businessUnits: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDepartmentsList(req, res) {
  try {
    const { company = '', businessUnit = '', status = '', location = '', costCenter = '', search = '' } = req.query;
    let list = [...memoryDepartments];

    if (company && company !== 'All Companies') list = list.filter(d => d.company.toLowerCase() === company.toLowerCase());
    if (businessUnit && businessUnit !== 'All Business Units') list = list.filter(d => d.businessUnit.toLowerCase() === businessUnit.toLowerCase());
    if (status && status !== 'All Status') list = list.filter(d => d.status.toLowerCase() === status.toLowerCase());
    if (location && location !== 'All Locations') list = list.filter(d => d.location.toLowerCase() === location.toLowerCase());
    if (costCenter && costCenter !== 'All Cost Centers') list = list.filter(d => d.costCenter.toLowerCase() === costCenter.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.departmentHead.toLowerCase().includes(q));
    }

    res.json({ success: true, departments: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getLocationsList(req, res) {
  try {
    const { company = '', businessUnit = '', country = '', city = '', locationType = '', status = '', search = '' } = req.query;
    let list = [...memoryLocations];

    if (company && company !== 'All Companies') list = list.filter(l => l.company.toLowerCase() === company.toLowerCase());
    if (businessUnit && businessUnit !== 'All Business Units') list = list.filter(l => l.businessUnit.toLowerCase() === businessUnit.toLowerCase());
    if (country && country !== 'All Countries') list = list.filter(l => l.country.toLowerCase() === country.toLowerCase());
    if (city && city !== 'All Cities') list = list.filter(l => l.city.toLowerCase() === city.toLowerCase());
    if (locationType && locationType !== 'All Types') list = list.filter(l => l.locationType.toLowerCase() === locationType.toLowerCase());
    if (status && status !== 'All Statuses' && status !== 'All Status') list = list.filter(l => l.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
    }

    res.json({ success: true, locations: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCostCentersList(req, res) {
  try {
    const { company = '', department = '', status = '', search = '' } = req.query;
    let list = [...memoryCostCenters];

    if (company && company !== 'All Companies') list = list.filter(c => c.company.toLowerCase() === company.toLowerCase());
    if (department && department !== 'All Departments') list = list.filter(c => c.department.toLowerCase() === department.toLowerCase());
    if (status && status !== 'All Status') list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }

    res.json({ success: true, costCenters: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createCompany(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Name and Code are required' });

    const newCompany = {
      id: `CMP-${String(memoryCompanies.length + 1).padStart(3, '0')}`,
      name: data.name,
      code: data.code,
      type: data.type || 'Operating',
      region: data.region || 'UAE',
      businessUnitsCount: 0,
      locationsCount: 0,
      status: data.status || 'Active',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      parentCompany: data.parentCompany || null
    };

    memoryCompanies.push(newCompany);
    res.status(201).json({ success: true, company: newCompany, message: 'Company created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createDepartment(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Department Name and Code are required' });

    const newDept = {
      id: `DEP-${String(memoryDepartments.length + 1).padStart(3, '0')}`,
      name: data.name,
      code: data.code,
      businessUnit: data.businessUnit || 'Corporate Services',
      company: data.company || 'Asset360 Holdings',
      departmentHead: data.departmentHead || 'Ramesh Kumar',
      location: data.location || 'Dubai HQ',
      costCenter: data.costCenter || 'CC-1001',
      status: data.status || 'Active',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: data.type || 'Operational'
    };

    memoryDepartments.push(newDept);
    res.status(201).json({ success: true, department: newDept, message: 'Department created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createLocation(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Location Name and Code are required' });

    const newLoc = {
      id: `LOC-${String(memoryLocations.length + 1).padStart(3, '0')}`,
      name: data.name,
      code: data.code,
      company: data.company || 'Asset360 Holdings',
      businessUnit: data.businessUnit || 'Corporate Services',
      city: data.city || 'Dubai',
      country: data.country || 'UAE',
      locationType: data.locationType || 'Office',
      status: data.status || 'Active'
    };

    memoryLocations.push(newLoc);
    res.status(201).json({ success: true, location: newLoc, message: 'Location created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createCostCenter(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Cost Center Name and Code are required' });

    const newCC = {
      id: `CC-${String(memoryCostCenters.length + 1).padStart(3, '0')}`,
      code: data.code,
      name: data.name,
      company: data.company || 'Asset360 Holdings',
      businessUnit: data.businessUnit || 'Corporate Services',
      department: data.department || 'Information Technology',
      location: data.location || 'Dubai HQ',
      costCenterType: data.costCenterType || 'Operational',
      currency: data.currency || 'AED',
      status: data.status || 'Active'
    };

    memoryCostCenters.push(newCC);
    res.status(201).json({ success: true, costCenter: newCC, message: 'Cost Center created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
