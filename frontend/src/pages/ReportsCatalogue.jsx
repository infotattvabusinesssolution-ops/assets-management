import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Inventory',
  'Custody & Audit',
  'Finance',
  'IT',
  'Maintenance',
  'Compliance'
];

const CORE_REPORTS = [
  {
    id: 'asset-register',
    name: 'Master Asset Register',
    description: 'Central master inventory register with category, company, location, and lifecycle status.',
    category: 'Inventory',
    icon: Package,
    endpoint: '/reports/asset-register',
    supportsFilters: ['siteId', 'categoryId', 'lifecycleStatus', 'dateRange']
  },
  {
    id: 'movement',
    name: 'Asset Movement & Transfer History',
    description: 'Audit log of asset custody transfers, site movements, check-ins, and check-outs.',
    category: 'Custody & Audit',
    icon: ArrowRightLeft,
    endpoint: '/reports/movement',
    supportsFilters: ['dateRange']
  },
  {
    id: 'custody',
    name: 'Custodian & Employee Allocation',
    description: 'Current employee asset assignments, custodian allocations, and departmental splits.',
    category: 'Custody & Audit',
    icon: UserCheck,
    endpoint: '/reports/custody',
    supportsFilters: ['siteId', 'categoryId']
  },
  {
    id: 'location-distribution',
    name: 'Site & Location Distribution',
    description: 'Breakdown of physical asset placement across sites, buildings, floors, and rooms.',
    category: 'Inventory',
    icon: MapPin,
    endpoint: '/reports/location-distribution',
    supportsFilters: ['siteId']
  },
  {
    id: 'depreciation',
    name: 'Depreciation & Net Book Value',
    description: 'Financial valuation, accumulated depreciation schedules, and current Net Book Value (NBV).',
    category: 'Finance',
    icon: DollarSign,
    endpoint: '/reports/depreciation',
    supportsFilters: ['siteId', 'categoryId']
  },
  {
    id: 'exceptions',
    name: 'Missing & Exception Alerts',
    description: 'Audit discrepancy log of missing, stolen, damaged, or unserviceable hardware.',
    category: 'Custody & Audit',
    icon: AlertTriangle,
    endpoint: '/reports/exceptions',
    supportsFilters: []
  },
  {
    id: 'discovery',
    name: 'IT Network Discovery Reconciliation',
    description: 'Reconciliation log comparing automated IP/SNMP discovery data against registered assets.',
    category: 'IT',
    icon: Network,
    endpoint: '/reports/discovery',
    supportsFilters: []
  },
  {
    id: 'maintenance',
    name: 'Maintenance History & Cost Log',
    description: 'Preventive and corrective work orders, labor hours, and maintenance expenditures.',
    category: 'Maintenance',
    icon: Wrench,
    endpoint: '/reports/maintenance',
    supportsFilters: ['dateRange']
  },
  {
    id: 'warranties',
    name: 'Warranty & SLA Expiry Schedule',
    description: 'Upcoming vendor contract and OEM warranty expirations over time.',
    category: 'Compliance',
    icon: Clock,
    endpoint: '/reports/warranties',
    supportsFilters: ['dateRange']
  },
  {
    id: 'disposals',
    name: 'Disposed Asset Gain/Loss Summary',
    description: 'Historical record of retired and disposed assets along with salvage values and proceeds.',
    category: 'Finance',
    icon: Receipt,
    endpoint: '/reports/disposals',
    supportsFilters: []
  }
];

