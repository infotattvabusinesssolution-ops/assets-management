import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Printer,
  Download,
  Plus,
  Edit,
  Eye,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle2,
  Package
} from 'lucide-react';

export function StockTransactionsTab({ onShowToast }) {
  const [txnSearch, setTxnSearch] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('2025-08-01');
  const [toDate, setToDate] = useState('2025-08-31');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [showNewTxnModal, setShowNewTxnModal] = useState(false);

  // Mock Stock Transactions matching exact screenshot data
  const [transactionsList, setTransactionsList] = useState([
    {
      id: 1,
      txnNo: 'ST-2025-0001',
      date: '28 Aug 2025',
      fullDate: '28 Aug 2025 11:15 AM',
      type: 'Receipt',
      itemCode: 'SP-HVAC-001',
      itemName: 'Air Filter (AHU)',
      category: 'HVAC',
      unitOfMeasure: 'Piece',
      qty: 50,
      unitCost: 85.00,
      totalValue: 4250.00,
      fromLocation: '-',
      toLocation: 'Main Warehouse',
      locationDisplay: 'Main Warehouse',
      refNo: 'PO-2058',
      workOrder: '-',
      user: 'Ahmed Khan',
      issuedTo: '-',
      remarks: 'Bulk stock receipt from supplier PO-2058 for AHU quarterly maintenance.',
      createdBy: 'Ahmed Khan',
      createdOn: '28 Aug 2025 11:15 AM',
      lastModifiedBy: 'Ahmed Khan',
      lastModifiedOn: '28 Aug 2025 11:15 AM'
    },
    {
      id: 2,
      txnNo: 'ST-2025-0002',
      date: '27 Aug 2025',
      fullDate: '27 Aug 2025 10:30 AM',
      type: 'Issue',
      itemCode: 'SP-ELEC-002',
      itemName: 'Circuit Breaker 63A',
      category: 'Electrical',
      unitOfMeasure: 'Piece',
      qty: 5,
      unitCost: 225.00,
      totalValue: 1125.00,
      fromLocation: 'Main Warehouse',
      toLocation: '-',
      locationDisplay: 'Main Warehouse',
      refNo: 'WO-2025-0145',
      workOrder: 'Chiller Compressor Replacement',
      user: 'Ramesh Nair',
      issuedTo: 'Ahmed Khan (Technician)',
      remarks: 'Issued for chiller compressor replacement work.',
      createdBy: 'Ramesh Nair',
      createdOn: '27 Aug 2025 10:30 AM',
      lastModifiedBy: 'Ramesh Nair',
      lastModifiedOn: '27 Aug 2025 10:30 AM'
    },
    {
      id: 3,
      txnNo: 'ST-2025-0003',
      date: '25 Aug 2025',
      fullDate: '25 Aug 2025 02:20 PM',
      type: 'Transfer',
      itemCode: 'SP-PLUMB-003',
      itemName: 'Ball Valve 1/2"',
      category: 'Plumbing',
      unitOfMeasure: 'Piece',
      qty: 10,
      unitCost: 45.00,
      totalValue: 450.00,
      fromLocation: 'HQ Warehouse',
      toLocation: 'Site A',
      locationDisplay: 'HQ Warehouse → Site A',
      refNo: 'TR-0012',
      workOrder: '-',
      user: 'Sarah Ahmed',
      issuedTo: 'Site A Storekeeper',
      remarks: 'Inter-warehouse stock transfer to fulfill urgent plumbing work at Site A.',
      createdBy: 'Sarah Ahmed',
      createdOn: '25 Aug 2025 02:20 PM',
      lastModifiedBy: 'Sarah Ahmed',
      lastModifiedOn: '25 Aug 2025 02:20 PM'
    },
    {
      id: 4,
      txnNo: 'ST-2025-0004',
      date: '23 Aug 2025',
      fullDate: '23 Aug 2025 04:00 PM',
      type: 'Adjustment',
      itemCode: 'SP-GEN-006',
      itemName: 'Oil Filter',
      category: 'Generators',
      unitOfMeasure: 'Piece',
      qty: -3,
      unitCost: 120.00,
      totalValue: -360.00,
      fromLocation: 'Main Warehouse',
      toLocation: '-',
      locationDisplay: 'Main Warehouse',
      refNo: 'ADJ-0008',
      workOrder: '-',
      user: 'John Doe',
      issuedTo: '-',
      remarks: 'Inventory discrepancy adjustment following physical stock audit.',
      createdBy: 'John Doe',
      createdOn: '23 Aug 2025 04:00 PM',
      lastModifiedBy: 'John Doe',
      lastModifiedOn: '23 Aug 2025 04:00 PM'
    },
    {
      id: 5,
      txnNo: 'ST-2025-0005',
      date: '21 Aug 2025',
      fullDate: '21 Aug 2025 09:45 AM',
      type: 'Issue',
      itemCode: 'SP-HVAC-004',
      itemName: 'V-Belt B120',
      category: 'HVAC',
      unitOfMeasure: 'Piece',
      qty: 2,
      unitCost: 75.00,
      totalValue: 150.00,
      fromLocation: 'Main Warehouse',
      toLocation: '-',
      locationDisplay: 'Main Warehouse',
      refNo: 'WO-2025-0138',
      workOrder: 'AHU Motor Belt Change',
      user: 'Ahmed Khan',
      issuedTo: 'Suresh Kumar (Technician)',
      remarks: 'Issued for AHU preventive maintenance replacement.',
      createdBy: 'Ahmed Khan',
      createdOn: '21 Aug 2025 09:45 AM',
      lastModifiedBy: 'Ahmed Khan',
      lastModifiedOn: '21 Aug 2025 09:45 AM'
    },
    {
      id: 6,
      txnNo: 'ST-2025-0006',
      date: '20 Aug 2025',
      fullDate: '20 Aug 2025 01:15 PM',
      type: 'Receipt',
      itemCode: 'SP-FIRE-005',
      itemName: 'Smoke Detector',
      category: 'Fire & Safety',
      unitOfMeasure: 'Piece',
      qty: 100,
      unitCost: 125.00,
      totalValue: 12500.00,
      fromLocation: '-',
      toLocation: 'Main Warehouse',
      locationDisplay: 'Main Warehouse',
      refNo: 'PO-2049',
      workOrder: '-',
      user: 'Fatima Ali',
      issuedTo: '-',
      remarks: 'Stock replenishment order received from Siemens Safety.',
      createdBy: 'Fatima Ali',
      createdOn: '20 Aug 2025 01:15 PM',
      lastModifiedBy: 'Fatima Ali',
      lastModifiedOn: '20 Aug 2025 01:15 PM'
    },
    {
      id: 7,
      txnNo: 'ST-2025-0007',
      date: '18 Aug 2025',
      fullDate: '18 Aug 2025 03:50 PM',
      type: 'Transfer',
      itemCode: 'SP-ELEC-008',
      itemName: 'LED Driver 100W',
      category: 'Electrical',
      unitOfMeasure: 'Piece',
      qty: 20,
      unitCost: 95.00,
      totalValue: 1900.00,
      fromLocation: 'HQ Warehouse',
      toLocation: 'Site B',
      locationDisplay: 'HQ Warehouse → Site B',
      refNo: 'TR-0011',
      workOrder: '-',
      user: 'Ramesh Nair',
      issuedTo: 'Site B Storekeeper',
      remarks: 'Stock allocation transfer for Site B outdoor lighting upgrade.',
      createdBy: 'Ramesh Nair',
      createdOn: '18 Aug 2025 03:50 PM',
      lastModifiedBy: 'Ramesh Nair',
      lastModifiedOn: '18 Aug 2025 03:50 PM'
    },
    {
      id: 8,
      txnNo: 'ST-2025-0008',
      date: '16 Aug 2025',
      fullDate: '16 Aug 2025 10:00 AM',
      type: 'Issue',
      itemCode: 'SP-CIVIL-007',
      itemName: 'Anchor Bolt M10',
      category: 'Civil',
      unitOfMeasure: 'Piece',
      qty: 25,
      unitCost: 15.00,
      totalValue: 375.00,
      fromLocation: 'Site A',
      toLocation: '-',
      locationDisplay: 'Site A',
      refNo: 'WO-2025-0121',
      workOrder: 'Perimeter Fence Fix',
      user: 'Khalid Omar',
      issuedTo: 'Khalid Omar (Civil Eng)',
      remarks: 'Issued for structural anchoring at perimeter wall.',
      createdBy: 'Khalid Omar',
      createdOn: '16 Aug 2025 10:00 AM',
      lastModifiedBy: 'Khalid Omar',
      lastModifiedOn: '16 Aug 2025 10:00 AM'
    },
    {
      id: 9,
      txnNo: 'ST-2025-0009',
      date: '12 Aug 2025',
      fullDate: '12 Aug 2025 11:30 AM',
      type: 'Receipt',
      itemCode: 'SP-HVAC-009',
      itemName: 'Thermostat',
      category: 'HVAC',
      unitOfMeasure: 'Piece',
      qty: 30,
      unitCost: 180.00,
      totalValue: 5400.00,
      fromLocation: '-',
      toLocation: 'Main Warehouse',
      locationDisplay: 'Main Warehouse',
      refNo: 'PO-2045',
      workOrder: '-',
      user: 'Sarah Ahmed',
      issuedTo: '-',
      remarks: 'Honeywell digital thermostats batch delivery received.',
      createdBy: 'Sarah Ahmed',
      createdOn: '12 Aug 2025 11:30 AM',
      lastModifiedBy: 'Sarah Ahmed',
      lastModifiedOn: '12 Aug 2025 11:30 AM'
    },
    {
      id: 10,
      txnNo: 'ST-2025-0010',
      date: '10 Aug 2025',
      fullDate: '10 Aug 2025 04:45 PM',
      type: 'Adjustment',
      itemCode: 'SP-PLUMB-010',
      itemName: 'Pipe Connector 1"',
      category: 'Plumbing',
      unitOfMeasure: 'Piece',
      qty: -5,
      unitCost: 35.00,
      totalValue: -175.00,
      fromLocation: 'Site B',
      toLocation: '-',
      locationDisplay: 'Site B',
      refNo: 'ADJ-0007',
      workOrder: '-',
      user: 'John Doe',
      issuedTo: '-',
      remarks: 'Damaged during transit adjustment write-off.',
      createdBy: 'John Doe',
      createdOn: '10 Aug 2025 04:45 PM',
      lastModifiedBy: 'John Doe',
      lastModifiedOn: '10 Aug 2025 04:45 PM'
    }
  ]);

  // Selected Transaction for Details Side Panel (Default: ST-2025-0002 matching screenshot)
  const [selectedTxn, setSelectedTxn] = useState(transactionsList[1]);

  // New Transaction Form State for Modal
  const [newTxnForm, setNewTxnForm] = useState({
    type: 'Issue',
    itemCode: 'SP-ELEC-002',
    itemName: 'Circuit Breaker 63A',
    qty: 1,
    location: 'Main Warehouse',
    refNo: 'WO-2025-0150',
    workOrder: 'Emergency Generator Maintenance',
    issuedTo: 'Ramesh Nair',
    remarks: 'Urgent stock issue for preventive maintenance'
  });

  // Filtering Logic
  const filteredTxns = transactionsList.filter(t => {
    const q = txnSearch.toLowerCase();
    const matchesSearch =
      !txnSearch ||
      t.txnNo.toLowerCase().includes(q) ||
      t.itemCode.toLowerCase().includes(q) ||
      t.itemName.toLowerCase().includes(q) ||
      t.refNo.toLowerCase().includes(q) ||
      t.user.toLowerCase().includes(q);

    const matchesType = txnTypeFilter === 'All' || t.type === txnTypeFilter;
    const matchesLoc = locationFilter === 'All Locations' || t.locationDisplay.includes(locationFilter);

    return matchesSearch && matchesType && matchesLoc;
  });

  const handleResetFilters = () => {
    setTxnSearch('');
    setTxnTypeFilter('All');
    setFromDate('2025-08-01');
    setToDate('2025-08-31');
    setLocationFilter('All Locations');
    onShowToast?.('Filters reset to default.');
  };

  const handleCreateTransactionSubmit = (e) => {
    e.preventDefault();
    const newId = transactionsList.length + 1;
    const newTxnNo = `ST-2025-${String(newId).padStart(4, '0')}`;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullDateStr = `${todayStr} 10:00 AM`;

    const created = {
      id: newId,
      txnNo: newTxnNo,
      date: todayStr,
      fullDate: fullDateStr,
      type: newTxnForm.type,
      itemCode: newTxnForm.itemCode,
      itemName: newTxnForm.itemName,
      category: 'Electrical',
      unitOfMeasure: 'Piece',
      qty: parseInt(newTxnForm.qty || 1),
      unitCost: 225.00,
      totalValue: parseInt(newTxnForm.qty || 1) * 225.00,
      fromLocation: newTxnForm.location,
      toLocation: '-',
      locationDisplay: newTxnForm.location,
      refNo: newTxnForm.refNo,
      workOrder: newTxnForm.workOrder,
      user: 'John Doe',
      issuedTo: newTxnForm.issuedTo,
      remarks: newTxnForm.remarks,
      createdBy: 'John Doe',
      createdOn: fullDateStr,
      lastModifiedBy: 'John Doe',
      lastModifiedOn: fullDateStr
    };

    setTransactionsList([created, ...transactionsList]);
    setSelectedTxn(created);
    setShowNewTxnModal(false);
    onShowToast?.(`Stock Transaction ${newTxnNo} recorded successfully!`);
  };

  // Helper Badge Style
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Receipt':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Issue':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'Transfer':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Adjustment':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: TRANSACTIONS TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Table Header & Title */}
            <div>
              <h2 className="text-base font-bold text-slate-900">Transactions List</h2>
              <p className="text-xs text-slate-500">View all stock transactions for spare parts.</p>
            </div>

            {/* Filter Bar Controls matching exact screenshot design */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by transaction no., item code, item name..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] transition-colors"
                />
              </div>

              {/* Transaction Type Dropdown */}
              <div className="flex flex-col">
                <select
                  value={txnTypeFilter}
                  onChange={(e) => setTxnTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All">Transaction Type: All</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Issue">Issue</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                </select>
              </div>

              {/* From Date */}
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              {/* To Date */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="HQ Warehouse">HQ Warehouse</option>
                  <option value="Site A">Site A</option>
                  <option value="Site B">Site B</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
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

            {/* Transactions Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Transaction No.</th>
                    <th className="py-2.5 px-3">Transaction Date</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3">From / To Location</th>
                    <th className="py-2.5 px-3">Reference No.</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        No transactions found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTxns.map((row) => {
                      const isSelected = selectedTxn?.id === row.id;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedTxn(row)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50/80 font-semibold' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{row.id}</td>

                          {/* Txn No */}
                          <td className="py-2.5 px-3">
                            <span className="text-[#6C2BD9] font-semibold hover:underline font-mono">
                              {row.txnNo}
                            </span>
                          </td>

                          {/* Txn Date */}
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.date}</td>

                          {/* Txn Type Badge */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${getTypeBadge(
                                row.type
                              )}`}
                            >
                              {row.type}
                            </span>
                          </td>

                          {/* Item Code */}
                          <td className="py-2.5 px-3">
                            <span className="text-[#6C2BD9] font-mono hover:underline">{row.itemCode}</span>
                          </td>

                          {/* Item Name */}
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {row.itemName}
                          </td>

                          {/* Qty */}
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              row.qty < 0 ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {row.qty}
                          </td>

                          {/* From / To Location */}
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {row.locationDisplay}
                          </td>

                          {/* Reference No */}
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-slate-700">{row.refNo}</span>
                          </td>

                          {/* User */}
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{row.user}</td>

                          {/* Action */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTxn(row);
                              }}
                              className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Pagination Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-slate-500 font-medium text-xs">
              Showing 1 to {filteredTxns.length} of 3,482 records
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
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                5
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                349
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

        {/* RIGHT COLUMN: TRANSACTION DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-4">
          {selectedTxn ? (
            <div className="space-y-4">
              {/* Header with Edit Button */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Transaction Details</h3>
                <button
                  onClick={() => onShowToast?.(`Editing Transaction ${selectedTxn.txnNo}`)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
              </div>

              {/* Transaction Key Fields */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Transaction No.</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedTxn.txnNo}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Transaction Date</span>
                  <span className="font-medium text-slate-900">{selectedTxn.fullDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Transaction Type</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${getTypeBadge(
                      selectedTxn.type
                    )}`}
                  >
                    {selectedTxn.type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Reference No.</span>
                  <a
                    href="#ref"
                    onClick={(e) => {
                      e.preventDefault();
                      onShowToast?.(`Opening reference ${selectedTxn.refNo}`);
                    }}
                    className="text-[#6C2BD9] hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    {selectedTxn.refNo} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Work Order</span>
                  {selectedTxn.workOrder !== '-' ? (
                    <a
                      href="#wo"
                      onClick={(e) => {
                        e.preventDefault();
                        onShowToast?.(`Navigating to Work Order ${selectedTxn.workOrder}`);
                      }}
                      className="text-[#6C2BD9] hover:underline font-semibold flex items-center gap-1 text-right max-w-[180px] truncate"
                    >
                      {selectedTxn.workOrder} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item Information */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Item Code</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedTxn.itemCode}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Item Name</span>
                  <span className="font-bold text-slate-900">{selectedTxn.itemName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-medium text-slate-800">{selectedTxn.category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Unit of Measure</span>
                  <span className="font-medium text-slate-800">{selectedTxn.unitOfMeasure}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Quantity</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{selectedTxn.qty}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Unit Cost (AED)</span>
                  <span className="font-mono text-slate-800">{selectedTxn.unitCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Total Value (AED)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {Math.abs(selectedTxn.totalValue).toLocaleString('en-US', {
                      minimumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Movement & User Info */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">From Location</span>
                  {selectedTxn.fromLocation !== '-' ? (
                    <a
                      href="#loc"
                      onClick={(e) => {
                        e.preventDefault();
                        onShowToast?.(`Navigating to Location ${selectedTxn.fromLocation}`);
                      }}
                      className="text-[#6C2BD9] hover:underline font-medium flex items-center gap-1"
                    >
                      {selectedTxn.fromLocation} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">To Location</span>
                  <span className="font-medium text-slate-800">{selectedTxn.toLocation}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Issued To</span>
                  <span className="font-medium text-slate-800">{selectedTxn.issuedTo}</span>
                </div>

                {/* Remarks Container */}
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Remarks</span>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 italic">
                    {selectedTxn.remarks}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Audit Meta Info */}
              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Created By</span>
                  <span className="font-semibold text-slate-700">{selectedTxn.createdBy}</span>
                </div>

                <div className="flex justify-between">
                  <span>Created On</span>
                  <span className="font-mono text-slate-700">{selectedTxn.createdOn}</span>
                </div>

                <div className="flex justify-between">
                  <span>Last Modified By</span>
                  <span className="font-semibold text-slate-700">{selectedTxn.lastModifiedBy}</span>
                </div>

                <div className="flex justify-between">
                  <span>Last Modified On</span>
                  <span className="font-mono text-slate-700">{selectedTxn.lastModifiedOn}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Select a transaction from the table to view details</div>
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
            onClick={() => onShowToast?.('Printing transaction register...')}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Print
          </button>

          <button
            onClick={() => onShowToast?.('Exporting transactions to Excel...')}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" /> Export
          </button>

          <button
            onClick={() => setShowNewTxnModal(true)}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" /> New Transaction
          </button>
        </div>
      </div>

      {/* MODAL: NEW TRANSACTION */}
      {showNewTxnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6C2BD9]" /> Record New Stock Transaction
              </h3>
              <button
                onClick={() => setShowNewTxnModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransactionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Type *</label>
                  <select
                    value={newTxnForm.type}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Issue">Issue (Work Order)</option>
                    <option value="Receipt">Receipt (Supplier PO)</option>
                    <option value="Transfer">Inter-Warehouse Transfer</option>
                    <option value="Adjustment">Audit Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={newTxnForm.itemCode}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, itemCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newTxnForm.itemName}
                  onChange={(e) => setNewTxnForm({ ...newTxnForm, itemName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newTxnForm.qty}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, qty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location *</label>
                  <select
                    value={newTxnForm.location}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="HQ Warehouse">HQ Warehouse</option>
                    <option value="Site A">Site A</option>
                    <option value="Site B">Site B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference No.</label>
                  <input
                    type="text"
                    value={newTxnForm.refNo}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, refNo: e.target.value })}
                    placeholder="e.g. WO-2025-0145"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issued To / Recipient</label>
                  <input
                    type="text"
                    value={newTxnForm.issuedTo}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, issuedTo: e.target.value })}
                    placeholder="Ramesh Nair (Technician)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={newTxnForm.remarks}
                  onChange={(e) => setNewTxnForm({ ...newTxnForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTxnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold hover:bg-[#5B21B6] shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

