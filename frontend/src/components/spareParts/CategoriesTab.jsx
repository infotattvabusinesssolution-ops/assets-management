import React from 'react';
import { Layers, Wrench, ShieldCheck, Cpu } from 'lucide-react';

export function CategoriesTab({ onShowToast }) {
  const categoriesList = [
    { name: 'HVAC', totalItems: 420, inStock: 350, lowStock: 50, outOfStock: 20, totalVal: '98,400.00 AED', reorderPolicy: 'Automatic PR at 20%' },
    { name: 'Electrical', totalItems: 310, inStock: 220, lowStock: 70, outOfStock: 20, totalVal: '72,150.00 AED', reorderPolicy: 'Automatic PR at 15%' },
    { name: 'Plumbing', totalItems: 180, inStock: 140, lowStock: 30, outOfStock: 10, totalVal: '28,900.00 AED', reorderPolicy: 'Manual Review' },
    { name: 'Fire & Safety', totalItems: 150, inStock: 120, lowStock: 25, outOfStock: 5, totalVal: '31,500.00 AED', reorderPolicy: 'Safety Critical (Immediate)' },
    { name: 'Generators', totalItems: 98, inStock: 80, lowStock: 15, outOfStock: 3, totalVal: '14,680.00 AED', reorderPolicy: 'PM entitlement auto-reserve' }
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Spare Part Categories & Safety Stock Thresholds
          </h2>
          <p className="text-[11px] text-slate-500">
            Category classification matrix, safety level thresholds, and automatic PR trigger policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map(cat => (
            <div key={cat.name} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-bold flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                  {cat.totalItems} Items
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                  <p className="text-[10px] text-emerald-700 font-semibold">In Stock</p>
                  <p className="text-sm font-bold text-emerald-900">{cat.inStock}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                  <p className="text-[10px] text-amber-700 font-semibold">Low Stock</p>
                  <p className="text-sm font-bold text-amber-900">{cat.lowStock}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                  <p className="text-[10px] text-red-700 font-semibold">Out Stock</p>
                  <p className="text-sm font-bold text-red-900">{cat.outOfStock}</p>
                </div>
              </div>

              <div className="text-[11px] space-y-1 text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valuation:</span>
                  <span className="font-extrabold text-slate-900">{cat.totalVal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reorder Policy:</span>
                  <span className="font-semibold text-blue-600">{cat.reorderPolicy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
