import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
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
  X
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_COST_CENTERS = [
  {
    id: 1,
    code: 'CC-1000',
    name: 'Corporate Services',
    company: 'Wavelogix FZC',
    type: 'Administrative',
    manager: 'Ahmed Khan',
    description: 'Executive management, legal services, administrative overhead, and general corporate facilities.',
    totalAssets: 245,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '08 Jan 2025 09:00 AM',
    lastModifiedBy: 'Ahmed Khan',
    lastModifiedOn: '15 Aug 2025 11:30 AM',
    relatedInfo: {
      departments: 3,
      locations: 2,
      assets: 245,
      maintenancePlans: 5,
      budgets: 1,
      documents: 4
    }
  },
  {
    id: 2,
    code: 'CC-1100',
    name: 'IT Infrastructure',
    company: 'Wavelogix FZC',
    type: 'Operational',
    manager: 'Priya Nair',
    description: 'IT infrastructure, servers, network and communication systems',
    totalAssets: 680,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '10 Jan 2025 09:15 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '28 Aug 2025 02:30 PM',
    relatedInfo: {
      departments: 4,
      locations: 3,
      assets: 680,
      maintenancePlans: 12,
      budgets: 1,
      documents: 6
    }
  },
  {
    id: 3,
    code: 'CC-1200',
    name: 'Finance',
    company: 'Wavelogix FZC',
    type: 'Administrative',
    manager: 'Ramesh Kumar',
    description: 'Financial management, treasury, accounting systems, and audit operations.',
    totalAssets: 320,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 10:45 AM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '20 Aug 2025 01:15 PM',
    relatedInfo: {
      departments: 2,
      locations: 2,
      assets: 320,
      maintenancePlans: 3,
      budgets: 1,
      documents: 5
    }
  },
  {
    id: 4,
    code: 'CC-1300',
    name: 'Human Resources',
    company: 'Wavelogix FZC',
    type: 'Administrative',
    manager: 'Sara Malik',
    description: 'HR operations, talent acquisition, training facilities, and payroll systems.',
    totalAssets: 180,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '14 Jan 2025 02:30 PM',
    lastModifiedBy: 'Sara Malik',
    lastModifiedOn: '22 Aug 2025 09:00 AM',
    relatedInfo: {
      departments: 2,
      locations: 2,
      assets: 180,
      maintenancePlans: 2,
      budgets: 1,
      documents: 3
    }
  },
  {
    id: 5,
    code: 'CC-2000',
    name: 'Operations',
    company: 'Wavelogix FZC',
    type: 'Operational',
    manager: 'Hassan Ali',
    description: 'Core manufacturing operations, production lines, and plant equipment.',
    totalAssets: 950,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '16 Jan 2025 11:00 AM',
    lastModifiedBy: 'Hassan Ali',
    lastModifiedOn: '25 Aug 2025 04:20 PM',
    relatedInfo: {
      departments: 5,
      locations: 4,
      assets: 950,
      maintenancePlans: 18,
      budgets: 2,
      documents: 10
    }
  },
  {
    id: 6,
    code: 'CC-2100',
    name: 'Facilities Management',
    company: 'Wavelogix FZC',
    type: 'Operational',
    manager: 'Lina George',
    description: 'Building HVAC, electrical infrastructure, safety systems, and facility upkeep.',
    totalAssets: 420,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '18 Jan 2025 01:20 PM',
    lastModifiedBy: 'Lina George',
    lastModifiedOn: '27 Aug 2025 10:45 AM',
    relatedInfo: {
      departments: 3,
      locations: 3,
      assets: 420,
      maintenancePlans: 15,
      budgets: 1,
      documents: 8
    }
  },
  {
    id: 7,
    code: 'CC-2200',
    name: 'Logistics',
    company: 'Wavelogix FZC',
    type: 'Operational',
    manager: 'Omar Rahman',
    description: 'Warehouse equipment, fleet vehicles, delivery logistics, and material handling.',
    totalAssets: 360,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 09:30 AM',
    lastModifiedBy: 'Omar Rahman',
    lastModifiedOn: '29 Aug 2025 03:00 PM',
    relatedInfo: {
      departments: 3,
      locations: 2,
      assets: 360,
      maintenancePlans: 10,
      budgets: 1,
      documents: 7
    }
  },
  {
    id: 8,
    code: 'CC-3000',
    name: 'Sales & Commercial',
    company: 'Wavelogix FZC',
    type: 'Operational',
    manager: 'David Lee',
    description: 'Client servicing tools, mobile demo units, and sales office equipment.',
    totalAssets: 110,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '22 Jan 2025 03:15 PM',
    lastModifiedBy: 'David Lee',
    lastModifiedOn: '30 Aug 2025 11:20 AM',
    relatedInfo: {
      departments: 2,
      locations: 2,
      assets: 110,
      maintenancePlans: 1,
      budgets: 1,
      documents: 2
    }
  }
];

