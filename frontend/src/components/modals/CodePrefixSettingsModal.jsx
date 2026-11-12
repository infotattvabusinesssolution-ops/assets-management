import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { fetchCodePrefixes, updateLocalPrefixes, getCachedPrefix } from '../../services/codePrefixService';
import {
  Settings,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Building2,
  MapPin,
  Tag,
  Truck,
  Users2
} from 'lucide-react';

const ENTITY_GROUPS = [
  {
    groupId: 'org',
    groupName: 'Organization Masters',
    icon: Building2,
    entities: [
      { key: 'company', label: 'Company', defaultPrefix: 'CMP-', description: 'Legal entities and operating corporate units' },
      { key: 'department', label: 'Department', defaultPrefix: 'DEP-', description: 'Operational divisions and departments' },
      { key: 'cost_center', label: 'Section', defaultPrefix: 'SEC-', description: 'Financial sections and cost center codes' },
      { key: 'employee', label: 'Custodian / Employee', defaultPrefix: 'EMP-', description: 'Asset custodians and employees' }
    ]
  },
  {
    groupId: 'locations',
    groupName: 'Location Hierarchy',
    icon: MapPin,
    entities: [
      { key: 'site', label: 'Location (Site)', defaultPrefix: 'LOC-', description: 'Primary physical location sites and campuses' },
      { key: 'location_level_1', label: 'Location Level 1', defaultPrefix: 'LOC-L1-', description: 'Primary hierarchy tier (Level 1)' },
      { key: 'location_level_2', label: 'Location Level 2', defaultPrefix: 'LOC-L2-', description: 'Secondary hierarchy tier (Level 2)' },
      { key: 'location_level_3', label: 'Location Level 3', defaultPrefix: 'LOC-L3-', description: 'Tertiary hierarchy tier (Level 3)' },
      { key: 'location_level_4', label: 'Location Level 4', defaultPrefix: 'LOC-L4-', description: 'Granular sub-location tier (Level 4)' }
    ]
  },
  {
    groupId: 'catalog',
    groupName: 'Catalog & Classification',
    icon: Tag,
    entities: [
      { key: 'item_master', label: 'Item Master', defaultPrefix: 'ITM-', description: 'Central catalog item SKUs and hardware models' },
      { key: 'asset_group', label: 'Asset Group', defaultPrefix: 'GRP-', description: 'Level 1 high-level asset group classification' },
      { key: 'asset_sub_group', label: 'Asset Sub-Group', defaultPrefix: 'ASG-', description: 'Level 2 sub-group classification' },
      { key: 'category', label: 'Category', defaultPrefix: 'CAT-', description: 'Level 3 asset category classification' },
      { key: 'sub_category', label: 'Sub-Category', defaultPrefix: 'SUB-', description: 'Level 4 detailed sub-category classification' }
    ]
  },
  {
    groupId: 'procurement',
    groupName: 'Manufacturers & Procurement',
    icon: Truck,
    entities: [
      { key: 'manufacturer', label: 'Manufacturer (OEM)', defaultPrefix: 'MFR-', description: 'Equipment manufacturers and OEMs' },
      { key: 'brand', label: 'Brand', defaultPrefix: 'BRD-', description: 'Equipment and product brand lines' },
      { key: 'supplier', label: 'Supplier / Vendor', defaultPrefix: 'SUP-', description: 'Approved suppliers, vendors, and service partners' }
    ]
  },
  {
    groupId: 'lifecycle',
    groupName: 'Lifecycle & Reference Masters',
    icon: Users2,
    entities: [
      { key: 'asset_condition', label: 'Condition', defaultPrefix: 'COND-', description: 'Physical ratings (New, Good, Fair, Damaged, Scrap)' },
      { key: 'disposal_status', label: 'Disposal Status', defaultPrefix: 'DISP-', description: 'Disposal stages (Scrapped, Sold, Donated, Written Off)' },
      { key: 'asset_type', label: 'Status Code', defaultPrefix: 'TYP-', description: 'Asset operational and lifecycle status descriptors' },
      { key: 'uom', label: 'Unit of Measure (UOM)', defaultPrefix: 'UOM-', description: 'Quantification units (Each, Set, Box, Meter, Kg)' }
    ]
  }
];

