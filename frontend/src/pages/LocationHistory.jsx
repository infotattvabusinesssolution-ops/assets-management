import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Plus,
  Minus,
  Home,
  ChevronDown,
  X,
  Bell,
  HelpCircle,
  Calendar,
  Clock,
  Download,
  Box,
  Monitor,
  ArrowRight,
  SlidersHorizontal,
  Check,
  Tag,
  User,
  Radio,
  Share2
} from 'lucide-react';
import { api } from '../services/api';

// Initial Mock Assets for search dropdown matching screenshot #18
const AVAILABLE_ASSETS = [
  {
    id: 'AS-2026-00121',
    assetNumber: 'AS-2026-00121',
    name: 'Dell OptiPlex 7020',
    category: 'IT Equipment',
    serialNumber: '7CD1234',
    tagNumber: 'E36000012345',
    assignedTo: 'IT Department',
    currentLocation: 'Operations - Ground Floor',
    lastSeen: '10 Sep 2026 05:10 PM',
    status: 'Active'
  },
  {
    id: 'AS-2026-00122',
    assetNumber: 'AS-2026-00122',
    name: 'HP LaserJet Pro',
    category: 'Printer',
    serialNumber: 'HPLJ9921',
    tagNumber: 'E36000012346',
    assignedTo: 'Administration',
    currentLocation: 'Finance - Ground Floor',
    lastSeen: '10 Sep 2026 03:40 PM',
    status: 'Active'
  },
  {
    id: 'AS-2026-00125',
    assetNumber: 'AS-2026-00125',
    name: 'iPad Air',
    category: 'Tablet',
    serialNumber: 'DMQX90812',
    tagNumber: 'E36000012349',
    assignedTo: 'Executive Mgmt',
    currentLocation: 'Admin - Ground Floor',
    lastSeen: '10 Sep 2026 12:15 PM',
    status: 'Active'
  }
];

// Chronological Movement Path Records matching screenshot #18
const INITIAL_HISTORY_RECORDS = [
  {
    step: 5,
    dateTime: '10 Sep 2026 05:10 PM',
    timeShort: '05:10 PM',
    location: 'Operations - Ground Floor',
    zone: 'Operations',
    eventType: 'Zone Enter',
    reader: 'RDR-OP-01',
    remarks: 'Entered Operations',
    coords: { x: 74, y: 72 }, // percentage position on floor map
    badgeColor: 'rose',
    circleColor: 'bg-rose-600'
  },
  {
    step: 4,
    dateTime: '10 Sep 2026 03:40 PM',
    timeShort: '03:40 PM',
    location: 'Finance - Ground Floor',
    zone: 'Finance',
    eventType: 'Zone Exit',
    reader: 'RDR-FN-02',
    remarks: 'Left Finance',
    coords: { x: 57, y: 72 },
    badgeColor: 'blue',
    circleColor: 'bg-[#6C2BD9]'
  },
  {
    step: 3,
    dateTime: '10 Sep 2026 12:15 PM',
    timeShort: '12:15 PM',
    location: 'Admin - Ground Floor',
    zone: 'Admin',
    eventType: 'Zone Enter',
    reader: 'RDR-AD-01',
    remarks: 'Entered Admin',
    coords: { x: 44, y: 35 },
    badgeColor: 'rose',
    circleColor: 'bg-[#6C2BD9]'
  },
  {
    step: 2,
    dateTime: '10 Sep 2026 10:20 AM',
    timeShort: '10:20 AM',
    location: 'Main Corridor - Ground Floor',
    zone: 'Corridor',
    eventType: 'Move',
    reader: 'RDR-CR-01',
    remarks: 'In Transit',
    coords: { x: 34, y: 46 },
    badgeColor: 'blue',
    circleColor: 'bg-[#6C2BD9]'
  },
  {
    step: 1,
    dateTime: '10 Sep 2026 09:05 AM',
    timeShort: '09:05 AM',
    location: 'IT Store - Ground Floor',
    zone: 'IT Store',
    eventType: 'Zone Exit',
    reader: 'RDR-IT-01',
    remarks: 'Left IT Store',
    coords: { x: 24, y: 35 },
    badgeColor: 'rose',
    circleColor: 'bg-emerald-500'
  },
  {
    step: 6,
    dateTime: '09 Sep 2026 06:30 PM',
    timeShort: '06:30 PM',
    location: 'IT Store - Ground Floor',
    zone: 'IT Store',
    eventType: 'Zone Enter',
    reader: 'RDR-IT-01',
    remarks: 'Returned to IT Store',
    coords: { x: 24, y: 35 },
    badgeColor: 'rose',
    circleColor: 'bg-[#6C2BD9]'
  },
  {
    step: 7,
    dateTime: '09 Sep 2026 02:15 PM',
    timeShort: '02:15 PM',
    location: 'Meeting Room - 1',
    zone: 'Meeting Room',
    eventType: 'Zone Exit',
    reader: 'RDR-MR-01',
    remarks: 'Left Meeting Room',
    coords: { x: 62, y: 35 },
    badgeColor: 'blue',
    circleColor: 'bg-[#6C2BD9]'
  },
  {
    step: 8,
    dateTime: '09 Sep 2026 11:40 AM',
    timeShort: '11:40 AM',
    location: 'Meeting Room - 1',
    zone: 'Meeting Room',
    eventType: 'Zone Enter',
    reader: 'RDR-MR-01',
    remarks: 'Entered Meeting Room',
    coords: { x: 62, y: 35 },
    badgeColor: 'rose',
    circleColor: 'bg-[#6C2BD9]'
  }
];

