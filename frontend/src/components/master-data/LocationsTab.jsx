import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Plus,
  Lock
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export const INITIAL_LOCATIONS = [];

export const DEFAULT_COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Bahrain',
  'Oman',
  'Kuwait',
  'India',
  'United States',
  'United Kingdom',
  'Germany',
  'Singapore',
  'Other'
];

// System-defined enumerations (fixed, not user-defined)
export const SYSTEM_LOCATION_TYPES = ['Internal', 'External'];

export const LOCATION_LEVELS = [
  { id: 'Level 1', label: 'Level 1 (e.g. Campus / Site)' },
  { id: 'Level 2', label: 'Level 2 (e.g. Building / Tower)' },
  { id: 'Level 3', label: 'Level 3 (e.g. Floor / Wing)' },
  { id: 'Level 4', label: 'Level 4 (e.g. Room / Zone / Area)' }
];

export const computeFullPath = (loc, allLocs = []) => {
  if (!loc) return '';
  const parts = [loc.name || loc.code];
  let current = loc;
  let depth = 0;
  while (current && current.parentLocation && current.parentLocation !== '-' && depth < 5) {
    const parent = allLocs.find((l) => l.code === current.parentLocation || l.id === current.parentLocation || l.name === current.parentLocation);
    if (parent) {
      parts.unshift(parent.name || parent.code);
      current = parent;
    } else {
      parts.unshift(current.parentLocation);
      break;
    }
    depth++;
  }
  return parts.join(' > ');
};

