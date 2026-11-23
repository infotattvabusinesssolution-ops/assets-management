import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';
import { logger } from '../../config/logger.js';
import {
  getLicenseDetails,
  applyLicenseKey,
  validateCanAddCompany
} from './license.service.js';

/**
 * License and System Configuration Controller
 */

// GET /api/v1/admin/config/license
export async function getLicense(req, res, next) {
  try {
    const license = await getLicenseDetails();
    res.json({
      success: true,
      license
    });
  } catch (err) {
    logger.error('Error fetching license:', err);
    next(err);
  }
}

// POST /api/v1/admin/config/license/apply
export async function applyLicense(req, res, next) {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey || !licenseKey.trim()) {
      return res.status(400).json({
        success: false,
        message: 'License key string is required.'
      });
    }

    const companyId = req.user?.companyId || req.body?.companyId;
    const updatedLicense = await applyLicenseKey(licenseKey, companyId);
    res.json({
      success: true,
      message: 'License key verified and applied successfully.',
      license: updatedLicense
    });
  } catch (err) {
    logger.error('Error applying license:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to apply license key.'
    });
  }
}

// GET /api/v1/admin/config/companies
// Returns licensed company entities with licensing metadata
export async function getConfiguredCompanies(req, res, next) {
  try {
    let companies = [];
    if (isDbConnected()) {
      try {
        companies = await prisma.company.findMany({
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                departments: true,
                sites: true,
                users: true
              }
            }
          }
        });
      } catch (err) {
        logger.warn('Error querying companies with count:', err.message);
        companies = await prisma.company.findMany({ orderBy: { name: 'asc' } }).catch(() => []);
      }
    }

    // If empty, supply default head office company
    if (!companies || companies.length === 0) {
      companies = [
        {
          id: 'CMP-DUBAI-HQ',
          code: 'CMP-001',
          name: 'Dubai HQ Holding & Enterprise',
          legalName: 'Dubai HQ Asset Management LLC',
          currency: 'AED',
          timezone: 'Asia/Dubai (GMT+04:00)',
          active: true,
          isHeadOffice: true,
          _count: { departments: 6, sites: 4, users: 4 }
        }
      ];
    }

    const license = await getLicenseDetails();

    res.json({
      success: true,
      companies,
      license: {
        activeCompanies: license.metrics.activeCompanies,
        maxCompanies: license.metrics.maxCompanies,
        isMultiCompanyAllowed: license.metrics.isMultiCompanyAllowed,
        licenseTier: license.licenseTier
      }
    });
  } catch (err) {
    logger.error('Error fetching configured companies:', err);
    next(err);
  }
}

// GET /api/v1/admin/config/companies/enum
// Lightweight, read-only enumeration for UI dropdowns
export async function getCompanyEnumeration(req, res, next) {
  try {
    let companies = [];
    if (isDbConnected()) {
      try {
        companies = await prisma.company.findMany({
          where: { active: true },
          select: {
            id: true,
            code: true,
            name: true,
            currency: true,
            timezone: true,
            active: true
          },
          orderBy: { name: 'asc' }
        });
      } catch (_) {}
    }

    if (!companies || companies.length === 0) {
      companies = [
        {
          id: 'CMP-DUBAI-HQ',
          code: 'CMP-001',
          name: 'Dubai HQ Holding & Enterprise',
          currency: 'AED',
          timezone: 'Asia/Dubai',
          active: true
        }
      ];
    }

    res.json({
      success: true,
      companies
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/admin/config/companies
// Strictly gated by licensing limits!
export async function createConfiguredCompany(req, res, next) {
  try {
    const { name, code, currency, timezone, taxId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    // 1. Gated by license validation!
    const licenseCheck = await validateCanAddCompany();
    if (!licenseCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: licenseCheck.code,
        message: licenseCheck.message
      });
    }

    const cleanName = name.trim();
    const cleanCode = (code && code.trim()) ? code.trim().toUpperCase() : `CMP-${Date.now().toString().slice(-4)}`;

    let newCompany = null;
    if (isDbConnected()) {
      newCompany = await prisma.company.create({
        data: {
          code: cleanCode,
          name: cleanName,
          currency: currency || 'AED',
          timezone: timezone || 'Asia/Dubai',
          taxId: taxId || null,
          active: true
        }
      });
    } else {
      newCompany = {
        id: `CMP-${Date.now()}`,
        code: cleanCode,
        name: cleanName,
        currency: currency || 'AED',
        timezone: timezone || 'Asia/Dubai',
        active: true
      };
    }

    res.status(201).json({
      success: true,
      message: `Licensed Company "${cleanName}" activated successfully.`,
      company: newCompany
    });
  } catch (err) {
    logger.error('Error creating configured company:', err);
    next(err);
  }
}
