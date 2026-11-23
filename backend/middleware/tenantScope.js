/**
 * Multi-Tenant Data Isolation Middleware
 * =======================================
 * Layer 1: Forces companyId scoping on EVERY authenticated request.
 * Layer 3: Provides IDOR-safe single-record ownership check.
 * Layer 4: Financial field masking for non-finance roles.
 *
 * Usage in routes:
 *   router.use(authenticateToken);
 *   router.use(enforceTenantScope);  // <-- attaches req.tenantFilter, req.tenantCompanyId
 */

// ── Layer 1: Tenant Scope ──────────────────────────────────────────────

/**
 * Middleware that attaches `req.tenantCompanyId` and `req.tenantFilter`
 * to every request based on the authenticated user's companyId.
 *
 * SYS_ADMIN users are STILL scoped to their own company (multi-tenant).
 * Only the platform-level Super Admin (via CLI) can operate cross-company.
 */
export function enforceTenantScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const companyId = req.user.companyId || (req.user.company && req.user.company.id) || null;

  if (!companyId) {
    // Legacy/demo tokens without companyId — allow passthrough with empty filter
    // so that existing single-tenant installations keep working.
    req.tenantCompanyId = null;
    req.tenantFilter = {};
    return next();
  }

  req.tenantCompanyId = companyId;
  req.tenantFilter = { companyId };

  // Also fix the old dataScopeFilter if it was set by the legacy middleware
  if (req.dataScopeFilter) {
    req.dataScopeFilter.companyId = companyId;
  } else {
    req.dataScopeFilter = { companyId };
  }

  next();
}


// ── Layer 3: IDOR Protection Helper ────────────────────────────────────

/**
 * Verifies that a database record belongs to the requesting user's company.
 * Returns true if the record belongs to the same company (or if tenant scoping
 * is not applicable). Returns false if the record belongs to another company.
 *
 * @param {object} record - The database record (must have a `companyId` field)
 * @param {object} req    - Express request object (needs req.tenantCompanyId)
 * @returns {boolean}
 */
export function belongsToTenant(record, req) {
  if (!req.tenantCompanyId) return true;         // No tenant scoping active
  if (!record) return false;                       // Record not found
  if (!record.companyId) return true;              // Record has no company field (global)
  return record.companyId === req.tenantCompanyId;
}


// ── Layer 4: Financial Field Masking ───────────────────────────────────

const FINANCIAL_FIELDS = [
  'purchaseCost',
  'currentBookValue',
  'accumulatedDepreciation',
  'residualValue',
  'invoiceNumber',
  'purchaseOrderNumber',
  'purchasePrice',
  'depreciationRate',
  'netBookValue',
  'salvageValue',
  'totalCost',
  'unitCost',
  'replacementCost',
  'insuranceValue',
  'marketValue'
];

/**
 * Returns true if the user has permission to view financial data.
 */
export function canViewFinancials(req) {
  const role = req.user?.role || req.user?.roleId;
  const roleCode = typeof role === 'string' ? role : role?.code;

  // SYS_ADMIN and FINANCE roles can always see financials
  if (['SYS_ADMIN', 'FINANCE', 'AUDITOR', 'MANAGEMENT'].includes(roleCode)) {
    return true;
  }

  // Check dynamic permission matrix
  let permissions = null;
  if (role && role.permissions) {
    if (typeof role.permissions === 'string') {
      try { permissions = JSON.parse(role.permissions); } catch (_) { permissions = null; }
    } else {
      permissions = role.permissions;
    }
  }

  if (permissions) {
    // Flat array check
    if (Array.isArray(permissions)) {
      return permissions.includes('*') || permissions.includes('FINANCE_VIEW');
    }
    // Matrix object check
    if (typeof permissions === 'object' && permissions.finance) {
      const finPerms = permissions.finance;
      if (Array.isArray(finPerms)) {
        return finPerms.includes('*') || finPerms.some(p => p.toLowerCase() === 'view');
      }
      return Boolean(finPerms);
    }
  }

  return false;
}

/**
 * Strips financial fields from an asset object (or array of assets).
 * Mutates in place for performance; returns the same reference.
 */
export function maskFinancialFields(data, req) {
  if (canViewFinancials(req)) return data; // No masking needed

  const mask = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const field of FINANCIAL_FIELDS) {
      if (field in obj) {
        obj[field] = '***';
      }
    }
    // Also mask nested bookValues
    if (Array.isArray(obj.bookValues)) {
      obj.bookValues = obj.bookValues.map(bv => {
        const masked = { ...bv };
        for (const field of FINANCIAL_FIELDS) {
          if (field in masked) masked[field] = '***';
        }
        if ('value' in masked) masked.value = '***';
        if ('cost' in masked) masked.cost = '***';
        return masked;
      });
    }
    return obj;
  };

  if (Array.isArray(data)) {
    data.forEach(mask);
  } else {
    mask(data);
  }
  return data;
}
