import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Radio,
  Layers,
  CheckCircle2,
  LockKeyhole,
  ChevronDown,
  Shield,
  Package,
  DollarSign,
  Cpu,
  Building,
  Truck,
  UserCheck,
  Wrench,
  FileCheck,
  TrendingUp,
  Check
} from 'lucide-react';

const ENTERPRISE_USERS = [
  { username: 'admin', roleName: 'System Administrator', code: 'SYS_ADMIN', icon: Shield, color: 'text-brand-400 bg-brand-500/15 border-brand-500/30' },
  { username: 'asset_admin', roleName: 'Asset Administrator', code: 'ASSET_ADMIN', icon: Package, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
  { username: 'finance', roleName: 'Finance Asset Controller', code: 'FINANCE', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { username: 'it_manager', roleName: 'IT Asset Manager', code: 'IT_MANAGER', icon: Cpu, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { username: 'facilities', roleName: 'Facilities Manager', code: 'FACILITIES', icon: Building, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { username: 'receiving', roleName: 'Store Receiving Lead', code: 'RECEIVING', icon: Truck, color: 'text-teal-400 bg-teal-500/15 border-teal-500/30' },
  { username: 'custodian', roleName: 'Asset Custodian', code: 'CUSTODIAN', icon: UserCheck, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { username: 'technician', roleName: 'Maintenance Technician', code: 'TECHNICIAN', icon: Wrench, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  { username: 'auditor', roleName: 'Compliance Auditor', code: 'AUDITOR', icon: FileCheck, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { username: 'management', roleName: 'Executive Management', code: 'MANAGEMENT', icon: TrendingUp, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' }
];

export function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Custom Dropdown Open state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const selectedUserObj = ENTERPRISE_USERS.find(u => u.username === username) || ENTERPRISE_USERS[0];
  const SelectedIcon = selectedUserObj.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user) => {
    setUsername(user.username);
    setPassword('Admin@123');
    setError('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res && res.success) {
      navigate('/');
    } else {
      setError(res?.message || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      {/* Ambient Radial Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 shadow-2xl rounded-3xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10">
        
        {/* Left Side: Enterprise Platform Showcase */}
        <div className="order-2 lg:order-1 lg:col-span-6 bg-slate-50 p-8 lg:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-200 relative">
          <div className="space-y-8">
            {/* Brand Logo & Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#6c2bd9] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
                ∞
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Asset <span className="text-[#6c2bd9]">360°</span> <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">Enterprise</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Asset Management System</p>
              </div>
            </div>

            {/* Platform Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Complete Asset Lifecycle Control & Valuation
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Streamline global physical asset lifecycle, automated IT discovery, financial depreciation ledgers, and maintenance SLA compliance in one unified workspace.
              </p>
            </div>

            {/* Key Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9] flex-shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Automated IT Telemetry & Discovery</h3>
                  <p className="text-[11px] text-slate-500 font-medium">IP/SNMP auto-discovery, RFID tagging, and barcode tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9] flex-shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Precision Financial Depreciation Ledger</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Straight-Line & Declining Balance financial depreciation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-50 text-[#6c2bd9] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Multi-Site RBAC Data Scoping</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Site-isolated data boundaries, approval workflows & audit logging.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Key Stats Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-base font-extrabold text-[#6c2bd9]">$45.2M</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Book Value</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-[#6c2bd9]">25,000+</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Assets Tracked</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-[#6c2bd9]">99.99%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">SLA Uptime</p>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="order-1 lg:order-2 lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign in to Workspace</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Select enterprise username & role credentials</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#6c2bd9] text-[10px] font-extrabold tracking-wider uppercase">
                <LockKeyhole className="w-3 h-3" /> SECURE AUTH
              </div>
            </div>

            {/* Selected User & Role Indicator Badge */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6c2bd9] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <SelectedIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Role: {selectedUserObj.roleName}
                </p>
                <p className="text-[11px] text-[#6c2bd9] font-mono font-bold truncate">
                  Username: {selectedUserObj.username}
                </p>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Custom Role Dropdown */}
              <div ref={dropdownRef} className="relative">
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Enterprise Username & Role
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border transition-all text-left group ${
                    isDropdownOpen
                      ? 'border-[#6c2bd9] ring-2 ring-purple-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6c2bd9] flex items-center justify-center border border-purple-200 flex-shrink-0">
                      <SelectedIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6c2bd9] px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">
                          {selectedUserObj.username}
                        </span>
                        <span className="text-xs text-slate-700 font-medium truncate">
                          ({selectedUserObj.roleName})
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#6c2bd9]' : ''}`} />
                </button>

                {/* Dropdown Menu Popover */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100">
                    {ENTERPRISE_USERS.map((user) => {
                      const IconComp = user.icon;
                      const isSelected = user.username === username;
                      return (
                        <button
                          key={user.username}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all group ${
                            isSelected
                              ? 'bg-purple-50 border border-purple-200 text-slate-900 shadow-xs'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6c2bd9] flex items-center justify-center border border-purple-200 flex-shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-[#6c2bd9] text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {user.username}
                                </span>
                                <span className="text-xs font-semibold truncate text-slate-800">
                                  {user.roleName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#6c2bd9] text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: Admin@123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-500 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field input-icon-left input-icon-right font-medium"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 accent-[#6c2bd9] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                  Remember this device session
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-md shadow-brand-500/20 group mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authenticating Workspace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Sign In as {selectedUserObj.roleName}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
              <span>SOC2 Type II Certified</span>
              <span>•</span>
              <span>256-Bit SSL Encrypted</span>
            </div>
            <p className="text-[10px] text-slate-400">Infotatwaa Asset 360° Enterprise Platform © 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}



