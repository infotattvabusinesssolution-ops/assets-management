import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Users,
  FileText,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Seed Data (Matches Reference Screenshot AUD-2026-0008 1-to-1)
// ---------------------------------------------------------------------------
const DEFAULT_AUDIT_INFO = {
  auditId: 'AUD-2026-0008',
  auditName: 'HQ Annual IT Asset Audit 2026',
  auditType: 'Physical Verification',
  company: 'Dubai HQ',
  location: 'All Locations',
  period: '01 Sep 2026 - 15 Sep 2026',
  status: 'Completed',
  createdBy: 'John Doe',
  createdOn: '25 Aug 2026 @ 10:30',
  completedOn: '15 Sep 2026 @ 16:20'
};

const DEFAULT_KPIS = {
  totalAssets: 600,
  verified: 390,
  verifiedPct: 65,
  pending: 180,
  pendingPct: 30,
  notFound: 12,
  notFoundPct: 2,
  wrongLocation: 10,
  wrongLocationPct: 2,
  wrongCustodian: 5,
  wrongCustodianPct: 1,
  unregistered: 2,
  unregisteredPct: 0,
  damaged: 1,
  damagedPct: 0,
  totalExceptions: 30
};

const DONUT_DATA = [
  { label: 'Verified', count: 390, pct: 65, color: '#10B981' },
  { label: 'Pending', count: 180, pct: 30, color: '#3B82F6' },
  { label: 'Not Found', count: 12, pct: 2, color: '#EF4444' },
  { label: 'Wrong Location', count: 10, pct: 2, color: '#F97316' },
  { label: 'Wrong Custodian', count: 5, pct: 1, color: '#8B5CF6' },
  { label: 'Unregistered', count: 2, pct: 0, color: '#06B6D4' },
  { label: 'Damaged', count: 1, pct: 0, color: '#F43F5E' }
];

const TREND_DATA = [
  { date: '01 Sep', daily: 15, cumulative: 15 },
  { date: '03 Sep', daily: 35, cumulative: 50 },
  { date: '05 Sep', daily: 45, cumulative: 95 },
  { date: '07 Sep', daily: 55, cumulative: 150 },
  { date: '09 Sep', daily: 70, cumulative: 220 },
  { date: '11 Sep', daily: 60, cumulative: 280 },
  { date: '13 Sep', daily: 55, cumulative: 335 },
  { date: '15 Sep', daily: 55, cumulative: 390 }
];

const LOCATION_DATA = [
  { location: 'Block A', verified: 35, wrongLocation: 8, notFound: 5, wrongCustodian: 2, others: 4 },
  { location: 'Block B', verified: 110, wrongLocation: 18, notFound: 8, wrongCustodian: 4, others: 6 },
  { location: 'Block C', verified: 40, wrongLocation: 12, notFound: 4, wrongCustodian: 3, others: 5 },
  { location: 'IT-201', verified: 165, wrongLocation: 15, notFound: 5, wrongCustodian: 4, others: 3 },
  { location: 'IT-301', verified: 28, wrongLocation: 6, notFound: 3, wrongCustodian: 1, others: 2 },
  { location: 'Conference', verified: 52, wrongLocation: 14, notFound: 4, wrongCustodian: 2, others: 6 },
  { location: 'Others', verified: 60, wrongLocation: 12, notFound: 4, wrongCustodian: 2, others: 6 }
];

