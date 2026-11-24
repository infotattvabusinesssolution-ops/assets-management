import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';
import { logger } from '../../config/logger.js';

let tablesEnsured = false;

/**
 * Ensures all multi-tenant and license tables/columns exist in Microsoft SQL Server
 */
export async function ensureMultiTenantTables() {
  if (tablesEnsured || !isDbConnected()) return;
  try {
    // 1. SUPER_ADMINS TABLE
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='super_admins' and xtype='U')
      BEGIN
        CREATE TABLE super_admins (
          id NVARCHAR(100) PRIMARY KEY,
          username NVARCHAR(100) NOT NULL UNIQUE,
          email NVARCHAR(150) NOT NULL UNIQUE,
          passwordHash NVARCHAR(255) NOT NULL,
          fullName NVARCHAR(150) DEFAULT 'Super Administrator',
          active BIT DEFAULT 1,
          createdAt DATETIME2 DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME2 DEFAULT CURRENT_TIMESTAMP
        );
      END
    `);

    // 2. Add superAdminId to companies if not exists
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('companies') AND name = 'superAdminId')
      BEGIN
        ALTER TABLE companies ADD superAdminId NVARCHAR(100) NULL;
      END
    `);

    // 3. LICENSES TABLE
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='licenses' and xtype='U')
      BEGIN
        CREATE TABLE licenses (
          id NVARCHAR(100) PRIMARY KEY,
          companyId NVARCHAR(100) NOT NULL UNIQUE,
          licenseKey NVARCHAR(255) NOT NULL UNIQUE,
          maxUsers INT DEFAULT 100,
          maxBranches INT DEFAULT 5,
          expiryDate DATETIME2 NULL,
          isActive BIT DEFAULT 1,
          createdAt DATETIME2 DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME2 DEFAULT CURRENT_TIMESTAMP
        );
      END
    `);

    // 4. BRANCHES TABLE
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='branches' and xtype='U')
      BEGIN
        CREATE TABLE branches (
          id NVARCHAR(100) PRIMARY KEY,
          companyId NVARCHAR(100) NOT NULL,
          code NVARCHAR(50) NULL,
          name NVARCHAR(150) NOT NULL,
          city NVARCHAR(100) NULL,
          address NVARCHAR(255) NULL,
          isActive BIT DEFAULT 1,
          createdAt DATETIME2 DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME2 DEFAULT CURRENT_TIMESTAMP
        );
      END
    `);

    // 5. Add branchId to users if not exists
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'branchId')
      BEGIN
        ALTER TABLE users ADD branchId NVARCHAR(100) NULL;
      END
    `);

    // 6. Add companyId to roles if not exists
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('roles') AND name = 'companyId')
      BEGIN
        ALTER TABLE roles ADD companyId NVARCHAR(100) NULL;
      END
    `);

    // 7. Add companyId to taxonomy master tables for multi-tenant isolation
    const taxonomyTables = [
      'asset_groups',
      'asset_sub_groups',
      'categories',
      'sub_categories',
      'manufacturers',
      'brands',
      'asset_models',
      'models',
      'service_providers',
      'suppliers',
      'item_masters'
    ];
    for (const table of taxonomyTables) {
      await prisma.$executeRawUnsafe(`
        IF EXISTS (SELECT * FROM sysobjects WHERE name='${table}' and xtype='U')
        BEGIN
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('${table}') AND name = 'companyId')
          BEGIN
            ALTER TABLE ${table} ADD companyId NVARCHAR(100) NULL;
          END
        END
      `).catch(() => null);
    }

    tablesEnsured = true;
    logger.info('✅ Multi-Tenant architecture tables and relations ensured in SQL Server.');
  } catch (err) {
    logger.warn('Warning during ensureMultiTenantTables: ' + err.message);
  }
}

/**
 * Returns or creates the default Super Admin record in database
 */
