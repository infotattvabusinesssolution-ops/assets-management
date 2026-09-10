import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Radio,
  Cpu,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Sliders,
  MapPin,
  Clock,
  ShieldAlert,
  Play,
  Layers,
  ChevronRight,
  Server
} from 'lucide-react';

export function RtlsWorkbench() {
  const [dashboard, setDashboard] = useState(null);
  const [readers, setReaders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReader, setSelectedReader] = useState(null);
  
  // Simulator form state
  const [simEpc, setSimEpc] = useState('E280116060009001');
  const [simReaderId, setSimReaderId] = useState('R-MAIN-ENTRANCE-01');
  const [simAntennaId, setSimAntennaId] = useState(1);
  const [simRssi, setSimRssi] = useState(-55);
  const [simResult, setSimResult] = useState(null);

  // New reader modal
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [newReader, setNewReader] = useState({
    readerIdentifier: '',
    name: '',
    manufacturer: 'Impinj',
    modelName: 'Speedway R420',
    ipAddress: '192.168.10.100',
    siteId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, readersRes, alertsRes] = await Promise.all([
        api.get('/rtls/dashboard').catch(() => null),
        api.get('/rtls/readers').catch(() => null),
        api.get('/rtls/alerts').catch(() => null)
      ]);

      if (dashRes && dashRes.summary) setDashboard(dashRes.summary);
      if (readersRes && readersRes.readers) setReaders(readersRes.readers);
      if (alertsRes && alertsRes.alerts) setAlerts(alertsRes.alerts);
    } catch (err) {
      console.error('Failed to load RTLS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rtls/simulator/trigger', {
        epc: simEpc,
        readerIdentifier: simReaderId,
        antennaNumber: parseInt(simAntennaId, 10),
        rssi: parseInt(simRssi, 10)
      });
      setSimResult(res);
      fetchData();
    } catch (err) {
      setSimResult({ error: err.message || 'Simulation failed' });
    }
  };

  const handleCreateReader = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rtls/readers', newReader);
      setShowReaderModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create reader');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.post(`/rtls/alerts/${alertId}/resolve`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Radio className="w-7 h-7 text-[#6c2bd9]" />
              RTLS & Fixed Reader Workbench
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
              LIVE SIGNAL
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time asset telemetry, gateway reader health monitoring, geofence alerts, and hardware simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReaderModal(true)}
            className="px-4 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add RFID Reader
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh Signal Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6c2bd9]' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6c2bd9] flex items-center justify-center flex-shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fixed Readers</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{dashboard?.totalReaders || readers.length}</span>
              <span className="text-xs font-semibold text-emerald-600">({dashboard?.onlineReaders || 0} Online)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assets Tracked Live</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{dashboard?.totalTrackedAssets || 0}</span>
              <span className="text-xs text-slate-500 font-medium">signal verified</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unregistered EPCs</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{dashboard?.unknownEpcCount || 0}</span>
              <span className="text-xs text-amber-600 font-semibold">requires review</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Geofence Alerts</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{dashboard?.openAlertsCount || alerts.filter(a => a.status === 'OPEN').length}</span>
              <span className="text-xs text-rose-600 font-semibold">active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Hardware & Readers, Right Hardware Simulator & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Reader Network & Live Movement Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Reader Infrastructure Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#6c2bd9]" />
                Fixed RFID Readers & Antenna Gateways
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {readers.length} configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Reader Name & ID</th>
                    <th className="py-3 px-4">Hardware Info</th>
                    <th className="py-3 px-4">Network IP</th>
                    <th className="py-3 px-4">Antennas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {readers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                        No RFID readers configured yet. Click "Add RFID Reader" above.
                      </td>
                    </tr>
                  ) : (
                    readers.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.name}</div>
                          <div className="font-mono text-[10px] text-[#6c2bd9]">{r.readerIdentifier}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{r.manufacturer}</div>
                          <div className="text-[10px] text-slate-400">{r.modelName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {r.ipAddress || '192.168.10.x'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6c2bd9] font-bold text-[11px] border border-purple-100">
                            {r.antennas?.length || 2} Antennas
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            r.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            r.status === 'DEGRADED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              r.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}></span>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {r.lastHeartbeat ? new Date(r.lastHeartbeat).toLocaleTimeString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Movement Timeline Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Live Asset Movement Stream
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Auto-Refreshing</span>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {(!dashboard?.recentMovements || dashboard.recentMovements.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No movement events recorded yet. Trigger simulated scan below to generate live movements.
                </div>
              ) : (
                dashboard.recentMovements.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6c2bd9] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {m.asset?.description || 'Tracked Asset'}
                          <span className="font-mono text-[#6c2bd9] text-[11px] ml-2">({m.asset?.assetId || m.assetId})</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <span>Reader: {m.reader?.name || m.readerId}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">Confidence: {m.confidence || 90}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(m.detectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Simulator Panel & Active Alerts */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* RFID Hardware Simulator Control Panel */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                RFID Hardware Simulator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DEV TESTER
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Simulate raw fixed-reader RFID EPC tag detections without requiring physical RFID hardware connected.
            </p>

            <form onSubmit={handleSimulateScan} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  RFID Tag EPC / Barcode
                </label>
                <input
                  type="text"
                  value={simEpc}
                  onChange={(e) => setSimEpc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none focus:border-[#6c2bd9]"
                  placeholder="E280116060009001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Reader ID
                  </label>
                  <select
                    value={simReaderId}
                    onChange={(e) => setSimReaderId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#6c2bd9]"
                  >
                    {readers.length === 0 ? (
                      <option value="R-MAIN-ENTRANCE-01">R-MAIN-ENTRANCE-01</option>
                    ) : (
                      readers.map(r => (
                        <option key={r.id} value={r.readerIdentifier}>{r.readerIdentifier}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Antenna #
                  </label>
                  <select
                    value={simAntennaId}
                    onChange={(e) => setSimAntennaId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#6c2bd9]"
                  >
                    <option value={1}>Antenna 1 (Inbound)</option>
                    <option value={2}>Antenna 2 (Outbound)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex justify-between mb-1">
                  <span>Signal Strength (RSSI)</span>
                  <span className="font-mono text-emerald-400">{simRssi} dBm</span>
                </label>
                <input
                  type="range"
                  min="-90"
                  max="-30"
                  value={simRssi}
                  onChange={(e) => setSimRssi(e.target.value)}
                  className="w-full accent-[#6c2bd9]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Zap className="w-4 h-4 fill-white" /> Trigger Hardware Tag Scan
              </button>
            </form>

            {simResult && (
              <div className={`p-3 rounded-xl text-xs font-mono space-y-1 ${
                simResult.error ? 'bg-rose-950/80 border border-rose-800 text-rose-300' : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {simResult.error ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {simResult.error ? 'Simulation Error' : 'Hardware Signal Ingested'}
                </div>
                {simResult.result && (
                  <p className="text-[10px] text-slate-300 font-sans">
                    {simResult.result.message || 'Signal processed by RTLS engine'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RTLS System Alerts Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active System Alerts
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                {alerts.filter(a => a.status === 'OPEN').length} OPEN
              </span>
            </div>

            <div className="p-3 space-y-2.5 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No active system alerts. All reader gateways operate normally.
                </div>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      a.status === 'RESOLVED' ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-60' :
                      a.severity === 'HIGH' || a.severity === 'CRITICAL' ? 'bg-rose-50/60 border-rose-200 text-rose-900' :
                      'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border">
                        {a.alertType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(a.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="font-semibold text-xs leading-snug">
                      {a.message}
                    </p>

                    {a.status === 'OPEN' && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleResolveAlert(a.id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 shadow-xs transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Reader Creation Modal */}
      {showReaderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#6c2bd9]" />
                Register New Fixed RFID Reader
              </h2>
              <button
                onClick={() => setShowReaderModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReader} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reader Identifier (Unique Code)
                </label>
                <input
                  type="text"
                  value={newReader.readerIdentifier}
                  onChange={(e) => setNewReader({ ...newReader, readerIdentifier: e.target.value })}
                  placeholder="e.g. R-WAREHOUSE-NORTH-01"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reader Display Name
                </label>
                <input
                  type="text"
                  value={newReader.name}
                  onChange={(e) => setNewReader({ ...newReader, name: e.target.value })}
                  placeholder="e.g. North Warehouse Loading Bay Reader"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Manufacturer
                  </label>
                  <select
                    value={newReader.manufacturer}
                    onChange={(e) => setNewReader({ ...newReader, manufacturer: e.target.value })}
                    className="input-field"
                  >
                    <option value="Impinj">Impinj</option>
                    <option value="Zebra">Zebra</option>
                    <option value="Alien Technology">Alien Technology</option>
                    <option value="Nordic ID">Nordic ID</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newReader.modelName}
                    onChange={(e) => setNewReader({ ...newReader, modelName: e.target.value })}
                    placeholder="Speedway R420"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={newReader.ipAddress}
                  onChange={(e) => setNewReader({ ...newReader, ipAddress: e.target.value })}
                  placeholder="192.168.10.100"
                  className="input-field font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReaderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6c2bd9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save & Provision Reader
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
