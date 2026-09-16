import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Asset360Logo } from '../common/Asset360Logo';
import {
  LayoutDashboard,
  Package,
  Boxes,
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
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Circle,
  LogOut
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
    roles: ['*'],
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
    id: 'inventory',
    name: 'Inventory',
    path: '/inventory',
    icon: Boxes,
    roles: ['*'],
    subItems: [
      { name: 'Inventory Items', path: '/inventory' },
      { name: 'Stock Levels', path: '/inventory/levels' },
      { name: 'Stock Ledger', path: '/inventory/ledger' }
    ]
  },
  {
    id: 'receiving',
    name: 'Receiving & Tagging',
    path: '/receiving',
    icon: Inbox,
    roles: ['*'],
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
    roles: ['*'],
    subItems: [
      { name: 'Asset Tracking', path: '/rtls' },
      { name: 'Location Map', path: '/rtls/map' },
      { name: 'Geofencing', path: '/geofencing' },
      { name: 'Location History', path: '/location-history' },
      { name: 'Proximity Search', path: '/proximity-search' },
      { name: 'Floor Maps & RTLS', path: '/maps' },
      { name: 'Location Hierarchy', path: '/rtls/locations' },
      { name: 'Zone Monitoring', path: '/rtls/zones' }
    ]
  },
  {
    id: 'discovery',
    name: 'Auto Discovery',
    path: '/discovery',
    icon: Cpu,
    roles: ['*'],
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
    roles: ['*']
  },
  {
    id: 'movements',
    name: 'Assignment & Movement',
    path: '/movements',
    icon: ArrowLeftRight,
    roles: ['*'],
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
    roles: ['*'],
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
    roles: ['*'],
    subItems: [
      { name: 'Work Orders', path: '/maintenance' },
      { name: 'Maintenance Plans', path: '/maintenance/plans' },
      { name: 'Preventive Maintenance', path: '/maintenance/preventive' },
      { name: 'Service Providers', path: '/maintenance/providers' },
      { name: 'Spare Parts', path: '/maintenance/spare-parts' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    path: '/finance',
    icon: DollarSign,
    roles: ['*']
  },
  {
    id: 'contracts',
    name: 'Contracts & Compliance',
    path: '/contracts',
    icon: FileCheck,
    roles: ['*']
  },
  {
    id: 'disposals',
    name: 'Disposal',
    path: '/disposals',
    icon: Trash2,
    roles: ['*']
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    path: '/reports',
    icon: BarChart3,
    roles: ['*'],
    subItems: [
      { name: 'Dashboard Reports', path: '/reports' },
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
    roles: ['*']
  },
  {
    id: 'administration',
    name: 'Administration',
    path: '/admin/users',
    icon: Settings,
    roles: ['*'],
    subItems: [
      { name: 'User Management', path: '/admin/users' },
      { name: 'Roles & Permissions', path: '/admin/roles' },
      { name: 'Company & Organization', path: '/admin/organization' },
      { name: 'System Configuration', path: '/admin/system-config' },
      { name: 'Master Data Setup', path: '/admin/master-data' },
      { name: 'Integrations', path: '/admin/integrations' },
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
    roles: ['*']
  }
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  const [openMenus, setOpenMenus] = useState({
    assets: location.pathname.startsWith('/assets'),
    inventory: location.pathname.startsWith('/inventory'),
    receiving: location.pathname.startsWith('/receiving') || location.pathname.startsWith('/tagging') || location.pathname === '/receiving',
    tracking: location.pathname.startsWith('/rtls') || location.pathname.startsWith('/geofencing') || location.pathname.startsWith('/location-history') || location.pathname.startsWith('/proximity-search') || location.pathname.startsWith('/maps'),
    discovery: location.pathname.startsWith('/discovery'),
    movements: location.pathname.startsWith('/movements') || location.pathname.startsWith('/movement-approvals'),
    stocktakes: location.pathname.startsWith('/stocktakes') || location.pathname.startsWith('/verification'),
    maintenance: location.pathname.startsWith('/maintenance') || location.pathname.startsWith('/service-providers') || location.pathname.startsWith('/spare-parts') || location.pathname.startsWith('/preventive-maintenance'),
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
                        'w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer',
                        item.id === 'administration' && isSubOpen
                          ? 'bg-purple-50/50 text-slate-900'
                          : isParentActive
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.id === 'administration' && isSubOpen ? (
                          <div className="w-6 h-6 rounded-lg bg-[#6C2BD9] flex items-center justify-center shrink-0 shadow-xs">
                            <Settings className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <item.icon className={clsx('w-4 h-4 flex-shrink-0', isParentActive && item.id !== 'administration' ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isSubOpen ? (
                        <ChevronUp className={clsx('w-3.5 h-3.5 transition-transform', item.id === 'administration' ? 'text-[#6C2BD9]' : isParentActive ? 'text-white' : 'text-slate-400')} />
                      ) : (
                        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', isParentActive ? 'text-white' : 'text-slate-400')} />
                      )}
                    </button>

                    {/* Sub-menu Items List */}
                    {isSubOpen && (
                      <div className="pl-3 pt-1 pb-1 space-y-0.5">
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
                            (sub.path === '/stocktakes/execution' && location.pathname === '/stocktakes/execution') ||
                            (sub.path === '/maintenance' && location.pathname === '/maintenance') ||
                            (sub.path === '/maintenance/plans' && (location.pathname === '/maintenance/plans' || location.pathname === '/maintenance-plans')) ||
                            (sub.path === '/maintenance/preventive' && (location.pathname === '/maintenance/preventive' || location.pathname === '/preventive-maintenance')) ||
                            (sub.path === '/maintenance/providers' && (location.pathname === '/maintenance/providers' || location.pathname === '/service-providers')) ||
                            (sub.path === '/maintenance/spare-parts' && (location.pathname === '/maintenance/spare-parts' || location.pathname === '/spare-parts'));
                          return (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              className={({ isActive }) =>
                                clsx(
                                  'flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all',
                                  isActive || isSubActive
                                    ? 'text-[#6C2BD9] bg-purple-50 font-bold'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                                )
                              }
                            >
                              <Circle className={clsx('w-1.5 h-1.5 flex-shrink-0', isSubActive ? 'fill-[#6C2BD9] text-[#6C2BD9]' : 'fill-slate-300 text-slate-300')} />
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
                        'flex items-center py-2 rounded-xl text-xs font-semibold transition-all group relative',
                        collapsed ? 'justify-center px-0' : 'justify-between px-3',
                        (isActive && item.path === '/') || (isExactActive && !hasSubmenu)
                          ? 'bg-[#6C2BD9] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <item.icon className={clsx('w-4 h-4 flex-shrink-0', (isActive && item.path === '/') || isExactActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800')} />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!collapsed && ((isActive && item.path === '/') || isExactActive) && (
                          <ChevronRight className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
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

      {/* Sidebar Footer matching reference screenshot */}
      <div className={clsx('p-3 border-t border-slate-200 shrink-0 bg-white space-y-2', collapsed && 'flex flex-col items-center p-2')}>
        <NavLink
          to="/admin/system-config"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer',
              isActive
                ? 'bg-purple-50 text-[#6C2BD9] font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )
          }
          title="Settings"
        >
          <Settings className="w-4 h-4 text-purple-700 flex-shrink-0 group-hover:text-purple-900" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs',
            'bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 active:scale-[0.98]',
            collapsed ? 'p-2' : 'px-3 py-1.5'
          )}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