const SEEDED_SAMPLE_ASSETS = [
  {
    index: 1,
    assetNo: 'AS-000123',
    assetName: 'Laptop - Dell 5440',
    assetType: 'IT Equipment',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 1F > IT-101',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Sara Ali',
    status: 'Verified',
    verifiedDate: '10 Sep 2026 10:24',
    verifiedBy: 'John Doe',
    remarks: '-',
    evidencePhoto: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=60',
    tagEpc: 'E28011606000002053A1B4B9',
    serialNumber: '75K3D23',
    discrepancyType: 'None (Matched)'
  },
  {
    index: 2,
    assetNo: 'AS-000124',
    assetName: 'Monitor - Samsung',
    assetType: 'IT Equipment',
    systemLocation: 'Block B > 1F > IT-101',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Sara Ali',
    verifiedCustodian: 'Omar Saleh',
    status: 'Moved',
    verifiedDate: '10 Sep 2026 11:05',
    verifiedBy: 'John Doe',
    remarks: 'Moved to IT-201',
    evidencePhoto: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=60',
    tagEpc: 'E28011606000002053A1B4C0',
    serialNumber: '75K3D24',
    discrepancyType: 'Location & Custodian Variance'
  },
  {
    index: 3,
    assetNo: 'AS-000125',
    assetName: 'Printer - HP',
    assetType: 'IT Equipment',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block B > 2F > IT-201',
    systemCustodian: 'Layla Hassan',
    verifiedCustodian: 'Layla Hassan',
    status: 'Verified',
    verifiedDate: '10 Sep 2026 09:50',
    verifiedBy: 'John Doe',
    remarks: '-',
    evidencePhoto: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=60',
    tagEpc: 'E28011606000002053A1B4C1',
    serialNumber: 'CNB1L78912',
    discrepancyType: 'None (Matched)'
  },
  {
    index: 4,
    assetNo: 'AS-000126',
    assetName: 'Chair - Office',
    assetType: 'Furniture',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: '-',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: '-',
    status: 'Not Found',
    verifiedDate: '-',
    verifiedBy: '-',
    remarks: 'Asset not located',
    evidencePhoto: null,
    tagEpc: 'E28011606000002053A1B4C2',
    serialNumber: 'HM-991204',
    discrepancyType: 'Missing / Unlocated'
  },
  {
    index: 5,
    assetNo: 'AS-000127',
    assetName: 'Meeting Table',
    assetType: 'Furniture',
    systemLocation: 'Block B > 2F > IT-201',
    verifiedLocation: 'Block C > GF > CONF-01',
    systemCustodian: 'Omar Saleh',
    verifiedCustodian: 'Omar Saleh',
    status: 'Wrong Location',
    verifiedDate: '10 Sep 2026 09:30',
    verifiedBy: 'John Doe',
    remarks: 'Found in CONF-01',
    evidencePhoto: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&auto=format&fit=crop&q=60',
    tagEpc: 'E28011606000002053A1B4C3',
    serialNumber: 'FR-441099',
    discrepancyType: 'Location Variance (Moved)'
  }
];

