import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Asset360Logo } from '../common/Asset360Logo';
import {
  LayoutDashboard,
  Package,
  Inbox,
  Tag,
  ArrowLeftRight,
  ClipboardCheck,
  DollarSign,
  Wrench,
  FileCheck,
  Radio,
  MapPin,
  Trash2,
  BarChart3,
  GitPullRequest,
  Sparkles,
  Database,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['*'] },
  { name: 'Asset Register', path: '/assets', icon: Package, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'FINANCE', 'IT_MANAGER', 'FACILITIES', 'RECEIVING', 'CUSTODIAN', 'AUDITOR'] },
  { name: 'Receiving Workbench', path: '/receiving', icon: Inbox, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING'] },
  { name: 'Tagging & Barcodes', path: '/tagging', icon: Tag, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING'] },
  { name: 'Custody & Movements', path: '/movements', icon: ArrowLeftRight, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'CUSTODIAN', 'MANAGEMENT'] },
  { name: 'Stocktake & Census', path: '/stocktakes', icon: ClipboardCheck, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'AUDITOR'] },
  { name: 'Finance & Depreciation', path: '/finance', icon: DollarSign, roles: ['SYS_ADMIN', 'FINANCE', 'MANAGEMENT', 'AUDITOR'] },
  { name: 'Maintenance Planner', path: '/maintenance', icon: Wrench, roles: ['SYS_ADMIN', 'FACILITIES', 'TECHNICIAN'] },
  { name: 'Contracts & Warranty', path: '/contracts', icon: FileCheck, roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'AUDITOR'] },
  { name: 'IT Auto-Discovery', path: '/discovery', icon: Radio, roles: ['SYS_ADMIN', 'IT_MANAGER'] },
  { name: 'Floor Maps & Locate', path: '/maps', icon: MapPin, roles: ['SYS_ADMIN', 'IT_MANAGER', 'FACILITIES', 'TECHNICIAN'] },
  { name: 'Asset Disposal', path: '/disposals', icon: Trash2, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'FINANCE'] },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'FACILITIES', 'AUDITOR', 'MANAGEMENT'] },
  { name: 'Approval Workflows', path: '/workflows', icon: GitPullRequest, roles: ['SYS_ADMIN', 'FINANCE', 'MANAGEMENT'] },
  { name: 'AI Assistant', path: '/ai-insights', icon: Sparkles, roles: ['SYS_ADMIN', 'FINANCE', 'IT_MANAGER', 'MANAGEMENT'] },
  { name: 'Mobile PWA Scan', path: '/mobile-scan', icon: Smartphone, roles: ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING', 'CUSTODIAN', 'TECHNICIAN', 'FACILITIES', 'IT_MANAGER'] },
  { name: 'Master Data', path: '/master-data', icon: Database, roles: ['SYS_ADMIN', 'ASSET_ADMIN'] },
  { name: 'Audit Trail', path: '/audit-trail', icon: ShieldCheck, roles: ['SYS_ADMIN', 'AUDITOR'] }
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  // Filter nav items by role
  const visibleNavItems = ALL_NAV_ITEMS.filter(item => {
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
            {/* Role Scope Card */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-brand-500 text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-xs">
                {userRoleCode.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 truncate">{user?.role?.name || 'System Role'}</p>
                <p className="text-[10px] text-brand-500 font-semibold truncate">@{user?.username || 'user'}</p>
              </div>
            </div>

            {/* Company Badge */}
            <div className="p-2 rounded-lg bg-slate-50/60 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">Infotatwaa Corp • HQ Site</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                  collapsed ? 'justify-center px-0' : 'justify-between px-3',
                  isActive
                    ? 'bg-[#6c2bd9] text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 truncate">
                    <item.icon className={clsx('w-4 h-4 flex-shrink-0 transition-transform', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && isActive && (
                    <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer with Logout Button */}
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
            <p className="text-[10px] text-brand-500 font-mono">Role: {userRoleCode}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

