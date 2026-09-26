import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Layers,
  Tag,
  FolderTree,
  Box,
  X
} from 'lucide-react';
import clsx from 'clsx';

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

export function AssetGroupsTab({ triggerToast }) {
  const [assetGroups, setAssetGroups] = useState(INITIAL_ASSET_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(INITIAL_ASSET_GROUPS[0]);
  const [grpSearchQuery, setGrpSearchQuery] = useState('');
  const [grpStatusFilter, setGrpStatusFilter] = useState('All');
  const [grpAssetTypeFilter, setGrpAssetTypeFilter] = useState('All');

  const [showAddGrpModal, setShowAddGrpModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [grpFormState, setGrpFormState] = useState({
    code: '',
    name: '',
    description: '',
    assetType: 'Both',
    status: 'Active'
  });

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

  const handleOpenAddGrpModal = (grpToEdit = null) => {
    if (grpToEdit) {
      setEditingGroup(grpToEdit);
      setGrpFormState({
        code: grpToEdit.code,
        name: grpToEdit.name,
        description: grpToEdit.description,
        assetType: grpToEdit.assetType,
        status: grpToEdit.status
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

  const handleSaveGroup = (e) => {
    e.preventDefault();
    if (!grpFormState.code || !grpFormState.name) return;

    if (editingGroup) {
      const updated = assetGroups.map((g) =>
        g.id === editingGroup.id
          ? {
              ...g,
              code: grpFormState.code.toUpperCase(),
              name: grpFormState.name,
              description: grpFormState.description,
              assetType: grpFormState.assetType,
              status: grpFormState.status,
              lastModifiedBy: 'Logged In User',
              lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + ' 02:15 PM'
            }
          : g
      );
      setAssetGroups(updated);
      if (selectedGroup.id === editingGroup.id) {
        setSelectedGroup(updated.find((g) => g.id === editingGroup.id));
      }
      triggerToast && triggerToast(`Asset Group "${grpFormState.name}" updated successfully.`);
    } else {
      const newGroup = {
        id: Date.now(),
        code: grpFormState.code.toUpperCase(),
        name: grpFormState.name,
        description: grpFormState.description,
        assetType: grpFormState.assetType,
        assetTypeLabel: grpFormState.assetType === 'Both' ? 'Both (Physical & Intangible)' : grpFormState.assetType === 'Physical' ? 'Physical Tangible' : 'Intangible / Digital',
        totalAssets: 0,
        status: grpFormState.status,
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
          classes: 0,
          categories: 0,
          subCategories: 0,
          assets: 0,
          documents: 0
        }
      };
      setAssetGroups([newGroup, ...assetGroups]);
      setSelectedGroup(newGroup);
      triggerToast && triggerToast(`Asset Group "${grpFormState.name}" created successfully.`);
    }
    setShowAddGrpModal(false);
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
              <p className="text-xs text-slate-500">Showing all asset groups.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredGroups.length} Groups Total
            </span>
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
                {filteredGroups.map((grp, index) => {
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
                        {grp.description}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700">{grp.assetType}</td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-bold text-slate-900">
                        {grp.totalAssets.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            grp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {grp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          <button onClick={() => setSelectedGroup(grp)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleOpenAddGrpModal(grp)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#6C2BD9]">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => triggerToast && triggerToast(`Options for ${grp.code}`)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <button
              onClick={() => handleOpenAddGrpModal(selectedGroup)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
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
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Layers className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Asset Classes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedGroup.relatedInfo.classes}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedGroup.relatedInfo.categories}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedGroup.relatedInfo.subCategories}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group Code *</label>
                <input
                  type="text"
                  required
                  value={grpFormState.code}
                  onChange={(e) => setGrpFormState({ ...grpFormState, code: e.target.value })}
                  placeholder="e.g. IT, BLD, PLANT"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={grpFormState.name}
                  onChange={(e) => setGrpFormState({ ...grpFormState, name: e.target.value })}
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingGroup ? 'Save Changes' : 'Create Asset Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
