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
  ShieldCheck
} from 'lucide-react';

export function CustodyTransferWorkbench() {
  const [activeTab, setActiveTab] = useState('CUSTODY'); // 'CUSTODY' | 'TRANSFER'
  
  // Primary Data
  const [assignments, setAssignments] = useState([]);
  const [transfers, setTransfers] = useState([]);
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
  const [custodyStatusFilter, setCustodyStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RETURNED'

  const [transferSearch, setTransferSearch] = useState('');
  const [transferTypeFilter, setTransferTypeFilter] = useState('ALL'); // 'ALL' | 'INTRA_SITE' | 'INTER_SITE' | 'INTER_COMPANY' | 'INTER_DEPARTMENT'
  const [transferStatusFilter, setTransferStatusFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'DRAFT'

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Custody Form State
  const [custodyForm, setCustodyForm] = useState({
    assetId: '',
    custodianId: '',
    expectedReturnDate: '',
    notes: ''
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    assetId: '',
    transferType: 'INTRA_SITE',
    toCompanyId: '',
    toSiteId: '',
    toRoomId: '',
    toCustodianId: '',
    reason: ''
  });

  // Selected Asset Details for Form Pre-filling
  const selectedCustodyAsset = assetsList.find(a => a._id === custodyForm.assetId);
  const selectedTransferAsset = assetsList.find(a => a._id === transferForm.assetId);

  // Load Main Workbench Data
  const loadWorkbenchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trRes, csRes] = await Promise.all([
        api.get('/custody-transfers/transfers'),
        api.get('/custody-transfers/custody')
      ]);
      if (trRes.success) setTransfers(trRes.transfers || []);
      if (csRes.success) setAssignments(csRes.assignments || []);
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
      const [assetsRes, empRes, sitesRes, roomsRes, compRes] = await Promise.all([
        api.get('/assets?limit=200'),
        api.get('/master-data/employees'),
        api.get('/master-data/sites'),
        api.get('/master-data/rooms'),
        api.get('/master-data/companies')
      ]);

      if (assetsRes.success) setAssetsList(assetsRes.assets || []);
      if (empRes.success) setEmployeesList(empRes.employees || []);
      if (sitesRes.success) setSitesList(sitesRes.sites || []);
      if (roomsRes.success) setRoomsList(roomsRes.rooms || []);
      if (compRes.success) setCompaniesList(compRes.companies || []);
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

  // -------------------------------------------------------------
  // HANDLERS: CUSTODY
  // -------------------------------------------------------------
  const handleAssignCustodySubmit = async (e) => {
    e.preventDefault();
    if (!custodyForm.assetId || !custodyForm.custodianId) {
      alert('Please select both an asset and an employee custodian.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/custody-transfers/custody', custodyForm);
      if (res.success) {
        showToast('success', 'Asset custody assigned successfully!');
        setShowAssignModal(false);
        setCustodyForm({ assetId: '', custodianId: '', expectedReturnDate: '', notes: '' });
        loadWorkbenchData();
        loadMasterDataOptions(); // Refresh asset custodian status
      }
    } catch (err) {
      alert(err.message || 'Failed to assign custody');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnCustody = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to return this asset to inventory custody?')) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/custody-transfers/custody/${assignmentId}/return`, {
        notes: 'Returned via Custody Workbench'
      });
      if (res.success) {
        showToast('success', 'Asset returned to inventory (IN_STORE)');
        loadWorkbenchData();
        loadMasterDataOptions();
      }
    } catch (err) {
      alert(err.message || 'Failed to return custody');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReassignModal = (assetId) => {
    setCustodyForm(prev => ({ ...prev, assetId }));
    setShowAssignModal(true);
  };

  // -------------------------------------------------------------
  // HANDLERS: MOVEMENT / TRANSFER
  // -------------------------------------------------------------
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
        transferType: transferForm.transferType,
        fromSiteId: selectedTransferAsset?.siteId?._id || selectedTransferAsset?.siteId,
        fromRoomId: selectedTransferAsset?.roomId?._id || selectedTransferAsset?.roomId,
        fromCustodianId: selectedTransferAsset?.custodianId?._id || selectedTransferAsset?.custodianId,
        fromCompanyId: selectedTransferAsset?.companyId?._id || selectedTransferAsset?.companyId,
        toSiteId: transferForm.toSiteId || undefined,
        toRoomId: transferForm.toRoomId || undefined,
        toCompanyId: transferForm.toCompanyId || undefined,
        toCustodianId: transferForm.toCustodianId || undefined,
        reason: transferForm.reason
      };

      const res = await api.post('/custody-transfers/transfers', payload);
      if (res.success) {
        showToast('success', `Transfer ${res.transfer?.transferNumber || ''} created successfully!`);
        setShowTransferModal(false);
        setTransferForm({
          assetId: '',
          transferType: 'INTRA_SITE',
          toCompanyId: '',
          toSiteId: '',
          toRoomId: '',
          toCustodianId: '',
          reason: ''
        });
        loadWorkbenchData();
        loadMasterDataOptions();
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate transfer');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredAssignments = assignments.filter(a => {
    const assetObj = a.assetId || {};
    const custodianObj = a.custodianId || {};
    const searchLower = custodySearch.toLowerCase().trim();

    const matchesSearch = !searchLower || (
      (assetObj.assetId && assetObj.assetId.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower)) ||
      (assetObj.serialNumber && assetObj.serialNumber.toLowerCase().includes(searchLower)) ||
      (custodianObj.fullName && custodianObj.fullName.toLowerCase().includes(searchLower))
    );

    const isCurrentlyActive = a.active !== false;
    const matchesStatus = custodyStatusFilter === 'ALL' ||
      (custodyStatusFilter === 'ACTIVE' && isCurrentlyActive) ||
      (custodyStatusFilter === 'RETURNED' && !isCurrentlyActive);

    return matchesSearch && matchesStatus;
  });

  const filteredTransfers = transfers.filter(t => {
    const assetObj = t.assetId || {};
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

  // Safe Format Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-500" /> Custody & Movement Workbench
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track employee asset custody allocations and physical inter/intra site location movements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAssignModal(true)}
            className="btn-primary text-xs flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4" /> Assign Asset Custody
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="btn-secondary text-xs flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-semibold transition-all shadow-xs"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" /> Move / Transfer Asset
          </button>
          <button 
            onClick={loadWorkbenchData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('CUSTODY')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'CUSTODY'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 1. Employee Custody Management
          <span className="text-[10px] bg-purple-50 text-brand-500 px-2 py-0.5 rounded-full border border-purple-200 font-mono font-bold">
            {assignments.filter(a => a.active !== false).length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSFER')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'TRANSFER'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" /> 2. Physical Location Movements & Transfers
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">
            {transfers.length} Logs
          </span>
        </button>
      </div>

      {/* TAB 1: CUSTODY MANAGEMENT */}
      {activeTab === 'CUSTODY' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Asset ID, Serial #, Custodian..."
                value={custodySearch}
                onChange={(e) => setCustodySearch(e.target.value)}
                className="input-field pl-10"
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
                className="input-field py-1.5 text-xs font-semibold"
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
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-500" /> Employee Custody Matrix
              </h3>
              <span className="text-xs text-slate-500 font-medium">Showing {filteredAssignments.length} records</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-500" /> Loading employee custody records...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No custody records matching filters.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs text-brand-500 hover:underline inline-block font-bold"
                >
                  + Assign New Asset Custody
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAssignments.map(a => {
                  const assetObj = a.assetId || {};
                  const custodianObj = a.custodianId || {};
                  const isActive = a.active !== false;

                  return (
                    <div 
                      key={a._id} 
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
                            <span className="font-mono font-bold text-xs text-[#6c2bd9]">{assetObj.assetId || 'AST-N/A'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {isActive ? 'ACTIVE CUSTODY' : 'RETURNED'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 mt-1">{assetObj.description || 'Asset'}</p>
                          <p className="text-xs text-slate-500 font-medium">Serial: <span className="font-mono text-slate-700 font-semibold">{assetObj.serialNumber || 'N/A'}</span></p>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><User className="w-3 h-3 text-brand-500" /> Custodian:</span>
                          <span className="font-bold text-slate-900">{custodianObj.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400" /> Department:</span>
                          <span className="text-slate-700 font-semibold">{custodianObj.departmentId?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Issue Date:</span>
                          <span className="text-slate-700 font-mono font-semibold">{formatDate(a.issuedDate)}</span>
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
                        <span className="text-[10px] text-slate-400 font-medium">Issued by: {a.issuedBy?.fullName || 'System Admin'}</span>
                        {isActive && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenReassignModal(assetObj._id)}
                              className="text-[11px] text-brand-500 hover:underline font-bold"
                            >
                              Reassign
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleReturnCustody(a._id)}
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
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Transfer #, Asset ID, Serial..."
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                className="input-field pl-10"
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
                className="input-field py-1.5 text-xs font-semibold"
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
                className="input-field py-1.5 text-xs font-semibold"
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
          <div className="glass-panel p-5 space-y-3">
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
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
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
                  const assetObj = t.assetId || {};
                  const fromSiteName = t.fromSiteId?.name || 'Current Site';
                  const fromRoomName = t.fromRoomId?.name || 'Default Room';
                  const toSiteName = t.toSiteId?.name || fromSiteName;
                  const toRoomName = t.toRoomId?.name || 'Destination Room';

                  return (
                    <div 
                      key={t._id} 
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all shadow-xs"
                    >
                      {/* Left: Transfer Identifier & Asset info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#6c2bd9] text-sm">{t.transferNumber}</span>
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                            {t.transferType}
                          </span>
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
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
                        
                        <div className="p-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 text-left">
                          <span className="text-[10px] uppercase text-emerald-700 font-bold block">To Location</span>
                          <span className="font-bold text-emerald-800 block text-xs">{toSiteName}</span>
                          <span className="text-[11px] text-emerald-600 font-medium block">{toRoomName}</span>
                        </div>
                      </div>

                      {/* Right: Date & Initiator */}
                      <div className="text-right space-y-1 min-w-[140px]">
                        <span className="text-slate-500 block font-mono text-[11px] font-semibold">{formatDate(t.createdAt)}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">By: {t.requestedBy?.fullName || 'Admin'}</span>
                        {t.reason && <p className="text-[10px] text-slate-500 italic truncate max-w-[180px]">"{t.reason}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN CUSTODY */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-500" /> Assign Asset Custody
              </h2>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignCustodySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Target Asset *</label>
                <select
                  value={custodyForm.assetId}
                  onChange={(e) => setCustodyForm({ ...custodyForm, assetId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">-- Choose an Asset --</option>
                  {assetsList.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} — {a.description} ({a.serialNumber || 'No Serial'})
                    </option>
                  ))}
                </select>

                {selectedCustodyAsset && (
                  <div className="mt-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <p className="text-brand-500 font-bold">{selectedCustodyAsset.description}</p>
                    <p className="text-slate-600 font-medium">Current Custodian: <span className="text-slate-900 font-bold">{selectedCustodyAsset.custodianId?.fullName || 'Unassigned / In Inventory'}</span></p>
                    <p className="text-slate-600 font-medium">Status: <span className="text-emerald-700 font-mono font-bold">{selectedCustodyAsset.lifecycleStatus}</span></p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Employee Custodian *</label>
                <select
                  value={custodyForm.custodianId}
                  onChange={(e) => setCustodyForm({ ...custodyForm, custodianId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">-- Choose Employee --</option>
                  {employeesList.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.departmentId?.name || 'Department N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Expected Return Date (Optional for temporary loan)</label>
                <input
                  type="date"
                  value={custodyForm.expectedReturnDate}
                  onChange={(e) => setCustodyForm({ ...custodyForm, expectedReturnDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assignment Remarks / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Reason or condition at issue..."
                  value={custodyForm.notes}
                  onChange={(e) => setCustodyForm({ ...custodyForm, notes: e.target.value })}
                  className="input-field"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  Confirm Custody Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MOVE / TRANSFER ASSET */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600" /> Physical Location Transfer / Movement
              </h2>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Asset to Move *</label>
                <select
                  value={transferForm.assetId}
                  onChange={(e) => setTransferForm({ ...transferForm, assetId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">-- Choose an Asset --</option>
                  {assetsList.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} — {a.description} ({a.siteId?.name || 'No Site'})
                    </option>
                  ))}
                </select>

                {selectedTransferAsset && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-slate-700 font-medium">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Current Site</span>
                      <span className="font-semibold text-slate-200">{selectedTransferAsset.siteId?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Current Room</span>
                      <span className="font-semibold text-slate-200">{selectedTransferAsset.roomId?.name || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transfer Type */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transfer Type *</label>
                <select
                  value={transferForm.transferType}
                  onChange={(e) => setTransferForm({ ...transferForm, transferType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500 font-semibold text-purple-700"
                >
                  <option value="INTRA_SITE">INTRA_SITE (Room 201 → Room 305 within same site)</option>
                  <option value="INTER_SITE">INTER_SITE (Bhubaneswar HQ → Bangalore Office)</option>
                  <option value="INTER_COMPANY">INTER_COMPANY (Parent Company → Subsidiary Entity)</option>
                  <option value="INTER_DEPARTMENT">INTER_DEPARTMENT (IT Dept → Finance Dept)</option>
                </select>
              </div>

              {/* Target Destination Fields */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-purple-600">
                  <MapPin className="w-3.5 h-3.5" /> Target Destination Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Destination Site</label>
                    <select
                      value={transferForm.toSiteId}
                      onChange={(e) => setTransferForm({ ...transferForm, toSiteId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                    >
                      <option value="">-- Keep Current Site --</option>
                      {sitesList.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Destination Room</label>
                    <select
                      value={transferForm.toRoomId}
                      onChange={(e) => setTransferForm({ ...transferForm, toRoomId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                    >
                      <option value="">-- Select Room --</option>
                      {roomsList.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {transferForm.transferType === 'INTER_COMPANY' && (
                  <div>
                    <label className="block text-slate-600 mb-1">Destination Legal Company</label>
                    <select
                      value={transferForm.toCompanyId}
                      onChange={(e) => setTransferForm({ ...transferForm, toCompanyId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                    >
                      <option value="">-- Choose Target Company Entity --</option>
                      {companiesList.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                  Submit Asset Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustodyTransferWorkbench;