export function LocationHistory() {
  const navigate = useNavigate();

  // Top Filter Bar State
  const [selectedAssetId, setSelectedAssetId] = useState('AS-2026-00121');
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 10 Sep 2026');
  const [locationTypeFilter, setLocationTypeFilter] = useState('All Locations');
  const [eventTypeFilter, setEventTypeFilter] = useState('All Events');

  // Selected Asset Object
  const selectedAsset = AVAILABLE_ASSETS.find(a => a.id === selectedAssetId) || AVAILABLE_ASSETS[0];

  // Map Floor state
  const [mapFloor, setMapFloor] = useState('Ground Floor');

  // Interactive step selection (1 to 5 for movement on map matching screenshot #18)
  const [activeStep, setActiveStep] = useState(5); // default step 5 selected

  // Play Movement Replay Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState('1x');
  const playbackRef = useRef(null);

  // Table Search and Filters
  const [historySearch, setHistorySearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState(100);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronized movement steps (1 to 5 chronologically ordered: 1 -> 2 -> 3 -> 4 -> 5)
  const movementSteps = [
    INITIAL_HISTORY_RECORDS.find(r => r.step === 1),
    INITIAL_HISTORY_RECORDS.find(r => r.step === 2),
    INITIAL_HISTORY_RECORDS.find(r => r.step === 3),
    INITIAL_HISTORY_RECORDS.find(r => r.step === 4),
    INITIAL_HISTORY_RECORDS.find(r => r.step === 5)
  ];

  // Play movement animation loop
  useEffect(() => {
    if (isPlaying) {
      const speedMs = playSpeed === '2x' ? 800 : playSpeed === '4x' ? 400 : 1500;
      playbackRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= 5) {
            return 1;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      clearInterval(playbackRef.current);
    }
    return () => clearInterval(playbackRef.current);
  }, [isPlaying, playSpeed]);

  const togglePlayMovement = () => {
    if (!isPlaying) {
      setActiveStep(1);
      setIsPlaying(true);
      showToast('▶ Replaying chronological asset movement on floor map...');
    } else {
      setIsPlaying(false);
      showToast('⏸ Playback paused.');
    }
  };

  // 3-Way Synchronized Click Handler
  const handleSelectStep = (stepNumber) => {
    setActiveStep(stepNumber);
    const rec = INITIAL_HISTORY_RECORDS.find(r => r.step === stepNumber);
    if (rec) {
      showToast(`Step #${stepNumber} selected: ${rec.location} (${rec.timeShort})`);
    }
  };

  // Filtered Table Records
  const filteredRecords = INITIAL_HISTORY_RECORDS.filter(r => {
    const q = historySearch.toLowerCase();
    const matchesSearch = !q || (
      r.location.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q) ||
      r.eventType.toLowerCase().includes(q) ||
      r.reader.toLowerCase().includes(q) ||
      r.remarks.toLowerCase().includes(q)
    );
    if (!matchesSearch) return false;
    if (eventTypeFilter !== 'All Events' && r.eventType !== eventTypeFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen text-slate-800 font-sans select-none relative">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#6C2BD9] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce border border-purple-400">
          <Clock className="w-4 h-4 animate-pulse text-amber-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-purple-700 p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Main Navigation Header Bar matching Screenshot #18 */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6C2BD9]" />
            Location History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View historical movement and location details of your assets
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

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* Top Filter Bar matching Screenshot #18 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Asset Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Asset:</span>
              <div className="relative">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
                >
                  {AVAILABLE_ASSETS.map(a => (
                    <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Date Range:</span>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#6C2BD9] w-48"
                />
              </div>
            </div>

            {/* Location Type Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Location Type:</span>
              <select
                value={locationTypeFilter}
                onChange={(e) => setLocationTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="All Locations">All Locations</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
              </select>
            </div>

            {/* Event Type Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Event Type:</span>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C2BD9]"
              >
                <option value="All Events">All Events</option>
                <option value="Zone Enter">Zone Enter</option>
                <option value="Zone Exit">Zone Exit</option>
                <option value="Move">Move</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast(`Filtered location history for ${selectedAssetId} from ${dateRange}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filter</span>
            </button>

            <button
              onClick={() => {
                setSelectedAssetId('AS-2026-00121');
                setDateRange('01 Sep 2026 - 10 Sep 2026');
                setLocationTypeFilter('All Locations');
                setEventTypeFilter('All Events');
                setActiveStep(5);
                showToast('Filters reset to default.');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Upper Half Grid: Movement on Map (8 cols) + Selected Asset Details (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Movement on Map Container (8 cols) matching Screenshot #18 */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[440px] relative">
            
            {/* Map Header with Replay Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-900">Movement on Map</h2>
                <select
                  value={mapFloor}
                  onChange={(e) => setMapFloor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                </select>
              </div>

              {/* Playback Replay Controls matching Screenshot #18 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayMovement}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-2xs"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause Replay' : 'Play Movement'}</span>
                </button>

                <select
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2 py-1.5 focus:outline-none"
                >
                  <option value="1x">1x Speed</option>
                  <option value="2x">2x Speed</option>
                  <option value="4x">4x Speed</option>
                </select>

                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Fit Map"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spatial Map Graphic Canvas with Chronological Path & Numbered Step Markers */}
            <div className="flex-1 my-2 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              
              <div
                className="w-full h-full relative transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* SVG Blueprint Floor Plan & Chronological Directional Path matching Screenshot #18 */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="grid-hist" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-hist)" />

                  {/* Outer Wall */}
                  <rect x="40" y="20" width="720" height="400" fill="#ffffff" stroke="#1e293b" strokeWidth="3" rx="4" />

                  {/* Room 1: IT Store */}
                  <rect x="40" y="20" width="220" height="180" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="150" y="110" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">IT Store</text>

                  {/* Room 2: Admin */}
                  <rect x="260" y="20" width="240" height="190" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="380" y="110" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Admin</text>

                  {/* Room 3: Meeting Room */}
                  <rect x="500" y="20" width="260" height="190" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="630" y="110" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Meeting Room</text>

                  {/* Room 4: Reception */}
                  <rect x="40" y="200" width="220" height="220" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="150" y="310" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Reception</text>

                  {/* Room 5: HR */}
                  <rect x="260" y="270" width="160" height="150" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="340" y="350" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">HR</text>

                  {/* Room 6: Finance */}
                  <rect x="420" y="250" width="160" height="170" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="500" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Finance</text>

                  {/* Room 7: Operations */}
                  <rect x="580" y="250" width="180" height="170" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x="670" y="340" textAnchor="middle" fill="#64748b" className="text-xs font-black font-sans">Operations</text>

                  {/* Directional Curved Blue Path Arcs Connecting Points 1 -> 2 -> 3 -> 4 -> 5 */}
                  <path
                    d="M 190 155 Q 230 190 270 205 Q 310 190 350 155 Q 400 180 455 320 Q 530 320 590 320"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                </svg>

                {/* Render Numbered Step Markers on Map matching Screenshot #18 */}
                {movementSteps.map((rec) => {
                  if (!rec) return null;
                  const isSelected = activeStep === rec.step;

                  return (
                    <div
                      key={rec.step}
                      onClick={() => handleSelectStep(rec.step)}
                      style={{ left: `${rec.coords.x}%`, top: `${rec.coords.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                    >
                      {/* Active glowing ring */}
                      {isSelected && (
                        <div className="absolute -inset-3 rounded-full border-2 border-purple-600 bg-purple-400/30 animate-pulse pointer-events-none" />
                      )}

                      {/* Circle Number Marker */}
                      <div className={`w-7 h-7 rounded-full text-white font-extrabold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                        isSelected ? 'bg-[#6C2BD9] ring-4 ring-purple-300 scale-125 z-40' : rec.circleColor
                      }`}>
                        {rec.step}
                      </div>

                      {/* Timestamp Callout Pill matching Screenshot #18 */}
                      <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold shadow-md whitespace-nowrap border ${
                        isSelected ? 'bg-[#6C2BD9] text-white border-purple-400 z-40' : 'bg-white text-slate-800 border-slate-200'
                      }`}>
                        {rec.timeShort}
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Map Controls (Top Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 bg-white border border-slate-200 rounded-xl shadow-sm p-1 z-30">
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 15, 70))} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoomLevel(100)} className="p-1 hover:bg-slate-100 rounded text-slate-700" title="Reset View"><Home className="w-3.5 h-3.5" /></button>
              </div>

            </div>

          </div>

          {/* Right Selected Asset Details Card (4 cols) matching Screenshot #18 */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[440px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <h3 className="text-xs font-bold text-slate-900">Asset Details</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
                {selectedAsset.status}
              </span>
            </div>

            {/* Asset Header Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 my-2.5 shrink-0">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Monitor className="w-6 h-6 text-[#6C2BD9]" />
              </div>
              <div className="truncate">
                <span className="font-extrabold text-xs text-[#6C2BD9] block">{selectedAsset.id}</span>
                <h4 className="font-bold text-xs text-slate-900 truncate">{selectedAsset.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium truncate">{selectedAsset.category}</p>
              </div>
            </div>

            {/* Key-Value Details Table matching Screenshot #18 */}
            <div className="flex-1 overflow-y-auto space-y-2 text-xs font-medium text-slate-600 pr-1 scrollbar-thin">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Serial Number</span>
                <span className="font-bold text-slate-800">{selectedAsset.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Tag Number (EPC)</span>
                <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.tagNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-slate-800">{selectedAsset.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Assigned To</span>
                <span className="font-bold text-slate-800">{selectedAsset.assignedTo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Current Location</span>
                <span className="font-bold text-slate-800 text-right">{selectedAsset.currentLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Last Seen</span>
                <span className="font-bold text-slate-800">{selectedAsset.lastSeen}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Half Grid: Location History Table (8 cols) + Location Timeline (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Location History Data Grid Table (8 cols) matching Screenshot #18 */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Location History <span className="text-xs font-semibold text-slate-500">({filteredRecords.length} Records)</span>
              </h3>

              <div className="flex items-center gap-3">
                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <button
                  onClick={() => showToast('📥 Exporting Location History log to Excel/CSV...')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table View matching Screenshot #18 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-left text-xs font-medium text-slate-700">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Zone</th>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Reader / Source</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((r, idx) => {
                      const isSelected = activeStep === r.step;
                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSelectStep(r.step)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-purple-50/80 font-bold text-[#6C2BD9]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-400">{r.step ? `#${r.step}` : idx + 1}</td>
                          <td className="p-3 text-slate-800 font-medium">{r.dateTime}</td>
                          <td className="p-3 font-semibold text-slate-900">{r.location}</td>
                          <td className="p-3">{r.zone}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              r.badgeColor === 'rose'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-purple-100 text-[#6C2BD9] border border-purple-300'
                            }`}>
                              {r.eventType}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{r.reader}</td>
                          <td className="p-3 text-slate-600">{r.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {filteredRecords.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>

          </div>

          {/* Right Panel: Location Timeline (4 cols) matching Screenshot #18 */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <h3 className="text-xs font-bold text-slate-900">Location Timeline</h3>
              <button
                onClick={() => showToast('📥 Timeline exported')}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
                title="Download Timeline"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Timeline Stack with 3-Way Synchronization matching Screenshot #18 */}
            <div className="flex-1 overflow-y-auto space-y-4 relative pr-1 scrollbar-thin">
              
              {/* Vertical Connecting Line */}
              <div className="absolute left-3.5 top-3 bottom-3 w-[2px] bg-slate-200 z-0" />

              {movementSteps.slice().reverse().map((rec) => {
                if (!rec) return null;
                const isSelected = activeStep === rec.step;

                return (
                  <div
                    key={rec.step}
                    onClick={() => handleSelectStep(rec.step)}
                    className={`relative z-10 flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/80 border-[#6C2BD9] shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Circle Number Step Indicator */}
                    <div className={`w-7 h-7 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm ${
                      isSelected ? 'bg-[#6C2BD9] ring-2 ring-purple-300' : rec.circleColor
                    }`}>
                      {rec.step}
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">{rec.dateTime}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          rec.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-[#6C2BD9]'
                        }`}>
                          {rec.eventType}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{rec.location}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Detected by Reader: {rec.reader}</p>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Bottom Button */}
            <button
              onClick={() => showToast('Full history view expanded')}
              className="w-full py-2 bg-slate-50 hover:bg-purple-50 text-[#6C2BD9] font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default LocationHistory;
