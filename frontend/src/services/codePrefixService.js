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
  asset_sub_group: 'ASG-',
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

const STORAGE_KEY = 'fams_master_code_prefixes';

function loadStoredPrefixes() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_MASTER_PREFIXES, ...parsed };
        }
      }
    }
  } catch (_) {}
  return { ...DEFAULT_MASTER_PREFIXES };
}

let cachedPrefixes = loadStoredPrefixes();
let fetchPromise = null;
const listeners = new Set();

export function updateLocalPrefixes(newPrefixes) {
  if (!newPrefixes || typeof newPrefixes !== 'object') return cachedPrefixes;
  const cleaned = {};
  for (const [k, v] of Object.entries(newPrefixes)) {
    if (typeof v === 'string') {
      const val = v.trim().toUpperCase();
      cleaned[k.toLowerCase()] = val.endsWith('-') ? val : (val ? `${val}-` : '');
    }
  }
  cachedPrefixes = { ...DEFAULT_MASTER_PREFIXES, ...cachedPrefixes, ...cleaned };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedPrefixes));
      window.dispatchEvent(new CustomEvent('fams_master_prefixes_changed', { detail: cachedPrefixes }));
    }
  } catch (_) {}
  listeners.forEach((fn) => {
    try { fn(cachedPrefixes); } catch (_) {}
  });
  return cachedPrefixes;
}

export async function fetchCodePrefixes(force = false) {
  if (force) {
    fetchPromise = null;
  } else if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await api.get('/master-data/code-prefixes');
      // Axios interceptor in api.js returns response.data directly
      const prefixes = res?.prefixes || res?.data?.prefixes;
      if (prefixes && typeof prefixes === 'object') {
        updateLocalPrefixes(prefixes);
      }
    } catch (err) {
      console.warn('Failed to load code prefixes from backend, using defaults/cached:', err.message);
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

// Eagerly prefetch in browser environment
if (typeof window !== 'undefined') {
  fetchCodePrefixes().catch(() => {});
}
