import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  AlertTriangle,
  X,
  CheckCircle2,
  Upload,
  Filter,
  HeartPulse,
  Activity,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';

export const INITIAL_CONDITIONS = [];

const getConditionBadgeStyle = (code = '', name = '') => {
  const norm = (code + ' ' + name).toUpperCase();
  if (norm.includes('NEW')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (norm.includes('GOOD')) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (norm.includes('FAIR')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (norm.includes('POOR')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (norm.includes('DAMAGED') || norm.includes('BROKEN')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (norm.includes('SCRAP')) return 'bg-red-50 text-red-700 border-red-200';
  if (norm.includes('REFURBISHED')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return 'bg-purple-50 text-purple-700 border-purple-200';
};

export function ConditionsTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  activeRowMenuId: propActiveRowMenuId,
  setActiveRowMenuId: propSetActiveRowMenuId
}) {
  const [localActiveRowMenuId, setLocalActiveRowMenuId] = useState(null);
  const activeRowMenuId = propActiveRowMenuId !== undefined ? propActiveRowMenuId : localActiveRowMenuId;
  const setActiveRowMenuId = propSetActiveRowMenuId || setLocalActiveRowMenuId;

  const [conditions, setConditions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [conditionToDelete, setConditionToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    active: true
  });

  const fetchConditions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/master-data/asset-conditions?includeInactive=true').catch(() => null);
      if (res && res.assetConditions && Array.isArray(res.assetConditions)) {
        setConditions(res.assetConditions);
      } else {
        const stored = localStorage.getItem('fams_asset_conditions');
        if (stored) {
          try { setConditions(JSON.parse(stored)); } catch (_) { setConditions([]); }
        } else {
          setConditions([]);
        }
      }
    } catch (_) {
      setConditions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAdd();
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleOpenAdd = () => {
    setModalError('');
    setEditingCondition(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      active: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalError('');
    setEditingCondition(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      active: item.active !== false
    });
    setShowAddModal(true);
  };

  const handleDuplicateCondition = (item) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    setEditingCondition(null);
    setFormData({
      code: `${item.code || 'COND'}-COPY`,
      name: `${item.name || ''} (Copy)`,
      description: item.description || '',
      active: true
    });
    setShowAddModal(true);
  };

  const handleToggleStatus = async (item, e) => {
    e?.stopPropagation();
    const nextActive = item.active === false ? true : false;
    try {
      await api.put(`/master-data/asset-conditions/${item.id}`, { active: nextActive }).catch(() => null);
      setConditions(prev => {
        const updated = prev.map(s => s.id === item.id ? { ...s, active: nextActive } : s);
        try { localStorage.setItem('fams_asset_conditions', JSON.stringify(updated)); } catch (_) {}
        return updated;
      });
      triggerToast?.(`Asset condition marked as ${nextActive ? 'Active' : 'Inactive'}`, 'success');
    } catch {
      triggerToast?.('Failed to update status', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!formData.name.trim()) {
      setModalError('Condition Name is required');
      triggerToast?.('Condition Name is required', 'error');
      return;
    }

    const trimmedCode = (formData.code || '').trim().toUpperCase();
    const trimmedName = formData.name.trim().toLowerCase();

    // Check duplicate code
    if (trimmedCode) {
      const dupCode = conditions.find(s => s.id !== editingCondition?.id && (s.code || '').trim().toUpperCase() === trimmedCode);
      if (dupCode) {
        const msg = `Condition Code "${trimmedCode}" already exists. Duplicate codes are not allowed.`;
        setModalError(msg);
        triggerToast?.(msg, 'error');
        return;
      }
    }

    // Check duplicate name
    const dupName = conditions.find(s => s.id !== editingCondition?.id && (s.name || '').trim().toLowerCase() === trimmedName);
    if (dupName) {
      const msg = `Condition Name "${formData.name.trim()}" already exists. Duplicate names are not allowed.`;
      setModalError(msg);
      triggerToast?.(msg, 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCondition) {
        await api.put(`/master-data/asset-conditions/${editingCondition.id}`, formData);
        setConditions(prev => {
          const updated = prev.map(s => s.id === editingCondition.id ? { ...s, ...formData } : s);
          try { localStorage.setItem('fams_asset_conditions', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        triggerToast?.('Condition updated successfully', 'success');
      } else {
        const res = await api.post('/master-data/asset-conditions', formData);
        const newRecord = res?.assetCondition || res?.condition || {
          id: 'cond-' + Date.now().toString(36),
          code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '_'),
          name: formData.name.trim(),
          description: formData.description.trim(),
          active: formData.active
        };
        setConditions(prev => {
          const updated = [...prev, newRecord];
          try { localStorage.setItem('fams_asset_conditions', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        triggerToast?.('Condition created successfully', 'success');
      }
      setShowAddModal(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save condition';
      setModalError(errMsg);
      triggerToast?.(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!conditionToDelete) return;
    setIsSaving(true);
    try {
      await api.delete(`/master-data/asset-conditions/${conditionToDelete.id}`).catch(() => null);
      setConditions(prev => {
        const updated = prev.filter(s => s.id !== conditionToDelete.id);
        try { localStorage.setItem('fams_asset_conditions', JSON.stringify(updated)); } catch (_) {}
        return updated;
      });
      triggerToast?.('Condition deleted successfully', 'success');
      setConditionToDelete(null);
    } catch (err) {
      triggerToast?.(err.message || 'Failed to delete condition', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredConditions = useMemo(() => {
    return conditions.filter(s => {
      const matchesSearch = !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.active !== false) ||
        (statusFilter === 'INACTIVE' && s.active === false);

      return matchesSearch && matchesFilter;
    });
  }, [conditions, searchQuery, statusFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedConditions,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredConditions, 10);

  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Description', 'Status'];
    const rows = filteredConditions.map(s => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${(s.description || '').replace(/"/g, '""')}"`,
      `"${s.active !== false ? 'Active' : 'Inactive'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asset_conditions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, condition name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
            >
              <option value="ALL">All Records</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={fetchConditions}
            disabled={isLoading}
            className="p-2 border border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin text-[#6C2BD9]")} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-2 text-center">#</th>
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-5">Condition Name</th>
                <th className="py-3 px-5">Description & Physical State</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredConditions.length === 0 ? (
                <MasterEmptyState
                  icon={ShieldCheck}
                  title="No Conditions found"
                  subtitle={searchQuery ? "No conditions match your search criteria." : "Get started by defining your first asset condition."}
                  actionLabel="Add Condition"
                  onAction={handleOpenAdd}
                  colSpan={6}
                />
              ) : (
                pagedConditions.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-2 text-center text-slate-400 text-[11px] font-medium">{startIndex + index + 1}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-purple-700">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border mr-2", getConditionBadgeStyle(item.code, item.name))}>
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-md">
                      {item.description || <span className="text-slate-400 italic">No description provided</span>}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        item.active !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {item.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Condition"
                          className="p-1.5 text-slate-500 hover:text-[#6C2BD9] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <RowActionsMenu
                          isOpen={activeRowMenuId === `cond-${item.id}`}
                          onToggle={() => setActiveRowMenuId && setActiveRowMenuId(activeRowMenuId === `cond-${item.id}` ? null : `cond-${item.id}`)}
                          onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId && setActiveRowMenuId(null);
                              handleOpenEdit(item);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Condition</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId && setActiveRowMenuId(null);
                              handleDuplicateCondition(item);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              setActiveRowMenuId && setActiveRowMenuId(null);
                              handleToggleStatus(item, e);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.active !== false ? 'Mark Inactive' : 'Mark Active'}</span>
                          </button>
                          <div className="h-px bg-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId && setActiveRowMenuId(null);
                              setConditionToDelete(item);
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <MasterDataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredConditions.length}
          startIndex={startIndex}
        />
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6C2BD9]" />
                {editingCondition ? 'Edit Condition' : 'Add Condition'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition Code
                </label>
                <MasterCodeInput
                  value={formData.code}
                  onChange={(val) => setFormData({ ...formData, code: val })}
                  entityKey="asset_condition"
                  nameSeed={formData.name}
                  existingList={conditions}
                  placeholder="e.g. 001 or NEW"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand New, Good, Fair, Poor, Damaged, Scrap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#6C2BD9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Physical Criteria
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational state, physical wear, or inspection criteria for this condition..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#6C2BD9] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.active ? 'Active' : 'Inactive'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'Active' })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#6C2BD9] transition-colors bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#6C2BD9] text-white font-bold text-xs rounded-xl hover:bg-[#5B21B6] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCondition ? 'Save Changes' : 'Create Condition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {conditionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Condition</h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{conditionToDelete.name}"</span>? Assets currently assigned to this condition will retain their recorded state, but this condition will no longer be available for new selections.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConditionToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Condition</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
