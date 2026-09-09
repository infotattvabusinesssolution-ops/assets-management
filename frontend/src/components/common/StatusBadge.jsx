import React from 'react';
import clsx from 'clsx';

const STATUS_COLOR_MAP = {
  IN_SERVICE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
  RECEIVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TAGGED: 'bg-violet-50 text-violet-700 border-violet-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  MISSING: 'bg-rose-50 text-rose-700 border-rose-200',
  DISPOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MATCHED: 'bg-purple-50 text-purple-700 border-purple-200',
  SUGGESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  UNKNOWN: 'bg-rose-50 text-rose-700 border-rose-200'
};

export function StatusBadge({ status }) {
  const style = STATUS_COLOR_MAP[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={clsx('px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wider uppercase inline-flex items-center gap-1.5 shadow-2xs', style)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
}

