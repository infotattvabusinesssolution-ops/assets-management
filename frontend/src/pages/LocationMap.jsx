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
  Upload,
  Ruler,
  SlidersHorizontal,
  Check,
  Zap,
  Grid
} from 'lucide-react';
import { api } from '../services/api';

// Initial Mock Assets for Ground Floor matching screenshot #16
const MOCK_ASSETS = [
  {
    id: 'AS-2026-00121',
    assetNumber: 'AS-2026-00121',
    name: 'Dell OptiPlex 7020',
    category: 'IT Equipment',
    serialNumber: '7CD1234',
    tagNumber: 'E36000012345',
    currentLocation: 'IT Store - Ground Floor',
    detectedZone: 'IT Store - GF',
    zoneKey: 'IT Store',
    status: 'In Location',
    trackingStatus: 'In Location', // 'In Location' | 'Moving' | 'Out of Zone' | 'Offline'
    lastSeen: '10 Sep 2026 11:42 AM',
    assignedTo: 'IT Department',
    icon: 'desktop',
    coords: { x: 32, y: 22 }, // x, y percentages on floor plan map
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00122',
    assetNumber: 'AS-2026-00122',
    name: 'HP LaserJet Pro',
    category: 'Printer',
    serialNumber: 'HPLJ9921',
    tagNumber: 'E36000012346',
    currentLocation: 'Finance - Ground Floor',
    detectedZone: 'Finance - GF',
    zoneKey: 'Finance',
    status: 'Moving',
    trackingStatus: 'Moving',
    lastSeen: '10 Sep 2026 11:40 AM',
    assignedTo: 'Finance Dept',
    icon: 'printer',
    coords: { x: 71, y: 44 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00125',
    assetNumber: 'AS-2026-00125',
    name: 'iPad Air',
    category: 'Tablet',
    serialNumber: 'DMQX90812',
    tagNumber: 'E36000012349',
    currentLocation: 'Meeting Room 2 - Ground Floor',
    detectedZone: 'Meeting Room 2 - GF',
    zoneKey: 'Meeting Room 2',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:35 AM',
    assignedTo: 'Executive Mgmt',
    icon: 'tablet',
    coords: { x: 28, y: 74 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00160',
    assetNumber: 'AS-2026-00160',
    name: 'Fire Extinguisher',
    category: 'Safety Equipment',
    serialNumber: 'FE-CO2-0044',
    tagNumber: 'E36000012380',
    currentLocation: 'Server Room - Ground Floor',
    detectedZone: 'Server Room - GF',
    zoneKey: 'Server Room',
    status: 'Out of Zone',
    trackingStatus: 'Out of Zone',
    lastSeen: '10 Sep 2026 11:15 AM',
    assignedTo: 'HSE & Safety',
    icon: 'fire',
    coords: { x: 48, y: 74 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00178',
    assetNumber: 'AS-2026-00178',
    name: 'Laptop - Lenovo',
    category: 'IT Equipment',
    serialNumber: 'LEN-X1-9920',
    tagNumber: 'E36000012399',
    currentLocation: 'Pantry - Ground Floor',
    detectedZone: 'Pantry - GF',
    zoneKey: 'Pantry',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '09 Sep 2026 04:12 PM',
    assignedTo: 'IT Department',
    icon: 'laptop',
    coords: { x: 74, y: 74 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00190',
    assetNumber: 'AS-2026-00190',
    name: 'Dell UltraSharp 27 Monitor',
    category: 'IT Equipment',
    serialNumber: 'DEL-US-9912',
    tagNumber: 'E36000012420',
    currentLocation: 'Admin - Ground Floor',
    detectedZone: 'Admin - GF',
    zoneKey: 'Admin',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:44 AM',
    assignedTo: 'Admin Dept',
    icon: 'desktop',
    coords: { x: 48, y: 22 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00195',
    assetNumber: 'AS-2026-00195',
    name: 'Polycom Conference Hub',
    category: 'AV Equipment',
    serialNumber: 'POL-CH-771',
    tagNumber: 'E36000012430',
    currentLocation: 'Meeting Room 1 - Ground Floor',
    detectedZone: 'Meeting Room 1 - GF',
    zoneKey: 'Meeting Room 1',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:30 AM',
    assignedTo: 'Operations',
    icon: 'desktop',
    coords: { x: 74, y: 22 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00201',
    assetNumber: 'AS-2026-00201',
    name: 'Visitor Kiosk Tablet',
    category: 'Tablet',
    serialNumber: 'TAB-KSK-001',
    tagNumber: 'E36000012440',
    currentLocation: 'Reception - Ground Floor',
    detectedZone: 'Reception - GF',
    zoneKey: 'Reception',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:45 AM',
    assignedTo: 'Security',
    icon: 'tablet',
    coords: { x: 28, y: 50 },
    building: 'Main Building',
    floor: 'Ground Floor'
  },
  {
    id: 'AS-2026-00208',
    assetNumber: 'AS-2026-00208',
    name: 'HP Z4 Workstation',
    category: 'IT Equipment',
    serialNumber: 'HP-Z4-1188',
    tagNumber: 'E36000012450',
    currentLocation: 'HR - Ground Floor',
    detectedZone: 'HR - GF',
    zoneKey: 'HR',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:40 AM',
    assignedTo: 'HR Dept',
    icon: 'desktop',
    coords: { x: 58, y: 52 },
    building: 'Main Building',
    floor: 'Ground Floor'
  }
];

// Room Zones Data for Ground Floor matching screenshot #16
const MOCK_ZONES = [
  { name: 'IT Store', code: 'Z-01', assetCount: 4, capacity: 15, area: '45 sq.m', type: 'Storage' },
  { name: 'Admin', code: 'Z-02', assetCount: 6, capacity: 20, area: '80 sq.m', type: 'Workstation' },
  { name: 'Meeting Room 1', code: 'Z-03', assetCount: 3, capacity: 10, area: '50 sq.m', type: 'Conference' },
  { name: 'Reception', code: 'Z-04', assetCount: 2, capacity: 5, area: '40 sq.m', type: 'Lobby' },
  { name: 'HR', code: 'Z-05', assetCount: 4, capacity: 12, area: '60 sq.m', type: 'Office' },
  { name: 'Finance', code: 'Z-06', assetCount: 5, capacity: 15, area: '70 sq.m', type: 'Office' },
  { name: 'Meeting Room 2', code: 'Z-07', assetCount: 2, capacity: 8, area: '45 sq.m', type: 'Conference' },
  { name: 'Server Room', code: 'Z-08', assetCount: 8, capacity: 10, area: '35 sq.m', type: 'Restricted' }
];

// Floor Options for Vertical Floor Selector (Item 7 in screenshot)
const FLOORS_LIST = [
  'Roof',
  'Floor 5',
  'Floor 4',
  'Floor 3',
  'Floor 2',
  'Floor 1',
  'Ground Floor',
  'Basement 1',
  'Basement 2'
];

export function LocationMap() {
  const navigate = useNavigate();

  // Top Filter States (Items 1-4 in screenshot)
  const [selectedSite, setSelectedSite] = useState('Dubai HQ');
  const [selectedBuilding, setSelectedBuilding] = useState('Main Building');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [selectedView, setSelectedView] = useState('Floor Plan'); // 'Floor Plan' | 'Heatmap' | 'Reader Gateways' | 'Geofence Zones'
  const [subViewTab, setSubViewTab] = useState('Map View'); // 'Map View' | 'List View' | 'Zone View'

  // Right Panel Tab ('Assets' or 'Zones') (Item 10 in screenshot)
  const [rightPanelTab, setRightPanelTab] = useState('Assets'); // 'Assets' | 'Zones'

  // Layers Popover Toggle State (Item 5 in screenshot)
  const [showLayersPopover, setShowLayersPopover] = useState(false);
  const [layers, setLayers] = useState({
    assetMarkers: true,
    roomZones: true,
    rfidReaders: false,
    geofences: true,
    assetLabels: true,
    heatmap: false
  });

  // Assets and Selection State
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState('AS-2026-00121');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTooltipPopup, setShowTooltipPopup] = useState(true);

  // Map Controls State (Item 9 in screenshot)
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Currently selected asset
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Filtering assets
  const filteredAssets = assets.filter(a => {
    const q = searchQuery.toLowerCase();
    return !q || (
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.tagNumber.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  // Icon renderer helper
  const renderAssetIcon = (iconType) => {
    switch (iconType) {
      case 'desktop': return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'printer': return <Printer className="w-5 h-5 text-slate-700" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-purple-600" />;
      case 'fire': return <Flame className="w-5 h-5 text-rose-600" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-[#6C2BD9]" />;
      case 'server': return <Server className="w-5 h-5 text-[#6C2BD9]" />;
      default: return <Box className="w-5 h-5 text-slate-600" />;
    }
  };

  // Status badge styling helper matching screenshot #16
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Location':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">In Location</span>;
      case 'Moving':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 border border-amber-300">Moving</span>;
      case 'Out of Zone':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300">Out of Zone</span>;
      case 'Offline':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300">Offline</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">In Location</span>;
    }
  };

  // Handle marker selection
  const handleMarkerClick = (asset) => {
    setSelectedAssetId(asset.id);
    setShowTooltipPopup(true);
  };

  // Handle Locate action
  const handleLocateAsset = (asset) => {
    showToast(`🎯 RTLS Signal locate ping sent for ${asset.name} (${asset.tagNumber}). Reader RSSI -54 dBm.`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen text-slate-800 font-sans select-none relative">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar matching Screenshot #16 */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6C2BD9]" />
            Location Map
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Visualize and locate your assets on interactive floor plans
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets, tags, serial numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Bell & Help Icons */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
              3
            </span>
          </button>

          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Help & Functional Specs">
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

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* Top Filter Controls Bar (Numbered 1-6 in screenshot #16) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          
          <div className="flex items-center gap-4 flex-wrap">
            
            {/* (1) Site Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Site:</span>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Abu Dhabi Hub">Abu Dhabi Hub</option>
                <option value="Riyadh Complex">Riyadh Complex</option>
              </select>
            </div>

            {/* (2) Building Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Building:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Main Building">Main Building</option>
                <option value="Warehouse A">Warehouse A</option>
                <option value="R&D Facility">R&D Facility</option>
              </select>
            </div>

            {/* (3) Floor Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Floor:</span>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                {FLOORS_LIST.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* (4) View Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">View:</span>
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Floor Plan">Floor Plan</option>
                <option value="Heatmap">Heatmap</option>
                <option value="Reader Gateways">Reader Gateways</option>
                <option value="Geofence Zones">Geofence Zones</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-3 relative">
            
            {/* (5) Layers Toggle Button & Popover */}
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
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 space-y-2 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-900">
                    <span>Map Layer Controls</span>
                    <button onClick={() => setShowLayersPopover(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Asset Markers</span>
                    <input
                      type="checkbox"
                      checked={layers.assetMarkers}
                      onChange={(e) => setLayers({ ...layers, assetMarkers: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Room / Zone Polygons</span>
                    <input
                      type="checkbox"
                      checked={layers.roomZones}
                      onChange={(e) => setLayers({ ...layers, roomZones: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>RFID / RTLS Readers</span>
                    <input
                      type="checkbox"
                      checked={layers.rfidReaders}
                      onChange={(e) => setLayers({ ...layers, rfidReaders: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Geofence Rules</span>
                    <input
                      type="checkbox"
                      checked={layers.geofences}
                      onChange={(e) => setLayers({ ...layers, geofences: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>Asset Labels</span>
                    <input
                      type="checkbox"
                      checked={layers.assetLabels}
                      onChange={(e) => setLayers({ ...layers, assetLabels: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                    <span>RSSI Signal Heatmap</span>
                    <input
                      type="checkbox"
                      checked={layers.heatmap}
                      onChange={(e) => setLayers({ ...layers, heatmap: e.target.checked })}
                      className="accent-[#6C2BD9]"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* (6) Show Filters Button */}
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Show Filters</span>
            </button>

          </div>

        </div>

        {/* Sub-Header Tabs & Legend Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 px-5 flex items-center justify-between shadow-xs">
          
          {/* Sub View Tabs */}
          <div className="flex items-center gap-2">
            {['Map View', 'List View', 'Zone View'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSubViewTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  subViewTab === tab
                    ? 'bg-purple-50 text-[#6C2BD9] border border-purple-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status Indicator Dot Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>In Location</span>
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

        {/* Main Grid: Vertical Floor Bar + Spatial Canvas + Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* (7) Vertical Floor Selector Sidebar (Left of Map) & (8) Spatial Floor Plan Container (9 Cols total) */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex h-[660px] gap-4 relative overflow-hidden">
            
            {/* (7) Vertical Floor Selector Bar */}
            <div className="w-28 flex flex-col gap-1.5 border-r border-slate-200 pr-3 overflow-y-auto shrink-0 scrollbar-thin">
              {FLOORS_LIST.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`w-full py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    selectedFloor === fl
                      ? 'bg-[#6C2BD9] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>

            {/* (8) Spatial Blueprint Floor Plan Interactive Canvas */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              
              {/* Scale Zoom Wrapper */}
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* SVG Blueprint Architectural Graphic matching screenshot #16 */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid-loc" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-loc)" />

                  {/* Outer Building Walls */}
                  <rect x="50" y="30" width="700" height="540" fill="#ffffff" stroke="#1e293b" strokeWidth="4" rx="4" />

                  {/* Room 1: IT Store (Top Left) */}
                  <rect x="50" y="30" width="220" height="190" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="160" y="140" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">IT Store</text>
                  {/* Furniture graphics */}
                  <rect x="70" y="50" width="40" height="80" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

                  {/* Room 2: Admin (Top Center) */}
                  <rect x="270" y="30" width="230" height="200" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="385" y="140" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Admin</text>

                  {/* Room 3: Meeting Room 1 (Top Right) */}
                  <rect x="500" y="30" width="250" height="200" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="625" y="140" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Meeting Room 1</text>
                  {/* Table Graphic */}
                  <rect x="550" y="80" width="150" height="70" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" rx="20" />

                  {/* Room 4: Reception (Middle Left) */}
                  <rect x="50" y="220" width="220" height="190" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="160" y="330" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Reception</text>
                  {/* Desk Arc Graphic */}
                  <path d="M 80 290 Q 160 350 240 290" fill="none" stroke="#94a3b8" strokeWidth="4" />

                  {/* Room 5: HR (Center) */}
                  <rect x="390" y="260" width="160" height="190" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="470" y="360" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">HR</text>

                  {/* Room 6: Finance (Middle Right) */}
                  <rect x="550" y="230" width="200" height="200" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="650" y="340" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Finance</text>

                  {/* Room 7: Meeting Room 2 (Bottom Left) */}
                  <rect x="50" y="410" width="220" height="160" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="160" y="500" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Meeting Room 2</text>

                  {/* Room 8: Server Room (Bottom Center - Out of Zone Highlight) */}
                  <rect
                    x="270"
                    y="410"
                    width="230"
                    height="160"
                    fill={layers.geofences ? '#fef2f2' : '#ffffff'}
                    stroke={layers.geofences ? '#ef4444' : '#334155'}
                    strokeWidth="2.5"
                    strokeDasharray={layers.geofences ? "6 3" : "none"}
                  />
                  <text x="385" y="480" textAnchor="middle" fill="#991b1b" className="text-xs font-black font-sans">Server Room</text>
                  {/* Server Racks graphic */}
                  <g fill="#475569">
                    <rect x="320" y="500" width="30" height="50" rx="2" />
                    <rect x="360" y="500" width="30" height="50" rx="2" />
                    <rect x="400" y="500" width="30" height="50" rx="2" />
                  </g>

                  {/* Room 9: Pantry (Bottom Right) */}
                  <rect x="550" y="430" width="200" height="140" fill={layers.roomZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2.5" />
                  <text x="650" y="510" textAnchor="middle" fill="#475569" className="text-xs font-black font-sans">Pantry</text>
                </svg>

                {/* Render Asset Marker Pins on Canvas */}
                {layers.assetMarkers && assets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;

                  // Marker styles matching screenshot #16
                  let markerBg = 'bg-emerald-500';
                  let iconElement = <Monitor className="w-3 h-3 text-white" />;

                  if (asset.trackingStatus === 'Moving') {
                    markerBg = 'bg-amber-500';
                    iconElement = <Laptop className="w-3 h-3 text-white" />;
                  } else if (asset.trackingStatus === 'Out of Zone') {
                    markerBg = 'bg-rose-600 animate-bounce';
                    iconElement = <span className="text-[10px] font-bold text-white">▲</span>;
                  } else if (asset.trackingStatus === 'Offline') {
                    markerBg = 'bg-slate-400';
                  }

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleMarkerClick(asset)}
                      style={{
                        left: `${asset.coords.x}%`,
                        top: `${asset.coords.y}%`
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                    >
                      {/* Selection Ring */}
                      {isSelected && (
                        <div className="absolute -inset-2.5 rounded-full border-2 border-blue-500 bg-blue-400/20 animate-pulse pointer-events-none" />
                      )}

                      {/* Marker Pin */}
                      <div className={`w-7 h-7 rounded-full ${markerBg} border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-125 ${
                        isSelected ? 'scale-125 ring-4 ring-blue-300' : ''
                      }`}>
                        {iconElement}
                      </div>

                      {/* Optional Asset Tag Label Overlay */}
                      {layers.assetLabels && (
                        <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none">
                          {asset.id}
                        </span>
                      )}

                      {/* Interactive Tooltip Callout matching AS-2026-00121 in Screenshot #16 */}
                      {isSelected && showTooltipPopup && (
                        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-xs p-3 rounded-xl shadow-2xl border border-slate-300 w-52 z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex items-start justify-between">
                            <span className="font-extrabold text-blue-700 text-xs">{asset.id}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTooltipPopup(false);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-slate-900 mt-0.5">{asset.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{asset.category}</p>
                          <p className="text-[11px] text-purple-700 font-bold mt-1">{asset.detectedZone}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* (9) Map Controls Bar Overlay (Bottom Left of Map) matching Screenshot #16 */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white border border-slate-200 rounded-xl shadow-md p-1 z-40">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 15, 70))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Home / Reset View"
                >
                  <Home className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                  title="Fit to Map"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
                <button
                  onClick={() => setShowCalibrateModal(true)}
                  className="p-1.5 hover:bg-purple-50 text-[#6C2BD9] rounded-lg transition-colors"
                  title="Admin Map Calibrate / Edit Mode"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Right Panel: (10) Assets/Zones List & (11) Asset Details Card & (12) Actions (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col h-[660px] justify-between overflow-hidden">
            
            <div className="flex flex-col min-h-0 flex-1">
              {/* Header Tabs: Assets (24) vs Zones (8) */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button
                    onClick={() => setRightPanelTab('Assets')}
                    className={`pb-1 transition-all cursor-pointer ${
                      rightPanelTab === 'Assets'
                        ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Assets ({filteredAssets.length})
                  </button>
                  <button
                    onClick={() => setRightPanelTab('Zones')}
                    className={`pb-1 transition-all cursor-pointer ${
                      rightPanelTab === 'Zones'
                        ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Zones ({MOCK_ZONES.length})
                  </button>
                </div>

                <button
                  onClick={() => setShowFiltersModal(true)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Filter list"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search Input inside List */}
              <div className="my-2 relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={rightPanelTab === 'Assets' ? "Search asset, tag or serial number..." : "Search room zones..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9] focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* (10) Scrollable Assets List or Zones List Panel */}
              <div className="flex-1 max-h-[195px] overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin shrink-0">
                {rightPanelTab === 'Assets' ? (
                  filteredAssets.map((a) => {
                    const isSelected = a.id === selectedAssetId;
                    return (
                      <div
                        key={a.id}
                        onClick={() => handleMarkerClick(a)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-purple-50/80 border-[#6C2BD9] shadow-2xs ring-1 ring-purple-300'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {renderAssetIcon(a.icon)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-[11px] text-blue-700 block truncate leading-tight">{a.id}</span>
                            <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{a.name}</p>
                            <p className="text-[9.5px] text-slate-400 font-medium truncate mt-0.5">{a.detectedZone}</p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {getStatusBadge(a.trackingStatus)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Zones List Tab */
                  MOCK_ZONES.map((z) => (
                    <div
                      key={z.code}
                      onClick={() => showToast(`Zone ${z.name} selected. Highlighted ${z.assetCount} assets.`)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-900">{z.name}</span>
                        <span className="text-[9.5px] font-mono font-bold text-[#6C2BD9] bg-purple-100 px-1.5 py-0.5 rounded">
                          {z.code}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>{z.type} • {z.area}</span>
                        <span className="font-bold text-slate-800">{z.assetCount} / {z.capacity} Assets</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* (11) Selected Asset Details Card matching Screenshot #16 */}
            <div className="pt-2 border-t border-slate-200 shrink-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Asset Details</h3>
                {getStatusBadge(selectedAsset.trackingStatus)}
              </div>

              {/* Asset Header preview */}
              <div className="flex items-center gap-2.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {renderAssetIcon(selectedAsset.icon)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-[11px] text-blue-700 block leading-tight">{selectedAsset.id}</span>
                  <span className="font-bold text-[11px] text-slate-800 truncate block leading-tight">{selectedAsset.name}</span>
                </div>
              </div>

              {/* Metadata Table matching Screenshot #16 */}
              <div className="space-y-1 text-[10.5px] font-medium text-slate-600 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Asset Number</span>
                  <span className="font-bold text-slate-800">{selectedAsset.assetNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Asset Name</span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px] text-right">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Serial Number</span>
                  <span className="font-bold text-slate-800">{selectedAsset.serialNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Tag Number (EPC)</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.tagNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Category</span>
                  <span className="font-bold text-slate-800">{selectedAsset.category}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-50">
                  <span className="text-slate-400">Current Location</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[130px]">{selectedAsset.currentLocation}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Last Seen</span>
                  <span className="font-bold text-slate-800">{selectedAsset.lastSeen}</span>
                </div>
              </div>

              {/* (12) Bottom Action Buttons matching Screenshot #16 */}
              <div className="pt-1 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleLocateAsset(selectedAsset)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <Crosshair className="w-3 h-3 shrink-0" />
                  <span>Locate</span>
                </button>

                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>View History</span>
                </button>

                <button
                  onClick={() => showToast(`More Actions dropdown opened for ${selectedAsset.id}`)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>••• More Actions &gt;</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Admin Map Calibration / Upload Modal (Triggered by ✏️ button) */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#6C2BD9]" />
                Floor Plan Configuration & Calibration
              </h3>
              <button onClick={() => setShowCalibrateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Step 1: Upload drawing */}
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2 cursor-pointer hover:bg-purple-50/50 transition-colors">
                <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto" />
                <p className="font-bold text-slate-800">Upload Architectural Floor Plan (JPG, PNG, PDF)</p>
                <p className="text-[11px] text-slate-400">Drag and drop file or click to browse. Max size 25MB.</p>
              </div>

              {/* Step 2: Scale Calibration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Known Scale Distance (Meters)</label>
                  <div className="relative">
                    <Ruler className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Target Association</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option>Dubai HQ • Main Building • Ground Floor</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Room Zone Tooling */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 font-medium">
                💡 <strong>Polygon Room Builder:</strong> Draw polygons directly over floor plan to define zone coordinates (e.g. IT Store, Server Room).
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCalibrateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCalibrateModal(false);
                  showToast('Floor plan calibration saved successfully.');
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 shadow-2xs"
              >
                Save Floor Plan Calibration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location History Modal (Triggered by 🕒 View History button) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6C2BD9]" />
                Location Movement History — {selectedAsset.id}
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700 max-h-80 overflow-y-auto pr-1">
              {[
                { time: selectedAsset.lastSeen, loc: selectedAsset.currentLocation, source: 'RFID Reader R-101 (IT Store)', type: 'RTLS Event' },
                { time: '10 Sep 2026 10:15 AM', loc: 'Reception - Ground Floor', source: 'Portal Gateway 2', type: 'RTLS Event' },
                { time: '01 Sep 2026 09:00 AM', loc: 'Central Receiving Dock', source: 'Handheld RFID Scanner', type: 'Check-In' },
                { time: '15 Aug 2026 02:00 PM', loc: 'Warehouse Storage A', source: 'System Import', type: 'Initial Register' }
              ].map((h, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{h.loc}</span>
                    <span className="text-[10px] text-slate-400">{h.time}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Source: {h.source}</span>
                    <span className="text-[#6C2BD9] font-bold">{h.type}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#6C2BD9]" />
                Filter Assets & Map View
              </h3>
              <button onClick={() => setShowFiltersModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Category</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>All Categories</option>
                  <option>IT Equipment</option>
                  <option>Printer</option>
                  <option>Tablet</option>
                  <option>Safety Equipment</option>
                  <option>Network</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Tracking Status</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>All Statuses</option>
                  <option>In Location</option>
                  <option>Moving</option>
                  <option>Out of Zone</option>
                  <option>Offline</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFiltersModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFiltersModal(false);
                  showToast('Filters applied to location map.');
                }}
                className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 shadow-2xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LocationMap;
