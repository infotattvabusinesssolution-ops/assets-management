import React, { useState, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_SUB_CATEGORIES = [
  {
    id: 1,
    code: 'IT-HW-LAP-01',
    name: 'Laptops',
    categoryName: 'Laptops & Notebooks',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'High-performance and standard employee laptops, notebooks, ultrabooks, and portable workstations.',
    totalAssets: 420,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 10:30 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '05 Aug 2025 02:15 PM',
    relatedInfo: {
      assets: 420,
      maintenancePlans: 2,
      documents: 4,
      spareParts: 12
    }
  },
  {
    id: 2,
    code: 'IT-HW-DSK-01',
    name: 'Desktops',
    categoryName: 'Desktop Workstations',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Desktop computers, tower PCs, workstations, and all-in-one computing systems.',
    totalAssets: 380,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '14 Jan 2025 11:15 AM',
    lastModifiedBy: 'Michael Brown',
    lastModifiedOn: '10 Aug 2025 04:30 PM',
    relatedInfo: {
      assets: 380,
      maintenancePlans: 1,
      documents: 2,
      spareParts: 8
    }
  },
  {
    id: 3,
    code: 'IT-HW-SRV-01',
    name: 'Rack Servers',
    categoryName: 'Rack & Blade Servers',
    className: 'Hardware',
    groupName: 'Information Technology',
    description: 'Enterprise data center rack servers, blade chassis, and virtualization host nodes.',
    totalAssets: 85,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025 09:00 AM',
    lastModifiedBy: 'David Kim',
    lastModifiedOn: '12 Aug 2025 01:20 PM',
    relatedInfo: {
      assets: 85,
      maintenancePlans: 6,
      documents: 8,
      spareParts: 24
    }
  },
  {
    id: 4,
    code: 'IT-NW-SWT-01',
    name: 'Core Switches',
    categoryName: 'Enterprise Network Switches',
    className: 'Network Equipment',
    groupName: 'Information Technology',
    description: 'Core and distribution layer high-speed managed Ethernet network switches.',
    totalAssets: 45,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 02:40 PM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '18 Aug 2025 11:10 AM',
    relatedInfo: {
      assets: 45,
      maintenancePlans: 4,
      documents: 3,
      spareParts: 6
    }
  },
  {
    id: 5,
    code: 'IT-NW-ROU-01',
    name: 'Enterprise Routers',
    categoryName: 'Edge & Core Routers',
    className: 'Network Equipment',
    groupName: 'Information Technology',
    description: 'Border gateway routers, WAN edge controllers, and corporate VPN gateways.',
    totalAssets: 18,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '22 Jan 2025 04:10 PM',
    lastModifiedBy: 'David Kim',
    lastModifiedOn: '20 Aug 2025 09:30 AM',
    relatedInfo: {
      assets: 18,
      maintenancePlans: 3,
      documents: 5,
      spareParts: 4
    }
  },
  {
    id: 6,
    code: 'MEP-HVAC-CHL-01',
    name: 'Water Chillers',
    categoryName: 'Central Water Chillers',
    className: 'HVAC Systems',
    groupName: 'Buildings & Facilities MEP',
    description: 'Centralized HVAC water chiller units and cooling plant refrigeration units.',
    totalAssets: 12,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '01 Feb 2025 08:30 AM',
    lastModifiedBy: 'Robert Taylor',
    lastModifiedOn: '25 Aug 2025 03:45 PM',
    relatedInfo: {
      assets: 12,
      maintenancePlans: 12,
      documents: 9,
      spareParts: 30
    }
  },
  {
    id: 7,
    code: 'MEP-HVAC-AHU-01',
    name: 'Air Handling Units',
    categoryName: 'Air Handling Units (AHU)',
    className: 'HVAC Systems',
    groupName: 'Buildings & Facilities MEP',
    description: 'Floor level air handling blower systems, filter banks, and air circulation units.',
    totalAssets: 34,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '05 Feb 2025 10:00 AM',
    lastModifiedBy: 'Robert Taylor',
    lastModifiedOn: '28 Aug 2025 02:00 PM',
    relatedInfo: {
      assets: 34,
      maintenancePlans: 8,
      documents: 6,
      spareParts: 18
    }
  },
  {
    id: 8,
    code: 'MEP-ELE-GEN-01',
    name: 'Diesel Generators',
    categoryName: 'Backup Power Generators',
    className: 'Electrical Systems',
    groupName: 'Buildings & Facilities MEP',
    description: 'Heavy-duty industrial emergency backup power diesel generator sets.',
    totalAssets: 8,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '10 Feb 2025 01:20 PM',
    lastModifiedBy: 'Robert Taylor',
    lastModifiedOn: '30 Aug 2025 10:15 AM',
    relatedInfo: {
      assets: 8,
      maintenancePlans: 10,
      documents: 7,
      spareParts: 25
    }
  },
  {
    id: 9,
    code: 'PL-CNC-MILL-01',
    name: 'CNC Milling',
    categoryName: 'CNC Milling Machines',
    className: 'CNC Machining',
    groupName: 'Heavy Plant & Machinery',
    description: 'Multi-axis CNC milling machines, vertical machining centers, and automated tooling systems.',
    totalAssets: 16,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Feb 2025 03:00 PM',
    lastModifiedBy: 'James Wilson',
    lastModifiedOn: '01 Sep 2025 11:30 AM',
    relatedInfo: {
      assets: 16,
      maintenancePlans: 14,
      documents: 11,
      spareParts: 40
    }
  },
  {
    id: 10,
    code: 'VH-LGT-SUV-01',
    name: 'Fleet SUVs',
    categoryName: 'Passenger SUV Vehicles',
    className: 'Light Vehicles',
    groupName: 'Fleet & Vehicles',
    description: 'Executive transport SUVs, field supervisor four-wheel drive vehicles, and service utility SUVs.',
    totalAssets: 22,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Feb 2025 09:45 AM',
    lastModifiedBy: 'Emily Davis',
    lastModifiedOn: '02 Sep 2025 04:10 PM',
    relatedInfo: {
      assets: 22,
      maintenancePlans: 6,
      documents: 15,
      spareParts: 14
    }
  },
  {
    id: 11,
    code: 'FFE-OFF-CHR-01',
    name: 'Ergonomic Chairs',
    categoryName: 'Office Ergonomic Seating',
    className: 'Office Furniture',
    groupName: 'Furniture, Fixtures & Equipment',
    description: 'Executive and workstation ergonomic mesh chairs with lumbar support.',
    totalAssets: 650,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '25 Feb 2025 02:10 PM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '03 Sep 2025 09:20 AM',
    relatedInfo: {
      assets: 650,
      maintenancePlans: 0,
      documents: 1,
      spareParts: 10
    }
  },
  {
    id: 12,
    code: 'FFE-OFF-DSK-01',
    name: 'Executive Desks',
    categoryName: 'Modular Work Desks',
    className: 'Office Furniture',
    groupName: 'Furniture, Fixtures & Equipment',
    description: 'Motorized height-adjustable sit-stand desks and executive wooden desks.',
    totalAssets: 510,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '01 Mar 2025 11:00 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '04 Sep 2025 01:45 PM',
    relatedInfo: {
      assets: 510,
      maintenancePlans: 0,
      documents: 2,
      spareParts: 4
    }
  }
];

export function SubCategoriesTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, setShowAuditHistoryModal }) {
  const [subCategoriesList, setSubCategoriesList] = useState(INITIAL_SUB_CATEGORIES);
  const [selectedSubCategory, setSelectedSubCategory] = useState(INITIAL_SUB_CATEGORIES[0]);
  const [selectedSubCatIds, setSelectedSubCatIds] = useState([]);

  // Filter state
  const [subCatSearchQuery, setSubCatSearchQuery] = useState('');
  const [subCatCategoryFilter, setSubCatCategoryFilter] = useState('All Categories');
  const [subCatClassFilter, setSubCatClassFilter] = useState('All Classes');
  const [subCatGroupFilter, setSubCatGroupFilter] = useState('All Groups');
  const [subCatStatusFilter, setSubCatStatusFilter] = useState('All');

  // Modal state
  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
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

  const handleSaveSubCategory = (e) => {
    e.preventDefault();
    if (!subCatFormState.code || !subCatFormState.name) return;

    if (editingSubCategory) {
      const updated = subCategoriesList.map((s) =>
        s.id === editingSubCategory.id
          ? {
              ...s,
              code: subCatFormState.code.toUpperCase(),
              name: subCatFormState.name,
              categoryName: subCatFormState.categoryName,
              className: subCatFormState.className,
              groupName: subCatFormState.groupName,
              description: subCatFormState.description,
              status: subCatFormState.status,
              lastModifiedBy: 'Logged In User',
              lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + ' 02:30 PM'
            }
          : s
      );
      setSubCategoriesList(updated);
      if (selectedSubCategory?.id === editingSubCategory.id) {
        setSelectedSubCategory(updated.find((item) => item.id === editingSubCategory.id));
      }
      triggerToast && triggerToast(`Sub Category "${subCatFormState.name}" updated successfully.`);
    } else {
      const newSubCat = {
        id: Date.now(),
        code: subCatFormState.code.toUpperCase(),
        name: subCatFormState.name,
        categoryName: subCatFormState.categoryName,
        className: subCatFormState.className,
        groupName: subCatFormState.groupName,
        description: subCatFormState.description,
        totalAssets: 0,
        status: subCatFormState.status,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 10:30 AM',
        lastModifiedBy: 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 10:30 AM',
        relatedInfo: {
          assets: 0,
          maintenancePlans: 0,
          documents: 0,
          spareParts: 0
        }
      };
      setSubCategoriesList([newSubCat, ...subCategoriesList]);
      setSelectedSubCategory(newSubCat);
      triggerToast && triggerToast(`Sub Category "${subCatFormState.name}" created successfully.`);
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

  const handleToggleSubCategoryStatus = (sc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = sc.status === 'Active' ? 'Inactive' : 'Active';
    const updated = subCategoriesList.map((s) =>
      s.id === sc.id ? { ...s, status: newStatus } : s
    );
    setSubCategoriesList(updated);
    if (selectedSubCategory?.id === sc.id) {
      setSelectedSubCategory({ ...selectedSubCategory, status: newStatus });
    }
    triggerToast && triggerToast(`Sub Category "${sc.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteSubCategory = (sc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Sub Category "${sc.name}" (${sc.code})?`)) {
      const remaining = subCategoriesList.filter((s) => s.id !== sc.id);
      setSubCategoriesList(remaining);
      if (remaining.length > 0) setSelectedSubCategory(remaining[0]);
      triggerToast && triggerToast(`Sub Category "${sc.code}" deleted successfully.`);
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
              <option value="Laptops & Notebooks">Laptops & Notebooks</option>
              <option value="Desktop Workstations">Desktop Workstations</option>
              <option value="Rack & Blade Servers">Rack & Blade Servers</option>
              <option value="Enterprise Network Switches">Enterprise Network Switches</option>
              <option value="Central Water Chillers">Central Water Chillers</option>
              <option value="Backup Power Generators">Backup Power Generators</option>
              <option value="Office Ergonomic Seating">Office Ergonomic Seating</option>
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Asset Class</span>
            <select
              value={subCatClassFilter}
              onChange={(e) => setSubCatClassFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Classes">All Classes</option>
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

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetSubCatFilters}
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
              <h2 className="text-sm font-bold text-slate-900">Sub Categories List</h2>
              <p className="text-xs text-slate-500">Showing all sub categories.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredSubCategories.length} Sub Categories Loaded
            </span>
          </div>

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
                <span className="text-slate-500 font-medium">Asset Class</span>
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
                  value={subCatFormState.categoryName}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, categoryName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Laptops & Notebooks">Laptops & Notebooks</option>
                  <option value="Desktop Workstations">Desktop Workstations</option>
                  <option value="Rack & Blade Servers">Rack & Blade Servers</option>
                  <option value="Enterprise Network Switches">Enterprise Network Switches</option>
                  <option value="Central Water Chillers">Central Water Chillers</option>
                  <option value="Backup Power Generators">Backup Power Generators</option>
                  <option value="Office Ergonomic Seating">Office Ergonomic Seating</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Class *</label>
                <select
                  value={subCatFormState.className}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, className: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Network Equipment">Network Equipment</option>
                  <option value="HVAC Systems">HVAC Systems</option>
                  <option value="Electrical Systems">Electrical Systems</option>
                  <option value="CNC Machining">CNC Machining</option>
                  <option value="Light Vehicles">Light Vehicles</option>
                  <option value="Office Furniture">Office Furniture</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Group *</label>
                <select
                  value={subCatFormState.groupName}
                  onChange={(e) => setSubCatFormState({ ...subCatFormState, groupName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Buildings & Facilities MEP">Buildings & Facilities MEP</option>
                  <option value="Heavy Plant & Machinery">Heavy Plant & Machinery</option>
                  <option value="Fleet & Vehicles">Fleet & Vehicles</option>
                  <option value="Furniture, Fixtures & Equipment">Furniture, Fixtures & Equipment</option>
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