export function CostCentersTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, setShowAuditHistoryModal }) {
  const [costCentersList, setCostCentersList] = useState(INITIAL_COST_CENTERS);
  const [selectedCostCenter, setSelectedCostCenter] = useState(INITIAL_COST_CENTERS[1]);
  const [selectedCCIds, setSelectedCCIds] = useState([]);

  // Filter state
  const [ccSearchQuery, setCcSearchQuery] = useState('');
  const [ccCompanyFilter, setCcCompanyFilter] = useState('All Companies');
  const [ccStatusFilter, setCcStatusFilter] = useState('All');
  const [ccTypeFilter, setCcTypeFilter] = useState('All');

  // Modal state
  const [showAddCCModal, setShowAddCCModal] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState(null);
  const [ccFormState, setCcFormState] = useState({
    code: '',
    name: '',
    company: 'Wavelogix FZC',
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
        (cc.description && cc.description.toLowerCase().includes(ccSearchQuery.toLowerCase())) ||
        (cc.manager && cc.manager.toLowerCase().includes(ccSearchQuery.toLowerCase()));

      const matchesCompany =
        ccCompanyFilter === 'All Companies' || ccCompanyFilter === 'All' || cc.company === ccCompanyFilter;

      const matchesStatus =
        ccStatusFilter === 'All' || cc.status.toLowerCase() === ccStatusFilter.toLowerCase();

      const matchesType =
        ccTypeFilter === 'All' || ccTypeFilter === 'All Types' || cc.type === ccTypeFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesType;
    });
  }, [costCentersList, ccSearchQuery, ccCompanyFilter, ccStatusFilter, ccTypeFilter]);

  const handleResetCCFilters = () => {
    setCcSearchQuery('');
    setCcCompanyFilter('All Companies');
    setCcStatusFilter('All');
    setCcTypeFilter('All');
  };

  const handleOpenAddCCModal = (ccToEdit = null) => {
    if (ccToEdit) {
      setEditingCostCenter(ccToEdit);
      setCcFormState({
        code: ccToEdit.code,
        name: ccToEdit.name,
        company: ccToEdit.company || 'Wavelogix FZC',
        type: ccToEdit.type || 'Operational',
        manager: ccToEdit.manager || '',
        description: ccToEdit.description || '',
        status: ccToEdit.status || 'Active'
      });
    } else {
      setEditingCostCenter(null);
      setCcFormState({
        code: '',
        name: '',
        company: 'Wavelogix FZC',
        type: 'Operational',
        manager: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddCCModal(true);
  };

  const handleSaveCC = (e) => {
    e.preventDefault();
    if (!ccFormState.code || !ccFormState.name) return;

    if (editingCostCenter) {
      const updated = costCentersList.map((c) =>
        c.id === editingCostCenter.id
          ? {
              ...c,
              code: ccFormState.code.toUpperCase(),
              name: ccFormState.name,
              company: ccFormState.company,
              type: ccFormState.type,
              manager: ccFormState.manager,
              description: ccFormState.description,
              status: ccFormState.status,
              lastModifiedBy: 'Logged In User',
              lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + ' 02:30 PM'
            }
          : c
      );
      setCostCentersList(updated);
      if (selectedCostCenter?.id === editingCostCenter.id) {
        setSelectedCostCenter(updated.find((item) => item.id === editingCostCenter.id));
      }
      triggerToast && triggerToast(`Cost Center "${ccFormState.name}" updated successfully.`);
    } else {
      const newCC = {
        id: Date.now(),
        code: ccFormState.code.toUpperCase(),
        name: ccFormState.name,
        company: ccFormState.company,
        type: ccFormState.type,
        manager: ccFormState.manager,
        description: ccFormState.description,
        totalAssets: 0,
        status: ccFormState.status,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        lastModifiedBy: 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        relatedInfo: {
          departments: 1,
          locations: 1,
          assets: 0,
          maintenancePlans: 0,
          budgets: 1,
          documents: 0
        }
      };
      setCostCentersList([newCC, ...costCentersList]);
      setSelectedCostCenter(newCC);
      triggerToast && triggerToast(`Cost Center "${ccFormState.name}" created successfully.`);
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
      }) + ' 09:15 AM'
    };
    setCostCentersList([duplicated, ...costCentersList]);
    setSelectedCostCenter(duplicated);
    triggerToast && triggerToast(`Cost Center "${cc.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleCCStatus = (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cc.status === 'Active' ? 'Inactive' : 'Active';
    const updated = costCentersList.map((c) =>
      c.id === cc.id ? { ...c, status: newStatus } : c
    );
    setCostCentersList(updated);
    if (selectedCostCenter?.id === cc.id) {
      setSelectedCostCenter({ ...selectedCostCenter, status: newStatus });
    }
    triggerToast && triggerToast(`Cost Center "${cc.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteCostCenter = (cc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Cost Center "${cc.name}" (${cc.code})?`)) {
      const remaining = costCentersList.filter((c) => c.id !== cc.id);
      setCostCentersList(remaining);
      if (remaining.length > 0) setSelectedCostCenter(remaining[0]);
      triggerToast && triggerToast(`Cost Center "${cc.code}" deleted successfully.`);
    }
  };

  const handleToggleSelectAllCCs = () => {
    if (selectedCCIds.length === filteredCostCenters.length) {
      setSelectedCCIds([]);
    } else {
      setSelectedCCIds(filteredCostCenters.map((c) => c.id));
    }
  };

  const handleToggleSelectCC = (id, e) => {
    if (e) e.stopPropagation();
    if (selectedCCIds.includes(id)) {
      setSelectedCCIds(selectedCCIds.filter((item) => item !== id));
    } else {
      setSelectedCCIds([...selectedCCIds, id]);
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
              <option value="Wavelogix FZC">Wavelogix FZC</option>
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
              <option value="Operational">Operational</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetCCFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
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
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredCostCenters.length} Cost Centers Loaded
            </span>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCCIds.length === filteredCostCenters.length && filteredCostCenters.length > 0}
                      onChange={handleToggleSelectAllCCs}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Cost Center Code ↕</th>
                  <th className="py-3 px-3">Cost Center Name ↕</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCostCenters.map((cc, index) => {
                  const isSelected = selectedCostCenter?.id === cc.id;
                  const isChecked = selectedCCIds.includes(cc.id);
                  const isMenuOpen = activeRowMenuId === `cc-${cc.id}`;

                  return (
                    <tr
                      key={cc.id}
                      onClick={() => setSelectedCostCenter(cc)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectCC(cc.id, e)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{cc.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{cc.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{cc.company}</td>
                      <td className="py-2.5 px-3 text-slate-700">{cc.type}</td>
                      <td className="py-2.5 px-3 text-slate-800">{cc.manager}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {cc.totalAssets.toLocaleString()}
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
                      <td className="py-2.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedCostCenter(cc)}
                            title="View Details"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddCCModal(cc)}
                            title="Edit Cost Center"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `cc-${cc.id}`)}
                            title="More Actions"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {isMenuOpen && (
                          <div className="absolute right-2 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-left space-y-0.5">
                            <button
                              onClick={() => {
                                setSelectedCostCenter(cc);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddCCModal(cc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Cost Center</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateCostCenter(cc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => handleToggleCCStatus(cc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{cc.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCostCenter(cc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

          {selectedCostCenter && (
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
                <span className="text-slate-500 font-medium">Type</span>
                <span className="col-span-2 text-slate-700">{selectedCostCenter.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Manager</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCostCenter.manager}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedCostCenter.description}</span>
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedCostCenter.totalAssets.toLocaleString()}</span>
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
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.departments}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.locations}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.maintenancePlans}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <BarChart3 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Budgets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.budgets}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCostCenter.relatedInfo.documents}</span>
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
                    onChange={(e) => setCcFormState({ ...ccFormState, company: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="Wavelogix KSA">Wavelogix KSA</option>
                    <option value="Wavelogix Qatar">Wavelogix Qatar</option>
                  </select>
                </div>
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
                  {editingCostCenter ? 'Save Changes' : 'Create Cost Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
