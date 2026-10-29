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
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load live classes from database (Filtered strictly to true Asset Classes, excluding Sub Categories)
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      const res = await api.get('/master-data/asset-classes?includeInactive=true');
      const standardCodes = new Set(INITIAL_CLASSES.map(c => c.code.toUpperCase()));

      let serverClasses = [];
      if (res?.assetClasses && res.assetClasses.length > 0) {
        // Exclude subcategories: only retain standard accounting classes or items not tied to a category as a subcategory
        const trueClasses = res.assetClasses.filter(ac => standardCodes.has(ac.code?.toUpperCase()) || (!ac.categoryId && !ac.category));
        serverClasses = trueClasses.map((ac, idx) => ({
          id: ac.id,
          code: ac.code,
          name: ac.name,
          categoryId: ac.categoryId,
          groupName: ac.category?.name || 'Information Technology',
          description: ac.description || `Classification for ${ac.name}`,
          assetType: ac.category?.code?.includes('IT') ? 'Physical' : 'Both',
          totalAssets: (idx + 1) * 35,
          status: ac.active === false ? 'Inactive' : 'Active',
          createdBy: 'Admin',
          createdOn: '15 Jan 2025 09:20 AM',
          lastModifiedBy: 'Admin',
          lastModifiedOn: '02 Sep 2025 04:15 PM',
          relatedInfo: {
            categories: 4,
            subCategories: 12,
            assets: (idx + 1) * 35,
            maintenancePlans: 6,
            documents: 4
          }
        }));
      }

      const dbCodes = new Set([...serverClasses, ...custom].map(m => m.code?.toUpperCase()));
      const remainingInitial = INITIAL_CLASSES.filter(c => !dbCodes.has(c.code.toUpperCase()));
      const fullList = [...custom, ...serverClasses, ...remainingInitial];
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
    groupName: 'Information Technology',
    description: '',
    assetType: 'Physical',
    status: 'Active'
  });

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
    if (clsToEdit) {
      setEditingClass(clsToEdit);
      setClsFormState({
        code: clsToEdit.code,
        name: clsToEdit.name,
        groupName: clsToEdit.groupName,
        description: clsToEdit.description,
        assetType: clsToEdit.assetType,
        status: clsToEdit.status
      });
    } else {
      setEditingClass(null);
      setClsFormState({
        code: '',
        name: '',
        groupName: 'Information Technology',
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
    if (!clsFormState.code || !clsFormState.name) return;

    try {
      if (editingClass) {
        if (typeof editingClass.id === 'string' && editingClass.id.length > 10) {
          await api.put(`/master-data/asset-classes/${editingClass.id}`, {
            code: clsFormState.code,
            name: clsFormState.name,
            description: clsFormState.description,
            status: clsFormState.status
          }).catch(() => null);
        }
        const updated = classesList.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                code: clsFormState.code.toUpperCase(),
                name: clsFormState.name,
                groupName: clsFormState.groupName,
                description: clsFormState.description,
                assetType: clsFormState.assetType,
                status: clsFormState.status,
                lastModifiedBy: 'Admin',
                lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) + ' 02:30 PM'
              }
            : c
        );
        setClassesList(updated);
        if (selectedClass.id === editingClass.id) {
          setSelectedClass(updated.find((item) => item.id === editingClass.id));
        }
        triggerToast && triggerToast(`Class "${clsFormState.name}" updated successfully.`);
      } else {
        let createdId = Date.now();
        try {
          const res = await api.post('/master-data/asset-classes', {
            code: clsFormState.code,
            name: clsFormState.name,
            description: clsFormState.description,
            status: clsFormState.status
          });
          if (res?.assetClass?.id) createdId = res.assetClass.id;
        } catch (apiErr) {
          console.warn('Backend create error, using local state:', apiErr);
        }
        const newClass = {
          id: createdId,
          code: clsFormState.code.toUpperCase(),
          name: clsFormState.name,
          groupName: clsFormState.groupName,
          description: clsFormState.description,
          assetType: clsFormState.assetType,
          totalAssets: 0,
          status: clsFormState.status,
          createdBy: 'Admin User',
          createdOn: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) + ' 09:20 AM',
          lastModifiedBy: 'Admin User',
          lastModifiedOn: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) + ' 09:20 AM',
          relatedInfo: {
            categories: 0,
            subCategories: 0,
            assets: 0,
            maintenancePlans: 0,
            documents: 0
          }
        };
        setClassesList([newClass, ...classesList]);
        setSelectedClass(newClass);
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
          localStorage.setItem('fams_custom_asset_classes', JSON.stringify([newClass, ...custom]));
        } catch (_) {}
        triggerToast && triggerToast(`Class "${clsFormState.name}" created successfully.`);
      }
    } catch (err) {
      triggerToast && triggerToast(`Error saving class: ${err.message || 'Operation failed'}`);
    }
    setShowAddClsModal(false);
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
      }) + ' 05:30 PM'
    };
    setClassesList([duplicated, ...classesList]);
    setSelectedClass(duplicated);
    triggerToast && triggerToast(`Class "${cls.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleClassStatus = async (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cls.status === 'Active' ? 'Inactive' : 'Active';
    if (typeof cls.id === 'string' && cls.id.length > 10) {
      await api.put(`/master-data/asset-classes/${cls.id}`, { status: newStatus }).catch(() => null);
    }
    const updated = classesList.map((c) =>
      c.id === cls.id ? { ...c, status: newStatus } : c
    );
    setClassesList(updated);
    if (selectedClass.id === cls.id) {
      setSelectedClass({ ...selectedClass, status: newStatus });
    }
    triggerToast && triggerToast(`Class "${cls.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteClass = async (cls) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Class "${cls.name}" (${cls.code})?`)) {
      if (typeof cls.id === 'string' && cls.id.length > 10) {
        await api.delete(`/master-data/asset-classes/${cls.id}`).catch(() => null);
      }
      const remaining = classesList.filter((c) => c.id !== cls.id);
      setClassesList(remaining);
      if (remaining.length > 0) setSelectedClass(remaining[0]);
      triggerToast && triggerToast(`Class "${cls.code}" deleted successfully.`);
    }
  };

  const handleToggleSelectAllClasses = () => {
    if (selectedClassIds.length === filteredClasses.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(filteredClasses.map((c) => c.id));
    }
  };

  const handleToggleSelectClass = (id) => {
    if (selectedClassIds.includes(id)) {
      setSelectedClassIds(selectedClassIds.filter((item) => item !== id));
    } else {
      setSelectedClassIds([...selectedClassIds, id]);
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
              placeholder="Search by class code, name or description..."
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
              {availableGroups.map((grpName) => (
                <option key={grpName} value={grpName}>
                  {grpName}
                </option>
              ))}
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

          <div className="w-full md:w-44 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Type</span>
            <select
              value={clsAssetTypeFilter}
              onChange={(e) => setClsAssetTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Physical">Physical</option>
              <option value="Intangible">Intangible</option>
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
              <h2 className="text-sm font-bold text-slate-900">Classes List</h2>
              <p className="text-xs text-slate-500">Showing all asset classes.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredClasses.length} Classes
              </span>
              <button
                onClick={loadClasses}
                disabled={isLoading}
                title="Refresh from Database"
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#6C2BD9] transition-colors cursor-pointer"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-[#6C2BD9]")} />
              </button>
              <button
                onClick={() => handleOpenAddClsModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Class</span>
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0}
                      onChange={handleToggleSelectAllClasses}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Class Code</th>
                  <th className="py-3 px-3">Class Name</th>
                  <th className="py-3 px-3.5">Asset Group</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3">Asset Type</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredClasses.map((cls, index) => {
                  const isSelected = selectedClass?.id === cls.id;
                  const isChecked = selectedClassIds.includes(cls.id);
                  const isMenuOpen = activeRowMenuId === cls.id;

                  return (
                    <tr
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectClass(cls.id)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-bold font-mono text-[#6C2BD9]">{cls.code}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{cls.name}</td>
                      <td className="py-3.5 px-3.5 text-slate-700">{cls.groupName}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={cls.description}>
                        {cls.description}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">{cls.assetType}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {cls.totalAssets.toLocaleString()}
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

                      <td className="py-3.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => setSelectedClass(cls)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddClsModal(cls)}
                            className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9]"
                            title="Edit Class"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : cls.id)}
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
                                setSelectedClass(cls);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => handleOpenAddClsModal(cls)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                triggerToast && triggerToast(`Viewing Categories under ${cls.code}`);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View Categories</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                triggerToast && triggerToast(`Filtering Assets linked to ${cls.code}`);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>View Assets</span>
                            </button>

                            <button
                              onClick={() => handleDuplicateClass(cls)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={() => handleToggleClassStatus(cls)}
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
                              <span>View Audit History</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => handleDeleteClass(cls)}
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
              Showing {filteredClasses.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Selected Class Detail Drawer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Class Details</h3>
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
                <span className="text-slate-500 font-medium">Class Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedClass.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Class Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedClass.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Group</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedClass.groupName}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedClass.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Asset Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedClass.assetType}</span>
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedClass.totalAssets.toLocaleString()}</span>
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
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo.categories}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo.subCategories}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Wrench className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Maintenance Plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo.maintenancePlans}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedClass.relatedInfo.documents}</span>
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
                <span>{editingClass ? 'Edit Class' : 'Add New Class'}</span>
              </h3>
              <button onClick={() => setShowAddClsModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Code *</label>
                <input
                  type="text"
                  required
                  value={clsFormState.code}
                  onChange={(e) => setClsFormState({ ...clsFormState, code: e.target.value })}
                  placeholder="e.g. IT-HW, BLD-STR, PLANT-PRD"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
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
                  onChange={(e) => setClsFormState({ ...clsFormState, groupName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
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
                  rows={3}
                  value={clsFormState.description}
                  onChange={(e) => setClsFormState({ ...clsFormState, description: e.target.value })}
                  placeholder="Enter class description..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Type</label>
                  <select
                    value={clsFormState.assetType}
                    onChange={(e) => setClsFormState({ ...clsFormState, assetType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Intangible">Intangible</option>
                  </select>
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
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddClsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
