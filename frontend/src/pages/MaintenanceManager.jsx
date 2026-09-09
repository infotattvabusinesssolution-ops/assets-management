import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import { 
  Wrench, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  User, 
  Calendar, 
  DollarSign, 
  Layers, 
  CheckSquare, 
  Square, 
  AlertCircle,
  FileText,
  ShieldCheck,
  Building,
  MapPin,
  TrendingUp,
  UserCheck,
  Activity,
  PackageCheck,
  Percent,
  History,
  BarChart3,
  Trash2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export function MaintenanceManager() {
  const [activeTab, setActiveTab] = useState('WORK_ORDERS'); // 'WORK_ORDERS' | 'SCHEDULES' | 'HISTORY'

  // Primary Data State
  const [summary, setSummary] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filters (Work Orders)
  const [woSearch, setWoSearch] = useState('');
  const [woStatusFilter, setWoStatusFilter] = useState('ALL');
  const [woPriorityFilter, setWoPriorityFilter] = useState('ALL');
  const [woTypeFilter, setWoTypeFilter] = useState('ALL');

  // Modals & Drawers
  const [showCreateWoModal, setShowCreateWoModal] = useState(false);
  const [showCreateSchedModal, setShowCreateSchedModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedWo, setSelectedWo] = useState(null);

  // Create Work Order Form State
  const [woForm, setWoForm] = useState({
    assetId: '',
    workType: 'CORRECTIVE',
    priority: 'HIGH',
    description: '',
    assignedTechnicianId: '',
    notes: '',
    scheduledDate: ''
  });

  // Detail Drawer Interactive Form State
  const [drawerForm, setDrawerForm] = useState({
    status: '',
    assignedTechnicianId: '',
    laborHours: 0,
    laborCost: 0,
    partsCost: 0,
    cost: 0,
    failureCode: '',
    rootCause: '',
    notes: '',
    checklist: []
  });

  // Spare Parts in Detail Drawer
  const [partsList, setPartsList] = useState([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUnitCost, setNewPartUnitCost] = useState(0);

  // Asset History Filter State
  const [historySearch, setHistorySearch] = useState('');

  // Create PM Schedule Form State
  const [schedForm, setSchedForm] = useState({
    title: '',
    assetId: '',
    frequencyMonths: 6,
    nextDueDate: ''
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
      const [sumRes, woRes, schRes, assRes, empRes] = await Promise.all([
        api.get('/maintenance/summary'),
        api.get('/maintenance/work-orders'),
        api.get('/maintenance/schedules'),
        api.get('/assets?limit=200'),
        api.get('/master-data/employees')
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (woRes.success) setWorkOrders(woRes.workOrders || []);
      if (schRes.success) setSchedules(schRes.schedules || []);
      if (assRes.success) setAssets(assRes.assets || []);
      if (empRes.success) setEmployees(empRes.employees || []);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkbenchData();
  }, []);

  // -------------------------------------------------------------
  // HANDLERS: WORK ORDER CREATION
  // -------------------------------------------------------------
  const handleCreateWoSubmit = async (e) => {
    e.preventDefault();
    if (!woForm.assetId || !woForm.description) {
      alert('Please select an asset and enter an issue description.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/maintenance/work-orders', woForm);
      if (res.success) {
        showToast('success', `Work Order ${res.workOrder?.workOrderNumber || ''} created! Asset set to UNDER_MAINTENANCE`);
        setShowCreateWoModal(false);
        setWoForm({
          assetId: '',
          workType: 'CORRECTIVE',
          priority: 'HIGH',
          description: '',
          assignedTechnicianId: '',
          notes: '',
          scheduledDate: ''
        });
        loadWorkbenchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create work order');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: WORK ORDER DETAIL DRAWER & SPARE PARTS
  // -------------------------------------------------------------
  const openWoDetail = (wo) => {
    setSelectedWo(wo);
    setPartsList(wo.partsUsed || []);
    setDrawerForm({
      status: wo.status || 'OPEN',
      assignedTechnicianId: wo.assignedTechnicianId?._id || wo.assignedTechnicianId || '',
      laborHours: wo.laborHours || 0,
      laborCost: wo.laborCost || ((wo.laborHours || 0) * 45),
      partsCost: wo.partsCost || 0,
      cost: wo.cost ? parseFloat(wo.cost.toString()) : 0,
      failureCode: wo.failureCode || '',
      rootCause: wo.rootCause || '',
      notes: wo.notes || '',
      checklist: wo.checklist?.length > 0 ? wo.checklist : [
        { task: 'Inspect physical asset condition & safety labels', completed: false },
        { task: 'Diagnose component error code / failure symptoms', completed: false },
        { task: 'Perform repair & replacement of defective spare parts', completed: false },
        { task: 'Test functionality, run calibration & verify output', completed: false }
      ]
    });
    setShowDetailDrawer(true);
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const qty = Math.max(1, parseInt(newPartQty) || 1);
    const unitCost = Math.max(0, parseFloat(newPartUnitCost) || 0);
    const totalCost = qty * unitCost;

    const updatedParts = [...partsList, { partName: newPartName.trim(), quantity: qty, unitCost, totalCost }];
    setPartsList(updatedParts);

    const newPartsCost = updatedParts.reduce((acc, p) => acc + p.totalCost, 0);
    const updatedTotalCost = (drawerForm.laborHours * 45) + newPartsCost;

    setDrawerForm(prev => ({
      ...prev,
      partsCost: newPartsCost,
      cost: updatedTotalCost
    }));

    setNewPartName('');
    setNewPartQty(1);
    setNewPartUnitCost(0);
  };

  const handleRemovePart = (index) => {
    const updatedParts = partsList.filter((_, i) => i !== index);
    setPartsList(updatedParts);
    const newPartsCost = updatedParts.reduce((acc, p) => acc + p.totalCost, 0);
    const updatedTotalCost = (drawerForm.laborHours * 45) + newPartsCost;

    setDrawerForm(prev => ({
      ...prev,
      partsCost: newPartsCost,
      cost: updatedTotalCost
    }));
  };

  const handleUpdateWoSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedWo) return;

    setActionLoading(true);
    try {
      const payload = {
        ...drawerForm,
        partsUsed: partsList
      };

      const res = await api.put(`/maintenance/work-orders/${selectedWo._id}`, payload);
      if (res.success) {
        showToast('success', `Work Order ${res.workOrder?.workOrderNumber} updated successfully!`);
        setShowDetailDrawer(false);
        loadWorkbenchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update work order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheckitem = (index) => {
    const updatedChecklist = [...drawerForm.checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setDrawerForm({ ...drawerForm, checklist: updatedChecklist });
  };

  // -------------------------------------------------------------
  // HANDLERS: PREVENTIVE MAINTENANCE SCHEDULES
  // -------------------------------------------------------------
  const handleCreateSchedSubmit = async (e) => {
    e.preventDefault();
    if (!schedForm.title || !schedForm.assetId || !schedForm.nextDueDate) {
      alert('Please fill out all required schedule fields.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/maintenance/schedules', schedForm);
      if (res.success) {
        showToast('success', 'Preventive Maintenance schedule created!');
        setShowCreateSchedModal(false);
        setSchedForm({ title: '', assetId: '', frequencyMonths: 6, nextDueDate: '' });
        loadWorkbenchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create PM schedule');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredWorkOrders = workOrders.filter(w => {
    const assetObj = typeof w.assetId === 'object' && w.assetId !== null ? w.assetId : {};
    const assetIdStr = typeof w.assetId === 'string' ? w.assetId : (assetObj.assetId || '');
    const techObj = typeof w.assignedTechnicianId === 'object' && w.assignedTechnicianId !== null ? w.assignedTechnicianId : {};
    const searchLower = woSearch.toLowerCase().trim();

    const matchesSearch = !searchLower || (
      (w.workOrderNumber && w.workOrderNumber.toLowerCase().includes(searchLower)) ||
      (assetIdStr && assetIdStr.toLowerCase().includes(searchLower)) ||
      (assetObj.description && assetObj.description.toLowerCase().includes(searchLower)) ||
      (assetObj.serialNumber && assetObj.serialNumber.toLowerCase().includes(searchLower)) ||
      (techObj.fullName && techObj.fullName.toLowerCase().includes(searchLower)) ||
      (w.description && w.description.toLowerCase().includes(searchLower))
    );

    const matchesStatus = woStatusFilter === 'ALL' || w.status === woStatusFilter;
    const matchesPriority = woPriorityFilter === 'ALL' || w.priority === woPriorityFilter;
    const matchesType = woTypeFilter === 'ALL' || w.workType === woTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const now = new Date();
  const overdueSchedules = schedules.filter(s => s.active && s.nextDueDate && new Date(s.nextDueDate) < now);

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
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-600" /> Maintenance & Work Order Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track breakdown repairs, technician assignments, preventive maintenance schedules, and asset downtime
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateWoModal(true)}
            className="btn-primary text-xs flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
          <button 
            onClick={loadWorkbenchData}
            title="Refresh Data"
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE CMMS DASHBOARD METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Work Orders</span>
          <span className="text-lg font-extrabold text-slate-900 block">{summary?.totalWorkOrders || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MTBF Reliability</span>
          <span className="text-lg font-extrabold text-purple-600 block">{summary?.mtbfDays || 45.0} <span className="text-[10px] text-slate-400 font-normal">days</span></span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MTTR Repair Time</span>
          <span className="text-lg font-extrabold text-blue-600 block">{summary?.mttrHours || 4.2} <span className="text-[10px] text-slate-400 font-normal">hrs</span></span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PM Compliance</span>
          <span className="text-lg font-extrabold text-emerald-600 block">{summary?.pmComplianceRate || 95}%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Repair Cost</span>
          <span className="text-base font-extrabold text-emerald-600 block truncate">{formatCurrency(summary?.totalMaintenanceCost)}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Spare Parts Cost</span>
          <span className="text-base font-extrabold text-purple-600 block truncate">{formatCurrency(summary?.totalPartsCost || 0)}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Labor Hours</span>
          <span className="text-lg font-extrabold text-slate-700 block">{summary?.totalLaborHours || 0} <span className="text-[10px] text-slate-400 font-normal">hrs</span></span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Overdue PM</span>
          <span className="text-lg font-extrabold text-rose-600 block">{summary?.overdueSchedulesCount || 0}</span>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center border-b border-slate-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('WORK_ORDERS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'WORK_ORDERS' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" /> 1. Work Orders & Repair Jobs ({workOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULES')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'SCHEDULES' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> 2. Preventive Maintenance Schedules ({schedules.length})
          {overdueSchedules.length > 0 && (
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
              {overdueSchedules.length} Overdue
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'HISTORY' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> 3. Maintenance History & Asset Health Matrix
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORK ORDERS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'WORK_ORDERS' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search WO #, Asset ID, Serial, Tech..."
                value={woSearch}
                onChange={(e) => setWoSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <select
                value={woStatusFilter}
                onChange={(e) => setWoStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>

              <span className="text-xs text-slate-500 font-medium">Priority:</span>
              <select
                value={woPriorityFilter}
                onChange={(e) => setWoPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {(woSearch || woStatusFilter !== 'ALL' || woPriorityFilter !== 'ALL') && (
                <button
                  onClick={() => { setWoSearch(''); setWoStatusFilter('ALL'); setWoPriorityFilter('ALL'); }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Work Orders List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-600" /> Active & Historical Maintenance Work Orders
              </h3>
              <span className="text-xs text-slate-500">Showing {filteredWorkOrders.length} records</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /> Loading work orders...
              </div>
            ) : filteredWorkOrders.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No work orders matching filters.</p>
                <button
                  onClick={() => setShowCreateWoModal(true)}
                  className="text-xs text-purple-600 hover:underline font-medium inline-block"
                >
                  + Create Maintenance Work Order
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkOrders.map(wo => {
                  const assetObj = wo.assetId || {};
                  const techObj = wo.assignedTechnicianId || {};
                  const isCompleted = wo.status === 'COMPLETED' || wo.status === 'VERIFIED';

                  return (
                    <div 
                      key={wo._id} 
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all hover:border-purple-300 hover:bg-slate-100/60"
                    >
                      {/* Left: Identifiers & Asset info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700 text-sm">{wo.workOrderNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            wo.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            wo.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {wo.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            wo.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {wo.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{wo.description}</h4>
                        <p className="text-slate-600">
                          Asset: <span className="font-semibold text-slate-900">{assetObj.description || 'N/A'}</span> ({assetObj.assetId}) | Serial: <span className="font-mono text-slate-700">{assetObj.serialNumber || 'N/A'}</span>
                        </p>
                      </div>

                      {/* Middle: Technician & Cost */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 min-w-[220px] shadow-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1"><User className="w-3 h-3 text-purple-600" /> Technician:</span>
                          <span className="font-semibold text-slate-900">{techObj.fullName || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Labor Hours:</span>
                          <span className="text-slate-800 font-mono">{wo.laborHours || 0} hrs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-600" /> Repair Cost:</span>
                          <span className="text-emerald-700 font-mono font-bold">{formatCurrency(wo.cost)}</span>
                        </div>
                      </div>

                      {/* Right: Date & Action */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">{formatDate(wo.createdAt)}</span>
                        <button
                          onClick={() => openWoDetail(wo)}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-semibold rounded-lg shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-600" /> Manage & Checklist
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
      {/* TAB 2: PREVENTIVE MAINTENANCE SCHEDULES */}
      {/* ========================================================================= */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-4">
          {/* Overdue Warning Alert */}
          {overdueSchedules.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs backdrop-blur-md shadow-xs">
              <div className="flex items-center gap-3 font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Attention Required: {overdueSchedules.length} Preventive Maintenance schedule(s) are past due!</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" /> Recurring Preventive Maintenance Calendar
            </h3>
            <button
              onClick={() => setShowCreateSchedModal(true)}
              className="btn-primary text-xs flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4" /> Create PM Schedule
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            {schedules.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No preventive maintenance schedules set up yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map(s => {
                  const assetObj = s.assetId || {};
                  const isOverdue = s.active && s.nextDueDate && new Date(s.nextDueDate) < now;

                  return (
                    <div 
                      key={s._id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 text-xs transition-all ${
                        isOverdue 
                          ? 'bg-rose-50/50 border-rose-300' 
                          : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{s.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          }`}>
                            {isOverdue ? 'OVERDUE' : 'UPCOMING'}
                          </span>
                        </div>

                        <p className="text-slate-800 font-medium">{assetObj.description || 'Target Asset'}</p>
                        <p className="text-slate-500">Asset ID: <span className="font-mono text-slate-900">{assetObj.assetId}</span></p>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Frequency:</span>
                            <span className="font-semibold text-slate-900">Every {s.frequencyMonths} Months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Next Due Date:</span>
                            <span className={`font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>{formatDate(s.nextDueDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => {
                            setWoForm({
                              assetId: assetObj._id,
                              workType: 'PREVENTIVE',
                              priority: 'HIGH',
                              description: `PM Execution: ${s.title}`,
                              assignedTechnicianId: '',
                              notes: '',
                              scheduledDate: s.nextDueDate
                            });
                            setShowCreateWoModal(true);
                          }}
                          className="text-[11px] text-purple-600 hover:text-purple-800 font-bold hover:underline flex items-center gap-1"
                        >
                          + Generate Work Order
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
      {/* TAB 3: MAINTENANCE HISTORY & ASSET HEALTH MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter history by Asset ID, Name, Serial..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Evaluating Repair vs Replace Cost Thresholds across active assets
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" /> Asset Health Scorecard & Cumulative Repair Analysis
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Asset Parameters</th>
                    <th className="p-3 text-center">Work Orders</th>
                    <th className="p-3 text-right">Original Cost</th>
                    <th className="p-3 text-right">Cumulative Repair Cost</th>
                    <th className="p-3 text-center">Repair / Replace Ratio</th>
                    <th className="p-3 text-center">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {assets
                    .filter(a => !historySearch || (
                      a.assetId?.toLowerCase().includes(historySearch.toLowerCase()) ||
                      a.description?.toLowerCase().includes(historySearch.toLowerCase()) ||
                      a.serialNumber?.toLowerCase().includes(historySearch.toLowerCase())
                    ))
                    .map(asset => {
                      const assetWOs = workOrders.filter(w => w.assetId?._id === asset._id || w.assetId === asset._id);
                      const cumulativeCost = assetWOs.reduce((acc, w) => acc + (parseFloat(w.cost?.toString() || 0)), 0);
                      const purchaseCost = parseFloat(asset.cost || asset.purchasePrice || 1200);
                      const ratioPct = Math.round((cumulativeCost / (purchaseCost || 1)) * 100);

                      let healthBadge = <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">HEALTHY</span>;
                      if (ratioPct >= 50) {
                        healthBadge = <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> REPLACEMENT RECOMMENDED</span>;
                      } else if (ratioPct >= 25) {
                        healthBadge = <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">HIGH REPAIR COST</span>;
                      }

                      return (
                        <tr key={asset._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{asset.description}</div>
                            <div className="text-[11px] font-mono text-purple-700">{asset.assetId} | SN: {asset.serialNumber || 'N/A'}</div>
                          </td>

                          <td className="p-3 text-center font-bold">
                            {assetWOs.length} <span className="text-[10px] text-slate-400 font-normal">WO(s)</span>
                          </td>

                          <td className="p-3 text-right font-mono font-semibold text-slate-700">
                            {formatCurrency(purchaseCost)}
                          </td>

                          <td className="p-3 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(cumulativeCost)}
                          </td>

                          <td className="p-3 text-center">
                            <span className={`font-mono font-extrabold ${ratioPct >= 50 ? 'text-rose-600' : ratioPct >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {ratioPct}%
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            {healthBadge}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: WORK ORDER DETAIL & CHECKLIST MANAGEMENT */}
      {/* ========================================================================= */}
      {showDetailDrawer && selectedWo && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-700 text-base">{selectedWo.workOrderNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    {drawerForm.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{selectedWo.description}</h3>
              </div>

              <button onClick={() => setShowDetailDrawer(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Asset Information Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Asset Parameters</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <p>Asset ID: <span className="font-semibold text-purple-700">{selectedWo.assetId?.assetId}</span></p>
                <p>Description: <span className="font-semibold text-slate-900">{selectedWo.assetId?.description}</span></p>
                <p>Serial #: <span className="font-mono text-slate-800">{selectedWo.assetId?.serialNumber || 'N/A'}</span></p>
                <p>Status: <span className="font-bold text-amber-600">{selectedWo.assetId?.lifecycleStatus}</span></p>
              </div>
            </div>

            <form onSubmit={handleUpdateWoSubmit} className="space-y-4 text-xs">
              {/* Status Progression Controls */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Order Status Progression *</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDrawerForm({ ...drawerForm, status: st })}
                      className={`py-2 rounded-lg text-[10px] font-extrabold transition-all border ${
                        drawerForm.status === st 
                          ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technician & Labor Hours / Costs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Technician</label>
                  <select
                    value={drawerForm.assignedTechnicianId}
                    onChange={(e) => setDrawerForm({ ...drawerForm, assignedTechnicianId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Labor Hours (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={drawerForm.laborHours}
                    onChange={(e) => setDrawerForm({ ...drawerForm, laborHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Repair Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={drawerForm.cost}
                    onChange={(e) => setDrawerForm({ ...drawerForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono font-bold text-emerald-600 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Failure Code & Root Cause */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Failure Code</label>
                  <input
                    type="text"
                    placeholder="E.g. ERR-MOTOR-OVERHEAT"
                    value={drawerForm.failureCode}
                    onChange={(e) => setDrawerForm({ ...drawerForm, failureCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Root Cause Analysis</label>
                  <input
                    type="text"
                    placeholder="E.g. Bearing wear out due to lack of lube"
                    value={drawerForm.rootCause}
                    onChange={(e) => setDrawerForm({ ...drawerForm, rootCause: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Spare Parts & Inventory Materials Consumed */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-purple-600" /> Spare Parts & Material Consumption
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    Parts Subtotal: {formatCurrency(drawerForm.partsCost)}
                  </span>
                </div>

                {/* Parts Entry Inputs */}
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Part Name (e.g. Oil Filter Kit)"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="col-span-5 bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newPartQty}
                    onChange={(e) => setNewPartQty(e.target.value)}
                    className="col-span-2 bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit ($)"
                    value={newPartUnitCost}
                    onChange={(e) => setNewPartUnitCost(e.target.value)}
                    className="col-span-3 bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg py-2 cursor-pointer shadow-2xs"
                  >
                    + Add
                  </button>
                </div>

                {/* Parts Table */}
                {partsList.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2">Part Description</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Price</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {partsList.map((pt, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium text-slate-800">{pt.partName}</td>
                            <td className="p-2 text-center font-mono">{pt.quantity}</td>
                            <td className="p-2 text-right font-mono text-slate-600">{formatCurrency(pt.unitCost)}</td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-600">{formatCurrency(pt.totalCost)}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePart(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Maintenance Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-purple-600" /> Technician Task Execution Checklist
                </span>

                <div className="space-y-1.5">
                  {drawerForm.checklist.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleToggleCheckitem(idx)}
                      className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300 transition-all shadow-xs"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`text-xs ${item.completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDetailDrawer(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  Save Work Order Updates
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE WORK ORDER */}
      {/* ========================================================================= */}
      {showCreateWoModal && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-600" /> Create Maintenance Work Order
              </h2>
              <button onClick={() => setShowCreateWoModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Target Asset *</label>
                <select
                  value={woForm.assetId}
                  onChange={(e) => setWoForm({ ...woForm, assetId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.assetId} — {a.description} ({a.serialNumber || 'No Serial'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Work Type *</label>
                  <select
                    value={woForm.workType}
                    onChange={(e) => setWoForm({ ...woForm, workType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                  >
                    <option value="CORRECTIVE">CORRECTIVE (Breakdown Repair)</option>
                    <option value="PREVENTIVE">PREVENTIVE (Routine Maintenance)</option>
                    <option value="INSPECTION">INSPECTION (Safety Check)</option>
                    <option value="CALIBRATION">CALIBRATION (Precision Service)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority Level *</label>
                  <select
                    value={woForm.priority}
                    onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold text-purple-700 focus:border-purple-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Issue Description / Task Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Motor bearing replacement & quarterly calibration"
                  value={woForm.description}
                  onChange={(e) => setWoForm({ ...woForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign Technician (Optional)</label>
                <select
                  value={woForm.assignedTechnicianId}
                  onChange={(e) => setWoForm({ ...woForm, assignedTechnicianId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                >
                  <option value="">-- Select Technician --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateWoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE PM SCHEDULE */}
      {/* ========================================================================= */}
      {showCreateSchedModal && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Create PM Schedule
              </h2>
              <button onClick={() => setShowCreateSchedModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Semi-Annual HVAC Compressor Service"
                  value={schedForm.title}
                  onChange={(e) => setSchedForm({ ...schedForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Target Asset *</label>
                <select
                  value={schedForm.assetId}
                  onChange={(e) => setSchedForm({ ...schedForm, assetId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-purple-500"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => (
                    <option key={a._id} value={a._id}>{a.assetId} — {a.description}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frequency (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={schedForm.frequencyMonths}
                    onChange={(e) => setSchedForm({ ...schedForm, frequencyMonths: parseInt(e.target.value) || 6 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    required
                    value={schedForm.nextDueDate}
                    onChange={(e) => setSchedForm({ ...schedForm, nextDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateSchedModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default MaintenanceManager;
