import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Box,
  Users,
  MapPin,
  Wrench,
  FileText,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  X,
  Plus,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';
import { deduplicateCustodians } from './custodianUtils';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { StatusConfirmModal } from './StatusConfirmModal';

export const INITIAL_COST_CENTERS = [];

export function CostCentersTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [costCentersList, setCostCentersList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [custodiansList, setCustodiansList] = useState([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ccToDelete, setCcToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ccToToggleStatus, setCcToToggleStatus] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Load live cost centers from database
  const loadCostCenters = async () => {
    setIsLoading(true);
    try {
      const [res, compRes, deptRes, empRes] = await Promise.all([
        api.get('/master-data/cost-centers?includeInactive=true'),
        api.get('/master-data/companies?includeInactive=true').catch(() => null),
        api.get('/master-data/departments?includeInactive=true').catch(() => null),
        api.get('/master-data/employees?includeInactive=true').catch(() => null)
      ]);
      if (compRes?.companies) setCompaniesList(compRes.companies);
      if (deptRes?.departments) setDepartmentsList(deptRes.departments);

      const allLoadedEmployees = [
        ...(Array.isArray(empRes?.employees) ? empRes.employees : (Array.isArray(empRes?.custodians) ? empRes.custodians : (Array.isArray(empRes) ? empRes : [])))
      ];
      let customCustodians = [];
      try {
        customCustodians = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      } catch (_) {}
      const combinedEmployees = deduplicateCustodians(allLoadedEmployees, customCustodians);
      setCustodiansList(combinedEmployees);
      if (res?.costCenters && res.costCenters.length > 0) {
        const mapped = res.costCenters.map((cc) => {
          const isCompActive = cc.company ? (cc.company.active !== false && cc.company.status !== 'Inactive') : true;
          const isDeptActive = cc.department ? (cc.department.active !== false && cc.department.status !== 'Inactive') : true;
          const isCCActive = cc.active !== false && isCompActive && isDeptActive;
          return {
            id: cc.id,
            code: cc.code,
            name: cc.name,
            company: cc.company?.name || cc.company || '-',
            companyId: cc.companyId || cc.company?.id || '',
            companyActive: isCompActive,
            department: cc.department?.name || cc.department || '-',
            departmentId: cc.departmentId || cc.department?.id || '',
            departmentActive: isDeptActive,
            type: cc.type || '',
            manager: cc.manager || cc.head || '',
            description: cc.description || '',
            totalAssets: cc.totalAssets ?? (cc._count?.assets || 0),
            active: isCCActive,
            status: isCCActive ? 'Active' : 'Inactive',
            createdBy: cc.createdBy || 'System',
          createdOn: cc.createdAt ? new Date(cc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          lastModifiedBy: cc.lastModifiedBy || 'System',
          lastModifiedOn: cc.updatedAt ? new Date(cc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          relatedInfo: {
            departments: cc.departmentsCount || (cc.departmentId ? 1 : 0),
            locations: cc.locationsCount || 0,
            assets: cc.assetsCount || 0,
            maintenancePlans: 0,
            budgets: 0,
            documents: 0
          }
        };
      });
        setCostCentersList(mapped);
        setSelectedCostCenter((prev) => (prev ? mapped.find((c) => c.id === prev.id) || mapped[0] || null : mapped[0] || null));
      } else {
        setCostCentersList([]);
        setSelectedCostCenter(null);
      }
    } catch (err) {
      console.warn('Failed to fetch cost centers:', err);
      setCostCentersList([]);
      setSelectedCostCenter(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCostCenters();
  }, []);

  // Filter state
  const [ccSearchQuery, setCcSearchQuery] = useState('');
  const [ccCompanyFilter, setCcCompanyFilter] = useState('All Companies');
  const [ccDepartmentFilter, setCcDepartmentFilter] = useState('All Departments');
  const [ccStatusFilter, setCcStatusFilter] = useState('All');
  const [ccTypeFilter, setCcTypeFilter] = useState('All');

  // Modal state
  const [showAddCCModal, setShowAddCCModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingCostCenter, setEditingCostCenter] = useState(null);
  const [ccFormState, setCcFormState] = useState({
    code: '',
    name: '',
    company: '',
    departmentId: '',
    manager: '',
    email: '',
    phone: '',
    description: '',
    status: 'Active'
  });

  const sortedCustodians = useMemo(() => {
    const deduped = deduplicateCustodians(custodiansList);
    return deduped.sort((a, b) => {
      const aInactive = a.active === false || a.status === 'Inactive';
      const bInactive = b.active === false || b.status === 'Inactive';
      if (!aInactive && bInactive) return -1;
      if (aInactive && !bInactive) return 1;
      const nameA = (a.fullName || a.name || '').toLowerCase();
      const nameB = (b.fullName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [custodiansList]);

  const loadCustodians = async () => {
    try {
      const empRes = await api.get('/master-data/employees?includeInactive=true').catch(() => null);
      const allLoadedEmployees = [
        ...(Array.isArray(empRes?.employees) ? empRes.employees : (Array.isArray(empRes?.custodians) ? empRes.custodians : (Array.isArray(empRes) ? empRes : [])))
      ];
      let customCustodians = [];
      try {
        customCustodians = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      } catch (_) {}
      const deduped = deduplicateCustodians(allLoadedEmployees, customCustodians);
      setCustodiansList(deduped);
      return deduped;
    } catch (_) {
      return custodiansList;
    }
  };

  const filteredCostCenters = useMemo(() => {
    return costCentersList.filter((cc) => {
      const matchesSearch =
        !ccSearchQuery ||
        cc.code.toLowerCase().includes(ccSearchQuery.toLowerCase()) ||
        cc.name.toLowerCase().includes(ccSearchQuery.toLowerCase()) ||
        (cc.department && cc.department.toLowerCase().includes(ccSearchQuery.toLowerCase())) ||
        (cc.description && cc.description.toLowerCase().includes(ccSearchQuery.toLowerCase())) ||
        (cc.manager && cc.manager.toLowerCase().includes(ccSearchQuery.toLowerCase()));

      const matchesCompany =
        ccCompanyFilter === 'All Companies' || ccCompanyFilter === 'All' || cc.company === ccCompanyFilter;

      const matchesDepartment =
        ccDepartmentFilter === 'All Departments' || ccDepartmentFilter === 'All' || cc.department === ccDepartmentFilter || cc.departmentId === ccDepartmentFilter;

      const matchesStatus =
        ccStatusFilter === 'All' || cc.status.toLowerCase() === ccStatusFilter.toLowerCase();

      const matchesType =
        ccTypeFilter === 'All' || ccTypeFilter === 'All Types' || cc.type === ccTypeFilter;

      return matchesSearch && matchesCompany && matchesDepartment && matchesStatus && matchesType;
    });
  }, [costCentersList, ccSearchQuery, ccCompanyFilter, ccStatusFilter, ccTypeFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedCostCenters,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredCostCenters, 10);

  const handleResetCCFilters = () => {
    setCcSearchQuery('');
    setCcCompanyFilter('All Companies');
    setCcDepartmentFilter('All Departments');
    setCcStatusFilter('All');
    setCcTypeFilter('All');
  };

  const handleOpenAddCCModal = (ccToEdit = null) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    loadCustodians();
    if (ccToEdit) {
      setEditingCostCenter(ccToEdit);
      const matchedCust = custodiansList.find(c => 
        (c.fullName && c.fullName.trim().toLowerCase() === (ccToEdit.manager || '').trim().toLowerCase()) ||
        (c.name && c.name.trim().toLowerCase() === (ccToEdit.manager || '').trim().toLowerCase())
      );
      setCcFormState({
        code: ccToEdit.code || '',
        name: ccToEdit.name || '',
        company: ccToEdit.company && ccToEdit.company !== '-' ? ccToEdit.company : (companiesList[0]?.name || ''),
        departmentId: ccToEdit.departmentId || '',
        manager: ccToEdit.manager && ccToEdit.manager !== '-' ? ccToEdit.manager : '',
        email: matchedCust?.email || '',
        phone: matchedCust?.phone || '',
        description: ccToEdit.description || '',
        status: ccToEdit.status || 'Active'
      });
    } else {
      setEditingCostCenter(null);
      setCcFormState({
        code: '',
        name: '',
        company: companiesList[0]?.name || '',
        departmentId: '',
        manager: '',
        email: '',
        phone: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddCCModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddCCModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveCC = async (e) => {
    e.preventDefault();
    const cleanCode = (ccFormState.code || '').trim().toUpperCase();
    const cleanName = (ccFormState.name || '').trim();

    if (!cleanName) {
      setModalError('Section Name is required.');
      return;
    }

    if (cleanCode) {
      const dupCode = costCentersList.find(c => (c.code || '').trim().toUpperCase() === cleanCode && (!editingCostCenter || c.id !== editingCostCenter.id));
      if (dupCode) {
        const msg = `Section code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }

    const dupName = costCentersList.find(c => (c.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingCostCenter || c.id !== editingCostCenter.id));
    if (dupName) {
      const msg = `Section name "${cleanName}" already exists. Duplicate names are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const matchedComp = companiesList.find(c => c.name === ccFormState.company || c.code === ccFormState.company || c.id === ccFormState.company);
    let companyId = matchedComp?.id || null;
    if (!companyId && ccFormState.departmentId) {
      const matchedDept = departmentsList.find(d => d.id === ccFormState.departmentId);
      if (matchedDept?.companyId) companyId = matchedDept.companyId;
    }

    const payload = {
      name: cleanName,
      companyId,
      departmentId: ccFormState.departmentId || null,
      manager: ccFormState.manager ? ccFormState.manager.trim() : null,
      description: ccFormState.description ? ccFormState.description.trim() : null,
      active: ccFormState.status === 'Active',
      status: ccFormState.status
    };
    if (cleanCode) payload.code = cleanCode;

    if (editingCostCenter) {
      try {
        await api.put(`/master-data/cost-centers/${editingCostCenter.id}`, payload);
        await loadCostCenters();
        triggerToast && triggerToast(`Section "${cleanName}" updated successfully.`);
      } catch (err) {
        console.error('Save cost center error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to update section.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    } else {
      try {
        await api.post('/master-data/cost-centers', payload);
        await loadCostCenters();
        triggerToast && triggerToast(`Section "${cleanName}" created successfully.`);
      } catch (err) {
        console.error('Add cost center error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to create section.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }
    setShowAddCCModal(false);
  };

  const handleDuplicateCostCenter = (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...cc,
      id: Date.now(),
      code: `${cc.code}-COPY`,
      name: `${cc.name} (Copy)`,
      totalAssets: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
    setCostCentersList([duplicated, ...costCentersList]);
    setSelectedCostCenter(duplicated);
    triggerToast && triggerToast(`Section "${cc.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleCCStatus = (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cc.status === 'Active' ? 'Inactive' : 'Active';
    if (newStatus === 'Active') {
      const comp = companiesList.find(c => (c.name || c.code) === cc.company || c.id === cc.companyId);
      if ((comp && (comp.active === false || comp.status === 'Inactive')) || cc.companyActive === false) {
        const msg = `Cannot activate Section "${cc.code}" because parent Company "${cc.company || comp?.name || 'assigned company'}" is inactive.`;
        triggerToast && triggerToast(msg);
        return;
      }
      const dept = departmentsList.find(d => (d.name || d.code) === cc.department || d.id === cc.departmentId);
      if ((dept && (dept.active === false || dept.status === 'Inactive')) || cc.departmentActive === false) {
        const msg = `Cannot activate Section "${cc.code}" because parent Department "${cc.department || dept?.name || 'assigned department'}" is inactive.`;
        triggerToast && triggerToast(msg);
        return;
      }
    }
    setCcToToggleStatus(cc);
  };

  const handleConfirmToggleCCStatus = async () => {
    if (!ccToToggleStatus) return;
    const cc = ccToToggleStatus;
    const newStatus = cc.status === 'Active' ? 'Inactive' : 'Active';
    setIsStatusUpdating(true);
    try {
      await api.patch(`/master-data/entities/cost_center/${cc.id}/status`);
      await loadCostCenters();
      triggerToast && triggerToast(`Section "${cc.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Status toggle error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update section status.';
      triggerToast && triggerToast(msg);
      await loadCostCenters();
    } finally {
      setIsStatusUpdating(false);
      setCcToToggleStatus(null);
    }
  };

  const handleDeleteCostCenter = (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setCcToDelete(cc);
  };

  const handleConfirmDeleteCostCenter = async () => {
    if (!ccToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master-data/cost-centers/${ccToDelete.id}`);
      await loadCostCenters();
      triggerToast && triggerToast(`Section "${ccToDelete.code}" deleted successfully.`);
    } catch (err) {
      console.warn('Delete cost center error:', err);
      const remaining = costCentersList.filter((c) => c.id !== ccToDelete.id);
      setCostCentersList(remaining);
      if (remaining.length > 0) setSelectedCostCenter(remaining[0]);
      triggerToast && triggerToast(`Section "${ccToDelete.code}" deleted successfully.`);
    } finally {
      setIsDeleting(false);
      setCcToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by section code, name, manager..."
              value={ccSearchQuery}
              onChange={(e) => setCcSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Company</span>
            <select
              value={ccCompanyFilter}
              onChange={(e) => setCcCompanyFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Companies">All Companies</option>
              {companiesList.map((c) => {
                const isInactive = c.active === false || c.status === 'Inactive';
                return (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}{isInactive ? ' (Inactive)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Department</span>
            <select
              value={ccDepartmentFilter}
              onChange={(e) => setCcDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={ccStatusFilter}
              onChange={(e) => setCcStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Type</span>
            <select
              value={ccTypeFilter}
              onChange={(e) => setCcTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              {Array.from(new Set(costCentersList.map(c => c.type).filter(Boolean))).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 md:pt-0 flex items-center gap-2">
            <button
              onClick={handleResetCCFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={loadCostCenters}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh from Database"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-[#6C2BD9]")} />
            </button>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Container */}
        <div className={`${filteredCostCenters.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sections List</h2>
              <p className="text-xs text-slate-500">Showing all sections.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredCostCenters.length} Sections
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Section Code ↕</th>
                  <th className="py-3 px-3">Section Name ↕</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCostCenters.length === 0 ? (
                  <MasterEmptyState
                    icon={BarChart3}
                    title="No Sections found"
                    subtitle={ccSearchQuery ? "No sections match your search criteria." : "Get started by defining your first section."}
                    actionLabel="Add Section"
                    onAction={() => handleOpenAddCCModal(null)}
                    colSpan={10}
                  />
                ) : (
                  pagedCostCenters.map((cc, index) => {
                  const isSelected = selectedCostCenter?.id === cc.id;
                  const isMenuOpen = activeRowMenuId === `cc-${cc.id}`;
                  const isNearBottom = filteredCostCenters.length > 2 && index >= filteredCostCenters.length - 2;

                  return (
                    <tr
                      key={cc.id}
                      onClick={() => setSelectedCostCenter(cc)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{startIndex + index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{cc.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{cc.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div className="flex items-center gap-1">
                          <span>{cc.company || '-'}</span>
                          {(() => {
                            const comp = companiesList.find(c => (c.name || c.code) === cc.company || c.id === cc.companyId);
                            const isCompInact = (comp && (comp.active === false || comp.status === 'Inactive')) || cc.companyActive === false;
                            if (isCompInact) {
                              return (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">
                                  (Parent Inactive)
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1">
                          <span>{cc.department || '-'}</span>
                          {(() => {
                            const dept = departmentsList.find(d => (d.name || d.code) === cc.department || d.id === cc.departmentId);
                            const isDeptInact = (dept && (dept.active === false || dept.status === 'Inactive')) || cc.departmentActive === false;
                            if (isDeptInact) {
                              return (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">
                                  (Parent Inactive)
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{cc.type || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{cc.manager || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(cc.totalAssets ?? 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {(() => {
                          const comp = companiesList.find(c => (c.name || c.code) === cc.company || c.id === cc.companyId);
                          const isCompInact = (comp && (comp.active === false || comp.status === 'Inactive')) || cc.companyActive === false;
                          const dept = departmentsList.find(d => (d.name || d.code) === cc.department || d.id === cc.departmentId);
                          const isDeptInact = (dept && (dept.active === false || dept.status === 'Inactive')) || cc.departmentActive === false;
                          const effectiveActive = cc.status === 'Active' && !isCompInact && !isDeptInact;
                          return (
                            <span
                              className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                                effectiveActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              )}
                            >
                              {effectiveActive ? 'Active' : 'Inactive'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddCCModal(cc)}
                            title="Edit Section"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <RowActionsMenu
                            isOpen={isMenuOpen}
                            onToggle={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `cc-${cc.id}`)}
                            onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleOpenAddCCModal(cc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Section</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDuplicateCostCenter(cc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleToggleCCStatus(cc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{cc.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDeleteCostCenter(cc);
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
                }))}
              </tbody>
            </table>
          </div>

          <MasterDataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCostCenters.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Section Details Panel */}
        {filteredCostCenters.length > 0 && selectedCostCenter && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Section Details</h3>
            <button
              onClick={() => handleOpenAddCCModal(selectedCostCenter)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {!selectedCostCenter ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              Select a section from the table to view details.
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Section Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedCostCenter.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Section Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCostCenter.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="col-span-2 text-slate-700 flex items-center gap-1.5 flex-wrap">
                  <span>{selectedCostCenter.company}</span>
                  {(() => {
                    const comp = companiesList.find(c => (c.name || c.code) === selectedCostCenter.company || c.id === selectedCostCenter.companyId);
                    const isCompInact = (comp && (comp.active === false || comp.status === 'Inactive')) || selectedCostCenter.companyActive === false;
                    if (isCompInact) {
                      return (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">
                          (Parent Inactive)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="col-span-2 font-semibold text-[#6C2BD9] flex items-center gap-1.5 flex-wrap">
                  <span>{selectedCostCenter.department || 'Not Assigned'}</span>
                  {(() => {
                    const dept = departmentsList.find(d => (d.name || d.code) === selectedCostCenter.department || d.id === selectedCostCenter.departmentId);
                    const isDeptInact = (dept && (dept.active === false || dept.status === 'Inactive')) || selectedCostCenter.departmentActive === false;
                    if (isDeptInact) {
                      return (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">
                          (Parent Inactive)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </span>
              </div>

              {selectedCostCenter.type && (
                <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Type</span>
                  <span className="col-span-2 text-slate-700">{selectedCostCenter.type}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Manager</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCostCenter.manager || '-'}</span>
              </div>
              {(() => {
                const matchedCust = custodiansList.find(c =>
                  (c.fullName && c.fullName.trim().toLowerCase() === (selectedCostCenter.manager || '').trim().toLowerCase()) ||
                  (c.name && c.name.trim().toLowerCase() === (selectedCostCenter.manager || '').trim().toLowerCase())
                );
                return (
                  <>
                    {matchedCust?.email && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Email</span>
                        <span className="col-span-2 font-mono text-[11px] text-slate-700">{matchedCust.email}</span>
                      </div>
                    )}
                    {matchedCust?.phone && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Phone</span>
                        <span className="col-span-2 font-mono text-[11px] text-slate-700">{matchedCust.phone}</span>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedCostCenter.description || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  {(() => {
                    const comp = companiesList.find(c => (c.name || c.code) === selectedCostCenter.company || c.id === selectedCostCenter.companyId);
                    const isCompInact = (comp && (comp.active === false || comp.status === 'Inactive')) || selectedCostCenter.companyActive === false;
                    const dept = departmentsList.find(d => (d.name || d.code) === selectedCostCenter.department || d.id === selectedCostCenter.departmentId);
                    const isDeptInact = (dept && (dept.active === false || dept.status === 'Inactive')) || selectedCostCenter.departmentActive === false;
                    const effectiveActive = selectedCostCenter.status === 'Active' && !isCompInact && !isDeptInact;
                    return (
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                        effectiveActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      )}>
                        {effectiveActive ? 'Active' : 'Inactive'}
                      </span>
                    );
                  })()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedCostCenter.totalAssets ?? 0).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedCostCenter.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedCostCenter.createdOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo?.departments ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo?.locations ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{(selectedCostCenter.relatedInfo?.assets ?? 0).toLocaleString() ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo?.maintenancePlans ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <BarChart3 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Budgets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo?.budgets ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo?.documents ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Modal: Add / Edit Section */}
      {showAddCCModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingCostCenter ? 'Edit Section' : 'Add New Section'}</span>
              </h3>
              <button onClick={() => setShowAddCCModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCC} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Section Code
                  </label>
                  <MasterCodeInput
                    entityKey="cost_center"
                    value={ccFormState.code}
                    onChange={(code) => setCcFormState({ ...ccFormState, code })}
                    disabled={!!editingCostCenter}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    value={ccFormState.name}
                    onChange={(e) => setCcFormState({ ...ccFormState, name: e.target.value })}
                    placeholder="e.g. IT Infrastructure"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <select
                    value={ccFormState.company}
                    onChange={(e) => {
                      const newComp = e.target.value;
                      setCcFormState(prev => {
                        const matchedComp = companiesList.find(c => c.name === newComp || c.id === newComp);
                        let nextDeptId = prev.departmentId;
                        if (matchedComp && nextDeptId) {
                          const curDept = departmentsList.find(d => d.id === nextDeptId);
                          if (curDept && curDept.companyId && curDept.companyId !== matchedComp.id) {
                            nextDeptId = '';
                          }
                        }
                        return { ...prev, company: newComp, departmentId: nextDeptId };
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">- Select Company -</option>
                    {companiesList.map((c) => {
                      const isInactive = c.active === false || c.status === 'Inactive';
                      return (
                        <option
                          key={c.id || c.name}
                          value={c.name}
                          disabled={isInactive}
                          className={isInactive ? 'text-slate-400 italic bg-slate-100 cursor-not-allowed' : 'text-slate-800 font-medium'}
                        >
                          {c.name}{isInactive ? ' (Inactive)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={ccFormState.departmentId}
                    onChange={(e) => {
                      const selectedDeptId = e.target.value;
                      const dept = departmentsList.find(d => d.id === selectedDeptId);
                      let autoComp = ccFormState.company;
                      if (dept?.company?.name) autoComp = dept.company.name;
                      else if (dept?.companyId) {
                        const c = companiesList.find(cmp => cmp.id === dept.companyId);
                        if (c) autoComp = c.name;
                      }
                      setCcFormState({ ...ccFormState, departmentId: selectedDeptId, company: autoComp });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">- Select Department -</option>
                    {departmentsList
                      .filter(d => {
                        if (!ccFormState.company) return true;
                        const comp = companiesList.find(c => c.name === ccFormState.company || c.id === ccFormState.company);
                        return !comp || !d.companyId || d.companyId === comp.id;
                      })
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.company?.name ? `(${d.company.name})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                  <select
                    value={ccFormState.manager || ''}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      if (!selectedVal) {
                        setCcFormState({
                          ...ccFormState,
                          manager: '',
                          email: '',
                          phone: ''
                        });
                        return;
                      }
                      const matchedCust = custodiansList.find(c => 
                        (c.fullName && c.fullName.trim().toLowerCase() === selectedVal.trim().toLowerCase()) ||
                        (c.name && c.name.trim().toLowerCase() === selectedVal.trim().toLowerCase()) ||
                        (c.employeeCode && c.employeeCode.trim().toLowerCase() === selectedVal.trim().toLowerCase()) ||
                        String(c.id) === selectedVal
                      );
                      setCcFormState({
                        ...ccFormState,
                        manager: matchedCust ? (matchedCust.fullName || matchedCust.name || selectedVal) : selectedVal,
                        email: matchedCust?.email || '',
                        phone: matchedCust?.phone || ''
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">- Select Manager (Custodian) -</option>
                    {editingCostCenter?.manager && !sortedCustodians.some(c => (c.fullName || c.name) === editingCostCenter.manager) && (
                      <option value={editingCostCenter.manager}>
                        {editingCostCenter.manager} (Current)
                      </option>
                    )}
                    {sortedCustodians.map((c, idx) => {
                      const isInactive = c.active === false || c.status === 'Inactive';
                      const name = c.fullName || c.name || '';
                      const code = c.employeeCode || c.code || '';
                      const optKey = `cc-cust-${c.id || code || name || idx}-${idx}`;
                      return (
                        <option
                          key={optKey}
                          value={name}
                          disabled={isInactive}
                          className={isInactive ? 'text-slate-400 italic bg-slate-100 cursor-not-allowed' : 'text-slate-800 font-medium'}
                        >
                          {name}{code ? ` (${code})` : ''}{isInactive ? ' (Inactive)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <select
                    disabled
                    value={ccFormState.email || ''}
                    title="Autoloaded from selected Manager"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-100/80 text-slate-600 cursor-not-allowed select-none focus:outline-none font-mono"
                    tabIndex={-1}
                  >
                    <option value="">{ccFormState.email || '-'}</option>
                    {ccFormState.email && (
                      <option value={ccFormState.email}>{ccFormState.email}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone No.</label>
                  <select
                    disabled
                    value={ccFormState.phone || ''}
                    title="Autoloaded from selected Manager"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-100/80 text-slate-600 cursor-not-allowed select-none focus:outline-none font-mono"
                    tabIndex={-1}
                  >
                    <option value="">{ccFormState.phone || '-'}</option>
                    {ccFormState.phone && (
                      <option value={ccFormState.phone}>{ccFormState.phone}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={ccFormState.description}
                  onChange={(e) => setCcFormState({ ...ccFormState, description: e.target.value })}
                  placeholder="Enter detailed section description..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={ccFormState.status}
                  onChange={(e) => setCcFormState({ ...ccFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddCCModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingCostCenter ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(ccToDelete)}
        onClose={() => setCcToDelete(null)}
        onConfirm={handleConfirmDeleteCostCenter}
        entityName="Section"
        itemName={ccToDelete?.name}
        itemCode={ccToDelete?.code}
        isLoading={isDeleting}
      />

      {/* Status Confirmation Modal */}
      <StatusConfirmModal
        isOpen={Boolean(ccToToggleStatus)}
        onClose={() => setCcToToggleStatus(null)}
        onConfirm={handleConfirmToggleCCStatus}
        entityName="Section"
        itemName={ccToToggleStatus?.name}
        itemCode={ccToToggleStatus?.code}
        currentStatus={ccToToggleStatus?.status}
        isLoading={isStatusUpdating}
      />
    </div>
  );
}
