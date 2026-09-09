import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Edit3, 
  Eye, 
  Building, 
  Layers3, 
  AlertCircle, 
  Check, 
  X, 
  Wrench, 
  HelpCircle, 
  ExternalLink,
  Plus,
  RefreshCw,
  Sliders,
  Move
} from 'lucide-react';

export function FloorMapEditor() {
  // Navigation & Data State
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [positions, setPositions] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPosition, setSavingPosition] = useState(false);
  const [toast, setToast] = useState(null);

  // Hierarchy Selection State
  const [selectedBuildingId, setSelectedBuildingId] = useState('ALL');
  const [selectedFloorId, setSelectedFloorId] = useState('');

  // Mode: 'VIEW' | 'EDIT'
  const [mode, setMode] = useState('VIEW');

  // Asset Locator Search State
  const [searchAsset, setSearchAsset] = useState('');
  const [highlightPos, setHighlightPos] = useState(null);
  const [selectedPos, setSelectedPos] = useState(null);

  // Edit Mode Placement State
  const [assetToPlace, setAssetToPlace] = useState(null);
  const [draggingPos, setDraggingPos] = useState(null);

  // Canvas Viewport Transformation (Zoom & Pan)
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Maps and Master Data Assets
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [mapsRes, assetsRes, floorsRes, bldgRes] = await Promise.all([
        api.get('/maps'),
        api.get('/assets?limit=400').catch(() => ({ success: false, assets: [] })),
        api.get('/master-data/floors').catch(() => ({ success: false, floors: [] })),
        api.get('/master-data/buildings').catch(() => ({ success: false, buildings: [] }))
      ]);

      if (assetsRes.success) setAllAssets(assetsRes.assets || []);
      if (floorsRes.success) setFloors(floorsRes.floors || []);
      if (bldgRes.success) setBuildings(bldgRes.buildings || []);

      if (mapsRes.success && mapsRes.maps.length > 0) {
        setMaps(mapsRes.maps);
        const initialMap = mapsRes.maps[0];
        const floorIdStr = typeof initialMap.floorId === 'object' ? initialMap.floorId._id : initialMap.floorId;
        setSelectedFloorId(floorIdStr);
        loadMapDetails(floorIdStr);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load floor maps', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMapDetails = async (floorId) => {
    if (!floorId) return;
    try {
      const res = await api.get(`/maps/floor/${floorId}`);
      if (res.success) {
        setSelectedMap(res.map);
        setPositions(res.positions || []);
        setSelectedPos(null);
        setHighlightPos(null);
      } else {
        setSelectedMap(null);
        setPositions([]);
      }
    } catch (err) {
      console.error(err);
      setSelectedMap(null);
      setPositions([]);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleFloorChange = (floorId) => {
    setSelectedFloorId(floorId);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    loadMapDetails(floorId);
  };

  // Filtered Floors by selected Building
  const filteredFloors = useMemo(() => {
    if (selectedBuildingId === 'ALL') return floors;
    return floors.filter(f => f.buildingId === selectedBuildingId || f.buildingId?._id === selectedBuildingId);
  }, [floors, selectedBuildingId]);

  // Mapped Asset IDs
  const mappedAssetIds = useMemo(() => {
    const setIds = new Set();
    positions.forEach(p => {
      const id = p.assetId?._id || p.assetId;
      if (id) setIds.add(id.toString());
    });
    return setIds;
  }, [positions]);

  // Unmapped Assets Pool
  const unmappedAssets = useMemo(() => {
    return allAssets.filter(a => !mappedAssetIds.has(a._id.toString()));
  }, [allAssets, mappedAssetIds]);

  // Handle Search / Locate Asset
  const handleLocateSubmit = async (e) => {
    e.preventDefault();
    if (!searchAsset.trim()) return;

    try {
      const res = await api.get(`/maps/locate/${searchAsset.trim()}`);
      if (res.success && res.position) {
        const targetFloorId = res.position.floorMapId?.floorId?._id || res.position.floorMapId?.floorId;
        
        if (targetFloorId && targetFloorId !== selectedFloorId) {
          setSelectedFloorId(targetFloorId);
          await loadMapDetails(targetFloorId);
        }

        setHighlightPos(res.position);
        setSelectedPos(res.position);
        
        // Auto-center viewport on asset coordinates
        const xPercent = res.position.xRatio * 100;
        const yPercent = res.position.yRatio * 100;
        showToast(`Located asset ${res.asset.tagNumber || res.asset.assetId} at X: ${xPercent.toFixed(1)}%, Y: ${yPercent.toFixed(1)}%`);
      } else {
        showToast(res.message || 'Asset position is not mapped yet.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Asset position is not mapped yet.', 'error');
    }
  };

  // Handle Canvas Click to Place Asset in Edit Mode
  const handleCanvasClick = async (e) => {
    if (mode !== 'EDIT' || !assetToPlace || !selectedMap) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const yRatio = Math.max(0, Math.min(1, clickY / rect.height));

    savePinPosition(assetToPlace._id, xRatio, yRatio);
  };

  // Save Pin Position API
  const savePinPosition = async (assetId, xRatio, yRatio, zoneId = null) => {
    setSavingPosition(true);
    try {
      const payload = {
        assetId,
        floorMapId: selectedMap._id,
        xRatio: parseFloat(xRatio.toFixed(4)),
        yRatio: parseFloat(yRatio.toFixed(4)),
        zoneId
      };

      const res = await api.post('/maps/position', payload);
      if (res.success) {
        showToast('Position Saved ✓');
        setAssetToPlace(null);
        await loadMapDetails(selectedFloorId);
      } else {
        showToast(res.message || 'Failed to save position', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save position', 'error');
    } finally {
      setSavingPosition(false);
    }
  };

  // Dragging existing pin in Edit Mode
  const handlePinMouseDown = (e, pos) => {
    if (mode !== 'EDIT') return;
    e.stopPropagation();
    setDraggingPos(pos);
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggingPos && mode === 'EDIT' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const xRatio = Math.max(0, Math.min(1, dropX / rect.width));
      const yRatio = Math.max(0, Math.min(1, dropY / rect.height));

      const targetAssetId = draggingPos.assetId?._id || draggingPos.assetId;
      savePinPosition(targetAssetId, xRatio, yRatio, draggingPos.zoneId);
      setDraggingPos(null);
    }
  };

  // Pin Styling Helper based on Lifecycle Status
  const getPinStyle = (pos) => {
    const isHighlighted = highlightPos && highlightPos._id === pos._id;
    const isSelected = selectedPos && selectedPos._id === pos._id;
    const status = pos.assetId?.lifecycleStatus || 'ACTIVE';

    if (isHighlighted) {
      return 'bg-rose-500 text-white border-rose-300 animate-bounce scale-150 z-30 shadow-rose-500/50 shadow-lg';
    }
    if (isSelected) {
      return 'bg-indigo-600 text-white border-indigo-300 ring-4 ring-indigo-500/50 scale-125 z-20 shadow-indigo-600/50 shadow-lg';
    }

    switch (status) {
      case 'UNDER_MAINTENANCE':
        return 'bg-amber-600 text-white border-amber-400 hover:scale-125 z-10';
      case 'MISSING':
        return 'bg-rose-600 text-white border-rose-400 animate-pulse hover:scale-125 z-10';
      case 'DISPOSED':
        return 'bg-slate-700 text-slate-400 border-slate-600 opacity-60 hover:scale-125 z-10';
      default:
        return 'bg-indigo-600 text-white border-indigo-400 hover:scale-125 z-10';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Notification Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl border text-sm flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers3 className="w-7 h-7 text-brand-600" />
            Interactive Floor Maps & Asset Locator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Architectural blueprint viewer, spatial asset locator, and interactive pin placement engine
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => { setMode('VIEW'); setAssetToPlace(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'VIEW' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> View Mode
          </button>
          <button
            onClick={() => setMode('EDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'EDIT' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit & Pin Mode
          </button>
        </div>
      </div>

      {/* Navigation Toolbar & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Building Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Building</label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Buildings</option>
              {buildings.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Floor Map Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Floor Blueprint Map</label>
            <select
              value={selectedFloorId}
              onChange={(e) => handleFloorChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Select Floor Map --</option>
              {maps.map(m => {
                const floorObj = m.floorId || {};
                return (
                  <option key={m._id} value={floorObj._id || m.floorId}>
                    {m.title} ({floorObj.name || 'Floor'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Asset Locator Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Spatial Asset Locator</label>
            <form onSubmit={handleLocateSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter Asset ID or Tag Number (e.g. AST-001)..."
                  value={searchAsset}
                  onChange={(e) => setSearchAsset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Locate Asset
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Dashboard KPI Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Master Assets</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{allAssets.length}</p>
          <span className="text-[10px] text-brand-600 font-medium">System registered</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Mapped on Floor</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{positions.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Active 2D coordinates</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Unmapped Assets</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{unmappedAssets.length}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting placement</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Zones</p>
          <p className="text-xl font-bold text-brand-600 mt-1">{selectedMap?.zones?.length || 0}</p>
          <span className="text-[10px] text-brand-600 font-medium">Architectural polygons</span>
        </div>
      </div>

      {/* Edit Mode Placement Banner */}
      {mode === 'EDIT' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950">Edit Mode Active:</span>
              <span className="ml-1 text-amber-800">
                {assetToPlace 
                  ? ` Click on map to place ${assetToPlace.tagNumber || assetToPlace.assetId}` 
                  : ' Select an unmapped asset below or drag existing pins on map.'}
              </span>
            </div>
          </div>
          {savingPosition && (
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving position...
            </span>
          )}
        </div>
      )}

      {/* MAIN WORKBENCH: MAP CANVAS & DETAILS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP CANVAS CONTAINER (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-4 space-y-3 rounded-xl shadow-xs flex flex-col">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                {selectedMap?.title || 'Architectural Blueprint'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Dimensions: {selectedMap?.widthMeters || 50}m × {selectedMap?.heightMeters || 30}m
              </p>
            </div>

            {/* Viewport Zoom & Fit Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.2, 3.0))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-700 px-1 font-semibold">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport Area */}
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 min-h-[480px] flex items-center justify-center select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            {loading ? (
              <div className="text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading floor map blueprint...
              </div>
            ) : !selectedMap ? (
              <div className="text-center p-8 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-500 text-xs font-semibold">No blueprint map uploaded for this floor.</p>
              </div>
            ) : (
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out'
                }}
                className="relative w-full h-full max-h-[600px] flex items-center justify-center cursor-crosshair"
              >
                {/* Blueprint Image */}
                <img
                  src={selectedMap.imageUrl}
                  alt="Floor Blueprint"
                  className="w-full h-auto object-contain opacity-95 pointer-events-none"
                />

                {/* Zone Polygon Overlay SVG */}
                {selectedMap.zones && selectedMap.zones.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedMap.zones.map((zone, idx) => {
                      if (!zone.points || zone.points.length === 0) return null;
                      const ptsStr = zone.points.map(pt => `${pt.x * 100}%,${pt.y * 100}%`).join(' ');
                      return (
                        <g key={zone._id || idx}>
                          <polygon
                            points={ptsStr}
                            fill={zone.color || '#6c2bd9'}
                            fillOpacity="0.15"
                            stroke={zone.color || '#6c2bd9'}
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Render Asset Pins */}
                {positions.map((pos) => {
                  const assetObj = pos.assetId || {};
                  const pinStyle = getPinStyle(pos);

                  return (
                    <div
                      key={pos._id}
                      style={{ left: `${pos.xRatio * 100}%`, top: `${pos.yRatio * 100}%` }}
                      onMouseDown={(e) => handlePinMouseDown(e, pos)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPos(pos);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all ${pinStyle}`}
                    >
                      <div className="p-2 rounded-full shadow-md border border-white">
                        <MapPin className="w-4 h-4" />
                      </div>

                      {/* Tooltip Hover Card */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-30 text-xs text-slate-800 pointer-events-none">
                        <span className="font-mono font-bold text-brand-600">{assetObj.tagNumber || assetObj.assetId}</span>
                        <p className="font-semibold text-slate-900 truncate mt-0.5">{assetObj.description || 'Asset'}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Status: {assetObj.lifecycleStatus || 'ACTIVE'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ASSET DETAILS SIDE PANEL */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand-600" /> Selected Asset Location Details
            </h3>
            {selectedPos && (
              <button 
                onClick={() => setSelectedPos(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selectedPos ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p>Click any pin marker on the floor blueprint to view details.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Asset Header Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-brand-600 text-sm">{selectedPos.assetId?.tagNumber || selectedPos.assetId?.assetId}</span>
                <h4 className="font-semibold text-slate-900 text-sm">{selectedPos.assetId?.description || 'Master Asset'}</h4>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium">
                    {selectedPos.assetId?.lifecycleStatus || 'ACTIVE'}
                  </span>
                  {selectedPos.assetId?.categoryId?.name && (
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded text-[10px] font-medium">
                      {selectedPos.assetId.categoryId.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Position Coordinates & Zone */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Normalized X Position</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">{(selectedPos.xRatio * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Normalized Y Position</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">{(selectedPos.yRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Assigned Zone</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPos.zoneId ? 'Mapped Zone' : 'General Blueprint Area'}
                  </span>
                </div>
              </div>

              {/* Hierarchy Location */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                <span className="text-slate-500 font-semibold block text-[11px] uppercase">Hierarchy Context</span>
                <div>Building: <span className="font-medium text-slate-900">{selectedPos.assetId?.buildingId?.name || 'N/A'}</span></div>
                <div>Room: <span className="font-medium text-slate-900">{selectedPos.assetId?.roomId?.name || 'N/A'}</span></div>
                <div>Last Position Update: <span className="text-slate-500">{new Date(selectedPos.updatedAt || Date.now()).toLocaleDateString()}</span></div>
              </div>

              {/* View Asset 360 Action */}
              <div className="pt-2">
                <a
                  href={`/assets/${selectedPos.assetId?._id || selectedPos.assetId}`}
                  className="bg-brand-600 hover:bg-brand-700 text-white w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  View Asset 360 Profile <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UNMAPPED ASSETS POOL SECTION */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Unmapped Master Assets ({unmappedAssets.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Master assets registered in FAMS requiring 2D floor blueprint pin placement
            </p>
          </div>
        </div>

        {unmappedAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            All master assets have active 2D pin positions on floor blueprints!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-2.5">Asset Tag / ID</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Lifecycle Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {unmappedAssets.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-brand-600">
                      {a.tagNumber || a.assetId}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {a.description}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                        {a.lifecycleStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => {
                          setMode('EDIT');
                          setAssetToPlace(a);
                          showToast(`Selected ${a.tagNumber || a.assetId}. Click on blueprint to place pin.`);
                        }}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition-colors rounded-lg"
                      >
                        <Plus className="w-3 h-3" /> Place on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

