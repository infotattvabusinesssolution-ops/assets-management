import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Factory,
  Scale,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  Tag,
  Box,
  Layers,
  ChevronRight,
  Lock
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export const DEFAULT_MANUFACTURERS = [];

export const DEFAULT_BRANDS = [];

export const DEFAULT_UOM = [];

export const DEFAULT_ASSET_TYPES = [];

export const DEFAULT_STATUS_CODES = [];

export function GenericMasterTab({
  activeTab,
  tabName,
  triggerToast,
  addModalTrigger,
  externalShowAddModal,
  setExternalShowAddModal,
  onResetToDefault
}) {
  const [items, setItems] = useState([]);
  const [realManufacturers, setRealManufacturers] = useState([]);

  // Fetch real manufacturers dynamically from backend and custom storage
  const fetchRealManufacturers = async () => {
    try {
      const res = await api.get('/master-data/manufacturers?includeInactive=false').catch(() => null);
      const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
      const deletedMfrs = new Set(
        (JSON.parse(localStorage.getItem('fams_deleted_manufacturers') || '[]')).map(x => String(x).toLowerCase().trim())
      );
      const serverMfrs = (res?.manufacturers && Array.isArray(res.manufacturers)) ? res.manufacturers : [];
      const seen = new Set();
      const combined = [...serverMfrs, ...custom].filter(m => {
        const id = String(m.id || '').toLowerCase().trim();
        const code = String(m.code || '').toLowerCase().trim();
        const name = (m.name || m.code || '').trim();
        if (deletedMfrs.has(id) || deletedMfrs.has(code) || deletedMfrs.has(name.toLowerCase())) return false;
        if (!name || seen.has(name.toLowerCase())) return false;
        seen.add(name.toLowerCase());
        return true;
      });
      setRealManufacturers(combined);
    } catch (err) {
      console.warn('Failed to load real manufacturers:', err);
    }
  };
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    manufacturerName: '',
    website: '',
    supportContact: '',
    country: 'United States',
    symbol: '',
    category: 'Discrete Count',
    stage: 'Operational',
    color: 'emerald',
    description: '',
    status: 'Active'
  });

  // Determine current tab configuration
  const tabConfig = useMemo(() => {
    switch (activeTab) {
      case 'manufacturers':
        return {
          title: 'Manufacturers',
          singular: 'Manufacturer',
          icon: Factory,
          defaultItems: DEFAULT_MANUFACTURERS,
          apiEndpoint: '/master-data/manufacturers'
        };
      case 'brands':
        return {
          title: 'Brands',
          singular: 'Brand',
          icon: Tag,
          defaultItems: DEFAULT_BRANDS,
          apiEndpoint: '/master-data/brands',
          storageKey: 'fams_custom_brands'
        };
      case 'uom':
        return {
          title: 'Units of Measure (UOM)',
          singular: 'Unit of Measure',
          icon: Scale,
          defaultItems: DEFAULT_UOM,
          apiEndpoint: '/master-data/uoms',
          storageKey: 'fams_custom_uoms'
        };
      case 'status-codes':
        return {
          title: 'Asset Status Codes',
          singular: 'Status Code',
          icon: ShieldCheck,
          defaultItems: DEFAULT_STATUS_CODES,
          apiEndpoint: null
        };
      case 'asset-types':
        return {
          title: 'Asset Types',
          singular: 'Asset Type',
          icon: Box,
          defaultItems: DEFAULT_ASSET_TYPES,
          apiEndpoint: '/master-data/asset-types',
          storageKey: 'fams_custom_asset_types'
        };
      default:
        return {
          title: tabName || 'Master Entity',
          singular: 'Entity',
          icon: Box,
          defaultItems: DEFAULT_MANUFACTURERS,
          apiEndpoint: null
        };
    }
  }, [activeTab, tabName]);

  // Load records
  const loadRecords = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'uom') {
        const res = await api.get('/master-data/uoms').catch(() => null);
        let custom = JSON.parse(localStorage.getItem('fams_custom_uoms') || '[]');
        let serverUoms = [];
        if (res?.uoms && res.uoms.length > 0) {
          serverUoms = res.uoms.map((u) => ({
            id: u.id,
            code: u.code,
            name: u.name,
            symbol: u.symbol || '',
            category: u.category || 'Discrete Count',
            description: u.description || '',
            status: u.active === false ? 'Inactive' : 'Active'
          }));
        }
        const serverKeys = new Set(serverUoms.map(x => (x.code || x.name || '').toUpperCase().trim()));
        const missingCustom = custom.filter(c => !serverKeys.has((c.code || c.name || '').toUpperCase().trim()));
        const combined = [...serverUoms, ...missingCustom];
        console.log('📋 [Dynamic UOM Records Loaded from Database]:', combined);
        setItems(combined);
        setSelectedItem(combined[0] || null);
        return;
      }
      if (activeTab === 'brands') {
        const res = await api.get('/master-data/brands').catch(() => null);
        let custom = JSON.parse(localStorage.getItem('fams_custom_brands') || '[]');
        let serverBrands = [];
        if (res?.brands && res.brands.length > 0) {
          serverBrands = res.brands.map((b) => ({
            id: b.id,
            code: b.code || `BRD-${(b.name || '').substring(0, 4).toUpperCase()}`,
            name: b.name,
            manufacturerName: b.manufacturerName || '',
            description: b.description || '',
            status: b.active === false ? 'Inactive' : 'Active',
            totalAssets: b.totalAssets || 0
          }));
        }
        const serverKeys = new Set(serverBrands.map(x => (x.code || x.name || '').toUpperCase().trim()));
        const missingCustom = custom.filter(c => !serverKeys.has((c.code || c.name || '').toUpperCase().trim()));
        const rawCombined = [...serverBrands, ...missingCustom];
        const seen = new Set();
        const combined = rawCombined.filter(it => {
          const key = (it.code || it.name || '').toUpperCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(combined);
        setSelectedItem(combined[0] || null);
        return;
      }

      if (activeTab === 'status-codes') {
        const custom = JSON.parse(localStorage.getItem('fams_custom_status_codes') || '[]');
        setItems(custom);
        setSelectedItem(custom[0] || null);
        return;
      }

    if (activeTab === 'asset-types') {

        const res = await api.get('/master-data/asset-types').catch(() => null);
        let custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
        // Clean out test record from localStorage
        if (custom.some(c => c.code === '123' || (c.name || '').toLowerCase() === 'abhay')) {
          custom = custom.filter(c => c.code !== '123' && (c.name || '').toLowerCase() !== 'abhay');
          try { localStorage.setItem('fams_custom_asset_types', JSON.stringify(custom)); } catch (_) {}
        }
        let serverTypes = [];
        if (res?.assetTypes && res.assetTypes.length > 0) {
          serverTypes = res.assetTypes.map((t, idx) => ({
            id: t.id,
            code: t.code || `TYPE-${(t.name || '').substring(0, 4).toUpperCase()}`,
            name: t.name,
            symbol: t.code || 'TYPE',
            category: t.category || 'Discrete Count',
            stage: t.stage || (t.isSystem ? 'SYSTEM' : 'Operational'),
            description: t.description || '',
            isSystem: Boolean(t.isSystem),
            status: t.active === false ? 'Inactive' : 'Active',
            totalAssets: t.totalAssets || 0
          }));
        }

        const serverKeys = new Set(serverTypes.map(x => (x.code || x.name || '').toUpperCase().trim()));
        const missingCustom = custom.filter(c => !serverKeys.has((c.code || c.name || '').toUpperCase().trim()));
        const rawCombined = [...serverTypes, ...missingCustom];

        // Deduplicate strictly by code and name
        const seen = new Set();
        const combined = rawCombined.filter(it => {
          const key = (it.code || it.name || '').toUpperCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setItems(combined);
        setSelectedItem(combined[0] || null);
        return;
      }
      if (tabConfig.apiEndpoint) {
        const res = await api.get(tabConfig.apiEndpoint).catch(() => null);
        const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
        const deletedMfrs = new Set(
          (JSON.parse(localStorage.getItem('fams_deleted_manufacturers') || '[]')).map(x => String(x).toLowerCase().trim())
        );
        let mapped = [];
        if (res?.manufacturers && Array.isArray(res.manufacturers)) {
          mapped = res.manufacturers
            .filter(m => {
              const id = String(m.id || '').toLowerCase().trim();
              const code = String(m.code || '').toLowerCase().trim();
              const name = String(m.name || '').toLowerCase().trim();
              return !deletedMfrs.has(id) && !deletedMfrs.has(code) && !deletedMfrs.has(name);
            })
            .map((m) => ({
              id: m.id,
              code: m.code || `MFG-${(m.name || '').substring(0, 4).toUpperCase()}`,
              name: m.name,
              website: m.website || '',
              supportContact: m.supportContact || '',
              country: m.country || 'Global',
              status: m.active === false ? 'Inactive' : 'Active',
              totalAssets: m.totalAssets || 0
            }));
        }
        const serverKeys = new Set(mapped.map(x => (x.code || x.name || '').toUpperCase().trim()));
        const missingCustom = custom.filter(c => {
          const id = String(c.id || '').toLowerCase().trim();
          const code = String(c.code || '').toLowerCase().trim();
          const name = String(c.name || '').toLowerCase().trim();
          if (deletedMfrs.has(id) || deletedMfrs.has(code) || deletedMfrs.has(name)) return false;
          return !serverKeys.has((c.code || c.name || '').toUpperCase().trim());
        });
        const rawCombined = [...mapped, ...missingCustom];
        const seen = new Set();
        const combined = rawCombined.filter(it => {
          const key = (it.code || it.name || '').toUpperCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(combined);
        setSelectedItem(combined[0] || null);
        return;
      }
      setItems(tabConfig.defaultItems);
      setSelectedItem(tabConfig.defaultItems[0]);
    } catch (err) {
      setItems(tabConfig.defaultItems);
      setSelectedItem(tabConfig.defaultItems[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    fetchRealManufacturers();
    setSearchQuery('');
    setStatusFilter('All');
  }, [activeTab]);

  // External trigger handler
  const handleOpenAddModal = (itemToEdit = null) => {
    fetchRealManufacturers();
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormState({
        code: itemToEdit.code || '',
        name: itemToEdit.name || '',
        manufacturerName: itemToEdit.manufacturerName || '',
        website: itemToEdit.website || '',
        supportContact: itemToEdit.supportContact || '',
        country: itemToEdit.country || 'United States',
        symbol: itemToEdit.symbol || '',
        category: itemToEdit.category || 'Discrete Count',
        stage: itemToEdit.stage || 'Operational',
        color: itemToEdit.color || 'emerald',
        description: itemToEdit.description || '',
        status: itemToEdit.status || 'Active'
      });
    } else {
      setEditingItem(null);
      setFormState({
        code: '',
        name: '',
        manufacturerName: '',
        website: '',
        supportContact: '',
        country: 'United States',
        symbol: '',
        category: 'Discrete Count',
        stage: 'Operational',
        color: 'emerald',
        description: '',
        status: 'Active'
      });
    }
    setShowAddModal(true);
  };

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.name.trim()) return;

    const cleanName = (formState.name || '').trim();
    const cleanCode = (formState.code || '').trim().toUpperCase();

    // STRICT DUPLICATE VALIDATION: Code & Name must be unique
    const isDuplicate = items.some((it) => {
      if (editingItem && it.id === editingItem.id) return false;
      const codeMatches = cleanCode && (it.code || '').trim().toUpperCase() === cleanCode;
      const nameMatches = cleanName && (it.name || '').trim().toLowerCase() === cleanName.toLowerCase();
      return codeMatches || nameMatches;
    });

    if (isDuplicate) {
      triggerToast && triggerToast(`Duplicate Error: A ${tabConfig.singular.toLowerCase()} with code "${cleanCode}" or name "${cleanName}" already exists.`);
      return;
    }

    try {

      if (editingItem) {
        if (activeTab === 'uom') {
          console.log('✏️ [Updating UOM in Frontend]:', { id: editingItem.id, ...formState });
          api.put(`/master-data/uoms/${editingItem.id}`, {
            ...formState,
            active: formState.status === 'Active'
          }).then((res) => {
            console.log('✅ [UOM Updated Successfully in Database]:', res?.data || res);
          }).catch((err) => console.warn('Failed to update UOM:', err));
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_uoms') || '[]');
            localStorage.setItem('fams_custom_uoms', JSON.stringify(custom.map(c => c.id === editingItem.id ? { ...c, ...formState } : c)));
          } catch (_) {}
        }
        if (activeTab === 'brands') {
          api.put(`/master-data/brands/${editingItem.id}`, {
            ...formState,
            active: formState.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_brands') || '[]');
            localStorage.setItem('fams_custom_brands', JSON.stringify(custom.map(c => c.id === editingItem.id ? { ...c, ...formState } : c)));
          } catch (_) {}
        }
        if (activeTab === 'manufacturers') {
          api.put(`/master-data/manufacturers/${editingItem.id}`, {
            ...formState,
            active: formState.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
            localStorage.setItem('fams_custom_manufacturers', JSON.stringify(custom.map(c => c.id === editingItem.id ? { ...c, ...formState } : c)));
          } catch (_) {}
        }
        const updated = items.map((it) => (it.id === editingItem.id ? { ...it, ...formState } : it));
        setItems(updated);
        if (selectedItem?.id === editingItem.id) setSelectedItem({ ...selectedItem, ...formState });
        triggerToast && triggerToast(`${tabConfig.singular} "${formState.name}" updated successfully.`);
      } else {
        const newItem = {
          id: Date.now().toString(),
          code: formState.code ? formState.code.toUpperCase() : `${formState.name.substring(0, 3).toUpperCase()}-01`,
          ...formState,
          totalAssets: 0
        };
        const updated = [newItem, ...items];
        setItems(updated);
        setSelectedItem(newItem);
        if (activeTab === 'uom') {
          console.log('🚀 [Adding New UOM in Frontend]:', {
            id: newItem.id,
            code: newItem.code,
            name: newItem.name,
            symbol: newItem.symbol || '',
            category: newItem.category || 'Discrete Count',
            description: newItem.description || '',
            status: newItem.status
          });

          api.post('/master-data/uoms', {
            code: newItem.code,
            name: newItem.name,
            symbol: newItem.symbol || '',
            category: newItem.category || 'Discrete Count',
            description: newItem.description || '',
            active: newItem.status === 'Active'
          }).then((res) => {
            console.log('✅ [UOM Created Successfully in Database]:', res?.data || res);
          }).catch((err) => {
            console.error('❌ Failed to save UOM to backend:', err);
          });

          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_uoms') || '[]');
            localStorage.setItem('fams_custom_uoms', JSON.stringify([newItem, ...custom]));
          } catch (_) {}
        }
        if (activeTab === 'asset-types') {
          api.post('/master-data/asset-types', {
            code: newItem.code,
            name: newItem.name,
            description: newItem.description,
            category: newItem.category || 'Discrete Count',
            stage: newItem.stage || 'Operational',
            active: newItem.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
            localStorage.setItem('fams_custom_asset_types', JSON.stringify([newItem, ...custom]));
          } catch (_) {}
        }
        if (activeTab === 'brands') {
          api.post('/master-data/brands', {
            code: newItem.code,
            name: newItem.name,
            manufacturerName: newItem.manufacturerName || '',
            description: newItem.description || '',
            active: newItem.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_brands') || '[]');
            localStorage.setItem('fams_custom_brands', JSON.stringify([newItem, ...custom]));
          } catch (_) {}
        }
        if (activeTab === 'manufacturers') {
          try {
            const res = await api.post('/master-data/manufacturers', {
              code: newItem.code,
              name: newItem.name,
              website: newItem.website,
              supportContact: newItem.supportContact,
              active: newItem.status === 'Active'
            });
            if (res?.manufacturer?.id) {
              newItem.id = res.manufacturer.id;
            }
          } catch (err) {
            console.warn('Saved locally:', err);
          }
          try {
            const deletedMfrs = JSON.parse(localStorage.getItem('fams_deleted_manufacturers') || '[]');
            const cleanedDeleted = deletedMfrs.filter(x => {
              const str = String(x).toLowerCase().trim();
              return str !== String(newItem.id).toLowerCase() &&
                     str !== String(newItem.code).toLowerCase() &&
                     str !== String(newItem.name).toLowerCase();
            });
            localStorage.setItem('fams_deleted_manufacturers', JSON.stringify(cleanedDeleted));
            const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
            localStorage.setItem('fams_custom_manufacturers', JSON.stringify([newItem, ...custom]));
          } catch (_) {}
          fetchRealManufacturers();
        }
        if (activeTab === 'status-codes') {
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_status_codes') || '[]');
            const idx = custom.findIndex(c => c.id === newItem.id);
            if (idx >= 0) custom[idx] = newItem;
            else custom.unshift(newItem);
            localStorage.setItem('fams_custom_status_codes', JSON.stringify(custom));
          } catch (_) {}
        }
        triggerToast && triggerToast(`${tabConfig.singular} "${formState.name}" created successfully.`);
      }
      setShowAddModal(false);
    } catch (err) {
      triggerToast && triggerToast(`Failed to save ${tabConfig.singular.toLowerCase()}.`);
    }
  };

  // Delete handler
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id;
    const targetCode = (itemToDelete.code || '').trim().toUpperCase();
    const targetName = (itemToDelete.name || '').trim().toLowerCase();

    const updated = items.filter((it) => it.id !== targetId);
    setItems(updated);
    if (selectedItem?.id === targetId) {
      setSelectedItem(updated[0] || null);
    }
    if (activeTab === 'uom') {
      console.log('🗑️ [Deleting UOM in Frontend]:', itemToDelete);
      api.delete(`/master-data/uoms/${targetId}`).then((res) => {
        console.log('✅ [UOM Deleted Successfully from Database]:', {
          id: targetId,
          code: targetCode,
          name: targetName,
          response: res?.data || res
        });
      }).catch((err) => {
        console.error('❌ Failed to delete UOM from backend:', err);
      });
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_uoms') || '[]');
        localStorage.setItem(
          'fams_custom_uoms',
          JSON.stringify(
            custom.filter(c =>
              c.id !== targetId &&
              (c.code || '').trim().toUpperCase() !== targetCode &&
              (c.name || '').trim().toLowerCase() !== targetName
            )
          )
        );
      } catch (_) {}
    }
    if (activeTab === 'asset-types') {
      api.delete(`/master-data/asset-types/${targetId}`).catch(() => null);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
        localStorage.setItem(
          'fams_custom_asset_types',
          JSON.stringify(
            custom.filter(c =>
              c.id !== targetId &&
              (c.code || '').trim().toUpperCase() !== targetCode &&
              (c.name || '').trim().toLowerCase() !== targetName
            )
          )
        );
      } catch (_) {}
    }
    if (activeTab === 'brands') {
      api.delete(`/master-data/brands/${targetId}`).catch(() => null);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_brands') || '[]');
        localStorage.setItem(
          'fams_custom_brands',
          JSON.stringify(
            custom.filter(c =>
              c.id !== targetId &&
              (c.code || '').trim().toUpperCase() !== targetCode &&
              (c.name || '').trim().toLowerCase() !== targetName
            )
          )
        );
        const deletedBrands = JSON.parse(localStorage.getItem('fams_deleted_brands') || '[]');
        deletedBrands.push(targetId);
        if (targetCode) deletedBrands.push(targetCode);
        if (targetName) deletedBrands.push(targetName);
        localStorage.setItem('fams_deleted_brands', JSON.stringify([...new Set(deletedBrands)]));
      } catch (_) {}
    }
    if (activeTab === 'manufacturers') {
      api.delete(`/master-data/manufacturers/${targetId}`).catch((err) => console.warn('Delete mfr err:', err));
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
        localStorage.setItem(
          'fams_custom_manufacturers',
          JSON.stringify(
            custom.filter(c =>
              c.id !== targetId &&
              (c.code || '').trim().toUpperCase() !== targetCode &&
              (c.name || '').trim().toLowerCase() !== targetName
            )
          )
        );
        const deletedMfrs = JSON.parse(localStorage.getItem('fams_deleted_manufacturers') || '[]');
        deletedMfrs.push(targetId);
        if (targetCode) deletedMfrs.push(targetCode);
        if (targetName) deletedMfrs.push(targetName);
        localStorage.setItem('fams_deleted_manufacturers', JSON.stringify([...new Set(deletedMfrs)]));
      } catch (_) {}
      fetchRealManufacturers();
    }
    if (activeTab === 'status-codes') {
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_status_codes') || '[]');
        localStorage.setItem(
          'fams_custom_status_codes',
          JSON.stringify(
            custom.filter(c =>
              c.id !== targetId &&
              (c.code || '').trim().toUpperCase() !== targetCode &&
              (c.name || '').trim().toLowerCase() !== targetName
            )
          )
        );
      } catch (_) {}
    }
    triggerToast && triggerToast(`${tabConfig.singular} "${itemToDelete.name}" deleted.`);
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Filtered records
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        it.name.toLowerCase().includes(q) ||
        (it.code && it.code.toLowerCase().includes(q)) ||
        (it.description && it.description.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || it.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const IconComponent = tabConfig.icon;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${tabConfig.title.toLowerCase()} by code, name or description...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="w-full md:w-44 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
          >
            Reset
          </button>

          <button
            onClick={loadRecords}
            disabled={isLoading}
            title="Refresh records"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#6C2BD9] transition-colors cursor-pointer"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-[#6C2BD9]")} />
          </button>
        </div>
      </div>

      {/* Main Grid: Records List + Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-[#6C2BD9]" />
                <span>{tabConfig.title} List</span>
              </h2>
              <p className="text-xs text-slate-500">Showing active and configured enterprise records.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {filteredItems.length} Records
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Name</th>
                  {activeTab === 'manufacturers' && <th className="py-3 px-3">Support Contact</th>}
                  {activeTab === 'manufacturers' && <th className="py-3 px-3">Country</th>}
                  {activeTab === 'brands' && <th className="py-3 px-3">Manufacturer</th>}
                  {activeTab === 'brands' && <th className="py-3 px-3">Description</th>}
                  {activeTab === 'uom' && <th className="py-3 px-3 text-center">Symbol</th>}
                  {activeTab === 'uom' && <th className="py-3 px-3">Category</th>}
                  {activeTab === 'status-codes' && <th className="py-3 px-3">Lifecycle Stage</th>}
                  {activeTab === 'status-codes' && <th className="py-3 px-3 text-center">Badge Preview</th>}
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching {tabConfig.title.toLowerCase()} found. Click "Add {tabConfig.singular}" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={clsx(
                          'hover:bg-purple-50/40 transition-colors cursor-pointer',
                          isSelected && 'bg-purple-50/70 font-semibold'
                        )}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{item.code || '-'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                        {activeTab === 'manufacturers' && (
                          <td className="py-2.5 px-3 text-slate-600">
                            {item.supportContact ? (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{item.supportContact}</span>
                              </span>
                            ) : '-'}
                          </td>
                        )}
                        {activeTab === 'manufacturers' && (
                          <td className="py-2.5 px-3 text-slate-600">{item.country || 'Global'}</td>
                        )}
                        {activeTab === 'brands' && (
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {item.manufacturerName || <span className="text-slate-300 italic">None</span>}
                          </td>
                        )}
                        {activeTab === 'brands' && (
                          <td className="py-2.5 px-3 text-slate-500 max-w-[240px] truncate">
                            {item.description || '-'}
                          </td>
                        )}
                        {activeTab === 'uom' && (
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#6C2BD9]">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200">
                              {item.symbol || item.code}
                            </span>
                          </td>
                        )}
                        {activeTab === 'uom' && (
                          <td className="py-2.5 px-3 text-slate-600">{item.category || 'Discrete'}</td>
                        )}
                        {activeTab === 'status-codes' && (
                          <td className="py-2.5 px-3 text-slate-600">{item.stage || 'Operational'}</td>
                        )}
                        {activeTab === 'status-codes' && (
                          <td className="py-2.5 px-3 text-center">
                            <span className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              item.color === 'emerald' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              item.color === 'blue' && 'bg-blue-50 text-blue-700 border-blue-200',
                              item.color === 'purple' && 'bg-purple-50 text-purple-700 border-purple-200',
                              item.color === 'amber' && 'bg-amber-50 text-amber-700 border-amber-200',
                              item.color === 'indigo' && 'bg-indigo-50 text-indigo-700 border-indigo-200',
                              item.color === 'slate' && 'bg-slate-100 text-slate-700 border-slate-300',
                              item.color === 'rose' && 'bg-rose-50 text-rose-700 border-rose-200'
                            )}>
                              {item.name}
                            </span>
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              item.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            )}
                          >
                            {item.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {item.isSystem ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Protected System Enumeration (Cannot be modified or deleted via UI)">
                              <Lock className="w-2.5 h-2.5" /> System Enum
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenAddModal(item)}
                                title="Edit Record"
                                className="p-1 hover:bg-purple-100 rounded text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setItemToDelete(item);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Record"
                                className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Card Right Column */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100 font-bold">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{selectedItem.name}</h3>
                    <span className="font-mono text-xs text-[#6C2BD9] font-bold">{selectedItem.code || '-'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAddModal(selectedItem)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-[#6C2BD9] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {selectedItem.description && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Description</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                {selectedItem.website && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Website</span>
                    </span>
                    <a
                      href={selectedItem.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6C2BD9] font-mono hover:underline truncate max-w-[180px]"
                    >
                      {selectedItem.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {selectedItem.supportContact && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Support</span>
                    </span>
                    <span className="text-slate-800 font-mono">{selectedItem.supportContact}</span>
                  </div>
                )}

                {selectedItem.category && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-semibold">Category Type</span>
                    <span className="font-semibold text-slate-900">{selectedItem.category}</span>
                  </div>
                )}

                {selectedItem.stage && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-semibold">Lifecycle Stage</span>
                    <span className="font-semibold text-slate-900">{selectedItem.stage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Status</span>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    selectedItem.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  )}>
                    {selectedItem.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a record from the table to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add / Edit Record */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingItem ? `Edit ${tabConfig.singular}` : `Add New ${tabConfig.singular}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tabConfig.singular} Code
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MFG-CISCO"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tabConfig.singular} Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Cisco Systems"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              {activeTab === 'manufacturers' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formState.website}
                      onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                      placeholder="https://www.example.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Email / Phone</label>
                    <input
                      type="text"
                      value={formState.supportContact}
                      onChange={(e) => setFormState({ ...formState, supportContact: e.target.value })}
                      placeholder="support@example.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'brands' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Manufacturer <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">From Manufacturer Master</span>
                  </div>
                  <select
                    value={formState.manufacturerName || ''}
                    onChange={(e) => {
                      const sel = realManufacturers.find(m => m.name === e.target.value);
                      setFormState({
                        ...formState,
                        manufacturerName: e.target.value,
                        manufacturerId: sel?.id || ''
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer font-medium text-slate-800"
                  >
                    <option value="">-- Select Manufacturer --</option>
                    {realManufacturers.map((m) => (
                      <option key={m.id || m.code || m.name} value={m.name}>
                        {m.name} {m.country && m.country !== 'Global' ? `(${m.country})` : ''}
                      </option>
                    ))}
                  </select>
                  {realManufacturers.length === 0 ? (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>No manufacturers defined yet. Add manufacturers in the Manufacturers tab to link them here.</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Real manufacturers configured in your Manufacturer Master.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'uom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Display Symbol</label>
                    <input
                      type="text"
                      value={formState.symbol}
                      onChange={(e) => setFormState({ ...formState, symbol: e.target.value })}
                      placeholder="e.g. ea, m, kg"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UOM Category</label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Discrete Count">Discrete Count</option>
                      <option value="Dimension">Dimension / Length</option>
                      <option value="Weight">Weight / Mass</option>
                      <option value="Volume">Volume / Liquid</option>
                      <option value="Packaging">Packaging</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'status-codes' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lifecycle Stage</label>
                    <select
                      value={formState.stage}
                      onChange={(e) => setFormState({ ...formState, stage: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Inventory">Inventory / Storage</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Logistics">Logistics / Transit</option>
                      <option value="Allocation">Allocation / Requisition</option>
                      <option value="Retirement">Retirement / Disposal</option>
                      <option value="Audit Alert">Audit Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Badge Color</label>
                    <select
                      value={formState.color}
                      onChange={(e) => setFormState({ ...formState, color: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="emerald">Emerald (Green)</option>
                      <option value="blue">Blue (Primary)</option>
                      <option value="purple">Purple (Maintenance)</option>
                      <option value="amber">Amber (Transit / Warning)</option>
                      <option value="indigo">Indigo (Reserved)</option>
                      <option value="rose">Rose (Alert / Missing)</option>
                      <option value="slate">Slate (Retired / Archive)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Enter details, rules, or operational specifications..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete {tabConfig.singular}?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete.name}"</span>? This will remove this master data definition.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
