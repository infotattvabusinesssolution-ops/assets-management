import React from 'react';
import { Plus } from 'lucide-react';

/**
 * Standardized Master Data Empty State
 * Used across all master tables for a consistent, modern, actionable empty state.
 */
export function MasterEmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  colSpan = 8,
  isTable = true
}) {
  const content = (
    <div className="py-14 px-4 text-center space-y-3 flex flex-col items-center justify-center animate-in fade-in duration-200">
      {Icon && (
        <div className="w-13 h-13 rounded-2xl bg-purple-50 text-[#6C2BD9] border border-purple-100 flex items-center justify-center shadow-2xs">
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-800">
          {title || 'No records found'}
        </h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {subtitle || 'Click below to register your first record.'}
        </p>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1.5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#6C2BD9] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel || 'Add New'}</span>
        </button>
      )}
    </div>
  );

  if (isTable) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-0">
          {content}
        </td>
      </tr>
    );
  }

  return content;
}

export default MasterEmptyState;