export function ReportsCatalogue() {
  // KPI & Metadata state
  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [sites, setSites] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Catalog state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  // Dedicated Workspace State
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    siteId: '',
    categoryId: '',
    lifecycleStatus: '',
    fromDate: '',
    toDate: ''
  });

  // Sorting & Pagination State
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Load KPI Dashboard and Master Data
  const fetchDashboardKpis = async () => {
    setKpiLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.success) {
        setKpis(res.kpis);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Error fetching dashboard KPIs:', err);
    } finally {
      setKpiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardKpis();

    // Fetch master sites and categories for filter dropdowns
    api.get('/master-data/sites').then(res => {
      if (res.success && Array.isArray(res.sites)) setSites(res.sites);
    }).catch(() => {});

    api.get('/master-data/categories').then(res => {
      if (res.success && Array.isArray(res.categories)) setCategoriesList(res.categories);
    }).catch(() => {});
  }, []);

  // Fetch Report Data when selectedReport or applied filters change
  const fetchReportData = async (reportObj, appliedFilters = filters) => {
    if (!reportObj) return;
    setReportLoading(true);
    setReportError(null);

    // Date range validation
    if (appliedFilters.fromDate && appliedFilters.toDate) {
      if (new Date(appliedFilters.fromDate) > new Date(appliedFilters.toDate)) {
        setReportError('From Date must be earlier than or equal to To Date');
        setReportLoading(false);
        return;
      }
    }

    try {
      const queryParams = new URLSearchParams();
      if (appliedFilters.siteId) queryParams.append('siteId', appliedFilters.siteId);
      if (appliedFilters.categoryId) queryParams.append('categoryId', appliedFilters.categoryId);
      if (appliedFilters.lifecycleStatus) queryParams.append('lifecycleStatus', appliedFilters.lifecycleStatus);
      if (appliedFilters.fromDate) queryParams.append('fromDate', appliedFilters.fromDate);
      if (appliedFilters.toDate) queryParams.append('toDate', appliedFilters.toDate);

      const url = `${reportObj.endpoint}?${queryParams.toString()}`;
      const res = await api.get(url);
      if (res.success) {
        setReportData(res.report || []);
        setCurrentPage(1);
      } else {
        setReportError('Unable to generate this report.');
      }
    } catch (err) {
      setReportError(err?.message || 'Failed to fetch report data from server.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setFilters({
      siteId: '',
      categoryId: '',
      lifecycleStatus: '',
      fromDate: '',
      toDate: ''
    });
    setSortField('');
    fetchReportData(report, {
      siteId: '',
      categoryId: '',
      lifecycleStatus: '',
      fromDate: '',
      toDate: ''
    });
  };

  const handleApplyFilters = () => {
    fetchReportData(selectedReport, filters);
  };

  const handleClearFilters = () => {
    const cleared = { siteId: '', categoryId: '', lifecycleStatus: '', fromDate: '', toDate: '' };
    setFilters(cleared);
    fetchReportData(selectedReport, cleared);
  };

  const handleRefresh = () => {
    fetchDashboardKpis();
    if (selectedReport) {
      fetchReportData(selectedReport, filters);
    }
  };

  // Filter core report cards based on search & category
  const filteredReportCards = useMemo(() => {
    return CORE_REPORTS.filter(rep => {
      const matchesCategory = activeCategory === 'All' || rep.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Handle Table Column Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Process data sorting & pagination
  const processedData = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) return [];

    let sorted = [...reportData];
    if (sortField) {
      sorted.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Object property extraction for standard populated MongoDB refs
        if (typeof valA === 'object' && valA !== null) valA = valA.name || valA.assetId || valA.firstName || '';
        if (typeof valB === 'object' && valB !== null) valB = valB.name || valB.assetId || valB.firstName || '';

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return sorted;
  }, [reportData, sortField, sortDirection]);

  // Paginated records slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));

  // Export CSV
  const handleExportCSV = () => {
    if (!processedData || processedData.length === 0) {
      alert('No data available to export');
      return;
    }

    let headers = [];
    let rowMapper = (row) => [];

    switch (selectedReport.id) {
      case 'asset-register':
        headers = ['Asset ID', 'Description', 'Category', 'Site', 'Status', 'Acquisition Value ($)', 'Purchase Date'];
        rowMapper = r => [
          r.assetId || '',
          r.description || '',
          r.categoryId?.name || '',
          r.siteId?.name || '',
          r.lifecycleStatus || '',
          r.acquisitionValue ? Number(r.acquisitionValue).toFixed(2) : '0.00',
          r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : ''
        ];
        break;
      case 'movement':
        headers = ['Timestamp', 'Transaction Type', 'Asset Tag', 'Description', 'Performed By', 'Notes'];
        rowMapper = r => [
          r.timestamp ? new Date(r.timestamp).toLocaleString() : '',
          r.transactionType || '',
          r.assetId?.assetId || r.assetId?.tagNumber || '',
          r.assetId?.description || '',
          r.performedBy?.username || `${r.performedBy?.firstName || ''} ${r.performedBy?.lastName || ''}`.trim(),
          r.notes || ''
        ];
        break;
      case 'custody':
        headers = ['Custodian Name', 'Employee Code', 'Department', 'Asset Tag', 'Description', 'Category', 'Site', 'Assigned Date'];
        rowMapper = r => [
          `${r.custodianId?.firstName || ''} ${r.custodianId?.lastName || ''}`.trim() || 'N/A',
          r.custodianId?.employeeCode || '',
          r.departmentId?.name || r.custodianId?.department || '',
          r.assetId || '',
          r.description || '',
          r.categoryId?.name || '',
          r.siteId?.name || '',
          r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : ''
        ];
        break;
      case 'location-distribution':
        headers = ['Asset Tag', 'Description', 'Category', 'Site', 'Building', 'Floor', 'Room', 'Status'];
        rowMapper = r => [
          r.assetId || '',
          r.description || '',
          r.categoryId?.name || '',
          r.siteId?.name || '',
          r.buildingId?.name || 'N/A',
          r.floorId?.name || 'N/A',
          r.roomId?.name || 'N/A',
          r.lifecycleStatus || ''
        ];
        break;
      case 'depreciation':
        headers = ['Asset Tag', 'Description', 'Category', 'Site', 'Acquisition Date', 'Acquisition Value ($)', 'Useful Life (Yrs)', 'Accumulated Depr ($)', 'Net Book Value ($)'];
        rowMapper = r => [
          r.assetId || '',
          r.description || '',
          r.categoryName || '',
          r.siteName || '',
          r.acquisitionDate ? new Date(r.acquisitionDate).toLocaleDateString() : '',
          r.acquisitionValue ? Number(r.acquisitionValue).toFixed(2) : '0.00',
          r.usefulLifeYears || 5,
          r.accumulatedDepreciation ? Number(r.accumulatedDepreciation).toFixed(2) : '0.00',
          r.netBookValue ? Number(r.netBookValue).toFixed(2) : '0.00'
        ];
        break;
      case 'exceptions':
        headers = ['Asset Tag', 'Description', 'Category', 'Site', 'Custodian', 'Exception Status', 'Updated Date'];
        rowMapper = r => [
          r.assetId || '',
          r.description || '',
          r.categoryId?.name || '',
          r.siteId?.name || '',
          r.custodianId ? `${r.custodianId.firstName || ''} ${r.custodianId.lastName || ''}` : 'Unassigned',
          r.lifecycleStatus || '',
          r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ''
        ];
        break;
      case 'discovery':
        headers = ['Discovery Match ID', 'Rule', 'Confidence Score', 'Status', 'Matched Asset', 'Reviewed By'];
        rowMapper = r => [
          r._id || '',
          r.matchRule || '',
          `${r.confidenceScore || 0}%`,
          r.status || '',
          r.matchedAssetId ? `${r.matchedAssetId.assetId} - ${r.matchedAssetId.description}` : 'Unmatched',
          r.reviewedBy?.username || 'System'
        ];
        break;
      case 'maintenance':
        headers = ['Work Order #', 'Asset Tag', 'Work Type', 'Priority', 'Status', 'Labor Hours', 'Cost ($)', 'Created Date'];
        rowMapper = r => [
          r.workOrderNumber || '',
          r.assetId?.assetId || '',
          r.workType || '',
          r.priority || '',
          r.status || '',
          r.laborHours || 0,
          r.cost ? Number(r.cost).toFixed(2) : '0.00',
          r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
        ];
        break;
      case 'warranties':
        headers = ['Warranty #', 'Asset Tag', 'Provider', 'Coverage', 'Start Date', 'End Date'];
        rowMapper = r => [
          r.warrantyNumber || 'N/A',
          r.assetId?.assetId || '',
          r.providerName || '',
          r.coverageType || 'FULL',
          r.startDate ? new Date(r.startDate).toLocaleDateString() : '',
          r.endDate ? new Date(r.endDate).toLocaleDateString() : ''
        ];
        break;
      case 'disposals':
        headers = ['Asset Tag', 'Description', 'Category', 'Site', 'Lifecycle Status', 'Disposal Date'];
        rowMapper = r => [
          r.assetId || '',
          r.description || '',
          r.categoryId?.name || '',
          r.siteId?.name || '',
          r.lifecycleStatus || '',
          r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ''
        ];
        break;
      default:
        headers = Object.keys(processedData[0] || {});
        rowMapper = r => Object.values(r);
    }

    const escapeCSV = (field) => {
      if (field == null) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.map(escapeCSV).join(','),
      ...processedData.map(row => rowMapper(row).map(escapeCSV).join(','))
    ];

    // UTF-8 BOM
    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `FAMS_${selectedReport.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic status badge styling helper
  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = String(status).toUpperCase();

    let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (['OPERATIONAL', 'ACTIVE', 'IN_SERVICE', 'COMPLETED', 'VERIFIED', 'MATCHED'].includes(s)) {
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['UNDER_MAINTENANCE', 'ASSIGNED', 'IN_PROGRESS', 'SUGGESTED', 'OPEN'].includes(s)) {
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (['MISSING', 'LOST_STOLEN', 'DAMAGED', 'DISPOSED', 'RETIRED', 'CANCELLED', 'CONFLICT'].includes(s)) {
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${bgClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="bg-white border-b border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-lg border border-brand-100">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  Enterprise Reports Catalogue
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Data restricted to your authorized scope
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centralized reporting, analytics, audit, financial, custody, maintenance, and compliance reports.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {lastRefreshed && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                Refreshed: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 border border-slate-200 transition-all"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${kpiLoading ? 'animate-spin text-brand-600' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-all">
          <div className="text-xs text-slate-500 font-medium">Total Assets</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {kpiLoading ? '...' : (kpis?.totalAssets?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-brand-600 font-medium mt-1 truncate">
            Valuation: ${kpiLoading ? '...' : (kpis?.totalAssetValue?.toLocaleString() || 0)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-all">
          <div className="text-xs text-slate-500 font-medium">Active Assets</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {kpiLoading ? '...' : (kpis?.activeAssets?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">In Operational Use</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-all">
          <div className="text-xs text-slate-500 font-medium">Under Maintenance</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {kpiLoading ? '...' : (kpis?.underMaintenance?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-amber-600 mt-1 font-medium">Overdue WO: {kpis?.maintenanceOverdue || 0}</div>
        </div>

        <div
          onClick={() => handleSelectReport(CORE_REPORTS.find(r => r.id === 'exceptions'))}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 font-medium group-hover:text-rose-600 transition-colors">Missing / Exceptions</div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {kpiLoading ? '...' : (kpis?.missingAssets?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-rose-600 mt-1 font-medium">Click to view alerts →</div>
        </div>

        <div
          onClick={() => handleSelectReport(CORE_REPORTS.find(r => r.id === 'warranties'))}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 font-medium group-hover:text-cyan-600 transition-colors">Expiring Warranties</div>
          <div className="text-xl font-bold text-cyan-600 mt-1">
            {kpiLoading ? '...' : (kpis?.warrantiesExpiring?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-cyan-600 mt-1 font-medium">Within 30 Days →</div>
        </div>

        <div
          onClick={() => handleSelectReport(CORE_REPORTS.find(r => r.id === 'disposals'))}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 font-medium group-hover:text-purple-600 transition-colors">Disposed Assets</div>
          <div className="text-xl font-bold text-purple-600 mt-1">
            {kpiLoading ? '...' : (kpis?.disposedAssets?.toLocaleString() || 0)}
          </div>
          <div className="text-[10px] text-purple-600 mt-1 font-medium">Gain/Loss log →</div>
        </div>
      </div>

      {/* Main Workspace Switcher */}
      {!selectedReport ? (
        /* ---------------- CATALOGUE VIEW ---------------- */
        <div className="space-y-6">
          {/* Controls: Search and Category Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredReportCards.map((report) => {
              const ReportIcon = report.icon;
              return (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 bg-brand-50 text-brand-600 rounded-lg border border-brand-100 group-hover:scale-105 transition-transform">
                        <ReportIcon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {report.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {report.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Real-time DB query</span>
                    <button
                      onClick={() => handleSelectReport(report)}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReportCards.length === 0 && (
            <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 rounded-xl space-y-3 shadow-xs">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-medium text-slate-700">No report cards match your filter criteria</div>
              <p className="text-xs text-slate-500">Try adjusting your search query or category filter tab.</p>
            </div>
          )}
        </div>
      ) : (
        /* ---------------- DEDICATED REPORT WORKSPACE ---------------- */
        <div className="space-y-6">
          {/* Top Bar: Return Button & Selected Report Title */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Catalog
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedReport.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-brand-50 text-brand-700 border border-brand-200 font-medium">
                    {selectedReport.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedReport.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleExportCSV}
                disabled={reportLoading || !reportData || reportData.length === 0}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Reusable Report Parameters & Filters Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1.5"><Filter className="w-3.5 h-3.5 text-brand-600" /> Report Parameters & Filters</span>
              <span className="text-[11px] text-slate-400 font-normal">Only supported backend parameters applied</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* Site Filter */}
              {selectedReport.supportsFilters.includes('siteId') && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Site / Location</label>
                  <select
                    value={filters.siteId}
                    onChange={e => setFilters({ ...filters, siteId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Authorized Sites</option>
                    {sites.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Filter */}
              {selectedReport.supportsFilters.includes('categoryId') && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Asset Category</label>
                  <select
                    value={filters.categoryId}
                    onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Asset Categories</option>
                    {categoriesList.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lifecycle Status Filter */}
              {selectedReport.supportsFilters.includes('lifecycleStatus') && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Lifecycle Status</label>
                  <select
                    value={filters.lifecycleStatus}
                    onChange={e => setFilters({ ...filters, lifecycleStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="OPERATIONAL">OPERATIONAL / IN_SERVICE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_STORE">IN_STORE</option>
                    <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                    <option value="MISSING">MISSING</option>
                    <option value="DISPOSED">DISPOSED</option>
                  </select>
                </div>
              )}

              {/* Date Range Filters */}
              {selectedReport.supportsFilters.includes('dateRange') && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={filters.fromDate}
                      onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={filters.toDate}
                      onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Filter Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-all"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Report Summary Metric Bar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500">Total Loaded Records: </span>
                <span className="font-bold text-slate-900">{processedData.length}</span>
              </div>
              {selectedReport.id === 'asset-register' && (
                <div>
                  <span className="text-slate-500">Operational Assets: </span>
                  <span className="font-bold text-emerald-600">
                    {processedData.filter(r => ['OPERATIONAL', 'IN_SERVICE', 'ASSIGNED'].includes(r.lifecycleStatus)).length}
                  </span>
                </div>
              )}
              {selectedReport.id === 'depreciation' && (
                <div>
                  <span className="text-slate-500">Total Net Book Value: </span>
                  <span className="font-bold text-brand-600">
                    ${processedData.reduce((acc, curr) => acc + (curr.netBookValue || 0), 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Showing page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Error Banner */}
          {reportError && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{reportError}</span>
              </div>
              <button
                onClick={() => fetchReportData(selectedReport, filters)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* Report Preview Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {reportLoading ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                <div className="text-xs font-medium">Querying enterprise database for report dataset...</div>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-medium text-slate-700">No report records found</div>
                <p className="text-xs text-slate-500">Try changing your applied parameters or clearing filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
                    {/* Render Columns based on report type */}
                    {selectedReport.id === 'asset-register' && (
                      <tr>
                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('assetId')}>
                          <div className="flex items-center gap-1">Asset Tag <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('description')}>
                          <div className="flex items-center gap-1">Description <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 cursor-pointer text-right" onClick={() => handleSort('acquisitionValue')}>
                          <div className="flex items-center justify-end gap-1">Acquisition Cost <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                      </tr>
                    )}

                    {selectedReport.id === 'movement' && (
                      <tr>
                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('timestamp')}>
                          <div className="flex items-center gap-1">Timestamp <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-4 py-3">Transaction Type</th>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Performed By</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    )}

                    {selectedReport.id === 'custody' && (
                      <tr>
                        <th className="px-4 py-3">Custodian</th>
                        <th className="px-4 py-3">Employee Code</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Assigned Date</th>
                      </tr>
                    )}

                    {selectedReport.id === 'location-distribution' && (
                      <tr>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Building</th>
                        <th className="px-4 py-3">Room</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    )}

                    {selectedReport.id === 'depreciation' && (
                      <tr>
                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('assetId')}>
                          <div className="flex items-center gap-1">Asset Tag <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Acquisition Cost</th>
                        <th className="px-4 py-3 text-right">Accumulated Depr.</th>
                        <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('netBookValue')}>
                          <div className="flex items-center justify-end gap-1">Net Book Value <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                      </tr>
                    )}

                    {selectedReport.id === 'exceptions' && (
                      <tr>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Custodian</th>
                        <th className="px-4 py-3">Exception Status</th>
                      </tr>
                    )}

                    {selectedReport.id === 'discovery' && (
                      <tr>
                        <th className="px-4 py-3">Match Rule</th>
                        <th className="px-4 py-3">Confidence Score</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Matched Asset</th>
                        <th className="px-4 py-3">Reviewed By</th>
                      </tr>
                    )}

                    {selectedReport.id === 'maintenance' && (
                      <tr>
                        <th className="px-4 py-3">Work Order #</th>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Work Type</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Labor Hrs</th>
                        <th className="px-4 py-3 text-right">Cost</th>
                      </tr>
                    )}

                    {selectedReport.id === 'warranties' && (
                      <tr>
                        <th className="px-4 py-3">Warranty #</th>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3">Coverage</th>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">End Date</th>
                      </tr>
                    )}

                    {selectedReport.id === 'disposals' && (
                      <tr>
                        <th className="px-4 py-3">Asset Tag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Site</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Disposal Date</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-slate-50 transition-colors">
                        {selectedReport.id === 'asset-register' && (
                          <>
                            <td className="px-4 py-3 font-mono text-brand-600 font-medium">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.description}</td>
                            <td className="px-4 py-3">{row.categoryId?.name || 'Unassigned'}</td>
                            <td className="px-4 py-3">{row.siteId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{getStatusBadge(row.lifecycleStatus)}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-900">
                              ${row.acquisitionValue ? Number(row.acquisitionValue).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                            </td>
                          </>
                        )}

                        {selectedReport.id === 'movement' && (
                          <>
                            <td className="px-4 py-3 text-slate-500">
                              {row.timestamp ? new Date(row.timestamp).toLocaleString() : ''}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.transactionType}</td>
                            <td className="px-4 py-3 font-mono text-brand-600">
                              {row.assetId?.assetId || row.assetId?.tagNumber || 'N/A'}
                            </td>
                            <td className="px-4 py-3">{row.assetId?.description || 'N/A'}</td>
                            <td className="px-4 py-3">{row.performedBy?.username || 'System'}</td>
                            <td className="px-4 py-3 text-slate-500 text-[11px] truncate max-w-xs">{row.notes || '-'}</td>
                          </>
                        )}

                        {selectedReport.id === 'custody' && (
                          <>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {row.custodianId ? `${row.custodianId.firstName || ''} ${row.custodianId.lastName || ''}` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500">{row.custodianId?.employeeCode || '-'}</td>
                            <td className="px-4 py-3">{row.departmentId?.name || row.custodianId?.department || 'N/A'}</td>
                            <td className="px-4 py-3 font-mono text-brand-600">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3">{row.description}</td>
                            <td className="px-4 py-3">{row.siteId?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-500">
                              {row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : '-'}
                            </td>
                          </>
                        )}

                        {selectedReport.id === 'location-distribution' && (
                          <>
                            <td className="px-4 py-3 font-mono text-brand-600">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.description}</td>
                            <td className="px-4 py-3">{row.categoryId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.siteId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.buildingId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.roomId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{getStatusBadge(row.lifecycleStatus)}</td>
                          </>
                        )}

                        {selectedReport.id === 'depreciation' && (
                          <>
                            <td className="px-4 py-3 font-mono text-brand-600">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.description}</td>
                            <td className="px-4 py-3">{row.categoryName}</td>
                            <td className="px-4 py-3 text-right font-mono">${(row.acquisitionValue || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-amber-600">${(row.accumulatedDepreciation || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">${(row.netBookValue || 0).toLocaleString()}</td>
                          </>
                        )}

                        {selectedReport.id === 'exceptions' && (
                          <>
                            <td className="px-4 py-3 font-mono text-rose-600">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.description}</td>
                            <td className="px-4 py-3">{row.categoryId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.siteId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.custodianId ? `${row.custodianId.firstName || ''} ${row.custodianId.lastName || ''}` : 'Unassigned'}</td>
                            <td className="px-4 py-3">{getStatusBadge(row.lifecycleStatus)}</td>
                          </>
                        )}

                        {selectedReport.id === 'discovery' && (
                          <>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.matchRule}</td>
                            <td className="px-4 py-3 font-mono text-brand-600">{row.confidenceScore}%</td>
                            <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                            <td className="px-4 py-3">
                              {row.matchedAssetId ? `${row.matchedAssetId.assetId} (${row.matchedAssetId.description})` : 'Unmatched'}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{row.reviewedBy?.username || 'System'}</td>
                          </>
                        )}

                        {selectedReport.id === 'maintenance' && (
                          <>
                            <td className="px-4 py-3 font-mono text-brand-600">{row.workOrderNumber}</td>
                            <td className="px-4 py-3 font-mono">{row.assetId?.assetId || 'N/A'}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.workType}</td>
                            <td className="px-4 py-3">{row.priority}</td>
                            <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                            <td className="px-4 py-3 text-right font-mono">{row.laborHours || 0} hrs</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-600">${Number(row.cost || 0).toLocaleString()}</td>
                          </>
                        )}

                        {selectedReport.id === 'warranties' && (
                          <>
                            <td className="px-4 py-3 font-mono text-slate-700">{row.warrantyNumber || 'N/A'}</td>
                            <td className="px-4 py-3 font-mono text-brand-600">{row.assetId?.assetId || 'N/A'}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.providerName || 'N/A'}</td>
                            <td className="px-4 py-3">{row.coverageType || 'FULL'}</td>
                            <td className="px-4 py-3 text-slate-500">{row.startDate ? new Date(row.startDate).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-3 text-cyan-600 font-medium">{row.endDate ? new Date(row.endDate).toLocaleDateString() : '-'}</td>
                          </>
                        )}

                        {selectedReport.id === 'disposals' && (
                          <>
                            <td className="px-4 py-3 font-mono text-purple-600">
                              <Link to={`/assets/${row._id || row.assetId}`} className="hover:underline">
                                {row.assetId}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{row.description}</td>
                            <td className="px-4 py-3">{row.categoryId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{row.siteId?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{getStatusBadge(row.lifecycleStatus)}</td>
                            <td className="px-4 py-3 text-slate-500">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Pagination Footer */}
            {processedData.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, processedData.length)} to{' '}
                    {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-slate-800 font-medium px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
