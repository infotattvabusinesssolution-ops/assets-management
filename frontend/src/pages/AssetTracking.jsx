import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Layers,
  Wifi,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Maximize2,
  Radio,
  Calendar,
  User,
  Tag,
  Box,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
  FileText,
  Wrench,
  ArrowLeftRight,
  Building,
  Check,
  ExternalLink,
  Crosshair,
  Battery,
  SlidersHorizontal,
  X,
  Bell,
  HelpCircle,
  Laptop,
  Printer,
  Tablet,
  Armchair,
  Monitor,
  WifiOff,
  Flame,
  Download,
  AlertCircle,
  Compass
} from 'lucide-react';
import { api } from '../services/api';

// Initial Mock Assets matching screenshot #15
const INITIAL_ASSETS = [
  {
    id: 'AS-2026-00121',
    assetNumber: 'AS-2026-00121',
    name: 'Dell OptiPlex 7020',
    category: 'IT Equipment',
    serialNumber: '7CD1234',
    tagNumber: 'E36000012345',
    assignedLocation: 'Dubai HQ - Ground Floor / IT Store',
    currentLocation: 'Dubai HQ - Ground Floor / IT Store',
    detectedZone: 'IT Store',
    status: 'In Location',
    trackingStatus: 'In Location', // 'In Location' | 'Moved' | 'Out of Zone' | 'Offline'
    lastSeen: '10 Sep 2026 11:42 AM',
    assignedTo: 'IT Department',
    assetStatus: 'Active',
    battery: 85,
    icon: 'desktop',
    coords: { x: 44, y: 35 }, // percentage on floor map
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -54,
    readerId: 'R-101-ITSTORE',
    antenna: 'Antenna 1'
  },
  {
    id: 'AS-2026-00122',
    assetNumber: 'AS-2026-00122',
    name: 'HP LaserJet Pro',
    category: 'Printer',
    serialNumber: 'HPLJ9921',
    tagNumber: 'E36000012346',
    assignedLocation: 'Dubai HQ - Ground Floor / Admin Area',
    currentLocation: 'Dubai HQ - Ground Floor / Admin Area',
    detectedZone: 'Admin',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:40 AM',
    assignedTo: 'Administration',
    assetStatus: 'Active',
    battery: null, // AC powered
    icon: 'printer',
    coords: { x: 53, y: 30 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -58,
    readerId: 'R-102-ADMIN',
    antenna: 'Antenna 2'
  },
  {
    id: 'AS-2026-00125',
    assetNumber: 'AS-2026-00125',
    name: 'iPad Air',
    category: 'Tablet',
    serialNumber: 'DMQX90812',
    tagNumber: 'E36000012349',
    assignedLocation: 'Dubai HQ - 1st Floor / IT Store',
    currentLocation: 'Dubai HQ - Ground Floor / Meeting Room 1',
    detectedZone: 'Meeting Room 1',
    status: 'Moved',
    trackingStatus: 'Moved',
    lastSeen: '10 Sep 2026 11:35 AM',
    assignedTo: 'Executive Mgmt',
    assetStatus: 'Active',
    battery: 62,
    icon: 'tablet',
    coords: { x: 53, y: 78 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -65,
    readerId: 'R-103-MEET1',
    antenna: 'Antenna 1'
  },
  {
    id: 'AS-2026-00130',
    assetNumber: 'AS-2026-00130',
    name: 'Office Chair',
    category: 'Furniture',
    serialNumber: 'OCH-7712',
    tagNumber: 'E36000012355',
    assignedLocation: 'Dubai HQ - Ground Floor / HR Area',
    currentLocation: 'Dubai HQ - Ground Floor / HR Area',
    detectedZone: 'HR',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:30 AM',
    assignedTo: 'HR Department',
    assetStatus: 'Active',
    battery: null,
    icon: 'chair',
    coords: { x: 61, y: 72 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -60,
    readerId: 'R-104-HR',
    antenna: 'Antenna 1'
  },
  {
    id: 'AS-2026-00145',
    assetNumber: 'AS-2026-00145',
    name: 'Samsung Monitor 27"',
    category: 'Monitor',
    serialNumber: 'SAM27-4409',
    tagNumber: 'E36000012360',
    assignedLocation: 'Dubai HQ - Ground Floor / Finance',
    currentLocation: 'Dubai HQ - Ground Floor / Finance',
    detectedZone: 'Finance',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:28 AM',
    assignedTo: 'Finance Dept',
    assetStatus: 'Active',
    battery: null,
    icon: 'monitor',
    coords: { x: 66, y: 76 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -52,
    readerId: 'R-105-FIN',
    antenna: 'Antenna 2'
  },
  {
    id: 'AS-2026-00152',
    assetNumber: 'AS-2026-00152',
    name: 'Access Point',
    category: 'Network',
    serialNumber: 'CIS-AP-9901',
    tagNumber: 'E36000012370',
    assignedLocation: 'Dubai HQ - Ground Floor / IT Room',
    currentLocation: 'Dubai HQ - Ground Floor / IT Room',
    detectedZone: 'Server Room',
    status: 'In Location',
    trackingStatus: 'In Location',
    lastSeen: '10 Sep 2026 11:41 AM',
    assignedTo: 'IT Infrastructure',
    assetStatus: 'Active',
    battery: 100,
    icon: 'ap',
    coords: { x: 53, y: 82 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -45,
    readerId: 'R-106-SRV',
    antenna: 'Antenna 1'
  },
  {
    id: 'AS-2026-00160',
    assetNumber: 'AS-2026-00160',
    name: 'Fire Extinguisher',
    category: 'Safety Equipment',
    serialNumber: 'FE-CO2-0044',
    tagNumber: 'E36000012380',
    assignedLocation: 'Dubai HQ - Ground Floor / Reception',
    currentLocation: 'Dubai HQ - Loading Bay / Unassigned',
    detectedZone: 'Out of Zone Area',
    status: 'Out of Zone',
    trackingStatus: 'Out of Zone',
    lastSeen: '10 Sep 2026 11:15 AM',
    assignedTo: 'HSE & Safety',
    assetStatus: 'Active',
    battery: 90,
    icon: 'fire',
    coords: { x: 44, y: 78 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: -78,
    readerId: 'R-107-GATE',
    antenna: 'Antenna 4'
  },
  {
    id: 'AS-2026-00178',
    assetNumber: 'AS-2026-00178',
    name: 'Laptop - Lenovo',
    category: 'IT Equipment',
    serialNumber: 'LEN-X1-9920',
    tagNumber: 'E36000012399',
    assignedLocation: 'Dubai HQ - Ground Floor / Admin',
    currentLocation: 'Dubai HQ - Last Seen Office',
    detectedZone: 'Admin',
    status: 'Offline',
    trackingStatus: 'Offline',
    lastSeen: '09 Sep 2026 04:12 PM',
    assignedTo: 'IT Department',
    assetStatus: 'In Maintenance',
    battery: 15,
    icon: 'laptop',
    coords: { x: 44, y: 60 },
    building: 'Dubai HQ',
    floor: 'Ground Floor',
    rssi: null,
    readerId: null,
    antenna: null
  }
];

export function AssetTracking() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // View states
  const activeTabParam = searchParams.get('tab') || 'map';
  const [activeView, setActiveView] = useState(
    activeTabParam === 'geofence' ? 'Geofence View' :
    activeTabParam === 'history' ? 'Location History' :
    activeTabParam === 'list' ? 'List View' : 'Map View'
  );
  
  const [mapMode, setMapMode] = useState('Indoor Map'); // 'Indoor Map' | 'Satellite' | 'Hybrid'
  const [selectedBuilding, setSelectedBuilding] = useState('Dubai HQ');
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Asset selection state
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState('AS-2026-00121');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_LOCATION' | 'ONLINE' | 'OUT_OF_ZONE' | 'MOVED' | 'OFFLINE'
  
  // Right panel tab
  const [detailsTab, setDetailsTab] = useState('Details'); // 'Details' | 'Location History' | 'Movements' | 'Maintenance'
  
  // Loading & refresh timestamp
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('10 Sep 2026 11:42 AM');
  
  // Map Zoom level
  const [zoomLevel, setZoomLevel] = useState(100);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch or sync from backend API if available
  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/rtls/dashboard').catch(() => null);
      if (res?.data?.summary) {
        // Backend live sync if needed
      }
      setLastRefreshed(new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }));
    } catch (e) {
      console.warn('API error, using local tracking dataset', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Selected asset object
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Filtering assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'IN_LOCATION') return a.trackingStatus === 'In Location';
    if (statusFilter === 'ONLINE') return a.trackingStatus !== 'Offline';
    if (statusFilter === 'OUT_OF_ZONE') return a.trackingStatus === 'Out of Zone';
    if (statusFilter === 'MOVED') return a.trackingStatus === 'Moved';
    if (statusFilter === 'OFFLINE') return a.trackingStatus === 'Offline';

    return true;
  });

  // Dynamic KPI counts
  const kpis = {
    total: 12458,
    online: 1245,
    inLocation: 11892,
    outOfZone: 24
  };

  // Icon renderer helper
  const renderAssetIcon = (iconType) => {
    switch (iconType) {
      case 'desktop': return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'printer': return <Printer className="w-5 h-5 text-slate-700" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-purple-600" />;
      case 'chair': return <Armchair className="w-5 h-5 text-amber-700" />;
      case 'monitor': return <Monitor className="w-5 h-5 text-cyan-600" />;
      case 'ap': return <Radio className="w-5 h-5 text-emerald-600" />;
      case 'fire': return <Flame className="w-5 h-5 text-rose-600" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-[#6C2BD9]" />;
      default: return <Box className="w-5 h-5 text-slate-600" />;
    }
  };

  // Status Color dot helper
  const getStatusDot = (status) => {
    switch (status) {
      case 'In Location':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs inline-block" title="In Location" />;
      case 'Moved':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs inline-block" title="Recently Moved" />;
      case 'Out of Zone':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shadow-xs inline-block" title="Out of Zone" />;
      case 'Offline':
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-xs inline-block" title="Offline" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />;
    }
  };

  // Handlers for Locate and Map view actions
  const handleLocateAsset = (asset) => {
    showToast(`🎯 Locating signal for ${asset.name} (${asset.tagNumber}). Ping sent to RTLS Gateways.`);
    fetchTrackingData();
  };

  const handleViewOnMap = (asset) => {
    setSelectedAssetId(asset.id);
    setActiveView('Map View');
    showToast(`🗺️ Centering floor plan map on ${asset.name} (${asset.detectedZone}).`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen text-slate-800 font-sans select-none">
      
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Main Navigation / Header Bar matching Asset360 Design */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6C2BD9]" />
            Tracking & Location
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View real-time and last known location of your assets
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Top Search bar */}
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

          {/* Icon notifications & Profile */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
              3
            </span>
          </button>

          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Help & Specs">
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
        
        {/* Top Header Bar inside Main Content with Refresh & Last Updated */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {/* Optional subtitle or space */}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Last Updated <span className="font-bold text-slate-700">{lastRefreshed}</span>
            </span>
            <button
              onClick={fetchTrackingData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#6C2BD9]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Assets */}
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'ALL' ? 'border-[#6C2BD9] ring-2 ring-purple-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assets</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{kpis.total.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Card 2: Assets Online (RTLS/Active) */}
          <div
            onClick={() => setStatusFilter('ONLINE')}
            className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'ONLINE' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Wifi className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assets Online (RTLS/Active)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{kpis.online.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Card 3: Assets in Location */}
          <div
            onClick={() => setStatusFilter('IN_LOCATION')}
            className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'IN_LOCATION' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assets in Location</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{kpis.inLocation.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Card 4: Assets Out of Zone */}
          <div
            onClick={() => setStatusFilter('OUT_OF_ZONE')}
            className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === 'OUT_OF_ZONE' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assets Out of Zone</p>
                <h3 className="text-2xl font-black text-rose-600 mt-0.5">{kpis.outOfZone.toLocaleString()}</h3>
              </div>
            </div>
          </div>

        </div>

        {/* View Selection & Filter Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-xs min-h-[56px]">
          
          {/* View Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['Map View', 'Floor Plan', 'List View', 'Geofence View'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeView === tab
                    ? 'bg-[#6C2BD9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Building & Floor Selectors + Actions */}
          <div className="flex items-center gap-3 flex-wrap ml-auto">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Building:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Abu Dhabi Hub">Abu Dhabi Hub</option>
                <option value="Riyadh Complex">Riyadh Complex</option>
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
                <option value="Basement">Basement</option>
              </select>
            </div>

            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Show Filters</span>
            </button>

          </div>

        </div>

        {/* Dynamic Workspace Layout Depending on Active View */}
        {activeView === 'Map View' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[620px]">
            
            {/* COLUMN 1: Asset List (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[640px]">
              
              {/* Asset List Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Assets</span>
                  <span className="text-xs text-slate-500 font-semibold">({filteredAssets.length})</span>
                </h2>
                <button
                  onClick={() => setShowFiltersModal(true)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Filter options"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* List Search Bar */}
              <div className="my-3 relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search asset, tag or serial number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              {/* Scrollable Asset List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredAssets.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium">
                    No assets found matching filters.
                  </div>
                ) : (
                  filteredAssets.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50/70 border-[#6C2BD9] shadow-xs'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Asset Icon Container */}
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {renderAssetIcon(asset.icon)}
                          </div>
                          
                          {/* Asset Title Info */}
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 truncate">{asset.id}</span>
                              {getStatusDot(asset.trackingStatus)}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-700 truncate">{asset.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {asset.trackingStatus === 'Offline'
                                ? `Last Seen ${asset.lastSeen}`
                                : asset.detectedZone}
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 shrink-0">
                <button className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600">&lt;&lt;</button>
                <div className="flex items-center gap-1">
                  <span className="w-6 h-6 rounded-lg bg-[#6C2BD9] text-white flex items-center justify-center font-bold text-xs">1</span>
                  <span className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">2</span>
                  <span className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">3</span>
                  <span>...</span>
                  <span className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">31</span>
                </div>
                <button className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600">&gt;&gt;</button>
              </div>

            </div>

            {/* COLUMN 2: Central Map & Architectural Floor Plan Area (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[640px] relative">
              
              {/* Top Control Header within Map */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                
                {/* Map Mode Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {['Indoor Map', 'Satellite', 'Hybrid'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMapMode(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mapMode === mode
                          ? 'bg-white text-[#6C2BD9] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Building - Floor Label Pill */}
                <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>{selectedBuilding} - {selectedFloor}</span>
                </span>

              </div>

              {/* SVG Vector Spatial Floor Plan Container */}
              <div className="flex-1 my-3 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
                
                {/* Architectural Blueprint SVG Graphics */}
                <div
                  className="w-full h-full relative transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    {/* Background Grid Lines */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Exterior Outer Building Walls */}
                    <rect x="50" y="40" width="700" height="520" fill="#f8fafc" stroke="#334155" strokeWidth="4" rx="4" />

                    {/* Room 1: IT Store (Top Left) */}
                    <rect x="50" y="40" width="220" height="180" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="160" y="130" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">IT Store</text>

                    {/* Room 2: Admin (Top Center) */}
                    <rect x="270" y="40" width="260" height="200" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="400" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Admin</text>

                    {/* Room 3: Conference Room (Top Right) */}
                    <rect x="530" y="40" width="220" height="200" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="640" y="140" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Conference Room</text>
                    {/* Conference Table Graphic */}
                    <rect x="580" y="90" width="120" height="60" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" rx="20" />

                    {/* Room 4: Reception (Middle Left) */}
                    <rect x="50" y="220" width="220" height="180" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="160" y="310" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Reception</text>

                    {/* Room 5: HR (Center Right) */}
                    <rect x="420" y="240" width="160" height="200" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="500" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">HR</text>

                    {/* Room 6: Finance (Far Right Lower) */}
                    <rect x="580" y="240" width="170" height="200" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="665" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Finance</text>

                    {/* Room 7: Meeting Room 1 (Bottom Left) */}
                    <rect x="50" y="400" width="220" height="160" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="160" y="480" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Meeting Room 1</text>

                    {/* Room 8: Server Room (Bottom Center) */}
                    <rect x="270" y="380" width="190" height="180" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="365" y="470" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Server Room</text>

                    {/* Room 9: Pantry (Bottom Right) */}
                    <rect x="580" y="440" width="170" height="120" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
                    <text x="665" y="500" textAnchor="middle" fill="#64748b" className="text-xs font-extrabold tracking-wide font-sans">Pantry</text>
                  </svg>

                  {/* Interactive Asset Marker Pins plotted dynamically */}
                  {assets.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;

                    // Determine Pin Colors matching Screenshot Legend
                    let markerBg = 'bg-emerald-500';
                    let ringColor = 'ring-emerald-200';
                    if (asset.trackingStatus === 'Moved') {
                      markerBg = 'bg-amber-500';
                      ringColor = 'ring-amber-200';
                    } else if (asset.trackingStatus === 'Out of Zone') {
                      markerBg = 'bg-rose-600 animate-bounce';
                      ringColor = 'ring-rose-300';
                    } else if (asset.trackingStatus === 'Offline') {
                      markerBg = 'bg-slate-400';
                      ringColor = 'ring-slate-200';
                    }

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
                        {/* Outer Glow Ring if Selected */}
                        {isSelected && (
                          <div className="absolute -inset-3 rounded-full bg-blue-500/20 border-2 border-blue-500 animate-pulse pointer-events-none" />
                        )}

                        {/* Main Pin Dot */}
                        <div
                          className={`w-5 h-5 rounded-full ${markerBg} border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 ${
                            isSelected ? 'scale-125 ring-4 ring-blue-400' : ''
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none">
                          <span className="font-bold">{asset.id} • {asset.name}</span>
                          <span className="text-slate-300 font-medium">Zone: {asset.detectedZone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map Control Buttons Overlay (Upper Right) */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-sm p-1 z-20">
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
                    title="Fit to Map"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Bottom Legend Matching Screenshot #15 */}
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
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 inline-block" />
                  <span>Selected</span>
                </div>
              </div>

            </div>

            {/* COLUMN 3: Right Asset Details Panel (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[640px]">
              
              {/* Details Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <h2 className="text-sm font-bold text-slate-900">Asset Details</h2>
                <ChevronUp className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>

              {/* Selected Asset Header Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 my-3 flex items-center gap-3 shrink-0">
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {renderAssetIcon(selectedAsset.icon)}
                </div>
                <div className="truncate flex-1">
                  <span className="text-xs font-extrabold text-slate-900 block truncate">{selectedAsset.id}</span>
                  <p className="text-xs font-semibold text-slate-700 truncate">{selectedAsset.name}</p>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold inline-block ${
                      selectedAsset.trackingStatus === 'In Location' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                      selectedAsset.trackingStatus === 'Moved' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      selectedAsset.trackingStatus === 'Out of Zone' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedAsset.trackingStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub Tabs: Details | Location History | Movements | Maintenance */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 text-xs font-bold shrink-0 overflow-x-auto">
                {['Details', 'Location History', 'Movements', 'Maintenance'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDetailsTab(t)}
                    className={`pb-1 transition-all cursor-pointer whitespace-nowrap px-1 ${
                      detailsTab === t
                        ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9] font-extrabold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab Content 1: Details */}
              {detailsTab === 'Details' && (
                <div className="flex-1 overflow-y-auto space-y-2.5 text-xs font-medium text-slate-600 pr-1 scrollbar-thin">
                  
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Asset Number</span>
                    <span className="font-bold text-slate-800">{selectedAsset.assetNumber}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Asset Name</span>
                    <span className="font-bold text-slate-800">{selectedAsset.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Category</span>
                    <span className="font-bold text-slate-800">{selectedAsset.category}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Serial Number</span>
                    <span className="font-bold text-slate-800">{selectedAsset.serialNumber}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Tag Number</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.tagNumber}</span>
                  </div>

                  {/* Discrepancy Highlight banner if assigned != current */}
                  {selectedAsset.assignedLocation !== selectedAsset.currentLocation && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold my-1">
                      ⚠️ Discrepancy: Detected location differs from assigned master location.
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Current Location</span>
                    <span className="font-bold text-slate-800 text-right">{selectedAsset.currentLocation}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Last Seen</span>
                    <span className="font-bold text-slate-800">{selectedAsset.lastSeen}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Assigned To</span>
                    <span className="font-bold text-slate-800">{selectedAsset.assignedTo}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-slate-800">{selectedAsset.assetStatus}</span>
                  </div>

                  {/* Battery Indicator if applicable */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400">Battery (if applicable)</span>
                    {selectedAsset.battery !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${selectedAsset.battery < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${selectedAsset.battery}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{selectedAsset.battery}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">N/A (Mains Powered)</span>
                    )}
                  </div>

                </div>
              )}

              {/* Tab Content 2: Location History */}
              {detailsTab === 'Location History' && (
                <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1 scrollbar-thin">
                  <p className="text-[11px] text-slate-400 font-semibold mb-2">Recent RFID/RTLS Telemetry Detections:</p>
                  {[
                    { time: selectedAsset.lastSeen, zone: selectedAsset.detectedZone, reader: selectedAsset.readerId || 'R-101', rssi: selectedAsset.rssi || -55 },
                    { time: '10 Sep 2026 10:15 AM', zone: selectedAsset.detectedZone, reader: selectedAsset.readerId || 'R-101', rssi: -58 },
                    { time: '10 Sep 2026 09:00 AM', zone: 'Gate Portal 2', reader: 'R-002-GATE', rssi: -62 },
                    { time: '09 Sep 2026 04:30 PM', zone: 'IT Store', reader: 'R-101-ITSTORE', rssi: -52 }
                  ].map((h, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between text-slate-800 font-bold">
                        <span>{h.zone}</span>
                        <span className="text-slate-400 text-[10px]">{h.time}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Reader: {h.reader}</span>
                        <span className="text-emerald-600 font-bold">RSSI {h.rssi} dBm</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Content 3: Movements */}
              {detailsTab === 'Movements' && (
                <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1 scrollbar-thin">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="font-bold text-[#6C2BD9]">Official Assignment vs Detection</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Assigned: <strong className="text-slate-800">{selectedAsset.assignedLocation}</strong>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Detected: <strong className="text-slate-800">{selectedAsset.currentLocation}</strong>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 font-semibold mt-2">Approved Custody Transfers:</p>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-[11px]">
                    <p className="font-bold text-slate-800">Transfer #TR-2026-9901</p>
                    <p className="text-slate-500">From Central Warehouse to Dubai HQ IT Store</p>
                    <p className="text-emerald-600 font-bold mt-0.5">Approved & Completed on 01 Sep 2026</p>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Maintenance */}
              {detailsTab === 'Maintenance' && (
                <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1 scrollbar-thin">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maintenance Status:</span>
                      <span className="font-bold text-emerald-600">Healthy / In Service</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last PM Inspection:</span>
                      <span className="font-bold text-slate-800">15 Aug 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Due Date:</span>
                      <span className="font-bold text-slate-800">15 Feb 2027</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons matching screenshot #15 */}
              <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLocateAsset(selectedAsset)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Locate</span>
                  </button>

                  <button
                    onClick={() => handleViewOnMap(selectedAsset)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on Map</span>
                  </button>
                </div>

                <button
                  onClick={() => showToast(`More Actions triggered for asset ${selectedAsset.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>••• More Actions</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* View 2: Floor Plan Expanded View */}
        {activeView === 'Floor Plan' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Spatial Blueprint & Reader Network</h2>
                <p className="text-xs text-slate-500 font-medium">Fixed RTLS Readers, RFID Antennas, and Asset Spatial Positions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  ● 12 Readers Active
                </span>
              </div>
            </div>

            <div className="h-[500px] bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-3">
                <Radio className="w-12 h-12 text-[#6C2BD9] animate-ping mx-auto" />
                <p className="text-slate-300 text-sm font-bold">Interactive Spatial Reader Signal Map</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Displaying real-time RSSI signal strength triangulations, gateway antenna angles, and room heatmaps.
                </p>
                <button
                  onClick={() => navigate('/rtls/map')}
                  className="px-4 py-2 bg-[#6C2BD9] text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Open Advanced Floor Map Editor</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 3: List View */}
        {activeView === 'List View' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">RFID EPC / Tag</th>
                    <th className="p-3">Assigned Master Location</th>
                    <th className="p-3">Latest Detected Zone</th>
                    <th className="p-3">Tracking Status</th>
                    <th className="p-3">Last Seen</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{a.id}</td>
                      <td className="p-3 font-semibold text-slate-800">{a.name}</td>
                      <td className="p-3">{a.category}</td>
                      <td className="p-3 font-mono text-[#6C2BD9]">{a.tagNumber}</td>
                      <td className="p-3">{a.assignedLocation}</td>
                      <td className="p-3 font-bold text-slate-800">{a.currentLocation}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                          a.trackingStatus === 'In Location' ? 'bg-emerald-100 text-emerald-700' :
                          a.trackingStatus === 'Moved' ? 'bg-amber-100 text-amber-700' :
                          a.trackingStatus === 'Out of Zone' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {a.trackingStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{a.lastSeen}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleViewOnMap(a)}
                          className="px-2.5 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-[11px]"
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 4: Geofence View */}
        {activeView === 'Geofence View' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Geofence Compliance & Rule Exceptions</h2>
                <p className="text-xs text-slate-500 font-medium">Monitors permitted asset zones against RTLS physical detections</p>
              </div>
              <button
                onClick={() => showToast('Geofence Rule Builder opened')}
                className="px-4 py-2 bg-[#6C2BD9] text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Geofence Rule</span>
              </button>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Active Geofence Exception Detected</h4>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                    Asset <strong>AS-2026-00160 (Fire Extinguisher)</strong> moved outside permitted zone 'Reception' into 'Loading Bay / Unassigned'.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleLocateAsset(assets.find(a => a.id === 'AS-2026-00160'))}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-2xs"
              >
                Inspect Alert
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-800">Rule #GF-001: IT Assets Perimeter</h3>
                <p className="text-xs text-slate-600">Restricts IT Laptops & Tablets to Dubai HQ Floor 1 & 2.</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-2 border-t border-slate-200">
                  <span>Enforcement: Strictly Active</span>
                  <span className="text-emerald-600 font-bold">0 Violations</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-800">Rule #GF-002: Safety Equipment Perimeter</h3>
                <p className="text-xs text-slate-600">Restricts Fire Extinguishers to Designated Safety Mount Zones.</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-2 border-t border-slate-200">
                  <span>Enforcement: Strictly Active</span>
                  <span className="text-rose-600 font-bold">1 Violation Pending</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operational Navigation Flow Step Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 overflow-x-auto text-xs font-bold">
          <div className="flex items-center gap-2 shrink-0">
            <Compass className="w-5 h-5 text-[#6C2BD9] animate-spin" />
            <span className="text-slate-300 uppercase tracking-wider text-[10px]">Operational Workflow Sequence:</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] shrink-0">
            <span className="text-purple-400">Tracking & Location</span>
            <span>→</span>
            <span>Asset Tracking</span>
            <span>→</span>
            <span>Search/Filter Asset</span>
            <span>→</span>
            <span>Select Site/Building/Floor</span>
            <span>→</span>
            <span>Select Asset from List/Map</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold">Display Last-Known Position</span>
            <span>→</span>
            <span>Open Asset Details</span>
            <span>→</span>
            <span>Locate / View on Map</span>
          </div>
        </div>

      </div>

      {/* Advanced Filter Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#6C2BD9]" />
                Filter Assets Context
              </h3>
              <button onClick={() => setShowFiltersModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Company / Site</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>Infotatwaa Corp • HQ Site</option>
                  <option>Infotatwaa Logistics Complex</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Category</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option>All Categories</option>
                    <option>IT Equipment</option>
                    <option>Printer</option>
                    <option>Tablet</option>
                    <option>Furniture</option>
                    <option>Safety Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tracking Technology</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option>All Technologies</option>
                    <option>UHF RFID EPC Tag</option>
                    <option>BLE Beacon</option>
                    <option>Wi-Fi RTLS</option>
                  </select>
                </div>
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
                  showToast('Filters applied to asset list and floor plan map');
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

export default AssetTracking;
