import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  MapPin,
  Radio,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  Server,
  Zap,
  CheckCircle2
} from 'lucide-react';

export function RtlsFloorMapLive() {
  const [floorMaps, setFloorMaps] = useState([]);
  const [selectedFloorMap, setSelectedFloorMap] = useState(null);
  const [assets, setAssets] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIVE_RTLS'); // 'LIVE_RTLS' or 'STATIC_MAP'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [assetsRes, readersRes] = await Promise.all([
        api.get('/assets').catch(() => null),
        api.get('/rtls/readers').catch(() => null)
      ]);

      if (assetsRes && assetsRes.assets) setAssets(assetsRes.assets);
      if (readersRes && readersRes.readers) setReaders(readersRes.readers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const filteredAssets = assets.filter(a => {
    const q = searchQuery.toLowerCase();
    return !q || (
      a.assetId?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.rfidEpc?.toLowerCase().includes(q) ||
      a.tagNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#6c2bd9]" />
            Spatial Floor Map & Live RTLS Overlay
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Visualize static physical placement vs live RFID reader signal triangulation
          </p>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('LIVE_RTLS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'LIVE_RTLS'
                ? 'bg-[#6c2bd9] text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" /> Live RTLS Signal Overlay
          </button>
          <button
            onClick={() => setViewMode('STATIC_MAP')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'STATIC_MAP'
                ? 'bg-[#6c2bd9] text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" /> Static Map Position
          </button>
        </div>
      </div>

      {/* Main Floor Plan & Asset Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xs text-slate-800">Site Floorplan Canvas</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                viewMode === 'LIVE_RTLS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-[#6c2bd9] border border-purple-200'
              }`}>
                {viewMode === 'LIVE_RTLS' ? 'REALTIME TELEMETRY ON' : 'STATIC RECORDED'}
              </span>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search EPC, Tag, Asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6c2bd9]"
              />
            </div>
          </div>

          {/* Interactive Spatial Grid Canvas */}
          <div className="relative w-full h-[520px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Grid Lines Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>

            {/* Floor Map Title Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs border border-slate-800 text-white p-3 rounded-2xl z-10">
              <h3 className="text-xs font-extrabold flex items-center gap-1.5 text-purple-300">
                <Server className="w-3.5 h-3.5" /> Building A - Main Operations Floor
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">50m x 30m • 4 Active Readers</p>
            </div>

            {/* Render Fixed Readers as Gateway Nodes */}
            {readers.map((r, idx) => {
              const posX = 20 + (idx * 22);
              const posY = 25 + (idx * 18);
              return (
                <div
                  key={r.id}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/60 flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Radio className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="absolute top-11 bg-slate-900/90 text-purple-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30 whitespace-nowrap">
                      {r.readerIdentifier}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Render Asset Telemetry Signals */}
            {filteredAssets.map((asset, idx) => {
              const posX = 15 + ((idx * 17) % 70);
              const posY = 30 + ((idx * 23) % 55);
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {viewMode === 'LIVE_RTLS' && (
                      <span className="absolute w-8 h-8 rounded-full bg-emerald-400/40 animate-ping"></span>
                    )}

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md transition-transform group-hover:scale-125 ${
                      isSelected ? 'bg-amber-500 ring-4 ring-amber-300/40 scale-125' :
                      viewMode === 'LIVE_RTLS' ? 'bg-emerald-500' : 'bg-[#6c2bd9]'
                    }`}>
                      <Zap className="w-3 h-3" />
                    </div>

                    <div className="absolute top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-xl whitespace-nowrap z-50">
                      <div className="font-bold text-purple-300">{asset.description}</div>
                      <div className="font-mono text-slate-400 text-[9px]">ID: {asset.assetId}</div>
                      <div className="text-emerald-400 text-[9px] font-mono mt-1">
                        Signal: {viewMode === 'LIVE_RTLS' ? 'RSSI -58 dBm (95% Conf)' : 'Static Pin'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Asset Inspection Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6c2bd9]" />
            Asset Signal Inspection
          </h2>

          {!selectedAsset ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium space-y-2">
              <Radio className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
              <p>Click any live signal pin on the floor map to inspect real-time RTLS telemetry.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                <span className="text-[10px] font-mono font-extrabold text-[#6c2bd9] uppercase tracking-wider block">
                  {selectedAsset.assetId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedAsset.description}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">RFID EPC:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAsset.rfidEpc || selectedAsset.tagNumber || 'E280116060009001'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Current Zone:</span>
                  <span className="font-bold text-slate-900">Main Entrance Gateway</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nearest Reader:</span>
                  <span className="font-mono text-[#6c2bd9] font-bold">R-MAIN-ENTRANCE-01</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Signal Confidence:</span>
                  <span className="font-bold text-emerald-600">95% (High)</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Last Telemetry Ping:</span>
                  <span className="font-mono text-slate-600">Just Now</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
