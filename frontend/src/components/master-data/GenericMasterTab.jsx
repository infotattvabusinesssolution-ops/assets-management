import React from 'react';
import { FolderTree } from 'lucide-react';

export function GenericMasterTab({ activeTab, tabName, onResetToDefault }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto border border-purple-100">
        <FolderTree className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">
        {tabName || activeTab} Workbench
      </h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Manage your corporate {activeTab} definitions, parameters, and structural mappings.
      </p>
      {onResetToDefault && (
        <button
          onClick={onResetToDefault}
          className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold hover:bg-[#5B21B6] transition-colors cursor-pointer shadow-sm"
        >
          ← Back to Asset Groups
        </button>
      )}
    </div>
  );
}
