import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ExcelJS from 'exceljs';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileSpreadsheet, Printer, Search, X } from 'lucide-react';
import { api } from '../services/api';

const initialFilters = { query: '', category: '', location: '', printStatus: '' };
const initialOptions = { copies: 1, assetNumber: true, assetName: true, serialNumber: true, assetImage: false };
const tabs = ['Search & Select', 'Upload from File', 'Tag Templates', 'Print Settings', 'Preview & Layout', 'Print History'];

const clean = value => String(value?.text ?? value?.result ?? value ?? '').trim();
const columnKey = value => clean(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const escapeHtml = value => clean(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function parseCsv(source) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(field); field = ''; }
    else if ((character === '\r' || character === '\n') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index++;
      row.push(field); if (row.some(value => clean(value))) rows.push(row);
      row = []; field = '';
    } else field += character;
  }
  row.push(field); if (row.some(value => clean(value))) rows.push(row);
  return rows;
}

async function readRows(file) {
  if (/\.csv$/i.test(file.name)) return parseCsv((await file.text()).replace(/^\uFEFF/, ''));
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Choose an .xlsx or .csv file.');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('The Excel file has no worksheet.');
  const rows = [];
  sheet.eachRow(row => rows.push(Array.from({ length: sheet.columnCount }, (_, index) => clean(row.getCell(index + 1).value))));
  return rows;
}

function barcodeSvg(value) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, { format: 'CODE128', displayValue: false, margin: 0, height: 38, width: 1.5 });
  return svg.outerHTML;
}

function codeSvg(value, template) {
  return template.format === 'QR_CODE'
    ? renderToStaticMarkup(<QRCodeSVG value={value} size={84} />)
    : barcodeSvg(value);
}

function LiveLabel({ label, template, options }) {
  const barcodeRef = useRef(null);
  useEffect(() => {
    if (barcodeRef.current && label?.tagNumber && template?.format !== 'QR_CODE') {
      try { JsBarcode(barcodeRef.current, label.tagNumber, { format: 'CODE128', displayValue: false, margin: 0, height: 38, width: 1.5 }); }
      catch { barcodeRef.current.innerHTML = ''; }
    }
  }, [label?.tagNumber, template?.format]);
  if (!label || !template) return <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-500">Select an asset to generate its real label preview.</div>;
  return (
    <div className="mx-auto bg-white border-2 border-slate-900 rounded-lg p-3 max-w-full text-center shadow-sm" style={{ width: Math.min(template.widthMm * 5, 390), minHeight: Math.min(template.heightMm * 5, 260) }}>
      <p className="text-[9px] font-black tracking-widest text-slate-900">ASSET360</p>
      {options.assetImage && label.imageUrl && <img src={label.imageUrl} alt="" className="w-9 h-9 object-cover mx-auto my-1" />}
      {options.assetNumber && <p className="font-mono font-black text-sm text-slate-950 break-all">{label.assetNumber}</p>}
      {options.assetName && <p className="text-[10px] font-semibold text-slate-700 truncate">{label.assetName}</p>}
      <div className="flex justify-center items-center my-2 min-h-10">
        {template.format === 'QR_CODE' ? <QRCodeSVG value={label.tagNumber} size={84} /> : <svg ref={barcodeRef} className="max-w-full h-10" />}
      </div>
      <p className="font-mono text-[10px] font-bold text-slate-950 break-all">{label.tagNumber}</p>
      {options.serialNumber && label.serialNumber && <p className="text-[9px] text-slate-600 truncate">S/N {label.serialNumber}</p>}
      {label.rfidEpc && template.fields.includes('rfidEpc') && <p className="font-mono text-[8px] text-slate-500 break-all">EPC {label.rfidEpc}</p>}
    </div>
  );
}

