import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Settings, Download, RefreshCw, MoreHorizontal, Save, Search, ChevronRight } from 'lucide-react';

const newForm = () => ({
  title: '', assetId: '', description: '', workType: 'PREVENTIVE',
  frequencyMonths: 3, nextDueDate: new Date().toISOString().slice(0, 10),
  active: true, autoGenerateWorkOrders: false, advanceDays: 7, checklist: []
});
const formFrom = s => ({
  title: s.title, assetId: s.assetId, description: s.description || '',
  workType: s.workType, frequencyMonths: s.frequencyMonths,
  nextDueDate: s.nextDueDate.slice(0, 10), active: s.active,
  autoGenerateWorkOrders: s.autoGenerateWorkOrders, advanceDays: s.advanceDays,
  checklist: s.checklist || []
});
const date = value => value ? new Date(value).toLocaleDateString() : '—';
const number = s => 'PMS-' + s.id.slice(0, 8).toUpperCase();
const errorText = e => e?.message || 'Request failed.';
const isComplete = status => ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(status);
const orderOpen = status => ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(status);
const statusOf = (s, orders) => {
  if (!s.active) return 'Inactive';
  if (orders.some(w => w.scheduleId === s.id && w.dueDate === s.nextDueDate && orderOpen(w.status))) return 'Work Order Open';
  const days = (new Date(s.nextDueDate).getTime() - Date.now()) / 86400000;
  return days < 0 ? 'Overdue' : days <= s.advanceDays ? 'Due Soon' : 'Scheduled';
};
const badge = status => ({
  'Overdue': 'border-rose-300 bg-rose-100 text-rose-800',
  'Due Soon': 'border-amber-300 bg-amber-100 text-amber-800',
  'Scheduled': 'border-sky-300 bg-sky-100 text-sky-800',
  'Work Order Open': 'border-purple-300 bg-purple-100 text-purple-800',
  'Inactive': 'border-slate-300 bg-slate-100 text-slate-600'
}[status] || 'border-slate-300 bg-slate-100 text-slate-600');
const csvCell = value => {
  const raw = String(value ?? '');
  const safe = /^[=+@-]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replaceAll('"', '""') + '"';
};

