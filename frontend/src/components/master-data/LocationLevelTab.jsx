import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Layers
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function LocationLevelTab({
  level = 1,
  levelName = 'Location Level 1',
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  activeRowMenuId: propActiveRowMenuId,
  setActiveRowMenuId: propSetActiveRowMenuId,
  onNavigateTab
}) {
  const [localActiveRowMenuId, setLocalActiveRowMenuId] = useState(null);
  const activeRowMenuId = propActiveRowMenuId !== undefined ? propActiveRowMenuId : localActiveRowMenuId;
  const setActiveRowMenuId = propSetActiveRowMenuId || setLocalActiveRowMenuId;

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    description: '',
    status: 'Active'
  });

  const storageKey = `fams_custom_location_level_${level}`;

  // External trigger for Add Modal
  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddModal();
      setExternalShowAddModal && setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  // Load records
  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/master-data/location-levels/${level}?includeInactive=true`).catch(() => null);
      let custom = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let serverRecords = [];
      if (res?.locationLevels && Array.isArray(res.locationLevels)) {
        serverRecords = res.locationLevels.map((it) => ({
          id: it.id,
          code: it.code,
          name: it.name,
          description: it.description || '',
          status: it.active === false || it.status === 'Inactive' ? 'Inactive' : 'Active',
          active: it.active !== false && it.status !== 'Inactive',
          createdAt: it.createdAt,
          updatedAt: it.updatedAt
        }));
      }

      const serverCodes = new Set(serverRecords.map(x => (x.code || '').toUpperCase().trim()).filter(Boolean));
      const missingCustom = custom.filter(c => {
        const code = (c.code || '').toUpperCase().trim();
        return !code || !serverCodes.has(code);
      }).map(c => ({
        ...c,
        status: c.status || (c.active === false ? 'Inactive' : 'Active'),
        active: c.active !== false && c.status !== 'Inactive'
      }));

      // Automatically sync any local records that were saved while backend was offline
      if (missingCustom.length > 0) {
        for (const it of missingCustom) {
          try {
            await api.post(`/master-data/location-levels/${level}`, {
              code: it.code,
              name: it.name,
              description: it.description || '',
              status: it.status,
              active: it.active
            });
          } catch (syncErr) {
            console.warn(`Syncing custom item ${it.code} to DB skipped:`, syncErr.message);
          }
        }
      }

      const combined = [...serverRecords, ...missingCustom];
      setItems(combined);
      setSelectedItem((prev) => (prev ? combined.find(i => i.id === prev.id) || combined[0] || null : combined[0] || null));
    } catch (err) {
      console.warn(`Failed to load records for Location Level ${level}:`, err);
      const custom = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setItems(custom);
      setSelectedItem(custom[0] || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [level]);

  // Filtered & Paginated records
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const {
    currentPage,
    setCurrentPage,
    paginatedItems: paginatedData = [],
    totalPages,
    startIndex = 0,
    totalItems = 0,
    pageSize = 10
  } = usePagination(filteredItems, 10);
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormState({
      code: '',
      name: '',
      description: '',
      status: 'Active'
    });
    setModalError('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setEditingItem(item);
    setFormState({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      status: item.status || 'Active'
    });
    setModalError('');
    setShowAddModal(true);
  };

  // Save Add / Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      setModalError('Location Name is required.');
      return;
    }

    const cleanCode = formState.code.trim().toUpperCase();
    const cleanName = formState.name.trim();

    // Check duplicate code
    if (cleanCode) {
      const isDuplicateCode = items.some(
        (item) =>
          (!editingItem || item.id !== editingItem.id) &&
          (item.code || '').toUpperCase() === cleanCode
      );
      if (isDuplicateCode) {
        setModalError(`Location Code "${cleanCode}" already exists in ${levelName}. Duplicate codes are not allowed.`);
        return;
      }
    }

    // Check duplicate name
    const isDuplicateName = items.some(
      (item) =>
        (!editingItem || item.id !== editingItem.id) &&
        (item.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicateName) {
      setModalError(`Location Name "${cleanName}" already exists in ${levelName}. Duplicate names are not allowed.`);
      return;
    }

    try {
      if (editingItem) {
        // Edit record
        await api.put(`/master-data/location-levels/${level}/${editingItem.id}`, {
          code: cleanCode,
          name: cleanName,
          description: formState.description.trim(),
          status: formState.status,
          active: formState.status === 'Active'
        });

        const updatedItems = items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                code: cleanCode,
                name: cleanName,
                description: formState.description.trim(),
                status: formState.status,
                active: formState.status === 'Active',
                updatedAt: new Date().toISOString()
              }
            : item
        );
        setItems(updatedItems);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        if (selectedItem?.id === editingItem.id) {
          setSelectedItem({
            ...selectedItem,
            code: cleanCode,
            name: cleanName,
            description: formState.description.trim(),
            status: formState.status,
            active: formState.status === 'Active'
          });
        }
        triggerToast && triggerToast(`${levelName} record "${cleanCode}" updated successfully.`);
      } else {
        // Create new record
        const payload = {
          name: cleanName,
          description: formState.description.trim(),
          status: formState.status,
          active: formState.status === 'Active'
        };
        if (cleanCode) payload.code = cleanCode;
        const res = await api.post(`/master-data/location-levels/${level}`, payload);

        const newItem = {
          id: res?.locationLevel?.id || `loc-lvl${level}-${Date.now()}`,
          code: res?.locationLevel?.code || cleanCode,
          name: cleanName,
          description: formState.description.trim(),
          status: formState.status,
          active: formState.status === 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updatedItems = [newItem, ...items];
        setItems(updatedItems);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        setSelectedItem(newItem);
        triggerToast && triggerToast(`New ${levelName} record "${cleanCode}" created successfully.`);
      }

      setShowAddModal(false);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Operation failed. Please try again.');
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (item) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/master-data/location-levels/${level}/${item.id}`, {
        status: newStatus,
        active: newStatus === 'Active'
      }).catch(() => null);

      const updated = items.map((i) =>
        i.id === item.id ? { ...i, status: newStatus, active: newStatus === 'Active' } : i
      );
      setItems(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, status: newStatus, active: newStatus === 'Active' });
      }
      triggerToast && triggerToast(`${levelName} "${item.code}" status changed to ${newStatus}.`);
    } catch (err) {
      triggerToast && triggerToast('Failed to update status.');
    }
  };

  // Duplicate record
  const handleDuplicate = (item) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...item,
      id: `loc-lvl${level}-${Date.now()}`,
      code: `${item.code}-COPY`,
      name: `${item.name} (Copy)`,
      status: 'Active',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [duplicated, ...items];
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSelectedItem(duplicated);
    triggerToast && triggerToast(`Duplicated as "${duplicated.code}".`);
  };

  // Delete Record
  const handleInitiateDelete = (item) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/master-data/location-levels/${level}/${itemToDelete.id}`).catch(() => null);
      const updated = items.filter((i) => i.id !== itemToDelete.id);
      setItems(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(updated[0] || null);
      }
      triggerToast && triggerToast(`${levelName} record "${itemToDelete.code}" deleted.`);
    } catch (err) {
      triggerToast && triggerToast('Failed to delete record.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Grid: Table (Left) + Detail Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Records Table */}
        <div className={`${filteredItems.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3 transition-all duration-200`}>
          {/* Controls: Search, Status Filter, Refresh, Add Button */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${levelName.toLowerCase()} by code, name, description...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadRecords}
                title="Refresh Records"
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-3">Location Code</th>
                    <th className="py-3 px-3">Location Name</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6C2BD9]" />
                        <span>Loading {levelName} records...</span>
                      </td>
                    </tr>
                  ) : (!paginatedData || filteredItems.length === 0) ? (
                    <MasterEmptyState
                      icon={MapPin}
                      title={`No ${levelName} records found`}
                      subtitle={searchQuery ? `No ${levelName.toLowerCase()} records match your search criteria.` : `Get started by defining your first ${levelName.toLowerCase()}.`}
                      actionLabel={`Add ${levelName}`}
                      onAction={handleOpenAddModal}
                      colSpan={6}
                    />
                  ) : (
                    paginatedData.map((item, index) => {
                      const isSelected = selectedItem?.id === item.id;
                      const globalIndex = startIndex + index + 1;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={clsx(
                            'hover:bg-purple-50/40 transition-colors cursor-pointer',
                            isSelected && 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]'
                          )}
                        >
                          <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                            {globalIndex}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-[#6C2BD9]">{item.code}</span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                            {item.description || '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={clsx(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                item.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              )}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left">
                              <RowActionsMenu
                                isOpen={activeRowMenuId === item.id}
                                onToggle={() => setActiveRowMenuId(activeRowMenuId === item.id ? null : item.id)}
                                onClose={() => setActiveRowMenuId(null)}
                                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenuId(null);
                                    handleOpenEditModal(item);
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit Record</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenuId(null);
                                    handleDuplicate(item);
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenuId(null);
                                    handleToggleStatus(item);
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{item.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenuId(null);
                                    handleInitiateDelete(item);
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredItems.length > 0 && (
              <MasterDataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>

        {/* Right Column: Detail Card / Drawer */}
        {filteredItems.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{levelName} Details</h3>
                  <p className="text-[10px] text-slate-400">Inspecting enterprise master item</p>
                </div>
              </div>
              {selectedItem && (
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    selectedItem.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  )}
                >
                  {selectedItem.status}
                </span>
              )}
            </div>

            {selectedItem ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location Code</label>
                  <p className="font-mono font-bold text-sm text-[#6C2BD9] mt-0.5">{selectedItem.code}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location Name</label>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedItem.name}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hierarchy Tier</label>
                  <p className="text-slate-700 mt-0.5 font-medium">{levelName} (Tier {level})</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                  <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {selectedItem.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400">Created On</span>
                    <span>{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400">Last Modified</span>
                    <span>{selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleDateString() : '-'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedItem)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>Edit Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedItem)}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold flex items-center justify-center gap-1 cursor-pointer"
                    title={selectedItem.status === 'Active' ? 'Deactivate' : 'Activate'}
                  >
                    <span>{selectedItem.status === 'Active' ? 'Make Inactive' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Select any record from the table to preview its configuration details.</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingItem ? `Edit ${levelName}` : `Add New ${levelName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Location Code
                </label>
                <MasterCodeInput
                  entityKey={`location_level_${level}`}
                  value={formState.code}
                  onChange={(code) => setFormState({ ...formState, code })}
                  disabled={!!editingItem}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${level === 1 ? 'North America Region / Corporate Campus' : level === 2 ? 'Main Technical Center' : level === 3 ? 'Building A - West Wing' : 'Server Room 101'}`}
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder={`Enter details, scope or address information for this ${levelName.toLowerCase()}...`}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] focus:outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : `Add ${levelName}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(showDeleteModal && itemToDelete)}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName={levelName}
        itemName={itemToDelete?.name}
        itemCode={itemToDelete?.code}
      />
    </div>
  );
}

export default LocationLevelTab;

