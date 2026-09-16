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
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING'],
    subItems: [
      { name: 'Receive with PO', path: '/receiving' },
      { name: 'Receive without PO', path: '/receiving/without-po' },
      { name: 'Tag Assets', path: '/tagging' },
      { name: 'Bulk Tagging', path: '/receiving/bulk-tagging' },
      { name: 'Print Tags', path: '/receiving/print-tags' },
      { name: 'Receive History', path: '/receiving/history' }
    ]
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
    roles: ['SYS_ADMIN', 'IT_MANAGER'],
    subItems: [
      { name: 'Network Discovery', path: '/discovery' },
      { name: 'Discovery Jobs', path: '/discovery/jobs' },
      { name: 'Discovered Devices', path: '/discovery/devices' },
      { name: 'Import to Asset360', path: '/discovery/import' },
      { name: 'Discovery Settings', path: '/discovery/settings' }
    ]
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
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'CUSTODIAN', 'MANAGEMENT'],
    subItems: [
      { name: 'Assign Asset', path: '/movements/assign' },
      { name: 'Transfer / Movement', path: '/movements' },
      { name: 'Movement Approvals', path: '/movements/approvals' },
      { name: 'Movement History', path: '/movements/history' }
    ]
  },
  {
    id: 'stocktakes',
    name: 'Verification & Audit',
    path: '/stocktakes',
    icon: ClipboardCheck,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'AUDITOR'],
    subItems: [
      { name: 'Asset Verification', path: '/stocktakes/verify' },
      { name: 'Audit Management', path: '/stocktakes/management' },
      { name: 'Audit Execution', path: '/stocktakes/execution' },
      { name: 'Audit Reports', path: '/stocktakes/reports' }
    ]
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
    roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'MANAGEMENT'],
    subItems: [
      { name: 'Dashboard', path: '/reports' },
      { name: 'Asset Reports', path: '/reports?category=assets' },
      { name: 'Inventory Reports', path: '/reports?category=inventory' },
      { name: 'Maintenance Reports', path: '/reports?category=maintenance' },
      { name: 'Financial Reports', path: '/reports?category=financial' },
      { name: 'Compliance Reports', path: '/reports?category=compliance' },
      { name: 'Custom Reports', path: '/reports?category=custom' },
      { name: 'Scheduled Reports', path: '/reports?category=scheduled' }
    ]
  },
  {
    id: 'master-data',
    name: 'Master Data',
    path: '/admin/master-data',
    icon: Database,
    roles: ['SYS_ADMIN', 'ASSET_ADMIN']
  },
  {
    id: 'administration',
    name: 'Administration',
    path: '/admin/users',
    icon: Users,
    roles: ['SYS_ADMIN'],
    subItems: [
      { name: 'User Management', path: '/admin/users' },
      { name: 'Roles & Permissions', path: '/admin/roles' },
      { name: 'Company & Organization', path: '/admin/organization' },
      { name: 'System Configuration', path: '/admin/system-config' },
      { name: 'Master Data Setup', path: '/admin/master-data' },
      { name: 'Integrations Console', path: '/admin/integrations' },
      { name: 'Audit Logs', path: '/admin/audit-logs' },
      { name: 'Email Notifications', path: '/admin/notifications' },
      { name: 'Backup & Scheduler', path: '/admin/backup-scheduler' }
    ]
  },
  {
    id: 'audit-log',
    name: 'Audit Log',
    path: '/admin/audit-logs',
    icon: ShieldCheck,
    roles: ['SYS_ADMIN', 'AUDITOR']
  }
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  const [openMenus, setOpenMenus] = useState({
    assets: location.pathname.startsWith('/assets'),
    receiving: location.pathname.startsWith('/receiving') || location.pathname.startsWith('/tagging') || location.pathname === '/receiving',
    discovery: location.pathname.startsWith('/discovery'),
    movements: location.pathname.startsWith('/movements') || location.pathname.startsWith('/movement-approvals'),
    stocktakes: location.pathname.startsWith('/stocktakes') || location.pathname.startsWith('/verification'),
    reports: location.pathname.startsWith('/reports'),
    administration: location.pathname.startsWith('/admin') || location.pathname.startsWith('/master-data') || location.pathname.startsWith('/audit-trail') || location.pathname.startsWith('/notifications') || location.pathname.startsWith('/backup-scheduler') || location.pathname.startsWith('/integrations')
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
            const isParentActive = (location.pathname.startsWith(item.path) && item.path !== '/') ||
              (item.id === 'stocktakes' && location.pathname.startsWith('/verification')) ||
              (item.id === 'administration' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/master-data') || location.pathname.startsWith('/audit-trail') || location.pathname.startsWith('/notifications') || location.pathname.startsWith('/backup-scheduler') || location.pathname.startsWith('/integrations')));
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
                          ? 'bg-[#6C2BD9] text-white shadow-md shadow-purple-600/20'
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
                          const isSubActive = location.pathname + location.search === sub.path || 
                            location.pathname === sub.path ||
                            (sub.path === '/admin/master-data' && (location.pathname === '/admin/master-data' || location.pathname === '/master-data')) ||
                            (sub.path === '/admin/integrations' && (location.pathname === '/admin/integrations' || location.pathname === '/integrations')) ||
                            (sub.path === '/admin/audit-logs' && (location.pathname === '/admin/audit-logs' || location.pathname === '/audit-logs' || location.pathname === '/audit-trail')) ||
                            (sub.path === '/admin/notifications' && (location.pathname === '/admin/notifications' || location.pathname === '/notifications')) ||
                            (sub.path === '/admin/backup-scheduler' && (location.pathname === '/admin/backup-scheduler' || location.pathname === '/backup-scheduler')) ||
                            (sub.path === '/assets' && location.pathname === '/assets' && !location.search) ||
                            (sub.path === '/tagging' && (location.pathname === '/tagging' || location.pathname === '/receiving/tag-assets')) ||
                            (sub.path === '/receiving/without-po' && (location.pathname === '/receiving/without-po' || location.pathname === '/receive-without-po')) ||
                            (sub.path === '/discovery' && (location.pathname === '/discovery' || location.pathname === '/discovery/devices')) ||
                            (sub.path === '/movements/assign' && location.pathname === '/movements/assign') ||
                            (sub.path === '/movements' && location.pathname === '/movements' && (!location.search || location.search.includes('transfer') || location.search.includes('assignment'))) ||
                            (sub.path === '/movements/approvals' && (location.pathname === '/movements/approvals' || location.pathname === '/movement-approvals' || location.search.includes('approvals'))) ||
                            (sub.path === '/movements/history' && (location.pathname === '/movements/history' || location.search.includes('history'))) ||
                            (sub.path === '/stocktakes/verify' && (location.pathname === '/stocktakes/verify' || location.pathname === '/stocktakes' || location.pathname.startsWith('/verification'))) ||
                            (sub.path === '/stocktakes/management' && location.pathname === '/stocktakes/management') ||
                            (sub.path === '/stocktakes/execution' && location.pathname === '/stocktakes/execution');
                          return (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              className={({ isActive }) =>
                                clsx(
                                  'flex items-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all',
                                  isActive || isSubActive
                                    ? 'text-[#6C2BD9] bg-purple-50/70 font-bold'
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
        {!collapsed && (
          <div className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-slate-100/60 border border-slate-200/70 mb-1 select-none">
            <div className="w-9 h-5 text-slate-300">
              <svg viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-70">
                <path
                  d="M9 15C6.23858 15 4 12.7614 4 10C4 7.23858 6.23858 5 9 5C12.2 5 15 8 18 10C21 12 23.8 15 27 15C29.7614 15 32 12.7614 32 10C32 7.23858 29.7614 5 27 5C23.8 5 21 8 18 10C15 12 12.2 15 9 15Z"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">Asset Smarter</p>
            <p className="text-[11px] font-semibold text-slate-400 leading-tight">Operate Better</p>
          </div>
        )}

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
