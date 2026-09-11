import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  UserCheck, 
  ArrowLeftRight, 
  Building, 
  User, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Briefcase,
  Layers,
  ShieldCheck,
  Clock,
  Package,
  FileText,
  CheckSquare,
  Trash2,
  Edit
} from 'lucide-react';

export function CustodyTransferWorkbench() {
  const [activeTab, setActiveTab] = useState('CUSTODY'); // 'CUSTODY' | 'TRANSFER'
  
  // Primary Data & Stats
  const [assignments, setAssignments] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    totalTransfers: 0,
    overdueAssignments: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Master data for forms
  const [assetsList, setAssetsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);

  // Search & Filters
  const [custodySearch, setCustodySearch] = useState('');
  const [custodyStatusFilter, setCustodyStatusFilter] = useState('ALL');

  const [transferSearch, setTransferSearch] = useState('');
  const [transferTypeFilter, setTransferTypeFilter] = useState('ALL');
  const [transferStatusFilter, setTransferStatusFilter] = useState('ALL');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Enhanced Enterprise Custody Form State
  const initialCustodyForm = {
    assetId: '',
    custodianId: '',
    custodyType: 'PERMANENT_ASSIGNMENT',
    conditionAtIssue: 'GOOD',
    issuedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    gatePassNumber: '',
    accessories: {
      powerAdapter: true,
      carryingCase: false,
      mouse: false,
      dockingStation: false,
      cableLock: false
    },
    acknowledged: true,
    notes: ''
  };

  const [custodyForm, setCustodyForm] = useState(initialCustodyForm);

  // Transfer Form State
  const initialTransferForm = {
    assetId: '',
    transferType: 'INTRA_SITE',
    customTransferType: '',
    isCustomType: false,
    toCompanyId: '',
    toSiteId: '',
    toRoomId: '',
    toCustodianId: '',
    reason: ''
  };

  const [transferForm, setTransferForm] = useState(initialTransferForm);

  // Edit & Delete Transfer Modal State
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [editTransferForm, setEditTransferForm] = useState({
    transferType: 'INTRA_SITE',
    customTransferType: '',
    isCustomType: false,
    toSiteId: '',
    toRoomId: '',
    reason: ''
  });

  const [deleteTransferId, setDeleteTransferId] = useState(null);

  const handleOpenEditTransfer = (t) => {
    const customMatch = t.reason && t.reason.match(/\[Custom Type:\s*([^\]]+)\]/i);
    const isCustom = Boolean(customMatch) || !['INTRA_SITE', 'INTER_SITE', 'INTER_COMPANY', 'INTER_DEPARTMENT'].includes(t.transferType);
    const customVal = customMatch ? customMatch[1] : (isCustom ? t.transferType : '');
    const cleanReason = t.reason ? t.reason.replace(/\[Custom Type:\s*[^\]]+\]/gi, '').trim() : '';

    setEditTransferForm({
      transferType: isCustom ? 'CUSTOM' : t.transferType,
      customTransferType: customVal,
      isCustomType: isCustom,
      toSiteId: t.toSiteId?.id || t.toSiteId?._id || t.toSiteId || '',
      toRoomId: t.toRoomId?.id || t.toRoomId?._id || t.toRoomId || '',
      reason: cleanReason
    });
    setEditingTransfer(t);
  };

  const handleUpdateTransferSubmit = async (e) => {
    e.preventDefault();
    if (!editingTransfer) return;

    setActionLoading(true);
    try {
      const payload = {
        transferType: editTransferForm.isCustomType ? 'CUSTOM' : editTransferForm.transferType,
        customTransferType: (editTransferForm.isCustomType || editTransferForm.transferType === 'CUSTOM') ? editTransferForm.customTransferType : undefined,
        toSiteId: editTransferForm.toSiteId || undefined,
        toRoomId: editTransferForm.toRoomId || undefined,
        reason: editTransferForm.reason
      };

      const res = await api.put(`/custody-transfers/transfers/${editingTransfer.id || editingTransfer._id}`, payload);
      if (res && res.success) {
        showToast('success', 'Transfer details & Transfer Type updated!');
        setEditingTransfer(null);
        loadWorkbenchData();
      } else {
        alert(res?.message || 'Failed to update transfer');
      }
    } catch (err) {
      console.error('Update transfer error:', err);
      alert(err?.message || 'Failed to update transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTransfer = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/custody-transfers/transfers/${id}`);
      if (res && res.success) {
        showToast('success', 'Transfer record deleted successfully');
        setDeleteTransferId(null);
        loadWorkbenchData();
      } else {
        alert(res?.message || 'Failed to delete transfer');
      }
    } catch (err) {
      console.error('Delete transfer error:', err);
      alert(err?.message || 'Failed to delete transfer');
    } finally {
      setActionLoading(false);
    }
  };

  // Selected Asset Details for Form Pre-filling (evaluates .id || ._id || .assetId safely)
  const selectedCustodyAsset = assetsList.find(a => (a.id || a._id || a.assetId) === custodyForm.assetId);
  const selectedTransferAsset = assetsList.find(a => (a.id || a._id || a.assetId) === transferForm.assetId);

  // Load Main Workbench Data & Telemetry
  const loadWorkbenchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trRes, csRes, stRes] = await Promise.allSettled([
        api.get('/custody-transfers/transfers'),
        api.get('/custody-transfers/custody'),
        api.get('/custody-transfers/stats')
      ]);

      if (trRes.status === 'fulfilled' && trRes.value?.success) {
        setTransfers(trRes.value.transfers || []);
      }

      if (csRes.status === 'fulfilled' && csRes.value?.success) {
        setAssignments(csRes.value.assignments || []);
      }

      if (stRes.status === 'fulfilled' && stRes.value?.success && stRes.value.stats) {
        setStats(stRes.value.stats);
      }

    } catch (err) {
      console.error('Failed to load custody data:', err);
      setError(err.message || 'Failed to load workbench data');
    } finally {
      setLoading(false);
    }
  };

  // Load Dropdown Options for Modals
  const loadMasterDataOptions = async () => {
    try {
      const [assetsRes, empRes, sitesRes, roomsRes, compRes] = await Promise.allSettled([
        api.get('/assets?limit=200'),
        api.get('/master-data/employees'),
        api.get('/master-data/sites'),
        api.get('/master-data/rooms'),
        api.get('/master-data/companies')
      ]);

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.success) setAssetsList(assetsRes.value.assets || []);
      if (empRes.status === 'fulfilled' && empRes.value?.success) setEmployeesList(empRes.value.employees || []);
      if (sitesRes.status === 'fulfilled' && sitesRes.value?.success) setSitesList(sitesRes.value.sites || []);
      if (roomsRes.status === 'fulfilled' && roomsRes.value?.success) setRoomsList(roomsRes.value.rooms || []);
      if (compRes.status === 'fulfilled' && compRes.value?.success) setCompaniesList(compRes.value.companies || []);
    } catch (err) {
      console.error('Failed to load master data options:', err);
    }
  };

  useEffect(() => {
    loadWorkbenchData();
    loadMasterDataOptions();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // HANDLER: ASSIGN CUSTODY
  const handleAssignCustodySubmit = async (e) => {
    e.preventDefault();
    if (!custodyForm.assetId || !custodyForm.custodianId) {
      alert('Please select both an asset and an employee custodian.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/custody-transfers/custody', custodyForm);
      if (res && res.success) {
        showToast('success', 'Asset custody assigned successfully!');
        setShowAssignModal(false);
        setCustodyForm(initialCustodyForm);
        loadWorkbenchData();
        loadMasterDataOptions();
      } else {
        alert(res?.message || 'Failed to assign custody');
      }
    } catch (err) {
      console.error('Custody assignment error:', err);
      alert(err?.message || 'Failed to assign custody');
    } finally {
      setActionLoading(false);
    }
  };

  // HANDLER: RETURN CUSTODY TO INVENTORY
  const handleReturnCustody = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to return this asset to inventory custody?')) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/custody-transfers/custody/${assignmentId}/return`, {
        notes: 'Returned via Custody Workbench'
      });
      if (res && res.success) {
        showToast('success', 'Asset returned to inventory (IN_STORE)');
        loadWorkbenchData();
        loadMasterDataOptions();
      } else {
        alert(res?.message || 'Failed to return custody');
      }
    } catch (err) {
      console.error('Return custody error:', err);
      alert(err?.message || 'Failed to return custody');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReassignModal = (assetId) => {
    setCustodyForm(prev => ({ ...prev, assetId }));
    setShowAssignModal(true);
  };

  // HANDLER: MOVEMENT / TRANSFER
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.assetId) {
      alert('Please select an asset to move/transfer.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        assetId: transferForm.assetId,
        transferType: transferForm.isCustomType ? 'CUSTOM' : transferForm.transferType,
        customTransferType: (transferForm.isCustomType || transferForm.transferType === 'CUSTOM') ? transferForm.customTransferType : undefined,
        fromSiteId: selectedTransferAsset?.siteId?.id || selectedTransferAsset?.siteId?._id || selectedTransferAsset?.siteId,
        fromRoomId: selectedTransferAsset?.roomId?.id || selectedTransferAsset?.roomId?._id || selectedTransferAsset?.roomId,
        fromCustodianId: selectedTransferAsset?.custodianId?.id || selectedTransferAsset?.custodianId?._id || selectedTransferAsset?.custodianId,
        fromCompanyId: selectedTransferAsset?.companyId?.id || selectedTransferAsset?.companyId?._id || selectedTransferAsset?.companyId,
        toSiteId: transferForm.toSiteId || undefined,
        toRoomId: transferForm.toRoomId || undefined,
        toCompanyId: transferForm.toCompanyId || undefined,
        toCustodianId: transferForm.toCustodianId || undefined,
        reason: transferForm.reason
      };

      const res = await api.post('/custody-transfers/transfers', payload);
      if (res && res.success) {
        showToast('success', `Transfer ${res.transfer?.transferNumber || ''} created successfully!`);
        setShowTransferModal(false);
        setTransferForm(initialTransferForm);
        loadWorkbenchData();
        loadMasterDataOptions();
      } else {
        alert(res?.message || 'Failed to initiate transfer');
      }
    } catch (err) {
      console.error('Transfer error:', err);
      alert(err?.message || 'Failed to initiate transfer');
    } finally {
      setActionLoading(false);
    }
  };

  // FILTERING LOGIC
  const filteredAssignments = assignments.filter(a => {
    const assetObj = a.asset || a.assetId || {};
    const custodianObj = a.custodian || a.custodianId || {};
    const searchLower = custodySearch.toLowerCase().trim();

    const matchesSearch = !searchLower || (
      (assetObj.assetId && assetObj.assetId.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower)) ||
      (assetObj.serialNumber && assetObj.serialNumber.toLowerCase().includes(searchLower)) ||
      (custodianObj.fullName && custodianObj.fullName.toLowerCase().includes(searchLower)) ||
      (custodianObj.name && custodianObj.name.toLowerCase().includes(searchLower))
    );

    const isCurrentlyActive = a.active !== false;
    const matchesStatus = custodyStatusFilter === 'ALL' ||
      (custodyStatusFilter === 'ACTIVE' && isCurrentlyActive) ||
      (custodyStatusFilter === 'RETURNED' && !isCurrentlyActive);

    return matchesSearch && matchesStatus;
  });

  const filteredTransfers = transfers.filter(t => {
    const assetObj = t.asset || t.assetId || {};
    const searchLower = transferSearch.toLowerCase().trim();

    const matchesSearch = !searchLower || (
      (t.transferNumber && t.transferNumber.toLowerCase().includes(searchLower)) ||
      (assetObj.assetId && assetObj.assetId.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower)) ||
      (assetObj.serialNumber && assetObj.serialNumber.toLowerCase().includes(searchLower))
    );

    const matchesType = transferTypeFilter === 'ALL' || t.transferType === transferTypeFilter;
    const matchesStatus = transferStatusFilter === 'ALL' || t.status === transferStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
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

      {/* Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Custody & Movement Workbench</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              Custody • Transfers • Location Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track employee asset custody allocations, loan return dates, and inter/intra site location movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAssignModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4" /> Assign Asset Custody
          </button>

          <button 
            onClick={() => setShowTransferModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" /> Move / Transfer Asset
          </button>

          <button 
            onClick={loadWorkbenchData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Telemetry KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Employee Custodies</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeAssignments || assignments.filter(a => a.active !== false).length}</p>
          <span className="text-[11px] text-purple-700 font-semibold">Assigned Employee Assets</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Overdue Loan Returns</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.overdueAssignments || 0}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Requires Return Verification</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Location Transfers Logged</span>
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalTransfers || transfers.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Inter/Intra Site Movements</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Inventory Staged Pool</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {assetsList.filter(a => a.lifecycleStatus === 'IN_STORE' || a.lifecycleStatus === 'RECEIVED').length}
          </p>
          <span className="text-[11px] text-slate-400">Available for Custody</span>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center border-b border-slate-200 gap-6 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setActiveTab('CUSTODY')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'CUSTODY'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 1. Employee Custody Management
          <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-mono font-bold ml-1">
            {assignments.filter(a => a.active !== false).length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSFER')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'TRANSFER'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" /> 2. Physical Location Movements & Transfers
          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold ml-1">
            {transfers.length} Logs
          </span>
        </button>
      </div>

      {/* TAB 1: CUSTODY MANAGEMENT */}
      {activeTab === 'CUSTODY' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Asset ID, Serial #, Custodian..."
                value={custodySearch}
                onChange={(e) => setCustodySearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Status:</span>
              </div>
              <select
                value={custodyStatusFilter}
                onChange={(e) => setCustodyStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Custody Records</option>
                <option value="ACTIVE">Active Custody Only</option>
                <option value="RETURNED">Returned / Inactive Only</option>
              </select>

              {(custodySearch || custodyStatusFilter !== 'ALL') && (
                <button
                  onClick={() => { setCustodySearch(''); setCustodyStatusFilter('ALL'); }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Custody List Table / Cards */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" /> Employee Custody Matrix
              </h3>
              <span className="text-xs text-slate-500 font-medium">Showing {filteredAssignments.length} records</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /> Loading employee custody records...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No custody records matching filters.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs text-purple-600 hover:underline inline-block font-bold"
                >
                  + Assign New Asset Custody
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssignments.map(a => {
                  const assetObj = a.asset || a.assetId || {};
                  const custodianObj = a.custodian || a.custodianId || {};
                  const isActive = a.active !== false;

                  return (
                    <div 
                      key={a.id || a._id} 
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                        isActive 
                          ? 'bg-white border-slate-200 hover:border-purple-300 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-purple-700">{assetObj.assetId || 'AST-N/A'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {isActive ? 'ACTIVE CUSTODY' : 'RETURNED'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 mt-1">{assetObj.description || 'Asset Record'}</p>
                          <p className="text-xs text-slate-500 font-medium">Serial: <span className="font-mono text-slate-700 font-semibold">{assetObj.serialNumber || 'N/A'}</span></p>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><User className="w-3 h-3 text-purple-600" /> Custodian:</span>
                          <span className="font-bold text-slate-900">{custodianObj.fullName || custodianObj.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400" /> Department:</span>
                          <span className="text-slate-700 font-semibold">{custodianObj.department?.name || custodianObj.departmentId?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Issue Date:</span>
                          <span className="text-slate-700 font-mono font-semibold">{formatDate(a.issuedDate || a.createdAt)}</span>
                        </div>
                        {a.expectedReturnDate && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500" /> Expected Return:</span>
                            <span className="text-amber-600 font-mono font-bold">{formatDate(a.expectedReturnDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">Issued by: {a.issuedBy?.fullName || 'System Administrator'}</span>
                        {isActive && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenReassignModal(assetObj.id || assetObj._id || assetObj.assetId)}
                              className="text-[11px] text-purple-700 hover:underline font-bold"
                            >
                              Reassign
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleReturnCustody(a.id || a._id)}
                              className="text-[11px] text-rose-600 hover:underline font-bold flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Return Custody
                            </button>
                          </div>
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

      {/* TAB 2: LOCATION MOVEMENTS & TRANSFERS */}
      {activeTab === 'TRANSFER' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Transfer #, Asset ID, Serial..."
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Type:</span>
              </div>
              <select
                value={transferTypeFilter}
                onChange={(e) => setTransferTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Types</option>
                <option value="INTRA_SITE">INTRA_SITE (Room to Room)</option>
                <option value="INTER_SITE">INTER_SITE (Site to Site)</option>
                <option value="INTER_COMPANY">INTER_COMPANY (Legal Entity)</option>
                <option value="INTER_DEPARTMENT">INTER_DEPARTMENT (Dept Transfer)</option>
              </select>

              <span className="text-xs text-slate-500 font-semibold">Status:</span>
              <select
                value={transferStatusFilter}
                onChange={(e) => setTransferStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">APPROVED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="DRAFT">DRAFT</option>
              </select>

              {(transferSearch || transferTypeFilter !== 'ALL' || transferStatusFilter !== 'ALL') && (
                <button
                  onClick={() => { setTransferSearch(''); setTransferTypeFilter('ALL'); setTransferStatusFilter('ALL'); }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Transfers History Table / Cards */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" /> Recent Physical Location Transfers
              </h3>
              <span className="text-xs text-slate-500 font-medium">Showing {filteredTransfers.length} logs</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> Loading physical transfer logs...
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <ArrowLeftRight className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No transfer logs matching filters.</p>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="text-xs text-emerald-600 hover:underline inline-block font-bold"
                >
                  + Move / Transfer An Asset
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransfers.map(t => {
                  const assetObj = t.asset || t.assetId || {};
                  const fromSiteName = t.fromSiteId?.name || 'Current Site';
                  const fromRoomName = t.fromRoomId?.name || 'Default Room';
                  const toSiteName = t.toSiteId?.name || fromSiteName;
                  const toRoomName = t.toRoomId?.name || 'Destination Room';

                  return (
                    <div 
                      key={t.id || t._id} 
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all shadow-xs"
                    >
                      {/* Left: Transfer Identifier & Asset info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700 text-sm">{t.transferNumber}</span>
                          {(() => {
                            const customMatch = t.reason && t.reason.match(/\[Custom Type:\s*([^\]]+)\]/i);
                            const tagLabel = customMatch ? customMatch[1] : t.transferType;
                            return (
                              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 uppercase">
                                {tagLabel}
                              </span>
                            );
                          })()}
                          <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
                            {t.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{assetObj.description || 'Asset Description'}</p>
                        <p className="text-slate-500 font-medium">Asset ID: <span className="font-mono text-slate-800 font-bold">{assetObj.assetId}</span> | Serial: <span className="font-mono text-slate-800 font-bold">{assetObj.serialNumber || 'N/A'}</span></p>
                      </div>

                      {/* Middle: Spatial Location Route (From -> To) */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 min-w-[320px]">
                        <div className="flex-1 text-right">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">From Location</span>
                          <span className="font-bold text-slate-900 block text-xs">{fromSiteName}</span>
                          <span className="text-[11px] text-slate-500 font-medium block">{fromRoomName}</span>
                        </div>
                        
                        <div className="p-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex-shrink-0">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 text-left">
                          <span className="text-[10px] uppercase text-emerald-700 font-bold block">To Location</span>
                          <span className="font-bold text-emerald-800 block text-xs">{toSiteName}</span>
                          <span className="text-[11px] text-emerald-600 font-medium block">{toRoomName}</span>
                        </div>
                      </div>

                      {/* Right: Date, Initiator & Actions */}
                      <div className="flex items-center gap-3">
                        <div className="text-right space-y-1 min-w-[130px]">
                          <span className="text-slate-500 block font-mono text-[11px] font-semibold">{formatDate(t.createdAt)}</span>
                          <span className="text-[11px] text-slate-500 font-medium block">By: {t.requestedBy?.fullName || 'System Administrator'}</span>
                          {t.reason && <p className="text-[10px] text-slate-500 italic truncate max-w-[180px]">"{t.reason}"</p>}
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                          <button
                            onClick={() => handleOpenEditTransfer(t)}
                            title="Edit Transfer Type & Details"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTransferId(t.id || t._id)}
                            title="Delete Transfer Log"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN CUSTODY (Enhanced Enterprise Spec) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white border border-slate-200 w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" /> Assign Asset Custody & Loan Policy
                </h2>
                <p className="text-xs text-slate-500">
                  Assign asset employee custody, establish loan policy terms, and record condition baseline.
                </p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAssignCustodySubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Target Asset <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={custodyForm.assetId}
                    onChange={(e) => setCustodyForm({ ...custodyForm, assetId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose an Asset --</option>
                    {assetsList.map(a => {
                      const idVal = a.id || a._id || a.assetId;
                      return (
                        <option key={idVal} value={idVal}>
                          {a.assetId} — {a.description} ({a.serialNumber || 'No Serial'})
                        </option>
                      );
                    })}
                  </select>

                  {selectedCustodyAsset && (
                    <div className="mt-2.5 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                      <p className="text-purple-700 font-bold">{selectedCustodyAsset.description}</p>
                      <p className="text-slate-600 font-medium">Current Custodian: <span className="text-slate-900 font-bold">{selectedCustodyAsset.custodian?.fullName || selectedCustodyAsset.custodianId?.fullName || 'Unassigned / In Store'}</span></p>
                      <p className="text-slate-600 font-medium">Lifecycle Status: <span className="text-emerald-700 font-mono font-bold">{selectedCustodyAsset.lifecycleStatus}</span></p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Employee Custodian <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={custodyForm.custodianId}
                    onChange={(e) => setCustodyForm({ ...custodyForm, custodianId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employeesList.map(emp => {
                      const idVal = emp.id || emp._id;
                      return (
                        <option key={idVal} value={idVal}>
                          {emp.fullName || emp.name} ({emp.department?.name || emp.departmentId?.name || 'General Dept'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Custody Allocation Type <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={custodyForm.custodyType}
                      onChange={(e) => setCustodyForm({ ...custodyForm, custodyType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="PERMANENT_ASSIGNMENT">Permanent Assignment (Standard Workstation)</option>
                      <option value="TEMPORARY_LOAN">Temporary Loan (Travel / Testing)</option>
                      <option value="PROJECT_DEPLOYMENT">Project Field Deployment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Physical Condition at Issue
                    </label>
                    <select
                      value={custodyForm.conditionAtIssue}
                      onChange={(e) => setCustodyForm({ ...custodyForm, conditionAtIssue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      <option value="NEW">NEW (Brand New Sealed)</option>
                      <option value="EXCELLENT">EXCELLENT (Inspected & Passed QA)</option>
                      <option value="GOOD">GOOD (Normal Operational Wear)</option>
                      <option value="FAIR">FAIR (Functional / Minor Cosmetic)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Effective Issue Date <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      value={custodyForm.issuedDate}
                      onChange={(e) => setCustodyForm({ ...custodyForm, issuedDate: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Expected Return Date {custodyForm.custodyType === 'TEMPORARY_LOAN' && <span className="text-red-500 font-bold ml-0.5">*</span>}
                    </label>
                    <input
                      type="date"
                      value={custodyForm.expectedReturnDate}
                      required={custodyForm.custodyType === 'TEMPORARY_LOAN'}
                      onChange={(e) => setCustodyForm({ ...custodyForm, expectedReturnDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Security Gate Pass / Clearance # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. GP-2026-8891"
                    value={custodyForm.gatePassNumber}
                    onChange={(e) => setCustodyForm({ ...custodyForm, gatePassNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Accessories Issued Checklist */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-purple-800 font-bold text-[11px] uppercase tracking-wider">
                    Issued Accessories & Peripheral Package
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'powerAdapter', label: 'Power Adapter / Charger' },
                      { key: 'carryingCase', label: 'Carrying Bag / Sleeve' },
                      { key: 'mouse', label: 'Wireless Mouse' },
                      { key: 'dockingStation', label: 'USB-C Docking Station' },
                      { key: 'cableLock', label: 'Security Cable Lock' }
                    ].map(acc => (
                      <label key={acc.key} className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={Boolean(custodyForm.accessories?.[acc.key])}
                          onChange={(e) => setCustodyForm({
                            ...custodyForm,
                            accessories: {
                              ...custodyForm.accessories,
                              [acc.key]: e.target.checked
                            }
                          })}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[11px] text-slate-700 font-medium select-none">{acc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assignment Remarks / Notes</label>
                  <textarea
                    rows="2"
                    placeholder="E.g. Issued for remote travel project, verified serial number match..."
                    value={custodyForm.notes}
                    onChange={(e) => setCustodyForm({ ...custodyForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>

                {/* Custody Policy Checkbox */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-900">
                  <input
                    type="checkbox"
                    id="ackCheck"
                    checked={custodyForm.acknowledged}
                    onChange={(e) => setCustodyForm({ ...custodyForm, acknowledged: e.target.checked })}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="ackCheck" className="font-semibold cursor-pointer">
                    Employee Custody Policy Acknowledged: Employee accepts financial & security custody for asset care, safety, and mandatory loan return policy.
                  </label>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
                <div className="text-xs text-slate-500">
                  Fields marked with <span className="text-red-500 font-bold text-sm">*</span> are required for custody.
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Confirm Custody Assignment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MOVE / TRANSFER ASSET */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white border border-slate-200 w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600" /> Physical Location Transfer / Movement
              </h2>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleTransferSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Asset to Move <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={transferForm.assetId}
                    onChange={(e) => setTransferForm({ ...transferForm, assetId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose an Asset --</option>
                    {assetsList.map(a => {
                      const idVal = a.id || a._id || a.assetId;
                      return (
                        <option key={idVal} value={idVal}>
                          {a.assetId} — {a.description} ({a.site?.name || a.siteId?.name || 'No Site'})
                        </option>
                      );
                    })}
                  </select>

                  {selectedTransferAsset && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-slate-700 font-medium">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Current Site</span>
                        <span className="font-semibold text-slate-900">{selectedTransferAsset.site?.name || selectedTransferAsset.siteId?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Current Room</span>
                        <span className="font-semibold text-slate-900">{selectedTransferAsset.room?.name || selectedTransferAsset.roomId?.name || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transfer Type */}
                {/* Transfer Type Selection & Custom Manual Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">
                      Transfer Type <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTransferForm(prev => ({ 
                        ...prev, 
                        isCustomType: !prev.isCustomType,
                        transferType: !prev.isCustomType ? 'CUSTOM' : 'INTRA_SITE'
                      }))}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                    >
                      {transferForm.isCustomType ? '← Choose Standard Presets' : '+ Add Custom Transfer Type'}
                    </button>
                  </div>

                  {!transferForm.isCustomType && transferForm.transferType !== 'CUSTOM' ? (
                    <select
                      value={transferForm.transferType}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setTransferForm({ ...transferForm, transferType: 'CUSTOM', isCustomType: true });
                        } else {
                          setTransferForm({ ...transferForm, transferType: e.target.value, isCustomType: false });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold text-purple-700"
                    >
                      <option value="INTRA_SITE">INTRA_SITE (Room 201 → Room 305 within same site)</option>
                      <option value="INTER_SITE">INTER_SITE (Bhubaneswar HQ → Bangalore Office)</option>
                      <option value="INTER_COMPANY">INTER_COMPANY (Parent Company → Subsidiary Entity)</option>
                      <option value="INTER_DEPARTMENT">INTER_DEPARTMENT (IT Dept → Finance Dept)</option>
                      <option value="CUSTOM">➕ OTHER / CUSTOM TRANSFER TYPE...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Type custom transfer classification (e.g. VENDOR_REPAIR, EXHIBITION_LOAN, WAREHOUSE_STAGING)..."
                        value={transferForm.customTransferType}
                        onChange={(e) => setTransferForm({ ...transferForm, customTransferType: e.target.value, transferType: 'CUSTOM' })}
                        required
                        className="w-full bg-purple-50 border border-purple-300 rounded-xl p-2.5 text-xs text-purple-900 font-bold focus:outline-none focus:border-purple-600"
                      />
                      <p className="text-[10px] text-slate-500 italic">Custom transfer type will be logged in audit trail and asset movement history.</p>
                    </div>
                  )}
                </div>

                {/* Target Destination Fields */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-purple-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Target Destination Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Destination Site</label>
                      <select
                        value={transferForm.toSiteId}
                        onChange={(e) => setTransferForm({ ...transferForm, toSiteId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Keep Current Site --</option>
                        {sitesList.map(s => {
                          const idVal = s.id || s._id;
                          return <option key={idVal} value={idVal}>{s.name}</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Destination Room</label>
                      <select
                        value={transferForm.toRoomId}
                        onChange={(e) => setTransferForm({ ...transferForm, toRoomId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Select Room --</option>
                        {roomsList.map(r => {
                          const idVal = r.id || r._id;
                          return <option key={idVal} value={idVal}>{r.name}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  {transferForm.transferType === 'INTER_COMPANY' && (
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Destination Legal Company Entity</label>
                      <select
                        value={transferForm.toCompanyId}
                        onChange={(e) => setTransferForm({ ...transferForm, toCompanyId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Choose Target Company Entity --</option>
                        {companiesList.map(c => {
                          const idVal = c.id || c._id;
                          return <option key={idVal} value={idVal}>{c.name}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Transfer Reason */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transfer Purpose / Reason</label>
                  <textarea
                    rows="2"
                    placeholder="E.g. Department relocation, project site deployment..."
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
                <div className="text-xs text-slate-500">
                  Fields marked with <span className="text-red-500 font-bold text-sm">*</span> are required for transfer.
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                    Submit Asset Movement
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TRANSFER & TRANSFER TYPE */}
      {editingTransfer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-purple-600" /> Edit Transfer Type & Details
                </h2>
                <p className="text-xs text-slate-500">
                  Update transfer classification type, destination parameters, or movement notes for <span className="font-mono font-bold text-purple-700">{editingTransfer.transferNumber}</span>.
                </p>
              </div>
              <button 
                onClick={() => setEditingTransfer(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdateTransferSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                
                {/* Asset info summary banner */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <p className="text-purple-800 font-bold">{editingTransfer.asset?.description || 'Asset Details'}</p>
                  <p className="text-slate-600 font-medium">Asset ID: <span className="font-mono font-bold text-slate-900">{editingTransfer.asset?.assetId}</span></p>
                </div>

                {/* Transfer Type Selection & Custom Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">
                      Transfer Type <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditTransferForm(prev => ({ 
                        ...prev, 
                        isCustomType: !prev.isCustomType,
                        transferType: !prev.isCustomType ? 'CUSTOM' : 'INTRA_SITE'
                      }))}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                    >
                      {editTransferForm.isCustomType ? '← Choose Standard Presets' : '+ Add Custom Transfer Type'}
                    </button>
                  </div>

                  {!editTransferForm.isCustomType && editTransferForm.transferType !== 'CUSTOM' ? (
                    <select
                      value={editTransferForm.transferType}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setEditTransferForm({ ...editTransferForm, transferType: 'CUSTOM', isCustomType: true });
                        } else {
                          setEditTransferForm({ ...editTransferForm, transferType: e.target.value, isCustomType: false });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold text-purple-700"
                    >
                      <option value="INTRA_SITE">INTRA_SITE (Room 201 → Room 305 within same site)</option>
                      <option value="INTER_SITE">INTER_SITE (Bhubaneswar HQ → Bangalore Office)</option>
                      <option value="INTER_COMPANY">INTER_COMPANY (Parent Company → Subsidiary Entity)</option>
                      <option value="INTER_DEPARTMENT">INTER_DEPARTMENT (IT Dept → Finance Dept)</option>
                      <option value="CUSTOM">➕ OTHER / CUSTOM TRANSFER TYPE...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Type custom transfer classification (e.g. VENDOR_REPAIR, EXHIBITION_LOAN, WAREHOUSE_STAGING)..."
                        value={editTransferForm.customTransferType}
                        onChange={(e) => setEditTransferForm({ ...editTransferForm, customTransferType: e.target.value, transferType: 'CUSTOM' })}
                        required
                        className="w-full bg-purple-50 border border-purple-300 rounded-xl p-2.5 text-xs text-purple-900 font-bold focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  )}
                </div>

                {/* Target Destination Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Destination Site</label>
                    <select
                      value={editTransferForm.toSiteId}
                      onChange={(e) => setEditTransferForm({ ...editTransferForm, toSiteId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Keep Destination Site --</option>
                      {sitesList.map(s => {
                        const idVal = s.id || s._id;
                        return <option key={idVal} value={idVal}>{s.name}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Destination Room</label>
                    <select
                      value={editTransferForm.toRoomId}
                      onChange={(e) => setEditTransferForm({ ...editTransferForm, toRoomId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Keep Destination Room --</option>
                      {roomsList.map(r => {
                        const idVal = r.id || r._id;
                        return <option key={idVal} value={idVal}>{r.name}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Transfer Reason */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transfer Purpose / Reason</label>
                  <textarea
                    rows="2"
                    placeholder="Update transfer rationale or notes..."
                    value={editTransferForm.reason}
                    onChange={(e) => setEditTransferForm({ ...editTransferForm, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTransfer(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                  Save Transfer Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteTransferId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Transfer Log</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this asset transfer log from the register?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTransferId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransfer(deleteTransferId)}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
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

export default CustodyTransferWorkbench;
