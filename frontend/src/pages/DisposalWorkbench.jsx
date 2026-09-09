import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { 
  Trash2, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Eye, 
  Archive, 
  Award, 
  HelpCircle,
  ChevronRight,
  UserCheck,
  Building,
  Tag
} from 'lucide-react';

export function DisposalWorkbench() {
  // Primary Data States
  const [summary, setSummary] = useState(null);
  const [disposedAssets, setDisposedAssets] = useState([]);
  const [candidateAssets, setCandidateAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Candidate Selection State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Form State
  const [disposalMethod, setDisposalMethod] = useState('SCRAP'); // 'SCRAP' | 'SALE' | 'WRITE_OFF' | 'DONATION'
  const [proceeds, setProceeds] = useState('0');
  const [reason, setReason] = useState('');
  
  // Safety Checklist State
  const [checklist, setChecklist] = useState({
    dataBackup: false,
    dataWipe: false,
    physicallyTagged: false
  });

  // Modal & Drawer States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDisposedAsset, setSelectedDisposedAsset] = useState(null);

  // History Search & Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, dispRes, assetsRes] = await Promise.all([
        api.get('/disposals/summary').catch(() => ({ success: false })),
        api.get('/disposals'),
        api.get('/assets?limit=400').catch(() => ({ success: false, assets: [] }))
      ]);

      if (dispRes.success) setDisposedAssets(dispRes.assets || []);

      if (assetsRes.success) {
        // Filter candidate assets: only active assets not already retired or disposed
        const validCandidates = (assetsRes.assets || []).filter(
          a => a.active !== false && a.lifecycleStatus !== 'DISPOSED' && a.lifecycleStatus !== 'RETIRED'
        );
        setCandidateAssets(validCandidates);
      }

      if (sumRes.success && sumRes.summary) {
        setSummary(sumRes.summary);
      } else {
        // Fallback frontend metrics calculation
        const allFetched = assetsRes.assets || [];
        const disposedFetched = dispRes.assets || [];

        let activeCandidatesCount = 0;
        let disposedCount = 0;
        let retiredCount = 0;

        allFetched.forEach(a => {
          if (a.lifecycleStatus === 'DISPOSED') disposedCount++;
          else if (a.lifecycleStatus === 'RETIRED') retiredCount++;
          else if (a.active !== false) activeCandidatesCount++;
        });

        let totalProceeds = 0;
        disposedFetched.forEach(d => {
          if (d.disposalTx?.notes) {
            const match = d.disposalTx.notes.match(/Proceeds:\s*\$?([\d.]+)/i);
            if (match && match[1]) {
              const val = parseFloat(match[1]);
              if (!isNaN(val)) totalProceeds += val;
            }
          }
        });

        setSummary({
          activeCandidatesCount,
          disposedCount,
          retiredCount,
          totalProceeds
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load disposal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Selected Candidate Asset Object
  const selectedCandidateObj = useMemo(() => {
    return candidateAssets.find(a => a._id === selectedAssetId) || null;
  }, [candidateAssets, selectedAssetId]);

  // Pre-Disposal Validation
  const validationError = useMemo(() => {
    if (!selectedCandidateObj) return null;
    if (selectedCandidateObj.lifecycleStatus === 'DISPOSED' || selectedCandidateObj.lifecycleStatus === 'RETIRED' || selectedCandidateObj.active === false) {
      return `This asset (${selectedCandidateObj.tagNumber || selectedCandidateObj.assetId}) has already been disposed of or retired.`;
    }
    return null;
  }, [selectedCandidateObj]);

  // Filtered Candidates for Dropdown/Search
  const filteredCandidates = useMemo(() => {
    if (!candidateSearch) return candidateAssets;
    const q = candidateSearch.toLowerCase();
    return candidateAssets.filter(a => 
      a.tagNumber?.toLowerCase().includes(q) ||
      a.assetId?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  }, [candidateAssets, candidateSearch]);

  // Filtered Disposed History
  const filteredDisposedHistory = useMemo(() => {
    return disposedAssets.filter(d => {
      const q = historySearch.toLowerCase();
      const matchesSearch = 
        !historySearch ||
        d.tagNumber?.toLowerCase().includes(q) ||
        d.assetId?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q);

      const matchesStatus = historyStatusFilter === 'ALL' || d.lifecycleStatus === historyStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [disposedAssets, historySearch, historyStatusFilter]);

  // Form Submit Review Trigger
  const handleInitiateReview = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedCandidateObj) {
      showToast('Please select a valid asset for disposal', 'error');
      return;
    }

    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    if (!reason.trim()) {
      showToast('Disposal reason/justification is required', 'error');
      return;
    }

    if (proceeds && parseFloat(proceeds) < 0) {
      showToast('Proceeds cannot be negative', 'error');
      return;
    }

    setShowReviewModal(true);
  };

  // Final Disposal Submission API
  const handleConfirmDisposal = async () => {
    setActionLoading(true);
    try {
      const payload = {
        assetId: selectedAssetId,
        method: disposalMethod,
        estimatedProceeds: proceeds ? parseFloat(proceeds) : 0,
        reason: reason.trim()
      };

      const res = await api.post('/disposals/initiate', payload);
      if (res.success) {
        showToast(`Asset ${selectedCandidateObj?.tagNumber || selectedCandidateObj?.assetId} successfully retired and disposed!`);
        setShowReviewModal(false);
        setSelectedAssetId('');
        setReason('');
        setProceeds('0');
        setChecklist({ dataBackup: false, dataWipe: false, physicallyTagged: false });
        await loadData();
      } else {
        showToast(res.message || 'Failed to dispose asset', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error executing asset disposal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Notification Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl border text-sm flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-7 h-7 text-rose-600" />
            Asset Disposal & Retirement
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage end-of-life decommissions, scrap, sales, write-offs, financial proceeds, and immutable audit logs
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-xs"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Executive KPI Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Available Candidates</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.activeCandidatesCount ?? '-'}</p>
          <span className="text-[10px] text-brand-600">Active operational assets</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Disposed Assets</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{summary?.disposedCount ?? '-'}</p>
          <span className="text-[10px] text-rose-600">Decommissioned</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Retired Assets</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary?.retiredCount ?? '-'}</p>
          <span className="text-[10px] text-amber-600">Archived from service</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Recovery Proceeds</p>
          <p className="text-xl font-bold text-emerald-600 mt-1 truncate">
            ${(summary?.totalProceeds || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Liquidation proceeds</span>
        </div>
      </div>

      {/* MAIN WORKBENCH LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INITIATE DISPOSAL FORM (1 col) */}
        <form onSubmit={handleInitiateReview} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 h-fit shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Initiate Disposal Workflow
            </h3>
            <p className="text-[11px] text-slate-500">Decommission asset and record financial recovery</p>
          </div>

          {/* Candidate Asset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Select Target Asset <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Search candidate asset pool..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />

            <select
              required
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            >
              <option value="">-- Choose Candidate Asset ({filteredCandidates.length}) --</option>
              {filteredCandidates.map(a => (
                <option key={a._id} value={a._id}>
                  {a.tagNumber || a.assetId} - {a.description} ({a.lifecycleStatus || 'ACTIVE'})
                </option>
              ))}
            </select>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Selected Asset Summary Card */}
          {selectedCandidateObj && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-rose-600">{selectedCandidateObj.tagNumber || selectedCandidateObj.assetId}</span>
                  <p className="font-semibold text-slate-900">{selectedCandidateObj.description}</p>
                </div>
                <span className="px-2 py-0.5 bg-white text-slate-700 rounded text-[10px] border border-slate-200">
                  {selectedCandidateObj.lifecycleStatus || 'ACTIVE'}
                </span>
              </div>
              {selectedCandidateObj.serialNumber && (
                <p className="text-[10px] font-mono text-slate-500">S/N: {selectedCandidateObj.serialNumber}</p>
              )}
            </div>
          )}

          {/* Disposal Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Disposal Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SCRAP', label: 'SCRAP', desc: 'E-waste / recycling' },
                { id: 'SALE', label: 'SALE', desc: 'Market resale' },
                { id: 'WRITE_OFF', label: 'WRITE_OFF', desc: 'Loss / total damage' },
                { id: 'DONATION', label: 'DONATION', desc: 'Charitable transfer' }
              ].map(m => (
                <div
                  key={m.id}
                  onClick={() => setDisposalMethod(m.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                    disposalMethod === m.id 
                      ? 'bg-rose-50 border-rose-300 text-rose-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-[11px] text-slate-900">{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Proceeds */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Recovery Proceeds ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={proceeds}
              onChange={(e) => setProceeds(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Disposal Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. End of useful life, beyond economical repair, obsolete server hardware..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* IT Pre-Disposal Safety Checklist */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block">Pre-Disposal Safety Checklist</span>
            <label 
              onClick={() => setChecklist(c => ({ ...c, dataBackup: !c.dataBackup }))}
              className="flex items-center gap-2 cursor-pointer text-slate-700"
            >
              {checklist.dataBackup ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Data has been backed up</span>
            </label>
            <label 
              onClick={() => setChecklist(c => ({ ...c, dataWipe: !c.dataWipe }))}
              className="flex items-center gap-2 cursor-pointer text-slate-700"
            >
              {checklist.dataWipe ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Secure data wipe completed</span>
            </label>
            <label 
              onClick={() => setChecklist(c => ({ ...c, physicallyTagged: !c.physicallyTagged }))}
              className="flex items-center gap-2 cursor-pointer text-slate-700"
            >
              {checklist.physicallyTagged ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Asset physically tagged for decommission</span>
            </label>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={!selectedAssetId || !!validationError}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Review & Approve Retirement
          </button>
        </form>

        {/* HISTORICAL DISPOSED ASSET ARCHIVE (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* History Search & Filters */}
          <div className="bg-white p-4 rounded-xl space-y-3 border border-slate-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search historical disposal archive by tag, ID, description..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DISPOSED">DISPOSED</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Archive className="w-4 h-4 text-rose-600" /> Historical Disposed Asset Archive ({filteredDisposedHistory.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-rose-600" /> Loading disposal archive...
              </div>
            ) : filteredDisposedHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No disposed or retired asset records found in archive.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Asset Tag & ID</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Category / Location</th>
                      <th className="p-3">Lifecycle Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-900">
                    {filteredDisposedHistory.map(d => (
                      <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-rose-600">
                          {d.tagNumber || d.assetId}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {d.description}
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{d.categoryId?.name || 'Category'}</div>
                          <div className="text-[10px] text-slate-500">{d.siteId?.name || ''}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {d.lifecycleStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedDisposedAsset(d)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-rose-600 hover:text-rose-700 rounded border border-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISPOSAL REVIEW & APPROVAL MODAL */}
      {showReviewModal && selectedCandidateObj && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Confirm Irreversible Asset Disposal
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <p className="font-bold mb-0.5">⚠️ Irreversible Lifecycle Operation</p>
              <p>Disposal is permanent. The asset will be deactivated and removed from active operational workflows.</p>
            </div>

            {/* Review Summary */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Target Asset</span>
                <span className="font-mono font-bold text-rose-600 text-sm">{selectedCandidateObj.tagNumber || selectedCandidateObj.assetId}</span>
                <p className="font-semibold text-slate-900">{selectedCandidateObj.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-2">
                <div>
                  <span className="text-slate-500 block">Disposal Method</span>
                  <span className="font-bold text-slate-900">{disposalMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Recovery Proceeds</span>
                  <span className="font-bold text-emerald-600">${parseFloat(proceeds || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 block">Justification</span>
                <p className="text-slate-900 font-medium whitespace-pre-wrap">{reason}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisposal}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Approve & Retire Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPOSED ASSET DETAILS DRAWER */}
      {selectedDisposedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-rose-600">{selectedDisposedAsset.tagNumber || selectedDisposedAsset.assetId}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedDisposedAsset.description}</h2>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold mt-1 inline-block">
                  {selectedDisposedAsset.lifecycleStatus}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDisposedAsset(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Asset Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-900">{selectedDisposedAsset.categoryId?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Site</span>
                <span className="font-semibold text-slate-900">{selectedDisposedAsset.siteId?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Serial Number</span>
                <span className="font-mono text-slate-700">{selectedDisposedAsset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Active Status</span>
                <span className="font-semibold text-rose-600">Deactivated (false)</span>
              </div>
            </div>

            {/* Disposal Transaction Audit Details */}
            {selectedDisposedAsset.disposalTx && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-600" /> Transaction Audit Record
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Transaction Type</span>
                    <span className="font-mono font-bold text-rose-600">{selectedDisposedAsset.disposalTx.transactionType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Performed By</span>
                    <span className="font-semibold text-slate-900">
                      {selectedDisposedAsset.disposalTx.performedBy?.name || selectedDisposedAsset.disposalTx.performedBy?.email || 'Admin'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <span className="text-slate-500 block">Audit Notes</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap mt-0.5">
                    {selectedDisposedAsset.disposalTx.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDisposedAsset(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

