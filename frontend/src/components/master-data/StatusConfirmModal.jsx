import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Power, PowerOff, RefreshCw } from 'lucide-react';

/**
 * Standard Status Confirmation Modal (Image 1 Style)
 * Centered confirmation card for Activating or Deactivating master records.
 */
export function StatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entityName = 'Record',
  itemName = '',
  itemCode = '',
  nextStatus,
  currentStatus,
  warningNote = '',
  isLoading = false
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Determine whether this action is a deactivation or activation
  const isDeactivating = nextStatus
    ? String(nextStatus).toLowerCase() === 'inactive' || nextStatus === false
    : currentStatus
    ? String(currentStatus).toLowerCase() === 'active' || currentStatus === true
    : true;

  const actionVerb = isDeactivating ? 'Deactivate' : 'Activate';
  const displayTitle = `${actionVerb} ${entityName}?`;
  const displayName = itemName || 'this record';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={() => { if (!isLoading) onClose?.(); }}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning / Success Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border mx-auto ${
            isDeactivating
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}
        >
          {isDeactivating ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
        </div>

        {/* Text Details */}
        <div className="text-center">
          <h3 className="font-bold text-slate-900 text-sm">{displayTitle}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to {actionVerb.toLowerCase()}{' '}
            <span className="font-bold text-slate-800">{displayName}</span>
            {itemCode ? ` (${itemCode})` : ''}?
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            {isDeactivating
              ? 'This record will be marked as Inactive and will be unavailable for new asset assignments.'
              : 'This record will be marked as Active and restored for asset assignments.'}
          </p>
          {warningNote && isDeactivating && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-800 text-[11px] text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{warningNote}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDeactivating
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isDeactivating ? (
              <PowerOff className="w-3.5 h-3.5" />
            ) : (
              <Power className="w-3.5 h-3.5" />
            )}
            <span>
              {isLoading
                ? `${isDeactivating ? 'Deactivating' : 'Activating'}...`
                : `Confirm ${actionVerb}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusConfirmModal;

