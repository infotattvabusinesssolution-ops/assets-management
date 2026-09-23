import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Package,
  ArrowRightLeft,
  UserCheck,
  MapPin,
  DollarSign,
  AlertTriangle,
  Network,
  Wrench,
  Clock,
  Receipt,
  Search,
  Filter,
  ArrowLeft,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  Printer,
  Edit2,
  MoreVertical,
  Play,
  Share2,
  Building2,
  Cpu,
  Boxes,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// 1. Seed & Master Definitions Matching Screenshots
// ---------------------------------------------------------------------------

const CATEGORY_CARDS = [
  {
    id: 'asset',
    name: 'Asset Reports',
    description: 'Asset inventory, lifecycle',
    icon: Package,
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Reports',
    description: 'Work orders, costs',
    icon: Wrench,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  },
  {
    id: 'inventory',
    name: 'Inventory Reports',
    description: 'Stock, transfers, usage',
    icon: Boxes,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Cost, depreciation, budget',
    icon: DollarSign,
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    id: 'compliance',
    name: 'Compliance Reports',
    description: 'Audit, warranty, regulatory',
    icon: ShieldCheck,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  },
  {
    id: 'custom',
    name: 'Custom Reports',
    description: 'Build your own reports',
    icon: SlidersHorizontal,
    color: '#6C2BD9',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  }
];

const DEFAULT_KPIS = {
  totalAssets: 12486,
  totalAssetsChange: 12,
  totalAssetsTrend: 'up',
  activeWorkOrders: 342,
  activeWorkOrdersChange: 8,
  activeWorkOrdersTrend: 'up',
  locationCount: 18,
  locationText: '18 Locations',
  maintenanceCost: 'AED 1.2M',
  maintenanceCostChange: 5,
  maintenanceCostTrend: 'down',
  complianceRate: 98,
  complianceRateChange: 2,
  complianceRateTrend: 'up',
  periodText: 'vs. last period'
};

const ASSETS_BY_CATEGORY = [
  { name: 'IT Equipment', count: 3245, pct: 26, color: '#6C2BD9' },
  { name: 'Office Furniture', count: 2180, pct: 17, color: '#60A5FA' },
  { name: 'Vehicles', count: 1846, pct: 15, color: '#F59E0B' },
  { name: 'Machinery', count: 1520, pct: 12, color: '#EF4444' },
  { name: 'Tools & Equipment', count: 1245, pct: 10, color: '#06B6D4' },
  { name: 'Facilities', count: 980, pct: 8, color: '#5B21B6' },
  { name: 'Others', count: 1470, pct: 12, color: '#94A3B8' }
];

const ASSETS_BY_LOCATION = [
  { location: 'Dubai HQ', count: 3245, fill: '#6C2BD9' },
  { location: 'Jebel Ali', count: 2180, fill: '#60A5FA' },
  { location: 'Abu Dhabi', count: 1846, fill: '#93C5FD' },
  { location: 'Sharjah', count: 1520, fill: '#93C5FD' },
  { location: 'Other', count: 980, fill: '#BFDBFE' }
];

const ASSET_STATUS_DATA = [
  { status: 'Active', count: 10245, pct: 82, color: '#10B981' },
  { status: 'In Maintenance', count: 856, pct: 7, color: '#F59E0B' },
  { status: 'Retired', count: 480, pct: 4, color: '#94A3B8' },
  { status: 'Lost / Missing', count: 320, pct: 3, color: '#EF4444' },
  { status: 'Disposed', count: 585, pct: 4, color: '#8B5CF6' }
];

const RECENT_REPORTS_SEED = [
  {
    id: 'REP-2025-091',
    name: 'Asset Inventory Report',
    category: 'Asset',
    dateGenerated: '10 Sep 2025 10:30 AM',
    generatedBy: 'John Doe',
    format: 'PDF'
  },
  {
    id: 'REP-2025-090',
    name: 'Maintenance Cost Analysis',
    category: 'Maintenance',
    dateGenerated: '09 Sep 2025 04:15 PM',
    generatedBy: 'Sarah Ahmed',
    format: 'Excel'
  },
  {
    id: 'REP-2025-089',
    name: 'Assets by Location',
    category: 'Asset',
    dateGenerated: '08 Sep 2025 11:20 AM',
    generatedBy: 'Khalid Al Mansoori',
    format: 'PDF'
  },
  {
    id: 'REP-2025-088',
    name: 'Compliance Report',
    category: 'Compliance',
    dateGenerated: '07 Sep 2025 02:45 PM',
    generatedBy: 'Priya Nair',
    format: 'Excel'
  },
  {
    id: 'REP-2025-087',
    name: 'Depreciation Schedule',
    category: 'Financial',
    dateGenerated: '05 Sep 2025 09:10 AM',
    generatedBy: 'Admin',
    format: 'PDF'
  }
];

const SCHEDULED_REPORTS_SEED = [
  {
    id: 'SCH-001',
    name: 'Asset Summary',
    frequency: 'Monthly',
    nextRun: '01 Oct 2025',
    status: 'Active'
  },
  {
    id: 'SCH-002',
    name: 'Maintenance Report',
    frequency: 'Weekly',
    nextRun: '15 Sep 2025',
    status: 'Active'
  },
  {
    id: 'SCH-003',
    name: 'Inventory Valuation',
    frequency: 'Monthly',
    nextRun: '01 Oct 2025',
    status: 'Active'
  },
  {
    id: 'SCH-004',
    name: 'Compliance Report',
    frequency: 'Quarterly',
    nextRun: '01 Oct 2025',
    status: 'Active'
  },
  {
    id: 'SCH-005',
    name: 'Asset Lifecycle',
    frequency: 'Monthly',
    nextRun: '01 Oct 2025',
    status: 'Paused'
  }
];

