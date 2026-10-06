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
  MoreHorizontal,
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

export function MaintenanceManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Primary Workspace Data
  const [summary, setSummary] = useState({});

  const [workOrders, setWorkOrders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Selected Work Order & Asset Drill-down State
  const [selectedWoId, setSelectedWoId] = useState(null);
  const [bottomTab, setBottomTab] = useState('HISTORY'); // HISTORY | SCHEDULED | PARTS | TIMELOGS | ATTACHMENTS | NOTES

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showCreateWoModal, setShowCreateWoModal] = useState(false);
  const [showCreateSchedModal, setShowCreateSchedModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showAddTimeLogModal, setShowAddTimeLogModal] = useState(false);
  const [showAddPartsModal, setShowAddPartsModal] = useState(false);
  const [showCloseWoModal, setShowCloseWoModal] = useState(false);

  // Modal Form States
  const [woForm, setWoForm] = useState({
    assetId: '',
    workType: 'CORRECTIVE',
    priority: 'HIGH',
    description: '',
    assignedTechnicianId: '',
    vendorName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    dueTargetDate: '',
    notes: ''
  });

  const [schedForm, setSchedForm] = useState({
    title: '',
    assetId: '',
    scheduleType: 'CALENDAR',
    frequencyMonths: 6,
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
    startTime: '09:00',
    endTime: '12:00',
    hoursWorked: 3,
    activity: '',
    remarks: ''
  });

  const [partForm, setPartForm] = useState({
    partName: '',
    partNumber: '',
    quantity: 1,
    unitCost: 150
  });

  const [closeForm, setCloseForm] = useState({
    workPerformed: '',
    failureCode: '',
    rootCause: '',
    downtimeHours: 0,
    completionComments: '',
    supervisorVerification: true
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch maintenance records linked to the Asset Register
  const loadMaintenanceData = async () => {
    try {
      const [sumRes, woRes, schRes, assRes, empRes, catRes] = await Promise.all([
        api.get('/maintenance/summary'),
        api.get('/maintenance/work-orders'),
        api.get('/maintenance/schedules'),
        api.get('/assets?limit=2000'),
        api.get('/master-data/employees').catch(() => ({ employees: [] })),
        api.get('/master-data/categories').catch(() => ({ categories: [] }))
      ]);

      if (sumRes?.success) setSummary(sumRes.summary);
      if (woRes?.success) {
        setWorkOrders(woRes.workOrders || []);
        setSelectedWoId(current => woRes.workOrders?.some(w => w.id === current) ? current : woRes.workOrders?.[0]?.id || null);
      }
      if (schRes?.success) setSchedules(schRes.schedules || []);
      if (assRes?.success) setAssets(assRes.assets || []);
      if (empRes?.success) setEmployees(empRes.employees || []);
      if (catRes?.success) setCategories(catRes.categories || []);
    } catch (err) {
      showToast('error', err.message || 'Could not load maintenance records.');
    }
  };

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  // Selected Work Order reference object
  const selectedWo = useMemo(() => {
    return workOrders.find(w => (w._id || w.id) === selectedWoId) || workOrders[0] || null;
  }, [workOrders, selectedWoId]);

  // Selected Asset reference object
  const selectedAsset = useMemo(() => {
    if (!selectedWo) return null;
    return selectedWo.asset || assets.find(a => a.id === selectedWo.assetId) || null;
  }, [selectedWo, assets]);

  // Filtering Logic
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(w => {
      const assetObj = w.asset || assets.find(a => a.id === w.assetId) || {};
      const assetNo = assetObj.assetId || '';
      const assetName = assetObj.description || '';
      const techObj = w.assignedTechnician || {};
      const techName = techObj.fullName || (typeof w.assignedTechnicianId === 'string' ? w.assignedTechnicianId : '');
      const s = searchQuery.toLowerCase().trim();

      const matchesSearch = !s || (
        (w.workOrderNumber && w.workOrderNumber.toLowerCase().includes(s)) ||
        (assetNo && assetNo.toLowerCase().includes(s)) ||
        (assetName && assetName.toLowerCase().includes(s)) ||
        (techName && techName.toLowerCase().includes(s)) ||
        (w.description && w.description.toLowerCase().includes(s))
      );

      const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter || (statusFilter === 'In Progress' && w.status === 'In Progress');
      const matchesType = typeFilter === 'ALL' || w.workType === typeFilter;
      const matchesPriority = priorityFilter === 'ALL' || w.priority === priorityFilter;

      const matchesCategory = categoryFilter === 'ALL' || assetObj.categoryId === categoryFilter;
      const matchesLocation = locationFilter === 'ALL' || assetObj.siteId === locationFilter;
      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesCategory && matchesLocation;
    });
  }, [workOrders, assets, searchQuery, statusFilter, typeFilter, categoryFilter, locationFilter, priorityFilter]);

  const totalRecords = filteredWorkOrders.length;
  const paginatedWorkOrders = useMemo(() => {
    return filteredWorkOrders;
  }, [filteredWorkOrders]);

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
      if (res.success) {
        showToast('success', `Work Order ${res.workOrder?.workOrderNumber || ''} created!`);
        setShowCreateWoModal(false);
        loadMaintenanceData();
      }
    } catch (err) {
      showToast('error', err.message || 'Could not create work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWo || !statusForm.targetStatus) return;

    setActionLoading(true);
    try {
      const targetWoId = selectedWo._id || selectedWo.id;
      const res = await api.put(`/maintenance/work-orders/${targetWoId}/status`, {
        status: statusForm.targetStatus,
        comments: statusForm.comments
      });

      if (res.success) {
        showToast('success', `Work Order status updated to ${statusForm.targetStatus}!`);
        setShowUpdateStatusModal(false);
        loadMaintenanceData();
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
      await api.post(`/maintenance/work-orders/${targetWoId}/close`, closeForm);
      showToast('success', `Work Order ${selectedWo.workOrderNumber} closed & verified!`);
      setShowCloseWoModal(false);
      loadMaintenanceData();
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
            onClick={() => setShowCreateSchedModal(true)}
            className="px-4 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-lg shadow-xs flex items-center gap-1.5 text-xs transition-all"
          >
            <Calendar className="w-4 h-4 text-[#6C2BD9]" /> Schedule Maintenance
          </button>

          <button
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg shadow-2xs text-xs flex items-center gap-1"
          >
            More <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH AND FILTERS BAR MATCHING SCREENSHOT 31 */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 items-end">
          
          {/* Search Input */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by WO No., Asset No., name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="ON_HOLD">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
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
            </select>
          </div>

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

          {/* Date Range Picker */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Date Range</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value="All dates"
                className="w-full bg-white border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] text-slate-800 font-medium cursor-pointer"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search & Clear Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 justify-end">
          <button
            onClick={() => {}}
            className="bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold py-1.5 px-4 rounded-lg shadow-xs flex items-center justify-center gap-1.5 text-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setCategoryFilter('ALL');
              setLocationFilter('ALL');
              setPriorityFilter('ALL');
            }}
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
                    <th className="p-2.5 text-center w-8">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
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
                        onClick={() => setSelectedWoId(woId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => setSelectedWoId(woId)} className="rounded border-slate-300" />
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
                          <button className="p-1 hover:bg-slate-200 rounded text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {filteredWorkOrders.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORK ORDER DETAILS PANEL MATCHING SCREENSHOT 31 */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Work Order Details</h3>
            <button 
              onClick={() => setShowUpdateStatusModal(true)}
              className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 font-bold rounded-md text-xs flex items-center gap-1 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit
            </button>
          </div>

          <div className="space-y-2 text-xs">
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
                : <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-pink-100 text-pink-700 border-pink-200 inline-block">
                  {selectedWo?.priority || "-"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-0.5 items-center">
              <span className="col-span-5 text-slate-500 font-semibold">Status</span>
              <span className="col-span-7">
                : <span className="px-2 py-0.5 rounded text-[10px] border bg-purple-100 text-purple-900 border-purple-300 font-bold inline-block">
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
              <span className="col-span-7 font-mono text-slate-800">: {formatDate(selectedWo?.scheduledDate)}</span>
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
                  onClick={() => setShowUpdateStatusModal(true)}
                  className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 text-xs"
                >
                  Update Status <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowAddTimeLogModal(true)}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Time Log
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowAddPartsModal(true)}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs"
                >
                  <Box className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Parts Used
                </button>

                <button
                  onClick={() => setShowCloseWoModal(true)}
                  className="w-full py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-[#6C2BD9] font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#6C2BD9]" /> Close Work Order
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
              onClick={() => setBottomTab('HISTORY')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'HISTORY' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Maintenance History
            </button>

            <button
              onClick={() => setBottomTab('SCHEDULED')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'SCHEDULED' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Scheduled Maintenance
            </button>

            <button
              onClick={() => setBottomTab('PARTS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'PARTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parts &amp; Consumables
            </button>

            <button
              onClick={() => setBottomTab('TIMELOGS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'TIMELOGS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Time Logs
            </button>

            <button
              onClick={() => setBottomTab('ATTACHMENTS')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                bottomTab === 'ATTACHMENTS' ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Attachments
            </button>

            <button
              onClick={() => setBottomTab('NOTES')}
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
                      <th className="p-2.5 text-right">Cost (AED)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {workOrders.filter(w => w.assetId === selectedAsset?.id).map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(h.completedDate || h.createdAt)}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">
                          {h.workOrderNumber}
                        </td>
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
                        <td className="p-2.5 text-center">
                          <button className="p-1 text-slate-500 hover:text-slate-900">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {workOrders.filter(w => w.assetId === selectedAsset?.id).length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          )}

          {bottomTab === 'SCHEDULED' && <div className="space-y-2">{schedules.filter(item => item.assetId === selectedAsset?.id).map(item => <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between"><span>{item.title}</span><span>Due {formatDate(item.nextDueDate)} · Every {item.frequencyMonths} months</span></div>)}{!schedules.some(item => item.assetId === selectedAsset?.id) && <p className="text-slate-500">No scheduled maintenance for this asset.</p>}</div>}
          {bottomTab === 'PARTS' && <div className="space-y-2">{(selectedWo?.partsUsed || []).map(part => <div key={part.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between"><span>{part.partName}</span><span>{part.quantity} × {Number(part.unitCost || 0).toLocaleString()} AED</span></div>)}{!selectedWo?.partsUsed?.length && <p className="text-slate-500">No parts recorded.</p>}</div>}
          {bottomTab === 'TIMELOGS' && <div className="space-y-2">{(selectedWo?.timeLogs || []).map(log => <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">{log.technician || 'Technician'} · {Number(log.hoursWorked || 0)} hours · {formatDate(log.workDate)}</div>)}{!selectedWo?.timeLogs?.length && <p className="text-slate-500">No time logs recorded.</p>}</div>}
          {bottomTab === 'ATTACHMENTS' && <div className="p-4 text-slate-500 text-xs">{selectedWo?.photoUrls || 'No attachments recorded.'}</div>}
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

            <form onSubmit={handleCreateWoSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Asset</label>
                <select required value={woForm.assetId} onChange={e => setWoForm({ ...woForm, assetId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium">
                  <option value="">Select an asset</option>
                  {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.assetId} - {asset.description}</option>)}
                </select>
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
                  className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-lg hover:bg-[#5B21B6] shadow-xs"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

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
              <h3 className="text-sm font-bold text-slate-900">Close Work Order - {selectedWo?.workOrderNumber || ""}</h3>
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
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-xs"
                >
                  Close &amp; Move to History
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
