import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ExcelJS from 'exceljs';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  Layers,
  Search,
  CheckCircle2,
  Tag,
  Barcode,
  Radio,
  Plus,
  Upload,
  ChevronRight,
  ArrowRight,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  Check,
  FileText,
  RotateCcw,
  Sliders,
  Eye,
  Info,
  Box,
  Package
} from 'lucide-react';
import clsx from 'clsx';

const emptyFilters = {
  assetNumber: '', category: 'All Categories', location: 'All Locations',
  department: 'All Departments', tagStatus: 'All', custodian: 'All Custodians'
};

const normalizeColumn = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const cellText = value => String(value?.text ?? value?.result ?? value ?? '').trim();

function parseCsv(text) {
  const records = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(value => value.trim())) records.push(row);
      row = []; field = '';
    } else field += char;
  }
  row.push(field); if (row.some(value => value.trim())) records.push(row);
  return records;
}

async function readImportRows(file) {
  if (/\.csv$/i.test(file.name)) return parseCsv((await file.text()).replace(/^\uFEFF/, ''));
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Choose an .xlsx or .csv file.');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('The Excel file has no worksheet.');
  const rows = [];
  sheet.eachRow(row => rows.push(Array.from({ length: sheet.columnCount }, (_, index) => cellText(row.getCell(index + 1).value))));
  return rows;
}

function LabelPreview({ asset, tagNumber, format = 'Barcode', barcodeRef }) {
  const code = tagNumber || (asset?.currentTag && asset.currentTag !== '-' ? asset.currentTag : '');
  useEffect(() => {
    if (format === 'Barcode' && barcodeRef.current && code) {
      try { JsBarcode(barcodeRef.current, code, { format: 'CODE128', displayValue: false, margin: 0, height: 36, width: 1.5 }); }
      catch { barcodeRef.current.innerHTML = ''; }
    }
  }, [barcodeRef, code, format]);
  if (!asset) return <p className="text-xs text-slate-500 text-center py-8">Select an asset to preview its label.</p>;
  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg p-3 max-w-[280px] mx-auto text-center shadow-sm" aria-label={`Label preview for ${asset.assetNumber}`}>
      <p className="text-[9px] font-black tracking-widest text-slate-800">ASSET360</p>
      <p className="font-mono text-sm font-black text-slate-950 mt-1">{asset.assetNumber}</p>
      <p className="text-[10px] font-semibold text-slate-700 truncate">{asset.assetName}</p>
      <div className="flex justify-center my-2 min-h-9 items-center">
        {code ? (format === 'QR' ? <QRCodeSVG value={code} size={74} /> : <svg ref={barcodeRef} className="max-w-full h-9" />) : <span className="text-[10px] text-slate-400">Scan or generate a tag</span>}
      </div>
      <p className="font-mono text-[10px] font-bold text-slate-900 break-all">{code || 'No tag assigned'}</p>
      {asset.serialNumber && <p className="text-[9px] text-slate-500 truncate">S/N {asset.serialNumber}</p>}
    </div>
  );
}

