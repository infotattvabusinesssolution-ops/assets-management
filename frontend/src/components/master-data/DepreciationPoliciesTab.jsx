import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export function DepreciationPoliciesTab() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [rate, setRate] = useState('');
  const [residual, setResidual] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.get('/master-data/depreciation-policies');
      if (!result?.success) throw new Error(result?.message || 'Could not load depreciation policies.');
      setCategories(result.categories || []);
      setSelectedId(previous => previous || result.categories?.[0]?.id || '');
      setMessage(null);
    } catch (error) {
      setMessage({ error: true, text: error.message || 'Could not load depreciation policies.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selected = categories.find(category => category.id === selectedId);
  useEffect(() => {
    if (!selected) return;
    setRate(selected.annualDepreciationRatePercent == null ? '' : String(selected.annualDepreciationRatePercent));
    setResidual(String(selected.defaultResidualValuePercent ?? 0));
  }, [selectedId, categories]);

  const submit = async (event) => {
    event.preventDefault();
    const annualRate = Number(rate);
    const residualPercent = Number(residual);
    if (!Number.isFinite(annualRate) || annualRate < 1 || annualRate > 100 ||
        !Number.isFinite(residualPercent) || residualPercent < 0 || residualPercent >= 100) {
      setMessage({ error: true, text: 'Enter an annual rate from 1% to 100% and a residual percentage below 100%.' });
      return;
    }
    setSaving(true);
    try {
      const result = await api.put(`/master-data/depreciation-policies/${encodeURIComponent(selectedId)}`, {
        annualDepreciationRatePercent: annualRate,
        defaultResidualValuePercent: residualPercent
      });
      if (!result?.success) throw new Error(result?.message || 'Could not save depreciation policy.');
      setCategories(previous => previous.map(category => category.id === selectedId ? result.category : category));
      setMessage({ error: false, text: `${result.category.name} depreciation policy saved. ${result.booksUpdated ?? 0} unlocked asset books updated for future depreciation runs.` });
    } catch (error) {
      setMessage({ error: true, text: error.message || 'Could not save depreciation policy.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Category depreciation configuration</h2>
          <p className="text-xs text-slate-500 mt-1">Set the annual straight line rate for this category. Depreciation becomes due after each completed year, starting with the first anniversary.</p>
        </div>
        {message && <p role="status" className={`rounded-lg p-3 text-xs font-semibold ${message.error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}
        {loading ? <p className="text-xs text-slate-500">Loading categories…</p> : categories.length === 0 ? (
          <p className="text-xs text-slate-500">No categories are registered yet. Add a category before setting its depreciation rate.</p>
        ) : (
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 text-xs">
            <label className="sm:col-span-2 font-bold text-slate-700">Asset category
              <select className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" value={selectedId} onChange={event => { setSelectedId(event.target.value); setMessage(null); }}>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name} ({category.code})</option>)}
              </select>
            </label>
            <label className="font-bold text-slate-700">Annual depreciation rate (%)
              <input type="number" min="1" max="100" step="0.01" required value={rate} onChange={event => setRate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
            </label>
            <label className="font-bold text-slate-700">Residual value (%)
              <input type="number" min="0" max="99.99" step="0.01" required value={residual} onChange={event => setResidual(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
            </label>
            <p className="sm:col-span-2 text-slate-600">Useful life: {Number(rate) > 0 ? `${Math.round(1200 / Number(rate))} months (${(100 / Number(rate)).toFixed(1)} years)` : 'Enter an annual rate'}. This is derived from the rate and saved with the category.</p>
            <div className="sm:col-span-2 flex justify-end"><button type="submit" disabled={saving} className="rounded-xl bg-[#6C2BD9] px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save configuration'}</button></div>
          </form>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900">Configured categories</h3>
        {categories.map(category => <button key={category.id} onClick={() => setSelectedId(category.id)} className={`w-full flex justify-between gap-2 rounded-lg p-2 text-left ${selectedId === category.id ? 'bg-purple-50 text-[#6C2BD9]' : 'hover:bg-slate-50 text-slate-700'}`}>
          <span className="font-semibold">{category.name}</span><span className="font-bold">{category.annualDepreciationRatePercent == null ? 'Not set' : `${category.annualDepreciationRatePercent}%`}</span>
        </button>)}
      </div>
    </div>
  );
}
