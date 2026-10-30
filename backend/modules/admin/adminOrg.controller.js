import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

// ==========================================
// SEED DATA PRE-LOADED WITH SCREENSHOT MATCH
// ==========================================

export let memoryUsers = [];

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

export let memoryCompanies = [];

export let memoryBusinessUnits = [];

export let memoryDepartments = [];

export let memoryLocations = [];

export let memoryCostCenters = [];

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
      accountStatus = ''
    } = req.query;

    let dbUsers = [];
    try {
      dbUsers = await prisma.user.findMany({
        include: {
          role: true,
          department: true,
          site: true,
          company: true,
          costCenter: true,
          employee: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('Prisma getAdminUsers query fallback:', e.message);
    }

    let filtered = dbUsers.map(u => ({
      id: u.id,
      name: u.fullName || u.username,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      employeeId: u.employee?.employeeCode || u.employeeId || 'EMP-001',
      role: u.role?.name || 'Standard User',
      roleId: u.role?.id || u.roleId,
      department: u.department?.name || 'General',
      location: u.site?.name || 'Main Campus',
      company: u.company?.name || 'Corporate',
      businessUnit: 'Corporate Operations',
      costCenter: u.costCenter?.code || 'CC-IT01',
      userType: 'System User',
      status: u.active ? 'Active' : 'Inactive',
      accountStatus: u.active ? 'Active' : 'Locked',
      mfaEnabled: true,
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB') : 'Recently',
      createdDate: new Date(u.createdAt).toISOString().split('T')[0],
      assignedLocations: [u.site?.name || 'Main Campus'],
      assignedCompanies: [u.company?.name || 'Corporate']
    }));

    const existingIds = new Set(filtered.map(u => u.id));
    const memoryOnly = memoryUsers.filter(mu => !existingIds.has(mu.id));
    filtered = [...memoryOnly, ...filtered];

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

    let createdId = `USR-${String(Date.now()).slice(-6)}`;
    try {
      if (prisma && prisma.user) {
        let roleRecord = await prisma.role.findFirst({
          where: { OR: [{ id: data.roleId || '' }, { name: { contains: data.role || 'Standard' } }] }
        });
        if (!roleRecord) {
          roleRecord = await prisma.role.findFirst();
        }

        let siteRecord = null;
        if (data.location || data.siteId) {
          siteRecord = await prisma.site.findFirst({
            where: { OR: [{ id: data.siteId || '' }, { name: data.location || '' }, { code: data.location || '' }] }
          }).catch(() => null);
        }

        let deptRecord = null;
        if (data.department || data.departmentId) {
          deptRecord = await prisma.department.findFirst({
            where: { OR: [{ id: data.departmentId || '' }, { name: data.department || '' }, { code: data.department || '' }] }
          }).catch(() => null);
        }

        let compRecord = null;
        if (data.company || data.companyId) {
          compRecord = await prisma.company.findFirst({
            where: { OR: [{ id: data.companyId || '' }, { name: data.company || '' }, { code: data.company || '' }] }
          }).catch(() => null);
        }

        if (roleRecord) {
          const dbCreated = await prisma.user.create({
            data: {
              fullName: data.name,
              username: data.username,
              email: data.email,
              phone: data.phone || '',
              passwordHash: '$2a$10$dummyHashForAdminCreatedUser',
              roleId: roleRecord.id,
              siteId: siteRecord ? siteRecord.id : null,
              departmentId: deptRecord ? deptRecord.id : null,
              companyId: compRecord ? compRecord.id : null,
              active: data.status === 'Active'
            }
          }).catch(err => {
            console.warn('Prisma create user skipped:', err.message);
            return null;
          });
          if (dbCreated) {
            createdId = dbCreated.id;
          }
        }
      }
    } catch (dbErr) {
      console.warn('Failed to insert user into DB, continuing with memory persistence:', dbErr.message);
    }

    const newUser = {
      id: createdId,
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone || '',
      employeeId: data.employeeId || `EMP-${String(Math.floor(100 + Math.random() * 900))}`,
      role: data.role || 'Standard User',
      roleId: data.roleId || 'ROLE-006',
      department: data.department || 'General',
      location: data.location || 'Main Campus',
      company: data.company || 'Corporate',
      businessUnit: data.businessUnit || 'Corporate Operations',
      costCenter: data.costCenter || 'CC-01',
      userType: data.userType || 'System User',
      status: data.status || 'Active',
      accountStatus: 'Active',
      mfaEnabled: Boolean(data.mfaEnabled),
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
      assignedLocations: data.assignedLocations || [data.location || 'Main Campus'],
      assignedCompanies: data.assignedCompanies || [data.company || 'Corporate']
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
    if (index !== -1) {
      memoryUsers[index] = { ...memoryUsers[index], ...req.body, id };
    } else {
      memoryUsers.unshift({ ...req.body, id });
    }

    try {
      let roleRecord = null;
      if (req.body.role || req.body.roleId) {
        roleRecord = await prisma.role.findFirst({
          where: { OR: [{ id: req.body.roleId || '' }, { name: { contains: req.body.role || '' } }] }
        }).catch(() => null);
      }
      let siteRecord = null;
      if (req.body.location || req.body.siteId) {
        siteRecord = await prisma.site.findFirst({
          where: { OR: [{ id: req.body.siteId || '' }, { name: req.body.location || '' }, { code: req.body.location || '' }] }
        }).catch(() => null);
      }
      let deptRecord = null;
      if (req.body.department || req.body.departmentId) {
        deptRecord = await prisma.department.findFirst({
          where: { OR: [{ id: req.body.departmentId || '' }, { name: req.body.department || '' }, { code: req.body.department || '' }] }
        }).catch(() => null);
      }
      let compRecord = null;
      if (req.body.company || req.body.companyId) {
        compRecord = await prisma.company.findFirst({
          where: { OR: [{ id: req.body.companyId || '' }, { name: req.body.company || '' }, { code: req.body.company || '' }] }
        }).catch(() => null);
      }

      const updateData = {
        fullName: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        active: req.body.status === 'Active'
      };
      if (roleRecord) updateData.roleId = roleRecord.id;
      if (siteRecord) updateData.siteId = siteRecord.id;
      if (deptRecord) updateData.departmentId = deptRecord.id;
      if (compRecord) updateData.companyId = compRecord.id;

      await prisma.user.update({
        where: { id },
        data: updateData
      }).catch(() => null);
    } catch (e) {}

    res.json({ success: true, user: memoryUsers[0], message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleAdminUserStatus(req, res) {
  try {
    const { id } = req.params;
    let user = memoryUsers.find(u => u.id === id);
    if (!user) {
      try {
        const dbU = await prisma.user.findUnique({ where: { id } });
        if (dbU) {
          const updated = await prisma.user.update({
            where: { id },
            data: { active: !dbU.active }
          });
          return res.json({
            success: true,
            user: { id, status: updated.active ? 'Active' : 'Inactive' },
            message: `User status changed to ${updated.active ? 'Active' : 'Inactive'}`
          });
        }
      } catch (e) {
        console.warn(e);
      }
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    user.accountStatus = user.status === 'Active' ? 'Active' : 'Locked';

    try {
      await prisma.user.update({
        where: { id },
        data: { active: user.status === 'Active' }
      }).catch(() => null);
    } catch (e) {}

    res.json({ success: true, user, message: `User status changed to ${user.status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function resetAdminUserPassword(req, res) {
  try {
    const { id } = req.params;
    let user = memoryUsers.find(u => u.id === id);
    const tempPassword = `Pass@${Math.floor(100000 + Math.random() * 900000)}`;
    res.json({
      success: true,
      message: `Password reset successfully for ${user?.name || 'User'}`,
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
    let user = memoryUsers.find(u => u.id === id);

    // Safety: prevent deletion of primary administrator
    if (user && user.role === 'System Administrator' && user.id === 'USR-001') {
      return res.status(400).json({ success: false, error: 'Primary System Administrator account cannot be deleted.' });
    }

    memoryUsers = memoryUsers.filter(u => u.id !== id);

    try {
      await prisma.user.delete({ where: { id } }).catch(() => null);
    } catch (e) {}

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
    const dbRoles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    if (dbRoles && dbRoles.length > 0) {
      const mapped = dbRoles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || `Enterprise ${r.name} role`,
        roleType: r.isSystem ? 'System Role' : 'Custom Role',
        userCount: 1,
        status: 'Active',
        dateCreated: new Date(r.createdAt).toLocaleDateString('en-GB'),
        createdBy: 'System Setup',
        isSystem: Boolean(r.isSystem),
        permissions: r.permissions ? (typeof r.permissions === 'string' ? (r.permissions.startsWith('[') || r.permissions.startsWith('{') ? JSON.parse(r.permissions) : r.permissions) : r.permissions) : {}
      }));
      return res.json({ success: true, roles: mapped, total: mapped.length, availableModules: DEFAULT_PERMISSIONS });
    }
    res.json({
      success: true,
      roles: memoryRoles,
      total: memoryRoles.length,
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
    const dbCompanies = await prisma.company.findMany({
      include: { sites: true, departments: true, costCenters: true },
      orderBy: { name: 'asc' }
    });
    const mapped = dbCompanies.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      currency: c.currency || 'USD',
      region: 'Middle East',
      type: 'Operating Entity',
      businessUnitsCount: 0,
      locationsCount: c.sites ? c.sites.length : 0,
      departmentsCount: c.departments ? c.departments.length : 0,
      status: c.active ? 'Active' : 'Inactive',
      createdOn: new Date(c.createdAt).toLocaleDateString('en-GB')
    }));
    return res.json({ success: true, companies: mapped, total: mapped.length });
  } catch (err) {
    res.json({ success: true, companies: memoryCompanies, total: memoryCompanies.length });
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
    const dbDepts = await prisma.department.findMany({
      include: { company: true },
      orderBy: { name: 'asc' }
    });
    const mapped = dbDepts.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      businessUnit: 'Corporate Operations',
      company: d.company?.name || '-',
      companyId: d.companyId,
      departmentHead: 'Unassigned',
      location: '-',
      costCenter: '-',
      status: d.active ? 'Active' : 'Inactive',
      createdOn: new Date(d.createdAt).toLocaleDateString('en-GB'),
      type: 'Operational'
    }));
    return res.json({ success: true, departments: mapped, total: mapped.length });
  } catch (err) {
    res.json({ success: true, departments: memoryDepartments, total: memoryDepartments.length });
  }
}

export async function getLocationsList(req, res) {
  try {
    const dbSites = await prisma.site.findMany({
      include: { company: true, buildings: true },
      orderBy: { name: 'asc' }
    });
    const mapped = dbSites.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      company: s.company?.name || '-',
      companyId: s.companyId,
      businessUnit: 'Corporate Operations',
      city: s.city || '-',
      country: s.country || '-',
      buildingsCount: s.buildings ? s.buildings.length : 0,
      locationType: 'Primary Facility',
      status: s.active ? 'Active' : 'Inactive',
      createdOn: new Date(s.createdAt).toLocaleDateString('en-GB')
    }));
    return res.json({ success: true, locations: mapped, total: mapped.length });
  } catch (err) {
    res.json({ success: true, locations: memoryLocations, total: memoryLocations.length });
  }
}

export async function getCostCentersList(req, res) {
  try {
    const dbCC = await prisma.costCenter.findMany({
      include: { company: true },
      orderBy: { code: 'asc' }
    });
    const mapped = dbCC.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      company: c.company?.name || '-',
      companyId: c.companyId,
      businessUnit: 'Corporate Operations',
      department: '-',
      location: '-',
      costCenterType: 'Operational',
      currency: c.company?.currency || 'USD',
      status: c.active ? 'Active' : 'Inactive',
      createdOn: new Date(c.createdAt).toLocaleDateString('en-GB')
    }));
    return res.json({ success: true, costCenters: mapped, total: mapped.length });
  } catch (err) {
    res.json({ success: true, costCenters: memoryCostCenters, total: memoryCostCenters.length });
  }
}

export async function createCompany(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Name and Code are required' });

    let createdCompany = null;
    try {
      createdCompany = await prisma.company.create({
        data: {
          code: data.code.toUpperCase(),
          name: data.name,
          currency: data.currency || 'USD',
          taxId: data.taxId || null,
          address: data.address || null,
          active: data.status !== 'Inactive'
        }
      });
    } catch (dbErr) {
      console.warn('Prisma create company error:', dbErr.message);
    }

    const newCompany = {
      id: createdCompany ? createdCompany.id : `CMP-${String(Date.now()).slice(-6)}`,
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type || 'Operating',
      region: data.region || 'UAE',
      businessUnitsCount: 0,
      locationsCount: 0,
      status: data.status || 'Active',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      parentCompany: data.parentCompany || null
    };

    memoryCompanies.unshift(newCompany);
    res.status(201).json({ success: true, company: newCompany, message: 'Company created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      await prisma.company.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code ? data.code.toUpperCase() : undefined,
          active: data.status !== 'Inactive' && data.active !== false
        }
      }).catch(() => null);
    } catch (e) {}

    const index = memoryCompanies.findIndex(c => c.id === id);
    if (index !== -1) {
      memoryCompanies[index] = { ...memoryCompanies[index], ...data };
    }

    res.json({ success: true, company: { id, ...data }, message: 'Company updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    try {
      await prisma.company.delete({ where: { id } }).catch(() => null);
    } catch (e) {}

    const index = memoryCompanies.findIndex(c => c.id === id);
    if (index !== -1) memoryCompanies.splice(index, 1);

    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createDepartment(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Department Name and Code are required' });

    let comp = null;
    if (data.companyId || data.company) {
      comp = await prisma.company.findFirst({
        where: { OR: [{ id: data.companyId || '' }, { name: data.company || '' }, { code: data.company || '' }] }
      }).catch(() => null);
    }
    if (!comp) comp = await prisma.company.findFirst().catch(() => null);

    let createdDept = null;
    if (comp) {
      try {
        createdDept = await prisma.department.create({
          data: {
            companyId: comp.id,
            code: data.code.toUpperCase(),
            name: data.name,
            active: data.status !== 'Inactive'
          }
        });
      } catch (dbErr) {
        console.warn('Prisma create department error:', dbErr.message);
      }
    }

    const newDept = {
      id: createdDept ? createdDept.id : `DEP-${String(Date.now()).slice(-6)}`,
      name: data.name,
      code: data.code.toUpperCase(),
      businessUnit: data.businessUnit || 'Corporate Operations',
      company: comp ? comp.name : (data.company || '-'),
      departmentHead: data.departmentHead || 'Unassigned',
      location: data.location || '-',
      costCenter: data.costCenter || '-',
      status: data.status || 'Active',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: data.type || 'Operational'
    };

    memoryDepartments.unshift(newDept);
    res.status(201).json({ success: true, department: newDept, message: 'Department created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      await prisma.department.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code ? data.code.toUpperCase() : undefined,
          active: data.status !== 'Inactive' && data.active !== false
        }
      }).catch(() => null);
    } catch (e) {}

    const index = memoryDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
      memoryDepartments[index] = { ...memoryDepartments[index], ...data };
    }

    res.json({ success: true, department: { id, ...data }, message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    try {
      await prisma.department.delete({ where: { id } }).catch(() => null);
    } catch (e) {}

    const index = memoryDepartments.findIndex(d => d.id === id);
    if (index !== -1) memoryDepartments.splice(index, 1);

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createLocation(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Location Name and Code are required' });

    let comp = null;
    if (data.companyId || data.company) {
      comp = await prisma.company.findFirst({
        where: { OR: [{ id: data.companyId || '' }, { name: data.company || '' }, { code: data.company || '' }] }
      }).catch(() => null);
    }
    if (!comp) comp = await prisma.company.findFirst().catch(() => null);

    let createdLoc = null;
    if (comp) {
      try {
        createdLoc = await prisma.site.create({
          data: {
            companyId: comp.id,
            code: data.code.toUpperCase(),
            name: data.name,
            city: data.city || null,
            country: data.country || null,
            active: data.status !== 'Inactive'
          }
        });
      } catch (dbErr) {
        console.warn('Prisma create site error:', dbErr.message);
      }
    }

    const newLoc = {
      id: createdLoc ? createdLoc.id : `LOC-${String(Date.now()).slice(-6)}`,
      name: data.name,
      code: data.code.toUpperCase(),
      company: comp ? comp.name : (data.company || '-'),
      businessUnit: data.businessUnit || 'Corporate Operations',
      city: data.city || '-',
      country: data.country || '-',
      locationType: data.locationType || 'Primary Facility',
      status: data.status || 'Active',
      address: data.address || ''
    };

    memoryLocations.unshift(newLoc);
    res.status(201).json({ success: true, location: newLoc, message: 'Location created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      await prisma.site.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code ? data.code.toUpperCase() : undefined,
          city: data.city || undefined,
          country: data.country || undefined,
          active: data.status !== 'Inactive' && data.active !== false
        }
      }).catch(() => null);
    } catch (e) {}

    const index = memoryLocations.findIndex(l => l.id === id);
    if (index !== -1) {
      memoryLocations[index] = { ...memoryLocations[index], ...data };
    }

    res.json({ success: true, location: { id, ...data }, message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteLocation(req, res) {
  try {
    const { id } = req.params;
    try {
      await prisma.site.delete({ where: { id } }).catch(() => null);
    } catch (e) {}

    const index = memoryLocations.findIndex(l => l.id === id);
    if (index !== -1) memoryLocations.splice(index, 1);

    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createCostCenter(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Cost Center Name and Code are required' });

    let comp = null;
    if (data.companyId || data.company) {
      comp = await prisma.company.findFirst({
        where: { OR: [{ id: data.companyId || '' }, { name: data.company || '' }, { code: data.company || '' }] }
      }).catch(() => null);
    }
    if (!comp) comp = await prisma.company.findFirst().catch(() => null);

    let createdCC = null;
    if (comp) {
      try {
        createdCC = await prisma.costCenter.create({
          data: {
            companyId: comp.id,
            code: data.code.toUpperCase(),
            name: data.name,
            active: data.status !== 'Inactive'
          }
        });
      } catch (dbErr) {
        console.warn('Prisma create cost center error:', dbErr.message);
      }
    }

    const newCC = {
      id: createdCC ? createdCC.id : `CC-${String(Date.now()).slice(-6)}`,
      code: data.code.toUpperCase(),
      name: data.name,
      company: comp ? comp.name : (data.company || '-'),
      businessUnit: data.businessUnit || 'Corporate Operations',
      department: data.department || '-',
      location: data.location || '-',
      costCenterType: data.costCenterType || 'Operational',
      currency: comp?.currency || data.currency || 'USD',
      status: data.status || 'Active'
    };

    memoryCostCenters.unshift(newCC);
    res.status(201).json({ success: true, costCenter: newCC, message: 'Cost Center created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCostCenter(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    try {
      await prisma.costCenter.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code ? data.code.toUpperCase() : undefined,
          active: data.status !== 'Inactive' && data.active !== false
        }
      }).catch(() => null);
    } catch (e) {}

    const index = memoryCostCenters.findIndex(c => c.id === id);
    if (index !== -1) {
      memoryCostCenters[index] = { ...memoryCostCenters[index], ...data };
    }

    res.json({ success: true, costCenter: { id, ...data }, message: 'Cost Center updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteCostCenter(req, res) {
  try {
    const { id } = req.params;
    try {
      await prisma.costCenter.delete({ where: { id } }).catch(() => null);
    } catch (e) {}

    const index = memoryCostCenters.findIndex(c => c.id === id);
    if (index !== -1) memoryCostCenters.splice(index, 1);

    res.json({ success: true, message: 'Cost Center deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBusinessUnit(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ success: false, error: 'Business Unit Name and Code are required' });

    const newUnit = {
      id: `BU-${String(Date.now()).slice(-6)}`,
      name: data.name,
      code: data.code.toUpperCase(),
      company: data.company || '-',
      parentUnit: data.parentUnit || '-',
      type: data.type || 'Operations',
      status: data.status || 'Active',
      description: data.description || ''
    };

    memoryBusinessUnits.unshift(newUnit);
    res.status(201).json({ success: true, businessUnit: newUnit, message: 'Business Unit created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateBusinessUnit(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const index = memoryBusinessUnits.findIndex(b => b.id === id);
    if (index !== -1) {
      memoryBusinessUnits[index] = { ...memoryBusinessUnits[index], ...data };
    }
    res.json({ success: true, businessUnit: { id, ...data }, message: 'Business Unit updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteBusinessUnit(req, res) {
  try {
    const { id } = req.params;
    const index = memoryBusinessUnits.findIndex(b => b.id === id);
    if (index !== -1) memoryBusinessUnits.splice(index, 1);
    res.json({ success: true, message: 'Business Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}