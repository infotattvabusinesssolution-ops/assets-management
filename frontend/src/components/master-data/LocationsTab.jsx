import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Box,
  Users,
  BarChart3,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_LOCATIONS = [
  {
    id: 1,
    code: 'UAE-HQ',
    name: 'Head Office',
    type: 'Office',
    parentLocation: '-',
    country: 'UAE',
    city: 'Dubai',
    address: 'Level 15, Business Tower, Sheikh Zayed Road, Dubai',
    postalCode: '12345',
    totalAssets: 1245,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 09:15 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '25 Aug 2025 02:30 PM',
    relatedInfo: {
      childLocations: 5,
      assets: 1245,
      departments: 12,
      costCenters: 8
    }
  },
  {
    id: 2,
    code: 'UAE-DXB-OF1',
    name: 'Dubai Office',
    type: 'Office',
    parentLocation: 'UAE-HQ',
    country: 'UAE',
    city: 'Dubai',
    address: 'Floor 8, Internet City Building 4, Dubai',
    postalCode: '54321',
    totalAssets: 320,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025 10:30 AM',
    lastModifiedBy: 'Michael Brown',
    lastModifiedOn: '18 Aug 2025 11:45 AM',
    relatedInfo: {
      childLocations: 2,
      assets: 320,
      departments: 6,
      costCenters: 4
    }
  },
  {
    id: 3,
    code: 'UAE-DXB-WH1',
    name: 'Dubai Warehouse',
    type: 'Warehouse',
    parentLocation: 'UAE-HQ',
    country: 'UAE',
    city: 'Dubai',
    address: 'Plot 598-112, Jebel Ali Freezone South, Dubai',
    postalCode: '00000',
    totalAssets: 860,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 02:00 PM',
    lastModifiedBy: 'Robert Taylor',
    lastModifiedOn: '20 Aug 2025 04:15 PM',
    relatedInfo: {
      childLocations: 0,
      assets: 860,
      departments: 3,
      costCenters: 2
    }
  },
  {
    id: 4,
    code: 'UAE-AUH-OF1',
    name: 'Abu Dhabi Office',
    type: 'Office',
    parentLocation: 'UAE-HQ',
    country: 'UAE',
    city: 'Abu Dhabi',
    address: 'Tower B, Al Khatem Tower, ADGM Square, Abu Dhabi',
    postalCode: '45678',
    totalAssets: 420,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '25 Jan 2025 09:00 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '22 Aug 2025 01:20 PM',
    relatedInfo: {
      childLocations: 1,
      assets: 420,
      departments: 5,
      costCenters: 3
    }
  },
  {
    id: 5,
    code: 'UAE-SHJ-S1',
    name: 'Sharjah Site 1',
    type: 'Site',
    parentLocation: 'UAE-HQ',
    country: 'UAE',
    city: 'Sharjah',
    address: 'Industrial Area 13, Near City Centre, Sharjah',
    postalCode: '98765',
    totalAssets: 215,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '01 Feb 2025 11:15 AM',
    lastModifiedBy: 'David Kim',
    lastModifiedOn: '24 Aug 2025 10:00 AM',
    relatedInfo: {
      childLocations: 0,
      assets: 215,
      departments: 2,
      costCenters: 2
    }
  },
  {
    id: 6,
    code: 'KSA-RYD-OF1',
    name: 'Riyadh Office',
    type: 'Office',
    parentLocation: '-',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    address: 'King Fahd Road, Al Olaya District, Riyadh',
    postalCode: '11564',
    totalAssets: 340,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '05 Feb 2025 08:45 AM',
    lastModifiedBy: 'Tariq Mansoor',
    lastModifiedOn: '26 Aug 2025 03:30 PM',
    relatedInfo: {
      childLocations: 2,
      assets: 340,
      departments: 7,
      costCenters: 5
    }
  },
  {
    id: 7,
    code: 'KSA-JED-WH1',
    name: 'Jeddah Warehouse',
    type: 'Warehouse',
    parentLocation: 'KSA-RYD-OF1',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    address: 'Al Industrial Area Phase 3, Jeddah',
    postalCode: '21432',
    totalAssets: 210,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '10 Feb 2025 01:30 PM',
    lastModifiedBy: 'Tariq Mansoor',
    lastModifiedOn: '27 Aug 2025 09:10 AM',
    relatedInfo: {
      childLocations: 0,
      assets: 210,
      departments: 2,
      costCenters: 2
    }
  },
  {
    id: 8,
    code: 'QAT-DOH-OF1',
    name: 'Doha Office',
    type: 'Office',
    parentLocation: '-',
    country: 'Qatar',
    city: 'Doha',
    address: 'West Bay Commercial Tower, Doha',
    postalCode: '23456',
    totalAssets: 180,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Feb 2025 10:00 AM',
    lastModifiedBy: 'Fatima Al-Kuwari',
    lastModifiedOn: '28 Aug 2025 02:45 PM',
    relatedInfo: {
      childLocations: 0,
      assets: 180,
      departments: 4,
      costCenters: 3
    }
  },
  {
    id: 9,
    code: 'BHR-MAN-S1',
    name: 'Manama Site',
    type: 'Site',
    parentLocation: '-',
    country: 'Bahrain',
    city: 'Manama',
    address: 'Diplomatic Area, Building 452, Manama',
    postalCode: '31700',
    totalAssets: 95,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Feb 2025 03:20 PM',
    lastModifiedBy: 'Hassan Al-Majid',
    lastModifiedOn: '29 Aug 2025 11:15 AM',
    relatedInfo: {
      childLocations: 0,
      assets: 95,
      departments: 2,
      costCenters: 1
    }
  },
  {
    id: 10,
    code: 'OMN-MCT-OF1',
    name: 'Muscat Office',
    type: 'Office',
    parentLocation: '-',
    country: 'Oman',
    city: 'Muscat',
    address: 'Al Khuwair Street, Business District, Muscat',
    postalCode: '11200',
    totalAssets: 75,
    status: 'Inactive',
    createdBy: 'Admin',
    createdOn: '25 Feb 2025 09:30 AM',
    lastModifiedBy: 'Salim Al-Busaidi',
    lastModifiedOn: '01 Sep 2025 04:00 PM',
    relatedInfo: {
      childLocations: 0,
      assets: 75,
      departments: 3,
      costCenters: 2
    }
  }
];

