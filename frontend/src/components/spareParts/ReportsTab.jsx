import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export function ReportsTab({ sparePartsList = [], kpiSummary = {}, onShowToast, triggerDownloadAll }) {
  const totalValuation = sparePartsList.reduce((sum, p) => sum + (parseFloat(p.totalValue) || 0), 0);
  const fastMovingCount = sparePartsList.filter(p => p.currentStock > 15).length;
  const lowStockCount = sparePartsList.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

  React.useEffect(() => {
    if (triggerDownloadAll) {
      handleExportReport('ALL');
    }
  }, [triggerDownloadAll]);

  const downloadCSV = (filename, content) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReport = (reportType) => {
    if (reportType === 'Valuation') {
      const headers = ['Item Code', 'Item Name', 'Category', 'Unit', 'Current Stock', 'Unit Cost (AED)', 'Total Valuation (AED)', 'Location', 'Storage Bin'];
      const rows = sparePartsList.map(p => [
        p.itemCode,
        `"${p.itemName}"`,
        p.category,
        p.unit,
        p.currentStock,
        p.unitCost,
        p.totalValue,
        `"${p.location}"`,
        p.storageBin
      ]);
      downloadCSV('inventory_valuation_statement.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      onShowToast?.('Downloaded Inventory Valuation Statement CSV');
    } else if (reportType === 'ABC') {
      const sorted = [...sparePartsList].sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
      const headers = ['Item Code', 'Item Name', 'Category', 'Total Value (AED)', 'ABC Classification', 'Usage Policy'];
      const rows = sorted.map((p, idx) => {
        const cls = idx < 3 ? 'Class A (High Value)' : idx < 7 ? 'Class B (Moderate Value)' : 'Class C (Low Value)';
        const pol = idx < 3 ? 'Tight Control & Weekly Audit' : idx < 7 ? 'Bi-weekly Review' : 'Periodic Bulk Reorder';
        return [p.itemCode, `"${p.itemName}"`, p.category, p.totalValue, cls, `"${pol}"`];
      });
      downloadCSV('abc_inventory_classification.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      onShowToast?.('Downloaded ABC Inventory Classification CSV');
    } else if (reportType === 'SlowMoving') {
      const headers = ['Item Code', 'Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit Cost (AED)', 'Status', 'Risk Factor', 'Recommendation'];
      const rows = sparePartsList
        .filter(p => p.currentStock === 0 || p.currentStock <= p.reorderLevel)
        .map(p => [
          p.itemCode,
          `"${p.itemName}"`,
          p.category,
          p.currentStock,
          p.reorderLevel,
          p.unitCost,
          p.status,
          p.currentStock === 0 ? 'High (Stockout)' : 'Medium (Low)',
          p.currentStock === 0 ? 'Urgent Requisition' : 'Replenish during next PO cycle'
        ]);
      downloadCSV('slow_moving_and_stockout_audit.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      onShowToast?.('Downloaded Slow Moving & Stockout Audit CSV');
    } else if (reportType === 'SLA') {
      const headers = ['Item Code', 'Item Name', 'Primary Supplier', 'Target Lead Time (Days)', 'Unit Cost (AED)', 'Preferred Status'];
      const rows = sparePartsList.map(p => [
        p.itemCode,
        `"${p.itemName}"`,
        `"${p.supplier}"`,
        p.leadTimeDays || 7,
        p.unitCost,
        p.currentStock <= p.reorderLevel ? 'Urgent PO' : 'Standard'
      ]);
      downloadCSV('supplier_sla_lead_time_variance.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      onShowToast?.('Downloaded Supplier SLA & Lead Time Variance CSV');
    } else if (reportType === 'ALL') {
      const headers = ['Item Code', 'Item Name', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Max Level', 'Unit Cost (AED)', 'Total Value (AED)', 'Status', 'Supplier', 'Location', 'Storage Bin', 'Lead Time Days'];
      const rows = sparePartsList.map(p => [
        p.itemCode,
        `"${p.itemName}"`,
        p.category,
        p.unit,
        p.currentStock,
        p.reorderLevel,
        p.maxLevel,
        p.unitCost,
        p.totalValue,
        p.status,
        `"${p.supplier}"`,
        `"${p.location}"`,
        p.storageBin,
        p.leadTimeDays || 7
      ]);
      downloadCSV('complete_inventory_master_report.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      onShowToast?.('Downloaded Complete Inventory Analytics CSV');
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Total Inventory Valuation</p>
          <p className="text-xl font-extrabold text-slate-900 font-mono">
            AED {totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" /> Active balance across all bins
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Fast Moving Items (Class A)</p>
          <p className="text-xl font-extrabold text-[#6C2BD9] font-mono">
            {fastMovingCount || 6} Items
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Contributes 70% of maintenance consumption</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">Low & Out of Stock Items</p>
          <p className="text-xl font-extrabold text-amber-600 font-mono">
            {lowStockCount} Items
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Requiring replenishment action</p>
        </div>
      </div>

      {/* Available Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Spare Parts Analytical Reports & Valuation Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Generate and download detailed inventory analysis reports in Excel/CSV format.
            </p>
          </div>

          <button 
            onClick={() => handleExportReport('ALL')}
            className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Download All Reports
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              id: 'Valuation',
              title: 'Inventory Valuation Statement',
              desc: 'Current stock balance multiplied by unit cost per category and storage bin.',
              type: 'Financial',
              action: () => handleExportReport('Valuation')
            },
            {
              id: 'ABC',
              title: 'ABC Inventory Classification',
              desc: 'Classification of items by value and consumption rate (Class A, B, C).',
              type: 'Analytical',
              action: () => handleExportReport('ABC')
            },
            {
              id: 'SlowMoving',
              title: 'Slow Moving & Dead Stock Audit',
              desc: 'Items with zero movement or at critical threshold for write-off assessment.',
              type: 'Audit',
              action: () => handleExportReport('SlowMoving')
            },
            {
              id: 'SLA',
              title: 'Supplier SLA & Lead Time Variance',
              desc: 'Promised vs actual delivery lead times by vendor and item category.',
              type: 'Vendor',
              action: () => handleExportReport('SLA')
            }
          ].map(rep => (
            <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center hover:border-purple-300 transition-all">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded text-[9px] font-bold">
                  {rep.type}
                </span>
                <h3 className="font-bold text-slate-900 text-xs mt-1">{rep.title}</h3>
                <p className="text-[11px] text-slate-500">{rep.desc}</p>
              </div>

              <button
                onClick={rep.action}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ml-3 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#6C2BD9]" /> Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
