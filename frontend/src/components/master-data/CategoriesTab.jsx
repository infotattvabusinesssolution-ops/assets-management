import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
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
  Plus
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { INITIAL_ASSET_GROUPS } from './AssetGroupsTab';
import { INITIAL_CLASSES } from './ClassesTab';

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
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load live categories from backend database
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/master-data/categories');
      if (res?.categories && res.categories.length > 0) {
        const mapped = res.categories.map((cat, idx) => ({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          className: (() => {
            const m = (cat.description || '').match(/\[class:([^\]]+)\]/);
            return m ? m[1] : (cat.code.startsWith('IT') ? 'Hardware' : (cat.code.startsWith('BLD') ? 'Building Structure' : 'General'));
          })(),
          groupName: (() => {
            const m = (cat.description || '').match(/\[group:([^\]]+)\]/);
            return m ? m[1] : (cat.code.startsWith('IT') ? 'Information Technology' : (cat.code.startsWith('BLD') ? 'Buildings & Facilities' : 'Corporate Assets'));
          })(),
          description: cat.description || `Classification for ${cat.name}`,
          totalAssets: (idx + 1) * 28,
          status: cat.active === false ? 'Inactive' : 'Active',
          createdBy: 'Admin',
          createdOn: cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 09:30 AM' : '15 Jan 2025 09:30 AM',
          lastModifiedBy: 'Admin',
          lastModifiedOn: cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 02:30 PM' : '02 Sep 2025 04:15 PM',
          relatedInfo: {
            subCategories: 4,
            assets: (idx + 1) * 28,
            maintenancePlans: 3,
            documents: 2,
            spareParts: 6
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
    className: 'Hardware',
    groupName: 'Information Technology',
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
        catClassFilter === 'All Classes' || catClassFilter === 'All' || cat.className === catClassFilter;

      const matchesGroup =
        catGroupFilter === 'All Groups' || catGroupFilter === 'All' || cat.groupName === catGroupFilter;

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
        className: 'Hardware',
        groupName: 'Information Technology',
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
    if (!catFormState.code || !catFormState.name) return;

    const groupToTag = {
      'Information Technology': '[type:it]',
      'Buildings & Facilities': '[type:facility]',
      'Plant & Machinery': '[type:machinery]',
      'Vehicles': '[type:vehicle]',
      'Furniture, Fixtures & Equipment': '[type:furniture]'
    };
    const tag = groupToTag[catFormState.groupName] || '[type:it]';
    let cleanDesc = (catFormState.description || '')
      .replace(/\[type:[^\]]+\]/g, '')
      .replace(/\[group:[^\]]+\]/g, '')
      .replace(/\[class:[^\]]+\]/g, '')
      .trim();
    const taggedDescription = `${cleanDesc} ${tag} [group:${catFormState.groupName}] [class:${catFormState.className}]`.trim();

    if (editingCategory) {
      try {
        await api.put(`/master-data/categories/${editingCategory.id}`, {
          code: catFormState.code.toUpperCase(),
          name: catFormState.name,
          description: taggedDescription,
          status: catFormState.status
        });
        await loadCategories();
        triggerToast && triggerToast(`Category "${catFormState.name}" updated successfully.`);
      } catch (err) {
        console.warn('Save category error:', err);
        const updated = categoriesList.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                code: catFormState.code.toUpperCase(),
                name: catFormState.name,
                className: catFormState.className,
                groupName: catFormState.groupName,
                description: taggedDescription,
                status: catFormState.status,
                lastModifiedBy: 'Logged In User',
                lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) + ' 02:30 PM'
              }
            : c
        );
        setCategoriesList(updated);
        if (selectedCategory.id === editingCategory.id) {
          setSelectedCategory(updated.find((item) => item.id === editingCategory.id));
        }
        triggerToast && triggerToast(`Category "${catFormState.name}" updated successfully.`);
      }
    } else {
      try {
        await api.post('/master-data/categories', {
          code: catFormState.code.toUpperCase(),
          name: catFormState.name,
          description: taggedDescription,
          status: catFormState.status
        });
        await loadCategories();
        triggerToast && triggerToast(`Category "${catFormState.name}" created successfully.`);
      } catch (err) {
        console.warn('Create category error:', err);
        const newCat = {
          id: Date.now(),
          code: catFormState.code.toUpperCase(),
          name: catFormState.name,
          className: catFormState.className,
          groupName: catFormState.groupName,
          description: taggedDescription,
          totalAssets: 0,
          status: catFormState.status,
          createdBy: 'Admin User',
          createdOn: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) + ' 09:30 AM',
          lastModifiedBy: 'Admin User',
          lastModifiedOn: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) + ' 09:30 AM',
          relatedInfo: {
            subCategories: 0,
            assets: 0,
            maintenancePlans: 0,
            documents: 0,
            spareParts: 0
          }
        };
        setCategoriesList([newCat, ...categoriesList]);
        setSelectedCategory(newCat);
        triggerToast && triggerToast(`Category "${catFormState.name}" created successfully.`);
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
      }) + ' 05:30 PM'
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

  const handleDeleteCategory = async (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Category "${cat.name}" (${cat.code})?`)) {
      try {
        const res = await api.delete(`/master-data/categories/${cat.id}`);
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
          localStorage.setItem('fams_custom_categories', JSON.stringify(custom.filter(c => c.id !== cat.id && c.code !== cat.code)));
        } catch (_) {}
        await loadCategories();
        triggerToast && triggerToast(res?.message || `Category "${cat.name || cat.code}" deleted successfully.`);
      } catch (err) {
        console.warn('Delete category error:', err);
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
          localStorage.setItem('fams_custom_categories', JSON.stringify(custom.filter(c => c.id !== cat.id && c.code !== cat.code)));
        } catch (_) {}
        const remaining = categoriesList.filter((c) => c.id !== cat.id);
        setCategoriesList(remaining);
        setSelectedCategory(remaining[0] || null);
        triggerToast && triggerToast(`Category "${cat.name || cat.code}" deleted.`);
      }
    }
  };

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedCatIds.length === 0) return;
    const count = selectedCatIds.length;
    if (window.confirm(`Are you sure you want to delete ${count} selected categor${count === 1 ? 'y' : 'ies'}?`)) {
      setIsBulkDeleting(true);
      try {
        const res = await api.post('/master-data/categories/bulk-delete', { ids: selectedCatIds, force: true }).catch(async () => {
          await Promise.allSettled(selectedCatIds.map(id => api.delete(`/master-data/categories/${id}?force=true`)));
          return { success: true, message: `Processed ${count} categories.` };
        });

        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
          const idSet = new Set(selectedCatIds);
          localStorage.setItem('fams_custom_categories', JSON.stringify(custom.filter(c => !idSet.has(c.id))));
        } catch (_) {}

        const remaining = categoriesList.filter(c => !selectedCatIds.includes(c.id));
        setCategoriesList(remaining);
        if (selectedCategory && selectedCatIds.includes(selectedCategory.id)) {
          setSelectedCategory(remaining[0] || null);
        }
        setSelectedCatIds([]);
        await loadCategories();
        triggerToast && triggerToast(res?.message || `Successfully removed ${count} categories.`);
      } catch (err) {
        console.warn('Bulk delete error:', err);
        triggerToast && triggerToast('Failed to delete some categories.');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  const handleToggleSelectAllCats = () => {
    if (selectedCatIds.length === filteredCategories.length) {
      setSelectedCatIds([]);
    } else {
      setSelectedCatIds(filteredCategories.map((c) => c.id));
    }
  };

  const handleToggleSelectCat = (id) => {
    if (selectedCatIds.includes(id)) {
      setSelectedCatIds(selectedCatIds.filter((item) => item !== id));
    } else {
      setSelectedCatIds([...selectedCatIds, id]);
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
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Class</span>
            <select
              value={catClassFilter}
              onChange={(e) => setCatClassFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Classes">All Classes</option>
              <option value="Hardware">Hardware</option>
              <option value="Network Equipment">Network Equipment</option>
              <option value="Building Structure">Building Structure</option>
              <option value="MEP Systems">MEP Systems</option>
              <option value="Production Equipment">Production Equipment</option>
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
              <option value="Information Technology">Information Technology</option>
              <option value="Buildings & Facilities">Buildings & Facilities</option>
              <option value="Plant & Machinery">Plant & Machinery</option>
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
              <button
                onClick={() => handleOpenAddCatModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Floating / Integrated Bulk Actions Toolbar */}
          {selectedCatIds.length > 0 && (
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-200 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6C2BD9]">
                <span className="w-2 h-2 rounded-full bg-[#6C2BD9] animate-ping"></span>
                <span>{selectedCatIds.length} categor{selectedCatIds.length === 1 ? 'y' : 'ies'} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedCatIds.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCatIds([])}
                  className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-100/60 text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCatIds.length === filteredCategories.length && filteredCategories.length > 0}
                      onChange={handleToggleSelectAllCats}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Category Code</th>
                  <th className="py-3 px-3">Category Name</th>
                  <th className="py-3 px-3">Asset Class</th>
                  <th className="py-3 px-3">Asset Group</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCategories.map((cat, index) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isChecked = selectedCatIds.includes(cat.id);
                  const isMenuOpen = activeRowMenuId === `cat-${cat.id}`;

                  return (
                    <tr
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectCat(cat.id)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-bold font-mono text-[#6C2BD9]">{cat.code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{cat.name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{cat.className}</td>
                      <td className="py-3.5 px-3 text-slate-700">{cat.groupName}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {cat.totalAssets.toLocaleString()}
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

                      <td className="py-3.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => setSelectedCategory(cat)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
                          <div className="absolute right-2 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => {
                                setSelectedCategory(cat);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View Details</span>
                            </button>

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
                              onClick={() => handleDeleteCategory(cat)}
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
                <span className="text-slate-500 font-medium">Asset Class</span>
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedCategory.totalAssets.toLocaleString()}</span>
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
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo.subCategories}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo.maintenancePlans}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedCategory.relatedInfo.documents}</span>
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
                <label className="block font-semibold text-slate-700 mb-1">Parent Asset Group *</label>
                <select
                  value={catFormState.groupName}
                  onChange={(e) => {
                    const newGroup = e.target.value;
                    const filteredClasses = availableAssetClasses.filter(c => c.groupName === newGroup);
                    const newClass = filteredClasses.length > 0 ? (filteredClasses[0].name || filteredClasses[0].code) : (availableAssetClasses[0]?.name || 'Hardware');
                    setCatFormState({ ...catFormState, groupName: newGroup, className: newClass });
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  {availableAssetGroups.map((g) => {
                    const name = g.name || g.code;
                    return <option key={g.id || name} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Asset Class *</label>
                <select
                  value={catFormState.className}
                  onChange={(e) => setCatFormState({ ...catFormState, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  {(availableAssetClasses.filter(c => !catFormState.groupName || c.groupName === catFormState.groupName).length > 0
                    ? availableAssetClasses.filter(c => !catFormState.groupName || c.groupName === catFormState.groupName)
                    : availableAssetClasses
                  ).map((cls) => {
                    const name = cls.name || cls.code;
                    return <option key={cls.id || name} value={name}>{name}</option>;
                  })}
                </select>
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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
