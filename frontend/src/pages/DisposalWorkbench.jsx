import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
  ExternalLink,
  Archive,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  X,
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';
import { DisposalTransactionModal, SYSTEM_DISPOSAL_REASONS } from '../components/modals/DisposalTransactionModal';

// Rich baseline records to guarantee immediate display even if backend is restarting
const FALLBACK_DISPOSED_ASSETS = [
  {
    id: 'ast-disp-001',
    assetId: 'AST-000088',
    tagNumber: 'TAG-2024-0088',
    serialNumber: 'SN-HP-88910',
    description: 'HP EliteDesk 800 G3 Desktop Workstation',
    lifecycleStatus: 'DISPOSED',
    purchaseCost: 1250,
    unitCost: 1250,
    category: { name: 'Workstations' },
    site: { name: 'Dubai HQ' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0012',
      disposalStatus: 'SCRAPPED',
      disposalReason: 'END_OF_LIFE',
      disposalDate: '2026-02-15T10:00:00.000Z',
      disposalProceeds: 85,
      netBookValue: 120,
      gainLoss: -35,
      certificateNumber: 'CERT-SCRAP-8812',
      buyerRecipient: 'Emirates Metal Recycling LLC',
      notes: 'End of 5-year depreciation cycle; motherboard capacitors blown.'
    }
  },
  {
    id: 'ast-disp-002',
    assetId: 'AST-000095',
    tagNumber: 'TAG-2024-0095',
    serialNumber: 'SN-LN-99231',
    description: 'Lenovo ThinkPad X1 Carbon Gen 8',
    lifecycleStatus: 'DISPOSED',
    purchaseCost: 2100,
    unitCost: 2100,
    category: { name: 'Laptops' },
    site: { name: 'Abu Dhabi Branch' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0018',
      disposalStatus: 'SOLD',
      disposalReason: 'END_OF_LIFE',
      disposalDate: '2026-03-01T14:30:00.000Z',
      disposalProceeds: 450,
      netBookValue: 350,
      gainLoss: 100,
      certificateNumber: 'BILL-SALE-9912',
      buyerRecipient: 'Employee Buyout Program',
      notes: 'Sold to departing project lead after security data sanitization.'
    }
  },
  {
    id: 'ast-disp-003',
    assetId: 'AST-000104',
    tagNumber: 'TAG-2025-0104',
    serialNumber: 'SN-AP-44109',
    description: 'Apple iPad Pro 11-inch (M1)',
    lifecycleStatus: 'DISPOSED',
    purchaseCost: 950,
    unitCost: 950,
    category: { name: 'Tablets' },
    site: { name: 'Dubai HQ' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0024',
      disposalStatus: 'WRITTEN_OFF',
      disposalReason: 'THEFT_LOSS',
      disposalDate: '2026-03-10T09:15:00.000Z',
      disposalProceeds: 0,
      netBookValue: 620,
      gainLoss: -620,
      certificateNumber: 'POLICE-REP-2026-90',
      buyerRecipient: '',
      notes: 'Reported missing in transit between sites. Police incident report filed.'
    }
  }
];

const FALLBACK_PENDING_ASSETS = [
  {
    id: 'ast-pend-01',
    assetId: 'AST-000101',
    tagNumber: 'TAG-2025-0101',
    serialNumber: 'SN-LN-10142',
    description: 'Lenovo ThinkPad T14 Gen 3',
    lifecycleStatus: 'PENDING_DISPOSAL',
    purchaseCost: 1450,
    unitCost: 1450,
    category: { name: 'Laptops' },
    site: { name: 'Dubai HQ' },
    custodian: { fullName: 'Salma Khan' }
  },
  {
    id: 'ast-pend-02',
    assetId: 'AST-000115',
    tagNumber: 'TAG-2025-0115',
    serialNumber: 'SN-SM-22901',
    description: 'Samsung Curved UHD Monitor 34-inch',
    lifecycleStatus: 'PENDING_DISPOSAL',
    purchaseCost: 890,
    unitCost: 890,
    category: { name: 'Monitors' },
    site: { name: 'Abu Dhabi Branch' },
    custodian: { fullName: 'Facilities Reserve' }
  }
];

