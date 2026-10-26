import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Upload,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export function SparePartsListTab({
  sparePartsList = [],
  selectedItem,
  onSelectItem,
  onEditItem,
  onDeletePart,
  onBulkDelete,
  onExportCSV,
  onShowToast,
  onRefresh,
  categoryFilterProp,
  triggerImport
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Sync category filter from external click (e.g. from Categories tab "View Inventory")
  useEffect(() => {
    if (categoryFilterProp) {
      setCategoryFilter(categoryFilterProp);
    }
  }, [categoryFilterProp]);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const csvFileInputRef = useRef(null);

  // Listen for triggerImport from parent header button
  useEffect(() => {
    if (triggerImport) {
      setShowImportModal(true);
    }
  }, [triggerImport]);

  // Attachments State per Item
  const fileAttachmentInputRef = useRef(null);
  const [itemAttachments, setItemAttachments] = useState({
    1: [
      { id: 1, name: 'AHU_Filter_Datasheet.pdf', fileType: 'PDF', size: '450 KB' },
      { id: 2, name: 'Filter_Specification_Drawing.jpg', fileType: 'JPG', size: '320 KB' }
    ],
    2: [
      { id: 3, name: 'ABB_Breaker_Specification.pdf', fileType: 'PDF', size: '820 KB' }
    ],
    3: [
      { id: 4, name: 'Ball_Valve_Certificate.pdf', fileType: 'PDF', size: '210 KB' }
    ]
  });

  const activeAttachments = selectedItem?.id && itemAttachments[selectedItem.id]
    ? itemAttachments[selectedItem.id]
    : selectedItem?.attachments || [
        { id: 1, name: 'Standard_Product_Datasheet.pdf', fileType: 'PDF', size: '350 KB' }
      ];

  const filteredParts = sparePartsList.filter(part => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      part.itemCode?.toLowerCase().includes(q) ||
      part.itemName?.toLowerCase().includes(q) ||
      part.description?.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All Categories' || categoryFilter === 'ALL' || part.category === categoryFilter;
    const matchesLoc = locationFilter === 'All Locations' || locationFilter === 'ALL' || (part.location && part.location.includes(locationFilter));
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

  // CSV Template download
  const handleDownloadSampleTemplate = () => {
    const headers = ['itemCode', 'itemName', 'category', 'unit', 'currentStock', 'reorderLevel', 'maxLevel', 'unitCost', 'location', 'storageBin', 'supplier', 'leadTimeDays', 'description'];
    const sampleRows = [
      ['SP-HVAC-010', 'Centrifugal Fan Belt B105', 'HVAC', 'Piece', 15, 5, 50, 45.00, 'Main Warehouse - Dubai HQ', 'A1-R2-B4', 'Al Futtaim Trading LLC', 5, 'Heavy duty V-belt for fan drive'],
      ['SP-ELEC-012', 'Contactor 3-Pole 32A', 'Electrical', 'Piece', 8, 3, 30, 115.00, 'Electrical Store - HQ', 'E2-R1-B1', 'Schneider Electric', 7, 'Magnetic contactor 230V coil']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spare_parts_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Sample import template downloaded.');
  };

  // Handle CSV File Selection & Parsing
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) return;

        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          onShowToast?.('The selected CSV file appears to be empty or has only headers.', 'error');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          // Regex to parse comma-separated values respecting quotes
          const rawRow = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (!rawRow || rawRow.length === 0) continue;

          const cleanRow = rawRow.map(col => col.trim().replace(/^"|"$/g, ''));
          const itemCode = cleanRow[0] || `SP-GEN-${Date.now()}-${i}`;
          const itemName = cleanRow[1] || `Imported Item ${i}`;
          const category = cleanRow[2] || 'General';
          const unit = cleanRow[3] || 'Piece';
          const currentStock = parseInt(cleanRow[4], 10) || 10;
          const reorderLevel = parseInt(cleanRow[5], 10) || 5;
          const maxLevel = parseInt(cleanRow[6], 10) || 100;
          const unitCost = parseFloat(cleanRow[7]) || 50.0;
          const location = cleanRow[8] || 'Main Warehouse - Dubai HQ';
          const storageBin = cleanRow[9] || 'A1-R1-B1';
          const supplier = cleanRow[10] || 'Al Futtaim Trading LLC';
          const leadTimeDays = parseInt(cleanRow[11], 10) || 7;
          const description = cleanRow[12] || 'Imported via CSV catalog';

          rows.push({
            itemCode,
            itemName,
            category,
            unit,
            currentStock,
            reorderLevel,
            maxLevel,
            unitCost,
            totalValue: currentStock * unitCost,
            location,
            storageBin,
            supplier,
            leadTimeDays,
            description,
            status: currentStock === 0 ? 'Out of Stock' : currentStock <= reorderLevel ? 'Low Stock' : 'In Stock'
          });
        }

        setImportData(rows);
        onShowToast?.(`Parsed ${rows.length} valid item(s) from ${file.name}`);
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        onShowToast?.('Failed to parse CSV file. Ensure it is formatted correctly.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Submit Bulk Import to Backend
  const handleConfirmImport = async () => {
    if (importData.length === 0) {
      onShowToast?.('No parsed rows to import.', 'error');
      return;
    }

    setIsImporting(true);
    try {
      let successCount = 0;
      for (const item of importData) {
        try {
          await api.post('/maintenance/spare-parts', item);
          successCount++;
        } catch (postErr) {
          console.warn('Import single row err:', postErr);
        }
      }

      onShowToast?.(`Successfully imported ${successCount} spare part(s) into inventory!`);
      setShowImportModal(false);
      setImportData([]);
      setImportFileName('');
      onRefresh?.();
    } catch (err) {
      onShowToast?.('Error importing items.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Attachment Actions
  const handleUploadAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKB = Math.round(file.size / 1024);
    const formattedSize = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    const newAtt = {
      id: Date.now(),
      name: file.name,
      fileType: ext,
      size: formattedSize
    };

    const targetId = selectedItem?.id || 1;
    setItemAttachments(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newAtt]
    }));

    onShowToast?.(`Uploaded ${file.name} (${formattedSize}) successfully!`);
    if (fileAttachmentInputRef.current) {
      fileAttachmentInputRef.current.value = '';
    }
  };

  const handleDownloadAttachment = (att) => {
    const content = `--- Asset360 Document Attachment ---\nFile Name: ${att.name}\nType: ${att.fileType}\nSize: ${att.size}\nItem Code: ${selectedItem?.itemCode || 'SP-HVAC-001'}\nDownloaded On: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Downloaded ${att.name}`);
  };

  const handleDeleteAttachment = (attId, attName) => {
    const targetId = selectedItem?.id || 1;
    setItemAttachments(prev => ({
      ...prev,
      [targetId]: (prev[targetId] || []).filter(a => a.id !== attId)
    }));
    onShowToast?.(`Removed attachment "${attName}".`);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* BULK ACTION BAR IF ITEMS SELECTED */}
      {selectedRowIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6C2BD9]">{selectedRowIds.length} item(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRowIds([])}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
            >
              Deselect All
            </button>
            <button
              onClick={() => {
                onBulkDelete?.(selectedRowIds);
                setSelectedRowIds([]);
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedRowIds.length})
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: SPARE PARTS TABLE & FILTERS (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Spare Parts List
              </h2>
              <p className="text-[11px] text-slate-500">
                View and manage all spare parts and inventory items.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                title="Refresh List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-2.5 py-1.5 border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                title="Import CSV"
              >
                <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" /> Import CSV
              </button>
              <button
                onClick={onExportCSV}
                className="px-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#6C2BD9]" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filter Bar Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by item code, name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
              <button 
                onClick={() => onShowToast?.(`Filtered: ${filteredParts.length} items found.`)}
                className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
              >
                <Filter className="w-3.5 h-3.5 text-white" /> Filter
              </button>
            </div>
          </div>

          {/* Spare Parts Grid Table */}
          <div className="overflow-auto max-h-[540px] border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="p-2.5 w-6">
                    <input
                      type="checkbox"
                      checked={selectedRowIds.length === filteredParts.length && filteredParts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
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
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      No spare parts match the selected search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((part, idx) => {
                    const isSelected = selectedItem?.id === part.id;
                    return (
                      <tr
                        key={part.id}
                        onClick={() => onSelectItem(part)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/80 font-bold' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.includes(part.id)}
                            onChange={() => toggleRowSelect(part.id)}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                          />
                        </td>

                        <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>

                        <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">
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
                          {(Number(part.unitCost) || 0).toFixed(2)}
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
                            className="text-[#6C2BD9] hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditItem(part)}
                            className="text-[#6C2BD9] hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Edit Part"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePart?.(part.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Delete Part"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-200">
            <span className="font-medium text-slate-600">Showing {filteredParts.length} records</span>
            <span className="text-slate-400">Scroll down to view all records</span>
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

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditItem(selectedItem)}
                  className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3 h-3 text-[#6C2BD9]" /> Edit
                </button>
                {selectedItem && (
                  <button
                    onClick={() => onDeletePart?.(selectedItem.id)}
                    className="px-2.5 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Item Code</span>
                <span className="col-span-2 font-mono font-bold text-[#6C2BD9]">{selectedItem?.itemCode || 'SP-HVAC-001'}</span>
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
                <span className="col-span-2 font-mono font-bold text-slate-900">{(Number(selectedItem?.unitCost) || 85.00).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 text-slate-600">
                <span className="font-semibold text-slate-500">Total Value (AED)</span>
                <span className="col-span-2 font-mono font-extrabold text-emerald-600">
                  {((Number(selectedItem?.currentStock) || 0) * (Number(selectedItem?.unitCost) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                <span className="col-span-2 font-semibold text-[#6C2BD9]">
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

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileAttachmentInputRef}
                onChange={handleUploadAttachment}
                className="hidden"
              />

              <button
                onClick={() => fileAttachmentInputRef.current?.click()}
                className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add File
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                  <tr>
                    <th className="p-2 w-6">#</th>
                    <th className="p-2">File Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Size</th>
                    <th className="p-2 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {activeAttachments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        No attachments uploaded for this spare part.
                      </td>
                    </tr>
                  ) : (
                    activeAttachments.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-slate-50/70">
                        <td className="p-2 text-slate-500 font-bold">{idx + 1}</td>
                        <td 
                          onClick={() => handleDownloadAttachment(att)}
                          className="p-2 font-medium text-[#6C2BD9] hover:underline cursor-pointer truncate max-w-[120px]"
                          title={att.name}
                        >
                          {att.name}
                        </td>
                        <td className="p-2 text-slate-600 font-mono text-[11px]">{att.fileType || 'PDF'}</td>
                        <td className="p-2 text-slate-500 font-mono text-[11px]">{att.size}</td>
                        <td className="p-2 text-right space-x-1">
                          <button 
                            onClick={() => handleDownloadAttachment(att)}
                            className="text-[#6C2BD9] hover:text-purple-900 p-1"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAttachment(att.id, att.name)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Delete attachment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: IMPORT CSV SPARE PARTS */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#6C2BD9]" /> Import Spare Parts Catalog (CSV)
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData([]);
                  setImportFileName('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-3 text-purple-900 flex justify-between items-center">
                <div>
                  <p className="font-bold">Import Guide</p>
                  <p className="text-[11px] text-purple-800">
                    Upload a CSV file containing columns: itemCode, itemName, category, unit, currentStock, reorderLevel, unitCost, location, supplier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* File Dropzone */}
              <div
                onClick={() => csvFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#6C2BD9] bg-slate-50/50 hover:bg-purple-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={csvFileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleCSVFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto mb-2" />
                <p className="font-bold text-slate-800">Click to upload or drag & drop CSV</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports standard CSV files (.csv)</p>
                {importFileName && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Selected: {importFileName} ({importData.length} rows detected)
                  </p>
                )}
              </div>

              {/* Preview Table */}
              {importData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Preview ({importData.length} records ready to import)</span>
                    <span className="text-[11px] text-slate-500">Showing first {Math.min(importData.length, 5)} rows</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-auto max-h-48">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Item Code</th>
                          <th className="p-2">Item Name</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Stock</th>
                          <th className="p-2">Unit Cost</th>
                          <th className="p-2">Supplier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {importData.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-[#6C2BD9]">{row.itemCode}</td>
                            <td className="p-2 text-slate-900">{row.itemName}</td>
                            <td className="p-2 text-slate-600">{row.category}</td>
                            <td className="p-2 font-mono">{row.currentStock} {row.unit}</td>
                            <td className="p-2 font-mono">AED {Number(row.unitCost).toFixed(2)}</td>
                            <td className="p-2 text-slate-700">{row.supplier}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData([]);
                    setImportFileName('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importData.length === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-xs ${
                    importData.length === 0 || isImporting
                      ? 'bg-purple-300 cursor-not-allowed'
                      : 'bg-[#6C2BD9] hover:bg-[#5B21B6]'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Import ({importData.length} Items)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
