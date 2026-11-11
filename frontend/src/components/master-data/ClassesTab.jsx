import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Tag,
  FolderTree,
  Box,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  Wrench,
  FileText,
  X,
  Layers,
  Plus,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { INITIAL_ASSET_GROUPS } from './AssetGroupsTab';
import { SmartDeleteModal } from './SmartDeleteModal';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';

export const INITIAL_CLASSES = [];

export function ClassesTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveSubCategories, setLiveSubCategories] = useState([]);
  const [smartDeleteState, setSmartDeleteState] = useState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });

  // Load live classes from database (Filtered strictly to true Asset Classes, excluding Sub Categories)
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      const subcatCustom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
      const customCats = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
      const [res, grpRes, subcatRes, catRes] = await Promise.all([
        api.get('/master-data/asset-sub-groups?includeInactive=true').catch(() => null),
        api.get('/master-data/asset-groups?includeInactive=true').catch(() => null),
        api.get('/master-data/sub-categories?includeInactive=true').catch(() => null),
        api.get('/master-data/categories?includeInactive=true').catch(() => null)
      ]);

      const serverSubcatCodes = (subcatRes?.assetClasses || subcatRes?.subCategories || []).map(s => (s.code || '').toUpperCase());
      const customSubcatCodes = subcatCustom.map(s => (s.code || '').toUpperCase());
      const subcatCodes = new Set([...serverSubcatCodes, ...customSubcatCodes]);

      const allLiveCats = [...(catRes?.categories || []), ...customCats];
      setLiveCategories(allLiveCats);

      const allLiveSubCats = [...(subcatRes?.assetClasses || subcatRes?.subCategories || []), ...subcatCustom];
      setLiveSubCategories(allLiveSubCats);

      if (grpRes?.assetGroups && Array.isArray(grpRes.assetGroups)) {
        setAvailableAssetGroups(grpRes.assetGroups);
      }

      let serverClasses = [];
      if (res?.assetClasses && res.assetClasses.length > 0) {
        // Filter strictly to classes: exclude anything that is a subcategory
        const trueClasses = res.assetClasses.filter(ac =>
          !subcatCodes.has((ac.code || '').toUpperCase()) &&
          !(ac.description || '').includes('[kind:subcat]')
        );
        serverClasses = trueClasses.map((ac, idx) => {
          const descClean = (ac.description || '').replace(/\[kind:[^\]]+\]/g, '').replace(/\[group:[^\]]+\]/g, '').trim();
          const groupMatch = (ac.description || '').match(/\[group:([^\]]+)\]/);
          const parsedGroup = groupMatch ? groupMatch[1] : (ac.groupName || '-');

          const childCats = allLiveCats.filter(cat => {
            const catClass = (cat.description || '').match(/\[class:([^\]]+)\]/)?.[1] || cat.className || '';
            return (
              (catClass && (catClass.toLowerCase() === (ac.name || '').toLowerCase() || catClass.toLowerCase() === (ac.code || '').toLowerCase())) ||
              ((cat.description || '').toLowerCase().includes(`[class:${(ac.name || '').toLowerCase()}]`)) ||
              ((cat.description || '').toLowerCase().includes(`[class:${(ac.code || '').toLowerCase()}]`))
            );
          });

          const childSubCats = allLiveSubCats.filter(sc =>
            (sc.assetSubGroupId && (sc.assetSubGroupId === ac.id || sc.assetSubGroupId === ac.code)) ||
            (sc.assetSubGroupName && ac.name && sc.assetSubGroupName.trim().toLowerCase() === ac.name.trim().toLowerCase()) ||
            (sc.className && ac.name && sc.className.trim().toLowerCase() === ac.name.trim().toLowerCase())
          );

          return {
            id: ac.id,
            code: ac.code,
            name: ac.name,
            categoryId: ac.categoryId,
            groupName: parsedGroup,
            description: descClean,
            assetType: 'Physical',
            totalAssets: ac.totalAssets || 0,
            status: ac.active === false ? 'Inactive' : 'Active',
            createdBy: 'Admin',
            createdOn: ac.createdAt ? new Date(ac.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            lastModifiedBy: 'Admin',
            lastModifiedOn: ac.updatedAt ? new Date(ac.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            relatedInfo: { categories: childCats.length, subCategories: childSubCats.length, assets: ac.totalAssets || 0, maintenancePlans: 0, documents: 0 }
          };
        });
      }

      const serverCodes = new Set(serverClasses.map(m => (m.code || m.name || '').toUpperCase().trim()));
      const missingCustom = custom.filter(c => !serverCodes.has((c.code || c.name || '').toUpperCase().trim()));
      const rawList = [...serverClasses, ...missingCustom];

      const seen = new Set();
      const fullList = rawList.filter(item => {
        const key = (item.code || item.name || '').toUpperCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setClassesList(fullList);
      setSelectedClass((prev) => (prev ? fullList.find((c) => c.id === prev.id) || fullList[0] || null : fullList[0] || null));
    } catch (err) {
      console.warn('Failed to fetch asset classes, using local dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Filter state
  const [clsSearchQuery, setClsSearchQuery] = useState('');
  const [clsGroupFilter, setClsGroupFilter] = useState('All Groups');
  const [clsStatusFilter, setClsStatusFilter] = useState('All');
  const [clsAssetTypeFilter, setClsAssetTypeFilter] = useState('All');

  // Modal state
  const [showAddClsModal, setShowAddClsModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [availableAssetGroups, setAvailableAssetGroups] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
      const existing = new Set(custom.map(c => (c.name || c.code).toLowerCase()));
      return [...custom, ...INITIAL_ASSET_GROUPS.filter(d => !existing.has(d.name.toLowerCase()))];
    } catch (_) {
      return INITIAL_ASSET_GROUPS;
    }
  });

  const [clsFormState, setClsFormState] = useState({
    code: '',
    name: '',
    groupName: '',
    description: '',
    assetType: 'Physical',
    status: 'Active'
  });

  // Sort groups: active groups first, then inactive groups
  const sortedAssetGroups = useMemo(() => {
    return [...availableAssetGroups].sort((a, b) => {
      const aActive = a.active !== false && a.status !== 'Inactive';
      const bActive = b.active !== false && b.status !== 'Inactive';
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return (a.name || a.code || '').localeCompare(b.name || b.code || '');
    });
  }, [availableAssetGroups]);

  const filteredClasses = useMemo(() => {
    return classesList.filter((cls) => {
      const matchesSearch =
        !clsSearchQuery ||
        cls.code.toLowerCase().includes(clsSearchQuery.toLowerCase()) ||
        cls.name.toLowerCase().includes(clsSearchQuery.toLowerCase()) ||
        cls.description.toLowerCase().includes(clsSearchQuery.toLowerCase());

      const matchesGroup =
        clsGroupFilter === 'All Groups' || clsGroupFilter === 'All' || cls.groupName === clsGroupFilter;

      const matchesStatus =
        clsStatusFilter === 'All' || cls.status.toLowerCase() === clsStatusFilter.toLowerCase();

      const matchesType =
        clsAssetTypeFilter === 'All' || cls.assetType.toLowerCase() === clsAssetTypeFilter.toLowerCase();

      return matchesSearch && matchesGroup && matchesStatus && matchesType;
    });
  }, [classesList, clsSearchQuery, clsGroupFilter, clsStatusFilter, clsAssetTypeFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedClasses,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredClasses, 10);

  // Keep selectedClass synchronized with filteredClasses when group filter changes
  useEffect(() => {
    if (filteredClasses.length > 0) {
      if (!selectedClass || !filteredClasses.some((c) => c.id === selectedClass.id)) {
        setSelectedClass(filteredClasses[0]);
      }
    }
  }, [filteredClasses, selectedClass]);

  // Dynamically compute list of distinct group names for the filter dropdown
  const availableGroups = useMemo(() => {
    const set = new Set();
    classesList.forEach((c) => {
      if (c.groupName) set.add(c.groupName);
    });
    return Array.from(set);
  }, [classesList]);

  const handleResetClsFilters = () => {
    setClsSearchQuery('');
    setClsGroupFilter('All Groups');
    setClsStatusFilter('All');
    setClsAssetTypeFilter('All');
  };

  const handleOpenAddClsModal = (clsToEdit = null) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    if (clsToEdit) {
      setEditingClass(clsToEdit);
      const matchedGrp = availableAssetGroups.find(g => (g.name || g.code) === clsToEdit.groupName || g.id === clsToEdit.assetGroupId);
      setClsFormState({
        code: clsToEdit.code,
        name: clsToEdit.name,
        assetGroupId: clsToEdit.assetGroupId || matchedGrp?.id || '',
        groupName: clsToEdit.groupName,
        description: clsToEdit.description,
        assetType: clsToEdit.assetType,
        status: clsToEdit.status
      });
    } else {
      setEditingClass(null);
      const activeGroups = availableAssetGroups.filter(g => g.active !== false && g.status !== 'Inactive');
      const defaultGrp = activeGroups.find(g => (g.name || g.code) === 'Information Technology')
        || activeGroups[0]
        || availableAssetGroups[0];
      setClsFormState({
        code: '',
        name: '',
        assetGroupId: defaultGrp?.id || '',
        groupName: defaultGrp ? (defaultGrp.name || defaultGrp.code) : '',
        description: '',
        assetType: 'Physical',
        status: 'Active'
      });
    }
    setShowAddClsModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddClsModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveClass = async (e) => {
    e.preventDefault();
    const cleanCode = (clsFormState.code || '').trim().toUpperCase();
    const cleanName = (clsFormState.name || '').trim();

    if (!cleanName) {
      setModalError('Sub Group Name is required.');
      return;
    }

    if (!clsFormState.groupName) {
      setModalError('Parent Asset Group is required.');
      return;
    }

    const chosenGrp = availableAssetGroups.find(g => (g.name || g.code) === clsFormState.groupName || g.id === clsFormState.assetGroupId);
    if (chosenGrp && (chosenGrp.active === false || chosenGrp.status === 'Inactive')) {
      const msg = `Cannot assign to inactive Asset Group "${chosenGrp.name || chosenGrp.code}". Please select an active Asset Group.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    if (cleanCode) {
      const dupCode = classesList.find(c => (c.code || '').trim().toUpperCase() === cleanCode && (!editingClass || c.id !== editingClass.id));
      if (dupCode) {
        const msg = `Asset Sub Group code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }

    const dupName = classesList.find(c => (c.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingClass || c.id !== editingClass.id));
    if (dupName) {
      const msg = `Asset Sub Group name "${cleanName}" already exists. Duplicate names are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    try {
      const matchedGrp = availableAssetGroups.find(g => (g.name || g.code) === clsFormState.groupName || g.id === clsFormState.assetGroupId);
      const targetGroupId = clsFormState.assetGroupId || matchedGrp?.id || null;

      if (editingClass) {
        const cleanDesc = (clsFormState.description || '')
          .replace(/\[kind:[^\]]+\]/g, '')
          .replace(/\[group:[^\]]+\]/g, '')
          .trim();
        await api.put(`/master-data/asset-sub-groups/${editingClass.id}`, {
          code: cleanCode,
          name: cleanName,
          assetGroupId: targetGroupId,
          groupName: clsFormState.groupName,
          assetGroupName: clsFormState.groupName,
          description: `${cleanDesc} [kind:class] [group:${clsFormState.groupName}]`.trim(),
          status: clsFormState.status
        });
        await loadClasses();
        triggerToast && triggerToast(`Asset Sub Group "${cleanName}" updated successfully.`);
      } else {
        const payload = {
          name: cleanName,
          assetGroupId: targetGroupId,
          groupName: clsFormState.groupName,
          assetGroupName: clsFormState.groupName,
          description: `${clsFormState.description || ''} [kind:class] [group:${clsFormState.groupName}]`.trim(),
          kind: 'CLASS',
          status: clsFormState.status
        };
        if (cleanCode) payload.code = cleanCode;
        await api.post('/master-data/asset-sub-groups', payload);
        await loadClasses();
        triggerToast && triggerToast(`Asset Sub Group "${cleanName}" created successfully.`);
      }
      setShowAddClsModal(false);
      setEditingClass(null);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Operation failed';
      setModalError(errMsg);
      triggerToast && triggerToast(errMsg);
    }
  };

  const handleDuplicateClass = (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...cls,
      id: Date.now(),
      code: `${cls.code}-COPY`,
      name: `${cls.name} (Copy)`,
      totalAssets: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
    setClassesList([duplicated, ...classesList]);
    setSelectedClass(duplicated);
    triggerToast && triggerToast(`Asset Sub Group "${cls.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleClassStatus = async (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cls.status === 'Active' ? 'Inactive' : 'Active';
    if (typeof cls.id === 'string' && cls.id.length > 10) {
      await api.put(`/master-data/asset-sub-groups/${cls.id}`, { status: newStatus }).catch(() => null);
    }
    const updated = classesList.map((c) =>
      c.id === cls.id ? { ...c, status: newStatus } : c
    );
    setClassesList(updated);
    if (selectedClass.id === cls.id) {
      setSelectedClass({ ...selectedClass, status: newStatus });
    }
    triggerToast && triggerToast(`Asset Sub Group "${cls.code}" status changed to ${newStatus}.`);
  };

  const handleInitiateDeleteClass = (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const childCats = (liveCategories || []).filter(cat => {
      const catClass = (cat.description || '').match(/\[class:([^\]]+)\]/)?.[1] || cat.className || '';
      return (
        (catClass && (catClass.toLowerCase() === (cls.name || '').toLowerCase() || catClass.toLowerCase() === (cls.code || '').toLowerCase())) ||
        ((cat.description || '').toLowerCase().includes(`[class:${(cls.name || '').toLowerCase()}]`)) ||
        ((cat.description || '').toLowerCase().includes(`[class:${(cls.code || '').toLowerCase()}]`))
      );
    });

    const totalLinked = childCats.length + (cls.totalAssets || 0);
    if (totalLinked > 0) {
      setSmartDeleteState({
        isOpen: true,
        item: cls,
        linkedCount: totalLinked,
        details: {
          categoriesCount: childCats.length,
          assetsCount: cls.totalAssets || 0
        },
        isProcessing: false
      });
      return;
    }

    handleDeleteClass(cls);
  };

  const handleDeleteClass = async (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Asset Sub Group "${cls.name}" (${cls.code})?`)) {
      try {
        const res = await api.delete(
          `/master-data/asset-sub-groups/${cls.id}?name=${encodeURIComponent(cls.name || '')}&code=${encodeURIComponent(cls.code || '')}`
        );
        if (res?.requiresConfirmation) {
          setSmartDeleteState({
            isOpen: true,
            item: cls,
            linkedCount: res.linkedCount || 0,
            details: res.details || null,
            isProcessing: false
          });
          return;
        }
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
          localStorage.setItem('fams_custom_asset_classes', JSON.stringify(custom.filter(c => c.id !== cls.id)));
        } catch (_) { }
        await loadClasses();
        triggerToast && triggerToast(`Asset Sub Group "${cls.name || cls.code}" deleted successfully.`);
      } catch (err) {
        const data = err?.response?.data;
        if (data?.requiresConfirmation) {
          setSmartDeleteState({
            isOpen: true,
            item: cls,
            linkedCount: data.linkedCount || 0,
            details: data.details || null,
            isProcessing: false
          });
          return;
        }
        triggerToast && triggerToast(err.response?.data?.message || 'Failed to delete Asset Sub Group.');
      }
    }
  };

  const handleSmartDeactivateClass = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(
        `/master-data/asset-sub-groups/${smartDeleteState.item.id}?action=deactivate&name=${encodeURIComponent(smartDeleteState.item.name || '')}&code=${encodeURIComponent(smartDeleteState.item.code || '')}`
      );
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      await loadClasses();
      triggerToast && triggerToast(res?.message || 'Asset Sub Group marked Inactive.');
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast('Failed to deactivate Asset Sub Group.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <span className="text-[10px] font-semibold text-slate-400 absolute left-3 top-1">Search</span>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 bottom-2.5" />
            <input
              type="text"
              placeholder="Search by sub group code, name or description..."
              value={clsSearchQuery}
              onChange={(e) => setClsSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-52 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Group</span>
            <select
              value={clsGroupFilter}
              onChange={(e) => setClsGroupFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Groups">All Groups</option>
              {availableGroups.map((grpName) => {
                const grp = availableAssetGroups.find(g => (g.name || g.code) === grpName);
                const isInactive = grp && (grp.active === false || grp.status === 'Inactive');
                return (
                  <option key={grpName} value={grpName}>
                    {grpName}{isInactive ? ' (Inactive)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={clsStatusFilter}
              onChange={(e) => setClsStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>



          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetClsFilters}
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
              <h2 className="text-sm font-bold text-slate-900">Asset Sub Groups List</h2>
              <p className="text-xs text-slate-500">Showing all asset sub groups.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredClasses.length} Sub Groups
              </span>
              <button
                onClick={loadClasses}
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
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Sub Group Code</th>
                  <th className="py-3 px-3">Sub Group Name</th>
                  <th className="py-3 px-3.5">Asset Group</th>
                  <th className="py-3 px-4">Description</th>

                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pagedClasses.map((cls, index) => {
                  const isSelected = selectedClass?.id === cls.id;
                  const isMenuOpen = activeRowMenuId === cls.id;
                  const isNearBottom = filteredClasses.length > 2 && index >= filteredClasses.length - 2;

                  return (
                    <tr
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-3.5 px-2 text-center text-slate-400">{startIndex + index + 1}</td>
                      <td className="py-3.5 px-3 font-bold font-mono text-[#6C2BD9]">{cls.code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{cls.name}</td>
                      <td className="py-3.5 px-3.5 text-slate-700">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{cls.groupName || '-'}</span>
                          {(() => {
                            const grp = availableAssetGroups.find(g => (g.name || g.code) === cls.groupName || (cls.assetGroupId && g.id === cls.assetGroupId));
                            if (grp && (grp.active === false || grp.status === 'Inactive')) {
                              return (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md inline-block">
                                  (Inactive)
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={cls.description}>
                        {cls.description}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(cls.totalAssets ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            cls.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {cls.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleOpenAddClsModal(cls)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="Edit Sub Group"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <RowActionsMenu
                            isOpen={isMenuOpen}
                            onToggle={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : cls.id)}
                            onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            className={clsx(
                              'p-1 rounded transition-colors',
                              isMenuOpen ? 'bg-purple-100 text-[#6C2BD9]' : 'hover:bg-slate-100 text-slate-500 hover:text-[#6C2BD9]'
                            )}
                          >
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleOpenAddClsModal(cls);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Edit Sub Group</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDuplicateClass(cls);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleToggleClassStatus(cls);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>{cls.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleInitiateDeleteClass(cls);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </RowActionsMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <MasterDataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClasses.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Selected Class Detail Drawer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Asset Sub Group Details</h3>
            <button
              onClick={() => handleOpenAddClsModal(selectedClass)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedClass && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Sub Group Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedClass.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Sub Group Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedClass.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Group</span>
                <span className="col-span-2 font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span>{selectedClass.groupName || '-'}</span>
                  {(() => {
                    const grp = availableAssetGroups.find(g => (g.name || g.code) === selectedClass.groupName || (selectedClass.assetGroupId && g.id === selectedClass.assetGroupId));
                    if (grp && (grp.active === false || grp.status === 'Inactive')) {
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
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedClass.description}</span>
              </div>



              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedClass.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedClass.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedClass.totalAssets ?? 0).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedClass.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedClass.createdOn}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified By</span>
                <span className="col-span-2 text-slate-700">{selectedClass.lastModifiedBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified On</span>
                <span className="col-span-2 text-slate-700">{selectedClass.lastModifiedOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo?.categories ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo?.subCategories ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{(selectedClass.relatedInfo?.assets ?? 0).toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo?.maintenancePlans ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo?.documents ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Class */}
      {showAddClsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingClass ? 'Edit Sub Group' : 'Add New Sub Group'}</span>
              </h3>
              <button onClick={() => setShowAddClsModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Sub Group Code <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-semibold border border-purple-100">
                    Auto-generated if blank
                  </span>
                </div>
                <input
                  type="text"
                  value={clsFormState.code}
                  onChange={(e) => setClsFormState({ ...clsFormState, code: e.target.value })}
                  placeholder="Auto-generated using prefix setting (e.g. SUB-001)"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to automatically generate code using prefix SUB- (or custom setting).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub Group Name *</label>
                <input
                  type="text"
                  required
                  value={clsFormState.name}
                  onChange={(e) => setClsFormState({ ...clsFormState, name: e.target.value })}
                  placeholder="e.g. Hardware, Building Structure"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Asset Group *</label>
                <select
                  value={clsFormState.groupName}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    const matched = availableAssetGroups.find(g => (g.name || g.code) === chosen);
                    setClsFormState({
                      ...clsFormState,
                      groupName: chosen,
                      assetGroupId: matched?.id || ''
                    });
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">-- Select Parent Asset Group --</option>
                  {sortedAssetGroups.map((g) => {
                    const name = g.name || g.code;
                    const isInactive = g.active === false || g.status === 'Inactive';
                    return (
                      <option
                        key={g.id || name}
                        value={name}
                        disabled={isInactive}
                        className={isInactive ? 'text-slate-400 italic bg-slate-100 cursor-not-allowed' : 'text-slate-800 font-medium'}
                      >
                        {name}{isInactive ? ' (Inactive)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={clsFormState.description}
                  onChange={(e) => setClsFormState({ ...clsFormState, description: e.target.value })}
                  placeholder="Enter asset sub group description..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={clsFormState.status}
                  onChange={(e) => setClsFormState({ ...clsFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddClsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingClass ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Smart Delete Modal (Linked Dependencies Protection) */}
      <SmartDeleteModal
        isOpen={smartDeleteState.isOpen}
        onClose={() => setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false })}
        item={smartDeleteState.item}
        entityName="Asset Sub Group"
        linkedCount={smartDeleteState.linkedCount}
        details={smartDeleteState.details}
        onDeactivate={handleSmartDeactivateClass}
        isProcessing={smartDeleteState.isProcessing}
      />
    </div>
  );
}
