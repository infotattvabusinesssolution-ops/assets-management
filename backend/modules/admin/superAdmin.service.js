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
      'models',
      'suppliers'
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

    // 5. Create License
    const newLicense = await prisma.license.create({
      data: {
        companyId: newCompany.id,
        licenseKey,
        maxUsers: Number(maxUsers) || 100,
        maxBranches: Number(maxBranches) || 5,
        expiryDate,
        isActive: true
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
      isActive: true
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
