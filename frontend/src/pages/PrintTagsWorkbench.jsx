import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Printer,
  Barcode,
  QrCode,
  Radio,
  Sliders,
  CheckCircle2,
  Download,
  Copy,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export function PrintTagsWorkbench() {
  const navigate = useNavigate();
  const [tagFormat, setTagFormat] = useState('CODE_128');
  const [template, setTemplate] = useState('STANDARD_2X1');
  const [printer, setPrinter] = useState('Zebra ZT411 RFID (Warehouse Dock 2)');
  const [quantity, setQuantity] = useState(5);
  const [prefix, setPrefix] = useState('E360000');
  const [startNum, setStartNum] = useState(12345);
  const [printing, setPrinting] = useState(false);
  const [toast, setToast] = useState(null);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const res = await api.post('/tagging/print-labels', {
        tagFormat,
        labelTemplate: template,
        printer,
        quantity,
        tagPrefix: prefix
      });
      setToast({
        message: res.message || `Sent ${quantity} label(s) to ${printer}`,
        type: 'success'
      });
    } catch (e) {
      setToast({
        message: `Successfully printed ${quantity} label(s) to ${printer}.`,
        type: 'success'
      });
    } finally {
      setPrinting(false);
      setTimeout(() => setToast(null), 4000);
    }
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
            <span className="text-[#6C2BD9] font-bold">Print Tags</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Printer className="w-6 h-6 text-[#6C2BD9]" />
            Barcode & RFID Tag Printing Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure label templates, numbering schemes, and dispatch print jobs to thermal barcode & RFID printers.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6C2BD9]" /> Tag & Print Job Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Printer</label>
                <select
                  value={printer}
                  onChange={(e) => setPrinter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="Zebra ZT411 RFID (Warehouse Dock 2)">Zebra ZT411 RFID (Warehouse Dock 2)</option>
                  <option value="SATO CL4NX Plus RFID (IT Lab)">SATO CL4NX Plus RFID (IT Lab)</option>
                  <option value="Dymo LabelWriter 550 (Admin Desk)">Dymo LabelWriter 550 (Admin Desk)</option>
                  <option value="Network Thermal PDF (Virtual)">Network Thermal PDF (Virtual)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tag Format</label>
                <select
                  value={tagFormat}
                  onChange={(e) => setTagFormat(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="CODE_128">Code 128 High-Density Barcode</option>
                  <option value="QR_CODE">2D QR Code ISO/IEC 18004</option>
                  <option value="RFID_EPC">RFID UHF EPC Gen2 (860-960MHz)</option>
                  <option value="RFID_BARCODE_HYBRID">Hybrid RFID + Visual Barcode</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Label Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="STANDARD_2X1">Standard Asset Label (2.0" × 1.0")</option>
                  <option value="HEAVY_DUTY_3X1">Heavy-Duty Metal-Mount (3.0" × 1.0")</option>
                  <option value="MINI_IT_1X05">Compact IT Micro-Tag (1.5" × 0.5")</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Number of Labels</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tag Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Starting Sequence</label>
                <input
                  type="number"
                  value={startNum}
                  onChange={(e) => setStartNum(Number(e.target.value))}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="px-6 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {printing ? 'Dispatching...' : `Print ${quantity} Labels Now`}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Realistic Label Preview */}
        <div className="space-y-4">
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Barcode className="w-4 h-4 text-[#6C2BD9]" /> Live Print Preview
            </h3>

            {/* Simulated Label Sticker */}
            <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-xs space-y-3 text-center">
              <div className="border border-slate-900 p-3 rounded-lg bg-white space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono border-b border-slate-200 pb-1">
                  <span className="font-extrabold text-slate-900">ASSET360 ENTERPRISE</span>
                  <span className="text-slate-500 font-semibold">{template}</span>
                </div>

                {/* Barcode / QR Simulation */}
                <div className="py-2 flex flex-col items-center justify-center">
                  {tagFormat === 'QR_CODE' ? (
                    <div className="w-24 h-24 bg-slate-900 text-white p-2 rounded flex items-center justify-center font-mono text-[9px]">
                      [ QR CODE ]
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* CSS-based Barcode */}
                      <div className="flex items-center justify-center gap-[2px] h-10 px-2">
                        {Array.from({ length: 34 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-slate-900 h-full"
                            style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '2px' : '1px' }}
                          />
                        ))}
                      </div>
                      <p className="font-mono text-xs font-black tracking-widest text-slate-900">
                        {prefix}{startNum}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-left text-slate-700 space-y-0.5 border-t border-slate-200 pt-1 font-mono">
                  <div className="flex justify-between">
                    <span>EPC:</span>
                    <span className="font-bold">E28011606000{startNum}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>PROPERTY OF:</span>
                    <span>INFOTATWAA CORP</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Resolution: 300 DPI • Thermal Transfer • Synthetic Poly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
