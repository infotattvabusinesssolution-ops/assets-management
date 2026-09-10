import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  RotateCcw, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  User, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'REQUESTED',
  'ORDERED',
  'RECEIVED',
  'TAGGED',
  'IN_STORE',
  'IN_SERVICE',
  'ASSIGNED',
  'IN_TRANSIT',
  'UNDER_MAINTENANCE',
  'MISSING',
  'LOST_STOLEN',
  'DAMAGED',
  'RETIRED',
  'DISPOSED'
];

export function AssetList() {
  const navigate = useNavigate();

  // Core Asset Data & Pagination
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Master Data Dropdowns
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);

  // Toast & Modals
  const [toast, setToast] = useState(null);
  const [deleteModalAsset, setDeleteModalAsset] = useState(null);
  const [editModalAsset, setEditModalAsset] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    description: '',
    lifecycleStatus: 'IN_SERVICE',
    condition: 'GOOD',
    acquisitionValue: 0
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Master Data for Filters
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [sRes, cRes] = await Promise.all([
          api.get('/master-data/sites'),
          api.get('/master-data/categories')
        ]);
        if (sRes.success && Array.isArray(sRes.sites)) setSites(sRes.sites);
        if (cRes.success && Array.isArray(cRes.categories)) setCategories(cRes.categories);
      } catch (err) {
        console.error('Failed to load master data filters:', err);
      }
    }
    loadMasterData();
  }, []);

  // Fetch Assets with active filters
  const fetchAssets = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (search.trim()) queryParams.append('search', search.trim());
      if (selectedSite) queryParams.append('siteId', selectedSite);
      if (selectedCategory) queryParams.append('categoryId', selectedCategory);
      if (selectedStatus && selectedStatus !== 'ALL') queryParams.append('status', selectedStatus);
      if (selectedCondition) queryParams.append('condition', selectedCondition);

      const res = await api.get(`/assets?${queryParams.toString()}`);
      if (res.success) {
        setAssets(res.assets || []);
        setPagination(res.pagination || { page, limit, total: res.assets?.length || 0, pages: 1 });
      } else {
        setErrorMessage(res.message || 'Unable to load central asset register.');
      }
    } catch (err) {
      console.error('Error fetching asset register:', err);
      setErrorMessage(err?.message || 'Server error or missing permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async () => {
    setActionLoading(true);
    try {
      const [cRes, sRes, catRes] = await Promise.all([
        api.get('/master-data/companies'),
        api.get('/master-data/sites'),
        api.get('/master-data/categories')
      ]);

      const companyId = cRes.companies?.[0]?.id || cRes.companies?.[0]?._id;
      const siteId = sRes.sites?.[0]?.id || sRes.sites?.[0]?._id;
      const categoryId = catRes.categories?.[0]?.id || catRes.categories?.[0]?._id;

      if (!companyId || !siteId || !categoryId) {
        showToast('error', 'Master Data required. Please ensure Companies, Sites, and Categories exist.');
        return;
      }

      const res = await api.post('/assets', {
        assetId: 'AST-2026-00' + (Math.floor(Math.random() * 899) + 100),
        description: 'Enterprise PowerEdge Compute Workstation',
        tagNumber: 'TAG-' + Math.floor(Math.random() * 8999 + 1000),
        serialNumber: 'SN-SYS-' + Math.floor(Math.random() * 89999 + 10000),
        companyId,
        siteId,
        categoryId,
        lifecycleStatus: 'IN_SERVICE',
        condition: 'NEW',
        acquisitionValue: 3450.00
      });

      if (res.success) {
        showToast('success', `Demo asset ${res.asset?.assetId || ''} created successfully!`);
        fetchAssets(1);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to create demo asset.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, [search, selectedSite, selectedCategory, selectedStatus, selectedCondition]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSite('');
    setSelectedCategory('');
    setSelectedStatus('ALL');
    setSelectedCondition('');
  };

  // Metrics calculation
  const totalValuation = useMemo(() => {
    return assets.reduce((sum, a) => sum + (Number(a.acquisitionValue) || 0), 0);
  }, [assets]);

  const activeCount = useMemo(() => {
    return assets.filter(a => ['IN_SERVICE', 'ASSIGNED', 'TAGGED', 'IN_STORE'].includes(a.lifecycleStatus)).length;
  }, [assets]);

  const missingCount = useMemo(() => {
    return assets.filter(a => ['MISSING', 'LOST_STOLEN', 'DAMAGED'].includes(a.lifecycleStatus)).length;
  }, [assets]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!assets || assets.length === 0) {
      showToast('error', 'No assets available to export.');
      return;
    }

    const headers = ['Asset ID', 'Description', 'Tag/Barcode', 'Serial #', 'Category', 'Site', 'Custodian', 'Status', 'Condition', 'Acquisition Value ($)', 'Created At'];
    
    const escapeCSV = (field) => {
      if (field == null) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = assets.map(a => [
      a.assetId || '',
      a.description || '',
      a.tagNumber || a.barcode || '',
      a.serialNumber || '',
      a.category?.name || '',
      a.site?.name || '',
      a.custodian?.fullName || '',
      a.lifecycleStatus || '',
      a.condition || '',
      Number(a.acquisitionValue || 0).toFixed(2),
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FAMS_Central_Asset_Register_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModalAsset) return;

    setActionLoading(true);
    try {
      const assetId = editModalAsset.id || editModalAsset._id;
      const res = await api.put(`/assets/${assetId}`, editForm);
      if (res.success) {
        showToast('success', `Asset ${res.asset?.assetId || ''} updated successfully!`);
        setEditModalAsset(null);
        fetchAssets(pagination.page);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update asset.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deleteModalAsset) return;

    setActionLoading(true);
    try {
      const assetId = deleteModalAsset.id || deleteModalAsset._id;
      const res = await api.delete(`/assets/${assetId}`);
      if (res.success) {
        showToast('success', `Asset ${deleteModalAsset.assetId} deleted from register.`);
        setDeleteModalAsset(null);
        fetchAssets(pagination.page);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete asset.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central Asset Register</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-mono font-bold uppercase">
              AUTHORITATIVE REPOSITORY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Authoritative fixed asset repository & lifecycle control across all corporate entities
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={() => fetchAssets(pagination.page)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/assets/new')}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Register New Asset
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Register Count</span>
          <span className="text-2xl font-extrabold text-slate-900 block">{pagination.total || assets.length}</span>
          <span className="text-[11px] text-slate-400 font-medium">Authoritative Assets</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active In Service</span>
          <span className="text-2xl font-extrabold text-emerald-600 block">{activeCount}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Operational Hardware</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Page Capitalization</span>
          <span className="text-2xl font-extrabold text-brand-600 block">${totalValuation.toLocaleString()}</span>
          <span className="text-[11px] text-brand-600 font-medium">Acquisition Valuation</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Missing / Discrepancies</span>
          <span className="text-2xl font-extrabold text-rose-600 block">{missingCount}</span>
          <span className="text-[11px] text-rose-600 font-medium">Requires Audit Review</span>
        </div>
      </div>

      {/* 3. Search & Filter Palette */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, Tag, Serial, Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
          {/* Site Filter */}
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Authorized Sites</option>
            {sites.map(s => (
              <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Asset Categories</option>
            {categories.map(c => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            {STATUS_OPTIONS.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All Lifecycle Statuses' : st}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(search || selectedSite || selectedCategory || selectedStatus !== 'ALL' || selectedCondition) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Asset Register Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-600" /> Querying central asset register...
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center bg-rose-50/50 border-dashed border-rose-200 space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-800">{errorMessage}</p>
            <button
              onClick={() => fetchAssets(1)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center border-dashed border-slate-200 space-y-4">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-800">No assets found in register matching criteria.</p>
              <p className="text-xs text-slate-500 mt-1">Register a new asset or initialize initial enterprise demo assets.</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/assets/new')}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Register New Asset
              </button>

              <button
                onClick={handleQuickSeed}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                Quick Seed Demo Asset
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Asset ID</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Tag / Barcode</th>
                  <th className="py-3.5 px-4">Serial Number</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Site Location</th>
                  <th className="py-3.5 px-4">Custodian</th>
                  <th className="py-3.5 px-4 text-right">Value ($)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {assets.map((asset) => {
                  const assetId = asset.id || asset._id;
                  return (
                    <tr key={assetId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Asset ID Link */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600">
                        <span
                          onClick={() => navigate(`/assets/${assetId}`)}
                          className="hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5 text-brand-500" />
                          {asset.assetId}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <span className="font-semibold text-slate-900">{asset.description}</span>
                        {asset.hostname && <span className="block text-[10px] text-slate-400 font-mono">Host: {asset.hostname}</span>}
                      </td>

                      {/* Tag / Barcode */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {asset.tagNumber || asset.barcode || <span className="text-slate-300">—</span>}
                      </td>

                      {/* Serial Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {asset.serialNumber || <span className="text-slate-300">—</span>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                          {asset.category?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Site Location */}
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Building className="w-3 h-3 text-slate-400" />
                          {asset.site?.name || 'Default Site'}
                        </span>
                      </td>

                      {/* Custodian */}
                      <td className="py-3.5 px-4">
                        {asset.custodian ? (
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <User className="w-3 h-3 text-slate-400" />
                            {asset.custodian.fullName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Acquisition Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(asset.acquisitionValue || 0).toLocaleString()}
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={asset.lifecycleStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/assets/${assetId}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 border border-slate-200 transition-all"
                            title="View 360° Asset Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditModalAsset(asset);
                              setEditForm({
                                description: asset.description || '',
                                lifecycleStatus: asset.lifecycleStatus || 'IN_SERVICE',
                                condition: asset.condition || 'GOOD',
                                acquisitionValue: asset.acquisitionValue || 0
                              });
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 transition-all"
                            title="Quick Edit Asset"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteModalAsset(asset)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {pagination.total > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.total}</span> assets
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">Per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => fetchAssets(1, parseInt(e.target.value, 10))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:border-brand-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <button
                onClick={() => fetchAssets(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => fetchAssets(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || loading}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: QUICK EDIT ASSET */}
      {/* ========================================================================= */}
      {editModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" /> Quick Edit Asset: {editModalAsset.assetId}
              </h2>
              <button onClick={() => setEditModalAsset(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lifecycle Status</label>
                  <select
                    value={editForm.lifecycleStatus}
                    onChange={(e) => setEditForm({ ...editForm, lifecycleStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-brand-500"
                  >
                    {STATUS_OPTIONS.filter(s => s !== 'ALL').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-brand-500"
                  >
                    <option value="NEW">NEW</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                    <option value="POOR">POOR</option>
                    <option value="DAMAGED">DAMAGED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Acquisition Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.acquisitionValue}
                  onChange={(e) => setEditForm({ ...editForm, acquisitionValue: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Asset Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-900">Delete Asset from Register?</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteModalAsset.assetId}</span> ({deleteModalAsset.description})? This action will permanently remove the record from the authoritative register and log an audit trail event.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setDeleteModalAsset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetList;
