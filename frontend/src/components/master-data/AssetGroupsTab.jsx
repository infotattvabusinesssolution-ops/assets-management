import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
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
import { INITIAL_CLASSES } from './ClassesTab';
import { INITIAL_CATEGORIES } from './CategoriesTab';
import { INITIAL_SUB_CATEGORIES } from './SubCategoriesTab';

export const INITIAL_ASSET_GROUPS = [
  {
    id: 1,
    code: 'IT',
    name: 'Information Technology',
    description: 'IT hardware and software assets including laptops, desktops, servers, network devices and related accessories.',
    assetType: 'Both',
    assetTypeLabel: 'Both (Physical & Intangible)',
    totalAssets: 1245,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 10:30 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '05 Aug 2025 02:15 PM',
    relatedInfo: {
      classes: 8,
      categories: 24,
      subCategories: 56,
      assets: 1245,
      documents: 3
    }
  },
  {
    id: 2,
    code: 'BLD',
    name: 'Buildings & Facilities',
    description: 'Buildings, facilities and infrastructure including office premises, warehouses, and HVAC systems.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 860,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '14 Jan 2025 09:15 AM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '10 Jun 2025 11:40 AM',
    relatedInfo: {
      classes: 5,
      categories: 12,
      subCategories: 28,
      assets: 860,
      documents: 14
    }
  },
  {
    id: 3,
    code: 'PLANT',
    name: 'Plant & Machinery',
    description: 'Production and plant equipment, manufacturing lines, generators, and heavy machinery.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 642,
    status: 'Active',
    createdBy: 'John Doe',
    createdOn: '18 Jan 2025 02:20 PM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '18 Jul 2025 04:10 PM',
    relatedInfo: {
      classes: 6,
      categories: 18,
      subCategories: 42,
      assets: 642,
      documents: 8
    }
  },
  {
    id: 4,
    code: 'VEH',
    name: 'Vehicles',
    description: 'Fleet vehicles and transport equipment including delivery vans, corporate cars, and forklifts.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 215,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 11:05 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '02 Aug 2025 09:30 AM',
    relatedInfo: {
      classes: 4,
      categories: 8,
      subCategories: 16,
      assets: 215,
      documents: 12
    }
  },
  {
    id: 5,
    code: 'FF&E',
    name: 'Furniture, Fixtures & Equipment',
    description: 'Office furniture and fixtures including executive desks, ergonomic seating, and conference tables.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 530,
    status: 'Active',
    createdBy: 'Sarah Ahmed',
    createdOn: '22 Jan 2025 04:45 PM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '12 May 2025 01:15 PM',
    relatedInfo: {
      classes: 4,
      categories: 15,
      subCategories: 32,
      assets: 530,
      documents: 2
    }
  },
  {
    id: 6,
    code: 'MED',
    name: 'Medical Equipment',
    description: 'Hospital and clinical equipment, diagnostic tools, patient monitors, and lab apparatus.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 312,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '25 Jan 2025 10:00 AM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '28 Jun 2025 03:50 PM',
    relatedInfo: {
      classes: 7,
      categories: 20,
      subCategories: 45,
      assets: 312,
      documents: 9
    }
  },
  {
    id: 7,
    code: 'TOOL',
    name: 'Tools & Accessories',
    description: 'Tools and small equipment used for maintenance, repairs, and daily operations.',
    assetType: 'Physical',
    assetTypeLabel: 'Physical Tangible',
    totalAssets: 198,
    status: 'Active',
    createdBy: 'Ramesh Kumar',
    createdOn: '28 Jan 2025 01:30 PM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '15 Aug 2025 10:20 AM',
    relatedInfo: {
      classes: 3,
      categories: 10,
      subCategories: 22,
      assets: 198,
      documents: 1
    }
  },
  {
    id: 8,
    code: 'SW',
    name: 'Software Assets',
    description: 'Licensed software and subscriptions including ERP platforms, design suites, and cloud applications.',
    assetType: 'Intangible',
    assetTypeLabel: 'Intangible / Digital',
    totalAssets: 420,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '01 Feb 2025 09:00 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '01 Aug 2025 05:00 PM',
    relatedInfo: {
      classes: 5,
      categories: 14,
      subCategories: 30,
      assets: 420,
      documents: 6
    }
  },
  {
    id: 9,
    code: 'LIC',
    name: 'Licenses',
    description: 'Regulatory and operational licenses, patents, copyrights, and commercial permits.',
    assetType: 'Intangible',
    assetTypeLabel: 'Intangible / Digital',
    totalAssets: 124,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '05 Feb 2025 03:10 PM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '20 Jul 2025 11:15 AM',
    relatedInfo: {
      classes: 3,
      categories: 7,
      subCategories: 15,
      assets: 124,
      documents: 18
    }
  },
  {
    id: 10,
    code: 'OTH',
    name: 'Other Assets',
    description: 'Miscellaneous assets not categorized in standard groups.',
    assetType: 'Both',
    assetTypeLabel: 'Both (Physical & Intangible)',
    totalAssets: 76,
    status: 'Inactive',
    createdBy: 'John Doe',
    createdOn: '10 Feb 2025 11:45 AM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '04 Aug 2025 09:00 AM',
    relatedInfo: {
      classes: 2,
      categories: 4,
      subCategories: 8,
      assets: 76,
      documents: 0
    }
  }
];

