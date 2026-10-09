import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Network, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function ScheduleDiscoveryModal({ isOpen, onClose, onJobScheduled, defaultIpStart, defaultIpEnd }) {
  const [formData, setFormData] = useState({
    name: 'Local network scan',
    discoveryType: 'IP Range Scan',
    scope: '',
    frequency: 'Daily at 02:00 AM',
    profile: 'Default (All Devices)',
    credentials: 'Use Saved Credentials',
    notifyEmail: 'it-alerts@asset360.com'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, scope: [defaultIpStart, defaultIpEnd].filter(Boolean).join(' - ') }));
      setError('');
    }
  }, [isOpen, defaultIpStart, defaultIpEnd]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const [ipStart, ipEnd] = formData.scope.split(/\s+-\s+/);
      const res = await api.post('/discovery/jobs', {
        jobName: formData.name.trim(), discoveryType: 'IP Range Scan', ipStart, ipEnd
      });
      if (!res?.success || !res.job) throw new Error(res?.message || 'Could not save the scan job.');
      onJobScheduled?.(res.job);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not save the scan job.');
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
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Save Local Scan Job</h3>
              <p className="text-xs text-slate-500">Run this IP range again from Discovery Jobs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}
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

          <p className="text-slate-500">The API server must be connected to this private network. This saved job runs when you select Run in Discovery Jobs.</p>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Saving...' : 'Save Scan Job'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
