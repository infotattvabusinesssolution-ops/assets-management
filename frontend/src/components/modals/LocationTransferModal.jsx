import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { api } from '../../services/api';

export function LocationTransferModal({ asset, onClose, onCompleted }) {
  const [locations, setLocations] = useState({ sites: [], buildings: [], floors: [], rooms: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ siteId: '', buildingId: '', floorId: '', roomId: '', reason: '' });

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/master-data/sites'), api.get('/master-data/buildings'),
      api.get('/master-data/floors'), api.get('/master-data/rooms')
    ]).then(([sites, buildings, floors, rooms]) => {
      if (!active) return;
      setLocations({
        sites: (sites.sites || []).filter(site => !asset.companyId || site.companyId === asset.companyId),
        buildings: buildings.buildings || [], floors: floors.floors || [], rooms: rooms.rooms || []
      });
      setForm(prev => ({ ...prev, siteId: asset.siteId || '' }));
    }).catch(err => { if (active) setError(err?.message || 'Could not load locations.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [asset]);

  const buildings = useMemo(() => locations.buildings.filter(item => item.siteId === form.siteId), [locations.buildings, form.siteId]);
  const floors = useMemo(() => locations.floors.filter(item => item.buildingId === form.buildingId), [locations.floors, form.buildingId]);
  const rooms = useMemo(() => locations.rooms.filter(item => item.floorId === form.floorId), [locations.rooms, form.floorId]);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await api.post(`/assets/${encodeURIComponent(asset.id)}/location-transfer`, form);
      if (!response?.success) throw new Error(response?.message || 'Transfer failed.');
      onCompleted(response);
      onClose();
    } catch (err) {
      setError(err?.message || 'Transfer could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const selectClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Transfer asset location">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ArrowLeftRight className="h-4 w-4 text-[#6C2BD9]" /> Transfer Location / Site</h2>
        <button type="button" onClick={onClose} aria-label="Close transfer" className="text-slate-500"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={submit} className="space-y-4 p-5 text-xs">
        <p className="text-slate-600"><strong>{asset.assetId || asset.id}</strong> · {asset.name || asset.description}<br />Current: {asset.locationStr || asset.siteName || 'Unassigned'}</p>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-rose-700">{error}</p>}
        {loading ? <p>Loading locations…</p> : <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>Destination site *<select required className={selectClass} value={form.siteId} onChange={e => setForm(prev => ({ ...prev, siteId: e.target.value, buildingId: '', floorId: '', roomId: '' }))}><option value="">Select site</option>{locations.sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
            <label>Building<select className={selectClass} value={form.buildingId} onChange={e => setForm(prev => ({ ...prev, buildingId: e.target.value, floorId: '', roomId: '' }))}><option value="">No building</option>{buildings.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Floor<select className={selectClass} value={form.floorId} disabled={!form.buildingId} onChange={e => setForm(prev => ({ ...prev, floorId: e.target.value, roomId: '' }))}><option value="">No floor</option>{floors.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Room<select className={selectClass} value={form.roomId} disabled={!form.floorId} onChange={e => setForm(prev => ({ ...prev, roomId: e.target.value }))}><option value="">No room</option>{rooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          </div>
          <label className="block">Reason *<input required maxLength={500} className={selectClass} value={form.reason} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="Why is this asset moving?" /></label>
        </>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold">Cancel</button>
          <button type="submit" disabled={loading || saving || !form.siteId} className="rounded-lg bg-[#6C2BD9] px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Transferring…' : 'Confirm Transfer'}</button>
        </div>
      </form>
    </div>
  </div>;
}
