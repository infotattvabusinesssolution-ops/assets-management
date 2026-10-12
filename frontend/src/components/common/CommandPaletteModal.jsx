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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults({ assets: [], workOrders: [], stocktakes: [], employees: [] });
      setError('');
      return;
    }

    let active = true;
    setResults({ assets: [], workOrders: [], stocktakes: [], employees: [] });
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (active && res.success) setResults(res.results);
      } catch (err) {
        if (active) { setResults({ assets: [], workOrders: [], stocktakes: [], employees: [] }); setError(err?.message || 'Search failed.'); }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => { active = false; clearTimeout(timer); };
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) { setQuery(''); setLoading(false); return undefined; }
    const onKeyDown = event => { if (event.key === 'Escape') closePalette(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closePalette]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4" onMouseDown={event => { if (event.target === event.currentTarget) closePalette(); }}>
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-brand-500" />
          <input
            type="text"
            placeholder="Search asset ID, name, barcode, RFID, location or work order..."
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
          {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
          {!loading && !error && query.trim() && !results.assets?.length && !results.workOrders?.length && !results.stocktakes?.length && !results.employees?.length && <p className="text-xs text-slate-500">No matching records found.</p>}

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
                    key={asset.id}
                    onClick={() => { navigate(`/assets/${encodeURIComponent(asset.id)}`); closePalette(); }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/60 rounded-xl cursor-pointer flex items-center justify-between border border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-brand-500" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{asset.assetId} — {asset.description}</div>
                        <div className="text-xs text-slate-500">{asset.category?.name || 'Asset'} · {asset.site?.name || 'No site'} · Tag: {asset.tagNumber || asset.barcode || 'N/A'} · SN: {asset.serialNumber || 'N/A'}</div>
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
                    key={wo.id}
                    onClick={() => { navigate(`/maintenance?workOrder=${encodeURIComponent(wo.id)}`); closePalette(); }}
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