function printDocument(labels, template, options, imagesByAssetId) {
  const cards = labels.map(label => {
    const visual = codeSvg(label.tagNumber, template);
    const imageUrl = imagesByAssetId.get(label.assetId);
    return `<div class="label"><div class="brand">ASSET360</div>${options.assetImage && imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="">` : ''}${options.assetNumber ? `<div class="number">${escapeHtml(label.assetNumber)}</div>` : ''}${options.assetName ? `<div class="name">${escapeHtml(label.assetName)}</div>` : ''}<div class="code">${visual}</div><div class="tag">${escapeHtml(label.tagNumber)}</div>${options.serialNumber && label.serialNumber ? `<div class="serial">S/N ${escapeHtml(label.serialNumber)}</div>` : ''}${label.rfidEpc && template.fields.includes('rfidEpc') ? `<div class="epc">EPC ${escapeHtml(label.rfidEpc)}</div>` : ''}</div>`;
  }).join('');
  return `<!doctype html><html><head><title>Asset tags</title><style>@page{size:${template.widthMm}mm ${template.heightMm}mm;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}.label{width:${template.widthMm}mm;height:${template.heightMm}mm;padding:2mm;border:1px solid #111;text-align:center;break-after:page;overflow:hidden}.brand{font-size:7pt;font-weight:900;letter-spacing:1.5px}.number{font:900 11pt monospace}.name{font-size:8pt;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.code{margin:1mm auto}.code svg{max-width:100%;height:10mm}.tag{font:700 7pt monospace;overflow-wrap:anywhere}.serial,.epc{font-size:6pt;overflow-wrap:anywhere}.label img{height:8mm;width:8mm;object-fit:cover}</style></head><body>${cards}</body></html>`;
}

export function PrintTagsWorkbench() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Search & Select');
  const [assets, setAssets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [options, setOptions] = useState(initialOptions);
  const [previewLabel, setPreviewLabel] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const template = templates.find(item => item.id === templateId);
  const selectedAssets = selectedIds.map(id => assets.find(asset => asset.id === id)).filter(Boolean);
  const previewAsset = selectedAssets[0];
  const categories = [...new Set(assets.map(asset => asset.category).filter(Boolean))].sort();
  const locations = [...new Set(assets.map(asset => asset.location).filter(Boolean))].sort();
  const visibleAssets = useMemo(() => assets.filter(asset => {
    const query = appliedFilters.query.toLowerCase();
    if (query && ![asset.assetNumber, asset.assetName, asset.serialNumber, asset.currentTag, asset.printTagNumber].some(value => clean(value).toLowerCase().includes(query))) return false;
    if (appliedFilters.category && asset.category !== appliedFilters.category) return false;
    if (appliedFilters.location && asset.location !== appliedFilters.location) return false;
    if (appliedFilters.printStatus && asset.printStatus !== appliedFilters.printStatus) return false;
    return true;
  }), [assets, appliedFilters]);

  const notify = (text, type = 'success') => setMessage({ text, type });
  const refreshAssets = async () => {
    const response = await api.get('/tagging/assets');
    if (!response?.success || !Array.isArray(response.assets)) throw new Error(response?.message || 'Could not load assets.');
    setAssets(response.assets);
    return response.assets;
  };
  const refreshHistory = async () => {
    const response = await api.get('/tagging/print-history');
    if (!response?.success) throw new Error(response?.message || 'Could not load print history.');
    setHistory(response.history || []);
  };

  useEffect(() => {
    Promise.allSettled([refreshAssets(), api.get('/tagging/templates')]).then(([assetResult, templateResult]) => {
      if (assetResult.status === 'rejected') notify(assetResult.reason?.message || 'Could not load assets.', 'error');
      else {
        const requestedIds = (searchParams.get('assetIds') || searchParams.get('assetId') || '').split(',').filter(Boolean);
        const matches = assetResult.value.filter(asset => requestedIds.includes(asset.id) || requestedIds.includes(asset.assetNumber));
        if (matches.length) setSelectedIds(matches.map(asset => asset.id));
      }
      if (templateResult.status === 'fulfilled' && templateResult.value?.success) {
        const list = templateResult.value.templates || [];
        setTemplates(list); setTemplateId(list[0]?.id || '');
      } else notify('Could not load label templates from the backend.', 'error');
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'Print History') refreshHistory().catch(error => notify(error.message, 'error'));
  }, [activeTab]);

  useEffect(() => {
    if (!previewAsset || !templateId) { setPreviewLabel(null); return; }
    let cancelled = false;
    setPreviewLabel(null); setPreviewLoading(true);
    api.post('/tagging/prepare', { template: templateId, assets: [{ id: previewAsset.id }], quantity: 1 })
      .then(response => {
        if (!cancelled) {
          if (!response?.success || !response.labels?.[0]) throw new Error(response?.message || 'Could not generate preview.');
          setPreviewLabel({ ...response.labels[0], imageUrl: previewAsset.imageUrl });
        }
      })
      .catch(error => { if (!cancelled) notify(error.message || 'Could not generate preview.', 'error'); })
      .finally(() => { if (!cancelled) setPreviewLoading(false); });
    return () => { cancelled = true; };
  }, [previewAsset?.id, templateId]);

  const toggleAsset = id => setSelectedIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const toggleVisible = () => {
    const ids = visibleAssets.map(asset => asset.id);
    setSelectedIds(previous => ids.every(id => previous.includes(id)) ? previous.filter(id => !ids.includes(id)) : [...new Set([...previous, ...ids])]);
  };
  const setOption = key => setOptions(previous => ({ ...previous, [key]: !previous[key] }));

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Print tags');
    sheet.addRow(['Asset Number', 'Asset Name', 'Category', 'Location', 'Serial Number']);
    sheet.addRow(['AST-001', '', '', '', '']);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(column => { column.width = 22; });
    const blob = new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'print-tags-template.xlsx'; link.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async file => {
    if (!file) return;
    setBusy(true);
    try {
      const [header, ...data] = await readRows(file);
      if (!header || !data.length) throw new Error('The file needs a header and asset rows.');
      const keys = header.map(columnKey);
      const get = (row, names) => { const index = keys.findIndex(key => names.includes(key)); return index < 0 ? '' : clean(row[index]); };
      if (!keys.some(key => ['assetnumber', 'assetid', 'serialnumber'].includes(key))) throw new Error('Add an Asset Number or Serial Number column.');
      const rows = data.map((row, index) => ({ rowNumber: index + 2, assetNumber: get(row, ['assetnumber', 'assetid']), assetName: get(row, ['assetname', 'description']), category: get(row, ['category']), location: get(row, ['location', 'site']), serialNumber: get(row, ['serialnumber', 'serial']) })).filter(row => row.assetNumber || row.serialNumber);
      if (!rows.length) throw new Error('No asset identifiers were found.');
      const seen = new Set();
      for (const row of rows) { const key = (row.assetNumber || row.serialNumber).toLowerCase(); if (seen.has(key)) throw new Error(`Duplicate asset on row ${row.rowNumber}.`); seen.add(key); }
      const latest = await refreshAssets();
      const resolvedRows = rows.map(row => {
        const match = latest.find(asset => row.assetNumber ? asset.assetNumber.toLowerCase() === row.assetNumber.toLowerCase() : asset.serialNumber && asset.serialNumber.toLowerCase() === row.serialNumber.toLowerCase());
        return match ? { ...row, assetNumber: match.assetNumber } : row;
      });
      const response = await api.post('/tagging/import', { assets: resolvedRows });
      if (!response?.success || !Array.isArray(response.imported)) throw new Error(response?.message || 'Import failed.');
      const ids = [...new Set(response.imported.map(asset => asset.id))];
      await refreshAssets(); setSelectedIds(ids); setActiveTab('Search & Select');
      notify(`${ids.length} assets added to the print queue.`);
    } catch (error) { notify(error.message || 'Could not import file.', 'error'); }
    finally { setBusy(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const saveDraft = () => {
    sessionStorage.setItem('printTagsDraft', JSON.stringify({ selectedIds, templateId, options }));
    notify('Print queue saved in this browser session.');
  };
  const restoreDraft = () => {
    try {
      const draft = JSON.parse(sessionStorage.getItem('printTagsDraft') || 'null');
      if (!draft?.selectedIds?.length) throw new Error('No saved print queue was found.');
      setSelectedIds(draft.selectedIds.filter(id => assets.some(asset => asset.id === id)));
      if (templates.some(item => item.id === draft.templateId)) setTemplateId(draft.templateId);
      setOptions({ ...initialOptions, ...draft.options }); notify('Print queue restored.');
    } catch (error) { notify(error.message, 'error'); }
  };

  const printTags = async () => {
    if (!selectedIds.length || !template) return notify('Select assets and a template first.', 'error');
    const popup = window.open('', '_blank');
    if (!popup) return notify('Allow popups to print asset labels.', 'error');
    popup.document.write('<p>Preparing labels...</p>');
    setBusy(true);
    try {
      const request = { template: template.id, quantity: options.copies, receiptId: searchParams.get('receiptId') || undefined, reprintOnly: searchParams.get('reprintOnly') === '1', assets: selectedIds.map(id => ({ id })) };
      const prepared = await api.post('/tagging/prepare', request);
      if (!prepared?.success || !prepared.labels?.length) throw new Error(prepared?.message || 'No labels were prepared.');
      const imageByAssetId = new Map(assets.map(asset => [asset.id, asset.imageUrl]));
      const documentHtml = printDocument(prepared.labels, template, options, imageByAssetId);
      const response = await api.post('/tagging/print', request);
      if (!response?.success || response.labels?.length !== prepared.labels.length || response.labels.some((label, index) => label.tagNumber !== prepared.labels[index].tagNumber)) {
        throw new Error('The prepared labels changed before printing. Please try again.');
      }
      popup.document.open(); popup.document.write(documentHtml); popup.document.close();
      popup.focus(); setTimeout(() => popup.print(), 250);
      await refreshAssets();
      notify(`${response.labels.length} labels sent to the browser print dialog.`);
      if (activeTab === 'Print History') await refreshHistory();
    } catch (error) { popup.close(); notify(error.message || 'Could not prepare labels.', 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><button type="button" onClick={() => navigate('/receiving')} className="text-xs text-slate-500 hover:text-purple-700">Receiving &amp; Tagging ›</button><h1 className="text-2xl font-bold text-slate-900">Print Tags</h1><p className="text-xs text-slate-500">Prepare unique labels for registered and newly imported assets.</p></div>
        <div className="flex items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-purple-100 text-purple-700 px-3 py-1">{selectedIds.length} selected</span><button type="button" onClick={saveDraft} className="px-3 py-2 rounded-xl border border-slate-200 bg-white">Save queue</button><button type="button" onClick={restoreDraft} className="px-3 py-2 rounded-xl border border-slate-200 bg-white">Restore queue</button></div>
      </div>
      {message && <div role="status" className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-xs font-semibold ${message.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><span>{message.text}</span><button type="button" onClick={() => setMessage(null)} aria-label="Dismiss"><X className="w-4 h-4" /></button></div>}
      <div className="flex gap-4 overflow-x-auto border-b border-slate-200 text-xs font-bold">
        {tabs.map(tab => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 pb-3 ${activeTab === tab ? 'border-b-2 border-purple-700 text-purple-700' : 'text-slate-500 hover:text-slate-800'}`}>{tab}</button>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 space-y-5">
          {activeTab === 'Search & Select' && <>
            <form onSubmit={event => { event.preventDefault(); setAppliedFilters({ ...filters }); }} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Search className="w-4 h-4 text-purple-700" /> Find assets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                <input value={filters.query} onChange={event => setFilters(previous => ({ ...previous, query: event.target.value }))} placeholder="Asset, serial or tag number" className="px-3 py-2 rounded-xl border border-slate-200" />
                <select value={filters.category} onChange={event => setFilters(previous => ({ ...previous, category: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200"><option value="">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select>
                <select value={filters.location} onChange={event => setFilters(previous => ({ ...previous, location: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200"><option value="">All locations</option>{locations.map(value => <option key={value}>{value}</option>)}</select>
                <select value={filters.printStatus} onChange={event => setFilters(previous => ({ ...previous, printStatus: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200"><option value="">All print statuses</option><option>Not Printed</option><option>Printed</option></select>
              </div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => { setFilters(initialFilters); setAppliedFilters(initialFilters); }} className="px-4 py-2 border rounded-xl text-xs">Clear</button><button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold">Search</button></div>
            </form>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-2"><h2 className="text-sm font-bold">Assets ({visibleAssets.length})</h2><button type="button" onClick={() => setActiveTab('Upload from File')} className="text-xs font-bold text-purple-700 flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Import Excel</button></div>
              <div className="overflow-auto max-h-[500px]"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-slate-50 text-slate-600"><tr><th className="p-3"><input type="checkbox" aria-label="Select all visible assets" checked={visibleAssets.length > 0 && visibleAssets.every(asset => selectedIds.includes(asset.id))} onChange={toggleVisible} /></th><th className="p-3">Asset Number</th><th className="p-3">Asset Name</th><th className="p-3">Serial Number</th><th className="p-3">Tag</th><th className="p-3">Print Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleAssets.map(asset => <tr key={asset.id} onClick={() => toggleAsset(asset.id)} className={`cursor-pointer hover:bg-purple-50 ${selectedIds.includes(asset.id) ? 'bg-purple-50' : ''}`}><td className="p-3" onClick={event => event.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleAsset(asset.id)} aria-label={`Select ${asset.assetNumber}`} /></td><td className="p-3 font-mono font-bold text-purple-700">{asset.assetNumber}</td><td className="p-3">{asset.assetName}</td><td className="p-3 font-mono">{asset.serialNumber || '—'}</td><td className="p-3 font-mono">{asset.currentTag !== '-' ? asset.currentTag : asset.printTagNumber || 'Generated on selection'}</td><td className="p-3">{asset.printStatus || 'Not Printed'}</td></tr>)}</tbody></table>{!visibleAssets.length && <p className="p-8 text-center text-xs text-slate-500">No assets match these filters.</p>}</div>
            </div>
          </>}
          {activeTab === 'Upload from File' && <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-bold">Import assets from Excel</h2><p className="text-xs text-slate-600">Use Asset Number or Serial Number to add registered assets. New assets also need Asset Name, Category, and Location. Imported rows become the print queue.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={downloadTemplate} className="px-4 py-2 border rounded-xl text-xs font-bold">Download Excel template</button><button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold disabled:opacity-50">Choose Excel or CSV</button><input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={event => importFile(event.target.files?.[0])} /></div></div>}
          {activeTab === 'Tag Templates' && <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-bold">Supported label templates</h2><p className="text-xs text-slate-500">These layouts come from the tagging backend.</p><div className="grid sm:grid-cols-2 gap-3">{templates.map(item => <button type="button" key={item.id} onClick={() => { setTemplateId(item.id); setActiveTab('Preview & Layout'); }} className={`text-left p-4 border rounded-xl ${templateId === item.id ? 'border-purple-700 bg-purple-50' : 'border-slate-200'}`}><p className="text-xs font-bold">{item.name}</p><p className="text-[11px] text-slate-500 mt-1">{item.description}</p><p className="text-[11px] font-mono mt-2">{item.widthMm} × {item.heightMm} mm · {item.format === 'QR_CODE' ? 'QR' : 'Code 128'}</p></button>)}</div></div>}
          {activeTab === 'Print Settings' && <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-bold">Print settings</h2><label className="block text-xs font-semibold">Copies per asset<input type="number" min="1" max="100" value={options.copies} onChange={event => setOptions(previous => ({ ...previous, copies: Math.max(1, Math.min(100, Number(event.target.value) || 1)) }))} className="block mt-1 w-28 px-3 py-2 border rounded-xl" /></label><div className="grid sm:grid-cols-2 gap-2 text-xs">{[['assetNumber', 'Asset number'], ['assetName', 'Asset name'], ['serialNumber', 'Serial number'], ['assetImage', 'Asset photo when available']].map(([key, title]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={options[key]} onChange={() => setOption(key)} /> {title}</label>)}</div><p className="text-xs text-slate-500">The unique tag number and scannable code always appear on the label.</p></div>}
          {activeTab === 'Preview & Layout' && <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-bold">Generated label preview</h2><p className="text-xs text-slate-500">Previewing the first of {selectedIds.length} selected assets. The code is reserved by the backend and stays the same on reprint.</p>{previewLoading ? <p className="text-xs text-slate-500">Generating preview...</p> : <LiveLabel label={previewLabel} template={template} options={options} />}</div>}
          {activeTab === 'Print History' && <div className="bg-white border border-slate-200 rounded-2xl p-5"><h2 className="text-sm font-bold mb-3">Recent print history</h2><div className="overflow-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50"><tr><th className="p-2">Printed</th><th className="p-2">Asset</th><th className="p-2">Tag number</th><th className="p-2">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{history.map(item => <tr key={item.id}><td className="p-2">{new Date(item.printedDate).toLocaleString()}</td><td className="p-2">{item.assetNumber || '—'} {item.assetName}</td><td className="p-2 font-mono">{item.tagNumber}</td><td className="p-2">{item.status}</td></tr>)}</tbody></table>{!history.length && <p className="p-6 text-center text-xs text-slate-500">No printed tags yet.</p>}</div></div>}
        </div>
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-purple-800">Selected template</h2><button type="button" onClick={() => setActiveTab('Tag Templates')} className="text-xs font-bold text-purple-700">Change</button></div><p className="text-xs text-slate-600">{template ? `${template.name} · ${template.widthMm} × ${template.heightMm} mm` : 'Loading templates...'}</p>{previewLoading ? <p className="text-xs text-slate-500">Generating preview...</p> : <LiveLabel label={previewLabel} template={template} options={options} />}{previewLabel && <p className="text-[11px] text-slate-600">Unique tag: <span className="font-mono font-bold">{previewLabel.tagNumber}</span></p>}</div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Print queue ({selectedIds.length})</h2><button type="button" onClick={() => setSelectedIds([])} disabled={!selectedIds.length} className="text-xs text-rose-600 disabled:opacity-40">Clear</button></div><div className="max-h-48 overflow-auto divide-y divide-slate-100">{selectedAssets.map(asset => <div key={asset.id} className="flex items-center justify-between gap-2 py-2 text-xs"><span className="min-w-0"><span className="font-mono font-bold block truncate">{asset.assetNumber}</span><span className="text-slate-500 block truncate">{asset.assetName}</span></span><button type="button" onClick={() => toggleAsset(asset.id)} aria-label={`Remove ${asset.assetNumber}`} className="text-slate-400 hover:text-rose-600"><X className="w-4 h-4" /></button></div>)}{!selectedIds.length && <p className="text-xs text-slate-500 py-2">Select assets to prepare labels.</p>}</div><button type="button" onClick={printTags} disabled={busy || !selectedIds.length || !template} className="w-full py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Printer className="w-4 h-4" />{busy ? 'Preparing...' : `Print ${selectedIds.length * options.copies} label(s)`}</button><p className="text-[11px] text-slate-500">The browser print dialog lets you choose your printer.</p></div>
        </div>
      </div>
    </div>
  );
}
