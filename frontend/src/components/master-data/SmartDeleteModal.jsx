import React from 'react';
import { AlertTriangle, Trash2, EyeOff, X, ShieldAlert, ArrowRight } from 'lucide-react';

export function SmartDeleteModal({
  isOpen,
  onClose,
  item,
  entityName = 'Record',
  linkedCount = 0,
  details = null,
  onDeactivate,
  onForceDelete,
  isProcessing = false
}) {
  if (!isOpen || !item) return null;

  const itemName = item.name || item.fullName || item.code || 'this record';
  const itemCode = item.code || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-100/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Linked Records Found</h3>
              <p className="text-xs text-amber-700/90 font-medium">Action required before deletion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">{entityName} "{itemName}"</span> {itemCode ? `(${itemCode})` : ''} cannot be erased directly because{' '}
            <strong className="text-amber-700 font-bold">{linkedCount} record(s)</strong> are currently assigned to it in the system.
          </p>

          {/* Breakdown if details exist */}
          {details && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Connections:
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                {Boolean(details.assetsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.assetsCount} Asset(s)</span>
                  </div>
                )}
                {Boolean(details.sitesCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.sitesCount} Location(s)</span>
                  </div>
                )}
                {Boolean(details.childCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.childCount} Sub-location(s)</span>
                  </div>
                )}
                {Boolean(details.deptsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.deptsCount} Department(s)</span>
                  </div>
                )}
                {Boolean(details.employeesCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.employeesCount} Custodian(s)</span>
                  </div>
                )}
                {Boolean(details.assignmentsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.assignmentsCount} Assignment(s)</span>
                  </div>
                )}
                {Boolean(details.modelCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.modelCount} Model(s)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-900 leading-normal">
            Choose how you would like to proceed:
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDeactivate}
            disabled={isProcessing}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Keeps audit history safe and marks this item inactive"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Deactivate Only</span>
          </button>

          <button
            type="button"
            onClick={onForceDelete}
            disabled={isProcessing}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unlinks all assets and permanently removes this record from the database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Force Delete (Unlink & Delete)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

