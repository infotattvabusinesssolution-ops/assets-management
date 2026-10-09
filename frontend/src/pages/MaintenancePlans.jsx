import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, RefreshCw, Download, Save, X, Trash2, Wrench } from 'lucide-react';

const blank = () => ({
  name: '', description: '', workType: 'PREVENTIVE', applyToRule: 'CATEGORY',
  categoryId: '', siteId: '', custodianId: '', assetIds: [],
  frequencyMonths: 6, nextDueDate: new Date().toISOString().slice(0, 10),
  active: true, autoCreateWorkOrders: false, advanceDays: 7
});
const date = value => value ? new Date(value).toLocaleDateString() : '—';
const errorText = error => error?.message || 'Request failed.';
const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';
const buttonClass = 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50';
const tabs = ['Applicable Assets', 'Generated Work Orders', 'Checklist', 'Comments', 'History'];

export function MaintenancePlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(blank);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState(tabs[0]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [task, setTask] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categories = useMemo(() => [...new Map(assets.filter(a => a.category).map(a => [a.categoryId, { id: a.categoryId, name: a.category.name }])).values()].sort((a,b) => a.name.localeCompare(b.name)), [assets]);
  const sites = useMemo(() => [...new Map(assets.filter(a => a.site).map(a => [a.siteId, { id: a.siteId, name: a.site.name }])).values()].sort((a,b) => a.name.localeCompare(b.name)), [assets]);
  const custodians = useMemo(() => [...new Map(assets.filter(a => a.custodian).map(a => [a.custodian.id, { id: a.custodian.id, name: a.custodian.fullName }])).values()].sort((a,b) => a.name.localeCompare(b.name)), [assets]);
  const categoryName = id => categories.find(x => x.id === id)?.name || '—';
  const siteName = id => sites.find(x => x.id === id)?.name || '—';
  const filtered = useMemo(() => plans.filter(p =>
    (!search || [p.name, p.planNumber, p.description].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))) &&
    (categoryFilter === 'ALL' || p.categoryId === categoryFilter) &&
    (status === 'ALL' || (status === 'ACTIVE' ? p.active : !p.active)) &&
    (type === 'ALL' || p.workType === type) &&
    (siteFilter === 'ALL' || p.siteId === siteFilter || (p.applyToRule === 'CATEGORY' && assets.some(a => a.categoryId === p.categoryId && a.siteId === siteFilter)) || (p.applyToRule === 'SPECIFIC' && p.assetIds.some(id => assets.find(a => a.id === id)?.siteId === siteFilter)))
  ), [plans, search, categoryFilter, status, type, siteFilter, assets]);

  async function loadPlans(preferred) {
    const [planResponse, assetResponse] = await Promise.all([api.get('/maintenance/plans'), api.get('/maintenance/assets')]);
    const nextPlans = planResponse.plans || [];
    setPlans(nextPlans);
    setAssets(assetResponse.assets || []);
    if (preferred !== undefined) setSelectedId(preferred);
    else if (!selectedId && nextPlans.length) setSelectedId(nextPlans[0].id);
    setLoading(false);
  }
  async function loadDetail(id) {
    if (!id) return;
    const result = await api.get('/maintenance/plans/' + id);
    setDetail(result.plan);
    setForm({
      name: result.plan.name, description: result.plan.description || '',
      workType: result.plan.workType, applyToRule: result.plan.applyToRule,
      categoryId: result.plan.categoryId || '', siteId: result.plan.siteId || '',
      custodianId: result.plan.custodianId || '', assetIds: result.plan.assetIds || [],
      frequencyMonths: result.plan.frequencyMonths,
      nextDueDate: result.plan.nextDueDate.slice(0, 10),
      active: result.plan.active, autoCreateWorkOrders: result.plan.autoCreateWorkOrders,
      advanceDays: result.plan.advanceDays
    });
  }
  useEffect(() => {
    loadPlans().catch(e => { setError(errorText(e)); setLoading(false); });
  }, []);
  useEffect(() => {
    if (!selectedId || creating) return;
    loadDetail(selectedId).catch(e => setError(errorText(e)));
  }, [selectedId, creating]);

  function update(key, value) { setForm(previous => ({ ...previous, [key]: value })); }
  function select(id) { setCreating(false); setSelectedId(id); setDetail(null); setTab(tabs[0]); setMessage(''); setError(''); }
  function create() { setCreating(true); setSelectedId(null); setDetail(null); setForm(blank()); setTab(tabs[0]); setMessage(''); setError(''); }
  async function refresh() {
    setError(''); setMessage('');
    try { await loadPlans(); if (selectedId && !creating) await loadDetail(selectedId); }
    catch (e) { setError(errorText(e)); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = creating
        ? await api.post('/maintenance/plans', form)
        : await api.put('/maintenance/plans/' + selectedId, form);
      setCreating(false);
      await loadPlans(response.plan.id);
      await loadDetail(response.plan.id);
      setMessage('Plan saved.');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  async function act(operation, successMessage) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await operation();
      await loadPlans(selectedId);
      await loadDetail(selectedId);
      setMessage(response?.result?.message || successMessage);
      return true;
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    const rows = [['Plan number','Name','Work type','Asset rule','Assets','Frequency months','Next due','Active','Auto create work orders']];
    filtered.forEach(p => rows.push([p.planNumber,p.name,p.workType,p.applyToRule,p.assetCount,p.frequencyMonths,p.nextDueDate?.slice(0,10),p.active?'Yes':'No',p.autoCreateWorkOrders?'Yes':'No']));
    const csv = rows.map(row => row.map(value => {
      const cell = String(value ?? '');
      return '"' + (/^[=+@\-]/.test(cell) ? "'" + cell : cell).replaceAll('"','""') + '"';
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'maintenance-plans.csv'; link.click(); URL.revokeObjectURL(url);
  }
  const selected = plans.find(p => p.id === selectedId);
  const tabKeys = [
    ['Applicable Assets', detail?.assets?.length || 0],
    ['Generated Work Orders', detail?.workOrders?.length || 0],
    ['Checklist', detail?.checklist?.length || 0],
    ['Comments', detail?.comments?.length || 0],
    ['History', detail?.events?.length || 0]
  ];
  const input = 'w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#6C2BD9] focus:outline-none';
  const purpleButton = 'rounded-lg bg-[#6C2BD9] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B21B6] disabled:opacity-50';
  const outlineButton = 'rounded-lg border border-[#6C2BD9] bg-white px-4 py-2 text-xs font-bold text-[#6C2BD9] hover:bg-purple-50 disabled:opacity-50';
  return <div className="min-h-screen space-y-4 bg-[#F8FAFC] p-2 font-sans text-xs text-slate-800 sm:p-3">
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><span>Maintenance</span><span>›</span><span className="font-bold text-[#6C2BD9]">Maintenance Plans</span></div>
        <h1 className="mt-1 text-xl font-extrabold text-slate-900">Maintenance Plans</h1>
        <p className="mt-0.5 text-xs text-slate-500">Define and manage preventive maintenance plans for assets</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={purpleButton + ' flex items-center gap-1.5'} onClick={create}><Plus size={15} />Create Maintenance Plan</button>
        <button className={outlineButton + ' flex items-center gap-1.5'} onClick={exportCsv} disabled={!filtered.length}><Download size={15} />Export</button>
        <button className={outlineButton} onClick={refresh} aria-label="Refresh plans"><RefreshCw size={15} /></button>
      </div>
    </div>

    {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 font-semibold text-rose-800">{error}</div>}
    {message && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</div>}

    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <label className="space-y-1 lg:col-span-2"><span className="text-[11px] font-bold text-slate-700">Search</span><input className={input} placeholder="Search by Plan No., Name, Asset Type..." value={search} onChange={e => setSearch(e.target.value)} /></label>
        <label className="space-y-1"><span className="text-[11px] font-bold text-slate-700">Asset Category</span><select className={input} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="ALL">All</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold text-slate-700">Maintenance Type</span><select className={input} value={type} onChange={e => setType(e.target.value)}><option value="ALL">All</option><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option><option value="CORRECTIVE">Corrective</option></select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold text-slate-700">Status</span><select className={input} value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        <label className="space-y-1"><span className="text-[11px] font-bold text-slate-700">Location</span><select className={input} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}><option value="ALL">All</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      </div>
      <div className="mt-2 flex justify-end border-t border-slate-100 pt-2"><button className={outlineButton} onClick={() => { setSearch(''); setCategoryFilter('ALL'); setType('ALL'); setStatus('ALL'); setSiteFilter('ALL'); }}>Clear Filters</button></div>
    </div>

    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-8">
        <h2 className="text-sm font-bold text-slate-900">Maintenance Plans ({filtered.length})</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="max-h-[540px] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold text-slate-700"><tr>
                <th className="w-8 p-2.5" aria-label="Selected plan" />
                <th className="p-2.5">Plan No.</th><th className="p-2.5">Plan Name</th><th className="p-2.5">Asset Category</th><th className="p-2.5">Maintenance Type</th><th className="p-2.5">Frequency</th><th className="p-2.5 text-center">Status</th><th className="p-2.5">Next Due Date</th><th className="p-2.5 text-center">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {loading && <tr><td className="p-4 text-slate-500" colSpan={9}>Loading plans…</td></tr>}
                {!loading && !filtered.length && <tr><td className="p-4 text-slate-500" colSpan={9}>No plans match these filters.</td></tr>}
                {filtered.map(p => <tr key={p.id} onClick={() => select(p.id)} className={'cursor-pointer transition-colors hover:bg-slate-50 ' + (selectedId === p.id && !creating ? 'bg-purple-50/60 font-semibold' : '')}>
                  <td className="p-2.5 text-center"><input type="radio" name="selectedPlan" checked={selectedId === p.id && !creating} onChange={() => select(p.id)} aria-label={'Select ' + p.name} /></td>
                  <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{p.planNumber}</td>
                  <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                  <td className="p-2.5">{categoryName(p.categoryId)}</td>
                  <td className="p-2.5">{p.workType}</td>
                  <td className="p-2.5 whitespace-nowrap">Every {p.frequencyMonths} months</td>
                  <td className="p-2.5 text-center"><span className={'rounded border px-2 py-0.5 text-[10px] font-bold ' + (p.active ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-slate-200 text-slate-600')}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="whitespace-nowrap p-2.5 font-mono text-slate-600">{date(p.nextDueDate)}</td>
                  <td className="p-2.5 text-center"><button type="button" onClick={e => { e.stopPropagation(); select(p.id); }} className="rounded p-1 text-[#6C2BD9] hover:bg-purple-100" aria-label={'View ' + p.name}>View</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between border-t border-slate-100 bg-white p-3 text-xs text-slate-500"><span>Showing {filtered.length} records</span><span>Scroll to view all records</span></div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900">Plan Details</h2>{selected && !creating && <span className="rounded border border-purple-200 bg-purple-50 px-2 py-1 font-mono text-[11px] text-[#6C2BD9]">{selected.planNumber}</span>}</div>
        {creating || selected ? <form className="space-y-3.5" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-[11px] font-bold">Plan No.</span><input readOnly className={input + ' bg-slate-100 font-mono'} value={creating ? 'Assigned on save' : selected?.planNumber || ''} /></label>
            <label className="space-y-1"><span className="text-[11px] font-bold">Status</span><select className={input} value={form.active ? 'ACTIVE' : 'INACTIVE'} onChange={e => update('active',e.target.value === 'ACTIVE')}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
          </div>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Plan Name *</span><input required className={input + ' font-bold'} value={form.name} onChange={e => update('name',e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-[11px] font-bold">Asset Category</span><select className={input} value={form.categoryId} onChange={e => update('categoryId',e.target.value)}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="space-y-1"><span className="text-[11px] font-bold">Maintenance Type *</span><select className={input} value={form.workType} onChange={e => update('workType',e.target.value)}><option value="PREVENTIVE">Preventive</option><option value="INSPECTION">Inspection</option><option value="CORRECTIVE">Corrective</option></select></label>
          </div>
          <label className="block space-y-1"><span className="text-[11px] font-bold">Description</span><textarea className={input} rows={3} maxLength={500} value={form.description} onChange={e => update('description',e.target.value)} /><span className="block text-right text-[10px] text-slate-400">{form.description.length}/500</span></label>
          <div className="space-y-2 border-t border-slate-100 pt-2"><h3 className="text-xs font-bold text-[#6C2BD9]">Scheduling</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1"><span className="text-[10px] font-bold">Frequency Type</span><select className={input} value="MONTHS" disabled><option value="MONTHS">Calendar (Months)</option></select></label>
              <label className="space-y-1"><span className="text-[10px] font-bold">Every *</span><div className="flex items-center gap-1"><input required type="number" min="1" max="120" className={input} value={form.frequencyMonths} onChange={e => update('frequencyMonths',Number(e.target.value))} /><span className="text-[10px] font-bold">Months</span></div></label>
              <label className="space-y-1"><span className="text-[10px] font-bold">Created</span><input readOnly className={input + ' bg-slate-100'} value={creating ? 'On save' : date(detail?.createdAt)} /></label>
              <label className="space-y-1"><span className="text-[10px] font-bold">Next Due Date *</span><input required type="date" className={input} value={form.nextDueDate} onChange={e => update('nextDueDate',e.target.value)} /></label>
            </div>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-2"><h3 className="text-xs font-bold text-[#6C2BD9]">Apply To</h3>
            <div className="grid grid-cols-2 gap-2 font-medium">
              {[['CATEGORY','All assets of selected category'],['SPECIFIC','Specific assets'],['LOCATION','Assets by location'],['CUSTODIAN','Assets by custodian'],['FILTER','Assets from asset filter']].map(([key,label]) => <label key={key} className="flex cursor-pointer items-center gap-1.5"><input type="radio" name="applyToRule" checked={form.applyToRule === key} onChange={() => update('applyToRule',key)} />{label}</label>)}
            </div>
            {['LOCATION','FILTER'].includes(form.applyToRule) && <label className="block space-y-1"><span className="text-[10px] font-bold">Site</span><select className={input} value={form.siteId} onChange={e => update('siteId',e.target.value)}><option value="">Select site</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
            {form.applyToRule === 'CUSTODIAN' && <label className="block space-y-1"><span className="text-[10px] font-bold">Custodian</span><select className={input} value={form.custodianId} onChange={e => update('custodianId',e.target.value)}><option value="">Select custodian</option>{custodians.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
            {form.applyToRule === 'SPECIFIC' && <div className="space-y-1"><span className="text-[10px] font-bold">Registered assets ({form.assetIds.length} selected)</span><div className="max-h-36 overflow-auto rounded-lg border p-2">{assets.map(a => <label key={a.id} className="flex gap-2 py-1"><input type="checkbox" checked={form.assetIds.includes(a.id)} onChange={e => update('assetIds',e.target.checked ? [...form.assetIds,a.id] : form.assetIds.filter(id => id !== a.id))} /><span>{a.assetId} — {a.description}</span></label>)}</div></div>}
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-2"><h3 className="text-xs font-bold text-[#6C2BD9]">Additional Settings</h3>
            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={form.autoCreateWorkOrders} onChange={e => update('autoCreateWorkOrders',e.target.checked)} />Automatically create work order</label>
            <label className="block space-y-1"><span className="text-[10px] font-bold">Create this many days before due date</span><div className="flex items-center gap-2"><input type="number" min="0" max="90" className={input + ' max-w-20'} value={form.advanceDays} onChange={e => update('advanceDays',Number(e.target.value))} /><span>Days</span></div></label>
            <p className="text-[11px] text-slate-500">Checklist tasks below are copied to generated work orders.</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" className={outlineButton} onClick={() => { if (creating) { setCreating(false); setSelectedId(plans[0]?.id || null); } else loadDetail(selectedId).catch(e => setError(errorText(e))); }}>Cancel</button>
            <button type="submit" disabled={busy || !assets.length} className={purpleButton + ' flex items-center gap-1'}><Save size={14} />Save Plan</button>
          </div>
          {!creating && <button type="button" disabled={busy || !detail?.active} className={outlineButton + ' w-full'} onClick={() => act(() => api.post('/maintenance/plans/' + selectedId + '/generate'), 'Generation checked.')}><Wrench size={14} className="mr-1 inline" />Generate due work orders</button>}
        </form> : <p className="py-6 text-center text-slate-500">Select a plan or create a new one.</p>}
      </section>
    </div>

    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-8">
        <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200">
          {tabKeys.map(([name,count]) => <button key={name} type="button" onClick={() => setTab(name)} className={'whitespace-nowrap border-b-2 pb-2.5 text-xs font-bold transition-all ' + (tab === name ? 'border-[#6C2BD9] text-[#6C2BD9]' : 'border-transparent text-slate-500 hover:text-slate-800')}>{name} ({count})</button>)}
        </div>
        {creating ? <p className="p-4 text-slate-500">Save the new plan to see its assets and activity.</p> : !detail ? <p className="p-4 text-slate-500">{selectedId ? 'Loading plan details…' : 'Select a plan.'}</p> : <>
          {tab === 'Applicable Assets' && <div className="overflow-hidden rounded-lg border border-slate-200"><div className="max-h-[300px] overflow-auto"><table className="w-full border-collapse text-left text-xs"><thead className="sticky top-0 border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold"><tr><th className="p-2.5">#</th><th className="p-2.5">Asset No.</th><th className="p-2.5">Asset Name</th><th className="p-2.5">Location</th><th className="p-2.5">Custodian</th><th className="p-2.5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{detail.assets.map((a,i) => <tr key={a.id} className="hover:bg-slate-50"><td className="p-2.5 text-slate-500">{i+1}</td><td className="p-2.5 font-mono font-bold"><button className="text-[#6C2BD9] hover:underline" onClick={() => navigate('/assets/' + a.id)}>{a.assetId}</button></td><td className="p-2.5 font-bold">{a.description}</td><td className="p-2.5">{a.site?.name || '—'}</td><td className="p-2.5">{a.custodian?.fullName || '—'}</td><td className="p-2.5">{a.lifecycleStatus}</td></tr>)}</tbody></table>{!detail.assets.length && <p className="p-4 text-slate-500">No accessible assets currently match this plan.</p>}</div><div className="border-t p-2.5 text-slate-500">Showing {detail.assets.length} records</div></div>}
          {tab === 'Generated Work Orders' && <div className="space-y-2">{detail.workOrders.length ? detail.workOrders.map(w => <button key={w.id} className="flex w-full items-center justify-between rounded-lg border bg-slate-50 p-3 text-left hover:bg-purple-50" onClick={() => navigate('/maintenance?workOrder=' + w.id)}><span><strong className="font-mono text-[#6C2BD9]">{w.workOrderNumber}</strong><span className="ml-3">{w.asset?.assetId}</span></span><span>{w.status} · Due {date(w.planDueDate)}</span></button>) : <p className="rounded-lg border bg-slate-50 p-4 text-slate-500">No work orders generated for this plan yet.</p>}</div>}
          {tab === 'Checklist' && <div className="space-y-2"><div className="flex gap-2"><input className={input} placeholder="New checklist task" aria-label="New checklist task" value={task} onChange={e => setTask(e.target.value)} /><button className={purpleButton} disabled={busy || !task.trim()} onClick={() => act(() => api.post('/maintenance/plans/' + selectedId + '/checklist', { task: task.trim() }), 'Task added.').then(ok => { if (ok) setTask(''); })}>Add</button></div>{detail.checklist.length ? detail.checklist.map(item => <div key={item.id} className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"><span>{item.task}</span><button className="text-rose-600" disabled={busy} aria-label={'Remove ' + item.task} onClick={() => act(() => api.delete('/maintenance/plans/' + selectedId + '/checklist/' + item.id), 'Task removed.')}><Trash2 size={15} /></button></div>) : <p className="p-4 text-slate-500">No checklist tasks yet.</p>}</div>}
          {tab === 'Comments' && <div className="space-y-2"><div className="flex gap-2"><input className={input} placeholder="Write a comment" aria-label="Write a comment" value={comment} onChange={e => setComment(e.target.value)} /><button className={purpleButton} disabled={busy || !comment.trim()} onClick={() => act(() => api.post('/maintenance/plans/' + selectedId + '/comments', { text: comment.trim() }), 'Comment posted.').then(ok => { if (ok) setComment(''); })}>Post</button></div>{detail.comments.length ? detail.comments.map(c => <div key={c.id} className="rounded-lg border bg-slate-50 p-3"><strong>{c.authorName}</strong><span className="ml-2 text-slate-500">{new Date(c.createdAt).toLocaleString()}</span><p className="mt-1 whitespace-pre-wrap">{c.text}</p></div>) : <p className="p-4 text-slate-500">No comments yet.</p>}</div>}
          {tab === 'History' && <div className="space-y-2">{detail.events.length ? detail.events.map(e => <div key={e.id} className="rounded-lg border bg-slate-50 p-3"><strong>{e.action.replaceAll('_',' ')}</strong><span className="ml-2 text-slate-500">{new Date(e.createdAt).toLocaleString()}</span><p className="mt-1">{e.details}</p><span className="text-slate-500">By {e.actorName}</span></div>) : <p className="p-4 text-slate-500">No history yet.</p>}</div>}
        </>}
      </section>
    </div>
  </div>;
}

export default MaintenancePlans;