export function AssetGroupsTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  reloadTrigger,
  onNavigateTab
}) {
  const [assetGroups, setAssetGroups] = useState(INITIAL_ASSET_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(INITIAL_ASSET_GROUPS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Related items explorer modal state
  const [selectedRelatedType, setSelectedRelatedType] = useState(null); // 'classes' | 'categories' | 'subcategories'
  const [relatedSearchQuery, setRelatedSearchQuery] = useState('');

  const [grpSearchQuery, setGrpSearchQuery] = useState('');
  const [grpStatusFilter, setGrpStatusFilter] = useState('All');
  const [grpAssetTypeFilter, setGrpAssetTypeFilter] = useState('All');

  const [showAddGrpModal, setShowAddGrpModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [modalError, setModalError] = useState('');
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
    setIsLoading(true);
    let customGroups = [];
    try {
      customGroups = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
    } catch (e) {}

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
          setSelectedGroup(merged[0]);
        }
      } else if (customGroups.length > 0) {
        const merged = [...customGroups, ...INITIAL_ASSET_GROUPS];
        setAssetGroups(merged);
      }
    } catch (err) {
      console.warn('Failed to fetch asset groups from backend, falling back to local dataset:', err);
      if (customGroups.length > 0) {
        const existingCodes = new Set(INITIAL_ASSET_GROUPS.map(g => g.code.toUpperCase()));
        const missing = customGroups.filter(g => !existingCodes.has(g.code.toUpperCase()));
        setAssetGroups([...missing, ...INITIAL_ASSET_GROUPS]);
      }
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

  const handleResetGrpFilters = () => {
    setGrpSearchQuery('');
    setGrpStatusFilter('All');
    setGrpAssetTypeFilter('All');
  };

  // Calculate related classes for the selected group
  const relatedClassesList = useMemo(() => {
    if (!selectedGroup) return [];
    return INITIAL_CLASSES.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup]);

  // Calculate related categories for the selected group
  const relatedCategoriesList = useMemo(() => {
    if (!selectedGroup) return [];
    return INITIAL_CATEGORIES.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup]);

  // Calculate related subcategories for the selected group
  const relatedSubCategoriesList = useMemo(() => {
    if (!selectedGroup) return [];
    return INITIAL_SUB_CATEGORIES.filter((c) => {
      const grpName = (selectedGroup.name || '').toLowerCase();
      const grpCode = (selectedGroup.code || '').toLowerCase();
      const cGrp = (c.groupName || '').toLowerCase();
      const cCode = (c.code || '').toLowerCase();
      return (
        cGrp === grpName ||
        (grpName && cGrp.includes(grpName)) ||
        (grpName && grpName.includes(cGrp)) ||
        (grpCode && cCode.startsWith(grpCode))
      );
    });
  }, [selectedGroup]);

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

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setModalError('');
    console.log('📝 [AssetGroupsTab] Submitting Asset Group form:', grpFormState);

    const cleanCode = grpFormState.code?.trim().toUpperCase();
    const cleanName = grpFormState.name?.trim();

    if (!cleanCode || !cleanName) {
      console.warn('⚠️ [AssetGroupsTab] Validation failed: Code and Name are required.', grpFormState);
      const msg = 'Group Code and Name are required.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    // Client-side pre-validation: check for duplicate group code
    const duplicate = assetGroups.find(
      (g) => g.code?.toUpperCase() === cleanCode && (!editingGroup || g.id !== editingGroup.id)
    );
    if (duplicate) {
      const msg = `Asset Group code "${cleanCode}" already exists (used by "${duplicate.name}"). Please use a different code.`;
      console.warn('⚠️ [AssetGroupsTab] Duplicate Code detected:', msg);
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    setIsSaving(true);

    try {
      if (editingGroup) {
        console.log(`📡 [AssetGroupsTab] Updating Asset Group ID ${editingGroup.id}:`, grpFormState);
        let res = null;
        try {
          res = await api.put(`/master-data/asset-groups/${editingGroup.id}`, {
            ...grpFormState,
            code: cleanCode,
            name: cleanName
          });
          console.log('✅ [AssetGroupsTab] Update Success:', res);
        } catch (apiErr) {
          console.warn('API update failed, updating locally:', apiErr);
        }
        const saved = res?.assetGroup || { ...editingGroup, ...grpFormState, code: cleanCode, name: cleanName };
        const updated = assetGroups.map((g) => (g.id === editingGroup.id ? { ...g, ...saved } : g));
        setAssetGroups(updated);
        if (selectedGroup?.id === editingGroup.id) {
          setSelectedGroup(updated.find((g) => g.id === editingGroup.id) || saved);
        }
        triggerToast && triggerToast(`Asset Group "${cleanName}" updated successfully.`);
      } else {
        console.log('📡 [AssetGroupsTab] Creating new Asset Group via POST /master-data/asset-groups:', grpFormState);
        let res = null;
        try {
          res = await api.post('/master-data/asset-groups', {
            ...grpFormState,
            code: cleanCode,
            name: cleanName
          });
          console.log('🎉 [AssetGroupsTab] Create Success Response:', res);
        } catch (apiErr) {
          console.warn('API create asset group failed, saving locally:', apiErr);
        }

        const newGroup = res?.assetGroup || {
          id: `grp-${Date.now()}`,
          code: cleanCode,
          name: cleanName,
          description: grpFormState.description,
          assetType: grpFormState.assetType,
          assetTypeLabel:
            grpFormState.assetType === 'Both'
              ? 'Both (Physical & Intangible)'
              : grpFormState.assetType === 'Physical'
                ? 'Physical Tangible'
                : 'Intangible / Digital',
          totalAssets: 0,
          status: grpFormState.status,
          createdBy: 'Admin User',
          createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 10:30 AM',
          lastModifiedBy: 'Admin User',
          lastModifiedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 10:30 AM',
          relatedInfo: { classes: 0, categories: 0, subCategories: 0, assets: 0, documents: 0 }
        };

        try {
          const currentCustom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
          localStorage.setItem('fams_custom_asset_groups', JSON.stringify([newGroup, ...currentCustom.filter(g => g.code !== cleanCode)]));
        } catch (e) {}

        const updated = [newGroup, ...assetGroups];
        setAssetGroups(updated);
        setSelectedGroup(newGroup);
        if (grpStatusFilter !== 'All' && grpStatusFilter.toLowerCase() !== newGroup.status.toLowerCase()) {
          setGrpStatusFilter('All');
        }
        triggerToast && triggerToast(`Asset Group "${cleanName}" created successfully.`);
      }
      setShowAddGrpModal(false);
    } catch (err) {
      console.error('❌ [AssetGroupsTab] Save Asset Group Failed:', err);
      const errMsg = err?.message || err?.response?.data?.message || 'Failed to save asset group.';
      setModalError(errMsg);
      triggerToast && triggerToast(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master-data/asset-groups/${groupToDelete.id}`);
      try {
        const currentCustom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
        localStorage.setItem('fams_custom_asset_groups', JSON.stringify(currentCustom.filter(g => g.id !== groupToDelete.id && g.code !== groupToDelete.code)));
      } catch (e) {}

      const updated = assetGroups.filter((g) => g.id !== groupToDelete.id);
      setAssetGroups(updated);
      if (selectedGroup?.id === groupToDelete.id) {
        setSelectedGroup(updated[0] || null);
      }
      triggerToast && triggerToast(`Asset Group "${groupToDelete.name}" deleted successfully.`);
      setShowDeleteConfirmModal(false);
      setGroupToDelete(null);
    } catch (err) {
      triggerToast && triggerToast(err.response?.data?.message || 'Failed to delete asset group.');
    } finally {
      setIsDeleting(false);
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

          <div className="w-full md:w-52 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Asset Type</span>
            <select
              value={grpAssetTypeFilter}
              onChange={(e) => setGrpAssetTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Physical">Physical</option>
              <option value="Intangible">Intangible</option>
              <option value="Both">Both</option>
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
              <button
                onClick={() => handleOpenAddGrpModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Group</span>
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
                  <th className="py-3 px-3.5">Asset Type</th>
                  <th className="py-3 px-3.5 text-right">Total Assets</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[#6C2BD9] animate-spin" />
                        <span className="text-xs font-semibold">Loading Asset Groups from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No asset groups found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((grp, index) => {
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
                        <td className="py-3.5 px-3.5 text-center text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-3.5 font-bold font-mono text-[#6C2BD9]">{grp.code}</td>
                        <td className="py-3.5 px-3.5 font-semibold text-slate-900">{grp.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate" title={grp.description}>
                          {grp.description || '-'}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700">{grp.assetType}</td>
                        <td className="py-3.5 px-3.5 text-right font-mono font-bold text-slate-900">
                          {grp.totalAssets.toLocaleString()}
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
                              onClick={() => setSelectedGroup(grp)}
                              title="View Details"
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenAddGrpModal(grp)}
                              title="Edit Group"
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#6C2BD9] cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setGroupToDelete(grp);
                                setShowDeleteConfirmModal(true);
                              }}
                              title="Delete Group"
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
            <span className="text-slate-600 font-medium">
              Showing {filteredGroups.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Selected Group Detail Drawer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Asset Group Details</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenAddGrpModal(selectedGroup)}
                className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setGroupToDelete(selectedGroup);
                  setShowDeleteConfirmModal(true);
                }}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                title="Delete Group"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {selectedGroup && (
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
                <span className="text-slate-500 font-medium">Asset Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedGroup.assetTypeLabel}</span>
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedGroup.totalAssets.toLocaleString()}</span>
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
                    title="Explore related Asset Classes"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-[#6C2BD9] flex items-center justify-center group-hover:bg-[#6C2BD9] group-hover:text-white transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-800 group-hover:text-[#6C2BD9]">Asset Classes</span>
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
                        title="Jump straight to Asset Classes tab"
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
                <label className="block font-semibold text-slate-700 mb-1">Group Code *</label>
                <input
                  type="text"
                  required
                  value={grpFormState.code}
                  onChange={(e) => {
                    setModalError('');
                    setGrpFormState({ ...grpFormState, code: e.target.value });
                  }}
                  placeholder="e.g. IT, BLD, PLANT"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none uppercase"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Type</label>
                  <select
                    value={grpFormState.assetType}
                    onChange={(e) => setGrpFormState({ ...grpFormState, assetType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Both">Both (Physical & Intangible)</option>
                    <option value="Physical">Physical Tangible</option>
                    <option value="Intangible">Intangible / Digital</option>
                  </select>
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
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddGrpModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5">
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGroup ? 'Save Changes' : 'Create Asset Group'}</span>
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
                      {selectedRelatedType === 'classes' && 'Related Asset Classes'}
                      {selectedRelatedType === 'categories' && 'Related Categories'}
                      {selectedRelatedType === 'subcategories' && 'Related Sub Categories'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 text-[#6C2BD9] font-medium">
                      {selectedGroup.name} ({selectedGroup.code})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing all {selectedRelatedType === 'classes' ? 'classes' : selectedRelatedType === 'categories' ? 'categories' : 'sub-categories'} mapped under this asset group
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
                  placeholder={`Search in related ${selectedRelatedType === 'classes' ? 'classes' : selectedRelatedType === 'categories' ? 'categories' : 'sub categories'}...`}
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
                <span>Open {selectedRelatedType === 'classes' ? 'Classes' : selectedRelatedType === 'categories' ? 'Categories' : 'Sub Categories'} Tab</span>
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
                    Go to {selectedRelatedType === 'classes' ? 'Asset Classes' : selectedRelatedType === 'categories' ? 'Categories' : 'Sub Categories'} Tab
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
                          <td className="py-2.5 px-3 text-slate-600 font-medium">{item.className || 'Hardware'}</td>
                        )}
                        {selectedRelatedType === 'subcategories' && (
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{item.categoryName || 'Standard'}</div>
                            <div className="text-[10px] text-slate-400">{item.className || 'Hardware'}</div>
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
    </div>
  );
}
