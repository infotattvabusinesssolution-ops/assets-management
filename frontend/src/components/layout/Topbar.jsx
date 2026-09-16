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
      {/* Search Bar / Command Palette Trigger matching screenshot */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={openPalette}
          className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-500 px-3.5 py-2 rounded-xl text-xs w-full sm:w-80 md:w-96 transition-all shadow-2xs select-none cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate text-slate-400 font-normal text-xs whitespace-nowrap">
            Search assets, tags, serial numbers...
          </span>
        </button>
      </div>

      {/* Right Controls matching screenshot */}
      <div className="flex items-center gap-3 md:gap-3.5">
        {/* Notification Bell with Badge '3' */}
        <button
          onClick={() => {}}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        {/* Help Circle Icon */}
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          title="Help & Documentation"
        >
          ?
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => canSwitchRole && setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#1E1B4B] text-white font-extrabold text-xs shadow-xs flex items-center justify-center shrink-0">
              JD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">John Doe</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Asset Manager</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-purple-50 text-[#6C2BD9] font-bold border border-purple-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{r.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#6C2BD9]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