export function CodePrefixSettingsModal({ isOpen, onClose }) {
  const [prefixes, setPrefixes] = useState({});
  const [initialPrefixes, setInitialPrefixes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchPrefixes();
    }
  }, [isOpen]);

  const fetchPrefixes = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await api.get('/master-data/code-prefixes');
      const loaded = res?.prefixes || res?.data?.prefixes;
      if (loaded && typeof loaded === 'object') {
        setPrefixes(loaded);
        setInitialPrefixes(loaded);
        updateLocalPrefixes(loaded);
      }
    } catch (err) {
      console.warn('Failed to load code prefixes from backend:', err);
      // Fallback to default or cached prefixes
      const defaults = {};
      ENTITY_GROUPS.forEach(g => {
        g.entities.forEach(e => {
          defaults[e.key] = getCachedPrefix(e.key) || e.defaultPrefix;
        });
      });
      setPrefixes(defaults);
      setInitialPrefixes(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handlePrefixChange = (key, value) => {
    setPrefixes(prev => ({
      ...prev,
      [key]: value.toUpperCase().replace(/\s+/g, '')
    }));
  };

  const handleResetEntity = (key, defaultPrefix) => {
    setPrefixes(prev => ({
      ...prev,
      [key]: defaultPrefix
    }));
  };

  const handleResetAll = () => {
    const defaults = {};
    ENTITY_GROUPS.forEach(g => {
      g.entities.forEach(e => {
        defaults[e.key] = e.defaultPrefix;
      });
    });
    setPrefixes(defaults);
    setStatusMsg({ type: 'info', text: 'All prefixes have been reset to defaults. Click "Save Changes" to apply.' });
  };

  // Real-time conflict detector: maps each entity key to its conflict details if prefix is duplicated
  const duplicateMap = useMemo(() => {
    const usage = {}; // cleanPrefix -> Array<{ key, label }>
    ENTITY_GROUPS.forEach(g => {
      g.entities.forEach(ent => {
        const raw = prefixes[ent.key] !== undefined ? prefixes[ent.key] : ent.defaultPrefix;
        const norm = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
        const clean = norm ? (norm.endsWith('-') ? norm : `${norm}-`) : '';
        if (!clean) return;
        if (!usage[clean]) usage[clean] = [];
        usage[clean].push({ key: ent.key, label: ent.label });
      });
    });

    const conflicts = {}; // ent.key -> { prefix, conflictsWith: string[] }
    Object.entries(usage).forEach(([pfx, list]) => {
      if (list.length > 1) {
        list.forEach(item => {
          conflicts[item.key] = {
            prefix: pfx,
            conflictsWith: list.filter(other => other.key !== item.key).map(other => other.label)
          };
        });
      }
    });
    return conflicts;
  }, [prefixes]);

  const hasDuplicates = Object.keys(duplicateMap).length > 0;

  const emptyPrefixList = useMemo(() => {
    const list = [];
    ENTITY_GROUPS.forEach(g => {
      g.entities.forEach(ent => {
        const val = prefixes[ent.key] !== undefined ? prefixes[ent.key] : ent.defaultPrefix;
        if (!val || !val.trim()) {
          list.push(ent.label);
        }
      });
    });
    return list;
  }, [prefixes]);

  const hasEmptyPrefixes = emptyPrefixList.length > 0;

  const handleSave = async (e) => {
    e.preventDefault();

    if (hasDuplicates) {
      setStatusMsg({
        type: 'error',
        text: 'Cannot save: duplicate prefixes detected. Every master entity must have a unique prefix to avoid code collisions.'
      });
      return;
    }

    if (hasEmptyPrefixes) {
      setStatusMsg({
        type: 'error',
        text: `Cannot save: prefix cannot be empty for: ${emptyPrefixList.join(', ')}`
      });
      return;
    }

    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.put('/master-data/code-prefixes', { prefixes });
      const savedPrefixes = res?.prefixes || res?.data?.prefixes || prefixes;
      if (res && (res.success || res.prefixes)) {
        setInitialPrefixes(savedPrefixes);
        setPrefixes(savedPrefixes);
        updateLocalPrefixes(savedPrefixes);
        await fetchCodePrefixes(true);
        setStatusMsg({ type: 'success', text: 'Master code prefixes saved successfully! New records will use these prefixes.' });
        setTimeout(() => {
          setStatusMsg({ type: '', text: '' });
        }, 4000);
      } else {
        throw new Error(res?.message || 'Failed to update code prefixes.');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save prefixes. Please verify connection.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getCleanPrefix = (key, defaultPrefix) => {
    const val = prefixes[key] !== undefined ? prefixes[key] : defaultPrefix;
    return val;
  };

  const getPreviewCode = (prefix) => {
    const p = (prefix || '').trim();
    if (!p) return '001';
    return p.endsWith('-') ? `${p}001` : `${p}-001`;
  };

  // Filter groups and entities based on tab and search
  const filteredGroups = ENTITY_GROUPS.map(group => {
    if (activeTab !== 'all' && activeTab !== group.groupId) return null;
    const matchedEntities = group.entities.filter(ent => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const currentPrefix = (prefixes[ent.key] || ent.defaultPrefix).toLowerCase();
      return (
        ent.label.toLowerCase().includes(q) ||
        ent.key.toLowerCase().includes(q) ||
        ent.description.toLowerCase().includes(q) ||
        currentPrefix.includes(q)
      );
    });
    if (matchedEntities.length === 0) return null;
    return { ...group, entities: matchedEntities };
  }).filter(Boolean);

  const hasChanges = JSON.stringify(prefixes) !== JSON.stringify(initialPrefixes);

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden relative">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-purple-50/30 to-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900">Master Code Prefix Settings</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                  Autogeneration Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Define the prefix for each master entity code. When a user creates a record without manually entering a code, the system generates one automatically (e.g. <span className="font-mono text-purple-700 font-bold">DEP-001</span> for Department).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search master entity (e.g. Department, Section, Vendor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Masters
            </button>
            {ENTITY_GROUPS.map(g => (
              <button
                key={g.groupId}
                onClick={() => setActiveTab(g.groupId)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === g.groupId
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <g.icon className="w-3.5 h-3.5" />
                <span>{g.groupName.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Warning Banner */}
        {hasDuplicates && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">Duplicate code prefix detected!</span>{' '}
                <span className="text-rose-700">
                  Multiple master entities have been assigned identical prefixes. Every master entity must have a unique prefix to prevent asset code conflicts.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-200/80 text-rose-800 text-[11px] font-bold shrink-0">
              {Object.keys(duplicateMap).length} Conflicts
            </span>
          </div>
        )}

        {/* Status Notification Banner */}
        {statusMsg.text && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-150 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMsg.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg({ type: '', text: '' })} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading current master prefixes...</span>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No master entities found matching "{searchQuery}".
            </div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.groupId} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <group.icon className="w-4 h-4 text-purple-600" />
                  <span>{group.groupName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-medium">
                    {group.entities.length} entities
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.entities.map(ent => {
                    const currentVal = getCleanPrefix(ent.key, ent.defaultPrefix);
                    const isCustomized = currentVal !== ent.defaultPrefix;
                    const preview = getPreviewCode(currentVal);
                    const conflict = duplicateMap[ent.key];
                    const isDuplicate = !!conflict;
                    const isEmpty = (currentVal || '').trim() === '';

                    return (
                      <div
                        key={ent.key}
                        className={`bg-white border rounded-xl p-3.5 transition-all shadow-xs space-y-2.5 ${
                          isDuplicate
                            ? 'border-rose-400 bg-rose-50/25 ring-1 ring-rose-300'
                            : isEmpty
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-slate-200/90 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{ent.label}</h4>
                              {isDuplicate && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold border border-rose-200">
                                  Duplicate
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{ent.description}</p>
                          </div>
                          {isCustomized && (
                            <button
                              type="button"
                              onClick={() => handleResetEntity(ent.key, ent.defaultPrefix)}
                              title={`Reset to default (${ent.defaultPrefix})`}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 font-semibold cursor-pointer shrink-0 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Default</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Code Prefix
                            </label>
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => handlePrefixChange(ent.key, e.target.value)}
                              placeholder={ent.defaultPrefix}
                              className={`w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg uppercase focus:outline-none focus:ring-2 ${
                                isDuplicate
                                  ? 'bg-rose-50 border border-rose-400 text-rose-900 focus:ring-rose-500'
                                  : isEmpty
                                  ? 'bg-amber-50 border border-amber-400 text-amber-900 focus:ring-amber-500'
                                  : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-purple-500'
                              }`}
                            />
                          </div>

                          <div className="w-36 shrink-0">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Live Preview
                            </label>
                            <div className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg text-center truncate ${
                              isDuplicate
                                ? 'bg-rose-100 border border-rose-200 text-rose-800'
                                : 'bg-purple-50 border border-purple-200 text-purple-800'
                            }`}>
                              {preview}
                            </div>
                          </div>
                        </div>

                        {/* Inline Duplicate Alert */}
                        {isDuplicate && (
                          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold pt-0.5 animate-in fade-in">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>Conflict: "{conflict.prefix}" is also used by {conflict.conflictsWith.join(', ')}</span>
                          </div>
                        )}
                        {isEmpty && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold pt-0.5 animate-in fade-in">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            <span>Prefix cannot be empty.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || hasDuplicates || hasEmptyPrefixes || !hasChanges}
              title={
                hasDuplicates
                  ? 'Resolve duplicate prefixes before saving'
                  : hasEmptyPrefixes
                  ? 'Prefixes cannot be empty'
                  : !hasChanges
                  ? 'No changes to save'
                  : 'Save prefix settings'
              }
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Prefixes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Prefix Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
export default CodePrefixSettingsModal;
