const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../frontend/src');

function cleanFile(relPath, transforms) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const t of transforms) {
    if (typeof t === 'function') {
      content = t(content);
    } else {
      content = content.replace(t.pattern, t.replacement);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Cleaned: ${relPath}`);
}

// 1. DiscoveryWorkbench.jsx
cleanFile('pages/DiscoveryWorkbench.jsx', [
  {
    pattern: /\/\/ Seeded Discovered Devices matching screenshot #17[\s\S]*?const SEED_DEVICES = \[[\s\S]*?\n\];\s*/,
    replacement: 'const SEED_DEVICES = [];\n\n'
  },
  {
    pattern: /const \[devices, setDevices\] = useState\(SEED_DEVICES\);/,
    replacement: 'const [devices, setDevices] = useState([]);'
  },
  {
    pattern: /const \[selectedDevice, setSelectedDevice\] = useState\(SEED_DEVICES\[0\]\);/,
    replacement: 'const [selectedDevice, setSelectedDevice] = useState(null);'
  },
  {
    pattern: /const \[selectedIds, setSelectedIds\] = useState\(\['DEV-001'\]\);/,
    replacement: 'const [selectedIds, setSelectedIds] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = content.replace(
        /import \{ ExternalLink \} from 'lucide-react';/,
        `import { ExternalLink } from 'lucide-react';\nimport { api } from '../services/api';`
      );
    }
    if (!content.includes('fetchDiscoveryDevices')) {
      content = content.replace(
        /export function DiscoveryWorkbench\(\) \{/,
        `export function DiscoveryWorkbench() {
  React.useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        const [devRes, kpiRes] = await Promise.all([
          api.get('/discovery/devices').catch(() => null),
          api.get('/discovery/kpis').catch(() => null)
        ]);
        if (devRes && (devRes.devices || Array.isArray(devRes))) {
          const list = devRes.devices || devRes;
          setDevices(list);
          if (list.length > 0) {
            setSelectedDevice(list[0]);
            setSelectedIds([list[0].id]);
          }
        }
        if (kpiRes && kpiRes.discovered !== undefined) {
          setKpiSummary(prev => ({
            ...prev,
            discovered: kpiRes.discovered || 0,
            matched: kpiRes.matched || 0,
            newAssets: kpiRes.newAssets || 0,
            review: kpiRes.review || 0
          }));
        }
      } catch (err) {
        console.error('Failed to load discovery data from DB:', err);
      }
    };
    fetchDiscoveryData();
  }, []);`
      );
    }
    return content;
  }
]);

// 2. LocationMap.jsx
cleanFile('pages/LocationMap.jsx', [
  {
    pattern: /\/\/ Initial Mock Assets for Ground Floor matching screenshot #16[\s\S]*?const MOCK_ASSETS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const MOCK_ASSETS = [];\n\n'
  },
  {
    pattern: /const \[assets, setAssets\] = useState\(MOCK_ASSETS\);/,
    replacement: 'const [assets, setAssets] = useState([]);'
  },
  {
    pattern: /const \[selectedAssetId, setSelectedAssetId\] = useState\('AS-2026-00121'\);/,
    replacement: 'const [selectedAssetId, setSelectedAssetId] = useState(null);'
  },
  (content) => {
    if (!content.includes('fetchLiveMapAssets')) {
      content = content.replace(
        /export function LocationMap\(\) \{/,
        `export function LocationMap() {
  React.useEffect(() => {
    const fetchLiveMapAssets = async () => {
      try {
        const res = await api.get('/assets').catch(() => null);
        if (res && (res.assets || Array.isArray(res))) {
          const raw = res.assets || res;
          const mapped = raw.map((a, idx) => ({
            id: a.assetId || a.id,
            assetNumber: a.assetId || a.id,
            name: a.description || a.name || 'Enterprise Asset',
            category: a.category?.name || 'IT Equipment',
            serialNumber: a.serialNumber || 'N/A',
            tagNumber: a.tag?.tagNumber || a.rfidTag || \`E360000\${idx}\`,
            currentLocation: \`\${a.site?.name || 'Dubai HQ'} - \${a.building?.name || 'Block A'} - \${a.floor?.name || 'Ground Floor'}\`,
            detectedZone: a.room?.name || 'IT Store',
            zoneKey: a.room?.name || 'IT Store',
            status: a.lifecycleStatus === 'IN_SERVICE' ? 'In Location' : 'Moving',
            trackingStatus: a.lifecycleStatus === 'IN_SERVICE' ? 'In Location' : 'Moving',
            lastSeen: 'Recently',
            assignedTo: a.department?.name || 'IT Department',
            icon: 'desktop',
            coords: { x: 20 + ((idx * 17) % 65), y: 15 + ((idx * 23) % 65) },
            building: a.building?.name || 'Main Building',
            floor: a.floor?.name || 'Ground Floor'
          }));
          setAssets(mapped);
          if (mapped.length > 0) setSelectedAssetId(mapped[0].id);
        }
      } catch (e) {
        console.error('Failed to load assets for map:', e);
      }
    };
    fetchLiveMapAssets();
  }, []);`
      );
    }
    return content;
  }
]);

// 3. Geofencing.jsx
cleanFile('pages/Geofencing.jsx', [
  {
    pattern: /\/\/ Initial Mock Geofence Zones matching screenshot #17[\s\S]*?const INITIAL_ZONES = \[[\s\S]*?\n\];\s*/,
    replacement: 'const INITIAL_ZONES = [];\n\n'
  },
  {
    pattern: /\/\/ Initial Mock Geofence Rules matching screenshot #17[\s\S]*?const INITIAL_RULES = \[[\s\S]*?\n\];\s*/,
    replacement: 'const INITIAL_RULES = [];\n\n'
  },
  {
    pattern: /\/\/ Initial Mock Real-Time Alerts matching screenshot #17[\s\S]*?const INITIAL_ALERTS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const INITIAL_ALERTS = [];\n\n'
  },
  {
    pattern: /\/\/ Sample Assets on Floor Plan Map matching screenshot #17[\s\S]*?const MOCK_MAP_ASSETS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const MOCK_MAP_ASSETS = [];\n\n'
  },
  {
    pattern: /const \[zones, setZones\] = useState\(INITIAL_ZONES\);/,
    replacement: 'const [zones, setZones] = useState([]);'
  },
  {
    pattern: /const \[rules, setRules\] = useState\(INITIAL_RULES\);/,
    replacement: 'const [rules, setRules] = useState([]);'
  },
  {
    pattern: /const \[alerts, setAlerts\] = useState\(INITIAL_ALERTS\);/,
    replacement: 'const [alerts, setAlerts] = useState([]);'
  },
  (content) => {
    if (!content.includes('fetchLiveRtls')) {
      content = content.replace(
        /export function Geofencing\(\) \{/,
        `export function Geofencing() {
  React.useEffect(() => {
    const fetchLiveRtls = async () => {
      try {
        const [dashRes, alertsRes] = await Promise.all([
          api.get('/rtls/dashboard').catch(() => null),
          api.get('/rtls/alerts').catch(() => null)
        ]);
        if (dashRes && dashRes.summary) {
          if (dashRes.summary.zones) setZones(dashRes.summary.zones);
        }
        if (alertsRes && (alertsRes.alerts || Array.isArray(alertsRes))) {
          const list = alertsRes.alerts || alertsRes;
          setAlerts(list);
        }
      } catch (err) {
        console.error('Failed to load live RTLS data:', err);
      }
    };
    fetchLiveRtls();
  }, []);`
      );
    }
    return content;
  }
]);

// 4. CompaniesTab.jsx
cleanFile('components/company-organization/CompaniesTab.jsx', [
  {
    pattern: /export const INITIAL_COMPANIES = \[[\s\S]*?\n\];\s*export function CompaniesTab/,
    replacement: 'export const INITIAL_COMPANIES = [];\n\nexport function CompaniesTab'
  },
  {
    pattern: /const \[companies, setCompanies\] = useState\(INITIAL_COMPANIES\);/,
    replacement: 'const [companies, setCompanies] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = `import { api } from '../../services/api';\n` + content;
    }
    if (!content.includes('fetchCompaniesFromDb')) {
      content = content.replace(
        /export function CompaniesTab\(\{ triggerToast, onSwitchTab \}\) \{/,
        `export function CompaniesTab({ triggerToast, onSwitchTab }) {
  React.useEffect(() => {
    const fetchCompaniesFromDb = async () => {
      try {
        const res = await api.get('/admin/organization/companies').catch(() => null);
        if (res && (res.companies || Array.isArray(res))) {
          const list = res.companies || res;
          const mapped = list.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            type: c.type || 'Operating',
            region: c.region || 'UAE',
            businessUnitsCount: c._count?.businessUnits || c.businessUnitsCount || 0,
            locationsCount: c._count?.sites || c.locationsCount || 0,
            status: c.active ? 'Active' : 'Inactive',
            createdOn: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            createdBy: c.createdBy || 'System Admin',
            parentCompany: c.parentCompany || 'Asset360 Holdings',
            description: c.description || ''
          }));
          setCompanies(mapped);
        }
      } catch (e) {
        console.error('Failed to load companies from DB:', e);
      }
    };
    fetchCompaniesFromDb();
  }, []);`
      );
    }
    return content;
  }
]);

// 5. DepartmentsTab.jsx
cleanFile('components/company-organization/DepartmentsTab.jsx', [
  {
    pattern: /export const INITIAL_DEPARTMENTS = \[[\s\S]*?\n\];\s*export function DepartmentsTab/,
    replacement: 'export const INITIAL_DEPARTMENTS = [];\n\nexport function DepartmentsTab'
  },
  {
    pattern: /const \[departments, setDepartments\] = useState\(INITIAL_DEPARTMENTS\);/,
    replacement: 'const [departments, setDepartments] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = `import { api } from '../../services/api';\n` + content;
    }
    if (!content.includes('fetchDepartmentsFromDb')) {
      content = content.replace(
        /export function DepartmentsTab\(\{ triggerToast, onSwitchTab \}\) \{/,
        `export function DepartmentsTab({ triggerToast, onSwitchTab }) {
  React.useEffect(() => {
    const fetchDepartmentsFromDb = async () => {
      try {
        const res = await api.get('/admin/organization/departments').catch(() => null);
        if (res && (res.departments || Array.isArray(res))) {
          const list = res.departments || res;
          const mapped = list.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code,
            company: d.company?.name || 'Asset360 Holdings',
            businessUnit: 'Corporate Services',
            headOfDepartment: d.headOfDepartment || 'Unassigned',
            employeesCount: d._count?.employees || 0,
            assetsCount: d._count?.assets || 0,
            status: d.active ? 'Active' : 'Inactive',
            costCenter: d.costCenter?.code || 'CC-1001',
            createdOn: new Date(d.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }));
          setDepartments(mapped);
        }
      } catch (e) {
        console.error('Failed to load departments from DB:', e);
      }
    };
    fetchDepartmentsFromDb();
  }, []);`
      );
    }
    return content;
  }
]);

// 6. LocationsTab.jsx
cleanFile('components/company-organization/LocationsTab.jsx', [
  {
    pattern: /export const INITIAL_LOCATIONS = \[[\s\S]*?\n\];\s*export function LocationsTab/,
    replacement: 'export const INITIAL_LOCATIONS = [];\n\nexport function LocationsTab'
  },
  {
    pattern: /const \[locations, setLocations\] = useState\(INITIAL_LOCATIONS\);/,
    replacement: 'const [locations, setLocations] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = `import { api } from '../../services/api';\n` + content;
    }
    if (!content.includes('fetchLocationsFromDb')) {
      content = content.replace(
        /export function LocationsTab\(\{ triggerToast, onSwitchTab \}\) \{/,
        `export function LocationsTab({ triggerToast, onSwitchTab }) {
  React.useEffect(() => {
    const fetchLocationsFromDb = async () => {
      try {
        const res = await api.get('/admin/organization/locations').catch(() => null);
        if (res && (res.locations || Array.isArray(res))) {
          const list = res.locations || res;
          const mapped = list.map(loc => ({
            id: loc.id,
            name: loc.name,
            code: loc.code,
            type: loc.type || 'Office',
            company: loc.company?.name || 'Asset360 Holdings',
            city: loc.city || 'Dubai',
            country: loc.country || 'UAE',
            buildingsCount: loc._count?.buildings || 0,
            assetsCount: loc._count?.assets || 0,
            status: loc.active ? 'Active' : 'Inactive',
            address: loc.address || 'Business Bay, Dubai'
          }));
          setLocations(mapped);
        }
      } catch (e) {
        console.error('Failed to load locations from DB:', e);
      }
    };
    fetchLocationsFromDb();
  }, []);`
      );
    }
    return content;
  }
]);

// 7. CostCentersTab.jsx
cleanFile('components/company-organization/CostCentersTab.jsx', [
  {
    pattern: /export const INITIAL_COST_CENTERS = \[[\s\S]*?\n\];\s*export function CostCentersTab/,
    replacement: 'export const INITIAL_COST_CENTERS = [];\n\nexport function CostCentersTab'
  },
  {
    pattern: /const \[costCenters, setCostCenters\] = useState\(INITIAL_COST_CENTERS\);/,
    replacement: 'const [costCenters, setCostCenters] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = `import { api } from '../../services/api';\n` + content;
    }
    if (!content.includes('fetchCostCentersFromDb')) {
      content = content.replace(
        /export function CostCentersTab\(\{ triggerToast, onSwitchTab \}\) \{/,
        `export function CostCentersTab({ triggerToast, onSwitchTab }) {
  React.useEffect(() => {
    const fetchCostCentersFromDb = async () => {
      try {
        const res = await api.get('/admin/organization/cost-centers').catch(() => null);
        if (res && (res.costCenters || Array.isArray(res))) {
          const list = res.costCenters || res;
          const mapped = list.map(cc => ({
            id: cc.id,
            name: cc.name,
            code: cc.code,
            company: cc.company?.name || 'Asset360 Holdings',
            department: cc.department?.name || 'IT Operations',
            manager: cc.manager || 'Corporate Finance',
            budgetAmount: cc.budgetAmount || 500000,
            currency: 'AED',
            status: cc.active ? 'Active' : 'Inactive'
          }));
          setCostCenters(mapped);
        }
      } catch (e) {
        console.error('Failed to load cost centers from DB:', e);
      }
    };
    fetchCostCentersFromDb();
  }, []);`
      );
    }
    return content;
  }
]);

// 8. BusinessUnitsTab.jsx
cleanFile('components/company-organization/BusinessUnitsTab.jsx', [
  {
    pattern: /export const INITIAL_BUSINESS_UNITS = \[[\s\S]*?\n\];\s*export function BusinessUnitsTab/,
    replacement: 'export const INITIAL_BUSINESS_UNITS = [];\n\nexport function BusinessUnitsTab'
  },
  {
    pattern: /const \[businessUnits, setBusinessUnits\] = useState\(INITIAL_BUSINESS_UNITS\);/,
    replacement: 'const [businessUnits, setBusinessUnits] = useState([]);'
  },
  (content) => {
    if (!content.includes('import { api } from')) {
      content = `import { api } from '../../services/api';\n` + content;
    }
    if (!content.includes('fetchBusinessUnitsFromDb')) {
      content = content.replace(
        /export function BusinessUnitsTab\(\{ triggerToast, onSwitchTab \}\) \{/,
        `export function BusinessUnitsTab({ triggerToast, onSwitchTab }) {
  React.useEffect(() => {
    const fetchBusinessUnitsFromDb = async () => {
      try {
        const res = await api.get('/admin/organization/business-units').catch(() => null);
        if (res && (res.businessUnits || Array.isArray(res))) {
          const list = res.businessUnits || res;
          setBusinessUnits(list);
        }
      } catch (e) {
        console.error('Failed to load business units from DB:', e);
      }
    };
    fetchBusinessUnitsFromDb();
  }, []);`
      );
    }
    return content;
  }
]);

console.log('purge-more-mocks executed successfully.');
