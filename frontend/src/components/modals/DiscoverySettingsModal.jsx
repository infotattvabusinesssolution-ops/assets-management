import React, { useState, useEffect } from 'react';
import { X, Sliders, Shield, RefreshCw, Cpu, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export function DiscoverySettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    matchingWeights: {
      serialNumber: 40,
      macAddress: 30,
      hostname: 20,
      model: 10
    },
    thresholds: {
      autoMatchThreshold: 95,
      suggestThreshold: 60,
      staleDays: 30
    },
    protocols: {
      icmpPing: true,
      snmp: true,
      wmi: true,
      ssh: true,
      adSync: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/discovery/settings');
      if (res && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.warn('Using default settings fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      matchingWeights: {
        ...prev.matchingWeights,
        [key]: Number(value)
      }
    }));
  };

  const handleThresholdChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: Number(value)
      }
    }));
  };

  const handleProtocolToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      protocols: {
        ...prev.protocols,
        [key]: !prev.protocols[key]
      }
    }));
  };

  const totalWeight =
    (settings.matchingWeights?.serialNumber || 0) +
    (settings.matchingWeights?.macAddress || 0) +
    (settings.matchingWeights?.hostname || 0) +
    (settings.matchingWeights?.model || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/discovery/settings', settings);
      if (onSettingsUpdated) onSettingsUpdated(settings);
      onClose();
    } catch (err) {
      console.warn('Could not save to backend, keeping local state:', err);
      if (onSettingsUpdated) onSettingsUpdated(settings);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Discovery &amp; Reconciliation Settings</h3>
              <p className="text-xs text-slate-500">Configure match confidence weights, thresholds, and scanning protocols</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Matching Weights Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Weighted Reconciliation Criteria</h4>
                <p className="text-[11px] text-slate-500">Assign priority weights for matching discovered devices with the Asset Master</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Total: {totalWeight}% {totalWeight === 100 ? '✓' : '(Must equal 100%)'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Serial Number (Hardware Unique)</span>
                  <span className="font-bold text-[#6C2BD9]">{settings.matchingWeights?.serialNumber}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.matchingWeights?.serialNumber || 0}
                  onChange={(e) => handleWeightChange('serialNumber', e.target.value)}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>MAC Address (NIC Hardware Key)</span>
                  <span className="font-bold text-[#6C2BD9]">{settings.matchingWeights?.macAddress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.matchingWeights?.macAddress || 0}
                  onChange={(e) => handleWeightChange('macAddress', e.target.value)}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Hostname / Computer Name</span>
                  <span className="font-bold text-[#6C2BD9]">{settings.matchingWeights?.hostname}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.matchingWeights?.hostname || 0}
                  onChange={(e) => handleWeightChange('hostname', e.target.value)}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Manufacturer / Model Match</span>
                  <span className="font-bold text-[#6C2BD9]">{settings.matchingWeights?.model}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.matchingWeights?.model || 0}
                  onChange={(e) => handleWeightChange('model', e.target.value)}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Thresholds & Policies */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <label className="block font-semibold text-slate-700 mb-1">Auto-Match Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settings.thresholds?.autoMatchThreshold || 95}
                  onChange={(e) => handleThresholdChange('autoMatchThreshold', e.target.value)}
                  className="w-20 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
                <span className="text-slate-500 font-medium">% Score</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Scores above this qualify as automatic verified matches</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <label className="block font-semibold text-slate-700 mb-1">Stale Asset Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={settings.thresholds?.staleDays || 30}
                  onChange={(e) => handleThresholdChange('staleDays', e.target.value)}
                  className="w-20 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
                <span className="text-slate-500 font-medium">Days</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Flag assets not seen on network within this duration</p>
            </div>
          </div>

          {/* Protocols & Collectors */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="font-bold text-slate-800 text-xs mb-1">Active Discovery Protocols</h4>
            <p className="text-[11px] text-slate-500 mb-3">Enable or disable protocols permitted across target subnets</p>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'icmpPing', label: 'ICMP Echo / Ping Sweep' },
                { id: 'snmp', label: 'SNMP v1/v2c/v3 Polling' },
                { id: 'wmi', label: 'WMI / WinRM Agentless' },
                { id: 'ssh', label: 'SSH Linux / Unix Collector' },
                { id: 'adSync', label: 'Active Directory / MDM Sync' }
              ].map(proto => (
                <label key={proto.id} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={!!settings.protocols?.[proto.id]}
                    onChange={() => handleProtocolToggle(proto.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                  <span>{proto.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Saving...' : 'Apply & Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
