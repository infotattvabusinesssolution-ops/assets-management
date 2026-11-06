import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Layers,
  Tag,
  FolderTree,
  Box,
  Package,
  QrCode,
  Barcode,
  Building2,
  Scale,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  X,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

// Dynamic Master Data State (strictly driven from database / master data screens)

export function ItemMasterTab({
  triggerToast,
  externalShowAddModal,
  setExternalShowAddModal,
  onNavigateTab
}) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Master Data Options for Cascading
  const [assetGroups, setAssetGroups] = useState([]);
  const [assetSubGroups, setAssetSubGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uoms, setUoms] = useState([]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    itemCode: '',
    itemName: '',
    supplierBarcode: '',
    description: '',
    assetGroupId: '',
    assetGroupName: '',
    assetSubGroupId: '',
    assetSubGroupName: '',
    categoryId: '',
    categoryName: '',
    subCategoryId: '',
    subCategoryName: '',
    manufacturerId: '',
    manufacturerName: '',
    brandId: '',
    brandName: '',
    model: '',
    uom: '',
    specifications: '',
    status: 'Active'
  });

  // Load items and related master data
  const loadItemMasters = async () => {
    setIsLoading(true);
    try {
      const [itemRes, grpRes, clsRes, subCatRes, catRes, mfrRes, uomRes, brandRes] = await Promise.all([
        api.get('/master-data/items?includeInactive=true').catch(() => null),
        api.get('/master-data/asset-groups?includeInactive=true').catch(() => null),
        api.get('/master-data/asset-classes?kind=CLASS').catch(() => null),
        api.get('/master-data/asset-classes?kind=SUBCATEGORY').catch(() => null),
        api.get('/master-data/categories').catch(() => null),
        api.get('/master-data/manufacturers').catch(() => null),
        api.get('/master-data/uoms').catch(() => null),
        api.get('/master-data/brands').catch(() => null)
      ]);

      const customItems = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
      const serverItems = (itemRes?.items && Array.isArray(itemRes.items)) ? itemRes.items : [];
      const mockIds = new Set(['itm-001', 'itm-002', 'itm-003']);
      const seenItemCodes = new Set();
      const mergedItems = [...customItems, ...serverItems]
        .filter(itm => !mockIds.has(itm.id))
        .filter(itm => {
          const c = (itm.itemCode || itm.id || '').toUpperCase().trim();
          if (!c || seenItemCodes.has(c)) return false;
          seenItemCodes.add(c);
          return true;
        });
      if (mergedItems.length > 0) {
        setItems(mergedItems);
        setSelectedItem(mergedItems[0] || null);
      }

      // Merge Asset Groups: Server + Local Custom
      const localGroups = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
      const serverGroups = grpRes?.assetGroups || [];
      const seenGroupNames = new Set();
      const mergedGroups = [...serverGroups, ...localGroups].filter(g => {
        const name = (g.name || g.code || '').trim().toLowerCase();
        if (!name || seenGroupNames.has(name)) return false;
        seenGroupNames.add(name);
        return true;
      });
      setAssetGroups(mergedGroups);

      // Merge Asset Subgroups (Classes): Server + Local Custom
      const localClasses = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      const serverClasses = clsRes?.assetClasses || [];
      const seenClassNames = new Set();
      const mergedClasses = [...serverClasses, ...localClasses].filter(c => {
        const name = (c.name || c.code || '').trim().toLowerCase();
        if (!name || seenClassNames.has(name)) return false;
        seenClassNames.add(name);
        return true;
      });
      setAssetSubGroups(mergedClasses);

      // Merge Categories: Server + Local Custom
      const localCats = JSON.parse(localStorage.getItem('fams_custom_categories') || '[]');
      const serverCats = catRes?.categories || [];
      const seenCatNames = new Set();
      const mergedCats = [...serverCats, ...localCats].filter(c => {
        const name = (c.name || c.code || '').trim().toLowerCase();
        if (!name || seenCatNames.has(name)) return false;
        seenCatNames.add(name);
        return true;
      });
      setCategories(mergedCats);

      // Merge Sub Categories: Server + Local Custom
      const localSubCats = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
      const serverSubCats = subCatRes?.assetClasses || [];
      const seenSubCatNames = new Set();
      const mergedSubCats = [...serverSubCats, ...localSubCats].filter(s => {
        const name = (s.name || s.code || '').trim().toLowerCase();
        if (!name || seenSubCatNames.has(name)) return false;
        seenSubCatNames.add(name);
        return true;
      });
      setSubCategories(mergedSubCats);

      // Merge Manufacturers: Server + Local Custom
      const localMfrs = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
      const serverMfrs = mfrRes?.manufacturers || [];
      const seenMfrs = new Set();
      const mergedMfrs = [...serverMfrs, ...localMfrs].filter(m => {
        const name = (m.name || m.code || '').trim().toLowerCase();
        if (!name || seenMfrs.has(name)) return false;
        seenMfrs.add(name);
        return true;
      });
      setManufacturers(mergedMfrs);

      // Merge Brands: Server + Local Custom
      const localBrands = JSON.parse(localStorage.getItem('fams_custom_brands') || '[]');
      const serverBrands = brandRes?.brands || [];
      const seenBrands = new Set();
      const mergedBrands = [...serverBrands, ...localBrands].filter(b => {
        const name = (b.name || b.code || '').trim().toLowerCase();
        if (!name || seenBrands.has(name)) return false;
        seenBrands.add(name);
        return true;
      });
      setBrands(mergedBrands);

      if (uomRes?.uoms) setUoms(uomRes.uoms);
    } catch (err) {
      console.warn('Failed to load item masters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItemMasters();
  }, []);

  useEffect(() => {
    if (externalShowAddModal) {
      handleOpenAddModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [externalShowAddModal]);

  // Derived Cascading Options for Add/Edit Modal (with graceful non-empty fallbacks)
  const availableModalSubGroups = useMemo(() => {
    if (!formState.assetGroupName) return assetSubGroups;
    const targetGroup = formState.assetGroupName.toLowerCase();
    const filtered = assetSubGroups.filter(sg => {
      const grp = (sg.groupName || '').toLowerCase();
      const desc = (sg.description || '').toLowerCase();
      return grp === targetGroup || desc.includes(`[group:${targetGroup}]`) || grp.includes(targetGroup);
    });
    // Return filtered matches; if none match this specific group, show all sub groups rather than empty list
    return filtered.length > 0 ? filtered : assetSubGroups;
  }, [assetSubGroups, formState.assetGroupName]);

  const availableModalCategories = useMemo(() => {
    if (!formState.assetSubGroupName && !formState.assetGroupName) return categories;
    const targetSubGroup = (formState.assetSubGroupName || '').toLowerCase();
    const targetGroup = (formState.assetGroupName || '').toLowerCase();

    const filtered = categories.filter(c => {
      const cls = (c.className || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const grp = (c.groupName || '').toLowerCase();
      if (targetSubGroup && (cls === targetSubGroup || desc.includes(`[class:${targetSubGroup}]`))) return true;
      if (targetGroup && (grp === targetGroup || desc.includes(`[group:${targetGroup}]`))) return true;
      return false;
    });
    // Return filtered categories; fallback to all categories if none match
    return filtered.length > 0 ? filtered : categories;
  }, [categories, formState.assetSubGroupName, formState.assetGroupName]);

  const availableModalSubCategories = useMemo(() => {
    if (!formState.categoryId && !formState.categoryName) return subCategories;
    const filtered = subCategories.filter(sc => {
      if (formState.categoryId && sc.categoryId === formState.categoryId) return true;
      if (formState.categoryName && (sc.category?.name === formState.categoryName || sc.categoryName === formState.categoryName)) return true;
      return false;
    });
    // Return filtered subcategories; fallback to all subcategories if none match
    return filtered.length > 0 ? filtered : subCategories;
  }, [subCategories, formState.categoryId, formState.categoryName]);

  // Derived Brands matching selected Manufacturer (or all brands if no manufacturer selected)
  const availableModalBrands = useMemo(() => {
    if (!formState.manufacturerName) return brands;
    const targetMfr = formState.manufacturerName.toLowerCase();
    const filtered = brands.filter(b => {
      const mfr = (b.manufacturerName || '').toLowerCase();
      return mfr === targetMfr || mfr.includes(targetMfr) || targetMfr.includes(mfr);
    });
    return filtered.length > 0 ? filtered : brands;
  }, [brands, formState.manufacturerName]);

  // Filtered Items for List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery ||
        (item.itemCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplierBarcode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brandName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.manufacturerName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && item.active !== false) ||
        (statusFilter === 'Inactive' && item.active === false);

      const matchesGroup = groupFilter === 'All' ||
        (item.assetGroupName || '').toLowerCase() === groupFilter.toLowerCase();

      const matchesCategory = categoryFilter === 'All' ||
        (item.categoryName || '').toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesGroup && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, groupFilter, categoryFilter]);

  // Auto-generate next item code preview (guarantee uniqueness above baseline defaults)
  const nextItemCodePreview = useMemo(() => {
    const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
    const baseline = ['ITM-000101', 'ITM-000102', 'ITM-000103', 'ITM-000104'];
    const allCodes = [
      ...items.map(i => i.itemCode || ''),
      ...custom.map(i => i.itemCode || ''),
      ...baseline
    ].filter(c => c.startsWith('ITM-'));

    let max = 100;
    for (const c of allCodes) {
      const num = parseInt(c.replace('ITM-', ''), 10);
      if (!isNaN(num) && num > max) max = num;
    }
    return `ITM-${String(max + 1).padStart(6, '0')}`;
  }, [items]);

  const handleOpenAddModal = (itemToEdit = null) => {
    setModalError('');
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormState({
        itemCode: itemToEdit.itemCode || '',
        itemName: itemToEdit.itemName || '',
        supplierBarcode: itemToEdit.supplierBarcode || '',
        description: itemToEdit.description || '',
        assetGroupId: itemToEdit.assetGroupId || '',
        assetGroupName: itemToEdit.assetGroupName || '',
        assetSubGroupId: itemToEdit.assetSubGroupId || '',
        assetSubGroupName: itemToEdit.assetSubGroupName || '',
        categoryId: itemToEdit.categoryId || '',
        categoryName: itemToEdit.categoryName || '',
        subCategoryId: itemToEdit.subCategoryId || '',
        subCategoryName: itemToEdit.subCategoryName || '',
        manufacturerId: itemToEdit.manufacturerId || '',
        manufacturerName: itemToEdit.manufacturerName || '',
        brandId: itemToEdit.brandId || '',
        brandName: itemToEdit.brandName || '',
        model: itemToEdit.model || '',
        uom: itemToEdit.uom || 'Each',
        specifications: itemToEdit.specifications || '',
        status: itemToEdit.active === false ? 'Inactive' : 'Active'
      });
    } else {
      setEditingItem(null);
      setFormState({
        itemCode: nextItemCodePreview,
        itemName: '',
        supplierBarcode: '',
        description: '',
        assetGroupId: '',
        assetGroupName: '',
        assetSubGroupId: '',
        assetSubGroupName: '',
        categoryId: '',
        categoryName: '',
        subCategoryId: '',
        subCategoryName: '',
        manufacturerId: '',
        manufacturerName: '',
        brandId: '',
        brandName: '',
        model: '',
        uom: 'Each',
        specifications: '',
        status: 'Active'
      });
    }
    setShowAddModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const cleanName = (formState.itemName || '').trim();
    const cleanCode = (formState.itemCode || '').trim().toUpperCase();
    const cleanBarcode = (formState.supplierBarcode || '').trim();

    if (!cleanName) {
      setModalError('Item Name is required.');
      return;
    }

    // STRICT DUPLICATE VALIDATION: Item Code uniqueness
    if (cleanCode && items.some(i => i.id !== editingItem?.id && (i.itemCode || '').trim().toUpperCase() === cleanCode)) {
      setModalError(`An item with Item Code "${cleanCode}" already exists. Duplicate item codes are not allowed.`);
      return;
    }

    // STRICT DUPLICATE VALIDATION: Item Name uniqueness
    if (items.some(i => i.id !== editingItem?.id && (i.itemName || '').trim().toLowerCase() === cleanName.toLowerCase())) {
      setModalError(`An item with Item Name "${cleanName}" already exists. Duplicate item names are not allowed.`);
      return;
    }

    // STRICT DUPLICATE VALIDATION: Supplier Barcode uniqueness (if provided)
    if (cleanBarcode && items.some(i => i.id !== editingItem?.id && i.supplierBarcode && i.supplierBarcode.trim().toLowerCase() === cleanBarcode.toLowerCase())) {
      setModalError(`An item with Supplier Barcode "${cleanBarcode}" already exists. Supplier barcodes must be unique.`);
      return;
    }

    setIsSaving(true);
    setModalError('');

    try {
      const payload = {
        ...formState,
        active: formState.status === 'Active'
      };

      if (editingItem) {
        const res = await api.put(`/master-data/items/${editingItem.id}`, payload);
        const saved = res?.item || { ...editingItem, ...payload };
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
          localStorage.setItem('fams_custom_item_masters', JSON.stringify(custom.map(i => i.id === editingItem.id ? saved : i)));
        } catch (_) { }
        const updated = items.map(i => i.id === editingItem.id ? saved : i);
        setItems(updated);
        if (selectedItem?.id === editingItem.id) setSelectedItem(saved);
        triggerToast && triggerToast(`Item "${saved.itemName}" updated successfully.`);
      } else {
        const res = await api.post('/master-data/items', payload);
        const newItem = res?.item || { ...payload, id: `ITM-${Date.now()}` };
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
          localStorage.setItem('fams_custom_item_masters', JSON.stringify([newItem, ...custom.filter(c => c.id !== newItem.id)]));
        } catch (_) { }
        const updated = [newItem, ...items];
        setItems(updated);
        setSelectedItem(newItem);
        triggerToast && triggerToast(`Item "${newItem.itemName}" created successfully.`);
      }
      setShowAddModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save Item Master.';
      setModalError(msg);
      triggerToast && triggerToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item, e) => {
    e?.stopPropagation();
    const nextStatus = item.active === false ? true : false;
    try {
      await api.put(`/master-data/items/${item.id}`, { ...item, active: nextStatus }).catch(() => null);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
        localStorage.setItem('fams_custom_item_masters', JSON.stringify(custom.map(i => i.id === item.id ? { ...i, active: nextStatus } : i)));
      } catch (_) { }
      const updated = items.map(i => i.id === item.id ? { ...i, active: nextStatus } : i);
      setItems(updated);
      if (selectedItem?.id === item.id) setSelectedItem({ ...selectedItem, active: nextStatus });
      triggerToast && triggerToast(`Item "${item.itemName}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch {
      triggerToast && triggerToast('Failed to update item status.');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master-data/items/${itemToDelete.id}`).catch(err => {
        // If 404, it means item is already removed from backend or only in local state - proceed with deletion
        if (err?.response?.status === 404) return null;
        throw err;
      });
      // Purge from local storage custom items
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
        localStorage.setItem('fams_custom_item_masters', JSON.stringify(custom.filter(i => i.id !== itemToDelete.id)));
      } catch (_) { }

      const updated = items.filter(i => i.id !== itemToDelete.id);
      setItems(updated);
      if (selectedItem?.id === itemToDelete.id) setSelectedItem(updated[0] || null);
      triggerToast && triggerToast(`Item "${itemToDelete.itemName}" deleted successfully.`);
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          const custom = JSON.parse(localStorage.getItem('fams_custom_item_masters') || '[]');
          localStorage.setItem('fams_custom_item_masters', JSON.stringify(custom.filter(i => i.id !== itemToDelete.id)));
        } catch (_) { }
        const updated = items.filter(i => i.id !== itemToDelete.id);
        setItems(updated);
        if (selectedItem?.id === itemToDelete.id) setSelectedItem(updated[0] || null);
        triggerToast && triggerToast(`Item "${itemToDelete.itemName}" deleted successfully.`);
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);
      } else {
        triggerToast && triggerToast(err?.response?.data?.message || 'Failed to delete item.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by code, name, supplier barcode, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-44 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Group</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All Groups</option>
              {assetGroups.map(g => (
                <option key={g.id || g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-44 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-36 flex items-center gap-2">
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
        </div>
      </div>

      {/* Main Grid: Item List & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Items Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100/60 text-[#6C2BD9] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Item Master Catalogue</h3>
                <p className="text-[10px] text-slate-400 font-medium">Standard products reused across all purchase orders & registrations</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#6C2BD9] bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full">
              {filteredItems.length} Records
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#6C2BD9]" />
              <p className="text-xs font-semibold">Loading Item Master catalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Package className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-bold text-slate-700">No items found matching your filter</p>
              <button
                onClick={() => handleOpenAddModal(null)}
                className="text-xs text-[#6C2BD9] font-bold hover:underline"
              >
                + Define a new Item Master
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-2 text-center">#</th>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-3">Supplier Barcode</th>
                    <th className="py-3 px-3">Classification</th>
                    <th className="py-3 px-3">UOM</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, index) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={clsx(
                          'hover:bg-purple-50/40 cursor-pointer transition-colors group',
                          isSelected && 'bg-purple-50/70 font-semibold'
                        )}
                      >
                        <td className="py-3 px-2 text-center text-slate-400 text-[11px] font-medium">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#6C2BD9] bg-purple-100/70 px-2 py-0.5 rounded-md">
                            {item.itemCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#6C2BD9] transition-colors leading-snug">
                            {item.itemName}
                          </div>
                          {(item.brandName || item.manufacturerName || item.model) && (
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              {item.brandName && (
                                <span className="font-bold text-[#6C2BD9] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                                  {item.brandName}
                                </span>
                              )}
                              {item.manufacturerName && <span>{item.manufacturerName}</span>}
                              {item.model && <span>• {item.model}</span>}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {item.supplierBarcode ? (
                            <span className="font-mono text-[10px] text-slate-600 flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded">
                              <Barcode className="w-3 h-3 text-slate-400" />
                              {item.supplierBarcode}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px] italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px] font-medium text-slate-700">
                            {item.assetGroupName || 'General'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.categoryName || 'Uncategorized'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {item.uom || 'Each'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(item, e)}
                            className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold transition-all',
                              item.active !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            )}
                          >
                            {item.active !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(item)}
                              title="Edit Item Master"
                              className="p-1 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-100/60 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setItemToDelete(item);
                                setShowDeleteConfirmModal(true);
                              }}
                              title="Delete Item"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Inspection Details Drawer (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                    {selectedItem.itemCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedItem.itemName}</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal(selectedItem)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedItem.description}
                </div>
              )}

              {/* Master Mappings */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Classification Mapping
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Asset Group</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedItem.assetGroupName || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Asset Sub Group</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedItem.assetSubGroupName || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Category</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedItem.categoryName || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Sub Category</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedItem.subCategoryName || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">Unit of Measure</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedItem.uom || 'Each'}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Barcode & Hardware Specs */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Specifications & Identifiers
                </div>
                <div className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Supplier Barcode:</span>
                    <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      {selectedItem.supplierBarcode || 'Not assigned'}
                    </span>
                  </div>
                  {selectedItem.brandName && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100/60">
                      <span className="text-[#6C2BD9] font-bold">Brand:</span>
                      <span className="font-bold text-[#6C2BD9] bg-purple-100/80 px-2 py-0.5 rounded">{selectedItem.brandName}</span>
                    </div>
                  )}
                  {selectedItem.manufacturerName && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100/60">
                      <span className="text-slate-500 font-medium">Manufacturer:</span>
                      <span className="font-bold text-slate-800">{selectedItem.manufacturerName}</span>
                    </div>
                  )}
                  {selectedItem.model && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100/60">
                      <span className="text-slate-500 font-medium">Model:</span>
                      <span className="font-bold text-slate-800">{selectedItem.model}</span>
                    </div>
                  )}
                </div>

                {selectedItem.specifications && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                    {selectedItem.specifications}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">Select an item from the table to inspect details</p>
            </div>
          )}

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#6C2BD9] shrink-0" />
            <span>Items defined here automatically auto-fill classifications upon asset registration.</span>
          </div>
        </div>
      </div>

      {/* MODAL: Add / Edit Item Master */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingItem ? 'Edit Item Master' : 'Add New Item Master'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Product catalogue entry with locked classification mappings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Item Code <span className="text-purple-600 text-[10px]">(System Generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formState.itemCode}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supplier Barcode <span className="text-slate-400 text-[10px]">(UPC / EAN)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 019534827101"
                    value={formState.supplierBarcode}
                    onChange={(e) => setFormState({ ...formState, supplierBarcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lenovo ThinkPad T14 Gen 4"
                  value={formState.itemName}
                  onChange={(e) => setFormState({ ...formState, itemName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  required
                />
              </div>

              {/* Classification Hierarchical Dropdowns */}
              <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 space-y-3">
                <div className="text-[11px] font-bold text-[#6C2BD9] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Linked Classification</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Asset Group *</label>
                    <select
                      value={formState.assetGroupName}
                      onChange={(e) => {
                        const grp = assetGroups.find(g => g.name === e.target.value);
                        setFormState({
                          ...formState,
                          assetGroupName: e.target.value,
                          assetGroupId: grp?.id || '',
                          assetSubGroupName: '',
                          assetSubGroupId: '',
                          categoryName: '',
                          categoryId: ''
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                      required
                    >
                      <option value="">-- Select Group --</option>
                      {assetGroups.map(g => (
                        <option key={g.id || g.name} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Asset Sub Group</label>
                    <select
                      value={formState.assetSubGroupName}
                      onChange={(e) => {
                        const sg = assetSubGroups.find(s => s.name === e.target.value);
                        const parentGrpName = sg?.groupName || (sg?.description?.match(/\[group:([^\]]+)\]/)?.[1]) || formState.assetGroupName;
                        const parentGrp = assetGroups.find(g => g.name.toLowerCase() === (parentGrpName || '').toLowerCase());
                        setFormState({
                          ...formState,
                          assetSubGroupName: e.target.value,
                          assetSubGroupId: sg?.id || '',
                          assetGroupName: parentGrp ? parentGrp.name : formState.assetGroupName,
                          assetGroupId: parentGrp ? parentGrp.id : formState.assetGroupId
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select Sub Group --</option>
                      {availableModalSubGroups.map(sg => (
                        <option key={sg.id || sg.name} value={sg.name}>{sg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={formState.categoryName}
                      onChange={(e) => {
                        const cat = categories.find(c => c.name === e.target.value);
                        setFormState({
                          ...formState,
                          categoryName: e.target.value,
                          categoryId: cat?.id || '',
                          subCategoryName: '',
                          subCategoryId: ''
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select Category --</option>
                      {availableModalCategories.map(c => (
                        <option key={c.id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sub Category</label>
                    <select
                      value={formState.subCategoryName}
                      onChange={(e) => {
                        const sc = subCategories.find(s => s.name === e.target.value);
                        const parentCat = sc?.category?.name || categories.find(c => c.id === sc?.categoryId)?.name || formState.categoryName;
                        const parentCatObj = categories.find(c => c.name === parentCat);
                        setFormState({
                          ...formState,
                          subCategoryName: e.target.value,
                          subCategoryId: sc?.id || '',
                          categoryName: parentCat || formState.categoryName,
                          categoryId: parentCatObj?.id || formState.categoryId
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select Sub Category --</option>
                      {availableModalSubCategories.map(sc => (
                        <option key={sc.id || sc.name} value={sc.name}>{sc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Unit of Measure (UOM)</label>
                    <select
                      value={formState.uom}
                      onChange={(e) => setFormState({ ...formState, uom: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select UOM --</option>
                      {uoms.length > 0 ? (
                        uoms.map(u => (
                          <option key={u.id || u.code} value={u.name || u.code}>{u.name} ({u.code})</option>
                        ))
                      ) : (
                        <option value="" disabled>No UOMs configured</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Linked Manufacturer, Brand & Model */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Linked Manufacturer & Brand</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                    <select
                      value={formState.manufacturerName}
                      onChange={(e) => {
                        const mfr = manufacturers.find(m => m.name === e.target.value);
                        setFormState({
                          ...formState,
                          manufacturerName: e.target.value,
                          manufacturerId: mfr?.id || ''
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select Manufacturer --</option>
                      {manufacturers.map(m => (
                        <option key={m.id || m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                    <select
                      value={formState.brandName}
                      onChange={(e) => {
                        const brd = brands.find(b => b.name === e.target.value);
                        const autoMfr = brd?.manufacturerName || formState.manufacturerName;
                        const mfrObj = manufacturers.find(m => m.name === autoMfr);
                        setFormState({
                          ...formState,
                          brandName: e.target.value,
                          brandId: brd?.id || '',
                          manufacturerName: autoMfr,
                          manufacturerId: mfrObj?.id || formState.manufacturerId
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
                    >
                      <option value="">-- Select Brand --</option>
                      {availableModalBrands.map(b => (
                        <option key={b.id || b.name} value={b.name}>
                          {b.name} {b.manufacturerName ? `(${b.manufacturerName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model / Part No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 21HD0006US / ThinkPad T14"
                    value={formState.model}
                    onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              {/* Description & Technical Specs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Standard description of the product or item..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Specifications</label>
                <textarea
                  rows={2}
                  placeholder="e.g. CPU: i7-1365U | RAM: 32GB | SSD: 512GB"
                  value={formState.specifications}
                  onChange={(e) => setFormState({ ...formState, specifications: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formState.status || (formState.active !== false ? 'Active' : 'Inactive')}
                  onChange={(e) => setFormState({
                    ...formState,
                    status: e.target.value,
                    active: e.target.value === 'Active'
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer font-semibold text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#581c87] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Item Master</h3>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete?.itemName}"</span> ({itemToDelete?.itemCode})?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

