import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Calendar,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Hourglass,
  XCircle,
  Laptop,
  MapPin,
  User,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

const EMPTY_FILTERS = { assetTypes: [], movementTypes: [], sites: [], departments: [], custodians: [], statuses: [] };
const EMPTY_KPIS = { totalMovements: 0, completed: 0, inTransit: 0, pendingReceipt: 0, cancelledRejected: 0 };
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const htmlCell = value => String(value ?? '-').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function MovementHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected Movement & Drawer Tab
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const [movementDetail, setMovementDetail] = useState(null);
  const [fullTimeline, setFullTimeline] = useState([]);
  const [drawerTab, setDrawerTab] = useState('overview'); // overview | details | assets | workflow | documents

  // Filter States
  const [filterSearch, setFilterSearch] = useState(searchParams.get('search') || '');
  const [filterAssetType, setFilterAssetType] = useState('All');
  const [filterMovementType, setFilterMovementType] = useState('All');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterCustodian, setFilterCustodian] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState(() => ({ search: searchParams.get('search') || '' }));
  const [filterOptions, setFilterOptions] = useState(EMPTY_FILTERS);
  const [error, setError] = useState('');

  // Server Data & Pagination State
  const [movements, setMovements] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [kpis, setKpis] = useState(EMPTY_KPIS);

  const [isLoading, setIsLoading] = useState(false);
  const [isFullTimelineModalOpen, setIsFullTimelineModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get('/custody-transfers/history', { params: { ...appliedFilters, page: currentPage, limit: pageSize } });
        if (cancelled) return;
        setMovements(res.history || []);
        setTotalRecords(res.total || 0);
        setKpis(res.kpis || EMPTY_KPIS);
        setFilterOptions(res.filters || EMPTY_FILTERS);
        setSelectedMovementId(previous => (res.history || []).some(row => row.movementId === previous) ? previous : res.history?.[0]?.movementId || null);
      } catch (e) {
        if (cancelled) return;
        setMovements([]);
        setTotalRecords(0);
        setKpis(EMPTY_KPIS);
        setError(e?.message || 'Movement history could not be loaded.');
      } finally { if (!cancelled) setIsLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [currentPage, pageSize, appliedFilters]);

  useEffect(() => {
    if (!selectedMovementId) { setMovementDetail(null); return; }
    let cancelled = false;
    setMovementDetail(null);
    api.get(`/custody-transfers/history/${encodeURIComponent(selectedMovementId)}`)
      .then(res => { if (!cancelled) setMovementDetail(res.movement); })
      .catch(e => { if (!cancelled) setError(e?.message || 'Movement details could not be loaded.'); });
    return () => { cancelled = true; };
  }, [selectedMovementId]);

  const applyFilters = overrides => {
    setCurrentPage(1);
    setAppliedFilters({ search: filterSearch, assetType: filterAssetType, movementType: filterMovementType,
      fromDate: filterFromDate, toDate: filterToDate, site: filterSite, department: filterDepartment,
      custodian: filterCustodian, status: filterStatus, ...overrides });
  };

  const handleSearchClick = () => applyFilters();

  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterAssetType('All');
    setFilterMovementType('All');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterSite('All Sites');
    setFilterDepartment('All Departments');
    setFilterCustodian('All');
    setFilterStatus('All');
    setCurrentPage(1);
    setAppliedFilters({});
  };

  // Find currently selected movement
  const selectedMovement = useMemo(() => {
    const row = movements.find(m => m.movementId === selectedMovementId) || movements[0] || null;
    return movementDetail?.movementId === row?.movementId ? movementDetail : row;
  }, [movements, selectedMovementId, movementDetail]);

  const openFullTimeline = async () => {
    if (!selectedMovement) return;
    try {
      setError('');
      const res = await api.get('/custody-transfers/history', { params: { assetId: selectedMovement.assetId, page: 1, limit: 5000 } });
      setFullTimeline((res.history || []).flatMap(row => row.timeline || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setIsFullTimelineModalOpen(true);
    } catch (e) { setError(e?.message || 'Full timeline could not be loaded.'); }
  };

  // Handle Export CSV
  const handleExport = async () => {
    try {
    const exported = [];
    let page = 1;
    let total = 0;
    do {
      const res = await api.get('/custody-transfers/history', { params: { ...appliedFilters, page, limit: 500 } });
      const batch = res.history || [];
      exported.push(...batch);
      total = res.total || 0;
      if (!batch.length) break;
      page += 1;
    } while (exported.length < total);
    const csvRows = [
      ['Movement ID', 'Asset No', 'Asset Name', 'Movement Type', 'From Location', 'To Location', 'From Custodian', 'To Custodian', 'Movement Date', 'Status'],
      ...exported.map(m => [
        m.movementId,
        m.assetNumber,
        m.assetName,
        m.movementType,
        m.fromLocation,
        m.toLocation,
        m.fromCustodian,
        m.toCustodian,
        m.movementDate,
        m.status
      ])
    ];
    const csvContent = '\uFEFF' + csvRows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const encodedUri = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movement_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
    } catch (e) { setError(e?.message || 'Export failed.'); }
  };

  const handlePrint = () => {
    if (!selectedMovement) return;
    const printable = window.open('', '_blank');
    if (!printable) { setError('Allow popups to print the movement report.'); return; }
    const rows = [
      ['Movement ID', selectedMovement.movementId], ['Asset No.', selectedMovement.assetNumber],
      ['Asset Name', selectedMovement.assetName], ['Type', selectedMovement.movementType],
      ['Status', selectedMovement.status], ['Date', `${selectedMovement.movementDate} ${selectedMovement.movementTime}`],
      ['From Location', selectedMovement.fromLocation], ['To Location', selectedMovement.toLocation],
      ['From Custodian', selectedMovement.fromCustodian], ['To Custodian', selectedMovement.toCustodian],
      ['Reason', selectedMovement.reason], ['Requested By', selectedMovement.requestedBy], ['Approved By', selectedMovement.approvedBy]
    ];
    printable.document.write(`<html><head><title>Movement ${htmlCell(selectedMovement.movementId)}</title><style>body{font:14px Arial,sans-serif;padding:32px;color:#1e293b}h1{font-size:22px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:10px}td:first-child{font-weight:bold;width:32%}</style></head><body><h1>Movement Report</h1><table>${rows.map(([label, value]) => `<tr><td>${htmlCell(label)}</td><td>${htmlCell(value)}</td></tr>`).join('')}</table><h2>Audit Timeline</h2><table>${(selectedMovement.timeline || []).map(event => `<tr><td>${htmlCell(`${event.movementDate} ${event.movementTime}`)}</td><td>${htmlCell(`${event.movementType}: ${event.reason || ''} (${event.performedBy})`)}</td></tr>`).join('')}</table></body></html>`);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Container */}
      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">{error}</div>}
        {/* Top Header & Breadcrumb matching Screenshot 27 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={() => navigate('/movements')}
                className="flex items-center gap-1.5 hover:text-[#6C2BD9] transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Assignment &amp; Movement</span>
              </button>
              <span>&gt;</span>
              <span className="text-slate-800 font-semibold">Movement History</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Movement History
            </h1>
            <p className="text-xs text-slate-500">
              View complete movement history and lifecycle of assets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-medium">
              <button
                onClick={() => navigate('/movements/transfer')}
                className="px-3.5 py-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-all font-medium"
              >
                Transfer Form
              </button>
              <button
                onClick={() => navigate('/movements/approvals')}
                className="px-3.5 py-1.5 rounded-md flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-all font-medium"
              >
                Movement Approvals
              </button>
              <button
                onClick={() => navigate('/movements/transfer?tab=transit')}
                className="px-3.5 py-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-all font-medium"
              >
                Dispatch & In-Transit
              </button>
              <button
                className="px-3.5 py-1.5 rounded-md bg-[#6C2BD9] text-white shadow-sm font-semibold transition-all"
              >
                Movement History
              </button>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Summary Cards (per FSD specifications) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => { setFilterStatus('All'); applyFilters({ status: 'All' }); }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-[#6C2BD9] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Movements</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                {kpis.totalMovements ? '100%' : '0%'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.totalMovements}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All historic records</p>
          </div>

          <div
            onClick={() => { setFilterStatus('Completed'); applyFilters({ status: 'Completed' }); }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Completed</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {kpis.totalMovements ? `${Math.round(kpis.completed / kpis.totalMovements * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{kpis.completed}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Effective in Master</p>
          </div>

          <div
            onClick={() => { setFilterStatus('In Transit'); applyFilters({ status: 'In Transit' }); }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-[#6C2BD9] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">In Transit</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                {kpis.totalMovements ? `${Math.round(kpis.inTransit / kpis.totalMovements * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#6C2BD9] mt-2">{kpis.inTransit}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dispatched &amp; en-route</p>
          </div>

          <div
            onClick={() => { setFilterStatus('Pending Receipt'); applyFilters({ status: 'Pending Receipt' }); }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Receipt</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {kpis.totalMovements ? `${Math.round(kpis.pendingReceipt / kpis.totalMovements * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{kpis.pendingReceipt}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting destination sign-off</p>
          </div>

          <div
            onClick={() => { setFilterStatus('Cancelled / Rejected'); applyFilters({ status: 'Cancelled / Rejected' }); }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs cursor-pointer hover:border-rose-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cancelled / Rejected</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {kpis.totalMovements ? `${Math.round(kpis.cancelledRejected / kpis.totalMovements * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-700 mt-2">{kpis.cancelledRejected}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Voided movement logs</p>
          </div>
        </div>

        {/* 2-Row Filter Panel matching Screenshot 27 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  placeholder="AS-000123"
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Asset Type
              </label>
              <select
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                {filterOptions.assetTypes.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            {/* Movement Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Movement Type
              </label>
              <select
                value={filterMovementType}
                onChange={(e) => setFilterMovementType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                {filterOptions.movementTypes.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 text-xs items-end">
            {/* Site */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Site
              </label>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All Sites">All Sites</option>
                {filterOptions.sites.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            {/* Department */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All Departments">All Departments</option>
                {filterOptions.departments.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            {/* Custodian */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Custodian
              </label>
              <select
                value={filterCustodian}
                onChange={(e) => setFilterCustodian(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                {filterOptions.custodians.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
              >
                <option value="All">All</option>
                {filterOptions.statuses.map(value => <option key={value} value={value}>{value}</option>)}
                <option value="Pending Receipt">Pending Receipt</option>
                <option value="Cancelled / Rejected">Cancelled / Rejected</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                onClick={handleSearchClick}
                className="flex-1 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid & Right Details Panel Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Table: Movement History (24) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Movement History ({totalRecords})
              </h2>
              <span className="text-[11px] text-slate-400">
                Permanent read-only auditable log
              </span>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Movement ID</th>
                    <th className="py-2.5 px-3">Asset No.</th>
                    <th className="py-2.5 px-3">Asset Name</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3">From Location</th>
                    <th className="py-2.5 px-3">To Location</th>
                    <th className="py-2.5 px-3">From Custodian</th>
                    <th className="py-2.5 px-3">To Custodian</th>
                    <th className="py-2.5 px-3">Movement Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((row, idx) => {
                    const isSelected = selectedMovementId === row.movementId;
                    return (
                      <tr
                        key={row.movementId}
                        onClick={() => setSelectedMovementId(row.movementId)}
                        className={clsx(
                          'cursor-pointer transition-colors hover:bg-slate-50/70',
                          isSelected ? 'bg-purple-50/60 font-medium border-l-2 border-l-[#6C2BD9]' : ''
                        )}
                      >
                        <td className="py-3 px-3 text-slate-400 text-center text-[11px]">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-[11px]">
                          {row.movementId}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-800">
                          {row.assetNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {row.assetName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {row.movementType}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {row.fromLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {row.toLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.fromCustodian}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {row.toCustodian}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                          {row.movementDate}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                              row.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.status === 'In Transit'
                                ? 'bg-purple-50 text-[#6C2BD9] border-purple-200'
                                : row.status === 'Approved' || row.status === 'Pending Approval'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : ['Rejected', 'Cancelled'].includes(row.status)
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMovementId(row.movementId);
                            }}
                            className="p-1 rounded text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="View Movement Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!isLoading && movements.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-slate-500">No movement records match these filters.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Scroll Down Summary */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {movements.length} of {totalRecords} records</span>
              <div className="flex items-center gap-2">
                <label htmlFor="movement-page-size">Rows</label>
                <select id="movement-page-size" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-200 px-1 py-0.5">
                  {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage(page => page - 1)} className="rounded border border-slate-200 p-1 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                <span>Page {currentPage} of {Math.max(1, Math.ceil(totalRecords / pageSize))}</span>
                <button type="button" disabled={currentPage * pageSize >= totalRecords} onClick={() => setCurrentPage(page => page + 1)} className="rounded border border-slate-200 p-1 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Right Side Panel: Asset Information & Timeline & Supporting Documents */}
          {selectedMovement ? (
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Subtabs for Detail View */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex items-center gap-1 text-xs font-semibold shadow-xs">
              <button
                onClick={() => setDrawerTab('overview')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'overview'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setDrawerTab('details')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'details'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Details
              </button>
              <button
                onClick={() => setDrawerTab('workflow')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'workflow'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Workflow
              </button>
              <button
                onClick={() => setDrawerTab('documents')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer',
                  drawerTab === 'documents'
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Documents
              </button>
            </div>

            {/* TAB: OVERVIEW (Matching Screenshot 27) */}
            {drawerTab === 'overview' && (
              <>
                {/* Card 1: Asset Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Asset Information</h3>

                  <div className="flex items-center gap-3.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="w-16 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                      <Laptop className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs font-mono">
                          {selectedMovement.assetNumber}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedMovement.assetStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                        {selectedMovement.assetName}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Serial Number</span>
                      <span className="font-mono text-slate-800 font-medium">
                        {selectedMovement.serialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Tag / EPC</span>
                      <span className="font-mono text-slate-800 text-[11px] font-medium truncate max-w-[180px]" title={selectedMovement.tagEpc}>
                        {selectedMovement.tagEpc}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Asset Type</span>
                      <span className="text-slate-800 font-medium">{selectedMovement.assetType}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Asset Category</span>
                      <span className="text-slate-800 font-medium">{selectedMovement.assetCategory}</span>
                    </div>
                    <div className="flex items-start justify-between py-2 gap-2">
                      <span className="text-slate-500 shrink-0">Current Location</span>
                      <span className="text-slate-800 font-medium text-right">
                        {selectedMovement.currentLocation}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-slate-500">Current Custodian</span>
                      <span className="text-slate-800 font-semibold">{selectedMovement.currentCustodian}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Movement Timeline matching Screenshot 27 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Movement Timeline</h3>

                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedMovement.timeline.length ? selectedMovement.timeline.slice(-5).reverse().map((event, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                        <p className="text-[11px] text-slate-400">{event.movementDate} {event.movementTime} ? {event.movementType}</p>
                        <p className="text-xs text-slate-700">{event.reason || `${event.fromLocation} ? ${event.toLocation}`}</p>
                        <p className="text-[11px] text-slate-400">By: {event.performedBy}</p>
                      </div>
                    )) : <p className="text-xs text-slate-400">No timeline events recorded.</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-right">
                    <button
                      onClick={openFullTimeline}
                      className="text-xs text-[#6C2BD9] hover:text-[#5b21b6] font-semibold cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View Full History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 3: Supporting Documents matching Screenshot 27 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Supporting Documents</h3>

                  <div className="space-y-2">
                    {selectedMovement.documents && selectedMovement.documents.length > 0 ? (
                      selectedMovement.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-400">{doc.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No documents attached.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB: DETAILS */}
            {drawerTab === 'details' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Transaction Details</h3>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Movement ID</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedMovement.movementId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Transaction Type</span>
                    <span className="font-semibold text-slate-800">{selectedMovement.movementType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Movement Date</span>
                    <span className="text-slate-800">{selectedMovement.movementDate} {selectedMovement.movementTime}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Source Location</span>
                    <p className="text-slate-800 font-medium pl-2">{selectedMovement.fromLocation}</p>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Destination Location</span>
                    <p className="text-slate-800 font-medium pl-2">{selectedMovement.toLocation}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Previous Custodian</span>
                    <span className="text-slate-800">{selectedMovement.fromCustodian}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">New Custodian</span>
                    <span className="text-slate-800 font-semibold">{selectedMovement.toCustodian}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Reason for Movement</span>
                    <p className="text-slate-700 italic bg-slate-50 p-2 rounded">{selectedMovement.reason}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Condition at Transfer</span>
                    <span className="font-semibold text-emerald-700">{selectedMovement.condition}</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <span className="text-slate-500">Accessories Included</span>
                    <p className="text-slate-700">{selectedMovement.accessories || 'None'}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Requested By</span>
                    <span className="text-slate-800">{selectedMovement.requestedBy}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Approved By</span>
                    <span className="text-slate-800 font-medium">{selectedMovement.approvedBy}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WORKFLOW / APPROVALS */}
            {drawerTab === 'workflow' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Workflow &amp; Approvals</h3>
                <div className="space-y-3">
                  {selectedMovement.workflow && selectedMovement.workflow.length > 0 ? (
                    selectedMovement.workflow.map((wf, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{wf.level}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {wf.decision}
                          </span>
                        </div>
                        <p className="text-slate-600">Approver: <span className="font-semibold text-slate-800">{wf.approver}</span></p>
                        <p className="text-[10px] text-slate-400">{wf.timestamp}</p>
                        {wf.comments && (
                          <p className="text-slate-700 bg-white p-2 rounded border border-slate-100 italic mt-1">
                            "{wf.comments}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Standard operational movement (automatic authorization).</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {drawerTab === 'documents' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Transaction Evidence &amp; Documents</h3>
                <div className="space-y-2.5">
                  {selectedMovement.documents && selectedMovement.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                        className="px-3 py-1.5 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                  {!selectedMovement.documents?.length && <p className="text-slate-400">No documents attached to this movement.</p>}
                </div>
              </div>
            )}

            {/* Action Buttons Toolbar at Bottom of Drawer */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(`/assets/${selectedMovement.assetId}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Asset 360°</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
          ) : <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500">{isLoading ? 'Loading movement details…' : 'Select a movement to view its details.'}</div>}
        </div>
      </div>

      {/* Full Timeline Modal */}
      {isFullTimelineModalOpen && selectedMovement && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Complete Movement Audit Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological lifecycle trace for {selectedMovement.assetNumber} ({selectedMovement.assetName})
                </p>
              </div>
              <button
                onClick={() => setIsFullTimelineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {fullTimeline.map((ev, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-xs" />
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">{ev.movementDate} {ev.movementTime}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#6C2BD9]">
                      {ev.movementType}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{ev.movementId}</p>
                  <p className="text-slate-700 mt-0.5">
                    {ev.fromLocation !== '-' ? `${ev.fromLocation} ➔ ${ev.toLocation}` : `Custodian Handover: ${ev.fromCustodian} ➔ ${ev.toCustodian}`}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">{ev.reason}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 text-right">
              <button
                onClick={() => setIsFullTimelineModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovementHistory;
