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
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load live cost centers from database
  const loadCostCenters = async () => {
    setIsLoading(true);
    try {
      const [res, compRes, deptRes] = await Promise.all([
        api.get('/master-data/cost-centers?includeInactive=true'),
        api.get('/master-data/companies?includeInactive=true').catch(() => null),
        api.get('/master-data/departments?includeInactive=true').catch(() => null)
      ]);
      if (compRes?.companies) setCompaniesList(compRes.companies);
      if (deptRes?.departments) setDepartmentsList(deptRes.departments);
      if (res?.costCenters && res.costCenters.length > 0) {
        const mapped = res.costCenters.map((cc) => ({
          id: cc.id,
          code: cc.code,
          name: cc.name,
          company: cc.company?.name || cc.company || '-',
          companyId: cc.companyId || cc.company?.id || '',
          department: cc.department?.name || cc.department || '-',
          departmentId: cc.departmentId || cc.department?.id || '',
          type: cc.type || '',
          manager: cc.manager || cc.head || '',
          description: cc.description || '',
          totalAssets: cc.totalAssets ?? (cc._count?.assets || 0),
          status: cc.active === false ? 'Inactive' : 'Active',
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
        }));
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
    type: 'Operational',
    manager: '',
    description: '',
    status: 'Active'
  });

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
    if (ccToEdit) {
      setEditingCostCenter(ccToEdit);
      setCcFormState({
        code: ccToEdit.code || '',
        name: ccToEdit.name || '',
        company: ccToEdit.company && ccToEdit.company !== '-' ? ccToEdit.company : (companiesList[0]?.name || ''),
        departmentId: ccToEdit.departmentId || '',
        type: ccToEdit.type && ccToEdit.type !== '-' ? ccToEdit.type : 'Operational',
        manager: ccToEdit.manager && ccToEdit.manager !== '-' ? ccToEdit.manager : '',
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
        type: 'Operational',
        manager: '',
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

    if (!cleanCode || !cleanName) {
      setModalError('Cost Center Code and Name are required.');
      return;
    }

    const dupCode = costCentersList.find(c => (c.code || '').trim().toUpperCase() === cleanCode && (!editingCostCenter || c.id !== editingCostCenter.id));
    if (dupCode) {
      const msg = `Cost Center code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const dupName = costCentersList.find(c => (c.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingCostCenter || c.id !== editingCostCenter.id));
    if (dupName) {
      const msg = `Cost Center name "${cleanName}" already exists. Duplicate names are not allowed.`;
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
      code: cleanCode,
      name: cleanName,
      companyId,
      departmentId: ccFormState.departmentId || null,
      type: ccFormState.type || null,
      manager: ccFormState.manager ? ccFormState.manager.trim() : null,
      description: ccFormState.description ? ccFormState.description.trim() : null,
      active: ccFormState.status === 'Active',
      status: ccFormState.status
    };

    if (editingCostCenter) {
      try {
        await api.put(`/master-data/cost-centers/${editingCostCenter.id}`, payload);
        await loadCostCenters();
        triggerToast && triggerToast(`Cost Center "${cleanName}" updated successfully.`);
      } catch (err) {
        console.error('Save cost center error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to update cost center.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    } else {
      try {
        await api.post('/master-data/cost-centers', payload);
        await loadCostCenters();
        triggerToast && triggerToast(`Cost Center "${cleanName}" created successfully.`);
      } catch (err) {
        console.error('Add cost center error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to create cost center.';
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
    triggerToast && triggerToast(`Cost Center "${cc.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleCCStatus = async (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/master-data/entities/cost_center/${cc.id}/status`);
      await loadCostCenters();
      triggerToast && triggerToast(`Cost Center "${cc.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Status toggle error:', err);
      const updated = costCentersList.map((c) =>
        c.id === cc.id ? { ...c, status: newStatus } : c
      );
      setCostCentersList(updated);
      if (selectedCostCenter?.id === cc.id) {
        setSelectedCostCenter({ ...selectedCostCenter, status: newStatus });
      }
      triggerToast && triggerToast(`Cost Center "${cc.code}" status changed to ${newStatus}.`);
    }
  };

  const handleDeleteCostCenter = async (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Cost Center "${cc.name}" (${cc.code})?`)) {
      try {
        await api.delete(`/master-data/cost-centers/${cc.id}`);
        await loadCostCenters();
        triggerToast && triggerToast(`Cost Center "${cc.code}" deleted successfully.`);
      } catch (err) {
        console.warn('Delete cost center error:', err);
        const remaining = costCentersList.filter((c) => c.id !== cc.id);
        setCostCentersList(remaining);
        if (remaining.length > 0) setSelectedCostCenter(remaining[0]);
        triggerToast && triggerToast(`Cost Center "${cc.code}" deleted successfully.`);
      }
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
              placeholder="Search by cost center code, name, manager..."
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
              {companiesList.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
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
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cost Centers List</h2>
              <p className="text-xs text-slate-500">Showing all cost centers.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredCostCenters.length} Cost Centers
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Cost Center Code ↕</th>
                  <th className="py-3 px-3">Cost Center Name ↕</th>
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
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No cost centers found. Click "+ Add Cost Center" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCostCenters.map((cc, index) => {
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
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{cc.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{cc.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{cc.company}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">{cc.department}</td>
                      <td className="py-2.5 px-3 text-slate-700">{cc.type || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{cc.manager || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(cc.totalAssets ?? 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            cc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {cc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddCCModal(cc)}
                            title="Edit Cost Center"
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
                              <span>Edit Cost Center</span>
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

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
            <span className="text-slate-600 font-medium">
              Showing {filteredCostCenters.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Right Column: Cost Center Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Cost Center Details</h3>
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
              Select a cost center from the table to view details.
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Cost Center Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedCostCenter.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Cost Center Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCostCenter.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="col-span-2 text-slate-700">{selectedCostCenter.company}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="col-span-2 font-semibold text-[#6C2BD9]">{selectedCostCenter.department || 'Not Assigned'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Type</span>
                <span className="col-span-2 text-slate-700">{selectedCostCenter.type || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Manager</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCostCenter.manager || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedCostCenter.description || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedCostCenter.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedCostCenter.status}
                  </span>
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
      </div>

      {/* Modal: Add / Edit Cost Center */}
      {showAddCCModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingCostCenter ? 'Edit Cost Center' : 'Add New Cost Center'}</span>
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
                  <label className="block font-semibold text-slate-700 mb-1">Cost Center Code *</label>
                  <input
                    type="text"
                    required
                    value={ccFormState.code}
                    onChange={(e) => setCcFormState({ ...ccFormState, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CC-1000"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Center Name *</label>
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
                    {companiesList.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={ccFormState.type}
                    onChange={(e) => setCcFormState({ ...ccFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Capital">Capital</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={ccFormState.manager}
                    onChange={(e) => setCcFormState({ ...ccFormState, manager: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={ccFormState.description}
                  onChange={(e) => setCcFormState({ ...ccFormState, description: e.target.value })}
                  placeholder="Enter detailed cost center description..."
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
    </div>
  );
}
