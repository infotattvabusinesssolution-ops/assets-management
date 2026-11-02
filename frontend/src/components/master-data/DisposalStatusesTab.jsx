import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Check,
  CheckCircle2,
  Trash,
  Tag,
  DollarSign,
  Info,
  Download,
  Filter
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export const INITIAL_DISPOSAL_STATUSES = [
  { id: 'disp-01', code: 'SCRAPPED', name: 'Scrapped', description: 'Asset sent to recycling or salvage yard with zero or scrap residual value', active: true },
  { id: 'disp-02', code: 'SOLD', name: 'Sold', description: 'Asset sold to third party or employee with recovered disposal proceeds', active: true },
  { id: 'disp-03', code: 'DONATED', name: 'Donated', description: 'Asset donated to charitable, educational, or non-profit organization', active: true },
  { id: 'disp-04', code: 'WRITTEN_OFF', name: 'Written Off', description: 'Asset written off books due to total loss, severe casualty, or obsolescence', active: true },
  { id: 'disp-05', code: 'TRADED_IN', name: 'Traded In', description: 'Asset returned or exchanged toward the purchase of replacement equipment', active: true }
];

export function DisposalStatusesTab({ triggerToast, externalShowAddModal, setExternalShowAddModal }) {
  const [statuses, setStatuses] = useState(INITIAL_DISPOSAL_STATUSES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    active: true
  });

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/master-data/disposal-statuses').catch(() => null);
      if (res && res.disposalStatuses && Array.isArray(res.disposalStatuses)) {
        setStatuses(res.disposalStatuses);
      } else {
        const stored = localStorage.getItem('fams_disposal_statuses');
        if (stored) {
          try { setStatuses(JSON.parse(stored)); } catch (_) { setStatuses(INITIAL_DISPOSAL_STATUSES); }
        } else {
          setStatuses(INITIAL_DISPOSAL_STATUSES);
        }
      }
    } catch (_) {
      setStatuses(INITIAL_DISPOSAL_STATUSES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAdd();
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleOpenAdd = () => {
    setEditingStatus(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      active: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingStatus(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      active: item.active !== false
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerToast?.('Name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingStatus) {
        await api.put(`/master-data/disposal-statuses/${editingStatus.id}`, formData).catch(() => null);
        setStatuses(prev => {
          const updated = prev.map(s => s.id === editingStatus.id ? { ...s, ...formData } : s);
          try { localStorage.setItem('fams_disposal_statuses', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        triggerToast?.('Disposal status updated successfully', 'success');
      } else {
        const res = await api.post('/master-data/disposal-statuses', formData).catch(() => null);
        const newRecord = res?.disposalStatus || {
          id: 'disp-' + Date.now().toString(36),
          code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '_'),
          name: formData.name.trim(),
          description: formData.description.trim(),
          active: formData.active
        };
        setStatuses(prev => {
          const updated = [...prev, newRecord];
          try { localStorage.setItem('fams_disposal_statuses', JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        triggerToast?.('Disposal status created successfully', 'success');
      }
      setShowAddModal(false);
    } catch (err) {
      triggerToast?.(err.message || 'Failed to save disposal status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!statusToDelete) return;
    setIsSaving(true);
    try {
      await api.delete(`/master-data/disposal-statuses/${statusToDelete.id}`).catch(() => null);
      setStatuses(prev => {
        const updated = prev.filter(s => s.id !== statusToDelete.id);
        try { localStorage.setItem('fams_disposal_statuses', JSON.stringify(updated)); } catch (_) {}
        return updated;
      });
      triggerToast?.('Disposal status deleted successfully', 'success');
      setStatusToDelete(null);
    } catch (err) {
      triggerToast?.(err.message || 'Failed to delete disposal status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStatuses = useMemo(() => {
    return statuses.filter(s => {
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
  }, [statuses, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Description', 'Status'];
    const rows = filteredStatuses.map(s => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${(s.description || '').replace(/"/g, '""')}"`,
      `"${s.active !== false ? 'Active' : 'Inactive'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `disposal_statuses_${new Date().toISOString().split('T')[0]}.csv`);
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
              placeholder="Search by code, status name, or description..."
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
            onClick={fetchStatuses}
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
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Disposal Status
          </button>
        </div>
      </div>

      {/* Guidance Note regarding Master Data vs System Enumeration */}
      <div className="bg-purple-50/60 border border-purple-200/60 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#6C2BD9] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-purple-900 block mb-0.5">Disposal Master vs System Enumeration Architecture:</span>
          Per the Asset 360 requirements, <span className="font-semibold text-slate-900">Disposal Status</span> is user-configurable master data representing what happens to the asset (e.g. Scrapped, Sold, Donated, Written Off), while <span className="font-semibold text-slate-900">Disposal Reason</span> (End of Life, Theft/Loss, Damaged, Impairment) is kept as a strict system-defined enumeration.
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-5">Disposal Status Name</th>
                <th className="py-3 px-5">Description & Scope</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Trash className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No disposal statuses found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search criteria or add a new disposal status.</p>
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-purple-700">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {item.name}
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
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-[#6C2BD9] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Status"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStatusToDelete(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Status"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center">
                  <Trash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingStatus ? 'Edit Disposal Status' : 'Add Disposal Status'}
                  </h3>
                  <span className="text-[11px] text-slate-500">Master Data Configuration</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Status Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrapped, Sold, Donated, Written Off"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name,
                      code: prev.code || name.toUpperCase().replace(/\s+/g, '_')
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Status Code <span className="text-slate-400 font-normal">(System Identifier)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SCRAPPED, SOLD"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-700 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Description & Intended Scope
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe when this disposal status should be selected during asset retirement..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="statusActiveCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-[#6C2BD9] rounded border-slate-300 focus:ring-[#6C2BD9]"
                />
                <label htmlFor="statusActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Active (Available for asset disposal transactions)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? 'Saving...' : editingStatus ? 'Update Status' : 'Create Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {statusToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">Delete Disposal Status?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{statusToDelete.name}</span> ({statusToDelete.code})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStatusToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
