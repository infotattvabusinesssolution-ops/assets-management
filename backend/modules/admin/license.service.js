import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';
import { logger } from '../../config/logger.js';

/**
 * Enterprise Licensing & Policy Service
 * Governs:
 * 1. Single-Company (Head Office) vs Multi-Company Entitlement
 * 2. Active User Caps (e.g. 50 users)
 * 3. Asset Capacity Limits
 * 4. Enterprise Module Entitlements
 */

export const DEFAULT_LICENSE_POLICY = {
  id: 'LIC-PRIMARY',
  licenseKey: 'FAMS-LIC-HEADOFFICE-2026-X992-ENTERPRISE',
  licensedTo: 'Dubai HQ Holding & Enterprise Divisions',
  licenseType: 'HEAD_OFFICE_SINGLE_COMPANY',
  licenseTier: 'Enterprise Head Office Edition',
  maxCompanies: 1, // Single company by default; requires Multi-Company license to add subsidiaries
  maxUsers: 50,    // 50 Active Users
  maxAssets: 25000,
  issuedDate: '2026-01-01T00:00:00.000Z',
  expiryDate: '2027-12-31T23:59:59.000Z',
  status: 'ACTIVE',
  modules: [
    'ASSETS_MANAGEMENT',
    'MAINTENANCE_CMMS',
    'PHYSICAL_AUDITS',
    'FINANCE_DEPRECIATION',
    'RTLS_RFID',
    'IT_DISCOVERY',
    'WORKFLOWS',
    'REPORTING'
  ]
};

// Resilient memory store
let currentLicense = { ...DEFAULT_LICENSE_POLICY };
let tableEnsured = false;