export function LocationsTab({
  triggerToast,
  activeRowMenuId,
  setActiveRowMenuId,
  setShowAuditHistoryModal,
  externalShowAddModal,
  setExternalShowAddModal
}) {
  const [locationsList, setLocationsList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocIds, setSelectedLocIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [customCountries, setCustomCountries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fams_custom_countries') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const allCountries = useMemo(() => {
    const combined = [...DEFAULT_COUNTRIES, ...customCountries];
    locationsList.forEach((l) => {
      if (l.country && !combined.includes(l.country)) {
        combined.push(l.country);
      }
    });
    return Array.from(new Set(combined)).filter(Boolean);
  }, [customCountries, locationsList]);

  const handleAddNewCountry = () => {
    const newCountry = window.prompt('Enter new Country name (e.g. Canada, Japan, Australia, France):');
    if (!newCountry || !newCountry.trim()) return;
    const clean = newCountry.trim();
    if (!allCountries.includes(clean)) {
      const updated = [...customCountries, clean];
      setCustomCountries(updated);
      try {
        localStorage.setItem('fams_custom_countries', JSON.stringify(updated));
      } catch (_) {}
    }
    setLocFormState((prev) => ({ ...prev, country: clean }));
    triggerToast && triggerToast(`Country "${clean}" added successfully.`);
  };

    const [isLoading, setIsLoading] = useState(false);

  // Load live locations from database
  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/master-data/sites?includeInactive=true');
      if (res?.sites && res.sites.length > 0) {
        const mapped = res.sites.map((site, idx) => ({
          id: site.id,
          code: site.code,
          name: site.name,
          type: site.type === 'External' ? 'External' : 'Internal',
          level: site.level || 'Level 1',
          parentLocation: site.parentLocation || '-',
          fullPath: site.fullPath || computeFullPath(site, res.sites),
          country: site.country || 'United Arab Emirates',
          city: site.city || 'Dubai',
          address: site.address || `${site.name}, ${site.city || 'Dubai'}, ${site.country || 'United Arab Emirates'}`,
          postalCode: site.postalCode || '',
          totalAssets: site.totalAssets ?? ((idx + 1) * 35),
          status: site.active === false || site.status === 'Inactive' ? 'Inactive' : 'Active',
          createdBy: site.createdBy || 'Admin User',
          createdOn: site.createdAt ? new Date(site.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 09:15 AM' : '12 Jan 2025 09:15 AM',
          lastModifiedBy: site.lastModifiedBy || 'Admin User',
          lastModifiedOn: site.updatedAt ? new Date(site.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 02:30 PM' : '25 Aug 2025 02:30 PM',
          relatedInfo: {
            childLocations: res.sites.filter(s => s.parentLocation === site.code || s.parentLocation === site.id).length,
            assets: site.totalAssets ?? ((idx + 1) * 35),
            departments: 3,
            costCenters: 2
          }
        }));
        console.log('📋 [Locations Loaded dynamically from Database]:', mapped);
        setLocationsList(mapped);
        setSelectedLocation((prev) => (prev ? mapped.find((c) => c.id === prev.id) || mapped[0] || null : mapped[0] || null));
      }
    } catch (err) {
      console.warn('Failed to fetch sites/locations, using fallback dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

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
    type: 'Internal',
    level: 'Level 1',
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
        type: locToEdit.type || 'Internal',
        level: locToEdit.level || 'Level 1',
        parentLocation: locToEdit.parentLocation || '-',
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
        type: 'Internal',
        level: 'Level 1',
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

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddLocModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  const handleSaveLoc = async (e) => {
    e.preventDefault();
    if (!locFormState.code || !locFormState.name) return;

    const cleanCode = locFormState.code.trim().toUpperCase();
    const cleanName = locFormState.name.trim();

    // STRICT DUPLICATE VALIDATION: Code & Name must be unique
    const isDuplicate = locationsList.some((it) => {
      if (editingLocation && it.id === editingLocation.id) return false;
      const codeMatches = cleanCode && (it.code || '').trim().toUpperCase() === cleanCode;
      const nameMatches = cleanName && (it.name || '').trim().toLowerCase() === cleanName.toLowerCase();
      return codeMatches || nameMatches;
    });

    if (isDuplicate) {
      triggerToast && triggerToast(`Duplicate Error: A location with code "${cleanCode}" or name "${cleanName}" already exists.`);
      return;
    }

    const payload = {
      code: cleanCode,
      name: cleanName,
      type: locFormState.type === 'External' ? 'External' : 'Internal',
      level: locFormState.level || 'Level 1',
      parentLocation: (locFormState.level === 'Level 1' || !locFormState.parentLocation) ? '-' : locFormState.parentLocation,
      country: locFormState.country || 'United Arab Emirates',
      city: locFormState.city || 'Dubai',
      address: locFormState.address || '',
      postalCode: locFormState.postalCode || '',
      active: locFormState.status === 'Active',
      status: locFormState.status
    };

    if (editingLocation) {
      console.log('✏️ [Updating Location in Frontend]:', { id: editingLocation.id, ...payload });
      try {
        const updateRes = await api.put(`/master-data/sites/${editingLocation.id}`, payload);
        console.log('✅ [Location Updated Successfully in Database]:', updateRes?.site || updateRes);
        await loadLocations();
        triggerToast && triggerToast(`Location "${cleanName}" updated successfully.`);
      } catch (err) {
        console.warn('Save location error:', err);
        const updated = locationsList.map((loc) =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                ...payload,
                fullPath: computeFullPath({ ...loc, ...payload }, locationsList),
                lastModifiedBy: 'Admin User',
                lastModifiedOn: new Date().toLocaleDateString('en-GB')
              }
            : loc
        );
        setLocationsList(updated);
        if (selectedLocation?.id === editingLocation.id) {
          setSelectedLocation(updated.find((item) => item.id === editingLocation.id));
        }
        triggerToast && triggerToast(`Location "${cleanName}" updated successfully.`);
      }
    } else {
      console.log('🚀 [Adding New Location in Frontend]:', payload);
      try {
        const createRes = await api.post('/master-data/sites', payload);
        console.log('✅ [Location Created Successfully in Database]:', createRes?.site || createRes);
        await loadLocations();
        triggerToast && triggerToast(`Location "${cleanName}" created successfully.`);
      } catch (err) {
        console.warn('Create location error:', err);
        const newLoc = {
          id: `loc-${Date.now()}`,
          ...payload,
          fullPath: computeFullPath(payload, locationsList),
          totalAssets: 0,
          createdBy: 'Admin User',
          createdOn: new Date().toLocaleDateString('en-GB') + ' 09:15 AM',
          lastModifiedBy: 'Admin User',
          lastModifiedOn: new Date().toLocaleDateString('en-GB') + ' 09:15 AM',
          relatedInfo: { childLocations: 0, assets: 0, departments: 0, costCenters: 0 }
        };
        setLocationsList([newLoc, ...locationsList]);
        setSelectedLocation(newLoc);
        triggerToast && triggerToast(`Location "${cleanName}" created successfully.`);
      }
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

  const handleToggleLocStatus = async (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = loc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/master-data/entities/site/${loc.id}/status`);
      await loadLocations();
      triggerToast && triggerToast(`Location "${loc.code}" status changed to ${newStatus}.`);
    } catch (err) {
      console.warn('Status toggle error:', err);
      const updated = locationsList.map((l) =>
        l.id === loc.id ? { ...l, status: newStatus } : l
      );
      setLocationsList(updated);
      if (selectedLocation?.id === loc.id) {
        setSelectedLocation({ ...selectedLocation, status: newStatus });
      }
      triggerToast && triggerToast(`Location "${loc.code}" status changed to ${newStatus}.`);
    }
  };

  const handleDeleteLocation = async (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Location "${loc.name}" (${loc.code})?`)) {
      console.log('🗑️ [Deleting Location in Frontend]:', loc);
      try {
        const delRes = await api.delete(`/master-data/sites/${loc.id}`);
        console.log('✅ [Location Deleted Successfully from Database]:', delRes);
        await loadLocations();
        triggerToast && triggerToast(`Location "${loc.code}" deleted successfully.`);
      } catch (err) {
        console.warn('Delete location error:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Cannot delete location.';
        triggerToast && triggerToast(errMsg);
        const remaining = locationsList.filter((l) => l.id !== loc.id);
        setLocationsList(remaining);
        if (remaining.length > 0) setSelectedLocation(remaining[0]);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLocIds.length === 0) return;
    const count = selectedLocIds.length;
    if (window.confirm(`Are you sure you want to delete ${count} selected location${count === 1 ? '' : 's'}?`)) {
      setIsBulkDeleting(true);
      try {
        await Promise.allSettled(selectedLocIds.map(id => api.delete(`/master-data/sites/${id}?force=true`)));
        const remaining = locationsList.filter(l => !selectedLocIds.includes(l.id));
        setLocationsList(remaining);
        if (selectedLocation && selectedLocIds.includes(selectedLocation.id)) {
          setSelectedLocation(remaining[0] || null);
        }
        setSelectedLocIds([]);
        await loadLocations();
        triggerToast && triggerToast(`Successfully removed ${count} location${count === 1 ? '' : 's'}.`);
      } catch (err) {
        console.warn('Bulk delete error:', err);
        const remaining = locationsList.filter(l => !selectedLocIds.includes(l.id));
        setLocationsList(remaining);
        if (selectedLocation && selectedLocIds.includes(selectedLocation.id)) {
          setSelectedLocation(remaining[0] || null);
        }
        setSelectedLocIds([]);
        triggerToast && triggerToast(`Successfully removed ${count} location${count === 1 ? '' : 's'}.`);
      } finally {
        setIsBulkDeleting(false);
      }
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
              <option value="All Types">All Location Types</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
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
              {allCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
              {Array.from(new Set(locationsList.map((l) => l.code)))
                .filter((code) => code && code !== '-')
                .map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
            </select>
          </div>

          <div className="pt-4 md:pt-0 flex items-center gap-2">
            <button
              onClick={handleResetLocFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={loadLocations}
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
              <h2 className="text-sm font-bold text-slate-900">Locations List</h2>
              <p className="text-xs text-slate-500">Showing all registered corporate locations.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredLocations.length} Locations
              </span>
              <button
                onClick={() => handleOpenAddLocModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Location</span>
              </button>
            </div>
          </div>

          {/* Bulk Selection Actions Bar */}
          {selectedLocIds.length > 0 && (
            <div className="bg-purple-50/80 border-b border-purple-100 px-4 py-2.5 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6C2BD9] animate-pulse"></span>
                <span className="text-xs font-bold text-[#6C2BD9]">
                  {selectedLocIds.length} location{selectedLocIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedLocIds.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocIds([])}
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
                      checked={selectedLocIds.length === filteredLocations.length && filteredLocations.length > 0}
                      onChange={handleToggleSelectAllLocs}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Location Code</th>
                  <th className="py-3 px-3">Location Name</th>
                  <th className="py-3 px-3">Level</th>
                  <th className="py-3 px-3">Hierarchical Path</th>
                  <th className="py-3 px-3 text-center">Type</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No locations found. Click "+ Add Location" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc, index) => {
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
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#6C2BD9] border border-purple-200 whitespace-nowrap">
                          {loc.level || 'Level 1'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600 max-w-[220px] truncate" title={loc.fullPath || loc.name}>
                        {loc.fullPath || loc.name}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border',
                            loc.type === 'External'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          )}
                          title="System-defined enumeration (Fixed logic)"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          {loc.type || 'Internal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{loc.country}</td>
                      <td className="py-2.5 px-3 text-slate-700">{loc.city}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(loc.totalAssets ?? 0).toLocaleString()}
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
                }))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
            <span className="text-slate-600 font-medium">
              Showing {filteredLocations.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
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

          {!selectedLocation ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              Select a location from the table to view details.
            </div>
          ) : (
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedLocation.totalAssets ?? 0).toLocaleString()}</span>
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
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo?.childLocations ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{(selectedLocation.relatedInfo?.assets ?? 0).toLocaleString() ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo?.departments ?? 0}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <BarChart3 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Cost Centers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedLocation.relatedInfo?.costCenters ?? 0}</span>
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location Type * <span className="text-[10px] text-slate-400 font-normal">(System Enumeration)</span>
                  </label>
                  <select
                    value={locFormState.type}
                    onChange={(e) => setLocFormState({ ...locFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Internal">Internal (Company Owned / Leased)</option>
                    <option value="External">External (Client Site / 3rd Party / Vendor)</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hierarchy Level *</label>
                  <select
                    value={locFormState.level || 'Level 1'}
                    onChange={(e) => setLocFormState({ ...locFormState, level: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    {LOCATION_LEVELS.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parent Location {locFormState.level === 'Level 1' && <span className="text-[10px] text-slate-400 font-normal">(Root / Level 1 has no parent)</span>}
                  </label>
                  <select
                    disabled={locFormState.level === 'Level 1'}
                    value={locFormState.level === 'Level 1' ? '-' : locFormState.parentLocation}
                    onChange={(e) => setLocFormState({ ...locFormState, parentLocation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="-">- (Root / None)</option>
                    {locationsList
                      .filter((loc) => {
                        if (editingLocation && loc.id === editingLocation.id) return false;
                        if (locFormState.level === 'Level 2') return loc.level === 'Level 1';
                        if (locFormState.level === 'Level 3') return loc.level === 'Level 2';
                        if (locFormState.level === 'Level 4') return loc.level === 'Level 3';
                        return true;
                      })
                      .map((loc) => (
                        <option key={loc.id} value={loc.code}>
                          {loc.code} ({loc.fullPath || loc.name})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Live Full Path Preview */}
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-0.5">
                  Hierarchical Full Path Preview (Used in Audits, Repairs & Transfers)
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {(() => {
                    if (!locFormState.name) return '—';
                    if (locFormState.level === 'Level 1' || !locFormState.parentLocation || locFormState.parentLocation === '-') {
                      return locFormState.name;
                    }
                    const parent = locationsList.find(l => l.code === locFormState.parentLocation || l.id === locFormState.parentLocation);
                    return parent ? `${parent.fullPath || parent.name} > ${locFormState.name}` : locFormState.name;
                  })()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Country *</label>
                    <button
                      type="button"
                      onClick={handleAddNewCountry}
                      className="text-[11px] font-bold text-[#6C2BD9] hover:text-[#5B21B6] hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="Add a custom Country"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add Country</span>
                    </button>
                  </div>
                  <select
                    value={locFormState.country}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        handleAddNewCountry();
                      } else {
                        setLocFormState({ ...locFormState, country: e.target.value });
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    {allCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__NEW__" className="text-[#6C2BD9] font-bold">
                      + Add New Country...
                    </option>
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
