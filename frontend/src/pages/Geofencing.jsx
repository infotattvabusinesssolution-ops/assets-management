import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Plus,
  Minus,
  Home,
  Maximize2,
  Edit3,
  Radio,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Bell,
  HelpCircle,
  Clock,
  Box,
  Monitor,
  Printer,
  Tablet,
  Flame,
  Laptop,
  Server,
  Crosshair,
  SlidersHorizontal,
  Check,
  Zap,
  Settings,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  MessageSquare,
  Shield,
  Ruler,
  Lock,
  MoreVertical,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../services/api';

// Initial Mock Geofence Zones matching screenshot #17
const INITIAL_ZONES = [
  {
    id: 'GZ-001',
    name: 'IT Store',
    type: 'Inclusion', // 'Inclusion' | 'Exclusion'
    color: 'emerald',
    borderColor: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.12)',
    assetCount: 12,
    active: true,
    description: 'Expected boundary for all IT equipment storage'
  },
  {
    id: 'GZ-002',
    name: 'Finance',
    type: 'Inclusion',
    color: 'amber',
    borderColor: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.12)',
    assetCount: 8,
    active: true,
    description: 'Permitted zone for finance department hardware'
  },
  {
    id: 'GZ-003',
    name: 'Main Corridor',
    type: 'Inclusion',
    color: 'blue',
    borderColor: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.12)',
    assetCount: 0,
    active: true,
    description: 'Transit corridor for mobile cart and handheld scanners'
  },
  {
    id: 'GZ-004',
    name: 'Restricted Area',
    type: 'Exclusion',
    color: 'rose',
    borderColor: '#ef4444',
    fillColor: 'rgba(239, 68, 68, 0.15)',
    assetCount: 0,
    active: true,
    description: 'No unauthorized asset entry permitted in executive suite'
  },
  {
    id: 'GZ-005',
    name: 'Loading Bay',
    type: 'Inclusion',
    color: 'purple',
    borderColor: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.12)',
    assetCount: 5,
    active: true,
    description: 'Dispatch area for receiving and shipping tagging'
  }
];

// Initial Mock Geofence Rules matching screenshot #17
const INITIAL_RULES = [
  {
    id: 1,
    zoneName: 'IT Store',
    ruleType: 'Inclusion',
    scope: 'IT Equipment',
    condition: 'Asset leaves zone',
    notification: 'Email, In-App',
    status: 'Active'
  },
  {
    id: 2,
    zoneName: 'Restricted Area',
    ruleType: 'Exclusion',
    scope: 'All Assets',
    condition: 'Asset enters zone',
    notification: 'Email, SMS',
    status: 'Active'
  },
  {
    id: 3,
    zoneName: 'Finance',
    ruleType: 'Inclusion',
    scope: 'Finance Assets',
    condition: 'Asset leaves zone',
    notification: 'In-App',
    status: 'Active'
  },
  {
    id: 4,
    zoneName: 'High Value Assets',
    ruleType: 'Inclusion',
    scope: 'Value > AED 10,000',
    condition: 'Asset leaves zone',
    notification: 'Email, SMS',
    status: 'Active'
  },
  {
    id: 5,
    zoneName: 'After Hours',
    ruleType: 'Inclusion',
    scope: 'All Assets',
    condition: 'Asset movement outside 7 PM - 6 AM',
    notification: 'Email, In-App',
    status: 'Active'
  }
];

