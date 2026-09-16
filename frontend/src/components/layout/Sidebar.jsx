import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Asset360Logo } from '../common/Asset360Logo';
import {
  LayoutDashboard,
  Package,
  Inbox,
  ArrowLeftRight,
  ClipboardCheck,
  DollarSign,
  Wrench,
  FileCheck,
  MapPin,
  Cpu,
  Map,
  Trash2,
  BarChart3,
  Database,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  LogOut,
  Circle
} from 'lucide-react';
import clsx from 'clsx';

const NAV_STRUCTURE = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['*']
  },
  {
    id: 'assets',
    name: 'Assets',
    path: '/assets',
    icon: Package,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'FINANCE', 'IT_MANAGER', 'FACILITIES', 'RECEIVING', 'CUSTODIAN', 'AUDITOR', 'MANAGEMENT'],
    subItems: [
      { name: 'Asset Register', path: '/assets' },
      { name: 'New Asset Registration', path: '/assets/new' },
      { name: 'My Assets', path: '/assets/my-assets' },
      { name: 'Asset Edit / Update', path: '/assets/edit/AST-000128' },
      { name: 'Bulk Upload', path: '/assets/bulk-upload' },
      { name: 'Asset Hierarchy', path: '/assets/hierarchy' },
      { name: 'Asset Approvals', path: '/assets/approvals' }
    ]
  },
  {
    id: 'receiving',
    name: 'Receiving & Tagging',
    path: '/receiving',
    icon: Inbox,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING']
  },
  {
    id: 'tracking',
    name: 'Tracking & Location',
    path: '/rtls',
    icon: MapPin,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'IT_MANAGER', 'FACILITIES', 'MANAGEMENT']
  },
  {
    id: 'discovery',
    name: 'Auto Discovery',
    path: '/discovery',
    icon: Cpu,
    roles: ['SYS_ADMIN', 'IT_MANAGER']
  },
  {
    id: 'rtls-map',
    name: 'RTLS, Map & Location',
    path: '/rtls/map',
    icon: Map,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'IT_MANAGER', 'FACILITIES', 'TECHNICIAN', 'MANAGEMENT']
  },
  {
    id: 'movements',
    name: 'Assignment & Movement',
    path: '/movements',
    icon: ArrowLeftRight,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'CUSTODIAN', 'MANAGEMENT']
  },
  {
    id: 'stocktakes',
    name: 'Verification & Audit',
    path: '/stocktakes',
    icon: ClipboardCheck,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'AUDITOR']
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    path: '/maintenance',
    icon: Wrench,
    roles: ['SYS_ADMIN', 'FACILITIES', 'TECHNICIAN']
  },
  {
    id: 'finance',
    name: 'Finance',
    path: '/finance',
    icon: DollarSign,
    roles: ['SYS_ADMIN', 'FINANCE', 'MANAGEMENT', 'AUDITOR']
  },
  {
    id: 'contracts',
    name: 'Contracts & Compliance',
    path: '/contracts',
    icon: FileCheck,
    roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'AUDITOR']
  },
  {
    id: 'disposals',
    name: 'Disposal',
    path: '/disposals',
    icon: Trash2,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'FINANCE']
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    path: '/reports',
    icon: BarChart3,
    roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'MANAGEMENT']
  },
  {
    id: 'master-data',
    name: 'Master Data',
    path: '/master-data',
    icon: Database,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN']
  },
  {
    id: 'administration',
    name: 'Administration',
    path: '/workflows',
    icon: Users,
    roles: ['SYS_ADMIN'],
    subItems: [
      { name: 'Users & Roles', path: '/admin/users' },
      { name: 'Workflow Configuration', path: '/workflows' },
      { name: 'System Settings', path: '/admin/settings' },
      { name: 'Audit Log', path: '/audit-trail' },
      { name: 'Notification Templates', path: '/admin/notifications' },
      { name: 'Data Import / Export', path: '/assets/bulk-upload' }
    ]
  },
  {
    id: 'audit-log',
    name: 'Audit Log',
    path: '/audit-trail',
    icon: ShieldCheck,
    roles: ['SYS_ADMIN', 'AUDITOR']
  }
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  // Sub-menu expansion state default open for 'assets' if on an assets route
  const [openMenus, setOpenMenus] = useState({
    assets: true
  });

  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const visibleNavItems = NAV_STRUCTURE.filter(item => {
    if (userRoleCode === 'SYS_ADMIN') return true;
    if (item.roles.includes('*')) return true;
    return item.roles.includes(userRoleCode);
  });

  return (
    <aside
      className={clsx(
        'bg-white border-r border-slate-200 flex flex-col h-full justify-between transition-all duration-300 z-30 select-none relative shadow-xs',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Sidebar Top Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className={clsx('h-16 flex items-center justify-between border-b border-slate-200 shrink-0 gap-2', collapsed ? 'px-2 justify-center' : 'px-4')}>
          <div className="flex items-center gap-2 overflow-hidden shrink-0">
            {collapsed ? (
              <Asset360Logo size="sm" showText={false} />
            ) : (
              <Asset360Logo size="md" showText={true} />
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all shrink-0 cursor-pointer shadow-2xs border border-slate-200"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-brand-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Company Entity & Role Badge */}
        {!collapsed && (
          <div className="p-3 space-y-2 shrink-0 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-[#6C2BD9] text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-xs">
                {userRoleCode.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 truncate">{user?.role?.name || 'System Role'}</p>
                <p className="text-[10px] text-[#6C2BD9] font-semibold truncate">@{user?.username || 'user'}</p>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">Infotatwaa Corp • HQ Site</span>
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
          {visibleNavItems.map((item) => {
            const hasSubmenu = Boolean(item.subItems && item.subItems.length > 0);
            const isSubOpen = Boolean(openMenus[item.id]);
            const isParentActive = location.pathname.startsWith(item.path) && item.path !== '/';
            const isExactActive = location.pathname === item.path;

            return (
              <div key={item.id} className="space-y-0.5">
                {hasSubmenu && !collapsed ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={clsx(
                        'w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer',
                        isParentActive
                          ? 'bg-[#6C2BD9] text-white shadow-md shadow-[#6C2BD9]/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <item.icon className={clsx('w-4 h-4 flex-shrink-0', isParentActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={clsx(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          isSubOpen ? 'rotate-180' : '',
                          isParentActive ? 'text-white' : 'text-slate-400'
                        )}
                      />
                    </button>

                    {/* Sub-menu Items List */}
                    {isSubOpen && (
                      <div className="pl-4 pt-1 pb-1 space-y-0.5">
                        {item.subItems.map((sub) => {
                          const isSubActive = location.pathname + location.search === sub.path || (sub.path === '/assets' && location.pathname === '/assets' && !location.search);
                          return (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              className={({ isActive }) =>
                                clsx(
                                  'flex items-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all',
                                  isActive || isSubActive
                                    ? 'text-[#6C2BD9] bg-purple-50 font-bold'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                                )
                              }
                            >
                              <Circle className={clsx('w-1.5 h-1.5 flex-shrink-0', isSubActive ? 'fill-[#6C2BD9] text-[#6C2BD9]' : 'text-slate-300')} />
                              <span className="truncate">{sub.name}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                        collapsed ? 'justify-center px-0' : 'justify-between px-3',
                        (isActive && item.path === '/') || (isExactActive && !hasSubmenu)
                          ? 'bg-[#6C2BD9] text-white shadow-md shadow-[#6C2BD9]/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 truncate">
                          <item.icon className={clsx('w-4 h-4 flex-shrink-0', (isActive && item.path === '/') || isExactActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!collapsed && ((isActive && item.path === '/') || isExactActive) && (
                          <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className={clsx('p-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-2.5 shrink-0 bg-slate-50/50', collapsed && 'flex flex-col items-center p-2')}>
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs',
            'bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 active:scale-[0.98]',
            collapsed ? 'p-2.5' : 'px-3 py-2'
          )}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="text-center">
            <p className="font-medium text-slate-500">Asset 360° Enterprise</p>
            <p className="text-[10px] text-[#6C2BD9] font-mono">Role: {userRoleCode}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
