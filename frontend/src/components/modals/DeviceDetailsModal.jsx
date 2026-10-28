import React, { useState } from 'react';
import {
  X,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Layers,
  ShieldCheck,
  Link as LinkIcon,
  PlusCircle,
  Clock,
  Globe,
  Tag,
  Hash,
  Server,
  Activity
} from 'lucide-react';

export function DeviceDetailsModal({ isOpen, onClose, device, onOpenLinkModal, onRegisterAsNew }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !device) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Matched
          </span>
        );
      case 'Review':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 border border-amber-200">
            <Activity className="w-3.5 h-3.5" /> Needs Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-[#6C2BD9] flex items-center gap-1 border border-purple-200">
            <PlusCircle className="w-3.5 h-3.5" /> New Discovery
          </span>
        );
    }
  };

  const hardware = device.hardware || {};
  const network = device.network || {};
  const software = Array.isArray(device.software) ? device.software : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-[#6C2BD9] flex items-center justify-center font-bold shadow-2xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {device.hostname || `Device ${device.ipAddress}`}
                </h3>
                {getStatusBadge(device.status)}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                IP: <span className="font-bold text-[#6C2BD9]">{device.ipAddress}</span> • MAC: <span className="font-semibold">{device.macAddress || '—'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#6C2BD9] text-[#6C2BD9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Overview & Specs
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hardware'
                ? 'border-[#6C2BD9] text-[#6C2BD9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Hardware Telemetry
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'network'
                ? 'border-[#6C2BD9] text-[#6C2BD9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Network
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'software'
                ? 'border-[#6C2BD9] text-[#6C2BD9]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Software ({software.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Device Type</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#6C2BD9]" /> {device.deviceType || 'Network Device'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Operating System</span>
                  <span className="text-xs font-bold text-slate-800">{device.os || 'Linux / Embedded'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Manufacturer</span>
                  <span className="text-xs font-bold text-slate-800">{device.manufacturer || 'Unknown / Unresolved'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Model</span>
                  <span className="text-xs font-bold text-slate-800">{device.model || 'Standard Network Node'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Serial Number</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{device.serialNumber || '—'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Domain / Workgroup</span>
                  <span className="text-xs font-mono font-semibold text-slate-700">{device.domain || 'WORKGROUP'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-[#6C2BD9]" />
                  <span>Last Seen on Network: <strong>{device.lastSeen || 'Active Now'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-4 h-4 text-[#6C2BD9]" />
                  <span>Location: <strong>{device.location || 'HQ Data Center'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Processor (CPU)</span>
                  <span className="font-bold text-slate-900">{hardware.cpu || 'Intel Core / ARM 64-bit'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">CPU Cores</span>
                  <span className="font-bold text-slate-900 font-mono">{hardware.cores || '4 Cores'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Total Memory (RAM)</span>
                  <span className="font-bold text-slate-900 font-mono">{hardware.ram || '8 GB DDR4'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Primary Disk Storage</span>
                  <span className="font-bold text-slate-900 font-mono">{hardware.storage || '256 GB NVMe SSD'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">IP Address</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{device.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Physical MAC Address</span>
                  <span className="font-mono font-bold text-slate-800">{device.macAddress}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Subnet Mask</span>
                  <span className="font-mono text-slate-700">{network.subnet || '255.255.255.0'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Default Gateway</span>
                  <span className="font-mono text-slate-700">{network.gateway || '192.168.1.1'}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-500">Detected Open Ports</span>
                  <div className="flex flex-wrap gap-1">
                    {(network.openPorts || [22, 80, 443]).map((port) => (
                      <span key={port} className="px-2 py-0.5 bg-purple-100 text-[#6C2BD9] font-mono rounded text-[10px] font-bold">
                        :{port}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'software' && (
            <div className="space-y-2">
              {software.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {software.map((sw, i) => (
                    <div key={i} className="p-2.5 bg-white flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sw.name || sw}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{sw.version || 'v1.0'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">No installed software telemetry reported by device.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLinkModal(device);
              }}
              className="px-3.5 py-2 text-xs font-bold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Reconcile & Link
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegisterAsNew(device);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Register as New Asset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

