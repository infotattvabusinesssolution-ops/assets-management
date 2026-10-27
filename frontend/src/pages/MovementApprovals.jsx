import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Check,
  X,
  RotateCcw,
  FileText,
  Paperclip,
  Upload,
  Calendar,
  Building,
  User,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Bell,
  Trash2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

export function MovementApprovals() {
  const navigate = useNavigate();

  // Requests and KPIs state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    overdueRequests: 0
  });

  // Selected Request for Right Split Panel
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('details'); // 'details' | 'assets' | 'workflow' | 'history'

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter Bar state
  const [filterRequestType, setFilterRequestType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [filterRequestedBy, setFilterRequestedBy] = useState('All Users');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterOptions, setFilterOptions] = useState({ sites: [], departments: [], requestedBy: [], requestTypes: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  // Quick comments input on the right details pane
  const [quickComments, setQuickComments] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Row context menu state
  const [activeDropdownRowId, setActiveDropdownRowId] = useState(null);
  const dropdownRef = useRef(null);

  // Bulk Actions dropdown state
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const bulkRef = useRef(null);

  // -------------------------------------------------------------
  // APPROVAL ACTIONS MODAL WINDOW STATE (Image 2)
  // -------------------------------------------------------------
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState('APPROVE'); // 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'
  const [modalComments, setModalComments] = useState('');
  const [commentError, setCommentError] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [notifyRequester, setNotifyRequester] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownRowId(null);
      }
      if (bulkRef.current && !bulkRef.current.contains(event.target)) {
        setIsBulkDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch KPIs
  const fetchKpis = async () => {
    try {
      const res = await api.get('/movement-approvals/kpis');
      if (res && res.data) {
        setKpis(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Could not load approval totals.', 'error');
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus,
        requestType: filterRequestType,
        site: filterSite,
        department: filterDepartment,
        requestedBy: filterRequestedBy,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchQuery || undefined
      };

      const res = await api.get('/movement-approvals', { params });
      if (res && res.requests) {
        setRequests(res.requests);
        setTotalRecords(res.pagination?.totalRecords || res.requests.length);
        setFilterOptions(res.filters || { sites: [], departments: [], requestedBy: [], requestTypes: [] });
        setSelectedRequest(previous => res.requests.find(request => request.id === previous?.id) || res.requests[0] || null);
        setSelectedIds(new Set());
      }
    } catch (err) {
      setRequests([]);
      setTotalRecords(0);
      setSelectedRequest(null);
      showToast(err.message || 'Could not load movement approvals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, itemsPerPage, filterStatus, filterRequestType, filterSite, filterDepartment, filterRequestedBy, dateFrom, dateTo]);

  // Handle Search Trigger
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (currentPage === 1) fetchRequests();
    else setCurrentPage(1);
  };

  // Clear Filters
  const handleClearFilters = () => {
    setFilterRequestType('All');
    setFilterStatus('Pending');
    setFilterSite('All Sites');
    setFilterDepartment('All Departments');
    setFilterRequestedBy('All Users');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
    showToast('Filters reset to default view', 'info');
  };

  // Checkbox Selection
  const handleSelectAll = () => {
    const pendingIds = requests.filter(request => request.status === 'Pending').map(request => request.id);
    if (pendingIds.length && pendingIds.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingIds));
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Open the Action Modal (Image 2)
  const openActionModal = (request, initialDecision = 'APPROVE') => {
    setModalRequest(request);
    setSelectedDecision(initialDecision);
    setModalComments(quickComments || '');
    setCommentError('');
    setAttachedFiles([]);
    setNotifyRequester(true);
    setIsActionModalOpen(true);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    if (!files.length) return;
    if (files.some(file => file.size > 10 * 1024 * 1024 || !/\.(jpg|jpeg|png|pdf)$/i.test(file.name))) {
      showToast('Use JPG, PNG or PDF files under 10 MB each.', 'error');
      return;
    }
    setUploadingFiles(true);
    try {
      const form = new FormData();
      files.forEach(file => form.append('files', file));
      form.append('folder', 'movement_approvals');
      const result = await api.post('/uploads/files', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!result.success || !Array.isArray(result.files)) throw new Error('Files were not uploaded.');
      setAttachedFiles(previous => [...previous, ...result.files.map(file => ({
        id: file.public_id, name: file.name, size: file.size, formattedSize: file.formattedSize,
        url: file.url, publicId: file.public_id, type: file.format
      }))]);
      showToast(`${result.files.length} document(s) uploaded.`);
    } catch (error) { showToast(error.message || 'Could not upload files.', 'error'); }
    finally { setUploadingFiles(false); }
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Submit Decision from Modal
  const handleSubmitDecision = async () => {
    // Validate mandatory comments on REJECT and REQUEST_CHANGES
    if (['REJECT', 'REQUEST_CHANGES'].includes(selectedDecision)) {
      if (!modalComments.trim()) {
        setCommentError('Comments are mandatory when rejecting or requesting changes.');
        return;
      }
    }
    setCommentError('');
    setIsSubmitting(true);

    try {
      const payload = {
        decision: selectedDecision,
        comments: modalComments,
        attachments: attachedFiles,
        notifyRequester
      };

      const res = await api.post(`/movement-approvals/${modalRequest.id}/decision`, payload);

      const decisionWord = selectedDecision === 'APPROVE' ? 'approved' : selectedDecision === 'REJECT' ? 'rejected' : 'returned for changes';
      showToast(`Request ${modalRequest.requestNumber} successfully ${decisionWord}!`);
      setIsActionModalOpen(false);
      setQuickComments('');

      // Refresh list and KPIs immediately
      await Promise.all([fetchRequests(), fetchKpis()]);

      // Update selectedRequest details if currently viewed
      if (selectedRequest?.id === modalRequest.id && res.request && filterStatus !== 'Pending') setSelectedRequest(res.request);
    } catch (err) {
      showToast(err.message || 'Error processing approval decision', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Decision execution
  const handleBulkDecision = async (decision) => {
    if (selectedIds.size === 0) {
      showToast('Please select at least one request to process.', 'error');
      return;
    }
    const decisionName = decision === 'APPROVE' ? 'Approve' : 'Reject';
    const comments = prompt(`Enter comments for bulk ${decisionName} of ${selectedIds.size} requests:`, '');
    if (decision === 'REJECT' && (!comments || !comments.trim())) {
      showToast('Comments are required for rejections.', 'error');
      return;
    }

    try {
      const res = await api.post('/movement-approvals/bulk-decision', {
        requestIds: Array.from(selectedIds),
        decision,
        comments
      });
      showToast(`${res.processed} processed${res.failed ? `; ${res.failed} failed: ${res.results.filter(result => !result.success).map(result => result.error).join('; ')}` : ''}.`, res.failed ? 'error' : 'success');
      setIsBulkDropdownOpen(false);
      setSelectedIds(new Set());
      await Promise.all([fetchRequests(), fetchKpis()]);
    } catch (err) {
      showToast(err.message || 'Bulk processing failed', 'error');
    }
  };

  // Export handler
  const handleExport = async () => {
    try {
      const blob = await api.post('/movement-approvals/export', {
        status: filterStatus, requestType: filterRequestType, site: filterSite,
        department: filterDepartment, requestedBy: filterRequestedBy,
        dateFrom, dateTo, search: searchQuery
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Movement_Approvals_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Movement approvals CSV downloaded.');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div className="p-6 max-w-[1680px] mx-auto space-y-6 select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={clsx(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce",
            toastMessage.type === 'error'
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : toastMessage.type === 'info'
              ? "bg-purple-50 text-purple-900 border-purple-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          )}
        >
          {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{toastMessage.msg}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumbs (Image 1) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <button
              onClick={() => navigate('/movements')}
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span>Assignment & Movement</span>
            </button>
            <span>&gt;</span>
            <span className="text-slate-900 font-bold">Movement Approvals</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Movement Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve asset assignment and transfer requests
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-medium">
            <button
              onClick={() => navigate('/movements/transfer')}
              className="px-3.5 py-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-all font-medium"
            >
              Transfer Form
            </button>
            <button
              className="px-3.5 py-1.5 rounded-md flex items-center gap-1.5 bg-[#6C2BD9] text-white shadow-sm font-semibold transition-all"
            >
              Movement Approvals
              {kpis.pendingApprovals > 0 && (
                <span className="bg-amber-400 text-gray-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {kpis.pendingApprovals}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/movements/transfer?tab=transit')}
              className="px-3.5 py-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-all font-medium"
            >
              Dispatch & In-Transit
            </button>
            <button
              onClick={() => navigate('/movements/history')}
              className="px-3.5 py-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-all font-medium"
            >
              Movement History
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export
          </button>

          {/* Bulk Actions Dropdown */}
          <div className="relative inline-block text-left" ref={bulkRef}>
            <button
              onClick={() => setIsBulkDropdownOpen(!isBulkDropdownOpen)}
              className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs shadow-purple-200"
            >
              Bulk Actions ▾
            </button>

            {isBulkDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-slate-700">
                <button
                  onClick={() => handleBulkDecision('APPROVE')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600 font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Selected ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkDecision('REJECT')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Selected ({selectedIds.size})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4 hover:border-purple-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6C2BD9]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis.pendingApprovals}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Pending Approvals</p>
          </div>
        </div>

        {/* Card 2: Approved (This Month) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis.approvedThisMonth}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Approved (This Month)</p>
          </div>
        </div>

        {/* Card 3: Rejected (This Month) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4 hover:border-rose-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis.rejectedThisMonth}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Rejected (This Month)</p>
          </div>
        </div>

        {/* Card 4: Overdue Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4 hover:border-purple-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6C2BD9]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis.overdueRequests}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Overdue Requests</p>
          </div>
        </div>
      </div>

      {/* Filter Bar (Image 1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Request Type</label>
            <select
              value={filterRequestType}
              onChange={(e) => setFilterRequestType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All">All</option>
              {filterOptions.requestTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="Pending">Pending</option>
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Sites">All Sites</option>
              {filterOptions.sites.map(site => <option key={site} value={site}>{site}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Departments">All Departments</option>
              {filterOptions.departments.map(department => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Requested By</label>
            <select
              value={filterRequestedBy}
              onChange={(e) => setFilterRequestedBy(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="All Users">All Users</option>
              {filterOptions.requestedBy.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Date Range</label>
            <div className="flex gap-1">
              <input aria-label="From date" type="date" value={dateFrom} max={dateTo || undefined}
                onChange={e => setDateFrom(e.target.value)}
                className="w-1/2 min-w-0 px-1 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px]" />
              <input aria-label="To date" type="date" value={dateTo} min={dateFrom || undefined}
                onChange={e => setDateTo(e.target.value)}
                className="w-1/2 min-w-0 px-1 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px]" />
            </div>
          </div>
        </div>

        {/* Row 2: Search input + Search & Clear buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Request ID, Asset No, Asset Name, Requested By..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSearch}
              className="px-5 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>

            <button
              onClick={handleClearFilters}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-View Section: Left Grid (8 cols) + Right Details Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Approval Requests Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Approval Requests ({totalRecords})
            </h2>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={requests.some(request => request.status === 'Pending') && requests.filter(request => request.status === 'Pending').every(request => selectedIds.has(request.id))}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                  </th>
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Request Type</th>
                  <th className="py-3 px-3">Asset No</th>
                  <th className="py-3 px-3">Asset Name</th>
                  <th className="py-3 px-3">From Location</th>
                  <th className="py-3 px-3">To Location</th>
                  <th className="py-3 px-3">Requested By</th>
                  <th className="py-3 px-3">Request Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-500 font-medium">
                      Loading movement approval requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-500 font-medium">
                      No approval requests match your search criteria.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => {
                    const isSelected = selectedRequest?.id === r.id;
                    const isChecked = selectedIds.has(r.id);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRequest(r)}
                        className={clsx(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-purple-50/70 font-medium" : "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={r.status !== 'Pending'}
                            onChange={(e) => handleToggleSelect(r.id, e)}
                            className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#6C2BD9]">
                          {r.requestNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {r.requestType}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {r.assetNo}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {r.assetName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {r.fromLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {r.toLocation}
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">
                          {r.requestedBy}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {r.requestDate}
                        </td>
                        <td className="py-3 px-3">
                          <span className={clsx(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold",
                            r.status === 'Pending' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            r.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            r.status === 'Rejected' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-purple-50 text-purple-700 border border-purple-200"
                          )}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveDropdownRowId(activeDropdownRowId === r.id ? null : r.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdownRowId === r.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs font-semibold text-slate-700"
                              >
                                <button
                                  onClick={() => {
                                    setSelectedRequest(r);
                                    setActiveDetailTab('details');
                                    setActiveDropdownRowId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  View Details
                                </button>
                                {r.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        openActionModal(r, 'APPROVE');
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600 font-bold"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        openActionModal(r, 'REJECT');
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-bold"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => {
                                        openActionModal(r, 'REQUEST_CHANGES');
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-purple-600 font-bold"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      Request Changes
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Scroll Down Summary */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
            <span className="font-medium text-slate-600">Showing {requests.length} of {totalRecords} records</span>
            <div className="flex items-center gap-2">
              <select aria-label="Rows per page" value={itemsPerPage} onChange={event => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="border border-slate-200 rounded p-1">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(page => page - 1)} className="disabled:opacity-40">Previous</button>
              <span>{currentPage} / {totalPages}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(page => page + 1)} className="disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Request Details Split Panel (4 cols - Image 1) */}
        {selectedRequest && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Request Details
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {selectedRequest.requestDate} {selectedRequest.requestTime}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedRequest.requestNumber}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedRequest.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedRequest.requestType} Request
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Tabs: Details, Assets (1), Workflow, History */}
            <div className="px-4 pt-2 border-b border-slate-200 flex items-center gap-1 bg-slate-50/50">
              {[
                { id: 'details', label: 'Details' },
                { id: 'assets', label: `Assets (${selectedRequest.assets?.length || 1})` },
                { id: 'workflow', label: 'Workflow' },
                { id: 'history', label: 'History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={clsx(
                    "px-3 py-2 text-xs font-bold transition-colors border-b-2",
                    activeDetailTab === tab.id
                      ? "border-[#6C2BD9] text-[#6C2BD9]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 text-xs space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
              {/* TAB 1: DETAILS */}
              {activeDetailTab === 'details' && (
                <>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2">Transfer Information</h4>
                    <div className="space-y-1.5 text-slate-700 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Transfer Type</span>
                        <span className="font-medium text-slate-900">{selectedRequest.transferType || 'Location Transfer'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Reason</span>
                        <span className="font-medium text-slate-900">{selectedRequest.reason || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Effective Date</span>
                        <span className="font-medium text-slate-900">{selectedRequest.effectiveDate || selectedRequest.requestDate}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Requested By</span>
                        <span className="font-medium text-slate-900">{selectedRequest.requestedBy} ({selectedRequest.department})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">From Location</span>
                        <span className="font-medium text-slate-900 text-right">{selectedRequest.fromLocationFull || selectedRequest.fromLocation}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">To Location</span>
                        <span className="font-medium text-slate-900 text-right">{selectedRequest.toLocationFull || selectedRequest.toLocation}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">New Custodian</span>
                        <span className="font-medium text-slate-900">{selectedRequest.newCustodian || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Department</span>
                        <span className="font-medium text-slate-900">{selectedRequest.department}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 block">Remarks</span>
                        <span className="font-medium text-slate-800 mt-0.5 block">{selectedRequest.remarks || 'No additional remarks.'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Documents Section */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2">Supporting Documents</h4>
                    <div className="space-y-1.5">
                      {selectedRequest.supportingDocuments?.length > 0 ? (
                        selectedRequest.supportingDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-rose-600" />
                              <span className="font-semibold text-slate-800 truncate max-w-[160px]">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-mono">{doc.size}</span>
                              <button
                                onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No attachments provided.</p>
                      )}
                    </div>
                  </div>

                  {/* Approval Actions Section (Image 1) */}
                  {selectedRequest.status === 'Pending' && <div className="pt-2 border-t border-slate-200">
                    <h4 className="font-bold text-slate-900 text-xs mb-2">Approval Actions</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => openActionModal(selectedRequest, 'APPROVE')}
                        className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => openActionModal(selectedRequest, 'REJECT')}
                        className="py-2 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => openActionModal(selectedRequest, 'REQUEST_CHANGES')}
                        className="py-2 px-2 bg-white hover:bg-purple-50 text-[#6C2BD9] border border-purple-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Request Changes
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-500 text-xs font-medium">Comments (Optional)</label>
                        <span className="text-[10px] text-slate-400 font-mono">{quickComments.length}/500</span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Enter comments..."
                        maxLength={500}
                        value={quickComments}
                        onChange={(e) => setQuickComments(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#6C2BD9] focus:bg-white resize-none"
                      />
                    </div>
                  </div>}
                  {selectedRequest.status === 'Changes Requested' && (
                    <button type="button"
                      onClick={() => navigate(`/movements/transfer?assetId=${encodeURIComponent(selectedRequest.assetNo)}`)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-50 text-[#6C2BD9] border border-purple-200 font-bold">
                      Create revised transfer request
                    </button>
                  )}
                </>
              )}

              {/* TAB 2: ASSETS (1) */}
              {activeDetailTab === 'assets' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Included Physical Assets</h4>
                  {selectedRequest.assets?.map((ast, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ast.name}</span>
                        <span className="font-mono text-[11px] text-[#6C2BD9] font-bold">{ast.assetNo}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div><strong>Category:</strong> {ast.category}</div>
                        <div><strong>Model:</strong> {ast.manufacturer} {ast.model}</div>
                        <div><strong>Serial:</strong> <span className="font-mono">{ast.serialNumber}</span></div>
                        <div><strong>Condition:</strong> {ast.condition}</div>
                        <div><strong>Current Location:</strong> {ast.currentLocation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: WORKFLOW */}
              {activeDetailTab === 'workflow' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs">Approval Workflow</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    {selectedRequest.workflowStages?.map((stage, idx) => (
                      <div key={idx} className="relative flex items-start gap-3 text-xs">
                        <div className={clsx(
                          "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10",
                          stage.status === 'Approved' ? "bg-emerald-600 text-white" :
                          stage.isCurrent ? "bg-[#6C2BD9] text-white ring-4 ring-purple-100" :
                          stage.status === 'Rejected' ? "bg-rose-600 text-white" :
                          "bg-slate-200 text-slate-600"
                        )}>
                          {stage.status === 'Approved' ? <Check className="w-3.5 h-3.5" /> : stage.level}
                        </div>
                        <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{stage.title}</span>
                            <span className={clsx(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded",
                              stage.status === 'Approved' ? "bg-emerald-100 text-emerald-800" :
                              stage.isCurrent ? "bg-purple-100 text-[#6C2BD9]" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {stage.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{stage.approverName}</p>
                          {stage.actionDate && (
                            <p className="text-[10px] text-slate-400 font-mono mt-1">{stage.actionDate}</p>
                          )}
                          {stage.comments && (
                            <p className="text-[11px] text-slate-700 italic mt-1 bg-white p-1.5 rounded border border-slate-100">
                              "{stage.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: HISTORY */}
              {activeDetailTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Audit Trail & Movement Timeline</h4>
                  <div className="space-y-2">
                    {selectedRequest.history?.map((h, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{h.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">By: {h.performedBy} ({h.role || 'User'})</p>
                        {h.comments && <p className="text-slate-800 italic">"{h.comments}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* APPROVAL ACTIONS MODAL WINDOW (IMAGE 2)                                  */}
      {/* ========================================================================= */}
      {isActionModalOpen && modalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-base font-bold text-slate-900">Approval Actions</h2>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Request Summary Banner (Image 2) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{modalRequest.requestNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {modalRequest.requestType} Request
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <p className="text-slate-500 font-medium">Requested By</p>
                  <p className="font-bold text-slate-900">{modalRequest.requestedBy}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {modalRequest.department} • {modalRequest.requestDate} {modalRequest.requestTime}
                  </p>
                </div>
              </div>

              {/* Approval Decision Selection (Radio Cards - Image 2) */}
              <div>
                <label className="font-bold text-slate-900 block mb-2">
                  Approval Decision <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Option 1: Approve */}
                  <label
                    onClick={() => setSelectedDecision('APPROVE')}
                    className={clsx(
                      "p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between",
                      selectedDecision === 'APPROVE'
                        ? "bg-purple-50/70 border-[#6C2BD9] ring-2 ring-purple-100"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={selectedDecision === 'APPROVE'}
                        onChange={() => setSelectedDecision('APPROVE')}
                        className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Approve</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Process this request</span>
                    </div>
                  </label>

                  {/* Option 2: Reject */}
                  <label
                    onClick={() => setSelectedDecision('REJECT')}
                    className={clsx(
                      "p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between",
                      selectedDecision === 'REJECT'
                        ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-100"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <X className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={selectedDecision === 'REJECT'}
                        onChange={() => setSelectedDecision('REJECT')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Reject</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Reject this request</span>
                    </div>
                  </label>

                  {/* Option 3: Request Changes */}
                  <label
                    onClick={() => setSelectedDecision('REQUEST_CHANGES')}
                    className={clsx(
                      "p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between",
                      selectedDecision === 'REQUEST_CHANGES'
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-100"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="radio"
                        name="decision"
                        checked={selectedDecision === 'REQUEST_CHANGES'}
                        onChange={() => setSelectedDecision('REQUEST_CHANGES')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Request Changes</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Return to requester</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Comments Field (Image 2) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-900">
                    Comments {selectedDecision !== 'APPROVE' && <span className="text-rose-500">*</span>}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{modalComments.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Enter your comments, remarks or approval notes..."
                  maxLength={500}
                  value={modalComments}
                  onChange={(e) => {
                    setModalComments(e.target.value);
                    if (commentError) setCommentError('');
                  }}
                  className={clsx(
                    "w-full p-3 bg-white border rounded-2xl text-xs focus:outline-none focus:bg-white resize-none transition-all",
                    commentError ? "border-rose-400 focus:border-rose-500 ring-2 ring-rose-100" : "border-slate-200 focus:border-[#6C2BD9]"
                  )}
                />
                {commentError && (
                  <p className="text-rose-600 font-semibold text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {commentError}
                  </p>
                )}
                {selectedDecision !== 'APPROVE' && !commentError && (
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    * Comments are required so the requester understands the reason.
                  </p>
                )}
              </div>

              {/* Attach Supporting Documents (Image 2) */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Attach Supporting Documents (Optional)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-purple-50/30 hover:border-purple-300 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative"
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mb-1.5">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-800 text-xs">
                    Drag and drop files here or <span className="text-[#6C2BD9] underline">click to browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supported files: JPG, PNG, PDF (Max 10 MB each)
                  </p>
                </div>

                {/* Attached files list */}
                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {attachedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 bg-purple-50/60 rounded-xl border border-purple-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-[#6C2BD9]" />
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">{f.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({f.formattedSize})</span>
                        </div>
                        <button
                          onClick={() => removeAttachedFile(f.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notify Users (Image 2) */}
              <div>
                <label className="font-bold text-slate-900 flex items-center gap-1 mb-2">
                  Notification (Optional) <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyRequester}
                      onChange={(e) => setNotifyRequester(e.target.checked)}
                      className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                    <span className="font-semibold text-slate-700">
                      Notify requester ({modalRequest.requestedBy})
                    </span>
                  </label>

                </div>
              </div>
            </div>

            {/* Modal Footer (Image 2) */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting || uploadingFiles}
                onClick={handleSubmitDecision}
                className={clsx(
                  "px-6 py-2.5 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5",
                  selectedDecision === 'REJECT'
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    : selectedDecision === 'REQUEST_CHANGES'
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-[#6C2BD9] hover:bg-[#5b21b6] shadow-purple-200"
                )}
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MovementApprovals;
