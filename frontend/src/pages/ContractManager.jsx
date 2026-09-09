import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { 
  FileCheck, 
  ShieldAlert, 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Package, 
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';

export function ContractManager() {
  const [activeTab, setActiveTab] = useState('CONTRACTS'); // 'CONTRACTS' | 'WARRANTIES' | 'COMPLIANCE'

  // Data States
  const [summary, setSummary] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filters - Contracts
  const [contractSearch, setContractSearch] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('ALL');
  const [contractStatusFilter, setContractStatusFilter] = useState('ALL');
  const [contractSort, setContractSort] = useState('endDate_asc');

  // Search & Filters - Warranties
  const [warrantySearch, setWarrantySearch] = useState('');
  const [warrantyCoverageFilter, setWarrantyCoverageFilter] = useState('ALL');
  const [warrantyStatusFilter, setWarrantyStatusFilter] = useState('ALL');

  // Modals & Drawers
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [showCreateWarrantyModal, setShowCreateWarrantyModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  // Asset Search filter inside modals
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  // Form State - Contract
  const [contractForm, setContractForm] = useState({
    title: '',
    contractType: 'AMC',
    providerName: '',
    startDate: '',
    endDate: '',
    cost: '',
    slaDetails: '',
    coveredAssetIds: []
  });

  // Form State - Warranty
  const [warrantyForm, setWarrantyForm] = useState({
    assetId: '',
    providerName: '',
    warrantyNumber: '',
    coverageType: 'FULL',
    startDate: '',
    endDate: '',
    terms: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, cRes, wRes, aRes] = await Promise.all([
        api.get('/contracts/summary').catch(() => ({ success: false })),
        api.get('/contracts'),
        api.get('/contracts/warranties'),
        api.get('/assets?limit=300').catch(() => ({ success: false, assets: [] }))
      ]);

      if (cRes.success) setContracts(cRes.contracts || []);
      if (wRes.success) setWarranties(wRes.warranties || []);
      if (aRes.success) setAssets(aRes.assets || []);

      if (sumRes.success && sumRes.summary) {
        setSummary(sumRes.summary);
      } else {
        // Fallback frontend calculations
        const now = new Date();
        const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const fetchedContracts = cRes.contracts || [];
        const fetchedWarranties = wRes.warranties || [];

        let activeContracts = 0;
        let expiringWithin30Days = 0;
        let expiringWithin90Days = 0;
        let expiredContracts = 0;
        let totalContractValue = 0;

        fetchedContracts.forEach(c => {
          const end = new Date(c.endDate);
          const costVal = parseFloat(c.cost?.toString() || 0);
          totalContractValue += isNaN(costVal) ? 0 : costVal;

          if (end < now) {
            expiredContracts++;
          } else {
            if (c.active !== false) activeContracts++;
            if (end <= d30) expiringWithin30Days++;
            if (end <= d90) expiringWithin90Days++;
          }
        });

        let expiringWarranties = 0;
        fetchedWarranties.forEach(w => {
          const end = new Date(w.endDate);
          if (end <= d90) expiringWarranties++;
        });

        setSummary({
          totalContracts: fetchedContracts.length,
          activeContracts,
          expiringWithin30Days,
          expiringWithin90Days,
          expiredContracts,
          totalWarranties: fetchedWarranties.length,
          expiringWarranties,
          totalContractValue
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load contract & warranty data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Days Remaining & Risk Status Helper
  const getRiskStatus = (endDateStr) => {
    if (!endDateStr) return { status: 'UNKNOWN', days: 0, badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { 
        status: 'EXPIRED', 
        days: Math.abs(days), 
        label: `Expired ${Math.abs(days)}d ago`,
        badgeClass: 'bg-red-50 text-red-700 border-red-200' 
      };
    }
    if (days <= 30) {
      return { 
        status: 'CRITICAL_EXPIRE', 
        days, 
        label: `Expires in ${days}d`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse' 
      };
    }
    if (days <= 90) {
      return { 
        status: 'EXPIRING_SOON', 
        days, 
        label: `Expires in ${days}d`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-medium' 
      };
    }
    return { 
      status: 'ACTIVE', 
      days, 
      label: `${days}d remaining`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    };
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const risk = getRiskStatus(c.endDate);
      const matchesSearch = 
        !contractSearch ||
        c.contractNumber?.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.title?.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.providerName?.toLowerCase().includes(contractSearch.toLowerCase());

      const matchesType = contractTypeFilter === 'ALL' || c.contractType === contractTypeFilter;
      const matchesStatus = contractStatusFilter === 'ALL' || risk.status === contractStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (contractSort === 'endDate_asc') return new Date(a.endDate) - new Date(b.endDate);
      if (contractSort === 'endDate_desc') return new Date(b.endDate) - new Date(a.endDate);
      if (contractSort === 'cost_desc') return parseFloat(b.cost?.toString() || 0) - parseFloat(a.cost?.toString() || 0);
      if (contractSort === 'cost_asc') return parseFloat(a.cost?.toString() || 0) - parseFloat(b.cost?.toString() || 0);
      return 0;
    });
  }, [contracts, contractSearch, contractTypeFilter, contractStatusFilter, contractSort]);

  // Filtered Warranties
  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      const risk = getRiskStatus(w.endDate);
      const assetTag = w.assetId?.tagNumber || '';
      const assetDesc = w.assetId?.description || '';
      const provider = w.providerName || '';
      const wNum = w.warrantyNumber || '';

      const matchesSearch = 
        !warrantySearch ||
        assetTag.toLowerCase().includes(warrantySearch.toLowerCase()) ||
        assetDesc.toLowerCase().includes(warrantySearch.toLowerCase()) ||
        provider.toLowerCase().includes(warrantySearch.toLowerCase()) ||
        wNum.toLowerCase().includes(warrantySearch.toLowerCase());

      const matchesCoverage = warrantyCoverageFilter === 'ALL' || w.coverageType === warrantyCoverageFilter;
      const matchesStatus = warrantyStatusFilter === 'ALL' || risk.status === warrantyStatusFilter;

      return matchesSearch && matchesCoverage && matchesStatus;
    }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [warranties, warrantySearch, warrantyCoverageFilter, warrantyStatusFilter]);

  // Compliance Risk Feed Items
  const riskFeedItems = useMemo(() => {
    const items = [];

    contracts.forEach(c => {
      const risk = getRiskStatus(c.endDate);
      items.push({
        id: `CTR-${c._id}`,
        type: 'CONTRACT',
        item: c,
        title: `${c.contractType}: ${c.title}`,
        subtitle: `Provider: ${c.providerName} (${c.contractNumber})`,
        cost: c.cost ? parseFloat(c.cost.toString()) : 0,
        endDate: c.endDate,
        risk
      });
    });

    warranties.forEach(w => {
      const risk = getRiskStatus(w.endDate);
      const assetInfo = w.assetId ? `${w.assetId.tagNumber} - ${w.assetId.description}` : 'Asset Warranty';
      items.push({
        id: `WAR-${w._id}`,
        type: 'WARRANTY',
        item: w,
        title: `OEM Warranty: ${assetInfo}`,
        subtitle: `Provider: ${w.providerName || 'OEM'} (Coverage: ${w.coverageType})`,
        cost: 0,
        endDate: w.endDate,
        risk
      });
    });

    return items.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [contracts, warranties]);

  // Handlers
  const handleCreateContractSubmit = async (e) => {
    e.preventDefault();
    if (!contractForm.title || !contractForm.providerName || !contractForm.startDate || !contractForm.endDate) {
      showToast('Please fill in all required contract fields', 'error');
      return;
    }

    if (new Date(contractForm.endDate) < new Date(contractForm.startDate)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    if (contractForm.cost && parseFloat(contractForm.cost) < 0) {
      showToast('Cost must be a positive number', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: contractForm.title,
        contractType: contractForm.contractType,
        providerName: contractForm.providerName,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        cost: contractForm.cost ? parseFloat(contractForm.cost) : 0,
        slaDetails: contractForm.slaDetails,
        coveredAssetIds: contractForm.coveredAssetIds
      };

      const res = await api.post('/contracts', payload);
      if (res.success) {
        showToast(`Contract created successfully! (${res.contract?.contractNumber || ''})`);
        setShowCreateContractModal(false);
        setContractForm({
          title: '',
          contractType: 'AMC',
          providerName: '',
          startDate: '',
          endDate: '',
          cost: '',
          slaDetails: '',
          coveredAssetIds: []
        });
        loadData();
      } else {
        showToast(res.message || 'Failed to create contract', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating contract', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWarrantySubmit = async (e) => {
    e.preventDefault();
    if (!warrantyForm.assetId || !warrantyForm.startDate || !warrantyForm.endDate) {
      showToast('Asset, Start Date, and End Date are required', 'error');
      return;
    }

    if (new Date(warrantyForm.endDate) < new Date(warrantyForm.startDate)) {
      showToast('Warranty end date cannot be before start date', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/contracts/warranties', warrantyForm);
      if (res.success) {
        showToast('Warranty recorded successfully!');
        setShowCreateWarrantyModal(false);
        setWarrantyForm({
          assetId: '',
          providerName: '',
          warrantyNumber: '',
          coverageType: 'FULL',
          startDate: '',
          endDate: '',
          terms: ''
        });
        loadData();
      } else {
        showToast(res.message || 'Failed to save warranty', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving warranty', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleAssetSelection = (assetId) => {
    setContractForm(prev => {
      const exists = prev.coveredAssetIds.includes(assetId);
      if (exists) {
        return { ...prev, coveredAssetIds: prev.coveredAssetIds.filter(id => id !== assetId) };
      } else {
        return { ...prev, coveredAssetIds: [...prev.coveredAssetIds, assetId] };
      }
    });
  };

  const filteredAssetsForPicker = useMemo(() => {
    if (!assetSearchQuery) return assets;
    const q = assetSearchQuery.toLowerCase();
    return assets.filter(a => 
      a.tagNumber?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.serialNumber?.toLowerCase().includes(q)
    );
  }, [assets, assetSearchQuery]);

  const resetContractFilters = () => {
    setContractSearch('');
    setContractTypeFilter('ALL');
    setContractStatusFilter('ALL');
    setContractSort('endDate_asc');
  };

  const resetWarrantyFilters = () => {
    setWarrantySearch('');
    setWarrantyCoverageFilter('ALL');
    setWarrantyStatusFilter('ALL');
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
            <ShieldCheck className="w-7 h-7 text-brand-600" />
            Contracts, Warranties & Compliance
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Enterprise coverage manager for AMCs, leases, software licenses, OEM warranties and risk compliance alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowCreateWarrantyModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-brand-600" /> Add Warranty
          </button>

          <button
            onClick={() => setShowCreateContractModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-white" /> New Contract / AMC
          </button>
        </div>
      </div>

      {/* Executive KPI Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div 
          onClick={() => { setActiveTab('CONTRACTS'); setContractStatusFilter('ALL'); }}
          className="bg-white p-3 cursor-pointer hover:border-brand-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Contracts</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalContracts ?? '-'}</p>
          <span className="text-[10px] text-brand-600 font-semibold">All registered</span>
        </div>

        <div 
          onClick={() => { setActiveTab('CONTRACTS'); setContractStatusFilter('ACTIVE'); }}
          className="bg-white p-3 cursor-pointer hover:border-emerald-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Active</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary?.activeContracts ?? '-'}</p>
          <span className="text-[10px] text-emerald-600">Coverage active</span>
        </div>

        <div 
          onClick={() => { setActiveTab('CONTRACTS'); setContractStatusFilter('EXPIRING_SOON'); }}
          className="bg-white p-3 cursor-pointer hover:border-amber-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Exp. 90 Days</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary?.expiringWithin90Days ?? '-'}</p>
          <span className="text-[10px] text-amber-600">Renewal warning</span>
        </div>

        <div 
          onClick={() => { setActiveTab('CONTRACTS'); setContractStatusFilter('CRITICAL_EXPIRE'); }}
          className="bg-white p-3 cursor-pointer hover:border-rose-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Exp. 30 Days</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{summary?.expiringWithin30Days ?? '-'}</p>
          <span className="text-[10px] text-rose-600">Action urgent</span>
        </div>

        <div 
          onClick={() => { setActiveTab('CONTRACTS'); setContractStatusFilter('EXPIRED'); }}
          className="bg-white p-3 cursor-pointer hover:border-red-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Expired</p>
          <p className="text-xl font-bold text-red-600 mt-1">{summary?.expiredContracts ?? '-'}</p>
          <span className="text-[10px] text-red-600">Requires renewal</span>
        </div>

        <div 
          onClick={() => { setActiveTab('WARRANTIES'); setWarrantyStatusFilter('ALL'); }}
          className="bg-white p-3 cursor-pointer hover:border-amber-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Warranties</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalWarranties ?? '-'}</p>
          <span className="text-[10px] text-amber-600">OEM tracked</span>
        </div>

        <div 
          onClick={() => { setActiveTab('WARRANTIES'); setWarrantyStatusFilter('EXPIRING_SOON'); }}
          className="bg-white p-3 cursor-pointer hover:border-amber-500 transition-all border border-slate-200 rounded-xl shadow-xs"
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Exp. Warranties</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary?.expiringWarranties ?? '-'}</p>
          <span className="text-[10px] text-amber-600">Within 90d</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Value</p>
          <p className="text-lg font-bold text-emerald-600 mt-1 truncate">
            ${(summary?.totalContractValue || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Contract commitments</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('CONTRACTS')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'CONTRACTS' 
              ? 'border-brand-600 text-brand-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Vendor Contracts & AMCs ({filteredContracts.length})
        </button>

        <button
          onClick={() => setActiveTab('WARRANTIES')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'WARRANTIES' 
              ? 'border-brand-600 text-brand-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Asset OEM Warranties ({filteredWarranties.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'COMPLIANCE' 
              ? 'border-rose-600 text-rose-600 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Expiry & Compliance Center ({riskFeedItems.length})
        </button>
      </div>

      {/* TAB 1: CONTRACTS MANAGEMENT */}
      {activeTab === 'CONTRACTS' && (
        <div className="space-y-4">
          {/* Contract Search & Filters */}
          <div className="bg-white p-4 rounded-xl space-y-3 border border-slate-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search contract #, title, or provider..."
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <select
                  value={contractTypeFilter}
                  onChange={(e) => setContractTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Contract Types</option>
                  <option value="AMC">AMC</option>
                  <option value="LEASE">Lease</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="SOFTWARE_LICENSE">Software License</option>
                  <option value="SERVICE_SLA">Service SLA</option>
                </select>
              </div>

              <div>
                <select
                  value={contractStatusFilter}
                  onChange={(e) => setContractStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Risk Statuses</option>
                  <option value="ACTIVE">Active (&gt;90d)</option>
                  <option value="EXPIRING_SOON">Expiring Soon (30-90d)</option>
                  <option value="CRITICAL_EXPIRE">Critical (&lt;30d)</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div>
                <select
                  value={contractSort}
                  onChange={(e) => setContractSort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="endDate_asc">Expiry Date (Earliest First)</option>
                  <option value="endDate_desc">Expiry Date (Latest First)</option>
                  <option value="cost_desc">Cost (Highest First)</option>
                  <option value="cost_asc">Cost (Lowest First)</option>
                </select>
              </div>
            </div>

            {(contractSearch || contractTypeFilter !== 'ALL' || contractStatusFilter !== 'ALL') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetContractFilters}
                  className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Contracts Table */}
          <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading contracts...
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No contracts found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Contract # & Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Start & End Dates</th>
                      <th className="p-3">Covered Assets</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Risk Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-900">
                    {filteredContracts.map(c => {
                      const risk = getRiskStatus(c.endDate);
                      const assetCount = c.coveredAssetIds?.length || 0;
                      const costVal = c.cost ? parseFloat(c.cost.toString()) : 0;

                      return (
                        <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-brand-600">{c.contractNumber}</span>
                            <p className="font-semibold text-slate-900 mt-0.5">{c.title}</p>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono border border-slate-200">
                              {c.contractType}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-medium">
                            {c.providerName}
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>From: {new Date(c.startDate).toLocaleDateString()}</div>
                            <div>To: <span className="font-medium text-slate-900">{new Date(c.endDate).toLocaleDateString()}</span></div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-[11px] font-semibold border border-brand-200">
                              {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-emerald-600">
                            ${costVal.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-flex items-center gap-1 ${risk.badgeClass}`}>
                              <Clock className="w-3 h-3" /> {risk.label}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedContract(c)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-brand-600 rounded border border-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                            >
                              View Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WARRANTIES MANAGEMENT */}
      {activeTab === 'WARRANTIES' && (
        <div className="space-y-4">
          {/* Warranty Search & Filters */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search asset tag, description, OEM provider, warranty #..."
                  value={warrantySearch}
                  onChange={(e) => setWarrantySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <select
                  value={warrantyCoverageFilter}
                  onChange={(e) => setWarrantyCoverageFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Coverage Types</option>
                  <option value="FULL">FULL</option>
                  <option value="PARTS_ONLY">PARTS_ONLY</option>
                  <option value="LABOR_ONLY">LABOR_ONLY</option>
                  <option value="EXTENDED">EXTENDED</option>
                </select>
              </div>

              <div>
                <select
                  value={warrantyStatusFilter}
                  onChange={(e) => setWarrantyStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Warranty Statuses</option>
                  <option value="ACTIVE">Active (&gt;90d)</option>
                  <option value="EXPIRING_SOON">Expiring Soon (30-90d)</option>
                  <option value="CRITICAL_EXPIRE">Critical (&lt;30d)</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {(warrantySearch || warrantyCoverageFilter !== 'ALL' || warrantyStatusFilter !== 'ALL') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetWarrantyFilters}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Warranties Table */}
          <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /> Loading warranties...
              </div>
            ) : filteredWarranties.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No OEM warranties recorded matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Asset Details</th>
                      <th className="p-3">Warranty # & Provider</th>
                      <th className="p-3">Coverage Type</th>
                      <th className="p-3">Start & End Dates</th>
                      <th className="p-3">Terms / SLA</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredWarranties.map(w => {
                      const risk = getRiskStatus(w.endDate);
                      const asset = w.assetId;

                      return (
                        <tr key={w._id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-purple-700">{asset?.tagNumber || asset?.assetId || 'AST-???'}</span>
                            <p className="font-semibold text-slate-900 mt-0.5">{asset?.description || 'N/A'}</p>
                            {asset?.serialNumber && <p className="text-[11px] text-slate-500 font-mono">S/N: {asset.serialNumber}</p>}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">{w.providerName || 'OEM / Manufacturer'}</p>
                            {w.warrantyNumber && <p className="font-mono text-[11px] text-slate-500">Ref: {w.warrantyNumber}</p>}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold">
                              {w.coverageType || 'FULL'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>Start: {new Date(w.startDate).toLocaleDateString()}</div>
                            <div>End: <span className="font-medium text-slate-900">{new Date(w.endDate).toLocaleDateString()}</span></div>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">
                            {w.terms || 'Standard OEM warranty terms apply.'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] border inline-flex items-center gap-1 ${risk.badgeClass}`}>
                              <Clock className="w-3 h-3" /> {risk.label}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedWarranty(w)}
                              className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 rounded border border-purple-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                            >
                              Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXPIRY & COMPLIANCE RISK CENTER */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Operational Expiry & Risk Center
            </h3>
            <p className="text-xs text-slate-600">
              Live consolidated feed of upcoming compliance risks, vendor contract renewals, and expiring OEM warranties.
            </p>
          </div>

          <div className="space-y-3">
            {riskFeedItems.length === 0 ? (
              <div className="bg-white p-8 text-center text-slate-500 text-xs rounded-xl border border-slate-200 shadow-xs">
                No active contract or warranty risk records found.
              </div>
            ) : (
              riskFeedItems.map(feed => {
                const isCritical = feed.risk.status === 'EXPIRED' || feed.risk.status === 'CRITICAL_EXPIRE';
                const isWarning = feed.risk.status === 'EXPIRING_SOON';

                let borderStyle = 'border-slate-200 bg-white';
                let iconColor = 'text-emerald-600';
                if (isCritical) {
                  borderStyle = 'border-rose-200 bg-rose-50/50';
                  iconColor = 'text-rose-600';
                } else if (isWarning) {
                  borderStyle = 'border-amber-200 bg-amber-50/50';
                  iconColor = 'text-amber-600';
                }

                return (
                  <div key={feed.id} className={`p-4 rounded-xl border ${borderStyle} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-300 shadow-xs`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
                        <span className="font-semibold text-slate-900 text-xs">{feed.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          feed.type === 'CONTRACT' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {feed.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-6">{feed.subtitle}</p>
                      <p className="text-[11px] text-slate-500 pl-6">
                        Expiry Date: <span className="text-slate-900 font-medium">{new Date(feed.endDate).toLocaleDateString()}</span>
                        {feed.cost > 0 && <span className="ml-3 text-emerald-600 font-semibold">Value: ${feed.cost.toLocaleString()}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${feed.risk.badgeClass}`}>
                        {feed.risk.label}
                      </span>

                      <button
                        onClick={() => {
                          if (feed.type === 'CONTRACT') {
                            setSelectedContract(feed.item);
                          } else {
                            setSelectedWarranty(feed.item);
                          }
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        Review Record <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE CONTRACT MODAL */}
      {showCreateContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 p-6 space-y-5 my-8 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-600" /> Create Vendor Contract / AMC
              </h3>
              <button 
                onClick={() => setShowCreateContractModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContractSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Contract Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual IT Server AMC 2026"
                    value={contractForm.title}
                    onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Contract Type <span className="text-rose-500">*</span></label>
                  <select
                    value={contractForm.contractType}
                    onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="AMC">AMC (Annual Maintenance Contract)</option>
                    <option value="LEASE">Lease Agreement</option>
                    <option value="INSURANCE">Asset Insurance Policy</option>
                    <option value="SOFTWARE_LICENSE">Software License</option>
                    <option value="SERVICE_SLA">Service Level Agreement (SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Provider / Vendor Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Technologies Inc."
                    value={contractForm.providerName}
                    onChange={(e) => setContractForm({ ...contractForm, providerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Contract Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={contractForm.cost}
                    onChange={(e) => setContractForm({ ...contractForm, cost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Start Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">End Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">SLA Terms & Service Coverage Details</label>
                <textarea
                  rows={2}
                  placeholder="Specify uptime requirements, response time SLAs, renewal terms..."
                  value={contractForm.slaDetails}
                  onChange={(e) => setContractForm({ ...contractForm, slaDetails: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Multi-Asset Selector */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 font-medium">
                    Covered Assets ({contractForm.coveredAssetIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-slate-500">Select assets linked to this contract</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Search asset pool to attach..."
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />

                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {filteredAssetsForPicker.length === 0 ? (
                      <div className="text-slate-500 text-[11px] py-2 text-center">No assets found</div>
                    ) : (
                      filteredAssetsForPicker.map(a => {
                        const isSelected = contractForm.coveredAssetIds.includes(a._id);
                        return (
                          <div
                            key={a._id}
                            onClick={() => toggleAssetSelection(a._id)}
                            className={`p-2 rounded cursor-pointer flex items-center justify-between transition-colors text-xs ${
                              isSelected ? 'bg-brand-50 border border-brand-200 text-brand-900 font-semibold' : 'hover:bg-white text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                              <div>
                                <span className="font-mono font-bold text-slate-900">{a.tagNumber || a.assetId}</span>
                                <span className="ml-2 text-slate-600">{a.description}</span>
                              </div>
                            </div>
                            {a.serialNumber && <span className="font-mono text-[10px] text-slate-500">S/N: {a.serialNumber}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateContractModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WARRANTY MODAL */}
      {showCreateWarrantyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Record OEM Warranty
              </h3>
              <button 
                onClick={() => setShowCreateWarrantyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarrantySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Select Target Asset <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={warrantyForm.assetId}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, assetId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.tagNumber || a.assetId} - {a.description} {a.serialNumber ? `(S/N: ${a.serialNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">OEM Provider / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Cisco Systems"
                    value={warrantyForm.providerName}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, providerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Warranty Reference #</label>
                  <input
                    type="text"
                    placeholder="e.g. WRN-88402"
                    value={warrantyForm.warrantyNumber}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, warrantyNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Coverage Type</label>
                  <select
                    value={warrantyForm.coverageType}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, coverageType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="FULL">FULL Coverage</option>
                    <option value="PARTS_ONLY">PARTS ONLY</option>
                    <option value="LABOR_ONLY">LABOR ONLY</option>
                    <option value="EXTENDED">EXTENDED Warranty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Start Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={warrantyForm.startDate}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">End Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={warrantyForm.endDate}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, endDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Warranty Terms & Conditions</label>
                <textarea
                  rows={2}
                  placeholder="Specify replacement turnaround, parts inclusion, exclusions..."
                  value={warrantyForm.terms}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, terms: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateWarrantyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Warranty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTRACT DETAILS DRAWER */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-brand-600">{selectedContract.contractNumber}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedContract.title}</h2>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono border border-slate-200 mt-1 inline-block">
                  {selectedContract.contractType}
                </span>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Risk Banner */}
            {(() => {
              const risk = getRiskStatus(selectedContract.endDate);
              return (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${risk.badgeClass}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-xs">Protection Status: {risk.status}</p>
                      <p className="text-[11px] opacity-90">{risk.label}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Contract Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Vendor / Provider</span>
                <span className="font-semibold text-slate-900">{selectedContract.providerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contract Cost</span>
                <span className="font-semibold text-emerald-600">${parseFloat(selectedContract.cost?.toString() || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Start Date</span>
                <span className="font-medium text-slate-700">{new Date(selectedContract.startDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">End Date</span>
                <span className="font-medium text-slate-700">{new Date(selectedContract.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* SLA Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" /> SLA Terms & Coverage Specifications
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                {selectedContract.slaDetails || 'No explicit SLA terms recorded.'}
              </div>
            </div>

            {/* Multi-Asset Coverage List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-brand-600" /> Covered Assets ({selectedContract.coveredAssetIds?.length || 0})
                </h4>
              </div>

              {!selectedContract.coveredAssetIds || selectedContract.coveredAssetIds.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No assets attached to this contract.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedContract.coveredAssetIds.map(asset => {
                    if (typeof asset === 'string') {
                      return (
                        <div key={asset} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
                          ID: {asset}
                        </div>
                      );
                    }
                    return (
                      <div key={asset._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-bold text-brand-600">{asset.tagNumber || asset.assetId}</span>
                          <p className="font-semibold text-slate-900 mt-0.5">{asset.description}</p>
                          {asset.serialNumber && <p className="text-[10px] text-slate-500 font-mono">S/N: {asset.serialNumber}</p>}
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-white text-slate-700 rounded text-[10px] border border-slate-200">
                            {asset.lifecycleStatus || 'ACTIVE'}
                          </span>
                          {asset.siteId?.name && <p className="text-[10px] text-slate-500 mt-1">{asset.siteId.name}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARRANTY DETAILS DRAWER */}
      {selectedWarranty && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                  {selectedWarranty.coverageType || 'FULL'} WARRANTY
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedWarranty.assetId?.description || 'Asset OEM Warranty'}
                </h2>
                <p className="text-xs text-slate-500">Provider: {selectedWarranty.providerName || 'OEM'}</p>
              </div>
              <button 
                onClick={() => setSelectedWarranty(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Risk Banner */}
            {(() => {
              const risk = getRiskStatus(selectedWarranty.endDate);
              return (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${risk.badgeClass}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-xs">Warranty Status: {risk.status}</p>
                      <p className="text-[11px] opacity-90">{risk.label}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Linked Asset Overview */}
            {selectedWarranty.assetId && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">Linked Master Asset</h4>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-amber-600 text-sm">{selectedWarranty.assetId.tagNumber || selectedWarranty.assetId.assetId}</span>
                    <p className="text-slate-900 font-semibold">{selectedWarranty.assetId.description}</p>
                  </div>
                  {selectedWarranty.assetId.serialNumber && (
                    <div className="text-right font-mono text-slate-500 text-[11px]">
                      S/N: {selectedWarranty.assetId.serialNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warranty Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Warranty #</span>
                <span className="font-semibold font-mono text-slate-900">{selectedWarranty.warrantyNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Coverage Type</span>
                <span className="font-semibold text-amber-600">{selectedWarranty.coverageType || 'FULL'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Start Date</span>
                <span className="font-medium text-slate-700">{new Date(selectedWarranty.startDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">End Date</span>
                <span className="font-medium text-slate-700">{new Date(selectedWarranty.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Warranty Terms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" /> OEM Terms & Replacement Policy
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                {selectedWarranty.terms || 'Standard OEM warranty terms apply.'}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedWarranty(null)}
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

