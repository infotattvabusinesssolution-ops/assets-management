import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { api } from '../../services/api';
import { Search, Package, Wrench, ClipboardList, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommandPaletteModal() {
  const { isOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ assets: [], workOrders: [], stocktakes: [], employees: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ assets: [], workOrders: [], stocktakes: [], employees: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        if (res.success) setResults(res.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-brand-500" />
          <input
            type="text"
            placeholder="Type asset ID, tag, serial, hostname, custodian or WO... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium"
            autoFocus
          />
          <button onClick={closePalette} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && <p className="text-xs text-slate-500">Searching global records...</p>}

          {!loading && !query && (
            <div className="text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { navigate('/assets/new'); closePalette(); }} className="btn-secondary text-left">
                  <Package className="w-4 h-4 text-brand-500" /> Create New Asset
                </button>
                <button onClick={() => { navigate('/receiving'); closePalette(); }} className="btn-secondary text-left">
                  <ClipboardList className="w-4 h-4 text-brand-500" /> Receive Goods
                </button>
                <button onClick={() => { navigate('/stocktakes'); closePalette(); }} className="btn-secondary text-left">
                  <ClipboardList className="w-4 h-4 text-purple-600" /> Start Stocktake
                </button>
                <button onClick={() => { navigate('/maintenance'); closePalette(); }} className="btn-secondary text-left">
                  <Wrench className="w-4 h-4 text-purple-600" /> Create Work Order
                </button>
              </div>
            </div>
          )}

          {/* Asset Results */}
          {results.assets && results.assets.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assets ({results.assets.length})</p>
              <div className="space-y-1">
                {results.assets.map((asset) => (
                  <div
                    key={asset._id}
                    onClick={() => { navigate(`/assets/${asset._id}`); closePalette(); }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/60 rounded-xl cursor-pointer flex items-center justify-between border border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-brand-500" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{asset.assetId} — {asset.description}</div>
                        <div className="text-xs text-slate-500">Tag: {asset.tagNumber || 'N/A'} | SN: {asset.serialNumber || 'N/A'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">{asset.lifecycleStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Orders */}
          {results.workOrders && results.workOrders.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Work Orders ({results.workOrders.length})</p>
              <div className="space-y-1">
                {results.workOrders.map((wo) => (
                  <div
                    key={wo._id}
                    onClick={() => { navigate('/maintenance'); closePalette(); }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/60 rounded-xl cursor-pointer flex items-center justify-between border border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{wo.workOrderNumber} — {wo.description}</div>
                        <div className="text-xs text-slate-500">Priority: {wo.priority} | Status: {wo.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
