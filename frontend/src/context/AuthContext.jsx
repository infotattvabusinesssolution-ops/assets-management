import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const MOCK_ROLES_DATA = {
  SYS_ADMIN: {
    id: 'user-001',
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@infotatwaa.com',
    role: { code: 'SYS_ADMIN', name: 'System Administrator', permissions: ['*'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  ASSET_ADMIN: {
    id: 'user-002',
    username: 'asset_admin',
    fullName: 'Asset Administrator',
    email: 'assetadmin@infotatwaa.com',
    role: { code: 'ASSET_ADMIN', name: 'Asset Administrator', permissions: ['ASSETS_VIEW', 'ASSETS_CREATE', 'ASSETS_EDIT', 'RECEIVING_VIEW', 'TAGGING_VIEW', 'MOVEMENTS_VIEW', 'STOCKTAKES_VIEW', 'DISPOSALS_VIEW', 'REPORTS_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  FINANCE: {
    id: 'user-003',
    username: 'finance',
    fullName: 'Finance Asset Controller',
    email: 'finance@infotatwaa.com',
    role: { code: 'FINANCE', name: 'Finance Asset Controller', permissions: ['ASSETS_VIEW', 'FINANCE_VIEW', 'FINANCE_RUN', 'DISPOSALS_VIEW', 'REPORTS_VIEW', 'WORKFLOWS_VIEW', 'AI_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  IT_MANAGER: {
    id: 'user-004',
    username: 'it_manager',
    fullName: 'IT Asset Manager',
    email: 'itmanager@infotatwaa.com',
    role: { code: 'IT_MANAGER', name: 'IT Asset Manager', permissions: ['ASSETS_VIEW', 'DISCOVERY_VIEW', 'DISCOVERY_MATCH', 'MAPS_VIEW', 'REPORTS_VIEW', 'AI_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  FACILITIES: {
    id: 'user-005',
    username: 'facilities',
    fullName: 'Facilities Manager',
    email: 'facilities@infotatwaa.com',
    role: { code: 'FACILITIES', name: 'Facilities Manager', permissions: ['ASSETS_VIEW', 'MAPS_VIEW', 'MAPS_EDIT', 'MAINTENANCE_VIEW', 'REPORTS_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  RECEIVING: {
    id: 'user-006',
    username: 'receiving',
    fullName: 'Store Receiving Lead',
    email: 'receiving@infotatwaa.com',
    role: { code: 'RECEIVING', name: 'Store Receiving User', permissions: ['RECEIVING_VIEW', 'RECEIVING_CREATE', 'TAGGING_VIEW', 'ASSETS_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  CUSTODIAN: {
    id: 'user-007',
    username: 'custodian',
    fullName: 'Asset Custodian',
    email: 'custodian@infotatwaa.com',
    role: { code: 'CUSTODIAN', name: 'Custodian / Employee', permissions: ['MY_ASSETS_VIEW', 'ASSETS_VIEW', 'MOVEMENTS_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  TECHNICIAN: {
    id: 'user-008',
    username: 'technician',
    fullName: 'Maintenance Technician',
    email: 'technician@infotatwaa.com',
    role: { code: 'TECHNICIAN', name: 'Maintenance Technician', permissions: ['WORK_ORDERS_VIEW', 'WORK_ORDERS_EDIT', 'MAPS_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  AUDITOR: {
    id: 'user-009',
    username: 'auditor',
    fullName: 'Compliance Auditor',
    email: 'auditor@infotatwaa.com',
    role: { code: 'AUDITOR', name: 'Compliance Auditor', permissions: ['ASSETS_VIEW', 'AUDIT_VIEW', 'STOCKTAKES_VIEW', 'REPORTS_VIEW', 'FINANCE_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  },
  MANAGEMENT: {
    id: 'user-010',
    username: 'management',
    fullName: 'Executive Management',
    email: 'management@infotatwaa.com',
    role: { code: 'MANAGEMENT', name: 'Executive Management', permissions: ['REPORTS_VIEW', 'DASHBOARD_VIEW', 'WORKFLOWS_VIEW', 'AI_VIEW'] },
    company: { name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' },
    site: { name: 'Global HQ Campus', city: 'San Francisco' }
  }
};

// Helper to normalize user permissions object
function normalizeUserProfile(userObj) {
  if (!userObj) return null;
  const clone = { ...userObj };
  if (clone.role) {
    let perms = clone.role.permissions;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (_) {
        perms = {};
      }
    }
    clone.role = {
      ...clone.role,
      permissions: perms || {}
    };
  }
  return clone;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (localStorage.getItem('fams_explicit_logout') === 'true') return null;
    const saved = localStorage.getItem('fams_token');
    const initial = saved && !saved.startsWith('token-') ? saved : 'demo-jwt-token-2026';
    localStorage.setItem('fams_token', initial);
    return initial;
  });
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fams_user');
      return stored ? normalizeUserProfile(JSON.parse(stored)) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token && !user));

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('fams_user');
        if (stored) {
          setUser(normalizeUserProfile(JSON.parse(stored)));
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let active = true;
    api.get('/auth/profile')
      .then(res => {
        if (!active) return;
        if (!res?.success || !res.user) throw new Error('Profile unavailable');
        const { passwordHash, ...profile } = res.user;
        const normalized = normalizeUserProfile(profile);
        setUser(normalized);
        localStorage.setItem('fams_user', JSON.stringify(normalized));
        localStorage.setItem('fams_primary_role', normalized.role?.code || '');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem('fams_token');
        localStorage.removeItem('fams_user');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const login = async (username, password) => {
    if (!username?.trim() || !password) return { success: false, message: 'Enter username and password.' };
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username: username.trim(), password });
      if (!res?.success || !res.token || !res.user) throw new Error(res?.message || 'Login failed.');
      const normalized = normalizeUserProfile(res.user);
      localStorage.removeItem('fams_explicit_logout');
      localStorage.setItem('fams_token', res.token);
      localStorage.setItem('fams_user', JSON.stringify(normalized));
      localStorage.setItem('fams_primary_role', normalized.role?.code || '');
      setUser(normalized);
      setToken(res.token);
      return {
        success: true,
        user: normalized,
        mustChangePassword: Boolean(res.mustChangePassword ?? res.user?.forcePasswordChange)
      };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || err?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword, oldPassword = '') => {
    try {
      const res = await api.post('/auth/change-password', { newPassword, oldPassword });
      if (res?.success) {
        setUser(prev => prev ? { ...prev, forcePasswordChange: false } : prev);
        const stored = localStorage.getItem('fams_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.forcePasswordChange = false;
            localStorage.setItem('fams_user', JSON.stringify(parsed));
          } catch (_) {}
        }
      }
      return res || { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || err?.message || 'Password update failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.setItem('fams_explicit_logout', 'true');
    localStorage.removeItem('fams_token');
    localStorage.removeItem('fams_user');
  };

  // Evaluates whether the active user has access to a module and/or specific action
  const can = (moduleKey, actionName) => {
    if (!user?.role) return false;
    if (user.role.code === 'SYS_ADMIN') return true;

    let perms = user.role.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch (_) { perms = {}; }
    }
    if (!perms) return false;

    // Wildcard bypass
    if (Array.isArray(perms) && perms.includes('*')) return true;

    // Permissions Matrix Object: { assets: ['View', 'Create', 'Edit', 'Delete'], ... }
    if (typeof perms === 'object' && !Array.isArray(perms)) {
      const modActions = perms[moduleKey] || (moduleKey === 'stocktakes' ? perms['audit'] : null);
      if (!modActions) return false;

      // Module-level access check
      if (!actionName) {
        if (Array.isArray(modActions)) return modActions.length > 0;
        return Boolean(modActions);
      }

      // Action-level access check (e.g. 'Create', 'Edit', 'Delete', 'Export')
      if (Array.isArray(modActions)) {
        const actLower = actionName.toLowerCase();
        return modActions.some(a => typeof a === 'string' && (a.toLowerCase() === actLower || a === '*'));
      }
      return Boolean(modActions);
    }

    // Flat permissions array
    if (Array.isArray(perms)) {
      if (!actionName) {
        return perms.some(p => p.toLowerCase().startsWith(moduleKey.toLowerCase()));
      }
      const targetCode = `${moduleKey}_${actionName}`.toUpperCase();
      return perms.includes(targetCode);
    }

    return false;
  };

  const hasPermission = (moduleOrCode, action) => {
    return can(moduleOrCode, action);
  };

  const hasRole = (roleCode) => user?.role?.code === roleCode;

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, loading, login, logout, changePassword,
      switchRole: () => false, can, hasPermission, hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

