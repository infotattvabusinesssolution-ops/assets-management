import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export function FileImportModal({ isOpen, onClose, onImportAssets, defaultValues = {}, existingItems = [] }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Serial Number,Asset Name,Category,Sub Category,Manufacturer,Model,Condition,Tag Number\n" +
      "DL7450-101,Dell Latitude 7450,Laptop,Business Laptop,Dell,Latitude 7450,New,E36000012501\n" +
      "DL7450-102,Dell Latitude 7450,Laptop,Business Laptop,Dell,Latitude 7450,New,E36000012502\n" +
      "DL7450-103,Dell Latitude 7450,Laptop,Business Laptop,Dell,Latitude 7450,New,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Receive_Without_PO_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (uploadFile) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setIsProcessing(false);
        return;
      }

      // Basic CSV parser
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const serialIdx = headers.findIndex(h => h.includes('serial'));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const catIdx = headers.findIndex(h => h.includes('category') && !h.includes('sub'));
      const subCatIdx = headers.findIndex(h => h.includes('sub'));
      const mfgIdx = headers.findIndex(h => h.includes('manufacturer'));
      const modelIdx = headers.findIndex(h => h.includes('model'));
      const condIdx = headers.findIndex(h => h.includes('condition'));
      const tagIdx = headers.findIndex(h => h.includes('tag'));

      const results = [];
      const seenSerials = new Set();

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const sn = serialIdx !== -1 ? cols[serialIdx] : cols[0];
        if (!sn) continue;

        const assetName = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : `${defaultValues.manufacturer || 'Dell'} ${defaultValues.model || 'Latitude 7450'}`;
        const category = (catIdx !== -1 && cols[catIdx]) ? cols[catIdx] : (defaultValues.category || 'Laptop');
        const subCategory = (subCatIdx !== -1 && cols[subCatIdx]) ? cols[subCatIdx] : (defaultValues.subCategory || 'Business Laptop');
        const manufacturer = (mfgIdx !== -1 && cols[mfgIdx]) ? cols[mfgIdx] : (defaultValues.manufacturer || 'Dell');
        const model = (modelIdx !== -1 && cols[modelIdx]) ? cols[modelIdx] : (defaultValues.model || 'Latitude 7450');
        const condition = (condIdx !== -1 && cols[condIdx]) ? cols[condIdx] : (defaultValues.condition || 'New');
        const tag = (tagIdx !== -1 && cols[tagIdx]) ? cols[tagIdx] : '';

        let isValid = true;
        let validationMsg = 'Valid';

        // Check if duplicate in uploaded file
        if (seenSerials.has(sn.toLowerCase())) {
          isValid = false;
          validationMsg = 'Duplicate in file';
        } else {
          seenSerials.add(sn.toLowerCase());
          // Check if duplicate in current batch
          const duplicateInBatch = existingItems.some(item => item.serialNumber?.toLowerCase() === sn.toLowerCase());
          if (duplicateInBatch) {
            isValid = false;
            validationMsg = 'Already in current batch';
          }
        }

        results.push({
          id: `AST-IMP-${Date.now()}-${i}`,
          serialNumber: sn,
          assetName,
          category,
          subCategory,
          manufacturer,
          model,
          condition,
          tagNumber: tag || '-',
          status: tag && tag !== '-' ? 'Tagged' : 'Pending',
          imageUrl: '/laptop.png',
          isValid,
          validationMsg
        });
      }

      setParsedRows(results);
      setIsProcessing(false);
    };

    reader.readAsText(uploadFile);
  };

  const handleConfirmImport = () => {
    const validItems = parsedRows.filter(r => r.isValid);
    onImportAssets(validItems);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import Assets from File</h3>
              <p className="text-xs text-slate-500">Bulk upload multiple serial numbers via CSV or Excel template</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Prepare file according to template structure:</span>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {file ? file.name : 'Click to browse or drag and drop your file here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Supports UTF-8 CSV formatted files</p>
          </div>

          {/* Validation & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Preview Parsed Items ({parsedRows.length})</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-medium">✓ {validCount} ready</span>
                  {invalidCount > 0 && <span className="text-amber-600 font-medium">⚠ {invalidCount} skipped</span>}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Serial No</th>
                      <th className="py-2 px-3">Asset Name</th>
                      <th className="py-2 px-3">Tag</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/30'}>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{row.serialNumber}</td>
                        <td className="py-2 px-3 text-slate-600">{row.assetName}</td>
                        <td className="py-2 px-3 text-slate-600">{row.tagNumber}</td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                              <AlertCircle className="w-3 h-3" /> {row.validationMsg}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={validCount === 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
          >
            Import {validCount} Asset{validCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}
