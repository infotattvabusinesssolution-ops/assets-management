import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Inbox, 
  Plus, 
  CheckCircle, 
  Package, 
  Building, 
  MapPin, 
  DollarSign, 
  Truck, 
  Barcode, 
  FileText, 
  X, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Trash2,
  Eye,
  RefreshCw,
  Clock,
  Tag
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'cat-01', code: 'CAT-IT', name: 'IT Infrastructure & Compute' },
  { id: 'cat-02', code: 'CAT-FAC', name: 'Facilities & Heavy Machinery' },
  { id: 'cat-03', code: 'CAT-VEH', name: 'Fleet Vehicles & Logistics' },
  { id: 'cat-04', code: 'CAT-FURN', name: 'Office Furniture & Fixtures' }
];

export function ReceivingWorkbench() {
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalUnitsReceived: 0,
    totalPoValuation: 0,
    stagedAssetsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deleteReceiptId, setDeleteReceiptId] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('');

  // Form Fields
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [packingSlip, setPackingSlip] = useState('');
  const [receivingDock, setReceivingDock] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  
  // Line Item Fields
  const [itemDesc, setItemDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState(1250);
  const [condition, setCondition] = useState('NEW');
  const [serials, setSerials] = useState('SN-RCV-101, SN-RCV-102');

  // Master Data Dropdowns
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.allSettled([
        api.get('/receiving'),
        api.get('/receiving/stats')
      ]);

      if (rRes.status === 'fulfilled' && rRes.value?.success) {
        setReceipts(rRes.value.receipts || []);
      }

      if (sRes.status === 'fulfilled' && sRes.value?.success && sRes.value.stats) {
        setStats(sRes.value.stats);
      }
    } catch (err) { 
      console.error('Failed to load goods receipts:', err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    
    // Load Master Data
    api.get('/master-data/companies').then(r => {
      if (r && r.success && r.companies.length > 0) {
        setCompanies(r.companies);
        setSelectedCompany(r.companies[0].id || r.companies[0]._id || r.companies[0].code);
      } else {
        const fallbackCmp = [{ id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }];
        setCompanies(fallbackCmp);
        setSelectedCompany('cmp-01');
      }
    }).catch(() => {
      setCompanies([{ id: 'cmp-01', name: 'Infotatwaa Enterprise Corp', code: 'CMP-GLOBAL' }]);
      setSelectedCompany('cmp-01');
    });

    api.get('/master-data/sites').then(r => {
      if (r && r.success && r.sites.length > 0) {
        setSites(r.sites);
        setSelectedSite(r.sites[0].id || r.sites[0]._id || r.sites[0].code);
      } else {
        const fallbackSite = [{ id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }];
        setSites(fallbackSite);
        setSelectedSite('site-01');
      }
    }).catch(() => {
      setSites([{ id: 'site-01', name: 'Global HQ Campus', code: 'SITE-HQ' }]);
      setSelectedSite('site-01');
    });

    api.get('/master-data/categories').then(r => {
      if (r && r.success && r.categories.length > 0) {
        setCategories(r.categories);
        setSelectedCategory(r.categories[0].id || r.categories[0]._id || r.categories[0].code);
      } else {
        setCategories(DEFAULT_CATEGORIES);
        setSelectedCategory('cat-01');
      }
    }).catch(() => {
      setCategories(DEFAULT_CATEGORIES);
      setSelectedCategory('cat-01');
    });
  }, []);

  const parsedSerials = serials
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const calculatedQuantity = parsedSerials.length || 1;
  const calculatedTotalValue = calculatedQuantity * (parseFloat(unitPrice) || 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const lineItems = [{
        description: itemDesc || 'Received Inventory Line Item',
        categoryId: selectedCategory,
        unitPrice: parseFloat(unitPrice) || 0,
        condition,
        serialNumbers: parsedSerials
      }];

      const res = await api.post('/receiving', {
        poNumber,
        vendorName,
        packingSlip,
        receivingDock,
        companyId: selectedCompany,
        siteId: selectedSite,
        lineItems
      });

      if (res && res.success) {
        setShowModal(false);
        // Reset form
        setPoNumber('');
        setVendorName('');
        setItemDesc('');
        setPackingSlip('');
        setReceivingDock('');
        setSerials('SN-RCV-101, SN-RCV-102');
        showToastNotification(`Successfully processed PO Goods Receipt "${res.receipt?.receiptNumber || 'NEW'}"!`);
        fetchReceipts();
      } else {
        alert(res?.message || 'Goods receiving process failed');
      }
    } catch (err) {
      console.error('Receiving error:', err);
      alert(err?.message || err?.error || 'Goods receiving failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (id) => {
    try {
      const res = await api.delete(`/receiving/${id}`);
      if (res && res.success) {
        setDeleteReceiptId(null);
        showToastNotification('Goods receipt record deleted.');
        fetchReceipts();
      } else {
        alert(res?.message || 'Failed to delete goods receipt.');
      }
    } catch (err) {
      console.error('Delete receipt error:', err);
      alert(err?.message || 'Failed to delete goods receipt.');
    }
  };

  // Filtered receipts
  const filteredReceipts = receipts.filter(r => {
    const q = search.toLowerCase();
    const matchesQuery = !q || 
      (r.receiptNumber && r.receiptNumber.toLowerCase().includes(q)) ||
      (r.poNumber && r.poNumber.toLowerCase().includes(q)) ||
      (r.vendorName && r.vendorName.toLowerCase().includes(q));

    const matchesSite = !selectedSiteFilter || r.siteId === selectedSiteFilter || r.site?.id === selectedSiteFilter;

    return matchesQuery && matchesSite;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Goods Receiving Workbench</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              Procurement Intake Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Receive PO consignments, capture manufacturer serial keys, assign company site allocation, and stage automated asset registration.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Process Goods Receiving
        </button>
      </div>

      {/* Receiving KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Goods Receipts</span>
            <Inbox className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalReceipts || receipts.length}</p>
          <span className="text-[11px] text-slate-400">Processed Intake Batches</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Units Received</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUnitsReceived}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Physical Items Staged</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>PO Intake Valuation</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${(stats.totalPoValuation || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">CapEx Capitalized Cost</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending Staging</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.stagedAssetsCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Assets in RECEIVED status</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search Receipt #, PO, Vendor..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedSiteFilter}
            onChange={e => setSelectedSiteFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Authorized Sites</option>
            {sites.map(s => (
              <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
            ))}
          </select>

          <button 
            onClick={fetchReceipts} 
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Receipts List Table / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading goods receipts...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Goods Receipts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Process incoming PO shipments to auto-create asset records into the Central Asset Register.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Process First Receipt
            </button>
          </div>
        ) : (
          filteredReceipts.map((r) => (
            <div key={r.id || r._id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-purple-200 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-purple-700 text-sm">{r.receiptNumber}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {r.status || 'COMPLETED'}
                  </span>
                  {r.company?.name && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {r.company.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <p>
                    PO Number: <span className="font-semibold text-slate-900 font-mono">{r.poNumber}</span>
                  </p>
                  <span className="text-slate-300">•</span>
                  <p>
                    Vendor: <span className="font-semibold text-slate-900">{r.vendorName}</span>
                  </p>
                  {r.site?.name && (
                    <>
                      <span className="text-slate-300">•</span>
                      <p>Site: <span className="font-semibold text-slate-900">{r.site.name}</span></p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 text-xs text-slate-500 justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Received Date</p>
                  <p className="font-medium text-slate-800">{new Date(r.receivedDate || r.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Line Items</p>
                  <p className="text-purple-700 font-bold flex items-center justify-end gap-1">
                    <Package className="w-3.5 h-3.5" /> {r.lineItems?.length || 1} Item(s)
                  </p>
                </div>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => setSelectedReceipt(r)}
                    className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Receipt Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteReceiptId(r.id || r._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Receipt Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <form 
            onSubmit={handleCreate} 
            className="bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          >
            {/* Fixed Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-purple-600" /> Process Goods Receiving & Stage Assets
                </h2>
                <p className="text-xs text-slate-500">
                  Record PO delivery details, assign company site campus, and generate registered assets.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* SECTION 1: PO & VENDOR IDENTITY */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                  1. Purchase Order & Vendor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      PO Number <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={poNumber} 
                      onChange={e => setPoNumber(e.target.value)} 
                      placeholder="e.g. PO-2026-9901" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Vendor / Supplier Name <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={vendorName} 
                      onChange={e => setVendorName(e.target.value)} 
                      placeholder="e.g. Dell Authorized Direct" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Packing Slip / Waybill #
                    </label>
                    <input 
                      type="text" 
                      value={packingSlip} 
                      onChange={e => setPackingSlip(e.target.value)} 
                      placeholder="e.g. PS-8890-FEDEX" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: COMPANY ENTITY & DESTINATION SITE */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                  2. Enterprise Entity & Destination Site
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Company Entity <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      required
                      value={selectedCompany}
                      onChange={e => setSelectedCompany(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      {companies.map(c => {
                        const val = c.id || c._id || c.code;
                        return <option key={val} value={val}>{c.name}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Destination Site Campus <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      required
                      value={selectedSite}
                      onChange={e => setSelectedSite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      {sites.map(s => {
                        const val = s.id || s._id || s.code;
                        return <option key={val} value={val}>{s.name}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LINE ITEM & VALUATION */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                  3. Item Classification & Acquisition Valuation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Item Description <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={itemDesc} 
                      onChange={e => setItemDesc(e.target.value)} 
                      placeholder="e.g. Dell PowerEdge R760 Rack Server" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Asset Category <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      required
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      {categories.map(c => {
                        const val = c.id || c._id || c.code;
                        return <option key={val} value={val}>{c.name}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Unit Acquisition Price ($) <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      value={unitPrice} 
                      onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Intake Condition
                    </label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      <option value="NEW">NEW (Brand New Sealed)</option>
                      <option value="EXCELLENT">EXCELLENT (Inspected & Verified)</option>
                      <option value="GOOD">GOOD (Normal Intake)</option>
                      <option value="DAMAGED_BOX">DAMAGED_BOX (Packaging Dented)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Receiving Dock / Staging Area
                    </label>
                    <input 
                      type="text" 
                      value={receivingDock} 
                      onChange={e => setReceivingDock(e.target.value)} 
                      placeholder="e.g. Dock 2 - Staging Bay A" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: SERIAL NUMBERS & AUTO REGISTRATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-purple-700">
                    4. Serial Numbers & Automated Asset Generation
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {calculatedQuantity} Asset {calculatedQuantity === 1 ? 'Record' : 'Records'} (${calculatedTotalValue.toLocaleString()})
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Serial Numbers (Comma-separated list for batch intake)
                  </label>
                  <textarea 
                    rows="2"
                    value={serials} 
                    onChange={e => setSerials(e.target.value)} 
                    placeholder="e.g. SN-RCV-101, SN-RCV-102, SN-RCV-103"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono" 
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    Submitting this receipt will auto-create <strong className="text-slate-900">{calculatedQuantity} asset record(s)</strong> in the Central Asset Register tagged with barcode labels, purchase order references, and corporate capitalization book values.
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Modal Actions Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
              <div className="text-xs text-slate-500">
                Fields marked with <span className="text-red-500 font-bold text-sm">*</span> are required for receiving.
              </div>

              <div className="flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> 
                  {submitting ? 'Processing Receipt...' : 'Receive & Register Assets'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* View Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl p-6 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-purple-700 text-sm">{selectedReceipt.receiptNumber}</span>
                <p className="text-xs text-slate-500">PO Intake Receipt Audit Trail</p>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400">PO Number</p>
                <p className="font-bold text-slate-800 font-mono">{selectedReceipt.poNumber}</p>
              </div>
              <div>
                <p className="text-slate-400">Vendor / Supplier</p>
                <p className="font-bold text-slate-800">{selectedReceipt.vendorName}</p>
              </div>
              <div>
                <p className="text-slate-400">Company Entity</p>
                <p className="font-semibold text-slate-800">{selectedReceipt.company?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">Destination Site</p>
                <p className="font-semibold text-slate-800">{selectedReceipt.site?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Received Line Items</h4>
              {selectedReceipt.lineItems && selectedReceipt.lineItems.length > 0 ? (
                selectedReceipt.lineItems.map((line, idx) => (
                  <div key={line.id || idx} className="border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{line.description || 'Inventory Line Item'}</span>
                      <span className="font-mono font-bold text-purple-700">${parseFloat(line.unitPrice || 0).toLocaleString()}</span>
                    </div>
                    {line.serialNumbers && line.serialNumbers.length > 0 && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        Serials: {line.serialNumbers.join(', ')}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No line item breakdown available.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteReceiptId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Goods Receipt?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this goods receipt record? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button 
                onClick={() => setDeleteReceiptId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteReceipt(deleteReceiptId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
