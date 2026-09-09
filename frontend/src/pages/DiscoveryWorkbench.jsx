import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { 
  Radio, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  Eye, 
  Ban, 
  PlusCircle, 
  Cpu, 
  Wifi, 
  Clock, 
  AlertCircle, 
  Server, 
  HardDrive, 
  Check, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export function DiscoveryWorkbench() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SUGGESTED' | 'MATCHED' | 'UNKNOWN' | 'CONFLICT' | 'IGNORED'

  // Primary Data State
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState('ALL');
  const [ruleFilter, setRuleFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Comparison & Review Drawer State
  const [selectedMatch, setSelectedMatch] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, mRes, oRes] = await Promise.all([
        api.get('/discovery/summary').catch(() => ({ success: false })),
        api.get('/discovery/matches'),
        api.get('/discovery/observations').catch(() => ({ success: false, observations: [] }))
      ]);

      if (mRes.success) setMatches(mRes.matches || []);
      if (oRes.success) setObservations(oRes.observations || []);

      if (sumRes.success && sumRes.summary) {
        setSummary(sumRes.summary);
      } else {
        // Fallback frontend calculations
        const fetchedMatches = mRes.matches || [];
        const fetchedObs = oRes.observations || [];

        let matchedCount = 0;
        let suggestedCount = 0;
        let unknownCount = 0;
        let conflictCount = 0;
        let ignoredCount = 0;

        fetchedMatches.forEach(m => {
          if (m.status === 'MATCHED') matchedCount++;
          else if (m.status === 'SUGGESTED') suggestedCount++;
          else if (m.status === 'UNKNOWN') unknownCount++;
          else if (m.status === 'CONFLICT') conflictCount++;
          else if (m.status === 'IGNORED') ignoredCount++;
        });

        let lastScanTime = null;
        if (fetchedObs.length > 0) {
          lastScanTime = fetchedObs[0].createdAt || fetchedObs[0].lastSeen;
        }

        setSummary({
          totalObservations: fetchedObs.length,
          totalMatches: fetchedMatches.length,
          matchedCount,
          suggestedCount,
          unknownCount,
          conflictCount,
          ignoredCount,
          lastScanTime
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load discovery data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Trigger Scan
  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/discovery/scan');
      if (res.success) {
        showToast(`Subnet scan complete! Discovered ${res.count || 0} hardware endpoints.`);
        await loadData();
      } else {
        showToast(res.message || 'Scan failed to complete', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network discovery scan error', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Handle Confirm Match Link
  const handleConfirm = async (matchId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/discovery/matches/${matchId}/confirm`);
      if (res.success) {
        showToast('Match confirmed and asset network profile updated!');
        if (selectedMatch?._id === matchId) setSelectedMatch(null);
        await loadData();
      } else {
        showToast(res.message || 'Failed to confirm match', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error confirming match', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Ignore Match
  const handleIgnore = async (matchId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/discovery/matches/${matchId}/ignore`);
      if (res.success) {
        showToast('Match marked as ignored.');
        if (selectedMatch?._id === matchId) setSelectedMatch(null);
        await loadData();
      } else {
        showToast(res.message || 'Failed to ignore match', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error ignoring match', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Register Unknown Asset
  const handleRegisterAsset = async (matchId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/discovery/matches/${matchId}/register-asset`);
      if (res.success) {
        showToast(`New Master Asset created (${res.asset?.assetId || 'AST-DISC'}) and linked!`);
        if (selectedMatch?._id === matchId) setSelectedMatch(null);
        await loadData();
      } else {
        showToast(res.message || 'Failed to register asset', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error registering asset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Stale Device Helper (> 30 days)
  const getStaleStatus = (lastSeenStr) => {
    if (!lastSeenStr) return { isStale: false, days: 0 };
    const diffDays = Math.floor((new Date().getTime() - new Date(lastSeenStr).getTime()) / (1000 * 60 * 60 * 24));
    return { isStale: diffDays > 30, days: diffDays };
  };

  // Confidence Formatting
  const getConfidenceBadge = (score, rule) => {
    let style = 'bg-slate-100 text-slate-600 border-slate-200';
    if (score >= 85) style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    else if (score >= 60) style = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
    else if (score > 0) style = 'bg-rose-50 text-rose-700 border-rose-200';

    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-flex items-center gap-1 ${style}`}>
        <Radio className="w-3 h-3" /> {score}% — {rule || 'UNKNOWN'}
      </span>
    );
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'MATCHED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">MATCHED</span>;
      case 'SUGGESTED':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold">SUGGESTED</span>;
      case 'CONFLICT':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-semibold animate-pulse">CONFLICT</span>;
      case 'UNKNOWN':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[11px]">UNKNOWN</span>;
      case 'IGNORED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-[11px] line-through">IGNORED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px]">{status}</span>;
    }
  };

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const obs = m.observationId || {};
      const asset = m.matchedAssetId || {};

      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        obs.ipAddress?.toLowerCase().includes(q) ||
        obs.macAddress?.toLowerCase().includes(q) ||
        obs.hostname?.toLowerCase().includes(q) ||
        obs.serialNumber?.toLowerCase().includes(q) ||
        asset.tagNumber?.toLowerCase().includes(q) ||
        asset.assetId?.toLowerCase().includes(q) ||
        asset.description?.toLowerCase().includes(q);

      const matchesTab = activeTab === 'ALL' || m.status === activeTab;
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

      let matchesConfidence = true;
      if (confidenceFilter === 'HIGH') matchesConfidence = m.confidenceScore >= 85;
      else if (confidenceFilter === 'MEDIUM') matchesConfidence = m.confidenceScore >= 60 && m.confidenceScore < 85;
      else if (confidenceFilter === 'LOW') matchesConfidence = m.confidenceScore < 60;

      const matchesRule = ruleFilter === 'ALL' || m.matchRule === ruleFilter;
      const matchesSource = sourceFilter === 'ALL' || obs.discoverySource === sourceFilter;

      return matchesSearch && matchesTab && matchesStatus && matchesConfidence && matchesRule && matchesSource;
    });
  }, [matches, search, activeTab, statusFilter, confidenceFilter, ruleFilter, sourceFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setConfidenceFilter('ALL');
    setRuleFilter('ALL');
    setSourceFilter('ALL');
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
            <Wifi className="w-7 h-7 text-brand-600" />
            IT Auto-Discovery & Reconciliation
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Discover IP/SNMP network hardware telemetry and reconcile confidence matches into CMDB master asset records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-xs"
            title="Refresh Discovery Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning Subnets...' : 'Trigger Network Discovery Scan'}
          </button>
        </div>
      </div>

      {/* Executive KPI Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div 
          onClick={() => setActiveTab('ALL')}
          className="bg-white p-3.5 cursor-pointer hover:border-brand-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Discovered Devices</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalObservations ?? '-'}</p>
          <span className="text-[10px] text-brand-600">Total telemetry endpoints</span>
        </div>

        <div 
          onClick={() => setActiveTab('MATCHED')}
          className="bg-white p-3.5 cursor-pointer hover:border-emerald-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Matched</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{summary?.matchedCount ?? '-'}</p>
          <span className="text-[10px] text-emerald-600">Reconciled to CMDB</span>
        </div>

        <div 
          onClick={() => setActiveTab('SUGGESTED')}
          className="bg-white p-3.5 cursor-pointer hover:border-amber-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Suggested</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary?.suggestedCount ?? '-'}</p>
          <span className="text-[10px] text-amber-600">Awaiting admin review</span>
        </div>

        <div 
          onClick={() => setActiveTab('UNKNOWN')}
          className="bg-white p-3.5 cursor-pointer hover:border-slate-400 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Unknown</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{summary?.unknownCount ?? '-'}</p>
          <span className="text-[10px] text-slate-500">Unmanaged hardware</span>
        </div>

        <div 
          onClick={() => setActiveTab('CONFLICT')}
          className="bg-white p-3.5 cursor-pointer hover:border-rose-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Conflicts</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{summary?.conflictCount ?? '-'}</p>
          <span className="text-[10px] text-rose-600">Hostname/Serial mismatch</span>
        </div>

        <div 
          onClick={() => setActiveTab('IGNORED')}
          className="bg-white p-3.5 cursor-pointer hover:border-slate-300 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Ignored</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{summary?.ignoredCount ?? '-'}</p>
          <span className="text-[10px] text-slate-400">Dismissed matches</span>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Last Scan Time</p>
          <p className="text-xs font-bold text-slate-900 mt-2 truncate">
            {summary?.lastScanTime ? new Date(summary.lastScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </p>
          <span className="text-[10px] text-slate-500">
            {summary?.lastScanTime ? new Date(summary.lastScanTime).toLocaleDateString() : 'No scans executed'}
          </span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'ALL' ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Discoveries ({matches.length})
        </button>

        <button
          onClick={() => setActiveTab('SUGGESTED')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'SUGGESTED' ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Suggested Matches ({matches.filter(m => m.status === 'SUGGESTED').length})
        </button>

        <button
          onClick={() => setActiveTab('MATCHED')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'MATCHED' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Matched Assets ({matches.filter(m => m.status === 'MATCHED').length})
        </button>

        <button
          onClick={() => setActiveTab('UNKNOWN')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'UNKNOWN' ? 'border-slate-600 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Unknown Devices ({matches.filter(m => m.status === 'UNKNOWN').length})
        </button>

        <button
          onClick={() => setActiveTab('CONFLICT')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'CONFLICT' ? 'border-rose-600 text-rose-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Conflicts ({matches.filter(m => m.status === 'CONFLICT').length})
        </button>

        <button
          onClick={() => setActiveTab('IGNORED')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'IGNORED' ? 'border-slate-400 text-slate-500' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Ignored ({matches.filter(m => m.status === 'IGNORED').length})
        </button>
      </div>

      {/* Conflict Alert Banner if CONFLICT tab or conflicts present */}
      {activeTab === 'CONFLICT' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 text-sm">Conflict Warning: Discovered Telemetry Mismatch</h4>
            <p className="mt-1 text-slate-700">
              Conflicting devices have matching hostname/MAC address with one master asset, but matching serial number with another asset. 
              Automatic binding is disabled to prevent incorrect asset linkage. Manual review is required.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl space-y-3 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by IP, MAC, Hostname, Serial, or Asset Tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="HIGH">High (&ge; 85%)</option>
              <option value="MEDIUM">Medium (60-84%)</option>
              <option value="LOW">Low (&lt; 60%)</option>
            </select>
          </div>

          <div>
            <select
              value={ruleFilter}
              onChange={(e) => setRuleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Match Rules</option>
              <option value="EXACT_SERIAL">EXACT_SERIAL</option>
              <option value="MAC_ADDRESS">MAC_ADDRESS</option>
              <option value="HOSTNAME">HOSTNAME</option>
              <option value="FUZZY_AI">FUZZY_AI</option>
              <option value="UNMATCHED">UNMATCHED</option>
            </select>
          </div>

          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Sources</option>
              <option value="IP_SCANNER">IP Scanner</option>
              <option value="SNMP">SNMP Telemetry</option>
              <option value="WMI">WMI Agent</option>
              <option value="SSH">SSH Collector</option>
            </select>
          </div>
        </div>

        {(search || confidenceFilter !== 'ALL' || ruleFilter !== 'ALL' || sourceFilter !== 'ALL') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading discovery feeds...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No discovery records match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Discovered Hardware</th>
                  <th className="p-3">Telemetry Network Identifiers</th>
                  <th className="p-3">Matched CMDB Asset</th>
                  <th className="p-3">Confidence & Rule</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filteredMatches.map(m => {
                  const obs = m.observationId || {};
                  const asset = m.matchedAssetId || {};
                  const staleInfo = getStaleStatus(obs.lastSeen);

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-brand-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900">{obs.hostname || 'Discovered Device'}</span>
                            <p className="text-[11px] text-slate-500">{obs.manufacturer || 'OEM'} {obs.modelName || ''}</p>
                            {obs.osFamily && <span className="text-[10px] text-slate-500 font-mono">{obs.osFamily}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="text-brand-600 font-semibold">{obs.ipAddress || '0.0.0.0'}</div>
                        <div className="text-slate-600 text-[11px]">MAC: {obs.macAddress || 'N/A'}</div>
                        {obs.serialNumber && <div className="text-slate-500 text-[10px]">S/N: {obs.serialNumber}</div>}
                      </td>

                      <td className="p-3">
                        {asset.assetId ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-600">{asset.tagNumber || asset.assetId}</span>
                            <p className="font-semibold text-slate-800 text-[11px]">{asset.description}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unlinked / New Hardware</span>
                        )}
                      </td>

                      <td className="p-3">
                        {getConfidenceBadge(m.confidenceScore, m.matchRule)}
                      </td>

                      <td className="p-3">
                        {getStatusBadge(m.status)}
                        {m.reviewedBy?.name && (
                          <p className="text-[10px] text-slate-500 mt-0.5">By: {m.reviewedBy.name}</p>
                        )}
                      </td>

                      <td className="p-3 text-slate-600">
                        <div>{obs.lastSeen ? new Date(obs.lastSeen).toLocaleDateString() : 'N/A'}</div>
                        {staleInfo.isStale && (
                          <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3" /> Stale ({staleInfo.days}d ago)
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedMatch(m)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-brand-600 rounded border border-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <Eye className="w-3 h-3" /> Review
                        </button>

                        {m.status !== 'MATCHED' && m.matchedAssetId && (
                          <button
                            onClick={() => handleConfirm(m._id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <CheckCircle className="w-3 h-3" /> Confirm Link
                          </button>
                        )}

                        {m.status === 'UNKNOWN' && (
                          <button
                            onClick={() => handleRegisterAsset(m._id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded inline-flex items-center gap-1 shadow-xs"
                          >
                            <PlusCircle className="w-3 h-3" /> Register Asset
                          </button>
                        )}

                        {m.status !== 'IGNORED' && m.status !== 'MATCHED' && (
                          <button
                            onClick={() => handleIgnore(m._id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded border border-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <Ban className="w-3 h-3 text-slate-400" /> Ignore
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SIDE-BY-SIDE MATCH REVIEW DRAWER */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Discovered Device vs Master Asset Comparison</h2>
                  {getStatusBadge(selectedMatch.status)}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Confidence Score: <span className="text-brand-600 font-bold">{selectedMatch.confidenceScore}%</span> via rule <span className="font-mono text-slate-800">{selectedMatch.matchRule}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Discovered Device Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-4 h-4 text-brand-600" /> Raw Network Telemetry Observation
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Collector Source</span>
                  <span className="font-mono font-semibold text-brand-600">{selectedMatch.observationId?.discoverySource || 'IP_SCANNER'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Operating System</span>
                  <span className="font-semibold text-slate-900">{selectedMatch.observationId?.osFamily || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">First Seen</span>
                  <span className="text-slate-700">{selectedMatch.observationId?.firstSeen ? new Date(selectedMatch.observationId.firstSeen).toLocaleString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Last Telemetry Probe</span>
                  <span className="text-slate-700">{selectedMatch.observationId?.lastSeen ? new Date(selectedMatch.observationId.lastSeen).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* SIDE-BY-SIDE METRIC COMPARISON TABLE */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" /> Attribute Comparison Matrix
              </h3>

              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Discovered Endpoint</th>
                      <th className="p-3">Target CMDB Asset</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* IP Address */}
                    {(() => {
                      const discIP = selectedMatch.observationId?.ipAddress;
                      const assetIP = selectedMatch.matchedAssetId?.ipAddress;
                      const match = discIP && assetIP && discIP === assetIP;
                      return (
                        <tr className="hover:bg-slate-100/50">
                          <td className="p-3 font-semibold text-slate-600">IP Address</td>
                          <td className="p-3 font-mono text-brand-600">{discIP || 'N/A'}</td>
                          <td className="p-3 font-mono text-slate-900">{assetIP || 'Not Set'}</td>
                          <td className="p-3 text-center">
                            {match ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">MATCH</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] border border-amber-200">DIFF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* MAC Address */}
                    {(() => {
                      const discMAC = selectedMatch.observationId?.macAddress;
                      const assetMAC = selectedMatch.matchedAssetId?.macAddress;
                      const match = discMAC && assetMAC && discMAC.toLowerCase() === assetMAC.toLowerCase();
                      return (
                        <tr className="hover:bg-slate-100/50">
                          <td className="p-3 font-semibold text-slate-600">MAC Address</td>
                          <td className="p-3 font-mono text-brand-600">{discMAC || 'N/A'}</td>
                          <td className="p-3 font-mono text-slate-900">{assetMAC || 'Not Set'}</td>
                          <td className="p-3 text-center">
                            {match ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">MATCH</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] border border-amber-200">DIFF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Hostname */}
                    {(() => {
                      const discHost = selectedMatch.observationId?.hostname;
                      const assetHost = selectedMatch.matchedAssetId?.hostname;
                      const match = discHost && assetHost && discHost.toLowerCase() === assetHost.toLowerCase();
                      return (
                        <tr className="hover:bg-slate-100/50">
                          <td className="p-3 font-semibold text-slate-600">Hostname</td>
                          <td className="p-3 font-mono text-brand-600">{discHost || 'N/A'}</td>
                          <td className="p-3 font-mono text-slate-900">{assetHost || 'Not Set'}</td>
                          <td className="p-3 text-center">
                            {match ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">MATCH</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] border border-amber-200">DIFF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Serial Number */}
                    {(() => {
                      const discSerial = selectedMatch.observationId?.serialNumber;
                      const assetSerial = selectedMatch.matchedAssetId?.serialNumber;
                      const match = discSerial && assetSerial && discSerial === assetSerial;
                      return (
                        <tr className="hover:bg-slate-100/50">
                          <td className="p-3 font-semibold text-slate-600">Serial Number</td>
                          <td className="p-3 font-mono text-brand-600">{discSerial || 'N/A'}</td>
                          <td className="p-3 font-mono text-slate-900">{assetSerial || 'Not Set'}</td>
                          <td className="p-3 text-center">
                            {match ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">MATCH</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] border border-amber-200">DIFF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Manufacturer & Model */}
                    <tr className="hover:bg-slate-100/50">
                      <td className="p-3 font-semibold text-slate-600">Model / Description</td>
                      <td className="p-3 text-slate-700">
                        {selectedMatch.observationId?.manufacturer} {selectedMatch.observationId?.modelName}
                      </td>
                      <td className="p-3 text-slate-900">
                        {selectedMatch.matchedAssetId?.description || 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">INFO</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit History if Confirmed */}
            {selectedMatch.reviewedBy && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Reconciled by: <strong className="text-slate-900">{selectedMatch.reviewedBy.name || selectedMatch.reviewedBy.email}</strong></span>
                </div>
                <span>{selectedMatch.reviewedAt ? new Date(selectedMatch.reviewedAt).toLocaleString() : ''}</span>
              </div>
            )}

            {/* Drawer Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Review
              </button>

              {selectedMatch.status !== 'IGNORED' && selectedMatch.status !== 'MATCHED' && (
                <button
                  onClick={() => handleIgnore(selectedMatch._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-xs"
                >
                  <Ban className="w-4 h-4 text-rose-600" /> Ignore Match
                </button>
              )}

              {selectedMatch.status === 'UNKNOWN' && (
                <button
                  onClick={() => handleRegisterAsset(selectedMatch._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Register New Asset
                </button>
              )}

              {selectedMatch.status !== 'MATCHED' && selectedMatch.matchedAssetId && (
                <button
                  onClick={() => handleConfirm(selectedMatch._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm & Link Network Identity
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