export async function ensureLicenseTable() {
  if (tableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_license_policy' and xtype='U')
      BEGIN
        CREATE TABLE system_license_policy (
          id NVARCHAR(100) PRIMARY KEY,
          license_key NVARCHAR(255) NOT NULL,
          licensed_to NVARCHAR(255) NOT NULL,
          license_type NVARCHAR(100) NOT NULL,
          license_tier NVARCHAR(100) NOT NULL,
          max_companies INT DEFAULT 1,
          max_users INT DEFAULT 50,
          max_assets INT DEFAULT 25000,
          issued_date DATETIME2 DEFAULT CURRENT_TIMESTAMP,
          expiry_date DATETIME2 NULL,
          status NVARCHAR(50) DEFAULT 'ACTIVE',
          modules NVARCHAR(MAX) NULL,
          created_at DATETIME2 DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME2 DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO system_license_policy (
          id, license_key, licensed_to, license_type, license_tier, 
          max_companies, max_users, max_assets, issued_date, expiry_date, status, modules
        ) VALUES (
          'LIC-PRIMARY', 
          'FAMS-LIC-HEADOFFICE-2026-X992-ENTERPRISE', 
          'Dubai HQ Holding & Enterprise Divisions', 
          'HEAD_OFFICE_SINGLE_COMPANY', 
          'Enterprise Head Office Edition', 
          1, 50, 25000, '2026-01-01', '2027-12-31', 'ACTIVE',
          '[\"ASSETS_MANAGEMENT\",\"MAINTENANCE_CMMS\",\"PHYSICAL_AUDITS\",\"FINANCE_DEPRECIATION\",\"RTLS_RFID\",\"IT_DISCOVERY\",\"WORKFLOWS\",\"REPORTING\"]'
        );
      END
    `);
    tableEnsured = true;
    logger.info('System license table ensured in database.');
  } catch (err) {
    logger.warn('Failed ensuring system_license_policy table: ' + err.message);
  }
}

/**
 * Returns current license details along with live utilization metrics
 */
export async function getLicenseDetails() {
  await ensureLicenseTable();

  // Try DB
  if (isDbConnected()) {
    try {
      const rows = await prisma.$queryRawUnsafe(`
        SELECT TOP 1 * FROM system_license_policy ORDER BY created_at DESC
      `);
      if (rows && rows.length > 0) {
        const r = rows[0];
        currentLicense = {
          id: r.id,
          licenseKey: r.license_key,
          licensedTo: r.licensed_to,
          licenseType: r.license_type,
          licenseTier: r.license_tier,
          maxCompanies: parseInt(r.max_companies, 10) || 1,
          maxUsers: parseInt(r.max_users, 10) || 50,
          maxAssets: parseInt(r.max_assets, 10) || 25000,
          issuedDate: r.issued_date,
          expiryDate: r.expiry_date,
          status: r.status,
          modules: typeof r.modules === 'string' ? JSON.parse(r.modules || '[]') : r.modules
        };
      }
    } catch (err) {
      logger.warn('Could not read system_license_policy: ' + err.message);
    }
  }

  // Count active companies and users
  let activeCompaniesCount = 1;
  let activeUsersCount = 4;
  let activeAssetsCount = 0;

  if (isDbConnected()) {
    try {
      activeCompaniesCount = await prisma.company.count({ where: { active: true } }).catch(() => 1);
      activeUsersCount = await prisma.user.count({ where: { active: true } }).catch(() => 4);
      activeAssetsCount = await prisma.asset.count().catch(() => 0);
    } catch (_) {}
  }

  const isExpired = currentLicense.expiryDate ? new Date() > new Date(currentLicense.expiryDate) : false;
  const isMultiCompanyAllowed = currentLicense.maxCompanies > 1;
  const isUserLimitReached = activeUsersCount >= currentLicense.maxUsers;
  const isCompanyLimitReached = activeCompaniesCount >= currentLicense.maxCompanies;

  return {
    ...currentLicense,
    metrics: {
      activeCompanies: activeCompaniesCount,
      maxCompanies: currentLicense.maxCompanies,
      availableCompanies: Math.max(0, currentLicense.maxCompanies - activeCompaniesCount),
      activeUsers: activeUsersCount,
      maxUsers: currentLicense.maxUsers,
      availableUsers: Math.max(0, currentLicense.maxUsers - activeUsersCount),
      activeAssets: activeAssetsCount,
      maxAssets: currentLicense.maxAssets,
      isExpired,
      isMultiCompanyAllowed,
      isUserLimitReached,
      isCompanyLimitReached,
      effectiveStatus: isExpired ? 'EXPIRED' : (isUserLimitReached || isCompanyLimitReached ? 'LIMIT_REACHED' : 'ACTIVE')
    }
  };
}

/**
 * Validates whether adding a new user is permitted under current license
 */
export async function validateCanAddUser() {
  const license = await getLicenseDetails();
  if (license.metrics.isExpired) {
    return {
      allowed: false,
      code: 'LICENSE_EXPIRED',
      message: 'System license has expired. Please contact your licensor to renew the license key before adding users.'
    };
  }
  if (license.metrics.isUserLimitReached) {
    return {
      allowed: false,
      code: 'USER_LIMIT_REACHED',
      message: `User limit reached (${license.metrics.activeUsers}/${license.metrics.maxUsers}). Current enterprise license permits a maximum of ${license.metrics.maxUsers} active users. Please upgrade your license to add more users.`
    };
  }
  return { allowed: true };
}

/**
 * Validates whether adding/activating a new company is permitted under current license
 */
export async function validateCanAddCompany() {
  const license = await getLicenseDetails();
  if (license.metrics.isExpired) {
    return {
      allowed: false,
      code: 'LICENSE_EXPIRED',
      message: 'System license has expired. Please contact your licensor to renew the license key.'
    };
  }
  if (!license.metrics.isMultiCompanyAllowed && license.metrics.activeCompanies >= 1) {
    return {
      allowed: false,
      code: 'MULTI_COMPANY_LICENSE_REQUIRED',
      message: `Multi-Company License Required: Your current license is for 1 Company (${license.licensedTo}). You can create unlimited divisions, departments, and sections under this company, but adding additional legal operating companies requires purchasing a Multi-Company Enterprise License.`
    };
  }
  if (license.metrics.isCompanyLimitReached) {
    return {
      allowed: false,
      code: 'COMPANY_LIMIT_REACHED',
      message: `Company license cap reached (${license.metrics.activeCompanies}/${license.metrics.maxCompanies}). Please upgrade your Multi-Company license to add more company entities.`
    };
  }
  return { allowed: true };
}

/**
 * Applies and validates a new license key
 */
export async function applyLicenseKey(keyString) {
  if (!keyString || typeof keyString !== 'string') {
    throw new Error('Valid license key string is required.');
  }

  const cleanKey = keyString.trim().toUpperCase();

  // Pattern detection for demo / enterprise keys:
  // e.g. MULTI-CMP-10 -> 10 companies, 200 users
  // e.g. HEAD-OFFICE-100 -> 1 company, 100 users
  let newPolicy = {
    ...currentLicense,
    licenseKey: cleanKey
  };

  if (cleanKey.includes('MULTI') || cleanKey.includes('CORP')) {
    newPolicy.licenseType = 'MULTI_COMPANY_ENTERPRISE';
    newPolicy.licenseTier = 'Multi-Company Enterprise Edition';
    newPolicy.maxCompanies = cleanKey.includes('10') ? 10 : (cleanKey.includes('5') ? 5 : 3);
    newPolicy.maxUsers = cleanKey.includes('500') ? 500 : (cleanKey.includes('200') ? 200 : 100);
    newPolicy.maxAssets = 100000;
  } else if (cleanKey.includes('UNLIMITED')) {
    newPolicy.licenseType = 'MULTI_COMPANY_ENTERPRISE';
    newPolicy.licenseTier = 'Unlimited Global Enterprise';
    newPolicy.maxCompanies = 50;
    newPolicy.maxUsers = 5000;
    newPolicy.maxAssets = 500000;
  } else {
    // Default single company upgrade
    newPolicy.licenseType = 'HEAD_OFFICE_SINGLE_COMPANY';
    newPolicy.licenseTier = 'Enterprise Head Office Edition';
    newPolicy.maxCompanies = 1;
    newPolicy.maxUsers = cleanKey.includes('100') ? 100 : (cleanKey.includes('75') ? 75 : 50);
  }

  // Extend expiry by 1 year from now
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  newPolicy.expiryDate = nextYear.toISOString();
  newPolicy.status = 'ACTIVE';

  currentLicense = newPolicy;

  if (isDbConnected()) {
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE system_license_policy
        SET license_key = '${newPolicy.licenseKey.replace(/'/g, "''")}',
            license_type = '${newPolicy.licenseType}',
            license_tier = '${newPolicy.licenseTier}',
            max_companies = ${newPolicy.maxCompanies},
            max_users = ${newPolicy.maxUsers},
            max_assets = ${newPolicy.maxAssets},
            expiry_date = '${newPolicy.expiryDate}',
            status = 'ACTIVE',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = '${newPolicy.id}'
      `);
    } catch (err) {
      logger.warn('Failed updating license in database: ' + err.message);
    }
  }

  return await getLicenseDetails();
}
