import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  FolderTree,
  Box,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  Wrench,
  FileText,
  X,
  Tag,
  Plus
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { INITIAL_ASSET_GROUPS } from './AssetGroupsTab';
import { INITIAL_CLASSES } from './ClassesTab';

export const INITIAL_SUB_CATEGORIES = [];

export function SubCategoriesTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubCatIds, setSelectedSubCatIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load live sub-categories / asset classes from backend database
  const loadSubCategories = async () => {
    setIsLoading(true);
    try {
      const [classRes, catRes] = await Promise.all([
        api.get('/master-data/asset-classes?kind=SUBCATEGORY').catch(() => null),
        api.get('/master-data/categories').catch(() => null)
      ]);

      if (catRes?.categories) {
        setCategories(catRes.categories);
      }

      const customClasses = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      const classCodes = new Set(customClasses.map(c => (c.code || '').toUpperCase()));

      if (classRes?.assetClasses && classRes.assetClasses.length > 0) {
        // Exclude any true asset classes!
        const trueSubCats = classRes.assetClasses.filter(ac => 
          !classCodes.has((ac.code || '').toUpperCase()) &&
          !(ac.description || '').includes('[kind:class]')
        );

        const mapped = trueSubCats.map((ac, idx) => {
          const descClean = (ac.description || '').replace(/\[kind:[^\]]+\]/g, '').trim();
          return {
            id: ac.id,
            code: ac.code,
            name: ac.name,
            categoryId: ac.categoryId,
            categoryName: ac.category?.name || 'General',
            className: ac.className || 'General',
            groupName: ac.groupName || 'General',
            description: descClean,
            totalAssets: ac.totalAssets || 0,
            status: ac.active === false ? 'Inactive' : 'Active',
            createdBy: 'Admin',
            createdOn: ac.createdAt ? new Date(ac.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025',
            lastModifiedBy: 'Admin',
            lastModifiedOn: ac.updatedAt ? new Date(ac.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2025',
            relatedInfo: {
              assets: ac.totalAssets || 0,
              maintenancePlans: 0,
              documents: 0,
              spareParts: 0
            }
          };
        });

        const custom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
        const filteredCustom = custom.filter(c => !classCodes.has((c.code || '').toUpperCase()));
        const serverCodes = new Set(mapped.map(m => (m.code || m.name || '').toUpperCase().trim()));
        const missingCustom = filteredCustom.filter(c => !serverCodes.has((c.code || c.name || '').toUpperCase().trim()));
        const rawList = [...mapped, ...missingCustom];

        const seen = new Set();
        const fullList = rawList.filter(item => {
          const key = (item.code || item.name || '').toUpperCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setSubCategoriesList(fullList);
        setSelectedSubCategory((prev) => (prev ? fullList.find((s) => s.id === prev.id) || fullList[0] || null : fullList[0] || null));
      } else {
        const custom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
        setSubCategoriesList(custom);
        setSelectedSubCategory(custom[0] || null);
      }
    } catch (err) {
      const custom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
      setSubCategoriesList(custom);
      setSelectedSubCategory(custom[0] || null);
      console.warn('Failed to fetch sub-categories from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubCategories();
  }, []);

  // Filter state
  const [subCatSearchQuery, setSubCatSearchQuery] = useState('');
  const [subCatCategoryFilter, setSubCatCategoryFilter] = useState('All Categories');
  const [subCatClassFilter, setSubCatClassFilter] = useState('All Classes');
  const [subCatGroupFilter, setSubCatGroupFilter] = useState('All Groups');
  const [subCatStatusFilter, setSubCatStatusFilter] = useState('All');

  // Modal state
  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
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

  const [subCatFormState, setSubCatFormState] = useState({
    code: '',
    name: '',
    categoryName: 'Laptops & Notebooks',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: '',
    status: 'Active'
  });

  const filteredSubCategories = useMemo(() => {
    return subCategoriesList.filter((sc) => {
      const matchesSearch =
        !subCatSearchQuery ||
        sc.code.toLowerCase().includes(subCatSearchQuery.toLowerCase()) ||
        sc.name.toLowerCase().includes(subCatSearchQuery.toLowerCase()) ||
        sc.description.toLowerCase().includes(subCatSearchQuery.toLowerCase());

      const matchesCat =
        subCatCategoryFilter === 'All Categories' || subCatCategoryFilter === 'All' || sc.categoryName === subCatCategoryFilter;

      const matchesClass =
        subCatClassFilter === 'All Classes' || subCatClassFilter === 'All' || sc.className === subCatClassFilter;

      const matchesGroup =
        subCatGroupFilter === 'All Groups' || subCatGroupFilter === 'All' || sc.groupName === subCatGroupFilter;

      const matchesStatus =
        subCatStatusFilter === 'All' || sc.status.toLowerCase() === subCatStatusFilter.toLowerCase();

      return matchesSearch && matchesCat && matchesClass && matchesGroup && matchesStatus;
    });
  }, [subCategoriesList, subCatSearchQuery, subCatCategoryFilter, subCatClassFilter, subCatGroupFilter, subCatStatusFilter]);

  // Keep selectedSubCategory synchronized when filteredSubCategories changes
  useEffect(() => {
    if (filteredSubCategories.length > 0) {
      if (!selectedSubCategory || !filteredSubCategories.some((sc) => sc.id === selectedSubCategory.id)) {
        setSelectedSubCategory(filteredSubCategories[0]);
      }
    }
  }, [filteredSubCategories, selectedSubCategory]);

  const handleResetSubCatFilters = () => {
    setSubCatSearchQuery('');
    setSubCatCategoryFilter('All Categories');
    setSubCatClassFilter('All Classes');
    setSubCatGroupFilter('All Groups');
    setSubCatStatusFilter('All');
  };

  const handleOpenAddSubCatModal = (scToEdit = null) => {
    if (scToEdit) {
      setEditingSubCategory(scToEdit);
      setSubCatFormState({
        code: scToEdit.code,
        name: scToEdit.name,
        categoryName: scToEdit.categoryName,
        className: scToEdit.className,
        groupName: scToEdit.groupName,
        description: scToEdit.description,
        status: scToEdit.status
      });
    } else {
      setEditingSubCategory(null);
      setSubCatFormState({
        code: '',
        name: '',
        categoryName: 'Laptops & Notebooks',
        className: 'Hardware',
        groupName: 'Information Technology',
        description: '',
        status: 'Active'
      });
    }
    setShowAddSubCatModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddSubCatModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    if (!subCatFormState.code || !subCatFormState.name) return;

    let targetCatId = subCatFormState.categoryId;
    if (!targetCatId && categories.length > 0) {
      const found = categories.find(c => c.name === subCatFormState.categoryName) || categories[0];
      targetCatId = found?.id;
    }

    if (editingSubCategory) {
      try {
        await api.put(`/master-data/asset-classes/${editingSubCategory.id}`, {
          code: subCatFormState.code.toUpperCase(),
          name: subCatFormState.name,
          categoryId: targetCatId,
          description: subCatFormState.description,
          status: subCatFormState.status
        });
        await loadSubCategories();
        triggerToast && triggerToast(`Sub Category "${subCatFormState.name}" updated successfully.`);
      } catch (err) {
        console.warn('Save sub-category error:', err);
      }
    } else {
      try {
        await api.post('/master-data/asset-classes', {
          code: subCatFormState.code.toUpperCase(),
          name: subCatFormState.name,
          categoryId: targetCatId,
          description: subCatFormState.description,
          kind: 'SUBCATEGORY',
          status: subCatFormState.status
        });
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
          const newSub = {
            id: `SUBCAT-${Date.now()}`,
            code: subCatFormState.code.toUpperCase(),
            name: subCatFormState.name,
            categoryId: targetCatId,
            categoryName: categories.find(c => c.id === targetCatId)?.name || 'General',
            description: subCatFormState.description,
            status: subCatFormState.status
          };
          localStorage.setItem('fams_custom_subcategories', JSON.stringify([newSub, ...custom]));
        } catch (_) {}
        await loadSubCategories();
        triggerToast && triggerToast(`Sub Category "${subCatFormState.name}" created successfully.`);
      } catch (err) {
        console.warn('Create sub-category error:', err);
      }
    }
    setShowAddSubCatModal(false);
  };

  const handleDuplicateSubCategory = (sc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...sc,
      id: Date.now(),
      code: `${sc.code}-COPY`,
      name: `${sc.name} (Copy)`,
      totalAssets: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' 05:30 PM'
    };
    setSubCategoriesList([duplicated, ...subCategoriesList]);
    setSelectedSubCategory(duplicated);
    triggerToast && triggerToast(`Sub Category "${sc.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleSubCategoryStatus = async (sc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = sc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/master-data/asset-classes/${sc.id}`, { status: newStatus });
      await loadSubCategories();
      triggerToast && triggerToast(`Sub Category "${sc.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  const handleDeleteSubCategory = async (sc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Sub Category "${sc.name}" (${sc.code})?`)) {
      try {
        await api.delete(`/master-data/asset-classes/${sc.id}`);
        await loadSubCategories();
        triggerToast && triggerToast(`Sub Category "${sc.code}" deleted successfully.`);
      } catch (err) {
        console.warn('Delete sub-category error:', err);
      }
    }
  };

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedSubCatIds.length === 0) return;
    const count = selectedSubCatIds.length;
    if (window.confirm(`Are you sure you want to delete ${count} selected sub categor${count === 1 ? 'y' : 'ies'}?`)) {
      setIsBulkDeleting(true);
      try {
        await Promise.allSettled(selectedSubCatIds.map(id => api.delete(`/master-data/asset-classes/${id}`)));
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
          const idSet = new Set(selectedSubCatIds);
          localStorage.setItem('fams_custom_subcategories', JSON.stringify(custom.filter(c => !idSet.has(c.id))));
        } catch (_) {}

        const remaining = subCategoriesList.filter(c => !selectedSubCatIds.includes(c.id));
        setSubCategoriesList(remaining);
        if (selectedSubCategory && selectedSubCatIds.includes(selectedSubCategory.id)) {
          setSelectedSubCategory(remaining[0] || null);
        }
        setSelectedSubCatIds([]);
        await loadSubCategories();
        triggerToast && triggerToast(`Successfully removed ${count} sub categories.`);
      } catch (err) {
        console.warn('Bulk delete sub categories error:', err);
        triggerToast && triggerToast('Failed to delete some sub categories.');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  const handleToggleSelectAllSubCats = () => {
    if (selectedSubCatIds.length === filteredSubCategories.length) {
      setSelectedSubCatIds([]);
    } else {
      setSelectedSubCatIds(filteredSubCategories.map((s) => s.id));
    }
  };

  const handleToggleSelectSubCat = (id) => {
    if (selectedSubCatIds.includes(id)) {
      setSelectedSubCatIds(selectedSubCatIds.filter((item) => item !== id));
    } else {
      setSelectedSubCatIds([...selectedSubCatIds, id]);
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
              placeholder="Search by subcategory code, name or description..."
              value={subCatSearchQuery}
              onChange={(e) => setSubCatSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-44 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Category</span>
            <select
              value={subCatCategoryFilter}
              onChange={(e) => setSubCatCategoryFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Sub Group</span>
            <select
              value={subCatClassFilter}
              onChange={(e) => setSubCatClassFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Classes">All Sub Groups</option>
              <option value="Hardware">Hardware</option>
              <option value="Network Equipment">Network Equipment</option>
              <option value="HVAC Systems">HVAC Systems</option>
              <option value="Electrical Systems">Electrical Systems</option>
              <option value="Office Furniture">Office Furniture</option>
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Group</span>
            <select
              value={subCatGroupFilter}
              onChange={(e) => setSubCatGroupFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Groups">All Groups</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Buildings & Facilities MEP">Buildings & Facilities MEP</option>
              <option value="Heavy Plant & Machinery">Heavy Plant & Machinery</option>
              <option value="Fleet & Vehicles">Fleet & Vehicles</option>
              <option value="Furniture, Fixtures & Equipment">Furniture, Fixtures & Equipment</option>
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={subCatStatusFilter}
              onChange={(e) => setSubCatStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0 flex items-center gap-2">
            <button
              onClick={handleResetSubCatFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={loadSubCategories}
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
              <h2 className="text-sm font-bold text-slate-900">Sub Categories List</h2>
              <p className="text-xs text-slate-500">Showing all sub categories.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredSubCategories.length} Sub Categories
              </span>
              <button
                onClick={() => handleOpenAddSubCatModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Sub Category</span>
              </button>
            </div>
          </div>

          {/* Floating / Integrated Bulk Actions Toolbar */}
          {selectedSubCatIds.length > 0 && (
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-200 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6C2BD9]">
                <span className="w-2 h-2 rounded-full bg-[#6C2BD9] animate-ping"></span>
                <span>{selectedSubCatIds.length} sub categor{selectedSubCatIds.length === 1 ? 'y' : 'ies'} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedSubCatIds.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubCatIds([])}
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
                      checked={selectedSubCatIds.length === filteredSubCategories.length && filteredSubCategories.length > 0}
                      onChange={handleToggleSelectAllSubCats}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Sub Category Code</th>
                  <th className="py-3 px-3">Sub Category Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubCategories.map((sc, index) => {
                  const isSelected = selectedSubCategory?.id === sc.id;
                  const isChecked = selectedSubCatIds.includes(sc.id);
                  const isMenuOpen = activeRowMenuId === `subcat-${sc.id}`;

                  return (
                    <tr
                      key={sc.id}
                      onClick={() => setSelectedSubCategory(sc)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectSubCat(sc.id)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-bold font-mono text-[#6C2BD9]">{sc.code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{sc.name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{sc.categoryName}</td>
                      <td className="py-3.5 px-3 text-slate-700">{sc.className}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {sc.totalAssets.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            sc.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {sc.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => setSelectedSubCategory(sc)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddSubCatModal(sc)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="Edit Sub Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `subcat-${sc.id}`)}
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
                                setSelectedSubCategory(sc);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={() => handleOpenAddSubCatModal(sc)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Edit Sub Category</span>
                            </button>

                            <button
                              onClick={() => handleDuplicateSubCategory(sc)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={() => handleToggleSubCategoryStatus(sc)}
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
                              onClick={() => handleDeleteSubCategory(sc)}
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
              Showing {filteredSubCategories.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Right Column: Sub Category Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Sub Category Details</h3>
            <button
              onClick={() => handleOpenAddSubCatModal(selectedSubCategory)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedSubCategory && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Sub Category Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedSubCategory.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Sub Category Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedSubCategory.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSubCategory.categoryName}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Sub Group</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSubCategory.className}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Group</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSubCategory.groupName}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedSubCategory.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedSubCategory.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedSubCategory.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedSubCategory.totalAssets.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedSubCategory.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedSubCategory.createdOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSubCategory.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSubCategory.relatedInfo.maintenancePlans}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSubCategory.relatedInfo.documents}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Sub Category */}
      {showAddSubCatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingSubCategory ? 'Edit Sub Category' : 'Add New Sub Category'}</span>
              </h3>
              <button onClick={() => setShowAddSubCatModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub Category Code *</label>
                <input
                  type="text"
                  required
                  value={subCatFormState.code}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, code: e.target.value })}
                  placeholder="e.g. IT-HW-LAP-01"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub Category Name *</label>
                <input
                  type="text"
                  required
                  value={subCatFormState.name}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, name: e.target.value })}
                  placeholder="e.g. Laptops"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  required
                  value={subCatFormState.categoryId || ''}
                  onChange={(e) => {
                    const selectedCat = categories.find((c) => c.id === e.target.value);
                    setSubCatFormState({
                      ...subCatFormState,
                      categoryId: e.target.value,
                      categoryName: selectedCat?.name || ''
                    });
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Category *</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Sub Group</label>
                <select
                  value={subCatFormState.className}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  {availableAssetClasses.map((cls) => {
                    const name = cls.name || cls.code;
                    return <option key={cls.id || name} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Group</label>
                <select
                  value={subCatFormState.groupName}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, groupName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  {availableAssetGroups.map((g) => {
                    const name = g.name || g.code;
                    return <option key={g.id || name} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subCatFormState.description}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, description: e.target.value })}
                  placeholder="Enter detailed description of sub category..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={subCatFormState.status}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddSubCatModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingSubCategory ? 'Save Changes' : 'Create Sub Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
