import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Building2,
  DollarSign,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export function CompaniesTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    currency: 'AED',
    taxId: '',
    address: '',
    status: 'Active'
  });

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/master-data/companies?includeInactive=true').catch(() => null);
      if (res?.companies && Array.isArray(res.companies) && res.companies.length > 0) {
        setCompanies(res.companies);
        setSelectedCompany(res.companies[0] || null);
      } else {
        setCompanies([]);
        setSelectedCompany(null);
      }
    } catch (err) {
      console.warn('Failed to load companies:', err);
      setCompanies([]);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = !searchQuery ||
        (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.taxId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && c.active !== false) ||
        (statusFilter === 'Inactive' && c.active === false);

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchQuery, statusFilter]);

  const handleOpenAddModal = (compToEdit = null) => {
    setModalError('');
    if (compToEdit) {
      setEditingCompany(compToEdit);
      setFormState({
        code: compToEdit.code || '',
        name: compToEdit.name || '',
        currency: compToEdit.currency || 'AED',
        taxId: compToEdit.taxId || '',
        address: compToEdit.address || '',
        status: compToEdit.active === false ? 'Inactive' : 'Active'
      });
    } else {
      setEditingCompany(null);
      setFormState({
        code: '',
        name: '',
        currency: 'AED',
        taxId: '',
        address: '',
        status: 'Active'
      });
    }
    setShowAddModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.code.trim()) {
      setModalError('Company Code and Name are required.');
      return;
    }

    setIsSaving(true);
    setModalError('');

    try {
      const payload = {
        code: formState.code.trim().toUpperCase(),
        name: formState.name.trim(),
        currency: formState.currency,
        taxId: formState.taxId.trim(),
        address: formState.address.trim(),
        active: formState.status === 'Active'
      };

      if (editingCompany) {
        const res = await api.put(`/master-data/companies/${editingCompany.id}`, payload);
        const updatedComp = res?.company || { ...editingCompany, ...payload };
        const updated = companies.map(c => c.id === editingCompany.id ? updatedComp : c);
        setCompanies(updated);
        if (selectedCompany?.id === editingCompany.id) setSelectedCompany(updatedComp);
        triggerToast && triggerToast(`Company "${updatedComp.name}" updated successfully.`);
      } else {
        const res = await api.post('/master-data/companies', payload);
        const newComp = res?.company || { ...payload, id: `cmp-${Date.now()}` };
        const updated = [newComp, ...companies];
        setCompanies(updated);
        setSelectedCompany(newComp);
        triggerToast && triggerToast(`Company "${newComp.name}" created successfully.`);
      }
      setShowAddModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save company.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (comp, e) => {
    e?.stopPropagation();
    const nextStatus = comp.active === false ? true : false;
    try {
      await api.put(`/master-data/companies/${comp.id}`, { active: nextStatus });
      const updated = companies.map(c => c.id === comp.id ? { ...c, active: nextStatus } : c);
      setCompanies(updated);
      if (selectedCompany?.id === comp.id) setSelectedCompany({ ...selectedCompany, active: nextStatus });
      triggerToast && triggerToast(`Company "${comp.name}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch {
      triggerToast && triggerToast('Failed to update company status.');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master-data/companies/${companyToDelete.id}`);
      const updated = companies.filter(c => c.id !== companyToDelete.id);
      setCompanies(updated);
      if (selectedCompany?.id === companyToDelete.id) setSelectedCompany(updated[0] || null);
      triggerToast && triggerToast(`Company "${companyToDelete.name}" deleted successfully.`);
      setShowDeleteConfirmModal(false);
      setCompanyToDelete(null);
    } catch (err) {
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to delete company.');
    } finally {
      setIsDeleting(false);
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
              placeholder="Search companies by code, name, tax ID, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
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

      {/* Main Grid: Companies Table & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Companies Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100/60 text-[#6C2BD9] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Registered Companies</h3>
                <p className="text-[10px] text-slate-400 font-medium">Enterprise corporate legal entities and subsidiaries</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#6C2BD9] bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full">
              {filteredCompanies.length} Records
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#6C2BD9]" />
              <p className="text-xs font-semibold">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-bold text-slate-700">No companies found</p>
              <button
                onClick={() => handleOpenAddModal(null)}
                className="text-xs text-[#6C2BD9] font-bold hover:underline"
              >
                + Register a new company
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-3">Currency</th>
                    <th className="py-3 px-3">Tax ID / TRN</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((c) => {
                    const isSelected = selectedCompany?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCompany(c)}
                        className={clsx(
                          'hover:bg-purple-50/40 cursor-pointer transition-colors group',
                          isSelected && 'bg-purple-50/70 font-semibold'
                        )}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#6C2BD9] bg-purple-100/70 px-2 py-0.5 rounded-md">
                            {c.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#6C2BD9] transition-colors leading-snug">
                            {c.name}
                          </div>
                          {c.address && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              {c.address}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {c.currency || 'USD'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {c.taxId || '—'}
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
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(c)}
                              title="Edit Company"
                              className="p-1 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100/60 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCompanyToDelete(c);
                                setShowDeleteConfirmModal(true);
                              }}
                              title="Deactivate Company"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Inspection Details Drawer (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          {selectedCompany ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                    {selectedCompany.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedCompany.name}</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal(selectedCompany)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Company Attributes */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Company Details
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Base Currency:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedCompany.currency || 'USD'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-500 font-medium">Tax Registration / TRN:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedCompany.taxId || 'Not registered'}</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-1.5 space-y-1">
                    <span className="text-slate-500 font-medium block">Corporate Address:</span>
                    <p className="text-slate-700 leading-relaxed">{selectedCompany.address || 'No address specified'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                <span>Companies form the top root of the organizational hierarchy. Departments and cost centers connect here.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">Select a company to inspect details</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add / Edit Company */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Corporate entity definition for multi-company asset management
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

            <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. ACME-CORP"
                    value={formState.code}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={formState.currency}
                    onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation LLC"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax ID / VAT TRN</label>
                <input
                  type="text"
                  placeholder="e.g. 100293847500003"
                  value={formState.taxId}
                  onChange={(e) => setFormState({ ...formState, taxId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Address</label>
                <textarea
                  rows={2}
                  placeholder="Headquarters address, tower, city, country..."
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="font-semibold text-slate-700">Status:</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formState.status === 'Active'}
                    onChange={() => setFormState({ ...formState, status: 'Active' })}
                    className="accent-[#6C2BD9]"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formState.status === 'Inactive'}
                    onChange={() => setFormState({ ...formState, status: 'Inactive' })}
                    className="accent-[#6C2BD9]"
                  />
                  <span>Inactive</span>
                </label>
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
                  <span>{editingCompany ? 'Save Changes' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Deactivate Company</h3>
                <p className="text-[11px] text-slate-500">Deactivate rather than delete to preserve asset history.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to deactivate <span className="font-bold text-slate-900">"{companyToDelete?.name}"</span> ({companyToDelete?.code})?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

