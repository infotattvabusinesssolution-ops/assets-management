import { api } from './api';

export const DEFAULT_MASTER_PREFIXES = {
  department: 'DEP-',
  cost_center: 'CC-',
  company: 'CMP-',
  site: 'LOC-',
  building: 'BLD-',
  floor: 'FLR-',
  room: 'RM-',
  location_level_1: 'LOC-L1-',
  location_level_2: 'LOC-L2-',
  location_level_3: 'LOC-L3-',
  location_level_4: 'LOC-L4-',
  asset_group: 'GRP-',
  category: 'CAT-',
  sub_category: 'SUB-',
  asset_sub_group: 'SUB-',
  asset_class: 'CLS-',
  asset_type: 'TYP-',
  item_master: 'ITM-',
  model: 'MOD-',
  manufacturer: 'MFR-',
  brand: 'BRD-',
  employee: 'EMP-',
  supplier: 'SUP-',
  vendor: 'VEN-',
  uom: 'UOM-',
  asset_condition: 'COND-',
  reason: 'RSN-',
  custom_field: 'CF-',
  disposal_status: 'DISP-',
  country: 'CNT-',
  location_type: 'LT-',
  business_unit: 'BU-'
};

let cachedPrefixes = { ...DEFAULT_MASTER_PREFIXES };
let fetchPromise = null;
const listeners = new Set();

export async function fetchCodePrefixes(force = false) {
  if (!force && fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    try {
      const res = await api.get('/master-data/code-prefixes');
      if (res.data?.success && res.data?.prefixes) {
        cachedPrefixes = { ...DEFAULT_MASTER_PREFIXES, ...res.data.prefixes };
        listeners.forEach((fn) => {
          try { fn(cachedPrefixes); } catch (_) {}
        });
      }
    } catch (err) {
      console.warn('Failed to load code prefixes from backend, using defaults:', err.message);
    }
    return cachedPrefixes;
  })();
  return fetchPromise;
}

export function getCachedPrefix(entityKey) {
  const normKey = String(entityKey || '').toLowerCase().replace(/[-\s]/g, '_');
  const p = cachedPrefixes[normKey] || DEFAULT_MASTER_PREFIXES[normKey];
  if (p) return p.endsWith('-') ? p : `${p}-`;
  return `${normKey.slice(0, 3).toUpperCase()}-`;
}

export function subscribePrefixes(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

