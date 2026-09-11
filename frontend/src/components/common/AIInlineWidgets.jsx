import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Laptop,
  CheckCircle2,
  User,
  Box,
  Share2,
  Layers,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  BarChart3,
  Clock,
  ArrowDown,
  Paperclip,
  FileCheck,
  History,
  Trash2,
  ClipboardCheck,
  Package,
  Info
} from 'lucide-react';

export function AIInlineWidgets({ widgetType, apiData, onNavigate }) {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = (type) => {
    setFeedback(type);
  };

  const handleExportCSV = (dataRows, filename) => {
    const headers = ['Asset Name', 'Barcode', 'Location', 'Status'];
    const csvContent = '\uFEFF' + [headers.join(','), ...dataRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  switch (widgetType) {
    // -------------------------------------------------------------
    // WIDGET 1: ASSET LOCATION WITH FLOOR MAP (Barcode Query)
    // -------------------------------------------------------------
    case 'ASSET_LOCATION':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* Location Header Banner Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MapPin className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  Building A – 2nd Floor
                </h4>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Finance Department
                </p>
                <p className="text-xs font-bold text-purple-700 mt-0.5">
                  Room 204
                </p>
              </div>
            </div>

            {/* Building Illustration Schematic Box */}
            <div className="w-24 sm:w-28 h-18 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0">
              <Building2 className="w-12 h-12 text-purple-500/80 opacity-80" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* Key-Value Asset Attributes */}
          <div className="space-y-2.5 text-xs font-medium bg-slate-50 p-4 sm:px-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center py-1 border-b border-slate-200 gap-4">
              <span className="text-slate-600 font-semibold shrink-0">Asset Name</span>
              <span className="font-extrabold text-slate-900 text-right truncate">: Dell Latitude 5420</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 gap-4">
              <span className="text-slate-600 font-semibold shrink-0">Asset Category</span>
              <span className="font-extrabold text-slate-900 text-right truncate">: Laptop</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 gap-4">
              <span className="text-slate-600 font-semibold shrink-0">Status</span>
              <span className="font-extrabold text-emerald-700 text-right shrink-0">
                : In Use
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 gap-4">
              <span className="text-slate-600 font-semibold shrink-0">Assigned To</span>
              <span className="font-extrabold text-slate-900 text-right truncate">: Sarah Johnson</span>
            </div>
            <div className="flex justify-between items-center py-1 gap-4">
              <span className="text-slate-600 font-semibold shrink-0">Last Updated</span>
              <span className="font-extrabold text-slate-800 text-right shrink-0">: Today, 10:28 AM</span>
            </div>
          </div>

          {/* Interactive Floor Map Schematic Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="h-36 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:10px_10px] opacity-40" />
              
              {/* Mock Floorplan Rooms */}
              <div className="absolute top-3 left-4 w-18 h-12 border border-slate-300 bg-white/90 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-xs">
                Room 201
              </div>
              <div className="absolute top-3 left-26 w-18 h-12 border border-slate-300 bg-white/90 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-xs">
                Room 202
              </div>

              {/* Pinpoint Highlight Box */}
              <div className="absolute bottom-3 right-4 w-32 h-14 border-2 border-purple-600 bg-purple-50 rounded-xl flex items-center justify-center text-xs font-black text-purple-900 shadow-md gap-1">
                <MapPin className="w-5 h-5 text-purple-600 animate-bounce fill-purple-600" />
                <span>Room 204</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('/maps')}
              className="w-full text-xs font-extrabold text-purple-700 hover:underline flex items-center justify-between pt-1 cursor-pointer"
            >
              <span>View on Floor Map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'up' ? 'text-emerald-600' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'down' ? 'text-rose-600' : ''
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 2: INVENTORY AVAILABLE LAPTOPS TABLE
    // -------------------------------------------------------------
    case 'INVENTORY_AVAILABLE': {
      const recordsList = Array.isArray(apiData)
        ? apiData
        : (apiData?.records || []);

      const displayRows = recordsList.length > 0
        ? recordsList.map(a => ({
            name: a.description || a.name || 'Laptop Asset',
            code: a.barcode || a.tagNumber || a.assetId || 'N/A',
            loc: [a.site?.name, a.building?.name, a.room?.name].filter(Boolean).join(' - ') || 'Main Site',
            status: a.lifecycleStatus || 'Available'
          }))
        : [
            { name: 'Dell Latitude 5440', code: 'LAP10023', loc: 'Bldg A – 3rd Floor', status: 'Available' },
            { name: 'HP EliteBook 840', code: 'LAP10026', loc: 'Bldg B – 2nd Floor', status: 'Available' },
            { name: 'Lenovo ThinkPad E14', code: 'LAP10031', loc: 'Bldg A – 1st Floor', status: 'Available' },
            { name: 'Dell Latitude 5430', code: 'LAP10037', loc: 'Bldg C – 2nd Floor', status: 'Available' },
            { name: 'HP ProBook 450', code: 'LAP10042', loc: 'Bldg A – 4th Floor', status: 'Available' }
          ];

      const count = recordsList.length > 0 ? recordsList.length : (apiData?.recordsCount || displayRows.length);

      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* Centered Pill Badge Header */}
          <div className="flex justify-center">
            <div className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs sm:text-sm font-black text-slate-950 flex items-center justify-center gap-2 shadow-sm">
              <span>Total Available Laptops:</span>
              <span className="text-emerald-700 text-sm sm:text-base font-black">{count}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Laptop Inventory Data Table */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold text-xs tracking-tight text-slate-900 border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Asset Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Barcode</th>
                  <th className="px-4 py-3 whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-black text-slate-950 text-xs sm:text-sm whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-purple-700 font-black text-xs whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800 text-xs whitespace-nowrap">
                      {row.loc}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-xs whitespace-nowrap">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Link & Export Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              onClick={() => onNavigate && onNavigate('/assets')}
              className="text-xs font-black text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View more</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                handleExportCSV(
                  displayRows.map(r => [r.name, r.code, r.loc, r.status]),
                  'Available_Laptops_Report.csv'
                )
              }
              className="text-xs font-black text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'up' ? 'text-emerald-600' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'down' ? 'text-rose-600' : ''
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // WIDGET 3: BUILDING EQUIPMENT BREAKDOWN (Building A Query)
    // -------------------------------------------------------------
    case 'BUILDING_EQUIPMENT':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* 3 Top Stat Counters Grid matching mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stat 1: Total Assets */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-700">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600">
                  <Box className="w-4 h-4" />
                </div>
                <span className="truncate">Total Assets</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 pl-0.5">256</div>
            </div>

            {/* Stat 2: In Use */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-700">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="truncate">In Use</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 pl-0.5">198</div>
            </div>

            {/* Stat 3: Available */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-700">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="truncate">Available</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-600 pl-0.5">58</div>
            </div>
          </div>

          {/* Category Breakdown Table matching mockup */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold text-xs text-slate-950 border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">In Use</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Available</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { cat: 'IT Equipment', inUse: 120, avail: 18, total: 138 },
                  { cat: 'Office Equipment', inUse: 45, avail: 10, total: 55 },
                  { cat: 'Furniture', inUse: 22, avail: 6, total: 28 },
                  { cat: 'Lab Equipment', inUse: 11, avail: 4, total: 15 },
                  { cat: 'Others', inUse: 0, avail: 0, total: 20 }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-950 whitespace-nowrap">
                      {row.cat}
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-slate-900 whitespace-nowrap">
                      {row.inUse}
                    </td>
                    <td className="px-4 py-3 text-center font-black text-emerald-700 whitespace-nowrap">
                      {row.avail}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-950 whitespace-nowrap">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Building A Location Summary Box matching mockup */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600 fill-purple-600" />
              <h5 className="text-xs font-black text-slate-950">Building A Location Summary</h5>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h6 className="text-xs font-black text-slate-950">Building A</h6>
                <p className="text-xs text-slate-700 font-extrabold">4 Floors • 32 Rooms</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('/maps')}
              className="text-xs font-black text-purple-700 hover:text-purple-900 hover:underline flex items-center justify-between pt-1 w-full cursor-pointer"
            >
              <span>View Floor Map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'up' ? 'text-emerald-600' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'down' ? 'text-rose-600' : ''
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 4: CUSTODIAN ASSIGNMENT (Bader Al Kaabi)
    // -------------------------------------------------------------
    case 'CUSTODIAN_ASSIGNMENT':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* Custodian Summary Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-950">Bader Al Kaabi</h4>
                <p className="text-xs text-slate-700 font-extrabold">IT Operations • ID: EMP-9042</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black rounded-lg">
              5 Assets Assigned
            </div>
          </div>

          {/* Custodian Assets Table */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold uppercase text-xs tracking-wider text-slate-950 border-b border-slate-300">
                <tr>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Asset Name</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Barcode</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Category</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: 'Dell Latitude 5420', code: 'LAP10023', cat: 'Laptop', status: 'In Use' },
                  { name: 'Dell 27" 4K Monitor', code: 'MON10088', cat: 'Monitor', status: 'In Use' },
                  { name: 'Apple iPad Pro 12.9"', code: 'TAB10015', cat: 'Tablet', status: 'In Use' },
                  { name: 'Jabra Evolve2 65', code: 'AUD10044', cat: 'Headset', status: 'In Use' },
                  { name: 'Logitech MX Master 3S', code: 'ACC10091', cat: 'Accessory', status: 'In Use' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 font-black text-slate-950 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-purple-700 font-black whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">
                      {row.cat}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-black text-emerald-700 whitespace-nowrap">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigate && onNavigate('/custodians')}
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Custodian Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'up' ? 'text-emerald-600' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  feedback === 'down' ? 'text-rose-600' : ''
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 5: FINANCIAL — TOTAL VALUE OF EQUIPMENT
    // -------------------------------------------------------------
    case 'FINANCIAL_VALUE':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* Total Value Headline */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Total Value</p>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">AED 2,845,360</h4>
            </div>
          </div>

          {/* Breakdown by Category Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Breakdown by Category
            </h5>
            <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead className="bg-slate-100 font-extrabold text-xs text-slate-950 border-b border-slate-300">
                  <tr>
                    <th className="px-4 py-2.5 whitespace-nowrap">Category</th>
                    <th className="px-4 py-2.5 text-right whitespace-nowrap">Total Value (AED)</th>
                    <th className="px-4 py-2.5 text-right whitespace-nowrap">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { cat: 'Laptops', val: 'AED 1,245,600', pct: '43.8%' },
                    { cat: 'Desktops', val: 'AED 663,200', pct: '23.3%' },
                    { cat: 'Monitors', val: 'AED 312,450', pct: '11.0%' },
                    { cat: 'Servers', val: 'AED 420,600', pct: '14.8%' },
                    { cat: 'Network Equipment', val: 'AED 103,510', pct: '3.6%' },
                    { cat: 'Others', val: 'AED 100,000', pct: '3.5%' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.cat}</td>
                      <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 whitespace-nowrap">{row.val}</td>
                      <td className="px-4 py-2.5 text-right font-black text-purple-700 whitespace-nowrap">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IT Equipment Summary Stats */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h5 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-slate-700" />
              IT Equipment Summary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-slate-700 font-extrabold">Total Assets</p>
                  <p className="text-sm font-black text-slate-950">342</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-slate-700 font-extrabold">In Use</p>
                  <p className="text-sm font-black text-slate-950">289</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-slate-700 font-extrabold">Available</p>
                  <p className="text-sm font-black text-emerald-700">53</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 6: FINANCIAL — ASSETS PURCHASED IN 2024
    // -------------------------------------------------------------
    case 'FINANCIAL_PURCHASED':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* 3 Stat Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600"><Layers className="w-3.5 h-3.5" /></div>
                <span>Total Assets</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">342</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-600"><DollarSign className="w-3.5 h-3.5" /></div>
                <span>Total Value (AED)</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">AED 1,245,780</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600"><TrendingUp className="w-3.5 h-3.5" /></div>
                <span>Average Value (AED)</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">AED 3,645</div>
            </div>
          </div>

          {/* Purchased Assets Table */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold text-xs text-slate-950 border-b border-slate-300">
                <tr>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Asset Name</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Barcode</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Category</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Purchase Date</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Value (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: 'Dell Latitude 5440', code: 'LAP10030', cat: 'Laptop', date: '15 Jan 2024', val: '5,600' },
                  { name: 'HP EliteBook 850', code: 'LAP10050', cat: 'Laptop', date: '20 Feb 2024', val: '6,200' },
                  { name: 'Lenovo ThinkPad E14', code: 'LAP10031', cat: 'Laptop', date: '05 Mar 2024', val: '4,950' },
                  { name: 'HP LaserJet Pro', code: 'PRN10006', cat: 'Printer', date: '12 Mar 2024', val: '1,250' },
                  { name: 'Cisco Switch 24P', code: 'NET10039', cat: 'Network', date: '18 Apr 2024', val: '2,800' },
                  { name: 'Samsung 55" TV', code: 'DISP10003', cat: 'Display', date: '22 Apr 2024', val: '2,400' },
                  { name: 'APC UPS 1500VA', code: 'POW10012', cat: 'Power', date: '10 May 2024', val: '1,150' },
                  { name: 'Logitech Webcam', code: 'ACC10045', cat: 'Accessory', date: '14 Jun 2024', val: '350' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.name}</td>
                    <td className="px-3.5 py-2.5 font-mono text-purple-700 font-black whitespace-nowrap">{row.code}</td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.cat}</td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.date}</td>
                    <td className="px-3.5 py-2.5 text-right font-black text-slate-950 whitespace-nowrap">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View All Link */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigate && onNavigate('/assets')}
              className="text-xs font-extrabold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all 342 assets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 7: FINANCIAL — ASSETS FULLY DEPRECIATING THIS YEAR
    // -------------------------------------------------------------
    case 'FINANCIAL_DEPRECIATION':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* 2 Stat Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Total Assets</p>
                <p className="text-lg font-black text-slate-900">28</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold">Total Value</p>
                <p className="text-lg font-black text-slate-900">AED 312,450</p>
              </div>
            </div>
          </div>

          {/* Depreciating Assets Table */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold text-xs text-slate-950 border-b border-slate-300">
                <tr>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Asset Name</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Barcode</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Category</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Purchase Date</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Original Value (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: 'Dell OptiPlex 3020', code: 'SYS10012', cat: 'Desktop', date: '16 Feb 2020', val: '8,500' },
                  { name: 'HP ProBook 440', code: 'SYS10016', cat: 'Desktop', date: '10 Mar 2020', val: '7,800' },
                  { name: 'Canon ImageRUNNER 3030', code: 'PRN10007', cat: 'Printer', date: '05 Apr 2020', val: '6,400' },
                  { name: 'Cisco WS-C2960', code: 'NET10005', cat: 'Network', date: '18 May 2020', val: '12,300' },
                  { name: 'Lenovo ThinkPad T480', code: 'LAP10022', cat: 'Laptop', date: '22 Jun 2020', val: '9,600' },
                  { name: 'HP Monitor 24"', code: 'MON10022', cat: 'Monitor', date: '30 Jul 2020', val: '1,200' },
                  { name: 'Logitech Keyboard K120', code: 'KEY10020', cat: 'Accessory', date: '12 Aug 2020', val: '150' },
                  { name: 'Dell Docking Station', code: 'DOC10008', cat: 'Accessory', date: '25 Aug 2020', val: '500' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.name}</td>
                    <td className="px-3.5 py-2.5 font-mono text-purple-700 font-black whitespace-nowrap">{row.code}</td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.cat}</td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.date}</td>
                    <td className="px-3.5 py-2.5 text-right font-black text-slate-950 whitespace-nowrap">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* More assets note */}
          <p className="text-xs text-slate-700 font-extrabold italic">...and 19 more assets</p>

          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-900 leading-relaxed">
              These assets have reached the end of their useful life and will have 0 residual value after depreciation.
            </p>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 8: AUDIT — MOVEMENT HISTORY (Projector)
    // -------------------------------------------------------------
    case 'AUDIT_MOVEMENT':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* Asset Identity Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-black text-slate-950">
              Projector <span className="text-slate-700 font-extrabold">(Barcode: PRJ10009)</span>
            </h4>
            <p className="text-xs text-slate-800 font-extrabold">Model: Epson EB-2250U</p>
            <p className="text-xs font-black text-emerald-700">Status: In Use</p>
          </div>

          {/* Last Moved Timestamp Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-amber-900">Last Moved: 18 May 2025, 11:24 AM</span>
          </div>

          {/* From / To Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-700 font-extrabold uppercase tracking-wider">From</p>
                <p className="text-xs font-black text-slate-950">Building A – Room 301</p>
                <p className="text-xs text-slate-700 font-extrabold">(Training Room)</p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-500" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-700 font-extrabold uppercase tracking-wider">To</p>
                <p className="text-xs font-black text-slate-950">Building C – Room 202</p>
                <p className="text-xs text-slate-700 font-extrabold">(Conference Room)</p>
              </div>
            </div>
          </div>

          {/* Movement History Table (Last 5) */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-600" />
              Movement History (Last 5)
            </h5>
            <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead className="bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2.5 whitespace-nowrap">Date & Time</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">Moved By</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">From</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">To</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { date: '18 May 2025, 11:24 AM', by: 'David Lee', from: 'Bldg A – Room 301', to: 'Bldg C – Room 202', reason: 'Room reallocation' },
                    { date: '02 Apr 2025, 09:10 AM', by: 'Sarah Johnson', from: 'Bldg C – Room 102', to: 'Bldg A – Room 301', reason: 'Event setup' },
                    { date: '10 Jan 2025, 02:45 PM', by: 'Michael Brown', from: 'Bldg B – Room 204', to: 'Bldg C – Room 102', reason: 'Training session' },
                    { date: '05 Sep 2024, 10:05 AM', by: 'John Smith', from: 'Bldg B – Room 101', to: 'Bldg B – Room 204', reason: 'Internal transfer' },
                    { date: '17 Jun 2024, 03:30 PM', by: 'System', from: '–', to: 'Bldg B – Room 101', reason: 'Initial allocation' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-extrabold text-slate-950 whitespace-nowrap text-xs">{row.date}</td>
                      <td className="px-3 py-2.5 font-black text-slate-950 whitespace-nowrap text-xs">{row.by}</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-800 whitespace-nowrap text-xs">{row.from}</td>
                      <td className="px-3.5 py-2.5 font-extrabold text-slate-800 whitespace-nowrap text-xs">{row.to}</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-900 whitespace-nowrap text-xs">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 9: AUDIT — DISPOSAL HISTORY (Department 5)
    // -------------------------------------------------------------
    case 'AUDIT_DISPOSAL':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* 3 Stat Pill Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-rose-500/10 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></div>
                <span>Total Disposed</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">12</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600"><Calendar className="w-3.5 h-3.5" /></div>
                <span>This Year (2025)</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">4</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600"><DollarSign className="w-3.5 h-3.5" /></div>
                <span>Total Value (AED)</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">45,230</div>
            </div>
          </div>

          {/* Disposal Records Table */}
          <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead className="bg-slate-100 font-extrabold text-xs text-slate-950 border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2.5 whitespace-nowrap">Asset Name</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Barcode</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Category</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Disposal Date</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Reason</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Disposal Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: 'HP LaserJet 4250', code: 'PRN10012', cat: 'Printer', date: '10 Apr 2025', reason: 'End of Life', type: 'Scrapped' },
                  { name: 'Dell OptiPlex 3020', code: 'SYS10095', cat: 'Desktop', date: '22 Mar 2025', reason: 'Obsolete', type: 'Scrapped' },
                  { name: 'Canon ImageRUNNER 2525', code: 'PRN10029', cat: 'Printer', date: '05 Mar 2025', reason: 'End of Life', type: 'Scrapped' },
                  { name: 'Cisco WS-C2960', code: 'NET10007', cat: 'Network', date: '18 Feb 2025', reason: 'Upgrade', type: 'Replaced' },
                  { name: 'Samsung 55" TV', code: 'DISP10003', cat: 'Display', date: '30 Jan 2025', reason: 'Damaged', type: 'Scrapped' },
                  { name: 'HP EliteBook 840', code: 'LAP10026', cat: 'Laptop', date: '15 Jan 2025', reason: 'End of Life', type: 'Scrapped' },
                  { name: 'APC UPS 1500VA', code: 'POW10012', cat: 'Power', date: '28 Dec 2024', reason: 'End of Life', type: 'Scrapped' },
                  { name: 'Logitech Camera', code: 'ACC10031', cat: 'Accessory', date: '20 Dec 2024', reason: 'Obsolete', type: 'Scrapped' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.name}</td>
                    <td className="px-3 py-2.5 font-mono text-purple-700 font-black whitespace-nowrap">{row.code}</td>
                    <td className="px-3 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.cat}</td>
                    <td className="px-3 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.reason}</td>
                    <td className="px-3 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View All Link */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigate && onNavigate('/assets')}
              className="text-xs font-extrabold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all 12 records</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 10: AUDIT — DISPOSAL APPROVAL WORKFLOW
    // -------------------------------------------------------------
    case 'AUDIT_APPROVAL':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* Asset Details Header */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-900">Asset: HP LaserJet 4250</h4>
                <p className="text-[11px] text-slate-600 font-semibold">Barcode: PRN10012</p>
                <p className="text-[11px] text-slate-600 font-semibold">Department: 5</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[11px] text-slate-600 font-semibold">Disposal Date: 10 Apr 2025</p>
                <p className="text-[11px] text-rose-600 font-bold">Disposal Type: Scrapped</p>
                <p className="text-[11px] text-slate-500 font-semibold">Reason: End of Life</p>
              </div>
            </div>
          </div>

          {/* Approval Workflow Timeline */}
          <div className="space-y-1">
            <h5 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mb-3">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
              Approval Workflow
            </h5>

            {/* Step 1: Requested By */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-300 shrink-0" />
                <div className="w-0.5 flex-1 bg-slate-200" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-amber-700">Requested By</p>
                  <span className="text-[10px] text-slate-500 font-semibold">05 Apr 2025, 09:15 AM</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-0.5">Ahmed Khan (IT Technician)</p>
                <p className="text-[11px] text-slate-500">Change Request ID: CR-2025-0456</p>
              </div>
            </div>

            {/* Step 2: Reviewed By */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-300 shrink-0" />
                <div className="w-0.5 flex-1 bg-slate-200" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-blue-700">Reviewed By</p>
                  <span className="text-[10px] text-slate-500 font-semibold">07 Apr 2025, 10:20 AM</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-0.5">Michael Brown (IT Manager)</p>
                <p className="text-[11px] text-slate-500">Comments: Asset is end of life and not cost-effective to maintain.</p>
              </div>
            </div>

            {/* Step 3: Approved By */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-300 shrink-0" />
                <div className="w-0.5 flex-1 bg-slate-200" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-emerald-700">Approved By</p>
                  <span className="text-[10px] text-slate-500 font-semibold">09 Apr 2025, 02:45 PM</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-0.5">Bader Al Kaabi (Head of Department 5)</p>
                <p className="text-[11px] text-slate-500">Comments: Approved for disposal.</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md border border-emerald-200">Approved</span>
              </div>
            </div>

            {/* Step 4: Disposed By */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-400 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-slate-700">Disposed By</p>
                  <span className="text-[10px] text-slate-500 font-semibold">10 Apr 2025, 11:30 AM</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-0.5">Warehouse Team</p>
                <p className="text-[11px] text-slate-500">Disposal Reference: DISP-2025-078</p>
              </div>
            </div>
          </div>

          {/* Attachment Link */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <Paperclip className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold text-purple-700 hover:underline">Attachment: Disposal Certificate</span>
            <ArrowDown className="w-3.5 h-3.5 text-purple-700 ml-auto" />
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-semibold text-[11px]">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 11: ANALYTICS — ASSET DISTRIBUTION ACROSS DEPARTMENTS
    // -------------------------------------------------------------
    case 'ANALYTICS_DISTRIBUTION':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-900 animate-in fade-in duration-300">
          {/* 4 Stat Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                <div className="p-0.5 rounded bg-amber-500/10 text-amber-600"><Building2 className="w-3 h-3" /></div>
                <span>Total Departments</span>
              </div>
              <div className="text-base font-black text-slate-900 pl-0.5">18</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                <div className="p-0.5 rounded bg-blue-500/10 text-blue-600"><Layers className="w-3 h-3" /></div>
                <span>Total Assets</span>
              </div>
              <div className="text-base font-black text-slate-900 pl-0.5">4,892</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                <div className="p-0.5 rounded bg-emerald-500/10 text-emerald-600"><Share2 className="w-3 h-3" /></div>
                <span>In Use</span>
              </div>
              <div className="text-base font-black text-slate-900 pl-0.5">4,102 <span className="text-[10px] text-slate-500 font-bold">(83.8%)</span></div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                <div className="p-0.5 rounded bg-violet-500/10 text-violet-600"><CheckCircle2 className="w-3 h-3" /></div>
                <span>Available</span>
              </div>
              <div className="text-base font-black text-emerald-700 pl-0.5">790 <span className="text-[10px] text-slate-500 font-bold">(16.2%)</span></div>
            </div>
          </div>

          {/* Assets by Department Table with Progress Bars */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-950">Assets by Department</h5>
            <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead className="bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2.5 whitespace-nowrap">Department</th>
                    <th className="px-3 py-2.5 whitespace-nowrap"></th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">Total Assets</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">In Use</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">Available</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { dept: 'IT', total: 1245, inUse: 1080, avail: 165, pct: 25.5, color: 'bg-amber-500' },
                    { dept: 'Finance', total: 982, inUse: 842, avail: 140, pct: 20.1, color: 'bg-blue-500' },
                    { dept: 'Operations', total: 876, inUse: 742, avail: 134, pct: 17.9, color: 'bg-emerald-500' },
                    { dept: 'HR', total: 532, inUse: 450, avail: 82, pct: 10.9, color: 'bg-violet-500' },
                    { dept: 'Marketing', total: 418, inUse: 360, avail: 58, pct: 8.5, color: 'bg-rose-500' },
                    { dept: 'Admin', total: 387, inUse: 312, avail: 75, pct: 7.9, color: 'bg-cyan-500' },
                    { dept: 'Facilities', total: 265, inUse: 210, avail: 55, pct: 5.4, color: 'bg-orange-500' },
                    { dept: 'Legal', total: 115, inUse: 84, avail: 31, pct: 2.4, color: 'bg-pink-500' },
                    { dept: 'R&D', total: 70, inUse: 20, avail: 50, pct: 1.4, color: 'bg-indigo-500' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-black text-slate-950 whitespace-nowrap text-xs">{row.dept}</td>
                      <td className="px-3 py-2.5 w-24">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct * 3.9}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-slate-950 whitespace-nowrap text-xs">{row.total.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-slate-800 whitespace-nowrap text-xs">{row.inUse.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-black text-emerald-700 whitespace-nowrap text-xs">{row.avail}</td>
                      <td className="px-3 py-2.5 text-right font-black text-purple-700 whitespace-nowrap text-xs">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs font-bold text-blue-900">IT holds the highest number of assets (25.5%).</p>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 12: ANALYTICS — TOP CUSTODIANS BY EQUIPMENT
    // -------------------------------------------------------------
    case 'ANALYTICS_CUSTODIAN':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* 3 Stat Pill Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-amber-500/10 text-amber-600"><User className="w-3.5 h-3.5" /></div>
                <span>Total Custodians</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">56</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600"><Layers className="w-3.5 h-3.5" /></div>
                <span>Total Assets</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">4,892</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-600"><Share2 className="w-3.5 h-3.5" /></div>
                <span>Average Assets per Custodian</span>
              </div>
              <div className="text-lg font-black text-slate-950 pl-0.5">87</div>
            </div>
          </div>

          {/* Top Custodians Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-950">Top Custodians by Number of Assets</h5>
            <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead className="bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2.5 whitespace-nowrap">Custodian</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">Department</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">Total Assets</th>
                    <th className="px-3 py-2.5 text-right whitespace-nowrap">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { name: 'Bader Al Kaabi', dept: 'IT', total: 523, pct: '10.7%' },
                    { name: 'Ahmed Khan', dept: 'Operations', total: 487, pct: '10.0%' },
                    { name: 'Sarah Johnson', dept: 'Finance', total: 421, pct: '8.6%' },
                    { name: 'Michael Brown', dept: 'IT', total: 398, pct: '8.1%' },
                    { name: 'David Lee', dept: 'Operations', total: 356, pct: '7.3%' },
                    { name: 'Fatima Zahra', dept: 'HR', total: 298, pct: '6.1%' },
                    { name: 'James Wilson', dept: 'Facilities', total: 276, pct: '5.6%' },
                    { name: 'Priya Nair', dept: 'Finance', total: 265, pct: '5.4%' },
                    { name: 'Omar Hassan', dept: 'Admin', total: 241, pct: '4.9%' },
                    { name: 'Laura Martinez', dept: 'Marketing', total: 227, pct: '4.6%' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-black text-slate-950 whitespace-nowrap">{row.name}</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-800 whitespace-nowrap">{row.dept}</td>
                      <td className="px-3 py-2.5 text-right font-black text-slate-950 whitespace-nowrap">{row.total.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right font-black text-purple-700 whitespace-nowrap">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900">Bader Al Kaabi manages the most equipment with <strong>523 assets</strong>.</p>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // WIDGET 13: ANALYTICS — DEPRECIATION SUMMARY BY CATEGORY
    // -------------------------------------------------------------
    case 'ANALYTICS_DEPRECIATION_SUMMARY':
      return (
        <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-950 animate-in fade-in duration-300">
          {/* 4 Stat Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                <div className="p-0.5 rounded bg-amber-500/10 text-amber-600"><Layers className="w-3 h-3" /></div>
                <span>Total Assets</span>
              </div>
              <div className="text-base font-black text-slate-950 pl-0.5">4,892</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                <div className="p-0.5 rounded bg-blue-500/10 text-blue-600"><DollarSign className="w-3 h-3" /></div>
                <span>Original Value (AED)</span>
              </div>
              <div className="text-base font-black text-slate-950 pl-0.5">12,845,360</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                <div className="p-0.5 rounded bg-rose-500/10 text-rose-600"><TrendingUp className="w-3 h-3" /></div>
                <span>Accumulated Depreciation</span>
              </div>
              <div className="text-base font-black text-rose-700 pl-0.5">5,432,780</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-start space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                <div className="p-0.5 rounded bg-emerald-500/10 text-emerald-600"><DollarSign className="w-3 h-3" /></div>
                <span>Net Book Value (AED)</span>
              </div>
              <div className="text-base font-black text-emerald-700 pl-0.5">7,412,580</div>
            </div>
          </div>

          {/* Depreciation Summary Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-black text-slate-950">Depreciation Summary by Category</h5>
            <div className="overflow-x-auto scrollbar-thin border border-slate-300 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead className="bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-300">
                  <tr>
                    <th className="px-2.5 py-2.5 whitespace-nowrap">Category</th>
                    <th className="px-2.5 py-2.5 text-right whitespace-nowrap">Total Assets</th>
                    <th className="px-2.5 py-2.5 text-right whitespace-nowrap">Original Value (AED)</th>
                    <th className="px-2.5 py-2.5 text-right whitespace-nowrap">Accum. Depreciation (AED)</th>
                    <th className="px-2.5 py-2.5 text-right whitespace-nowrap">Net Book Value (AED)</th>
                    <th className="px-2.5 py-2.5 text-right whitespace-nowrap">% Depreciated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { cat: 'Laptops', total: 1245, orig: '3,245,600', dep: '1,678,900', nbv: '1,566,700', pct: '51.7%' },
                    { cat: 'Desktops', total: 982, orig: '2,312,450', dep: '1,210,220', nbv: '1,210,220', pct: '47.7%' },
                    { cat: 'Monitors', total: 876, orig: '1,148,300', dep: '632,540', nbv: '632,760', pct: '49.2%' },
                    { cat: 'Servers', total: 387, orig: '2,845,600', dep: '1,802,610', nbv: '1,042,790', pct: '63.3%' },
                    { cat: 'Network Equipment', total: 418, orig: '1,245,780', dep: '578,330', nbv: '667,450', pct: '46.4%' },
                    { cat: 'Printers', total: 532, orig: '745,320', dep: '291,180', nbv: '454,160', pct: '39.1%' },
                    { cat: 'Accessories', total: 265, orig: '543,210', dep: '205,190', nbv: '338,020', pct: '37.8%' },
                    { cat: 'Furniture', total: 115, orig: '412,500', dep: '160,000', nbv: '252,500', pct: '38.8%' },
                    { cat: 'Others', total: 70, orig: '250,000', dep: '-18,000', nbv: '268,000', pct: '-7.2%' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-2.5 py-2 font-black text-slate-950 whitespace-nowrap">{row.cat}</td>
                      <td className="px-2.5 py-2 text-right font-extrabold text-slate-900 whitespace-nowrap">{row.total.toLocaleString()}</td>
                      <td className="px-2.5 py-2 text-right font-extrabold text-slate-900 whitespace-nowrap">{row.orig}</td>
                      <td className="px-2.5 py-2 text-right text-rose-700 font-extrabold whitespace-nowrap">{row.dep}</td>
                      <td className="px-2.5 py-2 text-right text-emerald-700 font-extrabold whitespace-nowrap">{row.nbv}</td>
                      <td className="px-2.5 py-2 text-right font-black text-purple-700 whitespace-nowrap">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs font-bold text-blue-900">Servers category has the highest depreciation at <strong>63.3%</strong>.</p>
          </div>

          {/* Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
            <span className="font-bold text-xs text-slate-800">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleFeedback('up')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'up' ? 'text-emerald-600' : ''}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleFeedback('down')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback === 'down' ? 'text-rose-600' : ''}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