export function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(newForm);
  const [checklistText, setChecklistText] = useState('');
  const [tab, setTab] = useState('UPCOMING');
  const [menuId, setMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [category, setCategory] = useState('ALL');
  const [site, setSite] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dueFilter, setDueFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = schedules.find(s => s.id === selectedId);
  const selectedAsset = assets.find(a => a.id === form.assetId) || selected?.asset;
  const categories = useMemo(() => [...new Map(assets.filter(a => a.category).map(a => [a.categoryId, { id: a.categoryId, name: a.category.name }])).values()].sort((a,b) => a.name.localeCompare(b.name)), [assets]);
  const sites = useMemo(() => [...new Map(assets.filter(a => a.site).map(a => [a.siteId, { id: a.siteId, name: a.site.name }])).values()].sort((a,b) => a.name.localeCompare(b.name)), [assets]);
  const filtered = useMemo(() => schedules.filter(s => {
    const due = new Date(s.nextDueDate);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 86400000);
    const nextMonth = new Date(now.getTime() + 30 * 86400000);
    const matchesDue = dueFilter === 'ALL' ||
      (dueFilter === 'NEXT_7' && due >= now && due <= nextWeek) ||
      (dueFilter === 'NEXT_30' && due >= now && due <= nextMonth) ||
      (dueFilter === 'THIS_MONTH' && due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear());
    return (category === 'ALL' || s.asset.categoryId === category) &&
      (site === 'ALL' || s.asset.siteId === site) &&
      (statusFilter === 'ALL' || statusOf(s, orders) === statusFilter) &&
      matchesDue &&
      (!fromDate || s.nextDueDate.slice(0, 10) >= fromDate) &&
      (!toDate || s.nextDueDate.slice(0, 10) <= toDate);
  }), [schedules, orders, category, site, statusFilter, dueFilter, fromDate, toDate]);
  const upcoming = schedules.filter(s => s.active && new Date(s.nextDueDate) >= new Date());
  const overdue = schedules.filter(s => statusOf(s, orders) === 'Overdue');
  const completed = orders.filter(w => isComplete(w.status));
  const selectedOrders = orders.filter(w => w.scheduleId === selectedId);

  async function load(preferredId) {
    const [dashboard, assetResponse] = await Promise.all([api.get('/maintenance/preventive'), api.get('/maintenance/assets')]);
    const next = dashboard.schedules || [];
    setSchedules(next); setOrders(dashboard.generatedWorkOrders || []); setAssets(assetResponse.assets || []);
    setSelectedId(current => preferredId || (next.some(s => s.id === current) ? current : next[0]?.id || null));
    setLoading(false);
    return next;
  }
  useEffect(() => { load().catch(e => { setError(errorText(e)); setLoading(false); }); }, []);
  useEffect(() => {
    if (!creating && selected) { setForm(formFrom(selected)); setChecklistText((selected.checklist || []).join('\n')); }
  }, [selectedId, schedules, creating]);

  function update(key, value) { setForm(previous => ({ ...previous, [key]: value })); }
  function select(id) { setSelectedId(id); setCreating(false); setMenuId(null); setError(''); setMessage(''); }
  function create() { setCreating(true); setSelectedId(null); setForm(newForm()); setChecklistText(''); setMenuId(null); setError(''); setMessage(''); }
  async function refresh() {
    setError(''); setMessage('');
    try { await load(); setMessage('Schedules refreshed.'); } catch (e) { setError(errorText(e)); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const payload = { ...form, checklist: checklistText.split('\n').map(task => task.trim()).filter(Boolean) };
      const response = creating ? await api.post('/maintenance/schedules', payload) : await api.put('/maintenance/schedules/' + selectedId, payload);
      setCreating(false);
      await load(response.schedule.id);
      setMessage(creating ? 'Schedule created.' : 'Schedule saved.');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  async function generate(id) {
    setBusy(true); setError(''); setMessage(''); setMenuId(null);
    try {
      const response = await api.post(id ? '/maintenance/preventive/' + id + '/generate' : '/maintenance/preventive/generate');
      await load(id || selectedId);
      setMessage(response.result?.message || 'Generation checked.');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  async function toggle(s) {
    setBusy(true); setError(''); setMessage(''); setMenuId(null);
    try {
      await api.put('/maintenance/schedules/' + s.id, { active: !s.active });
      await load(s.id);
      setMessage(s.active ? 'Schedule deactivated.' : 'Schedule activated.');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    const rows = [['Schedule','Asset','Name','Category','Site','Type','Frequency months','Next due','Status']];
    filtered.forEach(s => rows.push([number(s),s.asset.assetId,s.asset.description,s.asset.category?.name,s.asset.site?.name,s.workType,s.frequencyMonths,s.nextDueDate.slice(0,10),statusOf(s,orders)]));
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'preventive-schedules.csv'; link.click(); URL.revokeObjectURL(url);
  }
  const input = 'w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#6C2BD9] focus:outline-none';
  const purple = 'rounded-lg bg-[#6C2BD9] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B21B6] disabled:opacity-50';
  const outline = 'rounded-lg border border-[#6C2BD9] bg-white px-4 py-2 text-xs font-bold text-[#6C2BD9] hover:bg-purple-50 disabled:opacity-50';
  return <div className="min-h-screen space-y-4 bg-[#F8FAFC] p-2 font-sans text-xs text-slate-800 sm:p-3">
    <header className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div><div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">Maintenance <ChevronRight size={12} /><span className="font-bold text-[#6C2BD9]">Preventive Maintenance</span></div><h1 className="mt-1 text-xl font-extrabold text-slate-900">Preventive Maintenance</h1><p className="mt-0.5 text-xs text-slate-500">Manage scheduled preventive maintenance and generate work orders</p></div>
      <div className="flex flex-wrap gap-2"><button className={purple + ' flex items-center gap-1.5'} onClick={create}><Plus size={15} />Create PM Schedule</button><button className={outline + ' flex items-center gap-1.5'} disabled={busy} onClick={() => generate()}><Settings size={15} />Generate Work Orders</button><button className={outline + ' flex items-center gap-1.5'} disabled={!filtered.length} onClick={exportCsv}><Download size={15} />Export</button><button className={outline} onClick={refresh} aria-label="Refresh schedules"><RefreshCw size={15} /></button></div>
    </header>
    {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 font-semibold text-rose-800">{error}</div>}
    {message && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</div>}

    <section className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        <label className="space-y-1"><span className="text-[11px] font-bold">Asset Category</span><select className={input} value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">All</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold">Location</span><select className={input} value={site} onChange={e => setSite(e.target.value)}><option value="ALL">All Locations</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold">Schedule Status</span><select className={input} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All</option>{['Due Soon','Overdue','Scheduled','Work Order Open','Inactive'].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold">Due In</span><select className={input} value={dueFilter} onChange={e => setDueFilter(e.target.value)}><option value="ALL">All dates</option><option value="NEXT_7">Next 7 Days</option><option value="NEXT_30">Next 30 Days</option><option value="THIS_MONTH">This Month</option></select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold">From Date</span><input type="date" className={input} value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
        <label className="space-y-1"><span className="text-[11px] font-bold">To Date</span><input type="date" className={input} value={toDate} onChange={e => setToDate(e.target.value)} /></label>
        <div className="flex gap-2 lg:col-span-2"><button className={purple + ' flex flex-1 items-center justify-center gap-1'} onClick={refresh}><Search size={14} />Search</button><button className={outline} onClick={() => { setCategory('ALL'); setSite('ALL'); setStatusFilter('ALL'); setDueFilter('ALL'); setFromDate(''); setToDate(''); }}>Clear</button></div>
      </div>
    </section>

    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-8">
        <h2 className="text-sm font-bold text-slate-900">Preventive Maintenance List ({filtered.length})</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200"><div className="max-h-[540px] overflow-auto"><table className="w-full border-collapse text-left"><thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold text-slate-700"><tr><th className="w-8 p-2.5" /><th className="p-2.5">Schedule No.</th><th className="p-2.5">Asset No.</th><th className="p-2.5">Asset Name</th><th className="p-2.5">Schedule Type</th><th className="p-2.5">Frequency</th><th className="p-2.5">Next Due Date</th><th className="p-2.5 text-center">Status</th><th className="p-2.5 text-center">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading && <tr><td colSpan={9} className="p-4 text-slate-500">Loading schedules…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={9} className="p-4 text-slate-500">No schedules match these filters.</td></tr>}
            {filtered.map(s => <tr key={s.id} onClick={() => select(s.id)} className={'cursor-pointer hover:bg-slate-50 ' + (selectedId === s.id && !creating ? 'bg-purple-50/60 font-semibold' : '')}>
              <td className="p-2.5 text-center"><input type="radio" name="selectedSchedule" checked={selectedId === s.id && !creating} onChange={() => select(s.id)} aria-label={'Select ' + number(s)} /></td>
              <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{number(s)}</td><td className="p-2.5 font-mono text-[#6C2BD9]">{s.asset.assetId}</td><td className="p-2.5 font-bold text-slate-900">{s.asset.description}</td><td className="p-2.5">{s.workType}</td><td className="whitespace-nowrap p-2.5">{s.frequencyMonths} Months</td><td className="whitespace-nowrap p-2.5 font-mono text-slate-600">{date(s.nextDueDate)}</td><td className="p-2.5 text-center"><span className={'rounded border px-2 py-0.5 text-[10px] font-bold ' + badge(statusOf(s,orders))}>{statusOf(s,orders)}</span></td>
              <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}><button className="rounded p-1 text-slate-600 hover:bg-slate-200" aria-label={'Actions for ' + number(s)} aria-expanded={menuId === s.id} onClick={e => { const box = e.currentTarget.getBoundingClientRect(); setMenuPosition({ top: Math.min(box.bottom + 4, window.innerHeight - 180), left: Math.max(8, box.right - 180) }); setMenuId(menuId === s.id ? null : s.id); }}><MoreHorizontal size={16} /></button></td>
            </tr>)}
          </tbody></table></div><div className="flex justify-between border-t border-slate-100 p-3 text-slate-500"><span>Showing {filtered.length} records</span><span>Scroll to view all records</span></div></div>
        {menuId && schedules.find(s => s.id === menuId) && <><button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close actions menu" onClick={() => setMenuId(null)} /><div className="fixed z-50 min-w-44 rounded-lg border bg-white p-1 text-left shadow-xl" style={{ top: menuPosition.top, left: menuPosition.left }}><button className="block w-full rounded px-3 py-2 text-left hover:bg-purple-50" onClick={() => select(menuId)}>View / Edit</button><button className="block w-full rounded px-3 py-2 text-left hover:bg-purple-50" onClick={() => generate(menuId)}>Generate due work order</button><button className="block w-full rounded px-3 py-2 text-left hover:bg-purple-50" onClick={() => toggle(schedules.find(s => s.id === menuId))}>{schedules.find(s => s.id === menuId).active ? 'Deactivate' : 'Activate'}</button><button className="block w-full rounded px-3 py-2 text-left hover:bg-purple-50" onClick={() => navigate('/assets/' + schedules.find(s => s.id === menuId).assetId)}>Open Asset 360</button></div></>}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900">Schedule Details</h2>{selected && !creating && <span className={'rounded border px-2 py-0.5 text-[10px] font-bold ' + (selected.active ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-slate-100 text-slate-600')}>{selected.active ? 'Active' : 'Inactive'}</span>}</div>
        {creating || selected ? <form className="space-y-3.5" onSubmit={save}>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Schedule No.</span><input readOnly className={input + ' bg-slate-100 font-mono'} value={creating ? 'Assigned on save' : number(selected)} /></label>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Asset *</span><select required className={input} value={form.assetId} disabled={!creating && selectedOrders.length > 0} onChange={e => update('assetId',e.target.value)}><option value="">Select registered asset</option>{assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.description}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="space-y-1"><span className="text-[11px] font-bold">Asset Category</span><input readOnly className={input + ' bg-slate-100'} value={selectedAsset?.category?.name || ''} /></label><label className="space-y-1"><span className="text-[11px] font-bold">Location</span><input readOnly className={input + ' bg-slate-100'} value={selectedAsset?.site?.name || ''} /></label></div>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Schedule Title *</span><input required className={input} value={form.title} onChange={e => update('title',e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="space-y-1"><span className="text-[11px] font-bold">Schedule Type</span><select className={input} value={form.workType} onChange={e => update('workType',e.target.value)}><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option></select></label><label className="space-y-1"><span className="text-[11px] font-bold">Repeat Every (Months)</span><input type="number" min="1" max="120" required className={input} value={form.frequencyMonths} onChange={e => update('frequencyMonths',Number(e.target.value))} /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="space-y-1"><span className="text-[11px] font-bold">Last Service Date</span><input readOnly className={input + ' bg-slate-100'} value={creating ? '—' : date(selected.lastPerformedDate)} /></label><label className="space-y-1"><span className="text-[11px] font-bold">Next Due Date *</span><input type="date" required className={input} value={form.nextDueDate} onChange={e => update('nextDueDate',e.target.value)} /></label></div>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Description</span><textarea rows={3} maxLength={500} className={input} value={form.description} onChange={e => update('description',e.target.value)} /><span className="block text-right text-[10px] text-slate-400">{form.description.length}/500</span></label>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Checklist (one task per line)</span><textarea rows={3} className={input} value={checklistText} onChange={e => setChecklistText(e.target.value)} /></label>
          <div className="space-y-2 border-t border-slate-100 pt-2"><h3 className="font-bold text-[#6C2BD9]">Additional Settings</h3><label className="flex gap-2"><input type="checkbox" checked={form.active} onChange={e => update('active',e.target.checked)} />Schedule active</label><label className="flex gap-2"><input type="checkbox" checked={form.autoGenerateWorkOrders} onChange={e => update('autoGenerateWorkOrders',e.target.checked)} />Automatically generate work order when due</label><label className="block space-y-1"><span>Generate this many days before due date</span><input type="number" min="0" max="90" className={input + ' max-w-24'} value={form.advanceDays} onChange={e => update('advanceDays',Number(e.target.value))} /></label></div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" className={outline} onClick={() => { if (creating) { setCreating(false); setSelectedId(schedules[0]?.id || null); } else { setForm(formFrom(selected)); setChecklistText((selected.checklist || []).join('\n')); } }}>Cancel</button><button type="submit" disabled={busy} className={purple + ' flex items-center gap-1'}><Save size={14} />Save Schedule</button></div>
          {!creating && <button type="button" className={outline + ' w-full'} disabled={busy || !selected.active} onClick={() => generate(selected.id)}>Generate due work order</button>}
        </form> : <p className="py-6 text-center text-slate-500">Select a schedule or create one.</p>}
      </section>
    </div>

    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12"><section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-8">
      <div className="flex gap-6 overflow-x-auto border-b border-slate-200">{[['UPCOMING','Upcoming Schedules',upcoming.length],['COMPLETED','Completed',completed.length],['OVERDUE','Overdue',overdue.length],['GENERATED_WO','Generated Work Orders',orders.length]].map(([key,label,count]) => <button key={key} onClick={() => setTab(key)} className={'whitespace-nowrap border-b-2 pb-2.5 text-xs font-bold ' + (tab === key ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800')}>{label} ({count})</button>)}</div>
      {tab === 'UPCOMING' || tab === 'OVERDUE' ? <div className="max-h-[350px] overflow-auto rounded-lg border"><table className="w-full border-collapse text-left text-xs"><thead className="border-b bg-[#F8FAFC] text-[11px] font-bold"><tr><th className="p-2.5">Due Date</th><th className="p-2.5">Schedule No.</th><th className="p-2.5">Asset No.</th><th className="p-2.5">Asset Name</th><th className="p-2.5">Location</th><th className="p-2.5">Type</th><th className="p-2.5">Status</th><th className="p-2.5">Action</th></tr></thead><tbody className="divide-y">{(tab === 'UPCOMING' ? upcoming : overdue).map(s => <tr key={s.id} className="hover:bg-slate-50"><td className="p-2.5">{date(s.nextDueDate)}</td><td className="p-2.5 font-mono text-[#6C2BD9]"><button onClick={() => select(s.id)}>{number(s)}</button></td><td className="p-2.5">{s.asset.assetId}</td><td className="p-2.5">{s.asset.description}</td><td className="p-2.5">{s.asset.site?.name || '—'}</td><td className="p-2.5">{s.workType}</td><td className="p-2.5">{statusOf(s,orders)}</td><td className="p-2.5"><button className="text-[#6C2BD9] hover:underline" onClick={() => select(s.id)}>View</button></td></tr>)}</tbody></table>{!(tab === 'UPCOMING' ? upcoming : overdue).length && <p className="p-4 text-slate-500">No schedules in this tab.</p>}</div> : <div className="max-h-[350px] space-y-2 overflow-auto">{(tab === 'COMPLETED' ? completed : orders).map(w => <button key={w.id} className="flex w-full items-center justify-between rounded-lg border bg-slate-50 p-3 text-left hover:bg-purple-50" onClick={() => navigate('/maintenance?workOrder=' + w.id)}><span><strong className="font-mono text-[#6C2BD9]">{w.workOrderNumber}</strong><span className="ml-3">{schedules.find(s => s.id === w.scheduleId)?.asset?.assetId || '—'}</span></span><span>{w.status} · {date(w.completedDate || w.dueDate)}</span></button>)}{!(tab === 'COMPLETED' ? completed : orders).length && <p className="rounded-lg border bg-slate-50 p-4 text-slate-500">No work orders in this tab yet.</p>}</div>}
    </section></div>
  </div>;
}

export default PreventiveMaintenance;
