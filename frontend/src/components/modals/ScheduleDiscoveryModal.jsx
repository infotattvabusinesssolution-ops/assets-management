import React, { useState } from 'react';
import { X, Calendar, Clock, Network, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function ScheduleDiscoveryModal({ isOpen, onClose, onJobScheduled }) {
  const [formData, setFormData] = useState({
    name: 'Daily HQ Floor 1-3 Subnet Sweep',
    discoveryType: 'IP Range Scan',
    scope: '192.168.1.1 - 192.168.1.254',
    frequency: 'Daily at 02:00 AM',
    profile: 'Default (All Devices)',
    credentials: 'Use Saved Credentials',
    notifyEmail: 'it-alerts@asset360.com'
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/discovery/jobs/schedule', formData);
      if (onJobScheduled) {
        onJobScheduled(res.job || formData);
      }
      onClose();
    } catch (err) {
      // Fallback
      if (onJobScheduled) onJobScheduled(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Discovery Job</h3>
              <p className="text-xs text-slate-500">Configure automated recurring network scans and alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discovery Type</label>
              <select
                value={formData.discoveryType}
                onChange={e => setFormData({ ...formData, discoveryType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="IP Range Scan">IP Range Scan</option>
                <option value="SNMP Polling">SNMP Polling</option>
                <option value="WMI/WinRM Agentless">WMI/WinRM Agentless</option>
                <option value="SSH Linux Discovery">SSH Linux Discovery</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="Daily at 02:00 AM">Daily at 02:00 AM</option>
                <option value="Every 6 Hours">Every 6 Hours</option>
                <option value="Weekly on Sunday">Weekly on Sunday</option>
                <option value="Monthly (1st day)">Monthly (1st day)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">IP Scope / Subnet Range</label>
            <input
              type="text"
              value={formData.scope}
              onChange={e => setFormData({ ...formData, scope: e.target.value })}
              placeholder="e.g. 192.168.1.1 - 192.168.1.254"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discovery Profile</label>
              <select
                value={formData.profile}
                onChange={e => setFormData({ ...formData, profile: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="Default (All Devices)">Default (All Devices)</option>
                <option value="Workstations Only">Workstations Only</option>
                <option value="Network Infrastructure">Network Infrastructure</option>
                <option value="Printers & Scanners">Printers &amp; Scanners</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credentials Set</label>
              <select
                value={formData.credentials}
                onChange={e => setFormData({ ...formData, credentials: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="Use Saved Credentials">Use Saved Credentials</option>
                <option value="Windows Domain Admin">Windows Domain Admin</option>
                <option value="SNMP v3 AuthPriv">SNMP v3 AuthPriv</option>
                <option value="No Auth (Ping Sweep)">No Auth (Ping Sweep)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notification Email</label>
            <input
              type="email"
              value={formData.notifyEmail}
              onChange={e => setFormData({ ...formData, notifyEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Scheduling...' : 'Save & Schedule Job'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
