import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Copy,
  AlertTriangle,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Layers,
  Tag,
  FolderTree,
  Box,
  X,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { DEFAULT_ASSET_TYPES } from './GenericMasterTab';
import { SmartDeleteModal } from './SmartDeleteModal';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';

export const INITIAL_ASSET_GROUPS = [];

export function AssetGroupsTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  reloadTrigger,
  onNavigateTab,
  activeRowMenuId: propActiveRowMenuId,
  setActiveRowMenuId: propSetActiveRowMenuId
}) {
  const [localActiveRowMenuId, setLocalActiveRowMenuId] = useState(null);
  const activeRowMenuId = propActiveRowMenuId !== undefined ? propActiveRowMenuId : localActiveRowMenuId;
  const setActiveRowMenuId = propSetActiveRowMenuId || setLocalActiveRowMenuId;

  const [assetGroups, setAssetGroups] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveSubCategories, setLiveSubCategories] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [smartDeleteState, setSmartDeleteState] = useState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });

  // Related items explorer modal state
  const [selectedRelatedType, setSelectedRelatedType] = useState(null); // 'classes' | 'categories' | 'subcategories'
  const [relatedSearchQuery, setRelatedSearchQuery] = useState('');

  const [grpSearchQuery, setGrpSearchQuery] = useState('');
  const [grpStatusFilter, setGrpStatusFilter] = useState('All');
  const [grpAssetTypeFilter, setGrpAssetTypeFilter] = useState('All');

  const [showAddGrpModal, setShowAddGrpModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [modalError, setModalError] = useState('');
  const [availableAssetTypes, setAvailableAssetTypes] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
      const existing = new Set(custom.map(c => c.name.toLowerCase()));
      return [...custom, ...DEFAULT_ASSET_TYPES.filter(d => !existing.has(d.name.toLowerCase()))];
    } catch (_) {
      return DEFAULT_ASSET_TYPES;
    }
  });

  const [grpFormState, setGrpFormState] = useState({
    code: '',
    name: '',
    description: '',
    assetType: 'Both',
    status: 'Active'
  });

  // Listen for trigger from parent (top right "+ Add Asset Group" or "+ Add New Record")
  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddGrpModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  useEffect(() => {
    if (reloadTrigger) {
      loadAssetGroups();
    }
  }, [reloadTrigger]);

  // Load Asset Groups from Backend Database on Mount
  const loadAssetGroups = async () => {
    try {
      const [typeRes, classRes, catRes, subCatRes] = await Promise.all([
        api.get('/master-data/asset-types').catch(() => null),
        api.get('/master-data/asset-classes?kind=CLASS').catch(() => null),
        api.get('/master-data/categories').catch(() => null),
        api.get('/master-data/asset-classes?kind=SUBCATEGORY').catch(() => null)
      ]);
      if (typeRes?.assetTypes && Array.isArray(typeRes.assetTypes) && typeRes.assetTypes.length > 0) {
        setAvailableAssetTypes(typeRes.assetTypes);
      }
      if (classRes?.assetClasses) setLiveClasses(classRes.assetClasses);
      if (catRes?.categories) setLiveCategories(catRes.categories);
      if (subCatRes?.assetClasses) setLiveSubCategories(subCatRes.assetClasses);
    } catch (_) { }
    setIsLoading(true);
    let customGroups = [];
    try {
      customGroups = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
    } catch (e) { }

    try {
      const res = await api.get('/master-data/asset-groups?includeInactive=true');
      if (res?.assetGroups && res.assetGroups.length > 0) {
        console.log('📦 [AssetGroupsTab] Loaded asset groups from DB:', res.assetGroups);
        const serverIds = new Set(res.assetGroups.map(g => String(g.id)));
        const serverCodes = new Set(res.assetGroups.map(g => String(g.code).toUpperCase()));
        const missingCustom = customGroups.filter(g => !serverIds.has(String(g.id)) && !serverCodes.has(String(g.code).toUpperCase()));
        const merged = [...missingCustom, ...res.assetGroups];
        setAssetGroups(merged);
        if (!selectedGroup || !merged.some((g) => g.id === selectedGroup.id)) {
          setSelectedGroup(merged[0] || null);
        }
      } else {
        setAssetGroups(customGroups);
        setSelectedGroup(customGroups[0] || null);
      }
    } catch (err) {
      console.warn('Failed to fetch asset groups from backend, using local dataset:', err);
      setAssetGroups(customGroups);
      setSelectedGroup(customGroups[0] || null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssetGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return assetGroups.filter((grp) => {
      const matchesSearch =
        !grpSearchQuery ||
        grp.code.toLowerCase().includes(grpSearchQuery.toLowerCase()) ||
        grp.name.toLowerCase().includes(grpSearchQuery.toLowerCase()) ||
        grp.description.toLowerCase().includes(grpSearchQuery.toLowerCase());

      const matchesStatus =
        grpStatusFilter === 'All' || grp.status.toLowerCase() === grpStatusFilter.toLowerCase();

      const matchesType =
        grpAssetTypeFilter === 'All' || grp.assetType.toLowerCase() === grpAssetTypeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assetGroups, grpSearchQuery, grpStatusFilter, grpAssetTypeFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedGroups,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredGroups, 10);

  const handleResetGrpFilters = () => {
    setGrpSearchQuery('');
    setGrpStatusFilter('All');
    setGrpAssetTypeFilter('All');
  };

  // Calculate related classes for the selected group
  const relatedClassesList = useMemo(() => {
    if (!selectedGroup) return [];
    return liveClasses.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || c.assetGroup?.name || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup, liveClasses]);

  // Calculate related categories for the selected group
  const relatedCategoriesList = useMemo(() => {
    if (!selectedGroup) return [];
    return liveCategories.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || c.assetGroup?.name || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup, liveCategories]);

  // Calculate related subcategories for the selected group
  const relatedSubCategoriesList = useMemo(() => {
    if (!selectedGroup) return [];
    return liveSubCategories.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || c.assetGroup?.name || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup, liveSubCategories]);

  // Filtered list inside the explorer modal
  const activeRelatedItems = useMemo(() => {
    let list = [];
    if (selectedRelatedType === 'classes') list = relatedClassesList;
    else if (selectedRelatedType === 'categories') list = relatedCategoriesList;
    else if (selectedRelatedType === 'subcategories') list = relatedSubCategoriesList;

    if (!relatedSearchQuery.trim()) return list;
    const q = relatedSearchQuery.toLowerCase();
    return list.filter((item) =>
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.className && item.className.toLowerCase().includes(q)) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(q))
    );
  }, [selectedRelatedType, relatedClassesList, relatedCategoriesList, relatedSubCategoriesList, relatedSearchQuery]);

  const handleOpenAddGrpModal = (grpToEdit = null) => {
    setModalError('');
    if (grpToEdit) {
      setEditingGroup(grpToEdit);
      setGrpFormState({
        code: grpToEdit.code,
        name: grpToEdit.name,
        description: grpToEdit.description || '',
        assetType: grpToEdit.assetType || 'Both',
        status: grpToEdit.status || 'Active'
      });
    } else {
      setEditingGroup(null);
      setGrpFormState({
        code: '',
        name: '',
        description: '',
        assetType: 'Both',
        status: 'Active'
      });
    }
    setShowAddGrpModal(true);
  };

  const handleDuplicateGroup = (grp) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    setEditingGroup(null);
    setGrpFormState({
      code: `${grp.code || 'GRP'}-COPY`,
      name: `${grp.name || ''} (Copy)`,
      description: grp.description || '',
      assetType: grp.assetType || 'Both',
      status: 'Active'
    });
    setShowAddGrpModal(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setModalError('');
    console.log('📝 [AssetGroupsTab] Submitting Asset Group form:', grpFormState);

    const cleanCode = grpFormState.code?.trim().toUpperCase();
    const cleanName = grpFormState.name?.trim();

    if (!cleanName) {
      console.warn('⚠️ [AssetGroupsTab] Validation failed: Name is required.', grpFormState);
      const msg = 'Group Name is required.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    // Client-side pre-validation: check for duplicate group code or name
    if (cleanCode) {
      const duplicateCode = assetGroups.find(
        (g) => (g.code || '').trim().toUpperCase() === cleanCode && (!editingGroup || g.id !== editingGroup.id)
      );
      if (duplicateCode) {
        const msg = `Asset Group code "${cleanCode}" already exists (used by "${duplicateCode.name}"). Please use a different code.`;
        console.warn('⚠️ [AssetGroupsTab] Duplicate Code detected:', msg);
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }
    const duplicateName = assetGroups.find(
      (g) => (g.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingGroup || g.id !== editingGroup.id)
    );
    if (duplicateName) {
      const msg = `Asset Group name "${cleanName}" already exists. Please use a different name.`;
      console.warn('⚠️ [AssetGroupsTab] Duplicate Name detected:', msg);
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    setIsSaving(true);

    try {
      if (editingGroup) {
        console.log(`📡 [AssetGroupsTab] Updating Asset Group ID ${editingGroup.id}:`, grpFormState);
        await api.put(`/master-data/asset-groups/${editingGroup.id}`, {
          ...grpFormState,
          code: cleanCode,
          name: cleanName
        });
        await loadAssetGroups();
        triggerToast && triggerToast(`Asset Group "${cleanName}" updated successfully.`);
      } else {
        console.log('📡 [AssetGroupsTab] Creating new Asset Group via POST /master-data/asset-groups:', grpFormState);
        const payload = {
          ...grpFormState,
          name: cleanName
        };
        if (cleanCode) payload.code = cleanCode;
        else delete payload.code;
        await api.post('/master-data/asset-groups', payload);
        await loadAssetGroups();
        triggerToast && triggerToast(`Asset Group "${cleanName}" created successfully.`);
      }
      setShowAddGrpModal(false);
      setEditingGroup(null);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save asset group.';
      setModalError(errMsg);
      triggerToast && triggerToast(errMsg);
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitiateDeleteGroup = (grp) => {
    if (!grp) return;
    const grpName = (grp.name || '').trim().toLowerCase();
    const grpCode = (grp.code || '').trim().toLowerCase();

    // Check if any Sub Groups are linked (Immediate direct child):
    const linkedSubGroups = liveClasses.filter(c => {
      const cGrp = (c.groupName || c.assetGroupName || c.assetGroup?.name || '').trim().toLowerCase();
      const cCode = (c.groupCode || '').trim().toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (c.assetGroupId && (c.assetGroupId === grp.id || c.assetGroupId === grp.code)) ||
        (grpCode && (cCode === grpCode || c.code?.toLowerCase().startsWith(grpCode)))
      );
    });

    const totalClientLinked = linkedSubGroups.length;

    if (totalClientLinked > 0) {
      setSmartDeleteState({
        isOpen: true,
        item: grp,
        linkedCount: totalClientLinked,
        details: {
          subGroupsCount: linkedSubGroups.length
        },
        isProcessing: false
      });
      return;
    }

    setGroupToDelete(grp);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(
        `/master-data/asset-groups/${groupToDelete.id}?name=${encodeURIComponent(groupToDelete.name || '')}&code=${encodeURIComponent(groupToDelete.code || '')}`
      );
      if (res?.requiresConfirmation) {
        setShowDeleteConfirmModal(false);
        setSmartDeleteState({
          isOpen: true,
          item: groupToDelete,
          linkedCount: res.linkedCount || 0,
          details: res.details || null,
          isProcessing: false
        });
        return;
      }
      try {
        const currentCustom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
        localStorage.setItem('fams_custom_asset_groups', JSON.stringify(currentCustom.filter(g => g.id !== groupToDelete.id && g.code !== groupToDelete.code)));
      } catch (e) { }

      const updated = assetGroups.filter((g) => g.id !== groupToDelete.id);
      setAssetGroups(updated);
      if (selectedGroup?.id === groupToDelete.id) {
        setSelectedGroup(updated[0] || null);
      }
      triggerToast && triggerToast(`Asset Group "${groupToDelete.name}" deleted successfully.`);
      setShowDeleteConfirmModal(false);
      setGroupToDelete(null);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresConfirmation) {
        setShowDeleteConfirmModal(false);
        setSmartDeleteState({
          isOpen: true,
          item: groupToDelete,
          linkedCount: data.linkedCount || 0,
          details: data.details || null,
          isProcessing: false
        });
        return;
      }
      triggerToast && triggerToast(err.response?.data?.message || 'Failed to delete asset group.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSmartDeactivateGroup = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(`/master-data/asset-groups/${smartDeleteState.item.id}?action=deactivate`);
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      await loadAssetGroups();
      triggerToast && triggerToast(res?.message || 'Asset Group marked Inactive.');
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast('Failed to deactivate asset group.');
    }
  };

  const handleToggleStatus = async (grp, e) => {
    e?.stopPropagation();
    const nextStatus = grp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/master-data/asset-groups/${grp.id}`, {
        ...grp,
        status: nextStatus
      });
      const updatedGroup = res?.assetGroup || { ...grp, status: nextStatus, active: nextStatus === 'Active' };
      const updated = assetGroups.map((g) => (g.id === grp.id ? { ...g, ...updatedGroup } : g));
      setAssetGroups(updated);
      if (selectedGroup?.id === grp.id) {
        setSelectedGroup({ ...selectedGroup, ...updatedGroup });
      }
      triggerToast && triggerToast(`Group "${grp.code}" is now ${nextStatus}.`);
    } catch (err) {
      triggerToast && triggerToast('Failed to update group status.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by group code, name or description..."
              value={grpSearchQuery}
              onChange={(e) => setGrpSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="w-full md:w-44 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status</span>
            <select
              value={grpStatusFilter}
              onChange={(e) => setGrpStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>



          <button
            onClick={handleResetGrpFilters}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
          >
            Reset
          </button>

          <button
            className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Asset Groups List</h2>
              <p className="text-xs text-slate-500">Live configuration records from database.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAssetGroups}
                disabled={isLoading}
                title="Refresh from Database"
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#6C2BD9] transition-colors cursor-pointer"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-[#6C2BD9]")} />
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3.5 text-center">#</th>
                  <th className="py-3 px-3.5">Group Code</th>
                  <th className="py-3 px-3.5">Group Name</th>
                  <th className="py-3 px-4">Description</th>

                  <th className="py-3 px-3.5 text-right">Total Assets</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[#6C2BD9] animate-spin" />
                        <span className="text-xs font-semibold">Loading Asset Groups from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No asset groups found matching your filters.
                    </td>
                  </tr>
                ) : (
                  pagedGroups.map((grp, index) => {
                    const isSelected = selectedGroup?.id === grp.id;
                    return (
                      <tr
                        key={grp.id}
                        onClick={() => setSelectedGroup(grp)}
                        className={clsx(
                          'cursor-pointer transition-colors',
                          isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                        )}
                      >
                        <td className="py-3.5 px-3.5 text-center text-slate-400">{startIndex + index + 1}</td>
                        <td className="py-3.5 px-3.5 font-bold font-mono text-[#6C2BD9]">{grp.code}</td>
                        <td className="py-3.5 px-3.5 font-semibold text-slate-900">{grp.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate" title={grp.description}>
                          {grp.description || '-'}
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono font-bold text-slate-900">
                          {(grp.totalAssets ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3.5 text-center" onClick={(e) => handleToggleStatus(grp, e)}>
                          <button
                            title="Click to toggle status"
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-opacity hover:opacity-80',
                              grp.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            )}
                          >
                            {grp.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              onClick={() => handleOpenAddGrpModal(grp)}
                              title="Edit Group"
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#6C2BD9] cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <RowActionsMenu
                              isOpen={activeRowMenuId === `grp-${grp.id}`}
                              onToggle={() => setActiveRowMenuId && setActiveRowMenuId(activeRowMenuId === `grp-${grp.id}` ? null : `grp-${grp.id}`)}
                              onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            >
                              <button
                                onClick={() => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleOpenAddGrpModal(grp);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Group</span>
                              </button>
                              <button
                                onClick={() => handleDuplicateGroup(grp)}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleToggleStatus(grp, e);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{grp.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                              </button>
                              <div className="h-px bg-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  setActiveRowMenuId && setActiveRowMenuId(null);
                                  handleInitiateDeleteGroup(grp);
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

          <MasterDataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredGroups.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Selected Group Detail Drawer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Asset Group Details</h3>
            {selectedGroup && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAddGrpModal(selectedGroup)}
                  className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleInitiateDeleteGroup(selectedGroup)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete Group"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {selectedGroup ? (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Group Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedGroup.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Group Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedGroup.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedGroup.description}</span>
              </div>



              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedGroup.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedGroup.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedGroup.totalAssets ?? 0).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedGroup.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedGroup.createdOn}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified By</span>
                <span className="col-span-2 text-slate-700">{selectedGroup.lastModifiedBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified On</span>
                <span className="col-span-2 text-slate-700">{selectedGroup.lastModifiedOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                  <span className="text-[10px] text-purple-600 font-medium">Click card to explore</span>
                </div>
                <div className="space-y-2">
                  {/* Asset Classes */}
                  <div
                    onClick={() => {
                      setSelectedRelatedType('classes');
                      setRelatedSearchQuery('');
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/60 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
                    title="Explore related Asset Sub Groups"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-[#6C2BD9] flex items-center justify-center group-hover:bg-[#6C2BD9] group-hover:text-white transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-800 group-hover:text-[#6C2BD9]">Asset Sub Groups</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-100 group-hover:text-[#6C2BD9]">
                        {relatedClassesList.length || selectedGroup.relatedInfo?.classes || 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateTab) onNavigateTab('classes');
                        }}
                        title="Jump straight to Asset Sub Groups tab"
                        className="p-1 rounded-md text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div
                    onClick={() => {
                      setSelectedRelatedType('categories');
                      setRelatedSearchQuery('');
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/60 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
                    title="Explore related Categories"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-[#6C2BD9] flex items-center justify-center group-hover:bg-[#6C2BD9] group-hover:text-white transition-colors">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-800 group-hover:text-[#6C2BD9]">Categories</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-100 group-hover:text-[#6C2BD9]">
                        {relatedCategoriesList.length || selectedGroup.relatedInfo?.categories || 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateTab) onNavigateTab('categories');
                        }}
                        title="Jump straight to Categories tab"
                        className="p-1 rounded-md text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sub Categories */}
                  <div
                    onClick={() => {
                      setSelectedRelatedType('subcategories');
                      setRelatedSearchQuery('');
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/60 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
                    title="Explore related Sub Categories"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-[#6C2BD9] flex items-center justify-center group-hover:bg-[#6C2BD9] group-hover:text-white transition-colors">
                        <FolderTree className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-800 group-hover:text-[#6C2BD9]">Sub Categories</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-100 group-hover:text-[#6C2BD9]">
                        {relatedSubCategoriesList.length || selectedGroup.relatedInfo?.subCategories || 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateTab) onNavigateTab('subcategories');
                        }}
                        title="Jump straight to Sub Categories tab"
                        className="p-1 rounded-md text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No asset group selected. Click "+ Add Asset Group" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Asset Group */}
      {showAddGrpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingGroup ? 'Edit Asset Group' : 'Add New Asset Group'}</span>
              </h3>
              <button onClick={() => setShowAddGrpModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-3.5 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Group Code
                </label>
                <MasterCodeInput
                  entityKey="asset_group"
                  value={grpFormState.code}
                  onChange={(code) => {
                    setModalError('');
                    setGrpFormState({ ...grpFormState, code });
                  }}
                  disabled={!!editingGroup}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={grpFormState.name}
                  onChange={(e) => {
                    setModalError('');
                    setGrpFormState({ ...grpFormState, name: e.target.value });
                  }}
                  placeholder="e.g. Information Technology"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={grpFormState.description}
                  onChange={(e) => setGrpFormState({ ...grpFormState, description: e.target.value })}
                  placeholder="Enter detailed description of group..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={grpFormState.status}
                  onChange={(e) => setGrpFormState({ ...grpFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddGrpModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5">
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGroup ? 'Save Changes' : 'ADD'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteConfirmModal && groupToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Asset Group?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{groupToDelete.name}" ({groupToDelete.code})</span>? This action removes the group from database master data.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setGroupToDelete(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Delete Group</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Related Items Explorer */}
      {selectedRelatedType && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  {selectedRelatedType === 'classes' && <Layers className="w-5 h-5" />}
                  {selectedRelatedType === 'categories' && <Tag className="w-5 h-5" />}
                  {selectedRelatedType === 'subcategories' && <FolderTree className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {selectedRelatedType === 'classes' && 'Related Asset Sub Groups'}
                      {selectedRelatedType === 'categories' && 'Related Categories'}
                      {selectedRelatedType === 'subcategories' && 'Related Sub Categories'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 text-[#6C2BD9] font-medium">
                      {selectedGroup.name} ({selectedGroup.code})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing all {selectedRelatedType === 'classes' ? 'sub groups' : selectedRelatedType === 'categories' ? 'categories' : 'sub-categories'} mapped under this asset group
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRelatedType(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar: Search and Go To Tab */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={relatedSearchQuery}
                  onChange={(e) => setRelatedSearchQuery(e.target.value)}
                  placeholder={`Search in related ${selectedRelatedType === 'classes' ? 'sub groups' : selectedRelatedType === 'categories' ? 'categories' : 'sub categories'}...`}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetTab = selectedRelatedType;
                  setSelectedRelatedType(null);
                  if (onNavigateTab) onNavigateTab(targetTab);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Open {selectedRelatedType === 'classes' ? 'Asset Sub Groups' : selectedRelatedType === 'categories' ? 'Categories' : 'Sub Categories'} Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List / Table */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[400px] border border-slate-100 rounded-xl">
              {activeRelatedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mb-2">
                    {selectedRelatedType === 'classes' && <Layers className="w-6 h-6" />}
                    {selectedRelatedType === 'categories' && <Tag className="w-6 h-6" />}
                    {selectedRelatedType === 'subcategories' && <FolderTree className="w-6 h-6" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">No matching items found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {relatedSearchQuery
                      ? 'No items match your search query.'
                      : `No ${selectedRelatedType} currently mapped to "${selectedGroup.name}".`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const targetTab = selectedRelatedType;
                      setSelectedRelatedType(null);
                      if (onNavigateTab) onNavigateTab(targetTab);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-[#6C2BD9] text-xs font-semibold cursor-pointer"
                  >
                    Go to {selectedRelatedType === 'classes' ? 'Asset Sub Groups' : selectedRelatedType === 'categories' ? 'Categories' : 'Sub Categories'} Tab
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Name</th>
                      {selectedRelatedType === 'classes' && <th className="py-2.5 px-3">Asset Type</th>}
                      {selectedRelatedType === 'categories' && <th className="py-2.5 px-3">Parent Class</th>}
                      {selectedRelatedType === 'subcategories' && <th className="py-2.5 px-3">Category / Class</th>}
                      <th className="py-2.5 px-3 text-right">Assets</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeRelatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{item.code}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</div>
                          )}
                        </td>
                        {selectedRelatedType === 'classes' && (
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-600">
                              {item.assetType}
                            </span>
                          </td>
                        )}
                        {selectedRelatedType === 'categories' && (
                          <td className="py-2.5 px-3 text-slate-600 font-medium">{item.className || '-'}</td>
                        )}
                        {selectedRelatedType === 'subcategories' && (
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{item.categoryName || '-'}</div>
                            <div className="text-[10px] text-slate-400">{item.className || '-'}</div>
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          {item.totalAssets || 0}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold',
                              item.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            )}
                          >
                            {item.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {activeRelatedItems.length} records</span>
              <button
                type="button"
                onClick={() => setSelectedRelatedType(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Smart Delete Modal (Linked Dependencies Protection) */}
      <SmartDeleteModal
        isOpen={smartDeleteState.isOpen}
        onClose={() => setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false })}
        item={smartDeleteState.item}
        entityName="Asset Group"
        linkedCount={smartDeleteState.linkedCount}
        details={smartDeleteState.details}
        onDeactivate={handleSmartDeactivateGroup}
        isProcessing={smartDeleteState.isProcessing}
      />
    </div>
  );
}
