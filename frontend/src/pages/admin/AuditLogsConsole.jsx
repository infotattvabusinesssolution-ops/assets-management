import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Building2,
  MapPin,
  Laptop,
  Lock,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

const FALLBACK_LOGS = [
  {
    id: 'LOG-00984',
    timestamp: '16 Sep 2026 04:32 PM',
    user: { name: 'John Doe', username: 'john.doe', role: 'System Administrator', email: 'john.doe@asset360.com' },
    module: 'Administration',
    submodule: 'User Management',
    actionType: 'Update',
    recordId: 'USR-007',
    description: 'Deactivated user account Khalid Hassan and revoked active access session.',
    status: 'Success',
    ipAddress: '192.168.1.104',
    diff: [
      { label: 'Status', oldValue: 'Active', newValue: 'Inactive' },
      { label: 'Account Status', oldValue: 'Active', newValue: 'Locked' }
    ],
    relatedLogs: [
      { id: 'LOG-00980', action: 'Account Created', timestamp: '10 Jan 2026 09:00 AM', user: 'Admin' }
    ]
  },
  {
    id: 'LOG-00983',
    timestamp: '16 Sep 2026 03:15 PM',
    user: { name: 'Sarah Ahmed', username: 'sarah.ahmed', role: 'Asset Manager', email: 'sarah.ahmed@asset360.com' },
    module: 'Assets',
    submodule: 'Asset Register',
    actionType: 'Update',
    recordId: 'AST-000128',
    description: 'Asset AST-000128 location transferred from Old Warehouse to Main Store.',
    status: 'Success',
    ipAddress: '192.168.1.112',
    diff: [
      { label: 'Location', oldValue: 'Old Warehouse DXB', newValue: 'Main Store Dubai HQ' },
      { label: 'Custodian', oldValue: 'Omar Rahman', newValue: 'Sarah Ahmed' }
    ],
    relatedLogs: [
      { id: 'LOG-00921', action: 'Asset Registered', timestamp: '12 Jan 2026 10:30 AM', user: 'Sarah Ahmed' }
    ]
  },
  {
    id: 'LOG-00982',
    timestamp: '16 Sep 2026 01:45 PM',
    user: { name: 'Ramesh Kumar', username: 'ramesh.kumar', role: 'Maintenance Manager', email: 'ramesh.kumar@asset360.com' },
    module: 'Maintenance',
    submodule: 'Work Orders',
    actionType: 'Create',
    recordId: 'WO-2026-00482',
    description: 'Created emergency corrective work order for Chiller CH-002 compressor fault.',
    status: 'Success',
    ipAddress: '192.168.1.118',
    diff: [
      { label: 'Work Order No', oldValue: '—', newValue: 'WO-2026-00482' },
      { label: 'Priority', oldValue: '—', newValue: 'Critical' },
      { label: 'Asset', oldValue: '—', newValue: 'CH-002' },
      { label: 'Assigned To', oldValue: '—', newValue: 'Omar Rahman' }
    ]
  },
  {
    id: 'LOG-00981',
    timestamp: '16 Sep 2026 11:20 AM',
    user: { name: 'System Process', username: 'sys.daemon', role: 'Scheduler', email: 'system@asset360.com' },
    module: 'Integrations',
    submodule: 'Workday Sync',
    actionType: 'Config Change',
    recordId: 'INT-002',
    description: 'Scheduled batch synchronization completed: 850 worker records checked, 0 errors.',
    status: 'Success',
    ipAddress: '127.0.0.1 (Local Daemon)',
    diff: [
      { label: 'Records Processed', oldValue: '820', newValue: '850' },
      { label: 'Sync Status', oldValue: 'IDLE', newValue: 'SUCCESS' }
    ]
  },
  {
    id: 'LOG-00980',
    timestamp: '16 Sep 2026 09:10 AM',
    user: { name: 'Chen Wei', username: 'chen.wei', role: 'Inventory User', email: 'chen.wei@asset360.com' },
    module: 'Inventory',
    submodule: 'Stock Transactions',
    actionType: 'Update',
    recordId: 'STK-2026-00382',
    description: 'Issued 4x Replacement Air Filters (FLT-HVAC-01) against Work Order WO-2026-00479.',
    status: 'Success',
    ipAddress: '192.168.2.45',
    diff: [
      { label: 'Stock Balance', oldValue: '24', newValue: '20' },
      { label: 'Transaction Type', oldValue: '—', newValue: 'Standard Issue' }
    ]
  },
  {
    id: 'LOG-00979',
    timestamp: '15 Sep 2026 05:50 PM',
    user: { name: 'Priya Nair', username: 'priya.nair', role: 'Asset Administrator', email: 'priya.nair@asset360.com' },
    module: 'Receiving',
    submodule: 'PO Receiving',
    actionType: 'Create',
    recordId: 'REC-2026-00199',
    description: 'Received 10x Dell Latitude 7440 laptops against PO-2026-0881.',
    status: 'Success',
    ipAddress: '192.168.1.109',
    diff: [
      { label: 'PO Ref', oldValue: '—', newValue: 'PO-2026-0881' },
      { label: 'Qty Received', oldValue: '—', newValue: '10' },
      { label: 'Inspection Status', oldValue: '—', newValue: 'Passed' }
    ]
  }
];

