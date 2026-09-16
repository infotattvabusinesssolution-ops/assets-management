import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  History,
  Search,
  Filter,
  Package,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  Tag,
  Eye,
  X,
  ArrowLeft,
  Barcode,
  ShieldCheck,
  Plus
} from 'lucide-react';
import clsx from 'clsx';

export function ReceivingHistory() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/receiving/history', {
        params: {
          q: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          supplier: supplierFilter !== 'ALL' ? supplierFilter : undefined
        }
      });
      if (res.success && res.history) {
        setHistoryList(res.history);
      }
    } catch (err) {
      console.error('Failed to load receiving history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, supplierFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {status || 'Staged'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/receiving')}>
              Receiving & Tagging
            </span>
            <span>&gt;</span>
            <span className="text-[#6C2BD9] font-bold">Receiving History</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#6C2BD9]" />
            Receiving & Intake History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade history of goods receipts (GRN), PO deliveries, serial numbers and associated Barcode/RFID tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/receiving')}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Receive with PO
          </button>
          <button
            onClick={() => navigate('/receiving/without-po')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            Receive without PO
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by GRN reference, PO number, supplier, or asset description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#6C2BD9] bg-white placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Suppliers</option>
            <option value="Dell Technologies">Dell Technologies</option>
            <option value="Cisco Systems">Cisco Systems</option>
            <option value="Apple Inc.">Apple Inc.</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">GRN / Reference</th>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Receiving Location</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Received By</th>
                <th className="py-3 px-4 text-center">Units Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#6C2BD9] border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading receiving history...</p>
                    </div>
                  </td>
                </tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No receiving records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or complete a new intake session.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                historyList.map((tx) => (
                  <tr
                    key={tx.id || tx.receiptNumber}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#6C2BD9]">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {tx.poNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {tx.vendorName || tx.supplier}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tx.receivingLocation || 'Dubai HQ - IT Store'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(tx.receivedDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tx.receivedBy || 'John Doe'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                        {tx.summary?.unitsReceived || tx.lineItems?.length || 1} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#6C2BD9] hover:text-white text-slate-600 transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-[#6C2BD9]">
                    {selectedTx.receiptNumber}
                  </span>
                  {getStatusBadge(selectedTx.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Goods Receipt Note • {selectedTx.poNumber || 'Non-PO Direct Delivery'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Header Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Supplier</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{selectedTx.vendorName || selectedTx.supplier}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{selectedTx.receivingLocation || 'Dubai HQ - IT Store'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Received Date</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                    {new Date(selectedTx.receivedDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Received By</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{selectedTx.receivedBy || 'John Doe'}</span>
                </div>
              </div>

              {selectedTx.remarks && (
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                  <span className="font-bold">Remarks: </span>{selectedTx.remarks}
                </div>
              )}

              {/* Line Items Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#6C2BD9]" /> Associated Line Items & Deliveries
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Part #</th>
                        <th className="py-2.5 px-3 text-center">Ordered</th>
                        <th className="py-2.5 px-3 text-center">Received</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedTx.lineItems || []).map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{line.itemDescription || line.description}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{line.partNumber || '-'}</td>
                          <td className="py-2 px-3 text-center">{line.orderedQty || line.quantity || 1}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-600">{line.receivedQty || line.quantity || 1}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {line.status || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Physical Serialized Units & Tags */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#6C2BD9]" /> Serial Numbers & Tag Associations
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Serial Number</th>
                        <th className="py-2.5 px-3">Tag ID</th>
                        <th className="py-2.5 px-3">RFID EPC</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {((selectedTx.lineItems || []).flatMap(l => l.assets || []) || []).length > 0 ? (
                        (selectedTx.lineItems || []).flatMap(l => l.assets || []).map((a, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-800">{a.serialNumber}</td>
                            <td className="py-2 px-3 text-[#6C2BD9]">{a.tagNumber || 'Unassigned'}</td>
                            <td className="py-2 px-3 text-slate-600">{a.rfidEpc || '-'}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-bold font-sans">
                                {a.status || 'Tagged'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                            Direct inventory lines tagged at batch level.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" /> Audit & Transition History
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  {(selectedTx.auditTrail || [
                    { action: 'RECEIVE_TRANSACTION_SUBMITTED', timestamp: selectedTx.receivedDate, user: selectedTx.receivedBy || 'John Doe', details: `Posted goods receipt ${selectedTx.receiptNumber}` }
                  ]).map((event, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#6C2BD9] mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{event.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{event.details}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">By: {event.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print GRN
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
