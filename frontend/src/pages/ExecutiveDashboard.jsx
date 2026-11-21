import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Plus,
  User,
  ArrowLeftRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Info,
  Radio,
  DollarSign,
  ShieldCheck,
  Cpu,
  Building,
  Laptop,
  Monitor,
  Armchair,
  Car,
  Printer,
  Activity,
  Check,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Data colors matching Asset360 design palette
const CATEGORY_COLORS = ['#3B82F6', '#14B8A6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
const CONDITION_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#EF4444'];

// Dynamic icon resolver for asset types
const getAssetTypeIcon = (typeName) => {
  const lower = (typeName || '').toLowerCase();
  if (lower.includes('laptop') || lower.includes('computer') || lower.includes('pc')) return Laptop;
  if (lower.includes('monitor') || lower.includes('screen') || lower.includes('display')) return Monitor;
  if (lower.includes('chair') || lower.includes('desk') || lower.includes('furniture')) return Armchair;
  if (lower.includes('vehicle') || lower.includes('car') || lower.includes('truck')) return Car;
  if (lower.includes('printer') || lower.includes('scanner')) return Printer;
  return Package;
};

// Dynamic icon resolver for activity transactions
const getActivityIcon = (title = '') => {
  const t = title.toUpperCase();
  if (t.includes('ASSIGN')) return User;
  if (t.includes('MAINTENANCE') || t.includes('SERVICE')) return CheckCircle2;
  if (t.includes('TRANSFER') || t.includes('MOVE')) return ArrowLeftRight;
  if (t.includes('REGISTER') || t.includes('CREATE')) return Package;
  if (t.includes('RETURN') || t.includes('CHECKIN')) return RotateCcw;
  return Activity;
};

// Dynamic icon resolver for alerts
const getAlertIcon = (type) => {
  if (type === 'danger') return AlertTriangle;
  if (type === 'warning') return AlertTriangle;
  return Info;
};

export function ExecutiveDashboard() {
  const [dbKpis, setDbKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardKpis = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/dashboard').catch(() => null);
        if (res && res.kpis) {
          setDbKpis(res.kpis);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardKpis();
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 30 Sep 2026');
  const [isDateOpen, setIsDateOpen] = useState(false);

  const userName = user?.fullName || 'User';
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  // Role permissions check helper
  const canRegisterAsset = ['SYS_ADMIN', 'ASSET_ADMIN', 'RECEIVING'].includes(userRoleCode);

  const handleKpiClick = (filterStatus) => {
    navigate(`/assets?status=${filterStatus}`);
  };

  // 100% Real Live Database Data
  const totalAssetsCount = dbKpis?.totalAssets ?? 0;
  const activeAssetsCount = dbKpis?.activeAssets ?? 0;
  const underMaintenanceCount = dbKpis?.underMaintenance ?? 0;
  const overdueCount = dbKpis?.maintenanceOverdue ?? 0;
  const disposedCount = dbKpis?.disposedAssets ?? 0;

  const categoryData = dbKpis?.categoryData || [];
  const locationData = dbKpis?.locationData || [];
  const maintenanceStatusData = dbKpis?.maintenanceStatusData || [];
  const movementTrendData = dbKpis?.movementTrendData || [];
  const topAssetTypes = dbKpis?.topAssetTypes || [];
  const warrantyExpiryData = dbKpis?.warrantyExpiryData || [];
  const conditionData = dbKpis?.conditionData || [];
  const financialTrend = dbKpis?.financialTrend || [];
  const recentActivities = dbKpis?.recentActivities || [];
  const upcomingMaintenance = dbKpis?.upcomingMaintenance || [];
  const alerts = dbKpis?.alerts || [];

  const maxAssetTypeCount = topAssetTypes.length > 0
    ? Math.max(...topAssetTypes.map((t) => t.count), 1)
    : 1;

  return (
    <div className="space-y-5 pb-8 font-sans text-black select-none">
      
      {/* 1. Dashboard Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Dashboard</h1>
          <p className="text-xs text-black font-semibold mt-0.5">
            Welcome back, {userName}! Here's an overview of your asset portfolio.
          </p>
        </div>

        {/* Date Range Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#6C2BD9] hover:bg-purple-50 rounded-xl text-xs font-bold text-black shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#6C2BD9]" />
            <span className="text-black font-bold">{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6C2BD9]" />
          </button>

          {isDateOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1">
              {['01 Sep 2026 - 30 Sep 2026', 'Last 30 Days', 'Last Quarter (Q3)', 'Year to Date (2026)'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setIsDateOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-black hover:bg-purple-100 rounded-xl transition-all"
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Dashboard Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto text-xs font-bold scrollbar-none">
        {['Overview', 'Asset Health', 'Maintenance', 'Location & Movement', 'Financials', 'Compliance'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer relative ${
                isActive
                  ? 'text-black font-extrabold border-b-2 border-[#6C2BD9] bg-purple-100 px-3 py-1 rounded-t-lg'
                  : 'text-black font-semibold hover:text-black hover:bg-purple-50 px-3 py-1'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3. 5 Interactive Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Assets */}
        <div
          onClick={() => handleKpiClick('ALL')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-[#6C2BD9] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-black text-black block leading-none">
              {loading ? "..." : totalAssetsCount.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-black block">Total Assets</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-black text-[10px] font-extrabold border border-emerald-200">
              {totalAssetsCount > 0 ? `${activeAssetsCount} In Service` : 'Portfolio Ready'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#6C2BD9] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: In Use */}
        <div
          onClick={() => handleKpiClick('IN_SERVICE')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-black text-black block leading-none">
              {loading ? "..." : activeAssetsCount.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-black block">In Use</span>
            <span className="text-[11px] font-bold text-black block">
              {totalAssetsCount > 0 ? `${Math.round((activeAssetsCount / totalAssetsCount) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Under Maintenance */}
        <div
          onClick={() => handleKpiClick('UNDER_MAINTENANCE')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-black text-black block leading-none">
              {loading ? "..." : underMaintenanceCount.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-black block">Under Maintenance</span>
            <span className="text-[11px] font-bold text-black block">
              {totalAssetsCount > 0 ? `${((underMaintenanceCount / totalAssetsCount) * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div
          onClick={() => handleKpiClick('OVERDUE')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-black text-black block leading-none">
              {loading ? "..." : overdueCount.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-black block">Overdue</span>
            <span className="text-[11px] font-bold text-black block">
              {totalAssetsCount > 0 ? `${((overdueCount / totalAssetsCount) * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Pending Disposal */}
        <div
          onClick={() => handleKpiClick('DISPOSAL')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-black text-black block leading-none">
              {loading ? "..." : disposedCount.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-black block">Pending Disposal</span>
            <span className="text-[11px] font-bold text-black block">
              {totalAssetsCount > 0 ? `${((disposedCount / totalAssetsCount) * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 4. Main Analytics Content Grid (Charts Left 8 cols, Feeds Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT COLUMN: 6 Core Analytical Widgets (Dynamic per Tab) */}
        <div className="lg:col-span-8 space-y-5">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <>
              {/* Row 1: Assets by Category & Assets by Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Widget 1: Assets by Category (Donut) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Assets by Category</h3>
                    <button onClick={() => navigate('/assets')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  {categoryData.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-400 font-semibold w-full">
                      <Package className="w-8 h-8 text-slate-300 mb-1" />
                      <span>No category data recorded yet</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pt-3">
                      <div className="w-36 h-36 relative flex items-center justify-center flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              dataKey="value"
                              innerRadius={42}
                              outerRadius={62}
                              paddingAngle={3}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-sm font-black text-slate-900 leading-none">
                            {totalAssetsCount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Assets</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5 text-[11px] max-h-36 overflow-y-auto">
                        {categoryData.map((cat, i) => (
                          <div key={cat.name} className="flex items-center justify-between text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}></span>
                              <span className="truncate font-medium">{cat.name}</span>
                            </div>
                            <span className="font-bold text-slate-800 ml-1 whitespace-nowrap">{cat.value.toLocaleString()} ({cat.percentage})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Widget 2: Assets by Location (Bar) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Assets by Location</h3>
                    <button onClick={() => navigate('/assets')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  {locationData.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-400 font-semibold w-full">
                      <Building className="w-8 h-8 text-slate-300 mb-1" />
                      <span>No location distribution data recorded yet</span>
                    </div>
                  ) : (
                    <div className="h-44 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

              </div>

              {/* Row 2: Maintenance Status & Asset Movement Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Widget 3: Maintenance Status (Donut) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Maintenance Status</h3>
                    <button onClick={() => navigate('/maintenance')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  {totalAssetsCount === 0 && maintenanceStatusData.every(d => d.value === 0) ? (
                    <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-400 font-semibold w-full">
                      <Wrench className="w-8 h-8 text-slate-300 mb-1" />
                      <span>No maintenance data recorded yet</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pt-3">
                      <div className="w-36 h-36 relative flex items-center justify-center flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={maintenanceStatusData.filter(d => d.value > 0)}
                              dataKey="value"
                              innerRadius={42}
                              outerRadius={62}
                              paddingAngle={3}
                            >
                              {maintenanceStatusData.filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`maint-cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-sm font-black text-slate-900 leading-none">
                            {totalAssetsCount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">Total Assets</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 text-[11px]">
                        {maintenanceStatusData.map((st, i) => (
                          <div key={st.name} className="flex items-center justify-between text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}></span>
                              <span className="truncate font-medium">{st.name}</span>
                            </div>
                            <span className="font-bold text-slate-800 ml-1 whitespace-nowrap">{st.value.toLocaleString()} ({st.percentage})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Widget 4: Asset Movement Trend (Line) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Asset Movement Trend</h3>
                    <button onClick={() => navigate('/movements')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={movementTrendData}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="assigned" stroke="#6C2BD9" strokeWidth={2} dot={false} name="Assigned" />
                        <Line type="monotone" dataKey="transferred" stroke="#3B82F6" strokeWidth={2} dot={false} name="Transferred" />
                        <Line type="monotone" dataKey="returned" stroke="#10B981" strokeWidth={2} dot={false} name="Returned" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Row 3: Top 5 Asset Types & Warranty Expiry (Next 6 Months) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Widget 5: Top 5 Asset Types */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Top 5 Asset Types</h3>
                    <button onClick={() => navigate('/assets')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  {topAssetTypes.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-xs text-slate-400 font-semibold">
                      <Package className="w-8 h-8 text-slate-300 mb-1" />
                      <span>No asset types recorded yet</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-2">
                      {topAssetTypes.map((item) => {
                        const Icon = getAssetTypeIcon(item.name);
                        const percent = Math.round((item.count / maxAssetTypeCount) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                <Icon className="w-3.5 h-3.5 text-purple-600" />
                                <span>{item.name}</span>
                              </div>
                              <span className="font-bold text-slate-900">{item.count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Widget 6: Warranty Expiry (Next 6 Months) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-black">Warranty Expiry (Next 6 Months)</h3>
                    <button onClick={() => navigate('/contracts')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                      View Details
                    </button>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={warrantyExpiryData}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                        <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: ASSET HEALTH */}
          {activeTab === 'Asset Health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-black">Asset Condition Breakdown</h3>
                  <button onClick={() => navigate('/assets')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">View All</button>
                </div>
                {conditionData.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-400 font-semibold w-full">
                    <span>No condition inspection data recorded yet</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-3">
                    <div className="w-36 h-36 relative flex items-center justify-center flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={conditionData} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={3}>
                            {conditionData.map((entry, index) => (
                              <Cell key={`cond-${index}`} fill={CONDITION_COLORS[index % CONDITION_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5 text-[11px]">
                      {conditionData.map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONDITION_COLORS[i % CONDITION_COLORS.length] }}></span>
                            <span>{c.name}</span>
                          </div>
                          <span className="font-bold text-slate-800">{c.value.toLocaleString()} ({c.percentage})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-black">Maintenance SLA Resolution</h3>
                  <span className="text-xs text-emerald-600 font-bold">
                    {dbKpis?.totalWorkOrders ? `${Math.round(((dbKpis.totalWorkOrders - (dbKpis.activeWorkOrdersCount || 0)) / Math.max(dbKpis.totalWorkOrders, 1)) * 100)}% SLA Compliance` : '100% SLA Compliance'}
                  </span>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                    <span className="font-bold text-[#6C2BD9]">Preventive Health Index</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {underMaintenanceCount === 0 && overdueCount === 0
                        ? 'Overall asset reliability rating is Optimal across all corporate sites.'
                        : `${underMaintenanceCount + overdueCount} asset(s) currently require servicing or overdue attention.`}
                    </p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>In-Service Ratio</span>
                      <span>{totalAssetsCount > 0 ? `${Math.round((activeAssetsCount / totalAssetsCount) * 100)}%` : '0%'}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalAssetsCount > 0 ? Math.round((activeAssetsCount / totalAssetsCount) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE */}
          {activeTab === 'Maintenance' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" /> Work Order Queue & Technician Dispatch
                </h3>
                <button onClick={() => navigate('/maintenance')} className="text-xs font-bold text-[#6C2BD9] hover:underline">Go to Planner</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-slate-500 font-bold block">Active Work Orders</span>
                  <span className="text-xl font-extrabold text-[#6C2BD9]">
                    {dbKpis?.activeWorkOrdersCount ?? 0} Tickets
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-slate-500 font-bold block">Overdue Inspections</span>
                  <span className="text-xl font-extrabold text-rose-600">
                    {overdueCount} Overdue
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 font-bold block">Preventive Schedules</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    {maintenanceStatusData.find(s => s.name === 'Planned')?.value ?? 0} Planned
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION & MOVEMENT */}
          {activeTab === 'Location & Movement' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" /> RTLS & RFID Gateways Telemetry
                </h3>
                <button onClick={() => navigate('/rtls/map')} className="text-xs font-bold text-[#6C2BD9] hover:underline">View Live Map</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Gateway Readers Active</span>
                  <span className="text-lg font-extrabold text-emerald-600">
                    {dbKpis?.activeReadersCount ?? 0} Fixed Readers
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Unscheduled Movement Alerts</span>
                  <span className="text-lg font-extrabold text-amber-600">
                    {dbKpis?.missingAssets ?? 0} Exceptions
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Floor Plans Digitized</span>
                  <span className="text-lg font-extrabold text-purple-600">
                    {dbKpis?.activeFloorMapsCount ?? dbKpis?.totalFloorMaps ?? 0} Active Maps
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIALS */}
          {activeTab === 'Financials' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Capitalized Ledger Trajectory ($k)
                </h3>
                <button onClick={() => navigate('/finance')} className="text-xs font-bold text-[#6C2BD9] hover:underline">Financial Workbench</button>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialTrend}>
                    <defs>
                      <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C2BD9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6C2BD9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="netBookValue" stroke="#6C2BD9" fill="url(#finGrad)" name="Net Book Value ($k)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 6: COMPLIANCE */}
          {activeTab === 'Compliance' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" /> IT Auto-Discovery & Contract Reconciliation
                </h3>
                <button onClick={() => navigate('/discovery')} className="text-xs font-bold text-[#6C2BD9] hover:underline">Auto Discovery</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#6C2BD9]">Auto Discovery Reconciliation Rate</span>
                  <p className="text-lg font-black text-slate-900">
                    {dbKpis?.discoveryAnomalies === 0 ? '100% Clean' : `${dbKpis?.discoveryAnomalies ?? 0} Conflicts Pending`}
                  </p>
                  <p className="text-[11px] text-slate-500">Candidate IP & SNMP matches verified against register</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-700">Warranty Coverage Audit</span>
                  <p className="text-lg font-black text-slate-900">{dbKpis?.warrantiesExpiring ?? 0} Expiring in 30 Days</p>
                  <p className="text-[11px] text-slate-500">Vendor SLAs & maintenance coverage verified</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Feeds & Right Panel Widgets */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Widget 1: Recent Activities */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-black">Recent Activities</h3>
              <button onClick={() => navigate('/audit-trail')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                  No recent activity recorded
                </div>
              ) : (
                recentActivities.map((act) => {
                  const Icon = getActivityIcon(act.title);
                  return (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${act.color || 'text-purple-600 bg-purple-50'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 truncate leading-tight">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 truncate">{act.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.detail}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{act.user}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Widget 2: Upcoming Maintenance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-black">Upcoming Maintenance</h3>
              <button onClick={() => navigate('/maintenance')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingMaintenance.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                  No upcoming maintenance scheduled
                </div>
              ) : (
                upcomingMaintenance.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] leading-none flex-shrink-0 ${item.dateColor || 'bg-purple-100 text-purple-700'}`}>
                      <span>{item.dateTag}</span>
                    </div>
                    <div className="flex-1 truncate">
                      <span className="text-[10px] font-mono text-[#6C2BD9] font-bold block">{item.code}</span>
                      <span className="font-bold text-slate-900 truncate block leading-tight">{item.title}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{item.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 3: Alerts & Notifications */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-black">Alerts & Notifications</h3>
              <button onClick={() => navigate('/reports')} className="text-[11px] text-[#6C2BD9] font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2">
              {alerts.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All systems normal. No active alerts.</span>
                </div>
              ) : (
                alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  const isDanger = alert.type === 'danger';
                  const isWarning = alert.type === 'warning';
                  return (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        isDanger
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : isWarning
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-blue-600'}`} />
                      <span className="truncate">{alert.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 5. Bottom Quick Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Action 1: New Asset */}
        <button
          onClick={() => canRegisterAsset ? navigate('/assets/new') : null}
          disabled={!canRegisterAsset}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all flex-1 min-w-[140px] ${
            canRegisterAsset
              ? 'bg-[#F4EFFE] hover:bg-[#EBE3FE] text-[#6C2BD9] cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-80'
          }`}
          title={canRegisterAsset ? 'Register a new asset' : 'Role permission restricted'}
        >
          {canRegisterAsset ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <div className="text-left leading-tight">
            <span>New Asset</span>
            <span className="block text-[10px] text-slate-500 font-normal">
              {canRegisterAsset ? 'Register a new asset' : 'Restricted'}
            </span>
          </div>
        </button>

        {/* Action 2: My Assets */}
        <button
          onClick={() => navigate('/assets?filter=my')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4EFFE] hover:bg-[#EBE3FE] text-[#6C2BD9] rounded-xl font-bold transition-all cursor-pointer flex-1 min-w-[140px]"
        >
          <User className="w-4 h-4" />
          <div className="text-left leading-tight">
            <span>My Assets</span>
            <span className="block text-[10px] text-slate-500 font-normal">View your assigned assets</span>
          </div>
        </button>

        {/* Action 3: Asset Transfer */}
        <button
          onClick={() => navigate('/movements')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4EFFE] hover:bg-[#EBE3FE] text-[#6C2BD9] rounded-xl font-bold transition-all cursor-pointer flex-1 min-w-[140px]"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <div className="text-left leading-tight">
            <span>Asset Transfer</span>
            <span className="block text-[10px] text-slate-500 font-normal">Transfer to another user</span>
          </div>
        </button>

        {/* Action 4: Maintenance */}
        <button
          onClick={() => navigate('/maintenance')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4EFFE] hover:bg-[#EBE3FE] text-[#6C2BD9] rounded-xl font-bold transition-all cursor-pointer flex-1 min-w-[140px]"
        >
          <Wrench className="w-4 h-4" />
          <div className="text-left leading-tight">
            <span>Maintenance</span>
            <span className="block text-[10px] text-slate-500 font-normal">View maintenance schedule</span>
          </div>
        </button>

        {/* Action 5: Reports */}
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4EFFE] hover:bg-[#EBE3FE] text-[#6C2BD9] rounded-xl font-bold transition-all cursor-pointer flex-1 min-w-[140px]"
        >
          <BarChart3 className="w-4 h-4" />
          <div className="text-left leading-tight">
            <span>Reports</span>
            <span className="block text-[10px] text-slate-500 font-normal">View reports & analytics</span>
          </div>
        </button>

      </div>

    </div>
  );
}

export default ExecutiveDashboard;