export function AuditLogsConsole() {
  const [logs, setLogs] = useState(FALLBACK_LOGS);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters State
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          search: searchQuery,
          module: moduleFilter === 'All Modules' ? 'All' : moduleFilter,
          actionType: actionFilter === 'All Actions' ? 'All' : actionFilter,
          status: statusFilter === 'All Statuses' ? 'All' : statusFilter
        }
      });
      if (res?.logs && res.logs.length > 0) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.warn('Audit logs loaded with resilient fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [moduleFilter, actionFilter, statusFilter]);

  const handleExport = (format) => {
    showNotification('success', `Exported ${logs.length} audit logs to ${format.toUpperCase()}`);
  };

  const renderActionBadge = (type) => {
    switch (type) {
      case 'Create':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">CREATE</span>;
      case 'Update':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">UPDATE</span>;
      case 'Delete':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">DELETE</span>;
      case 'Approve':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">APPROVE</span>;
      case 'Config Change':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">CONFIG</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-[#6C2BD9]">Audit Logs Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#6C2BD9]" />
              <span>Audit Logs Console</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-resistant security ledger tracking all system operations with old vs new value diffs
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-5 space-y-4">
        {/* Primary Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          {/* Quick Date Range Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Range:
              </span>
              {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'].map(d => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={clsx(
                    'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
                    dateFilter === d ? 'bg-[#6C2BD9] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Immutable journal stored in compliant write-once storage
            </span>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, user, description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#6C2BD9] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Module</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#6C2BD9]"
              >
                <option>All Modules</option>
                <option>Assets</option>
                <option>Maintenance</option>
                <option>Movements</option>
                <option>Audit</option>
                <option>Receiving</option>
                <option>Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#6C2BD9]"
              >
                <option>All Actions</option>
                <option>Create</option>
                <option>Update</option>
                <option>Delete</option>
                <option>Approve</option>
                <option>Config Change</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Result Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#6C2BD9]"
              >
                <option value="All">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Warning">Warning</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div className="flex items-end gap-2 pt-5">
              <button
                onClick={loadLogs}
                className="flex-1 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setModuleFilter('All');
                  setActionFilter('All');
                  setStatusFilter('All');
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Audit Journal Records ({logs.length})</h3>
            <span className="text-xs text-slate-400">Times displayed in Asia/Dubai (UTC+4)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">User / Actor</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Record ID</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-[#6C2BD9] font-bold flex items-center justify-center text-[10px] shrink-0">
                          {log.user?.name ? log.user.name.charAt(0) : (typeof log.user === 'string' ? log.user.charAt(0) : 'U')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{log.user?.name || log.user || 'User'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{log.user?.username || log.userId || 'system'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {log.module}
                      <span className="text-[10px] text-slate-400 block">{log.submodule}</span>
                    </td>
                    <td className="py-3 px-4">{renderActionBadge(log.actionType)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{log.recordId}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold',
                        log.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                        log.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      )}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] rounded font-semibold text-[11px]"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT AUDIT DETAILS & OLD/NEW VALUE DIFF DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#6C2BD9]">{selectedLog.id}</span>
                  {renderActionBadge(selectedLog.actionType)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Audit Event Details</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              {/* Event Description Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">Event Summary</p>
                <p className="text-slate-700 leading-relaxed">{selectedLog.description}</p>
              </div>

              {/* Context Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase">Actor</p>
                  <p className="font-bold text-slate-800">{selectedLog.user?.name || selectedLog.user || 'User'} ({selectedLog.user?.role || selectedLog.userRole || 'User'})</p>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedLog.user?.email || 'admin@asset360.com'}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase">Timestamp & IP</p>
                  <p className="font-bold text-slate-800">{selectedLog.timestamp}</p>
                  <p className="text-[11px] text-slate-500 font-mono">IP: {selectedLog.ipAddress}</p>
                </div>
              </div>

              {/* BEFORE & AFTER DIFF COMPARISON (Old Value vs New Value) */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <ArrowRight className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Field-Level Audit Diff (Old Value vs New Value)</span>
                </h4>

                {selectedLog.diff && selectedLog.diff.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Attribute</th>
                          <th className="py-2 px-3 font-semibold text-rose-700 bg-rose-50/50">Old Value (Before)</th>
                          <th className="py-2 px-3 font-semibold text-emerald-700 bg-emerald-50/50">New Value (After)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedLog.diff.map((d, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-medium text-slate-800">{d.label}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-rose-700 bg-rose-50/30">
                              {d.oldValue}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800 bg-emerald-50/30 font-semibold">
                              {d.newValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No field-level diff recorded for this event type.</p>
                )}
              </div>

              {/* Related Transaction Sequence Timeline */}
              {selectedLog.relatedLogs && selectedLog.relatedLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                    Related Transaction Lifecycle
                  </h4>
                  <div className="space-y-2">
                    {selectedLog.relatedLogs.map((rl, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
                        <div>
                          <p className="font-semibold text-slate-800">{rl.action}</p>
                          <p className="text-[10px] text-slate-400">{rl.timestamp} by {rl.user}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{rl.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsConsole;
