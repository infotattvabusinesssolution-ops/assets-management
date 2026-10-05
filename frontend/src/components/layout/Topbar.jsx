import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { Search, Bell, Plus, User as UserIcon, Wifi, Sparkles, ChevronDown, Shield, Check, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset360Logo } from '../common/Asset360Logo';

export function Topbar() {
  const { user } = useAuth();
  const { openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('fams_lang') || 'en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLangChange = (langCode) => {
    setCurrentLang(langCode);
    setShowLangDropdown(false);
    localStorage.setItem('fams_lang', langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Search Bar matching screenshot */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={openPalette}
          className="flex items-center gap-2.5 bg-white hover:bg-purple-50/50 border border-slate-300 text-black px-3.5 py-2 rounded-xl text-xs w-full sm:w-80 md:w-96 transition-all shadow-2xs select-none cursor-pointer focus:border-[#6C2BD9]"
        >
          <Search className="w-4 h-4 text-[#6C2BD9] shrink-0" />
          <span className="truncate text-black font-semibold text-xs whitespace-nowrap">
            Search assets, locations, users, logs...
          </span>
        </button>
      </div>

      {/* Right Controls matching screenshot */}
      <div className="flex items-center gap-3 md:gap-3.5 text-black">
        {/* Language Selector (English / العربية) */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-black shadow-2xs cursor-pointer hover:bg-purple-50"
            title="Select Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#6C2BD9]" />
            <span>{currentLang === 'ar' ? 'العربية' : 'English'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showLangDropdown && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50 text-xs space-y-0.5">
              <button
                onClick={() => handleLangChange('en')}
                className={`w-full text-left px-3 py-1.5 rounded-lg font-bold flex items-center justify-between cursor-pointer ${
                  currentLang === 'en' ? 'bg-purple-100 text-[#6C2BD9]' : 'text-slate-700 hover:bg-purple-50'
                }`}
              >
                <span>English</span>
                {currentLang === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleLangChange('ar')}
                className={`w-full text-left px-3 py-1.5 rounded-lg font-bold flex items-center justify-between cursor-pointer ${
                  currentLang === 'ar' ? 'bg-purple-100 text-[#6C2BD9]' : 'text-slate-700 hover:bg-purple-50'
                }`}
              >
                <span>العربية</span>
                {currentLang === 'ar' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Dubai HQ Selector matching screenshot */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-black shadow-2xs cursor-pointer hover:bg-purple-50">
          <span className="text-black">Dubai HQ</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6C2BD9]" />
        </div>

        {/* Notification Bell with Badge '3' */}
        <button
          onClick={() => {}}
          className="relative p-2 rounded-xl text-black hover:bg-purple-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-black" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        {/* Help Circle Icon */}
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded-full border border-slate-300 text-black hover:bg-purple-50 hover:border-[#6C2BD9] flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          title="Help & Documentation"
        >
          ?
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 text-black">
          <div className="w-8 h-8 rounded-full bg-[#6C2BD9] text-white font-extrabold text-xs shadow-2xs flex items-center justify-center shrink-0">
            {(user?.fullName || user?.username || '?').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-extrabold text-black leading-tight">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-[10px] text-black font-bold leading-tight">{user?.role?.name || user?.role?.code || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}


