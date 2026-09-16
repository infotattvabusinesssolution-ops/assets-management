import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';

export function ReportsTab({ onShowToast }) {
  return (
    <div className="space-y-4 text-xs">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Total Inventory Valuation</p>
          <p className="text-xl font-extrabold text-slate-900 font-mono">245,630.00 AED</p>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" /> +4.2% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Fast Moving Items (Class A)</p>
          <p className="text-xl font-extrabold text-blue-600 font-mono">184 Items</p>
          <p className="text-[10px] text-slate-500 font-medium">Contributes 70% of total issues</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Annual Inventory Turn Rate</p>
          <p className="text-xl font-extrabold text-emerald-600 font-mono">4.8 Turns / Year</p>
          <p className="text-[10px] text-slate-500 font-medium">Optimal turnover index</p>
        </div>
      </div>

      {/* Available Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Spare Parts Analytical Reports & Valuation Catalog
            </h2>
            <p className="text-[11px] text-slate-500">
              Generate and download detailed inventory analysis reports in Excel/PDF.
            </p>
          </div>

          <button 
            onClick={() => onShowToast('Generating executive inventory summary...')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Download All Reports
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'Inventory Valuation Statement', desc: 'Current stock balance multiplied by unit cost per category and storage bin.', type: 'Financial' },
            { title: 'ABC Inventory Classification', desc: 'Classification of items by value and consumption rate (Class A, B, C).', type: 'Analytical' },
            { title: 'Slow Moving & Dead Stock Audit', desc: 'Items with zero movement in the last 180 days for write-off assessment.', type: 'Audit' },
            { title: 'Supplier SLA & Lead Time Variance', desc: 'Promised vs actual delivery lead times by vendor.', type: 'Vendor' }
          ].map(rep => (
            <div key={rep.title} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold">
                  {rep.type}
                </span>
                <h3 className="font-bold text-slate-900 text-xs mt-1">{rep.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{rep.desc}</p>
              </div>

              <button
                onClick={() => onShowToast(`Downloading ${rep.title}...`)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ml-3"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Export
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
