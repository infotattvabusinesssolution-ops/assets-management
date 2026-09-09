import React, { useState } from 'react';
import { useAuth, MOCK_ROLES_DATA } from '../../context/AuthContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { Search, Bell, Plus, User as UserIcon, Wifi, Sparkles, ChevronDown, Shield, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset360Logo } from '../common/Asset360Logo';

const AVAILABLE_ROLES = [
  { code: 'SYS_ADMIN', name: 'System Administrator' },
  { code: 'ASSET_ADMIN', name: 'Asset Administrator' },
  { code: 'FINANCE', name: 'Finance Controller' },
  { code: 'IT_MANAGER', name: 'IT Asset Manager' },
  { code: 'FACILITIES', name: 'Facilities Manager' },
  { code: 'RECEIVING', name: 'Store Receiving Lead' },
  { code: 'CUSTODIAN', name: 'Custodian / Employee' },
  { code: 'TECHNICIAN', name: 'Maintenance Technician' },
  { code: 'AUDITOR', name: 'Compliance Auditor' },
  { code: 'MANAGEMENT', name: 'Executive Management' }
];

export function Topbar() {
  const { user, switchRole } = useAuth();
  const { openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const activeRoleCode = user?.role?.code || 'SYS_ADMIN';
  const primaryRole = localStorage.getItem('fams_primary_role') || activeRoleCode;
  const canSwitchRole = primaryRole === 'SYS_ADMIN';

  const handleRoleChange = (roleCode) => {
    if (!canSwitchRole) return;
    switchRole(roleCode);
    setShowRoleDropdown(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={openPalette}
          className="flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-100 border border-slate-200 hover:border-brand-500/40 text-slate-600 px-3.5 py-2 rounded-xl text-xs w-72 sm:w-80 md:w-96 transition-all shadow-xs shrink-0 select-none cursor-pointer"
        >
          <Search className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="truncate text-slate-600 font-medium text-xs whitespace-nowrap">Search assets, locations, contracts...</span>
          <kbd className="ml-auto text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded-md font-mono border border-slate-200 whitespace-nowrap shrink-0 font-bold shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => canSwitchRole && setShowRoleDropdown(!showRoleDropdown)}
            disabled={!canSwitchRole}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              canSwitchRole
                ? 'bg-slate-50 border-brand-500/30 hover:border-brand-500 text-slate-700 cursor-pointer'
                : 'bg-slate-100/80 border-slate-200 text-slate-500 cursor-not-allowed opacity-90'
            }`}
            title={canSwitchRole ? 'Switch Role Perspective' : 'Role switching is restricted to System Administrator'}
          >
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-brand-500 font-bold">{user?.role?.name || activeRoleCode}</span>
            {canSwitchRole ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Role Dropdown Menu */}
          {canSwitchRole && showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50 space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-100 font-bold">
                Switch Role Perspective
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
                {AVAILABLE_ROLES.map((r) => {
                  const isCurrent = activeRoleCode === r.code;
                  return (
                    <button
                      key={r.code}
                      onClick={() => handleRoleChange(r.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${isCurrent
                          ? 'bg-brand-500/10 text-brand-500 font-bold border border-brand-500/20'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <span>{r.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button onClick={() => navigate('/assets/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Asset</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold text-sm shadow-sm flex items-center justify-center">
            {user ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user ? user.fullName : 'John Doe'}</p>
            <p className="text-[10px] text-brand-500 font-medium leading-tight">{user?.role?.name || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}