export function BulkTaggingWorkbench() {
  const navigate = useNavigate();
  const assetFileRef = useRef(null);
  const tagFileRef = useRef(null);
  const tagInputRef = useRef(null);
  const barcodeRef = useRef(null);

  // Stepper & Tab Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const [subTab, setSubTab] = useState('1. Select Assets');

  // Search Filters State
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [assets, setAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [activeAssetId, setActiveAssetId] = useState(null);
  const [catalogAssets, setCatalogAssets] = useState([]);
  const [importedTags, setImportedTags] = useState({});
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [manualForm, setManualForm] = useState({ assetNumber: '', assetName: '', category: '', location: '', serialNumber: '' });
  const [labelFormat, setLabelFormat] = useState('Barcode');
  const [completed, setCompleted] = useState(false);

  // Tagging Method State
  const [rightPanelTab, setRightPanelTab] = useState('Tag Assignment'); // 'Tag Assignment' | 'Tag Generation'
  const [taggingMethod, setTaggingMethod] = useState('Scan Tags'); // 'Scan Tags' | 'Auto Generate Tags' | 'Import Tag File'
  const [scannedTagInput, setScannedTagInput] = useState('');
  const [generatedTagEpc, setGeneratedTagEpc] = useState(null);
  const [replaceTagMode, setReplaceTagMode] = useState(false);

  const [taggingProgressList, setTaggingProgressList] = useState([]);
  const [failedAssetIds, setFailedAssetIds] = useState([]);

  // Modals & Toast State
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const visibleAssets = useMemo(() => assets.filter(asset => {
    if (appliedFilters.assetNumber && !asset.assetNumber.toLowerCase().includes(appliedFilters.assetNumber.toLowerCase())) return false;
    if (appliedFilters.category !== 'All Categories' && asset.category !== appliedFilters.category) return false;
    if (appliedFilters.location !== 'All Locations' && asset.location !== appliedFilters.location) return false;
    if (appliedFilters.department !== 'All Departments' && asset.department !== appliedFilters.department) return false;
    if (appliedFilters.custodian !== 'All Custodians' && asset.custodian !== appliedFilters.custodian) return false;
    if (appliedFilters.tagStatus !== 'All' && asset.status !== appliedFilters.tagStatus) return false;
    return true;
  }), [assets, appliedFilters]);
  const totalSelectedCount = selectedAssetIds.length;
  const taggedCount = assets.filter(a => selectedAssetIds.includes(a.id) && a.status === 'Tagged').length;
  const pendingCount = Math.max(0, totalSelectedCount - taggedCount);
  const failedCount = failedAssetIds.filter(id => selectedAssetIds.includes(id)).length;
  const progressPercent = totalSelectedCount ? Math.round((taggedCount / totalSelectedCount) * 100) : 0;

  // Real-Time Selected Asset for Tag Preview
  const selectedAsset = useMemo(() => {
    if (activeAssetId) {
      const found = assets.find((a) => a.id === activeAssetId);
      if (found) return found;
    }
    if (selectedAssetIds.length > 0) {
      return (
        assets.find((a) => selectedAssetIds.includes(a.id) && a.status !== 'Tagged') ||
        assets.find((a) => selectedAssetIds.includes(a.id)) ||
        null
      );
    }
    return null;
  }, [assets, activeAssetId, selectedAssetIds]);
  const currentTag = selectedAsset?.currentTag && selectedAsset.currentTag !== '-' ? selectedAsset.currentTag : '';
  const previewTag = rightPanelTab === 'Print Labels'
    ? currentTag
    : currentTag && !replaceTagMode ? currentTag : scannedTagInput || currentTag;

  // Selection Handlers
  const handleCheckboxToggle = (assetId, e) => {
    if (e) e.stopPropagation();
    const isSelecting = !selectedAssetIds.includes(assetId);
    const next = isSelecting ? [...selectedAssetIds, assetId] : selectedAssetIds.filter(id => id !== assetId);
    setSelectedAssetIds(next);
    if (isSelecting) setActiveAssetId(assetId);
    else if (activeAssetId === assetId) setActiveAssetId(next[0] || null);
  };

  const handleRowClick = (item) => {
    setActiveAssetId(item.id);
    if (!selectedAssetIds.includes(item.id)) {
      setSelectedAssetIds((prev) => [...prev, item.id]);
    }
  };

  const handleSelectAllToggle = () => {
    const visibleIds = visibleAssets.map(asset => asset.id);
    if (visibleIds.every(id => selectedAssetIds.includes(id))) {
      const next = selectedAssetIds.filter(id => !visibleIds.includes(id));
      setSelectedAssetIds(next);
      if (!next.includes(activeAssetId)) setActiveAssetId(next[0] || null);
    } else {
      setSelectedAssetIds(prev => [...new Set([...prev, ...visibleIds])]);
      if (!activeAssetId) setActiveAssetId(visibleIds[0] || null);
    }
  };

  useEffect(() => {
    const stagedTag = importedTags[activeAssetId] || '';
    const asset = assets.find(item => item.id === activeAssetId);
    setScannedTagInput(stagedTag);
    setReplaceTagMode(Boolean(stagedTag && asset?.currentTag && asset.currentTag !== '-' && stagedTag !== asset.currentTag));
    setGeneratedTagEpc(null);
  }, [activeAssetId, importedTags]);

  // Auto Generate Tag Helper
  const handleAutoGenerateTag = async () => {
    try {
      const res = await api.post('/tagging/generate', {
        prefix: 'E360000',
        tagType: 'RFID_GEN2',
        count: 1
      });
      const generated = res?.tag?.tagNumber || res?.tags?.[0]?.tagNumber;
      if (!generated) throw new Error('Tag generation returned no code.');
      if (currentTag) setReplaceTagMode(true);
      setScannedTagInput(generated);
      setGeneratedTagEpc(res?.tag?.rfidEpc || res?.tags?.[0]?.rfidEpc || null);
      showToast(`Generated Tag: ${generated}`);
    } catch (error) {
      showToast(error.message || 'Could not generate a tag.', 'error');
    }
  };

  // Search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await api.get('/tagging/assets');
        const list = Array.isArray(res?.assets) ? res.assets : [];
        setAssets(list);
        setCatalogAssets(list);
      } catch (e) {
        showToast(e.message || 'Could not load assets', 'error');
      }
    }
    loadAssets();
    Promise.allSettled([
      api.get('/master-data/categories'), api.get('/master-data/sites'),
      api.get('/master-data/departments'), api.get('/master-data/employees')
    ]).then(([categoryRes, siteRes, departmentRes, employeeRes]) => {
      if (categoryRes.status === 'fulfilled') setCategories(categoryRes.value.categories || []);
      if (siteRes.status === 'fulfilled') setSites(siteRes.value.sites || []);
      if (departmentRes.status === 'fulfilled') setDepartments(departmentRes.value.departments || []);
      if (employeeRes.status === 'fulfilled') setEmployees(employeeRes.value.employees || []);
    });
  }, []);

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bulk tagging');
    sheet.addRow(['Asset Number', 'Asset Name', 'Category', 'Location', 'Serial Number', 'Tag Number']);
    sheet.addRow(['AST-001', '', '', '', '', '']);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(column => { column.width = 22; });
    const blob = new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'bulk-tagging-template.xlsx'; link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file, tagsOnly = false) => {
    if (!file) return;
    setImporting(true);
    try {
      const [header, ...data] = await readImportRows(file);
      if (!header || !data.length) throw new Error('The file needs a header and at least one asset row.');
      const columns = header.map(normalizeColumn);
      const valueAt = (row, names) => {
        const index = columns.findIndex(column => names.includes(column));
        return index < 0 ? '' : cellText(row[index]);
      };
      if (!columns.some(column => ['assetnumber', 'assetid', 'serialnumber'].includes(column))) {
        throw new Error('Add an Asset Number or Serial Number column.');
      }
      const rows = data.map((row, index) => ({
        rowNumber: index + 2,
        assetNumber: valueAt(row, ['assetnumber', 'assetid']),
        assetName: valueAt(row, ['assetname', 'name', 'description']),
        category: valueAt(row, ['category']),
        location: valueAt(row, ['location', 'site']),
        serialNumber: valueAt(row, ['serialnumber', 'serial']),
        tagNumber: valueAt(row, ['tagnumber', 'tag', 'rfidepc'])
      })).filter(row => row.assetNumber || row.serialNumber);
      if (!rows.length) throw new Error('No asset numbers or serial numbers were found.');
      const seen = new Set();
      for (const row of rows) {
        const key = (row.assetNumber || row.serialNumber).toLowerCase();
        if (seen.has(key)) throw new Error(`Duplicate asset on row ${row.rowNumber}: ${row.assetNumber || row.serialNumber}`);
        seen.add(key);
      }

      const latest = await api.get('/tagging/assets');
      const registered = latest.assets || catalogAssets;
      const findAsset = row => registered.find(asset =>
        row.assetNumber
          ? asset.assetNumber.toLowerCase() === row.assetNumber.toLowerCase()
          : asset.serialNumber && asset.serialNumber.toLowerCase() === row.serialNumber.toLowerCase()
      );
      if (tagsOnly) {
        const missing = rows.find(row => !findAsset(row));
        if (missing) throw new Error(`Row ${missing.rowNumber}: asset is not registered.`);
        const noTag = rows.find(row => !row.tagNumber);
        if (noTag) throw new Error(`Row ${noTag.rowNumber}: Tag Number is empty.`);
        const codes = rows.map(row => row.tagNumber.toLowerCase());
        if (new Set(codes).size !== codes.length) throw new Error('Tag numbers must be unique in the file.');
        const nextTags = Object.fromEntries(rows.map(row => [findAsset(row).id, row.tagNumber]));
        const matchedAssets = rows.map(findAsset);
        setAssets(prev => [...new Map([...prev, ...matchedAssets].map(asset => [asset.id, asset])).values()]);
        setCatalogAssets(registered);
        setImportedTags(prev => ({ ...prev, ...nextTags }));
        setSelectedAssetIds(prev => [...new Set([...prev, ...Object.keys(nextTags)])]);
        setActiveAssetId(findAsset(rows[0]).id);
        setRightPanelTab('Tag Assignment');
        showToast(`${rows.length} tag numbers staged. Assign them one asset at a time.`);
      } else {
        const missing = rows.find(row => !findAsset(row) && (!row.assetName || !row.category || !row.location));
        if (missing) throw new Error(`Row ${missing.rowNumber}: new assets need Asset Name, Category, and Location.`);
        const resolvedRows = rows.map(row => {
          const existing = findAsset(row);
          return existing ? { ...row, assetNumber: existing.assetNumber } : row;
        });
        const result = await api.post('/tagging/import', { assets: resolvedRows });
        if (!result?.success || !Array.isArray(result.imported)) throw new Error(result?.message || 'Asset import failed.');
        const ordered = [...new Map(result.imported.map(asset => [asset.id, asset])).values()];
        const fileTags = Object.fromEntries(rows.map((row, index) => [result.imported[index]?.id, row.tagNumber]).filter(([id, tag]) => id && tag));
        setAssets(ordered);
        setCatalogAssets(prev => [...new Map([...prev, ...ordered].map(asset => [asset.id, asset])).values()]);
        setSelectedAssetIds(ordered.map(asset => asset.id));
        setActiveAssetId(ordered.find(asset => asset.status !== 'Tagged')?.id || ordered[0]?.id || null);
        setImportedTags(fileTags);
        setFilters(emptyFilters); setAppliedFilters(emptyFilters);
        setTaggingProgressList([]); setCompleted(false);
        setFailedAssetIds([]);
        setCurrentStep(2); setSubTab('2. Tag Assignment');
        showToast(`${ordered.length} assets loaded into the bulk tagging queue.`);
      }
    } catch (error) {
      showToast(error.message || 'Could not import file.', 'error');
    } finally {
      setImporting(false);
      if (assetFileRef.current) assetFileRef.current.value = '';
      if (tagFileRef.current) tagFileRef.current.value = '';
    }
  };

  const handleAddManualAsset = async event => {
    event.preventDefault();
    setImporting(true);
    try {
      const result = await api.post('/tagging/manual', manualForm);
      if (!result?.asset?.id) throw new Error(result?.message || 'Asset could not be added.');
      const asset = result.asset;
      setAssets(prev => [...prev.filter(item => item.id !== asset.id), asset]);
      setCatalogAssets(prev => [...prev.filter(item => item.id !== asset.id), asset]);
      setSelectedAssetIds(prev => [...new Set([...prev, asset.id])]);
      setActiveAssetId(asset.id);
      setShowAddManualModal(false);
      setManualForm({ assetNumber: '', assetName: '', category: '', location: '', serialNumber: '' });
      setFilters(emptyFilters); setAppliedFilters(emptyFilters);
      showToast(`${asset.assetNumber} added to the tagging queue.`);
    } catch (error) { showToast(error.message || 'Could not add asset.', 'error'); }
    finally { setImporting(false); }
  };

  const handlePrintLabel = () => {
    if (!selectedAsset) return showToast('Select an asset first.', 'error');
    if (!currentTag) return showToast('Assign a tag before printing its label.', 'error');
    navigate(`/receiving/print-tags?assetId=${encodeURIComponent(selectedAsset.id)}`);
  };

  // Assign Tag Action
  const handleAssignTagToSelected = async () => {
    const targetAsset = selectedAsset;
    if (!targetAsset) {
      showToast('Please select an asset from the table first.', 'error');
      return;
    }
    if (!selectedAssetIds.includes(targetAsset.id)) {
      showToast('Select this asset for bulk tagging first.', 'error');
      return;
    }
    if (targetAsset.currentTag && targetAsset.currentTag !== '-' && !replaceTagMode) {
      showToast('This asset is already tagged. Choose Replace tag to assign a new one.', 'error');
      return;
    }

    let tagCode = scannedTagInput?.trim();
    let rfidEpc = generatedTagEpc;
    if (!tagCode && taggingMethod === 'Auto Generate Tags') {
      try {
        const res = await api.post('/tagging/generate', { prefix: 'E360000', tagType: 'RFID_GEN2', count: 1 });
        tagCode = res?.tag?.tagNumber || res?.tags?.[0]?.tagNumber;
        rfidEpc = res?.tag?.rfidEpc || res?.tags?.[0]?.rfidEpc || null;
      } catch (error) {
        showToast(error.message || 'Could not generate a tag.', 'error');
        return;
      }
    }

    if (!tagCode) {
      showToast('Please enter, scan, or auto-generate a valid tag number', 'error');
      return;
    }
    if (targetAsset.currentTag === tagCode) {
      showToast('This tag is already assigned to the selected asset.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post('/tagging/associate', {
        assetId: targetAsset.id,
        tagNumber: tagCode,
        tagType: taggingMethod === 'Auto Generate Tags' || /^[0-9A-F]{16,}$/i.test(tagCode) ? 'RFID_GEN2' : 'BARCODE_128',
        ...(rfidEpc ? { rfidEpc } : {}),
        reason: 'Bulk Tagging Session Assignment'
      });
      if (!result?.success) throw new Error(result?.message || 'Tag assignment failed.');
      setAssets(prev => prev.map(a => a.id === targetAsset.id ? { ...a, currentTag: tagCode, status: 'Tagged' } : a));
      setFailedAssetIds(prev => prev.filter(id => id !== targetAsset.id));
      setCatalogAssets(prev => prev.map(a => a.id === targetAsset.id ? { ...a, currentTag: tagCode, status: 'Tagged' } : a));
      setImportedTags(prev => { const next = { ...prev }; delete next[targetAsset.id]; return next; });
      setTaggingProgressList(prev => [{
        id: targetAsset.id + '-' + Date.now(),
        itemIndex: prev.length + 1,
        assetNumber: targetAsset.assetNumber,
        assetName: targetAsset.assetName,
        tagNumber: tagCode,
        assignedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Tagged'
      }, ...prev]);
      setScannedTagInput('');
      setReplaceTagMode(false);
      setGeneratedTagEpc(null);
      setCurrentStep(2);
      setSubTab('2. Tag Assignment');
      showToast(`Tag ${tagCode} assigned successfully to ${targetAsset.assetNumber}!`);

      // Auto-advance to the next untagged selected asset
      const nextUntagged = assets.find(
        (a) => selectedAssetIds.includes(a.id) && a.id !== targetAsset.id && a.status !== 'Tagged'
      );
      if (nextUntagged) {
        setActiveAssetId(nextUntagged.id);
        tagInputRef.current?.focus();
      } else {
        setActiveAssetId(targetAsset.id);
        setSubTab('3. Review & Confirm');
        setCurrentStep(3);
      }
    } catch (err) {
      setFailedAssetIds(prev => [...new Set([...prev, targetAsset.id])]);
      showToast(err.message || 'Failed to assign tag', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearContext = () => {
    setScannedTagInput('');
    setReplaceTagMode(false);
    setGeneratedTagEpc(null);
    showToast('Cleared input.');
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      const result = await api.post('/tagging/draft', { selectedAssetIds, stagedAssignments: importedTags });
      if (!result?.success) throw new Error(result?.message || 'Could not save draft.');
      showToast('Bulk tagging draft saved successfully.');
    } catch (e) {
      showToast(e.message || 'Could not save draft.', 'error');
    }
  };

  const handleRestoreDraft = async () => {
    try {
      const [draftResponse, assetsResponse] = await Promise.all([api.get('/tagging/draft'), api.get('/tagging/assets')]);
      const draft = draftResponse?.draft;
      if (!draft?.selectedAssetIds?.length) throw new Error('No saved bulk tagging draft was found.');
      const latest = assetsResponse?.assets || [];
      const ordered = draft.selectedAssetIds.map(id => latest.find(asset => asset.id === id)).filter(Boolean);
      if (!ordered.length) throw new Error('The saved assets are no longer available.');
      setAssets(ordered);
      setCatalogAssets(latest);
      setSelectedAssetIds(ordered.map(asset => asset.id));
      setImportedTags(draft.stagedAssignments || {});
      setActiveAssetId(ordered.find(asset => asset.status !== 'Tagged')?.id || ordered[0].id);
      setFilters(emptyFilters); setAppliedFilters(emptyFilters);
      setSubTab('2. Tag Assignment'); setCurrentStep(2);
      showToast(`${ordered.length} assets restored from your draft.`);
    } catch (error) { showToast(error.message || 'Could not restore draft.', 'error'); }
  };

  // Proceed to Review
  const handleProceedToReview = () => {
    if (!selectedAssetIds.length) return showToast('Select at least one asset.', 'error');
    setCurrentStep(3);
    setSubTab('3. Review & Confirm');
  };

  const handleComplete = async () => {
    if (pendingCount) return showToast(`${pendingCount} selected asset(s) still need a tag.`, 'error');
    setSubmitting(true);
    try {
      const result = await api.post('/tagging/complete', { selectedAssetIds });
      if (!result?.success) throw new Error(result?.message || 'Could not complete tagging.');
      setCompleted(true); setCurrentStep(4); setSubTab('3. Review & Confirm');
      showToast('Bulk tagging completed and verified.');
    } catch (error) { showToast(error.message || 'Could not complete tagging.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5 select-none pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={clsx(
            'fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4',
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          )}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Stepper Section */}
      <div className="space-y-4">
        {/* Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <button
              onClick={() => navigate('/receiving')}
              className="hover:text-[#6C2BD9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Receiving &amp; Tagging</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 font-semibold">Bulk Tagging</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk Tagging</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Assign tags to multiple assets using file upload, scanning or manual entry
          </p>
        </div>

        {/* 4-Step Stepper Component */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full max-w-6xl mx-auto px-2">
            {/* Step 1 */}
            <div
               onClick={() => { setCurrentStep(1); setSubTab('1. Select Assets'); }}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-all shadow-xs',
                  currentStep >= 1 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-100 text-[#6C2BD9]'
                )}
              >
                1
              </div>
              <div>
                <div
                  className={clsx(
                    'text-xs font-extrabold leading-tight',
                    currentStep === 1 ? 'text-[#6C2BD9]' : 'text-slate-800'
                  )}
                >
                  Select Assets
                </div>
                <div className="text-[11px] text-purple-600 font-medium">Choose assets to tag</div>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:block text-purple-400 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Step 2 */}
            <div
               onClick={() => { setCurrentStep(2); setSubTab('2. Tag Assignment'); }}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-all shadow-xs',
                  currentStep >= 2 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-100 text-[#6C2BD9]'
                )}
              >
                2
              </div>
              <div>
                <div
                  className={clsx(
                    'text-xs font-extrabold leading-tight',
                    currentStep === 2 ? 'text-[#6C2BD9]' : 'text-slate-800'
                  )}
                >
                  Tag Assignment
                </div>
                <div className="text-[11px] text-purple-600 font-medium">Scan / Generate / Import Tags</div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:block text-purple-400 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Step 3 */}
            <div
               onClick={() => { setCurrentStep(3); setSubTab('3. Review & Confirm'); }}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-all shadow-xs',
                  currentStep >= 3 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-100 text-[#6C2BD9]'
                )}
              >
                3
              </div>
              <div>
                <div
                  className={clsx(
                    'text-xs font-extrabold leading-tight',
                    currentStep === 3 ? 'text-[#6C2BD9]' : 'text-slate-800'
                  )}
                >
                  Verify &amp; Review
                </div>
                <div className="text-[11px] text-purple-600 font-medium">Validate and confirm</div>
              </div>
            </div>

            {/* Arrow 3 */}
            <div className="hidden md:block text-purple-400 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Step 4 */}
            <div
               className="flex items-center gap-3 group shrink-0"
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-all shadow-xs',
                  currentStep >= 4 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-100 text-[#6C2BD9]'
                )}
              >
                4
              </div>
              <div>
                <div
                  className={clsx(
                    'text-xs font-extrabold leading-tight',
                    currentStep === 4 ? 'text-[#6C2BD9]' : 'text-slate-800'
                  )}
                >
                  Complete
                </div>
                <div className="text-[11px] text-purple-600 font-medium">Save and finish</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Row Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-6 px-1 text-xs font-bold">
          {['1. Select Assets', '2. Tag Assignment', '3. Review & Confirm'].map((t) => {
            const isActive = subTab === t;
            return (
              <button
                key={t}
                 onClick={() => { setSubTab(t); setCurrentStep(t.startsWith('1.') ? 1 : t.startsWith('2.') ? 2 : 3); }}
                className={clsx(
                  'pb-2.5 transition-all cursor-pointer relative whitespace-nowrap',
                  isActive
                    ? 'text-[#6C2BD9] border-b-2 border-[#6C2BD9]'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Asset queue and review */}
      {subTab === '3. Review & Confirm' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Review selected assets</h2>
            <span className="text-xs text-slate-600">{taggedCount} tagged · {pendingCount} pending</span>
          </div>
          {completed && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">Bulk tagging completed. Asset records and tagging history are updated.</p>}
          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="p-2">Asset Number</th><th className="p-2">Asset Name</th><th className="p-2">Serial Number</th><th className="p-2">Tag Number</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{assets.filter(asset => selectedAssetIds.includes(asset.id)).map(asset => (
                <tr key={asset.id}><td className="p-2 font-mono">{asset.assetNumber}</td><td className="p-2">{asset.assetName}</td><td className="p-2 font-mono">{asset.serialNumber || '-'}</td><td className="p-2 font-mono">{asset.currentTag !== '-' ? asset.currentTag : importedTags[asset.id] || '-'}</td><td className="p-2">{asset.status}</td><td className="p-2"><button type="button" onClick={() => { setActiveAssetId(asset.id); setSubTab('2. Tag Assignment'); setCurrentStep(2); }} className="text-[#6C2BD9] font-semibold">{asset.status === 'Tagged' ? 'View' : 'Tag now'}</button></td></tr>
              ))}</tbody>
            </table>
          </div>
          {!selectedAssetIds.length && <p className="text-xs text-slate-500">Select assets from the first tab.</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setSubTab('2. Tag Assignment'); setCurrentStep(2); }} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold">Back to tagging</button>
            <button type="button" disabled={submitting || completed || !selectedAssetIds.length || pendingCount > 0} onClick={handleComplete} className="px-4 py-2 rounded-xl bg-[#6C2BD9] text-white text-xs font-bold disabled:opacity-50">Complete tagging</button>
          </div>
        </div>
      ) : <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (Span 8): Search Form & Assets Table         */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-5">
          {/* Card 1: Search Form Component */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              {/* Row 1 Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Asset Number
                  </label>
                  <input
                    type="text"
                    value={filters.assetNumber}
                    onChange={(e) => setFilters((p) => ({ ...p, assetNumber: e.target.value }))}
                    placeholder="Search asset number..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                     {categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
                  >
                    <option value="All Locations">All Locations</option>
                     {sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
                  >
                    <option value="All Departments">All Departments</option>
                     {departments.map(department => <option key={department.id} value={department.name}>{department.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2 Filters & Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tag Status
                  </label>
                  <select
                    value={filters.tagStatus}
                    onChange={(e) => setFilters((p) => ({ ...p, tagStatus: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer font-medium"
                  >
                    <option value="Not Tagged">Not Tagged</option>
                    <option value="Tagged">Tagged</option>
                    <option value="All">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Custodian
                  </label>
                  <select
                    value={filters.custodian}
                    onChange={(e) => setFilters((p) => ({ ...p, custodian: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 cursor-pointer"
                  >
                    <option value="All Custodians">All Custodians</option>
                     {employees.map(employee => <option key={employee.id} value={employee.fullName}>{employee.fullName}</option>)}
                  </select>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Card 2: Assets for Bulk Tagging Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                 Assets for Bulk Tagging ({assets.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddManualModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add Manually</span>
                </button>

                <button
                  type="button"
                   onClick={() => assetFileRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from File</span>
                </button>

                 <button type="button" onClick={downloadTemplate} className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">Excel template</button>
                 <input ref={assetFileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={event => handleImportFile(event.target.files?.[0])} />
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                         checked={visibleAssets.length > 0 && visibleAssets.every(asset => selectedAssetIds.includes(asset.id))}
                        onChange={handleSelectAllToggle}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-8 text-slate-500 font-bold whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Asset Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Asset Name</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Category</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Location</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Serial Number</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Current Tag</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                   {visibleAssets.map((item, idx) => {
                    const isChecked = selectedAssetIds.includes(item.id);
                    const isActive = selectedAsset?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className={clsx(
                          'transition-colors cursor-pointer',
                          isActive
                            ? 'bg-purple-100/70 ring-1 ring-inset ring-[#6C2BD9]'
                            : isChecked
                            ? 'bg-purple-50/50'
                            : 'hover:bg-slate-50/60'
                        )}
                      >
                        <td
                          className="py-2.5 px-3 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxToggle(item.id, e)}
                            className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9] text-xs whitespace-nowrap">
                          {item.assetNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {item.assetName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {item.location}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {item.serialNumber || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {item.currentTag && item.currentTag !== '-' ? (
                            <span className="font-bold text-[#6C2BD9]">{item.currentTag}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.status === 'Tagged' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              Tagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-200 whitespace-nowrap">
                              Not Tagged
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
               <span className="font-medium text-slate-600">Showing {visibleAssets.length} of {assets.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Span 4): Tag Assignment & Tag Preview      */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-5">
          {/* Card 1: Tag Assignment / Tag Generation Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Header Tabs */}
            <div className="flex items-center border-b border-slate-200 px-4 pt-2 gap-6">
              {['Tag Assignment', 'Tag Generation', 'Print Labels'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setRightPanelTab(tab); if (tab === 'Tag Generation') setTaggingMethod('Auto Generate Tags'); else if (tab === 'Tag Assignment') setTaggingMethod('Scan Tags'); }}
                  className={clsx(
                    'py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
                    rightPanelTab === tab
                      ? 'border-[#6C2BD9] text-[#6C2BD9]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {rightPanelTab === 'Print Labels' ? (
              <div className="p-4 space-y-3 text-xs">
                {currentTag && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">Assigned tag: <span className="font-mono font-bold">{currentTag}</span></p>}
                <label className="block font-bold text-slate-700">Label format</label>
                <select value={labelFormat} onChange={event => setLabelFormat(event.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                  <option value="Barcode">Barcode · Code 128</option>
                  <option value="QR">QR code</option>
                </select>
                 <p className="text-slate-500">The preview below uses the selected asset's assigned tag. Choose the final backend template on Print Tags.</p>
                 <button type="button" onClick={handlePrintLabel} disabled={!selectedAsset || !currentTag} className="w-full py-2.5 rounded-xl bg-[#6C2BD9] text-white font-bold disabled:opacity-50">Open Print Tags</button>
              </div>
            ) : <div className="p-4 space-y-4">
              {currentTag && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
                  <div><span className="font-bold">Already tagged</span><span className="block font-mono break-all">{currentTag}</span></div>
                  <button type="button" onClick={() => { setReplaceTagMode(value => !value); setScannedTagInput(''); setGeneratedTagEpc(null); }} className="shrink-0 font-bold text-[#5B21B6] hover:underline">{replaceTagMode ? 'Cancel replacement' : 'Replace tag'}</button>
                </div>
              )}
              {/* Select Tagging Method Radio Group */}
              <div>
                <label className="block text-[11px] font-bold text-[#5B21B6] mb-2">
                  Select Tagging Method
                </label>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tagMethod"
                      value="Scan Tags"
                      checked={taggingMethod === 'Scan Tags'}
                      onChange={(e) => { setTaggingMethod(e.target.value); setRightPanelTab('Tag Assignment'); }}
                      className="text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                    <span>Scan Tags</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tagMethod"
                      value="Auto Generate Tags"
                      checked={taggingMethod === 'Auto Generate Tags'}
                      onChange={(e) => { setTaggingMethod(e.target.value); setRightPanelTab('Tag Generation'); }}
                      className="text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                    <span>Auto Generate Tags</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tagMethod"
                      value="Import Tag File"
                      checked={taggingMethod === 'Import Tag File'}
                      onChange={(e) => { setTaggingMethod(e.target.value); tagFileRef.current?.click(); }}
                      className="text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                    <span>Import Tag File</span>
                  </label>
                </div>
              </div>

              {/* Scan RFID / Barcode / QR Tags Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    {taggingMethod === 'Auto Generate Tags'
                      ? 'Auto-Generated Tag'
                      : 'Scan RFID / Barcode / QR Tags'}
                  </label>
                  {taggingMethod === 'Auto Generate Tags' && (
                    <button
                      type="button"
                      onClick={handleAutoGenerateTag}
                      className="text-[11px] font-bold text-[#6C2BD9] hover:text-[#5B21B6] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentTag ? 'Generate replacement' : 'Generate Tag'}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                    <input
                      ref={tagInputRef}
                    type="text"
                     value={currentTag && !replaceTagMode ? currentTag : scannedTagInput}
                    onChange={(e) => setScannedTagInput(e.target.value)}
                     readOnly={Boolean(currentTag && !replaceTagMode)}
                     onKeyDown={event => { if (event.key === 'Enter' && (!currentTag || replaceTagMode)) { event.preventDefault(); handleAssignTagToSelected(); } }}
                    placeholder={
                      taggingMethod === 'Auto Generate Tags'
                        ? "Click 'Generate Tag' or enter custom code..."
                        : "Scan or enter tag number..."
                    }
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/30 focus:border-[#6C2BD9]"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C2BD9]">
                    <Barcode className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Info Notice Box */}
              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-[11px] text-[#6C2BD9] font-medium flex items-start gap-2">
                <Info className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                <span>
                  {currentTag && !replaceTagMode
                    ? 'This asset already has a tag. Use Replace tag only if you need to change it.'
                    : taggingMethod === 'Auto Generate Tags'
                    ? 'Generate a unique tag, then assign it to the selected asset.'
                    : 'Scan or enter a tag, assign it, then the next untagged asset opens automatically.'}
                </span>
              </div>
              {taggingMethod === 'Import Tag File' && <button type="button" onClick={() => tagFileRef.current?.click()} className="text-xs font-semibold text-[#6C2BD9]">Choose tag Excel file</button>}
              <input ref={tagFileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={event => handleImportFile(event.target.files?.[0], true)} />
            </div>}
          </div>

          {/* Card 2: Tag Preview Component (REAL-TIME SELECTED ASSET) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#5B21B6] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#6C2BD9]" />
                <span>Tag Preview</span>
              </h3>
              {selectedAsset && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-[#6C2BD9]">
                  {selectedAssetIds.length > 1
                    ? `Item ${Math.max(1, selectedAssetIds.indexOf(selectedAsset.id) + 1)} of ${selectedAssetIds.length} Selected`
                    : 'Selected Asset'}
                </span>
              )}
            </div>

            {/* Preview Box Container */}
            {selectedAsset ? (
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Left Column: Real-time Selected Asset */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Selected Asset
                    </span>
                    <span
                      className={clsx(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                        selectedAsset.status === 'Tagged'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      )}
                    >
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                      {selectedAsset.imageUrl ? (
                        <img
                          src={selectedAsset.imageUrl}
                          alt={selectedAsset.assetName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-[#6C2BD9]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-mono font-bold text-[#6C2BD9] leading-tight truncate">
                        {selectedAsset.assetNumber}
                      </p>
                      <p
                        className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5"
                        title={selectedAsset.assetName}
                      >
                        {selectedAsset.assetName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                        {selectedAsset.category} {selectedAsset.location ? `• ${selectedAsset.location}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Scanned Tag & Real-time Status */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                       {currentTag && !replaceTagMode ? 'Current Tag' : currentTag ? 'Replacement Tag' : 'Target Tag'}
                    </span>
                    {taggingMethod === 'Auto Generate Tags' && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateTag}
                        className="text-[10px] font-bold text-[#6C2BD9] hover:underline cursor-pointer"
                      >
                         {currentTag ? 'New replacement' : 'New Code'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                     readOnly={taggingMethod === 'Auto Generate Tags' || Boolean(currentTag && !replaceTagMode)}
                     value={currentTag && !replaceTagMode ? currentTag : scannedTagInput}
                    onChange={(e) => setScannedTagInput(e.target.value)}
                    placeholder="Scan or enter tag..."
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6C2BD9]"
                  />
                  <div className="flex items-center gap-1 text-[10px] font-bold pt-0.5">
                     {currentTag && !replaceTagMode ? (
                       <div className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /><span>Already tagged</span></div>
                     ) : scannedTagInput ? (
                      <div className="flex items-center gap-1 text-[#059669]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#059669] text-white shrink-0" />
                         <span>Entered · assign to verify</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Awaiting Tag</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                <Tag className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Asset Selected</p>
                <p className="text-[11px] text-slate-500">
                  Click on any asset from the table to preview and assign a tag.
                </p>
              </div>
            )}

             <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
               <LabelPreview asset={selectedAsset} tagNumber={previewTag} format={labelFormat} barcodeRef={barcodeRef} />
            </div>

            {/* Tag Preview Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                 disabled={submitting || !selectedAsset || !selectedAssetIds.includes(selectedAsset.id) || rightPanelTab === 'Print Labels' || Boolean(currentTag && !replaceTagMode)}
                onClick={handleAssignTagToSelected}
                className={clsx(
                  "flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95",
                   submitting || !selectedAsset || rightPanelTab === 'Print Labels' || (currentTag && !replaceTagMode)
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-[#5B21B6] hover:bg-[#4C1D95]"
                )}
              >
                <Tag className="w-4 h-4" />
                <span>
                   {currentTag && !replaceTagMode ? 'Already Tagged' : currentTag ? `Replace Tag on ${selectedAsset?.assetNumber}` : `Assign Tag to ${selectedAsset?.assetNumber || 'Selected Asset'}`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleClearContext}
                className="px-4 py-2.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 text-[#6C2BD9] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                 {currentTag && replaceTagMode ? 'Cancel' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      </div>}

      {/* 3. Bottom Row: Tagging Progress & Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (Span 8): Tagging Progress (3 of 12)          */}
        {/* ========================================================= */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Header with percentage */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Tagging Progress ({taggedCount} of {totalSelectedCount})
              </h3>
              <span className="text-xs font-extrabold text-[#6C2BD9]">{progressPercent}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#6C2BD9] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Mini Table of Tagged Progress */}
            <div className="overflow-auto max-h-[350px] pt-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase shadow-2xs">
                  <tr>
                    <th className="py-2 px-3 w-8 text-slate-500 font-bold whitespace-nowrap">#</th>
                    <th className="py-2 px-3 font-bold whitespace-nowrap">Asset Number</th>
                    <th className="py-2 px-3 font-bold whitespace-nowrap">Asset Name</th>
                    <th className="py-2 px-3 font-bold whitespace-nowrap">Tag Number</th>
                    <th className="py-2 px-3 font-bold whitespace-nowrap">Assigned Time</th>
                    <th className="py-2 px-3 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {taggingProgressList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {row.itemIndex}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[#6C2BD9] text-xs whitespace-nowrap">
                        {row.assetNumber}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {row.assetName}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700 text-xs whitespace-nowrap">
                        {row.tagNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {row.assignedTime}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          Tagged
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Showing {taggingProgressList.length} records</span>
              <span className="text-slate-400">Scroll down to view all records</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (Span 4): Summary Card                       */}
        {/* ========================================================= */}
        <div className="xl:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Summary
            </h3>

            {/* 4 Stat Badges (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Badge 1: Selected */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {totalSelectedCount}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                    Selected
                  </p>
                </div>
              </div>

              {/* Badge 2: Tagged */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">{taggedCount}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">Tagged</p>
                </div>
              </div>

              {/* Badge 3: Pending */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">{pendingCount}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">Pending</p>
                </div>
              </div>

              {/* Badge 4: Failed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">{failedCount}</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">Failed</p>
                </div>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={handleRestoreDraft} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold">Restore Draft</button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={handleProceedToReview}
                className="flex-1 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add asset manually">
          <form onSubmit={handleAddManualAsset} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Add asset to tagging queue</h2><button type="button" onClick={() => setShowAddManualModal(false)} aria-label="Close"><X className="w-4 h-4" /></button></div>
            <label className="block text-xs font-semibold text-slate-700">Asset number<input value={manualForm.assetNumber} onChange={event => setManualForm(prev => ({ ...prev, assetNumber: event.target.value }))} placeholder="Generated if blank" className="w-full mt-1 px-3 py-2 border rounded-xl" /></label>
            <label className="block text-xs font-semibold text-slate-700">Asset name<input required value={manualForm.assetName} onChange={event => setManualForm(prev => ({ ...prev, assetName: event.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-xl" /></label>
            <label className="block text-xs font-semibold text-slate-700">Category<select required value={manualForm.category} onChange={event => setManualForm(prev => ({ ...prev, category: event.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-xl"><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
            <label className="block text-xs font-semibold text-slate-700">Location / site<select required value={manualForm.location} onChange={event => setManualForm(prev => ({ ...prev, location: event.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-xl"><option value="">Select site</option>{sites.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}</select></label>
            <label className="block text-xs font-semibold text-slate-700">Serial number<input value={manualForm.serialNumber} onChange={event => setManualForm(prev => ({ ...prev, serialNumber: event.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-xl" /></label>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowAddManualModal(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl">Cancel</button><button type="submit" disabled={importing} className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] rounded-xl disabled:opacity-50">{importing ? 'Adding...' : 'Add asset'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
