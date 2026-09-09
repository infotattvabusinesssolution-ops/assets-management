import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { enqueueOfflineTransaction, getPendingOfflineTransactions } from '../services/offlineStorage';
import { 
  ClipboardCheck, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Smartphone, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Building, 
  Calendar, 
  User, 
  Camera, 
  Radio, 
  WifiOff, 
  ArrowLeft,
  FileSpreadsheet,
  ShieldAlert
} from 'lucide-react';

export function StocktakeManager() {
  // Main View Mode: 'CAMPAIGNS_LIST' | 'CAMPAIGN_DETAIL'
  const [viewMode, setViewMode] = useState('CAMPAIGNS_LIST');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  // Core Data State
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Campaign Detail Data
  const [activeCampaignData, setActiveCampaignData] = useState({
    campaign: null,
    expectedAssets: [],
    observations: [],
    exceptions: []
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('EXPECTED'); // 'EXPECTED' | 'OBSERVATIONS' | 'EXCEPTIONS' | 'SCANNER'

  // Master Data Options for Launch Modal
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & Filters (Campaign List)
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');

  // Search & Filters (Inside Campaign Detail)
  const [detailSearch, setDetailSearch] = useState('');
  const [expectedStatusFilter, setExpectedStatusFilter] = useState('ALL');
  const [exceptionTypeFilter, setExceptionTypeFilter] = useState('ALL');

  // Modals
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Launch Campaign Form
  const [launchForm, setLaunchForm] = useState({
    title: '',
    companyId: '',
    siteId: '',
    buildingId: '',
    categoryId: '',
    mode: 'FULL_CENSUS'
  });

  // Embedded Scanner State
  const [scanType, setScanType] = useState('BARCODE');
  const [scannedTag, setScannedTag] = useState('TAG-9001');
  const [isOffline, setIsOffline] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Helper Toast
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stocktakes/campaigns');
      if (res.success) setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterDataOptions = async () => {
    try {
      const [cRes, sRes, bRes, catRes] = await Promise.all([
        api.get('/master-data/companies'),
        api.get('/master-data/sites'),
        api.get('/master-data/buildings'),
        api.get('/master-data/categories')
      ]);
      if (cRes.success) setCompanies(cRes.companies || []);
      if (sRes.success) setSites(sRes.sites || []);
      if (bRes.success) setBuildings(bRes.buildings || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load master data options:', err);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/stocktakes/campaigns/${campaignId}`);
      if (res.success) {
        setActiveCampaignData({
          campaign: res.campaign,
          expectedAssets: res.expectedAssets || [],
          observations: res.observations || [],
          exceptions: res.exceptions || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch campaign details:', err);
      showToast('error', 'Failed to load campaign details');
    } finally {
      setDetailLoading(false);
    }
  };

  const checkOfflineCount = async () => {
    try {
      const pending = await getPendingOfflineTransactions();
      setOfflinePendingCount(pending.length);
    } catch (err) {
      console.error('Offline storage error:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchMasterDataOptions();
    checkOfflineCount();
  }, []);

  const openCampaignDetail = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setViewMode('CAMPAIGN_DETAIL');
    fetchCampaignDetails(campaignId);
  };

  // -------------------------------------------------------------
  // EXECUTIVE DASHBOARD AGGREGATE CALCULATIONS
  // -------------------------------------------------------------
  const totalActiveCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalExpected = campaigns.reduce((acc, c) => acc + (c.stats?.totalExpected || 0), 0);
  const totalVerified = campaigns.reduce((acc, c) => acc + (c.stats?.totalVerified || 0), 0);
  const totalRelocated = campaigns.reduce((acc, c) => acc + (c.stats?.totalRelocated || 0), 0);
  const totalMissing = campaigns.reduce((acc, c) => acc + (c.stats?.totalMissing || 0), 0);
  const totalUnregistered = campaigns.reduce((acc, c) => acc + (c.stats?.totalUnregistered || 0), 0);

  // -------------------------------------------------------------
  // LAUNCH CAMPAIGN HANDLER
  // -------------------------------------------------------------
  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!launchForm.title) {
      alert('Please enter a campaign title.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: launchForm.title,
        mode: launchForm.mode,
        scope: {
          companyId: launchForm.companyId || (companies[0] ? companies[0]._id : undefined),
          siteId: launchForm.siteId || (sites[0] ? sites[0]._id : undefined),
          buildingId: launchForm.buildingId || undefined,
          categoryId: launchForm.categoryId || undefined
        }
      };

      const res = await api.post('/stocktakes/campaigns', payload);
      if (res.success) {
        showToast('success', `Campaign ${res.campaign?.campaignNumber || ''} launched successfully!`);
        setShowLaunchModal(false);
        setLaunchForm({ title: '', companyId: '', siteId: '', buildingId: '', categoryId: '', mode: 'FULL_CENSUS' });
        fetchCampaigns();
        openCampaignDetail(res.campaign._id);
      }
    } catch (err) {
      alert(err.message || 'Failed to launch campaign');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CLOSE CAMPAIGN HANDLER
  // -------------------------------------------------------------
  const handleCloseCampaign = async () => {
    if (!selectedCampaignId) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/stocktakes/campaigns/${selectedCampaignId}/close`);
      if (res.success) {
        showToast('success', 'Campaign closed! Unverified assets marked MISSING.');
        setShowCloseModal(false);
        fetchCampaigns();
        fetchCampaignDetails(selectedCampaignId);
      }
    } catch (err) {
      alert(err.message || 'Failed to close campaign');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RESOLVE EXCEPTION HANDLER
  // -------------------------------------------------------------
  const handleResolveException = async (e) => {
    e.preventDefault();
    if (!selectedException) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/stocktakes/exceptions/${selectedException._id}/resolve`, {
        resolutionStatus: 'RESOLVED',
        resolutionNotes
      });
      if (res.success) {
        showToast('success', 'Audit exception resolved!');
        setShowResolveModal(false);
        setSelectedException(null);
        setResolutionNotes('');
        fetchCampaignDetails(selectedCampaignId);
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve exception');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // EMBEDDED SCANNER SUBMIT HANDLER
  // -------------------------------------------------------------
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId || !scannedTag) return;

    const payload = {
      tagNumber: scannedTag,
      scanType,
      condition: 'GOOD'
    };

    if (isOffline) {
      const tx = await enqueueOfflineTransaction({
        type: 'STOCKTAKE_OBSERVATION',
        campaignId: selectedCampaignId,
        payload
      });
      setLastScanResult({ status: 'OFFLINE_QUEUED', uuid: tx.uuid });
      checkOfflineCount();
      showToast('success', 'Scan queued in offline storage');
    } else {
      setActionLoading(true);
      try {
        const res = await api.post(`/stocktakes/campaigns/${selectedCampaignId}/observe`, payload);
        if (res.success) {
          setLastScanResult({ status: 'SYNCED', observation: res.observation });
          showToast('success', 'Scan submitted & baseline reconciled!');
          fetchCampaignDetails(selectedCampaignId);
        }
      } catch (err) {
        // Fallback offline queue
        const tx = await enqueueOfflineTransaction({
          type: 'STOCKTAKE_OBSERVATION',
          campaignId: selectedCampaignId,
          payload
        });
        setLastScanResult({ status: 'OFFLINE_QUEUED', uuid: tx.uuid });
        checkOfflineCount();
      } finally {
        setActionLoading(false);
      }
    }
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredCampaigns = campaigns.filter(c => {
    const searchLower = campaignSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (c.campaignNumber && c.campaignNumber.toLowerCase().includes(searchLower)) ||
      (c.title && c.title.toLowerCase().includes(searchLower))
    );
    const matchesStatus = campaignStatusFilter === 'ALL' || c.status === campaignStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const { campaign, expectedAssets, observations, exceptions } = activeCampaignData;

  const filteredExpectedAssets = expectedAssets.filter(exp => {
    const assetObj = exp.assetId || {};
    const searchLower = detailSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (assetObj.assetId && assetObj.assetId.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower)) ||
      (assetObj.serialNumber && assetObj.serialNumber.toLowerCase().includes(searchLower))
    );
    const matchesStatus = expectedStatusFilter === 'ALL' || exp.status === expectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredExceptions = exceptions.filter(ex => {
    const assetObj = ex.assetId || {};
    const searchLower = detailSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (assetObj.assetId && assetObj.assetId.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower))
    );
    const matchesType = exceptionTypeFilter === 'ALL' || ex.exceptionType === exceptionTypeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE DASHBOARD TOP METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Campaigns</span>
          <span className="text-xl font-extrabold text-brand-600 block">{totalActiveCampaigns}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expected Assets</span>
          <span className="text-xl font-extrabold text-slate-900 block">{totalExpected}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verified Assets</span>
          <span className="text-xl font-extrabold text-emerald-600 block">{totalVerified}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Relocated Assets</span>
          <span className="text-xl font-extrabold text-amber-600 block">{totalRelocated}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Missing Assets</span>
          <span className="text-xl font-extrabold text-rose-600 block">{totalMissing}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unregistered</span>
          <span className="text-xl font-extrabold text-purple-600 block">{totalUnregistered}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Offline Queued</span>
          <span className="text-xl font-extrabold text-amber-600 block">{offlinePendingCount}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CAMPAIGNS LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'CAMPAIGNS_LIST' && (
        <div className="space-y-6">
          {/* Header & Launch Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-brand-600" /> Stocktake & Census Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Launch physical verification campaigns, execute mobile field scans, and resolve inventory variances
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLaunchModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Launch Stocktake Campaign
              </button>
              <button 
                onClick={fetchCampaigns}
                title="Refresh Campaigns"
                className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Campaign # or Title..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <select
                value={campaignStatusFilter}
                onChange={(e) => setCampaignStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Campaign Statuses</option>
                <option value="ACTIVE">ACTIVE Only</option>
                <option value="CLOSED">CLOSED Only</option>
                <option value="DRAFT">DRAFT Only</option>
              </select>

              {(campaignSearch || campaignStatusFilter !== 'ALL') && (
                <button
                  onClick={() => { setCampaignSearch(''); setCampaignStatusFilter('ALL'); }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Campaigns Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-600" /> Loading stocktake campaigns...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl space-y-3 bg-white shadow-xs">
              <ClipboardCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No campaigns found matching criteria.</p>
              <button
                onClick={() => setShowLaunchModal(true)}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                + Launch New Inventory Verification Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCampaigns.map(c => {
                const totalExp = c.stats?.totalExpected || 0;
                const totalVer = c.stats?.totalVerified || 0;
                const percent = totalExp > 0 ? Math.round((totalVer / totalExp) * 100) : 0;
                const isActive = c.status === 'ACTIVE';

                return (
                  <div 
                    key={c._id} 
                    className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 hover:border-brand-300 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Top Code & Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand-600 text-sm">{c.campaignNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {/* Title & Scope */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {c.scope?.siteId?.name || 'All Subnet Sites'}
                        </p>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Audit Completion</span>
                          <span className="font-mono font-bold text-brand-600">{percent}% ({totalVer}/{totalExp})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-brand-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats Breakdown Box */}
                      <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-xs">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Expected</span>
                          <span className="font-bold text-slate-900">{totalExp}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Verified</span>
                          <span className="font-bold text-emerald-600">{c.stats?.totalVerified || 0}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Relocated</span>
                          <span className="font-bold text-amber-600">{c.stats?.totalRelocated || 0}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Missing</span>
                          <span className="font-bold text-rose-600">{c.stats?.totalMissing || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Created: {formatDate(c.createdAt)}</span>
                      <button
                        onClick={() => openCampaignDetail(c._id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold border border-brand-200 transition-colors"
                      >
                        Open Workbench →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CAMPAIGN DETAIL WORKBENCH */}
      {/* ========================================================================= */}
      {viewMode === 'CAMPAIGN_DETAIL' && (
        <div className="space-y-6">
          {/* Top Return & Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('CAMPAIGNS_LIST')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                title="Back to Campaigns"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-600 text-sm">{campaign?.campaignNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    campaign?.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {campaign?.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{campaign?.title || 'Campaign Workbench'}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {campaign?.status === 'ACTIVE' && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="text-xs flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Close Campaign
                </button>
              )}
              <button
                onClick={() => fetchCampaignDetails(selectedCampaignId)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${detailLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Overall Audit Progress Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-3 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Campaign Reconciliation Progress</span>
              <span className="text-xs font-mono font-bold text-brand-600">
                {campaign?.stats?.totalVerified || 0} / {campaign?.stats?.totalExpected || 0} Assets Verified
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${campaign?.stats?.totalExpected > 0 ? Math.min(Math.round((campaign.stats.totalVerified / campaign.stats.totalExpected) * 100), 100) : 0}%` 
                }}
              ></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Expected Baseline</span>
                <span className="text-sm font-bold text-slate-900">{campaign?.stats?.totalExpected || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Verified Correct</span>
                <span className="text-sm font-bold text-emerald-600">{campaign?.stats?.totalVerified || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Relocated Variances</span>
                <span className="text-sm font-bold text-amber-600">{campaign?.stats?.totalRelocated || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Missing Assets</span>
                <span className="text-sm font-bold text-rose-600">{campaign?.stats?.totalMissing || 0}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Unregistered Scans</span>
                <span className="text-sm font-bold text-purple-600">{campaign?.stats?.totalUnregistered || 0}</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveSubTab('EXPECTED')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'EXPECTED' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" /> 1. Expected Baseline ({expectedAssets.length})
            </button>
            <button
              onClick={() => setActiveSubTab('OBSERVATIONS')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'OBSERVATIONS' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 2. Live Field Observations ({observations.length})
            </button>
            <button
              onClick={() => setActiveSubTab('EXCEPTIONS')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'EXCEPTIONS' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" /> 3. Audit Exceptions ({exceptions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('SCANNER')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'SCANNER' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" /> 4. Field Mobile Scanner
            </button>
          </div>

          {/* SUB-TAB 1: EXPECTED ASSETS */}
          {activeSubTab === 'EXPECTED' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Expected Asset ID, Description..."
                    value={detailSearch}
                    onChange={(e) => setDetailSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-500 font-medium">Audit Status:</span>
                  <select
                    value={expectedStatusFilter}
                    onChange={(e) => setExpectedStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="ALL">All Expected Assets</option>
                    <option value="PENDING">PENDING (Unverified)</option>
                    <option value="VERIFIED_CORRECT">VERIFIED_CORRECT</option>
                    <option value="RELOCATED">RELOCATED</option>
                    <option value="MISSING">MISSING</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Assets Audit Baseline</h3>
                  <span className="text-xs text-slate-500">Showing {filteredExpectedAssets.length} assets</span>
                </div>

                {filteredExpectedAssets.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-500">No expected assets matching filter.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredExpectedAssets.map(exp => {
                      const assetObj = exp.assetId || {};
                      return (
                        <div key={exp._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-brand-600">{assetObj.assetId || 'AST-N/A'}</span>
                              <span className="text-slate-500">| Serial: <span className="font-mono text-slate-700">{assetObj.serialNumber || 'N/A'}</span></span>
                            </div>
                            <p className="font-semibold text-slate-900">{assetObj.description || 'Expected Asset'}</p>
                            <p className="text-[11px] text-slate-500">
                              Expected Site: <span className="text-slate-700">{exp.expectedSiteId?.name || 'Default Site'}</span> | Room: <span className="text-slate-700">{exp.expectedRoomId?.name || 'Default Room'}</span>
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            exp.status === 'VERIFIED_CORRECT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            exp.status === 'RELOCATED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            exp.status === 'MISSING' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {exp.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: OBSERVED SCANS */}
          {activeSubTab === 'OBSERVATIONS' && (
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Live Field Observations Stream
              </h3>

              {observations.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">No field scans recorded for this campaign yet.</p>
              ) : (
                <div className="space-y-2">
                  {observations.map(obs => (
                    <div key={obs._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-600">{obs.scannedTagNumber || obs.scannedSerial || 'TAG-UNKNOWN'}</span>
                          <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-[10px] font-bold border border-brand-200">
                            {obs.scanType}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{obs.assetId?.description || 'Scanned Device'}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block font-mono text-[11px]">{new Date(obs.timestamp).toLocaleTimeString()}</span>
                        <span className="text-[10px] text-slate-500 block">By: {obs.observedBy?.fullName || 'Auditor'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: EXCEPTIONS */}
          {activeSubTab === 'EXCEPTIONS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-semibold uppercase">Filter Exception Type:</span>
                <select
                  value={exceptionTypeFilter}
                  onChange={(e) => setExceptionTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-800 focus:border-rose-500"
                >
                  <option value="ALL">All Exception Types</option>
                  <option value="RELOCATED">RELOCATED (Wrong Room)</option>
                  <option value="MISSING">MISSING (Unscanned)</option>
                  <option value="UNREGISTERED">UNREGISTERED (Unknown Tag)</option>
                </select>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-xs">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Audit Variance Exceptions
                </h3>

                {filteredExceptions.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-500">No audit exceptions logged.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredExceptions.map(ex => {
                      const isResolved = ex.resolutionStatus === 'RESOLVED';
                      return (
                        <div key={ex._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-rose-600">{ex.exceptionType}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {ex.resolutionStatus}
                              </span>
                            </div>
                            <p className="text-slate-800 font-semibold">{ex.assetId?.description || ex.details?.scannedTagNumber || 'Asset Variance'}</p>
                            {ex.resolutionNotes && <p className="text-[11px] text-slate-500 italic">"Notes: {ex.resolutionNotes}"</p>}
                          </div>

                          {!isResolved && (
                            <button
                              onClick={() => { setSelectedException(ex); setShowResolveModal(true); }}
                              className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors"
                            >
                              Resolve Exception
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: EMBEDDED FIELD SCANNER */}
          {activeSubTab === 'SCANNER' && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Mobile Field Scanner</h3>
                  <p className="text-[10px] text-slate-500">Capture barcode or RFID tags on floor</p>
                </div>

                <button
                  onClick={() => setIsOffline(!isOffline)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    isOffline ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {isOffline ? 'Offline Mode' : 'Online Sync'}
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-xs">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setScanType('BARCODE')}
                    className={`py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 ${
                      scanType === 'BARCODE' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Camera Barcode
                  </button>
                  <button
                    onClick={() => setScanType('RFID')}
                    className={`py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 ${
                      scanType === 'RFID' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" /> UHF RFID Reader
                  </button>
                </div>

                <form onSubmit={handleScanSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Scanned Tag Number / EPC</label>
                    <input
                      type="text"
                      value={scannedTag}
                      onChange={(e) => setScannedTag(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center font-mono font-bold text-brand-600 text-sm focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 justify-center font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Submit Field Observation Scan
                  </button>
                </form>

                {lastScanResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">Scan Observation Recorded!</p>
                    <p className="text-[11px] text-slate-600">
                      {lastScanResult.status === 'OFFLINE_QUEUED' 
                        ? `Queued in IndexedDB (UUID: ${lastScanResult.uuid})`
                        : `Reconciled with baseline at ${new Date().toLocaleTimeString()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LAUNCH CAMPAIGN */}
      {/* ========================================================================= */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-600" /> Launch Stocktake Campaign
              </h2>
              <button onClick={() => setShowLaunchModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Q3 Corporate IT Hardware Census"
                  value={launchForm.title}
                  onChange={(e) => setLaunchForm({ ...launchForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Scope Site</label>
                  <select
                    value={launchForm.siteId}
                    onChange={(e) => setLaunchForm({ ...launchForm, siteId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-brand-500"
                  >
                    <option value="">-- All Subnet Sites --</option>
                    {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Scope Category</label>
                  <select
                    value={launchForm.categoryId}
                    onChange={(e) => setLaunchForm({ ...launchForm, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-brand-500"
                  >
                    <option value="">-- All Asset Categories --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CLOSE CAMPAIGN CONFIRMATION */}
      {/* ========================================================================= */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-900">Close Audit Campaign?</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to close this stocktake campaign? All remaining unverified expected assets will be automatically marked as <span className="font-bold text-rose-600">MISSING</span> and their master asset statuses will be updated.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Expected Assets:</span>
                <span className="font-bold text-slate-900">{campaign?.stats?.totalExpected || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Verified Correct:</span>
                <span>{campaign?.stats?.totalVerified || 0}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Pending (Will become MISSING):</span>
                <span>{(campaign?.stats?.totalExpected || 0) - (campaign?.stats?.totalVerified || 0)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCampaign}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Confirm Campaign Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESOLVE EXCEPTION */}
      {/* ========================================================================= */}
      {showResolveModal && selectedException && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Resolve Audit Exception
              </h2>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveException} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="text-rose-600 font-bold">{selectedException.exceptionType} Exception</p>
                <p className="text-slate-900 font-semibold">{selectedException.assetId?.description || 'Variance Item'}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Resolution Audit Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain resolution (e.g. Asset physically verified in server room B, location updated)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Mark Exception Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StocktakeManager;
