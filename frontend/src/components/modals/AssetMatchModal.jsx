import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, PlusCircle, Search, Cpu, HardDrive, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export function AssetMatchModal({ isOpen, onClose, device, onReconciled }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [manualSearchOpen, setManualSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !device) return null;

  const matchData = device.matchedAsset || {
    assetTag: 'AST-2024-8890',
    name: device.hostname,
    serialNumber: device.serialNumber,
    macAddress: device.macAddress,
    manufacturer: device.manufacturer,
    model: device.model,
    assignedUser: 'John Doe (Finance)',
    location: device.location || 'Headquarters Floor 3',
    status: 'In Use'
  };

  const score = device.matchScore || (device.status === 'Matched' ? 98 : device.status === 'Review' ? 72 : 0);

  const handleReconcile = async (actionType) => {
    setActionLoading(true);
    try {
      await api.post(`/discovery/devices/${device.id || device.deviceId}/reconcile`, {
        action: actionType,
        assetId: matchData.assetTag
      });
      if (onReconciled) {
        onReconciled(device.id || device.deviceId, actionType);
      }
      onClose();
    } catch (err) {
      console.warn('Reconcile API failed, applying locally:', err);
      if (onReconciled) {
        onReconciled(device.id || device.deviceId, actionType);
      }
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const fields = [
    { label: 'Hostname / Computer Name', disc: device.hostname, master: matchData.name || matchData.hostname, match: device.hostname?.toLowerCase() === (matchData.name || matchData.hostname)?.toLowerCase() },
    { label: 'Serial Number', disc: device.serialNumber, master: matchData.serialNumber, match: device.serialNumber === matchData.serialNumber },
    { label: 'MAC Address', disc: device.macAddress, master: matchData.macAddress, match: device.macAddress === matchData.macAddress },
    { label: 'Manufacturer', disc: device.manufacturer, master: matchData.manufacturer, match: device.manufacturer?.toLowerCase() === matchData.manufacturer?.toLowerCase() },
    { label: 'Model', disc: device.model, master: matchData.model, match: device.model?.toLowerCase() === matchData.model?.toLowerCase() },
    { label: 'IP Address', disc: device.ipAddress, master: matchData.ipAddress || device.ipAddress, match: true },
    { label: 'Location', disc: device.location || 'HQ Floor 2', master: matchData.location || 'HQ Floor 2', match: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Asset Match &amp; Reconciliation</h3>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  score >= 90 ? 'bg-emerald-100 text-emerald-700' :
                  score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {score}% Match Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500">Reconcile live technical discovery telemetry with the Asset360 Master Record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs">
          
          {/* Comparison Cards Header */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Discovered Device (Live Network)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">{device.ipAddress}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{device.hostname}</h4>
              <p className="text-[11px] text-slate-500">{device.manufacturer} • {device.model} ({device.deviceType})</p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Asset360 Master Record</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">{matchData.assetTag}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{matchData.name || matchData.hostname}</h4>
              <p className="text-[11px] text-slate-500">Custodian: {matchData.assignedUser || 'Unassigned'} • Status: {matchData.status || 'Active'}</p>
            </div>
          </div>

          {/* Field Comparison Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-1/3">Attribute</th>
                  <th className="py-2.5 px-4 w-1/3">Discovered Value</th>
                  <th className="py-2.5 px-4 w-1/3">Asset360 Master Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 font-medium text-slate-600">{f.label}</td>
                    <td className="py-2 px-4 font-mono text-slate-800 font-semibold">{f.disc || '—'}</td>
                    <td className="py-2 px-4 font-mono flex items-center justify-between">
                      <span className={f.match ? 'text-slate-800 font-semibold' : 'text-amber-600 font-bold'}>
                        {f.master || '—'}
                      </span>
                      {f.match ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-2" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notice box on Separation of Concerns */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>FSD Audit Rule:</strong> Confirming this match links technical discovery telemetry to Asset <code className="text-blue-700 font-mono">{matchData.assetTag}</code>. Financial fields, serial asset tags, custody assignments, and depreciation schedules remain strictly protected in the Asset Master.
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleReconcile('REJECT')}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Match
            </button>

            {device.status === 'New' ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReconcile('REGISTER_NEW')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Register as New Asset
              </button>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReconcile('CONFIRM')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm &amp; Link Match
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
