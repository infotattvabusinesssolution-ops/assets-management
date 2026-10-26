import React, { useState } from 'react';
import { Layers, Wrench, ShieldCheck, Cpu, Plus, X, Download, Filter, ArrowRight } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { name: 'HVAC', reorderPolicy: 'Automatic PR at 20%', description: 'Air conditioning, air handling units, chillers, and ductwork components.' },
  { name: 'Electrical', reorderPolicy: 'Automatic PR at 15%', description: 'Circuit breakers, switchgears, LED drivers, power cables, and relays.' },
  { name: 'Plumbing', reorderPolicy: 'Manual Review', description: 'Valves, pipe connectors, booster pump spares, and water meters.' },
  { name: 'Fire & Safety', reorderPolicy: 'Safety Critical (Immediate)', description: 'Smoke detectors, fire pump accessories, pressure switches, and sprinklers.' },
  { name: 'Generators', reorderPolicy: 'PM entitlement auto-reserve', description: 'Engine oil filters, fuel filters, belts, and generator controllers.' },
  { name: 'Civil', reorderPolicy: 'Project Demand Based', description: 'Structural anchors, sealants, expansion bolts, and tiles.' }
];

export function CategoriesTab({
  sparePartsList = [],
  onSelectCategory,
  onShowToast,
  triggerAdd,
  triggerExport
}) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatForm, setNewCatForm] = useState({
    name: '',
    reorderPolicy: 'Automatic PR at 20%',
    description: ''
  });

  // Listen for triggers from parent top header
  React.useEffect(() => {
    if (triggerAdd) {
      setShowAddModal(true);
    }
  }, [triggerAdd]);

  React.useEffect(() => {
    if (triggerExport) {
      handleExportCSV();
    }
  }, [triggerExport]);

  // Calculate dynamic metrics for each category from active inventory
  const categoryMetrics = categories.map(cat => {
    const matchedParts = sparePartsList.filter(p => p.category?.toLowerCase() === cat.name?.toLowerCase());
    const totalItems = matchedParts.length;
    const inStock = matchedParts.filter(p => p.status === 'In Stock').length;
    const lowStock = matchedParts.filter(p => p.status === 'Low Stock').length;
    const outOfStock = matchedParts.filter(p => p.status === 'Out of Stock').length;
    const totalValNum = matchedParts.reduce((sum, p) => sum + (parseFloat(p.totalValue) || 0), 0);

    return {
      ...cat,
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalVal: `AED ${totalValNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalValNum
    };
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) {
      onShowToast?.('Category name is required.', 'error');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === newCatForm.name.toLowerCase())) {
      onShowToast?.('Category already exists.', 'error');
      return;
    }

    setCategories([...categories, { ...newCatForm }]);
    setShowAddModal(false);
    onShowToast?.(`Category "${newCatForm.name}" created successfully!`);
    setNewCatForm({ name: '', reorderPolicy: 'Automatic PR at 20%', description: '' });
  };

  const handleExportCSV = () => {
    const headers = ['Category Name', 'Total Items', 'In Stock', 'Low Stock', 'Out of Stock', 'Valuation (AED)', 'Reorder Policy', 'Description'];
    const rows = categoryMetrics.map(c => [
      c.name,
      c.totalItems,
      c.inStock,
      c.lowStock,
      c.outOfStock,
      c.totalValNum,
      `"${c.reorderPolicy}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spare_part_categories.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Categories summary exported to CSV.');
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Spare Part Categories & Safety Stock Thresholds
            </h2>
            <p className="text-xs text-slate-500">
              Category classification matrix, safety level thresholds, and automatic PR trigger policies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#6C2BD9]" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryMetrics.map(cat => (
            <div key={cat.name} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-purple-300 transition-all">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-[#6C2BD9] font-bold flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-purple-50 text-[#6C2BD9] border border-purple-200 rounded text-[10px] font-bold shrink-0">
                  {cat.totalItems} Items
                </span>
              </div>

              {/* Stock breakdown */}
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

              <div className="text-[11px] space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inventory Value:</span>
                  <span className="font-extrabold text-slate-900 font-mono">{cat.totalVal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reorder Policy:</span>
                  <span className="font-semibold text-[#6C2BD9]">{cat.reorderPolicy}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    onSelectCategory?.(cat.name);
                    onShowToast?.(`Viewing ${cat.name} inventory parts`);
                  }}
                  className="px-3 py-1 bg-purple-50 text-[#6C2BD9] border border-purple-200 hover:bg-purple-100 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  View Inventory <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD CATEGORY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" /> Add Spare Part Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  placeholder="e.g. Mechanical, Elevators, BMS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reorder Policy *</label>
                <select
                  value={newCatForm.reorderPolicy}
                  onChange={(e) => setNewCatForm({ ...newCatForm, reorderPolicy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Automatic PR at 20%">Automatic PR at 20%</option>
                  <option value="Automatic PR at 15%">Automatic PR at 15%</option>
                  <option value="Manual Review">Manual Review</option>
                  <option value="Safety Critical (Immediate)">Safety Critical (Immediate)</option>
                  <option value="PM entitlement auto-reserve">PM entitlement auto-reserve</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  placeholder="Category scope and application description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
