import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Save,
  RotateCcw,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Layers,
  Check,
  Building,
  User,
  Tag,
  ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

export function ReceivingHistory() {
  const navigate = useNavigate();

  // Search & Filter State (Matching exact fields in reference screenshot)
  const [filters, setFilters] = useState({
    receiveNumber: '',
    poNumber: '',
    receiveType: 'All Types',
    status: 'All Status',
    fromDate: '',
    toDate: '',
    supplier: 'All Suppliers',
    category: 'All Categories',
    location: 'All Locations',
    receivedBy: 'All Users',
    taggingStatus: 'All'
  });

  const [savedView, setSavedView] = useState('All Receives');

  // Receive Transactions Main List (10 rows matching exact screenshot data)
  const [transactions, setTransactions] = useState([
    {
      id: 'rcv-01',
      receiveNumber: 'RCV-2026-00125',
      receiveDate: '21 Aug 2026',
      receiveTime: '21 Aug 2026 10:45',
      poNumber: 'PO-2026-00456',
      supplier: 'Dell Technologies',
      receiveType: 'With PO',
      itemsCount: 25,
      taggedCount: 25,
      status: 'Completed',
      receivedBy: 'John Doe',
      location: 'IT Store - Dubai HQ',
      remarks: 'Laptops and accessories for IT dept.',
      items: [
        { id: 'item-01', idx: 1, assetName: 'Dell Latitude 7450', serialNumber: 'DL7450-001', tagNumber: 'E36000012345', tagStatus: 'Tagged' },
        { id: 'item-02', idx: 2, assetName: 'Dell Latitude 7450', serialNumber: 'DL7450-002', tagNumber: 'E36000012346', tagStatus: 'Tagged' },
        { id: 'item-03', idx: 3, assetName: 'Dell Docking Station', serialNumber: 'WD19S-2210', tagNumber: 'E36000012347', tagStatus: 'Tagged' },
        { id: 'item-04', idx: 4, assetName: 'Dell Monitor 27"', serialNumber: 'SM27-3310', tagNumber: 'E36000012348', tagStatus: 'Tagged' },
        { id: 'item-05', idx: 5, assetName: 'Dell Keyboard', serialNumber: 'KM7321W', tagNumber: 'E36000012349', tagStatus: 'Tagged' }
      ]
    },
    {
      id: 'rcv-02',
      receiveNumber: 'RCV-2026-00124',
      receiveDate: '20 Aug 2026',
      receiveTime: '20 Aug 2026 14:15',
      poNumber: 'PO-2026-00451',
      supplier: 'HP Middle East',
      receiveType: 'With PO',
      itemsCount: 40,
      taggedCount: 38,
      status: 'Partial',
      receivedBy: 'Sara Ahmed',
      location: 'Admin Block',
      remarks: 'Printers intake',
      items: [
        { id: 'item-06', idx: 1, assetName: 'HP LaserJet Pro', serialNumber: 'CNB89001', tagNumber: 'E36000012350', tagStatus: 'Tagged' }
      ]
    },
    {
      id: 'rcv-03',
      receiveNumber: 'RCV-2026-00123',
      receiveDate: '18 Aug 2026',
      receiveTime: '18 Aug 2026 09:30',
      poNumber: '-',
      supplier: 'Local Purchase',
      receiveType: 'Without PO',
      itemsCount: 12,
      taggedCount: 12,
      status: 'Completed',
      receivedBy: 'Ahmed Khan',
      location: 'Finance Dept',
      remarks: 'Urgent office accessories',
      items: [
        { id: 'item-07', idx: 1, assetName: 'Office Ergonomic Chair', serialNumber: 'CH-5567', tagNumber: 'E36000012351', tagStatus: 'Tagged' }
      ]
    },
    {
      id: 'rcv-04',
      receiveNumber: 'RCV-2026-00122',
      receiveDate: '17 Aug 2026',
      receiveTime: '17 Aug 2026 16:00',
      poNumber: 'PO-2026-00448',
      supplier: 'Lenovo FZCO',
      receiveType: 'With PO',
      itemsCount: 30,
      taggedCount: 0,
      status: 'Pending Tagging',
      receivedBy: 'Priya Nair',
      location: 'Dubai HQ',
      remarks: 'ThinkPads received',
      items: []
    },
    {
      id: 'rcv-05',
      receiveNumber: 'RCV-2026-00121',
      receiveDate: '15 Aug 2026',
      receiveTime: '15 Aug 2026 11:10',
      poNumber: '-',
      supplier: 'Internal Transfer',
      receiveType: 'Without PO',
      itemsCount: 8,
      taggedCount: 8,
      status: 'Completed',
      receivedBy: 'John Doe',
      location: 'IT Store',
      remarks: 'Transferred from Abu Dhabi branch',
      items: []
    },
    {
      id: 'rcv-06',
      receiveNumber: 'RCV-2026-00120',
      receiveDate: '14 Aug 2026',
      receiveTime: '14 Aug 2026 13:45',
      poNumber: 'PO-2026-00440',
      supplier: 'Apple Inc.',
      receiveType: 'With PO',
      itemsCount: 15,
      taggedCount: 15,
      status: 'Completed',
      receivedBy: 'Omar Ali',
      location: 'HR Dept',
      remarks: 'MacBooks for executive suite',
      items: []
    },
    {
      id: 'rcv-07',
      receiveNumber: 'RCV-2026-00119',
      receiveDate: '12 Aug 2026',
      receiveTime: '12 Aug 2026 10:00',
      poNumber: 'PO-2026-00439',
      supplier: 'Samsung Gulf',
      receiveType: 'With PO',
      itemsCount: 22,
      taggedCount: 20,
      status: 'Partial',
      receivedBy: 'Sara Ahmed',
      location: 'Warehouse',
      remarks: 'Monitors batch 2',
      items: []
    },
    {
      id: 'rcv-08',
      receiveNumber: 'RCV-2026-00118',
      receiveDate: '10 Aug 2026',
      receiveTime: '10 Aug 2026 15:20',
      poNumber: '-',
      supplier: 'Asset Return',
      receiveType: 'Without PO',
      itemsCount: 6,
      taggedCount: 6,
      status: 'Completed',
      receivedBy: 'Khalid Hassan',
      location: 'IT Store',
      remarks: 'Employee exit hardware return',
      items: []
    },
    {
      id: 'rcv-09',
      receiveNumber: 'RCV-2026-00117',
      receiveDate: '08 Aug 2026',
      receiveTime: '08 Aug 2026 12:15',
      poNumber: 'PO-2026-00432',
      supplier: 'Zebra Technologies',
      receiveType: 'With PO',
      itemsCount: 18,
      taggedCount: 18,
      status: 'Completed',
      receivedBy: 'Priya Nair',
      location: 'Warehouse Dock',
      remarks: 'RFID printers and handhelds',
      items: []
    },
    {
      id: 'rcv-10',
      receiveNumber: 'RCV-2026-00116',
      receiveDate: '05 Aug 2026',
      receiveTime: '05 Aug 2026 09:00',
      poNumber: '-',
      supplier: 'Project Allocation',
      receiveType: 'Without PO',
      itemsCount: 10,
      taggedCount: 0,
      status: 'Pending Tagging',
      receivedBy: 'Ahmed Khan',
      location: 'Site B',
      remarks: 'Temporary site intake',
      items: []
    }
  ]);

  // Active Selected Transaction for Right Column Detail Panels
  const [selectedTxId, setSelectedTxId] = useState('rcv-01');
  const [selectedRowIds, setSelectedRowIds] = useState(['rcv-01']);

  // Pagination & Toast state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [toast, setToast] = useState(null);

  const activeTx = transactions.find((t) => t.id === selectedTxId) || transactions[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Row selection handler
  const handleSelectRow = (tx) => {
    setSelectedTxId(tx.id);
    setSelectedRowIds([tx.id]);
  };

  const handleCheckboxToggle = (txId) => {
    setSelectedRowIds((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedRowIds.length === transactions.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(transactions.map((t) => t.id));
    }
  };

  // Filter actions
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    showToast('Applied receive history search filters.');
  };

  const handleResetFilters = () => {
    setFilters({
      receiveNumber: '',
      poNumber: '',
      receiveType: 'All Types',
      status: 'All Status',
      fromDate: '',
      toDate: '',
      supplier: 'All Suppliers',
      category: 'All Categories',
      location: 'All Locations',
      receivedBy: 'All Users',
      taggingStatus: 'All'
    });
    showToast('Reset all filters.');
  };

  const handleExport = () => {
    showToast('Exporting Receive History to Excel / CSV...');
  };

  const handleReprintTags = () => {
    showToast(`Reprinting tags for receive transaction ${activeTx.receiveNumber}`);
  };

  const handleGenerateReport = () => {
    showToast(`Generated Goods Receipt Note report for ${activeTx.receiveNumber}`);
  };

  return (
    <div className="space-y-5 select-none pb-12 font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={clsx(
            'fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4',
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          )}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Page Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <button
              onClick={() => navigate('/receiving')}
              className="hover:text-[#6C2BD9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Receiving &amp; Tagging</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 font-semibold">Receive History</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Receive History</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View and track asset receiving transactions
          </p>
        </div>

        {/* Top Right Export Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Card Component */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
        {/* Filter Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#5B21B6] font-bold text-sm">
            <Filter className="w-4 h-4 text-[#6C2BD9]" />
            <span>Search &amp; Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Saved Views</span>
              <select
                value={savedView}
                onChange={(e) => setSavedView(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All Receives">All Receives</option>
                <option value="Recent 30 Days">Recent 30 Days</option>
                <option value="Pending Tagging">Pending Tagging</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => showToast('Saved view preferences.')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#6C2BD9]" />
              <span>Save View</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Receive Number
              </label>
              <input
                type="text"
                value={filters.receiveNumber}
                onChange={(e) => setFilters((p) => ({ ...p, receiveNumber: e.target.value }))}
                placeholder="Search receive number..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                PO Number
              </label>
              <input
                type="text"
                value={filters.poNumber}
                onChange={(e) => setFilters((p) => ({ ...p, poNumber: e.target.value }))}
                placeholder="Search PO number..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Receive Type
              </label>
              <select
                value={filters.receiveType}
                onChange={(e) => setFilters((p) => ({ ...p, receiveType: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="With PO">With PO</option>
                <option value="Without PO">Without PO</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer font-medium"
              >
                <option value="All Status">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
                <option value="Pending Tagging">Pending Tagging</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.fromDate}
                  onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
                  placeholder="dd/mm/yyyy"
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
                />
                <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.toDate}
                  onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
                  placeholder="dd/mm/yyyy"
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30"
                />
                <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Filter Row 2 & Search Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Supplier
              </label>
              <select
                value={filters.supplier}
                onChange={(e) => setFilters((p) => ({ ...p, supplier: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All Suppliers">All Suppliers</option>
                <option value="Dell Technologies">Dell Technologies</option>
                <option value="HP Middle East">HP Middle East</option>
                <option value="Lenovo FZCO">Lenovo FZCO</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="Desktop">Desktop</option>
                <option value="Printer">Printer</option>
                <option value="Laptop">Laptop</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                <option value="IT Store - Dubai HQ">IT Store - Dubai HQ</option>
                <option value="Admin Block">Admin Block</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Received By
              </label>
              <select
                value={filters.receivedBy}
                onChange={(e) => setFilters((p) => ({ ...p, receivedBy: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All Users">All Users</option>
                <option value="John Doe">John Doe</option>
                <option value="Sara Ahmed">Sara Ahmed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tagging Status
              </label>
              <select
                value={filters.taggingStatus}
                onChange={(e) => setFilters((p) => ({ ...p, taggingStatus: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Tagged">Tagged</option>
                <option value="Untagged">Untagged</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Main Split Layout: Left Table & Right Details Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (Span 8): Receive Transactions Table (45)    */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Header & Table Actions */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#5B21B6]">
                Receive Transactions (45)
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Viewing transaction ${activeTx.receiveNumber}`)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  onClick={handleReprintTags}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Reprint Tags</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-auto max-h-[540px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                  <tr className="border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === transactions.length}
                        onChange={handleSelectAllToggle}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-8 text-slate-500 font-bold whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Receive Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Receive Date</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">PO Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Supplier</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Receive Type</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap text-center">Items</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap text-center">Tagged</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Received By</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {transactions.map((tx, idx) => {
                    const isSelected = selectedRowIds.includes(tx.id);
                    const isActive = selectedTxId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => handleSelectRow(tx)}
                        className={clsx(
                          'transition-colors cursor-pointer',
                          isActive
                            ? 'bg-purple-50/70 border-l-4 border-l-[#6C2BD9]'
                            : isSelected
                            ? 'bg-slate-50/80'
                            : 'hover:bg-slate-50/60'
                        )}
                      >
                        <td
                          className="py-2.5 px-3 text-center whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxToggle(tx.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxToggle(tx.id)}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9] text-xs whitespace-nowrap">
                          {tx.receiveNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {tx.receiveDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#6C2BD9] font-medium text-xs whitespace-nowrap">
                          {tx.poNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {tx.supplier}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {tx.receiveType}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                          {tx.itemsCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                          {tx.taggedCount}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.status === 'Completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              Completed
                            </span>
                          )}
                          {tx.status === 'Partial' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-200 whitespace-nowrap">
                              Partial
                            </span>
                          )}
                          {tx.status === 'Pending Tagging' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/90 text-rose-800 border border-rose-200 whitespace-nowrap">
                              Pending Tagging
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {tx.receivedBy}
                        </td>
                        <td
                          className="py-2.5 px-3 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectRow(tx)}
                            className="p-1 rounded-lg text-[#6C2BD9] hover:bg-purple-100 transition-all cursor-pointer"
                            title="View Transaction"
                          >
                            <Eye className="w-4 h-4 text-[#6C2BD9]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scroll Down Summary */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {transactions.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Span 4): Receive Details, Items, Summary   */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-5">
          {/* Card 1: Receive Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#5B21B6]">Receive Details</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                {activeTx.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Receive Number</span>
                <span className="font-mono font-bold text-[#6C2BD9] text-xs">
                  {activeTx.receiveNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Receive Date</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {activeTx.receiveTime}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">PO Number</span>
                <span className="font-mono font-bold text-[#6C2BD9] text-xs">
                  {activeTx.poNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Supplier</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {activeTx.supplier}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Receive Type</span>
                <span className="text-slate-700 text-xs font-semibold">{activeTx.receiveType}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Location</span>
                <span className="text-slate-700 text-xs font-semibold">{activeTx.location}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Received By</span>
                <span className="text-slate-700 text-xs font-semibold">{activeTx.receivedBy}</span>
              </div>

              <div className="flex items-start justify-between py-1 gap-4">
                <span className="text-slate-500 font-medium text-[11px] shrink-0">Remarks</span>
                <span className="text-slate-700 text-xs text-right italic font-medium">
                  {activeTx.remarks}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Items Received Table Component */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#5B21B6] pb-2 border-b border-slate-100">
              Items Received ({activeTx.itemsCount})
            </h3>

            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                  <tr className="border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                    <th className="py-2 px-2.5 w-6 text-slate-500 font-bold whitespace-nowrap">#</th>
                    <th className="py-2 px-2.5 font-bold whitespace-nowrap">Asset Name</th>
                    <th className="py-2 px-2.5 font-bold whitespace-nowrap">Serial Number</th>
                    <th className="py-2 px-2.5 font-bold whitespace-nowrap">Tag Number</th>
                    <th className="py-2 px-2.5 font-bold whitespace-nowrap">Tag Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {activeTx.items && activeTx.items.length > 0 ? (
                    activeTx.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {item.idx}
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-slate-800 whitespace-nowrap">
                          {item.assetName}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {item.serialNumber}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[#6C2BD9] text-[11px] font-semibold whitespace-nowrap">
                          {item.tagNumber}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            {item.tagStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-400 text-xs">
                        No serialized item records available for this intake.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer View All Items link */}
            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => showToast(`Displaying all ${activeTx.itemsCount} items for ${activeTx.receiveNumber}`)}
                className="text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
              >
                View All {activeTx.itemsCount} Items
              </button>
            </div>
          </div>

          {/* Card 3: Tagging Summary Component */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Tagging Summary
            </h3>

            {/* 4 Stat Badges (Horizontal Flex Row) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Badge 1: Items Received */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <p className="text-base font-black text-slate-900 leading-tight">
                  {activeTx.itemsCount}
                </p>
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-0.5 whitespace-nowrap">
                  Items Received
                </p>
              </div>

              {/* Badge 2: Tagged */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-base font-black text-slate-900 leading-tight">
                  {activeTx.taggedCount}
                </p>
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-0.5">
                  Tagged
                </p>
              </div>

              {/* Badge 3: Pending */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-base font-black text-slate-900 leading-tight">
                  {activeTx.itemsCount - activeTx.taggedCount}
                </p>
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-0.5">
                  Pending
                </p>
              </div>

              {/* Badge 4: Failed */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center mb-1 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <p className="text-base font-black text-slate-900 leading-tight">
                  0
                </p>
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-0.5">
                  Failed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
