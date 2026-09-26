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
  ChevronDown,
  X,
  Bell,
  HelpCircle,
  Clock,
  Box,
  Monitor,
  Printer,
  Tablet,
  Laptop,
  Server,
  Crosshair,
  Download,
  RefreshCw,
  Edit3,
  SlidersHorizontal,
  Check,
  Compass,
  DoorOpen,
  Users,
  MoreHorizontal,
  Radio,
  Eye,
  Armchair
} from 'lucide-react';
import { api } from '../services/api';

// Initial Mock Assets for selection matching screenshot #19
const SEARCH_ASSETS = [
  {
    id: 'AS-2026-00121',
    assetNumber: 'AS-2026-00121',
    name: 'Dell OptiPlex 7020',
    category: 'IT Equipment',
    serialNumber: '7CD1234',
    tagNumber: 'E36000012345',
    currentLocation: 'IT Store - Ground Floor',
    lastSeen: '10 Sep 2026 11:42 AM',
    status: 'In Location',
    coords: { x: 38, y: 38 } // Reference Center
  },
  {
    id: 'AS-2026-00122',
    assetNumber: 'AS-2026-00122',
    name: 'HP LaserJet Pro',
    category: 'Printer',
    serialNumber: 'HPLJ9921',
    tagNumber: 'E36000012346',
    currentLocation: 'Finance - Ground Floor',
    lastSeen: '10 Sep 2026 11:40 AM',
    status: 'In Location',
    coords: { x: 62, y: 55 }
  }
];

// Nearby Assets Dataset sorted by Distance matching screenshot #19
const INITIAL_NEARBY_ASSETS = [
  {
    id: 'AS-2026-00125',
    assetNumber: 'AS-2026-00125',
    name: 'HP LaserJet Pro',
    category: 'Printer',
    location: 'IT Store - Ground Floor',
    distance: 2.1,
    lastSeen: '10 Sep 2026 11:42 AM',
    status: 'In Location',
    coords: { x: 33, y: 44 }, // inside radius
    inSameRoom: true
  },
  {
    id: 'AS-2026-00126',
    assetNumber: 'AS-2026-00126',
    name: 'Dell Monitor 24"',
    category: 'IT Equipment',
    location: 'IT Store - Ground Floor',
    distance: 3.4,
    lastSeen: '10 Sep 2026 11:41 AM',
    status: 'In Location',
    coords: { x: 42, y: 30 },
    inSameRoom: true
  },
  {
    id: 'AS-2026-00127',
    assetNumber: 'AS-2026-00127',
    name: 'Lenovo ThinkPad',
    category: 'Laptop',
    location: 'IT Store - Ground Floor',
    distance: 4.8,
    lastSeen: '10 Sep 2026 11:40 AM',
    status: 'In Location',
    coords: { x: 31, y: 34 },
    inSameRoom: true
  },
  {
    id: 'AS-2026-00128',
    assetNumber: 'AS-2026-00128',
    name: 'Cisco Switch',
    category: 'Network Device',
    location: 'IT Store - Ground Floor',
    distance: 6.2,
    lastSeen: '10 Sep 2026 11:39 AM',
    status: 'In Location',
    coords: { x: 41, y: 46 },
    inSameRoom: true
  },
  {
    id: 'AS-2026-00129',
    assetNumber: 'AS-2026-00129',
    name: 'iPad Air',
    category: 'Tablet',
    location: 'Meeting Room 1 - Ground Floor',
    distance: 8.6,
    lastSeen: '10 Sep 2026 11:38 AM',
    status: 'In Location',
    coords: { x: 49, y: 32 }, // adjacent room
    inSameRoom: false
  },
  {
    id: 'AS-2026-00130',
    assetNumber: 'AS-2026-00130',
    name: 'Office Chair',
    category: 'Furniture',
    location: 'IT Store - Ground Floor',
    distance: 9.7,
    lastSeen: '10 Sep 2026 11:37 AM',
    status: 'In Location',
    coords: { x: 44, y: 48 },
    inSameRoom: true
  }
];

// Additional assets outside radius
const OUTSIDE_ASSETS = [
  { id: 'AS-2026-00140', name: 'Scanner', status: 'In Location', coords: { x: 26, y: 74 }, isMoving: false },
  { id: 'AS-2026-00150', name: 'Mobile Cart', status: 'Moving Asset', coords: { x: 64, y: 34 }, isMoving: true },
  { id: 'AS-2026-00160', name: 'Fire Extinguisher', status: 'Out of Zone', coords: { x: 65, y: 74 }, isMoving: false }
];

