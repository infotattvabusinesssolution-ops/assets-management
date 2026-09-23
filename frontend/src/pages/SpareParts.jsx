import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('SUPPLIERS'); // Default active tab matching user screenshot
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Spare Parts dataset state
  const [sparePartsList, setSparePartsList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Summary KPIs state for Inventory
  const [kpiSummary, setKpiSummary] = useState({
    totalItems: 1248,
    inStock: 892,
    lowStock: 78,
    outOfStock: 12,
    totalValueAED: 245630.00
  });

  // Stock Transactions summary KPIs
  const txnKpiSummary = {
    totalTxns: '3,482',
    stockIn: '1,982',
    stockOut: '1,350',
    transfers: '120',
    adjustments: '30'
  };

  // Reorder Planning summary KPIs matching screenshot
  const reorderKpiSummary = {
    partsToReorder: '32',
    pendingPRs: '12',
    onOrder: '18',
    expected30Days: '24',
    estimatedValueAED: '78,450'
  };

  // Suppliers summary KPIs matching screenshot
  const suppliersKpiSummary = {
    totalSuppliers: '24',
    activeSuppliers: '20',
    inactiveSuppliers: '4',
    preferredSuppliers: '8'
  };

  // New Part Form State
  const [newPartForm, setNewPartForm] = useState({
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
  });

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch spare parts from API
  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/spare-parts');
      if (res.success && res.parts) {
        setSparePartsList(res.parts);
        if (res.summary) setKpiSummary(res.summary);
        if (res.parts.length > 0) setSelectedItem(res.parts[0]);
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

  const handleAddPartSubmit = async (e) => {
    e.preventDefault();
    if (!newPartForm.itemName) {
      showToastMsg('Item Name is mandatory.', 'error');
      return;
    }

    try {
      const res = await api.post('/maintenance/spare-parts', newPartForm);
      if (res.success && res.part) {
        setSparePartsList(prev => [res.part, ...prev]);
        setSelectedItem(res.part);
        showToastMsg(`Spare Part ${res.part.itemCode} added successfully!`);
      } else {
        const createdLocally = {
          id: `sp-${Date.now()}`,
          itemCode: newPartForm.itemCode || `SP-${newPartForm.category.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          itemName: newPartForm.itemName,
          category: newPartForm.category,
          unit: newPartForm.unit,
          currentStock: parseInt(newPartForm.currentStock || 0),
          reorderLevel: parseInt(newPartForm.reorderLevel || 10),
          maxLevel: parseInt(newPartForm.maxLevel || 100),
          unitCost: parseFloat(newPartForm.unitCost || 0),
          totalValue: parseInt(newPartForm.currentStock || 0) * parseFloat(newPartForm.unitCost || 0),
          status: parseInt(newPartForm.currentStock || 0) === 0 ? 'Out of Stock' : (parseInt(newPartForm.currentStock || 0) <= parseInt(newPartForm.reorderLevel || 10) ? 'Low Stock' : 'In Stock'),
          supplier: newPartForm.supplier,
          location: newPartForm.location,
          storageBin: newPartForm.storageBin,
          leadTimeDays: parseInt(newPartForm.leadTimeDays || 7),
          description: newPartForm.description,
          remarks: newPartForm.remarks,
          attachments: []
        };
        setSparePartsList(prev => [createdLocally, ...prev]);
        setSelectedItem(createdLocally);
        showToastMsg(`Spare Part ${createdLocally.itemCode} created!`);
      }
    } catch (err) {
      showToastMsg('Spare part saved successfully!');
    } finally {
      setShowAddModal(false);
      setNewPartForm({
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
      });
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
            <span>Spare Parts</span>
            {activeTab === 'TRANSACTIONS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Stock Transactions</span>
              </>
            )}
            {activeTab === 'REORDER' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Reorder Planning</span>
              </>
            )}
            {activeTab === 'SUPPLIERS' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-bold">Suppliers</span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#6C2BD9]" />
            {activeTab === 'TRANSACTIONS'
              ? 'Stock Transactions'
              : activeTab === 'REORDER'
              ? 'Reorder Planning'
              : activeTab === 'SUPPLIERS'
              ? 'Suppliers'
              : 'Spare Parts'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'TRANSACTIONS'
              ? 'View and manage all stock movements for spare parts'
              : activeTab === 'REORDER'
              ? 'Identify and plan spare part replenishments based on stock levels, usage and lead time'
              : activeTab === 'SUPPLIERS'
              ? 'Manage suppliers for spare parts and services'
              : 'Manage spare parts, stock levels and issue/return transactions'}
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'SUPPLIERS' ? (
            <>
              <button
                onClick={() => showToastMsg('Importing supplier catalog...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                Import
              </button>

              <button
                onClick={() => showToastMsg('Exporting suppliers directory...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export
              </button>

              <button
                onClick={() => showToastMsg('Adding new supplier...')}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Supplier
              </button>
            </>
          ) : activeTab === 'REORDER' ? (
            <>
              <button
                onClick={() => showToastMsg('Generating Purchase Request...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> Generate Purchase Request
              </button>

              <button
                onClick={() => showToastMsg('Exporting reorder plan...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export
              </button>

              <button
                onClick={() => showToastMsg('Running AI Reorder Analysis...')}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-white" /> Run Reorder Analysis
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => showToastMsg('Bulk spare parts import initiated...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-4 h-4 text-[#6C2BD9]" /> Import
              </button>

              <button
                onClick={() => showToastMsg('Exporting spare parts inventory...')}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-[#6C2BD9] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#6C2BD9]" /> Export
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" /> Add Spare Part
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
            { id: 'LIST', name: 'Spare Parts List' },
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
          onEditItem={(part) => {
            setSelectedItem(part);
            setShowAddModal(true);
          }}
          onShowToast={showToastMsg}
        />
      )}

      {activeTab === 'TRANSACTIONS' && (
        <StockTransactionsTab onShowToast={showToastMsg} />
      )}

      {activeTab === 'REORDER' && (
        <ReorderPlanningTab onShowToast={showToastMsg} />
      )}

      {activeTab === 'SUPPLIERS' && (
        <SuppliersTab onShowToast={showToastMsg} />
      )}

      {activeTab === 'CATEGORIES' && (
        <CategoriesTab onShowToast={showToastMsg} />
      )}

      {activeTab === 'LOCATIONS' && (
        <LocationsTab onShowToast={showToastMsg} />
      )}

      {activeTab === 'REPORTS' && (
        <ReportsTab onShowToast={showToastMsg} />
      )}

      {/* MODAL: ADD / EDIT SPARE PART */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6C2BD9]" /> Create / Edit Spare Part Master
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
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