// Initial Violation Alerts matching screenshot #17
const INITIAL_ALERTS = [
  {
    id: 'ALT-9901',
    timestamp: '10 Sep 2026 11:15 AM',
    assetId: 'AS-2026-00160',
    assetName: 'Fire Extinguisher',
    tagEpc: 'E36000012380',
    zone: 'Restricted Area',
    eventType: 'Exclusion Zone Breach',
    source: 'Reader R-103 (Meeting Room)',
    status: 'UNRESOLVED', // 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED'
    severity: 'CRITICAL'
  },
  {
    id: 'ALT-9895',
    timestamp: '10 Sep 2026 10:40 AM',
    assetId: 'AS-2026-00125',
    assetName: 'iPad Air',
    tagEpc: 'E36000012349',
    zone: 'IT Store',
    eventType: 'Asset Left Zone',
    source: 'Reader R-101 (IT Gate)',
    status: 'ACKNOWLEDGED',
    severity: 'WARNING'
  },
  {
    id: 'ALT-9880',
    timestamp: '09 Sep 2026 08:15 PM',
    assetId: 'AS-2026-00178',
    assetName: 'Laptop - Lenovo',
    tagEpc: 'E36000012399',
    zone: 'Finance',
    eventType: 'After Hours Movement',
    source: 'Reader R-105 (Finance)',
    status: 'RESOLVED',
    severity: 'MEDIUM'
  }
];

// Mock Assets plotted on floor map
const MOCK_MAP_ASSETS = [
  // IT Store Assets (Green Inclusion Zone)
  { id: 'AS-2026-00121', name: 'Dell OptiPlex', status: 'In Zone', coords: { x: 26, y: 22 }, icon: 'desktop', zone: 'IT Store' },
  { id: 'AS-2026-00124', name: 'Server Unit', status: 'In Zone', coords: { x: 34, y: 22 }, icon: 'desktop', zone: 'IT Store' },
  { id: 'AS-2026-00128', name: 'Monitor 24"', status: 'In Zone', coords: { x: 30, y: 30 }, icon: 'desktop', zone: 'IT Store' },

  // Restricted Area Assets (Red Exclusion Zone - Breach Alert!)
  { id: 'AS-2026-00160', name: 'Fire Extinguisher', status: 'Out of Zone', coords: { x: 62, y: 22 }, icon: 'alert', zone: 'Restricted Area' },
  { id: 'AS-2026-00165', name: 'Conf Monitor', status: 'Out of Zone', coords: { x: 67, y: 28 }, icon: 'desktop', zone: 'Restricted Area' },

  // Main Corridor Assets (Blue Zone)
  { id: 'AS-2026-00135', name: 'Mobile Scanner Cart', status: 'Moving', coords: { x: 44, y: 44 }, icon: 'cart', zone: 'Main Corridor' },
  { id: 'AS-2026-00140', name: 'Handheld Reader', status: 'In Zone', coords: { x: 57, y: 44 }, icon: 'scanner', zone: 'Main Corridor' },

  // Finance Assets (Yellow Zone)
  { id: 'AS-2026-00170', name: 'Finance Laptop 1', status: 'Moving', coords: { x: 60, y: 74 }, icon: 'laptop', zone: 'Finance' },
  { id: 'AS-2026-00172', name: 'Finance Laptop 2', status: 'In Zone', coords: { x: 66, y: 74 }, icon: 'laptop', zone: 'Finance' },

  // Reception
  { id: 'AS-2026-00115', name: 'Check-in Kiosk', status: 'In Zone', coords: { x: 28, y: 74 }, icon: 'desktop', zone: 'Reception' }
];

