import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  DollarSign, 
  Play, 
  CheckCircle2, 
  Lock, 
  Calendar, 
  Building, 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Calculator, 
  FileText, 
  ShieldCheck,
  TrendingDown,
  BookOpen
} from 'lucide-react';

export function FinancialWorkbench() {
  const [activeTab, setActiveTab] = useState('CALCULATE'); // 'CALCULATE' | 'PERIODS' | 'HISTORY'

  // Data State
  const [summary, setSummary] = useState(null);
  const [runs, setRuns] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filters
  const [runSearch, setRunSearch] = useState('');
  const [runStatusFilter, setRunStatusFilter] = useState('ALL'); // 'ALL' | 'DRAFT' | 'POSTED'
  const [bookTypeFilter, setBookTypeFilter] = useState('ALL'); // 'ALL' | 'CORPORATE' | 'TAX' | 'MANAGEMENT'

  // Form State: Calculate Run
  const [calcForm, setCalcForm] = useState({
    companyId: '',
    fiscalPeriodId: '',
    bookType: 'CORPORATE'
  });

  // Modals / Drawers
  const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedRunForPost, setSelectedRunForPost] = useState(null);

  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [reviewRunData, setReviewRunData] = useState({ depRun: null, entries: [] });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Form State: Create Period
  const [periodForm, setPeriodForm] = useState({
    companyId: '',
    year: new Date().getFullYear(),
    periodNumber: 1,
    periodName: `${new Date().getFullYear()}-01`,
    startDate: '',
    endDate: ''
  });

  // Helper Toast
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------
  const loadWorkbenchData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, pRes, cRes] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/depreciation'),
        api.get('/finance/periods'),
        api.get('/master-data/companies')
      ]);

      if (sRes.success) setSummary(sRes.summary);
      if (rRes.success) setRuns(rRes.runs || []);
      if (pRes.success) setPeriods(pRes.periods || []);
      if (cRes.success) {
        setCompanies(cRes.companies || []);
        if (cRes.companies?.length > 0 && !calcForm.companyId) {
          setCalcForm(prev => ({ ...prev, companyId: cRes.companies[0]._id }));
          setPeriodForm(prev => ({ ...prev, companyId: cRes.companies[0]._id }));
        }
      }

      // Preselect first open period if available
      if (pRes.success && pRes.periods?.length > 0) {
        const openPeriod = pRes.periods.find(p => !p.isClosed);
        if (openPeriod) {
          setCalcForm(prev => ({ ...prev, fiscalPeriodId: openPeriod._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkbenchData();
  }, []);

  // -------------------------------------------------------------
  // HANDLERS: CALCULATE DEPRECIATION (DRAFT)
  // -------------------------------------------------------------
  const handleRunDepreciation = async (e) => {
    e.preventDefault();
    if (!calcForm.companyId || !calcForm.fiscalPeriodId) {
      alert('Please select a company and an open fiscal period.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/finance/depreciation/run', calcForm);
      if (res.success) {
        showToast('success', `Draft Depreciation Run ${res.depRun?.runNumber || ''} calculated successfully!`);
        loadWorkbenchData();
        // Automatically open review drawer for the new run
        openRunDetails(res.depRun._id);
      }
    } catch (err) {
      alert(err.message || 'Depreciation calculation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: DRAFT REVIEW DRAWER
  // -------------------------------------------------------------
  const openRunDetails = async (runId) => {
    setShowReviewDrawer(true);
    setReviewLoading(true);
    try {
      const res = await api.get(`/finance/depreciation/${runId}`);
      if (res.success) {
        setReviewRunData({
          depRun: res.depRun,
          entries: res.entries || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch run details:', err);
      showToast('error', 'Failed to load run entries');
    } finally {
      setReviewLoading(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: POST & LOCK RUN
  // -------------------------------------------------------------
  const handleConfirmPostRun = async () => {
    if (!selectedRunForPost) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/finance/depreciation/${selectedRunForPost._id}/post`);
      if (res.success) {
        showToast('success', `Run ${selectedRunForPost.runNumber} posted to General Ledger & locked!`);
        setShowPostModal(false);
        setSelectedRunForPost(null);
        loadWorkbenchData();
        if (showReviewDrawer) setShowReviewDrawer(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to post depreciation run');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: FISCAL PERIODS
  // -------------------------------------------------------------
  const handleTogglePeriodStatus = async (periodId) => {
    try {
      const res = await api.post(`/finance/periods/${periodId}/toggle`);
      if (res.success) {
        showToast('success', `Fiscal period ${res.period?.periodName || ''} status updated!`);
        loadWorkbenchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle period status');
    }
  };

  const handleCreatePeriodSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/finance/periods', periodForm);
      if (res.success) {
        showToast('success', `Fiscal period ${res.period?.periodName || ''} created successfully!`);
        setShowCreatePeriodModal(false);
        loadWorkbenchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create fiscal period');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredRuns = runs.filter(r => {
    const searchLower = runSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (r.runNumber && r.runNumber.toLowerCase().includes(searchLower)) ||
      (r.companyId?.name && r.companyId.name.toLowerCase().includes(searchLower)) ||
      (r.fiscalPeriodId?.periodName && r.fiscalPeriodId.periodName.toLowerCase().includes(searchLower))
    );
    const matchesStatus = runStatusFilter === 'ALL' || r.status === runStatusFilter;
    const matchesBook = bookTypeFilter === 'ALL' || r.bookType === bookTypeFilter;
    return matchesSearch && matchesStatus && matchesBook;
  });

  const formatCurrency = (val) => {
    if (!val) return '$0.00';
    const num = parseFloat(val.toString());
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-600" /> Financial Workbench & Depreciation Engine
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Execute straight-line depreciation calculations, manage fiscal periods, and post General Ledger entries
          </p>
        </div>

        <button 
          onClick={loadWorkbenchData}
          title="Refresh Financial Data"
          className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all self-end sm:self-auto flex items-center gap-2 text-xs shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Financials
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE FINANCIAL DASHBOARD SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Asset Value</span>
          <span className="text-lg font-extrabold text-slate-900 block truncate">{formatCurrency(summary?.totalAssetValue)}</span>
        </div>
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accumulated Dep.</span>
          <span className="text-lg font-extrabold text-amber-600 block truncate">{formatCurrency(summary?.totalAccumulatedDep)}</span>
        </div>
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Book Value (NBV)</span>
          <span className="text-lg font-extrabold text-emerald-600 block truncate">{formatCurrency(summary?.totalNetBookValue)}</span>
        </div>
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Period Dep.</span>
          <span className="text-lg font-extrabold text-brand-600 block truncate">{formatCurrency(summary?.currentPeriodDep)}</span>
        </div>
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Draft Runs</span>
          <span className="text-lg font-extrabold text-amber-600 block">{summary?.draftRunsCount || 0}</span>
        </div>
        <div className="bg-white p-4 space-y-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Posted Runs</span>
          <span className="text-lg font-extrabold text-emerald-600 block">{summary?.postedRunsCount || 0}</span>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('CALCULATE')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'CALCULATE' ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" /> 1. Calculate Monthly Depreciation
        </button>

        <button
          onClick={() => setActiveTab('PERIODS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'PERIODS' ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> 2. Fiscal Calendar ({periods.length} Periods)
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'HISTORY' ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 3. Depreciation Ledger ({runs.length} Runs)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CALCULATE DEPRECIATION */}
      {/* ========================================================================= */}
      {activeTab === 'CALCULATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Run Trigger */}
          <div className="bg-white p-6 space-y-5 lg:col-span-2 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" /> Calculate Monthly Depreciation Batch
            </h3>

            <form onSubmit={handleRunDepreciation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Company Legal Entity *</label>
                  <select
                    value={calcForm.companyId}
                    onChange={(e) => setCalcForm({ ...calcForm, companyId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-brand-500 font-medium"
                  >
                    <option value="">-- Choose Company --</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Open Fiscal Period *</label>
                  <select
                    value={calcForm.fiscalPeriodId}
                    onChange={(e) => setCalcForm({ ...calcForm, fiscalPeriodId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-brand-500 font-medium"
                  >
                    <option value="">-- Choose Open Fiscal Period --</option>
                    {periods.map(p => (
                      <option key={p._id} value={p._id} disabled={p.isClosed}>
                        {p.periodName} ({p.isClosed ? 'CLOSED' : 'OPEN'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Valuation Book Type *</label>
                <select
                  value={calcForm.bookType}
                  onChange={(e) => setCalcForm({ ...calcForm, bookType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-brand-700 font-bold"
                >
                  <option value="CORPORATE">CORPORATE (Primary Financial Ledger)</option>
                  <option value="TAX">TAX (IRS / Statutory Depreciation)</option>
                  <option value="MANAGEMENT">MANAGEMENT (Internal Cost Accounting)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-xs text-xs"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Execute Monthly Straight-Line Depreciation
                </button>
              </div>
            </form>
          </div>

          {/* Right Explanatory Box: Formula & Rules */}
          <div className="bg-white p-6 space-y-4 border border-slate-200 rounded-xl shadow-xs">
            <h3 className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Financial Calculation Rules
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Straight-Line Formula</span>
                <p className="font-mono text-emerald-600 text-[11px]">
                  Depreciable Base = Cost - Salvage Value
                </p>
                <p className="font-mono text-brand-600 text-[11px]">
                  Monthly Dep. = Base / Useful Life Months
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Residual Floor Protection</span>
                <p className="text-slate-600 text-[11px]">
                  Asset Net Book Value (NBV) is strictly prevented from dropping below its residual salvage floor.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-600 block">High Precision Math</span>
                <p className="text-slate-600 text-[11px]">
                  Calculations execute via <code className="text-brand-600 font-semibold">decimal.js</code> using Decimal128, ensuring zero floating-point rounding errors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FISCAL CALENDAR & PERIOD MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'PERIODS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" /> Accounting Fiscal Calendar
            </h3>
            <button
              onClick={() => setShowCreatePeriodModal(true)}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Fiscal Period
            </button>
          </div>

          <div className="bg-white p-5 space-y-3 rounded-xl border border-slate-200 shadow-xs">
            {periods.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No fiscal periods created yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods.map(p => {
                  const isClosed = p.isClosed;
                  return (
                    <div 
                      key={p._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand-600 text-sm">{p.periodName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isClosed 
                            ? 'bg-slate-100 text-slate-500 border-slate-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isClosed ? 'CLOSED' : 'OPEN'}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600">
                        <p>Company: <span className="text-slate-900 font-semibold">{p.companyId?.name || 'N/A'}</span></p>
                        <p>Year: <span className="text-slate-900 font-mono">{p.year}</span> | Period #: <span className="text-slate-900 font-mono">{p.periodNumber}</span></p>
                        <p>Dates: <span className="text-slate-900 font-mono">{formatDate(p.startDate)} - {formatDate(p.endDate)}</span></p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => handleTogglePeriodStatus(p._id)}
                          className={`text-[11px] font-semibold hover:underline flex items-center gap-1 ${
                            isClosed ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {isClosed ? 'Reopen Fiscal Period' : 'Close Fiscal Period'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEPRECIATION LEDGER & HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Run #, Period, Company..."
                value={runSearch}
                onChange={(e) => setRunSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <select
                value={runStatusFilter}
                onChange={(e) => setRunStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">DRAFT (Unposted)</option>
                <option value="POSTED">POSTED (Locked)</option>
              </select>

              <span className="text-xs text-slate-500 font-medium">Book:</span>
              <select
                value={bookTypeFilter}
                onChange={(e) => setBookTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Valuation Books</option>
                <option value="CORPORATE">CORPORATE</option>
                <option value="TAX">TAX</option>
                <option value="MANAGEMENT">MANAGEMENT</option>
              </select>

              {(runSearch || runStatusFilter !== 'ALL' || bookTypeFilter !== 'ALL') && (
                <button
                  onClick={() => { setRunSearch(''); setRunStatusFilter('ALL'); setBookTypeFilter('ALL'); }}
                  className="text-xs text-brand-600 hover:text-brand-700 underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Runs Ledger Table */}
          <div className="bg-white p-5 space-y-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" /> Depreciation Calculation Ledger History
              </h3>
              <span className="text-xs text-slate-500">Showing {filteredRuns.length} runs</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading depreciation runs...
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <DollarSign className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No depreciation runs matching filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRuns.map(r => {
                  const isPosted = r.status === 'POSTED';
                  const isPeriodClosed = r.fiscalPeriodId?.isClosed;

                  return (
                    <div 
                      key={r._id} 
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all hover:border-slate-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-600 text-sm">{r.runNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            isPosted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {r.status === 'DRAFT' ? 'DRAFT — Not Posted' : 'POSTED'}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                            {r.bookType}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold">
                          Period: <span className="text-brand-600">{r.fiscalPeriodId?.periodName || 'N/A'}</span> | Company: <span className="text-slate-900">{r.companyId?.name || 'Corporate Entity'}</span>
                        </p>
                        <p className="text-slate-600">
                          Processed <span className="font-semibold text-slate-900">{r.totalAssetsProcessed} Assets</span> | Total Depreciation Amount: <span className="font-bold text-amber-600 font-mono">{formatCurrency(r.totalDepreciationAmount)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openRunDetails(r._id)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-600" /> Review Entries
                        </button>

                        {!isPosted && (
                          <button
                            onClick={() => { setSelectedRunForPost(r); setShowPostModal(true); }}
                            disabled={isPeriodClosed}
                            className={`text-xs px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 ${
                              isPeriodClosed 
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" /> Post & Lock Run
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: DRAFT REVIEW & LINE ITEM ENTRIES */}
      {/* ========================================================================= */}
      {showReviewDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-600 text-base">{reviewRunData.depRun?.runNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    reviewRunData.depRun?.status === 'POSTED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {reviewRunData.depRun?.status === 'DRAFT' ? 'DRAFT — Not Posted' : 'POSTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Period: <span className="text-slate-900 font-semibold">{reviewRunData.depRun?.fiscalPeriodId?.periodName}</span> | Book: <span className="text-emerald-600 font-semibold">{reviewRunData.depRun?.bookType}</span>
                </p>
              </div>

              <button onClick={() => setShowReviewDrawer(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line Items Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {reviewLoading ? (
                <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading calculation line items...
                </div>
              ) : reviewRunData.entries.length === 0 ? (
                <p className="p-8 text-center text-slate-500">No asset calculation entries in this run.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2 font-semibold text-slate-600 uppercase text-[10px] px-3 pb-1 border-b border-slate-200">
                    <span className="col-span-2">Asset Details</span>
                    <span className="text-right">Opening NBV</span>
                    <span className="text-right">Monthly Dep.</span>
                    <span className="text-right">Accumulated</span>
                    <span className="text-right">Closing NBV</span>
                  </div>

                  {reviewRunData.entries.map(e => {
                    const assetObj = e.assetId || {};
                    return (
                      <div key={e._id} className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 items-center">
                        <div className="col-span-2 space-y-0.5">
                          <span className="font-mono font-bold text-brand-600">{assetObj.assetId}</span>
                          <p className="text-slate-900 font-medium truncate">{assetObj.description}</p>
                        </div>
                        <span className="text-right font-mono text-slate-700">{formatCurrency(e.openingNetBookValue)}</span>
                        <span className="text-right font-mono font-bold text-amber-600">{formatCurrency(e.depreciationAmount)}</span>
                        <span className="text-right font-mono text-slate-700">{formatCurrency(e.accumulatedDepreciation)}</span>
                        <span className="text-right font-mono font-bold text-emerald-600">{formatCurrency(e.closingNetBookValue)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Entries: <span className="font-semibold text-slate-900">{reviewRunData.entries.length}</span></span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewDrawer(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Close Review
                </button>
                {reviewRunData.depRun?.status === 'DRAFT' && (
                  <button
                    onClick={() => { setSelectedRunForPost(reviewRunData.depRun); setShowPostModal(true); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <Lock className="w-4 h-4" /> Post & Lock Run
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POST & LOCK CONFIRMATION */}
      {/* ========================================================================= */}
      {showPostModal && selectedRunForPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-600">
              <Lock className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-900">Post & Lock Depreciation Run?</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Posting will permanently update master asset financial balances (<code className="text-emerald-600 font-semibold">AssetBookValue.netBookValue</code> & <code className="text-amber-600 font-semibold">accumulatedDepreciation</code>) in the General Ledger and lock this run.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Run Number:</span>
                <span className="font-mono font-bold text-brand-600">{selectedRunForPost.runNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Assets Processed:</span>
                <span className="font-semibold text-slate-900">{selectedRunForPost.totalAssetsProcessed}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Depreciation:</span>
                <span className="font-bold text-amber-600 font-mono">{formatCurrency(selectedRunForPost.totalDepreciationAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPostRun}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Confirm Post & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE FISCAL PERIOD */}
      {/* ========================================================================= */}
      {showCreatePeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" /> Create Fiscal Period
              </h2>
              <button onClick={() => setShowCreatePeriodModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriodSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Entity *</label>
                <select
                  value={periodForm.companyId}
                  onChange={(e) => setPeriodForm({ ...periodForm, companyId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="">-- Choose Company --</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Fiscal Year</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Period # (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={periodForm.periodNumber}
                    onChange={(e) => setPeriodForm({ ...periodForm, periodNumber: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Period Name</label>
                  <input
                    type="text"
                    value={periodForm.periodName}
                    onChange={(e) => setPeriodForm({ ...periodForm, periodName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={periodForm.startDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={periodForm.endDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePeriodModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Create Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialWorkbench;
