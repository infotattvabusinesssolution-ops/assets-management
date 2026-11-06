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
import { INITIAL_CLASSES } from './ClassesTab';
import { SmartDeleteModal } from './SmartDeleteModal';

export const INITIAL_CATEGORIES = [];

export function CategoriesTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveSubCategories, setLiveSubCategories] = useState([]);
  const [smartDeleteState, setSmartDeleteState] = useState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });

  // Load live categories from backend database
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const subcatCustom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
      const [res, grpRes, clsRes, subcatRes] = await Promise.all([
        api.get('/master-data/categories?includeInactive=true').catch(() => null),
        api.get('/master-data/asset-groups?includeInactive=true').catch(() => null),
        api.get('/master-data/asset-sub-groups?includeInactive=true').catch(() => null),
        api.get('/master-data/sub-categories?includeInactive=true').catch(() => null)
      ]);
      if (grpRes?.assetGroups && Array.isArray(grpRes.assetGroups)) {
        setAvailableAssetGroups(grpRes.assetGroups);
      }
      if (clsRes?.assetClasses && Array.isArray(clsRes.assetClasses)) {
        setAvailableAssetClasses(clsRes.assetClasses);
      }
      const allLiveSubCats = [...(subcatRes?.assetClasses || subcatRes?.subCategories || []), ...subcatCustom];
      setLiveSubCategories(allLiveSubCats);
      if (res?.categories && res.categories.length > 0) {
        const mapped = res.categories.map((cat, idx) => ({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          className: (() => {
            const m = (cat.description || '').match(/\[class:([^\]]+)\]/);
            return m ? m[1] : (cat.className || '-');
          })(),
          groupName: (() => {
            const m = (cat.description || '').match(/\[group:([^\]]+)\]/);
            return m ? m[1] : (cat.groupName || '-');
          })(),
          description: (() => {
            const clean = (cat.description || '')
              .replace(/\[type:[^\]]+\]/g, '')
              .replace(/\[group:[^\]]+\]/g, '')
              .replace(/\[class:[^\]]+\]/g, '')
              .trim();
            return clean || '-';
          })(),
          totalAssets: cat.totalAssets || 0,
          status: cat.active === false ? 'Inactive' : 'Active',
          createdBy: 'Admin',
          createdOn: cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          lastModifiedBy: 'Admin',
          lastModifiedOn: cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          relatedInfo: {
            subCategories: (() => {
              const childSubCats = allLiveSubCats.filter(sc =>
                (sc.categoryId && (sc.categoryId === cat.id || sc.categoryId === cat.code)) ||
                (sc.categoryName && cat.name && sc.categoryName.trim().toLowerCase() === cat.name.trim().toLowerCase())
              );
              return childSubCats.length || cat.subCategoriesCount || 0;
            })(),
            assets: cat.totalAssets || 0,
            maintenancePlans: 0,
            documents: 0,
            spareParts: 0
          }
        }));
        const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
        const serverCodes = new Set(mapped.map(m => (m.code || m.name || '').toUpperCase().trim()));
        const missingCustom = custom.filter(c => !serverCodes.has((c.code || c.name || '').toUpperCase().trim()));
        const rawList = [...mapped, ...missingCustom];

        // Deduplicate strictly so no category appears twice
        const seen = new Set();
        const fullList = rawList.filter(item => {
          const key = (item.code || item.name || '').toUpperCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setCategoriesList(fullList);
        setSelectedCategory((prev) => (prev ? fullList.find((c) => c.id === prev.id) || fullList[0] || null : fullList[0] || null));
      } else {
        const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
        setCategoriesList(custom);
        setSelectedCategory(custom[0] || null);
      }
    } catch (err) {
      const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
      setCategoriesList(custom);
      setSelectedCategory(custom[0] || null);
      console.warn('Failed to fetch categories, using fallback dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter state
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [catClassFilter, setCatClassFilter] = useState('All Classes');
  const [catGroupFilter, setCatGroupFilter] = useState('All Groups');
  const [catStatusFilter, setCatStatusFilter] = useState('All');

  // Modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [availableAssetGroups, setAvailableAssetGroups] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
      const existing = new Set(custom.map(c => (c.name || c.code).toLowerCase()));
      return [...custom, ...INITIAL_ASSET_GROUPS.filter(d => !existing.has(d.name.toLowerCase()))];
    } catch (_) {
      return INITIAL_ASSET_GROUPS;
    }
  });

  const [availableAssetClasses, setAvailableAssetClasses] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      const existing = new Set(custom.map(c => (c.name || c.code).toLowerCase()));
      return [...custom, ...INITIAL_CLASSES.filter(d => !existing.has(d.name.toLowerCase()))];
    } catch (_) {
      return INITIAL_CLASSES;
    }
  });

  const [catFormState, setCatFormState] = useState({
    code: '',
    name: '',
    className: '',
    groupName: '',
    description: '',
    status: 'Active'
  });

  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) => {
      const matchesSearch =
        !catSearchQuery ||
        cat.code.toLowerCase().includes(catSearchQuery.toLowerCase()) ||
        cat.name.toLowerCase().includes(catSearchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(catSearchQuery.toLowerCase());

      const matchesClass =
        catClassFilter === 'All Classes' || catClassFilter === 'All' || catClassFilter === 'All Sub Groups' || !catClassFilter || cat.className === catClassFilter;

      const matchesGroup =
        catGroupFilter === 'All Groups' || catGroupFilter === 'All' || !catGroupFilter || cat.groupName === catGroupFilter;

      const matchesStatus =
        catStatusFilter === 'All' || cat.status.toLowerCase() === catStatusFilter.toLowerCase();

      return matchesSearch && matchesClass && matchesGroup && matchesStatus;
    });
  }, [categoriesList, catSearchQuery, catClassFilter, catGroupFilter, catStatusFilter]);

  // Keep selectedCategory synchronized when filteredCategories changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      if (!selectedCategory || !filteredCategories.some((c) => c.id === selectedCategory.id)) {
        setSelectedCategory(filteredCategories[0]);
      }
    }
  }, [filteredCategories, selectedCategory]);

  const handleResetCatFilters = () => {
    setCatSearchQuery('');
    setCatClassFilter('All Classes');
    setCatGroupFilter('All Groups');
    setCatStatusFilter('All');
  };

  const handleOpenAddCatModal = (catToEdit = null) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    if (catToEdit) {
      setEditingCategory(catToEdit);
      setCatFormState({
        code: catToEdit.code,
        name: catToEdit.name,
        className: catToEdit.className,
        groupName: catToEdit.groupName,
        description: catToEdit.description,
        status: catToEdit.status
      });
    } else {
      setEditingCategory(null);
      setCatFormState({
        code: '',
        name: '',
        className: '',
        groupName: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddCatModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddCatModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const cleanCode = (catFormState.code || '').trim().toUpperCase();
    const cleanName = (catFormState.name || '').trim();

    if (!cleanCode || !cleanName) {
      setModalError('Category Code and Name are required.');
      return;
    }

    const dupCode = categoriesList.find(c => (c.code || '').trim().toUpperCase() === cleanCode && (!editingCategory || c.id !== editingCategory.id));
    if (dupCode) {
      const msg = `Category with code "${cleanCode}" already exists. Duplicate codes are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const dupName = categoriesList.find(c => (c.name || '').trim().toLowerCase() === cleanName.toLowerCase() && (!editingCategory || c.id !== editingCategory.id));
    if (dupName) {
      const msg = `Category with name "${cleanName}" already exists. Duplicate names are not allowed.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const groupToTag = {
      'Information Technology': '[type:it]',
      'Buildings & Facilities': '[type:facility]',
      'Plant & Machinery': '[type:machinery]',
      'Vehicles': '[type:vehicle]',
      'Furniture, Fixtures & Equipment': '[type:furniture]'
    };
    const tag = groupToTag[catFormState.groupName] || (catFormState.groupName ? `[type:${catFormState.groupName.toLowerCase().replace(/\s+/g, '_')}]` : '');
    let cleanDesc = (catFormState.description || '')
      .replace(/\[type:[^\]]+\]/g, '')
      .replace(/\[group:[^\]]+\]/g, '')
      .replace(/\[class:[^\]]+\]/g, '')
      .trim();
    const parts = [cleanDesc];
    if (tag) parts.push(tag);
    if (catFormState.groupName) parts.push(`[group:${catFormState.groupName}]`);
    if (catFormState.className) parts.push(`[class:${catFormState.className}]`);
    const taggedDescription = parts.filter(Boolean).join(' ').trim();

    if (editingCategory) {
      try {
        await api.put(`/master-data/categories/${editingCategory.id}`, {
          code: cleanCode,
          name: cleanName,
          description: taggedDescription,
          status: catFormState.status
        });
        await loadCategories();
        triggerToast && triggerToast(`Category "${cleanName}" updated successfully.`);
      } catch (err) {
        console.error('Save category error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to update category.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    } else {
      try {
        await api.post('/master-data/categories', {
          code: cleanCode,
          name: cleanName,
          description: taggedDescription,
          status: catFormState.status
        });
        await loadCategories();
        triggerToast && triggerToast(`Category "${cleanName}" created successfully.`);
      } catch (err) {
        console.error('Add category error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to create category.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }
    setShowAddCatModal(false);
  };

  const handleDuplicateCategory = (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...cat,
      id: Date.now(),
      code: `${cat.code}-COPY`,
      name: `${cat.name} (Copy)`,
      totalAssets: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
    setCategoriesList([duplicated, ...categoriesList]);
    setSelectedCategory(duplicated);
    triggerToast && triggerToast(`Category "${cat.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleCategoryStatus = async (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/master-data/entities/category/${cat.id}/status`);
      await loadCategories();
      triggerToast && triggerToast(`Category "${cat.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Status toggle error:', err);
      const updated = categoriesList.map((c) =>
        c.id === cat.id ? { ...c, status: newStatus } : c
      );
      setCategoriesList(updated);
      if (selectedCategory?.id === cat.id) {
        setSelectedCategory({ ...selectedCategory, status: newStatus });
      }
      triggerToast && triggerToast(`Category "${cat.code}" status changed to ${newStatus}.`);
    }
  };

  const handleInitiateDeleteCategory = (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const childSubCats = (liveSubCategories || []).filter(sc =>
      (sc.categoryId && (sc.categoryId === cat.id || sc.categoryId === cat.code)) ||
      (sc.categoryName && cat.name && sc.categoryName.trim().toLowerCase() === cat.name.trim().toLowerCase())
    );
    const totalLinked = childSubCats.length + (cat.totalAssets || 0);
    if (totalLinked > 0) {
      setSmartDeleteState({
        isOpen: true,
        item: cat,
        linkedCount: totalLinked,
        details: {
          classCount: childSubCats.length,
          assetsCount: cat.totalAssets || 0
        },
        isProcessing: false
      });
      return;
    }
    handleDeleteCategory(cat);
  };

  const handleDeleteCategory = async (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (!window.confirm(`Are you sure you want to delete Category "${cat.name}" (${cat.code})?`)) return;

    try {
      const res = await api.delete(
        `/master-data/categories/${cat.id}?name=${encodeURIComponent(cat.name || '')}&code=${encodeURIComponent(cat.code || '')}`
      );
      if (res?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: cat,
          linkedCount: res.linkedCount || 0,
          details: res.details || null,
          isProcessing: false
        });
        return;
      }
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
        localStorage.setItem('fams_custom_categories', JSON.stringify(custom.filter(c => c.id !== cat.id && c.code !== cat.code)));
      } catch (_) { }
      await loadCategories();
      triggerToast && triggerToast(res?.message || `Category "${cat.name || cat.code}" deleted successfully.`);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: cat,
          linkedCount: data.linkedCount || 0,
          details: data.details || null,
          isProcessing: false
        });
        return;
      }
      console.warn('Delete category error:', err);
      triggerToast && triggerToast(data?.message || err?.message || 'Failed to delete category.');
    }
  };

  const handleSmartDeactivateCategory = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(
        `/master-data/categories/${smartDeleteState.item.id}?action=deactivate&name=${encodeURIComponent(smartDeleteState.item.name || '')}&code=${encodeURIComponent(smartDeleteState.item.code || '')}`
      );
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      triggerToast && triggerToast(res?.message || 'Category deactivated successfully.');
      await loadCategories();
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to deactivate category.');
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
              placeholder="Search by category code, name or description..."
              value={catSearchQuery}
              onChange={(e) => setCatSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-48 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Sub Group</span>
            <select
              value={catClassFilter}
              onChange={(e) => setCatClassFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Classes">All Sub Groups</option>
              {availableAssetClasses.map((c) => {
                const name = c.name || c.code;
                return (
                  <option key={c.id || name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full md:w-48 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Group</span>
            <select
              value={catGroupFilter}
              onChange={(e) => setCatGroupFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Groups">All Groups</option>
              {availableAssetGroups.map((g) => {
                const name = g.name || g.code;
                return (
                  <option key={g.id || name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={catStatusFilter}
              onChange={(e) => setCatStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0 flex items-center gap-2">
            <button
              onClick={handleResetCatFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={loadCategories}
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
              <h2 className="text-sm font-bold text-slate-900">Categories List</h2>
              <p className="text-xs text-slate-500">Showing all asset categories.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredCategories.length} Categories
              </span>
            </div>
          </div>

          <div className="overflow-auto min-h-[320px] max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Category Code</th>
                  <th className="py-3 px-3">Category Name</th>
                  <th className="py-3 px-3">Asset Sub Group</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCategories.map((cat, index) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isMenuOpen = activeRowMenuId === `cat-${cat.id}`;
                  const isNearBottom = filteredCategories.length > 2 && index >= filteredCategories.length - 2;

                  return (
                    <tr
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-3.5 px-2 text-center text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-bold font-mono text-[#6C2BD9]">{cat.code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{cat.name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{cat.className}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={cat.description}>
                        {cat.description || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(cat.totalAssets ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            cat.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {cat.status}
                        </span>
                      </td>

                      <td className={clsx("py-3.5 px-3 text-center relative", isMenuOpen && "z-30")} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleOpenAddCatModal(cat)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `cat-${cat.id}`)}
                            className={clsx(
                              'p-1 rounded transition-colors',
                              isMenuOpen ? 'bg-purple-100 text-[#6C2BD9]' : 'hover:bg-slate-100 text-slate-500 hover:text-[#6C2BD9]'
                            )}
                            title="More Actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isMenuOpen && (
                          <div className={clsx(
                            "absolute right-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-150",
                            isNearBottom ? "bottom-10" : "top-10"
                          )}>
                            <button
                              onClick={() => handleOpenAddCatModal(cat)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Edit Category</span>
                            </button>

                            <button
                              onClick={() => handleDuplicateCategory(cat)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={() => handleToggleCategoryStatus(cat)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Activate / Deactivate</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                setShowAuditHistoryModal && setShowAuditHistoryModal(true);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View Audit Log</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => handleInitiateDeleteCategory(cat)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
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
              Showing {filteredCategories.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Right Column: Category Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Category Details</h3>
            <button
              onClick={() => handleOpenAddCatModal(selectedCategory)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedCategory && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Category Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedCategory.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Category Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedCategory.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Sub Group</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedCategory.className}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Group</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedCategory.groupName}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedCategory.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedCategory.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedCategory.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedCategory.totalAssets ?? 0).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedCategory.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedCategory.createdOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo?.subCategories ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{(selectedCategory.relatedInfo?.assets ?? 0).toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo?.maintenancePlans ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo?.documents ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Category */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
              </h3>
              <button onClick={() => setShowAddCatModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  value={catFormState.code}
                  onChange={(e) => setCatFormState({ ...catFormState, code: e.target.value })}
                  placeholder="e.g. IT-HW-LAP, BLD-MEP-HVAC"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catFormState.name}
                  onChange={(e) => setCatFormState({ ...catFormState, name: e.target.value })}
                  placeholder="e.g. Laptops, HVAC Systems"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Asset Sub Group *</label>
                <select
                  required
                  value={catFormState.className}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    if (!selectedVal) {
                      setCatFormState({
                        ...catFormState,
                        className: '',
                        groupName: ''
                      });
                      return;
                    }
                    const selectedClass = availableAssetClasses.find(cls => (cls.name || cls.code) === selectedVal);
                    const derivedGroup = selectedClass?.groupName || '';
                    setCatFormState({
                      ...catFormState,
                      className: selectedVal,
                      groupName: derivedGroup
                    });
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">-- Select Parent Asset Sub Group --</option>
                  {availableAssetClasses.map((cls) => {
                    const name = cls.name || cls.code;
                    return (
                      <option key={cls.id || name} value={name}>
                        {name} {cls.groupName ? `(Group: ${cls.groupName})` : ''}
                      </option>
                    );
                  })}
                </select>
                {catFormState.className && (
                  <div className="mt-2 p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] space-y-1">
                    <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Auto-Inherited Classification:</div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md text-[#6C2BD9]">
                        Group: {catFormState.groupName || '-'}
                      </span>
                      <span className="text-slate-400">&rsaquo;</span>
                      <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md text-[#6C2BD9]">
                        Sub Group: {catFormState.className}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={catFormState.description}
                  onChange={(e) => setCatFormState({ ...catFormState, description: e.target.value })}
                  placeholder="Enter detailed category description..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={catFormState.status}
                  onChange={(e) => setCatFormState({ ...catFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddCatModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingCategory ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SmartDeleteModal
        isOpen={smartDeleteState.isOpen}
        onClose={() => setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false })}
        item={smartDeleteState.item}
        entityName="Category"
        linkedCount={smartDeleteState.linkedCount}
        details={smartDeleteState.details}
        onDeactivate={handleSmartDeactivateCategory}
        isProcessing={smartDeleteState.isProcessing}
      />
    </div>
  );
}