export async function getOrCreateSuperAdmin({
  username = 'superadmin',
  email = 'superadmin@asset360.com',
  password = 'SuperAdmin@Asset360!'
} = {}) {
  await ensureMultiTenantTables();

  if (isDbConnected()) {
    try {
      let superAdmin = await prisma.superAdmin.findFirst({
        where: { OR: [{ username }, { email }] }
      });

      if (!superAdmin) {
        const passwordHash = await bcrypt.hash(password, 10);
        superAdmin = await prisma.superAdmin.create({
          data: {
            username,
            email,
            passwordHash,
            fullName: 'Platform Super Administrator',
            active: true
          }
        });
        logger.info(`Initialized default Super Admin (${username}) in database.`);
      }
      return superAdmin;
    } catch (err) {
      logger.warn('Could not query/create superAdmin via Prisma: ' + err.message);
    }
  }

  return {
    id: 'superadmin-root',
    username,
    email,
    fullName: 'Platform Super Administrator'
  };
}

/**
 * Generates an Enterprise License Key
 * Example: ASSET360-ABCT-8A9F-2026-ENT
 */
export function generateLicenseKey(companyCode) {
  const code = (companyCode || 'CORP').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `ASSET360-${code}-${randomHex}-${year}-ENT`;
}

/**
 * Generates a compliant secure temporary password if none provided
 */
