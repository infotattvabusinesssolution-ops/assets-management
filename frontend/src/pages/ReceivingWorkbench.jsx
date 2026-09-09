import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Inbox, Plus, CheckCircle, Package } from 'lucide-react';

export function ReceivingWorkbench() {
  const [receipts, setReceipts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [unitPrice, setUnitPrice] = useState(1200);
  const [serials, setSerials] = useState('SN-RCV-101, SN-RCV-102');

  const fetchReceipts = async () => {
    try {
      const res = await api.get('/receiving');
      if (res.success) setReceipts(res.receipts);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchReceipts();
    api.get('/master-data/companies').then(r => r.success && setCompanies(r.companies));
    api.get('/master-data/sites').then(r => r.success && setSites(r.sites));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const lineItems = [{
        description: itemDesc,
        unitPrice,
        serialNumbers: serials.split(',').map(s => s.trim()).filter(Boolean)
      }];

      const res = await api.post('/receiving', {
        poNumber,
        vendorName,
        companyId: selectedCompany || (companies[0] ? companies[0]._id : null),
        siteId: selectedSite || (sites[0] ? sites[0]._id : null),
        lineItems
      });

      if (res.success) {
        setShowModal(false);
        fetchReceipts();
      }
    } catch (err) {
      alert(err.message || 'Receiving failed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goods Receiving Workbench</h1>
          <p className="text-xs text-slate-500">Receive PO goods, capture manufacturer serials, and stage asset registration</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors">
          <Plus className="w-4 h-4" /> Process PO Receiving
        </button>
      </div>

      <div className="space-y-3">
        {receipts.map((r) => (
          <div key={r._id} className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand-600">{r.receiptNumber}</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">{r.status}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">PO: <span className="font-semibold text-slate-900">{r.poNumber}</span> | Vendor: {r.vendorName}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>{new Date(r.receivedDate).toLocaleDateString()}</p>
              <p className="text-brand-600 font-semibold">{r.lineItems?.length || 0} Line Items</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-4 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Process Goods Receiving</h2>
            <div>
              <label className="text-xs text-slate-700 block mb-1">PO Number *</label>
              <input type="text" required value={poNumber} onChange={e=>setPoNumber(e.target.value)} placeholder="PO-2026-99" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="text-xs text-slate-700 block mb-1">Vendor Name *</label>
              <input type="text" required value={vendorName} onChange={e=>setVendorName(e.target.value)} placeholder="Dell Authorized Vendor" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="text-xs text-slate-700 block mb-1">Item Description *</label>
              <input type="text" required value={itemDesc} onChange={e=>setItemDesc(e.target.value)} placeholder="Dell Latitude 5540" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="text-xs text-slate-700 block mb-1">Serial Numbers (Comma-separated)</label>
              <input type="text" value={serials} onChange={e=>setSerials(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500" />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">Cancel</button>
              <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"><CheckCircle className="w-4 h-4" /> Receive & Register Assets</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
