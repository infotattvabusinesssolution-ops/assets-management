import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Copy,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Shield,
  Layers,
  Users
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { SmartDeleteModal } from './SmartDeleteModal';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';
import { deduplicateCustodians } from './custodianUtils';

export function CustodiansTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  activeRowMenuId: propActiveRowMenuId,
  setActiveRowMenuId: propSetActiveRowMenuId
}) {
  const [localActiveRowMenuId, setLocalActiveRowMenuId] = useState(null);
  const activeRowMenuId = propActiveRowMenuId !== undefined ? propActiveRowMenuId : localActiveRowMenuId;
  const setActiveRowMenuId = propSetActiveRowMenuId || setLocalActiveRowMenuId;

  const [custodians, setCustodians] = useState([]);
  const [selectedCustodian, setSelectedCustodian] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [custodianToDelete, setCustodianToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [smartDeleteState, setSmartDeleteState] = useState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Internal' | 'External'
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  // Master Data Options
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustodian, setEditingCustodian] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    custodianType: 'Internal', // 'Internal' | 'External'
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    companyId: '',
    departmentId: '',
    section: '',
    location: '',
    organization: '',
    status: 'Active'
  });

  const loadCustodians = async () => {
    setIsLoading(true);
    try {
      const [empRes, compRes, deptRes] = await Promise.all([
        api.get('/master-data/employees?includeInactive=true').catch(() => null),
        api.get('/master-data/companies?includeInactive=true').catch(() => null),
        api.get('/master-data/departments').catch(() => null)
      ]);

      if (compRes?.companies) setCompanies(compRes.companies);
      if (deptRes?.departments) setDepartments(deptRes.departments);

      const customCustodians = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      const serverCustodians = Array.isArray(empRes?.employees) ? empRes.employees : [];
      const merged = deduplicateCustodians(serverCustodians, customCustodians);
      setCustodians(merged);
      setSelectedCustodian(merged[0] || null);
    } catch (err) {
      console.warn('Failed to load custodians:', err);
      const customCustodians = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      const deduped = deduplicateCustodians(customCustodians);
      setCustodians(deduped);
      setSelectedCustodian(deduped[0] || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustodians();
  }, []);

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const getDepartmentName = (c) => {
    if (!c) return '-';
    if (typeof c.department === 'string' && c.department.trim()) return c.department.trim();
    if (c.department?.name && typeof c.department.name === 'string' && c.department.name.trim()) return c.department.name.trim();
    if (c.departmentName && typeof c.departmentName === 'string') return c.departmentName.trim();
    if (c.departmentId) {
      const found = departments.find(d => d.id === c.departmentId || d.code === c.departmentId);
      if (found?.name) return found.name;
    }
    return '-';
  };

  const filteredCustodians = useMemo(() => {
    return custodians.filter(c => {
      const type = c.custodianType || (c.employeeCode?.startsWith('EXT') ? 'External' : 'Internal');
      const deptName = getDepartmentName(c);
      const matchesSearch = !searchQuery ||
        (c.employeeCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        deptName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All' || type.toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && c.active !== false) ||
        (statusFilter === 'Inactive' && c.active === false);

      const matchesCompany = companyFilter === 'All' ||
        c.companyId === companyFilter ||
        (c.company?.name || '').toLowerCase() === companyFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus && matchesCompany;
    });
  }, [custodians, searchQuery, typeFilter, statusFilter, companyFilter, departments]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedCustodians,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredCustodians, 10);

  const handleOpenAddModal = (custToEdit = null) => {
    setModalError('');
    if (custToEdit) {
      setEditingCustodian(custToEdit);
      setFormState({
        custodianType: custToEdit.custodianType || (custToEdit.employeeCode?.startsWith('EXT') ? 'External' : 'Internal'),
        employeeCode: custToEdit.employeeCode || '',
        fullName: custToEdit.fullName || '',
        email: custToEdit.email || '',
        phone: custToEdit.phone || '',
        companyId: custToEdit.companyId || (companies[0]?.id || ''),
        departmentId: custToEdit.departmentId || '',
        section: custToEdit.section || '',
        location: custToEdit.location || '',
        organization: custToEdit.organization || '',
        status: custToEdit.active === false ? 'Inactive' : 'Active'
      });
    } else {
      setEditingCustodian(null);
      setFormState({
        custodianType: 'Internal',
        employeeCode: `EMP-${1000 + custodians.length + 1}`,
        fullName: '',
        email: '',
        phone: '',
        companyId: companies[0]?.id || '',
        departmentId: '',
        section: '',
        location: '',
        organization: '',
        status: 'Active'
      });
    }
    setShowAddModal(true);
  };

  const handleDuplicateCustodian = (c) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    setEditingCustodian(null);
    const isExternal = (c.custodianType === 'External') || (c.employeeCode?.startsWith('EXT'));
    setFormState({
      custodianType: isExternal ? 'External' : 'Internal',
      employeeCode: `${c.employeeCode || c.code || 'EMP'}-COPY`,
      fullName: `${c.fullName || ''} (Copy)`,
      email: c.email ? `copy.${c.email}` : '',
      phone: c.phone || '',
      companyId: c.companyId || (companies[0]?.id || ''),
      departmentId: c.departmentId || '',
      section: c.section || '',
      location: c.location || '',
      organization: c.organization || '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleSaveCustodian = async (e) => {
    e.preventDefault();
    if (!formState.fullName.trim()) {
      setModalError('Custodian Full Name is required.');
      return;
    }
    if (!formState.email.trim()) {
      setModalError('Valid Email address is required.');
      return;
    }

    setIsSaving(true);
    setModalError('');

    const cleanCode = formState.employeeCode.trim().toUpperCase();
    const cleanName = formState.fullName.trim();
    const cleanEmail = formState.email.trim();

    if (cleanCode) {
      const dupCode = custodians.find(c => (c.employeeCode || c.code || '').trim().toUpperCase() === cleanCode && (!editingCustodian || c.id !== editingCustodian.id));
      if (dupCode) {
        const msg = `Custodian code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }

    if (cleanEmail) {
      const dupEmail = custodians.find(c => (c.email || '').trim().toLowerCase() === cleanEmail.toLowerCase() && (!editingCustodian || c.id !== editingCustodian.id));
      if (dupEmail) {
        const msg = `Custodian email "${cleanEmail}" already exists. Duplicate emails are not allowed.`;
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }

    try {
      const selectedComp = companies.find(c => c.id === formState.companyId);
      const selectedDept = departments.find(d => d.id === formState.departmentId);

      const payload = {
        fullName: cleanName,
        email: cleanEmail,
        phone: formState.phone.trim(),
        custodianType: formState.custodianType,
        companyId: formState.companyId,
        company: selectedComp ? { name: selectedComp.name } : undefined,
        departmentId: formState.departmentId || undefined,
        department: selectedDept ? { name: selectedDept.name } : undefined,
        section: formState.section.trim(),
        location: formState.location.trim(),
        organization: formState.custodianType === 'External' ? formState.organization.trim() : '',
        active: formState.status === 'Active'
      };
      if (cleanCode) payload.employeeCode = cleanCode;

      if (editingCustodian) {
        const res = await api.put(`/master-data/employees/${editingCustodian.id}`, payload);
        const updated = res?.employee || { ...editingCustodian, ...payload };
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
          localStorage.setItem('fams_custom_custodians', JSON.stringify(custom.map(c => c.id === editingCustodian.id ? updated : c)));
        } catch (_) {}
        const list = custodians.map(c => c.id === editingCustodian.id ? updated : c);
        setCustodians(list);
        if (selectedCustodian?.id === editingCustodian.id) setSelectedCustodian(updated);
        triggerToast && triggerToast(`Custodian "${updated.fullName}" updated successfully.`);
      } else {
        const res = await api.post('/master-data/employees', payload);
        const newCust = res?.employee || { ...payload, id: `cust-${Date.now()}` };
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
          localStorage.setItem('fams_custom_custodians', JSON.stringify([newCust, ...custom]));
        } catch (_) {}
        const list = [newCust, ...custodians];
        setCustodians(list);
        setSelectedCustodian(newCust);
        triggerToast && triggerToast(`Custodian "${newCust.fullName}" registered successfully.`);
      }
      setShowAddModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save custodian.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (cust, e) => {
    e?.stopPropagation();
    const nextStatus = cust.active === false ? true : false;
    try {
      await api.put(`/master-data/employees/${cust.id}`, { active: nextStatus });
      const list = custodians.map(c => c.id === cust.id ? { ...c, active: nextStatus } : c);
      setCustodians(list);
      if (selectedCustodian?.id === cust.id) setSelectedCustodian({ ...selectedCustodian, active: nextStatus });
      triggerToast && triggerToast(`Custodian "${cust.fullName}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch {
      triggerToast && triggerToast('Failed to update custodian status.');
    }
  };

  const handleInitiateDeleteCustodian = async (cust) => {
    if (!window.confirm(`Are you sure you want to delete Custodian "${cust.fullName}" (${cust.employeeCode || cust.id})?`)) return;

    setIsDeleting(true);

    // Clean up from browser localStorage immediately so it never resurrects
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      const filtered = custom.filter(c => c.id !== cust.id && c.employeeCode !== cust.employeeCode);
      localStorage.setItem('fams_custom_custodians', JSON.stringify(filtered));
    } catch (_) {}

    try {
      const res = await api.delete(`/master-data/employees/${cust.id}`);
      if (res?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: cust,
          linkedCount: res.linkedCount || 0,
          details: res.details || null,
          isProcessing: false
        });
        return;
      }
      await loadCustodians();
      triggerToast && triggerToast(res?.message || `Custodian "${cust.fullName}" deleted successfully.`);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: cust,
          linkedCount: data.linkedCount || 0,
          details: data.details || null,
          isProcessing: false
        });
        return;
      }
      // If server returned 404/500 (e.g. record only existed in local cache), remove from UI state
      setCustodians(prev => prev.filter(c => c.id !== cust.id));
      if (selectedCustodian?.id === cust.id) setSelectedCustodian(null);
      triggerToast && triggerToast(`Custodian "${cust.fullName}" removed.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSmartDeactivateCustodian = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(`/master-data/employees/${smartDeleteState.item.id}?action=deactivate`);
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      triggerToast && triggerToast(res?.message || 'Custodian deactivated successfully.');
      await loadCustodians();
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to deactivate custodian.');
    }
  };

  const handleSmartForceDeleteCustodian = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(`/master-data/employees/${smartDeleteState.item.id}?action=force_delete`);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
        localStorage.setItem('fams_custom_custodians', JSON.stringify(custom.filter(c => c.id !== smartDeleteState.item.id)));
      } catch (_) {}
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      triggerToast && triggerToast(res?.message || 'Custodian and assignments unlinked, permanently deleted from database.');
      await loadCustodians();
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to force delete custodian.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search custodians by code, name, email, or third-party organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-44 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Internal">Internal (Employee)</option>
              <option value="External">External (Contractor)</option>
            </select>
          </div>

          <div className="w-full md:w-36 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Custodians Table & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Custodians Table (2 cols) */}
        <div className={`${filteredCustodians.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col transition-all duration-200`}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100/60 text-[#6C2BD9] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Custodian Master Registry</h3>
                <p className="text-[10px] text-slate-400 font-medium">Internal employees & third-party external holders who possess or manage physical assets</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#6C2BD9] bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full">
              {filteredCustodians.length} Records
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#6C2BD9]" />
              <p className="text-xs font-semibold">Loading custodians...</p>
            </div>
          ) : filteredCustodians.length === 0 ? (
            <MasterEmptyState
              isTable={false}
              icon={UserCheck}
              title="No Custodians found"
              subtitle={searchQuery ? "No custodians match your search criteria." : "Get started by defining your first asset custodian."}
              actionLabel="Add Custodian"
              onAction={() => handleOpenAddModal(null)}
            />
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-2 text-center">#</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Custodian Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Department / Org</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedCustodians.map((c, index) => {
                    const isSelected = selectedCustodian?.id === c.id;
                    const isExternal = (c.custodianType === 'External') || (c.employeeCode?.startsWith('EXT'));
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustodian(c)}
                        className={clsx(
                          'hover:bg-purple-50/40 cursor-pointer transition-colors group',
                          isSelected && 'bg-purple-50/70 font-semibold'
                        )}
                      >
                        <td className="py-3 px-2 text-center text-slate-400 text-[11px] font-medium">{startIndex + index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#6C2BD9] bg-purple-100/70 px-2 py-0.5 rounded-md">
                            {c.employeeCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#6C2BD9] transition-colors leading-snug">
                            {c.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            isExternal
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          )}>
                            {isExternal ? 'External' : 'Internal'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px] font-medium text-slate-700">
                            {isExternal ? (c.organization || '-') : getDepartmentName(c)}
                          </div>
                          {c.section && (
                            <div className="text-[10px] text-slate-400">
                              {c.section}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(c, e)}
                            className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold transition-all',
                              c.active !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            )}
                          >
                            {c.active !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(c)}
                              title="Edit Custodian"
                              className="p-1 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100/60 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <RowActionsMenu
                              isOpen={activeRowMenuId === `cust-${c.id}`}
                              onToggle={() => setActiveRowMenuId && setActiveRowMenuId(activeRowMenuId === `cust-${c.id}` ? null : `cust-${c.id}`)}
                              onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleOpenAddModal(c);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Custodian</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateCustodian(c)}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleToggleStatus(c, e);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{c.active !== false ? 'Deactivate' : 'Activate'}</span>
                              </button>
                              <div className="h-px bg-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleInitiateDeleteCustodian(c);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </RowActionsMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <MasterDataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCustodians.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Inspection Details Drawer (1 col) */}
        {filteredCustodians.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          {selectedCustodian ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                      {selectedCustodian.employeeCode}
                    </span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      selectedCustodian.custodianType === 'External'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    )}>
                      {selectedCustodian.custodianType === 'External' ? 'External Custodian' : 'Internal Employee'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedCustodian.fullName}</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal(selectedCustodian)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Contact & Organizational Positioning */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact & Organization
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Email Address:</span>
                    <span className="font-bold text-slate-800">{selectedCustodian.email || '—'}</span>
                  </div>
                  {selectedCustodian.phone && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Phone:</span>
                      <span className="font-bold text-slate-800">{selectedCustodian.phone}</span>
                    </div>
                  )}
                  {selectedCustodian.organization && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Contractor Org:</span>
                      <span className="font-bold text-amber-800">{selectedCustodian.organization}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-bold text-slate-800">{getDepartmentName(selectedCustodian)}</span>
                  </div>
                  {selectedCustodian.section && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Section:</span>
                      <span className="font-bold text-slate-800">{selectedCustodian.section}</span>
                    </div>
                  )}
                  {selectedCustodian.location && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Assigned Location:</span>
                      <span className="font-bold text-slate-800">{selectedCustodian.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                <span>The Custodian Master sits in front of user creation. Users are provisioned by looking up employee codes from this master.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">Select a custodian to inspect profile</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* MODAL: Add / Edit Custodian */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCustodian ? 'Edit Custodian' : 'Add New Custodian'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Internal employees & external contractor asset holders
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustodian} className="space-y-3.5 text-xs">
              {/* Custodian Type Selection (System Enumeration) */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2">
                <label className="block font-bold text-slate-800">
                  Custodian Type <span className="text-purple-600 text-[10px]">(System Enumeration)</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="custodianType"
                      value="Internal"
                      checked={formState.custodianType === 'Internal'}
                      onChange={() => setFormState({ ...formState, custodianType: 'Internal' })}
                      className="accent-[#6C2BD9]"
                    />
                    <span>Internal (Employee Master)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="custodianType"
                      value="External"
                      checked={formState.custodianType === 'External'}
                      onChange={() => setFormState({ ...formState, custodianType: 'External' })}
                      className="accent-[#6C2BD9]"
                    />
                    <span>External (Third Party / Contractor)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formState.custodianType === 'Internal' ? 'Employee Code' : 'Custodian Code'}
                  </label>
                  <MasterCodeInput
                    entityKey="employee"
                    value={formState.employeeCode}
                    onChange={(code) => setFormState({ ...formState, employeeCode: code })}
                    disabled={!!editingCustodian}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. jane.doe@company.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +971 50 123 4567"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              {/* External Organization for External Custodians */}
              {formState.custodianType === 'External' && (
                <div>
                  <label className="block font-bold text-amber-800 mb-1">Third-Party Organization / Contractor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Facilities Pro Maintenance LLC / Wipro"
                    value={formState.organization}
                    onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <select
                    value={formState.companyId}
                    onChange={(e) => setFormState({ ...formState, companyId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formState.departmentId}
                    onChange={(e) => setFormState({ ...formState, departmentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity, Application Dev"
                    value={formState.section}
                    onChange={(e) => setFormState({ ...formState, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Headquarters - Floor 2"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formState.status || (formState.active !== false ? 'Active' : 'Inactive')}
                  onChange={(e) => setFormState({
                    ...formState,
                    status: e.target.value,
                    active: e.target.value === 'Active'
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer font-semibold text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#581c87] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCustodian ? 'Save Changes' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART DELETE MODAL */}
      <SmartDeleteModal
        isOpen={smartDeleteState.isOpen}
        onClose={() => setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false })}
        item={smartDeleteState.item}
        entityName="Custodian"
        linkedCount={smartDeleteState.linkedCount}
        details={smartDeleteState.details}
        onDeactivate={handleSmartDeactivateCustodian}
        onForceDelete={handleSmartForceDeleteCustodian}
        isProcessing={smartDeleteState.isProcessing}
      />
    </div>
  );
}