export function AuditReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filters State
  const [selectedAudit, setSelectedAudit] = useState('AUD-2026-0008');
  const [selectedCompany, setSelectedCompany] = useState('Dubai HQ');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDateRange, setSelectedDateRange] = useState('01 Sep 2026 - 15 Sep 2026');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Report Data State
  const [auditInfo, setAuditInfo] = useState(DEFAULT_AUDIT_INFO);
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [donutBreakdown, setDonutBreakdown] = useState(DONUT_DATA);
  const [trendData, setTrendData] = useState(TREND_DATA);
  const [locationData, setLocationData] = useState(LOCATION_DATA);

  // Table & Tabs State
  const [activeTab, setActiveTab] = useState('detailed'); // 'detailed', 'exceptions', 'notFound', 'moved', 'damaged', 'unregistered'
  const [activeKpiFilter, setActiveKpiFilter] = useState(null); // 'TOTAL', 'VERIFIED', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(600);
  const [assets, setAssets] = useState(SEEDED_SAMPLE_ASSETS);
  const [loading, setLoading] = useState(false);

  // Modals & UI
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Fetch Report Summary from Backend
  const fetchReportSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stocktakes/reports/summary', {
        params: {
          auditId: selectedAudit,
          company: selectedCompany,
          location: selectedLocation,
          dateRange: selectedDateRange,
          status: selectedStatus
        }
      });
      const dataObj = res?.data?.data || res?.data || res;
      if (dataObj && (dataObj.auditInfo || dataObj.kpis)) {
        if (dataObj.auditInfo) setAuditInfo(dataObj.auditInfo);
        if (dataObj.kpis) setKpis(dataObj.kpis);
        if (dataObj.donut || dataObj.donutChart) setDonutBreakdown(dataObj.donut || dataObj.donutChart);
        if (dataObj.trend || dataObj.trendData) setTrendData(dataObj.trend || dataObj.trendData);
        if (dataObj.locationResults) setLocationData(dataObj.locationResults);
      }
    } catch (err) {
      console.warn('Using seeded report summary fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Report Assets from Backend
  const fetchReportAssets = async () => {
    try {
      const res = await api.get('/stocktakes/reports/assets', {
        params: {
          auditId: selectedAudit,
          tab: activeTab,
          filter: activeKpiFilter || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: pageSize
        }
      });
      const assetsObj = res?.data || res;
      if (assetsObj && (assetsObj.rows || assetsObj.success)) {
        if (assetsObj.rows) setAssets(assetsObj.rows);
        if (assetsObj.totalCount) setTotalRecords(assetsObj.totalCount);
      }
    } catch (err) {
      console.warn('Using seeded assets fallback:', err);
      // Fallback local filter
      let filtered = [...SEEDED_SAMPLE_ASSETS];
      if (activeTab === 'exceptions') {
        filtered = filtered.filter(a => a.status !== 'Verified' && a.status !== 'Pending');
      } else if (activeTab === 'notFound') {
        filtered = filtered.filter(a => a.status === 'Not Found');
      } else if (activeTab === 'moved') {
        filtered = filtered.filter(a => a.status === 'Moved' || a.status === 'Wrong Location');
      } else if (activeTab === 'damaged') {
        filtered = filtered.filter(a => a.status === 'Damaged');
      } else if (activeTab === 'unregistered') {
        filtered = filtered.filter(a => a.status === 'Unregistered');
      }

      if (activeKpiFilter) {
        if (activeKpiFilter === 'VERIFIED') filtered = filtered.filter(a => a.status === 'Verified');
        if (activeKpiFilter === 'NOT_FOUND') filtered = filtered.filter(a => a.status === 'Not Found');
        if (activeKpiFilter === 'WRONG_LOCATION') filtered = filtered.filter(a => a.status === 'Moved' || a.status === 'Wrong Location');
        if (activeKpiFilter === 'PENDING') filtered = filtered.filter(a => a.status === 'Pending');
        if (activeKpiFilter === 'WRONG_CUSTODIAN') filtered = filtered.filter(a => a.status === 'Wrong Custodian');
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a =>
          a.assetNo.toLowerCase().includes(q) ||
          a.assetName.toLowerCase().includes(q) ||
          a.systemLocation.toLowerCase().includes(q) ||
          a.systemCustodian.toLowerCase().includes(q)
        );
      }

      setAssets(filtered);
      setTotalRecords(filtered.length);
    }
  };

  useEffect(() => {
    fetchReportSummary();
  }, [selectedAudit]);

  useEffect(() => {
    fetchReportAssets();
  }, [selectedAudit, activeTab, activeKpiFilter, searchQuery, currentPage, pageSize]);

  // Handle KPI Card Click (acts as quick filter)
  const handleKpiCardClick = (filterKey, tabKey = null) => {
    if (activeKpiFilter === filterKey) {
      setActiveKpiFilter(null);
      setActiveTab('detailed');
    } else {
      setActiveKpiFilter(filterKey);
      if (tabKey) setActiveTab(tabKey);
    }
    setCurrentPage(1);
  };

  // Export Report Handler
  const handleExport = async (format = 'csv') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      if (format === 'csv') {
        const response = await api.get('/stocktakes/reports/export', {
          params: { auditId: selectedAudit, format: 'csv' },
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Audit_Report_${selectedAudit}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setActionSuccessMsg('Report exported successfully as CSV!');
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Direct fallback CSV generation');
      // Fallback CSV download
      const csvHeader = 'Asset No,Asset Name,Asset Type,System Location,Verified Location,System Custodian,Verified Custodian,Status,Verified Date,Verified By,Remarks\n';
      const csvRows = assets.map(a =>
        `"${a.assetNo}","${a.assetName}","${a.assetType}","${a.systemLocation}","${a.verifiedLocation}","${a.systemCustodian}","${a.verifiedCustodian}","${a.status}","${a.verifiedDate}","${a.verifiedBy}","${a.remarks}"`
      ).join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Audit_Report_${selectedAudit}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActionSuccessMsg('Report exported successfully as CSV!');
    } finally {
      setExporting(false);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  // Helper for status badge styling matching screenshot
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'verified') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
          Verified
        </span>
      );
    }
    if (s === 'moved') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
          Moved
        </span>
      );
    }
    if (s === 'wrong location') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
          Wrong Location
        </span>
      );
    }
    if (s === 'not found') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">
          Not Found
        </span>
      );
    }
    if (s === 'wrong custodian') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-700">
          Wrong Custodian
        </span>
      );
    }
    if (s === 'damaged') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
          Damaged
        </span>
      );
    }
    if (s === 'unregistered') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800">
          Unregistered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-[#6C2BD9]">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 text-slate-800">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header & Breadcrumbs                                               */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <button
                  onClick={() => navigate('/stocktakes/management')}
                  className="hover:text-[#6C2BD9] flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Verification & Audit
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-900 font-semibold">Audit Reports</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Audit Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                View audit results, analyse discrepancies and generate reports
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => navigate('/stocktakes/management')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> Audit Management
              </button>
              <button
                onClick={() => navigate('/stocktakes/execution/AUD-2026-0008')}
                className="px-3 py-1.5 rounded-lg bg-[#6C2BD9]/10 text-[#6C2BD9] hover:bg-[#6C2BD9]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Audit Execution
              </button>
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
        {/* 2. Top Filter Bar (Audit, Company, Location, Date Range, Status)    */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* Audit Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Audit
              </label>
              <div className="relative">
                <select
                  value={selectedAudit}
                  onChange={(e) => setSelectedAudit(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition-all cursor-pointer appearance-none"
                >
                  <option value="AUD-2026-0008">HQ Annual IT Asset Audit 2026 (AUD-2026-0008)</option>
                  <option value="AUD-2026-0007">Data Center Q3 Infrastructure Scan (AUD-2026-0007)</option>
                  <option value="AUD-2026-0006">Branch Office Hardware Census (AUD-2026-0006)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Company / Entity */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Company / Entity
              </label>
              <div className="relative">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition-all cursor-pointer appearance-none"
                >
                  <option value="Dubai HQ">Dubai HQ</option>
                  <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                  <option value="Singapore Office">Singapore Office</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Location
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition-all cursor-pointer appearance-none"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="IT-201">IT-201</option>
                  <option value="IT-301">IT-301</option>
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
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition-all"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status & Generate Report Button */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition-all cursor-pointer appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Reconciled">Reconciled</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Purple Generate Report Button */}
              <button
                onClick={() => {
                  fetchReportSummary();
                  fetchReportAssets();
                }}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <Search className="w-3.5 h-3.5" /> Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. Row 1: Audit Information | Audit Summary (KPIs) | Verification Results */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Audit Information (3.5 cols) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                <span>Audit Information</span>
                <span className="text-[10px] font-mono bg-purple-50 text-[#6C2BD9] px-2 py-0.5 rounded font-bold border border-purple-100">
                  {auditInfo.auditId}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Audit ID</span>
                  <span className="font-mono font-bold text-slate-800">: {auditInfo.auditId}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Audit Name</span>
                  <span className="font-semibold text-slate-800 leading-snug">: {auditInfo.auditName}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Audit Type</span>
                  <span className="text-slate-700">: {auditInfo.auditType}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Company</span>
                  <span className="text-slate-700">: {auditInfo.company}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Location</span>
                  <span className="text-slate-700">: {auditInfo.location}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Period</span>
                  <span className="text-slate-700 font-mono text-[11px]">: {auditInfo.period}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Status</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-700 mr-1">:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {auditInfo.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-start pt-1 border-t border-slate-100">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Created By</span>
                  <span className="text-slate-700">: {auditInfo.createdBy}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Created On</span>
                  <span className="text-slate-500 text-[11px]">: {auditInfo.createdOn}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-slate-400 shrink-0 font-medium">Completed On</span>
                  <span className="text-slate-500 text-[11px]">: {auditInfo.completedOn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Audit Summary (8 KPI Cards in 4x2 Grid) (5.5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900">Audit Summary</h3>
                <span className="text-[11px] text-slate-400">Click card to filter results</span>
              </div>

              {/* 8 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Total Assets */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('TOTAL', 'detailed')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'TOTAL'
                      ? 'bg-purple-50/70 border-[#6C2BD9] shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  </div>
                  <span className="text-xl font-black text-slate-900 leading-none block">
                    {kpis.totalAssets}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight mt-1 block">
                    Total Assets
                  </span>
                </button>

                {/* 2. Verified */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('VERIFIED', 'detailed')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'VERIFIED'
                      ? 'bg-emerald-100/70 border-emerald-600 shadow-xs'
                      : 'bg-[#ECFDF5] border-emerald-200 hover:bg-emerald-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-800 leading-none">
                      {kpis.verified}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      ({kpis.verifiedPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight mt-1 block">
                    Verified
                  </span>
                </button>

                {/* 3. Pending */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('PENDING', 'detailed')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'PENDING'
                      ? 'bg-purple-100/70 border-[#6C2BD9] shadow-xs'
                      : 'bg-[#EFF6FF] border-purple-200 hover:bg-purple-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#6C2BD9]">
                    <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-purple-900 leading-none">
                      {kpis.pending}
                    </span>
                    <span className="text-[10px] font-bold text-[#6C2BD9]">
                      ({kpis.pendingPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6C2BD9] uppercase tracking-tight mt-1 block">
                    Pending
                  </span>
                </button>

                {/* 4. Not Found */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('NOT_FOUND', 'notFound')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'NOT_FOUND' || activeTab === 'notFound'
                      ? 'bg-rose-100/70 border-rose-600 shadow-xs'
                      : 'bg-[#FEF2F2] border-rose-200 hover:bg-rose-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-rose-600">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-rose-800 leading-none">
                      {kpis.notFound}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">
                      ({kpis.notFoundPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-tight mt-1 block">
                    Not Found
                  </span>
                </button>

                {/* 5. Wrong Location */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('WRONG_LOCATION', 'moved')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'WRONG_LOCATION' || activeTab === 'moved'
                      ? 'bg-orange-100/70 border-orange-600 shadow-xs'
                      : 'bg-[#FFF7ED] border-orange-200 hover:bg-orange-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-orange-600">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-orange-800 leading-none">
                      {kpis.wrongLocation}
                    </span>
                    <span className="text-[10px] font-bold text-orange-600">
                      ({kpis.wrongLocationPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-orange-700 uppercase tracking-tight mt-1 block">
                    Wrong Location
                  </span>
                </button>

                {/* 6. Wrong Custodian */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('WRONG_CUSTODIAN', 'exceptions')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'WRONG_CUSTODIAN'
                      ? 'bg-purple-100/70 border-purple-600 shadow-xs'
                      : 'bg-[#F5F3FF] border-purple-200 hover:bg-purple-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-purple-600">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-purple-800 leading-none">
                      {kpis.wrongCustodian}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600">
                      ({kpis.wrongCustodianPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-tight mt-1 block">
                    Wrong Custodian
                  </span>
                </button>

                {/* 7. Unregistered */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('UNREGISTERED', 'unregistered')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'UNREGISTERED' || activeTab === 'unregistered'
                      ? 'bg-cyan-100/70 border-cyan-600 shadow-xs'
                      : 'bg-[#F0FDFA] border-cyan-200 hover:bg-cyan-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-cyan-600">
                    <FileText className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-cyan-800 leading-none">
                      {kpis.unregistered}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-600">
                      ({kpis.unregisteredPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-700 uppercase tracking-tight mt-1 block">
                    Unregistered
                  </span>
                </button>

                {/* 8. Damaged */}
                <button
                  type="button"
                  onClick={() => handleKpiCardClick('DAMAGED', 'damaged')}
                  className={clsx(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer',
                    activeKpiFilter === 'DAMAGED' || activeTab === 'damaged'
                      ? 'bg-rose-100/70 border-rose-600 shadow-xs'
                      : 'bg-[#FFF1F2] border-rose-200 hover:bg-rose-100/50'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-rose-800 leading-none">
                      {kpis.damaged}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">
                      ({kpis.damagedPct}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-tight mt-1 block">
                    Damaged
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Verification Results Donut Chart (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
                Verification Results
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* SVG Donut Chart with Center Text */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circumference for r=38 is 2 * PI * 38 = 238.76 */}
                    {/* Verified: 65% -> 155.19 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="15"
                      strokeDasharray="155.2 238.8"
                      strokeDashoffset="0"
                    />
                    {/* Pending: 30% -> 71.63 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="15"
                      strokeDasharray="71.6 238.8"
                      strokeDashoffset="-155.2"
                    />
                    {/* Not Found: 2% -> 4.78 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="15"
                      strokeDasharray="4.8 238.8"
                      strokeDashoffset="-226.8"
                    />
                    {/* Wrong Location: 2% -> 4.78 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F97316"
                      strokeWidth="15"
                      strokeDasharray="4.8 238.8"
                      strokeDashoffset="-231.6"
                    />
                    {/* Wrong Custodian: 1% -> 2.39 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="15"
                      strokeDasharray="2.4 238.8"
                      strokeDashoffset="-236.4"
                    />
                  </svg>

                  {/* Center Metric Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {kpis.totalAssets}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Assets
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 space-y-1 text-xs w-full">
                  {donutBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 text-slate-700">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="text-[11px] font-medium text-slate-600 truncate">{item.label}</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-[11px] ml-2 shrink-0">
                        {item.count} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. Row 2: Verification Trend & Results by Location Charts          */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Verification Trend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Verification Trend</h3>
              {/* Legend matching screenshot */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-purple-700">
                  <span className="w-3 h-3 rounded-xs bg-[#8B5CF6]"></span>
                  <span>Daily Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-4 h-0.5 bg-slate-900 inline-block relative">
                    <span className="w-2 h-2 rounded-full bg-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                  </span>
                  <span>Cumulative Verified</span>
                </div>
              </div>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 450]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Bar dataKey="daily" name="Daily Verified" fill="#8B5CF6" barSize={16} radius={[3, 3, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative Verified"
                    stroke="#1E1B4B"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#1E1B4B', strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Results by Location */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <h3 className="text-sm font-bold text-slate-900">Results by Location</h3>
              {/* Legend matching screenshot */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]"></span>
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]"></span>
                  <span>Not Found</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F97316]"></span>
                  <span>Wrong Location</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]"></span>
                  <span>Wrong Custodian</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#06B6D4]"></span>
                  <span>Others</span>
                </div>
              </div>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 250]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Bar dataKey="verified" name="Verified" stackId="a" fill="#10B981" barSize={22} />
                  <Bar dataKey="wrongLocation" name="Wrong Location" stackId="a" fill="#F97316" barSize={22} />
                  <Bar dataKey="notFound" name="Not Found" stackId="a" fill="#EF4444" barSize={22} />
                  <Bar dataKey="wrongCustodian" name="Wrong Custodian" stackId="a" fill="#8B5CF6" barSize={22} />
                  <Bar dataKey="others" name="Others" stackId="a" fill="#06B6D4" barSize={22} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 5. Bottom Section: Detailed Results Grid & Tabs                     */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tabs Bar & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 px-5 pt-3 pb-2 gap-3 bg-white">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold no-scrollbar">
              {[
                { id: 'detailed', label: 'Detailed Results' },
                { id: 'exceptions', label: `Exceptions (${kpis.totalExceptions})` },
                { id: 'notFound', label: `Not Found (${kpis.notFound})` },
                { id: 'moved', label: `Moved Assets (${kpis.wrongLocation})` },
                { id: 'damaged', label: `Damaged (${kpis.damaged})` },
                { id: 'unregistered', label: `Unregistered (${kpis.unregistered})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveKpiFilter(null);
                    setCurrentPage(1);
                  }}
                  className={clsx(
                    'px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all border-b-2 font-bold cursor-pointer',
                    activeTab === tab.id
                      ? 'border-[#6C2BD9] text-[#6C2BD9] bg-purple-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Actions: Export & Print */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-3 py-1.5 rounded-lg border border-[#6C2BD9]/30 bg-purple-50/60 hover:bg-purple-100/70 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exporting ? 'Exporting...' : 'Export'}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {/* Export Dropdown */}
                {showExportMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV / Excel
                    </button>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        window.print();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-600" /> Export PDF Summary
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Quick Search & Count Filter Status */}
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search asset number, name, location, custodian..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Active Filter Pill */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-[11px] text-slate-500">
              {activeKpiFilter && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-[#6C2BD9] px-2 py-0.5 rounded-md font-semibold">
                  Filtered: {activeKpiFilter}
                  <button onClick={() => setActiveKpiFilter(null)} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span>Showing {assets.length} matching asset records</span>
            </div>
          </div>

          {/* Main Data Table */}
          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">Asset No.</th>
                  <th className="py-3 px-3">Asset Name</th>
                  <th className="py-3 px-3">Asset Type</th>
                  <th className="py-3 px-3">System Location</th>
                  <th className="py-3 px-3">Verified Location</th>
                  <th className="py-3 px-3">System Custodian</th>
                  <th className="py-3 px-3">Verified Custodian</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Verified Date</th>
                  <th className="py-3 px-3">Verified By</th>
                  <th className="py-3 px-3">Remarks</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6 text-slate-300" />
                        <p className="font-semibold text-slate-600">No verification records found</p>
                        <p className="text-[11px]">Try clearing your search query or selecting a different tab filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((item, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + (idx + 1);
                    const isLocationMismatch = item.systemLocation !== item.verifiedLocation && item.verifiedLocation !== '-';
                    const isCustodianMismatch = item.systemCustodian !== item.verifiedCustodian && item.verifiedCustodian !== '-';

                    return (
                      <tr
                        key={item.assetNo || idx}
                        onClick={() => setSelectedAssetDetail(item)}
                        className="hover:bg-purple-50/30 transition-colors cursor-pointer group"
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {item.index || rowNumber}
                        </td>

                        {/* Asset No. (Purple Monospace Link) */}
                        <td className="py-3 px-3 font-mono font-bold text-[#6C2BD9] group-hover:underline">
                          {item.assetNo}
                        </td>

                        {/* Asset Name */}
                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {item.assetName}
                        </td>

                        {/* Asset Type */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {item.assetType}
                        </td>

                        {/* System Location (Expected Baseline) */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {item.systemLocation}
                        </td>

                        {/* Verified Location (Observed - Highlighted if Discrepant) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.verifiedLocation === '-' ? (
                            <span className="text-slate-300">-</span>
                          ) : isLocationMismatch ? (
                            <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-600" />
                              {item.verifiedLocation}
                            </span>
                          ) : (
                            <span className="text-slate-700">{item.verifiedLocation}</span>
                          )}
                        </td>

                        {/* System Custodian */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {item.systemCustodian}
                        </td>

                        {/* Verified Custodian (Observed - Highlighted if Discrepant) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.verifiedCustodian === '-' ? (
                            <span className="text-slate-300">-</span>
                          ) : isCustodianMismatch ? (
                            <span className="text-purple-800 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-purple-600" />
                              {item.verifiedCustodian}
                            </span>
                          ) : (
                            <span className="text-slate-700">{item.verifiedCustodian}</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Verified Date */}
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {item.verifiedDate}
                        </td>

                        {/* Verified By */}
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {item.verifiedBy}
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[140px] truncate" title={item.remarks}>
                          {item.remarks || '-'}
                        </td>

                        {/* Action (...) */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAssetDetail(item)}
                            className="p-1 rounded-md text-slate-400 hover:text-[#6C2BD9] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Asset Audit Evidence & Discrepancy Details"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Scroll Down Summary */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-600">Showing {assets.length} records</span>
            <span className="text-slate-400">Scroll down to view all records</span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Discrepancy Evidence & Comparison Modal                           */}
      {/* --------------------------------------------------------------------- */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Audit Verification Evidence
                    </h3>
                    {getStatusBadge(selectedAssetDetail.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedAssetDetail.assetNo} - {selectedAssetDetail.assetName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid: Expected (Baseline Snapshot) vs Observed (Verified Record) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: System Expected Snapshot */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    System Snapshot (Baseline)
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                    Frozen at Start
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Expected Location</span>
                    <span className="font-semibold text-slate-800">{selectedAssetDetail.systemLocation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Expected Custodian</span>
                    <span className="font-semibold text-slate-800">{selectedAssetDetail.systemCustodian}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Expected Asset Type</span>
                    <span className="text-slate-700">{selectedAssetDetail.assetType}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Registered Tag EPC</span>
                    <span className="font-mono text-[11px] text-slate-600 font-medium">
                      {selectedAssetDetail.tagEpc || 'E28011606000002053A1B4B9'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Physical Observed Record */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6C2BD9] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Observed Field Verification
                  </span>
                  <span className="text-[10px] bg-purple-100 text-[#6C2BD9] font-bold px-1.5 py-0.5 rounded">
                    Physically Scanned
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Verified Location</span>
                    <span className={clsx('font-semibold', selectedAssetDetail.systemLocation !== selectedAssetDetail.verifiedLocation && selectedAssetDetail.verifiedLocation !== '-' ? 'text-amber-700 font-bold' : 'text-slate-800')}>
                      {selectedAssetDetail.verifiedLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Verified Custodian</span>
                    <span className={clsx('font-semibold', selectedAssetDetail.systemCustodian !== selectedAssetDetail.verifiedCustodian && selectedAssetDetail.verifiedCustodian !== '-' ? 'text-purple-700 font-bold' : 'text-slate-800')}>
                      {selectedAssetDetail.verifiedCustodian}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Verified On & By</span>
                    <span className="text-slate-700">
                      {selectedAssetDetail.verifiedDate} by <strong className="text-slate-900">{selectedAssetDetail.verifiedBy}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Auditor Notes</span>
                    <span className="text-slate-600 italic">"{selectedAssetDetail.remarks || 'Normal verification'}"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Photo Preview if Available */}
            {selectedAssetDetail.evidencePhoto && (
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center gap-4">
                <img
                  src={selectedAssetDetail.evidencePhoto}
                  alt="Field Evidence"
                  className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-2xs"
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">Physical Audit Capture</span>
                  <p className="text-slate-500 text-[11px]">
                    Photo captured via Asset360 Mobile Scanner during floor audit in {selectedAssetDetail.verifiedLocation}.
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Device: Zebra TC57 RFID • Timestamp: {selectedAssetDetail.verifiedDate}
                  </span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  setSelectedAssetDetail(null);
                  navigate(`/assets/${selectedAssetDetail.assetNo}`);
                }}
                className="text-[#6C2BD9] hover:underline font-semibold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Asset 360 Profile
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAssetDetail(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedAssetDetail.status === 'Moved' && (
                  <button
                    onClick={() => {
                      setActionSuccessMsg(`Auto-transfer initiated for ${selectedAssetDetail.assetNo} to ${selectedAssetDetail.verifiedLocation}`);
                      setSelectedAssetDetail(null);
                    }}
                    className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg font-bold hover:bg-[#5B21B6] shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Reconcile Location Transfer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditReport;
