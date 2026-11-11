import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Users,
  BarChart3,
  Box,
  MapPin,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  X,
  FolderTree,
  Plus,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';

export const INITIAL_DEPARTMENTS = [];

export function DepartmentsTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [departmentsList, setDepartmentsList] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load live departments from database
  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const [res, ccRes, compRes, siteRes, empRes] = await Promise.all([
        api.get('/master-data/departments?includeInactive=true'),
        api.get('/master-data/cost-centers?includeInactive=true').catch(() => ({ costCenters: [] })),
        api.get('/master-data/companies?includeInactive=true').catch(() => null),
        api.get('/master-data/sites?includeInactive=true').catch(() => null),
        api.get('/master-data/employees?includeInactive=true').catch(() => null)
      ]);
      const loadedCCs = ccRes?.costCenters || [];
      setCostCenters(loadedCCs);
      if (compRes?.companies) setCompaniesList(compRes.companies);
      if (siteRes?.sites) setLocationsList(siteRes.sites);

      const allLoadedEmployees = [
        ...(Array.isArray(empRes?.employees) ? empRes.employees : (Array.isArray(empRes?.custodians) ? empRes.custodians : (Array.isArray(empRes) ? empRes : [])))
      ];
      let customCustodians = [];
      try {
        customCustodians = JSON.parse(localStorage.getItem('fams_custom_custodians') || '[]');
      } catch (_) {}
      const combinedEmployees = [...allLoadedEmployees, ...customCustodians];

      if (res?.departments && res.departments.length > 0) {
        const mapped = res.departments.map((dept) => {
          const linkedCCs = (dept.costCenters && dept.costCenters.length > 0)
            ? dept.costCenters
            : loadedCCs.filter((c) => c.departmentId === dept.id || c.department?.id === dept.id);

          const matchedEmps = combinedEmployees.filter(c => {
            if (!c) return false;
            const targetId = String(dept.id || '').trim().toLowerCase();
            const targetCode = String(dept.code || '').trim().toLowerCase();
            const targetName = String(dept.name || '').trim().toLowerCase();

            const cDeptId = c.departmentId != null ? String(c.departmentId).trim().toLowerCase() : '';
            if (cDeptId && (cDeptId === targetId || cDeptId === targetCode || cDeptId === targetName)) return true;

            const cDeptStr = typeof c.department === 'string'
              ? c.department.trim().toLowerCase()
              : (c.department?.name ? String(c.department.name).trim().toLowerCase() : '');
            if (cDeptStr && (cDeptStr === targetName || cDeptStr === targetCode || cDeptStr === targetId)) return true;

            const cDeptObjId = c.department?.id != null ? String(c.department.id).trim().toLowerCase() : '';
            if (cDeptObjId && (cDeptObjId === targetId || cDeptObjId === targetCode)) return true;

            const cDeptObjCode = c.department?.code != null ? String(c.department.code).trim().toLowerCase() : '';
            if (cDeptObjCode && (cDeptObjCode === targetCode || cDeptObjCode === targetId)) return true;

            return false;
          });
          const empCount = matchedEmps.length > 0
            ? matchedEmps.length
            : (dept._count?.employees || dept.employees || 0);

          const isCompActive = dept.company ? (dept.company.active !== false && dept.company.status !== 'Inactive') : true;
          const isDeptActive = dept.active !== false && isCompActive;
          return {
            id: dept.id,
            code: dept.code,
            name: dept.name,
            costCenters: linkedCCs,
            costCenterCount: linkedCCs.length,
            costCenterCode: linkedCCs.length > 0 ? linkedCCs[0].code : '',
            costCenterName: linkedCCs.length > 0 ? linkedCCs[0].name : '',
            costCenterId: linkedCCs.length > 0 ? linkedCCs[0].id : '',
            type: dept.type || '',
            parentDepartment: dept.parentDepartment || '',
            location: dept.location || dept.site?.name || '',
            company: dept.company?.name || dept.company || '',
            companyId: dept.company?.id || dept.companyId || '',
            companyActive: isCompActive,
            active: isDeptActive,
            manager: dept.manager || dept.head || '',
            email: dept.email || '',
            phone: dept.phone || '',
            description: dept.description || '',
            employees: empCount,
            status: isDeptActive ? 'Active' : 'Inactive',
              createdBy: dept.createdBy || 'System',
              createdOn: dept.createdAt ? new Date(dept.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
              lastModifiedBy: dept.lastModifiedBy || 'System',
              lastModifiedOn: dept.updatedAt ? new Date(dept.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
              relatedInfo: {
                subDepartments: dept.subDepartmentsCount || 0,
                locations: dept.locationsCount || 0,
                assets: dept.assetsCount || 0,
                users: dept.usersCount || 0
              }
            };
        });
        setDepartmentsList(mapped);
        setSelectedDepartment((prev) => (prev ? mapped.find((d) => d.id === prev.id) || mapped[0] || null : mapped[0] || null));
      } else {
        setDepartmentsList([]);
        setSelectedDepartment(null);
      }
    } catch (err) {
      console.warn('Failed to fetch departments:', err);
      setDepartmentsList([]);
      setSelectedDepartment(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Filter state
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [deptTypeFilter, setDeptTypeFilter] = useState('All Types');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');
  const [deptLocationFilter, setDeptLocationFilter] = useState('All Locations');
  const [deptCompanyFilter, setDeptCompanyFilter] = useState('All Companies');

  // Modal state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deptFormState, setDeptFormState] = useState({
    code: '',
    name: '',
    type: 'Support',
    parentDepartment: '',
    location: '',
    company: '',
    manager: '',
    email: '',
    phone: '',
    description: '',
    costCenterId: '',
    status: 'Active'
  });

  const filteredDepartments = useMemo(() => {
    return departmentsList.filter((dept) => {
      const matchesSearch =
        !deptSearchQuery ||
        dept.code.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
        dept.name.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
        (dept.manager && dept.manager.toLowerCase().includes(deptSearchQuery.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(deptSearchQuery.toLowerCase()));

      const matchesType =
        deptTypeFilter === 'All Types' || deptTypeFilter === 'All' || dept.type === deptTypeFilter;

      const matchesStatus =
        deptStatusFilter === 'All' || dept.status.toLowerCase() === deptStatusFilter.toLowerCase();

      const matchesLoc =
        deptLocationFilter === 'All Locations' || deptLocationFilter === 'All' || dept.location === deptLocationFilter;

      const matchesCompany =
        deptCompanyFilter === 'All Companies' || deptCompanyFilter === 'All' || dept.company === deptCompanyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesLoc && matchesCompany;
    });
  }, [departmentsList, deptSearchQuery, deptTypeFilter, deptStatusFilter, deptLocationFilter, deptCompanyFilter]);

  const isCompanyInactive = (c) => {
    if (!c) return false;
    return c.active === false || c.status === 'Inactive';
  };

  const sortedCompanies = useMemo(() => {
    return [...companiesList].sort((a, b) => {
      const aInactive = isCompanyInactive(a);
      const bInactive = isCompanyInactive(b);
      if (!aInactive && bInactive) return -1;
      if (aInactive && !bInactive) return 1;
      return (a.name || a.code || '').localeCompare(b.name || b.code || '');
    });
  }, [companiesList]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedDepartments,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredDepartments, 10);

  const handleResetDeptFilters = () => {
    setDeptSearchQuery('');
    setDeptTypeFilter('All Types');
    setDeptStatusFilter('All');
    setDeptLocationFilter('All Locations');
    setDeptCompanyFilter('All Companies');
  };

  const handleOpenAddDeptModal = (deptToEdit = null) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    if (deptToEdit) {
      setEditingDepartment(deptToEdit);
      setDeptFormState({
        code: deptToEdit.code || '',
        name: deptToEdit.name || '',
        type: deptToEdit.type || 'Support',
        parentDepartment: deptToEdit.parentDepartment || '',
        location: deptToEdit.location || '',
        company: deptToEdit.company || '',
        manager: deptToEdit.manager || '',
        email: deptToEdit.email || '',
        phone: deptToEdit.phone || '',
        description: deptToEdit.description || '',
        status: deptToEdit.status || 'Active'
      });
    } else {
      setEditingDepartment(null);
      const activeCompanies = companiesList.filter(c => c.active !== false && c.status !== 'Inactive');
      setDeptFormState({
        code: '',
        name: '',
        type: 'Support',
        parentDepartment: '',
        location: '',
        company: activeCompanies[0]?.name || '',
        manager: '',
        email: '',
        phone: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddDeptModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddDeptModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveDept = async (e) => {
    e.preventDefault();
    const cleanCode = (deptFormState.code || '').trim().toUpperCase();
    const cleanName = (deptFormState.name || '').trim();

    if (!cleanName) {
      setModalError('Department Name is required.');
      return;
    }

    if (cleanCode) {
      const dupCode = departmentsList.find(d => (d.code || '').trim().toUpperCase() === cleanCode && (!editingDepartment || d.id !== editingDepartment.id));
      if (dupCode) {
        const msg = `Department code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }

    const dupName = departmentsList.find(d => (d.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingDepartment || d.id !== editingDepartment.id));
    if (dupName) {
      const msg = `Department name "${cleanName}" already exists. Duplicate names are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const matchedComp = companiesList.find(c => c.name === deptFormState.company || c.code === deptFormState.company || c.id === deptFormState.company);
    if (!matchedComp) {
      const msg = 'Please select a valid Company.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }
    if (isCompanyInactive(matchedComp)) {
      const msg = `Cannot assign Department to inactive Company "${matchedComp.name}". Please select an active Company.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }
    const companyId = matchedComp.id;

    const payload = {
      name: cleanName,
      companyId,
      type: deptFormState.type || null,
      parentDepartment: deptFormState.parentDepartment || null,
      location: deptFormState.location || null,
      manager: deptFormState.manager ? deptFormState.manager.trim() : null,
      email: deptFormState.email ? deptFormState.email.trim() : null,
      phone: deptFormState.phone ? deptFormState.phone.trim() : null,
      description: deptFormState.description ? deptFormState.description.trim() : null,
      active: deptFormState.status === 'Active',
      status: deptFormState.status
    };
    if (cleanCode) payload.code = cleanCode;

    if (editingDepartment) {
      try {
        await api.put(`/master-data/departments/${editingDepartment.id}`, payload);
        await loadDepartments();
        triggerToast && triggerToast(`Department "${cleanName}" updated successfully.`);
      } catch (err) {
        console.error('Save department error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to update department.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    } else {
      try {
        await api.post('/master-data/departments', payload);
        await loadDepartments();
        triggerToast && triggerToast(`Department "${cleanName}" created successfully.`);
      } catch (err) {
        console.error('Add department error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to create department.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }
    setShowAddDeptModal(false);
  };

  const handleDuplicateDepartment = (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...dept,
      id: Date.now(),
      code: `${dept.code}-COPY`,
      name: `${dept.name} (Copy)`,
      employees: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
    setDepartmentsList([duplicated, ...departmentsList]);
    setSelectedDepartment(duplicated);
    triggerToast && triggerToast(`Department "${dept.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleDepartmentStatus = async (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    if (newStatus === 'Active') {
      const comp = companiesList.find(c => c.name === dept.company || c.code === dept.company || c.id === dept.companyId);
      if ((comp && isCompanyInactive(comp)) || dept.companyActive === false) {
        const msg = `Cannot activate Department "${dept.code}" because parent Company "${dept.company || 'assigned company'}" is inactive.`;
        triggerToast && triggerToast(msg);
        return;
      }
    }
    try {
      await api.patch(`/master-data/entities/department/${dept.id}/status`);
      await loadDepartments();
      triggerToast && triggerToast(`Department "${dept.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Toggle status error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update department status.';
      triggerToast && triggerToast(msg);
      await loadDepartments();
    }
  };

  const handleDeleteDepartment = async (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Department "${dept.name}" (${dept.code})?`)) {
      try {
        await api.delete(`/master-data/departments/${dept.id}`);
        await loadDepartments();
        triggerToast && triggerToast(`Department "${dept.code}" deleted successfully.`);
      } catch (err) {
        console.warn('Delete department error:', err);
        const remaining = departmentsList.filter((d) => d.id !== dept.id);
        setDepartmentsList(remaining);
        if (remaining.length > 0) setSelectedDepartment(remaining[0]);
        triggerToast && triggerToast(`Department "${dept.code}" deleted successfully.`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <span className="text-[10px] font-semibold text-slate-400 absolute left-3 top-1">Search</span>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 bottom-2.5" />
            <input
              type="text"
              placeholder="Search by department code, name, manager..."
              value={deptSearchQuery}
              onChange={(e) => setDeptSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Department Type</span>
            <select
              value={deptTypeFilter}
              onChange={(e) => setDeptTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              {Array.from(new Set(departmentsList.map(d => d.type).filter(Boolean))).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={deptStatusFilter}
              onChange={(e) => setDeptStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Location</span>
            <select
              value={deptLocationFilter}
              onChange={(e) => setDeptLocationFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Locations">All Locations</option>
              {locationsList.map((loc) => (
                <option key={loc.id || loc.name} value={loc.name || loc.code}>
                  {loc.name || loc.code}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Company</span>
            <select
              value={deptCompanyFilter}
              onChange={(e) => setDeptCompanyFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Companies">All Companies</option>
              {sortedCompanies.map((c) => {
                const isInactive = isCompanyInactive(c);
                return (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}{isInactive ? ' (Inactive)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pt-4 md:pt-0 flex items-center gap-2">
            <button
              onClick={handleResetDeptFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={loadDepartments}
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
        <div className={`${filteredDepartments.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Departments List</h2>
              <p className="text-xs text-slate-500">Showing all departments.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredDepartments.length} Departments
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Dept Code</th>
                  <th className="py-3 px-3">Dept Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-right">Employees</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDepartments.length === 0 ? (
                  <MasterEmptyState
                    icon={Users}
                    title="No Departments found"
                    subtitle={deptSearchQuery ? "No departments match your search criteria." : "Get started by defining your first department."}
                    actionLabel="Add Department"
                    onAction={() => handleOpenAddDeptModal(null)}
                    colSpan={9}
                  />
                ) : (
                  pagedDepartments.map((dept, index) => {
                  const isSelected = selectedDepartment?.id === dept.id;
                  const isMenuOpen = activeRowMenuId === `dept-${dept.id}`;
                  const isNearBottom = filteredDepartments.length > 2 && index >= filteredDepartments.length - 2;

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{startIndex + index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{dept.code}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-[#1E1B4B] font-bold">{dept.name}</span>
                          {dept.company && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-medium">{dept.company}</span>
                              {(() => {
                                const comp = companiesList.find(c => (c.name || c.code) === dept.company || c.id === dept.companyId);
                                const isInactive = (comp && isCompanyInactive(comp)) || dept.companyActive === false;
                                if (isInactive) {
                                  return (
                                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0 rounded">
                                      (Inactive)
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{dept.type || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{dept.manager || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{dept.location || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{dept.employees}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            dept.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddDeptModal(dept)}
                            title="Edit Department"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <RowActionsMenu
                            isOpen={isMenuOpen}
                            onToggle={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `dept-${dept.id}`)}
                            onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleOpenAddDeptModal(dept);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Department</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDuplicateDepartment(dept);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleToggleDepartmentStatus(dept);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{dept.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDeleteDepartment(dept);
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
            totalItems={filteredDepartments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Department Details Panel */}
        {filteredDepartments.length > 0 && selectedDepartment && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Department Details</h3>
            <button
              onClick={() => handleOpenAddDeptModal(selectedDepartment)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {!selectedDepartment ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              Select a department from the table to view details.
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Dept Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedDepartment.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Dept Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedDepartment.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedDepartment.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Manager</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedDepartment.manager}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Email / Phone</span>
                <span className="col-span-2 text-slate-700 font-mono text-[11px]">{selectedDepartment.email}<br/>{selectedDepartment.phone}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="col-span-2 text-slate-700">{selectedDepartment.location}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="col-span-2 text-slate-800 font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>{selectedDepartment.company || '-'}</span>
                  {(() => {
                    const comp = companiesList.find(c => (c.name || c.code) === selectedDepartment.company || c.id === selectedDepartment.companyId);
                    const isInactive = (comp && isCompanyInactive(comp)) || selectedDepartment.companyActive === false;
                    if (isInactive) {
                      return (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                          (Inactive)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedDepartment.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedDepartment.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedDepartment.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Employees</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedDepartment.employees}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>Linked Cost Centers</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6C2BD9] text-[10px] font-bold">
                    {(selectedDepartment.costCenters || []).length} assigned
                  </span>
                </div>

                {selectedDepartment.costCenters && selectedDepartment.costCenters.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedDepartment.costCenters.map((cc) => (
                      <div
                        key={cc.id}
                        className="p-2 rounded-xl bg-purple-50/50 border border-purple-100/80 flex items-center justify-between hover:bg-purple-50 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-mono font-bold text-[#6C2BD9] text-[11px]">{cc.code}</div>
                          <div className="text-slate-700 text-[11px] font-medium truncate">{cc.name}</div>
                        </div>
                        <span
                          className={clsx(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap',
                            cc.active === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {cc.active === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                    <p className="text-[11px] font-medium text-slate-500">No cost centers assigned</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cost centers can be linked to this department from the Cost Centers master.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo?.subDepartments ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo?.locations ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{(selectedDepartment.relatedInfo?.assets ?? 0).toLocaleString() ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assigned Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo?.users ?? 0}</span>
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

      {/* Modal: Add / Edit Department */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingDepartment ? 'Edit Department' : 'Add New Department'}</span>
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Code
                  </label>
                  <MasterCodeInput
                    entityKey="department"
                    value={deptFormState.code}
                    onChange={(code) => setDeptFormState({ ...deptFormState, code })}
                    disabled={!!editingDepartment}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={deptFormState.name}
                    onChange={(e) => setDeptFormState({ ...deptFormState, name: e.target.value })}
                    placeholder="e.g. Information Technology"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Type</label>
                  <select
                    value={deptFormState.type}
                    onChange={(e) => setDeptFormState({ ...deptFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Support">Support</option>
                    <option value="Operational">Operational</option>
                    <option value="Management">Management</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Department</label>
                  <select
                    value={deptFormState.parentDepartment}
                    onChange={(e) => setDeptFormState({ ...deptFormState, parentDepartment: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="-">- (None / Top Level)</option>
                    {[...departmentsList]
                      .filter((d) => !editingDepartment || d.id !== editingDepartment.id)
                      .sort((a, b) => {
                        const aInactive = a.status === 'Inactive' || a.active === false;
                        const bInactive = b.status === 'Inactive' || b.active === false;
                        if (aInactive && !bInactive) return 1;
                        if (!aInactive && bInactive) return -1;
                        return (a.name || '').localeCompare(b.name || '');
                      })
                      .map((d) => {
                        const isInactive = d.status === 'Inactive' || d.active === false;
                        return (
                          <option
                            key={d.id}
                            value={d.code}
                            disabled={isInactive}
                            className={isInactive ? 'text-slate-400 italic bg-slate-100 cursor-not-allowed' : 'text-slate-800 font-medium'}
                          >
                            {d.code} ({d.name}){isInactive ? ' (Inactive)' : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                  <select
                    required
                    value={deptFormState.company}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setDeptFormState({ ...deptFormState, company: '' });
                        return;
                      }
                      const comp = companiesList.find(c => (c.name || c.code) === val || c.id === val);
                      if (comp && isCompanyInactive(comp)) {
                        setModalError(`Cannot assign Department to inactive Company "${comp.name}". Please select an active Company.`);
                        setDeptFormState({ ...deptFormState, company: '' });
                        return;
                      }
                      setModalError('');
                      setDeptFormState({ ...deptFormState, company: val });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">- Select Company -</option>
                    {sortedCompanies.map((c) => {
                      const isInactive = isCompanyInactive(c);
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
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={deptFormState.location}
                    onChange={(e) => setDeptFormState({ ...deptFormState, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">- Select Location -</option>
                    {locationsList.map((loc) => (
                      <option key={loc.id || loc.name} value={loc.name || loc.code}>
                        {loc.name || loc.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingDepartment && editingDepartment.costCenters && editingDepartment.costCenters.length > 0 && (
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs">
                  <div className="font-bold text-[#6C2BD9] mb-1 flex items-center justify-between">
                    <span>Assigned Cost Centers ({editingDepartment.costCenters.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Managed via Cost Centers master</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {editingDepartment.costCenters.map(cc => (
                      <span key={cc.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-[11px] font-semibold text-slate-700">
                        <span className="text-[#6C2BD9] font-bold">{cc.code}</span> - {cc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={deptFormState.manager}
                    onChange={(e) => setDeptFormState({ ...deptFormState, manager: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={deptFormState.email}
                    onChange={(e) => setDeptFormState({ ...deptFormState, email: e.target.value })}
                    placeholder="department@company.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={deptFormState.phone}
                    onChange={(e) => setDeptFormState({ ...deptFormState, phone: e.target.value })}
                    placeholder="+971 50..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptFormState.description}
                  onChange={(e) => setDeptFormState({ ...deptFormState, description: e.target.value })}
                  placeholder="Enter detailed description..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                {(() => {
                  const selectedComp = companiesList.find(c => (c.name || c.code) === deptFormState.company || c.id === deptFormState.company);
                  const isCompInactive = selectedComp ? isCompanyInactive(selectedComp) : false;
                  return (
                    <>
                      <select
                        value={isCompInactive ? 'Inactive' : deptFormState.status}
                        disabled={isCompInactive}
                        onChange={(e) => setDeptFormState({ ...deptFormState, status: e.target.value })}
                        className={clsx(
                          'w-full border rounded-xl px-3 py-2 text-xs focus:outline-none',
                          isCompInactive
                            ? 'border-rose-200 bg-rose-50/50 text-rose-600 cursor-not-allowed italic font-semibold'
                            : 'border-slate-200 bg-white cursor-pointer focus:border-[#6C2BD9]'
                        )}
                      >
                        <option value="Active" disabled={isCompInactive}>Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {isCompInactive && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">
                          Department status is locked to Inactive because selected Company is inactive.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddDeptModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingDepartment ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
