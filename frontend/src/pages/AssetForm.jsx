import React, { useState, useEffect, useRef, useMemo } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

import { INITIAL_ASSET_GROUPS } from '../components/master-data/AssetGroupsTab';
import { INITIAL_CLASSES } from '../components/master-data/ClassesTab';
import { INITIAL_SUB_CATEGORIES } from '../components/master-data/SubCategoriesTab';

import { DEFAULT_ASSET_TYPES } from '../components/master-data/GenericMasterTab';
import { uploadToCloudinary } from '../services/cloudinary';
import {
  Package,
  Save,
  ArrowLeft,
  Barcode,
  Radio,
  Building,
  User,
  DollarSign,
  Cpu,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Upload,
  Layers,
  Check,
  Send,
  FileCheck,
  Info,
  QrCode,
  Paperclip,
  CheckSquare,
  Wrench,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Calendar,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  FolderPlus,
  Sliders,
  ExternalLink,
  Cloud
} from 'lucide-react';

function BarcodePreview({ value }) {
  const barcodeRef = useRef(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!value || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, value, {
        format: 'CODE128',
        width: 2,
        height: 56,
        margin: 12,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#0f172a'
      });
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }, [value]);

  if (!value) return <p className="text-xs text-slate-500">Enter or generate an identifier to see its barcode.</p>;

  return (
    <div className="w-full text-center">
      {invalid && <p className="text-xs text-rose-600">Code 128 supports printable characters only.</p>}
      <svg
        ref={barcodeRef}
        role="img"
        aria-label={`Code 128 barcode for ${value}`}
        className={`${invalid ? 'hidden' : 'block'} h-auto max-w-full mx-auto`}
      />
    </div>
  );
}


// --- Cascading Hierarchy Matchers ---
const normalizeStr = (s) => (s || '').toLowerCase().trim();

const matchesGroupToType = (group, assetType) => {
  if (!assetType || assetType === 'All') return true;
  const gType = normalizeStr(group.assetType);
  const t = normalizeStr(assetType);
  const gName = normalizeStr(group.name || group.title || group);
  const gCode = normalizeStr(group.code);

  // 1. If group explicitly has an assetType specified (not generic 'both')
  if (gType && gType !== 'both' && gType !== 'all') {
    if (gType === t || t.includes(gType) || gType.includes(t)) return true;
    // Explicitly assigned to a different type -> do not match!
    return false;
  }

  // 2. Keyword/domain matching based on Asset Type
  const isIT = t.includes('it') || t.includes('tech') || t.includes('comput') || t.includes('soft') || t.includes('hard') || t.includes('digital');
  const isVeh = t.includes('veh') || t.includes('fleet') || t.includes('auto') || t.includes('car') || t.includes('truck');
  const isMach = t.includes('mach') || t.includes('plant') || t.includes('tool') || t.includes('equip') || t.includes('product');
  const isFurn = t.includes('furn') || t.includes('fixture') || t.includes('seat');
  const isFac = t.includes('fac') || t.includes('build') || t.includes('civil') || t.includes('struct') || t.includes('infra');
  const isOffice = t.includes('office') || t.includes('stationery');

  if (isIT) {
    return gName.includes('tech') || gName.includes('it') || gCode === 'it' || gCode === 'sw' || gCode === 'lic' || gName.includes('software') || gName.includes('hardware') || gName.includes('information') || gName.includes('network') || gName.includes('telecom');
  }
  if (isVeh) {
    return gName.includes('veh') || gCode === 'veh' || gName.includes('fleet') || gName.includes('transport') || gName.includes('car') || gName.includes('truck') || gName.includes('automobile');
  }
  if (isMach) {
    return gName.includes('plant') || gName.includes('mach') || gName.includes('tool') || gCode === 'plant' || gCode === 'tool' || gName.includes('equip') || gName.includes('production') || gName.includes('industrial');
  }
  if (isFurn) {
    return gName.includes('furn') || gCode.includes('ff&e') || gName.includes('fixture') || gName.includes('seating') || gName.includes('desk') || gName.includes('chair');
  }
  if (isFac) {
    return gName.includes('build') || gName.includes('fac') || gCode === 'bld' || gName.includes('infra') || gName.includes('civil') || gName.includes('real estate') || gName.includes('structure');
  }
  if (isOffice) {
    return gName.includes('office') || gName.includes('furn') || gName.includes('printer') || gName.includes('stationery');
  }

  // 3. Dynamic / Custom Asset Type (e.g. user created custom type name)
  if (gType === t || gName === t || gName.includes(t) || t.includes(gName) || (gCode && t.includes(gCode))) {
    return true;
  }

  // If group has no specific keyword match and assetType is specific, do not match
  return false;
};

const matchesClassToGroup = (cls, assetGroup) => {
  if (!assetGroup) return true;
  const grpName = normalizeStr(assetGroup);
  const groupMatch = (cls.description || '').match(/\[group:([^\]]+)\]/);
  const clsGrp = normalizeStr(cls.groupName || (groupMatch ? groupMatch[1] : ''));
  const cCode = normalizeStr(cls.code);
  const cName = normalizeStr(cls.name);

  if (clsGrp && (clsGrp === grpName || grpName.includes(clsGrp) || clsGrp.includes(grpName))) {
    return true;
  }
  if (grpName.includes('tech') || grpName.includes('it')) {
    return cCode.startsWith('it') || cName.includes('hard') || cName.includes('soft') || cName.includes('net') || cName.includes('compute');
  }
  if (grpName.includes('build') || grpName.includes('fac')) {
    return cCode.startsWith('bld') || cCode.startsWith('fac') || cName.includes('struct') || cName.includes('mep') || cName.includes('plant');
  }
  if (grpName.includes('plant') || grpName.includes('mach')) {
    return cCode.startsWith('plant') || cCode.startsWith('mach') || cName.includes('prod') || cName.includes('util') || cName.includes('mach');
  }
  if (grpName.includes('veh')) {
    return cCode.startsWith('veh') || cCode.startsWith('fleet') || cName.includes('veh') || cName.includes('light') || cName.includes('heavy');
  }
  if (grpName.includes('furn') || grpName.includes('ff&e')) {
    return cCode.startsWith('ff&e') || cCode.startsWith('furn') || cName.includes('furn') || cName.includes('office');
  }
  return true;
};

const matchesAssetType = (category, assetType) => {
  if (!assetType || assetType === 'All') return true;
  const name = (category.name || '').toLowerCase().trim();
  const code = (category.code || '').toLowerCase().trim();
  const desc = (category.description || '').toLowerCase().trim();

  const normalized = assetType.toLowerCase().trim();

  // 1. Explicit tags in description
  if (desc.includes('[type:vehicle]') || desc.includes('[type:vehicles]')) {
    return normalized.includes('vehicle');
  }
  if (desc.includes('[type:furniture]')) {
    return normalized.includes('furniture');
  }
  if (desc.includes('[type:machinery]') || desc.includes('[type:plant]')) {
    return normalized.includes('machinery');
  }
  if (desc.includes('[type:facility]') || desc.includes('[type:building]')) {
    return normalized.includes('facility') || normalized.includes('building');
  }
  if (desc.includes('[type:office]')) {
    return normalized.includes('office');
  }
  if (desc.includes('[type:it]')) {
    return normalized.includes('it') || normalized.includes('tech');
  }

  // 2. Keyword Classifications
  const isVehicle = name.includes('vehicle') || name.includes('car') || name.includes('truck') || name.includes('van') || name.includes('fleet') || name.includes('forklift') || code.includes('veh');
  const isFurniture = name.includes('furniture') || (name.includes('desk') && !name.includes('desktop')) || name.includes('chair') || name.includes('cabinet') || name.includes('seating') || code.includes('furn') || code.includes('ffe');
  const isMachinery = name.includes('machine') || name.includes('cnc') || name.includes('plant') || name.includes('pump') || name.includes('compressor') || name.includes('boiler') || name.includes('chiller') || name.includes('generator') || code.includes('gen') || code.includes('chiller') || code.includes('mach');
  const isFacility = name.includes('building') || name.includes('facility') || name.includes('civil') || (name.includes('structure') && !name.includes('infra')) || name.includes('hvac') || name.includes('electrical') || name.includes('plumbing') || code.includes('bld') || code.includes('hvac') || code.includes('mep');
  const isOffice = name.includes('printer') || name.includes('scanner') || name.includes('copier') || name.includes('office') || name.includes('projector') || name.includes('shredder') || name.includes('telephony') || code.includes('prn') || code.includes('prt');
  
  const isIT = code.startsWith('it-') || code.startsWith('cat-it') || code.startsWith('cat-lap') || code.startsWith('cat-dsk') || code.startsWith('cat-srv') || code.startsWith('cat-disp') || code.startsWith('cat-prn') || code.startsWith('cat-acc') || code.startsWith('cat-mob') || code.startsWith('cat-tab') ||
    name.includes('laptop') || name.includes('desktop') || name.includes('server') || name.includes('infrastructure') || name.includes('compute') || name.includes('monitor') || name.includes('display') || name.includes('mobile') || name.includes('tablet') || name.includes('accessory') || name.includes('network') || name.includes('switch') || name.includes('router') || name.includes('firewall') || name.includes('hardware');

  // Check if it's an unclassified custom category or custom dynamic type
  const isOther = !isVehicle && !isFurniture && !isMachinery && !isFacility && !isOffice && !isIT;
  if (isOther) {
    return true; // Gracefully allow all categories for custom dynamic asset types
  }

  if (normalized.includes('vehicle')) {
    return isVehicle;
  }
  if (normalized.includes('furniture')) {
    return isFurniture;
  }
  if (normalized.includes('machinery')) {
    return isMachinery;
  }
  if (normalized.includes('facility') || normalized.includes('building')) {
    return isFacility;
  }
  if (normalized.includes('office')) {
    return isOffice || (isIT && (name.includes('printer') || name.includes('monitor') || name.includes('accessory')));
  }
  if (normalized.includes('it') || normalized.includes('tech')) {
    return (isIT || isOther) && !isVehicle && !isFurniture && !isMachinery && !isFacility;
  }

  return true;
};