export function LocationsTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, setShowAuditHistoryModal }) {
  const [locationsList, setLocationsList] = useState(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(INITIAL_LOCATIONS[0]);
  const [selectedLocIds, setSelectedLocIds] = useState([]);

  // Filter state
  const [locSearchQuery, setLocSearchQuery] = useState('');
  const [locTypeFilter, setLocTypeFilter] = useState('All Types');
  const [locStatusFilter, setLocStatusFilter] = useState('All');
  const [locCountryFilter, setLocCountryFilter] = useState('All');
  const [locParentFilter, setLocParentFilter] = useState('All');

  // Modal state
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locFormState, setLocFormState] = useState({
    code: '',
    name: '',
    type: 'Office',
    parentLocation: '-',
    country: 'UAE',
    city: 'Dubai',
    address: '',
    postalCode: '',
    status: 'Active'
  });

  const filteredLocations = useMemo(() => {
    return locationsList.filter((loc) => {
      const matchesSearch =
        !locSearchQuery ||
        loc.code.toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        loc.name.toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(locSearchQuery.toLowerCase());

      const matchesType =
        locTypeFilter === 'All Types' || locTypeFilter === 'All' || loc.type === locTypeFilter;

      const matchesStatus =
        locStatusFilter === 'All' || loc.status.toLowerCase() === locStatusFilter.toLowerCase();

      const matchesCountry =
        locCountryFilter === 'All' || loc.country === locCountryFilter;

      const matchesParent =
        locParentFilter === 'All' || loc.parentLocation === locParentFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCountry && matchesParent;
    });
  }, [locationsList, locSearchQuery, locTypeFilter, locStatusFilter, locCountryFilter, locParentFilter]);

  const handleResetLocFilters = () => {
    setLocSearchQuery('');
    setLocTypeFilter('All Types');
    setLocStatusFilter('All');
    setLocCountryFilter('All');
    setLocParentFilter('All');
  };

  const handleOpenAddLocModal = (locToEdit = null) => {
    if (locToEdit) {
      setEditingLocation(locToEdit);
      setLocFormState({
        code: locToEdit.code,
        name: locToEdit.name,
        type: locToEdit.type,
        parentLocation: locToEdit.parentLocation,
        country: locToEdit.country,
        city: locToEdit.city,
        address: locToEdit.address,
        postalCode: locToEdit.postalCode,
        status: locToEdit.status
      });
    } else {
      setEditingLocation(null);
      setLocFormState({
        code: '',
        name: '',
        type: 'Office',
        parentLocation: '-',
        country: 'UAE',
        city: 'Dubai',
        address: '',
        postalCode: '',
        status: 'Active'
      });
    }
    setShowAddLocModal(true);
  };

  const handleSaveLoc = (e) => {
    e.preventDefault();
    if (!locFormState.code || !locFormState.name) return;

    if (editingLocation) {
      const updated = locationsList.map((loc) =>
        loc.id === editingLocation.id
          ? {
              ...loc,
              code: locFormState.code.toUpperCase(),
              name: locFormState.name,
              type: locFormState.type,
              parentLocation: locFormState.parentLocation,
              country: locFormState.country,
              city: locFormState.city,
              address: locFormState.address,
              postalCode: locFormState.postalCode,
              status: locFormState.status,
              lastModifiedBy: 'Logged In User',
              lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + ' 02:30 PM'
            }
          : loc
      );
      setLocationsList(updated);
      if (selectedLocation?.id === editingLocation.id) {
        setSelectedLocation(updated.find((item) => item.id === editingLocation.id));
      }
      triggerToast && triggerToast(`Location "${locFormState.name}" updated successfully.`);
    } else {
      const newLoc = {
        id: Date.now(),
        code: locFormState.code.toUpperCase(),
        name: locFormState.name,
        type: locFormState.type,
        parentLocation: locFormState.parentLocation,
        country: locFormState.country,
        city: locFormState.city,
        address: locFormState.address,
        postalCode: locFormState.postalCode,
        totalAssets: 0,
        status: locFormState.status,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        lastModifiedBy: 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        relatedInfo: {
          childLocations: 0,
          assets: 0,
          departments: 0,
          costCenters: 0
        }
      };
      setLocationsList([newLoc, ...locationsList]);
      setSelectedLocation(newLoc);
      triggerToast && triggerToast(`Location "${locFormState.name}" created successfully.`);
    }
    setShowAddLocModal(false);
  };

  const handleDuplicateLocation = (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...loc,
      id: Date.now(),
      code: `${loc.code}-COPY`,
      name: `${loc.name} (Copy)`,
      totalAssets: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' 09:15 AM'
    };
    setLocationsList([duplicated, ...locationsList]);
    setSelectedLocation(duplicated);
    triggerToast && triggerToast(`Location "${loc.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleLocStatus = (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = loc.status === 'Active' ? 'Inactive' : 'Active';
    const updated = locationsList.map((l) =>
      l.id === loc.id ? { ...l, status: newStatus } : l
    );
    setLocationsList(updated);
    if (selectedLocation?.id === loc.id) {
      setSelectedLocation({ ...selectedLocation, status: newStatus });
    }
    triggerToast && triggerToast(`Location "${loc.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteLocation = (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Location "${loc.name}" (${loc.code})?`)) {
      const remaining = locationsList.filter((l) => l.id !== loc.id);
      setLocationsList(remaining);
      if (remaining.length > 0) setSelectedLocation(remaining[0]);
      triggerToast && triggerToast(`Location "${loc.code}" deleted successfully.`);
    }
  };

  const handleToggleSelectAllLocs = () => {
    if (selectedLocIds.length === filteredLocations.length) {
      setSelectedLocIds([]);
    } else {
      setSelectedLocIds(filteredLocations.map((l) => l.id));
    }
  };

  const handleToggleSelectLoc = (id, e) => {
    if (e) e.stopPropagation();
    if (selectedLocIds.includes(id)) {
      setSelectedLocIds(selectedLocIds.filter((item) => item !== id));
    } else {
      setSelectedLocIds([...selectedLocIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <span className="text-[10px] font-semibold text-slate-400 absolute left-3 top-1">Search</span>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 bottom-2.5" />
            <input
              type="text"
              placeholder="Search by location code, name, city..."
              value={locSearchQuery}
              onChange={(e) => setLocSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Location Type</span>
            <select
              value={locTypeFilter}
              onChange={(e) => setLocTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Office">Office</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Site">Site</option>
              <option value="Data Center">Data Center</option>
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={locStatusFilter}
              onChange={(e) => setLocStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Country</span>
            <select
              value={locCountryFilter}
              onChange={(e) => setLocCountryFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="UAE">UAE</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Qatar">Qatar</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Oman">Oman</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Parent Location</span>
            <select
              value={locParentFilter}
              onChange={(e) => setLocParentFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="-">- (Root)</option>
              <option value="UAE-HQ">UAE-HQ</option>
              <option value="KSA-RYD-OF1">KSA-RYD-OF1</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetLocFilters}
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
              <h2 className="text-sm font-bold text-slate-900">Locations List</h2>
              <p className="text-xs text-slate-500">Showing all registered corporate locations.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredLocations.length} Locations Loaded
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLocIds.length === filteredLocations.length && filteredLocations.length > 0}
                      onChange={handleToggleSelectAllLocs}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Location Code</th>
                  <th className="py-3 px-3">Location Name</th>
                  <th className="py-3 px-3">Location Type</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLocations.map((loc, index) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isChecked = selectedLocIds.includes(loc.id);
                  const isMenuOpen = activeRowMenuId === `loc-${loc.id}`;

                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectLoc(loc.id, e)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{loc.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{loc.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{loc.type}</td>
                      <td className="py-2.5 px-3 text-slate-700">{loc.country}</td>
                      <td className="py-2.5 px-3 text-slate-700">{loc.city}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {loc.totalAssets.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            loc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {loc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedLocation(loc)}
                            title="View Details"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddLocModal(loc)}
                            title="Edit Location"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `loc-${loc.id}`)}
                            title="More Actions"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {isMenuOpen && (
                          <div className="absolute right-2 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-left space-y-0.5">
                            <button
                              onClick={() => {
                                setSelectedLocation(loc);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddLocModal(loc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Location</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateLocation(loc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => handleToggleLocStatus(loc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{loc.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(loc)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              Showing 1 to {filteredLocations.length} of {locationsList.length} records
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

        {/* Right Column: Location Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Location Details</h3>
            <button
              onClick={() => handleOpenAddLocModal(selectedLocation)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedLocation && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Location Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedLocation.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedLocation.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedLocation.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Parent Location</span>
                <span className="col-span-2 text-slate-700 font-mono">{selectedLocation.parentLocation}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Country / City</span>
                <span className="col-span-2 text-slate-700">{selectedLocation.city}, {selectedLocation.country}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Address</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedLocation.address}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedLocation.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedLocation.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Assets</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedLocation.totalAssets.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedLocation.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedLocation.createdOn}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Child Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo.childLocations}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo.departments}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <BarChart3 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Cost Centers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo.costCenters}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Location */}
      {showAddLocModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingLocation ? 'Edit Location' : 'Add New Location'}</span>
              </h3>
              <button onClick={() => setShowAddLocModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLoc} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    value={locFormState.code}
                    onChange={(e) => setLocFormState({ ...locFormState, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. UAE-HQ, KSA-OF1"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Type *</label>
                  <select
                    value={locFormState.type}
                    onChange={(e) => setLocFormState({ ...locFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Office">Office</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Site">Site</option>
                    <option value="Data Center">Data Center</option>
                    <option value="Store">Store</option>
                    <option value="Manufacturing Plant">Manufacturing Plant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locFormState.name}
                  onChange={(e) => setLocFormState({ ...locFormState, name: e.target.value })}
                  placeholder="e.g. Head Office"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Location</label>
                <select
                  value={locFormState.parentLocation}
                  onChange={(e) => setLocFormState({ ...locFormState, parentLocation: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="-">- (Root / None)</option>
                  <option value="UAE-HQ">UAE-HQ (Head Office)</option>
                  <option value="KSA-RYD-OF1">KSA-RYD-OF1 (Riyadh Office)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <select
                    value={locFormState.country}
                    onChange={(e) => setLocFormState({ ...locFormState, country: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="UAE">UAE</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Oman">Oman</option>
                    <option value="Kuwait">Kuwait</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={locFormState.city}
                    onChange={(e) => setLocFormState({ ...locFormState, city: e.target.value })}
                    placeholder="e.g. Dubai"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={locFormState.address}
                  onChange={(e) => setLocFormState({ ...locFormState, address: e.target.value })}
                  placeholder="Street address, building, floor..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={locFormState.postalCode}
                    onChange={(e) => setLocFormState({ ...locFormState, postalCode: e.target.value })}
                    placeholder="e.g. 12345"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={locFormState.status}
                    onChange={(e) => setLocFormState({ ...locFormState, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddLocModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingLocation ? 'Save Changes' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