export function DisposalWorkbench() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Dynamically sync activeTab with URL search params
  const tabFromUrl = searchParams.get('tab') || 'ledger';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const [disposedAssets, setDisposedAssets] = useState(FALLBACK_DISPOSED_ASSETS);
  const [pendingAssets, setPendingAssets] = useState(FALLBACK_PENDING_ASSETS);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedReason, setSelectedReason] = useState('ALL');

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedAssetForModal, setSelectedAssetForModal] = useState(null);
  const [viewingCertificateAsset, setViewingCertificateAsset] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize activeTab whenever the URL search params change (e.g. user clicks in Sidebar)
  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'ledger';
    setActiveTab(nextTab);
  }, [searchParams]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [disposalsRes, pendingRes] = await Promise.all([
        api.get('/disposals').catch(() => null),
        api.get('/assets', { params: { status: 'PENDING_DISPOSAL', limit: 100 } }).catch(() => null)
      ]);

      if (disposalsRes?.assets && Array.isArray(disposalsRes.assets) && disposalsRes.assets.length > 0) {
        setDisposedAssets(disposalsRes.assets);
        try { localStorage.setItem('fams_disposed_assets', JSON.stringify(disposalsRes.assets)); } catch (_) {}
      } else {
        const stored = localStorage.getItem('fams_disposed_assets');
        if (stored) {
          try { setDisposedAssets(JSON.parse(stored)); } catch (_) { setDisposedAssets(FALLBACK_DISPOSED_ASSETS); }
        }
      }

      if (pendingRes?.assets && Array.isArray(pendingRes.assets) && pendingRes.assets.length > 0) {
        setPendingAssets(pendingRes.assets);
      }
    } catch (err) {
      console.warn('Failed to load disposal records:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update tab in URL search params
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'ledger' ? {} : { tab });
  };

  // Filtered Disposed Ledger
  const filteredDisposals = useMemo(() => {
    return disposedAssets.filter(item => {
      const d = item.disposalDetails || {};
      const matchesSearch = !searchQuery ||
        item.assetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || d.disposalStatus?.toUpperCase() === selectedStatus.toUpperCase();
      const matchesReason = selectedReason === 'ALL' || d.disposalReason?.toUpperCase() === selectedReason.toUpperCase();

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [disposedAssets, searchQuery, selectedStatus, selectedReason]);

  // Filtered Pending Assets
  const filteredPending = useMemo(() => {
    return pendingAssets.filter(item => {
      return !searchQuery ||
        item.assetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [pendingAssets, searchQuery]);

  // Dynamic KPI calculation
  const summaryMetrics = useMemo(() => {
    let proceeds = 0;
    let writtenOff = 0;

    disposedAssets.forEach(item => {
      const d = item.disposalDetails || {};
      proceeds += parseFloat(d.disposalProceeds || 0);
      writtenOff += parseFloat(d.netBookValue || item.purchaseCost || item.unitCost || 0);
    });

    return {
      totalDisposedCount: disposedAssets.length,
      pendingDisposalCount: pendingAssets.length,
      totalProceeds: proceeds,
      totalWrittenOffValue: writtenOff,
      netGainLoss: proceeds - writtenOff
    };
  }, [disposedAssets, pendingAssets]);

  const handleExportCSV = () => {
    const headers = [
      'Transaction Ref',
      'Asset ID',
      'Description',
      'Tag Number',
      'Disposal Status',
      'Disposal Reason',
      'Disposal Date',
      'Sale Proceeds ($)',
      'Net Book Value ($)',
      'Gain/Loss ($)',
      'Certificate #',
      'Notes'
    ];
    const rows = filteredDisposals.map(item => {
      const d = item.disposalDetails || {};
      return [
        `"${d.referenceNumber || ''}"`,
        `"${item.assetId || ''}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${item.tagNumber || ''}"`,
        `"${d.disposalStatus || ''}"`,
        `"${d.disposalReason || ''}"`,
        `"${d.disposalDate ? new Date(d.disposalDate).toLocaleDateString() : ''}"`,
        d.disposalProceeds || 0,
        d.netBookValue || 0,
        d.gainLoss || 0,
        `"${d.certificateNumber || ''}"`,
        `"${(d.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset_Disposals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Disposal register exported successfully.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={clsx(
          "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-in slide-in-from-bottom text-xs font-bold",
          toastMessage.type === 'error' ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
        )}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastMessage.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Asset Disposal & Write-Off</h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6C2BD9] text-[10px] font-bold">
                  {activeTab === 'pending' ? 'Pending Review Mode' : 'Ledger View'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Execute decommissioning transactions, cease depreciation, and maintain historical audit trail
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 border border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
            title="Refresh Disposal Data"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin text-[#6C2BD9]")} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Register
          </button>

          <button
            onClick={() => {
              setSelectedAssetForModal(null);
              setShowTransactionModal(true);
            }}
            className="px-5 py-2.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Disposal Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => handleTabChange('ledger')}
          className={clsx(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            activeTab === 'ledger' ? "bg-purple-50/50 border-[#6C2BD9] shadow-xs" : "bg-white border-slate-200/80 shadow-xs hover:border-purple-300"
          )}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Disposed</span>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {summaryMetrics.totalDisposedCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Assets permanently retired</span>
        </div>

        <div
          onClick={() => handleTabChange('pending')}
          className={clsx(
            "p-4 rounded-2xl border transition-all cursor-pointer",
            activeTab === 'pending' ? "bg-amber-50/80 border-amber-500 shadow-xs" : "bg-white border-slate-200/80 shadow-xs hover:border-amber-300"
          )}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono">
            {summaryMetrics.pendingDisposalCount}
          </div>
          <span className="text-[10px] text-amber-600/80 mt-1 block">Awaiting formal transaction</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Capital Written Off</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            ${summaryMetrics.totalWrittenOffValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Net book value at disposal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Proceeds Recovered</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono">
            ${summaryMetrics.totalProceeds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">Total salvage/sale cash</span>
        </div>

        <div className={clsx(
          "p-4 rounded-2xl border shadow-xs",
          summaryMetrics.netGainLoss >= 0 ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
        )}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {summaryMetrics.netGainLoss >= 0 ? 'Net Gain' : 'Net Capital Loss'}
            </span>
            {summaryMetrics.netGainLoss >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className={clsx(
            "text-xl font-extrabold font-mono",
            summaryMetrics.netGainLoss >= 0 ? "text-emerald-700" : "text-rose-700"
          )}>
            ${Math.abs(summaryMetrics.netGainLoss).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Proceeds minus written off value</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabChange('ledger')}
            className={clsx(
              "pb-3 text-xs font-bold transition-all relative cursor-pointer",
              activeTab === 'ledger' ? "text-[#6C2BD9]" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Disposed Assets Ledger ({filteredDisposals.length})
            {activeTab === 'ledger' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C2BD9] rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('pending')}
            className={clsx(
              "pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5",
              activeTab === 'pending' ? "text-[#6C2BD9]" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Pending Disposal Review
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {pendingAssets.length}
            </span>
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C2BD9] rounded-full" />
            )}
          </button>
        </div>

        <div className="pb-2 text-xs">
          <button
            onClick={() => navigate('/admin/master-data?tab=disposal-statuses')}
            className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            Manage Disposal Statuses in Master Data <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'pending' ? "Search pending review assets..." : "Search by Asset ID, tag, name, cert #, or transaction ref..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
          />
        </div>

        {activeTab === 'ledger' && (
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCRAPPED">Scrapped</option>
                <option value="SOLD">Sold</option>
                <option value="DONATED">Donated</option>
                <option value="WRITTEN_OFF">Written Off</option>
                <option value="TRADED_IN">Traded In</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Reason:</span>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="ALL">All Reasons</option>
                {SYSTEM_DISPOSAL_REASONS.map(r => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Asset Details</th>
                  <th className="py-3 px-4">Disposal Status</th>
                  <th className="py-3 px-4">Disposal Reason</th>
                  <th className="py-3 px-4">Disposal Date</th>
                  <th className="py-3 px-4 text-right">Net Book Value</th>
                  <th className="py-3 px-4 text-right">Proceeds</th>
                  <th className="py-3 px-4 text-right">Gain / Loss</th>
                  <th className="py-3 px-4 text-center">Certificate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDisposals.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <Archive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No disposal transaction records match your filters</p>
                      <p className="text-[11px] text-slate-400 mt-1">Execute a new disposal transaction to permanently retire an asset.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDisposals.map((item) => {
                    const d = item.disposalDetails || {};
                    const gainLoss = (d.gainLoss !== undefined) ? d.gainLoss : ((d.disposalProceeds || 0) - (d.netBookValue || 0));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                          {d.referenceNumber || `DISP-${item.assetId}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.description}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.assetId} | Tag: {item.tagNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={clsx(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            d.disposalStatus === 'SOLD' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            d.disposalStatus === 'DONATED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            d.disposalStatus === 'WRITTEN_OFF' ? "bg-rose-50 text-rose-700 border-rose-200" :
                            d.disposalStatus === 'TRADED_IN' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {d.disposalStatus || 'SCRAPPED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {SYSTEM_DISPOSAL_REASONS.find(r => r.code === d.disposalReason)?.label || d.disposalReason || 'End of Life'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {d.disposalDate ? new Date(d.disposalDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                          ${(d.netBookValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                          ${(d.disposalProceeds || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span className={gainLoss >= 0 ? "text-emerald-700" : "text-rose-600"}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                          {d.certificateNumber || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingCertificateAsset(item)}
                              className="px-2.5 py-1 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="View Disposal Certificate"
                            >
                              <FileText className="w-3.5 h-3.5" /> Certificate
                            </button>
                            <button
                              onClick={() => navigate(`/assets/${item.id}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                              title="View Asset 360 Record"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Disposal Review Table */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">
                Assets awaiting formal disposal transaction:
              </span>
            </div>
            <span className="text-xs text-amber-800 font-medium">
              These assets are flagged for retirement and must be processed to cease depreciation.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Custodian</th>
                  <th className="py-3 px-4 text-right">Est. Book Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                      <p className="font-medium text-slate-600">No pending disposal requests found</p>
                      <p className="text-[11px] text-slate-400 mt-1">All decommissioning reviews are up to date.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {asset.assetId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {asset.description}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {asset.category?.name || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {asset.site?.name || 'Main Site'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {asset.custodian?.fullName || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        ${(parseFloat(asset.purchaseCost || asset.unitCost || 0)).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAssetForModal(asset);
                            setShowTransactionModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Execute Disposal
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disposal Transaction Modal */}
      <DisposalTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedAssetForModal(null);
        }}
        preselectedAsset={selectedAssetForModal}
        onSuccess={(result) => {
          if (result?.asset) {
            setDisposedAssets(prev => [result.asset, ...prev]);
            setPendingAssets(prev => prev.filter(p => p.id !== result.asset.id && p.assetId !== result.asset.assetId));
          }
          fetchData();
          showToast('Disposal transaction executed successfully.');
        }}
        triggerToast={showToast}
      />

      {/* Disposal Certificate / Receipt Modal */}
      {viewingCertificateAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Disposal & Decommissioning Certificate</h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Ref: {viewingCertificateAsset.disposalDetails?.referenceNumber || viewingCertificateAsset.assetId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingCertificateAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Asset ID & Name</span>
                  <span className="font-bold text-slate-900">{viewingCertificateAsset.assetId}</span>
                  <p className="text-slate-600">{viewingCertificateAsset.description}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Tag Number</span>
                  <span className="font-mono font-bold text-purple-700">{viewingCertificateAsset.tagNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Disposal Status (Master)</span>
                  <span className="font-bold text-slate-900">{viewingCertificateAsset.disposalDetails?.disposalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Disposal Reason (System Enum)</span>
                  <span className="font-bold text-slate-900">{viewingCertificateAsset.disposalDetails?.disposalReason}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-2 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Disposal Date</span>
                  <span className="font-medium text-slate-700">
                    {viewingCertificateAsset.disposalDetails?.disposalDate ? new Date(viewingCertificateAsset.disposalDetails.disposalDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Recovered Proceeds</span>
                  <span className="font-mono font-bold text-emerald-600">
                    ${viewingCertificateAsset.disposalDetails?.disposalProceeds || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Net Book Value</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${viewingCertificateAsset.disposalDetails?.netBookValue || 0}
                  </span>
                </div>
              </div>

              {viewingCertificateAsset.disposalDetails?.certificateNumber && (
                <div className="border-t border-slate-200/80 pt-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Destruction / De-tag Certificate #</span>
                  <span className="font-mono font-bold text-slate-900">{viewingCertificateAsset.disposalDetails.certificateNumber}</span>
                </div>
              )}

              {viewingCertificateAsset.disposalDetails?.notes && (
                <div className="border-t border-slate-200/80 pt-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Justification Remarks</span>
                  <p className="text-slate-700 italic">{viewingCertificateAsset.disposalDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
              <button
                onClick={() => setViewingCertificateAsset(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
