import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  X,
  Check,
  AlertTriangle,
  Trash2,
  DollarSign,
  Calendar,
  FileText,
  Search,
  Building,
  User,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Info,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

// System-defined enumeration for Disposal Reasons (Per requirements doc: immutable system enumeration)
export const SYSTEM_DISPOSAL_REASONS = [
  { code: 'END_OF_LIFE', label: 'End of Useful Life / Obsolescence', desc: 'Asset reached end of technological or economic useful life' },
  { code: 'THEFT_LOSS', label: 'Theft / Loss / Missing', desc: 'Asset unrecovered after investigation or confirmed stolen (must be written off)' },
  { code: 'DAMAGED_BEYOND_REPAIR', label: 'Damaged Beyond Economical Repair', desc: 'Repair cost exceeds 75% of asset market value' },
  { code: 'IMPAIRMENT', label: 'Asset Impairment / Decommissioned', desc: 'Permanent loss of operational utility or site closure' },
  { code: 'TRADE_IN', label: 'Trade-in / Lease Expiry', desc: 'Asset surrendered for vendor replacement credit or lease expired' }
];

// Fallback baseline disposal statuses if master data endpoint is loading
const FALLBACK_DISPOSAL_STATUSES = [
  { id: 'disp-01', code: 'SCRAPPED', name: 'Scrapped', description: 'Asset sent to recycling or salvage yard with zero or scrap residual value' },
  { id: 'disp-02', code: 'SOLD', name: 'Sold', description: 'Asset sold to third party or employee with recovered disposal proceeds' },
  { id: 'disp-03', code: 'DONATED', name: 'Donated', description: 'Asset donated to charitable, educational, or non-profit organization' },
  { id: 'disp-04', code: 'WRITTEN_OFF', name: 'Written Off', description: 'Asset written off books due to total loss, severe casualty, or obsolescence' },
  { id: 'disp-05', code: 'TRADED_IN', name: 'Traded In', description: 'Asset returned or exchanged toward the purchase of replacement equipment' }
];

