import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Edit,
  Eye,
  ShoppingCart,
  FileText,
  Save,
  Calendar,
  Clock,
  Truck,
  Coins,
  BarChart2,
  TrendingDown,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';

export function ReorderPlanningTab({ onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedItems, setSelectedItems] = useState([1, 2]); // Checked items

  // Mock Reorder Items matching exact screenshot data
  const [reorderList, setReorderList] = useState([
    {
      id: 1,
      itemCode: 'SP-HVAC-001',
      itemName: 'Air Filter (AHU)',
      category: 'HVAC',
      currentStock: 5,
      reorderLevel: 20,
      recommendedQty: 50,
      leadTimeDays: 7,
      unitCost: 85.00,
      estimatedCost: 4250.00,
      supplier: 'Al Futtaim LLC',
      primarySupplierFull: 'Al Futtaim Trading LLC',
      preferredLocation: 'Main Warehouse - Dubai HQ',
      status: 'To Reorder',
      remarks: 'Critical item for AHU units. Reorder to maintain operational availability.',
      stockHistory: [
        { month: 'Mar', val: 45 },
        { month: 'Apr', val: 38 },
        { month: 'May', val: 22 },
        { month: 'Jun', val: 12 },
        { month: 'Jul', val: 8 },
        { month: 'Aug', val: 5 }
      ]
    },
    {
      id: 2,
      itemCode: 'SP-ELEC-002',
      itemName: 'Circuit Breaker 63A',
      category: 'Electrical',
      currentStock: 2,
      reorderLevel: 10,
      recommendedQty: 20,
      leadTimeDays: 14,
      unitCost: 225.00,
      estimatedCost: 4500.00,
      supplier: 'ABB Middle East',
      primarySupplierFull: 'ABB Middle East FZCO',
      preferredLocation: 'Electrical Store - HQ',
      status: 'To Reorder',
      remarks: 'High demand for main panel maintenance.',
      stockHistory: [
        { month: 'Mar', val: 30 },
        { month: 'Apr', val: 24 },
        { month: 'May', val: 18 },
        { month: 'Jun', val: 11 },
        { month: 'Jul', val: 5 },
        { month: 'Aug', val: 2 }
      ]
    },
    {
      id: 3,
      itemCode: 'SP-PLUMB-003',
      itemName: 'Ball Valve 1/2"',
      category: 'Plumbing',
      currentStock: 0,
      reorderLevel: 5,
      recommendedQty: 20,
      leadTimeDays: 10,
      unitCost: 45.00,
      estimatedCost: 900.00,
      supplier: 'Emirates Trading',
      primarySupplierFull: 'Emirates Trading Co',
      preferredLocation: 'Plumbing Bay - HQ',
      status: 'To Reorder',
      remarks: 'Out of stock - emergency order required.',
      stockHistory: [
        { month: 'Mar', val: 18 },
        { month: 'Apr', val: 14 },
        { month: 'May', val: 9 },
        { month: 'Jun', val: 4 },
        { month: 'Jul', val: 1 },
        { month: 'Aug', val: 0 }
      ]
    },
    {
      id: 4,
      itemCode: 'SP-HVAC-004',
      itemName: 'V-Belt B120',
      category: 'HVAC',
      currentStock: 8,
      reorderLevel: 10,
      recommendedQty: 15,
      leadTimeDays: 5,
      unitCost: 75.00,
      estimatedCost: 1125.00,
      supplier: 'Al Futtaim LLC',
      primarySupplierFull: 'Al Futtaim Trading LLC',
      preferredLocation: 'Main Warehouse - Dubai HQ',
      status: 'To Reorder',
      remarks: 'Standard AHU belt replacement stock.',
      stockHistory: [
        { month: 'Mar', val: 25 },
        { month: 'Apr', val: 20 },
        { month: 'May', val: 16 },
        { month: 'Jun', val: 12 },
        { month: 'Jul', val: 10 },
        { month: 'Aug', val: 8 }
      ]
    },
    {
      id: 5,
      itemCode: 'SP-FIRE-005',
      itemName: 'Smoke Detector',
      category: 'Fire & Safety',
      currentStock: 3,
      reorderLevel: 15,
      recommendedQty: 30,
      leadTimeDays: 21,
      unitCost: 125.00,
      estimatedCost: 3750.00,
      supplier: 'Honeywell',
      primarySupplierFull: 'Honeywell Fire Systems',
      preferredLocation: 'Safety Store - HQ',
      status: 'To Reorder',
      remarks: 'Required for annual safety audit compliance.',
      stockHistory: [
        { month: 'Mar', val: 40 },
        { month: 'Apr', val: 32 },
        { month: 'May', val: 24 },
        { month: 'Jun', val: 15 },
        { month: 'Jul', val: 8 },
        { month: 'Aug', val: 3 }
      ]
    },
    {
      id: 6,
      itemCode: 'SP-GEN-006',
      itemName: 'Oil Filter',
      category: 'Generators',
      currentStock: 12,
      reorderLevel: 20,
      recommendedQty: 20,
      leadTimeDays: 7,
      unitCost: 40.00,
      estimatedCost: 800.00,
      supplier: 'Al Bahar',
      primarySupplierFull: 'Mohamed Abdulrahman Al-Bahar (CAT)',
      preferredLocation: 'Generator Store',
      status: 'Monitor',
      remarks: 'Approaching reorder threshold.',
      stockHistory: [
        { month: 'Mar', val: 35 },
        { month: 'Apr', val: 28 },
        { month: 'May', val: 22 },
        { month: 'Jun', val: 18 },
        { month: 'Jul', val: 14 },
        { month: 'Aug', val: 12 }
      ]
    },
    {
      id: 7,
      itemCode: 'SP-CIVIL-007',
      itemName: 'Anchor Bolt M10',
      category: 'Civil',
      currentStock: 1,
      reorderLevel: 10,
      recommendedQty: 50,
      leadTimeDays: 14,
      unitCost: 16.00,
      estimatedCost: 800.00,
      supplier: 'BuildCare LLC',
      primarySupplierFull: 'BuildCare Construction Materials',
      preferredLocation: 'Site A Store',
      status: 'To Reorder',
      remarks: 'Low inventory for structural fixing.',
      stockHistory: [
        { month: 'Mar', val: 60 },
        { month: 'Apr', val: 45 },
        { month: 'May', val: 30 },
        { month: 'Jun', val: 15 },
        { month: 'Jul', val: 6 },
        { month: 'Aug', val: 1 }
      ]
    },
    {
      id: 8,
      itemCode: 'SP-ELEC-008',
      itemName: 'LED Driver 100W',
      category: 'Electrical',
      currentStock: 7,
      reorderLevel: 10,
      recommendedQty: 20,
      leadTimeDays: 10,
      unitCost: 95.00,
      estimatedCost: 1900.00,
      supplier: 'Philips',
      primarySupplierFull: 'Philips Lighting Gulf',
      preferredLocation: 'Electrical Store - HQ',
      status: 'Monitor',
      remarks: 'Monitor usage before placing order.',
      stockHistory: [
        { month: 'Mar', val: 28 },
        { month: 'Apr', val: 22 },
        { month: 'May', val: 17 },
        { month: 'Jun', val: 13 },
        { month: 'Jul', val: 9 },
        { month: 'Aug', val: 7 }
      ]
    },
    {
      id: 9,
      itemCode: 'SP-HVAC-009',
      itemName: 'Thermostat',
      category: 'HVAC',
      currentStock: 0,
      reorderLevel: 10,
      recommendedQty: 15,
      leadTimeDays: 14,
      unitCost: 180.00,
      estimatedCost: 2700.00,
      supplier: 'Schneider Electric',
      primarySupplierFull: 'Schneider Electric Gulf',
      preferredLocation: 'Main Warehouse - Dubai HQ',
      status: 'To Reorder',
      remarks: 'Out of stock - digital thermostats.',
      stockHistory: [
        { month: 'Mar', val: 20 },
        { month: 'Apr', val: 15 },
        { month: 'May', val: 10 },
        { month: 'Jun', val: 5 },
        { month: 'Jul', val: 2 },
        { month: 'Aug', val: 0 }
      ]
    },
    {
      id: 10,
      itemCode: 'SP-PLUMB-010',
      itemName: 'Pipe Connector 1"',
      category: 'Plumbing',
      currentStock: 4,
      reorderLevel: 10,
      recommendedQty: 20,
      leadTimeDays: 7,
      unitCost: 18.00,
      estimatedCost: 360.00,
      supplier: 'Emirates Trading',
      primarySupplierFull: 'Emirates Trading Co',
      preferredLocation: 'Plumbing Bay - HQ',
      status: 'To Reorder',
      remarks: 'Regular plumbing replacement part.',
      stockHistory: [
        { month: 'Mar', val: 32 },
        { month: 'Apr', val: 25 },
        { month: 'May', val: 18 },
        { month: 'Jun', val: 12 },
        { month: 'Jul', val: 7 },
        { month: 'Aug', val: 4 }
      ]
    }
  ]);

  // Active selected item for Details Right Panel (Default: Air Filter AHU matching screenshot)
  const [selectedItem, setSelectedItem] = useState(reorderList[0]);

  // Toggle selection checkbox
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  // Filter Logic
  const filteredItems = reorderList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      item.itemCode.toLowerCase().includes(q) ||
      item.itemName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.supplier.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSupplier = supplierFilter === 'All' || item.supplier.includes(supplierFilter);

    return matchesQuery && matchesStatus && matchesSupplier;
  });

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSupplierFilter('All');
    setLocationFilter('All Locations');
    onShowToast?.('Filters reset to default.');
  };

  const handleCreatePR = (item) => {
    const code = item ? item.itemCode : `${selectedItems.length} selected items`;
    onShowToast?.(`Purchase Request PR-2026-009 generated for ${code}!`);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: REORDER PLANNING TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-base font-bold text-slate-900">Reorder Planning List</h2>
              <p className="text-xs text-slate-500">
                Items that require replenishment based on reorder level, forecast and lead time.
              </p>
            </div>

            {/* Filters Row matching screenshot */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by item code, name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] transition-colors"
                />
              </div>

              {/* Stock Status Dropdown */}
              <div className="flex flex-col">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All">Stock Status: All</option>
                  <option value="To Reorder">To Reorder</option>
                  <option value="Monitor">Monitor</option>
                </select>
              </div>

              {/* Supplier Dropdown */}
              <div>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All">Supplier: All</option>
                  <option value="Al Futtaim">Al Futtaim LLC</option>
                  <option value="ABB">ABB Middle East</option>
                  <option value="Emirates Trading">Emirates Trading</option>
                  <option value="Honeywell">Honeywell</option>
                  <option value="Al Bahar">Al Bahar</option>
                </select>
              </div>

              {/* Location Dropdown */}
              <div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Electrical Store">Electrical Store</option>
                  <option value="Plumbing Bay">Plumbing Bay</option>
                  <option value="Site A">Site A</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Reset
              </button>

              {/* Filter Button */}
              <button
                onClick={() => onShowToast?.('Filter applied')}
                className="px-3 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 fill-current" /> Filter
              </button>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length > 0 &&
                          selectedItems.length === filteredItems.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </th>
                    <th className="py-2.5 px-2 text-slate-400">#</th>
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">Reorder Level</th>
                    <th className="py-2.5 px-3 text-right">Recommended Qty</th>
                    <th className="py-2.5 px-3 text-right">Lead Time (Days)</th>
                    <th className="py-2.5 px-3 text-right">Estimated Cost (AED)</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-slate-400">
                        No reorder items found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isRowSelected = selectedItem?.id === item.id;
                      const isChecked = selectedItems.includes(item.id);
                      const isLowStock = item.currentStock <= item.reorderLevel;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`cursor-pointer transition-colors ${
                            isRowSelected
                              ? 'bg-purple-50/80 font-semibold'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-2.5 px-2 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectItem(item.id)}
                              className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                            />
                          </td>

                          {/* # */}
                          <td className="py-2.5 px-2 text-slate-400 font-mono text-[11px]">{item.id}</td>

                          {/* Item Code */}
                          <td className="py-2.5 px-3">
                            <span className="text-[#6C2BD9] font-semibold font-mono hover:underline">
                              {item.itemCode}
                            </span>
                          </td>

                          {/* Item Name */}
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {item.itemName}
                          </td>

                          {/* Category */}
                          <td className="py-2.5 px-3 text-slate-600">{item.category}</td>

                          {/* Current Stock */}
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              isLowStock ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {item.currentStock}
                          </td>

                          {/* Reorder Level */}
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {item.reorderLevel}
                          </td>

                          {/* Recommended Qty */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {item.recommendedQty}
                          </td>

                          {/* Lead Time */}
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {item.leadTimeDays}
                          </td>

                          {/* Estimated Cost */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {item.estimatedCost.toLocaleString()}
                          </td>

                          {/* Supplier */}
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{item.supplier}</td>

                          {/* Status Badge */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${
                                item.status === 'To Reorder'
                                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                                  : 'bg-amber-100 text-amber-700 border-amber-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Action Buttons (Cart + Eye) */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreatePR(item);
                                }}
                                className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                                title="Create Purchase Request"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                }}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Pagination */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-slate-500 font-medium text-xs">
              Showing 1 to {filteredItems.length} of 32 records
            </span>

            <div className="flex items-center gap-1.5">
              <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold disabled:opacity-50">
                &lt;
              </button>
              <button className="px-3 py-1 rounded bg-[#6C2BD9] text-white font-bold text-xs">1</button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                2
              </button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                3
              </button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                4
              </button>
              <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold">
                &gt;
              </button>

              <select className="ml-2 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium">
                <option>10 / page</option>
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SPARE PART DETAILS & STOCK TREND (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Spare Part Details</h3>
                <button
                  onClick={() => onShowToast?.(`Editing Spare Part ${selectedItem.itemCode}`)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
              </div>

              {/* Fields List matching exact screenshot */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Item Code</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedItem.itemCode}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Item Name</span>
                  <span className="font-bold text-slate-900">{selectedItem.itemName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-medium text-slate-800">{selectedItem.category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Stock</span>
                  <span className="font-bold font-mono text-rose-600 text-sm">
                    {selectedItem.currentStock}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Reorder Level</span>
                  <span className="font-medium text-slate-900 font-mono">{selectedItem.reorderLevel}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Recommended Qty</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedItem.recommendedQty}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Lead Time (Days)</span>
                  <span className="font-medium text-slate-900 font-mono">{selectedItem.leadTimeDays}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Unit Cost (AED)</span>
                  <span className="font-mono text-slate-800">{selectedItem.unitCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Estimated Value (AED)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedItem.estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Primary Supplier</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                    {selectedItem.primarySupplierFull}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Preferred Location</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                    {selectedItem.preferredLocation}
                  </span>
                </div>

                {/* Remarks Callout Box */}
                <div className="pt-1">
                  <span className="text-slate-500 font-medium block mb-1">Remarks</span>
                  <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 text-purple-950 text-[11px] font-medium leading-relaxed">
                    {selectedItem.remarks}
                  </div>
                </div>
              </div>

              {/* View Usage History Link Button */}
              <button
                onClick={() => onShowToast?.(`Opening stock usage history for ${selectedItem.itemCode}`)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-[#6C2BD9] flex items-center justify-center gap-1.5 transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-[#6C2BD9]" /> View Usage History
              </button>

              <hr className="border-slate-100" />

              {/* Stock Trend (Last 6 Months) Line Chart SVG matching screenshot */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Stock Trend (Last 6 Months)</h4>

                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="relative h-44 w-full">
                    {/* SVG Line Chart */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 140">
                      {/* Grid Lines & Y-Axis Labels */}
                      <g className="text-[9px] fill-slate-400 font-mono">
                        <text x="0" y="15">60</text>
                        <line x1="20" y1="12" x2="290" y2="12" stroke="#f1f5f9" strokeWidth="1" />

                        <text x="0" y="45">40</text>
                        <line x1="20" y1="42" x2="290" y2="42" stroke="#f1f5f9" strokeWidth="1" />

                        {/* Reorder Level (20) Line in RED */}
                        <text x="0" y="75">20</text>
                        <line x1="20" y1="72" x2="290" y2="72" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
                        <text x="210" y="66" fill="#ef4444" className="font-bold text-[9px]">
                          Reorder Level (20)
                        </text>

                        <text x="5" y="110">0</text>
                        <line x1="20" y1="107" x2="290" y2="107" stroke="#e2e8f0" strokeWidth="1" />
                      </g>

                      {/* X-Axis Labels */}
                      <g className="text-[10px] fill-slate-500 font-medium">
                        <text x="35" y="125">Mar</text>
                        <text x="80" y="125">Apr</text>
                        <text x="125" y="125">May</text>
                        <text x="170" y="125">Jun</text>
                        <text x="215" y="125">Jul</text>
                        <text x="260" y="125">Aug</text>
                      </g>

                      {/* Trend Curve Line */}
                      <path
                        d="M 40 32 L 85 45 L 130 68 L 175 84 L 220 95 L 265 100"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Data Dots */}
                      {[
                        { x: 40, y: 32 },
                        { x: 85, y: 45 },
                        { x: 130, y: 68 },
                        { x: 175, y: 84 },
                        { x: 220, y: 95 },
                        { x: 265, y: 100 }
                      ].map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          className="fill-[#6C2BD9] stroke-white stroke-2"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Select an item to view reorder planning details
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR matching exact screenshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex justify-between items-center">
        <button
          onClick={() => onShowToast?.('Action cancelled')}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreatePR(null)}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-600" /> Create Purchase Request
          </button>

          <button
            onClick={() => onShowToast?.('Reorder plan saved successfully!')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Save className="w-4 h-4 text-white" /> Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

