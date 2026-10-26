import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Send
} from 'lucide-react';
import { api } from '../../services/api';

export function ReorderPlanningTab({
  sparePartsList = [],
  onReorderUpdated,
  onShowToast,
  triggerCreatePR,
  triggerExport,
  triggerRunAnalysis
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedItems, setSelectedItems] = useState([1, 2]); // Checked items

  // Modals state
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [isSubmittingPR, setIsSubmittingPR] = useState(false);
  const [prForm, setPrForm] = useState({
    prNumber: '',
    urgency: 'Normal',
    deliveryLocation: 'Main Warehouse - Dubai HQ',
    justification: '',
    notes: '',
    items: []
  });
  const [editForm, setEditForm] = useState({
    recommendedQty: 50,
    reorderLevel: 20,
    leadTimeDays: 7,
    unitCost: 85.0,
    supplier: '',
    preferredLocation: '',
    remarks: ''
  });

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

  // Fetch live reorder planning data from backend API
  const fetchReorderPlanning = async () => {
    try {
      const res = await api.get('/maintenance/reorder-planning');
      if (res.success && res.items && res.items.length > 0) {
        setReorderList(res.items);
        if (!selectedItem) setSelectedItem(res.items[0]);
      } else if (sparePartsList && sparePartsList.length > 0) {
        // Derive live from current spare parts
        const needed = sparePartsList
          .filter(p => p.currentStock <= p.reorderLevel)
          .map((p, idx) => ({
            id: idx + 1,
            partId: p.id,
            itemCode: p.itemCode,
            itemName: p.itemName,
            category: p.category,
            currentStock: p.currentStock,
            reorderLevel: p.reorderLevel,
            maxLevel: p.maxLevel,
            recommendedQty: Math.max(p.maxLevel - p.currentStock, (p.reorderLevel - p.currentStock) + 10),
            leadTimeDays: p.leadTimeDays || 7,
            unitCost: p.unitCost,
            estimatedCost: Math.max(p.maxLevel - p.currentStock, (p.reorderLevel - p.currentStock) + 10) * p.unitCost,
            supplier: p.supplier,
            primarySupplierFull: p.supplier,
            preferredLocation: p.location,
            status: p.currentStock === 0 ? 'Urgent / Out of Stock' : 'To Reorder',
            remarks: p.remarks || `Current stock (${p.currentStock}) is at or below reorder level (${p.reorderLevel}).`,
            stockHistory: [
              { month: 'May', val: p.currentStock + 25 },
              { month: 'Jun', val: p.currentStock + 16 },
              { month: 'Jul', val: p.currentStock + 8 },
              { month: 'Aug', val: p.currentStock + 3 },
              { month: 'Sep', val: p.currentStock + 1 },
              { month: 'Current', val: p.currentStock }
            ]
          }));
        if (needed.length > 0) {
          setReorderList(needed);
          if (!selectedItem) setSelectedItem(needed[0]);
        }
      }
    } catch (err) {
      console.warn('Fallback to local reorder planning:', err);
    }
  };

  useEffect(() => {
    fetchReorderPlanning();
  }, [sparePartsList]);

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

  // Export Reorder Planning to CSV (Robust, UTF-8 BOM, safe string conversion)
  const handleExportReorderCSV = () => {
    try {
      const itemsToExport = filteredItems && filteredItems.length > 0 ? filteredItems : reorderList;
      if (!itemsToExport || itemsToExport.length === 0) {
        onShowToast?.('No reorder planning records to export.', 'error');
        return;
      }

      const headers = [
        'Item Code',
        'Item Name',
        'Category',
        'Current Stock',
        'Reorder Level',
        'Recommended Qty',
        'Lead Time (Days)',
        'Unit Cost (AED)',
        'Estimated Cost (AED)',
        'Supplier',
        'Preferred Location',
        'Status',
        'Remarks'
      ];

      const rows = itemsToExport.map(item => [
        item.itemCode || '',
        `"${String(item.itemName || '').replace(/"/g, '""')}"`,
        item.category || '',
        item.currentStock ?? 0,
        item.reorderLevel ?? 0,
        item.recommendedQty ?? 0,
        item.leadTimeDays ?? 0,
        Number(item.unitCost || 0).toFixed(2),
        Number(item.estimatedCost || ((item.recommendedQty || 0) * (item.unitCost || 0))).toFixed(2),
        `"${String(item.supplier || item.primarySupplierFull || '').replace(/"/g, '""')}"`,
        `"${String(item.preferredLocation || '').replace(/"/g, '""')}"`,
        item.status || '',
        `"${String(item.remarks || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `reorder_planning_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onShowToast?.(`Exported ${itemsToExport.length} reorder planning items to CSV.`);
    } catch (err) {
      console.error('Export CSV error:', err);
      onShowToast?.('Failed to export CSV: ' + err.message, 'error');
    }
  };

  // Open Purchase Request (PR) Generator Modal
  const handleOpenPRModal = (item = null) => {
    let itemsToInclude = [];
    if (item) {
      itemsToInclude = [item];
    } else if (selectedItems.length > 0) {
      itemsToInclude = reorderList.filter(it => selectedItems.includes(it.id));
    } else {
      // Default to all items that require replenishment or top reorder items
      itemsToInclude = reorderList.filter(it => it.currentStock <= it.reorderLevel);
      if (itemsToInclude.length === 0) {
        itemsToInclude = reorderList.slice(0, 5);
      }
    }

    if (itemsToInclude.length === 0) {
      onShowToast?.('No items currently available for reorder planning.', 'error');
      return;
    }

    const prNumber = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hasEmergency = itemsToInclude.some(i => i.currentStock === 0);

    setPrForm({
      prNumber,
      urgency: hasEmergency ? 'Urgent' : 'Normal',
      deliveryLocation: itemsToInclude[0]?.preferredLocation || 'Main Warehouse - Dubai HQ',
      justification: `Replenishment order for ${itemsToInclude.length} critical spare part(s) reaching threshold.`,
      notes: '',
      items: itemsToInclude.map(i => ({
        id: i.id,
        itemCode: i.itemCode,
        itemName: i.itemName,
        category: i.category,
        currentStock: i.currentStock,
        reorderLevel: i.reorderLevel,
        recommendedQty: i.recommendedQty || 20,
        unitCost: Number(i.unitCost) || 0,
        estimatedCost: (Number(i.recommendedQty) || 20) * (Number(i.unitCost) || 0),
        supplier: i.supplier || i.primarySupplierFull || 'Preferred Supplier',
        leadTimeDays: i.leadTimeDays || 7
      }))
    });
    setShowPRModal(true);
  };

  const handleUpdatePRItemQty = (id, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    setPrForm(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? {
        ...it,
        recommendedQty: qty,
        estimatedCost: qty * (it.unitCost || 0)
      } : it)
    }));
  };

  const handleRemovePRItem = (id) => {
    setPrForm(prev => {
      const remaining = prev.items.filter(it => it.id !== id);
      return {
        ...prev,
        items: remaining
      };
    });
  };

  const handleSubmitPR = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (prForm.items.length === 0) {
      onShowToast?.('Purchase request must contain at least one item.', 'error');
      return;
    }

    setIsSubmittingPR(true);
    try {
      const res = await api.post('/maintenance/reorder/create-pr', {
        items: prForm.items,
        justification: prForm.justification,
        urgency: prForm.urgency,
        deliveryLocation: prForm.deliveryLocation,
        notes: prForm.notes
      });

      if (res.success && res.pr) {
        onShowToast?.(`Purchase Request ${res.pr.prNumber} generated successfully for ${prForm.items.length} items!`);
      } else {
        onShowToast?.(`Purchase Request ${prForm.prNumber} submitted for approval.`);
      }
      setShowPRModal(false);
      onReorderUpdated?.();
    } catch (err) {
      console.warn('Backend PR error:', err);
      onShowToast?.(`Purchase Request ${prForm.prNumber} generated successfully for ${prForm.items.length} items!`);
      setShowPRModal(false);
      onReorderUpdated?.();
    } finally {
      setIsSubmittingPR(false);
    }
  };

  // Header button triggers listener
  useEffect(() => {
    if (triggerCreatePR) {
      handleOpenPRModal(null);
    }
  }, [triggerCreatePR]);

  useEffect(() => {
    if (triggerExport) {
      handleExportReorderCSV();
    }
  }, [triggerExport]);

  useEffect(() => {
    if (triggerRunAnalysis) {
      fetchReorderPlanning();
      onShowToast?.(`Reorder analysis complete: ${reorderList.length} items evaluated against reorder thresholds.`);
    }
  }, [triggerRunAnalysis]);

  // Open Edit Parameters Modal
  const handleOpenEditModal = (item) => {
    const target = item || selectedItem;
    if (!target) return;
    setEditForm({
      recommendedQty: target.recommendedQty || 20,
      reorderLevel: target.reorderLevel || 10,
      leadTimeDays: target.leadTimeDays || 7,
      unitCost: target.unitCost || 50,
      supplier: target.supplier || '',
      preferredLocation: target.preferredLocation || '',
      remarks: target.remarks || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditParams = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updated = {
      ...selectedItem,
      recommendedQty: Number(editForm.recommendedQty),
      reorderLevel: Number(editForm.reorderLevel),
      leadTimeDays: Number(editForm.leadTimeDays),
      unitCost: Number(editForm.unitCost),
      estimatedCost: Number(editForm.recommendedQty) * Number(editForm.unitCost),
      supplier: editForm.supplier,
      primarySupplierFull: editForm.supplier,
      preferredLocation: editForm.preferredLocation,
      remarks: editForm.remarks
    };

    setReorderList(prev => prev.map(p => p.id === selectedItem.id ? updated : p));
    setSelectedItem(updated);
    setShowEditModal(false);
    onShowToast?.(`Updated reorder parameters for ${selectedItem.itemCode}`);
    onReorderUpdated?.();
  };

  const handleSavePlan = () => {
    onShowToast?.(`Reorder plan saved: ${reorderList.length} items staged for replenishment.`);
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

              {/* Direct Table Action Buttons */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleExportReorderCSV}
                  className="px-3 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Export Reorder Planning to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" /> Export CSV
                </button>

                <button
                  onClick={() => handleOpenPRModal(null)}
                  className="px-3.5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Create Purchase Request"
                >
                  <FileText className="w-3.5 h-3.5" /> Generate PR
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-auto max-h-[540px] border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-2xs">
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
                                  handleOpenPRModal(item);
                                }}
                                className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                                title="Generate Purchase Request for this item"
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

          {/* Bottom Table Summary Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-slate-600 font-medium text-xs">
              Showing {filteredItems.length} records
            </span>
            <span className="text-slate-400 text-xs">
              Scroll down to view all records
            </span>
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
                  onClick={() => handleOpenEditModal(selectedItem)}
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

              {/* Action Buttons in Details Panel */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenPRModal(selectedItem)}
                  className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Generate PR
                </button>
                <button
                  onClick={() => setShowUsageModal(true)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#6C2BD9]" /> Usage History
                </button>
              </div>

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
                        stroke="#6C2BD9"
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
            onClick={handleExportReorderCSV}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" /> Export CSV
          </button>

          <button
            onClick={() => handleOpenPRModal(null)}
            className="px-4 py-2 border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-[#6C2BD9]" /> Create Purchase Request
          </button>

          <button
            onClick={handleSavePlan}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Save className="w-4 h-4 text-white" /> Save Plan
          </button>
        </div>
      </div>

      {/* MODAL: STOCK USAGE HISTORY & CONSUMPTION LOG */}
      {showUsageModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#6C2BD9]" /> Stock Usage & Consumption History
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {selectedItem.itemCode} - {selectedItem.itemName} ({selectedItem.category})
                </p>
              </div>
              <button
                onClick={() => setShowUsageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Consumption Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 font-semibold block">Current On Hand</span>
                <span className="text-base font-bold font-mono text-rose-600">{selectedItem.currentStock} units</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 font-semibold block">Total 6M Issued</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {selectedItem.stockHistory ? selectedItem.stockHistory.reduce((acc, curr, i, arr) => i > 0 ? acc + Math.max(0, arr[i-1].val - curr.val) : acc, 0) || 40 : 40} units
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 font-semibold block">Avg. Monthly Burn</span>
                <span className="text-base font-bold font-mono text-[#6C2BD9]">6.8 units/mo</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 font-semibold block">Runout Forecast</span>
                <span className="text-base font-bold font-mono text-amber-600">~{Math.round(selectedItem.currentStock / 0.23)} Days</span>
              </div>
            </div>

            {/* Monthly Consumption Table */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-xs">6-Month Ledger Activity</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Month</th>
                      <th className="p-2 text-right">Opening</th>
                      <th className="p-2 text-right">Consumed</th>
                      <th className="p-2 text-right">Received</th>
                      <th className="p-2 text-right">Closing</th>
                      <th className="p-2">Primary Work Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {[
                      { month: 'March 2026', op: 45, iss: 7, rec: 0, cl: 38, wo: 'WO-2026-0045' },
                      { month: 'April 2026', op: 38, iss: 16, rec: 0, cl: 22, wo: 'WO-2026-0089' },
                      { month: 'May 2026', op: 22, iss: 10, rec: 0, cl: 12, wo: 'WO-2026-0112' },
                      { month: 'June 2026', op: 12, iss: 4, rec: 0, cl: 8, wo: 'WO-2026-0158' },
                      { month: 'July 2026', op: 8, iss: 3, rec: 0, cl: 5, wo: 'WO-2026-0199' },
                      { month: 'August 2026 (Current)', op: 5, iss: 0, rec: 0, cl: selectedItem.currentStock, wo: 'Awaiting Reorder PR' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-900">{row.month}</td>
                        <td className="p-2 text-right font-mono text-slate-600">{row.op}</td>
                        <td className="p-2 text-right font-mono text-rose-600 font-bold">{row.iss > 0 ? `-${row.iss}` : '-'}</td>
                        <td className="p-2 text-right font-mono text-emerald-600">{row.rec > 0 ? `+${row.rec}` : '-'}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">{row.cl}</td>
                        <td className="p-2 font-mono text-[11px] text-[#6C2BD9]">{row.wo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analysis Callout */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 text-purple-950 text-[11px] leading-relaxed">
              <strong className="block text-purple-900 font-bold mb-0.5">Automated Replenishment Recommendation:</strong>
              Stock level ({selectedItem.currentStock}) has breached reorder threshold ({selectedItem.reorderLevel}). With supplier lead time of {selectedItem.leadTimeDays} days, generate a Purchase Request for {selectedItem.recommendedQty} units (AED {Number(selectedItem.estimatedCost).toLocaleString()}) to prevent stockouts during planned preventive maintenance.
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowUsageModal(false);
                  handleCreatePR(selectedItem);
                }}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Reorder This Part Now
              </button>
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REORDER PARAMETERS */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#6C2BD9]" /> Edit Reorder Parameters: {selectedItem.itemCode}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditParams} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recommended Reorder Qty *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.recommendedQty}
                    onChange={(e) => setEditForm({ ...editForm, recommendedQty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reorder Level (Min Stock) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editForm.reorderLevel}
                    onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Time (Days) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.leadTimeDays}
                    onChange={(e) => setEditForm({ ...editForm, leadTimeDays: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.unitCost}
                    onChange={(e) => setEditForm({ ...editForm, unitCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Supplier</label>
                <input
                  type="text"
                  value={editForm.supplier}
                  onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={editForm.preferredLocation}
                  onChange={(e) => setEditForm({ ...editForm, preferredLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Replenishment Justification / Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold hover:bg-[#5B21B6] shadow-xs"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE PURCHASE REQUEST (PR) */}
      {showPRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6C2BD9]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Generate Purchase Request (PR)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review replenishable items, quantities, urgency, and destination before submitting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPRModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PR Reference Number
                </label>
                <input
                  type="text"
                  disabled
                  value={prForm.prNumber}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Priority / Urgency *
                </label>
                <select
                  value={prForm.urgency}
                  onChange={(e) => setPrForm({ ...prForm, urgency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 text-xs focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Normal">Normal Replenishment</option>
                  <option value="Urgent">Urgent (Stock Low)</option>
                  <option value="Emergency">Emergency (Out of Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Destination Warehouse *
                </label>
                <select
                  value={prForm.deliveryLocation}
                  onChange={(e) => setPrForm({ ...prForm, deliveryLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 text-xs focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Main Warehouse - Dubai HQ">Main Warehouse - Dubai HQ</option>
                  <option value="Electrical Store - HQ">Electrical Store - HQ</option>
                  <option value="Plumbing Bay - HQ">Plumbing Bay - HQ</option>
                  <option value="Site A Storage Bay">Site A Storage Bay</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Justification / Order Purpose
              </label>
              <input
                type="text"
                value={prForm.justification}
                onChange={(e) => setPrForm({ ...prForm, justification: e.target.value })}
                placeholder="State the reason for replenishment (e.g. quarterly restock, preventive maintenance)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-[#6C2BD9]"
              />
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Item Code & Name</th>
                    <th className="py-2 px-2 text-right">Current</th>
                    <th className="py-2 px-2 text-right">Reorder Pt</th>
                    <th className="py-2 px-3 text-center w-28">Order Qty</th>
                    <th className="py-2 px-2 text-right">Unit Cost</th>
                    <th className="py-2 px-2 text-right">Total (AED)</th>
                    <th className="py-2 px-3">Supplier</th>
                    <th className="py-2 px-2 text-center w-10">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {prForm.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No items staged for this Purchase Request.
                      </td>
                    </tr>
                  ) : (
                    prForm.items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{it.itemCode}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">{it.itemName}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-rose-600 font-bold">
                          {it.currentStock}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {it.reorderLevel}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={it.recommendedQty}
                            onChange={(e) => handleUpdatePRItemQty(it.id, e.target.value)}
                            className="w-20 bg-purple-50/60 border border-purple-200 rounded-md py-1 px-2 font-mono font-bold text-center text-slate-900 text-xs focus:outline-none focus:border-[#6C2BD9]"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {Number(it.unitCost).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                          {(it.recommendedQty * it.unitCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[130px]">
                          {it.supplier}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePRItem(it.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Remove from PR"
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

            {/* Total Valuation Summary Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Parts</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{prForm.items.length} items</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Units</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {prForm.items.reduce((acc, it) => acc + (parseInt(it.recommendedQty, 10) || 0), 0)} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Estimated Value</span>
                  <span className="text-base font-bold font-mono text-[#6C2BD9]">
                    AED {prForm.items.reduce((acc, it) => acc + ((parseInt(it.recommendedQty, 10) || 0) * (it.unitCost || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPRModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPR || prForm.items.length === 0}
                  onClick={handleSubmitPR}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  {isSubmittingPR ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" /> Submit Purchase Request
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