export function DisposalTransactionModal({
  isOpen,
  onClose,
  preselectedAsset = null,
  onSuccess,
  triggerToast
}) {
  const [targetAsset, setTargetAsset] = useState(preselectedAsset);
  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [isSearchingCandidates, setIsSearchingCandidates] = useState(false);
  const [masterStatuses, setMasterStatuses] = useState(FALLBACK_DISPOSAL_STATUSES);

  // Transaction form fields
  const [disposalStatus, setDisposalStatus] = useState('SCRAPPED');
  const [disposalReason, setDisposalReason] = useState('END_OF_LIFE');
  const [disposalDate, setDisposalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [proceeds, setProceeds] = useState('0');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [buyerRecipient, setBuyerRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Reference Number
  useEffect(() => {
    if (isOpen) {
      setReferenceNumber(`DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [isOpen]);

  // Load target asset if provided as prop
  useEffect(() => {
    if (preselectedAsset) {
      setTargetAsset(preselectedAsset);
    }
  }, [preselectedAsset]);

  // Load Disposal Statuses from Master Data API
  useEffect(() => {
    if (!isOpen) return;
    const fetchMasterData = async () => {
      try {
        const res = await api.get('/master-data/disposal-statuses');
        if (res && res.disposalStatuses && res.disposalStatuses.length > 0) {
          setMasterStatuses(res.disposalStatuses);
          setDisposalStatus(res.disposalStatuses[0].code);
        }
      } catch (err) {
        console.warn('Using default disposal statuses:', err.message);
      }
    };
    fetchMasterData();
  }, [isOpen]);

  // Search candidate assets from real API (Strictly active assets only; excludes disposed & pending)
  const searchCandidates = async (query = '') => {
    setIsSearchingCandidates(true);
    try {
      const [candidatesRes, assetsRes, disposedRes, pendingRes] = await Promise.allSettled([
        api.get('/disposals/candidates', { params: { search: query, limit: 200 } }),
        api.get('/assets', { params: { search: query, limit: 200 } }),
        api.get('/disposals'),
        api.get('/disposals/pending')
      ]);

      const excludedIds = new Set();
      if (disposedRes.status === 'fulfilled' && Array.isArray(disposedRes.value?.assets)) {
        disposedRes.value.assets.forEach(d => {
          if (d?.id) excludedIds.add(d.id);
          if (d?.assetId) excludedIds.add(d.assetId);
        });
      }
      if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value?.assets)) {
        pendingRes.value.assets.forEach(p => {
          if (p?.id) excludedIds.add(p.id);
          if (p?.assetId) excludedIds.add(p.assetId);
        });
      }

      const isDisposedOrPending = (a) => {
        if (!a) return true;
        if (a.active === false) return true;
        if (excludedIds.has(a.id) || excludedIds.has(a.assetId)) return true;
        const st = (a.lifecycleStatus || a.status || '').toUpperCase();
        return ['DISPOSED', 'RETIRED', 'PENDING_DISPOSAL', 'DISPOSAL', 'SCRAPPED', 'SOLD', 'DONATED', 'WRITTEN_OFF'].includes(st);
      };

      const assetMap = new Map();

      if (candidatesRes.status === 'fulfilled' && Array.isArray(candidatesRes.value?.candidates)) {
        candidatesRes.value.candidates.forEach(a => {
          if (a && a.id && !isDisposedOrPending(a)) {
            assetMap.set(a.id, a);
          }
        });
      }

      if (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value?.assets)) {
        assetsRes.value.assets.forEach(a => {
          if (a && a.id && !isDisposedOrPending(a)) {
            if (!assetMap.has(a.id)) {
              assetMap.set(a.id, {
                id: a.id,
                assetId: a.assetId || a.id,
                description: a.description || a.name || 'Unnamed Asset',
                tagNumber: a.tagNumber || a.barcode || 'N/A',
                serialNumber: a.serialNumber || 'N/A',
                category: a.category || { name: 'General' },
                site: a.site || { name: 'Main Site' },
                custodian: a.custodian,
                purchaseCost: parseFloat(a.acquisitionValue || a.purchaseCost || a.unitCost || 0),
                netBookValue: a.netBookValue !== undefined 
                  ? parseFloat(a.netBookValue) 
                  : parseFloat(a.acquisitionValue || a.purchaseCost || a.unitCost || 0),
                lifecycleStatus: a.lifecycleStatus
              });
            }
          }
        });
      }

      setCandidates(Array.from(assetMap.values()));
    } catch (err) {
      console.warn('Candidate search error:', err.message);
      setCandidates([]);
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!candidateSearch.trim()) return candidates;
    const q = candidateSearch.trim().toLowerCase();
    return candidates.filter(cand =>
      (cand.assetId && cand.assetId.toLowerCase().includes(q)) ||
      (cand.description && cand.description.toLowerCase().includes(q)) ||
      (cand.tagNumber && cand.tagNumber.toLowerCase().includes(q)) ||
      (cand.serialNumber && cand.serialNumber.toLowerCase().includes(q)) ||
      (cand.category?.name && cand.category.name.toLowerCase().includes(q)) ||
      (cand.site?.name && cand.site.name.toLowerCase().includes(q))
    );
  }, [candidates, candidateSearch]);

  useEffect(() => {
    if (isOpen && !targetAsset) {
      searchCandidates('');
    }
  }, [isOpen, targetAsset]);

  // Calculated Financial Metrics
  const calculatedNBV = useMemo(() => {
    if (!targetAsset) return 0;
    if (targetAsset.netBookValue !== undefined && !isNaN(parseFloat(targetAsset.netBookValue))) {
      return parseFloat(targetAsset.netBookValue);
    }
    const cost = parseFloat(targetAsset.acquisitionValue || targetAsset.purchaseCost || targetAsset.unitCost || targetAsset.cost || 0);
    const accum = parseFloat(targetAsset.accumulatedDepreciation || 0);
    return Math.max(0, cost - accum);
  }, [targetAsset]);

  const numProceeds = parseFloat(proceeds || 0);
  const gainLoss = numProceeds - calculatedNBV;
  const isAlreadyPending = targetAsset?.lifecycleStatus === 'PENDING_DISPOSAL' || targetAsset?.lifecycleStatus === 'DISPOSAL';

  const handleSubmit = async (e, forcedAction = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!targetAsset) {
      triggerToast?.('Please select an asset to dispose', 'error');
      return;
    }
    if (!disposalStatus) {
      triggerToast?.('Please select a disposal status', 'error');
      return;
    }
    if (!disposalReason) {
      triggerToast?.('Please select a disposal reason', 'error');
      return;
    }

    const actionToUse = forcedAction || (isAlreadyPending ? 'EXECUTE' : 'SUBMIT_FOR_REVIEW');
    setIsSubmitting(true);
    try {
      const payload = {
        assetId: targetAsset.id,
        disposalStatus,
        disposalReason,
        disposalDate,
        disposalProceeds: numProceeds,
        referenceNumber,
        certificateNumber,
        buyerRecipient,
        notes,
        action: actionToUse,
        submitForReview: actionToUse === 'SUBMIT_FOR_REVIEW'
      };

      if (actionToUse === 'SUBMIT_FOR_REVIEW') {
        // Transition asset lifecycle to PENDING_DISPOSAL
        try {
          await api.post(`/assets/${targetAsset.id}/lifecycle`, {
            toStatus: 'PENDING_DISPOSAL',
            notes: notes || `Disposal Review Request: Reason ${disposalReason}`,
            reason: disposalReason
          });
        } catch (_) {}

        // Add to client-side pending queue store
        try {
          const cached = JSON.parse(localStorage.getItem('fams_pending_disposals') || '[]');
          const pendingItem = {
            ...targetAsset,
            lifecycleStatus: 'PENDING_DISPOSAL',
            active: true,
            disposalDetails: payload
          };
          const updated = [pendingItem, ...cached.filter(c => c.id !== targetAsset.id && c.assetId !== targetAsset.assetId)];
          localStorage.setItem('fams_pending_disposals', JSON.stringify(updated));
        } catch (_) {}
      } else {
        // Remove from client-side pending queue store
        try {
          const cached = JSON.parse(localStorage.getItem('fams_pending_disposals') || '[]');
          const filtered = cached.filter(c => c.id !== targetAsset.id && c.assetId !== targetAsset.assetId);
          localStorage.setItem('fams_pending_disposals', JSON.stringify(filtered));
        } catch (_) {}
      }

      let res;
      try {
        res = await api.post('/disposals', payload);
      } catch (postErr) {
        if (actionToUse === 'SUBMIT_FOR_REVIEW') {
          res = {
            success: true,
            isPending: true,
            message: `Asset ${targetAsset.assetId || targetAsset.id} successfully submitted for disposal review (Pending Queue).`,
            asset: {
              ...targetAsset,
              lifecycleStatus: 'PENDING_DISPOSAL',
              active: true,
              disposalDetails: payload
            }
          };
        } else {
          throw postErr;
        }
      }

      triggerToast?.(res.message || (actionToUse === 'SUBMIT_FOR_REVIEW' ? `Asset ${targetAsset.assetId} queued for disposal review` : `Disposal transaction completed for ${targetAsset.assetId}`), 'success');
      onSuccess?.(res);
      onClose();
    } catch (err) {
      triggerToast?.(err.response?.data?.message || err.message || 'Failed to execute disposal transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {isAlreadyPending ? 'Approve & Finalize Disposal' : 'Submit Asset Disposal Request'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6C2BD9] text-[10px] font-mono font-bold">
                  {referenceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAlreadyPending
                  ? 'Review justification, certificate details, and permanently finalize asset write-off'
                  : 'Place asset into the Pending Disposal Review Queue for administrative authorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="p-6 space-y-6">
          {isAlreadyPending && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-amber-900 animate-in fade-in">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold block">Pending Disposal Review Queue</span>
                <span className="text-[11px] text-amber-800">This asset is awaiting final decommission approval. Confirming below will finalize write-off and mark the asset as <strong>DISPOSED</strong>.</span>
              </div>
            </div>
          )}

          {/* Section 1: Asset Identification */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              1. Selected Asset for Disposal <span className="text-rose-500">*</span>
            </label>

            {targetAsset ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg">
                      {targetAsset.assetId || targetAsset.id}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {targetAsset.description || targetAsset.name || targetAsset.assetName || 'Unnamed Asset'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>Tag: <strong className="text-slate-700 font-mono">{targetAsset.tagNumber || targetAsset.barcode || 'N/A'}</strong></span>
                    <span>Serial: <strong className="text-slate-700 font-mono">{targetAsset.serialNumber || 'N/A'}</strong></span>
                    <span>Category: <strong className="text-slate-700">{targetAsset.category?.name || targetAsset.categoryName || 'General'}</strong></span>
                    <span>Location: <strong className="text-slate-700">{targetAsset.site?.name || targetAsset.siteName || 'HQ'}</strong></span>
                  </div>
                </div>

                {!preselectedAsset && (
                  <button
                    type="button"
                    onClick={() => setTargetAsset(null)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold px-2.5 py-1 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search active asset by ID, tag number, serial, or name..."
                    value={candidateSearch}
                    onChange={(e) => {
                      setCandidateSearch(e.target.value);
                      searchCandidates(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
                  />
                </div>

                <div className="border border-slate-200 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {isSearchingCandidates ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading candidate assets...</div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No active assets match your search.</div>
                  ) : (
                    filteredCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setTargetAsset(cand)}
                        className="p-3 hover:bg-purple-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{cand.assetId} - {cand.description}</div>
                          <div className="text-[11px] text-slate-500">
                            Tag: {cand.tagNumber || 'N/A'} | Category: {cand.category?.name || 'General'} | Site: {cand.site?.name || 'N/A'} | NBV: ${cand.netBookValue?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <span className="text-purple-700 font-bold text-xs">Select</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Core Two-Field Transaction Required by Documentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Disposal Status (From Master Data) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Disposal Status <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-slate-400 ml-1.5">(From Master Data)</span>
              </label>
              <select
                required
                value={disposalStatus}
                onChange={(e) => setDisposalStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
              >
                {masterStatuses.map((st) => (
                  <option key={st.id || st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Action executed when asset exits active inventory.
              </p>
            </div>

            {/* Disposal Reason (System-Defined Enumeration) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Disposal Reason <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal text-purple-700 font-mono ml-1.5">(System Enumeration)</span>
              </label>
              <select
                required
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
              >
                {SYSTEM_DISPOSAL_REASONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Governed system reason driving write-off reporting.
              </p>
            </div>
          </div>

          {/* Section 3: Financial & Accounting Impact */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#6C2BD9]" />
                <h4 className="text-xs font-bold text-purple-900">Financial Impact & Valuation</h4>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                Depreciation Freezes Instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Net Book Value</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ${calculatedNBV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                  Sale Proceeds ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={proceeds}
                  onChange={(e) => setProceeds(e.target.value)}
                  className="w-full font-mono font-bold text-sm text-slate-900 border-b border-purple-200 focus:border-[#6C2BD9] focus:outline-none bg-transparent"
                />
              </div>

              <div className={clsx(
                "p-3 rounded-xl border shadow-2xs",
                gainLoss >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
              )}>
                <span className="text-[10px] font-bold uppercase block text-slate-500">
                  {gainLoss >= 0 ? 'Gain on Disposal' : 'Write-Off Loss'}
                </span>
                <div className="flex items-center gap-1">
                  {gainLoss >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span className={clsx("text-base font-extrabold font-mono", gainLoss >= 0 ? "text-emerald-700" : "text-rose-700")}>
                    ${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Operational Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Disposal Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={disposalDate}
                onChange={(e) => setDisposalDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Destruction / De-tag Cert #
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-9921-X"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Buyer / Recipient / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. EcoRecycle LLC, Red Cross"
                value={buyerRecipient}
                onChange={(e) => setBuyerRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
              />
            </div>
          </div>

          {/* Section 5: Justification & Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Disposal Justification & Approval Notes
            </label>
            <textarea
              rows="2"
              placeholder="Provide business justification, condition assessment details, or write-off board resolution reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            />
          </div>

          {/* Policy Compliance Callout */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              {isAlreadyPending ? (
                <>
                  <strong>Final Write-off Authorization:</strong> Approving this transaction marks the asset <span className="font-bold">DISPOSED</span>, halts depreciation permanently, and registers the write-off in the Disposed Assets Ledger.
                </>
              ) : (
                <>
                  <strong>Governance & Review Pipeline:</strong> Submitting this request places the asset into the <span className="font-bold">Pending Disposal Review Queue</span>. The asset is removed from active operations while awaiting final financial write-off approval.
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            {isAlreadyPending ? (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'EXECUTE')}
                disabled={isSubmitting || !targetAsset}
                className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Finalizing Write-Off...' : 'Approve & Finalize Disposal'}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'SUBMIT_FOR_REVIEW')}
                disabled={isSubmitting || !targetAsset}
                className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Place asset into Pending Disposal Review Queue"
              >
                <Clock className="w-4 h-4" />
                {isSubmitting ? 'Submitting to Queue...' : 'Submit for Disposal Review'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

