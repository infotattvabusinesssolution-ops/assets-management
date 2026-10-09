import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Paperclip,
  MessageSquare,
  Box,
  Edit,
  Info,
  Check,
  Zap,
  Tag,
  Shield
} from 'lucide-react';

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";
const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';
const getWorkOrderUrl = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'ALL') query.set(key, value); });
  return `/maintenance/work-orders${query.toString() ? `?${query.toString()}` : ''}`;
};
const csvCell = (value) => {
  const raw = String(value ?? '');
  const safe = /^[=+@\-]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};
const STATUS_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'ASSIGNED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['IN_PROGRESS'],
  VERIFIED: [], CLOSED: [], CANCELLED: ['OPEN']
};

export function MaintenanceManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Primary Workspace Data
  const [summary, setSummary] = useState({});

  const [workOrders, setWorkOrders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assetHistory, setAssetHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Selected Work Order & Asset Drill-down State
  const [selectedWoId, setSelectedWoId] = useState(null);
  const [focusedAssetId, setFocusedAssetId] = useState(null);
  const [selectedWorkOrderDetail, setSelectedWorkOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRevision, setDetailRevision] = useState(0);
  const [bottomTab, setBottomTab] = useState('HISTORY'); // HISTORY | SCHEDULED | PARTS | TIMELOGS | ATTACHMENTS | NOTES

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showCreateWoModal, setShowCreateWoModal] = useState(false);
  const [showEditWoModal, setShowEditWoModal] = useState(false);
  const [showCreateSchedModal, setShowCreateSchedModal] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showAddTimeLogModal, setShowAddTimeLogModal] = useState(false);
  const [showAddPartsModal, setShowAddPartsModal] = useState(false);
  const [showCloseWoModal, setShowCloseWoModal] = useState(false);

  // Modal Form States
  const [woForm, setWoForm] = useState({
    assetId: '',
    workType: 'CORRECTIVE',
    priority: 'MEDIUM',
    description: '',
    assignedTechnicianId: '',
    vendorName: '',
    scheduledDate: '',
    dueTargetDate: '',
    notes: ''
  });
  const [editForm, setEditForm] = useState({ description: '', workType: 'CORRECTIVE', priority: 'MEDIUM', scheduledDate: '', dueTargetDate: '', vendorName: '', notes: '' });

  const [schedForm, setSchedForm] = useState({
    title: '',
    assetId: '',
    frequencyMonths: '',
    nextDueDate: ''
  });

  const [statusForm, setStatusForm] = useState({
    targetStatus: '',
    assignedTechnicianId: '',
    comments: ''
  });

  const [timeLogForm, setTimeLogForm] = useState({
    technician: '',
    workDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hoursWorked: '',
    hourlyRate: 0,
    activity: '',
    remarks: ''
  });

  const [partForm, setPartForm] = useState({
    partName: '',
    partNumber: '',
    quantity: 1,
    unitCost: ''
  });

  const [closeForm, setCloseForm] = useState({
    workPerformed: '',
    failureCode: '',
    rootCause: '',
    downtimeHours: '',
    completionComments: '',
    supervisorVerification: false
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch maintenance records linked to the Asset Register
  const loadMaintenanceData = async (filters = appliedFilters, preferredId = null) => {
    setLoading(true);
    try {
      const [sumRes, woRes, schRes, assRes, techRes, catRes] = await Promise.all([
        api.get('/maintenance/summary'),
        api.get(getWorkOrderUrl(filters)),
        api.get('/maintenance/schedules'),
        api.get('/maintenance/assets'),
        api.get('/maintenance/technicians'),
        api.get('/master-data/categories').catch(() => ({ categories: [] }))
      ]);

      if (sumRes?.success) setSummary(sumRes.summary);
      if (woRes?.success) {
        setSelectedWorkOrderDetail(null);
        setWorkOrders(woRes.workOrders || []);
        setSelectedWoId(current => {
          const desired = preferredId || current;
          return woRes.workOrders?.some(w => w.id === desired) ? desired : woRes.workOrders?.[0]?.id || null;
        });
        setDetailRevision(revision => revision + 1);
      }
      if (schRes?.success) setSchedules(schRes.schedules || []);
      if (assRes?.success) setAssets(assRes.assets || []);
      if (techRes?.success) setTechnicians(techRes.technicians || []);
      if (catRes?.success) setCategories(catRes.categories || []);
    } catch (err) {
      showToast('error', err.message || 'Could not load maintenance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceData({}, searchParams.get('workOrder'));
  }, []);

  useEffect(() => {
    if (!selectedWoId) {
      setSelectedWorkOrderDetail(null);
      setDetailLoading(false);
      return undefined;
    }
    let active = true;
    setDetailLoading(true);
    api.get(`/maintenance/work-orders/${encodeURIComponent(selectedWoId)}`)
      .then(result => {
        if (active && result?.success) setSelectedWorkOrderDetail(result.workOrder);
      })
      .catch(err => {
        if (active) {
          setSelectedWorkOrderDetail(null);
          showToast('error', err.message || 'Could not load work order details.');
        }
      })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedWoId, detailRevision]);

  // Selected Work Order reference object
  const selectedWo = useMemo(() => {
    if (selectedWorkOrderDetail && (selectedWorkOrderDetail._id || selectedWorkOrderDetail.id) === selectedWoId) return selectedWorkOrderDetail;
    return workOrders.find(w => (w._id || w.id) === selectedWoId) || null;
  }, [workOrders, selectedWoId, selectedWorkOrderDetail]);

  // Selected Asset reference object
  const selectedAsset = useMemo(() => {
    if (selectedWo) return selectedWo.asset || assets.find(a => a.id === selectedWo.assetId) || null;
    return assets.find(a => a.id === focusedAssetId) || null;
  }, [selectedWo, assets, focusedAssetId]);

  useEffect(() => {
    if (!selectedAsset?.id) { setAssetHistory([]); return undefined; }
    let active = true;
    setHistoryLoading(true);
    api.get(`/maintenance/assets/${encodeURIComponent(selectedAsset.id)}/history`)
      .then(result => { if (active && result?.success) setAssetHistory(result.history || []); })
      .catch(err => { if (active) { setAssetHistory([]); showToast('error', err.message || 'Could not load asset maintenance history.'); } })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [selectedAsset?.id, detailRevision]);

  const filteredWorkOrders = workOrders;

  const totalRecords = filteredWorkOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedWorkOrders = useMemo(() => {
    return filteredWorkOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredWorkOrders, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [appliedFilters]);

  const handleSearch = () => {
    if (startDateFilter && endDateFilter && startDateFilter > endDateFilter) {
      showToast('error', 'Created from must be on or before Created to.');
      return;
    }
    const filters = { search: searchQuery.trim(), status: statusFilter, workType: typeFilter, categoryId: categoryFilter, location: locationFilter, priority: priorityFilter, startDate: startDateFilter, endDate: endDateFilter };
    setAppliedFilters(filters);
    loadMaintenanceData(filters);
  };

  const clearFilterFields = () => {
    setSearchQuery(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setCategoryFilter('ALL');
    setLocationFilter('ALL'); setPriorityFilter('ALL'); setStartDateFilter(''); setEndDateFilter('');
  };

  const handleClearFilters = () => {
    clearFilterFields();
    setAppliedFilters({});
    loadMaintenanceData({});
  };

  const refreshAllSelecting = async (id) => {
    clearFilterFields();
    setAppliedFilters({});
    await loadMaintenanceData({}, id);
  };

  const handleViewWorkOrder = (id) => {
    setFocusedAssetId(null);
    setSelectedWorkOrderDetail(null);
    setSelectedWoId(id);
    setDetailRevision(revision => revision + 1);
  };

  const handleBottomTabChange = async (tab) => {
    setBottomTab(tab);
    if (tab === 'SCHEDULED') {
      try {
        const result = await api.get('/maintenance/schedules');
        if (!result?.success) throw new Error(result?.message || 'Could not refresh schedules.');
        setSchedules(result.schedules || []);
      } catch (err) { showToast('error', err.message || 'Could not refresh schedules.'); }
    } else {
      setDetailRevision(revision => revision + 1);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const result = await api.get(getWorkOrderUrl(appliedFilters));
      if (!result?.success) throw new Error(result?.message || 'Could not export work orders.');
      const headers = ['Work Order', 'Asset', 'Asset Name', 'Type', 'Priority', 'Status', 'Assigned To', 'Scheduled Date'];
      const rows = (result.workOrders || []).map(w => [w.workOrderNumber, w.asset?.assetId, w.asset?.description, w.workType, w.priority, w.status, w.assignedTechnician?.fullName, w.scheduledDate].map(csvCell).join(','));
      const blob = new Blob([[headers.map(csvCell).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'maintenance-work-orders.csv'; document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { showToast('error', err.message || 'Could not export work orders.'); }
    finally { setExportLoading(false); }
  };

  const openEditWorkOrder = () => {
    if (!selectedWo) return;
    setEditForm({ description: selectedWo.description || '', workType: selectedWo.workType || 'CORRECTIVE', priority: selectedWo.priority || 'MEDIUM', scheduledDate: toDateInput(selectedWo.scheduledDate), dueTargetDate: toDateInput(selectedWo.completionTargetDate), vendorName: selectedWo.vendorName || '', notes: selectedWo.notes || '' });
    setShowEditWoModal(true);
  };

  const openStatusModal = () => {
    if (!selectedWo) return;
    setStatusForm({ targetStatus: '', assignedTechnicianId: '', comments: '' });
    setShowUpdateStatusModal(true);
  };

  const openCloseModal = () => {
    if (!selectedWo || ['VERIFIED', 'CLOSED', 'CANCELLED'].includes(selectedWo.status)) return;
    setCloseForm({ workPerformed: selectedWo.status === 'COMPLETED' ? (selectedWo.notes?.match(/Work performed: ([^\n]+)/)?.[1] || '') : '', failureCode: selectedWo.failureCode || '', rootCause: selectedWo.rootCause || '', downtimeHours: '', completionComments: '', supervisorVerification: selectedWo.status === 'COMPLETED' });
    setShowCloseWoModal(true);
  };

  const handleEditWoSubmit = async (event) => {
    event.preventDefault();
    if (!selectedWo) return;
    setActionLoading(true);
    try {
      const result = await api.put(`/maintenance/work-orders/${selectedWo.id}`, editForm);
      if (!result?.success) throw new Error(result?.message || 'Could not update work order.');
      setShowEditWoModal(false);
      showToast('success', 'Work order details saved.');
      await refreshAllSelecting(selectedWo.id);
    } catch (err) { showToast('error', err.message || 'Could not update work order.'); }
    finally { setActionLoading(false); }
  };

  // Handlers
  const handleCreateWoSubmit = async (e) => {
    e.preventDefault();
    if (!woForm.assetId || !woForm.description) {
      alert('Please select an asset and enter a problem description.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/maintenance/work-orders', woForm);
      if (!res?.success) throw new Error(res?.message || 'Could not create work order.');
      if (res.success) {
        showToast('success', `Work Order ${res.workOrder?.workOrderNumber || ''} created!`);
        setShowCreateWoModal(false);
        setWoForm({ assetId: '', workType: 'CORRECTIVE', priority: 'MEDIUM', description: '', assignedTechnicianId: '', vendorName: '', scheduledDate: '', dueTargetDate: '', notes: '' });
        await refreshAllSelecting(res.workOrder.id);
      }
    } catch (err) {
      showToast('error', err.message || 'Could not create work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateScheduleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...schedForm, frequencyMonths: Number(schedForm.frequencyMonths) };
      const result = editingScheduleId
        ? await api.put(`/maintenance/schedules/${editingScheduleId}`, payload)
        : await api.post('/maintenance/schedules', payload);
      if (!result?.success) throw new Error(result?.message || 'Could not save schedule.');
      showToast('success', editingScheduleId ? 'Maintenance schedule updated.' : 'Maintenance schedule created.');
      setShowCreateSchedModal(false);
      setBottomTab('SCHEDULED');
      setEditingScheduleId(null);
      setSchedForm({ title: '', assetId: '', frequencyMonths: '', nextDueDate: '' });
      await loadMaintenanceData();
      if (selectedAsset?.id !== payload.assetId || focusedAssetId) {
        setFocusedAssetId(payload.assetId);
        setSelectedWoId(null);
      }
    } catch (err) { showToast('error', err.message || 'Could not save schedule.'); }
    finally { setActionLoading(false); }
  };

  const openCreateSchedule = () => {
    setEditingScheduleId(null);
    setSchedForm({ title: '', assetId: selectedAsset?.id || '', frequencyMonths: '', nextDueDate: '' });
    setShowCreateSchedModal(true);
  };

  const openEditSchedule = (schedule) => {
    setEditingScheduleId(schedule.id);
    setSchedForm({ title: schedule.title || '', assetId: schedule.assetId, frequencyMonths: schedule.frequencyMonths || '', nextDueDate: toDateInput(schedule.nextDueDate) });
    setShowCreateSchedModal(true);
  };

  const handleToggleSchedule = async (schedule) => {
    setActionLoading(true);
    try {
      const result = await api.put(`/maintenance/schedules/${schedule.id}`, { active: !schedule.active });
      if (!result?.success) throw new Error(result?.message || 'Could not update schedule.');
      showToast('success', schedule.active ? 'Schedule paused.' : 'Schedule reactivated.');
      await loadMaintenanceData();
      if (focusedAssetId) { setFocusedAssetId(schedule.assetId); setSelectedWoId(null); }
    } catch (err) { showToast('error', err.message || 'Could not update schedule.'); }
    finally { setActionLoading(false); }
  };

  const handleAddTimeLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWo) return;
    setActionLoading(true);
    try {
      const result = await api.post(`/maintenance/work-orders/${selectedWo.id}/time-logs`, { ...timeLogForm, hoursWorked: Number(timeLogForm.hoursWorked), hourlyRate: Number(timeLogForm.hourlyRate || 0) });
      if (!result?.success) throw new Error(result?.message || 'Could not save time log.');
      showToast('success', 'Time log saved.');
      setShowAddTimeLogModal(false);
      setBottomTab('TIMELOGS');
      setTimeLogForm({ technician: '', workDate: new Date().toISOString().split('T')[0], startTime: '', endTime: '', hoursWorked: '', hourlyRate: 0, activity: '', remarks: '' });
      await refreshAllSelecting(selectedWo.id);
    } catch (err) { showToast('error', err.message || 'Could not save time log.'); }
    finally { setActionLoading(false); }
  };

  const handleAddPartsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWo) return;
    setActionLoading(true);
    try {
      const result = await api.post(`/maintenance/work-orders/${selectedWo.id}/parts`, { ...partForm, quantity: Number(partForm.quantity), unitCost: Number(partForm.unitCost || 0) });
      if (!result?.success) throw new Error(result?.message || 'Could not save part usage.');
      showToast('success', 'Part usage saved.');
      setShowAddPartsModal(false);
      setBottomTab('PARTS');
      setPartForm({ partName: '', partNumber: '', quantity: 1, unitCost: '' });
      await refreshAllSelecting(selectedWo.id);
    } catch (err) { showToast('error', err.message || 'Could not save part usage.'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWo || !statusForm.targetStatus) return;

    setActionLoading(true);
    try {
      const targetWoId = selectedWo._id || selectedWo.id;
      const res = await api.put(`/maintenance/work-orders/${targetWoId}/status`, {
        status: statusForm.targetStatus,
        comments: statusForm.comments,
        assignedTechnicianId: statusForm.assignedTechnicianId || undefined
      });
      if (!res?.success) throw new Error(res?.message || 'Could not update work order.');

      if (res.success) {
        showToast('success', `Work Order status updated to ${statusForm.targetStatus}!`);
        setShowUpdateStatusModal(false);
        setStatusForm({ targetStatus: '', assignedTechnicianId: '', comments: '' });
        await refreshAllSelecting(targetWoId);
      }
    } catch (err) {
      showToast('error', err.message || 'Could not update work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseWoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWo) return;

    setActionLoading(true);
    try {
      const targetWoId = selectedWo._id || selectedWo.id;
      const result = await api.post(`/maintenance/work-orders/${targetWoId}/close`, closeForm);
      if (!result?.success) throw new Error(result?.message || 'Could not complete work order.');
      showToast('success', `Work Order ${selectedWo.workOrderNumber} ${result.workOrder?.status === 'VERIFIED' ? 'verified' : 'completed'}.`);
      setShowCloseWoModal(false);
      setCloseForm({ workPerformed: '', failureCode: '', rootCause: '', downtimeHours: '', completionComments: '', supervisorVerification: false });
      await refreshAllSelecting(targetWoId);
    } catch (err) {
      showToast('error', err.message || 'Could not close work order.');
    } finally {
      setActionLoading(false);
    }
  };

  // Badge Style Helpers matching screenshot colors
  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High':
      case 'HIGH':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Medium':
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
      case 'In Progress':
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'Completed':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Open':
      case 'OPEN':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
      case 'Overdue':
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Cancelled':
      case 'CANCELLED':
        return 'bg-slate-200 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans bg-[#F8FAFC] min-h-screen p-2 sm:p-3">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BREADCRUMB & PAGE TITLE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Maintenance</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#6C2BD9] font-bold">Asset Maintenance</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Asset Maintenance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage maintenance activities, work orders and service history
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateWoModal(true)}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
          
          <button
            onClick={openCreateSchedule}
            className="px-4 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs transition-all"
          >
            <Calendar className="w-4 h-4 text-[#6C2BD9]" /> Schedule Maintenance
          </button>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1"
          >
            {exportLoading ? 'Exporting…' : 'Export CSV'} <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Open', summary.openCount], ['Assigned', summary.assignedCount], ['In progress', summary.inProgressCount], ['Completed', summary.completedCount]].map(([label, value]) => (
          <div key={label} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"><div className="text-[11px] text-slate-500 font-semibold">{label}</div><div className="text-xl font-extrabold text-slate-900">{Number(value || 0).toLocaleString()}</div></div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SEARCH AND FILTERS BAR MATCHING SCREENSHOT 31 */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2.5 items-end">
          
          {/* Search Input */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by WO No., Asset No., name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Maintenance Type Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Maintenance Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              <option value="PREVENTIVE">Preventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="INSPECTION">Inspection</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div className="space-y-1"><label className="text-[11px] font-bold text-slate-700">Priority</label><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"><option value="ALL">All</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>

          {/* Asset Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Asset Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
            >
              <option value="ALL">All</option>
              {Array.from(new Map(assets.filter(a => a.site).map(a => [a.siteId, a.site])).entries()).map(([id, site]) => <option key={id} value={id}>{site.name}</option>)}
            </select>
          </div>

          <div className="space-y-1"><label className="text-[11px] font-bold text-slate-700">Created from</label><input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[11px]" /></div>
          <div className="space-y-1"><label className="text-[11px] font-bold text-slate-700">Created to</label><input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[11px]" /></div>
        </div>

        {/* Search & Clear Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold py-1.5 px-4 rounded-lg shadow-xs flex items-center justify-center gap-1.5 text-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={handleClearFilters}
            disabled={loading}
            className="bg-white hover:bg-slate-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold py-1.5 px-4 rounded-lg shadow-2xs text-xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE SPLIT LAYOUT: GRID (LEFT 8) & DETAILS PANEL (RIGHT 4) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: WORK ORDER LIST TABLE (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Work Order List ({totalRecords})
            </h3>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-700 font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-8">Select</th>
                    <th className="p-2.5">WO No.</th>
                    <th className="p-2.5">Asset No.</th>
                    <th className="p-2.5">Asset Name</th>
                    <th className="p-2.5">Maintenance Type</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Scheduled Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Assigned To</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {paginatedWorkOrders.map((wo) => {
                    const woId = wo._id || wo.id;
                    const isSelected = selectedWoId === woId;
                    const assetObj = wo.asset || assets.find(a => a.id === wo.assetId) || {};
                    const techName = wo.assignedTechnician?.fullName || (typeof wo.assignedTechnicianId === 'string' ? wo.assignedTechnicianId : '-');

                    return (
                      <tr 
                        key={woId}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleViewWorkOrder(woId)}
                        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleViewWorkOrder(woId); } }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="radio" name="selected-maintenance-work-order" aria-label={`Select ${wo.workOrderNumber}`} checked={isSelected} onChange={() => handleViewWorkOrder(woId)} className="border-slate-300" />
                        </td>
                        <td className="p-2.5 font-mono text-[#6C2BD9] font-bold hover:underline">
                          {wo.workOrderNumber}
                        </td>
                        <td className="p-2.5 font-mono text-[#6C2BD9]">
                          {assetObj.assetId || '-'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {assetObj.description || '-'}
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {wo.workType}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeStyle(wo.priority)}`}>
                            {wo.priority}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(wo.scheduledDate)}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBadgeStyle(wo.status)}`}>
                            {wo.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {techName}
                        </td>
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => handleViewWorkOrder(woId)} aria-label={`View ${wo.workOrderNumber}`} title="View work order details" className="px-2 py-1 hover:bg-purple-100 rounded text-[#6C2BD9] font-semibold">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && paginatedWorkOrders.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-slate-500">No work orders match these filters. Create a work order or clear the filters.</td></tr>}
                  {loading && <tr><td colSpan={10} className="p-8 text-center text-slate-500">Loading work orders from the database…</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {totalRecords ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}</span>
              <div className="flex items-center gap-2"><select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-1.5 py-1"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select><button disabled={currentPage <= 1} onClick={() => setCurrentPage(page => page - 1)} className="border rounded px-2 py-1 disabled:opacity-40">Previous</button><span>Page {currentPage} of {totalPages}</span><button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(page => page + 1)} className="border rounded px-2 py-1 disabled:opacity-40">Next</button></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORK ORDER DETAILS PANEL MATCHING SCREENSHOT 31 */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Work Order Details</h3>
            <button 
              disabled={!selectedWo || detailLoading}
              onClick={openEditWorkOrder}
              className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-md text-xs flex items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit Details
            </button>
          </div>

          {detailLoading && <p role="status" className="text-xs text-slate-500">Loading selected work order from the database…</p>}
          {!detailLoading && !selectedWo && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs text-slate-500">No work order is selected. Choose a row above, or create a work order to see its details here.</div>}
          <div className={`space-y-2 text-xs ${!selectedWo ? 'hidden' : ''}`}>
            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">WO Number</span>
              <span className="col-span-7 font-mono font-bold text-slate-900">: {selectedWo?.workOrderNumber || "-"}</span>
            </div>
            
            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Asset No.</span>
              <span className="col-span-7 font-mono font-bold text-[#6C2BD9]">: {selectedAsset?.assetId || "-"}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Asset Name</span>
              <span className="col-span-7 font-bold text-slate-900">: {selectedAsset?.description || "-"}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Maintenance Type</span>
              <span className="col-span-7 text-slate-900 font-medium">: {selectedWo?.workType || "-"}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5 items-center">
              <span className="col-span-5 text-slate-500 font-semibold">Priority</span>
              <span className="col-span-7">
                : <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getPriorityBadgeStyle(selectedWo?.priority)}`}>
                  {selectedWo?.priority || "-"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5 items-center">
              <span className="col-span-5 text-slate-500 font-semibold">Status</span>
              <span className="col-span-7">
                : <span className={`px-2 py-0.5 rounded text-[10px] border font-bold inline-block ${getStatusBadgeStyle(selectedWo?.status)}`}>
                  {selectedWo?.status || "-"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Scheduled Date</span>
              <span className="col-span-7 font-mono text-slate-800">: {formatDate(selectedWo?.scheduledDate)}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Due Date</span>
              <span className="col-span-7 font-mono text-slate-800">: {formatDate(selectedWo?.completionTargetDate)}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Assigned To</span>
              <span className="col-span-7 font-bold text-slate-900">: {selectedWo?.assignedTechnician?.fullName || "-"}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Location</span>
              <span className="col-span-7 text-slate-800">: {[selectedAsset?.site?.name, selectedAsset?.building?.name, selectedAsset?.room?.name].filter(Boolean).join(" > ") || "-"}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5">
              <span className="col-span-5 text-slate-500 font-semibold">Description</span>
              <span className="col-span-7 text-slate-700 italic">: {selectedWo?.description || "-"}</span>
            </div>

            {/* ACTION BUTTONS MATCHING SCREENSHOT 31 */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!selectedWo}
                  onClick={openStatusModal}
                  className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update Status <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={!selectedWo}
                  onClick={() => setShowAddTimeLogModal(true)}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Time Log
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!selectedWo}
                  onClick={() => setShowAddPartsModal(true)}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Box className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Parts Used
                </button>

                <button
                  disabled={!selectedWo || ['VERIFIED', 'CLOSED', 'CANCELLED'].includes(selectedWo.status)}
                  onClick={openCloseModal}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5 text-[#6C2BD9]" /> {selectedWo?.status === 'COMPLETED' ? 'Verify Work Order' : 'Complete Work Order'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LOWER SECTION: CONTEXTUAL TABS (LEFT 8) & ASSET INFO (RIGHT 4) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LOWER LEFT: CONTEXTUAL TABS (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          
          {/* Tabs Navigation Bar */}
          <div className="flex items-center border-b border-slate-200 gap-6 overflow-x-auto">
            <button
              onClick={() => handleBottomTabChange('HISTORY')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'HISTORY' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Maintenance History
            </button>

            <button
              onClick={() => handleBottomTabChange('SCHEDULED')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'SCHEDULED' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Scheduled Maintenance
            </button>

            <button
              onClick={() => handleBottomTabChange('PARTS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'PARTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parts &amp; Consumables
            </button>

            <button
              onClick={() => handleBottomTabChange('TIMELOGS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'TIMELOGS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Time Logs
            </button>

            <button
              onClick={() => handleBottomTabChange('ATTACHMENTS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'ATTACHMENTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Attachments
            </button>

            <button
              onClick={() => handleBottomTabChange('NOTES')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'NOTES' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Notes
            </button>
          </div>

          {/* TAB 1: MAINTENANCE HISTORY TABLE MATCHING SCREENSHOT 31 */}
          {bottomTab === 'HISTORY' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-auto max-h-[350px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-2xs text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">WO No.</th>
                      <th className="p-2.5">Maintenance Type</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Performed By</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {assetHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(h.completedDate || h.createdAt)}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#6C2BD9]"><button type="button" onClick={() => handleViewWorkOrder(h.id)} className="hover:underline" title="View this work order">{h.workOrderNumber}</button></td>
                        <td className="p-2.5 text-slate-800">
                          {h.workType}
                        </td>
                        <td className="p-2.5 text-slate-900 max-w-[220px] truncate">
                          {h.description}
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {h.assignedTechnician?.fullName || "-"}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadgeStyle(h.status)}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {Number(h.cost || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {!historyLoading && assetHistory.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No maintenance history for this asset.</td></tr>}
                    {historyLoading && <tr><td colSpan={7} className="p-6 text-center text-slate-500">Loading asset history…</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {assetHistory.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          )}

          {bottomTab === 'SCHEDULED' && <div className="space-y-2">
            {schedules.filter(item => item.assetId === selectedAsset?.id).map(item => <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div><div className="font-bold text-slate-900">{item.title} <span className={item.active ? 'text-emerald-700' : 'text-slate-500'}>· {item.active ? 'Active' : 'Paused'}</span></div><div className="text-slate-600">Due {formatDate(item.nextDueDate)} · Every {item.frequencyMonths} months</div></div>
              <div className="flex gap-2"><button type="button" disabled={actionLoading} onClick={() => openEditSchedule(item)} className="px-2 py-1 rounded border border-[#6C2BD9] text-[#6C2BD9] disabled:opacity-40">Edit</button><button type="button" disabled={actionLoading} onClick={() => handleToggleSchedule(item)} className="px-2 py-1 rounded border border-slate-300 text-slate-700 disabled:opacity-40">{item.active ? 'Pause' : 'Reactivate'}</button></div>
            </div>)}
            {!schedules.some(item => item.assetId === selectedAsset?.id) && <p className="text-slate-500">No scheduled maintenance for this asset.</p>}
          </div>}
          {bottomTab === 'PARTS' && <div className="space-y-2">{(selectedWo?.partsUsed || []).map(part => <div key={part.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between"><span>{part.partName}{part.partNumber ? ` · ${part.partNumber}` : ''}</span><span>{part.quantity} × {Number(part.unitCost || 0).toLocaleString()}</span></div>)}{!selectedWo?.partsUsed?.length && <p className="text-slate-500">No parts recorded.</p>}</div>}
          {bottomTab === 'TIMELOGS' && <div className="space-y-2">{(selectedWo?.timeLogs || []).map(log => <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">{log.technician || 'Technician'} · {Number(log.hoursWorked || 0)} hours · {formatDate(log.workDate)}</div>)}{!selectedWo?.timeLogs?.length && <p className="text-slate-500">No time logs recorded.</p>}</div>}
          {bottomTab === 'ATTACHMENTS' && <div className="space-y-2">{(selectedWo?.photoUrls ? String(selectedWo.photoUrls).split(',').map(value => value.trim()).filter(Boolean) : []).map((url, index) => <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="block p-3 bg-slate-50 rounded border text-[#6C2BD9] underline break-all">Attachment {index + 1}: {url}</a>)}{!selectedWo?.photoUrls && <p className="p-4 text-slate-500 text-xs">No attachments recorded.</p>}</div>}
          {bottomTab === 'NOTES' && <div className="p-4 text-slate-700 text-xs">{selectedWo?.notes || 'No notes recorded.'}</div>}
        </div>

        {/* LOWER RIGHT: ASSET INFORMATION PANEL MATCHING SCREENSHOT 31 */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">Asset Information</h3>
          </div>

          <div className="space-y-3">
            {/* Asset Header with Image Thumbnail & Active Badge */}
            <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200">
              <div className="w-16 h-12 rounded bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300 text-slate-500 font-bold overflow-hidden">
                <Box className="w-7 h-7 text-slate-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset?.assetId || "-"}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                    {selectedAsset?.lifecycleStatus || "-"}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 truncate mt-0.5">{selectedAsset?.description || "-"}</h4>
              </div>
            </div>

            {/* Detailed Key-Value Properties */}
            <div className="space-y-1.5 text-xs">
              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Category</span>
                <span className="col-span-7 font-medium text-slate-900">: {selectedAsset?.category?.name || "-"}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Brand</span>
                <span className="col-span-7 font-medium text-slate-900">: {selectedAsset?.manufacturer?.name || "-"}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Model</span>
                <span className="col-span-7 font-mono font-medium text-slate-900">: {selectedAsset?.model?.name || "-"}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Serial No.</span>
                <span className="col-span-7 font-mono font-medium text-slate-900">: {selectedAsset?.serialNumber || "-"}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Location</span>
                <span className="col-span-7 font-medium text-slate-900">: {[selectedAsset?.site?.name, selectedAsset?.building?.name, selectedAsset?.room?.name].filter(Boolean).join(" > ") || "-"}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-0.5">
                <span className="col-span-5 text-slate-500 font-semibold">Custodian</span>
                <span className="col-span-7 font-medium text-slate-900">: {selectedAsset?.custodian?.fullName || "-"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {showCreateWoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Create Work Order
              </h3>
              <button onClick={() => setShowCreateWoModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Asset</label>
                <select required value={woForm.assetId} onChange={e => setWoForm({ ...woForm, assetId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium">
                  <option value="">Select an asset</option>
                  {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.assetId} - {asset.description}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs font-bold text-slate-700">Work Type<select value={woForm.workType} onChange={e => setWoForm({ ...woForm, workType: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"><option value="CORRECTIVE">Corrective</option><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option><option value="EMERGENCY">Emergency</option></select></label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Priority<select value={woForm.priority} onChange={e => setWoForm({ ...woForm, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Assign Technician<select value={woForm.assignedTechnicianId} onChange={e => setWoForm({ ...woForm, assignedTechnicianId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"><option value="">Unassigned</option>{technicians.map(person => <option key={person.id} value={person.id}>{person.fullName || person.username} · {person.role?.name || person.role?.code || 'User'}</option>)}</select></label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Scheduled Date<input type="date" value={woForm.scheduledDate} onChange={e => setWoForm({ ...woForm, scheduledDate: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" /></label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Due Date<input type="date" value={woForm.dueTargetDate} onChange={e => setWoForm({ ...woForm, dueTargetDate: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" /></label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Vendor<input value={woForm.vendorName} onChange={e => setWoForm({ ...woForm, vendorName: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" /></label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Problem Description</label>
                <textarea
                  required
                  rows={2}
                  value={woForm.description}
                  onChange={e => setWoForm({ ...woForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                />
              </div>

              <label className="block space-y-1 text-xs font-bold text-slate-700">Notes<textarea rows={2} value={woForm.notes} onChange={e => setWoForm({ ...woForm, notes: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium" /></label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateWoModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-lg hover:bg-[#5B21B6] shadow-xs"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditWoModal && selectedWo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white rounded-xl border shadow-2xl w-full max-w-lg p-5 space-y-4">
          <div className="flex justify-between border-b pb-3"><h3 className="font-bold">Edit {selectedWo.workOrderNumber}</h3><button type="button" onClick={() => setShowEditWoModal(false)} aria-label="Close edit form"><X className="w-4 h-4" /></button></div>
          <form onSubmit={handleEditWoSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-600">Asset: {selectedAsset?.assetId || selectedWo.assetId} · {selectedAsset?.description || ''}</p>
            <label className="block space-y-1 text-xs font-bold">Description<textarea required rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-bold">Maintenance type<select value={editForm.workType} onChange={e => setEditForm({ ...editForm, workType: e.target.value })} className="w-full border rounded-lg p-2"><option value="CORRECTIVE">Corrective</option><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option><option value="EMERGENCY">Emergency</option></select></label>
              <label className="space-y-1 text-xs font-bold">Priority<select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className="w-full border rounded-lg p-2"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
              <label className="space-y-1 text-xs font-bold">Scheduled date<input type="date" value={editForm.scheduledDate} onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })} className="w-full border rounded-lg p-2" /></label>
              <label className="space-y-1 text-xs font-bold">Due date<input type="date" value={editForm.dueTargetDate} onChange={e => setEditForm({ ...editForm, dueTargetDate: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            </div>
            <label className="block space-y-1 text-xs font-bold">Vendor<input value={editForm.vendorName} onChange={e => setEditForm({ ...editForm, vendorName: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <label className="block space-y-1 text-xs font-bold">Notes<textarea rows={3} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowEditWoModal(false)} className="px-3 py-2 bg-slate-100 rounded-lg">Cancel</button><button type="submit" disabled={actionLoading} className="px-3 py-2 bg-[#6C2BD9] text-white rounded-lg disabled:opacity-40">Save Changes</button></div>
          </form>
        </div></div>
      )}

      {showCreateSchedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white rounded-xl border shadow-2xl w-full max-w-md p-5 space-y-4">
          <div className="flex justify-between border-b pb-3"><h3 className="font-bold">{editingScheduleId ? 'Edit Maintenance Schedule' : 'Schedule Preventive Maintenance'}</h3><button onClick={() => setShowCreateSchedModal(false)}><X className="w-4 h-4" /></button></div>
          <form onSubmit={handleCreateScheduleSubmit} className="space-y-3">
            <label className="block space-y-1 text-xs font-bold">Schedule name<input required value={schedForm.title} onChange={e => setSchedForm({ ...schedForm, title: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <label className="block space-y-1 text-xs font-bold">Database asset<select required value={schedForm.assetId} onChange={e => setSchedForm({ ...schedForm, assetId: e.target.value })} className="w-full border rounded-lg p-2"><option value="">Select asset</option>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.assetId} · {asset.description}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs font-bold">Frequency (months)<input required type="number" min="1" step="1" value={schedForm.frequencyMonths} onChange={e => setSchedForm({ ...schedForm, frequencyMonths: e.target.value })} className="w-full border rounded-lg p-2" /></label><label className="space-y-1 text-xs font-bold">Next due date<input required type="date" value={schedForm.nextDueDate} onChange={e => setSchedForm({ ...schedForm, nextDueDate: e.target.value })} className="w-full border rounded-lg p-2" /></label></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreateSchedModal(false)} className="px-3 py-2 bg-slate-100 rounded-lg">Cancel</button><button disabled={actionLoading} className="px-3 py-2 bg-[#6C2BD9] text-white rounded-lg">{editingScheduleId ? 'Update Schedule' : 'Create Schedule'}</button></div>
          </form>
        </div></div>
      )}

      {showAddTimeLogModal && selectedWo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white rounded-xl border shadow-2xl w-full max-w-md p-5 space-y-4">
          <div className="flex justify-between border-b pb-3"><h3 className="font-bold">Add Labor / Time Log</h3><button onClick={() => setShowAddTimeLogModal(false)}><X className="w-4 h-4" /></button></div>
          <form onSubmit={handleAddTimeLogSubmit} className="space-y-3">
            <label className="block space-y-1 text-xs font-bold">Technician<select value={timeLogForm.technician} onChange={e => setTimeLogForm({ ...timeLogForm, technician: e.target.value })} className="w-full border rounded-lg p-2"><option value="">Signed-in user</option>{technicians.map(person => <option key={person.id} value={person.fullName || person.username}>{person.fullName || person.username}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs font-bold">Work date<input required type="date" value={timeLogForm.workDate} onChange={e => setTimeLogForm({ ...timeLogForm, workDate: e.target.value })} className="w-full border rounded-lg p-2" /></label><label className="space-y-1 text-xs font-bold">Hours worked<input required type="number" min="0.01" max="24" step="0.01" value={timeLogForm.hoursWorked} onChange={e => setTimeLogForm({ ...timeLogForm, hoursWorked: e.target.value })} className="w-full border rounded-lg p-2" /></label><label className="space-y-1 text-xs font-bold">Start time<input type="time" value={timeLogForm.startTime} onChange={e => setTimeLogForm({ ...timeLogForm, startTime: e.target.value })} className="w-full border rounded-lg p-2" /></label><label className="space-y-1 text-xs font-bold">End time<input type="time" value={timeLogForm.endTime} onChange={e => setTimeLogForm({ ...timeLogForm, endTime: e.target.value })} className="w-full border rounded-lg p-2" /></label></div>
            <label className="block space-y-1 text-xs font-bold">Hourly cost (optional)<input type="number" min="0" step="0.01" value={timeLogForm.hourlyRate} onChange={e => setTimeLogForm({ ...timeLogForm, hourlyRate: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <label className="block space-y-1 text-xs font-bold">Activity<textarea required rows={2} value={timeLogForm.activity} onChange={e => setTimeLogForm({ ...timeLogForm, activity: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <label className="block space-y-1 text-xs font-bold">Remarks<textarea rows={2} value={timeLogForm.remarks} onChange={e => setTimeLogForm({ ...timeLogForm, remarks: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowAddTimeLogModal(false)} className="px-3 py-2 bg-slate-100 rounded-lg">Cancel</button><button disabled={actionLoading} className="px-3 py-2 bg-[#6C2BD9] text-white rounded-lg">Save Time</button></div>
          </form>
        </div></div>
      )}

      {showAddPartsModal && selectedWo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white rounded-xl border shadow-2xl w-full max-w-md p-5 space-y-4">
          <div className="flex justify-between border-b pb-3"><h3 className="font-bold">Record Parts Used</h3><button onClick={() => setShowAddPartsModal(false)}><X className="w-4 h-4" /></button></div>
          <form onSubmit={handleAddPartsSubmit} className="space-y-3">
            <label className="block space-y-1 text-xs font-bold">Part name<input required value={partForm.partName} onChange={e => setPartForm({ ...partForm, partName: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <label className="block space-y-1 text-xs font-bold">Part number<input value={partForm.partNumber} onChange={e => setPartForm({ ...partForm, partNumber: e.target.value })} className="w-full border rounded-lg p-2" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs font-bold">Quantity<input required type="number" min="1" step="1" value={partForm.quantity} onChange={e => setPartForm({ ...partForm, quantity: e.target.value })} className="w-full border rounded-lg p-2" /></label><label className="space-y-1 text-xs font-bold">Unit cost<input type="number" min="0" step="0.01" value={partForm.unitCost} onChange={e => setPartForm({ ...partForm, unitCost: e.target.value })} className="w-full border rounded-lg p-2" /></label></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowAddPartsModal(false)} className="px-3 py-2 bg-slate-100 rounded-lg">Cancel</button><button disabled={actionLoading} className="px-3 py-2 bg-[#6C2BD9] text-white rounded-lg">Save Part</button></div>
          </form>
        </div></div>
      )}

      {showUpdateStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Update Status - {selectedWo?.workOrderNumber || ""}</h3>
              <button onClick={() => setShowUpdateStatusModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  required
                  value={statusForm.targetStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, targetStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                >
                  <option value="">Choose a status</option>
                  {selectedWo && <option value={selectedWo.status}>{selectedWo.status.replaceAll('_', ' ')} (keep)</option>}
                  {(STATUS_TRANSITIONS[selectedWo?.status] || []).map(nextStatus => <option key={nextStatus} value={nextStatus}>{nextStatus.replaceAll('_', ' ')}</option>)}
                </select>
              </div>

              <label className="block space-y-1 text-xs font-bold text-slate-700">Assign Technician<select required={statusForm.targetStatus === 'ASSIGNED' && !selectedWo?.assignedTechnicianId} value={statusForm.assignedTechnicianId} onChange={e => setStatusForm({ ...statusForm, assignedTechnicianId: e.target.value })} className="w-full border rounded-lg p-2 text-xs"><option value="">Keep current assignment</option>{technicians.map(person => <option key={person.id} value={person.id}>{person.fullName || person.username}</option>)}</select></label>
              <label className="block space-y-1 text-xs font-bold text-slate-700">Status comment<textarea rows={2} value={statusForm.comments} onChange={e => setStatusForm({ ...statusForm, comments: e.target.value })} className="w-full border rounded-lg p-2 text-xs" /></label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateStatusModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-lg hover:bg-[#5B21B6] shadow-xs"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseWoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{selectedWo?.status === 'COMPLETED' ? 'Verify' : 'Complete'} Work Order - {selectedWo?.workOrderNumber || ""}</h3>
              <button onClick={() => setShowCloseWoModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseWoSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Closure Summary</label>
                <textarea
                  required
                  rows={2}
                  value={closeForm.workPerformed}
                  onChange={e => setCloseForm({ ...closeForm, workPerformed: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs font-bold">Failure code<input value={closeForm.failureCode} onChange={e => setCloseForm({ ...closeForm, failureCode: e.target.value })} className="w-full border rounded-lg p-2" /></label>
                <label className="space-y-1 text-xs font-bold">Downtime hours<input type="number" min="0" step="0.1" value={closeForm.downtimeHours} onChange={e => setCloseForm({ ...closeForm, downtimeHours: e.target.value })} className="w-full border rounded-lg p-2" /></label>
              </div>
              <label className="block space-y-1 text-xs font-bold">Root cause<textarea rows={2} value={closeForm.rootCause} onChange={e => setCloseForm({ ...closeForm, rootCause: e.target.value })} className="w-full border rounded-lg p-2" /></label>
              <label className="block space-y-1 text-xs font-bold">Completion comments<textarea rows={2} value={closeForm.completionComments} onChange={e => setCloseForm({ ...closeForm, completionComments: e.target.value })} className="w-full border rounded-lg p-2" /></label>
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" disabled={selectedWo?.status === 'COMPLETED'} checked={closeForm.supervisorVerification} onChange={e => setCloseForm({ ...closeForm, supervisorVerification: e.target.checked })} /> Supervisor verified</label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCloseWoModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-xs"
                >
                  {selectedWo?.status === 'COMPLETED' ? 'Verify Work Order' : 'Complete Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default MaintenanceManager;
