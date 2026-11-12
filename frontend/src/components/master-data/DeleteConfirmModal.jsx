import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

/**
 * Standard Delete Confirmation Modal (Image 1 Style)
 * Centered destructive confirmation card with soft-red warning icon and trash button.
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entityName = 'Record',
  itemName = '',
  itemCode = '',
  title,
  description,
  confirmLabel = 'Confirm Delete',
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

  const displayTitle = title || `Delete ${entityName}?`;
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
        {/* Top Warning Icon */}
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mx-auto">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>

        {/* Text Details */}
        <div className="text-center">
          <h3 className="font-bold text-slate-900 text-sm">{displayTitle}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete <span className="font-bold text-slate-800">{displayName}</span>
            {itemCode ? ` (${itemCode})` : ''}?
          </p>
          {description && (
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </p>
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
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Deleting...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;