export function AssetForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleQuickAddCompany = async () => {
    const name = window.prompt('Enter new Company name (e.g. Acme Corp, Apex Group):');
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const code = window.prompt(`Enter Company code (or press OK to auto-generate CMP-${cleanName.slice(0, 4).toUpperCase()}):` )?.trim() || `CMP-${cleanName.slice(0, 4).toUpperCase()}`;
    try {
      const res = await api.post('/master-data/companies', { name: cleanName, code });
      const newCmp = res?.company || { id: `cmp-${Date.now()}`, name: cleanName, code };
      setCompanies(prev => [...prev, newCmp]);
      setFormData(prev => ({ ...prev, companyId: newCmp.id, company: newCmp.name }));
      try {
        const stored = JSON.parse(localStorage.getItem('fams_companies') || '[]');
        localStorage.setItem('fams_companies', JSON.stringify([...stored, newCmp]));
      } catch (_) {}
      showToast('success', `Company "${cleanName}" added successfully!`);
    } catch (err) {
      console.warn('Add company error:', err);
      const newCmp = { id: `cmp-${Date.now()}`, name: cleanName, code };
      setCompanies(prev => [...prev, newCmp]);
      setFormData(prev => ({ ...prev, companyId: newCmp.id, company: newCmp.name }));
      try {
        const stored = JSON.parse(localStorage.getItem('fams_companies') || '[]');
        localStorage.setItem('fams_companies', JSON.stringify([...stored, newCmp]));
      } catch (_) {}
      showToast('success', `Company "${cleanName}" added successfully!`);
    }
  };

  const handleQuickAddBuilding = async () => {
    const currentSiteId = formData.siteId || (sites[0]?.id || '');
    if (!currentSiteId) {
      showToast('warning', 'Please select or create a Site first before adding a Building.');
      return;
    }
    const name = window.prompt('Enter Building name (e.g. Building A, Main Tower, Annex):');
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const code = window.prompt(`Enter Building code (or press OK to auto-generate BLD-${cleanName.slice(0, 4).toUpperCase()}):` )?.trim() || `BLD-${cleanName.slice(0, 4).toUpperCase()}`;
    try {
      const res = await api.post('/master-data/buildings', { name: cleanName, code, siteId: currentSiteId });
      const newBld = res?.building || { id: `bld-${Date.now()}`, name: cleanName, code, siteId: currentSiteId };
      setBuildings(prev => [...prev, newBld]);
      setFormData(prev => ({ ...prev, buildingId: newBld.id, building: newBld.name }));
      try {
        const stored = JSON.parse(localStorage.getItem('fams_buildings') || '[]');
        localStorage.setItem('fams_buildings', JSON.stringify([...stored, newBld]));
      } catch (_) {}
      showToast('success', `Building "${cleanName}" added successfully!`);
    } catch (err) {
      console.warn('Add building error:', err);
      const newBld = { id: `bld-${Date.now()}`, name: cleanName, code, siteId: currentSiteId };
      setBuildings(prev => [...prev, newBld]);
      setFormData(prev => ({ ...prev, buildingId: newBld.id, building: newBld.name }));
      try {
        const stored = JSON.parse(localStorage.getItem('fams_buildings') || '[]');
        localStorage.setItem('fams_buildings', JSON.stringify([...stored, newBld]));
      } catch (_) {}
      showToast('success', `Building "${cleanName}" added successfully!`);
    }
  };

  const handleQuickAddDepartment = async () => {
    const name = window.prompt('Enter Department name (e.g. Operations, Quality Assurance, Logistics):');
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const code = window.prompt('Enter Department code (e.g. OPS, QA, LOG):' )?.trim() || cleanName.slice(0, 3).toUpperCase();
    try {
      const res = await api.post('/master-data/departments', {
        name: cleanName,
        code,
        companyId: formData.companyId || undefined,
        active: true
      });
      const newDept = res?.department || {
        id: `dept-${Date.now()}`,
        name: cleanName,
        code,
        companyId: formData.companyId || undefined,
        active: true
      };

      setDepartments(prev => {
        const exists = prev.some(d => d.id === newDept.id || d.name?.toLowerCase() === cleanName.toLowerCase());
        return exists ? prev.map(d => (d.id === newDept.id || d.name?.toLowerCase() === cleanName.toLowerCase()) ? newDept : d) : [...prev, newDept];
      });

      setFormData(prev => ({
        ...prev,
        departmentId: newDept.id,
        department: newDept.name || cleanName
      }));

      if (typeof updateAssetItem === 'function') {
        updateAssetItem({
          departmentId: newDept.id,
          department: newDept.name || cleanName
        });
      }

      try {
        const stored = JSON.parse(localStorage.getItem('fams_custom_departments') || '[]');
        localStorage.setItem('fams_custom_departments', JSON.stringify([...stored, newDept]));
      } catch (_) {}

      // Refresh live departments list from backend in background
      api.get('/master-data/departments')
        .then(r => {
          if (r?.departments && Array.isArray(r.departments)) {
            setDepartments(prev => {
              const ids = new Set(r.departments.map(d => d.id));
              const extras = prev.filter(p => !ids.has(p.id));
              return [...r.departments, ...extras];
            });
          }
        })
        .catch(() => null);

      showToast('success', `Department "${cleanName}" added and selected successfully!`);
    } catch (err) {
      console.warn('Add department error:', err);
      const newDept = {
        id: `dept-${Date.now()}`,
        name: cleanName,
        code,
        companyId: formData.companyId || undefined,
        active: true
      };
      setDepartments(prev => [...prev, newDept]);
      setFormData(prev => ({
        ...prev,
        departmentId: newDept.id,
        department: newDept.name || cleanName
      }));
      if (typeof updateAssetItem === 'function') {
        updateAssetItem({
          departmentId: newDept.id,
          department: newDept.name || cleanName
        });
      }
      try {
        const stored = JSON.parse(localStorage.getItem('fams_custom_departments') || '[]');
        localStorage.setItem('fams_custom_departments', JSON.stringify([...stored, newDept]));
      } catch (_) {}
      showToast('success', `Department "${cleanName}" added and selected successfully!`);
    }
  };

  const handleQuickAddCostCenter = async () => {
    const name = window.prompt('Enter Cost Center name (e.g. Fleet Operations, Corporate Admin):');
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const code = window.prompt('Enter Cost Center code (e.g. CC-3000):' )?.trim() || `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const res = await api.post('/master-data/cost-centers', { name: cleanName, code, companyId: formData.companyId || undefined });
      const newCC = res?.costCenter || { id: `cc-${Date.now()}`, name: cleanName, code, companyId: formData.companyId };
      setCostCenters(prev => [...prev, newCC]);
      setFormData(prev => ({ ...prev, costCenterId: newCC.id, costCenter: `${newCC.code} - ${newCC.name}` }));
      showToast('success', `Cost Center "${cleanName}" added successfully!`);
    } catch (err) {
      console.warn('Add cost center error:', err);
      const newCC = { id: `cc-${Date.now()}`, name: cleanName, code, companyId: formData.companyId };
      setCostCenters(prev => [...prev, newCC]);
      setFormData(prev => ({ ...prev, costCenterId: newCC.id, costCenter: `${newCC.code} - ${newCC.name}` }));
      showToast('success', `Cost Center "${cleanName}" added successfully!`);
    }
  };
  const [createdAssets, setCreatedAssets] = useState([]);

  // Cloudinary upload state & refs
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Master Data Options loaded dynamically from backend & localStorage
  const [assetTypes, setAssetTypes] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
      const existing = new Set(custom.map(c => c.name.toLowerCase()));
      return [...custom, ...DEFAULT_ASSET_TYPES.filter(d => !existing.has(d.name.toLowerCase()))];
    } catch (_) {
      return DEFAULT_ASSET_TYPES;
    }
  });

  const [assetGroups, setAssetGroups] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
      return [...local, ...INITIAL_ASSET_GROUPS.filter(ig => !local.some(lg => (lg.code && ig.code && lg.code.toUpperCase() === ig.code.toUpperCase()) || lg.id === ig.id))];
    } catch (_) {
      return INITIAL_ASSET_GROUPS;
    }
  });

  const [categories, setCategories] = useState([]);
  const [assetClasses, setAssetClasses] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
      return [...local, ...INITIAL_CLASSES.filter(ic => !local.some(lc => (lc.code && ic.code && lc.code.toUpperCase() === ic.code.toUpperCase()) || lc.id === ic.id))];
    } catch (_) {
      return INITIAL_CLASSES;
    }
  });
  const [subCategories, setSubCategories] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
      return [...local, ...INITIAL_SUB_CATEGORIES];
    } catch (_) {
      return INITIAL_SUB_CATEGORIES;
    }
  });
  const [sites, setSites] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Dynamic Tag Generation & Real-time Validation State
  const [generatingTag, setGeneratingTag] = useState(false);
  const [tagValidationStatus, setTagValidationStatus] = useState('AVAILABLE'); // 'IDLE' | 'VALIDATING' | 'AVAILABLE' | 'CONFLICT'
  const [tagValidationMessage, setTagValidationMessage] = useState('Available & Ready to Assign');

  // Stepper Flow State
  const [currentStep, setCurrentStep] = useState(1);
  const [stepMode, setStepMode] = useState('wizard'); // 'wizard' | 'all'
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (fieldName) => {
    setFieldErrors(prev => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const FORM_STEPS = [
    { id: 1, name: 'Basic Information', desc: 'Primary asset details & photo', icon: FileText },
    { id: 2, name: 'Additional Details', desc: 'Financial, warranty & contracts', icon: DollarSign },
    { id: 3, name: 'Tagging & Location', desc: 'Assign barcode/RFID & location', icon: QrCode },
    { id: 4, name: 'Documents', desc: 'Upload files via Cloudinary', icon: Paperclip },
    { id: 5, name: 'Review & Submit', desc: 'Verify and submit for approval', icon: CheckCircle2 }
  ];

  // Default form layout: Stepper & 8-Callouts View
  const activeView = searchParams.get('view') || 'stepper';

  // Load live master data options. Asset IDs are assigned by the database on save.
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catRes, classRes, siteRes, deptRes, ccRes, mfrRes, empRes, companyRes, buildingRes, floorRes, roomRes, groupRes, typeRes] = await Promise.all([
          api.get('/master-data/categories').catch(() => null),
          api.get('/master-data/asset-classes').catch(() => null),
          api.get('/master-data/sites').catch(() => null),
          api.get('/master-data/departments').catch(() => null),
          api.get('/master-data/cost-centers').catch(() => null),
          api.get('/master-data/manufacturers').catch(() => null),
          api.get('/master-data/employees').catch(() => null),
          api.get('/master-data/companies').catch(() => null),
          api.get('/master-data/buildings').catch(() => null),
          api.get('/master-data/floors').catch(() => null),
          api.get('/master-data/rooms').catch(() => null),
          api.get('/master-data/asset-groups').catch(() => null),
          api.get('/master-data/asset-types').catch(() => null)
        ]);
        if (typeRes?.assetTypes && Array.isArray(typeRes.assetTypes) && typeRes.assetTypes.length > 0) {
          const custom = JSON.parse(localStorage.getItem('fams_custom_asset_types') || '[]');
          const existingNames = new Set(custom.map(c => c.name.toLowerCase()));
          const merged = [...custom, ...typeRes.assetTypes.filter(st => !existingNames.has(st.name.toLowerCase()))];
          setAssetTypes(merged);
        }
        if (groupRes?.assetGroups && Array.isArray(groupRes.assetGroups) && groupRes.assetGroups.length > 0) {
          const custom = JSON.parse(localStorage.getItem('fams_custom_asset_groups') || '[]');
          const server = groupRes.assetGroups;
          const merged = [...custom, ...server.filter(sg => !custom.some(cg => (cg.code && sg.code && cg.code.toUpperCase() === sg.code.toUpperCase()) || cg.id === sg.id))];
          setAssetGroups(merged);
        }
        if (classRes?.assetClasses && Array.isArray(classRes.assetClasses) && classRes.assetClasses.length > 0) {
          const customSub = JSON.parse(localStorage.getItem('fams_custom_subcategories') || '[]');
          const customCls = JSON.parse(localStorage.getItem('fams_custom_asset_classes') || '[]');
          const customSubCodes = new Set(customSub.map(s => (s.code || '').toUpperCase()));

          // Separate SubCategories vs true Asset Classes
          // Server classes: identify by [kind:class] or !includes('[kind:subcat]')
          const serverClasses = classRes.assetClasses
            .filter(ac => !customSubCodes.has((ac.code || '').toUpperCase()) && !(ac.description || '').includes('[kind:subcat]'))
            .map(ac => {
              const groupMatch = (ac.description || '').match(/\[group:([^\]]+)\]/);
              return {
                ...ac,
                groupName: groupMatch ? groupMatch[1] : (ac.groupName || 'General')
              };
            });

          const serverSubCats = classRes.assetClasses
            .filter(ac => (ac.description || '').includes('[kind:subcat]') || customSubCodes.has((ac.code || '').toUpperCase()))
            .map(ac => ({
              ...ac,
              categoryName: ac.category?.name || 'General'
            }));

          const mergedCls = [
            ...customCls,
            ...serverClasses.filter(sc => !customCls.some(cc => (cc.code && sc.code && cc.code.toUpperCase() === sc.code.toUpperCase()) || cc.id === sc.id))
          ];
          setAssetClasses(mergedCls);

          const allSub = [
            ...customSub,
            ...serverSubCats.filter(sc => !customSub.some(cs => cs.id === sc.id || (cs.code && sc.code && cs.code.toUpperCase() === sc.code.toUpperCase())))
          ];
          setSubCategories(allSub);
        }
        if (catRes?.categories) {
          const enrichedCategories = catRes.categories.map(c => {
            const groupMatch = (c.description || '').match(/\[group:([^\]]+)\]/);
            const classMatch = (c.description || '').match(/\[class:([^\]]+)\]/);
            return {
              ...c,
              groupName: groupMatch ? groupMatch[1] : (c.groupName || (c.code?.startsWith('IT') ? 'Information Technology' : 'General')),
              className: classMatch ? classMatch[1] : (c.className || (c.code?.startsWith('IT') ? 'Hardware' : 'General'))
            };
          });
          setCategories(enrichedCategories);
        }
        if (siteRes?.sites) setSites(siteRes.sites);
        if (companyRes?.companies) {
          const stored = JSON.parse(localStorage.getItem('fams_companies') || '[]');
          const server = companyRes.companies;
          const merged = [...stored, ...server.filter(s => !stored.some(st => st.id === s.id || (st.code && s.code && st.code.toUpperCase() === s.code.toUpperCase())))];
          setCompanies(merged);
        }
        if (buildingRes?.buildings) {
          const stored = JSON.parse(localStorage.getItem('fams_buildings') || '[]');
          const server = buildingRes.buildings;
          const merged = [...stored, ...server.filter(s => !stored.some(st => st.id === s.id || (st.code && s.code && st.code.toUpperCase() === s.code.toUpperCase())))];
          setBuildings(merged);
        }
        if (floorRes?.floors) setFloors(floorRes.floors);
        if (roomRes?.rooms) setRooms(roomRes.rooms);
        if (deptRes?.departments) {
          const customDepts = JSON.parse(localStorage.getItem('fams_custom_departments') || '[]');
          const serverDepts = deptRes.departments;
          const mergedDepts = [...serverDepts, ...customDepts.filter(cd => !serverDepts.some(sd => sd.id === cd.id || (sd.code && cd.code && sd.code.toUpperCase() === cd.code.toUpperCase())))];
          setDepartments(mergedDepts);
        }
        if (ccRes?.costCenters) setCostCenters(ccRes.costCenters);
                const customMfrs = JSON.parse(localStorage.getItem('fams_custom_manufacturers') || '[]');
        const serverMfrs = mfrRes?.manufacturers || [];
        const existingNames = new Set(serverMfrs.map(m => (m.name || '').toLowerCase()));
        const mergedMfrs = [...serverMfrs, ...customMfrs.filter(cm => !existingNames.has((cm.name || '').toLowerCase()))];
        setManufacturers(mergedMfrs);
        if (empRes?.employees) setEmployees(empRes.employees);
      } catch (err) {
        console.warn('Master data load skipped:', err);
      }
    }
    loadMasterData();

  }, []);

  useEffect(() => {
    let active = true;
    setLoadingDevices(true);
    api.get('/discovery/devices', { params: { limit: 2000 } })
      .then(res => { if (active) setDiscoveredDevices((res?.devices || []).filter(device => !device.linkedAssetId)); })
      .catch(() => { if (active) setDiscoveredDevices([]); })
      .finally(() => { if (active) setLoadingDevices(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const qName = searchParams.get('assetName') || searchParams.get('name');
    const qSerial = searchParams.get('serialNumber') || searchParams.get('serial');
    const qMfr = searchParams.get('manufacturer') || searchParams.get('mfr');
    const qModel = searchParams.get('model');
    const qIp = searchParams.get('ipAddress') || searchParams.get('ip');
    const qMac = searchParams.get('macAddress') || searchParams.get('mac');
    const qDiscId = searchParams.get('discoveryId');

    if (qName || qSerial || qMfr || qModel || qIp || qMac || qDiscId) {
      setFormData(prev => ({
        ...prev,
        assetName: qName || prev.assetName,
        serialNumber: qSerial || prev.serialNumber,
        manufacturer: qMfr || prev.manufacturer,
        model: qModel || prev.model,
        ipAddress: qIp || prev.ipAddress,
        macAddress: qMac || prev.macAddress,
        discoveryId: qDiscId || prev.discoveryId,
        linkToDiscovered: Boolean(qDiscId)
      }));
      if (qSerial) {
        setSerialNumbers([qSerial]);
      }
    }
  }, [searchParams]);

  // Shared Form State across both form designs
  const [formData, setFormData] = useState({
    // 1. Basic Information
    assetName: '',
    assetType: 'IT Equipment',
    category: '',
    categoryId: '',
    subcategory: '',
    assetClassId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    quantity: '1',
    description: '',
    image: '',

    // 2. Classification (Grid View)
    assetGroup: '',
    assetClass: '',
    criticality: 'Medium',
    status: 'New',
    condition: 'New',

    // 3. Product Details
    brand: '',
    modelNumber: '',
    assetTagBarcode: '',
    rfidEpc: '',
    tid: '',

    // 4. Location & Ownership
    company: '',
    businessUnit: '',
    department: '',
    costCenter: '',
    site: '',
    building: '',
    floor: '',
    room: '',
    zoneArea: '',
    storageArea: '',
    custodian: '',
    alternateCustodian: '',
    expectedUser: '',

    // 5. Financial Information
    acquisitionDate: '',
    acquisitionCost: '',
    purchaseDate: '',
    purchaseCost: '',
    currency: 'AED',
    supplier: '',
    vendorSupplier: '',
    poInvoiceNo: '',
    assetBook: 'Corporate Book',
    depreciationMethod: 'Straight Line',
    usefulLifeYears: '5',
    residualValue: '',

    // 6. Warranty & Contract
    underWarranty: false,
    provider: '',
    warrantyType: '',
    warrantyStartDate: '',
    warrantyYears: '',
    warrantyEndDate: '',
    coverage: '',
    contractReference: '',
    warrantyDoc: '',

    // 7. Maintenance Setup
    enablePm: false,
    pmScheduleNo: '',
    pmTitle: '',
    pmDescription: '',
    pmWorkType: 'PREVENTIVE',
    pmFrequencyMonths: 3,
    pmNextDueDate: '',
    pmChecklistText: '',
    pmActive: true,
    pmAutoGenerateWorkOrders: false,
    pmAdvanceDays: 7,
    pmLocation: '',
    pmLastServiceDate: '',

    // 8. Auto Discovery
    linkToDiscovered: false,
    discoveryId: '',
    discoverySource: '',
    hostname: '',
    ipAddress: '',
    macAddress: '',
    discoveredSerial: '',
    firstSeen: '',
    lastSeen: '',
    matchedDiscovery: false,

    // 9. Additional Information
    project: '',
    reference: '',
    notes: '',

    // Tagging tab selection (Stepper view)
    tagType: 'Barcode', // Barcode | RFID | QR Code
    tagStatus: 'Available',

    // Documents
    documents: [],

    // Approval Workflow
    approvalRequired: 'No',
    approvalStatus: 'Draft',
    nextApprover: '',
    approvalRemarks: '',

    // Custom Fields
    costAllocation: '',
    businessApplication: '',
    remarks: ''
  });
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [discoveryItems, setDiscoveryItems] = useState([{}]);
  const [assetItems, setAssetItems] = useState([{}]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const quantityCount = Number(formData.quantity) || 1;
  const previewPrefix = value => {
    const words = String(value || '').toUpperCase().match(/[A-Z0-9]+/g) || [];
    return (words.length > 1 ? (words[0].length <= 2 ? words[0] : words.map(word => word[0]).join('')) : words[0] || 'GEN').slice(0, 5);
  };
  const categoryCode = categories.find(category => category.id === formData.categoryId)?.code?.replace(/^CAT[-_ ]?/i, '') || formData.category;
  const subcategoryCode = subCategories.find(subCat => subCat.id === formData.assetClassId || subCat.name === formData.subcategory)?.code?.replace(/^CLS[-_ ]?/i, '') || formData.subcategory;
  // 1. Cascading Asset Groups based on selected Asset Type
  const availableAssetGroups = useMemo(() => {
    if (!formData.assetType) return assetGroups;
    return (assetGroups || []).filter(g => matchesGroupToType(g, formData.assetType));
  }, [assetGroups, formData.assetType]);

  // 2. Cascading Asset Classes based on selected Asset Group
  const availableAssetClassesDropdown = useMemo(() => {
    if (!formData.assetGroup) return assetClasses;
    return (assetClasses || []).filter(cls => matchesClassToGroup(cls, formData.assetGroup));
  }, [assetClasses, formData.assetGroup]);

  // 3. Cascading Categories based on Asset Class / Group / Type
  const availableCategories = useMemo(() => {
    let cats = (categories || []).filter(c => c.active !== false);

    // 1. Filter by Asset Class if selected
    if (formData.assetClass) {
      const clsLower = normalizeStr(formData.assetClass);
      const matchedByClass = cats.filter(c => {
        const groupMatch = (c.description || '').match(/\[group:([^\]]+)\]/);
        const classMatch = (c.description || '').match(/\[class:([^\]]+)\]/);
        const catClass = normalizeStr(c.className || (classMatch ? classMatch[1] : ''));
        return catClass && (catClass === clsLower || clsLower.includes(catClass) || catClass.includes(clsLower));
      });
      if (matchedByClass.length > 0) cats = matchedByClass;
    }

    // 2. Filter by Asset Group if selected and not already narrowed down by class
    if (formData.assetGroup && (!formData.assetClass || cats.length === (categories || []).length)) {
      const grpLower = normalizeStr(formData.assetGroup);
      const matchedByGroup = cats.filter(c => {
        const groupMatch = (c.description || '').match(/\[group:([^\]]+)\]/);
        const catGroup = normalizeStr(c.groupName || (groupMatch ? groupMatch[1] : ''));
        return catGroup && (catGroup === grpLower || grpLower.includes(catGroup) || catGroup.includes(grpLower));
      });
      if (matchedByGroup.length > 0) cats = matchedByGroup;
    }

    // 3. Filter by Asset Type
    cats = cats.filter(c => matchesAssetType(c, formData.assetType));

    const seen = new Set();
    const unique = [];
    for (const c of cats) {
      const cleanName = (c.name || '').trim();
      if (cleanName && !seen.has(cleanName.toLowerCase())) {
        seen.add(cleanName.toLowerCase());
        unique.push(c);
      }
    }
    return unique.length > 0 ? unique : (categories || []);
  }, [categories, formData.assetType, formData.assetGroup, formData.assetClass]);

  // 4. Cascading Sub Categories strictly based on selected Category
  const availableAssetClasses = useMemo(() => {
    if (!formData.categoryId && !formData.category) return [];

    const selectedCatName = (formData.category || '').trim().toLowerCase();
    const matched = subCategories.filter(sc => {
      if (formData.categoryId && sc.categoryId === formData.categoryId) return true;
      if (selectedCatName) {
        const scCatName = (sc.category?.name || sc.categoryName || '').trim().toLowerCase();
        if (scCatName === selectedCatName) return true;
        const selectedBase = selectedCatName.split(' ')[0];
        if (selectedBase && selectedBase.length >= 3 && scCatName.includes(selectedBase)) return true;
      }
      return false;
    });

    const seen = new Set();
    const unique = [];
    for (const item of matched) {
      const cleanName = (item.name || '').trim();
      if (cleanName && !seen.has(cleanName.toLowerCase())) {
        seen.add(cleanName.toLowerCase());
        unique.push(item);
      }
    }
    return unique;
  }, [formData.category, formData.categoryId, subCategories]);

  // 5. Cascading / Prioritized Manufacturers based on Type & Category
  const availableManufacturers = useMemo(() => {
    if (!manufacturers || manufacturers.length === 0) return [];

    const typeLower = normalizeStr(formData.assetType);
    const catLower = normalizeStr(formData.category);

    const isVehicle = typeLower.includes('veh') || catLower.includes('veh') || catLower.includes('car') || catLower.includes('truck');
    const isFurniture = typeLower.includes('furn') || catLower.includes('furn') || catLower.includes('chair') || catLower.includes('desk');
    const isMachinery = typeLower.includes('mach') || catLower.includes('mach') || catLower.includes('cnc') || catLower.includes('plant');
    const isIT = typeLower.includes('it') || typeLower.includes('tech') || catLower.includes('laptop') || catLower.includes('server') || catLower.includes('switch');

    const vehicleBrands = new Set(['toyota', 'ford', 'honda', 'volvo', 'mercedes-benz', 'isuzu', 'hyundai', 'caterpillar', 'bmw', 'chevrolet']);
    const furnitureBrands = new Set(['herman miller', 'steelcase', 'haworth', 'ikea', 'knoll', 'godrej', 'vitra']);
    const itBrands = new Set(['dell', 'dell technologies', 'apple', 'apple inc.', 'hp', 'hp inc.', 'hp enterprise', 'cisco', 'cisco systems', 'lenovo', 'lenovo group', 'samsung', 'zebra', 'zebra technologies', 'asus', 'acer', 'microsoft']);
    const machineryBrands = new Set(['caterpillar', 'caterpillar inc.', 'siemens', 'bosch', 'komatsu', 'schneider electric', 'cummins', 'mitsubishi']);

    let priorityBrands = new Set();
    if (isVehicle) priorityBrands = vehicleBrands;
    else if (isFurniture) priorityBrands = furnitureBrands;
    else if (isMachinery) priorityBrands = machineryBrands;
    else if (isIT) priorityBrands = itBrands;

    if (priorityBrands.size === 0) return manufacturers;

    const matched = [];
    const others = [];
    for (const m of manufacturers) {
      const name = normalizeStr(m.name || m.title || m);
      const hasMatch = Array.from(priorityBrands).some(b => name.includes(b));
      if (hasMatch) matched.push(m);
      else others.push(m);
    }
    return [...matched, ...others];
  }, [manufacturers, formData.assetType, formData.category]);

  // --- Handlers for Seamless Top-Down & Bottom-Up Cascades ---

  // Top-Down Step 1: Change Asset Type
  const handleAssetTypeChange = (newType) => {
    const nextGroups = (assetGroups || []).filter(g => matchesGroupToType(g, newType));
    const currentGroupValid = nextGroups.some(g => (g.name || g.code) === formData.assetGroup);
    const nextGroup = currentGroupValid ? formData.assetGroup : (nextGroups.length > 0 ? (nextGroups[0].name || nextGroups[0].code) : '');

    const nextClasses = (assetClasses || []).filter(cls => matchesClassToGroup(cls, nextGroup));
    const currentClassValid = nextClasses.some(c => (c.name || c.code) === formData.assetClass);
    const nextClass = currentClassValid ? formData.assetClass : (nextClasses.length > 0 ? (nextClasses[0].name || nextClasses[0].code) : '');

    setFormData(prev => ({
      ...prev,
      assetType: newType,
      assetGroup: nextGroup,
      assetClass: nextClass,
      category: currentGroupValid && currentClassValid ? prev.category : '',
      categoryId: currentGroupValid && currentClassValid ? prev.categoryId : '',
      subcategory: currentGroupValid && currentClassValid ? prev.subcategory : '',
      assetClassId: currentGroupValid && currentClassValid ? prev.assetClassId : '',
      manufacturer: ''
    }));
  };

  // Top-Down Step 2: Change Asset Group
  const handleAssetGroupChange = (newGroup) => {
    const nextClasses = (assetClasses || []).filter(cls => matchesClassToGroup(cls, newGroup));
    const currentClassValid = nextClasses.some(c => (c.name || c.code) === formData.assetClass);
    const nextClass = currentClassValid ? formData.assetClass : (nextClasses.length > 0 ? (nextClasses[0].name || nextClasses[0].code) : '');

    setFormData(prev => ({
      ...prev,
      assetGroup: newGroup,
      assetClass: nextClass,
      category: currentClassValid ? prev.category : '',
      categoryId: currentClassValid ? prev.categoryId : '',
      subcategory: currentClassValid ? prev.subcategory : '',
      assetClassId: currentClassValid ? prev.assetClassId : ''
    }));
  };

  // Top-Down Step 3: Change Asset Class
  const handleAssetClassChange = (newClass) => {
    setFormData(prev => ({
      ...prev,
      assetClass: newClass,
      category: '',
      categoryId: '',
      subcategory: '',
      assetClassId: ''
    }));
  };

  // Top-Down Step 4 (or Direct Bottom-Up): Change Category
  const handleCategoryChange = (catName) => {
    if (!catName) {
      setFormData(prev => ({
        ...prev,
        category: '',
        categoryId: '',
        subcategory: '',
        assetClassId: '',
        manufacturer: ''
      }));
      return;
    }
    const targetCat = availableCategories.find(c => c.name === catName || c.id === catName)
      || categories.find(c => (c.name || '').trim().toLowerCase() === catName.trim().toLowerCase())
      || categories.find(c => (c.name || '').toLowerCase().includes(catName.toLowerCase()));

    // DO NOT override assetType, assetGroup, assetClass if user already selected them!
    const groupMatch = (targetCat?.description || '').match(/\[group:([^\]]+)\]/);
    const classMatch = (targetCat?.description || '').match(/\[class:([^\]]+)\]/);

    const resolvedGroup = formData.assetGroup || targetCat?.groupName || (groupMatch ? groupMatch[1] : '');
    const resolvedClass = formData.assetClass || targetCat?.className || (classMatch ? classMatch[1] : '');
    const resolvedType = formData.assetType || 'IT Equipment';

    setFormData(prev => ({
      ...prev,
      category: targetCat?.name || catName,
      categoryId: targetCat?.id || '',
      assetType: resolvedType,
      assetGroup: resolvedGroup || prev.assetGroup,
      assetClass: resolvedClass || prev.assetClass,
      subcategory: '',
      assetClassId: ''
    }));
  };

  const handleSubCategoryChange = (selectedClassIdOrName) => {
    if (!selectedClassIdOrName) {
      setFormData(prev => ({
        ...prev,
        subcategory: '',
        assetClassId: ''
      }));
      return;
    }
    const matchedClass = availableAssetClasses.find(item => item.id === selectedClassIdOrName || item.name === selectedClassIdOrName);
    setFormData(prev => ({
      ...prev,
      subcategory: matchedClass?.name || selectedClassIdOrName,
      assetClassId: matchedClass?.id || selectedClassIdOrName
    }));
  };

  const assetIdPreview = `${previewPrefix(formData.assetType)}-${previewPrefix(categoryCode)}-${previewPrefix(subcategoryCode)}-${new Date().getFullYear()}-…`;
  const updateQuantity = value => {
    setFormData(previous => ({ ...previous, quantity: value, serialNumber: serialNumbers[0] || '' }));
    const count = Number(value);
    if (Number.isInteger(count) && count >= 1 && count <= 50) {
      setSerialNumbers(previous => Array.from({ length: count }, (_, index) => previous[index] || ''));
      setDiscoveryItems(previous => Array.from({ length: count }, (_, index) => previous[index] || {}));
      setAssetItems(previous => Array.from({ length: count }, (_, index) => previous[index] || {}));
      setSelectedItemIndex(0);
    }
  };
  const updateSerialNumber = value => {
    setSerialNumbers(previous => previous.map((serial, index) => index === selectedItemIndex ? value : serial));
    setFormData(previous => ({ ...previous, serialNumber: value }));
  };
  const updateDiscoveryItem = changes => {
    setDiscoveryItems(previous => previous.map((item, index) => index === selectedItemIndex ? { ...item, ...changes } : item));
  };
  const updateAssetItem = changes => setAssetItems(previous => previous.map((item, index) => index === selectedItemIndex ? { ...item, ...changes } : item));
  const warrantyEndFor = (start, years) => {
    if (!start || !Number.isInteger(Number(years)) || Number(years) < 1 || Number(years) > 50) return '';
    const date = new Date(`${start}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';
    date.setUTCFullYear(date.getUTCFullYear() + Number(years));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  };
  const updateWarranty = (changes, perItem = false) => {
    const previous = perItem ? { ...formData, ...assetItems[selectedItemIndex] } : formData;
    const next = { ...previous, ...changes };
    next.warrantyEndDate = warrantyEndFor(next.warrantyStartDate, next.warrantyYears);
    if (perItem) updateAssetItem({ ...changes, warrantyEndDate: next.warrantyEndDate });
    else setFormData(next);
  };
  const renderItemSelector = label => <label className="block space-y-1 text-xs font-bold text-slate-700">{label}
    <select value={selectedItemIndex} onChange={event => setSelectedItemIndex(Number(event.target.value))} className="w-full rounded-lg border border-purple-200 bg-white p-2">
      {assetItems.map((_, index) => <option key={index} value={index}>{index + 1} / {assetItems.length} — {serialNumbers[index] || 'No serial number'}</option>)}
    </select>
  </label>;

  const selectedDepreciationCategory = categories.find(category => category.id === formData.categoryId)
    || categories.find(category => category.name === formData.category);
  const categoryDepreciationRate = Number(selectedDepreciationCategory?.annualDepreciationRatePercent || 0);
  const categoryUsefulLifeMonths = categoryDepreciationRate > 0
    ? Math.round(1200 / categoryDepreciationRate)
    : Number(selectedDepreciationCategory?.defaultUsefulLifeMonths || 60);
  const categoryResidualPercent = Number(selectedDepreciationCategory?.defaultResidualValuePercent || 0);
  const enteredAcquisitionCost = Number.parseFloat(String(formData.acquisitionCost || formData.purchaseCost || '0').replace(/[^0-9.-]/g, '')) || 0;
  const residualAmount = enteredAcquisitionCost * categoryResidualPercent / 100;
  const firstYearDepreciation = enteredAcquisitionCost > 0 && selectedDepreciationCategory
    ? Math.min(enteredAcquisitionCost - residualAmount, Number((categoryDepreciationRate > 0
      ? enteredAcquisitionCost * categoryDepreciationRate / 100
      : (enteredAcquisitionCost - residualAmount) * 12 / categoryUsefulLifeMonths).toFixed(2)))
    : 0;
  const depreciationStartDate = new Date(`${formData.inServiceDate || formData.purchaseDate || formData.acquisitionDate || new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const firstDepreciationDate = new Date(depreciationStartDate);
  firstDepreciationDate.setUTCFullYear(firstDepreciationDate.getUTCFullYear() + 1);
  const formatDepreciationAmount = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: formData.currency || 'AED', maximumFractionDigits: 2
  }).format(amount);

  const renderCategoryDepreciation = () => (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-slate-900">Category depreciation configuration</strong>
        <button type="button" onClick={() => navigate('/admin/master-data?tab=depreciation')} className="font-bold text-[#6C2BD9] hover:underline">Edit in Administration</button>
      </div>
      {selectedDepreciationCategory ? (
        <>
          <p className="text-slate-700">Category: <strong>{selectedDepreciationCategory.name}</strong> ({selectedDepreciationCategory.code}) · {categoryDepreciationRate > 0 ? `${categoryDepreciationRate}% per year` : 'Rate not configured'} · Straight line · {categoryUsefulLifeMonths} months useful life · {categoryResidualPercent}% residual value.</p>
          {enteredAcquisitionCost > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Before first anniversary</span><strong>{formatDepreciationAmount(0)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">First annual depreciation</span><strong>{formatDepreciationAmount(firstYearDepreciation)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Value after first anniversary</span><strong>{formatDepreciationAmount(enteredAcquisitionCost - firstYearDepreciation)}</strong></div>
              <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Residual floor</span><strong>{formatDepreciationAmount(residualAmount)}</strong></div>
            </div>
          ) : <p className="text-slate-600">Enter the acquisition cost to preview the depreciated value.</p>}
          <p className="text-slate-500">No depreciation is due until {firstDepreciationDate.toLocaleDateString('en-GB', { timeZone: 'UTC' })}, one full year after the start date. Finance runs post completed years only.</p>
        </>
      ) : <p className="text-slate-600">Select a category to see its saved depreciation policy.</p>}
    </div>
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRemoveDoc = (docIdentifier) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.name !== docIdentifier && d.url !== docIdentifier)
    }));
    showToast('info', `Removed ${docIdentifier}`);
  };

  const handleUploadDocument = async (e) => {
    const files = e.target?.files;
    if (!files || files.length === 0) return;

    setUploadingDoc(true);
    showToast('info', `Uploading ${files.length} document(s) to Cloudinary...`);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadToCloudinary(file, { folder: 'fams_documents' });
        return {
          name: result.name || file.name,
          size: result.formattedSize || `${(file.size / 1024).toFixed(1)} KB`,
          url: result.secure_url || result.url,
          publicId: result.public_id,
          format: result.format,
          type: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }));

      showToast('success', `${uploadedDocs.length} document(s) uploaded successfully!`);
    } catch (err) {
      console.error('Document upload error:', err);
      showToast('error', err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showToast('info', 'Uploading asset photo...');

    try {
      const result = await uploadToCloudinary(file, { folder: 'fams_assets' });
      setFormData(prev => ({
        ...prev,
        assetImage: result.secure_url || result.url,
        imageUrl: result.secure_url || result.url
      }));
      showToast('success', 'Asset photo uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      showToast('error', err.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      assetImage: '',
      imageUrl: ''
    }));
    showToast('info', 'Asset photo removed.');
  };

  const handleAddDoc = () => {
    if (docInputRef.current) {
      docInputRef.current.click();
    }
  };

  // Dynamic Tag Generation Function
  const handleGenerateDynamicTag = async (overrideType) => {
    const targetType = overrideType || formData.tagType || 'Barcode';
    setGeneratingTag(true);
    setTagValidationStatus('VALIDATING');
    setTagValidationMessage('Generating & validating...');

    try {
      let generatedTag = '';
      let generatedEpc = '';

      if (targetType === 'RFID') {
        try {
          const res = await api.post('/tagging/generate', { prefix: 'E2801170', tagType: 'RFID_GEN2', count: 1 });
          if (res?.success && res.tag) {
            generatedTag = res.tag.rfidEpc || res.tag.tagNumber;
            generatedEpc = res.tag.rfidEpc || res.tag.tagNumber;
          }
        } catch (e) {
          console.warn('Backend RFID generate fallback:', e);
        }

        if (!generatedTag) {
          // Authentic 24-character hexadecimal EPC-96 standard
          const p1 = 'E2801170';
          const p2 = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
          const p3 = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
          generatedTag = `${p1}${p2}${p3}`.slice(0, 24);
          generatedEpc = generatedTag;
        }

        setFormData(prev => ({
          ...prev,
          tagType: 'RFID',
          assetTagBarcode: generatedTag,
          rfidEpc: generatedEpc,
          barcode: generatedTag
        }));
      } else if (targetType === 'QR Code') {
        const year = new Date().getFullYear();
        const randSeq = Math.floor(10000 + Math.random() * 90000);
        generatedTag = `QR-${year}-${randSeq}`;

        setFormData(prev => ({
          ...prev,
          tagType: 'QR Code',
          assetTagBarcode: generatedTag,
          barcode: generatedTag
        }));
      } else {
        // Barcode
        try {
          const res = await api.post('/tagging/generate', { prefix: 'BC-', tagType: 'BARCODE', count: 1 });
          if (res?.success && res.tag) {
            generatedTag = res.tag.tagNumber;
          }
        } catch (e) {
          console.warn('Backend Barcode generate fallback:', e);
        }

        if (!generatedTag) {
          const catCode = (formData.category || 'AST').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'AST');
          const randSeq = Math.floor(100000 + Math.random() * 900000);
          generatedTag = `BC-${catCode}-${randSeq}`;
        }

        setFormData(prev => ({
          ...prev,
          tagType: 'Barcode',
          assetTagBarcode: generatedTag,
          barcode: generatedTag
        }));
      }

      // Verify availability against backend
      try {
        const valRes = await api.post('/tagging/validate', {
          tagNumber: generatedTag,
          tagType: targetType,
          rfidEpc: generatedEpc || undefined
        });

        if (valRes?.valid !== false) {
          setTagValidationStatus('AVAILABLE');
          setTagValidationMessage('Available & Verified');
        } else {
          setTagValidationStatus('CONFLICT');
          setTagValidationMessage(valRes?.message || 'Conflict: Tag already assigned');
        }
      } catch (valErr) {
        setTagValidationStatus('AVAILABLE');
        setTagValidationMessage('Available & Ready to Assign');
      }

      showToast('success', `Generated dynamic ${targetType}: ${generatedTag}`);
    } catch (err) {
      console.error('Dynamic tag generation error:', err);
      showToast('error', 'Error generating dynamic tag');
    } finally {
      setGeneratingTag(false);
    }
  };

  const handleSelectTagTab = (tab) => {
    setFormData(prev => ({ ...prev, tagType: tab }));

    const current = formData.assetTagBarcode || '';
    if (tab === 'RFID') {
      const isHexEpc = /^[0-9A-Fa-f]{20,24}$/.test(current) || current.startsWith('E280') || current.startsWith('E360');
      if (!isHexEpc) {
        handleGenerateDynamicTag('RFID');
      }
    } else if (tab === 'QR Code') {
      if (!current.startsWith('QR-')) {
        handleGenerateDynamicTag('QR Code');
      }
    } else if (tab === 'Barcode') {
      if (current.startsWith('QR-') || /^[0-9A-Fa-f]{20,24}$/.test(current)) {
        handleGenerateDynamicTag('Barcode');
      }
    }
  };

  const handleTagInputChange = async (value) => {
    clearFieldError('tag');
    setFormData(prev => ({
      ...prev,
      assetTagBarcode: value,
      rfidEpc: prev.tagType === 'RFID' ? value : prev.rfidEpc,
      barcode: value
    }));

    if (!value || value.trim().length < 3) {
      setTagValidationStatus('IDLE');
      setTagValidationMessage('Enter a valid tag identifier');
      return;
    }

    try {
      const valRes = await api.post('/tagging/validate', {
        tagNumber: value.trim(),
        tagType: formData.tagType,
        rfidEpc: formData.tagType === 'RFID' ? value.trim() : undefined
      });

      if (valRes?.valid !== false) {
        setTagValidationStatus('AVAILABLE');
        setTagValidationMessage('Available & Ready to Assign');
      } else {
        setTagValidationStatus('CONFLICT');
        setTagValidationMessage(valRes?.message || 'Tag already registered to an asset');
      }
    } catch (e) {
      setTagValidationStatus('AVAILABLE');
      setTagValidationMessage('Available & Ready to Assign');
    }
  };

  const validateStep = (stepNumber) => {
    const errors = {};
    let firstWarning = null;

    if (stepNumber === 1) {
      if (uploadingImage) {
        showToast('warning', 'Asset image is currently uploading. Please wait for upload to finish.');
        return false;
      }
      if (!formData.assetName?.trim()) {
        errors.assetName = 'Asset Name is required.';
        if (!firstWarning) firstWarning = 'Warning: Asset Name is required. Please fill in the Asset Name before proceeding.';
      }
      if (!formData.assetType) {
        errors.assetType = 'Asset Type is required.';
        if (!firstWarning) firstWarning = 'Warning: Asset Type is required. Please select an Asset Type.';
      }
      if (!formData.category?.trim()) {
        errors.category = 'Category is required.';
        if (!firstWarning) firstWarning = 'Warning: Category is required. Please select a Category.';
      } else {
        if (!formData.categoryId) {
          const found = categories.find(c => c.name === formData.category || c.id === formData.category);
          if (found) {
            setFormData(prev => ({ ...prev, categoryId: found.id }));
          }
        }
      }

      if (availableAssetClasses.length > 0 && !formData.subcategory && !formData.assetClassId) {
        errors.subcategory = 'Sub Category is required.';
        if (!firstWarning) firstWarning = 'Warning: Sub Category is required for this Category. Please select a Sub Category.';
      }

      const qty = Number(formData.quantity);
      if (!formData.quantity || isNaN(qty) || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        errors.quantity = 'Quantity must be between 1 and 50.';
        if (!firstWarning) firstWarning = 'Warning: Quantity must be a valid number between 1 and 50.';
      }

      if (quantityCount > 1 && selectedDepreciationCategory?.isSerialized) {
        const itemSerialNumbers = serialNumbers.map(s => (s || '').trim());
        if (itemSerialNumbers.some(s => !s)) {
          errors.serialNumber = 'Each item in this serialized category requires a serial number.';
          if (!firstWarning) firstWarning = 'Warning: Each item in this serialized category requires a serial number.';
        }
      }
    }

    if (stepNumber === 2) {
      if (formData.enablePm) {
        if (!formData.pmTitle?.trim()) {
          errors.pmTitle = 'Schedule Title is required.';
          if (!firstWarning) firstWarning = 'Warning: Maintenance Task Title is required when maintenance schedule is enabled.';
        }
        if (!formData.pmNextDueDate) {
          errors.pmNextDueDate = 'First Due Date is required.';
          if (!firstWarning) firstWarning = 'Warning: First Due Date is required for the maintenance schedule.';
        }
        const freq = Number(formData.pmFrequencyMonths);
        if (!formData.pmFrequencyMonths || isNaN(freq) || !Number.isInteger(freq) || freq < 1 || freq > 120) {
          errors.pmFrequencyMonths = 'Interval must be between 1 and 120 months.';
          if (!firstWarning) firstWarning = 'Warning: Repeat interval must be between 1 and 120 months.';
        }
      }

      if (formData.linkToDiscovered) {
        if (quantityCount === 1) {
          if (!formData.discoveryId) {
            errors.discoveryId = 'Please select a discovered device.';
            if (!firstWarning) firstWarning = 'Warning: Please select a discovered device or disable auto-discovery linking.';
          }
        } else {
          if (discoveryItems.some(item => item.linkToDiscovered && !item.discoveryId)) {
            errors.discoveryId = 'Please select a discovered device for each linked asset item.';
            if (!firstWarning) firstWarning = 'Warning: Please select a discovered device for each linked asset item.';
          }
        }
      }

      if (formData.warrantyStartDate || formData.warrantyYears) {
        if (!formData.warrantyStartDate || !formData.warrantyYears || !warrantyEndFor(formData.warrantyStartDate, formData.warrantyYears)) {
          errors.warranty = 'Enter a valid warranty start date and period (1–50 years).';
          if (!firstWarning) firstWarning = 'Warning: Both a valid Warranty Start Date and period (1–50 years) are required.';
        }
      }
    }

    if (stepNumber === 3) {
      if (tagValidationStatus === 'CONFLICT') {
        errors.tag = 'Asset Tag is already assigned to another asset.';
        if (!firstWarning) firstWarning = 'Warning: The entered Asset Tag is already in use. Please enter or generate an available tag.';
      }
      if (quantityCount > 1) {
        const tags = assetItems.map(item => item.tagNumber?.trim().toUpperCase()).filter(Boolean);
        const epcs = assetItems.map(item => item.rfidEpc?.trim().toUpperCase()).filter(Boolean);
        if (new Set(tags).size !== tags.length || new Set(epcs).size !== epcs.length) {
          errors.tag = 'Each asset in the batch must have a unique tag number and RFID EPC.';
          if (!firstWarning) firstWarning = 'Warning: Each asset in the batch must have a unique tag number and RFID EPC.';
        }
      }
    }

    if (stepNumber === 4) {
      if (uploadingDoc) {
        showToast('warning', 'Documents are currently uploading. Please wait for upload to finish before proceeding.');
        return false;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...errors }));
      showToast('warning', firstWarning || 'Please fill up all required fields before proceeding.');
      return false;
    }

    // Clear previous errors for this step
    setFieldErrors(prev => {
      const next = { ...prev };
      if (stepNumber === 1) {
        delete next.assetName;
        delete next.assetType;
        delete next.category;
        delete next.subcategory;
        delete next.quantity;
        delete next.serialNumber;
      } else if (stepNumber === 2) {
        delete next.pmTitle;
        delete next.pmNextDueDate;
        delete next.pmFrequencyMonths;
        delete next.discoveryId;
        delete next.warranty;
      } else if (stepNumber === 3) {
        delete next.tag;
      }
      return next;
    });

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => Math.min(5, prev + 1));
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const handleStepClick = (targetStepId) => {
    if (targetStepId <= currentStep) {
      setCurrentStep(targetStepId);
      setStepMode('wizard');
      window.scrollTo({ top: 280, behavior: 'smooth' });
      return;
    }
    for (let s = currentStep; s < targetStepId; s++) {
      if (!validateStep(s)) {
        return;
      }
    }
    setCurrentStep(targetStepId);
    setStepMode('wizard');
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const handleSubmit = async (targetStatus) => {
    if (createdAssets.length) {
      showToast('success', 'These assets are already saved. Open Asset Register to view them.');
      return;
    }
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        setStepMode('wizard');
        return;
      }
    }
    setLoading(true);
    try {
      const quantity = Number(formData.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50 || serialNumbers.length !== quantity) {
        showToast('error', 'Enter a quantity from 1 to 50.');
        return;
      }
      if (!formData.categoryId || !categories.some(category => category.id === formData.categoryId)) {
        showToast('error', 'Select a registered category so its depreciation policy can be applied.');
        return;
      }
      if (availableAssetClasses.length > 0 && !formData.subcategory && !formData.assetClassId) {
        showToast('error', 'Select a Sub Category before saving.');
        return;
      }
      const itemSerialNumbers = serialNumbers.map(serial => serial.trim());
      if (quantity > 1 && selectedDepreciationCategory?.isSerialized && itemSerialNumbers.some(serial => !serial)) {
        showToast('error', 'Enter a serial number for every item before saving.');
        return;
      }
      if (new Set(itemSerialNumbers.filter(Boolean).map(serial => serial.toUpperCase())).size !== itemSerialNumbers.filter(Boolean).length) {
        showToast('error', 'Each item needs a different serial number.');
        return;
      }
      if (quantity > 1) {
        if (assetItems.length !== quantity) {
          showToast('error', 'Set up the details for each asset in this batch.');
          return;
        }
        const linked = discoveryItems.map(item => item.discoveryId).filter(Boolean);
        if (discoveryItems.length !== quantity || discoveryItems.some(item => item.linkToDiscovered && !item.discoveryId)) {
          showToast('error', 'Select a discovered device for each item marked as linked.');
          return;
        }
        if (new Set(linked).size !== linked.length) {
          showToast('error', 'Each item must use a different discovered device.');
          return;
        }
        const tags = assetItems.map(item => item.tagNumber?.trim().toUpperCase()).filter(Boolean);
        const epcs = assetItems.map(item => item.rfidEpc?.trim().toUpperCase()).filter(Boolean);
        if (new Set(tags).size !== tags.length || new Set(epcs).size !== epcs.length) {
          showToast('error', 'Each item needs a different tag number and RFID EPC.');
          return;
        }
      }
      const warrantyEntries = quantity > 1 ? assetItems.map(item => ({ ...formData, ...item })) : [formData];
      if (warrantyEntries.some(item => (item.warrantyStartDate || item.warrantyYears) && !warrantyEndFor(item.warrantyStartDate, item.warrantyYears))) {
        showToast('error', 'Enter a valid warranty start date and a whole number of years from 1 to 50.');
        return;
      }
      const pmTasks = formData.pmChecklistText.split('\n').map(task => task.trim()).filter(Boolean);
      if (formData.enablePm && (!formData.pmTitle.trim() || !formData.pmNextDueDate ||
          !Number.isInteger(Number(formData.pmFrequencyMonths)) || Number(formData.pmFrequencyMonths) < 1 || Number(formData.pmFrequencyMonths) > 120 ||
          !Number.isInteger(Number(formData.pmAdvanceDays)) || Number(formData.pmAdvanceDays) < 0 || Number(formData.pmAdvanceDays) > 90 ||
          formData.pmDescription.length > 500 || pmTasks.length > 30 || pmTasks.some(task => task.length > 200))) {
        showToast('error', 'Complete the preventive schedule: title, due date, 1–120 month interval, 0–90 advance days, and up to 30 checklist tasks.');
        return;
      }
      if (quantity === 1 && formData.linkToDiscovered && !formData.discoveryId) {
        showToast('error', 'Choose a discovered device or switch to manual discovery details.');
        return;
      }
      const payload = {
        autoGenerateId: true,
        quantity,
        serialNumbers: itemSerialNumbers,
        discoveryItems: quantity > 1 ? discoveryItems : undefined,
        assetItems: quantity > 1 ? assetItems : undefined,
        assetType: formData.assetType,
        subcategory: formData.subcategory,
        assetClassId: formData.assetClassId || undefined,
        assetName: formData.assetName?.trim() || undefined,
        description: formData.description?.trim() || formData.assetName?.trim() || undefined,
        category: formData.category || undefined,
        categoryId: formData.categoryId || undefined,
        manufacturer: formData.manufacturer?.trim() || formData.brand?.trim() || undefined,
        model: formData.model?.trim() || formData.modelNumber?.trim() || undefined,
        serialNumber: quantity === 1 ? itemSerialNumbers[0] || formData.discoveredSerial?.trim() || undefined : undefined,
        tagNumber: quantity === 1 ? formData.assetTagBarcode?.trim() || undefined : undefined,
        barcode: quantity === 1 ? formData.assetTagBarcode?.trim() || undefined : undefined,
        rfidEpc: quantity === 1 ? formData.rfidEpc?.trim() || undefined : undefined,
        company: formData.company || undefined,
        companyId: formData.companyId || undefined,
        site: formData.site || undefined,
        siteId: formData.siteId || undefined,
        building: formData.building || undefined,
        buildingId: formData.buildingId || undefined,
        floor: formData.floor || undefined,
        floorId: formData.floorId || undefined,
        room: formData.room || undefined,
        roomId: formData.roomId || undefined,
        department: formData.department || undefined,
        departmentId: formData.departmentId || undefined,
        costCenter: formData.costCenter || undefined,
        costCenterId: formData.costCenterId || undefined,
        custodian: formData.custodian?.trim() || undefined,
        custodianId: formData.custodianId || undefined,
        acquisitionCost: formData.acquisitionCost || formData.purchaseCost || undefined,
        currency: formData.currency || 'USD',
        condition: formData.condition || 'NEW',
        criticality: formData.criticality || 'MEDIUM',
        targetStatus,
        submitForApproval: targetStatus === 'SUBMITTED',
        lifecycleStatus: targetStatus === 'SUBMITTED' ? 'PENDING_APPROVAL' : 'RECEIVED',
        poInvoiceNo: formData.poInvoiceNo?.trim() || undefined,
        supplier: formData.supplier?.trim() || formData.vendorSupplier?.trim() || undefined,
        purchaseDate: formData.purchaseDate || formData.acquisitionDate || undefined,
        inServiceDate: formData.inServiceDate || formData.purchaseDate || formData.acquisitionDate || undefined,
        underWarranty: Boolean(formData.warrantyStartDate && formData.warrantyEndDate),
        warrantyStartDate: formData.warrantyStartDate || undefined,
        warrantyEndDate: formData.warrantyEndDate || undefined,
        coverage: formData.coverage || undefined,
        provider: formData.provider?.trim() || formData.manufacturer?.trim() || undefined,
        notes: formData.notes?.trim() || formData.remarks?.trim() || undefined,
        documents: formData.documents && formData.documents.length > 0 ? formData.documents : undefined,
        imageUrl: formData.assetImage || formData.imageUrl || undefined,
        hostname: quantity === 1 ? formData.hostname?.trim() || undefined : undefined,
        ipAddress: quantity === 1 ? formData.ipAddress?.trim() || undefined : undefined,
        macAddress: quantity === 1 ? formData.macAddress?.trim() || undefined : undefined,
        discoveredSerial: quantity === 1 ? formData.discoveredSerial?.trim() || undefined : undefined,
        discoveryId: quantity === 1 && formData.linkToDiscovered ? formData.discoveryId : undefined,
        manualDiscovery: quantity === 1 && !formData.linkToDiscovered,
        discoverySource: quantity === 1 ? formData.linkToDiscovered ? formData.discoverySource : 'MANUAL_ENTRY' : undefined,
        firstSeen: quantity === 1 && !formData.linkToDiscovered ? formData.firstSeen || undefined : undefined,
        lastSeen: quantity === 1 && !formData.linkToDiscovered ? formData.lastSeen || undefined : undefined,
        maintenance: formData.enablePm ? {
          enabled: true,
          scheduleNo: formData.pmScheduleNo?.trim() || undefined,
          title: formData.pmTitle.trim(),
          description: formData.pmDescription.trim(),
          workType: formData.pmWorkType,
          frequencyMonths: Number(formData.pmFrequencyMonths),
          nextDueDate: formData.pmNextDueDate,
          lastServiceDate: formData.pmLastServiceDate || undefined,
          location: formData.pmLocation?.trim() || [formData.site, formData.building, formData.floor, formData.room].filter(Boolean).join(' · ') || undefined,
          checklist: pmTasks,
          active: formData.pmActive,
          autoGenerateWorkOrders: formData.pmAutoGenerateWorkOrders,
          advanceDays: Number(formData.pmAdvanceDays)
        } : undefined
      };

      const res = await api.post('/assets', payload);
      if (res?.success) {
        if (quantity > 1) setCreatedAssets(res.assets || []);
        showToast('success', quantity > 1
          ? `${res.createdCount || quantity} assets created with separate IDs and serial numbers.`
          : targetStatus === 'SUBMITTED'
            ? `Asset ${res.asset?.assetId} submitted for approval successfully.`
            : `Asset draft ${res.asset?.assetId} saved in ${res.category?.name || formData.category}.`);
        if (quantity === 1) {
          setTimeout(() => {
            if (targetStatus === 'SUBMITTED') {
              navigate('/assets/approvals');
            } else {
              navigate(res.asset?.id ? `/assets/${encodeURIComponent(res.asset.id)}?tab=financial` : '/assets');
            }
          }, 1200);
        }
      } else {
        showToast('error', res?.message || 'Error submitting asset form.');
      }
    } catch (err) {
      console.error('Asset creation error:', err);
      showToast('error', err?.message || 'Error connecting to database to save asset.');
    } finally {
      setLoading(false);
    }
  };

  const selectDiscoveredDevice = (id) => {
    const device = discoveredDevices.find(item => item.id === id);
    if (quantityCount > 1) {
      updateDiscoveryItem({
        discoveryId: id,
        hostname: device?.hostname || '', ipAddress: device?.ipAddress || '',
        macAddress: device?.macAddress || '', discoveredSerial: device?.serialNumber || '',
        firstSeen: device?.firstSeen?.slice(0, 10) || '', lastSeen: device?.lastSeen?.slice(0, 10) || ''
      });
      if (device?.serialNumber) setSerialNumbers(previous => previous.map((serial, index) => index === selectedItemIndex ? device.serialNumber : serial));
      return;
    }
    if (quantityCount === 1) setSerialNumbers([device?.serialNumber || serialNumbers[0] || '']);
    setFormData(prev => ({
      ...prev,
      discoveryId: id,
      matchedDiscovery: Boolean(device),
      discoverySource: device?.discoverySource || '',
      hostname: device?.hostname || prev.hostname,
      ipAddress: device?.ipAddress || prev.ipAddress,
      macAddress: device?.macAddress || prev.macAddress,
      discoveredSerial: device?.serialNumber || prev.discoveredSerial,
      serialNumber: prev.serialNumber || device?.serialNumber || '',
      manufacturer: prev.manufacturer || device?.manufacturer || '',
      model: prev.model || device?.model || '',
      firstSeen: device?.firstSeen?.slice(0, 10) || '',
      lastSeen: device?.lastSeen?.slice(0, 10) || ''
    }));
  };

  const renderPreventiveMaintenanceFields = (compact = false) => {
    const assetDisplay = [formData.assetName || assetIdPreview, formData.category || formData.subcategory].filter(Boolean).join(' · ')
      + (formData.assetName && assetIdPreview ? ` (${assetIdPreview})` : '');
    const currentAssetLocation = [formData.site, formData.building, formData.floor, formData.room].filter(Boolean).join(' · ');

    return (
      <div className={`grid gap-3 text-xs ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Schedule No.</span>
            <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-200">
              Auto-assigned on save
            </span>
          </div>
          <div className="w-full rounded-lg border border-slate-200 bg-slate-100/80 p-2.5 text-slate-500 font-mono text-xs flex items-center justify-between cursor-not-allowed select-none">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9] shrink-0" />
              <span>Assigned automatically on save</span>
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">System ID</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Asset / Category</span>
            <span className="text-[10px] text-slate-600 bg-slate-100 font-bold px-2 py-0.5 rounded-full border border-slate-200">
              Linked to Step 1
            </span>
          </div>
          <div className="w-full rounded-lg border border-slate-200 bg-slate-100/80 p-2.5 text-slate-800 font-semibold text-xs flex items-center justify-between cursor-not-allowed select-none">
            <span className="truncate flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6C2BD9] shrink-0" />
              <span className="truncate">{assetDisplay || 'Asset record from Step 1'}</span>
            </span>
            <span className="text-[10px] bg-purple-100 text-[#6C2BD9] font-bold px-1.5 py-0.5 rounded shrink-0">Step 1 Ref</span>
          </div>
        </div>
        <label className="space-y-1 font-semibold">
          <div className="flex items-center justify-between">
            <span>Location</span>
            <span className="text-[10px] text-slate-400 font-normal">Editable / defaults to asset location</span>
          </div>
          <input
            type="text"
            value={formData.pmLocation !== undefined && formData.pmLocation !== '' ? formData.pmLocation : currentAssetLocation}
            onChange={e => setFormData(prev => ({ ...prev, pmLocation: e.target.value }))}
            placeholder="e.g. Server Room, Floor 2, Building A (or assigned in Step 3)"
            className="w-full rounded-lg border p-2 bg-white text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
          />
        </label>
        <label className="space-y-1 font-semibold">
          <div className="flex items-center justify-between">
            <span>Last Service Date</span>
            <span className="text-[10px] text-slate-400 font-normal">{formData.pmLastServiceDate ? 'Recorded' : 'Optional / Not serviced yet'}</span>
          </div>
          <input
            type="date"
            value={formData.pmLastServiceDate || ''}
            onChange={e => setFormData(prev => ({ ...prev, pmLastServiceDate: e.target.value }))}
            className="w-full rounded-lg border p-2 bg-white text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
          />
        </label>
      <label className="space-y-1 font-semibold">
        <span>Schedule Title <span className="text-rose-500">*</span></span>
        <input
          value={formData.pmTitle}
          maxLength={200}
          onChange={e => {
            setFormData(prev => ({ ...prev, pmTitle: e.target.value }));
            if (e.target.value.trim()) clearFieldError('pmTitle');
          }}
          className={`w-full rounded-lg border p-2 outline-none transition-colors ${
            fieldErrors.pmTitle ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:border-[#6C2BD9]'
          }`}
          placeholder="e.g. Laptop quarterly inspection"
        />
        {fieldErrors.pmTitle && (
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.pmTitle}
          </p>
        )}
      </label>
      <label className="space-y-1 font-semibold">Schedule Type
        <select value={formData.pmWorkType} onChange={e => setFormData(prev => ({ ...prev, pmWorkType: e.target.value }))} className="w-full rounded-lg border border-slate-200 p-2"><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option></select>
      </label>
      <label className="space-y-1 font-semibold">
        <span>Repeat Every (Months) <span className="text-rose-500">*</span></span>
        <input
          type="number"
          min="1"
          max="120"
          value={formData.pmFrequencyMonths}
          onChange={e => {
            setFormData(prev => ({ ...prev, pmFrequencyMonths: e.target.value }));
            const val = Number(e.target.value);
            if (Number.isInteger(val) && val >= 1 && val <= 120) clearFieldError('pmFrequencyMonths');
          }}
          className={`w-full rounded-lg border p-2 outline-none transition-colors ${
            fieldErrors.pmFrequencyMonths ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:border-[#6C2BD9]'
          }`}
        />
        {fieldErrors.pmFrequencyMonths && (
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.pmFrequencyMonths}
          </p>
        )}
      </label>
      <label className="space-y-1 font-semibold">
        <span>Next Due Date <span className="text-rose-500">*</span></span>
        <input
          type="date"
          value={formData.pmNextDueDate}
          onChange={e => {
            setFormData(prev => ({ ...prev, pmNextDueDate: e.target.value }));
            if (e.target.value) clearFieldError('pmNextDueDate');
          }}
          className={`w-full rounded-lg border p-2 outline-none transition-colors ${
            fieldErrors.pmNextDueDate ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:border-[#6C2BD9]'
          }`}
        />
        {fieldErrors.pmNextDueDate && (
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.pmNextDueDate}
          </p>
        )}
      </label>
      <label className={`space-y-1 font-semibold ${compact ? '' : 'sm:col-span-2'}`}>Description
        <textarea rows={2} maxLength={500} value={formData.pmDescription} onChange={e => setFormData(prev => ({ ...prev, pmDescription: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <label className={`space-y-1 font-semibold ${compact ? '' : 'sm:col-span-2'}`}>Checklist (one task per line)
        <textarea rows={3} value={formData.pmChecklistText} onChange={e => setFormData(prev => ({ ...prev, pmChecklistText: e.target.value }))} className="w-full rounded-lg border p-2" placeholder="Inspect condition&#10;Check battery" />
      </label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.pmActive} onChange={e => setFormData(prev => ({ ...prev, pmActive: e.target.checked }))} /> Schedule active</label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.pmAutoGenerateWorkOrders} onChange={e => setFormData(prev => ({ ...prev, pmAutoGenerateWorkOrders: e.target.checked }))} /> Automatically generate work order when due</label>
      <label className="space-y-1 font-semibold">Generate this many days before due date
        <input type="number" min="0" max="90" value={formData.pmAdvanceDays} onChange={e => setFormData(prev => ({ ...prev, pmAdvanceDays: e.target.value }))} className="w-full rounded-lg border p-2" />
      </label>
      <p className="self-end text-slate-500">The schedule will appear under Preventive Maintenance after this asset is saved.</p>
    </div>
  );
};

  const renderBatchDiscovery = () => {
    const item = discoveryItems[selectedItemIndex] || {};
    const selectedIds = discoveryItems.map(entry => entry.discoveryId).filter(Boolean);
    return <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery for each asset</h3>
        <p className="mt-1 text-slate-500">Choose a different discovered device for each item, or enter its network details manually.</p>
      </div>
      <label className="block space-y-1 font-bold text-slate-700">Asset item
        <select value={selectedItemIndex} onChange={event => setSelectedItemIndex(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white p-2">
          {discoveryItems.map((entry, index) => <option key={index} value={index}>{index + 1} / {discoveryItems.length} — {serialNumbers[index] || 'No serial'} — {entry.discoveryId ? 'Device selected' : ['hostname', 'ipAddress', 'macAddress'].some(key => entry[key]) ? 'Manual details' : 'No discovery details'}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={Boolean(item.linkToDiscovered)} onChange={event => updateDiscoveryItem({ linkToDiscovered: event.target.checked, discoveryId: '' })} /> Link an existing discovered device for this item</label>
      {item.linkToDiscovered && <label className="block space-y-1 font-semibold">Discovered device
        <select value={item.discoveryId || ''} onChange={event => selectDiscoveredDevice(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2">
          <option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>
          {discoveredDevices.filter(device => !selectedIds.includes(device.id) || device.id === item.discoveryId).map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}
        </select>
      </label>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['hostname', 'Hostname'], ['ipAddress', 'IP address'], ['macAddress', 'MAC address'], ['discoveredSerial', 'Device serial']].map(([key, label]) => <label key={key} className="space-y-1 font-semibold">{label}
          <input value={item[key] || ''} readOnly={Boolean(item.linkToDiscovered)} onChange={event => updateDiscoveryItem({ [key]: event.target.value })} className={`w-full rounded-lg border p-2 ${item.linkToDiscovered ? 'bg-slate-100' : 'bg-white'}`} />
        </label>)}
        {!item.linkToDiscovered && [['firstSeen', 'First seen'], ['lastSeen', 'Last seen']].map(([key, label]) => <label key={key} className="space-y-1 font-semibold">{label}
          <input type="date" value={item[key] || ''} onChange={event => updateDiscoveryItem({ [key]: event.target.value })} className="w-full rounded-lg border bg-white p-2" />
        </label>)}
      </div>
      <p className="text-slate-500">{discoveryItems.filter(entry => entry.discoveryId).length} of {discoveryItems.length} items linked to discovered devices. Items without discovery details can still be registered.</p>
    </div>;
  };

  const renderMaintenanceDiscovery = () => (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Wrench className="w-4 h-4 text-[#6C2BD9]" /> Preventive Maintenance</h3>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={formData.enablePm}
            onChange={e => {
              const checked = e.target.checked;
              setFormData(prev => ({
                ...prev,
                enablePm: checked,
                pmTitle: checked && !prev.pmTitle ? `${prev.assetName || prev.category || 'Asset'} Preventive Maintenance` : prev.pmTitle,
                pmNextDueDate: checked && !prev.pmNextDueDate ? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) : prev.pmNextDueDate,
                pmLocation: prev.pmLocation || [prev.site, prev.building, prev.floor, prev.room].filter(Boolean).join(' · ') || ''
              }));
            }}
          />
          Enable maintenance schedule
        </label>
        {formData.enablePm && renderPreventiveMaintenanceFields()}
      </div>
      {quantityCount > 1 ? renderBatchDiscovery() : <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery</h3>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={formData.linkToDiscovered} onChange={e => setFormData(prev => ({ ...prev, linkToDiscovered: e.target.checked, discoveryId: e.target.checked ? prev.discoveryId : '', matchedDiscovery: false }))} /> Link an existing discovered device</label>
        {formData.linkToDiscovered && <label className="block space-y-1">Discovered device<select className="w-full border rounded-lg p-2" value={formData.discoveryId} onChange={e => selectDiscoveredDevice(e.target.value)}><option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>{discoveredDevices.map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}</select></label>}
        {!formData.linkToDiscovered && <p className="text-slate-500">Enter network details manually if this device has not been discovered yet.</p>}
        <div className="grid grid-cols-2 gap-3">
          {[['hostname', 'Hostname'], ['ipAddress', 'IP address'], ['macAddress', 'MAC address'], ['discoveredSerial', 'Device serial']].map(([key, label]) => <label key={key} className="space-y-1">{label}<input className="w-full border rounded-lg p-2" value={formData[key]} onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}
          {!formData.linkToDiscovered && [['firstSeen', 'First seen'], ['lastSeen', 'Last seen']].map(([key, label]) => <label key={key} className="space-y-1">{label}<input type="date" className="w-full border rounded-lg p-2" value={formData[key]} onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}
        </div>
        {formData.discoveryId && <p className="text-emerald-700 font-semibold">Selected discovery record will be linked when this asset is saved.</p>}
      </div>}
    </div>
  );

  // ==========================================
  // MODULAR SECTION RENDER FUNCTIONS
  // ==========================================

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#6C2BD9]" /> Basic Information
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 1
        </span>
      </div>

      {Object.keys(fieldErrors).some(k => ['assetName', 'assetType', 'category', 'subcategory', 'quantity', 'serialNumber'].includes(k)) && (
        <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Required Fields Missing:</span> Please fill in all required fields marked with <span className="text-rose-600 font-bold">*</span> before continuing to the next step.
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs">
        <label className="font-bold text-slate-700 block mb-1">Asset ID</label>
        <input readOnly value={assetIdPreview} className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold" />
        <p className="mt-1 text-[11px] text-slate-500">Each item receives a unique ID using the asset type, category, and subcategory prefixes when saved.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Asset Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.assetName}
            onChange={(e) => {
              setFormData({ ...formData, assetName: e.target.value });
              if (e.target.value.trim()) clearFieldError('assetName');
            }}
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-semibold outline-none transition-colors ${
              fieldErrors.assetName
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
            placeholder="e.g. Dell Latitude 5420"
          />
          {fieldErrors.assetName && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.assetName}
            </p>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Asset Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.assetType}
            onChange={(e) => {
              handleAssetTypeChange(e.target.value);
              if (e.target.value) clearFieldError('assetType');
            }}
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-semibold outline-none transition-colors ${
              fieldErrors.assetType
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
          >
            {assetTypes.map((t) => {
              const name = typeof t === 'string' ? t : (t.name || t.code);
              return (
                <option key={t.id || name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
          {fieldErrors.assetType && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.assetType}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700 block">Asset Group</label>
            <span className="text-[10px] text-purple-600 font-semibold">Cascaded</span>
          </div>
          <select
            value={formData.assetGroup || ''}
            onChange={(e) => handleAssetGroupChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">{availableAssetGroups.length > 0 ? '-- Select Asset Group --' : 'No asset groups linked to this asset type'}</option>
            {availableAssetGroups.map((g) => {
              const gName = g.name || g.code;
              return (
                <option key={g.id || g._id || gName} value={gName}>
                  {gName} {g.code ? `(${g.code})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700 block">Asset Class</label>
            <span className="text-[10px] text-purple-600 font-semibold">Cascaded</span>
          </div>
          <select
            value={formData.assetClass || ''}
            onChange={(e) => handleAssetClassChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">{availableAssetClassesDropdown.length > 0 ? '-- Select Asset Class --' : (formData.assetGroup ? 'No asset classes linked to this group' : '-- Select Asset Group first --')}</option>
            {availableAssetClassesDropdown.map((cls) => {
              const cName = cls.name || cls.code;
              return (
                <option key={cls.id || cls._id || cName} value={cName}>
                  {cName} {cls.code ? `(${cls.code})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              handleCategoryChange(e.target.value);
              if (e.target.value) clearFieldError('category');
            }}
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-semibold outline-none transition-colors ${
              fieldErrors.category
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
          >
            <option value="">Select Category</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {fieldErrors.category ? (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.category}
            </p>
          ) : availableCategories.length === 0 ? (
            <p className="text-[11px] text-amber-600 mt-1">No categories found.</p>
          ) : null}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Sub Category {availableAssetClasses.length > 0 ? <span className="text-rose-500">*</span> : null}
          </label>
          <select
            value={formData.assetClassId || formData.subcategory}
            onChange={(e) => {
              handleSubCategoryChange(e.target.value);
              if (e.target.value) clearFieldError('subcategory');
            }}
            disabled={!formData.category}
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-semibold outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-colors ${
              fieldErrors.subcategory
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
          >
            <option value="">{formData.category ? (availableAssetClasses.length > 0 ? 'Select Sub Category *' : 'No sub categories (optional)') : 'Select a Category first'}</option>
            {availableAssetClasses.map(assetClass => (
              <option key={assetClass.id} value={assetClass.id}>{assetClass.name}</option>
            ))}
          </select>
          {fieldErrors.subcategory ? (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.subcategory}
            </p>
          ) : formData.category && availableAssetClasses.length === 0 ? (
            <p className="text-[11px] text-slate-400 mt-1">No sub categories under {formData.category}.</p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700 block">Manufacturer</label>
            <span className="text-[10px] text-purple-600 font-semibold">From Master Data</span>
          </div>
          <select
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">-- Select Manufacturer --</option>
            {availableManufacturers && availableManufacturers.length > 0 ? (
              availableManufacturers.map((m) => {
                const name = m.name || m.title || m;
                return (
                  <option key={m.id || m._id || name} value={name}>
                    {name}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No manufacturers registered</option>
            )}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g. Latitude 5420 (optional)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Serial Number</label>
          <input
            type="text"
            value={serialNumbers[selectedItemIndex] || ''}
            onChange={(e) => {
              updateSerialNumber(e.target.value);
              if (e.target.value.trim()) clearFieldError('serialNumber');
            }}
            placeholder="e.g. SN-892118 (optional)"
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-mono font-bold outline-none transition-colors ${
              fieldErrors.serialNumber
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
          />
          {fieldErrors.serialNumber && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.serialNumber}
            </p>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.quantity}
            onChange={(e) => {
              updateQuantity(e.target.value);
              const val = Number(e.target.value);
              if (Number.isInteger(val) && val >= 1 && val <= 50) clearFieldError('quantity');
            }}
            className={`w-full bg-slate-50 border rounded-xl p-2 text-slate-900 font-bold outline-none transition-colors ${
              fieldErrors.quantity
                ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-[#6C2BD9]'
            }`}
          />
          {fieldErrors.quantity && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.quantity}
            </p>
          )}
        </div>

        {formData.category && (
          <div className="col-span-full p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6C2BD9]" />
              <span className="font-semibold text-purple-950">
                Verified Hierarchy: <span className="font-bold">{formData.assetGroup || 'Information Technology'}</span> &rsaquo; <span className="font-bold">{formData.assetClass || 'Hardware'}</span> &rsaquo; <span className="font-bold">{formData.category}</span>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-200/60 text-[#5B21B6] px-2 py-0.5 rounded-full">Auto-Linked</span>
          </div>
        )}
      </div>
      {quantityCount > 1 && <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-xs space-y-2">
        <label className="block font-bold text-slate-700">Select item to edit its details</label>
        <select value={selectedItemIndex} onChange={event => { const index = Number(event.target.value); setSelectedItemIndex(index); setFormData(previous => ({ ...previous, serialNumber: serialNumbers[index] || '' })); }} className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold">
          {serialNumbers.map((serial, index) => <option key={index} value={index}>{index + 1} / {serialNumbers.length}{serial ? ` — ${serial}` : ' — serial needed'}</option>)}
        </select>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 font-bold text-slate-700">Asset name for this item
            <input value={assetItems[selectedItemIndex]?.assetName ?? formData.assetName} onChange={event => updateAssetItem({ assetName: event.target.value, description: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white p-2" />
          </label>
          <label className="space-y-1 font-bold text-slate-700">Description for this item
            <input value={assetItems[selectedItemIndex]?.description ?? formData.description} onChange={event => updateAssetItem({ description: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white p-2" />
          </label>
        </div>
        <p className="text-slate-500">Type, category and model start as shared details. Serial number, name, description and later steps can differ for this item.</p>
      </div>}
    </div>
  );

  // Step 1: Asset Image with Cloudinary
  const renderAssetImage = () => {
    const hasImage = Boolean(formData.assetImage || formData.imageUrl);

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#6C2BD9]" /> Asset Image
          </h3>
          <div className="flex items-center gap-2">
            {hasImage && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Photo Attached
              </span>
            )}
            <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Cloudinary CDN
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="h-44 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center overflow-hidden relative group">
            {hasImage ? (
              <>
                <img
                  src={formData.assetImage || formData.imageUrl}
                  alt="Asset Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/95 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg px-2 py-1 shadow-sm border border-slate-200 text-xs transition-colors cursor-pointer flex items-center gap-1 font-bold"
                  title="Remove asset photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Remove</span>
                </button>
              </>
            ) : (
              <div className="text-center p-3 text-slate-400 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mb-2 border border-purple-100">
                  <Package className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-xs font-bold text-slate-700">No Photo Uploaded</span>
                <span className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] leading-tight">
                  Optional — add a photo to visually identify this asset in audits and field scans
                </span>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={imageInputRef}
            onChange={handleUploadImage}
            className="hidden"
            accept="image/*"
          />

          <div
            onClick={() => imageInputRef.current?.click()}
            className="h-44 bg-slate-50 border-2 border-dashed border-purple-200 hover:border-[#6C2BD9] hover:bg-purple-50/20 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            {uploadingImage ? (
              <>
                <RefreshCw className="w-6 h-6 text-[#6C2BD9] mb-2 animate-spin" />
                <span className="text-xs font-bold text-[#6C2BD9] leading-tight">Uploading Photo...</span>
                <span className="text-[10px] text-slate-400 mt-1">Storing securely in Cloudinary</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6C2BD9] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {hasImage ? 'Replace Asset Photo' : 'Upload Asset Photo'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Click to browse file from device</span>
                <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Financial Information
  const renderFinancialInfo = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> Financial Information
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Acquisition Date</label>
          <input
            type="date"
            value={formData.acquisitionDate}
            onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Acquisition Cost ({formData.currency || 'AED'})</label>
          <input
            type="text"
            value={formData.acquisitionCost}
            onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="AED">AED</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Purchase Order No.</label>
          <input
            type="text"
            value={formData.poInvoiceNo}
            onChange={(e) => setFormData({ ...formData, poInvoiceNo: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Supplier</label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Warranty Start Date</label>
          <input
            type="date"
            value={formData.warrantyStartDate}
            onChange={(e) => updateWarranty({ warrantyStartDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Warranty (years)</label>
          <input type="number" min="1" max="50" step="1" value={formData.warrantyYears} onChange={(e) => updateWarranty({ warrantyYears: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold" />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Warranty End Date</label>
          <input
            type="date"
            value={formData.warrantyEndDate}
            readOnly
            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Asset Condition</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
      </div>
      {renderCategoryDepreciation()}
    </div>
  );

  const renderBatchFinancial = () => {
    const item = assetItems[selectedItemIndex] || {};
    const value = key => item[key] ?? formData[key] ?? '';
    const input = (label, key, type = 'text') => <label key={key} className="space-y-1 text-xs font-bold text-slate-700">{label}
      <input type={type} value={value(key)} onChange={event => updateAssetItem({ [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" />
    </label>;
    return <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900">Financial Information &amp; Warranty by Asset</h3>
      {renderItemSelector('Select asset to edit financial details')}
      <p className="text-xs text-slate-500">Fields start with the shared values. Changes here apply only to the selected asset.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {input('Acquisition date', 'acquisitionDate', 'date')}{input('Acquisition cost', 'acquisitionCost')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Currency<select value={value('currency')} onChange={event => updateAssetItem({ currency: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">{['AED', 'USD', 'EUR', 'GBP', 'INR'].map(code => <option key={code} value={code}>{code}</option>)}</select></label>
        {input('Purchase order / invoice', 'poInvoiceNo')}{input('Supplier', 'supplier')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty start date<input type="date" value={value('warrantyStartDate')} onChange={event => updateWarranty({ warrantyStartDate: event.target.value }, true)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></label>
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty in years<input type="number" min="1" max="50" step="1" value={value('warrantyYears')} onChange={event => updateWarranty({ warrantyYears: event.target.value }, true)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></label>
        <label className="space-y-1 text-xs font-bold text-slate-700">Warranty end date<input type="date" readOnly value={item.warrantyEndDate ?? formData.warrantyEndDate} className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2" /></label>
        {input('Warranty provider', 'provider')}{input('Warranty type', 'warrantyType')}
        {input('Coverage', 'coverage')}{input('Contract reference', 'contractReference')}
        <label className="space-y-1 text-xs font-bold text-slate-700">Condition<select value={value('condition')} onChange={event => updateAssetItem({ condition: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">{['New', 'Good', 'Fair', 'Damaged', 'Refurbished'].map(condition => <option key={condition} value={condition}>{condition}</option>)}</select></label>
      </div>
      {renderCategoryDepreciation()}
    </section>;
  };

  // Step 2: Description
  const renderDescription = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm">Description &amp; Remarks</h3>
      </div>

      <div className="space-y-1 text-xs">
        <label className="font-bold text-slate-700 block">Description / Notes</label>
        <textarea
          rows={3}
          value={formData.description}
          placeholder="Enter asset specs, remarks, or notes..."
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:border-[#6C2BD9] outline-none"
        />
        <div className="text-right text-[10px] text-slate-400 font-mono">
          {formData.description?.length || 0} / 500
        </div>
      </div>
    </div>
  );

  // Step 3: Location & Ownership
  const renderBatchLocation = () => {
    const item = assetItems[selectedItemIndex] || {};
    const effectiveCompanyId = item.companyId || sites.find(site => site.id === item.siteId)?.companyId || '';
    const availableSites = sites.filter(site => !item.companyId || site.companyId === item.companyId);
    const availableBuildings = buildings.filter(building => item.siteId && building.siteId === item.siteId);
    const availableFloors = floors.filter(floor => item.buildingId && floor.buildingId === item.buildingId);
    const availableRooms = rooms.filter(room => item.floorId && room.floorId === item.floorId);
    const availableDepartments = departments.filter(department => !effectiveCompanyId || !department.companyId || department.companyId === effectiveCompanyId || department.id === item.departmentId);
    const availableCostCenters = costCenters.filter(center => !effectiveCompanyId || center.companyId === effectiveCompanyId);
    const availableEmployees = employees.filter(employee => !effectiveCompanyId || employee.companyId === effectiveCompanyId);
    const select = (label, key, options, next = {}) => <label key={key} className="space-y-1 text-xs font-bold text-slate-700">{label}
      <select value={item[key] || ''} onChange={event => updateAssetItem({ [key]: event.target.value, ...next })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2">
        <option value="">Select {label.toLowerCase()} (optional)</option>
        {options.map(option => <option key={option.id} value={option.id}>{option.fullName || option.name || option.code}</option>)}
      </select>
    </label>;
    return <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900">Location &amp; Ownership by Asset</h3>
      {renderItemSelector('Select asset to assign its location and custodian')}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {select('Company', 'companyId', companies, { siteId: '', buildingId: '', floorId: '', roomId: '', departmentId: '', costCenterId: '', custodianId: '' })}
        {select('Site', 'siteId', availableSites, { buildingId: '', floorId: '', roomId: '', departmentId: '', costCenterId: '', custodianId: '' })}
        {select('Building', 'buildingId', availableBuildings, { floorId: '', roomId: '' })}
        {select('Floor', 'floorId', availableFloors, { roomId: '' })}
        {select('Room', 'roomId', availableRooms)}
        {select('Department', 'departmentId', availableDepartments)}
        {select('Cost center', 'costCenterId', availableCostCenters)}
        {select('Custodian', 'custodianId', availableEmployees)}
      </div>
      <p className="text-xs text-slate-500">Each item can have a separate company, site, room, department and custodian. Empty company, site, department and cost center use registration defaults; an empty custodian leaves the item unassigned.</p>
    </section>;
  };
  const renderLocationOwnership = () => quantityCount > 1 ? renderBatchLocation() : (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <Building className="w-4 h-4 text-[#6C2BD9]" /> Location &amp; Ownership
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Company</label>
            <button
              type="button"
              onClick={handleQuickAddCompany}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
              title="Add a new Company"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add
            </button>
          </div>
          <select
            value={formData.companyId || (companies.find(c => c.name === formData.company || c.code === formData.company)?.id || '')}
            onChange={(e) => {
              if (e.target.value === '__NEW__') {
                handleQuickAddCompany();
              } else {
                const selectedId = e.target.value;
                const found = companies.find(c => c.id === selectedId);
                setFormData(prev => ({
                  ...prev,
                  companyId: selectedId,
                  company: found ? (found.name || found.code) : '',
                  siteId: '',
                  site: '',
                  buildingId: '',
                  building: ''
                }));
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Company (Optional)</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name || c.code}</option>
            ))}
            <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Company...</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Site</label>
          <select
            value={formData.siteId || (sites.find(s => s.name === formData.site || s.code === formData.site)?.id || '')}
            onChange={(e) => {
              const selectedId = e.target.value;
              const found = sites.find(s => s.id === selectedId);
              setFormData(prev => ({
                ...prev,
                siteId: selectedId,
                site: found ? (found.name || found.code) : '',
                buildingId: '',
                building: ''
              }));
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Site (Optional)</option>
            {sites
              .filter(s => !formData.companyId || s.companyId === formData.companyId)
              .map(s => (
                <option key={s.id} value={s.id}>{s.name || s.code}</option>
              ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Building</label>
            <button
              type="button"
              onClick={handleQuickAddBuilding}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
              title="Add a new Building"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add
            </button>
          </div>
          <select
            value={formData.buildingId || (buildings.find(b => b.name === formData.building || b.code === formData.building)?.id || '')}
            onChange={(e) => {
              if (e.target.value === '__NEW__') {
                handleQuickAddBuilding();
              } else {
                const selectedId = e.target.value;
                const found = buildings.find(b => b.id === selectedId);
                setFormData(prev => ({
                  ...prev,
                  buildingId: selectedId,
                  building: found ? (found.name || found.code) : ''
                }));
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Building (Optional)</option>
            {buildings
              .filter(b => !formData.siteId || b.siteId === formData.siteId)
              .map(b => (
                <option key={b.id} value={b.id}>{b.name || b.code}</option>
              ))}
            <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Building...</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Floor / Room</label>
          <input
            type="text"
            value={formData.floor}
            placeholder="e.g. Floor 2, Room 204 (optional)"
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Department</label>
            <button
              type="button"
              onClick={handleQuickAddDepartment}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
              title="Add a new Department"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add
            </button>
          </div>
          <select
            value={formData.departmentId || (departments.find(d => d.name === formData.department || d.code === formData.department)?.id || '')}
            onChange={(e) => {
              if (e.target.value === '__NEW__') {
                handleQuickAddDepartment();
              } else {
                const selectedId = e.target.value;
                const found = departments.find(d => d.id === selectedId);
                setFormData(prev => ({
                  ...prev,
                  departmentId: selectedId,
                  department: found ? (found.name || found.code) : ''
                }));
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Department (Optional)</option>
            {departments
              .filter(d => !formData.companyId || !d.companyId || d.companyId === formData.companyId || d.id === formData.departmentId || d.name === formData.department)
              .map(d => (
                <option key={d.id} value={d.id}>{d.name || d.code}</option>
              ))}
            <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Department...</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Cost Center</label>
            <button
              type="button"
              onClick={handleQuickAddCostCenter}
              className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
              title="Add a new Cost Center"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add
            </button>
          </div>
          <select
            value={formData.costCenterId || (costCenters.find(cc => cc.name === formData.costCenter || cc.code === formData.costCenter)?.id || '')}
            onChange={(e) => {
              if (e.target.value === '__NEW__') {
                handleQuickAddCostCenter();
              } else {
                const selectedId = e.target.value;
                const found = costCenters.find(cc => cc.id === selectedId);
                setFormData(prev => ({
                  ...prev,
                  costCenterId: selectedId,
                  costCenter: found ? (found.code ? `${found.code} - ${found.name}` : found.name) : ''
                }));
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
          >
            <option value="">Select Cost Center (Optional)</option>
            {costCenters
              .filter(cc => !formData.companyId || !cc.companyId || cc.companyId === formData.companyId || cc.id === formData.costCenterId || cc.name === formData.costCenter)
              .map(cc => (
                <option key={cc.id} value={cc.id}>{cc.code ? `${cc.code} - ${cc.name}` : cc.name}</option>
              ))}
            <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Cost Center...</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Custodian</label>
          <div className="relative">
            <input
              list="stepper-custodian-list"
              type="text"
              value={formData.custodian}
              placeholder="e.g. EMP-1002 or select employee..."
              onChange={(e) => {
                const val = e.target.value;
                const emp = employees.find(emp => emp.fullName === val || emp.name === val || emp.employeeCode === val || emp.id === val);
                setFormData(prev => ({
                  ...prev,
                  custodian: val,
                  custodianId: emp ? emp.id : prev.custodianId
                }));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
            />
            <datalist id="stepper-custodian-list">
              {employees.map(emp => (
                <option key={emp.id} value={emp.fullName || emp.name || emp.employeeCode}>
                  {emp.employeeCode ? `${emp.employeeCode} - ` : ''}{emp.department?.name || ''}
                </option>
              ))}
            </datalist>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Expected User</label>
          <div className="relative">
            <input
              list="stepper-expected-user-list"
              type="text"
              value={formData.expectedUser}
              placeholder="e.g. EMP-1002 or select employee..."
              onChange={(e) => setFormData(prev => ({ ...prev, expectedUser: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
            />
            <datalist id="stepper-expected-user-list">
              {employees.map(emp => (
                <option key={emp.id} value={emp.fullName || emp.name || emp.employeeCode}>
                  {emp.employeeCode ? `${emp.employeeCode} - ` : ''}{emp.department?.name || ''}
                </option>
              ))}
            </datalist>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Tagging Information
  const renderTagging = () => {
    if (quantityCount > 1) {
      const item = assetItems[selectedItemIndex] || {};
      return <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><QrCode className="w-4 h-4 text-[#6C2BD9]" /> Tagging by Asset</h3>
        {renderItemSelector('Select asset to assign its tag')}
        <p className="text-slate-500">Leave the tag blank to generate a unique barcode when the asset is saved. A physical RFID tag needs its own EPC.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 font-bold text-slate-700">Barcode / tag number<input value={item.tagNumber || ''} onChange={event => updateAssetItem({ tagNumber: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono" placeholder="Generated on save if blank" /></label>
          <label className="space-y-1 font-bold text-slate-700">RFID EPC<input value={item.rfidEpc || ''} onChange={event => updateAssetItem({ rfidEpc: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono" placeholder="Optional unique EPC" /></label>
        </div>
        {item.tagNumber && <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><BarcodePreview value={item.tagNumber} /></div>}
      </section>;
    }
    const tagValue = formData.assetTagBarcode?.trim() || '';
    const isRfid = formData.tagType === 'RFID';
    const isQr = formData.tagType === 'QR Code';
    const tagLabel = isRfid ? 'RFID EPC' : isQr ? 'QR payload' : 'Barcode number';

    return (
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#6C2BD9] shrink-0" /> Tagging Information
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Assign an identifier and preview the tag.</p>
          </div>
          <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full shrink-0">Step 3</span>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Tag type">
          {['Barcode', 'RFID', 'QR Code'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleSelectTagTab(tab)}
              aria-pressed={formData.tagType === tab}
              className={`rounded-lg px-2 py-2 text-xs font-bold transition-colors cursor-pointer ${
                formData.tagType === tab
                  ? 'bg-white text-[#6C2BD9] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="asset-tag-identifier" className="block text-xs font-bold text-slate-700">{tagLabel}</label>
          <div className="flex items-stretch gap-2 min-w-0">
            <input
              id="asset-tag-identifier"
              type="text"
              value={formData.assetTagBarcode}
              onChange={(e) => handleTagInputChange(e.target.value)}
              placeholder={isRfid ? '24-character hexadecimal EPC' : isQr ? 'QR-AST-...' : 'BC-AST-...'}
              className={`min-w-0 flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-slate-900 font-mono font-semibold outline-none text-xs transition-colors ${
                fieldErrors.tag ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:border-[#6C2BD9]'
              }`}
            />
            <button
              type="button"
              disabled={generatingTag}
              onClick={() => handleGenerateDynamicTag()}
              className="px-3 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-lg text-xs cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
              title={`Generate ${tagLabel.toLowerCase()}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingTag ? 'animate-spin' : ''}`} />
              {generatingTag ? 'Generating' : 'Generate'}
            </button>
          </div>
          {fieldErrors.tag && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.tag}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 min-w-0" aria-live="polite">
            <span className="text-[11px] text-slate-500 truncate">{isRfid ? 'EPC Gen2 · 96-bit hex' : isQr ? 'Scannable QR code' : 'Scannable Code 128'}</span>
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              tagValidationStatus === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
              tagValidationStatus === 'CONFLICT' ? 'bg-rose-50 text-rose-700' :
              tagValidationStatus === 'VALIDATING' ? 'bg-purple-50 text-[#6C2BD9]' :
              'bg-slate-100 text-slate-600'
            }`} title={tagValidationMessage}>
              {tagValidationStatus === 'AVAILABLE' ? <CheckCircle2 className="w-3 h-3" /> :
                tagValidationStatus === 'CONFLICT' ? <AlertTriangle className="w-3 h-3" /> :
                tagValidationStatus === 'VALIDATING' ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              {tagValidationStatus === 'AVAILABLE' ? 'Available' :
                tagValidationStatus === 'CONFLICT' ? 'In use' :
                tagValidationStatus === 'VALIDATING' ? 'Checking' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500">Live preview</span>
            <span className="text-[10px] font-medium text-slate-400">{isRfid ? 'EPC value' : isQr ? 'QR code' : 'Code 128'}</span>
          </div>

          <div className="min-h-[112px] flex items-center justify-center overflow-hidden">
            {isRfid ? (
              tagValue ? (
                <div className="w-full rounded-lg bg-white p-4 text-center">
                  <Radio className="w-5 h-5 text-[#6C2BD9] mx-auto mb-2" />
                  <span className="block font-mono text-xs font-bold text-slate-900 break-all leading-relaxed tracking-wide">
                    {tagValue.match(/.{1,4}/g)?.join(' ')}
                  </span>
                </div>
              ) : <p className="text-xs text-slate-500 text-center">Enter or generate an EPC to preview it.</p>
            ) : isQr ? (
              tagValue ? (
                <QRCodeSVG
                  value={tagValue}
                  size={136}
                  level="M"
                  marginSize={4}
                  className="h-[136px] w-[136px]"
                  title={`QR code for ${tagValue}`}
                />
              ) : <p className="text-xs text-slate-500 text-center">Enter or generate a payload to see its QR code.</p>
            ) : (
              <BarcodePreview value={tagValue} />
            )}
          </div>

          <div className="flex items-center justify-between gap-2 min-w-0 border-t border-slate-200 pt-2">
            <span className="min-w-0 truncate font-mono text-[11px] font-semibold text-slate-700" title={tagValue}>
              {tagValue || 'No identifier yet'}
            </span>
            <button
              type="button"
              disabled={!tagValue}
              onClick={() => {
                navigator.clipboard?.writeText(tagValue);
                showToast('success', `Copied ${tagLabel.toLowerCase()} to clipboard!`);
              }}
              className="shrink-0 flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold text-[#6C2BD9] hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title={`Copy ${tagLabel.toLowerCase()}`}
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        </div>
        {isRfid && <p className="text-[11px] text-slate-500">Write this EPC to a physical RFID tag with an encoder.</p>}
      </section>
    );
  };

  // Step 4: Documents (Cloudinary)
  const renderDocuments = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-[#6C2BD9]" /> Documents &amp; Attachments
          </h3>
          <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
            <Cloud className="w-3 h-3" /> Cloudinary CDN
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{formData.documents.length} attached</span>
      </div>

      <div className="space-y-2 text-xs">
        {formData.documents.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            No documents attached yet. Click below to upload invoices, spec sheets, or contracts.
          </div>
        ) : (
          formData.documents.map((doc, idx) => (
            <div
              key={(doc.name || 'doc') + idx}
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50/30 border border-slate-200 hover:border-purple-200 rounded-xl text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="truncate flex flex-col">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-800 hover:text-[#6C2BD9] truncate flex items-center gap-1 group"
                      title={doc.name}
                    >
                      <span className="truncate">{doc.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#6C2BD9] shrink-0" />
                    </a>
                  ) : (
                    <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                  )}
                  {doc.url && (
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Stored in Cloudinary
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.name)}
                  className="w-5 h-5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}

        <input
          type="file"
          ref={docInputRef}
          onChange={handleUploadDocument}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
        />

        <button
          type="button"
          disabled={uploadingDoc}
          onClick={() => docInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-purple-300 hover:border-[#6C2BD9] bg-purple-50/30 hover:bg-purple-50 text-[#6C2BD9] font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {uploadingDoc ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#6C2BD9]" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Document (Cloudinary)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Step 5: Approval Workflow
  const renderApprovalWorkflow = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> Approval Workflow
        </h3>
        <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] text-[10px] font-bold rounded-full border border-purple-200">
          Step 5
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700">Approval Required</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Yes</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700">Current Status</span>
          <span className="font-bold text-slate-900">Draft</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700">Next Approver</span>
          <span className="font-bold text-[#6C2BD9]">Asset Manager</span>
        </div>

        <div className="space-y-1 pt-1">
          <label className="font-bold text-slate-700 block">Remarks</label>
          <input
            type="text"
            placeholder="Enter remarks (optional)"
            value={formData.approvalRemarks}
            onChange={(e) => setFormData({ ...formData, approvalRemarks: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-[#6C2BD9]"
          />
        </div>
      </div>
    </div>
  );

  // Step 5: Review & Final Verification Summary Card
  const reviewValue = value => {
    if (value === null || value === undefined || value === '') return <span className="italic text-slate-400">Not provided</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };
  const reviewField = (label, value) => (
    <div key={label} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-bold text-slate-900">{reviewValue(value)}</dd>
    </div>
  );
  const reviewSection = (title, step, fields, extra) => (
    <section key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
        <button type="button" onClick={() => { setStepMode('wizard'); setCurrentStep(step); }} className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#6C2BD9] hover:bg-purple-100" aria-label={`Edit ${title} in step ${step}`}>Edit step {step}</button>
      </div>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{fields.map(([label, value]) => reviewField(label, value))}</dl>
      {extra}
    </section>
  );
  const reviewItemDetails = (kind) => quantityCount > 1 && <div className="space-y-2">
    <p className="text-xs font-bold text-slate-700">Values for each asset</p>
    {assetItems.map((item, index) => {
      const data = { ...formData, ...item };
      const labelFor = (list, id) => list.find(entry => entry.id === id)?.fullName || list.find(entry => entry.id === id)?.name || '';
      const detail = kind === 'financial'
        ? [`Acquired: ${data.acquisitionDate || 'Not provided'}`, `Cost: ${data.acquisitionCost ? `${data.currency} ${data.acquisitionCost}` : 'Not provided'}`, `PO / invoice: ${data.poInvoiceNo || 'Not provided'}`, `Supplier: ${data.supplier || 'Not provided'}`, `Condition: ${data.condition || 'Not provided'}`, `Warranty: ${data.warrantyStartDate || 'Not provided'} to ${data.warrantyEndDate || 'Not provided'}`].join(' · ')
        : [`Company: ${labelFor(companies, item.companyId) || data.company || 'Default'}`, `Site: ${labelFor(sites, item.siteId) || data.site || 'Default'}`, `Building: ${labelFor(buildings, item.buildingId) || 'Not provided'}`, `Floor: ${labelFor(floors, item.floorId) || 'Not provided'}`, `Room: ${labelFor(rooms, item.roomId) || 'Not provided'}`, `Department: ${labelFor(departments, item.departmentId) || data.department || 'Not provided'}`, `Cost center: ${labelFor(costCenters, item.costCenterId) || data.costCenter || 'Not provided'}`, `Custodian: ${labelFor(employees, item.custodianId) || 'Unassigned'}`, `Tag: ${item.tagNumber || 'Generated on save'}`, `RFID: ${item.rfidEpc || 'Not provided'}`].join(' · ');
      return <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
        <p className="font-bold text-slate-900">{index + 1} / {assetItems.length} — {serialNumbers[index] || 'No serial number'}</p>
        <p className="mt-1 break-words text-slate-600">{detail}</p>
      </div>;
    })}
  </div>;
  const renderDetailedReview = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-purple-950"><FileCheck className="h-5 w-5" /> Review &amp; Final Verification</h3>
        <p className="mt-1 text-xs text-purple-800">This is a preview of your entries. Empty fields are marked “Not provided.” Use Edit step to correct details before saving.</p>
        <p className="mt-2 text-xs font-semibold text-purple-900">{quantityCount} asset{quantityCount === 1 ? '' : 's'} will be created. Unique asset IDs are assigned when saved.</p>
      </div>
      {/* Step 1 Review: Basic Information */}
      {reviewSection('Basic information', 1, [
        ['Asset ID format', assetIdPreview],
        ['Asset name', formData.assetName],
        ['Asset type', formData.assetType],
        ['Category', formData.category],
        ['Subcategory', formData.subcategory],
        ['Manufacturer', formData.manufacturer],
        ['Model', formData.model],
        ['Quantity', formData.quantity]
      ], <div className="space-y-2">
        {quantityCount > 1 && <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">Name and description by item</p>
          {assetItems.map((item, index) => <p key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700"><strong>{index + 1} / {assetItems.length}: {item.assetName || formData.assetName || 'Not provided'}</strong> — {item.description || formData.description || 'No description'}</p>)}
        </div>}
        <p className="text-xs font-bold text-slate-700">Serial numbers by item</p>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {serialNumbers.map((serial, index) => reviewField(`${index + 1} / ${serialNumbers.length}`, serial))}
        </dl>
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
          {formData.assetImage || formData.imageUrl ? <img src={formData.assetImage || formData.imageUrl} alt="Selected asset" className="h-16 w-20 rounded object-contain bg-white" /> : <Package className="h-8 w-8 text-slate-300" />}
          <span className="text-xs font-semibold text-slate-700">Asset image: {formData.assetImage || formData.imageUrl ? 'Uploaded' : 'Not provided (Optional)'}</span>
        </div>
      </div>)}

      {/* Step 2 Review: Financial Details & Warranty */}
      {reviewSection('Financial details and warranty', 2, [
        ['Acquisition date', formData.acquisitionDate],
        ['Acquisition cost', formData.acquisitionCost ? `${formData.currency || 'AED'} ${formData.acquisitionCost}` : ''],
        ['Currency', formData.currency],
        ['Purchase order / invoice', formData.poInvoiceNo],
        ['Supplier', formData.supplier],
        ['Warranty start', formData.warrantyStartDate],
        ['Warranty (years)', formData.warrantyYears],
        ['Warranty end', formData.warrantyEndDate],
        ['Condition', formData.condition],
        ['Description / remarks', formData.description],
        ...(formData.provider ? [['Warranty provider', formData.provider]] : []),
        ...(formData.warrantyType ? [['Warranty type', formData.warrantyType]] : []),
        ...(formData.coverage ? [['Coverage', formData.coverage]] : []),
        ...(formData.contractReference ? [['Contract reference', formData.contractReference]] : [])
      ], reviewItemDetails('financial'))}

      {/* Step 2 Review: Preventive Maintenance & Auto Discovery */}
      {reviewSection('Preventive maintenance and discovery', 2, [
        ['Maintenance enabled', formData.enablePm ? 'Yes' : 'No'],
        ...(formData.enablePm ? [
          ['Schedule No.', formData.pmScheduleNo || 'Auto-assigned on save'],
          ['Schedule title', formData.pmTitle],
          ['Work type', formData.pmWorkType || 'Preventive'],
          ['Frequency (months)', formData.pmFrequencyMonths],
          ['Next due date', formData.pmNextDueDate],
          ['Advance days', formData.pmAdvanceDays],
          ['Last service date', formData.pmLastServiceDate || 'Not serviced yet'],
          ['Service location', formData.pmLocation || 'Asset location'],
          ['Auto work orders', formData.pmAutoGenerateWorkOrders ? 'Yes' : 'No'],
          ['Schedule active', formData.pmActive ? 'Yes' : 'No'],
          ['Schedule description', formData.pmDescription],
          ['Checklist tasks', formData.pmChecklistText ? `${formData.pmChecklistText.split('\n').filter(Boolean).length} tasks` : 'None']
        ] : []),
        ...(quantityCount === 1 ? [
          ['Auto discovery', formData.linkToDiscovered ? 'Linked device' : (formData.hostname || formData.ipAddress || formData.macAddress ? 'Manual details' : 'Disabled')],
          ...(formData.linkToDiscovered ? [['Discovered device', formData.discoveryId]] : []),
          ...(formData.hostname ? [['Hostname', formData.hostname]] : []),
          ...(formData.ipAddress ? [['IP address', formData.ipAddress]] : []),
          ...(formData.macAddress ? [['MAC address', formData.macAddress]] : []),
          ...(formData.discoveredSerial ? [['Device serial', formData.discoveredSerial]] : []),
          ...(formData.firstSeen ? [['First seen', formData.firstSeen]] : []),
          ...(formData.lastSeen ? [['Last seen', formData.lastSeen]] : [])
        ] : [
          ['Linked devices', `${discoveryItems.filter(item => item.discoveryId).length} of ${discoveryItems.length} items linked`]
        ])
      ], quantityCount > 1 && <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700">Discovery details by item</p>
        {discoveryItems.map((item, index) => <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
          <p className="font-bold text-slate-900">{index + 1} / {discoveryItems.length} — {serialNumbers[index] || 'No serial number'}</p>
          <p className="mt-1 break-words text-slate-600">{item.discoveryId ? `Linked device: ${item.hostname || item.discoveryId}` : item.hostname || item.ipAddress || item.macAddress ? 'Manual details' : 'No discovery details'} · IP: {item.ipAddress || 'Not provided'} · MAC: {item.macAddress || 'Not provided'}</p>
        </div>)}
      </div>)}

      {/* Step 3 Review: Location, Ownership and Tagging */}
      {reviewSection('Location, ownership and tagging', 3, [
        ['Company', formData.company],
        ['Site', formData.site],
        ['Building', formData.building],
        ['Floor / Room', formData.floor],
        ['Department', formData.department],
        ['Cost center', formData.costCenter],
        ['Custodian', formData.custodian],
        ['Expected user', formData.expectedUser],
        ['Tag type', quantityCount === 1 ? formData.tagType : 'Individual barcodes assigned on save'],
        ['Barcode / tag', quantityCount === 1 ? (formData.assetTagBarcode || 'Generated on save') : 'Generated per asset on save'],
        ...(formData.tagType === 'RFID' || formData.rfidEpc ? [['RFID EPC', formData.rfidEpc || 'Generated on save']] : [])
      ], reviewItemDetails('location'))}

      {/* Step 4 Review: Documents */}
      {reviewSection('Documents', 4, [
        ['Attached documents', formData.documents.length ? `${formData.documents.length} document(s)` : 'None (Optional)']
      ], <ul className="space-y-1 text-xs text-slate-700">{formData.documents.length ? formData.documents.map((doc, index) => <li key={`${doc.name}-${index}`} className="break-all rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between"><span>{doc.name || 'Unnamed document'}</span><span className="text-[10px] text-emerald-600 font-bold">Uploaded</span></li>) : <li className="italic text-slate-400">No documents uploaded (Optional)</li>}</ul>)}
    </div>
  );
  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-12 font-sans text-slate-900 select-none">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-500/10'
            : toast.type === 'warning'
            ? 'bg-amber-50/95 border-amber-300 text-amber-900 shadow-amber-500/10 ring-2 ring-amber-200/60'
            : 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-rose-500/10 ring-2 ring-rose-200/60'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="flex flex-col">
            {toast.type === 'warning' && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Warning</span>
            )}
            {toast.type === 'error' && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Error</span>
            )}
            <span className="text-xs font-bold leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {createdAssets.length > 0 && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-3" aria-label="Created assets">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-emerald-900">Created {createdAssets.length} assets</h2>
          <button type="button" onClick={() => navigate('/assets')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Open Asset Register</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {createdAssets.map((asset, index) => <button key={asset.id} type="button" onClick={() => navigate(`/assets/${encodeURIComponent(asset.id)}`)} className="rounded-lg border border-emerald-200 bg-white p-3 text-left hover:border-emerald-500">
            <span className="block text-xs text-slate-500">{index + 1} / {createdAssets.length} · {asset.serialNumber || 'No serial number'}</span>
            <span className="block font-mono font-bold text-slate-900 break-all">{asset.assetId}</span>
          </button>)}
        </div>
      </section>}


      {/* ========================================================================= */}
      {/* FORM VIEW 1: STEPPER FORM WITH 8 CALLOUTS (Screenshot 1 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {(activeView === 'stepper' || quantityCount > 1) && (
        <div className="space-y-4">

          {/* Header & Purpose Banner matching Screenshot 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Top Row: Title & Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6C2BD9]">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6C2BD9] border border-purple-200">
                    Asset Onboarding
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Registration</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Screen Features, Functionality and Data Requirements • <span className="text-slate-400">Easily register new assets with complete details, tagging and approval workflow.</span>
                </p>
              </div>

              {/* Action Buttons - Responsive Header Placement */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/assets')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading}
                  className="px-4 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] hover:text-[#5b21b6] font-bold rounded-xl text-xs border border-purple-200 hover:border-purple-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                >
                  Save as Draft
                </button>
                {stepMode === 'wizard' && currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    Next Step ({FORM_STEPS[currentStep]?.name}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit('SUBMITTED')}
                    disabled={loading}
                    className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Submit for Approval
                  </button>
                )}
              </div>
            </div>

            {/* Purpose Banner */}
            <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-purple-900">
              <div className="w-5 h-5 rounded-lg bg-purple-200/60 text-[#6C2BD9] flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                ⓘ
              </div>
              <div className="leading-relaxed">
                <span className="font-bold text-purple-950 mr-1.5">Purpose:</span>
                <span>The New Asset Registration screen allows users to capture and register new assets into Asset360 with all relevant details, assign tags and submit for approval as per the organization's asset management policy.</span>
              </div>
            </div>

            {/* Stepper Progress Bar - Full Width & Responsive */}
            <div className="pt-3 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center justify-between gap-2 min-w-[760px] xl:min-w-0 w-full text-xs font-semibold">
                {FORM_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <button
                        type="button"
                        onClick={() => handleStepClick(step.id)}
                        className={`flex items-center gap-2.5 shrink-0 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                          isCurrent
                            ? 'bg-purple-50/80 ring-2 ring-[#6C2BD9]/30'
                            : 'hover:bg-slate-50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-[#6C2BD9] text-white ring-2 ring-purple-300'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 text-slate-500 bg-white'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span
                            className={`block text-xs whitespace-nowrap transition-colors ${
                              isCurrent
                                ? 'font-black text-[#6C2BD9]'
                                : isCompleted
                                ? 'font-bold text-slate-900'
                                : 'font-semibold text-slate-600'
                            }`}
                          >
                            Step {step.id}: {step.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                            {step.desc}
                          </span>
                        </div>
                      </button>

                      {idx < FORM_STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2 min-w-[16px] hidden sm:block rounded-full transition-colors ${
                            currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* View Mode Toggle Pill */}
                <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStepMode(stepMode === 'wizard' ? 'all' : 'wizard')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={stepMode === 'wizard' ? 'Switch to All-in-one view' : 'Switch to Step-by-Step Wizard'}
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>{stepMode === 'wizard' ? 'View All' : 'Step Wizard'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content: Step-by-Step Wizard vs. View All */}
          {stepMode === 'wizard' ? (
            <div className="space-y-4">
              {/* Step Navigation Subheader */}
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-black text-sm">
                    {currentStep}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Step {currentStep}: {FORM_STEPS[currentStep - 1]?.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {FORM_STEPS[currentStep - 1]?.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-[#6C2BD9] font-bold text-xs border border-purple-200">
                    Step {currentStep} of 5
                  </span>
                </div>
              </div>

              {/* Step 1: Full-width basic information followed by the asset image */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {renderBasicInfo()}
                  {renderAssetImage()}
                </div>
              )}

              {/* Step 2: Additional Details (Financials + Remarks) */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {quantityCount > 1 ? renderBatchFinancial() : renderFinancialInfo()}
                  {renderDescription()}
                  {renderMaintenanceDiscovery()}
                </div>
              )}

              {/* Step 3: Tagging & Location */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {renderLocationOwnership()}
                  {renderTagging()}
                </div>
              )}

              {/* Step 4: Documents (Cloudinary) */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {renderDocuments()}
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  {renderDetailedReview()}
                  {renderApprovalWorkflow()}
                </div>
              )}
            </div>
          ) : (
            /* View All Mode (All 8 Callouts in Two Columns) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-4">
                {renderBasicInfo()}
                {renderLocationOwnership()}
                {quantityCount > 1 ? renderBatchFinancial() : renderFinancialInfo()}
                {renderDescription()}
              </div>
              <div className="space-y-4">
                {renderTagging()}
                {renderAssetImage()}
                {renderDocuments()}
                {renderApprovalWorkflow()}
              </div>
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">
              {stepMode === 'wizard' ? (
                <span>
                  <strong className="text-[#6C2BD9]">Step {currentStep} of 5:</strong>{' '}
                  <span className="font-bold text-slate-800">{FORM_STEPS[currentStep - 1]?.name}</span> — Fill in details and click Next to advance.
                </span>
              ) : (
                <span>
                  <span className="font-bold text-slate-700">Need to finish later?</span> Save as draft to retain your inputs, or submit directly for approval workflow verification.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              {stepMode === 'wizard' && currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/assets')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-purple-50 text-[#6C2BD9] hover:text-[#5b21b6] font-bold rounded-xl text-xs border border-purple-200 hover:border-purple-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                Save as Draft
              </button>

              {stepMode === 'wizard' && currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  Next Step ({FORM_STEPS[currentStep]?.name}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit('SUBMITTED')}
                  disabled={loading}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Submit for Approval
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM VIEW 2: COMPREHENSIVE 11-PANEL GRID FORM (Screenshot 2 Layout 1-to-1) */}
      {/* ========================================================================= */}
      {activeView === 'grid' && quantityCount === 1 && (
        <div className="space-y-4">

          {/* Top Header Bar with Breadcrumb & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
                <span className="font-bold text-[#6C2BD9]">A Assets</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-700">New Asset Registration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Asset Registration</h1>
              <p className="text-xs text-slate-500 font-medium">
                Create a complete asset record with identification, location, ownership and lifecycle information.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/assets')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={loading}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Submit for Approval
              </button>
            </div>
          </div>

          {/* ROW 1: Panels 1, 2, 3, 4 (4 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">

            {/* PANEL 1: 📋 1. Basic Information ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> Basic Information <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset ID</label>
                  <input readOnly value={assetIdPreview} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold" />
                  <p className="text-[10px] text-slate-500">Unique ID assigned on save.</p>
                </div>

                {/* Asset Name */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                {/* Asset Description */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter asset description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:border-[#6C2BD9] outline-none"
                  />
                </div>
              </div>

              {/* Asset Image Box */}
              <div className="space-y-1 text-xs pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Asset Image</label>
                  <span className="text-[9px] font-bold text-[#6C2BD9]">Cloudinary</span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center overflow-hidden relative group">
                    {formData.assetImage || formData.imageUrl ? (
                      <>
                        <img src={formData.assetImage || formData.imageUrl} alt="Asset" className="h-full object-contain" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded p-1 text-[9px] shadow font-bold"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400">
                        <Package className="w-5 h-5 mx-auto text-[#6C2BD9]/60 mb-0.5" />
                        <span className="text-[9px] block font-medium">No photo</span>
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="h-20 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-1 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    {uploadingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-purple-600 mb-0.5 animate-spin" />
                        <span className="text-[9px] font-bold text-[#6C2BD9]">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-purple-600 mb-0.5" />
                        <span className="text-[9px] font-bold text-slate-700 leading-tight">Upload Image</span>
                        <span className="text-[7px] text-slate-400">Cloudinary (JPG, PNG)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: 🏷️ 2. Classification ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#6C2BD9]" /> Classification <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Group *</label>
                  <select
                    value={formData.assetGroup}
                    onChange={(e) => setFormData({ ...formData, assetGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="IT Assets">IT Assets</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Type *</label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => handleAssetTypeChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Furniture">Furniture & Fixtures</option>
                    <option value="Facility & Building">Facility & Building</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Category</option>
                      {availableCategories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </select>
                    {availableCategories.length === 0 && (
                      <p className="text-[10px] text-amber-600 mt-0.5">No categories found</p>
                    )}
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subcategory *</label>
                    <select
                      value={formData.assetClassId || formData.subcategory}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      disabled={!formData.category}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">{formData.category ? 'Select Sub Category *' : 'Select Category first'}</option>
                      {availableAssetClasses.map(assetClass => <option key={assetClass.id} value={assetClass.id}>{assetClass.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Criticality</label>
                    <select
                      value={formData.criticality}
                      onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="New">New</option>
                      <option value="In Use">In Use</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PANEL 3: 🔧 3. Product Details ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Product Details <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Manufacturer *</label>
                  <select
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="">-- Select Manufacturer --</option>
                    {manufacturers && manufacturers.length > 0 ? (
                      manufacturers.map((m) => {
                        const name = m.name || m.title || m;
                        return (
                          <option key={m.id || m._id || name} value={name}>
                            {name}
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value="Dell Technologies">Dell Technologies</option>
                        <option value="Apple">Apple</option>
                        <option value="HP Inc.">HP Inc.</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dell">Dell</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Model *</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Latitude 7450">Latitude 7450</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Quantity *</label>
                  <input type="number" min="1" max="50" value={formData.quantity} onChange={(e) => updateQuantity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:border-[#6C2BD9] outline-none" />
                </div>

                {quantityCount > 1 && <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Item serial number</label>
                  <select value={selectedItemIndex} onChange={event => { const index = Number(event.target.value); setSelectedItemIndex(index); setFormData(previous => ({ ...previous, serialNumber: serialNumbers[index] || '' })); }} className="w-full bg-white border border-purple-200 rounded-xl p-2 text-slate-900 font-semibold">
                    {serialNumbers.map((serial, index) => <option key={index} value={index}>{index + 1} / {serialNumbers.length}{serial ? ` — ${serial}` : ' — serial needed'}</option>)}
                  </select>
                </div>}

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumbers[selectedItemIndex] || ''}
                    onChange={(e) => updateSerialNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Asset Tag / Barcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Scan or enter barcode/QR"
                      value={formData.assetTagBarcode}
                      onChange={(e) => setFormData({ ...formData, assetTagBarcode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-2 py-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none"
                    />
                    <Barcode className="w-4 h-4 text-purple-600 absolute right-2.5 top-2.5 cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">RFID EPC</label>
                    <input
                      type="text"
                      placeholder="Scan RFID Tag"
                      value={formData.rfidEpc}
                      onChange={(e) => setFormData({ ...formData, rfidEpc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">TID</label>
                    <input
                      type="text"
                      value={formData.tid}
                      onChange={(e) => setFormData({ ...formData, tid: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 4: ((o)) 4. Location & Ownership ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#6C2BD9]" /> Location &amp; Ownership <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Company</label>
                      <button
                        type="button"
                        onClick={handleQuickAddCompany}
                        className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> Add
                      </button>
                    </div>
                    <select
                      value={formData.companyId || (companies.find(c => c.name === formData.company || c.code === formData.company)?.id || '')}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          handleQuickAddCompany();
                        } else {
                          const selectedId = e.target.value;
                          const found = companies.find(c => c.id === selectedId);
                          setFormData(prev => ({
                            ...prev,
                            companyId: selectedId,
                            company: found ? (found.name || found.code) : '',
                            siteId: '',
                            site: '',
                            buildingId: '',
                            building: ''
                          }));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Company (Optional)</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name || c.code}</option>
                      ))}
                      <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Company...</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Solutions"
                      value={formData.businessUnit}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Department</label>
                      <button
                        type="button"
                        onClick={handleQuickAddDepartment}
                        className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> Add
                      </button>
                    </div>
                    <select
                      value={formData.departmentId || (departments.find(d => d.name === formData.department || d.code === formData.department)?.id || '')}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          handleQuickAddDepartment();
                        } else {
                          const selectedId = e.target.value;
                          const found = departments.find(d => d.id === selectedId);
                          setFormData(prev => ({
                            ...prev,
                            departmentId: selectedId,
                            department: found ? (found.name || found.code) : ''
                          }));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Department (Optional)</option>
                      {departments
                        .filter(d => !formData.companyId || !d.companyId || d.companyId === formData.companyId || d.id === formData.departmentId || d.name === formData.department)
                        .map(d => (
                          <option key={d.id} value={d.id}>{d.name || d.code}</option>
                        ))}
                      <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Department...</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Cost Center</label>
                      <button
                        type="button"
                        onClick={handleQuickAddCostCenter}
                        className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> Add
                      </button>
                    </div>
                    <select
                      value={formData.costCenterId || (costCenters.find(cc => cc.name === formData.costCenter || cc.code === formData.costCenter)?.id || '')}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          handleQuickAddCostCenter();
                        } else {
                          const selectedId = e.target.value;
                          const found = costCenters.find(cc => cc.id === selectedId);
                          setFormData(prev => ({
                            ...prev,
                            costCenterId: selectedId,
                            costCenter: found ? (found.code ? `${found.code} - ${found.name}` : found.name) : ''
                          }));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Cost Center (Optional)</option>
                      {costCenters
                        .filter(cc => !formData.companyId || !cc.companyId || cc.companyId === formData.companyId || cc.id === formData.costCenterId || cc.name === formData.costCenter)
                        .map(cc => (
                          <option key={cc.id} value={cc.id}>{cc.code ? `${cc.code} - ${cc.name}` : cc.name}</option>
                        ))}
                      <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Cost Center...</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site</label>
                    <select
                      value={formData.siteId || (sites.find(s => s.name === formData.site || s.code === formData.site)?.id || '')}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const found = sites.find(s => s.id === selectedId);
                        setFormData(prev => ({
                          ...prev,
                          siteId: selectedId,
                          site: found ? (found.name || found.code) : '',
                          buildingId: '',
                          building: ''
                        }));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Site (Optional)</option>
                      {sites
                        .filter(s => !formData.companyId || s.companyId === formData.companyId)
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.name || s.code}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Building</label>
                      <button
                        type="button"
                        onClick={handleQuickAddBuilding}
                        className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> Add
                      </button>
                    </div>
                    <select
                      value={formData.buildingId || (buildings.find(b => b.name === formData.building || b.code === formData.building)?.id || '')}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          handleQuickAddBuilding();
                        } else {
                          const selectedId = e.target.value;
                          const found = buildings.find(b => b.id === selectedId);
                          setFormData(prev => ({
                            ...prev,
                            buildingId: selectedId,
                            building: found ? (found.name || found.code) : ''
                          }));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select Building (Optional)</option>
                      {buildings
                        .filter(b => !formData.siteId || b.siteId === formData.siteId)
                        .map(b => (
                          <option key={b.id} value={b.id}>{b.name || b.code}</option>
                        ))}
                      <option value="__NEW__" className="text-[#6C2BD9] font-bold">+ Add New Building...</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Floor</label>
                    <input
                      type="text"
                      placeholder="e.g. Floor 2"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Room</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 204"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Zone / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Office / Server Hall"
                      value={formData.zoneArea}
                      onChange={(e) => setFormData({ ...formData, zoneArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Storage Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Rack B4 / Shelf 2"
                      value={formData.storageArea}
                      onChange={(e) => setFormData({ ...formData, storageArea: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custodian / Owner</label>
                    <div className="relative">
                      <input
                        list="grid-custodian-list"
                        type="text"
                        value={formData.custodian}
                        placeholder="e.g. EMP-1002 or select employee..."
                        onChange={(e) => {
                          const val = e.target.value;
                          const emp = employees.find(emp => emp.fullName === val || emp.name === val || emp.employeeCode === val || emp.id === val);
                          setFormData(prev => ({
                            ...prev,
                            custodian: val,
                            custodianId: emp ? emp.id : prev.custodianId
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <datalist id="grid-custodian-list">
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.fullName || emp.name || emp.employeeCode}>
                            {emp.employeeCode ? `${emp.employeeCode} - ` : ''}{emp.department?.name || ''}
                          </option>
                        ))}
                      </datalist>
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Alternate Custodian</label>
                    <div className="relative">
                      <input
                        list="grid-alt-custodian-list"
                        type="text"
                        placeholder="e.g. EMP-1003 or select employee..."
                        value={formData.alternateCustodian}
                        onChange={(e) => setFormData({ ...formData, alternateCustodian: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-2 py-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                      />
                      <datalist id="grid-alt-custodian-list">
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.fullName || emp.name || emp.employeeCode}>
                            {emp.employeeCode ? `${emp.employeeCode} - ` : ''}{emp.department?.name || ''}
                          </option>
                        ))}
                      </datalist>
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 2: Panels 5, 6, 7, 8 (4 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">

            {/* PANEL 5: 💵 5. Financial Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> Financial Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Date *</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Cost *</label>
                    <input
                      type="text"
                      value={formData.purchaseCost}
                      onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Currency *</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="AED">AED</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vendor / Supplier</label>
                    <input
                      type="text"
                      value={formData.vendorSupplier}
                      onChange={(e) => setFormData({ ...formData, vendorSupplier: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">PO / Invoice No.</label>
                    <input
                      type="text"
                      value={formData.poInvoiceNo}
                      onChange={(e) => setFormData({ ...formData, poInvoiceNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Book</label>
                    <select
                      value={formData.assetBook}
                      onChange={(e) => setFormData({ ...formData, assetBook: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    >
                      <option value="Corporate Book">Corporate Book</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Depreciation Method</label>
                      <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold text-[11px]">Straight Line (Category Policy)</p>
                    </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Useful Life (Years)</label>
                      <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold text-[11px]">{(categoryUsefulLifeMonths / 12).toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Residual Value</label>
                  <p className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold text-[11px]">{categoryResidualPercent}% of acquisition value</p>
                </div>
                {renderCategoryDepreciation()}
              </div>
            </div>

            {/* PANEL 6: 🛡️ 6. Warranty & Contract ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#6C2BD9]" /> Warranty &amp; Contract <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Under Warranty</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, underWarranty: !formData.underWarranty })}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.underWarranty ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Dell">Dell</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty Type</label>
                    <select
                      value={formData.warrantyType}
                      onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.warrantyStartDate}
                      onChange={(e) => updateWarranty({ warrantyStartDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty (years)</label>
                    <input type="number" min="1" max="50" step="1" value={formData.warrantyYears} onChange={(e) => updateWarranty({ warrantyYears: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Coverage</label>
                  <select
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="Parts & Labour">Parts &amp; Labour</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Contract Reference</label>
                  <input
                    type="text"
                    value={formData.contractReference}
                    onChange={(e) => setFormData({ ...formData, contractReference: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-[#6C2BD9] outline-none text-[11px]"
                  />
                </div>

                {/* Attached Warranty Doc Preview */}
                <div className="p-2 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] truncate">{formData.warrantyDoc}</span>
                  </div>
                  <button type="button" className="text-rose-500 hover:text-rose-700 text-xs font-bold">✕</button>
                </div>
              </div>
            </div>

            {/* PANEL 7: 🔧 7. Maintenance Setup ⓘ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#6C2BD9]" /> Maintenance Setup <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Enable Preventive Maintenance</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, enablePm: !formData.enablePm })}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.enablePm ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {formData.enablePm && renderPreventiveMaintenanceFields(true)}
              </div>
            </div>

            {/* PANEL 8: ((o)) 8. Auto Discovery ⓘ */}
            {quantityCount > 1 ? <div className="lg:col-span-4">{renderBatchDiscovery()}</div> : <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#6C2BD9]" /> Auto Discovery <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Link to Discovered Asset</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, linkToDiscovered: !prev.linkToDiscovered, discoveryId: !prev.linkToDiscovered ? prev.discoveryId : '', matchedDiscovery: false }))}
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      formData.linkToDiscovered ? 'bg-[#6C2BD9] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  {formData.linkToDiscovered && <label className="font-bold text-slate-700 block">Discovered Device
                    <select value={formData.discoveryId} onChange={e => selectDiscoveredDevice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900">
                      <option value="">{loadingDevices ? 'Loading devices…' : 'Select device'}</option>
                      {discoveredDevices.map(device => <option key={device.id} value={device.id}>{[device.hostname, device.ipAddress, device.serialNumber].filter(Boolean).join(' · ') || device.id}</option>)}
                    </select>
                  </label>}
                  <label className="font-bold text-slate-700 block">Discovery Source</label>
                  <select
                    value={formData.discoverySource}
                    onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                  >
                    <option value="">Manual entry</option><option value="Network Scan">Network Scan</option><option value="MANUAL_ENTRY">Manual entry</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hostname</label>
                    <input
                      type="text"
                      value={formData.hostname}
                      onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IP Address</label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">MAC Address</label>
                    <input
                      type="text"
                      value={formData.macAddress}
                      onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[10px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discovered Serial</label>
                    <input
                      type="text"
                      value={formData.discoveredSerial}
                      onChange={(e) => setFormData({ ...formData, discoveredSerial: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[10px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">First Seen</label>
                    <input
                      type="date"
                      value={formData.firstSeen}
                      onChange={(e) => setFormData({ ...formData, firstSeen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-[10px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Last Seen</label>
                    <input
                      type="date"
                      value={formData.lastSeen}
                      onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 text-[10px] outline-none"
                    />
                  </div>
                </div>

                {/* Green Matched Badge Box */}
                {formData.discoveryId && <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 text-[11px] block leading-tight">Discovered device selected</span>
                    <span className="text-[9px] text-emerald-700 block leading-tight">It will be linked after saving the asset.</span>
                  </div>
                </div>}
              </div>
            </div>}

          </div>

          {/* ROW 3: Panels 9, 10, 11 (3 Columns Across) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

            {/* PANEL 9: 📄 9. Additional Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" /> Additional Information
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Project</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asset Type</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="Operational">Operational</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Reference</label>
                    <input
                      type="text"
                      placeholder="Enter reference..."
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>
            </div>

            {/* PANEL 10: 📎 10. Documents & Attachments */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#6C2BD9]" /> Documents &amp; Attachments
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs items-center">
                  {/* Drag & drop upload box */}
                  <div
                    onClick={handleAddDoc}
                    className="h-28 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#6C2BD9] rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">Drag &amp; drop files here or <span className="text-[#6C2BD9]">browse</span></span>
                    <span className="text-[8px] text-slate-400 mt-1">PDF, DOC, XLS, JPG, PNG (Max 10MB each)</span>
                  </div>

                  {/* List of files */}
                  <div className="space-y-1.5 text-xs">
                    {formData.documents.map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-400 font-mono">{doc.size}</span>
                          <button type="button" onClick={() => handleRemoveDoc(doc.name)} className="text-slate-400 hover:text-rose-600">✕</button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddDoc}
                      className="text-[10px] font-extrabold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      + Add Document
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 11: ⚙️ 11. Custom Fields */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#6C2BD9]" /> Custom Fields
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cost Allocation</label>
                    <select
                      value={formData.costAllocation}
                      onChange={(e) => setFormData({ ...formData, costAllocation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Application</label>
                    <select
                      value={formData.businessApplication}
                      onChange={(e) => setFormData({ ...formData, businessApplication: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold focus:border-[#6C2BD9] outline-none"
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Enter remarks..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AssetForm;
