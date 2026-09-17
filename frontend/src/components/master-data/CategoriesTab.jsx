import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_CATEGORIES = [
  {
    id: 1,
    code: 'IT-HW-LAP',
    name: 'Laptops',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Business and corporate laptops including ultrabooks and mobile workstations',
    totalAssets: 245,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025 09:30 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '02 Sep 2025 04:15 PM',
    relatedInfo: {
      subCategories: 6,
      assets: 245,
      maintenancePlans: 4,
      documents: 3,
      spareParts: 12
    }
  },
  {
    id: 2,
    code: 'IT-HW-DSK',
    name: 'Desktops',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Desktop computers, all-in-ones and thin clients',
    totalAssets: 180,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025 10:00 AM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '28 Aug 2025 11:30 AM',
    relatedInfo: {
      subCategories: 4,
      assets: 180,
      maintenancePlans: 3,
      documents: 2,
      spareParts: 8
    }
  },
  {
    id: 3,
    code: 'IT-HW-SRV',
    name: 'Servers',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Rack servers, blade servers and storage arrays',
    totalAssets: 85,
    status: 'Active',
    createdBy: 'John Doe',
    createdOn: '16 Jan 2025 11:15 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '15 Jul 2025 03:45 PM',
    relatedInfo: {
      subCategories: 3,
      assets: 85,
      maintenancePlans: 6,
      documents: 8,
      spareParts: 22
    }
  },
  {
    id: 4,
    code: 'IT-HW-PRN',
    name: 'Printers & Scanners',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Laser printers, inkjet printers, MFPs and document scanners',
    totalAssets: 120,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '17 Jan 2025 09:45 AM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '10 Aug 2025 02:00 PM',
    relatedInfo: {
      subCategories: 4,
      assets: 120,
      maintenancePlans: 2,
      documents: 3,
      spareParts: 15
    }
  },
  {
    id: 5,
    code: 'IT-NW-SW',
    name: 'Network Switches',
    className: 'Network Equipment',
    groupName: 'Information Technology',
    description: 'Managed and unmanaged Ethernet switches for LAN infrastructure',
    totalAssets: 64,
    status: 'Active',
    createdBy: 'John Doe',
    createdOn: '18 Jan 2025 02:30 PM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '22 Jul 2025 10:20 AM',
    relatedInfo: {
      subCategories: 2,
      assets: 64,
      maintenancePlans: 3,
      documents: 4,
      spareParts: 6
    }
  },
  {
    id: 6,
    code: 'IT-NW-FW',
    name: 'Firewalls',
    className: 'Network Equipment',
    groupName: 'Information Technology',
    description: 'Hardware firewalls and unified threat management appliances',
    totalAssets: 22,
    status: 'Active',
    createdBy: 'Michael Chen',
    createdOn: '19 Jan 2025 10:00 AM',
    lastModifiedBy: 'John Doe',
    lastModifiedOn: '05 Aug 2025 01:10 PM',
    relatedInfo: {
      subCategories: 2,
      assets: 22,
      maintenancePlans: 2,
      documents: 5,
      spareParts: 4
    }
  },
  {
    id: 7,
    code: 'BLD-STR-CIV',
    name: 'Civil Works',
    className: 'Building Structure',
    groupName: 'Buildings & Facilities',
    description: 'Foundation, walls, columns, beams, slabs and civil elements',
    totalAssets: 156,
    status: 'Active',
    createdBy: 'Ramesh Kumar',
    createdOn: '20 Jan 2025 12:00 PM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '18 Aug 2025 09:30 AM',
    relatedInfo: {
      subCategories: 5,
      assets: 156,
      maintenancePlans: 3,
      documents: 6,
      spareParts: 0
    }
  },
  {
    id: 8,
    code: 'BLD-MEP-HVAC',
    name: 'HVAC Systems',
    className: 'MEP Systems',
    groupName: 'Buildings & Facilities',
    description: 'Air handling units, chillers, cooling towers and ductwork',
    totalAssets: 95,
    status: 'Active',
    createdBy: 'Sarah Ahmed',
    createdOn: '22 Jan 2025 03:30 PM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '14 May 2025 11:45 AM',
    relatedInfo: {
      subCategories: 4,
      assets: 95,
      maintenancePlans: 8,
      documents: 12,
      spareParts: 28
    }
  },
  {
    id: 9,
    code: 'BLD-MEP-ELE',
    name: 'Electrical Systems',
    className: 'MEP Systems',
    groupName: 'Buildings & Facilities',
    description: 'Transformers, panels, switchgear and distribution boards',
    totalAssets: 110,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '23 Jan 2025 08:45 AM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '20 Jun 2025 04:30 PM',
    relatedInfo: {
      subCategories: 3,
      assets: 110,
      maintenancePlans: 6,
      documents: 9,
      spareParts: 18
    }
  },
  {
    id: 10,
    code: 'PLANT-PRD-CNC',
    name: 'CNC Machines',
    className: 'Production Equipment',
    groupName: 'Plant & Machinery',
    description: 'Computer numerical control milling and turning centres',
    totalAssets: 48,
    status: 'Active',
    createdBy: 'Ramesh Kumar',
    createdOn: '25 Jan 2025 09:15 AM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '30 Jun 2025 05:00 PM',
    relatedInfo: {
      subCategories: 4,
      assets: 48,
      maintenancePlans: 12,
      documents: 8,
      spareParts: 35
    }
  }
];

