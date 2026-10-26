import React, { useState } from 'react';
import { MapPin, Building, Box, Plus, X, Download, Eye, Layers } from 'lucide-react';

const DEFAULT_WAREHOUSES = [
  { name: 'Main Warehouse - Dubai HQ', code: 'WH-HQ-01', totalBins: 450, occupiedBins: 380, occupancyPct: 84, manager: 'John Doe', categories: 'HVAC, Electrical, Plumbing', address: 'Dubai Investment Park 1' },
  { name: 'Electrical Store - HQ', code: 'WH-HQ-02', totalBins: 200, occupiedBins: 165, occupancyPct: 82, manager: 'Sarah Ahmed', categories: 'Electrical', address: 'Building B, Ground Floor' },
  { name: 'Plumbing Bay - HQ', code: 'WH-HQ-03', totalBins: 150, occupiedBins: 110, occupancyPct: 73, manager: 'Ramesh Nair', categories: 'Plumbing', address: 'Maintenance Yard Store 3' },
  { name: 'Safety Store - HQ', code: 'WH-HQ-04', totalBins: 100, occupiedBins: 75, occupancyPct: 75, manager: 'Ahmed Khan', categories: 'Fire & Safety', address: 'Fire Station Bay Store' },
  { name: 'Site B Facility Store', code: 'WH-ST-02', totalBins: 300, occupiedBins: 210, occupancyPct: 70, manager: 'Tariq Mansoor', categories: 'General', address: 'Site B Facility Building' }
];

export function LocationsTab({
  sparePartsList = [],
  onShowToast,
  triggerAdd,
  triggerExport
}) {
  const [warehouses, setWarehouses] = useState(DEFAULT_WAREHOUSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarehouseForLayout, setSelectedWarehouseForLayout] = useState(null);

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

  const [newWhForm, setNewWhForm] = useState({
    name: '',
    code: '',
    totalBins: '250',
    manager: '',
    categories: 'HVAC, Electrical',
    address: 'Dubai HQ'
  });

  const handleAddWarehouse = (e) => {
    e.preventDefault();
    if (!newWhForm.name.trim() || !newWhForm.code.trim()) {
      onShowToast?.('Warehouse Name and Code are required.', 'error');
      return;
    }

    const created = {
      ...newWhForm,
      totalBins: parseInt(newWhForm.totalBins || 200),
      occupiedBins: 0,
      occupancyPct: 0
    };
    setWarehouses([...warehouses, created]);
    setShowAddModal(false);
    onShowToast?.(`Warehouse ${created.code} added successfully!`);
    setNewWhForm({ name: '', code: '', totalBins: '250', manager: '', categories: 'HVAC, Electrical', address: 'Dubai HQ' });
  };

  const handleExportCSV = () => {
    const headers = ['Warehouse Code', 'Warehouse Name', 'Total Bins', 'Occupied Bins', 'Occupancy (%)', 'Manager', 'Categories', 'Address'];
    const rows = warehouses.map(w => [
      w.code,
      `"${w.name}"`,
      w.totalBins,
      w.occupiedBins,
      w.occupancyPct,
      `"${w.manager}"`,
      `"${w.categories}"`,
      `"${w.address}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'warehouses_and_locations.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Warehouse locations exported to CSV.');
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Storage Locations & Bin Mapping
            </h2>
            <p className="text-xs text-slate-500">
              Warehouse layout, aisle/shelf/bin binning codes, and capacity occupancy tracking.
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
              onClick={() => {
                const nextCode = `WH-0${warehouses.length + 1}`;
                setNewWhForm(prev => ({ ...prev, code: nextCode }));
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Location
            </button>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map(wh => {
            // Count actual parts stored in this warehouse
            const storedParts = sparePartsList.filter(p => p.location?.toLowerCase().includes(wh.name?.toLowerCase().substring(0, 10)));
            const occupancy = wh.occupancyPct || Math.min(95, Math.max(10, storedParts.length * 12));

            return (
              <div key={wh.code} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-purple-300 transition-all">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#6C2BD9] text-white font-bold flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#6C2BD9] font-bold">{wh.code}</span>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{wh.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bin Occupancy:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {wh.occupiedBins || storedParts.length * 8} / {wh.totalBins} Bins ({occupancy}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#6C2BD9] rounded-full transition-all duration-500" 
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Warehouse Lead:</span>
                    <span className="font-semibold text-slate-800">{wh.manager || 'Site Supervisor'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Categories:</span>
                    <span className="font-medium text-slate-800">{wh.categories}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedWarehouseForLayout(wh)}
                    className="px-3 py-1 bg-purple-50 text-[#6C2BD9] border border-purple-200 hover:bg-purple-100 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Bins Layout
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD WAREHOUSE LOCATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6C2BD9]" /> Add Warehouse Storage Location
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    value={newWhForm.code}
                    onChange={(e) => setNewWhForm({ ...newWhForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Bins</label>
                  <input
                    type="number"
                    value={newWhForm.totalBins}
                    onChange={(e) => setNewWhForm({ ...newWhForm, totalBins: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location / Store Name *</label>
                <input
                  type="text"
                  required
                  value={newWhForm.name}
                  onChange={(e) => setNewWhForm({ ...newWhForm, name: e.target.value })}
                  placeholder="e.g. Mechanical Workshop Store - Bay 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Warehouse Lead / Manager</label>
                <input
                  type="text"
                  value={newWhForm.manager}
                  onChange={(e) => setNewWhForm({ ...newWhForm, manager: e.target.value })}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Address / Building</label>
                <input
                  type="text"
                  value={newWhForm.address}
                  onChange={(e) => setNewWhForm({ ...newWhForm, address: e.target.value })}
                  placeholder="e.g. Facility Yard 2, Dubai"
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
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BINS LAYOUT */}
      {selectedWarehouseForLayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#6C2BD9]" /> Bins Layout Grid: {selectedWarehouseForLayout.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedWarehouseForLayout.code}</p>
              </div>
              <button
                onClick={() => setSelectedWarehouseForLayout(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Bins Rack Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Racks & Bins Matrix</span>
                <span className="text-[11px] text-[#6C2BD9]">Live Storage Mapping</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { bin: 'A1-R1-B1', status: 'Occupied', part: 'Air Filter (AHU)', stock: 120 },
                  { bin: 'A1-R2-B1', status: 'Occupied', part: 'V-Belt B120', stock: 35 },
                  { bin: 'A1-R3-B2', status: 'Occupied', part: 'Air Filter (AHU)', stock: 50 },
                  { bin: 'A2-R1-B1', status: 'Empty', part: 'None', stock: 0 },
                  { bin: 'B1-R1-B1', status: 'Occupied', part: 'Circuit Breaker 63A', stock: 8 },
                  { bin: 'B1-R2-B4', status: 'Occupied', part: 'LED Driver 100W', stock: 0 },
                  { bin: 'B2-R1-B1', status: 'Empty', part: 'None', stock: 0 },
                  { bin: 'C1-R1-B1', status: 'Occupied', part: 'Ball Valve 1/2"', stock: 0 }
                ].map((slot, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      slot.status === 'Occupied'
                        ? slot.stock === 0 ? 'bg-red-50 border-red-200' : 'bg-purple-50/70 border-purple-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-900">{slot.bin}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        slot.status === 'Occupied' ? (slot.stock === 0 ? 'bg-red-200 text-red-800' : 'bg-purple-200 text-[#6C2BD9]') : 'bg-slate-200 text-slate-600'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-[11px] truncate">{slot.part}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Stock: <strong>{slot.stock}</strong></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedWarehouseForLayout(null)}
                className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold"
              >
                Close Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