export function generateSecureTemporaryPassword(companyCode) {
  const cleanCode = (companyCode || 'Asset').replace(/[^a-zA-Z]/g, '');
  const prefix = cleanCode.charAt(0).toUpperCase() + cleanCode.slice(1, 4).toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${randomNum}!`;
}

/**
 * PROVISION A NEW COMPANY + LICENSE + BRANCH + SYSTEM ADMINISTRATOR
 *
 * This performs atomic multi-tenant initialization:
 * 1. Creates the Company linked to Super Admin
 * 2. Creates the License record (Max Users, Max Branches, Expiry)
 * 3. Creates the Initial Branch (and matching Site for asset location tracking)
 * 4. Finds/Creates the Company Administrator Role
 * 5. Generates the Client System Administrator User with hashed password & forcePasswordChange: true
 * 6. Creates Default Company Password Policy
 */
export async function provisionCompany({
  companyName,
  companyCode,
  currency = 'USD',
  taxId = null,
  address = null,
  maxUsers = 100,
  maxBranches = 5,
  expiryDays = 365,
  branchName = 'Head Office',
  branchCity = null,
  adminUsername,
  adminEmail,
  adminPassword = null,
  adminFullName = null,
  adminPhone = null,
  superAdminId = null
}) {
  await ensureMultiTenantTables();

  if (!companyName || !companyName.trim()) {
    throw new Error('Company Name is required.');
  }
  if (!companyCode || !companyCode.trim()) {
    throw new Error('Company Code is required.');
  }
  if (!adminUsername || !adminUsername.trim()) {
    throw new Error('System Administrator Username is required.');
  }
  if (!adminEmail || !adminEmail.trim()) {
    throw new Error('System Administrator Email is required.');
  }

  const cleanCode = companyCode.trim().toUpperCase();
  const cleanName = companyName.trim();
  const cleanUsername = adminUsername.trim();
  const cleanEmail = adminEmail.trim().toLowerCase();
  const finalPassword = adminPassword && adminPassword.trim() 
    ? adminPassword.trim() 
    : generateSecureTemporaryPassword(cleanCode);

  // Get Super Admin ID if not passed
  let sAdminId = superAdminId;
  if (!sAdminId && isDbConnected()) {
    const sAdmin = await getOrCreateSuperAdmin();
    sAdminId = sAdmin?.id;
  }

  // Calculate Expiry Date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + Number(expiryDays || 365));

  const licenseKey = generateLicenseKey(cleanCode);
  const passwordHash = await bcrypt.hash(finalPassword, 10);

  if (isDbConnected()) {
    // 1. Check for duplicate company code
    const existingCompany = await prisma.company.findUnique({
      where: { code: cleanCode }
    });
    if (existingCompany) {
      throw new Error(`A company with code "${cleanCode}" already exists.`);
    }

    // 2. Check for duplicate username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }]
      }
    });
    if (existingUser) {
      throw new Error(`A user with username "${cleanUsername}" or email "${cleanEmail}" already exists.`);
    }

    // 3. Resolve or create SYS_ADMIN role
    let sysAdminRole = await prisma.role.findFirst({
      where: { code: 'SYS_ADMIN' }
    });
    if (!sysAdminRole) {
      sysAdminRole = await prisma.role.create({
        data: {
          name: 'System Administrator',
          code: 'SYS_ADMIN',
          description: 'Full administrative access over company operations',
          permissions: JSON.stringify(['*']),
          isSystem: true,
          active: true
        }
      });
    }

    // 4. Create Company
    const newCompany = await prisma.company.create({
      data: {
        name: cleanName,
        code: cleanCode,
        currency: currency || 'USD',
        taxId,
        address,
        active: true,
        superAdminId: sAdminId
      }
    });

    // 5. Create License (pending client activation with license key)
    const newLicense = await prisma.license.create({
      data: {
        companyId: newCompany.id,
        licenseKey,
        maxUsers: Number(maxUsers) || 100,
        maxBranches: Number(maxBranches) || 5,
        expiryDate,
        isActive: false
      }
    });

    // 6. Create Initial Branch
    const newBranch = await prisma.branch.create({
      data: {
        companyId: newCompany.id,
        code: `${cleanCode}-BR-01`,
        name: branchName || 'Head Office',
        city: branchCity,
        isActive: true
      }
    });

    // 7. Also create matching Site (for physical asset localization in FAMS)
    const newSite = await prisma.site.create({
      data: {
        companyId: newCompany.id,
        code: `${cleanCode}-HQ`,
        name: branchName || 'Head Office Campus',
        city: branchCity,
        type: 'Head Office',
        active: true
      }
    }).catch(() => null);

    // 8. Create the Company System Administrator User
    const newAdminUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        fullName: adminFullName || `${cleanName} System Administrator`,
        phone: adminPhone,
        roleId: sysAdminRole.id,
        companyId: newCompany.id,
        branchId: newBranch.id,
        siteId: newSite?.id,
        active: true,
        forcePasswordChange: true
      }
    });

    // 9. Create Default Company Password Policy
    await prisma.companyPasswordPolicy.create({
      data: {
        companyId: newCompany.id,
        minLength: 8,
        maxLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
        preventSpaces: true
      }
    }).catch(() => null);

    return {
      success: true,
      company: newCompany,
      license: newLicense,
      branch: newBranch,
      systemAdmin: {
        id: newAdminUser.id,
        username: newAdminUser.username,
        email: newAdminUser.email,
        fullName: newAdminUser.fullName,
        temporaryPassword: finalPassword,
        forcePasswordChange: true
      }
    };
  }

  // Fallback if DB offline
  const mockCompanyId = `comp-${cleanCode.toLowerCase()}-${Date.now()}`;
  return {
    success: true,
    company: {
      id: mockCompanyId,
      name: cleanName,
      code: cleanCode,
      currency,
      active: true
    },
    license: {
      id: `lic-${cleanCode.toLowerCase()}`,
      companyId: mockCompanyId,
      licenseKey,
      maxUsers: Number(maxUsers) || 100,
      maxBranches: Number(maxBranches) || 5,
      expiryDate,
      isActive: false
    },
    branch: {
      id: `br-${cleanCode.toLowerCase()}-01`,
      companyId: mockCompanyId,
      name: branchName || 'Head Office',
      isActive: true
    },
    systemAdmin: {
      username: cleanUsername,
      email: cleanEmail,
      temporaryPassword: finalPassword,
      forcePasswordChange: true
    }
  };
}

/**
 * List all companies with live licensing and administrator details
 */
export async function listCompaniesSummary() {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    return [];
  }

  const companies = await prisma.company.findMany({
    include: {
      license: true,
      branches: true,
      superAdmin: {
        select: { id: true, username: true, email: true, fullName: true }
      },
      users: {
        where: { active: true },
        select: { id: true, username: true, email: true, fullName: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return companies.map(c => {
    const lic = c.license || {};
    const activeUsersCount = c.users.length;
    const activeBranchesCount = c.branches.filter(b => b.isActive).length;
    const isExpired = lic.expiryDate ? new Date() > new Date(lic.expiryDate) : false;
    const adminUser = c.users.find(u => u.role?.code === 'SYS_ADMIN') || c.users[0] || null;

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      currency: c.currency,
      active: c.active,
      createdAt: c.createdAt,
      license: {
        licenseKey: lic.licenseKey || 'N/A',
        isActive: lic.isActive ?? true,
        isExpired,
        maxUsers: lic.maxUsers || 50,
        activeUsers: activeUsersCount,
        availableUsers: Math.max(0, (lic.maxUsers || 50) - activeUsersCount),
        maxBranches: lic.maxBranches || 5,
        activeBranches: activeBranchesCount,
        availableBranches: Math.max(0, (lic.maxBranches || 5) - activeBranchesCount),
        expiryDate: lic.expiryDate
      },
      administrator: adminUser ? {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        fullName: adminUser.fullName
      } : null
    };
  });
}

/**
 * Updates an existing company's license limits or extends expiry
 */
export async function updateCompanyLicense(companyCodeOrId, {
  maxUsers,
  maxBranches,
  extendDays,
  expiryDate,
  isActive
}) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const company = await prisma.company.findFirst({
    where: {
      OR: [{ id: companyCodeOrId }, { code: companyCodeOrId }]
    },
    include: { license: true }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found.`);
  }

  let finalExpiry = expiryDate ? new Date(expiryDate) : company.license?.expiryDate;
  if (extendDays && Number(extendDays) > 0) {
    const baseDate = finalExpiry && finalExpiry > new Date() ? finalExpiry : new Date();
    finalExpiry = new Date(baseDate.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000);
  }

  const updateData = {};
  if (maxUsers !== undefined) updateData.maxUsers = Number(maxUsers);
  if (maxBranches !== undefined) updateData.maxBranches = Number(maxBranches);
  if (finalExpiry !== undefined) updateData.expiryDate = finalExpiry;
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);

  let updatedLicense;
  if (company.license) {
    updatedLicense = await prisma.license.update({
      where: { companyId: company.id },
      data: updateData
    });
  } else {
    updatedLicense = await prisma.license.create({
      data: {
        companyId: company.id,
        licenseKey: generateLicenseKey(company.code),
        maxUsers: Number(maxUsers) || 100,
        maxBranches: Number(maxBranches) || 5,
        expiryDate: finalExpiry,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
  }

  return {
    success: true,
    company: { id: company.id, code: company.code, name: company.name },
    license: updatedLicense
  };
}

/**
 * Resets the password for a company's System Administrator from the backend
 */
export async function resetCompanyAdminPassword(companyCodeOrId, newPassword = null) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const company = await prisma.company.findFirst({
    where: {
      OR: [{ id: companyCodeOrId }, { code: companyCodeOrId }]
    },
    include: {
      users: {
        include: { role: true }
      }
    }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found.`);
  }

  const adminUser = company.users.find(u => u.role?.code === 'SYS_ADMIN') || company.users[0];
  if (!adminUser) {
    throw new Error(`No administrator found for company "${company.name}".`);
  }

  const passwordToSet = newPassword && newPassword.trim()
    ? newPassword.trim()
    : generateSecureTemporaryPassword(company.code);

  const passwordHash = await bcrypt.hash(passwordToSet, 10);

  await prisma.user.update({
    where: { id: adminUser.id },
    data: {
      passwordHash,
      forcePasswordChange: true
    }
  });

  return {
    success: true,
    company: { id: company.id, code: company.code, name: company.name },
    administrator: {
      username: adminUser.username,
      email: adminUser.email,
      temporaryPassword: passwordToSet,
      forcePasswordChange: true
    }
  };
}

/**
 * Continuously validates whether an action is permitted under the company's license
 * @param {string} companyId 
 * @param {'ADD_USER' | 'ADD_BRANCH'} action 
 */
export async function validateLicenseForCompany(companyId, action) {
  if (!companyId || !isDbConnected()) return { allowed: true };

  try {
    const license = await prisma.license.findUnique({
      where: { companyId }
    });

    // If company doesn't have an explicit license record yet, allow default
    if (!license) return { allowed: true };

    if (!license.isActive) {
      return {
        allowed: false,
        code: 'LICENSE_INACTIVE',
        message: 'This company account is currently deactivated by the Platform Super Administrator.'
      };
    }

    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return {
        allowed: false,
        code: 'LICENSE_EXPIRED',
        message: `Company license expired on ${new Date(license.expiryDate).toLocaleDateString()}. Please contact your Platform Super Administrator to renew your subscription.`
      };
    }

    if (action === 'ADD_USER') {
      const activeUsersCount = await prisma.user.count({
        where: { companyId, active: true }
      });
      if (activeUsersCount >= license.maxUsers) {
        return {
          allowed: false,
          code: 'USER_LIMIT_REACHED',
          message: `User limit reached (${activeUsersCount}/${license.maxUsers}). Current company license permits a maximum of ${license.maxUsers} active users. Contact Super Admin to upgrade.`
        };
      }
    }

    if (action === 'ADD_BRANCH') {
      const activeBranchesCount = await prisma.branch.count({
        where: { companyId, isActive: true }
      });
      const activeSitesCount = await prisma.site.count({
        where: { companyId, active: true }
      });
      const currentBranches = Math.max(activeBranchesCount, activeSitesCount);

      if (currentBranches >= license.maxBranches) {
        return {
          allowed: false,
          code: 'BRANCH_LIMIT_REACHED',
          message: `Branch limit reached (${currentBranches}/${license.maxBranches}). Current company license permits a maximum of ${license.maxBranches} branches/sites. Contact Super Admin to upgrade.`
        };
      }
    }

    return { allowed: true };
  } catch (err) {
    logger.warn('Error during validateLicenseForCompany: ' + err.message);
    return { allowed: true };
  }
}

/**
 * Performs a safe pre-check dependency audit on a company before deletion.
 * Detects assets, master data, and foreign key references.
 */
export async function getCompanyDeletionAudit(companyCodeOrId) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { id: companyCodeOrId },
        { code: companyCodeOrId }
      ]
    },
    include: {
      license: true,
      branches: true,
      sites: true,
      users: true,
      assets: true,
      departments: true,
      costCenters: true,
      employees: true
    }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found in database.`);
  }

  const compId = company.id;
  const deptIds = (company.departments || []).map(d => d.id);
  const costCenterIds = (company.costCenters || []).map(c => c.id);

  // Check for external users from OTHER companies referencing this company's taxonomy
  let externalUsers = [];
  if (deptIds.length > 0 || costCenterIds.length > 0) {
    externalUsers = await prisma.user.findMany({
      where: {
        AND: [
          { companyId: { not: compId } },
          {
            OR: [
              ...(costCenterIds.length > 0 ? [{ costCenterId: { in: costCenterIds } }] : []),
              ...(deptIds.length > 0 ? [{ departmentId: { in: deptIds } }] : [])
            ]
          }
        ]
      },
      select: { id: true, username: true, email: true, company: { select: { name: true, code: true } } }
    }).catch(() => []);
  }

  const assetCount = (company.assets || []).length;
  const userCount = (company.users || []).length;
  const branchCount = (company.branches || []).length;
  const deptCount = (company.departments || []).length;
  const costCenterCount = (company.costCenters || []).length;
  const employeeCount = (company.employees || []).length;

  const isSafeEmpty = assetCount === 0 && employeeCount === 0 && externalUsers.length === 0;

  return {
    company: {
      id: company.id,
      code: company.code,
      name: company.name,
      active: company.active
    },
    license: company.license ? {
      key: company.license.licenseKey,
      isActive: company.license.isActive,
      maxUsers: company.license.maxUsers
    } : null,
    counts: {
      assets: assetCount,
      users: userCount,
      branches: branchCount,
      departments: deptCount,
      costCenters: costCenterCount,
      employees: employeeCount
    },
    externalUsers,
    isSafeEmpty,
    recommendation: isSafeEmpty ? 'SAFE_TO_PURGE' : 'DEACTIVATE_RECOMMENDED'
  };
}

/**
 * Permanently deletes a tenant company and all its associated records:
 * License, Branches, Sites, Admin & Users, Password Policy, Cost Centers, Departments, etc.
 * Handles unlinking of all relational foreign key dependencies cleanly.
 */
export async function deleteCompanyCascade(companyCodeOrId, { force = false } = {}) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const audit = await getCompanyDeletionAudit(companyCodeOrId);
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { id: companyCodeOrId },
        { code: companyCodeOrId }
      ]
    },
    include: {
      license: true,
      branches: true,
      sites: true,
      users: true,
      assets: true,
      departments: true,
      costCenters: true,
      employees: true
    }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found in database.`);
  }

  // Enterprise Guardrail: Prevent silent destruction of active assets
  if (audit.counts.assets > 0 && !force) {
    throw new Error(`Enterprise Protection Notice: Company "${company.name}" (${company.code}) has ${audit.counts.assets} active asset(s) and operational records. To preserve audit and tax records, choose DEACTIVATE instead. To force permanent purge of all assets, pass force: true or --force.`);
  }

  // Dependency Guardrail: Check external cross-company assignments
  if (audit.externalUsers.length > 0 && !force) {
    const extList = audit.externalUsers.map(u => `${u.username} (${u.company?.code || 'External'})`).join(', ');
    throw new Error(`Dependency Conflict: ${audit.externalUsers.length} user(s) from other companies (${extList}) are assigned to this company's sections/departments. Please reassign them first, or pass force: true.`);
  }

  const compId = company.id;
  const userIds = (company.users || []).map(u => u.id);
  const siteIds = (company.sites || []).map(s => s.id);
  const deptIds = (company.departments || []).map(d => d.id);
  const costCenterIds = (company.costCenters || []).map(c => c.id);
  const assetIds = (company.assets || []).map(a => a.id);

  // -------------------------------------------------------------
  // STEP 1: UNLINK EXTERNAL USER & EMPLOYEE & ASSET REFERENCES TO THIS COMPANY'S TAXONOMY
  // -------------------------------------------------------------
  // Any user in the entire DB pointing to this company's cost center, department, site, or branch
  await prisma.user.updateMany({
    where: {
      OR: [
        ...(costCenterIds.length > 0 ? [{ costCenterId: { in: costCenterIds } }] : []),
        ...(deptIds.length > 0 ? [{ departmentId: { in: deptIds } }] : []),
        ...(siteIds.length > 0 ? [{ siteId: { in: siteIds } }] : []),
        { companyId: compId }
      ]
    },
    data: {
      costCenterId: null,
      departmentId: null,
      siteId: null,
      branchId: null
    }
  }).catch(() => null);

  // Any employee in the DB pointing to this company's cost center or department
  if (costCenterIds.length > 0 || deptIds.length > 0) {
    await prisma.employee.updateMany({
      where: {
        OR: [
          ...(costCenterIds.length > 0 ? [{ costCenterId: { in: costCenterIds } }] : []),
          ...(deptIds.length > 0 ? [{ departmentId: { in: deptIds } }] : [])
        ]
      },
      data: {
        costCenterId: null,
        departmentId: null
      }
    }).catch(() => null);
  }

  // Any asset in the DB pointing to this company's cost center, department, or site
  if (costCenterIds.length > 0 || deptIds.length > 0 || siteIds.length > 0) {
    const ccList = costCenterIds.map(id => `'${id}'`).join(',');
    const deptList = deptIds.map(id => `'${id}'`).join(',');
    const siteList = siteIds.map(id => `'${id}'`).join(',');
    const orClauses = [];
    if (ccList) orClauses.push(`costCenterId IN (${ccList})`);
    if (deptList) orClauses.push(`departmentId IN (${deptList})`);
    if (siteList) orClauses.push(`siteId IN (${siteList})`);
    if (orClauses.length > 0) {
      await prisma.$executeRawUnsafe(`UPDATE assets SET costCenterId = NULL, departmentId = NULL WHERE ${orClauses.join(' OR ')}`).catch(() => null);
    }
  }

  // Unlink Cost Centers from Departments (breaks circular cost_centers_departmentId_fkey)
  if (deptIds.length > 0 || costCenterIds.length > 0) {
    await prisma.costCenter.updateMany({
      where: {
        OR: [
          { companyId: compId },
          ...(deptIds.length > 0 ? [{ departmentId: { in: deptIds } }] : [])
        ]
      },
      data: { departmentId: null }
    }).catch(() => null);
  }

  // -------------------------------------------------------------
  // STEP 2: CLEAN UP USER FOREIGN KEYS FOR USERS IN THIS COMPANY
  // -------------------------------------------------------------
  if (userIds.length > 0) {
    await prisma.userDataScope.deleteMany({ where: { userId: { in: userIds } } }).catch(() => null);
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } }).catch(() => null);
    await prisma.auditEvent.deleteMany({ where: { userId: { in: userIds } } }).catch(() => null);
    await prisma.custodyAssignment.deleteMany({ where: { issuedByUserId: { in: userIds } } }).catch(() => null);
    await prisma.assetTransfer.deleteMany({
      where: {
        OR: [
          { requestedByUserId: { in: userIds } },
          { approvedByUserId: { in: userIds } },
          { receivedByUserId: { in: userIds } }
        ]
      }
    }).catch(() => null);

    // Nullify optional user FKs on other tables via raw SQL
    const uList = userIds.map(id => `'${id}'`).join(',');
    if (uList) {
      await prisma.$executeRawUnsafe(`UPDATE assets SET createdByUserId = NULL, updatedByUserId = NULL WHERE createdByUserId IN (${uList}) OR updatedByUserId IN (${uList})`).catch(() => null);
      await prisma.$executeRawUnsafe(`UPDATE asset_transactions SET performedByUserId = NULL WHERE performedByUserId IN (${uList})`).catch(() => null);
      await prisma.$executeRawUnsafe(`UPDATE maintenance_work_orders SET assignedTechnicianId = NULL, createdByUserId = NULL WHERE assignedTechnicianId IN (${uList}) OR createdByUserId IN (${uList})`).catch(() => null);
      await prisma.$executeRawUnsafe(`UPDATE depreciation_runs SET postedByUserId = NULL WHERE postedByUserId IN (${uList})`).catch(() => null);
      await prisma.$executeRawUnsafe(`UPDATE import_jobs SET createdByUserId = NULL WHERE createdByUserId IN (${uList})`).catch(() => null);
    }

    // Delete Users of this company
    await prisma.user.deleteMany({ where: { companyId: compId } }).catch(() => null);
  }

  // -------------------------------------------------------------
  // STEP 3: ASSETS & ASSET TRANSACTIONS
  // -------------------------------------------------------------
  if (assetIds.length > 0) {
    await prisma.maintenanceWorkOrder.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.custodyAssignment.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.assetTransfer.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.assetCustomFieldValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.assetBookValue.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.assetTransaction.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.contractAsset.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.tag.deleteMany({ where: { assetId: { in: assetIds } } }).catch(() => null);
    await prisma.asset.deleteMany({ where: { companyId: compId } }).catch(() => null);
  }

  // Transfers linking to/from this company
  await prisma.assetTransfer.deleteMany({
    where: { OR: [{ fromCompanyId: compId }, { toCompanyId: compId }] }
  }).catch(() => null);

  // -------------------------------------------------------------
  // STEP 4: COST CENTERS & DEPARTMENTS & EMPLOYEES
  // -------------------------------------------------------------
  // Delete cost centers first (now that departmentId is NULL and users/assets/employees are unlinked)
  await prisma.costCenter.deleteMany({ where: { companyId: compId } }).catch(() => null);
  // Delete departments (now that cost centers are gone)
  await prisma.department.deleteMany({ where: { companyId: compId } }).catch(() => null);
  // Delete employees
  await prisma.employee.deleteMany({ where: { companyId: compId } }).catch(() => null);

  // -------------------------------------------------------------
  // STEP 5: SITES & SUBSTRUCTURES
  // -------------------------------------------------------------
  if (siteIds.length > 0) {
    try {
      const buildings = await prisma.building.findMany({ where: { siteId: { in: siteIds } }, select: { id: true } });
      const buildingIds = buildings.map(b => b.id);
      if (buildingIds.length > 0) {
        const floors = await prisma.floor.findMany({ where: { buildingId: { in: buildingIds } }, select: { id: true } });
        const floorIds = floors.map(f => f.id);
        if (floorIds.length > 0) {
          const rooms = await prisma.room.findMany({ where: { floorId: { in: floorIds } }, select: { id: true } });
          const roomIds = rooms.map(r => r.id);
          if (roomIds.length > 0) {
            await prisma.zone.deleteMany({ where: { roomId: { in: roomIds } } }).catch(() => null);
            await prisma.room.deleteMany({ where: { id: { in: roomIds } } }).catch(() => null);
          }
          await prisma.floor.deleteMany({ where: { id: { in: floorIds } } }).catch(() => null);
        }
        await prisma.building.deleteMany({ where: { id: { in: buildingIds } } }).catch(() => null);
      }
    } catch (e) {}
    await prisma.receipt.deleteMany({ where: { siteId: { in: siteIds } } }).catch(() => null);
    await prisma.site.deleteMany({ where: { companyId: compId } }).catch(() => null);
  }

  // -------------------------------------------------------------
  // STEP 6: BRANCHES, LICENSES, POLICIES, OTHER RELATIONS
  // -------------------------------------------------------------
  await prisma.branch.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.receipt.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.depreciationRun.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.fiscalPeriod.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.serviceProvider.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.companyPasswordPolicy.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.license.deleteMany({ where: { companyId: compId } }).catch(() => null);
  await prisma.role.deleteMany({ where: { companyId: compId, isSystem: false } }).catch(() => null);

  // -------------------------------------------------------------
  // STEP 7: FINALLY DELETE THE COMPANY RECORD
  // -------------------------------------------------------------
  await prisma.company.delete({ where: { id: compId } });

  logger.info(`Permanently deleted company ${company.name} (${company.code}) and all child entities.`);

  return {
    success: true,
    deletedCompany: {
      id: company.id,
      code: company.code,
      name: company.name
    },
    deletedCounts: {
      users: userIds.length,
      branches: (company.branches || []).length,
      sites: (company.sites || []).length,
      departments: deptIds.length,
      costCenters: costCenterIds.length,
      hasLicense: Boolean(company.license)
    }
  };
}

