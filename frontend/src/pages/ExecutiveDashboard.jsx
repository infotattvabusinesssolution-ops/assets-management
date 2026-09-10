import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import {
  Package,
  DollarSign,
  Wrench,
  AlertTriangle,
  Radio,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Building2,
  UserCheck,
  Inbox,
  ShieldAlert,
  Cpu,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';

const COLORS = ['#00c88c', '#a855f7', '#ff5c28', '#38bdf8', '#ec4899', '#eab308'];

const ENTERPRISE_ROLES = [
  { code: 'MANAGEMENT', name: 'Management Dashboard', icon: TrendingUp },
  { code: 'ASSET_ADMIN', name: 'Asset Admin Workbench', icon: Package },
  { code: 'FINANCE', name: 'Finance Asset Controller', icon: DollarSign },
  { code: 'IT_MANAGER', name: 'IT Asset Manager', icon: Radio },
  { code: 'FACILITIES', name: 'Facilities & Maps', icon: Building2 },
  { code: 'RECEIVING', name: 'Store Receiving Workbench', icon: Inbox },
  { code: 'CUSTODIAN', name: 'My Custody Assets', icon: UserCheck },
  { code: 'TECHNICIAN', name: 'Maintenance Technician', icon: Wrench },
  { code: 'AUDITOR', name: 'Auditor & Verification', icon: ShieldAlert },
  { code: 'SYS_ADMIN', name: 'System Administrator', icon: Cpu }
];

// Mock monthly analytics trend data for rich interactive charts
const ANALYTICS_TREND_DATA = [
  { month: 'Jan', acquisitions: 42, netBookValue: 180, maintenanceCost: 12 },
  { month: 'Feb', acquisitions: 55, netBookValue: 210, maintenanceCost: 18 },
  { month: 'Mar', acquisitions: 48, netBookValue: 245, maintenanceCost: 15 },
  { month: 'Apr', acquisitions: 68, netBookValue: 290, maintenanceCost: 24 },
  { month: 'May', acquisitions: 85, netBookValue: 340, maintenanceCost: 20 },
  { month: 'Jun', acquisitions: 74, netBookValue: 380, maintenanceCost: 28 },
  { month: 'Jul', acquisitions: 92, netBookValue: 425, maintenanceCost: 32 },
  { month: 'Aug', acquisitions: 110, netBookValue: 490, maintenanceCost: 26 },
  { month: 'Sep', acquisitions: 98, netBookValue: 530, maintenanceCost: 35 },
  { month: 'Oct', acquisitions: 125, netBookValue: 610, maintenanceCost: 30 },
  { month: 'Nov', acquisitions: 115, netBookValue: 670, maintenanceCost: 40 },
  { month: 'Dec', acquisitions: 140, netBookValue: 750, maintenanceCost: 38 }
];

const WORK_ORDER_SLA_DATA = [
  { month: 'Jan', completed: 18, overdue: 4, preventive: 12 },
  { month: 'Feb', completed: 24, overdue: 3, preventive: 16 },
  { month: 'Mar', completed: 20, overdue: 5, preventive: 14 },
  { month: 'Apr', completed: 32, overdue: 2, preventive: 22 },
  { month: 'May', completed: 28, overdue: 6, preventive: 20 },
  { month: 'Jun', completed: 36, overdue: 3, preventive: 26 },
  { month: 'Jul', completed: 42, overdue: 1, preventive: 30 }
];

const RECENT_ACTIVITIES = [
  { id: 1, user: 'David Miller', action: 'Assigned Asset AST-2026-002', time: '10 mins ago', status: 'COMPLETED', color: 'emerald' },
  { id: 2, user: 'System Admin', action: 'Created Work Order WO-2026-01', time: '35 mins ago', status: 'IN_PROGRESS', color: 'cyan' },
  { id: 3, user: 'Sarah Jenkins', action: 'Verified Stocktake Item TAG-9001', time: '2 hours ago', status: 'VERIFIED', color: 'purple' },
  { id: 4, user: 'Robert Chen', action: 'Flagged Maintenance Anomaly', time: '4 hours ago', status: 'WARNING', color: 'orange' }
];

export function ExecutiveDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRolePerspective, setActiveRolePerspective] = useState('MANAGEMENT');
  const [timeRange, setTimeRange] = useState('1Y');
  const [chartViewMode, setChartViewMode] = useState('area');

  useEffect(() => {
    if (user && user.role) {
      setActiveRolePerspective(user.role.code || 'MANAGEMENT');
    }
  }, [user]);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await api.get(`/reports/dashboard?timeRange=${timeRange}`);
        if (res.success) setData(res.kpis);
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [timeRange]);

  const statusData = data && data.statusCounts && Object.keys(data.statusCounts).length > 0
    ? Object.keys(data.statusCounts).map(key => ({
        name: key.replace(/_/g, ' '),
        value: data.statusCounts[key]
      }))
    : [
        { name: 'IN SERVICE', value: data?.activeAssets || 145 },
        { name: 'ASSIGNED', value: Math.floor((data?.activeAssets || 100) * 0.4) },
        { name: 'UNDER MAINTENANCE', value: data?.underMaintenance || 28 },
        { name: 'MISSING', value: data?.missingAssets || 5 },
        { name: 'DISPOSED', value: data?.disposedAssets || 10 }
      ];

  const totalStatusCount = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Palette */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Enterprise Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-brand-500 text-[10px] font-mono font-bold tracking-wider uppercase">
              LIVE DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time asset telemetry, valuation velocity & operational SLA analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 text-xs shadow-xs">
            {['1W', '1M', '6M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timeRange === range
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Active Role Indicator */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-brand-500 text-xs font-bold shadow-xs">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>Role: {activeRolePerspective}</span>
          </div>
        </div>
      </div>

      {/* Role Perspective Selector Tabs */}
      <div className="glass-panel p-2 flex items-center gap-2 overflow-x-auto">
        {ENTERPRISE_ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = activeRolePerspective === r.code;
          return (
            <button
              key={r.code}
              onClick={() => setActiveRolePerspective(r.code)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {r.name}
            </button>
          );
        })}
      </div>

      {/* Metric Cards Grid for All Roles */}
      {activeRolePerspective === 'SYS_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="System Active Nodes" value="12 Services" icon={Cpu} color="purple" trend="100% Operational" subtext="Microservices & API Gateway" />
          <StatCard title="Total Registered Users" value={`${data?.totalUsers || 10} Users`} icon={UserCheck} color="emerald" trend="RBAC Active" subtext="Configured System Roles" />
          <StatCard title="Immutable Audit Logs" value={`${data?.recentActivities?.length || 1482} Logs`} icon={ShieldCheck} color="cyan" trend="Live Trail" subtext="Security Audit Logging" />
          <StatCard title="Digitized Floor Maps" value={`${data?.totalFloorMaps || 12} Maps`} icon={Radio} color="orange" trend="Healthy Sync" subtext="Spatial Locators Active" />
        </div>
      )}

      {activeRolePerspective === 'ASSET_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Registered Assets" value={data?.totalAssets || 0} icon={Package} color="emerald" trend="Active Registry" subtext="Global asset register" />
          <StatCard title="Active Operational" value={data?.activeAssets || 0} icon={Inbox} color="cyan" trend="In Service" subtext="Operational hardware" />
          <StatCard title="Under Maintenance" value={data?.underMaintenance || 0} icon={ArrowUpRight} color="purple" trend="Work Orders" subtext="Service & repair queue" />
          <StatCard title="Missing / Exceptions" value={data?.missingAssets || 0} icon={CheckCircle2} color="orange" trend="Audit Review" subtext="Verification variances" />
        </div>
      )}

      {activeRolePerspective === 'FINANCE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Capitalized Net Book Value" value={`$${(data?.totalAssetValue || 0).toLocaleString()}`} icon={DollarSign} color="emerald" trend="Corporate Ledger" subtext="Decimal128 Precision" />
          <StatCard title="Active Asset Register" value={data?.totalAssets || 0} icon={TrendingUp} color="purple" trend="Registered" subtext="Capitalized Asset Items" />
          <StatCard title="CapEx Additions" value={data?.activeAssets || 0} icon={Package} color="cyan" trend="In Service" subtext="Active Capitalized Units" />
          <StatCard title="Disposed / Retired" value={data?.disposedAssets || 0} icon={AlertTriangle} color="orange" trend="Gain/Loss Reference" subtext="Retired Ledger Assets" />
        </div>
      )}

      {activeRolePerspective === 'IT_MANAGER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Registered IT Devices" value={`${data?.totalAssets || 0} Units`} icon={Package} color="emerald" trend="Compute & IT" subtext="Hardware Register" />
          <StatCard title="Auto-Discovered Telemetry" value="3 Collectors" icon={Radio} color="cyan" trend="SNMP/IP Active" subtext="Subnet Range Scanner" />
          <StatCard title="Candidate Match Anomalies" value={data?.discoveryAnomalies || 0} icon={AlertTriangle} color="orange" trend="Workbench Review" subtext="Discovered vs Registered match" />
          <StatCard title="Expiring Tech Warranties" value={data?.warrantiesExpiring || 0} icon={ShieldAlert} color="pink" trend="30 Days SLA" subtext="Vendor SLA coverage review" />
        </div>
      )}

      {activeRolePerspective === 'FACILITIES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Digitized Floor Maps" value={`${data?.totalFloorMaps || 0} Plans`} icon={Building2} color="emerald" trend="Site Maps" subtext="Floor map library" />
          <StatCard title="Positioned Map Pins" value={`${data?.totalAssets || 0} Assets`} icon={Package} color="cyan" trend="Spatial Locator" subtext="X/Y Coordinates Set" />
          <StatCard title="Facilities Contracts" value={`${data?.totalContracts || 0} Active`} icon={Layers} color="purple" trend="SLA Active" subtext="Building & Service SLAs" />
          <StatCard title="Facilities Work Orders" value={`${data?.totalWorkOrders || 0} Orders`} icon={Wrench} color="orange" trend="Maintenance" subtext="Infrastructure tickets" />
        </div>
      )}

      {activeRolePerspective === 'RECEIVING' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Incoming PO Receipts" value={`${data?.totalReceipts || 0} Receipts`} icon={Inbox} color="emerald" trend="Receiving Dock" subtext="Goods receipt staging" />
          <StatCard title="Registered Assets" value={`${data?.totalAssets || 0} Units`} icon={Package} color="cyan" trend="Staging Inventory" subtext="Tagging & Staging Queue" />
          <StatCard title="Active In Service" value={`${data?.activeAssets || 0} Items`} icon={CheckCircle2} color="purple" trend="Deployed" subtext="Verified for custody" />
          <StatCard title="Disposed / Staging" value={`${data?.disposedAssets || 0} Items`} icon={UserCheck} color="orange" trend="Staging" subtext="History Logged" />
        </div>
      )}

      {activeRolePerspective === 'CUSTODIAN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active In Service" value={`${data?.activeAssets || 0} Items`} icon={UserCheck} color="emerald" trend="In Service" subtext="Active Custody Registry" />
          <StatCard title="Pending Work Orders" value={`${data?.maintenanceOverdue || 0} Tickets`} icon={CheckCircle2} color="purple" trend="Review" subtext="Maintenance Requests" />
          <StatCard title="Expiring Warranties" value={`${data?.warrantiesExpiring || 0} Items`} icon={Calendar} color="orange" trend="Coverage" subtext="Warranty Expiration Alert" />
          <StatCard title="Missing / Relocated" value={`${data?.missingAssets || 0} Items`} icon={Wrench} color="cyan" trend="Audited" subtext="Custody Exception Alerts" />
        </div>
      )}

      {activeRolePerspective === 'TECHNICIAN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Maintenance Orders" value={`${data?.totalWorkOrders || 0} Orders`} icon={Wrench} color="emerald" trend="Active Work Orders" subtext="Preventive & Corrective" />
          <StatCard title="Overdue Maintenance" value={data?.maintenanceOverdue || 0} icon={AlertTriangle} color="orange" trend="High Priority" subtext="Technician dispatch required" />
          <StatCard title="Under Repair" value={`${data?.underMaintenance || 0} Assets`} icon={CheckCircle2} color="purple" trend="In Shop" subtext="Hardware undergoing repair" />
          <StatCard title="Active Warranties" value={`${data?.warrantiesExpiring || 0} Expiring`} icon={ShieldCheck} color="cyan" trend="SLA Check" subtext="Vendor covered parts/labor" />
        </div>
      )}

      {activeRolePerspective === 'AUDITOR' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Audit Assets" value={`${data?.totalAssets || 0} Assets`} icon={Package} color="emerald" trend="Audit Population" subtext="Master asset register" />
          <StatCard title="Active In Service" value={`${data?.activeAssets || 0} Assets`} icon={ShieldCheck} color="purple" trend="Verified Active" subtext="Operational assets" />
          <StatCard title="Discrepancies / Missing" value={`${data?.missingAssets || 0} Exceptions`} icon={ShieldAlert} color="orange" trend="Review Required" subtext="Missing / relocated items" />
          <StatCard title="Discovery Match Anomalies" value={`${data?.discoveryAnomalies || 0} Matches`} icon={Calendar} color="cyan" trend="Reconciliation" subtext="IP/SNMP Discovery variances" />
        </div>
      )}

      {activeRolePerspective === 'MANAGEMENT' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Registered Assets" value={data?.totalAssets || 0} icon={Package} color="emerald" trend="Global Enterprise" subtext="Global entity count" />
          <StatCard title="Capitalized Net Book Value" value={`$${(data?.totalAssetValue || 0).toLocaleString()}`} icon={DollarSign} color="purple" trend="Decimal128 Ledger" subtext="Corporate Ledger" />
          <StatCard title="Maintenance Work Orders" value={`${data?.totalWorkOrders || 0} Orders`} icon={Wrench} color="orange" trend="Overdue: ${data?.maintenanceOverdue || 0}" subtext="Operational reliability" />
          <StatCard title="Discovery & Warranties" value={`${(data?.discoveryAnomalies || 0) + (data?.warrantiesExpiring || 0)} Alerts`} icon={AlertTriangle} color="pink" trend="Attention Required" subtext="Anomalies & Expirations" />
        </div>
      )}

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analytics Area Chart */}
        <div className="lg:col-span-7 glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500" /> Asset Acquisition & Valuation Velocity
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Monthly capitalization trajectory & valuation trend ($k)</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setChartViewMode('area')}
                className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                  chartViewMode === 'area' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartViewMode('bar')}
                className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                  chartViewMode === 'bar' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'area' ? (
                <AreaChart data={data?.analyticsTrend || ANALYTICS_TREND_DATA}>
                  <defs>
                    <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6c2bd9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6c2bd9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="netBookValue" stroke="#6c2bd9" strokeWidth={2.5} fill="url(#areaPurple)" name="Net Book Value ($k)" />
                  <Area type="monotone" dataKey="acquisitions" stroke="#10b981" strokeWidth={2.5} fill="url(#areaGreen)" name="Asset Additions" />
                </AreaChart>
              ) : (
                <BarChart data={data?.analyticsTrend || ANALYTICS_TREND_DATA}>
                  <defs>
                    <linearGradient id="emeraldPurpleBar" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6c2bd9" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a'
                    }}
                  />
                  <Bar dataKey="acquisitions" fill="url(#emeraldPurpleBar)" radius={[6, 6, 0, 0]} name="Asset Additions" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Asset Additions</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Net Book Value ($k)</div>
            </div>
            <span className="text-[11px] font-mono text-brand-500 font-bold">+24.8% YoY Velocity</span>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" /> Category Distribution
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Asset counts by primary category</p>
            </div>
            <span className="text-xs text-brand-500 font-mono font-bold">
              {data?.categoryCounts ? `${data.categoryCounts.length} Categories` : '5 Categories'}
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryCounts && data.categoryCounts.length > 0 ? data.categoryCounts : [
                { name: 'IT Infrastructure', count: 95 },
                { name: 'Facilities & Heavy', count: 64 },
                { name: 'Vehicles & Logistics', count: 42 },
                { name: 'Office Furniture', count: 28 },
                { name: 'Tooling & Testing', count: 21 }
              ]} layout="vertical">
                <defs>
                  <linearGradient id="horizontalGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6c2bd9" />
                  </linearGradient>
                </defs>
                <XAxis type="number" stroke="#64748b" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={110} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', color: '#0f172a' }} />
                <Bar dataKey="count" fill="url(#horizontalGrad)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Live category breakdown from backend registry</span>
            <ArrowUpRight className="w-4 h-4 text-brand-500" />
          </div>
        </div>
      </div>

      {/* Donut Chart & SLA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Lifecycle Status Donut</h3>
              <p className="text-[11px] text-slate-500 font-medium">Asset state distribution in registry</p>
            </div>
            <span className="text-xs text-brand-500 font-bold">{totalStatusCount} Total</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalStatusCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Assets</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
            {statusData.slice(0, 4).map((st, i) => (
              <div key={st.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="truncate">{st.name}: <strong className="text-slate-900">{st.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-500" /> Maintenance SLA & Work Order Velocity
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Completed vs Overdue Work Orders</p>
            </div>
            <span className="text-xs text-emerald-600 font-bold">94.2% SLA Compliance</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.workOrderSlaTrend || WORK_ORDER_SLA_DATA}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', color: '#0f172a' }} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Work Orders" barSize={20} />
                <Line type="monotone" dataKey="preventive" stroke="#6c2bd9" strokeWidth={2.5} name="Preventive Inspections" />
                <Line type="monotone" dataKey="overdue" stroke="#f43f5e" strokeWidth={2.5} name="Overdue Tickets" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Preventive</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue</div>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">Average Resolution: 1.4 Days</span>
          </div>
        </div>
      </div>

      {/* Operational Pipeline & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Asset Operational Lifecycle Pipeline</h3>
            <span className="text-xs text-slate-500 font-medium">Registry Health</span>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              <div className="bg-emerald-500 h-full w-[45%]" title="In Service (45%)"></div>
              <div className="bg-purple-500 h-full w-[20%]" title="Assigned (20%)"></div>
              <div className="bg-amber-500 h-full w-[15%]" title="Under Maintenance (15%)"></div>
              <div className="bg-indigo-500 h-full w-[12%]" title="Tagged / Received (12%)"></div>
              <div className="bg-rose-500 h-full w-[8%]" title="Pending Disposals (8%)"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> In Service</div>
                <span className="font-bold text-slate-900">45%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Assigned</div>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance</div>
                <span className="font-bold text-slate-900">15%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Tagged</div>
                <span className="font-bold text-slate-900">12%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Disposals</div>
                <span className="font-bold text-slate-900">8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operations Feed */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" /> Recent Operations Timeline
            </h3>
            <span className="text-[11px] text-brand-500 font-mono font-bold">LIVE FEED</span>
          </div>

          <div className="space-y-2.5">
            {(data?.recentActivities && data.recentActivities.length > 0 ? data.recentActivities : RECENT_ACTIVITIES).map((act) => (
              <div key={act.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 text-[#6c2bd9] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {act.user.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{act.action}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{act.user} • {act.time}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-brand-500 border border-purple-200 uppercase tracking-wider flex-shrink-0">
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
