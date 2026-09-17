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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fams_user');
    return saved ? JSON.parse(saved) : MOCK_ROLES_DATA.SYS_ADMIN;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fams_token') || 'demo-jwt-token-2026');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);

    if (!username || !username.trim()) {
      setLoading(false);
      return { success: false, message: 'Please enter a valid username' };
    }

    const cleanName = username.toLowerCase().trim();
    const matchedKey = Object.keys(MOCK_ROLES_DATA).find(
      k => MOCK_ROLES_DATA[k].username.toLowerCase() === cleanName ||
           k.toLowerCase() === cleanName ||
           MOCK_ROLES_DATA[k].email.toLowerCase() === cleanName
    );

    let authUser;
    if (matchedKey) {
      authUser = MOCK_ROLES_DATA[matchedKey];
    } else {
      authUser = {
        id: `user-${Date.now()}`,
        username: username.trim(),
        fullName: username.includes('@') ? username.split('@')[0] : username,
        email: username.includes('@') ? username : `${cleanName}@asset360.com`,
        role: { code: 'SYS_ADMIN', name: 'System Administrator', permissions: ['*'] },
        company: { name: 'Asset360 Holdings', code: 'CMP-GLOBAL' },
        site: { name: 'Dubai HQ Campus', city: 'Dubai HQ' }
      };
    }

    const mockToken = `token-${authUser.role?.code?.toLowerCase() || 'sys_admin'}-${Date.now()}`;
    setUser(authUser);
    setToken(mockToken);
    localStorage.setItem('fams_token', mockToken);
    localStorage.setItem('fams_user', JSON.stringify(authUser));
    localStorage.setItem('fams_primary_role', authUser.role?.code || 'SYS_ADMIN');
    setLoading(false);
    return { success: true, user: authUser };
  };

  const switchRole = (roleCode) => {
    const primaryRole = localStorage.getItem('fams_primary_role') || user?.role?.code || 'SYS_ADMIN';
    if (primaryRole !== 'SYS_ADMIN') {
      console.warn('Role switching is disabled for non-System Administrator users.');
      return;
    }
    if (MOCK_ROLES_DATA[roleCode]) {
      const targetUser = MOCK_ROLES_DATA[roleCode];
      setUser(targetUser);
      localStorage.setItem('fams_user', JSON.stringify(targetUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fams_token');
    localStorage.removeItem('fams_user');
  };

  const hasPermission = (permCode) => {
    if (!user || !user.role) return false;
    if (user.role.code === 'SYS_ADMIN') return true;
    const perms = user.role.permissions || [];
    return perms.includes('*') || perms.includes(permCode);
  };

  const hasRole = (roleCode) => {
    if (!user || !user.role) return false;
    return user.role.code === roleCode;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        switchRole,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

