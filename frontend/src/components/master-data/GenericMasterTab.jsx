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
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';

export const DEFAULT_MANUFACTURERS = [];

export const DEFAULT_UOM = [
  { id: '1', code: 'EA', name: 'Each / Pieces', symbol: 'ea', category: 'Discrete Count', description: 'Individual units, parts, or pieces', status: 'Active' },
  { id: '2', code: 'SET', name: 'Set / Kit', symbol: 'set', category: 'Bundle', description: 'Coordinated set of multiple matched components', status: 'Active' },
  { id: '3', code: 'BOX', name: 'Box', symbol: 'box', category: 'Packaging', description: 'Standard packaged box containing components', status: 'Active' },
  { id: '4', code: 'PK', name: 'Pack', symbol: 'pk', category: 'Packaging', description: 'Blister pack or shrink-wrap container', status: 'Active' },
  { id: '5', code: 'MTR', name: 'Meter', symbol: 'm', category: 'Dimension', description: 'Metric linear length for cabling and rails', status: 'Active' },
  { id: '6', code: 'KG', name: 'Kilogram', symbol: 'kg', category: 'Weight', description: 'Metric mass for raw materials or bulk equipment', status: 'Active' },
  { id: '7', code: 'LTR', name: 'Liter', symbol: 'L', category: 'Volume', description: 'Liquid volume for lubricants, coolants and fluids', status: 'Active' },
  { id: '8', code: 'ROLL', name: 'Roll', symbol: 'rl', category: 'Dimension', description: 'Continuous roll of cable, wiring, or RFID labels', status: 'Active' }
];

export const DEFAULT_ASSET_TYPES = [];

