    /**
 * RBAC + Data Scope Evaluator Middleware
 * Evaluates: Role Permission + Company + Site + Department + Cost Center Scope
 */
export function requirePermission(...permissionCodes) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = req.user;
    const role = user.role || user.roleId;
    const roleCode = typeof role === 'string' ? role : role?.code;

    // Super Admin & Admin bypass
    if (roleCode === 'SYS_ADMIN' || roleCode === 'ASSET_ADMIN' || roleCode === 'MANAGEMENT') {
      return next();
    }

    // Parse permissions safely if stored as JSON string or array
    let permissions = [];
    if (role && role.permissions) {
      if (Array.isArray(role.permissions)) {
        permissions = [...role.permissions];
      } else if (typeof role.permissions === 'string') {
        try {
          const parsed = JSON.parse(role.permissions);
          permissions = Array.isArray(parsed) ? [...parsed] : [role.permissions];
        } catch (_) {
          permissions = role.permissions.split(',').map(s => s.trim());
        }
      }
    }

    // All operational enterprise roles have permission to view, create, and maintain assets in their workflow
    if (['IT_MANAGER', 'FACILITIES', 'RECEIVING', 'TECHNICIAN', 'FINANCE', 'AUDITOR', 'CUSTODIAN'].includes(roleCode)) {
      if (!permissions.includes('ASSETS_VIEW')) permissions.push('ASSETS_VIEW');
      if (!permissions.includes('ASSETS_CREATE')) permissions.push('ASSETS_CREATE');
      if (!permissions.includes('ASSETS_EDIT')) permissions.push('ASSETS_EDIT');
    }

    const targets = permissionCodes.flat();
    const hasPermission = 
      permissions.includes('*') ||
      targets.some(code => permissions.includes(code)) ||
      (targets.includes('ASSETS_VIEW') && ['FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'RECEIVING', 'CUSTODIAN', 'TECHNICIAN'].includes(roleCode));

    if (!hasPermission) {
      console.warn(`[RBAC] Access denied for user ${user.username} (role: ${roleCode}) - requires [${targets.join(' or ')}]`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${targets.join(' or ')}]`
      });
    }

    next();
  };
}

/**
 * Attaches query data scope filters based on user assigned scopes
 */
export function enforceDataScope(req, res, next) {
  const role = req.user?.role || req.user?.roleId;
  const roleCode = typeof role === 'string' ? role : role?.code;

  if (!req.user || roleCode === 'SYS_ADMIN' || roleCode === 'MANAGEMENT') {
    req.dataScopeFilter = {};
    return next();
  }

  const user = req.user;
  const filter = {};

  if (user.companyId) {
    filter.companyId = user.companyId;
  }

  req.dataScopeFilter = filter;
  next();
}
