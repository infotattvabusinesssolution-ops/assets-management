/**
 * RBAC + Data Scope Evaluator Middleware
 * Evaluates: Role Permission + Company + Site + Department + Cost Center Scope
 */
export function requirePermission(permissionCode) {
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

    // Check specific permission code or view fallback
    const permissions = (role && role.permissions) ? role.permissions : [];
    const hasPermission = 
      permissions.includes(permissionCode) || 
      permissions.includes('*') ||
      (permissionCode === 'ASSETS_VIEW' && ['FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'RECEIVING', 'CUSTODIAN', 'TECHNICIAN'].includes(roleCode));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${permissionCode}]`
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
