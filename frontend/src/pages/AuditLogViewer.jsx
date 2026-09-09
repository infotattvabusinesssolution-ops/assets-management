import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Clock, User, FileCode } from 'lucide-react';

export function AuditLogViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/audit');
        if (res.success) setLogs(res.logs);
      } catch (err) { console.error(err); }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Immutable Audit Trail</h1>
        <p className="text-xs text-slate-600">Append-only security and transactional audit log capturing actor, entity, diff & IP context</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Audit Events ({logs.length})</h3>
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-brand-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-600 uppercase">{log.action}</span>
                  <span className="text-slate-600">on <strong className="text-slate-900">{log.entityType}</strong></span>
                </div>
                <p className="text-slate-600">Performed by: <span className="text-slate-900 font-semibold">{log.userId?.fullName || 'System User'}</span></p>
              </div>
              <div className="text-right text-slate-500">
                <p>{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
