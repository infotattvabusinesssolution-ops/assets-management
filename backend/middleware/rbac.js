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

    // Super Admin has full bypass
    if (roleCode === 'SYS_ADMIN') {
      return next();
    }

    // Parse permissions safely if stored as JSON string, object, or array
    let permissions = null;
    if (role && role.permissions) {
      if (typeof role.permissions === 'string') {
        try {
          permissions = JSON.parse(role.permissions);
        } catch (_) {
          permissions = role.permissions.split(',').map(s => s.trim());
        }
      } else {
        permissions = role.permissions;
      }
    }

    const targets = permissionCodes.flat();

    // 1. Check Dynamic Permission Matrix Object: { assets: ['View', 'Create'], administration: ['View'] }
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions) && Object.keys(permissions).length > 0) {
      const hasMatrixAccess = targets.some(targetCode => {
        const parts = targetCode.toLowerCase().split('_');
        const prefix = parts[0];
        const action = parts.slice(1).join('_');

        let moduleKey = prefix;
        if (['users', 'roles', 'settings', 'admin', 'integrations', 'audit', 'notifications'].includes(prefix)) {
          moduleKey = 'administration';
        }

        const modActions = permissions[moduleKey] || (moduleKey === 'stocktakes' ? permissions['audit'] : null);
        if (!modActions || (Array.isArray(modActions) && modActions.length === 0)) return false;

        if (Array.isArray(modActions)) {
          if (modActions.includes('*')) return true;
          if (!action || action === 'view') {
            return modActions.some(a => a.toLowerCase() === 'view');
          }
          if (action === 'create' || action === 'add') {
            return modActions.some(a => ['create', 'receive', 'create audit'].includes(a.toLowerCase()));
          }
          if (action === 'edit' || action === 'update') {
            return modActions.some(a => a.toLowerCase() === 'edit');
          }
          if (action === 'delete') {
            return modActions.some(a => a.toLowerCase() === 'delete');
          }
          if (action === 'approve') {
            return modActions.some(a => ['approve', 'approve disposal'].includes(a.toLowerCase()));
          }
          if (action === 'export') {
            return modActions.some(a => a.toLowerCase() === 'export');
          }
          if (action === 'import') {
            return modActions.some(a => a.toLowerCase() === 'import');
          }
          return modActions.some(a => a.toLowerCase() === action);
        }
        return Boolean(modActions);
      });

      if (hasMatrixAccess) {
        return next();
      }
      console.warn(`[RBAC] Matrix access denied for user ${user.username} (${roleCode}) - requires [${targets.join(' or ')}]`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required action permission [${targets.join(' or ')}]`
      });
    }

    // 2. Check Flat Array Permissions or Wildcard
    let flatPerms = Array.isArray(permissions) ? permissions : [];
    if (flatPerms.includes('*') || targets.some(code => flatPerms.includes(code))) {
      return next();
    }

    // 3. Fallback for unconfigured legacy roles
    if (['ASSET_ADMIN', 'MANAGEMENT'].includes(roleCode)) {
      return next();
    }

    if (targets.includes('ASSETS_VIEW') && ['FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'RECEIVING', 'CUSTODIAN', 'TECHNICIAN'].includes(roleCode)) {
      return next();
    }

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
