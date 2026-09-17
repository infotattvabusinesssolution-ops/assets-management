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
  LogOut,
  Sparkles
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
      { name: 'Proximity Search', path: '/proximity-search' }
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
      { name: 'Transfer / Movement', path: '/movements/transfer' },
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
    id: 'ai-assistant',
    name: 'AI Assistant & Insights',
    path: '/ai-insights',
    icon: Sparkles,
    roles: ['*']
  },
  {
    id: 'master-data',
    name: 'Master Data',
    path: '/admin/master-data',
    icon: Database,
    roles: ['*'],
    subItems: [
      { name: 'Asset Groups', path: '/admin/master-data' },
      { name: 'Asset Classes', path: '/admin/master-data?tab=classes' },
      { name: 'Categories', path: '/admin/master-data?tab=categories' },
      { name: 'Sub Categories', path: '/admin/master-data?tab=subcategories' },
      { name: 'Locations', path: '/admin/master-data?tab=locations' },
      { name: 'Departments', path: '/admin/master-data?tab=departments' },
      { name: 'Cost Centers', path: '/admin/master-data?tab=cost-centers' },
      { name: 'Suppliers', path: '/admin/master-data?tab=suppliers' },
      { name: 'Manufacturers', path: '/admin/master-data?tab=manufacturers' },
      { name: 'UOM', path: '/admin/master-data?tab=uom' },
      { name: 'Status Codes', path: '/admin/master-data?tab=status-codes' }
    ]
  },
  {
    id: 'administration',
    name: 'Administration',
    path: '/admin/users',
    icon: Settings,
    roles: ['*'],
    subItems: [
      { name: 'Workflow Configuration', path: '/admin/workflows' },
      { name: 'User Management', path: '/admin/users' },
      { name: 'Roles & Permissions', path: '/admin/roles' },
      { name: 'Company & Organization', path: '/admin/organization' },
      { name: 'Companies', path: '/admin/companies' },
      { name: 'Business Units', path: '/admin/organization?tab=businessUnits' },
      { name: 'Departments', path: '/admin/departments' },
      { name: 'Locations', path: '/admin/locations' },
      { name: 'Cost Centers', path: '/admin/cost-centers' },
      { name: 'System Configuration', path: '/admin/system-config' },
      { name: 'Master Data Setup', path: '/admin/master-data' },
      { name: 'Integrations', path: '/admin/integrations' },
      { name: 'Audit Logs', path: '/admin/audit-logs' },
      { name: 'Email Notifications', path: '/admin/notifications' },
      { name: 'Notification Templates', path: '/admin/notifications' },
      { name: 'Backup & Scheduler', path: '/admin/backup-scheduler' },
      { name: 'Data Import / Export', path: '/admin/master-data' }
    ]
  }
];

