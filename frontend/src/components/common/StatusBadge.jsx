import React from 'react';
import clsx from 'clsx';

const STATUS_COLOR_MAP = {
  IN_SERVICE: 'bg-emerald-100 text-black border-emerald-300',
  ASSIGNED: 'bg-purple-100 text-black border-purple-300',
  RECEIVED: 'bg-indigo-100 text-black border-indigo-300',
  TAGGED: 'bg-violet-100 text-black border-violet-300',
  UNDER_MAINTENANCE: 'bg-amber-100 text-black border-amber-300',
  MISSING: 'bg-rose-100 text-black border-rose-300',
  DISPOSED: 'bg-slate-100 text-black border-slate-300',
  ACTIVE: 'bg-emerald-100 text-black border-emerald-300',
  COMPLETED: 'bg-emerald-100 text-black border-emerald-300',
  MATCHED: 'bg-purple-100 text-black border-purple-300',
  SUGGESTED: 'bg-amber-100 text-black border-amber-300',
  UNKNOWN: 'bg-rose-100 text-black border-rose-300'
};

export function StatusBadge({ status }) {
  const style = STATUS_COLOR_MAP[status] || 'bg-slate-100 text-black border-slate-300';
  return (
    <span className={clsx('px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wider uppercase inline-flex items-center gap-1.5 shadow-2xs text-black', style)}>
      <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
      {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
}

