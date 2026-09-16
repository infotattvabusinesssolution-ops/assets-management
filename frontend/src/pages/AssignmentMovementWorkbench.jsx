import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Package,
  UserCheck,
  Lock,
  ArrowLeftRight,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Columns,
  MoreVertical,
  Edit,
  ArrowRight,
  MapPin,
  User,
  Calendar,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Layers,
  FileText,
  Truck,
  Building2,
  Laptop
} from 'lucide-react';
import { TransferAssetModal } from '../components/modals/TransferAssetModal';
import { BulkTransferModal } from '../components/modals/BulkTransferModal';
import { ReturnAssetModal } from '../components/modals/ReturnAssetModal';

export function AssignmentMovementWorkbench({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab');

  // Main Tabs: 'assignment' | 'transfer' | 'approvals' | 'history'
  const [activeTab, setActiveTab] = useState(defaultTab || activeTabParam || 'assignment');

  // New Action Dropdown
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

  // Modals State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState(null);

  // KPI Metrics State (Matching Screenshot 25)
  const [kpis, setKpis] = useState({
    totalAssets: 1248,
    assignedAssets: 1102,
    assignedPercentage: 88,
    unassignedAssets: 146,
    unassignedPercentage: 12,
    pendingTransfers: 12,
    transfersThisMonth: 78
  });

  // Assets Data State
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedIds, setSelectedIds] = useState(['AS-000123']);
  const [assetDetailTab, setAssetDetailTab] = useState('details'); // details | assignment | history | related

  // Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterBuilding, setFilterBuilding] = useState('All Buildings');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterAssignedTo, setFilterAssignedTo] = useState('All Users');
  const [filterStatus, setFilterStatus] = useState('All Status');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Recent Movements & Pending Approvals
  const [recentMovements, setRecentMovements] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [defaultTab, activeTabParam]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [kpiRes, assetsRes, recentRes, approvalsRes] = await Promise.all([
        api.get('/movements/kpis').catch(() => null),
        api.get('/movements/assets').catch(() => null),
        api.get('/movements/recent').catch(() => null),
        api.get('/movements/approvals').catch(() => null)
      ]);

      if (kpiRes) {
        setKpis({
          totalAssets: kpiRes.totalAssets ?? 1248,
          assignedAssets: kpiRes.assignedAssets ?? 1102,
          assignedPercentage: kpiRes.assignedPercentage ?? 88,
          unassignedAssets: kpiRes.unassignedAssets ?? 146,
          unassignedPercentage: kpiRes.unassignedPercentage ?? 12,
          pendingTransfers: kpiRes.pendingTransfers ?? 12,
          transfersThisMonth: kpiRes.transfersThisMonth ?? 78
        });
      }

      if (assetsRes && assetsRes.assets && assetsRes.assets.length > 0) {
        setAssets(assetsRes.assets);
        setSelectedAsset(assetsRes.assets[0]);
      }

      if (recentRes && recentRes.recent) {
        setRecentMovements(recentRes.recent);
      }

      if (approvalsRes && approvalsRes.approvals) {
        setPendingApprovals(approvalsRes.approvals);
      }
    } catch (err) {
      console.warn('Movement Workbench API fallback:', err);
    }
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchSearch =
        !filterSearch ||
        a.assetNumber?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.assetName?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.tagEpc?.toLowerCase().includes(filterSearch.toLowerCase());

      const matchSite = filterSite === 'All Sites' || a.site === filterSite;
      const matchBuilding = filterBuilding === 'All Buildings' || a.building === filterBuilding;
      const matchLoc = filterLocation === 'All Locations' || a.currentLocation?.includes(filterLocation);
      const matchType = filterType === 'All Types' || a.assetType === filterType;
      const matchDept = filterDepartment === 'All Departments' || a.department === filterDepartment;
      const matchUser = filterAssignedTo === 'All Users' || a.assignedTo === filterAssignedTo;
      const matchStatus = filterStatus === 'All Status' || a.status === filterStatus;

      return matchSearch && matchSite && matchBuilding && matchLoc && matchType && matchDept && matchUser && matchStatus;
    });
  }, [assets, filterSearch, filterSite, filterBuilding, filterLocation, filterType, filterDepartment, filterAssignedTo, filterStatus]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterSite('All Sites');
    setFilterBuilding('All Buildings');
    setFilterLocation('All Locations');
    setFilterType('All Types');
    setFilterDepartment('All Departments');
    setFilterAssignedTo('All Users');
    setFilterStatus('All Status');
    setCurrentPage(1);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAssets.map(a => a.assetNumber));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickFilter = (statusVal) => {
    if (statusVal === 'Assigned') {
      setFilterStatus('Assigned');
    } else if (statusVal === 'Unassigned') {
      setFilterStatus('Unassigned');
    } else if (statusVal === 'Pending') {
      setActiveTab('approvals');
    } else {
      setFilterStatus('All Status');
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16 select-none">
      
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assignment &amp; Movement</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign assets, transfer between locations and track movement history
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden">
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
              <option value="Sharjah Warehouse">Sharjah Warehouse</option>
            </select>

            {/* Global Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search assets, people, locations..."
                className="pl-8 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 w-60 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-5">
        
        {/* 2. Top Summary KPI Cards (5 Cards) + Primary Action Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 flex-1">
            
            {/* 1. Total Assets */}
            <div
              onClick={() => handleQuickFilter('ALL')}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">Total Assets</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{kpis.totalAssets.toLocaleString()}</div>
              </div>
            </div>

            {/* 2. Assigned Assets */}
            <div
              onClick={() => handleQuickFilter('Assigned')}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">Assigned Assets</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-900">{kpis.assignedAssets.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{kpis.assignedPercentage}%</span>
                </div>
              </div>
            </div>

            {/* 3. Unassigned Assets */}
            <div
              onClick={() => handleQuickFilter('Unassigned')}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3 cursor-pointer hover:border-rose-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">Unassigned Assets</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold text-slate-900">{kpis.unassignedAssets.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">{kpis.unassignedPercentage}%</span>
                </div>
              </div>
            </div>

            {/* 4. Pending Transfers */}
            <div
              onClick={() => handleQuickFilter('Pending')}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3 cursor-pointer hover:border-amber-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">Pending Transfers</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{kpis.pendingTransfers}</div>
              </div>
            </div>

            {/* 5. Transfers This Month */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">Transfers This Month</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{kpis.transfersThisMonth}</div>
              </div>
            </div>

          </div>

          {/* Primary Action Button: + New Assignment / Transfer ▾ */}
          <div className="relative self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Assignment / Transfer</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>

            {isActionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs text-slate-800 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsActionDropdownOpen(false);
                    navigate('/movements/assign');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Assign Asset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionDropdownOpen(false);
                    setModalAsset(selectedAsset || assets[0]);
                    setIsTransferModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  Transfer Asset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionDropdownOpen(false);
                    setIsBulkModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Layers className="w-4 h-4 text-purple-600" />
                  Bulk Transfer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionDropdownOpen(false);
                    setModalAsset(selectedAsset || assets[0]);
                    setIsReturnModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Return / Check-In
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 3. Main Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-8 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('assignment');
              setSearchParams({ tab: 'assignment' });
            }}
            className={`pb-3 transition-colors relative ${
              activeTab === 'assignment'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Asset Assignment
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('transfer');
              setSearchParams({ tab: 'transfer' });
            }}
            className={`pb-3 transition-colors relative ${
              activeTab === 'transfer'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Asset Movement / Transfer
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('approvals');
              setSearchParams({ tab: 'approvals' });
            }}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Approvals</span>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
              {kpis.pendingTransfers}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setSearchParams({ tab: 'history' });
            }}
            className={`pb-3 transition-colors relative ${
              activeTab === 'history'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Movement History
          </button>
        </div>

        {/* TAB 1: ASSET ASSIGNMENT / MAIN WORKBENCH */}
        {activeTab === 'assignment' && (
          <div className="space-y-5">
            
            {/* Collapsible Filters Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="font-bold text-slate-800 flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filters</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-slate-400 hover:text-blue-600 font-semibold"
                >
                  Reset
                </button>
              </div>

              {isFiltersOpen && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Search</label>
                      <input
                        type="text"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        placeholder="Asset No, Name, Serial No, Tag/EPC..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Site</label>
                      <select
                        value={filterSite}
                        onChange={e => setFilterSite(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Sites">All Sites</option>
                        <option value="Dubai HQ">Dubai HQ</option>
                        <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
                        <option value="Sharjah Warehouse">Sharjah Warehouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Building</label>
                      <select
                        value={filterBuilding}
                        onChange={e => setFilterBuilding(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Buildings">All Buildings</option>
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Location</label>
                      <select
                        value={filterLocation}
                        onChange={e => setFilterLocation(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Locations">All Locations</option>
                        <option value="GF">Ground Floor (GF)</option>
                        <option value="1F">1st Floor (1F)</option>
                        <option value="2F">2nd Floor (2F)</option>
                        <option value="Server Room">Server Room</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Asset Type</label>
                      <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Types">All Types</option>
                        <option value="IT Equipment">IT Equipment</option>
                        <option value="Network Device">Network Device</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Mobile Device">Mobile Device</option>
                        <option value="Safety Equipment">Safety Equipment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Department</label>
                      <select
                        value={filterDepartment}
                        onChange={e => setFilterDepartment(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Departments">All Departments</option>
                        <option value="IT Department">IT Department</option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Health & Safety">Health &amp; Safety</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Assigned To</label>
                      <select
                        value={filterAssignedTo}
                        onChange={e => setFilterAssignedTo(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="All Users">All Users</option>
                        <option value="Ahmed Khan">Ahmed Khan</option>
                        <option value="Sara Ali">Sara Ali</option>
                        <option value="Fatima Noor">Fatima Noor</option>
                        <option value="Rashid Mohammed">Rashid Mohammed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-500 font-medium mb-1">Status</label>
                        <select
                          value={filterStatus}
                          onChange={e => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                        >
                          <option value="All Status">All Status</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Unassigned">Unassigned</option>
                          <option value="In Transit">In Transit</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors shrink-0"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Area: Grid (Left) & Asset Details Side Panel (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Assets Grid (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                
                {/* Grid Table Header Controls */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Assets <span className="text-blue-600 font-semibold">({filteredAssets.length.toLocaleString()})</span>
                    </span>
                    {selectedIds.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {selectedIds.length} selected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Exporting asset dataset...')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs flex items-center gap-1.5"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      Columns
                    </button>
                  </div>
                </div>

                {/* Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === paginatedAssets.length && paginatedAssets.length > 0}
                            onChange={handleToggleSelectAll}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Asset No</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Asset Name</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Type</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Current Location</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Assigned To</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Status</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700">Last Moved</th>
                        <th className="py-2.5 px-3 font-bold text-slate-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAssets.map((asset) => {
                        const isChecked = selectedIds.includes(asset.assetNumber);
                        const isSelectedRow = selectedAsset?.assetNumber === asset.assetNumber;

                        return (
                          <tr
                            key={asset.assetNumber}
                            onClick={() => setSelectedAsset(asset)}
                            className={`cursor-pointer transition-colors ${
                              isSelectedRow ? 'bg-blue-50/70' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSelect(asset.assetNumber)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-blue-600 hover:underline font-mono">
                              {asset.assetNumber}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{asset.assetName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{asset.assetType}</td>
                            <td className="py-2.5 px-3 text-slate-700">{asset.currentLocation}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{asset.assignedTo}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  asset.status === 'Assigned'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {asset.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{asset.lastMovedDate || asset.lastMoved}</td>
                            <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setModalAsset(asset);
                                  setIsTransferModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
                  <div>
                    Showing <span className="font-semibold text-slate-800">1</span> to{' '}
                    <span className="font-semibold text-slate-800">{paginatedAssets.length}</span> of{' '}
                    <span className="font-semibold text-slate-800">{filteredAssets.length.toLocaleString()}</span> assets
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {[1, 2, 3, 4, 5].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <span className="text-slate-400">...</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(125)}
                      className="w-7 h-6 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
                    >
                      125
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-slate-400 ml-2">10 / page ▾</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Asset Details Side Panel (4 Cols) */}
              {selectedAsset && (
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between text-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm">Asset Details</h3>
                      <button className="text-slate-400 hover:text-slate-600">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Badge Card */}
                    <div className="py-3 flex items-center gap-3 border-b border-slate-100">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Laptop className="w-8 h-8 text-slate-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{selectedAsset.assetNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {selectedAsset.status}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5">{selectedAsset.assetName}</div>
                        <div className="text-[11px] text-slate-500">{selectedAsset.assetType} | {selectedAsset.manufacturer}</div>
                      </div>
                    </div>

                    {/* Sub-tabs Header */}
                    <div className="flex items-center gap-4 border-b border-slate-100 py-2.5 text-xs font-semibold text-slate-500">
                      <button
                        type="button"
                        onClick={() => setAssetDetailTab('details')}
                        className={`pb-1 ${assetDetailTab === 'details' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetDetailTab('assignment')}
                        className={`pb-1 ${assetDetailTab === 'assignment' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                      >
                        Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetDetailTab('history')}
                        className={`pb-1 ${assetDetailTab === 'history' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                      >
                        Movement History
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetDetailTab('related')}
                        className={`pb-1 ${assetDetailTab === 'related' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                      >
                        Related
                      </button>
                    </div>

                    {/* Details Field List */}
                    <div className="py-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Asset No</span>
                        <span className="font-semibold text-slate-800 font-mono">{selectedAsset.assetNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Serial Number</span>
                        <span className="font-semibold text-slate-800 font-mono">{selectedAsset.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Tag / EPC</span>
                        <span className="font-semibold text-slate-800 font-mono text-[11px] truncate max-w-[180px]">{selectedAsset.tagEpc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Asset Type</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.assetType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Category</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Model</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">{selectedAsset.status}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-medium block mb-1">Current Location</span>
                        <div className="flex items-start gap-1.5 text-slate-800 font-semibold text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{selectedAsset.fullLocation || selectedAsset.currentLocation}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-medium block mb-1">Assigned To</span>
                        <div className="flex items-start gap-1.5 text-slate-800 font-semibold text-[11px]">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <div>{selectedAsset.assignedTo}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{selectedAsset.department}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-1 text-[11px]">
                        <span className="text-slate-500">Assigned Date</span>
                        <span className="font-medium text-slate-700">{selectedAsset.assignedDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Last Moved</span>
                        <span className="font-medium text-slate-700">{selectedAsset.lastMoved}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Warranty Expiry</span>
                        <span className="font-medium text-slate-700">{selectedAsset.warrantyExpiry}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Remarks</span>
                        <span className="font-medium text-slate-700">{selectedAsset.remarks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/assets/edit/${selectedAsset.assetNumber}`)}
                      className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center gap-1 shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalAsset(selectedAsset);
                        setIsTransferModalOpen(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalAsset(selectedAsset);
                        setIsReturnModalOpen(true);
                      }}
                      className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-2xs"
                    >
                      ... More ▾
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* 4. Bottom Panels: Recent Assignments & Movements (Left) and Pending Approvals (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Panel: Recent Assignments & Movements (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <h3 className="font-bold text-slate-900">Recent Assignments &amp; Movements</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date &amp; Time</th>
                        <th className="py-2.5 px-3">Asset No</th>
                        <th className="py-2.5 px-3">Asset Name</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">From</th>
                        <th className="py-2.5 px-3">To</th>
                        <th className="py-2.5 px-3">By</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentMovements.slice(0, 5).map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{rec.dateTime}</td>
                          <td className="py-2 px-3 font-mono font-semibold text-blue-600">{rec.assetNo}</td>
                          <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-[120px]">{rec.assetName}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                rec.action === 'Assigned' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {rec.action}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500">{rec.from}</td>
                          <td className="py-2 px-3 text-slate-700 font-medium">{rec.to}</td>
                          <td className="py-2 px-3 text-slate-700">{rec.by}</td>
                          <td className="py-2 px-3">
                            <span className="text-emerald-700 font-semibold">{rec.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Panel: Pending Approvals (12) (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">Pending Approvals ({pendingApprovals.length})</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('approvals')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Request ID</th>
                        <th className="py-2.5 px-3">Asset No</th>
                        <th className="py-2.5 px-3">Request Type</th>
                        <th className="py-2.5 px-3">Requested By</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingApprovals.slice(0, 5).map((req) => (
                        <tr key={req.requestId} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{req.requestId}</td>
                          <td className="py-2 px-3 font-mono text-blue-600 font-semibold">{req.assetNo}</td>
                          <td className="py-2 px-3 text-slate-700">{req.requestType}</td>
                          <td className="py-2 px-3 text-slate-800">{req.requestedBy}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{req.date}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ASSET MOVEMENT / TRANSFER */}
        {activeTab === 'transfer' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Asset Movement &amp; Inter-Site Transfer</h2>
                <p className="text-slate-500 text-xs">Initiate guided relocations, site-to-site dispatches, and in-transit tracking.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalAsset(selectedAsset || assets[0]);
                  setIsTransferModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Initiate New Transfer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Intra-Site Transfer</span>
                <p className="text-slate-500 text-[11px]">Move equipment between floors, zones, or rooms within the same campus without dispatch notes.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Inter-Site / In-Transit</span>
                <p className="text-slate-500 text-[11px]">Ship assets to branch offices with gate passes, courier tracking, and destination receipt confirmation.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Bulk Department Move</span>
                <p className="text-slate-500 text-[11px]">Transfer dozens of assets in a single movement header with individual line-item tracking.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pending Movement &amp; Assignment Approvals</h2>
                <p className="text-slate-500 text-xs">Authorize or reject pending custody shifts before Asset Master updates take effect</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                {pendingApprovals.length} Pending Actions
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Request ID</th>
                  <th className="py-2.5 px-4">Asset No &amp; Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Requested By</th>
                  <th className="py-2.5 px-4">From Location</th>
                  <th className="py-2.5 px-4">To Location</th>
                  <th className="py-2.5 px-4">New Custodian</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.requestId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-600 font-mono">{req.assetNo}</div>
                      <div className="text-slate-600 text-[11px]">{req.assetName}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{req.requestType}</td>
                    <td className="py-3 px-4 text-slate-800">{req.requestedBy}</td>
                    <td className="py-3 px-4 text-slate-500">{req.fromLocation}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{req.toLocation}</td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{req.newCustodian}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await api.post(`/movements/approvals/${req.requestId}/action`, { action: 'REJECT' });
                            loadData();
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await api.post(`/movements/approvals/${req.requestId}/action`, { action: 'APPROVE' });
                            loadData();
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: MOVEMENT HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Chronological Movement &amp; Assignment Audit History</h2>
                <p className="text-slate-500 text-xs">Immutable historical register of all equipment custody transfers and physical relocations</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Exporting Movement History PDF/CSV...')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit Log
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Movement ID</th>
                  <th className="py-2.5 px-4">Date &amp; Time</th>
                  <th className="py-2.5 px-4">Asset No &amp; Name</th>
                  <th className="py-2.5 px-4">Movement Type</th>
                  <th className="py-2.5 px-4">From Location</th>
                  <th className="py-2.5 px-4">To Destination</th>
                  <th className="py-2.5 px-4">New Custodian</th>
                  <th className="py-2.5 px-4">Reason / Notes</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{m.id}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{m.dateTime}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-blue-600 font-mono">{m.assetNo}</div>
                      <div className="text-slate-600 text-[11px]">{m.assetName}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {m.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{m.from}</td>
                    <td className="py-2.5 px-4 text-slate-800 font-medium">{m.to}</td>
                    <td className="py-2.5 px-4 text-slate-800 font-semibold">{m.by}</td>
                    <td className="py-2.5 px-4 text-slate-500">{m.action === 'Assigned' ? 'Employee Allocation' : 'Office Relocation'}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-emerald-700 font-bold">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modals */}
      <TransferAssetModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        asset={modalAsset}
        onTransferCompleted={() => loadData()}
      />

      <BulkTransferModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedAssets={assets.filter(a => selectedIds.includes(a.assetNumber))}
        onTransferCompleted={() => loadData()}
      />

      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        asset={modalAsset}
        onReturnCompleted={() => loadData()}
      />

    </div>
  );
}
