import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag, Printer, QrCode, Cpu, CheckCircle } from 'lucide-react';

export function TagWorkbench() {
  const [tags, setTags] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [tagNumber, setTagNumber] = useState('TAG-9099');

  const loadData = async () => {
    try {
      const [tRes, aRes] = await Promise.all([
        api.get('/tagging'),
        api.get('/assets?limit=50')
      ]);
      if (tRes.success) setTags(tRes.tags);
      if (aRes.success) setAssets(aRes.assets);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssociate = async () => {
    if (!selectedAsset) return alert('Select an asset');
    try {
      const res = await api.post('/tagging/associate', { assetId: selectedAsset, tagNumber });
      if (res.success) {
        alert(`Tag ${tagNumber} associated successfully!`);
        loadData();
      }
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tagging & Label Printing Workbench</h1>
          <p className="text-xs text-slate-500">Generate Code128 Barcodes, QR Tokens, RFID EPCs & Associate with Asset Records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Associate Tag Card */}
        <div className="bg-white border border-slate-200 p-5 space-y-4 rounded-xl shadow-xs">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Associate Tag to Asset</h3>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Select Asset</label>
            <select value={selectedAsset} onChange={e=>setSelectedAsset(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500">
              <option value="">Select Asset...</option>
              {assets.map(a => <option key={a._id} value={a._id}>{a.assetId} — {a.description}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Tag Number (Barcode / EPC)</label>
            <input type="text" value={tagNumber} onChange={e=>setTagNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500" />
          </div>
          <button onClick={handleAssociate} className="bg-brand-600 hover:bg-brand-700 text-white w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors">
            <CheckCircle className="w-4 h-4" /> Associate Tag
          </button>
        </div>

        {/* Label Preview Card */}
        <div className="bg-white border border-slate-200 p-5 space-y-4 md:col-span-2 rounded-xl shadow-xs">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Label Designer & Printer Preview</h3>
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Asset 360° Tag</span>
              <p className="text-lg font-mono font-extrabold text-slate-900">{tagNumber}</p>
              <p className="text-xs text-slate-600">Dell PowerEdge Rack Server</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-medium">
                <Cpu className="w-3.5 h-3.5" /> RFID EPC Enabled: E280116060009099
              </div>
            </div>
            <div className="w-20 h-20 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
              <QrCode className="w-16 h-16 text-slate-900" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200">
              <Printer className="w-4 h-4" /> Print Label Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