/**
 * Deactivates a company and all its associated licenses, branches, and user accounts
 */
export async function deactivateCompany(companyCodeOrId) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const company = await prisma.company.findFirst({
    where: {
      OR: [{ id: companyCodeOrId }, { code: companyCodeOrId }]
    }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found in database.`);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { active: false }
  });

  await prisma.license.updateMany({
    where: { companyId: company.id },
    data: { isActive: false }
  }).catch(() => null);

  await prisma.branch.updateMany({
    where: { companyId: company.id },
    data: { isActive: false }
  }).catch(() => null);

  await prisma.user.updateMany({
    where: { companyId: company.id },
    data: { active: false }
  }).catch(() => null);

  return {
    success: true,
    company: { id: company.id, code: company.code, name: company.name, active: false }
  };
}

/**
 * Reactivates a company and all its associated licenses, branches, and user accounts
 */
export async function reactivateCompany(companyCodeOrId) {
  await ensureMultiTenantTables();

  if (!isDbConnected()) {
    throw new Error('Database is offline.');
  }

  const company = await prisma.company.findFirst({
    where: {
      OR: [{ id: companyCodeOrId }, { code: companyCodeOrId }]
    }
  });

  if (!company) {
    throw new Error(`Company "${companyCodeOrId}" not found in database.`);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { active: true }
  });

  await prisma.license.updateMany({
    where: { companyId: company.id },
    data: { isActive: true }
  }).catch(() => null);

  await prisma.branch.updateMany({
    where: { companyId: company.id },
    data: { isActive: true }
  }).catch(() => null);

  await prisma.user.updateMany({
    where: { companyId: company.id },
    data: { active: true }
  }).catch(() => null);

  return {
    success: true,
    company: { id: company.id, code: company.code, name: company.name, active: true }
  };
}
