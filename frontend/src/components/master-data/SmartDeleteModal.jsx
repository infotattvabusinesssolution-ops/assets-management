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
              <h3 className="text-base font-bold text-slate-800">Deletion Blocked: Linked Records Found</h3>
              <p className="text-xs text-amber-700/90 font-medium">Child records must be removed or reassigned first</p>
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
            <span className="font-semibold text-slate-800">{entityName} "{itemName}"</span> {itemCode ? `(${itemCode})` : ''} cannot be erased because{' '}
            <strong className="text-amber-700 font-bold">{linkedCount} {linkedCount === 1 ? 'child record is' : 'child records are'}</strong> currently assigned underneath it in the hierarchy.
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
                    <span>{details.assetsCount} {details.assetsCount === 1 ? 'Asset' : 'Assets'}</span>
                  </div>
                )}
                {Boolean(details.receiptsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.receiptsCount} {details.receiptsCount === 1 ? 'Receipt' : 'Receipts'}</span>
                  </div>
                )}
                {Boolean(details.buildingsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.buildingsCount} {details.buildingsCount === 1 ? 'Building' : 'Buildings'}</span>
                  </div>
                )}
                {Boolean(details.costCentersCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.costCentersCount} {details.costCentersCount === 1 ? 'Section' : 'Sections'}</span>
                  </div>
                )}
                {Boolean(details.usersCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.usersCount} {details.usersCount === 1 ? 'User' : 'Users'}</span>
                  </div>
                )}
                {Boolean(details.sitesCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.sitesCount} {details.sitesCount === 1 ? 'Location' : 'Locations'}</span>
                  </div>
                )}
                {Boolean(details.childCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.childCount} {details.childCount === 1 ? 'Sub-location' : 'Sub-locations'}</span>
                  </div>
                )}
                {Boolean(details.deptsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.deptsCount} {details.deptsCount === 1 ? 'Department' : 'Departments'}</span>
                  </div>
                )}
                {Boolean(details.employeesCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.employeesCount} {details.employeesCount === 1 ? 'Custodian' : 'Custodians'}</span>
                  </div>
                )}
                {Boolean(details.assignmentsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.assignmentsCount} {details.assignmentsCount === 1 ? 'Assignment' : 'Assignments'}</span>
                  </div>
                )}
                {Boolean(details.modelCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.modelCount} {details.modelCount === 1 ? 'Model' : 'Models'}</span>
                  </div>
                )}
                {Boolean(details.subGroupsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.subGroupsCount} {details.subGroupsCount === 1 ? 'Sub Group' : 'Sub Groups'}</span>
                  </div>
                )}
                {Boolean(details.categoriesCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.categoriesCount} {details.categoriesCount === 1 ? 'Category' : 'Categories'}</span>
                  </div>
                )}
                {Boolean(details.subCatsCount || details.classCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>
                      {(details.subCatsCount || details.classCount)}{' '}
                      {(details.subCatsCount || details.classCount) === 1 ? 'Sub Category' : 'Sub Categories'}
                    </span>
                  </div>
                )}
                {Boolean(details.itemsCount) && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{details.itemsCount} {details.itemsCount === 1 ? 'Item Master' : 'Item Masters'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-900 leading-normal">
            To delete this record, you must first delete or reassign all linked child records above. Alternatively, you can <strong>Deactivate</strong> it to prevent new assignments while preserving database integrity.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDeactivate}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Keeps audit history safe and marks this item inactive"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Deactivate Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}

