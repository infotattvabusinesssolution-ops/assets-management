import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Box,
  Wifi,
  AlertTriangle,
  Plus,
  Minus,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crosshair,
  SlidersHorizontal,
  X,
  Radio,
  Printer,
  Monitor,
  Tablet,
  Armchair,
  Laptop,
  Flame,
  Battery,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

export function AssetTracking() {
  const navigate = useNavigate();

  // Top KPI Metrics
  const kpis = {
    total: '12,458',
    online: '1,245',
    inLocation: '11,892',
    outOfZone: '24'
  };

  // View States
  const [activeView, setActiveView] = useState('Map View'); // 'Map View' | 'Floor Plan' | 'List View' | 'Geofence View'
  const [mapMode, setMapMode] = useState('Indoor Map'); // 'Indoor Map' | 'Satellite' | 'Hybrid'
  const [selectedBuilding, setSelectedBuilding] = useState('Dubai HQ');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Selected Asset & Details Panel State
  const [selectedAssetId, setSelectedAssetId] = useState('AS-2026-00121');
  const [detailsTab, setDetailsTab] = useState('Details'); // 'Details' | 'Location History' | 'Movements' | 'Maintenance'

  // Map Zoom State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [lastUpdated, setLastUpdated] = useState('10 Sep 2026 11:42 AM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Asset List Matching Exact Screenshot #15
  const [assets, setAssets] = useState([
    {
      id: 'AS-2026-00121',
      assetNumber: 'AS-2026-00121',
      name: 'Dell OptiPlex 7020',
      category: 'IT Equipment',
      serialNumber: '7CD1234',
      tagNumber: 'E36000012345',
      location: 'Dubai HQ',
      floorRoom: 'Ground Floor IT Store',
      status: 'In Location',
      trackingStatus: 'In Location', // 'In Location' | 'Moved' | 'Out of Zone' | 'Offline'
      lastSeen: '10 Sep 2026 11:42 AM',
      assignedTo: 'IT Department',
      assetStatus: 'Active',
      battery: 85,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&q=80',
      coords: { x: 18, y: 22 }, // IT Store
      icon: 'desktop'
    },
    {
      id: 'AS-2026-00122',
      assetNumber: 'AS-2026-00122',
      name: 'HP LaserJet Pro',
      category: 'Printer',
      serialNumber: 'CNB89001',
      tagNumber: 'E36000012346',
      location: 'Dubai HQ',
      floorRoom: 'Ground Floor Admin Area',
      status: 'In Location',
      trackingStatus: 'In Location',
      lastSeen: '10 Sep 2026 11:40 AM',
      assignedTo: 'Administration',
      assetStatus: 'Active',
      battery: null,
      imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&q=80',
      coords: { x: 42, y: 25 }, // Admin
      icon: 'printer'
    },
    {
      id: 'AS-2026-00125',
      assetNumber: 'AS-2026-00125',
      name: 'iPad Air',
      category: 'Tablet',
      serialNumber: 'IPD-7782',
      tagNumber: 'E36000012349',
      location: 'Dubai HQ',
      floorRoom: '1st Floor Meeting Room 1',
      status: 'Moved',
      trackingStatus: 'Moved',
      lastSeen: '10 Sep 2026 11:35 AM',
      assignedTo: 'Executive Board',
      assetStatus: 'Active',
      battery: 62,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80',
      coords: { x: 74, y: 22 }, // Conference Room
      icon: 'tablet'
    },
    {
      id: 'AS-2026-00130',
      assetNumber: 'AS-2026-00130',
      name: 'Office Chair',
      category: 'Furniture',
      serialNumber: 'CH-5567',
      tagNumber: 'E36000012355',
      location: 'Dubai HQ',
      floorRoom: 'Ground Floor HR Area',
      status: 'In Location',
      trackingStatus: 'In Location',
      lastSeen: '10 Sep 2026 11:30 AM',
      assignedTo: 'HR Department',
      assetStatus: 'Active',
      battery: null,
      imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=300&q=80',
      coords: { x: 50, y: 70 }, // HR
      icon: 'chair'
    },
    {
      id: 'AS-2026-00145',
      assetNumber: 'AS-2026-00145',
      name: 'Samsung Monitor 27"',
      category: 'Monitor',
      serialNumber: 'SM27-3310',
      tagNumber: 'E36000012360',
      location: 'Dubai HQ',
      floorRoom: '2nd Floor Finance',
      status: 'In Location',
      trackingStatus: 'In Location',
      lastSeen: '10 Sep 2026 11:28 AM',
      assignedTo: 'Finance Dept',
      assetStatus: 'Active',
      battery: null,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80',
      coords: { x: 68, y: 75 }, // Finance
      icon: 'monitor'
    },
    {
      id: 'AS-2026-00152',
      assetNumber: 'AS-2026-00152',
      name: 'Access Point',
      category: 'Network',
      serialNumber: 'AP-9981',
      tagNumber: 'E36000012370',
      location: 'Dubai HQ',
      floorRoom: 'Ground Floor IT Room',
      status: 'In Location',
      trackingStatus: 'In Location',
      lastSeen: '10 Sep 2026 11:41 AM',
      assignedTo: 'IT Infrastructure',
      assetStatus: 'Active',
      battery: 100,
      imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=300&q=80',
      coords: { x: 38, y: 72 }, // Server Room
      icon: 'ap'
    },
    {
      id: 'AS-2026-00160',
      assetNumber: 'AS-2026-00160',
      name: 'Fire Extinguisher',
      category: 'Safety Equipment',
      serialNumber: 'FE-CO2-0044',
      tagNumber: 'E36000012380',
      location: 'Dubai HQ',
      floorRoom: 'Out of Zone',
      status: 'Out of Zone',
      trackingStatus: 'Out of Zone',
      lastSeen: '10 Sep 2026 11:15 AM',
      assignedTo: 'HSE & Safety',
      assetStatus: 'Active',
      battery: 90,
      imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=300&q=80',
      coords: { x: 18, y: 72 }, // Meeting Room 1 (Violation)
      icon: 'fire'
    },
    {
      id: 'AS-2026-00178',
      assetNumber: 'AS-2026-00178',
      name: 'Laptop - Lenovo',
      category: 'IT Equipment',
      serialNumber: 'PF9A2211',
      tagNumber: 'E36000012399',
      location: 'Dubai HQ',
      floorRoom: 'Last Seen 09 Sep 2026 04:12 PM',
      status: 'Offline',
      trackingStatus: 'Offline',
      lastSeen: '09 Sep 2026 04:12 PM',
      assignedTo: 'IT Department',
      assetStatus: 'In Maintenance',
      battery: 15,
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&q=80',
      coords: { x: 18, y: 46 }, // Reception
      icon: 'laptop'
    }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getDate()} Sep ${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} AM`;
      setLastUpdated(timeStr);
      setIsRefreshing(false);
      showToast('RTLS signal data refreshed.');
    }, 600);
  };

  // Selected asset
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Filtering assets
  const filteredAssets = assets.filter((a) => {
    const term = searchQuery.toLowerCase();
    const matchQuery =
      a.assetNumber.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      a.serialNumber.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term);

    if (!matchQuery) return false;

    if (statusFilter === 'IN_LOCATION') return a.trackingStatus === 'In Location';
    if (statusFilter === 'ONLINE') return a.trackingStatus !== 'Offline';
    if (statusFilter === 'OUT_OF_ZONE') return a.trackingStatus === 'Out of Zone';
    if (statusFilter === 'MOVED') return a.trackingStatus === 'Moved';

    return true;
  });

  // Render Icon helper
  const renderAssetThumbnail = (asset) => {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const handleLocateAsset = () => {
    showToast(`Locating ping sent for ${selectedAsset.name} (${selectedAsset.assetNumber}).`);
  };

  const handleViewOnMap = () => {
    setActiveView('Map View');
    showToast(`Centered map on ${selectedAsset.name} in ${selectedAsset.floorRoom}.`);
  };

  return (
    <div className="space-y-4 select-none pb-12 font-sans">
      {/* Toast Banner */}
      {toast && (
        <div
          className={clsx(
            'fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4',
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          )}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Top KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Card 1: Total Assets (3 Cols) */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 border border-purple-100">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Assets</p>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{kpis.total}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: Assets Online (3 Cols) */}
        <div
          onClick={() => setStatusFilter('ONLINE')}
          className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                Assets Online <span className="text-[10px] text-slate-400">(RTLS/Active)</span>
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{kpis.online}</h3>
            </div>
          </div>
        </div>

        {/* Card 3: Assets in Location (3 Cols) */}
        <div
          onClick={() => setStatusFilter('IN_LOCATION')}
          className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Assets in Location</p>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{kpis.inLocation}</h3>
            </div>
          </div>
        </div>

        {/* Card 4: Assets Out of Zone (3 Cols) */}
        <div
          onClick={() => setStatusFilter('OUT_OF_ZONE')}
          className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Assets Out of Zone</p>
              <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{kpis.outOfZone}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar (View Tabs, Building & Floor Selectors, Show Filters, Last Updated) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left View Tabs */}
        <div className="flex items-center gap-2">
          {['Map View', 'Floor Plan', 'List View', 'Geofence View'].map((tab) => {
            const isActive = activeView === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-[#6C2BD9] text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Selectors & Actions */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {/* Last Updated Timestamp */}
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            Last Updated <span className="font-bold text-slate-700">{lastUpdated}</span>
          </span>

          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5 text-[#6C2BD9]', isRefreshing && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          {/* Building Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Building</span>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Abu Dhabi Hub">Abu Dhabi Hub</option>
            </select>
          </div>

          {/* Floor Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Floor</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Ground Floor">Ground Floor</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
            </select>
          </div>

          {/* Show Filters Button */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Show Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Main 3-Column Split Workspace Layout */}
      {activeView === 'Map View' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* ========================================================= */}
          {/* COLUMN 1 (Span 3): Assets List Sidebar                    */}
          {/* ========================================================= */}
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 h-[620px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-[#5B21B6]">
                Assets ({filteredAssets.length})
              </h3>
              <button
                onClick={() => setShowFiltersModal(true)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search asset, tag or serial number..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Scrollable Asset Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={clsx(
                      'p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 pt-2',
                      isSelected
                        ? 'bg-purple-50/80 border-[#6C2BD9] shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50/80'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderAssetThumbnail(asset)}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#6C2BD9]">
                            {asset.assetNumber}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                          {asset.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {asset.category}
                        </p>
                      </div>
                    </div>

                    {/* Location & Dot Indicator */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        {asset.trackingStatus === 'In Location' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                        )}
                        {asset.trackingStatus === 'Moved' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
                        )}
                        {asset.trackingStatus === 'Out of Zone' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-2xs animate-pulse" />
                        )}
                        {asset.trackingStatus === 'Offline' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-2xs" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 mt-0.5 max-w-[90px] truncate">
                        {asset.location}
                      </p>
                      <p className="text-[9px] text-slate-500 max-w-[90px] truncate leading-tight">
                        {asset.floorRoom}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    className={clsx(
                      'w-5 h-5 rounded text-[11px] font-bold',
                      p === 1 ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <span className="text-[10px]">... 31</span>
              </div>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2 (Span 6): Central Floor Plan Map                */}
          {/* ========================================================= */}
          <div className="xl:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 h-[620px] flex flex-col relative">
            {/* Map Mode Buttons & Location Label Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs font-semibold">
                {['Indoor Map', 'Satellite', 'Hybrid'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMapMode(m)}
                    className={clsx(
                      'px-3 py-1 rounded-lg transition-all cursor-pointer',
                      mapMode === m
                        ? 'bg-[#6C2BD9] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-[#6C2BD9]">
                {selectedBuilding} - {selectedFloor}
              </span>
            </div>

            {/* Map Canvas with Blueprint SVG */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              {/* Vector Architectural Floor Plan SVG */}
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <svg
                  className="w-full h-full absolute inset-0"
                  viewBox="0 0 800 600"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Grid */}
                  <defs>
                    <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#archGrid)" />

                  {/* Building Exterior Border */}
                  <rect
                    x="50"
                    y="40"
                    width="700"
                    height="520"
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="3.5"
                    rx="4"
                  />

                  {/* Room 1: IT Store */}
                  <rect x="50" y="40" width="220" height="180" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="160" y="130" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    IT Store
                  </text>

                  {/* Room 2: Admin */}
                  <rect x="270" y="40" width="260" height="200" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="400" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Admin
                  </text>

                  {/* Room 3: Conference Room */}
                  <rect x="530" y="40" width="220" height="200" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="640" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Conference Room
                  </text>
                  <rect x="580" y="90" width="120" height="60" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" rx="20" />

                  {/* Room 4: Reception */}
                  <rect x="50" y="220" width="220" height="180" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="160" y="310" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Reception
                  </text>

                  {/* Room 5: HR */}
                  <rect x="420" y="240" width="160" height="200" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="500" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    HR
                  </text>

                  {/* Room 6: Finance */}
                  <rect x="580" y="240" width="170" height="200" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="665" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Finance
                  </text>

                  {/* Room 7: Meeting Room 1 */}
                  <rect x="50" y="400" width="220" height="160" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="160" y="480" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Meeting Room 1
                  </text>

                  {/* Room 8: Server Room */}
                  <rect x="270" y="380" width="190" height="180" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="365" y="470" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Server Room
                  </text>

                  {/* Room 9: Pantry */}
                  <rect x="580" y="440" width="170" height="120" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                  <text x="665" y="500" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold font-sans">
                    Pantry
                  </text>
                </svg>

                {/* Plotted Asset Map Markers */}
                {assets.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  let colorClass = 'bg-emerald-500';

                  if (asset.trackingStatus === 'Moved') colorClass = 'bg-amber-500';
                  if (asset.trackingStatus === 'Out of Zone') colorClass = 'bg-rose-600 animate-pulse';
                  if (asset.trackingStatus === 'Offline') colorClass = 'bg-slate-400';

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      style={{
                        left: `${asset.coords.x}%`,
                        top: `${asset.coords.y}%`
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                    >
                      {/* Selection Ring */}
                      {isSelected && (
                        <div className="absolute -inset-3 rounded-full border-2 border-[#6C2BD9] bg-purple-500/20 animate-pulse pointer-events-none" />
                      )}

                      {/* Main Dot Marker */}
                      <div className={`w-4 h-4 rounded-full ${colorClass} border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125`}>
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Zoom Controls Overlay (Upper Right) */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-xs p-1 z-20">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Legend Bar (Matching screenshot #15) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-5 text-xs font-semibold text-slate-600 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>In Location</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Moved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
                <span>Out of Zone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
                <span>Offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#6C2BD9] inline-block" />
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3 (Span 3): Right Asset Details Panel              */}
          {/* ========================================================= */}
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 h-[620px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-[#5B21B6]">Asset Details</h3>
              <ChevronUp className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Header Selected Asset Thumbnail Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={selectedAsset.imageUrl}
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <span className="font-mono font-bold text-xs text-[#6C2BD9] block leading-tight">
                    {selectedAsset.assetNumber}
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">
                    {selectedAsset.name}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 whitespace-nowrap">
                {selectedAsset.status}
              </span>
            </div>

            {/* Details Sub-Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs font-bold shrink-0">
              {['Details', 'Location History', 'Movements', 'Maintenance'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDetailsTab(t)}
                  className={clsx(
                    'pb-1.5 transition-all cursor-pointer whitespace-nowrap text-[11px]',
                    detailsTab === t
                      ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Details Key-Value List */}
            {detailsTab === 'Details' && (
              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-medium text-slate-600 pr-1 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium text-[11px]">Asset Number</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {selectedAsset.assetNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Asset Name</span>
                  <span className="font-semibold text-slate-800 text-xs truncate max-w-[130px] text-right">
                    {selectedAsset.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Category</span>
                  <span className="text-slate-700 font-semibold text-xs">{selectedAsset.category}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Serial Number</span>
                  <span className="font-mono text-slate-700 font-semibold text-xs">{selectedAsset.serialNumber}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Tag Number</span>
                  <span className="font-mono font-bold text-[#6C2BD9] text-xs">{selectedAsset.tagNumber}</span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100 gap-3">
                  <span className="text-slate-500 font-medium text-[11px] shrink-0">Current Location</span>
                  <span className="text-slate-800 font-semibold text-xs text-right leading-tight">
                    {selectedAsset.location} - {selectedFloor}
                    <br />
                    <span className="text-[10px] text-slate-500 font-normal">{selectedAsset.floorRoom}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Last Seen</span>
                  <span className="text-slate-800 font-semibold text-xs">{selectedAsset.lastSeen}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Assigned To</span>
                  <span className="text-slate-800 font-semibold text-xs">{selectedAsset.assignedTo}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px]">Status</span>
                  <span className="text-slate-800 font-semibold text-xs">{selectedAsset.assetStatus}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium text-[11px]">Battery (if applicable)</span>
                  {selectedAsset.battery !== null ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-900 text-xs">{selectedAsset.battery}%</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">N/A</span>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Action Buttons (Locate, View on Map, More Actions) */}
            <div className="pt-2 border-t border-slate-100 space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleLocateAsset}
                  className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-[#6C2BD9] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Locate</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewOnMap}
                  className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-[#6C2BD9] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => showToast(`More actions for ${selectedAsset.assetNumber}`)}
                className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>••• More Actions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