export const DEFAULT_STATUS_CODES = [
  { id: '1', code: 'ACTIVE', name: 'In Service / Operational', stage: 'Operational', color: 'emerald', description: 'Asset is actively deployed, operating, and assigned.', status: 'Active' },
  { id: '2', code: 'IN_STORE', name: 'In Stock / Warehouse', stage: 'Inventory', color: 'blue', description: 'Asset is in warehouse, tested and ready for assignment.', status: 'Active' },
  { id: '3', code: 'UNDER_MAINTENANCE', name: 'Under Repair', stage: 'Maintenance', color: 'purple', description: 'Asset undergoing scheduled service or maintenance repair.', status: 'Active' },
  { id: '4', code: 'IN_TRANSIT', name: 'In Movement / Transfer', stage: 'Logistics', color: 'amber', description: 'Asset being physically moved between facilities or custodians.', status: 'Active' },
  { id: '5', code: 'RESERVED', name: 'Reserved / Allocated', stage: 'Allocation', color: 'indigo', description: 'Asset allocated to an upcoming project or requisition.', status: 'Active' },
  { id: '6', code: 'DISPOSED', name: 'Decommissioned / Retired', stage: 'Retirement', color: 'slate', description: 'Asset decommissioned, sold, recycled, or scrapped.', status: 'Active' },
  { id: '7', code: 'LOST_STOLEN', name: 'Missing / Lost', stage: 'Audit Alert', color: 'rose', description: 'Asset unaccounted for during inventory verification.', status: 'Active' }
];

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
      case 'uom':
        return {
          title: 'Units of Measure (UOM)',
          singular: 'Unit of Measure',
          icon: Scale,
          defaultItems: DEFAULT_UOM,
          apiEndpoint: null
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
      if (activeTab === 'asset-types') {

        const res = await api.get('/master-data/asset-types').catch(() => null);

        const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');

        let serverTypes = [];

        if (res?.assetTypes && res.assetTypes.length > 0) {

          serverTypes = res.assetTypes.map((t, idx) => ({

            id: t.id,

            code: t.code || `TYPE-${t.name.substring(0, 4).toUpperCase()}`,

            name: t.name,

            symbol: t.code || 'TYPE',

            category: 'General',

            description: t.description || '',

            status: t.active === false ? 'Inactive' : 'Active',

            totalAssets: (idx + 1) * 20

          }));

        }

        const existing = new Set([...custom, ...serverTypes].map(x => x.name.toLowerCase()));

        const extraDefaults = DEFAULT_ASSET_TYPES.filter(d => !existing.has(d.name.toLowerCase()));

        const combined = [...custom, ...serverTypes, ...extraDefaults];

        setItems(combined);

        setSelectedItem(combined[0]);

        return;

      }

      if (activeTab === 'manufacturers') {
        const res = await api.get('/master-data/manufacturers').catch(() => null);
        const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
        let serverMfrs = [];
        if (res?.manufacturers && res.manufacturers.length > 0) {
          serverMfrs = res.manufacturers.map((m, idx) => ({
            id: m.id,
            code: m.code || `MFG-${(m.name || 'MFR').substring(0, 4).toUpperCase()}`,
            name: m.name,
            website: m.website || '',
            supportContact: m.supportContact || '',
            country: m.country || 'Global',
            status: m.active === false ? 'Inactive' : 'Active',
            totalAssets: m.totalAssets || 0
          }));
        }
        const existingNames = new Set(serverMfrs.map((x) => (x.name || '').toLowerCase()));
        const missingCustom = custom.filter(c => !existingNames.has((c.name || '').toLowerCase()));
        const combined = [...missingCustom, ...serverMfrs];
        setItems(combined);
        setSelectedItem(combined[0] || null);
        return;
      }
      if (tabConfig.apiEndpoint) {
        const res = await api.get(tabConfig.apiEndpoint).catch(() => null);
        if (res?.manufacturers && res.manufacturers.length > 0) {
          const mapped = res.manufacturers.map((m, idx) => ({
            id: m.id,
            code: `MFG-${m.name.substring(0, 4).toUpperCase()}`,
            name: m.name,
            website: m.website || `https://www.${m.name.toLowerCase().replace(/\s+/g, '')}.com`,
            supportContact: m.supportContact || `support@${m.name.toLowerCase().replace(/\s+/g, '')}.com`,
            country: 'Global',
            status: m.active === false ? 'Inactive' : 'Active',
            totalAssets: (idx + 1) * 35
          }));
          const existingNames = new Set(mapped.map((x) => x.name.toLowerCase()));
          const extraDefaults = tabConfig.defaultItems.filter((d) => !existingNames.has(d.name.toLowerCase()));
          const combined = [...mapped, ...extraDefaults];
          setItems(combined);
          setSelectedItem(combined[0]);
          return;
        }
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
    setSearchQuery('');
    setStatusFilter('All');
  }, [activeTab]);

  // External trigger handler
  const handleOpenAddModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormState({
        code: itemToEdit.code || '',
        name: itemToEdit.name || '',
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
    if (addModalTrigger > 0 || externalShowAddModal) {
      handleOpenAddModal(null);
      if (setExternalShowAddModal) setExternalShowAddModal(false);
    }
  }, [addModalTrigger, externalShowAddModal]);

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.name) return;

    try {
      if (activeTab === 'manufacturers' && !editingItem) {
        await api.post('/master-data/manufacturers', {
          name: formState.name,
          website: formState.website,
          supportContact: formState.supportContact,
          active: formState.status === 'Active'
        }).catch((err) => console.warn('Saved locally:', err));
      }

      if (editingItem) {
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
        if (activeTab === 'asset-types') {
          api.post('/master-data/asset-types', {
            code: newItem.code,
            name: newItem.name,
            description: newItem.description,
            active: newItem.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
            localStorage.setItem('fams_custom_asset_types', JSON.stringify([newItem, ...custom]));
          } catch (_) {}
        }
        if (activeTab === 'manufacturers') {
          api.post('/master-data/manufacturers', {
            code: newItem.code,
            name: newItem.name,
            website: newItem.website,
            supportContact: newItem.supportContact,
            active: newItem.status === 'Active'
          }).catch(() => null);
          try {
            const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
            localStorage.setItem('fams_custom_manufacturers', JSON.stringify([newItem, ...custom]));
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
    const updated = items.filter((it) => it.id !== itemToDelete.id);
    setItems(updated);
    if (selectedItem?.id === itemToDelete.id) {
      setSelectedItem(updated[0] || null);
    }
    if (activeTab === 'asset-types') {
      api.delete(`/master-data/asset-types/${itemToDelete.id}`).catch(() => null);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
        localStorage.setItem('fams_custom_asset_types', JSON.stringify(custom.filter(c => c.id !== itemToDelete.id)));
      } catch (_) {}
    }
    if (activeTab === 'manufacturers') {
      api.delete(`/master-data/manufacturers/${itemToDelete.id}`).catch(() => null);
      try {
        const custom = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
        localStorage.setItem('fams_custom_manufacturers', JSON.stringify(custom.filter(c => c.id !== itemToDelete.id)));
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
              <button
                onClick={() => handleOpenAddModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add {tabConfig.singular}</span>
              </button>
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
                  {editingItem ? 'Save Changes' : `Create ${tabConfig.singular}`}
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