export function CategoriesTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, setShowAuditHistoryModal }) {
  const [categoriesList, setCategoriesList] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(INITIAL_CATEGORIES[0]);
  const [selectedCatIds, setSelectedCatIds] = useState([]);

  // Filter state
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [catClassFilter, setCatClassFilter] = useState('All Classes');
  const [catGroupFilter, setCatGroupFilter] = useState('All Groups');
  const [catStatusFilter, setCatStatusFilter] = useState('All');

  // Modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catFormState.code || !catFormState.name) return;

    if (editingCategory) {
      const updated = categoriesList.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              code: catFormState.code.toUpperCase(),
              name: catFormState.name,
              className: catFormState.className,
              groupName: catFormState.groupName,
              description: catFormState.description,
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
    } else {
      const newCat = {
        id: Date.now(),
        code: catFormState.code.toUpperCase(),
        name: catFormState.name,
        className: catFormState.className,
        groupName: catFormState.groupName,
        description: catFormState.description,
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

  const handleToggleCategoryStatus = (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    const updated = categoriesList.map((c) =>
      c.id === cat.id ? { ...c, status: newStatus } : c
    );
    setCategoriesList(updated);
    if (selectedCategory.id === cat.id) {
      setSelectedCategory({ ...selectedCategory, status: newStatus });
    }
    triggerToast && triggerToast(`Category "${cat.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteCategory = (cat) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Category "${cat.name}" (${cat.code})?`)) {
      const remaining = categoriesList.filter((c) => c.id !== cat.id);
      setCategoriesList(remaining);
      if (remaining.length > 0) setSelectedCategory(remaining[0]);
      triggerToast && triggerToast(`Category "${cat.code}" deleted successfully.`);
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

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetCatFilters}
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
              <h2 className="text-sm font-bold text-slate-900">Categories List</h2>
              <p className="text-xs text-slate-500">Showing all asset categories.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredCategories.length} Categories Loaded
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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

          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40">
            <span className="text-slate-500 font-medium">
              Showing 1 to {filteredCategories.length} of {categoriesList.length} records
            </span>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-[#6C2BD9] text-white font-bold flex items-center justify-center text-xs">
                  1
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer">
                <option>10 / page</option>
              </select>
            </div>
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
                <label className="block font-semibold text-slate-700 mb-1">Asset Class *</label>
                <select
                  value={catFormState.className}
                  onChange={(e) => setCatFormState({ ...catFormState, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Network Equipment">Network Equipment</option>
                  <option value="Building Structure">Building Structure</option>
                  <option value="MEP Systems">MEP Systems</option>
                  <option value="Production Equipment">Production Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Group *</label>
                <select
                  value={catFormState.groupName}
                  onChange={(e) => setCatFormState({ ...catFormState, groupName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Buildings & Facilities">Buildings & Facilities</option>
                  <option value="Plant & Machinery">Plant & Machinery</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Furniture, Fixtures & Equipment">Furniture, Fixtures & Equipment</option>
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
