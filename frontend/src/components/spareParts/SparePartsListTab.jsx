import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  MoreHorizontal,
  Download,
  Trash2,
  Plus,
  FileText,
  Package,
  ChevronRight,
  ExternalLink,
  MapPin,
  Tag
} from 'lucide-react';

export function SparePartsListTab({
  sparePartsList,
  selectedItem,
  onSelectItem,
  onEditItem,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const filteredParts = sparePartsList.filter(part => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      part.itemCode.toLowerCase().includes(q) ||
      part.itemName.toLowerCase().includes(q) ||
      part.description.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All Categories' || categoryFilter === 'ALL' || part.category === categoryFilter;
    const matchesLoc = locationFilter === 'All Locations' || locationFilter === 'ALL' || part.location.includes(locationFilter);
    const matchesStat = statusFilter === 'All Status' || statusFilter === 'ALL' || part.status === statusFilter;
    return matchesSearch && matchesCat && matchesLoc && matchesStat;
  });

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredParts.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredParts.map(p => p.id));
    }
  };

  const toggleRowSelect = (id) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN: SPARE PARTS TABLE & FILTERS (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Spare Parts List
            </h2>
            <p className="text-[11px] text-slate-500">
              View and manage all spare parts and inventory items.
            </p>
          </div>

          {/* Filter Bar Controls Row matching Screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by item code, name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All Categories">All Categories</option>
                <option value="HVAC">HVAC</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Fire & Safety">Fire & Safety</option>
                <option value="Generators">Generators</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All Locations">All Locations</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Electrical Store">Electrical Store</option>
                <option value="Plumbing Bay">Plumbing Bay</option>
                <option value="Safety Store">Safety Store</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All Status">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Filter & Reset Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All Categories');
                  setLocationFilter('All Locations');
                  setStatusFilter('All Status');
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs"
              >
                Reset
              </button>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs">
                <Filter className="w-3.5 h-3.5 text-white" /> Filter
              </button>
            </div>
          </div>

          {/* Spare Parts Grid Table matching Screenshot */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 w-6">
                    <input
                      type="checkbox"
                      checked={selectedRowIds.length === filteredParts.length && filteredParts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-2.5 w-8">#</th>
                  <th className="p-2.5">Item Code</th>
                  <th className="p-2.5">Item Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Unit</th>
                  <th className="p-2.5">Current Stock</th>
                  <th className="p-2.5">Reorder Level</th>
                  <th className="p-2.5">Unit Cost (AED)</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {filteredParts.map((part, idx) => {
                  const isSelected = selectedItem?.id === part.id;
                  return (
                    <tr
                      key={part.id}
                      onClick={() => onSelectItem(part)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(part.id)}
                          onChange={() => toggleRowSelect(part.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>

                      <td className="p-2.5 font-mono font-bold text-blue-600">
                        {part.itemCode}
                      </td>

                      <td className="p-2.5 font-bold text-slate-900">
                        {part.itemName}
                      </td>

                      <td className="p-2.5 text-slate-700">{part.category}</td>
                      <td className="p-2.5 text-slate-600">{part.unit}</td>
                      
                      <td className="p-2.5 font-bold text-slate-900 font-mono">
                        {part.currentStock}
                      </td>

                      <td className="p-2.5 text-slate-700 font-mono">
                        {part.reorderLevel}
                      </td>

                      <td className="p-2.5 font-mono text-slate-900 font-semibold">
                        {part.unitCost.toFixed(2)}
                      </td>

                      <td className="p-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          part.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          part.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {part.status}
                        </span>
                      </td>

                      <td className="p-2.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectItem(part)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditItem(part)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Part"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShowToast(`Options for ${part.itemCode}`)}
                          className="text-blue-600 hover:text-slate-800 p-1"
                          title="More Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching Screenshot */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing 1 to {filteredParts.length} of 1,248 records</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-semibold">
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">«</button>
                <button className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded">1</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">2</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">3</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">4</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">5</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">125</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">›</button>
                <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">»</button>
              </div>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 bg-white font-medium">
                <option>10 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ITEM DETAILS & ATTACHMENTS (1/3 width) */}
        <div className="space-y-4">
          {/* ITEM DETAILS CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Item Details
              </h2>

              <button
                onClick={() => onEditItem(selectedItem)}
                className="px-3 py-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3 h-3 text-blue-600" /> Edit
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Item Code</span>
                <span className="col-span-2 font-mono font-bold text-blue-600">{selectedItem?.itemCode || 'SP-HVAC-001'}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Item Name</span>
                <span className="col-span-2 font-bold text-slate-900">{selectedItem?.itemName || 'Air Filter (AHU)'}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Category</span>
                <span className="col-span-2 font-medium text-slate-800">{selectedItem?.category || 'HVAC'}</span>
              </div>

              <div className="pt-1">
                <span className="block font-semibold text-slate-500 mb-1">Description</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                  {selectedItem?.description || 'Standard AHU air filter with MERV 8 rating used in HVAC systems.'}
                </p>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Unit of Measure</span>
                <span className="col-span-2 font-medium text-slate-800">{selectedItem?.unit || 'Piece'}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Current Stock</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedItem?.currentStock ?? 120}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Reorder Level</span>
                <span className="col-span-2 font-mono text-slate-800">{selectedItem?.reorderLevel ?? 20}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Maximum Level</span>
                <span className="col-span-2 font-mono text-slate-800">{selectedItem?.maxLevel ?? 200}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Unit Cost (AED)</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{(selectedItem?.unitCost || 85.00).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Total Value (AED)</span>
                <span className="col-span-2 font-mono font-extrabold text-emerald-600">
                  {((selectedItem?.currentStock || 120) * (selectedItem?.unitCost || 85.00)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Status</span>
                <span className="col-span-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    (selectedItem?.status || 'In Stock') === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    (selectedItem?.status) === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {selectedItem?.status || 'In Stock'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Primary Supplier</span>
                <span className="col-span-2 font-semibold text-blue-600 hover:underline cursor-pointer">
                  {selectedItem?.supplier || 'Al Futtaim Trading LLC'}
                </span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Preferred Location</span>
                <span className="col-span-2 font-medium text-slate-800">{selectedItem?.location || 'Main Warehouse - Dubai HQ'}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Storage Bin</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedItem?.storageBin || 'A1-R3-B2'}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Lead Time (Days)</span>
                <span className="col-span-2 font-mono font-medium text-slate-800">{selectedItem?.leadTimeDays || 7}</span>
              </div>

              <div className="pt-1">
                <span className="block font-semibold text-slate-500 mb-1">Remarks</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                  {selectedItem?.remarks || 'Standard item used across all AHU units.'}
                </p>
              </div>
            </div>
          </div>

          {/* ATTACHMENTS CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Attachments
              </h2>

              <button
                onClick={() => onShowToast('Upload file attached!')}
                className="px-3 py-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" /> Add File
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                  <tr>
                    <th className="p-2 w-6">#</th>
                    <th className="p-2">File Name</th>
                    <th className="p-2">File Type</th>
                    <th className="p-2">Size</th>
                    <th className="p-2 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {(selectedItem?.attachments || [
                    { id: 1, name: 'Datasheet.pdf', fileType: 'PDF', size: '450 KB' },
                    { id: 2, name: 'Product Image.jpg', fileType: 'JPG', size: '320 KB' }
                  ]).map((att, idx) => (
                    <tr key={att.id} className="hover:bg-slate-50/70">
                      <td className="p-2 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="p-2 font-medium text-blue-600 hover:underline cursor-pointer">{att.name}</td>
                      <td className="p-2 text-slate-600 font-mono text-[11px]">{att.fileType || 'PDF'}</td>
                      <td className="p-2 text-slate-500 font-mono text-[11px]">{att.size}</td>
                      <td className="p-2 text-right space-x-1">
                        <button 
                          onClick={() => onShowToast(`Downloading ${att.name}...`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onShowToast(`Deleted ${att.name}`)}
                          className="text-blue-600 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