const CORE_PREDEFINED_REPORTS = [
  {
    id: 'asset-register',
    name: 'Master Asset Register',
    description: 'Central master inventory register with category, company, location, and lifecycle status.',
    category: 'Asset',
    endpoint: '/reports/asset-register'
  },
  {
    id: 'movement',
    name: 'Asset Movement & Transfer History',
    description: 'Audit log of asset custody transfers, site movements, check-ins, and check-outs.',
    category: 'Asset',
    endpoint: '/reports/movement'
  },
  {
    id: 'custody',
    name: 'Custodian & Employee Allocation',
    description: 'Current employee asset assignments, custodian allocations, and departmental splits.',
    category: 'Asset',
    endpoint: '/reports/custody'
  },
  {
    id: 'location-distribution',
    name: 'Site & Location Distribution',
    description: 'Breakdown of physical asset placement across sites, buildings, floors, and rooms.',
    category: 'Asset',
    endpoint: '/reports/location-distribution'
  },
  {
    id: 'depreciation',
    name: 'Depreciation & Net Book Value',
    description: 'Financial valuation, accumulated depreciation schedules, and current Net Book Value (NBV).',
    category: 'Financial',
    endpoint: '/reports/depreciation'
  },
  {
    id: 'maintenance',
    name: 'Maintenance History & Cost Log',
    description: 'Preventive and corrective work orders, labor hours, and maintenance expenditures.',
    category: 'Maintenance',
    endpoint: '/reports/maintenance'
  },
  {
    id: 'warranties',
    name: 'Warranty & SLA Expiry Schedule',
    description: 'Upcoming vendor contract and OEM warranty expirations over time.',
    category: 'Compliance',
    endpoint: '/reports/warranties'
  },
  {
    id: 'exceptions',
    name: 'Missing & Exception Alerts',
    description: 'Audit discrepancy log of missing, stolen, damaged, or unserviceable hardware.',
    category: 'Compliance',
    endpoint: '/reports/exceptions'
  }
];