export function Geofencing() {
  const navigate = useNavigate();

  // Top Location Selectors
  const [selectedSite, setSelectedSite] = useState('Dubai HQ');
  const [selectedBuilding, setSelectedBuilding] = useState('Main Building');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');

  // Sub View Tabs
  const [activeSubTab, setActiveSubTab] = useState('Map View'); // 'Map View' | 'Zone List'

  // Right Panel Tabs
  const [rightPanelTab, setRightPanelTab] = useState('Zones'); // 'Zones' | 'Assets'
  const [zoneTypeFilter, setZoneTypeFilter] = useState('All Types'); // 'All Types' | 'Inclusion' | 'Exclusion'
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');

  // Bottom Section Tabs
  const [bottomTab, setBottomTab] = useState('Geofence Rules'); // 'Geofence Rules' | 'Alerts & Events'

  // State Datasets
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedZoneId, setSelectedZoneId] = useState('GZ-001');

  // Layers Popover Toggle
  const [showLayersPopover, setShowLayersPopover] = useState(false);
  const [layers, setLayers] = useState({
    zones: true,
    assetMarkers: true,
    readers: true,
    labels: true,
    heatmap: false
  });

  // Map Controls State
  const [zoomLevel, setZoomLevel] = useState(100);

  // Modals
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle zone active status switch
  const handleToggleZone = (zoneId) => {
    setZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        const nextState = !z.active;
        showToast(`Geofence Zone '${z.name}' is now ${nextState ? 'ACTIVE' : 'DISABLED'}.`);
        return { ...z, active: nextState };
      }
      return z;
    }));
  };

  // Delete rule handler
  const handleDeleteRule = (ruleId) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    showToast(`Rule #${ruleId} deleted.`);
  };

  // Resolve Alert handler
  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
    showToast(`Alert ${alertId} marked as RESOLVED.`);
  };

  // Filtered zones list
  const filteredZones = zones.filter(z => {
    const matchesSearch = z.name.toLowerCase().includes(zoneSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (zoneTypeFilter === 'Inclusion') return z.type === 'Inclusion';
    if (zoneTypeFilter === 'Exclusion') return z.type === 'Exclusion';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen text-slate-800 font-sans select-none relative">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <ShieldAlert className="w-4 h-4 animate-pulse text-amber-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Main Navigation Header Bar matching Screenshot #17 */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6C2BD9]" />
            Geofencing
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create zones, monitor asset movement and get real-time alerts
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets, tags, serial numbers..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9] placeholder:text-slate-400"
            />
          </div>

          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
              3
            </span>
          </button>

          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Help & Documentation">
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200" />

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C2BD9] to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              JD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-none">John Doe</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Asset Manager</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* Top Control Bar matching Screenshot #17 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          
          {/* Site / Building / Floor Dropdowns */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Site:</span>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Abu Dhabi Hub">Abu Dhabi Hub</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Building:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Main Building">Main Building</option>
                <option value="Warehouse A">Warehouse A</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Floor:</span>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
              </select>
            </div>
          </div>

          {/* Right Control Buttons */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                onClick={() => setShowLayersPopover(!showLayersPopover)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Layers className="w-4 h-4 text-[#6C2BD9]" />
                <span>Layers</span>
              </button>

              {/* Layers Popover Menu */}
              {showLayersPopover && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-900">
                    <span>Geofence Layers</span>
                    <button onClick={() => setShowLayersPopover(false)} className="text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Geofence Boundaries</span>
                    <input type="checkbox" checked={layers.zones} onChange={(e) => setLayers({ ...layers, zones: e.target.checked })} className="accent-[#6C2BD9]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Asset Markers</span>
                    <input type="checkbox" checked={layers.assetMarkers} onChange={(e) => setLayers({ ...layers, assetMarkers: e.target.checked })} className="accent-[#6C2BD9]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Reader Locations</span>
                    <input type="checkbox" checked={layers.readers} onChange={(e) => setLayers({ ...layers, readers: e.target.checked })} className="accent-[#6C2BD9]" />
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Geofence Settings</span>
            </button>
          </div>

        </div>

        {/* Sub-Header Tabs & Legend Bar matching Screenshot #17 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 px-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            {['Map View', 'Zone List'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === tab
                    ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>In Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Moving</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span>Out of Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span>Offline</span>
            </div>
          </div>
        </div>

        {/* Central Spatial Grid Area: Map Canvas (Left 9 cols) + Right Zones List Panel (Right 3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Main Spatial Map Container (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[520px] relative overflow-hidden">
            
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* SVG Blueprint Floor Plan & Geofence Polygon Overlay matching Screenshot #17 */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="grid-geo" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-geo)" />

                  {/* Outer Building Perimeter */}
                  <rect x="50" y="30" width="700" height="540" fill="#ffffff" stroke="#1e293b" strokeWidth="4" rx="4" />

                  {/* Room 1: IT Store (Green Inclusion Polygon Zone) */}
                  <g>
                    <rect
                      x="50"
                      y="30"
                      width="220"
                      height="190"
                      fill={layers.zones ? "rgba(16, 185, 129, 0.12)" : "#ffffff"}
                      stroke={layers.zones ? "#10b981" : "#334155"}
                      strokeWidth="2.5"
                      strokeDasharray={layers.zones ? "6 3" : "none"}
                    />
                    <text x="160" y="140" textAnchor="middle" fill="#065f46" className="text-xs font-black font-sans">IT Store</text>
                  </g>

                  {/* Room 2: Admin (Top Center) */}
                  <rect x="270" y="30" width="230" height="200" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
                  <text x="385" y="140" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Admin</text>

                  {/* Room 3: Restricted Area (Red Exclusion Polygon Zone matching Screenshot #17) */}
                  <g>
                    <rect
                      x="500"
                      y="30"
                      width="250"
                      height="200"
                      fill={layers.zones ? "rgba(239, 68, 68, 0.15)" : "#ffffff"}
                      stroke={layers.zones ? "#ef4444" : "#334155"}
                      strokeWidth="2.5"
                      strokeDasharray={layers.zones ? "6 3" : "none"}
                    />
                    <text x="625" y="120" textAnchor="middle" fill="#991b1b" className="text-xs font-black font-sans">Restricted Area</text>
                  </g>

                  {/* Room 4: Main Corridor (Blue Corridor Zone matching Screenshot #17) */}
                  <g>
                    <rect
                      x="250"
                      y="230"
                      width="280"
                      height="80"
                      fill={layers.zones ? "rgba(59, 130, 246, 0.12)" : "#ffffff"}
                      stroke={layers.zones ? "#3b82f6" : "#334155"}
                      strokeWidth="2.5"
                      strokeDasharray={layers.zones ? "6 3" : "none"}
                      rx="8"
                    />
                    <text x="390" y="275" textAnchor="middle" fill="#1e40af" className="text-xs font-black font-sans">Main Corridor</text>
                  </g>

                  {/* Room 5: Reception (Bottom Left) */}
                  <rect x="50" y="220" width="220" height="190" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
                  <text x="160" y="330" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Reception</text>

                  {/* Room 6: Meeting Room */}
                  <rect x="270" y="380" width="230" height="190" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
                  <text x="385" y="480" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Meeting Room</text>

                  {/* Room 7: Finance (Yellow Inclusion Polygon Zone matching Screenshot #17) */}
                  <g>
                    <rect
                      x="500"
                      y="330"
                      width="250"
                      height="240"
                      fill={layers.zones ? "rgba(245, 158, 11, 0.12)" : "#ffffff"}
                      stroke={layers.zones ? "#f59e0b" : "#334155"}
                      strokeWidth="2.5"
                      strokeDasharray={layers.zones ? "6 3" : "none"}
                    />
                    <text x="625" y="440" textAnchor="middle" fill="#92400e" className="text-xs font-black font-sans">Finance</text>
                  </g>
                </svg>

                {/* Plotted Asset Pins on Map */}
                {layers.assetMarkers && MOCK_MAP_ASSETS.map((asset, idx) => {
                  let pinBg = 'bg-emerald-500';
                  let iconElement = <Monitor className="w-3.5 h-3.5 text-white" />;

                  if (asset.status === 'Moving') {
                    pinBg = 'bg-amber-500';
                    iconElement = <Laptop className="w-3.5 h-3.5 text-white" />;
                  } else if (asset.status === 'Out of Zone') {
                    pinBg = 'bg-rose-600 animate-bounce';
                    iconElement = <span className="text-[10px] font-bold text-white">▲</span>;
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => showToast(`Asset ${asset.id} (${asset.name}) selected. Geofence Zone: ${asset.zone}`)}
                      style={{ left: `${asset.coords.x}%`, top: `${asset.coords.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                    >
                      <div className={`w-7 h-7 rounded-full ${pinBg} border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-125`}>
                        {iconElement}
                      </div>

                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap z-50">
                        <span className="font-bold">{asset.id} • {asset.name}</span>
                        <span className="text-slate-300">Zone: {asset.zone}</span>
                        <span className={`font-bold mt-0.5 ${asset.status === 'Out of Zone' ? 'text-rose-400' : 'text-emerald-400'}`}>{asset.status}</span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Map Controls Overlay (Top Left of Map) matching Screenshot #17 */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-md p-1 z-40">
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" title="Zoom In">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 15, 70))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" title="Zoom Out">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => setZoomLevel(100)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" title="Home View">
                  <Home className="w-4 h-4" />
                </button>
                <button onClick={() => setZoomLevel(100)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" title="Fit Screen">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="h-[1px] w-4 bg-slate-200 my-0.5" />
                <button onClick={() => setShowAddZoneModal(true)} className="p-1.5 hover:bg-purple-50 text-[#6C2BD9] rounded-lg" title="Draw Polygon Zone">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Right Panel: Zones (5) / Assets (32) List Panel (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[520px]">
            
            {/* Right Panel Header Tabs & + Add Zone Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 shrink-0">
              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => setRightPanelTab('Zones')}
                  className={`pb-1 transition-all cursor-pointer ${
                    rightPanelTab === 'Zones' ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold' : 'text-slate-400'
                  }`}
                >
                  Zones ({zones.length})
                </button>
                <button
                  onClick={() => setRightPanelTab('Assets')}
                  className={`pb-1 transition-all cursor-pointer ${
                    rightPanelTab === 'Assets' ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold' : 'text-slate-400'
                  }`}
                >
                  Assets (32)
                </button>
              </div>

              <button
                onClick={() => setShowAddZoneModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Zone</span>
              </button>
            </div>

            {/* Filter controls inside list */}
            <div className="my-2.5 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search zone..."
                  value={zoneSearchQuery}
                  onChange={(e) => setZoneSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>
              <select
                value={zoneTypeFilter}
                onChange={(e) => setZoneTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="All Types">All Types</option>
                <option value="Inclusion">Inclusion</option>
                <option value="Exclusion">Exclusion</option>
              </select>
            </div>

            {/* Scrollable Zones Cards List matching Screenshot #17 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredZones.map((z) => (
                <div
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedZoneId === z.id ? 'bg-purple-50/70 border-[#6C2BD9]' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Zone Boundary Color Box Icon */}
                    <div className={`w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 ${
                      z.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                      z.color === 'amber' ? 'border-amber-500 bg-amber-50 text-amber-600' :
                      z.color === 'blue' ? 'border-[#6C2BD9] bg-purple-50 text-[#6C2BD9]' :
                      z.color === 'rose' ? 'border-rose-500 bg-rose-50 text-rose-600' :
                      'border-purple-500 bg-purple-50 text-purple-600'
                    }`}>
                      <Box className="w-4 h-4" />
                    </div>

                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{z.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Type: {z.type}</p>
                      <p className="text-[10px] font-bold text-slate-700">Assets: {z.assetCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleZone(z.id);
                      }}
                      className="text-slate-400 hover:text-[#6C2BD9]"
                      title="Toggle active status"
                    >
                      {z.active ? (
                        <ToggleRight className="w-6 h-6 text-[#6C2BD9]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-300" />
                      )}
                    </button>
                    <button className="text-slate-400 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Bottom Section: Geofence Rules & Alerts/Events Tables matching Screenshot #17 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Table Header Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-6 text-xs font-bold">
              <button
                onClick={() => setBottomTab('Geofence Rules')}
                className={`pb-1 transition-all cursor-pointer ${
                  bottomTab === 'Geofence Rules'
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold text-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Geofence Rules
              </button>
              <button
                onClick={() => setBottomTab('Alerts & Events')}
                className={`pb-1 transition-all cursor-pointer flex items-center gap-2 ${
                  bottomTab === 'Alerts & Events'
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold text-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span>Alerts & Events</span>
                <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {alerts.filter(a => a.status === 'UNRESOLVED').length}
                </span>
              </button>
            </div>
          </div>

          {/* Table 1: Geofence Rules Grid */}
          {bottomTab === 'Geofence Rules' && (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] shadow-2xs">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Zone Name</th>
                    <th className="p-3">Rule Type</th>
                    <th className="p-3">Assets / Category</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Notification</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-400">#{r.id}</td>
                      <td className="p-3 font-bold text-slate-900">{r.zoneName}</td>
                      <td className="p-3 font-semibold text-slate-800">{r.ruleType}</td>
                      <td className="p-3 font-semibold text-purple-700">{r.scope}</td>
                      <td className="p-3 text-slate-600">{r.condition}</td>
                      <td className="p-3 text-slate-600">{r.notification}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => showToast(`Edit rule #${r.id}`)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteRule(r.id)} className="p-1.5 hover:bg-rose-50 rounded text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {rules.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          )}

          {/* Table 2: Alerts & Events Log */}
          {bottomTab === 'Alerts & Events' && (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] shadow-2xs">
                  <tr>
                    <th className="p-3">Alert ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Asset ID & Name</th>
                    <th className="p-3">Tag EPC</th>
                    <th className="p-3">Zone</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Source Reader</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alerts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-rose-600">{a.id}</td>
                      <td className="p-3 text-slate-500">{a.timestamp}</td>
                      <td className="p-3">
                        <strong className="text-slate-900 block">{a.assetId}</strong>
                        <span className="text-[11px] text-slate-500">{a.assetName}</span>
                      </td>
                      <td className="p-3 font-mono text-[#6C2BD9]">{a.tagEpc}</td>
                      <td className="p-3 font-bold text-slate-800">{a.zone}</td>
                      <td className="p-3 font-bold text-rose-600">{a.eventType}</td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{a.source}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          a.status === 'UNRESOLVED' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          a.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {a.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolveAlert(a.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 shadow-2xs"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {alerts.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Add Zone Polygon Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6C2BD9]" />
                Add Geofence Zone Polygon
              </h3>
              <button onClick={() => setShowAddZoneModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Zone Name</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Lounge Restricted Zone"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Zone Type</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Inclusion">Inclusion (Permitted Zone)</option>
                    <option value="Exclusion">Exclusion (Restricted Zone)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Asset Scope</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option>All Assets</option>
                    <option>IT Equipment</option>
                    <option>Finance Assets</option>
                    <option>High Value (&gt; AED 10,000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Notification Channels</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-[#6C2BD9]" /> Email</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="accent-[#6C2BD9]" /> In-App</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#6C2BD9]" /> SMS</label>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                ✏️ Click points on the map floor plan to trace polygon boundaries. Coordinates will be linked automatically.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddZoneModal(false);
                  showToast('Geofence zone added successfully.');
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 shadow-2xs"
              >
                Create Geofence Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Geofence Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#6C2BD9]" />
                Geofence System Configuration
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Alert Deduplication Throttle Window</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>Suppress repeat alerts within 5 minutes</option>
                  <option>Suppress repeat alerts within 15 minutes</option>
                  <option>Log every raw RFID event</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Default Inclusion Boundary Color</label>
                <input type="color" defaultValue="#10b981" className="w-full h-8 rounded-xl cursor-pointer" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Default Exclusion Boundary Color</label>
                <input type="color" defaultValue="#ef4444" className="w-full h-8 rounded-xl cursor-pointer" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast('Geofence settings updated.');
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Geofencing;