export function ProximitySearch() {
  const navigate = useNavigate();

  // Search Mode Sub-Tabs (Search by Asset | Search by Location)
  const [searchMode, setSearchMode] = useState('Search by Asset');

  // Search Parameter Controls
  const [selectedAssetId, setSelectedAssetId] = useState('AS-2026-00121');
  const [searchRadius, setSearchRadius] = useState('10 meters');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [selectedView, setSelectedView] = useState('Floor Plan');

  // Map Layers Toggle State
  const [layers, setLayers] = useState({
    assets: true,
    nearbyAssets: true,
    roomsZones: true,
    readers: false,
    searchRadius: true
  });

  // Selected Reference Asset Object
  const referenceAsset = SEARCH_ASSETS.find(a => a.id === selectedAssetId) || SEARCH_ASSETS[0];

  // Map Click custom reference location point when in "Search by Location" mode
  const [customPointCoords, setCustomPointCoords] = useState(null);

  // Zoom level
  const [zoomLevel, setZoomLevel] = useState(100);

  // Highlighting specific result
  const [highlightedAssetId, setHighlightedAssetId] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Execute proximity search
  const handleExecuteSearch = () => {
    showToast(`🎯 Proximity Search executed for ${referenceAsset.id} within ${searchRadius}. Found 6 nearby assets.`);
  };

  // Reset filters
  const handleReset = () => {
    setSelectedAssetId('AS-2026-00121');
    setSearchRadius('10 meters');
    setSelectedFloor('Ground Floor');
    setSelectedView('Floor Plan');
    setCustomPointCoords(null);
    showToast('Proximity search parameters reset.');
  };

  // Icon renderer helper
  const renderAssetIcon = (iconType) => {
    switch (iconType) {
      case 'printer': return <Printer className="w-4 h-4 text-slate-700" />;
      case 'laptop': return <Laptop className="w-4 h-4 text-[#6C2BD9]" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-purple-600" />;
      default: return <Monitor className="w-4 h-4 text-[#6C2BD9]" />;
    }
  };

  // Compute Statistics Summary matching Screenshot #19
  const stats = {
    totalFound: INITIAL_NEARBY_ASSETS.length,
    inSameRoom: INITIAL_NEARBY_ASSETS.filter(a => a.inSameRoom).length,
    inAdjacentRoom: INITIAL_NEARBY_ASSETS.filter(a => !a.inSameRoom).length
  };

  // Calculate Radius Circle Pixel size depending on radius selection
  const radiusCirclePercent = searchRadius === '5 meters' ? 18 : searchRadius === '20 meters' ? 42 : searchRadius === '50 meters' ? 65 : 28;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen text-slate-800 font-sans select-none relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <Crosshair className="w-4 h-4 animate-pulse text-cyan-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar matching Screenshot #19 */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#6C2BD9]" />
            Proximity Search
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Find assets near a selected asset or location
          </p>
        </div>

        <div className="flex items-center gap-4">
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

      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* Search Mode Sub-Tabs (Search by Asset | Search by Location) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          {['Search by Asset', 'Search by Location'].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSearchMode(mode);
                showToast(`Switched mode to ${mode}`);
              }}
              className={`px-5 py-2 text-xs font-extrabold transition-all cursor-pointer rounded-t-xl ${
                searchMode === mode
                  ? 'bg-white text-[#6C2BD9] border-t-2 border-x border-slate-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Search Parameter Inputs Bar matching Screenshot #19 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Asset Input / Selector */}
            {searchMode === 'Search by Asset' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Asset:</span>
                <div className="relative">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    {SEARCH_ASSETS.map(a => (
                      <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-[#6C2BD9] bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                <span>Click any point on the floor map to set Search Center</span>
              </div>
            )}

            {/* Search Radius Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Search Radius:</span>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="5 meters">5 meters</option>
                <option value="10 meters">10 meters</option>
                <option value="20 meters">20 meters</option>
                <option value="50 meters">50 meters</option>
              </select>
            </div>

            {/* Floor Dropdown */}
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

            {/* View Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">View:</span>
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Floor Plan">Floor Plan</option>
                <option value="Satellite">Satellite</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Search Nearby Assets</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Upper Half Grid: Interactive Spatial Floor Plan (8 cols) + Right Cards (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Spatial Map Canvas with Dynamic Blue Proximity Circle (8 cols) matching Screenshot #19 */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[520px] relative">
            
            {/* Map Header Subtitle Label */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <span className="text-xs font-extrabold text-[#6C2BD9] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Dubai HQ - Main Building - {selectedFloor}
              </span>

              <span className="text-[11px] text-slate-400 font-medium">
                Reference Point: <strong className="text-slate-800">{referenceAsset.name} ({referenceAsset.id})</strong>
              </span>
            </div>

            {/* Spatial Graphic Canvas */}
            <div className="flex-1 my-2 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* SVG Blueprint Floor Plan matching Screenshot #19 */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="grid-prox" width="35" height="35" patternUnits="userSpaceOnUse">
                      <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-prox)" />

                  {/* Outer Wall */}
                  <rect x="40" y="25" width="720" height="450" fill="#ffffff" stroke="#1e293b" strokeWidth="3" rx="4" />

                  {/* Room 1: IT Store (Reference location center) */}
                  <rect x="40" y="25" width="260" height="230" fill={layers.roomsZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2" />
                  <text x="170" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">IT Store</text>

                  {/* Room 2: Admin */}
                  <rect x="300" y="25" width="220" height="230" fill={layers.roomsZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2" />
                  <text x="410" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Admin</text>

                  {/* Room 3: Meeting Room 1 */}
                  <rect x="520" y="25" width="240" height="230" fill={layers.roomsZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2" />
                  <text x="640" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Meeting Room 1</text>
                  <rect x="570" y="80" width="140" height="60" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" rx="20" />

                  {/* Room 4: Reception */}
                  <rect x="40" y="255" width="260" height="220" fill={layers.roomsZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2" />
                  <text x="170" y="360" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Reception</text>

                  {/* Room 5: Finance */}
                  <rect x="520" y="255" width="240" height="220" fill={layers.roomsZones ? '#f8fafc' : '#ffffff'} stroke="#334155" strokeWidth="2" />
                  <text x="640" y="360" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Finance</text>
                </svg>

                {/* Dynamic Proximity Radius Circle Overlay matching Screenshot #19 */}
                {layers.searchRadius && (
                  <div
                    style={{
                      left: `${referenceAsset.coords.x}%`,
                      top: `${referenceAsset.coords.y}%`,
                      width: `${radiusCirclePercent}%`,
                      height: `${radiusCirclePercent * 1.6}%`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#6C2BD9] bg-purple-500/10 flex items-center justify-center pointer-events-none z-20 animate-pulse"
                  >
                    <span className="bg-[#6C2BD9] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                      {searchRadius}
                    </span>
                  </div>
                )}

                {/* Reference Center Asset Pin (Blue Marker) matching Screenshot #19 */}
                <div
                  style={{ left: `${referenceAsset.coords.x}%`, top: `${referenceAsset.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6C2BD9] border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-purple-300">
                    <Monitor className="w-4 h-4" />
                  </div>

                  {/* Reference Callout Popup matching Screenshot #19 */}
                  <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-xs p-2.5 rounded-xl shadow-2xl border border-slate-300 whitespace-nowrap z-50">
                    <span className="font-bold text-[#6C2BD9] block">{referenceAsset.id}</span>
                    <span className="font-bold text-slate-900 block">{referenceAsset.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{referenceAsset.category}</span>
                  </div>
                </div>

                {/* Nearby Asset Pins (Green Markers) inside radius matching Screenshot #19 */}
                {layers.nearbyAssets && INITIAL_NEARBY_ASSETS.map((asset) => {
                  const isHighlighted = highlightedAssetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setHighlightedAssetId(asset.id);
                        showToast(`Nearby Asset ${asset.id} selected. Distance: ${asset.distance}m.`);
                      }}
                      style={{ left: `${asset.coords.x}%`, top: `${asset.coords.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white transition-transform hover:scale-125 ${
                        isHighlighted ? 'ring-4 ring-emerald-300 scale-125' : ''
                      }`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>

                      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap z-50">
                        <span className="font-bold">{asset.id} • {asset.name}</span>
                        <span className="text-emerald-400 font-bold block">{asset.distance}m away</span>
                      </div>
                    </div>
                  );
                })}

                {/* Outside Assets (Other / Moving / Out of Zone) */}
                {layers.assets && OUTSIDE_ASSETS.map((asset, idx) => (
                  <div
                    key={idx}
                    style={{ left: `${asset.coords.x}%`, top: `${asset.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    <div className={`w-5 h-5 rounded-full border border-white shadow-sm flex items-center justify-center text-white ${
                      asset.isMoving ? 'bg-amber-500' : 'bg-slate-400'
                    }`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                ))}

              </div>

              {/* Map Controls (Top Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-sm p-1 z-30">
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 15, 70))} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoomLevel(100)} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Reset View"><Home className="w-3.5 h-3.5" /></button>
              </div>

              {/* Floating Map Layers Popover Menu (Top Right inside map) matching Screenshot #19 */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-md p-2.5 z-30 text-xs font-bold text-slate-700 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Map Layers</span>
                <label className="flex items-center gap-2 cursor-pointer text-[11px]"><input type="checkbox" checked={layers.assets} onChange={(e) => setLayers({ ...layers, assets: e.target.checked })} className="accent-[#6C2BD9]" /> Assets</label>
                <label className="flex items-center gap-2 cursor-pointer text-[11px]"><input type="checkbox" checked={layers.nearbyAssets} onChange={(e) => setLayers({ ...layers, nearbyAssets: e.target.checked })} className="accent-[#6C2BD9]" /> Nearby Assets</label>
                <label className="flex items-center gap-2 cursor-pointer text-[11px]"><input type="checkbox" checked={layers.roomsZones} onChange={(e) => setLayers({ ...layers, roomsZones: e.target.checked })} className="accent-[#6C2BD9]" /> Rooms / Zones</label>
                <label className="flex items-center gap-2 cursor-pointer text-[11px]"><input type="checkbox" checked={layers.searchRadius} onChange={(e) => setLayers({ ...layers, searchRadius: e.target.checked })} className="accent-[#6C2BD9]" /> Search Radius</label>
              </div>

            </div>

            {/* Bottom Legend matching Screenshot #19 */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-5 text-xs font-semibold text-slate-600 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#6C2BD9] inline-block" />
                <span>Selected Asset</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Nearby Asset</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
                <span>Other Asset</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Moving Asset</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
                <span>Out of Zone</span>
              </div>
            </div>

          </div>

          {/* Right Panel: Selected Asset Details & Statistics (4 cols) matching Screenshot #19 */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col h-[520px] overflow-y-auto scrollbar-thin">
            
            {/* Card 1: Selected Asset Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900">Selected Asset Details</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                  {referenceAsset.status}
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5 text-[#6C2BD9]" />
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-xs text-[#6C2BD9] block">{referenceAsset.id}</span>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{referenceAsset.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{referenceAsset.category}</p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] font-medium text-slate-600">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Serial Number</span>
                  <span className="font-bold text-slate-800">{referenceAsset.serialNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Tag Number (EPC)</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{referenceAsset.tagNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Current Location</span>
                  <span className="font-bold text-slate-800">{referenceAsset.currentLocation}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Last Seen</span>
                  <span className="font-bold text-slate-800">{referenceAsset.lastSeen}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Search Parameters */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 pb-1 border-b border-slate-200/60">
                <span>Search Parameters</span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Search Radius</span>
                <span className="font-bold text-[#6C2BD9]">{searchRadius}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Location</span>
                <span className="font-bold text-slate-800">{referenceAsset.currentLocation}</span>
              </div>
            </div>

            {/* Card 3: Proximity Statistics Summary (3 Cards) matching Screenshot #19 */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">Statistics</h4>
              <div className="grid grid-cols-3 gap-2">
                
                {/* Total Found */}
                <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[#6C2BD9]">
                    <Compass className="w-3.5 h-3.5" />
                    <span className="text-base font-black">{stats.totalFound}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-0.5">Assets Found</p>
                </div>

                {/* In Same Room */}
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-700">
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span className="text-base font-black">{stats.inSameRoom}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-0.5">In Same Room</p>
                </div>

                {/* In Adjacent Room */}
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-700">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-base font-black">{stats.inAdjacentRoom}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-0.5">In Adjacent Room</p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Lower Half Grid: Nearby Assets Table (`Nearby Assets (6)`) matching Screenshot #19 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          
          {/* Table Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Nearby Assets <span className="text-xs font-semibold text-slate-500">({INITIAL_NEARBY_ASSETS.length})</span>
            </h3>

            <button
              onClick={() => showToast('📥 Exporting Proximity Search results...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Table Grid matching Screenshot #19 */}
          <div className="overflow-auto max-h-[450px]">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] shadow-2xs">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Asset Number</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Current Location</th>
                  <th className="p-3">Distance (m)</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_NEARBY_ASSETS.map((a, idx) => {
                  const isSelected = highlightedAssetId === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setHighlightedAssetId(a.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/80 font-bold text-[#6C2BD9]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">{a.assetNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{a.name}</td>
                      <td className="p-3 text-slate-600">{a.category}</td>
                      <td className="p-3">{a.location}</td>
                      <td className="p-3 font-mono font-bold text-[#6C2BD9]">{a.distance} m</td>
                      <td className="p-3 text-slate-500">{a.lastSeen}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHighlightedAssetId(a.id);
                            showToast(`Centering map on ${a.name} (${a.distance}m away)`);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-[#6C2BD9]"
                          title="Locate on Map"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-600">Showing {INITIAL_NEARBY_ASSETS.length} records</span>
            <span className="text-slate-400">Scroll down to view all records</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProximitySearch;