export function ReportsCatalogue() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active View Mode: 'DASHBOARD' | 'CATEGORY_REPORTS' | 'REPORT_VIEWER'
  const [viewMode, setViewMode] = useState('DASHBOARD');
  const [selectedReportObj, setSelectedReportObj] = useState(null);

  // Common Filters State (Screenshot 1)
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterReportType, setFilterReportType] = useState('All Types');
  const [filterDateRange, setFilterDateRange] = useState('01 Jan 2025 - 31 Dec 2025');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');

  // Advanced Filters State (Screenshot 2)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    reportCategory: 'Asset Reports',
    reportType: 'Assets by Location',
    dateRange: 'This Year (Jan 2025 - Dec 2025)',
    company: 'All Companies',
    location: 'All Locations',
    department: 'All Departments',
    costCenter: 'All Cost Centers',
    assetClass: 'All Classes',
    supplier: 'All Suppliers',
    assetGroup: 'All Asset Groups',
    assetCategory: 'All Categories',
    assetSubCategory: 'All Sub Categories',
    acqFromDate: '',
    acqToDate: '',
    assetStatus: ['Active', 'In Maintenance'],
    tags: ''
  });

  // KPI & Analytics Data
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [categoryChartData, setCategoryChartData] = useState(ASSETS_BY_CATEGORY);
  const [locationChartData, setLocationChartData] = useState(ASSETS_BY_LOCATION);
  const [statusChartData, setStatusChartData] = useState(ASSET_STATUS_DATA);
  const [recentReports, setRecentReports] = useState(RECENT_REPORTS_SEED);
  const [scheduledReports, setScheduledReports] = useState(SCHEDULED_REPORTS_SEED);
  const [loading, setLoading] = useState(false);

  // Modals & Actions
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showStandardReportModal, setShowStandardReportModal] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showScheduleReportModal, setShowScheduleReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Drill-Down Modal State
  const [drillDownModal, setDrillDownModal] = useState({
    open: false,
    title: '',
    metricKey: '',
    filterType: '',
    filterValue: '',
    records: [],
    loading: false
  });

  // AI Assistant Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Report Viewer Data State
  const [viewerData, setViewerData] = useState([]);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerPage, setViewerPage] = useState(1);
  const [viewerPageSize, setViewerPageSize] = useState(10);
  const [viewerSearch, setViewerSearch] = useState('');

  // Handle URL Query Params for Category Tab switching
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const match = CATEGORY_CARDS.find(c => c.id.toLowerCase() === cat.toLowerCase());
      if (match) {
        setFilterCategory(match.name);
      }
    }
  }, [searchParams]);

  // Fetch Dashboard Analytics from Backend
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analytics/dashboard', {
        params: {
          category: filterCategory,
          reportType: filterReportType,
          dateRange: filterDateRange,
          location: filterLocation,
          department: filterDepartment,
          company: advFilters.company
        }
      });
      const data = res?.data || res;
      if (data && (data.kpis || data.charts)) {
        if (data.kpis) setKpis(data.kpis);
        if (data.charts?.assetsByCategory) setCategoryChartData(data.charts.assetsByCategory);
        if (data.charts?.assetsByLocation) setLocationChartData(data.charts.assetsByLocation);
        if (data.charts?.assetStatus) setStatusChartData(data.charts.assetStatus);
        if (data.recentReports) setRecentReports(data.recentReports);
        if (data.scheduledReports) setScheduledReports(data.scheduledReports);
      }
    } catch (err) {
      console.warn('Using seeded dashboard analytics fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterCategory, filterLocation, filterDepartment]);

  // Toggle Scheduled Report
  const handleToggleSchedule = async (reportId) => {
    try {
      const res = await api.patch(`/reports/analytics/scheduled/${reportId}/toggle`);
      setScheduledReports(prev =>
        prev.map(item => {
          if (item.id === reportId) {
            const nextStatus = item.status === 'Active' ? 'Paused' : 'Active';
            return { ...item, status: nextStatus };
          }
          return item;
        })
      );
      setActionSuccessMsg(`Schedule status updated.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      // Local fallback toggle
      setScheduledReports(prev =>
        prev.map(item => {
          if (item.id === reportId) {
            const nextStatus = item.status === 'Active' ? 'Paused' : 'Active';
            return { ...item, status: nextStatus };
          }
          return item;
        })
      );
      setActionSuccessMsg(`Schedule status updated.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  // Open Interactive Drill-Down Modal
  const handleOpenDrillDown = async ({ title, metricKey, filterType, filterValue }) => {
    setDrillDownModal({
      open: true,
      title: title || `Drill-Down: ${filterValue || metricKey}`,
      metricKey,
      filterType,
      filterValue,
      records: [],
      loading: true
    });

    try {
      const res = await api.get('/reports/analytics/drill-down', {
        params: { metricKey, filterType, filterValue }
      });
      const data = res?.data || res;
      if (data?.records) {
        setDrillDownModal(prev => ({
          ...prev,
          records: data.records,
          loading: false
        }));
      }
    } catch (err) {
      console.warn('Drill-down fallback data');
      setDrillDownModal(prev => ({
        ...prev,
        records: [
          {
            id: 'AS-001',
            assetNumber: 'AST-DX-10024',
            name: 'Dell Precision 7760 Workstation',
            category: 'IT Equipment',
            location: 'Dubai HQ > 2F > Engineering',
            custodian: 'Sarah Ahmed',
            status: 'Active',
            cost: 'AED 14,500'
          },
          {
            id: 'AS-002',
            assetNumber: 'AST-DX-10025',
            name: 'Cisco Catalyst 9300 Core Switch',
            category: 'IT Equipment',
            location: 'Dubai HQ > Server Room 1',
            custodian: 'John Doe',
            status: 'In Maintenance',
            cost: 'AED 28,000'
          },
          {
            id: 'AS-003',
            assetNumber: 'AST-DX-10026',
            name: 'Toyota Hilux Double Cab 4x4',
            category: 'Vehicles',
            location: 'Jebel Ali > Transport Bay',
            custodian: 'Rashid Khan',
            status: 'Active',
            cost: 'AED 115,000'
          }
        ],
        loading: false
      }));
    }
  };

  // AI Query Handler
  const handleRunAiQuery = async (queryText) => {
    const q = queryText || aiPrompt;
    if (!q.trim()) return;
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await api.post('/reports/analytics/ai-query', { prompt: q });
      const data = res?.data?.data || res?.data || res;
      setAiResult(data);
    } catch (err) {
      // Fallback structured response
      setAiResult({
        query: q,
        title: 'Asset360 Intelligence Analysis',
        insights: [
          'Spend is heavily indexed on Dubai HQ Facilities and Heavy Machinery.',
          'Preventive maintenance compliance rate reached 98% in current audit interval.'
        ],
        supportingRecords: [
          { assetNumber: 'AST-DX-10027', name: 'Caterpillar 500kVA Generator', category: 'Machinery', location: 'Dubai HQ', maintenanceCost: 'AED 68,000' },
          { assetNumber: 'AST-DX-10030', name: 'Carrier 30XA Chiller #2', category: 'Facilities', location: 'Dubai HQ', maintenanceCost: 'AED 54,000' }
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Launch Standard Report Viewer
  const handleLaunchReport = async (report) => {
    setSelectedReportObj(report);
    setViewMode('REPORT_VIEWER');
    setViewerLoading(true);
    setViewerData([]);

    try {
      const res = await api.get(report.endpoint);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setViewerData(data);
      } else if (data && data.rows) {
        setViewerData(data.rows);
      } else if (data && data.assets) {
        setViewerData(data.assets);
      } else {
        setViewerData([
          { code: 'AS-1001', name: 'Laptop Dell Latitude 5440', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 4,500' },
          { code: 'AS-1002', name: 'Samsung 27" Curved Monitor', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 1,200' },
          { code: 'AS-1003', name: 'HP Color LaserJet Pro', category: 'IT', location: 'Jebel Ali', status: 'ASSIGNED', cost: 'AED 2,800' }
        ]);
      }
    } catch (err) {
      setViewerData([
        { code: 'AS-1001', name: 'Laptop Dell Latitude 5440', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 4,500' },
        { code: 'AS-1002', name: 'Samsung 27" Curved Monitor', category: 'IT', location: 'Dubai HQ', status: 'IN_SERVICE', cost: 'AED 1,200' },
        { code: 'AS-1003', name: 'HP Color LaserJet Pro', category: 'IT', location: 'Jebel Ali', status: 'ASSIGNED', cost: 'AED 2,800' }
      ]);
    } finally {
      setViewerLoading(false);
    }
  };

  // Export File Generator Helper
  const handleExportCSV = (filename = 'Asset360_Report.csv', rows = []) => {
    const list = rows.length > 0 ? rows : viewerData;
    if (!list || list.length === 0) {
      setActionSuccessMsg('No records available to export.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      return;
    }
    const keys = Object.keys(list[0]);
    const csvContent = [
      keys.join(','),
      ...list.map(r => keys.map(k => `"${(r[k] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setActionSuccessMsg(`Downloaded ${filename} successfully.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-800">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Header & Navigation (Matching Screenshot 1)                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Breadcrumb matching Screenshot 1 */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <span className="text-slate-500">Reports & Analytics</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">
                  {viewMode === 'REPORT_VIEWER' ? selectedReportObj?.name : 'Dashboard'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Get insights from your asset data with real-time reports and analytics
              </p>
            </div>

            {/* Top Actions: AI Intelligence & + Create Report Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowAiModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="hidden md:inline">AI Analytics</span>
              </button>

              {/* "+ Create Report ∨" Action Button matching Screenshot 1 */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Report</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {showCreateDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs animate-fadeIn">
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowStandardReportModal(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Standard Report</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowCustomReportModal(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#6C2BD9]" />
                      <span>Custom Report</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowScheduleReportModal(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Schedule Report</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        handleExportCSV('Asset360_Executive_Report.csv');
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                      <span>Export Data</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Alert Banner */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 2. Report Category Navigation Cards (Matching Screenshot 1)         */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = filterCategory.toLowerCase().includes(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilterCategory(cat.name);
                  setViewMode('DASHBOARD');
                }}
                className={clsx(
                  'p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer bg-white',
                  isSelected
                    ? 'border-[#6C2BD9] shadow-md ring-2 ring-[#6C2BD9]/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                )}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: cat.bgColor, borderColor: cat.borderColor }}
                  >
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-snug">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {cat.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. Common Filter Bar & Advanced Trigger (Matching Screenshot 1 & 2)  */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
            {/* Report Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Report Category
              </label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Asset Reports">Asset Reports</option>
                  <option value="Maintenance Reports">Maintenance Reports</option>
                  <option value="Inventory Reports">Inventory Reports</option>
                  <option value="Financial Reports">Financial Reports</option>
                  <option value="Compliance Reports">Compliance Reports</option>
                  <option value="Custom Reports">Custom Reports</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Report Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Report Type
              </label>
              <div className="relative">
                <select
                  value={filterReportType}
                  onChange={(e) => setFilterReportType(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                >
                  <option value="All Types">All Types</option>
                  <option value="Assets by Location">Assets by Location</option>
                  <option value="Assets by Category">Assets by Category</option>
                  <option value="Maintenance Work Orders">Maintenance Work Orders</option>
                  <option value="Inventory Valuation">Inventory Valuation</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Date Range
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Location
              </label>
              <div className="relative">
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Jebel Ali">Jebel Ali</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Department
              </label>
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] cursor-pointer"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="IT Department">IT Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Facilities">Facilities</option>
                  <option value="HR">HR</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reset Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setFilterCategory('All Categories');
                  setFilterReportType('All Types');
                  setFilterDateRange('01 Jan 2025 - 31 Dec 2025');
                  setFilterLocation('All Locations');
                  setFilterDepartment('All Departments');
                }}
                className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-2xs"
              >
                Reset
              </button>
            </div>

            {/* Apply Filters & Advanced Trigger Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(true)}
                className="flex-1 py-2 px-3 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filters
              </button>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(true)}
                title="Advanced Filters"
                className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. 5 Management KPI Cards (Matching Screenshot 1)                   */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Total Assets */}
          <div
            onClick={() =>
              handleOpenDrillDown({
                title: 'Total Active Asset Portfolio',
                metricKey: 'totalAssets',
                filterType: 'all',
                filterValue: 'All Assets'
              })
            }
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Total Assets</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.totalAssets.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ {kpis.totalAssetsChange}%</span>
              <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
            </div>
          </div>

          {/* 2. Active Work Orders */}
          <div
            onClick={() =>
              handleOpenDrillDown({
                title: 'Active Work Orders',
                metricKey: 'activeWorkOrders',
                filterType: 'workOrders',
                filterValue: 'Open & In Progress'
              })
            }
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Active Work Orders</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.activeWorkOrders}
            </div>
            <div className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ {kpis.activeWorkOrdersChange}%</span>
              <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
            </div>
          </div>

          {/* 3. Assets by Location */}
          <div
            onClick={() =>
              handleOpenDrillDown({
                title: 'Assets Distributed Across 18 Operational Locations',
                metricKey: 'locationCount',
                filterType: 'location',
                filterValue: 'All Locations'
              })
            }
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Assets by Location</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.locationCount}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1 group-hover:underline">
              <span>View details →</span>
            </div>
          </div>

          {/* 4. Maintenance Cost */}
          <div
            onClick={() =>
              handleOpenDrillDown({
                title: 'Maintenance Cost Drivers & Work Orders',
                metricKey: 'maintenanceCost',
                filterType: 'cost',
                filterValue: 'High Cost'
              })
            }
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Maintenance Cost</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.maintenanceCostFormatted || 'AED 1.2M'}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>↓ {kpis.maintenanceCostChange}%</span>
              <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
            </div>
          </div>

          {/* 5. Compliance Rate */}
          <div
            onClick={() =>
              handleOpenDrillDown({
                title: 'Asset Audit Compliance Portfolio (98%)',
                metricKey: 'complianceRate',
                filterType: 'compliance',
                filterValue: 'Compliant'
              })
            }
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#6C2BD9] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Compliance Rate</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.complianceRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ {kpis.complianceRateChange}%</span>
              <span className="text-slate-400 font-normal ml-0.5">{kpis.periodText}</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. Middle Analytical Section (3 Interactive Charts from Screenshot 1)*/}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Assets by Category Donut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <h3 className="text-sm font-black text-slate-900">Assets by Category</h3>
                <button
                  onClick={() =>
                    handleLaunchReport(
                      CORE_PREDEFINED_REPORTS.find(r => r.id === 'asset-register')
                    )
                  }
                  className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Report →
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                {/* SVG Donut Chart */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6C2BD9" strokeWidth="15" strokeDasharray="62.1 238.8" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#60A5FA" strokeWidth="15" strokeDasharray="40.6 238.8" strokeDashoffset="-62.1" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray="35.8 238.8" strokeDashoffset="-102.7" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="28.7 238.8" strokeDashoffset="-138.5" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="15" strokeDasharray="23.9 238.8" strokeDashoffset="-167.2" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#5B21B6" strokeWidth="15" strokeDasharray="19.1 238.8" strokeDashoffset="-191.1" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="15" strokeDasharray="28.6 238.8" strokeDashoffset="-210.2" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-base font-black text-slate-900 leading-none">12,486</span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Assets</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 space-y-1.5 text-xs w-full">
                  {categoryChartData.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleOpenDrillDown({
                          title: `Category Drill-Down: ${item.name}`,
                          metricKey: 'category',
                          filterType: 'category',
                          filterValue: item.name
                        })
                      }
                      className="flex items-center justify-between py-0.5 hover:bg-slate-50 px-1 rounded cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-[11px] font-medium text-slate-600 group-hover:text-[#6C2BD9] truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 text-[11px] shrink-0 ml-1">
                        {item.count.toLocaleString()} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Assets by Location Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <h3 className="text-sm font-black text-slate-900">Assets by Location</h3>
                <button
                  onClick={() =>
                    handleLaunchReport(
                      CORE_PREDEFINED_REPORTS.find(r => r.id === 'location-distribution')
                    )
                  }
                  className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Report →
                </button>
              </div>

              <div className="h-[200px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationChartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 4000]} />
                    <Tooltip
                      formatter={(val) => [val.toLocaleString() + ' assets', 'Count']}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      onClick={(entry) =>
                        handleOpenDrillDown({
                          title: `Location Assets: ${entry.location}`,
                          metricKey: 'location',
                          filterType: 'location',
                          filterValue: entry.location
                        })
                      }
                      className="cursor-pointer"
                    >
                      {locationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#6C2BD9'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Asset Status Donut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <h3 className="text-sm font-black text-slate-900">Asset Status</h3>
                <button
                  onClick={() =>
                    handleLaunchReport(
                      CORE_PREDEFINED_REPORTS.find(r => r.id === 'asset-register')
                    )
                  }
                  className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Report →
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                {/* SVG Donut Chart */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="15" strokeDasharray="195.8 238.8" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray="16.7 238.8" strokeDashoffset="-195.8" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="15" strokeDasharray="9.5 238.8" strokeDashoffset="-212.5" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="7.2 238.8" strokeDashoffset="-222.0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="15" strokeDasharray="9.6 238.8" strokeDashoffset="-229.2" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-base font-black text-slate-900 leading-none">12,486</span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Assets</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 space-y-1.5 text-xs w-full">
                  {statusChartData.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleOpenDrillDown({
                          title: `Status Filter: ${item.status}`,
                          metricKey: 'status',
                          filterType: 'status',
                          filterValue: item.status
                        })
                      }
                      className="flex items-center justify-between py-0.5 hover:bg-slate-50 px-1 rounded cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-[11px] font-medium text-slate-600 group-hover:text-[#6C2BD9] truncate">
                          {item.status}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 text-[11px] shrink-0 ml-1">
                        {item.count.toLocaleString()} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 6. Bottom Grids: Recent Reports & Scheduled Reports (Screenshot 1)  */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Grid: Recent Reports (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Recent Reports</h3>
                <button
                  onClick={() => setShowStandardReportModal(true)}
                  className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Reports →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Report Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Date Generated</th>
                      <th className="py-3 px-3">Generated By</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {recentReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-[#6C2BD9]" />
                          <span>{rep.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {rep.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {rep.dateGenerated}
                        </td>
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {rep.generatedBy}
                        </td>
                        <td className="py-3 px-3">
                          <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold', rep.format === 'PDF' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                            {rep.format}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                const found = CORE_PREDEFINED_REPORTS.find(c => c.name.toLowerCase().includes(rep.name.toLowerCase().split(' ')[0]));
                                handleLaunchReport(found || CORE_PREDEFINED_REPORTS[0]);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 cursor-pointer"
                              title="View Report"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExportCSV(`${rep.name.replace(/\s+/g, '_')}.csv`)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              title="Download Report"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionSuccessMsg(`Regenerating report ${rep.name}...`);
                                setTimeout(() => setActionSuccessMsg(null), 3000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Grid: Scheduled Reports (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Scheduled Reports</h3>
                <button
                  onClick={() => setShowScheduleReportModal(true)}
                  className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Report Name</th>
                      <th className="py-3 px-3">Frequency</th>
                      <th className="py-3 px-3">Next Run</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scheduledReports.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {sch.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {sch.frequency}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {sch.nextRun}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={clsx('text-[11px] font-bold', sch.status === 'Active' ? 'text-emerald-700' : 'text-slate-400')}>
                              {sch.status}
                            </span>
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleSchedule(sch.id)}
                              className={clsx(
                                'relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                                sch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                              )}
                            >
                              <span
                                className={clsx(
                                  'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                                  sch.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setShowScheduleReportModal(true)}
                              className="p-1 rounded text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 cursor-pointer"
                              title="Edit Schedule"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionSuccessMsg(`Schedule ${sch.name} triggered immediately.`);
                                setTimeout(() => setActionSuccessMsg(null), 3000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              title="Run Now"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionSuccessMsg(`Options for ${sch.name}`);
                                setTimeout(() => setActionSuccessMsg(null), 3000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 7. ADVANCED FILTERS MODAL (Matching Screenshot 2 Pixel-Perfect)     */}
      {/* ------------------------------------------------------------------- */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-black">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Advanced Filters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Refine your report data using one or more filters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 15 Fields Grid matching Screenshot 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Row 1 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Report Category</label>
                <select
                  value={advFilters.reportCategory}
                  onChange={(e) => setAdvFilters({ ...advFilters, reportCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Asset Reports">Asset Reports</option>
                  <option value="Maintenance Reports">Maintenance Reports</option>
                  <option value="Inventory Reports">Inventory Reports</option>
                  <option value="Financial Reports">Financial Reports</option>
                  <option value="Compliance Reports">Compliance Reports</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Report Type</label>
                <select
                  value={advFilters.reportType}
                  onChange={(e) => setAdvFilters({ ...advFilters, reportType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Assets by Location">Assets by Location</option>
                  <option value="Assets by Category">Assets by Category</option>
                  <option value="Depreciation Schedule">Depreciation Schedule</option>
                  <option value="Maintenance History">Maintenance History</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Date Range</label>
                <div className="relative">
                  <select
                    value={advFilters.dateRange}
                    onChange={(e) => setAdvFilters({ ...advFilters, dateRange: e.target.value })}
                    className="w-full p-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none"
                  >
                    <option value="This Year (Jan 2025 - Dec 2025)">This Year (Jan 2025 - Dec 2025)</option>
                    <option value="Last 12 Months">Last 12 Months</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Custom Range">Custom Range</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Company</label>
                <select
                  value={advFilters.company}
                  onChange={(e) => setAdvFilters({ ...advFilters, company: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Companies">All Companies</option>
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                  <option value="Singapore Operations">Singapore Operations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Location</label>
                <select
                  value={advFilters.location}
                  onChange={(e) => setAdvFilters({ ...advFilters, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Jebel Ali">Jebel Ali</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Department</label>
                <select
                  value={advFilters.department}
                  onChange={(e) => setAdvFilters({ ...advFilters, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="IT Department">IT Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Facilities">Facilities</option>
                </select>
              </div>

              {/* Row 3 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Cost Center</label>
                <select
                  value={advFilters.costCenter}
                  onChange={(e) => setAdvFilters({ ...advFilters, costCenter: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Cost Centers">All Cost Centers</option>
                  <option value="CC-IT-01">CC-IT-01 (IT Infrastructure)</option>
                  <option value="CC-OPS-02">CC-OPS-02 (Operations)</option>
                  <option value="CC-FIN-03">CC-FIN-03 (Finance & Admin)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Asset Class</label>
                <select
                  value={advFilters.assetClass}
                  onChange={(e) => setAdvFilters({ ...advFilters, assetClass: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Classes">All Classes</option>
                  <option value="Tangible Fixed Assets">Tangible Fixed Assets</option>
                  <option value="Capital IT Hardware">Capital IT Hardware</option>
                  <option value="Rolling Stock Fleet">Rolling Stock Fleet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Supplier</label>
                <select
                  value={advFilters.supplier}
                  onChange={(e) => setAdvFilters({ ...advFilters, supplier: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Suppliers">All Suppliers</option>
                  <option value="Dell Technologies">Dell Technologies</option>
                  <option value="Samsung Enterprise">Samsung Enterprise</option>
                  <option value="Cisco Systems">Cisco Systems</option>
                  <option value="Caterpillar Heavy Equip">Caterpillar Heavy Equip</option>
                </select>
              </div>

              {/* Row 4 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Asset Group</label>
                <select
                  value={advFilters.assetGroup}
                  onChange={(e) => setAdvFilters({ ...advFilters, assetGroup: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Asset Groups">All Asset Groups</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Machinery & Plant">Machinery & Plant</option>
                  <option value="Office Furnishings">Office Furnishings</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Asset Category</label>
                <select
                  value={advFilters.assetCategory}
                  onChange={(e) => setAdvFilters({ ...advFilters, assetCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Laptops & Workstations">Laptops & Workstations</option>
                  <option value="Monitors & Displays">Monitors & Displays</option>
                  <option value="Printers & Scanners">Printers & Scanners</option>
                  <option value="Generators & Power">Generators & Power</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Asset Sub Category</label>
                <select
                  value={advFilters.assetSubCategory}
                  onChange={(e) => setAdvFilters({ ...advFilters, assetSubCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="All Sub Categories">All Sub Categories</option>
                  <option value="Executive Laptops">Executive Laptops</option>
                  <option value="Rackmount Servers">Rackmount Servers</option>
                  <option value="Ergonomic Chairs">Ergonomic Chairs</option>
                </select>
              </div>

              {/* Row 5 */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Acquisition Date</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={advFilters.acqFromDate}
                    onChange={(e) => setAdvFilters({ ...advFilters, acqFromDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-slate-400">→</span>
                  <input
                    type="date"
                    value={advFilters.acqToDate}
                    onChange={(e) => setAdvFilters({ ...advFilters, acqToDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Asset Status Multi-Pills Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Asset Status</label>
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1 items-center min-h-[38px]">
                  {advFilters.assetStatus.map((st) => (
                    <span
                      key={st}
                      className="bg-purple-100 text-[#6C2BD9] px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      {st}
                      <button
                        type="button"
                        onClick={() =>
                          setAdvFilters({
                            ...advFilters,
                            assetStatus: advFilters.assetStatus.filter(s => s !== st)
                          })
                        }
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (!advFilters.assetStatus.includes('Retired')) {
                        setAdvFilters({
                          ...advFilters,
                          assetStatus: [...advFilters.assetStatus, 'Retired']
                        });
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 px-1 font-semibold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Tags Search */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tags</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select tags..."
                    value={advFilters.tags}
                    onChange={(e) => setAdvFilters({ ...advFilters, tags: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Footer matching Screenshot 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() =>
                  setAdvFilters({
                    reportCategory: 'Asset Reports',
                    reportType: 'Assets by Location',
                    dateRange: 'This Year (Jan 2025 - Dec 2025)',
                    company: 'All Companies',
                    location: 'All Locations',
                    department: 'All Departments',
                    costCenter: 'All Cost Centers',
                    assetClass: 'All Classes',
                    supplier: 'All Suppliers',
                    assetGroup: 'All Asset Groups',
                    assetCategory: 'All Categories',
                    assetSubCategory: 'All Sub Categories',
                    acqFromDate: '',
                    acqToDate: '',
                    assetStatus: ['Active', 'In Maintenance'],
                    tags: ''
                  })
                }
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(false);
                    fetchDashboard();
                    setActionSuccessMsg('Advanced filters applied.');
                    setTimeout(() => setActionSuccessMsg(null), 3000);
                  }}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" /> Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. INTERACTIVE DRILL-DOWN MODAL                                     */}
      {/* ------------------------------------------------------------------- */}
      {drillDownModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{drillDownModal.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Displaying records directly contributing to the selected KPI or chart slice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrillDownModal({ ...drillDownModal, open: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {drillDownModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
                  <span>Loading contributing transactional records...</span>
                </div>
              ) : drillDownModal.records.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No specific records found for this filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b">
                    <tr>
                      <th className="py-2.5 px-3">Asset Number</th>
                      <th className="py-2.5 px-3">Asset Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Custodian</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Value / Cost</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {drillDownModal.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">
                          {r.assetNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                        <td className="py-2.5 px-3">{r.category}</td>
                        <td className="py-2.5 px-3">{r.location}</td>
                        <td className="py-2.5 px-3">{r.custodian}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded text-[10px] font-bold',
                              r.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : r.status === 'In Maintenance'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{r.cost || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => navigate(`/assets/${r.assetNumber}`)}
                            className="p-1 text-slate-400 hover:text-[#6C2BD9]"
                            title="View in Asset 360"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs shrink-0">
              <span className="text-slate-400 text-[11px]">
                Showing {drillDownModal.records.length} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleExportCSV(
                      `${drillDownModal.metricKey || 'DrillDown'}_Records.csv`,
                      drillDownModal.records
                    )
                  }
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Export Records
                </button>
                <button
                  onClick={() => setDrillDownModal({ ...drillDownModal, open: false })}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* ADVANCED FILTERS MODAL (Matching Image 1)                            */}
      {/* ------------------------------------------------------------------- */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200 shrink-0">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Advanced Filters</h3>
                  <p className="text-xs text-slate-500 font-medium">Refine your report data using one or more filters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 3-Column Grid matching Screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Report Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Category</label>
                <div className="relative">
                  <select
                    value={advFilters.reportCategory}
                    onChange={(e) => setAdvFilters({ ...advFilters, reportCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="Asset Reports">Asset Reports</option>
                    <option value="Maintenance Reports">Maintenance Reports</option>
                    <option value="Inventory Reports">Inventory Reports</option>
                    <option value="Financial Reports">Financial Reports</option>
                    <option value="Compliance Reports">Compliance Reports</option>
                    <option value="Custom Reports">Custom Reports</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Report Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Type</label>
                <div className="relative">
                  <select
                    value={advFilters.reportType}
                    onChange={(e) => setAdvFilters({ ...advFilters, reportType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="Assets by Location">Assets by Location</option>
                    <option value="Assets by Category">Assets by Category</option>
                    <option value="Maintenance Work Orders">Maintenance Work Orders</option>
                    <option value="Inventory Valuation">Inventory Valuation</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Date Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date Range</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C2BD9] pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <select
                    value={advFilters.dateRange}
                    onChange={(e) => setAdvFilters({ ...advFilters, dateRange: e.target.value })}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="This Year (Jan 2025 - Dec 2025)">This Year (Jan 2025 - Dec 2025)</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Custom Range">Custom Range</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 4. Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                <div className="relative">
                  <select
                    value={advFilters.company}
                    onChange={(e) => setAdvFilters({ ...advFilters, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Companies">All Companies</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="Infotatwaa Solutions">Infotatwaa Solutions</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <div className="relative">
                  <select
                    value={advFilters.location}
                    onChange={(e) => setAdvFilters({ ...advFilters, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali">Jebel Ali</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 6. Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <select
                    value={advFilters.department}
                    onChange={(e) => setAdvFilters({ ...advFilters, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="IT Department">IT Department</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 7. Cost Center */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cost Center</label>
                <div className="relative">
                  <select
                    value={advFilters.costCenter}
                    onChange={(e) => setAdvFilters({ ...advFilters, costCenter: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Cost Centers">All Cost Centers</option>
                    <option value="CC-101 IT">CC-101 IT</option>
                    <option value="CC-102 Operations">CC-102 Operations</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 8. Asset Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Class</label>
                <div className="relative">
                  <select
                    value={advFilters.assetClass}
                    onChange={(e) => setAdvFilters({ ...advFilters, assetClass: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Classes">All Classes</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 9. Supplier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier</label>
                <div className="relative">
                  <select
                    value={advFilters.supplier}
                    onChange={(e) => setAdvFilters({ ...advFilters, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Suppliers">All Suppliers</option>
                    <option value="Zebra Technologies">Zebra Technologies</option>
                    <option value="Honeywell">Honeywell</option>
                    <option value="Brady Corporation">Brady Corporation</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 10. Asset Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Group</label>
                <div className="relative">
                  <select
                    value={advFilters.assetGroup}
                    onChange={(e) => setAdvFilters({ ...advFilters, assetGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Asset Groups">All Asset Groups</option>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Enterprise Mobility">Enterprise Mobility</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 11. Asset Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Category</label>
                <div className="relative">
                  <select
                    value={advFilters.assetCategory}
                    onChange={(e) => setAdvFilters({ ...advFilters, assetCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 12. Asset Sub Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Sub Category</label>
                <div className="relative">
                  <select
                    value={advFilters.assetSubCategory}
                    onChange={(e) => setAdvFilters({ ...advFilters, assetSubCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="All Sub Categories">All Sub Categories</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Scanners">Scanners</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 13. Acquisition Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acquisition Date</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="From Date"
                      value={advFilters.acqFromDate}
                      onChange={(e) => setAdvFilters({ ...advFilters, acqFromDate: e.target.value })}
                      className="w-full pl-8 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:outline-hidden"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">→</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="To Date"
                      value={advFilters.acqToDate}
                      onChange={(e) => setAdvFilters({ ...advFilters, acqToDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 14. Asset Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Status</label>
                <div className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between min-h-[38px]">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {advFilters.assetStatus.map((st) => (
                      <span
                        key={st}
                        className="px-2 py-0.5 rounded-lg bg-purple-50 text-[#6C2BD9] font-bold text-[11px] flex items-center gap-1 border border-purple-200"
                      >
                        {st}
                        <button
                          type="button"
                          onClick={() =>
                            setAdvFilters({
                              ...advFilters,
                              assetStatus: advFilters.assetStatus.filter((item) => item !== st)
                            })
                          }
                          className="hover:text-purple-900 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0" />
                </div>
              </div>

              {/* 15. Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select tags..."
                    value={advFilters.tags}
                    onChange={(e) => setAdvFilters({ ...advFilters, tags: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#6C2BD9] focus:outline-hidden"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Footer matching Screenshot 1 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setAdvFilters({
                    reportCategory: 'Asset Reports',
                    reportType: 'Assets by Location',
                    dateRange: 'This Year (Jan 2025 - Dec 2025)',
                    company: 'All Companies',
                    location: 'All Locations',
                    department: 'All Departments',
                    costCenter: 'All Cost Centers',
                    assetClass: 'All Classes',
                    supplier: 'All Suppliers',
                    assetGroup: 'All Asset Groups',
                    assetCategory: 'All Categories',
                    assetSubCategory: 'All Sub Categories',
                    acqFromDate: '',
                    acqToDate: '',
                    assetStatus: ['Active', 'In Maintenance'],
                    tags: ''
                  })
                }
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory(advFilters.reportCategory);
                    setFilterReportType(advFilters.reportType);
                    setFilterDateRange(advFilters.dateRange);
                    setFilterLocation(advFilters.location);
                    setFilterDepartment(advFilters.department);
                    fetchDashboard();
                    setShowAdvancedFilters(false);
                    setActionSuccessMsg('Advanced filters applied successfully.');
                    setTimeout(() => setActionSuccessMsg(null), 3000);
                  }}
                  className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. AI ANALYTICS INTELLIGENCE MODAL                                  */}
      {/* ------------------------------------------------------------------- */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Asset360 AI Analytics Intelligence</h3>
                  <p className="text-[11px] text-slate-400">Ask questions in natural language and get record-backed insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-400 py-1 mr-1 font-semibold">Try asking:</span>
              {[
                'Top 10 highest maintenance cost assets this year',
                'Which locations have the most audit exceptions?',
                'Show spare parts likely to fall below reorder level'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(prompt);
                    handleRunAiQuery(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] transition-colors border border-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Query Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask any question about your asset portfolio, work orders, or costs..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAiQuery();
                }}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
              />
              <button
                onClick={() => handleRunAiQuery()}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-5 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze</span>
              </button>
            </div>

            {/* AI Result Card */}
            {aiResult && (
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                  <span className="font-bold text-slate-900">{aiResult.title}</span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 font-semibold px-2 py-0.5 rounded">
                    Verified Transactional Records
                  </span>
                </div>

                <div className="space-y-1">
                  {aiResult.insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                      <span className="text-[#7C3AED] font-bold">•</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>

                {/* Supporting Records Table */}
                {aiResult.supportingRecords && aiResult.supportingRecords.length > 0 && (
                  <div className="pt-2 border-t border-purple-200/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Supporting Asset Evidence
                    </span>
                    <div className="bg-white rounded-lg border border-purple-100 overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="p-2">Code / Part</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Key Metric</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {aiResult.supportingRecords.map((rec, i) => (
                            <tr key={i}>
                              <td className="p-2 font-mono font-bold text-[#7C3AED]">{rec.assetNumber || rec.partNumber || rec.location}</td>
                              <td className="p-2 font-medium text-slate-800">{rec.name || rec.type || '-'}</td>
                              <td className="p-2 text-slate-500">{rec.category || rec.rate || '-'}</td>
                              <td className="p-2 font-bold text-slate-900">{rec.maintenanceCost || rec.currentStock || rec.exceptions || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. CREATE REPORT MODALS (Standard, Custom, Schedule)               */}
      {/* ------------------------------------------------------------------- */}
      {showStandardReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Standard Reports Directory</h3>
              <button onClick={() => setShowStandardReportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {CORE_PREDEFINED_REPORTS.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#6C2BD9] bg-slate-50/50 flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#6C2BD9] uppercase">{rep.category}</span>
                    <h4 className="font-bold text-slate-900 group-hover:text-[#6C2BD9] transition-colors">{rep.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{rep.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowStandardReportModal(false);
                      handleLaunchReport(rep);
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#6C2BD9] text-white text-[11px] font-bold hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Builder Modal */}
      {showCustomReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Custom Report Builder</h3>
                <p className="text-[11px] text-slate-500">Configure datasets, columns, groupings, and exports</p>
              </div>
              <button onClick={() => setShowCustomReportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Select Reporting Domain</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                  <option value="ASSETS">Asset Register & Hardware Specifications</option>
                  <option value="MAINTENANCE">Maintenance Work Orders & Service Costs</option>
                  <option value="INVENTORY">Inventory Stock & Spare Part Consumption</option>
                  <option value="AUDIT">Audit Physical Observations & Exceptions</option>
                  <option value="FINANCE">Financial Depreciation & Book Values</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">2. Choose Output Columns</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {['Asset Tag', 'Asset Name', 'Category', 'Location', 'Custodian', 'Cost / Value', 'Purchase Date', 'Vendor', 'Condition'].map((col, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input type="checkbox" defaultChecked={i < 5} className="rounded text-[#6C2BD9]" />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">3. Grouping / Summary</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    <option value="NONE">No Grouping (Flat Records)</option>
                    <option value="LOCATION">Group by Location</option>
                    <option value="CATEGORY">Group by Category</option>
                    <option value="DEPARTMENT">Group by Department</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">4. Format</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    <option value="CSV">CSV / Excel Format</option>
                    <option value="PDF">PDF Presentation Document</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCustomReportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCustomReportModal(false);
                  handleExportCSV('Custom_Asset360_Report.csv');
                }}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Schedule Automatic Report</h3>
                <p className="text-[11px] text-slate-500">Configure recurring report generation and delivery</p>
              </div>
              <button onClick={() => setShowScheduleReportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Schedule Name</label>
                <input
                  type="text"
                  defaultValue="Executive Monthly Asset Health"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    <option value="Weekly">Weekly (Every Monday)</option>
                    <option value="Monthly">Monthly (1st of Month)</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Format</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                    <option value="PDF">PDF Summary</option>
                    <option value="Excel">Excel / CSV Workbook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Distribution List</label>
                <input
                  type="text"
                  defaultValue="director@asset360.com, audit@asset360.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowScheduleReportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowScheduleReportModal(false);
                  setActionSuccessMsg('Automatic report schedule activated successfully.');
                  setTimeout(() => setActionSuccessMsg(null), 3000);
                }}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" /> Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 11. DEDICATED REPORT VIEWER (When viewing a specific report)         */}
      {/* ------------------------------------------------------------------- */}
      {viewMode === 'REPORT_VIEWER' && selectedReportObj && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('DASHBOARD')}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-[#6C2BD9] uppercase">
                  {selectedReportObj.category} Report View
                </span>
                <h2 className="text-lg font-black text-slate-900">{selectedReportObj.name}</h2>
                <p className="text-xs text-slate-500">{selectedReportObj.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(`${selectedReportObj.id}_Export.csv`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Search bar inside Report Viewer */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter current report rows..."
                value={viewerSearch}
                onChange={(e) => setViewerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {viewerData.length} records in this generated snapshot
            </span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {viewerLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
                <span>Generating live report dataset...</span>
              </div>
            ) : viewerData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No records found for current parameters.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
                  <tr>
                    {Object.keys(viewerData[0]).slice(0, 7).map((key) => (
                      <th key={key} className="py-3 px-3">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {viewerData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      {Object.keys(viewerData[0]).slice(0, 7).map((key) => (
                        <td key={key} className="py-2.5 px-3">
                          {typeof row[key] === 'object'
                            ? JSON.stringify(row[key])
                            : (row[key] || '-').toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsCatalogue;