const getBestActiveSubPath = (subItems, pathname, search) => {
  if (!subItems || subItems.length === 0) return null;
  const fullUrl = pathname + search;

  // 1. Exact match on full URL (pathname + search)
  const exactFullMatch = subItems.find(sub => sub.path === fullUrl);
  if (exactFullMatch) return exactFullMatch.path;

  // 2. If search has query parameters (e.g. ?tab=businessUnits or ?category=assets)
  if (search && search.includes('=')) {
    const searchParam = search.slice(1); // e.g. "tab=businessUnits"
    const queryMatch = subItems.find(sub => sub.path.includes('?') && sub.path.includes(searchParam));
    if (queryMatch) return queryMatch.path;
  }

  // 3. Match sub-item without query param if search is empty or no query match
  const exactPathMatch = subItems.find(sub => {
    if (sub.path.includes('?')) return false;
    return sub.path === pathname ||
      (sub.path === '/admin/organization' && pathname === '/admin/organization' && !search.includes('tab=')) ||
      (sub.path === '/admin/master-data' && (pathname === '/admin/master-data' || pathname === '/master-data') && !search.includes('tab=')) ||
      (sub.path === '/admin/integrations' && (pathname === '/admin/integrations' || pathname === '/integrations')) ||
      (sub.path === '/admin/audit-logs' && (pathname === '/admin/audit-logs' || pathname === '/audit-logs' || pathname === '/audit-trail')) ||
      (sub.path === '/admin/notifications' && (pathname === '/admin/notifications' || pathname === '/notifications')) ||
      (sub.path === '/admin/backup-scheduler' && (pathname === '/admin/backup-scheduler' || pathname === '/backup-scheduler')) ||
      (sub.path === '/assets' && pathname === '/assets' && !search) ||
      (sub.path === '/tagging' && (pathname === '/tagging' || pathname === '/receiving/tag-assets')) ||
      (sub.path === '/receiving/without-po' && (pathname === '/receiving/without-po' || pathname === '/receive-without-po')) ||
      (sub.path === '/discovery' && (pathname === '/discovery' || pathname === '/discovery/devices')) ||
      (sub.path === '/movements/assign' && pathname === '/movements/assign') ||
      (sub.path === '/movements/transfer' && (pathname === '/movements/transfer' || (pathname === '/movements' && search.includes('transfer')))) ||
      (sub.path === '/movements/approvals' && (pathname === '/movements/approvals' || pathname === '/movement-approvals')) ||
      (sub.path === '/movements/history' && pathname === '/movements/history') ||
      (sub.path === '/stocktakes/verify' && (pathname === '/stocktakes/verify' || pathname === '/stocktakes' || pathname.startsWith('/verification'))) ||
      (sub.path === '/stocktakes/management' && pathname === '/stocktakes/management') ||
      (sub.path === '/stocktakes/execution' && pathname === '/stocktakes/execution') ||
      (sub.path === '/maintenance' && pathname === '/maintenance') ||
      (sub.path === '/maintenance/plans' && (pathname === '/maintenance/plans' || pathname === '/maintenance-plans')) ||
      (sub.path === '/maintenance/preventive' && (pathname === '/maintenance/preventive' || pathname === '/preventive-maintenance')) ||
      (sub.path === '/maintenance/providers' && (pathname === '/maintenance/providers' || pathname === '/service-providers')) ||
      (sub.path === '/maintenance/spare-parts' && (pathname === '/maintenance/spare-parts' || pathname === '/spare-parts'));
  });

  if (exactPathMatch) return exactPathMatch.path;

  // 4. Fallback: first prefix match if no exact match
  const prefixMatch = subItems.find(sub => !sub.path.includes('?') && pathname.startsWith(sub.path) && sub.path !== '/');
  return prefixMatch ? prefixMatch.path : null;
};

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
            const activeSubPath = hasSubmenu ? getBestActiveSubPath(item.subItems, location.pathname, location.search) : null;
            const isExactActive = location.pathname === item.path;

            return (
              <div key={item.id} className="space-y-0.5">
                {hasSubmenu && !collapsed ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={clsx(
                        'w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer',
                        isSubOpen
                          ? 'text-slate-900 bg-slate-100/70 font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-purple-50/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <item.icon className="w-4 h-4 flex-shrink-0 text-[#6C2BD9]" />
                        <span className="truncate text-slate-900 font-bold">{item.name}</span>
                      </div>
                      {isSubOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 transition-transform text-[#6C2BD9]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 transition-transform text-slate-400" />
                      )}
                    </button>

                    {/* Sub-menu Items List */}
                    {isSubOpen && (
                      <div className="pl-3 pt-1 pb-1 space-y-0.5">
                        {item.subItems.map((sub) => {
                          const isSubActive = sub.path === activeSubPath;
                          return (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              className={() =>
                                clsx(
                                  'flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-xs transition-all',
                                  isSubActive
                                    ? 'text-[#6C2BD9] bg-[#F5F3FF] font-extrabold border-l-4 border-[#6C2BD9] shadow-xs'
                                    : 'text-slate-700 font-medium hover:text-slate-900 hover:bg-purple-50/40'
                                )
                              }
                            >
                              <Circle className={clsx('w-1.5 h-1.5 flex-shrink-0', isSubActive ? 'fill-[#6C2BD9] text-[#6C2BD9]' : 'fill-slate-400 text-slate-400')} />
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
                          ? 'bg-[#F5F3FF] text-[#6C2BD9] font-extrabold border-l-4 border-[#6C2BD9]'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-purple-50/60'
                      )
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <item.icon className="w-4 h-4 flex-shrink-0 text-[#6C2BD9]" />
                          {!collapsed && <span className={clsx('truncate', (isActive && item.path === '/') || isExactActive ? 'font-extrabold text-[#6C2BD9]' : 'font-semibold text-slate-800')}>{item.name}</span>}
                        </div>
                        {!collapsed && ((isActive && item.path === '/') || isExactActive) && (
                          <ChevronRight className="w-3.5 h-3.5 text-[#6C2BD9] flex-shrink-0" />
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
                ? 'bg-purple-100 text-black font-extrabold border-l-2 border-[#6C2BD9]'
                : 'text-black hover:text-black hover:bg-purple-50'
            )
          }
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[#6C2BD9] flex-shrink-0 group-hover:text-black" />
          {!collapsed && <span className="text-black">Settings</span>}
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
