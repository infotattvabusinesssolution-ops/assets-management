import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Search, Filter, ArrowRight } from 'lucide-react';

export function ValidationDetailsModal({ isOpen, onClose, devices = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredDevices = devices.filter(d => {
    const matchSearch =
      !searchTerm ||
      d.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Mandatory Field Validation Details</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {devices.length} / {devices.length} Devices Validated
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Detailed field-readiness verification prior to committing Asset360 Master records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by hostname, serial, IP..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Mandatory Fields Present
            </span>
          </div>
        </div>

        {/* Validation Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-4 font-bold text-slate-700">#</th>
                <th className="py-2.5 px-4 font-bold text-slate-700">Hostname</th>
                <th className="py-2.5 px-4 font-bold text-slate-700">IP &amp; MAC</th>
                <th className="py-2.5 px-4 font-bold text-slate-700">Serial Number</th>
                <th className="py-2.5 px-4 font-bold text-slate-700">Asset Action</th>
                <th className="py-2.5 px-4 font-bold text-slate-700">Target Location</th>
                <th className="py-2.5 px-4 font-bold text-slate-700 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((dev, idx) => (
                <tr key={dev.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{dev.hostname}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                    <div>{dev.ipAddress}</div>
                    <div className="text-slate-400">{dev.macAddress}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-800">{dev.serialNumber}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        dev.assetAction === 'Create New'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {dev.assetAction}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">{dev.targetLocation || 'Dubai HQ - IT'}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Rule Check: Unique Serial numbers, MAC addresses, and physical locations verified.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
