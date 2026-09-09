import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import {
  X,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Power,
  Layers,
  Database,
  Building2,
  MapPin,
  Grid,
  Users
} from 'lucide-react';

const ENTITY_TYPE_MAP = {
  org: 'company',
  locations: 'site',
  classification: 'category',
  item_master: 'model',
  vendors: 'vendor',
  custodians: 'employee',
  maintenance: 'maintenance',
  reasons: 'reason',
  custom_fields: 'custom_field'
};

const DEEP_LINK_MODULES = {
  workflow: { path: '/workflows', label: 'Open Approval Workflow Designer' },
  floor_plans: { path: '/maps', label: 'Open Floor Maps & Locate Workbench' },
  auto_discovery: { path: '/discovery', label: 'Open IT Auto-Discovery Workbench' },
  contracts: { path: '/contracts', label: 'Open Contracts & Agreements Module' },
  maintenance: { path: '/maintenance', label: 'Open Maintenance Planner Module' },
  tagging: { path: '/tagging', label: 'Open Tagging & Barcodes Workbench' },
  finance: { path: '/finance', label: 'Open Financial & Depreciation Workbench' }
};

export function MasterDataDetailDrawer({ isOpen, onClose, card, onAddClick, userRole = 'SYS_ADMIN' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isReadOnly = userRole === 'AUDITOR' || userRole === 'MANAGEMENT';
  const entityType = card ? (ENTITY_TYPE_MAP[card.id] || card.id) : '';

  useEffect(() => {
    if (isOpen && card) {
      loadEntityItems();
    }
  }, [isOpen, card]);

  async function loadEntityItems() {
    if (!card) return;
    setLoading(true);
    setErrorMsg('');
    try {
      let endpoint = '';
      if (card.id === 'org') endpoint = '/master-data/companies?includeInactive=true';
      else if (card.id === 'locations') endpoint = '/master-data/sites?includeInactive=true';
      else if (card.id === 'classification') endpoint = '/master-data/categories?includeInactive=true';
      else if (card.id === 'item_master') endpoint = '/master-data/models?includeInactive=true';
      else if (card.id === 'custodians') endpoint = '/master-data/employees?includeInactive=true';
      else endpoint = `/master-data/${entityType}s?includeInactive=true`;

      const res = await api.get(endpoint);
      if (res && res.success) {
        const rawItems = res.companies || res.sites || res.categories || res.models || res.employees || res.manufacturers || res.departments || res.costCenters || res.fields || [];
        setItems(rawItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('Load entity items error / fallback:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(item) {
    if (isReadOnly) return;
    setActionLoadingId(item._id);
    setErrorMsg('');
    try {
      const res = await api.patch(`/master-data/entities/${entityType}/${item._id}/status`);
      if (res && res.success) {
        setSuccessMsg(res.message || 'Status updated successfully');
        setTimeout(() => setSuccessMsg(''), 4000);
        loadEntityItems();
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update record status');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(item) {
    if (isReadOnly) return;
    if (!window.confirm(`Are you sure you want to delete "${item.name || item.fullName || item.code || 'this record'}"?`)) {
      return;
    }

    setActionLoadingId(item._id);
    setErrorMsg('');
    try {
      const res = await api.delete(`/master-data/entities/${entityType}/${item._id}`);
      if (res && res.success) {
        setSuccessMsg(res.message || 'Record deleted successfully');
        setTimeout(() => setSuccessMsg(''), 4000);
        loadEntityItems();
      }
    } catch (err) {
      // Show backend dependency protection message
      setErrorMsg(err?.message || 'Record is currently in use by active assets or transactions and cannot be deleted.');
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!isOpen || !card) return null;

  const IconComp = card.icon || Database;
  const deepLink = DEEP_LINK_MODULES[card.id];

  // Filter items
  const filteredItems = items.filter(item => {
    const text = (item.name || item.fullName || item.code || item.label || '').toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());

    const isActive = item.active !== false;
    if (statusFilter === 'ACTIVE') return matchesSearch && isActive;
    if (statusFilter === 'INACTIVE') return matchesSearch && !isActive;
    return matchesSearch;
  });

  const activeCount = items.filter(i => i.active !== false).length;
  const inactiveCount = items.length - activeCount;

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 relative">

        {/* Drawer Header - Solid Background with Generous Padding */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#6c2bd9] text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
              <IconComp className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate">
                {card.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
                {card.desc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">

          {/* Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dependency / Action Warning</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Deep Link to Specialized Module */}
          {deepLink && (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#6c2bd9]">Dedicated Workspace Available</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Manage advanced workflow logic, visual maps, or auto-discovery rules in full editor.</p>
              </div>
              <a
                href={deepLink.path}
                className="btn-primary text-xs px-3 py-2 shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>{deepLink.label}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Stats Bar & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                Total: <strong className="text-slate-900">{items.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active: <strong>{activeCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                Inactive: <strong>{inactiveCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isReadOnly && onAddClick && (
                <button
                  onClick={onAddClick}
                  className="btn-primary text-xs px-3 py-1.5 font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Record</span>
                </button>
              )}
              <button
                onClick={loadEntityItems}
                disabled={loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search & Status Filter Tabs */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by name, code, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-primary pl-9 text-xs py-2 w-full"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'INACTIVE' ? 'bg-white text-slate-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#6c2bd9] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading {card.title} reference data...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">No records configured</p>
                <p className="text-[11px] text-slate-500 mt-1">No reference data matches your filter criteria.</p>
              </div>
              {!isReadOnly && onAddClick && (
                <button
                  onClick={onAddClick}
                  className="btn-secondary text-xs px-3 py-1.5 font-bold mx-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Record</span>
                </button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Code / Name</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {!isReadOnly && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.map((item) => {
                    const isActive = item.active !== false;
                    const isProcessing = actionLoadingId === item._id;

                    return (
                      <tr key={item._id || item.id || item.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 truncate">
                            {item.name || item.fullName || item.code || item.label || 'Unnamed Record'}
                          </div>
                          {item.code && (
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {item.code}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {item.email && <div className="truncate">{item.email}</div>}
                          {item.description && <div className="line-clamp-1 text-slate-500">{item.description}</div>}
                          {item.depreciationMethod && <div className="text-slate-500">{item.depreciationMethod} • {item.defaultUsefulLifeMonths}m life</div>}
                          {item.city && <div className="text-slate-500">{item.city}, {item.country}</div>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(item)}
                                disabled={isProcessing}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isActive
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                title={isActive ? 'Deactivate Record' : 'Activate Record'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(item)}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer Footer - Solid Background */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Asset 360° Master Configuration Center</span>
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

