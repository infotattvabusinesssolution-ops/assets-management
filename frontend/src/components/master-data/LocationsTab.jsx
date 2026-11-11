import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
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
  Lock,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { SmartDeleteModal } from './SmartDeleteModal';
import { RowActionsMenu } from './RowActionsMenu';
import { MasterDataPagination, usePagination } from './MasterDataPagination';
import MasterCodeInput from './MasterCodeInput';
import MasterEmptyState from './MasterEmptyState';

export const INITIAL_LOCATIONS = [];

export const DEFAULT_COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'United States',
  'United Kingdom',
  'India',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'Japan',
  'China',
  'Egypt',
  'Jordan',
  'Lebanon',
  'Malaysia',
  'South Africa',
  'Brazil',
  'Netherlands',
  'Switzerland',
  'Italy',
  'Spain',
  'Turkey',
  'South Korea',
  'Indonesia',
  'Pakistan',
  'Philippines',
  'New Zealand',
  'Ireland',
  'Sweden',
  'Norway',
  'Denmark',
  'Belgium',
  'Austria',
  'Poland',
  'Portugal',
  'Greece'
];

export const DEFAULT_LOCATION_TYPES = [
  { id: 'Internal', code: 'INTERNAL', name: 'Internal', description: 'Company Owned / Leased' },
  { id: 'External', code: 'EXTERNAL', name: 'External', description: 'Client Site / 3rd Party / Vendor' }
];

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
  setExternalShowAddModal,
  onNavigateTab
}) {
  const [locationsList, setLocationsList] = useState([]);
  const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
  const [locationTypesList, setLocationTypesList] = useState(DEFAULT_LOCATION_TYPES.map(t => t.name));
  const [selectedLocation, setSelectedLocation] = useState(null);

  const allCountries = useMemo(() => {
    const base = countriesList && countriesList.length > 0 ? countriesList : DEFAULT_COUNTRIES;
    const combined = [...base];
    locationsList.forEach((l) => {
      if (l.country && !combined.includes(l.country)) {
        combined.push(l.country);
      }
    });
    return Array.from(new Set(combined)).filter(Boolean);
  }, [countriesList, locationsList]);

  const allLocationTypes = useMemo(() => {
    const base = locationTypesList && locationTypesList.length > 0 ? locationTypesList : DEFAULT_LOCATION_TYPES.map(t => t.name);
    const combined = [...base];
    locationsList.forEach((l) => {
      if (l.type && !combined.includes(l.type)) {
        combined.push(l.type);
      }
    });
    return Array.from(new Set(combined)).filter(Boolean);
  }, [locationTypesList, locationsList]);

  const [isLoading, setIsLoading] = useState(false);
  const [smartDeleteState, setSmartDeleteState] = useState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });

  // Load live location types from database
  const loadLocationTypes = async () => {
    try {
      const res = await api.get('/master-data/location-types');
      if (res?.locationTypes && Array.isArray(res.locationTypes) && res.locationTypes.length > 0) {
        setLocationTypesList(res.locationTypes.map(t => t.name));
      }
    } catch (err) {
      console.warn('Failed to fetch location types from database, using defaults:', err);
    }
  };

  // Load live countries from database
  const loadCountries = async () => {
    try {
      const res = await api.get('/master-data/countries');
      if (res?.countries && Array.isArray(res.countries) && res.countries.length > 0) {
        setCountriesList(res.countries.map(c => c.name));
      }
    } catch (err) {
      console.warn('Failed to fetch countries from database, using defaults:', err);
    }
  };

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
          locationLevel1: site.locationLevel1 || '',
          locationLevel2: site.locationLevel2 || '',
          locationLevel3: site.locationLevel3 || '',
          locationLevel4: site.locationLevel4 || '',
          level: site.level || 'Level 1',
          parentLocation: site.parentLocation || '-',
          fullPath: site.fullPath || site.name,
          country: site.country || '',
          city: site.city || '',
          address: site.address || site.name,
          totalAssets: site.totalAssets || 0,
          status: site.active === false || site.status === 'Inactive' ? 'Inactive' : 'Active',
          createdBy: site.createdBy || 'Admin User',
          createdOn: site.createdAt ? new Date(site.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          lastModifiedBy: site.lastModifiedBy || 'Admin User',
          lastModifiedOn: site.updatedAt ? new Date(site.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          relatedInfo: {
            childLocations: res.sites.filter(s => s.parentLocation === site.code || s.parentLocation === site.id).length,
            assets: site.totalAssets || 0,
            departments: site.departmentsCount || 0,
            costCenters: site.costCentersCount || 0
          }
        }));
        console.log('📋 [Locations Loaded dynamically from Database]:', mapped);
        setLocationsList(mapped);
        setSelectedLocation((prev) => (prev ? mapped.find((c) => c.id === prev.id) || mapped[0] || null : mapped[0] || null));
      } else {
        setLocationsList([]);
        setSelectedLocation(null);
      }
    } catch (err) {
      console.warn('Failed to fetch sites/locations:', err);
      setLocationsList([]);
      setSelectedLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const [level1List, setLevel1List] = useState([]);
  const [level2List, setLevel2List] = useState([]);
  const [level3List, setLevel3List] = useState([]);
  const [level4List, setLevel4List] = useState([]);

  const loadLevelOptions = async () => {
    const fetchLevel = async (lvl) => {
      try {
        const res = await api.get(`/master-data/location-levels/${lvl}`).catch(() => null);
        let items = res?.locationLevels && Array.isArray(res.locationLevels) ? res.locationLevels : [];
        const local = JSON.parse(localStorage.getItem(`fams_custom_location_level_${lvl}`) || '[]');
        const codes = new Set(items.map(x => (x.code || '').toUpperCase().trim()));
        const missingLocal = local.filter(l => !codes.has((l.code || '').toUpperCase().trim()));
        return [...items, ...missingLocal].filter(it => it.active !== false && it.status !== 'Inactive');
      } catch (err) {
        const local = JSON.parse(localStorage.getItem(`fams_custom_location_level_${lvl}`) || '[]');
        return local.filter(it => it.active !== false && it.status !== 'Inactive');
      }
    };

    const [l1, l2, l3, l4] = await Promise.all([
      fetchLevel(1),
      fetchLevel(2),
      fetchLevel(3),
      fetchLevel(4)
    ]);
    setLevel1List(l1);
    setLevel2List(l2);
    setLevel3List(l3);
    setLevel4List(l4);
  };

  useEffect(() => {
    loadLocations();
    loadLevelOptions();
    loadCountries();
    loadLocationTypes();
  }, []);

  // Filter state
  const [locSearchQuery, setLocSearchQuery] = useState('');
  const [locTypeFilter, setLocTypeFilter] = useState('All Types');
  const [locStatusFilter, setLocStatusFilter] = useState('All');

  // Modal state
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [locFormState, setLocFormState] = useState({
    code: '',
    name: '',
    type: 'Internal',
    locationLevel1: '',
    locationLevel2: '',
    locationLevel3: '',
    locationLevel4: '',
    address: '',
    status: 'Active'
  });

  const normLevel = (val) => (val || '').trim().toUpperCase();
  const selectedHierarchyHasValues = Boolean(
    locFormState.locationLevel1 ||
    locFormState.locationLevel2 ||
    locFormState.locationLevel3 ||
    locFormState.locationLevel4
  );

  const duplicateHierarchyLoc = useMemo(() => {
    if (!selectedHierarchyHasValues) return null;
    const sL1 = normLevel(locFormState.locationLevel1);
    const sL2 = normLevel(locFormState.locationLevel2);
    const sL3 = normLevel(locFormState.locationLevel3);
    const sL4 = normLevel(locFormState.locationLevel4);

    return locationsList.find((it) => {
      if (editingLocation && (it.id === editingLocation.id || it.code === editingLocation.code)) return false;
      return (
        normLevel(it.locationLevel1) === sL1 &&
        normLevel(it.locationLevel2) === sL2 &&
        normLevel(it.locationLevel3) === sL3 &&
        normLevel(it.locationLevel4) === sL4
      );
    }) || null;
  }, [locationsList, editingLocation, locFormState.locationLevel1, locFormState.locationLevel2, locFormState.locationLevel3, locFormState.locationLevel4, selectedHierarchyHasValues]);

  const filteredLocations = useMemo(() => {
    return locationsList.filter((loc) => {
      const matchesSearch =
        !locSearchQuery ||
        (loc.code || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.name || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.address || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.locationLevel1 || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.locationLevel2 || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.locationLevel3 || '').toLowerCase().includes(locSearchQuery.toLowerCase()) ||
        (loc.locationLevel4 || '').toLowerCase().includes(locSearchQuery.toLowerCase());

      const matchesType =
        locTypeFilter === 'All Types' || locTypeFilter === 'All' || loc.type === locTypeFilter;

      const matchesStatus =
        locStatusFilter === 'All' || (loc.status || '').toLowerCase() === locStatusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [locationsList, locSearchQuery, locTypeFilter, locStatusFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems: pagedLocations,
    startIndex,
    setCurrentPage,
    pageSize
  } = usePagination(filteredLocations, 10);

  const handleResetLocFilters = () => {
    setLocSearchQuery('');
    setLocTypeFilter('All Types');
    setLocStatusFilter('All');
  };

  const handleOpenAddLocModal = (locToEdit = null) => {
    loadLevelOptions();
    setActiveRowMenuId && setActiveRowMenuId(null);
    setModalError('');
    if (locToEdit) {
      setEditingLocation(locToEdit);
      setLocFormState({
        code: locToEdit.code || '',
        name: locToEdit.name || '',
        type: locToEdit.type || 'Internal',
        locationLevel1: locToEdit.locationLevel1 || '',
        locationLevel2: locToEdit.locationLevel2 || '',
        locationLevel3: locToEdit.locationLevel3 || '',
        locationLevel4: locToEdit.locationLevel4 || '',
        address: locToEdit.address || '',
        status: locToEdit.status || 'Active'
      });
    } else {
      setEditingLocation(null);
      setLocFormState({
        code: '',
        name: '',
        type: allLocationTypes[0] || 'Internal',
        locationLevel1: '',
        locationLevel2: '',
        locationLevel3: '',
        locationLevel4: '',
        address: '',
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
    if (!locFormState.name || !locFormState.name.trim()) {
      setModalError('Location Name is required.');
      return;
    }

    const cleanCode = (locFormState.code || '').trim().toUpperCase();
    const cleanName = locFormState.name.trim();

    // STRICT DUPLICATE VALIDATION: Code & Name must be unique
    const isDuplicate = locationsList.some((it) => {
      if (editingLocation && it.id === editingLocation.id) return false;
      const codeMatches = cleanCode && (it.code || '').trim().toUpperCase() === cleanCode;
      const nameMatches = cleanName && (it.name || '').trim().toLowerCase() === cleanName.toLowerCase();
      return (cleanCode && codeMatches) || nameMatches;
    });

    if (isDuplicate) {
      const msg = `Duplicate Error: A location with code "${cleanCode}" or name "${cleanName}" already exists.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    // STRICT DUPLICATE VALIDATION: Hierarchy levels combination must be unique
    if (duplicateHierarchyLoc) {
      const hierarchyStr = [
        locFormState.locationLevel1,
        locFormState.locationLevel2,
        locFormState.locationLevel3,
        locFormState.locationLevel4
      ].filter(Boolean).join(' > ');
      const msg = `Duplicate Hierarchy Error: Location "${duplicateHierarchyLoc.name}" (${duplicateHierarchyLoc.code}) already has this exact hierarchy (${hierarchyStr}). Each location master must have a unique hierarchy combination.`;
      setModalError(msg);
      triggerToast && triggerToast(msg);
      return;
    }

    const payload = {
      name: cleanName,
      type: locFormState.type || (allLocationTypes[0] || 'Internal'),
      locationLevel1: locFormState.locationLevel1 || '',
      locationLevel2: locFormState.locationLevel2 || '',
      locationLevel3: locFormState.locationLevel3 || '',
      locationLevel4: locFormState.locationLevel4 || '',
      address: locFormState.address || '',
      active: locFormState.status === 'Active',
      status: locFormState.status
    };
    if (cleanCode) payload.code = cleanCode;

    if (editingLocation) {
      console.log('✏️ [Updating Location in Frontend]:', { id: editingLocation.id, ...payload });
      try {
        const updateRes = await api.put(`/master-data/sites/${editingLocation.id}`, payload);
        console.log('✅ [Location Updated Successfully in Database]:', updateRes?.site || updateRes);
        await loadLocations();
        triggerToast && triggerToast(`Location "${cleanName}" updated successfully.`);
      } catch (err) {
        console.error('Save location error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to update location.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    } else {
      console.log('🚀 [Adding New Location in Frontend]:', payload);
      try {
        const createRes = await api.post('/master-data/sites', payload);
        console.log('✅ [Location Created Successfully in Database]:', createRes?.site || createRes);
        await loadLocations();
        triggerToast && triggerToast(`Location "${cleanName}" created successfully.`);
      } catch (err) {
        console.error('Add location error:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to create location.';
        setModalError(msg);
        triggerToast && triggerToast(msg);
        return;
      }
    }
    setShowAddLocModal(false);
  };

  const handleDuplicateLocation = (loc) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    setEditingLocation(null);
    setLocFormState({
      code: '',
      name: `${loc.name} (Copy)`,
      type: loc.type || 'Internal',
      locationLevel1: '',
      locationLevel2: '',
      locationLevel3: '',
      locationLevel4: '',
      address: loc.address || '',
      status: 'Active'
    });
    setModalError('');
    setShowAddLocModal(true);
    triggerToast && triggerToast('Specify unique hierarchy levels for the duplicated location.');
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
    if (!window.confirm(`Are you sure you want to delete Location "${loc.name}" (${loc.code})?`)) return;

    try {
      const res = await api.delete(`/master-data/sites/${loc.id}`);
      if (res?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: loc,
          linkedCount: res.linkedCount || 0,
          details: res.details || null,
          isProcessing: false
        });
        return;
      }
      await loadLocations();
      triggerToast && triggerToast(res?.message || `Location "${loc.code}" deleted successfully.`);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresConfirmation) {
        setSmartDeleteState({
          isOpen: true,
          item: loc,
          linkedCount: data.linkedCount || 0,
          details: data.details || null,
          isProcessing: false
        });
        return;
      }
      console.warn('Delete location error:', err);
      const errMsg = data?.message || err?.message || 'Cannot delete location.';
      triggerToast && triggerToast(errMsg);
    }
  };

  const handleSmartDeactivateLocation = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(`/master-data/sites/${smartDeleteState.item.id}?action=deactivate`);
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      triggerToast && triggerToast(res?.message || 'Location deactivated successfully.');
      await loadLocations();
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to deactivate location.');
    }
  };

  const handleSmartForceDeleteLocation = async () => {
    if (!smartDeleteState.item) return;
    setSmartDeleteState(prev => ({ ...prev, isProcessing: true }));
    try {
      const res = await api.delete(`/master-data/sites/${smartDeleteState.item.id}?action=force_delete`);
      setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false });
      triggerToast && triggerToast(res?.message || 'Location and references unlinked, permanently deleted from database.');
      await loadLocations();
    } catch (err) {
      setSmartDeleteState(prev => ({ ...prev, isProcessing: false }));
      triggerToast && triggerToast(err?.response?.data?.message || 'Failed to force delete location.');
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
              placeholder="Search by location code, name, levels, address..."
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
              {allLocationTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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
        <div className={`${filteredLocations.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Locations List</h2>
              <p className="text-xs text-slate-500">Showing all registered corporate locations.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredLocations.length} Locations
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Location Code</th>
                  <th className="py-3 px-3">Location Name</th>
                  <th className="py-3 px-3">Level 1</th>
                  <th className="py-3 px-3">Level 2</th>
                  <th className="py-3 px-3">Level 3</th>
                  <th className="py-3 px-3">Level 4</th>
                  <th className="py-3 px-3 text-center">Type</th>
                  <th className="py-3 px-3 text-right">Total Assets</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLocations.length === 0 ? (
                  <MasterEmptyState
                    icon={MapPin}
                    title="No Locations found"
                    subtitle={locSearchQuery ? "No locations match your search criteria." : "Get started by defining your first operational location."}
                    actionLabel="Add Location"
                    onAction={() => handleOpenAddLocModal(null)}
                    colSpan={11}
                  />
                ) : (
                  pagedLocations.map((loc, index) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isMenuOpen = activeRowMenuId === `loc-${loc.id}`;
                  const isNearBottom = filteredLocations.length > 2 && index >= filteredLocations.length - 2;

                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{startIndex + index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{loc.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{loc.name}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs">{loc.locationLevel1 || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs">{loc.locationLevel2 || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs">{loc.locationLevel3 || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs">{loc.locationLevel4 || '-'}</td>
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
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddLocModal(loc)}
                            title="Edit Location"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <RowActionsMenu
                            isOpen={isMenuOpen}
                            onToggle={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `loc-${loc.id}`)}
                            onClose={() => setActiveRowMenuId && setActiveRowMenuId(null)}
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleOpenAddLocModal(loc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Location</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDuplicateLocation(loc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleToggleLocStatus(loc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{loc.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveRowMenuId && setActiveRowMenuId(null);
                                handleDeleteLocation(loc);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </RowActionsMenu>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          <MasterDataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLocations.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Location Details Panel */}
        {filteredLocations.length > 0 && selectedLocation && (
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
                <span className="text-slate-500 font-medium">Location Level 1</span>
                <span className="col-span-2 text-slate-700 font-medium">{selectedLocation.locationLevel1 || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location Level 2</span>
                <span className="col-span-2 text-slate-700 font-medium">{selectedLocation.locationLevel2 || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location Level 3</span>
                <span className="col-span-2 text-slate-700 font-medium">{selectedLocation.locationLevel3 || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location Level 4</span>
                <span className="col-span-2 text-slate-700 font-medium">{selectedLocation.locationLevel4 || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Address</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedLocation.address || '-'}</span>
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
        )}
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

            {modalError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLoc} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location Code
                  </label>
                  <MasterCodeInput
                    entityKey="site"
                    value={locFormState.code}
                    onChange={(code) => setLocFormState({ ...locFormState, code })}
                    disabled={!!editingLocation}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location Type *
                  </label>
                  <select
                    value={locFormState.type || (allLocationTypes[0] || 'Internal')}
                    onChange={(e) => setLocFormState({ ...locFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    {allLocationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t === 'Internal' ? 'Internal (Company Owned / Leased)' : t === 'External' ? 'External (Client Site / 3rd Party / Vendor)' : t}
                      </option>
                    ))}
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
                  <label className="block font-semibold text-slate-700 mb-1">Location Level 1</label>
                  <select
                    value={locFormState.locationLevel1 || ''}
                    onChange={(e) => setLocFormState({ ...locFormState, locationLevel1: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Location Level 1</option>
                    {level1List.map((lvl) => (
                      <option key={lvl.id || lvl.code} value={lvl.code}>
                        {lvl.code} - {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Level 2</label>
                  <select
                    value={locFormState.locationLevel2 || ''}
                    onChange={(e) => setLocFormState({ ...locFormState, locationLevel2: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Location Level 2</option>
                    {level2List.map((lvl) => (
                      <option key={lvl.id || lvl.code} value={lvl.code}>
                        {lvl.code} - {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Level 3</label>
                  <select
                    value={locFormState.locationLevel3 || ''}
                    onChange={(e) => setLocFormState({ ...locFormState, locationLevel3: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Location Level 3</option>
                    {level3List.map((lvl) => (
                      <option key={lvl.id || lvl.code} value={lvl.code}>
                        {lvl.code} - {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location Level 4</label>
                  <select
                    value={locFormState.locationLevel4 || ''}
                    onChange={(e) => setLocFormState({ ...locFormState, locationLevel4: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Location Level 4</option>
                    {level4List.map((lvl) => (
                      <option key={lvl.id || lvl.code} value={lvl.code}>
                        {lvl.code} - {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {duplicateHierarchyLoc && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">Duplicate Hierarchy Detected:</span>
                    <p className="mt-0.5 text-amber-700">
                      This hierarchy combination is already assigned to location <strong>{duplicateHierarchyLoc.code} ({duplicateHierarchyLoc.name})</strong>. Each location master must have a unique hierarchy combination.
                    </p>
                  </div>
                </div>
              )}

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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddLocModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateHierarchyLoc)}
                  className={clsx(
                    'px-5 py-2 rounded-xl text-white font-bold shadow-sm transition-all',
                    duplicateHierarchyLoc
                      ? 'bg-slate-300 cursor-not-allowed opacity-70'
                      : 'bg-[#6C2BD9] hover:bg-[#5B21B6] cursor-pointer'
                  )}
                  title={duplicateHierarchyLoc ? 'Cannot save with duplicate hierarchy levels' : undefined}
                >
                  {editingLocation ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART DELETE MODAL */}
      <SmartDeleteModal
        isOpen={smartDeleteState.isOpen}
        onClose={() => setSmartDeleteState({ isOpen: false, item: null, linkedCount: 0, details: null, isProcessing: false })}
        item={smartDeleteState.item}
        entityName="Location"
        linkedCount={smartDeleteState.linkedCount}
        details={smartDeleteState.details}
        onDeactivate={handleSmartDeactivateLocation}
        onForceDelete={handleSmartForceDeleteLocation}
        isProcessing={smartDeleteState.isProcessing}
      />
    </div>
  );
}
