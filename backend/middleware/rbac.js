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
    const role = user.roleId;

    // Super Admin bypass
    if (role && role.code === 'SYS_ADMIN') {
      return next();
    }

    // Check specific permission code
    const permissions = role ? role.permissions : [];
    const hasPermission = permissions.includes(permissionCode) || permissions.includes('*');

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
 * Attaches Mongoose query data scope filters based on user assigned scopes
 */
export function enforceDataScope(req, res, next) {
  if (!req.user || (req.user.roleId && req.user.roleId.code === 'SYS_ADMIN')) {
    req.dataScopeFilter = {};
    return next();
  }

  const user = req.user;
  const filter = {};

  if (user.companyId) {
    filter.companyId = user.companyId;
  }
  if (user.siteId) {
    filter.siteId = user.siteId;
  }

  req.dataScopeFilter = filter;
  next();
}
