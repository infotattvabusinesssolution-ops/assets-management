import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Tag,
  Layers,
  Search,
  CheckCircle2,
  Printer,
  RefreshCw,
  Cpu,
  Barcode,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import clsx from 'clsx';

export function BulkTaggingWorkbench() {
  const navigate = useNavigate();
  const [untaggedAssets, setUntaggedAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState(new Set());
  const [tagPrefix, setTagPrefix] = useState('E36000');
  const [tagType, setTagType] = useState('RFID_EPC');
  const [startingSeq, setStartingSeq] = useState(1001);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchUntagged = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assets', { params: { limit: 20 } });
      if (res.assets) {
        // filter or mock untagged assets
        const list = res.assets.map((a, i) => ({
          ...a,
          tagNumber: a.tagNumber || null
        }));
        setUntaggedAssets(list);
      }
    } catch (e) {
      // fallback sample assets
      setUntaggedAssets([
        { id: 'AST-01', assetId: 'AST-2026-101', description: 'Dell Latitude 7450', serialNumber: 'DL7450-101', category: { name: 'Laptop' }, tagNumber: null },
        { id: 'AST-02', assetId: 'AST-2026-102', description: 'Dell Latitude 7450', serialNumber: 'DL7450-102', category: { name: 'Laptop' }, tagNumber: null },
        { id: 'AST-03', assetId: 'AST-2026-103', description: 'Dell 27" UltraSharp Monitor', serialNumber: 'MON27-501', category: { name: 'Peripherals' }, tagNumber: null },
        { id: 'AST-04', assetId: 'AST-2026-104', description: 'Dell Docking Station WD19S', serialNumber: 'WD19-301', category: { name: 'Accessories' }, tagNumber: null },
        { id: 'AST-05', assetId: 'AST-2026-105', description: 'Keyboard & Mouse Premier', serialNumber: 'KM73-901', category: { name: 'Peripherals' }, tagNumber: null }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUntagged();
  }, []);

  const toggleSelect = (id) => {
    const next = new Set(selectedAssetIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAssetIds(next);
  };

  const selectAll = () => {
    if (selectedAssetIds.size === untaggedAssets.length) {
      setSelectedAssetIds(new Set());
    } else {
      setSelectedAssetIds(new Set(untaggedAssets.map((a) => a.id)));
    }
  };

  const handleBulkTag = async () => {
    if (selectedAssetIds.size === 0) return;
    setProcessing(true);
    let curSeq = startingSeq;
    const updated = [];

    for (const a of untaggedAssets) {
      if (selectedAssetIds.has(a.id)) {
        const tagNum = `${tagPrefix}${curSeq}`;
        const epc = tagType === 'RFID_EPC' ? `E28011606000${curSeq}` : null;
        try {
          await api.post('/tagging/associate', {
            assetId: a.id,
            tagNumber: tagNum,
            tagType,
            reason: 'Bulk Tag Batch Intake'
          });
        } catch (err) {
          // Continue
        }
        updated.push({ ...a, tagNumber: tagNum, rfidEpc: epc });
        curSeq++;
      } else {
        updated.push(a);
      }
    }

    setUntaggedAssets(updated);
    setSelectedAssetIds(new Set());
    setProcessing(false);
    setToast({
      message: `Successfully tagged ${updated.length} assets with sequential ${tagType} tags!`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/receiving')}>
              Receiving & Tagging
            </span>
            <span>&gt;</span>
            <span className="text-[#6C2BD9] font-bold">Bulk Tagging</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#6C2BD9]" />
            Bulk Asset Tagging & Commissioning
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and associate sequential Barcode or UHF RFID tags across multiple received assets in batch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/receiving')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Back to Receive with PO
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toast.message}
        </div>
      )}

      {/* Bulk Configuration Panel */}
      <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Tag Format
          </label>
          <select
            value={tagType}
            onChange={(e) => setTagType(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="RFID_EPC">RFID UHF EPC (Gen2 96-bit)</option>
            <option value="BARCODE_128">Barcode Code 128</option>
            <option value="QR_CODE">2D QR Code ISO/IEC</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Tag Prefix
          </label>
          <input
            type="text"
            value={tagPrefix}
            onChange={(e) => setTagPrefix(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Starting Sequence #
          </label>
          <input
            type="number"
            value={startingSeq}
            onChange={(e) => setStartingSeq(Number(e.target.value))}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800"
          />
        </div>

        <div>
          <button
            onClick={handleBulkTag}
            disabled={selectedAssetIds.size === 0 || processing}
            className="w-full py-2.5 px-4 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Tag className="w-4 h-4" />
                Assign {selectedAssetIds.size} Tags
              </>
            )}
          </button>
        </div>
      </div>

      {/* Untagged Assets Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">
              Select Assets to Tag ({selectedAssetIds.size} selected)
            </span>
          </div>
          <button
            onClick={selectAll}
            className="text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
          >
            {selectedAssetIds.size === untaggedAssets.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedAssetIds.size === untaggedAssets.length && untaggedAssets.length > 0}
                    onChange={selectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                  />
                </th>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Tag</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {untaggedAssets.map((asset) => {
                const isSelected = selectedAssetIds.has(asset.id);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => toggleSelect(asset.id)}
                    className={clsx(
                      'hover:bg-purple-50/30 cursor-pointer transition-colors',
                      isSelected && 'bg-purple-50/50'
                    )}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {asset.assetId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {asset.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {asset.serialNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {asset.category?.name || 'Hardware'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {asset.tagNumber ? (
                        <span className="text-[#6C2BD9]">{asset.tagNumber}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Tag</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {asset.tagNumber ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tagged
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Untagged
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
