import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

export function AssetMatchModal({ isOpen, onClose, device, onReconciled }) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [assetsList, setAssetsList] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load live assets to match against
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api.get('/assets', { params: { limit: 500 } })
      .then((res) => {
        if (!active) return;
        const list = res?.assets || [];
        setAssetsList(list);

        // Auto-match by serial number, MAC, or IP
        if (device) {
          const autoFound = list.find((a) => {
            if (device.serialNumber && a.serialNumber && device.serialNumber.trim().toLowerCase() === a.serialNumber.trim().toLowerCase()) return true;
            if (device.macAddress && a.macAddress && device.macAddress.trim().toLowerCase() === a.macAddress.trim().toLowerCase()) return true;
            if (device.ipAddress && a.ipAddress && device.ipAddress.trim() === a.ipAddress.trim()) return true;
            if (device.hostname && a.name && device.hostname.trim().toLowerCase() === a.name.trim().toLowerCase()) return true;
            return false;
          });
          if (autoFound) {
            setSelectedAssetId(autoFound.id);
          } else if (list.length > 0) {
            setSelectedAssetId(list[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load assets for reconciliation:', err);
      });

    return () => { active = false; };
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const selectedAsset = assetsList.find((a) => a.id === selectedAssetId) || assetsList[0] || null;

  // Filter available assets for search select
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assetsList;
    const q = searchQuery.toLowerCase();
    return assetsList.filter((a) =>
      (a.assetTag || '').toLowerCase().includes(q) ||
      (a.name || a.description || '').toLowerCase().includes(q) ||
      (a.serialNumber || '').toLowerCase().includes(q) ||
      (a.ipAddress || '').toLowerCase().includes(q)
    );
  }, [assetsList, searchQuery]);

  const score = useMemo(() => {
    if (!selectedAsset) return 0;
    let points = 0;
    let total = 0;

    // Serial
    if (device.serialNumber && selectedAsset.serialNumber) {
      total += 40;
      if (device.serialNumber.toLowerCase() === selectedAsset.serialNumber.toLowerCase()) points += 40;
    }
    // MAC
    if (device.macAddress && selectedAsset.macAddress) {
      total += 30;
      if (device.macAddress.toLowerCase() === selectedAsset.macAddress.toLowerCase()) points += 30;
    }
    // IP
    if (device.ipAddress && selectedAsset.ipAddress) {
      total += 15;
      if (device.ipAddress === selectedAsset.ipAddress) points += 15;
    }
    // Hostname / Name
    if (device.hostname && selectedAsset.name) {
      total += 15;
      if (device.hostname.toLowerCase() === selectedAsset.name.toLowerCase()) points += 15;
    }

    if (total === 0) return 50;
    return Math.round((points / total) * 100);
  }, [device, selectedAsset]);

  const handleReconcile = async (actionType) => {
    setActionLoading(true);
    setErrorMessage('');
    try {
      const deviceId = device.id || device.deviceId;
      let endpoint = '';
      if (actionType === 'CONFIRM') endpoint = `/discovery/devices/${deviceId}/confirm-match`;
      else if (actionType === 'REJECT') endpoint = `/discovery/devices/${deviceId}/reject-match`;
      else if (actionType === 'REGISTER_NEW') endpoint = `/discovery/devices/${deviceId}/create-asset`;

      if (endpoint) {
        await api.post(endpoint, {
          action: actionType,
          assetId: selectedAsset?.id || selectedAsset?.assetTag,
          ...device
        });
      }

      if (onReconciled) {
        onReconciled(deviceId, actionType, selectedAsset);
      }
      onClose();
    } catch (err) {
      console.warn('Reconcile API failed, applying locally:', err);
      if (onReconciled) {
        onReconciled(device.id || device.deviceId, actionType, selectedAsset);
      }
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterNewAssetRedirect = () => {
    onClose();
    const queryParams = new URLSearchParams({
      assetName: device.hostname || `Discovered Device (${device.ipAddress})`,
      ipAddress: device.ipAddress || '',
      macAddress: device.macAddress || '',
      serialNumber: device.serialNumber || '',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      discoveryId: device.id || ''
    });
    navigate(`/assets/new?${queryParams.toString()}`);
  };

  const fields = [
    {
      label: 'Hostname / Computer Name',
      disc: device.hostname,
      master: selectedAsset?.name || selectedAsset?.hostname,
      match: device.hostname && selectedAsset?.name && device.hostname.toLowerCase() === selectedAsset.name.toLowerCase()
    },
    {
      label: 'Serial Number',
      disc: device.serialNumber,
      master: selectedAsset?.serialNumber,
      match: device.serialNumber && selectedAsset?.serialNumber && device.serialNumber === selectedAsset.serialNumber
    },
    {
      label: 'MAC Address',
      disc: device.macAddress,
      master: selectedAsset?.macAddress,
      match: device.macAddress && selectedAsset?.macAddress && device.macAddress === selectedAsset.macAddress
    },
    {
      label: 'Manufacturer',
      disc: device.manufacturer,
      master: selectedAsset?.manufacturer?.name || selectedAsset?.manufacturer,
      match: device.manufacturer && (selectedAsset?.manufacturer?.name || selectedAsset?.manufacturer) &&
        device.manufacturer.toLowerCase() === (selectedAsset?.manufacturer?.name || selectedAsset?.manufacturer).toLowerCase()
    },
    {
      label: 'Model',
      disc: device.model,
      master: selectedAsset?.model?.name || selectedAsset?.model,
      match: device.model && (selectedAsset?.model?.name || selectedAsset?.model) &&
        device.model.toLowerCase() === (selectedAsset?.model?.name || selectedAsset?.model).toLowerCase()
    },
    {
      label: 'IP Address',
      disc: device.ipAddress,
      master: selectedAsset?.ipAddress,
      match: device.ipAddress && selectedAsset?.ipAddress && device.ipAddress === selectedAsset.ipAddress
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Asset Match &amp; Reconciliation</h3>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {score}% Match Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500">Reconcile live technical discovery telemetry with the Asset360 Master Record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Comparison Cards Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C2BD9]">Discovered Device (Live Network)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-purple-100 text-[#6C2BD9] rounded font-medium">{device.ipAddress}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{device.hostname || 'Unresolved Hostname'}</h4>
              <p className="text-[11px] text-slate-500">{device.manufacturer || 'Unknown Mfr'} • {device.model || 'Unknown Model'} ({device.deviceType || 'Device'})</p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Link with Master Asset</span>
                {selectedAsset && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                    {selectedAsset.assetTag || selectedAsset.assetId}
                  </span>
                )}
              </div>

              {/* Asset Select Dropdown */}
              <div className="relative">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {filteredAssets.length === 0 ? (
                    <option value="">No assets registered yet</option>
                  ) : (
                    filteredAssets.map((ast) => (
                      <option key={ast.id} value={ast.id}>
                        {ast.assetTag || ast.assetId} - {ast.name || ast.description} ({ast.serialNumber || 'No SN'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedAsset && (
                <p className="text-[11px] text-slate-500">
                  Category: <strong>{selectedAsset.category?.name || 'General'}</strong> • Status: <strong>{selectedAsset.lifecycleStatus || selectedAsset.status || 'Active'}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Field Comparison Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2.5 px-4 w-1/3">Attribute</th>
                  <th className="py-2.5 px-4 w-1/3">Discovered Value</th>
                  <th className="py-2.5 px-4 w-1/3">Asset360 Master Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 font-semibold text-slate-600">{f.label}</td>
                    <td className="py-2 px-4 font-mono text-slate-800 font-bold">{f.disc || '—'}</td>
                    <td className="py-2 px-4 font-mono flex items-center justify-between">
                      <span className={f.match ? 'text-slate-800 font-bold' : 'text-slate-500'}>
                        {f.master || '—'}
                      </span>
                      {f.match ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-sans ml-2">Different</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notice box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
            <span>
              <strong>Reconciliation Rule:</strong> Confirming this match links network telemetry to Asset <code className="text-[#6C2BD9] font-mono font-bold">{selectedAsset?.assetTag || 'Selected Asset'}</code>.
              Financial depreciation schedules and custodian records remain strictly guarded in the Asset Master.
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleReconcile('REJECT')}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Match
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRegisterNewAssetRedirect}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open the Asset Registration form with this device's specs pre-filled"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#6C2BD9]" />
              Register as New Asset
            </button>

            <button
              type="button"
              disabled={actionLoading || !selectedAsset}
              onClick={() => handleReconcile('CONFIRM')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm &amp; Link Match
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
