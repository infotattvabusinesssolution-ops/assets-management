import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Coins,
  Upload,
  Download,
  Plus,
  ChevronRight,
  Layers,
  MapPin,
  BarChart3,
  Building2,
  RefreshCw,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpDown,
  FileText,
  ShoppingCart,
  Clock,
  Truck,
  Calendar,
  Users,
  Ban,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { SparePartsListTab } from '../components/spareParts/SparePartsListTab';
import { StockTransactionsTab } from '../components/spareParts/StockTransactionsTab';
import { ReorderPlanningTab } from '../components/spareParts/ReorderPlanningTab';
import { SuppliersTab } from '../components/spareParts/SuppliersTab';
import { CategoriesTab } from '../components/spareParts/CategoriesTab';
import { LocationsTab } from '../components/spareParts/LocationsTab';
import { ReportsTab } from '../components/spareParts/ReportsTab';

export function SpareParts() {
  const location = useLocation();

  const getInitialTab = () => {
    const path = (location.pathname || '').toLowerCase();
    const search = (location.search || '').toLowerCase();
    if (path.includes('levels') || search.includes('tab=reorder') || search.includes('tab=levels')) return 'REORDER';
    if (path.includes('ledger') || search.includes('tab=transactions') || search.includes('tab=ledger')) return 'TRANSACTIONS';
    if (search.includes('tab=suppliers') || path.endsWith('/suppliers')) return 'SUPPLIERS';
    if (search.includes('tab=categories') || path.endsWith('/categories')) return 'CATEGORIES';
    if (search.includes('tab=locations') || path.endsWith('/locations')) return 'LOCATIONS';
    if (search.includes('tab=reports') || path.endsWith('/reports')) return 'REPORTS';
    if (path.includes('spare-parts') || path.includes('inventory') || search.includes('tab=list')) return 'LIST';
    return 'LIST';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const path = (location.pathname || '').toLowerCase();
    const search = (location.search || '').toLowerCase();
    if (path.includes('levels') || search.includes('tab=reorder') || search.includes('tab=levels')) {
      setActiveTab('REORDER');
    } else if (path.includes('ledger') || search.includes('tab=transactions') || search.includes('tab=ledger')) {
      setActiveTab('TRANSACTIONS');
    } else if (search.includes('tab=suppliers') || path.endsWith('/suppliers')) {
      setActiveTab('SUPPLIERS');
    } else if (search.includes('tab=categories') || path.endsWith('/categories')) {
      setActiveTab('CATEGORIES');
    } else if (search.includes('tab=locations') || path.endsWith('/locations')) {
      setActiveTab('LOCATIONS');
    } else if (search.includes('tab=reports') || path.endsWith('/reports')) {
      setActiveTab('REPORTS');
    } else if (path.includes('spare-parts') || path.includes('inventory') || search.includes('tab=list')) {
      setActiveTab('LIST');
    } else {
      setActiveTab('LIST');
    }
  }, [location.pathname, location.search]);

  // Spare Parts dataset state
  const [sparePartsList, setSparePartsList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  // Summary KPIs state for Inventory
  const [kpiSummary, setKpiSummary] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValueAED: 0
  });

  // Stock Transactions summary KPIs
  const [txnKpiSummary, setTxnKpiSummary] = useState({
    totalTxns: '10',
    stockIn: '3',
    stockOut: '3',
    transfers: '2',
    adjustments: '2'
  });

  // Reorder Planning summary KPIs matching screenshot
  const [reorderKpiSummary, setReorderKpiSummary] = useState({
    partsToReorder: '0',
    pendingPRs: '0',
    onOrder: '3',
    expected30Days: '0',
    estimatedValueAED: '0.00'
  });

  // State triggers for actions from header buttons
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [listTrigger, setListTrigger] = useState(null);
  const [txnTrigger, setTxnTrigger] = useState(null);
  const [reorderTrigger, setReorderTrigger] = useState(null);
  const [supplierTrigger, setSupplierTrigger] = useState(null);
  const [categoryTrigger, setCategoryTrigger] = useState(null);
  const [locationTrigger, setLocationTrigger] = useState(null);
  const [reportsTrigger, setReportsTrigger] = useState(null);
  const [supplierCount, setSupplierCount] = useState(24);

  // Suppliers summary KPIs matching screenshot
  const suppliersKpiSummary = {
    totalSuppliers: String(supplierCount),
    activeSuppliers: String(Math.max(0, supplierCount - 4)),
    inactiveSuppliers: '4',
    preferredSuppliers: '8'
  };

  const initialPartForm = {
    itemCode: '',
    itemName: '',
    category: 'HVAC',
    unit: 'Piece',
    currentStock: '50',
    reorderLevel: '10',
    maxLevel: '100',
    unitCost: '85.00',
    supplier: 'Al Futtaim Trading LLC',
    location: 'Main Warehouse - Dubai HQ',
    storageBin: 'A1-R1-B1',
    leadTimeDays: '7',
    description: '',
    remarks: ''
  };

  // New/Edit Part Form State
  const [newPartForm, setNewPartForm] = useState(initialPartForm);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Download CSV helper
  const downloadCSV = (filename, content) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (activeTab === 'LIST' && sparePartsList.length > 0) {
      const headers = ['Item Code', 'Item Name', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Max Level', 'Unit Cost (AED)', 'Total Value (AED)', 'Status', 'Supplier', 'Location', 'Storage Bin'];
      const rows = sparePartsList.map(p => [
        p.itemCode,
        `"${(p.itemName || '').replace(/"/g, '""')}"`,
        p.category,
        p.unit,
        p.currentStock,
        p.reorderLevel,
        p.maxLevel,
        p.unitCost,
        p.totalValue,
        p.status,
        `"${(p.supplier || '').replace(/"/g, '""')}"`,
        `"${(p.location || '').replace(/"/g, '""')}"`,
        p.storageBin
      ]);
      downloadCSV('spare_parts_inventory.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      showToastMsg('Spare parts inventory exported to CSV.');
    } else {
      showToastMsg(`Export initiated for ${activeTab.toLowerCase()}.`);
    }
  };

  // Fetch spare parts from API
  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/spare-parts');
      if (res.success && res.parts) {
        setSparePartsList(res.parts);
        if (res.summary) setKpiSummary(res.summary);
        if (res.parts.length > 0 && !selectedItem) {
          setSelectedItem(res.parts[0]);
        }
      }
    } catch (err) {
      console.warn('Fallback to local spare parts store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPart(null);
    setNewPartForm(initialPartForm);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (part) => {
    if (!part) return;
    setEditingPart(part);
    setSelectedItem(part);
    setNewPartForm({
      itemCode: part.itemCode || '',
      itemName: part.itemName || '',
      category: part.category || 'HVAC',
      unit: part.unit || 'Piece',
      currentStock: String(part.currentStock ?? 0),
      reorderLevel: String(part.reorderLevel ?? 10),
      maxLevel: String(part.maxLevel ?? 100),
      unitCost: String(part.unitCost ?? 0),
      supplier: part.supplier || '',
      location: part.location || '',
      storageBin: part.storageBin || '',
      leadTimeDays: String(part.leadTimeDays ?? 7),
      description: part.description || '',
      remarks: part.remarks || ''
    });
    setShowAddModal(true);
  };

  const handleDeletePart = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) return;
    try {
      const res = await api.delete(`/maintenance/spare-parts/${partId}`);
      if (res.success) {
        setSparePartsList(prev => prev.filter(p => p.id !== partId && p.itemCode !== partId));
        showToastMsg('Spare part deleted successfully.');
        fetchParts();
      } else {
        showToastMsg(res.message || 'Error deleting part', 'error');
      }
    } catch (err) {
      showToastMsg('Failed to delete spare part.', 'error');
    }
  };

  const handleBulkDeleteParts = async (ids) => {
    if (!ids || ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected spare part(s)?`)) return;
    try {
      const res = await api.post('/maintenance/spare-parts/bulk-delete', { ids });
      if (res.success) {
        setSparePartsList(prev => prev.filter(p => !ids.includes(p.id) && !ids.includes(p.itemCode)));
        showToastMsg(`${ids.length} spare parts deleted successfully.`);
        fetchParts();
      }
    } catch (err) {
      showToastMsg('Failed to delete selected parts.', 'error');
    }
  };

  const handleAddPartSubmit = async (e) => {
    e.preventDefault();
    if (!newPartForm.itemName) {
      showToastMsg('Item Name is mandatory.', 'error');
      return;
    }

    try {
      if (editingPart) {
        // UPDATE EXISTING SPARE PART
        const res = await api.put(`/maintenance/spare-parts/${editingPart.id}`, newPartForm);
        if (res.success && res.part) {
          setSparePartsList(prev => prev.map(p => p.id === editingPart.id ? res.part : p));
          setSelectedItem(res.part);
          showToastMsg(`Spare Part ${res.part.itemCode} updated successfully!`);
          fetchParts();
        } else {
          showToastMsg(res.message || 'Error updating spare part', 'error');
        }
      } else {
        // CREATE NEW SPARE PART
        const res = await api.post('/maintenance/spare-parts', newPartForm);
        if (res.success && res.part) {
          setSparePartsList(prev => [res.part, ...prev]);
          setSelectedItem(res.part);
          showToastMsg(`Spare Part ${res.part.itemCode} added successfully!`);
          fetchParts();
        } else {
          showToastMsg(res.message || 'Error creating spare part', 'error');
        }
      }
    } catch (err) {
      showToastMsg('Failed to save spare part.', 'error');
    } finally {
      setShowAddModal(false);
      setEditingPart(null);
      setNewPartForm(initialPartForm);
    }
  };

  return (
    <div className="space-y-4 pb-12 text-slate-800 bg-slate-50/50 min-h-screen">
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs flex items-center gap-2 font-medium ${
          toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>
      )}

      {/* Top Header Bar matching Screenshot */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Maintenance</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Spare Parts & Inventory</span>
            {activeTab === 'TRANSACTIONS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Stock Transactions / Ledger</span>
              </>
            )}
            {activeTab === 'REORDER' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Stock Levels & Reorder Planning</span>
              </>
            )}
            {activeTab === 'SUPPLIERS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Suppliers</span>
              </>
            )}
            {activeTab === 'CATEGORIES' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Categories</span>
              </>
            )}
            {activeTab === 'LOCATIONS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Locations</span>
              </>
            )}
            {activeTab === 'REPORTS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Reports</span>
              </>
            )}
            {activeTab === 'LIST' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Spare Parts List</span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#6C2BD9]" />
            {activeTab === 'TRANSACTIONS'
              ? 'Stock Transactions / Ledger'
              : activeTab === 'REORDER'
              ? 'Stock Levels & Reorder Planning'
              : activeTab === 'SUPPLIERS'
              ? 'Suppliers'
              : activeTab === 'CATEGORIES'
              ? 'Spare Part Categories'
              : activeTab === 'LOCATIONS'
              ? 'Warehouses & Locations'
              : activeTab === 'REPORTS'
              ? 'Analytical Reports & Valuation'
              : 'Spare Parts List'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'TRANSACTIONS'
              ? 'View and manage all stock movements, issues, returns, and transfers'
              : activeTab === 'REORDER'
              ? 'Identify and plan spare part replenishments based on stock levels, usage, and lead time'
              : activeTab === 'SUPPLIERS'
              ? 'Manage suppliers for spare parts and services'
              : activeTab === 'CATEGORIES'
              ? 'Configure spare parts classification and reorder policies'
              : activeTab === 'LOCATIONS'
              ? 'Manage warehouses, storage zones, shelves, and bin allocations'
              : activeTab === 'REPORTS'
              ? 'Generate and download detailed inventory analysis and valuation statements'
              : 'Manage spare parts inventory, stock on hand, bin locations, and unit costs'}
          </p>
        </div>

        {/* Top Header Actions dynamically adapting to Active Tab */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'LIST' && (
            <>
              <button
                onClick={() => setListTrigger({ type: 'import', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-4 h-4 text-[#6C2BD9]" /> Import CSV
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export CSV
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Spare Part
              </button>
            </>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <>
              <button
                onClick={() => setTxnTrigger({ type: 'export', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export Ledger
              </button>

              <button
                onClick={() => setTxnTrigger({ type: 'newTxn', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> New Transaction
              </button>
            </>
          )}

          {activeTab === 'REORDER' && (
            <>
              <button
                onClick={() => setReorderTrigger({ type: 'createPR', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> Generate PR
              </button>

              <button
                onClick={() => setReorderTrigger({ type: 'export', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export Plan
              </button>

              <button
                onClick={() => setReorderTrigger({ type: 'runAnalysis', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-white" /> Run Reorder Analysis
              </button>
            </>
          )}

          {activeTab === 'SUPPLIERS' && (
            <>
              <button
                onClick={() => setSupplierTrigger({ type: 'import', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-4 h-4 text-[#6C2BD9]" /> Import Catalog
              </button>

              <button
                onClick={() => setSupplierTrigger({ type: 'export', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export Directory
              </button>

              <button
                onClick={() => setSupplierTrigger({ type: 'add', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Supplier
              </button>
            </>
          )}

          {activeTab === 'CATEGORIES' && (
            <>
              <button
                onClick={() => setCategoryTrigger({ type: 'export', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export CSV
              </button>

              <button
                onClick={() => setCategoryTrigger({ type: 'add', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Category
              </button>
            </>
          )}

          {activeTab === 'LOCATIONS' && (
            <>
              <button
                onClick={() => setLocationTrigger({ type: 'export', timestamp: Date.now() })}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export CSV
              </button>

              <button
                onClick={() => setLocationTrigger({ type: 'add', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Location
              </button>
            </>
          )}

          {activeTab === 'REPORTS' && (
            <>
              <button
                onClick={() => setReportsTrigger({ type: 'downloadAll', timestamp: Date.now() })}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-white" /> Download All Reports
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Summary Cards Row matching Screenshot */}
      {activeTab === 'SUPPLIERS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Suppliers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#6C2BD9]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Total Suppliers</p>
              <p className="text-xl font-bold text-slate-900">{suppliersKpiSummary.totalSuppliers}</p>
            </div>
          </div>

          {/* Card 2: Active Suppliers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Active Suppliers</p>
              <p className="text-xl font-bold text-slate-900">{suppliersKpiSummary.activeSuppliers}</p>
            </div>
          </div>

          {/* Card 3: Inactive Suppliers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Inactive Suppliers</p>
              <p className="text-xl font-bold text-slate-900">{suppliersKpiSummary.inactiveSuppliers}</p>
            </div>
          </div>

          {/* Card 4: Preferred Suppliers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#6C2BD9]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Preferred Suppliers</p>
              <p className="text-xl font-bold text-slate-900">{suppliersKpiSummary.preferredSuppliers}</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'REORDER' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Parts to Reorder */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Parts to Reorder</p>
              <p className="text-xl font-bold text-slate-900">{reorderKpiSummary.partsToReorder}</p>
            </div>
          </div>

          {/* Card 2: Pending PRs */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Pending PRs</p>
              <p className="text-xl font-bold text-slate-900">{reorderKpiSummary.pendingPRs}</p>
            </div>
          </div>

          {/* Card 3: On Order */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">On Order</p>
              <p className="text-xl font-bold text-slate-900">{reorderKpiSummary.onOrder}</p>
            </div>
          </div>

          {/* Card 4: Expected in 30 Days */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Expected in 30 Days</p>
              <p className="text-xl font-bold text-slate-900">{reorderKpiSummary.expected30Days}</p>
            </div>
          </div>

          {/* Card 5: Estimated Value (AED) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-[#6C2BD9]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Estimated Value (AED)</p>
              <p className="text-xl font-extrabold text-slate-900 font-mono">
                {reorderKpiSummary.estimatedValueAED}
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === 'TRANSACTIONS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Total Transactions</p>
              <p className="text-xl font-bold text-slate-900">{txnKpiSummary.totalTxns}</p>
            </div>
          </div>

          {/* Card 2: Stock In */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Stock In</p>
              <p className="text-xl font-bold text-slate-900">{txnKpiSummary.stockIn}</p>
            </div>
          </div>

          {/* Card 3: Stock Out */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Stock Out</p>
              <p className="text-xl font-bold text-slate-900">{txnKpiSummary.stockOut}</p>
            </div>
          </div>

          {/* Card 4: Transfers */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Transfers</p>
              <p className="text-xl font-bold text-slate-900">{txnKpiSummary.transfers}</p>
            </div>
          </div>

          {/* Card 5: Adjustments */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-5 h-5 text-[#6C2BD9]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Adjustments</p>
              <p className="text-xl font-bold text-slate-900">{txnKpiSummary.adjustments}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Spare Parts */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Total Spare Parts</p>
              <p className="text-xl font-bold text-slate-900">{kpiSummary.totalItems.toLocaleString()}</p>
            </div>
          </div>

          {/* Card 2: In Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">In Stock</p>
              <p className="text-xl font-bold text-slate-900">{kpiSummary.inStock.toLocaleString()}</p>
            </div>
          </div>

          {/* Card 3: Low Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Low Stock</p>
              <p className="text-xl font-bold text-slate-900">{kpiSummary.lowStock.toLocaleString()}</p>
            </div>
          </div>

          {/* Card 4: Out of Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Out of Stock</p>
              <p className="text-xl font-bold text-slate-900">{kpiSummary.outOfStock.toLocaleString()}</p>
            </div>
          </div>

          {/* Card 5: Total Value (AED) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-black">Total Value (AED)</p>
              <p className="text-xl font-extrabold text-[#6C2BD9] font-mono">
                {kpiSummary.totalValueAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7 Workspace Navigation Tabs Bar matching Screenshot */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-1 overflow-x-auto">
        <div className="flex items-center min-w-max text-xs font-semibold">
          {[
            {
              id: 'LIST',
              name: 'Spare Parts List'
            },
            { id: 'TRANSACTIONS', name: 'Stock Transactions' },
            { id: 'REORDER', name: 'Reorder Planning' },
            { id: 'SUPPLIERS', name: 'Suppliers' },
            { id: 'CATEGORIES', name: 'Categories' },
            { id: 'LOCATIONS', name: 'Locations' },
            { id: 'REPORTS', name: 'Reports' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-lg border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-purple-100 border-[#6C2BD9] text-black font-extrabold'
                  : 'border-transparent text-black font-semibold hover:text-black hover:bg-purple-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE MODULAR TAB RENDERER */}
      {activeTab === 'LIST' && (
        <SparePartsListTab
          sparePartsList={sparePartsList}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          onEditItem={handleOpenEditModal}
          onDeletePart={handleDeletePart}
          onBulkDelete={handleBulkDeleteParts}
          onExportCSV={handleExportCSV}
          onShowToast={showToastMsg}
          onRefresh={fetchParts}
          categoryFilterProp={selectedCategory}
          triggerImport={listTrigger}
        />
      )}

      {activeTab === 'TRANSACTIONS' && (
        <StockTransactionsTab
          sparePartsList={sparePartsList}
          onStockUpdated={fetchParts}
          onShowToast={showToastMsg}
          triggerNewTxn={txnTrigger?.type === 'newTxn' ? txnTrigger : null}
          triggerExport={txnTrigger?.type === 'export' ? txnTrigger : null}
        />
      )}

      {activeTab === 'REORDER' && (
        <ReorderPlanningTab
          sparePartsList={sparePartsList}
          onReorderUpdated={fetchParts}
          onShowToast={showToastMsg}
          triggerCreatePR={reorderTrigger?.type === 'createPR' ? reorderTrigger : null}
          triggerExport={reorderTrigger?.type === 'export' ? reorderTrigger : null}
          triggerRunAnalysis={reorderTrigger?.type === 'runAnalysis' ? reorderTrigger : null}
        />
      )}

      {activeTab === 'SUPPLIERS' && (
        <SuppliersTab
          onShowToast={showToastMsg}
          triggerAdd={supplierTrigger?.type === 'add' ? supplierTrigger : null}
          triggerExport={supplierTrigger?.type === 'export' ? supplierTrigger : null}
          triggerImport={supplierTrigger?.type === 'import' ? supplierTrigger : null}
          onSupplierCountChange={setSupplierCount}
        />
      )}

      {activeTab === 'CATEGORIES' && (
        <CategoriesTab
          sparePartsList={sparePartsList}
          onSelectCategory={(catName) => {
            setSelectedCategory(catName);
            setActiveTab('LIST');
          }}
          onShowToast={showToastMsg}
          triggerAdd={categoryTrigger?.type === 'add' ? categoryTrigger : null}
          triggerExport={categoryTrigger?.type === 'export' ? categoryTrigger : null}
        />
      )}

      {activeTab === 'LOCATIONS' && (
        <LocationsTab
          sparePartsList={sparePartsList}
          onShowToast={showToastMsg}
          triggerAdd={locationTrigger?.type === 'add' ? locationTrigger : null}
          triggerExport={locationTrigger?.type === 'export' ? locationTrigger : null}
        />
      )}

      {activeTab === 'REPORTS' && (
        <ReportsTab
          sparePartsList={sparePartsList}
          kpiSummary={kpiSummary}
          onShowToast={showToastMsg}
          triggerDownloadAll={reportsTrigger?.type === 'downloadAll' ? reportsTrigger : null}
        />
      )}

      {/* MODAL: ADD / EDIT SPARE PART */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6C2BD9]" /> {editingPart ? `Edit Spare Part: ${editingPart.itemCode}` : 'Create Spare Part Master'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newPartForm.itemCode}
                    onChange={(e) => setNewPartForm({ ...newPartForm, itemCode: e.target.value })}
                    placeholder="Auto-generated e.g. SP-HVAC-011"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartForm.itemName}
                    onChange={(e) => setNewPartForm({ ...newPartForm, itemName: e.target.value })}
                    placeholder="e.g. Air Filter (AHU)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newPartForm.category}
                    onChange={(e) => setNewPartForm({ ...newPartForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9] font-semibold"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Fire & Safety">Fire & Safety</option>
                    <option value="Generators">Generators</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={newPartForm.unit}
                    onChange={(e) => setNewPartForm({ ...newPartForm, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Meter">Meter</option>
                    <option value="Set">Set</option>
                    <option value="Liter">Liter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Cost (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPartForm.unitCost}
                    onChange={(e) => setNewPartForm({ ...newPartForm, unitCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={newPartForm.currentStock}
                    onChange={(e) => setNewPartForm({ ...newPartForm, currentStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newPartForm.reorderLevel}
                    onChange={(e) => setNewPartForm({ ...newPartForm, reorderLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Maximum Level</label>
                  <input
                    type="number"
                    value={newPartForm.maxLevel}
                    onChange={(e) => setNewPartForm({ ...newPartForm, maxLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Primary Supplier</label>
                  <input
                    type="text"
                    value={newPartForm.supplier}
                    onChange={(e) => setNewPartForm({ ...newPartForm, supplier: e.target.value })}
                    placeholder="Al Futtaim Trading LLC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Preferred Storage Location</label>
                  <input
                    type="text"
                    value={newPartForm.location}
                    onChange={(e) => setNewPartForm({ ...newPartForm, location: e.target.value })}
                    placeholder="Main Warehouse - Dubai HQ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPartForm.description}
                  onChange={(e) => setNewPartForm({ ...newPartForm, description: e.target.value })}
                  placeholder="Technical description of spare part..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
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
                  {editingPart ? 'Update Spare Part' : 'Save Spare Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
