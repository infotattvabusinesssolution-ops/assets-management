import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Tag, 
  Printer, 
  QrCode, 
  Cpu, 
  CheckCircle, 
  Barcode, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  History, 
  Package, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  FileText,
  Copy,
  Radio,
  Download,
  X
} from 'lucide-react';

export function TagWorkbench() {
  const [tags, setTags] = useState([]);
  const [assets, setAssets] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTags: 0,
    activeAssignedTags: 0,
    unassignedTags: 0,
    rfidTagsCount: 0,
    pendingTaggingAssets: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all-tags');
  const [toast, setToast] = useState(null);

  // Form State for Association
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [tagNumber, setTagNumber] = useState('TAG-2026-9050');
  const [tagType, setTagType] = useState('BARCODE_128');
  const [replaceReason, setReplaceReason] = useState('Initial Tag Association');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Batch Generator Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [genPrefix, setGenPrefix] = useState('TAG');
  const [genTagType, setGenTagType] = useState('BARCODE_128');

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadWorkbenchData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, aRes, hRes] = await Promise.allSettled([
        api.get('/tagging'),
        api.get('/tagging/stats'),
        api.get('/assets?limit=100'),
        api.get('/tagging/history')
      ]);

      if (tRes.status === 'fulfilled' && tRes.value?.success) {
        setTags(tRes.value.tags || []);
      }

      if (sRes.status === 'fulfilled' && sRes.value?.success && sRes.value.stats) {
        setStats(sRes.value.stats);
      }

      if (aRes.status === 'fulfilled' && aRes.value?.success) {
        setAssets(aRes.value.assets || []);
      }

      if (hRes.status === 'fulfilled' && hRes.value?.success) {
        setHistory(hRes.value.history || []);
      }

    } catch (err) {
      console.error('Failed to load tagging workbench data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkbenchData();
  }, []);

  // When asset is selected, update tag preview and initial tag number if present
  const selectedAssetObj = assets.find(a => (a.id || a._id || a.assetId) === selectedAssetId);

  useEffect(() => {
    if (selectedAssetObj) {
      if (selectedAssetObj.tagNumber) {
        setTagNumber(selectedAssetObj.tagNumber);
      } else {
        generateNewTagCode();
      }
    }
  }, [selectedAssetId]);

  const generateNewTagCode = () => {
    const num = Math.floor(Math.random() * 89999 + 10000);
    const newCode = `TAG-2026-${num}`;
    setTagNumber(newCode);
    showToastNotification(`Generated new tag code: ${newCode}`);
  };

  const handleAssociate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAssetId) {
      alert('Please select an asset to bind tag');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tagging/associate', {
        assetId: selectedAssetId,
        tagNumber,
        tagType,
        reason: replaceReason
      });

      if (res && res.success) {
        showToastNotification(`Tag "${tagNumber}" successfully associated with Asset "${res.asset?.assetId || selectedAssetId}"!`);
        setSelectedAssetId('');
        loadWorkbenchData();
      } else {
        alert(res?.message || 'Failed to associate tag');
      }
    } catch (err) {
      console.error('Tag association error:', err);
      alert(err?.message || err?.error || 'Tag association failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/tagging/generate', {
        count: parseInt(genCount, 10) || 5,
        prefix: genPrefix || 'TAG',
        tagType: genTagType
      });

      if (res && res.success) {
        setShowGenModal(false);
        showToastNotification(`Generated ${res.tags?.length || genCount} barcode tags in pool!`);
        loadWorkbenchData();
      } else {
        alert(res?.message || 'Failed to generate batch tags');
      }
    } catch (err) {
      console.error('Generate tags error:', err);
      alert(err?.message || 'Failed to generate batch tags');
    } finally {
      setSubmitting(false);
    }
  };

  // Canvas Image Download Generator
  const handleDownloadLabelImage = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 400;

      // Background Frame
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 400);

      // Outer Border
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 776, 376);

      // Inner Dashed Border Simulation
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(20, 20, 760, 360);
      ctx.setLineDash([]);

      // Company Badge Header
      ctx.fillStyle = '#F3E8FF';
      ctx.fillRect(35, 35, 230, 28);
      ctx.fillStyle = '#7E22CE';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('INFOTATWAA FAMS ASSET 360', 45, 53);

      // RFID Active Badge
      if (tagType.includes('RFID') || tagType === 'HYBRID_COMBO') {
        ctx.fillStyle = '#D1FAE5';
        ctx.fillRect(280, 35, 110, 28);
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('• RFID ACTIVE', 290, 53);
      }

      // Tag Code Text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(tagNumber || 'TAG-2026-9050', 35, 105);

      // Asset Description
      const desc = selectedAssetObj?.description || 'Dell PowerEdge R760 Rack Server';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(desc.length > 36 ? desc.substring(0, 36) + '...' : desc, 35, 138);

      // Asset ID & Serial Number
      const astId = selectedAssetObj?.assetId || 'AST-2026-9050';
      const sn = selectedAssetObj?.serialNumber || 'SN-DELL-9001';
      ctx.fillStyle = '#64748B';
      ctx.font = '14px monospace';
      ctx.fillText(`Asset ID: ${astId} | Serial: ${sn}`, 35, 163);

      // Visual Code128 Barcode Simulation
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(35, 185, 520, 70);

      ctx.fillStyle = '#FFFFFF';
      let posX = 45;
      let seed = 123;
      while (posX < 545) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        const barWidth = rnd > 0.6 ? 4 : rnd > 0.3 ? 2.5 : 1.5;
        const gap = (rnd * 4) + 1.5;
        ctx.fillRect(posX, 189, barWidth, 62);
        posX += barWidth + gap;
      }

      // Barcode Caption
      ctx.fillStyle = '#64748B';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`*${tagNumber}*`, 295, 275);
      ctx.textAlign = 'left';

      // QR Code Box (Right Side)
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.fillRect(580, 40, 180, 180);
      ctx.strokeRect(580, 40, 180, 180);

      // QR Corners
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(595, 55, 42, 42);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(602, 62, 28, 28);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(609, 69, 14, 14);

      ctx.fillRect(703, 55, 42, 42);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(710, 62, 28, 28);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(717, 69, 14, 14);

      ctx.fillRect(595, 163, 42, 42);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(602, 170, 28, 28);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(609, 177, 14, 14);

      // QR Inner Matrix Data Dots
      for (let rx = 595; rx <= 735; rx += 14) {
        for (let ry = 55; ry <= 195; ry += 14) {
          if ((rx > 640 || ry > 105) && (rx < 690 || ry < 155)) {
            if (Math.sin(rx * 7 + ry * 13) > 0) {
              ctx.fillRect(rx, ry, 10, 10);
            }
          }
        }
      }

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN QR TOKEN', 670, 238);
      ctx.textAlign = 'left';

      // Footer Specs
      ctx.fillStyle = '#64748B';
      ctx.font = '12px monospace';
      ctx.fillText(`Format: ${tagType}`, 35, 365);

      const epcStr = selectedAssetObj?.rfidEpc || `E28011606000${tagNumber.replace(/\D/g, '') || '9050'}`;
      ctx.fillText(`EPC: ${epcStr}`, 300, 365);

      // Trigger Download Anchor
      const link = document.createElement('a');
      link.download = `Tag_Label_${tagNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToastNotification(`Downloaded sticker label: Tag_Label_${tagNumber}.png`);
    } catch (err) {
      console.error('Label download error:', err);
      alert('Failed to download label image.');
    }
  };

  // Filtered Tags List
  const filteredTags = tags.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      (t.tagNumber && t.tagNumber.toLowerCase().includes(q)) ||
      (t.rfidEpc && t.rfidEpc.toLowerCase().includes(q)) ||
      (t.asset && (t.asset.assetId.toLowerCase().includes(q) || t.asset.description.toLowerCase().includes(q)));

    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Assets requiring physical tagging (RECEIVED status)
  const pendingAssets = assets.filter(a => a.lifecycleStatus === 'RECEIVED' || !a.tagNumber);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Tagging & Label Printing Workbench</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
              Code128 • QR • RFID EPC
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generate Code128 Barcodes, QR Tokens, RFID EPCs & bind physical label tags to enterprise asset records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowGenModal(true)} 
            className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Batch Tag Pool Generator
          </button>

          <button 
            onClick={() => window.print()} 
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Thermal Sticker Sheet
          </button>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Tag Pool</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalTags || tags.length}</p>
          <span className="text-[11px] text-slate-400">Registered Tags</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Bound & Active Tags</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeAssignedTags}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Attached to Assets</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Unassigned Pool</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.unassignedTags}</p>
          <span className="text-[11px] text-slate-400">Available Tags</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>RFID EPC Enabled</span>
            <Radio className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.rfidTagsCount}</p>
          <span className="text-[11px] text-purple-700 font-semibold">RTLS Smart Tags</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending Tag Queue</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pendingTaggingAssets || pendingAssets.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Awaiting Labeling</span>
        </div>
      </div>

      {/* Main Tagging & Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Associate Tag Card */}
        <form onSubmit={handleAssociate} className="bg-white border border-slate-200 p-5 space-y-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" /> Associate & Bind Tag to Asset
              </h3>
              <p className="text-xs text-slate-500">Attach barcode / RFID label token to an un-tagged inventory record.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Fixed Asset <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select 
                required
                value={selectedAssetId} 
                onChange={e => setSelectedAssetId(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Target Asset...</option>
                {assets.map(a => {
                  const idVal = a.id || a._id || a.assetId;
                  return (
                    <option key={idVal} value={idVal}>
                      {a.assetId} — {a.description} {a.serialNumber ? `(SN: ${a.serialNumber})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tag Encoding Format <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select 
                value={tagType} 
                onChange={e => setTagType(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="BARCODE_128">Code128 Barcode + Text</option>
                <option value="QR_CODE">2D QR Code Token</option>
                <option value="RFID_UHF">UHF RFID EPC Tag (RTLS Enabled)</option>
                <option value="HYBRID_COMBO">Hybrid (Barcode + QR + RFID EPC)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tag Number (Barcode String) <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateNewTagCode}
                  className="text-[11px] text-purple-600 hover:text-purple-800 hover:underline font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <input 
                type="text" 
                required
                value={tagNumber} 
                onChange={e => setTagNumber(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Association Reason / Note
              </label>
              <input 
                type="text" 
                value={replaceReason} 
                onChange={e => setReplaceReason(e.target.value)} 
                placeholder="e.g. Initial Intake Tagging" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || !selectedAssetId}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-4"
          >
            <CheckCircle className="w-4 h-4" /> 
            {submitting ? 'Binding Tag...' : 'Associate & Bind Tag to Asset'}
          </button>
        </form>

        {/* Label Designer & Printer Preview */}
        <div className="bg-white border border-slate-200 p-5 space-y-4 lg:col-span-2 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-purple-600" /> Thermal Label Designer & Live Sticker Preview
                </h3>
                <p className="text-xs text-slate-500">Live preview of thermal sticker label formatted for Zebra & Dymo barcode printers.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                2" x 1" Thermal Spec
              </span>
            </div>

            {/* Printable Thermal Label Plate Card */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="bg-white text-slate-900 p-5 rounded-xl border-2 border-dashed border-slate-300 shadow-md relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                      Infotatwaa FAMS Asset 360
                    </span>
                    {tagType.includes('RFID') || tagType === 'HYBRID_COMBO' ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                        <Radio className="w-3 h-3" /> RFID ACTIVE
                      </span>
                    ) : null}
                  </div>

                  <p className="text-2xl font-mono font-black text-slate-900 tracking-wider">
                    {tagNumber}
                  </p>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                      {selectedAssetObj?.description || 'Dell PowerEdge R760 Rack Server'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Asset ID: {selectedAssetObj?.assetId || 'AST-2026-9050'} | Serial: {selectedAssetObj?.serialNumber || 'SN-DELL-9001'}
                    </p>
                  </div>

                  {/* Simulated Code128 Visual Barcode Lines */}
                  <div className="pt-2">
                    <div className="h-7 w-full bg-slate-900 rounded flex items-center justify-around px-2 py-1 gap-0.5">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-full bg-white ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'}`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-[9px] font-mono text-center text-slate-500 mt-1 uppercase tracking-widest">
                      *{tagNumber}*
                    </p>
                  </div>
                </div>

                {/* QR Code SVG Token Box */}
                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs flex-shrink-0">
                  <QrCode className="w-16 h-16 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-400 font-bold mt-1">SCAN QR</span>
                </div>
              </div>

              {/* Tag Metadata Footer */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Encoder: {tagType}</span>
                <span>EPC: {selectedAssetObj?.rfidEpc || `E28011606000${tagNumber.replace(/\D/g, '') || '9050'}`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Compatible with <strong className="text-slate-800">Zebra ZD420, Dymo LabelWriter & TSC</strong> printers.
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadLabelImage} 
                className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Download high-resolution label image (.png)"
              >
                <Download className="w-4 h-4" /> Download Label Image
              </button>

              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Label
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Data Workspace */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        
        {/* Tab Header Buttons */}
        <div className="flex border-b border-slate-200 pb-3 gap-2 justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all-tags')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'all-tags' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-4 h-4" /> Registered Tag Registry ({tags.length})
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'pending' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" /> Pending Tagging Queue ({pendingAssets.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'history' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-4 h-4" /> Tag Audit History ({history.length})
            </button>
          </div>

          {/* Search Controls */}
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tags or assets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UNASSIGNED">UNASSIGNED</option>
            </select>
          </div>
        </div>

        {/* TAB 1: ALL TAG REGISTRY */}
        {activeTab === 'all-tags' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Tag Number</th>
                  <th className="p-3">Tag Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Bound Asset</th>
                  <th className="p-3">RFID EPC Code</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No tags found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((t) => (
                    <tr key={t.id || t.tagNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-700">
                        {t.tagNumber}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {t.tagType || 'BARCODE_128'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {t.asset ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{t.asset.assetId}</span>
                            <span className="text-slate-500 text-[11px] truncate block max-w-xs">{t.asset.description}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned Pool</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {t.rfidEpc || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setTagNumber(t.tagNumber);
                            if (t.assetId) setSelectedAssetId(t.assetId);
                          }}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold text-[11px]"
                        >
                          Select Label
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PENDING TAGGING QUEUE */}
        {activeTab === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Asset ID</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Serial Number</th>
                  <th className="p-3">Lifecycle Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingAssets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      All registered assets currently have physical tags attached!
                    </td>
                  </tr>
                ) : (
                  pendingAssets.map((a) => {
                    const idVal = a.id || a._id || a.assetId;
                    return (
                      <tr key={idVal} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-purple-700">{a.assetId}</td>
                        <td className="p-3 font-semibold text-slate-900">{a.description}</td>
                        <td className="p-3 text-slate-600">{a.category?.name || 'General'}</td>
                        <td className="p-3 font-mono text-slate-600">{a.serialNumber || 'N/A'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            {a.lifecycleStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedAssetId(idVal);
                              setActiveTab('all-tags');
                            }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px]"
                          >
                            Bind Tag Now
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: TAG AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Old Tag</th>
                  <th className="p-3">New Tag</th>
                  <th className="p-3">Replacement Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No tag replacement audit logs found.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id || h.createdAt} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {h.asset ? `${h.asset.assetId} — ${h.asset.description}` : 'Asset Record'}
                      </td>
                      <td className="p-3 font-mono text-slate-400 line-through">
                        {h.oldTagNumber || 'N/A'}
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-700">
                        {h.newTagNumber}
                      </td>
                      <td className="p-3 text-slate-600">
                        {h.reason || 'Re-tagged'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleBatchGenerate} className="bg-white border border-slate-200 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" /> Batch Tag Pool Generator
              </h3>
              <button 
                type="button" 
                onClick={() => setShowGenModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tag Prefix</label>
              <input 
                type="text" 
                value={genPrefix} 
                onChange={e => setGenPrefix(e.target.value)} 
                placeholder="e.g. TAG-2026" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tag Encoding Standard</label>
              <select 
                value={genTagType} 
                onChange={e => setGenTagType(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="BARCODE_128">Code128 Barcode</option>
                <option value="QR_CODE">2D QR Code Token</option>
                <option value="RFID_UHF">UHF RFID EPC Tag (RTLS)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity of Tags to Generate (1 - 50)</label>
              <input 
                type="number" 
                min="1" 
                max="50" 
                value={genCount} 
                onChange={e => setGenCount(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold" 
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowGenModal(false)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> 
                {submitting ? 'Generating...' : 'Generate Pool Tags'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
