import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineStorage';
import { Camera, QrCode, Radio, CheckCircle, WifiOff, RefreshCw, Layers } from 'lucide-react';

export function MobileScanWorkbench() {
  const [activeMode, setActiveMode] = useState('CAMERA');
  const [scannedValue, setScannedValue] = useState('TAG-9001');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [rfidTags, setRfidTags] = useState([
    { epc: 'E280116060009001', rssi: -45, status: 'VERIFIED' },
    { epc: 'E280116060009002', rssi: -58, status: 'VERIFIED' },
    { epc: 'E280116060009999', rssi: -72, status: 'UNREGISTERED' }
  ]);
  const [lastObs, setLastObs] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadActiveCampaigns() {
      try {
        const res = await api.get('/stocktakes/campaigns');
        if (res.success && res.campaigns) {
          setCampaigns(res.campaigns);
          const active = res.campaigns.find(c => c.status === 'ACTIVE');
          if (active) setSelectedCampaignId(active._id);
          else if (res.campaigns[0]) setSelectedCampaignId(res.campaigns[0]._id);
        }
      } catch (err) { console.error('Failed to load campaigns:', err); }
    }
    loadActiveCampaigns();
  }, []);

  const handleSimulateScan = async () => {
    if (!selectedCampaignId) {
      alert('Please select an active campaign first.');
      return;
    }

    setLoading(true);
    const payload = {
      tagNumber: scannedValue,
      scanType: activeMode === 'CAMERA' ? 'BARCODE' : 'RFID',
      condition: 'GOOD'
    };

    if (isOffline) {
      const tx = await enqueueOfflineTransaction({
        type: 'STOCKTAKE_OBSERVATION',
        campaignId: selectedCampaignId,
        payload
      });
      setLastObs({ status: 'OFFLINE_QUEUED', uuid: tx.uuid });
      setLoading(false);
    } else {
      try {
        const res = await api.post(`/stocktakes/campaigns/${selectedCampaignId}/observe`, payload);
        if (res.success) setLastObs(res.observation);
      } catch (err) {
        // Fallback offline queue
        const tx = await enqueueOfflineTransaction({
          type: 'STOCKTAKE_OBSERVATION',
          campaignId: selectedCampaignId,
          payload
        });
        setLastObs({ status: 'OFFLINE_QUEUED', uuid: tx.uuid });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Mobile Field Scanner</h1>
          <p className="text-[10px] text-slate-500">Field Audit & Stocktake Execution</p>
        </div>
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isOffline ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {isOffline ? 'Offline Mode' : 'Online Sync'}
        </button>
      </div>

      {/* Target Campaign Selector */}
      <div className="bg-white border border-slate-200 p-4 space-y-2 rounded-xl shadow-xs">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-600" /> Target Audit Campaign:
        </label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:border-brand-500 font-semibold"
        >
          <option value="">-- Choose Campaign --</option>
          {campaigns.map(c => (
            <option key={c._id} value={c._id}>
              {c.campaignNumber} — {c.title} ({c.status})
            </option>
          ))}
        </select>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveMode('CAMERA')}
          className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'CAMERA' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" /> Camera / Barcode
        </button>
        <button
          onClick={() => setActiveMode('RFID')}
          className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'RFID' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" /> UHF RFID Reader
        </button>
      </div>

      {activeMode === 'CAMERA' && (
        <div className="bg-white border border-slate-200 p-6 text-center space-y-4 rounded-xl shadow-xs">
          <div className="w-full h-48 bg-slate-50 rounded-xl border border-dashed border-brand-300 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-36 h-36 border-2 border-brand-500 rounded-lg flex items-center justify-center animate-pulse">
              <QrCode className="w-16 h-16 text-brand-600" />
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Align Barcode / QR within frame</span>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">Scanned Tag / Serial Value</label>
            <input
              type="text"
              value={scannedValue}
              onChange={(e) => setScannedValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center font-mono font-bold text-brand-600 text-sm focus:border-brand-500"
            />
          </div>

          <button onClick={handleSimulateScan} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white w-full justify-center py-3 font-bold shadow-xs transition-colors rounded-lg flex items-center gap-2">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} Submit Field Scan
          </button>
        </div>
      )}

      {activeMode === 'RFID' && (
        <div className="bg-white border border-slate-200 p-5 space-y-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Bulk Read Telemetry</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">{rfidTags.length} EPC Tags Read</span>
          </div>

          <div className="space-y-2">
            {rfidTags.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900">{t.epc}</span>
                  <p className="text-[10px] text-slate-500">Signal: {t.rssi} dBm</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observation Result Alert */}
      {lastObs && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Observation Recorded!
          </div>
          <p className="text-[11px] text-slate-600">
            {lastObs.status === 'OFFLINE_QUEUED'
              ? `Queued in offline IndexedDB (UUID: ${lastObs.uuid})`
              : `Server synchronized at ${new Date(lastObs.timestamp || Date.now()).toLocaleTimeString()}`}
          </p>
        </div>
      )}
    </div>
  );
}

export default MobileScanWorkbench;
