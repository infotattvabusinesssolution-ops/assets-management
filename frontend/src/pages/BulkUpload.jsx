import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ExcelJS from 'exceljs';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Search,
  HelpCircle,
  Clock,
  ChevronRight,
  X,
  FileText,
  ListFilter,
  Check,
  Package,
  ShieldCheck,
  Database,
  Eye,
  Settings
} from 'lucide-react';

export function BulkUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Workflow Steps & File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [records, setRecords] = useState([]);

  // Table Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals & Toast State
  const [activeModal, setActiveModal] = useState(null);
  const [historyJobs, setHistoryJobs] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Compute validation summary statistics
  const stats = useMemo(() => {
    const total = records.length;
    const valid = records.filter(r => r.status === 'Valid').length;
    const warning = records.filter(r => r.status === 'Warning').length;
    const error = records.filter(r => r.status === 'Error').length;
    return { total, valid, warning, error };
  }, [records]);

  // Filtered Records based on status badge selection
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (statusFilter === 'Valid' && r.status !== 'Valid') return false;
      if (statusFilter === 'Warning' && r.status !== 'Warning') return false;
      if (statusFilter === 'Error' && r.status !== 'Error') return false;
      return true;
    });
  }, [records, statusFilter]);

  // Paginated Rows
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [filteredRecords, currentPage, perPage]);

  const totalPages = Math.ceil(filteredRecords.length / perPage) || 1;

  // Handle Download Excel Template
  const handleDownloadTemplate = () => {
    const csvContent = 'Asset ID,Asset Name,Category,Serial Number,Location,Custodian,Acquisition Value,Currency,Status,Condition\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset360_Bulk_Upload_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded Asset360 Bulk Upload CSV template!');
  };

  // Handle Download Error Report CSV
  const handleDownloadErrorReport = () => {
    const errorRows = records.filter(r => r.status === 'Error' || r.status === 'Warning');
    const headers = ['Row Number', 'Status', 'Asset ID', 'Asset Name', 'Category', 'Serial Number', 'Remarks / Error Reason'];
    const rows = errorRows.map(r => [r.row, r.status, r.assetId, r.name, r.category, r.serialNumber, r.remarks]);
    const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset360_Bulk_Upload_Error_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded Error Report CSV for unresolved records!');
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = (e.dataTransfer ? e.dataTransfer.files : e.target.files)?.[0];
    if (!file) return;
    setSelectedFile(null);
    setRecords([]);
    setIsValidated(false);
    setCurrentPage(1);
    if (file.size > 10 * 1024 * 1024 || !/\.(csv|xlsx)$/i.test(file.name)) {
      showToast('error', 'Choose a CSV or XLSX file smaller than 10 MB.');
      return;
    }
    try {
      let rows;
      if (/\.xlsx$/i.test(file.name)) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const sheet = workbook.worksheets[0];
        if (!sheet) throw new Error('The workbook has no sheets.');
        rows = [];
        sheet.eachRow({ includeEmpty: false }, row => {
          rows.push(Array.from({ length: sheet.columnCount }, (_, i) => {
            const value = row.getCell(i + 1).value;
            return String(value?.text ?? value?.result ?? value ?? '').trim();
          }));
        });
      } else {
        const source = await file.text();
        rows = [[]];
        let cell = '', quoted = false;
        for (let i = 0; i < source.length; i++) {
          const char = source[i];
          if (char === '"' && quoted && source[i + 1] === '"') { cell += '"'; i++; }
          else if (char === '"') quoted = !quoted;
          else if (char === ',' && !quoted) { rows.at(-1).push(cell.trim()); cell = ''; }
          else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && source[i + 1] === '\n') i++;
            rows.at(-1).push(cell.trim()); cell = ''; rows.push([]);
          } else cell += char;
        }
        if (quoted) throw new Error('CSV has an unclosed quoted field.');
        rows.at(-1).push(cell.trim());
      }
      const headers = (rows.shift() || []).map(h => h.replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, ''));
      const field = (values, ...names) => {
        const index = headers.findIndex(h => names.includes(h));
        return index < 0 ? '' : (values[index] || '');
      };
      const parsed = rows.filter(values => values.some(Boolean)).map((values, index) => ({
        row: index + 2,
        assetId: field(values, 'assetid'),
        name: field(values, 'assetname', 'name', 'description'),
        category: field(values, 'category'),
        serialNumber: field(values, 'serialnumber'),
        location: field(values, 'location', 'site'),
        custodian: field(values, 'custodian'),
        acquisitionValue: field(values, 'acquisitionvalue', 'acquisitioncost', 'cost'),
        currency: field(values, 'currency'),
        status: 'Unvalidated',
        remarks: 'Awaiting server validation'
      }));
      if (!parsed.length) throw new Error('The file has no asset rows.');
      setSelectedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
      setRecords(parsed);
      showToast('info', 'Loaded ' + parsed.length + ' rows. Validate the file before submitting.');
    } catch (error) {
      showToast('error', error.message || 'Could not read this file.');
    }
  };

  // Handle Validate File API
  const handleValidateFile = async () => {
    if (!selectedFile || !records.length) return;
    try {
      setIsValidating(true);
      setIsValidated(false);
      const res = await api.post('/imports/validate', { rows: records });
      if (res?.success && Array.isArray(res.records)) {
        setRecords(res.records);
        setIsValidated(true);
        showToast(
          'success',
          `File data validation complete! ${res.validCount || 0} Valid, ${res.warningCount || 0} Warnings, ${res.errorCount || 0} Errors found.`
        );
      } else {
        throw new Error('Server returned no validation result.');
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Validation request failed.');
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Submit Upload API
  const handleSubmitUpload = async () => {
    if (!isValidated || !selectedFile) return;
    try {
      setIsSubmitting(true);
      const validRows = records.filter((r) => r.status === 'Valid' || r.status === 'Warning');
      if (validRows.length === 0) {
        showToast('error', 'No valid records to upload. Please fix validation errors.');
        setIsSubmitting(false);
        return;
      }
      const batchRef = `BATCH-UP-${new Date().getFullYear()}-${Math.floor(Math.random() * 899 + 100)}`;
      const res = await api.post('/imports/submit', {
        batchReference: batchRef,
        fileName: selectedFile.name,
        rows: records
      });
      if (!res?.success) throw new Error(res?.message || 'Upload failed.');
      showToast(
        res.failedCount > 0 ? 'error' : 'success',
        res?.message || `Bulk upload batch ${batchRef} processed successfully! ${validRows.length} assets created/updated.`
      );
      if (!res.failedCount) setTimeout(() => navigate('/assets'), 1400);
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Bulk upload submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Upload History
  const fetchUploadHistory = async () => {
    try {
      const res = await api.get('/imports/history');
      if (res?.history) {
        setHistoryJobs(res.history);
      }
    } catch (err) {
      setHistoryJobs([]);
      showToast('error', err?.response?.data?.message || 'Could not load upload history.');
    }
    setActiveModal('UPLOAD_HISTORY');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Action Buttons (Matching Screenshot 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span className="font-bold text-[#6C2BD9]">Assets</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Bulk Upload</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Upload</h1>
          <p className="text-xs text-slate-500 font-medium">Create or update multiple assets using the predefined template</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModal('TEMPLATE_GUIDE')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" /> Help
          </button>

          <button
            type="button"
            onClick={fetchUploadHistory}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#6C2BD9]" /> Upload History
          </button>
        </div>
      </div>

      {/* 6-Step Visual Process Pipeline Bar (Matching Screenshot 1-to-1 with arrows) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 text-xs font-semibold">
          
          {/* Step 1 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/80 border border-purple-200 text-[#6C2BD9]">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
              <div className="truncate">
                <span className="font-extrabold block leading-tight text-slate-900">Download Template</span>
                <span className="text-[10px] text-purple-700 font-medium truncate block">Get the latest Excel/CSV template</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          {/* Step 2 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">2</div>
              <div className="truncate">
                <span className="font-bold block leading-tight text-slate-900">Prepare Data</span>
                <span className="text-[10px] text-slate-400 font-medium truncate block">Fill in asset details</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          {/* Step 3 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">3</div>
              <div className="truncate">
                <span className="font-bold block leading-tight text-slate-900">Upload File</span>
                <span className="text-[10px] text-slate-400 font-medium truncate block">Select and upload file</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          {/* Step 4 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">4</div>
              <div className="truncate">
                <span className="font-bold block leading-tight text-slate-900">Validate Data</span>
                <span className="text-[10px] text-slate-400 font-medium truncate block">System validates records</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          {/* Step 5 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">5</div>
              <div className="truncate">
                <span className="font-bold block leading-tight text-slate-900">Preview &amp; Confirm</span>
                <span className="text-[10px] text-slate-400 font-medium truncate block">Review valid and error records</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />

          {/* Step 6 */}
          <div className="flex-1 min-w-[140px] flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">6</div>
              <div className="truncate">
                <span className="font-bold block leading-tight text-slate-900">Submit</span>
                <span className="text-[10px] text-slate-400 font-medium truncate block">Create/update assets</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Upper Control Cards Grid (Matching Screenshot 1-to-1) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Download Template */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Download Template</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Download the CSV template with the required column headings.</p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                X
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" /> Download Excel Template
              </button>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('TEMPLATE_GUIDE')}
              className="text-[11px] text-[#6C2BD9] hover:underline font-bold flex items-center gap-1 cursor-pointer pt-1"
            >
              <Download className="w-3.5 h-3.5" /> View Template Guide
            </button>
          </div>
        </div>

        {/* Card 2: Upload File */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Upload File</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Upload your completed Excel or CSV file.</p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Drag & Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-300 hover:border-[#6C2BD9] bg-slate-50 rounded-xl p-2.5 text-center cursor-pointer transition-colors space-y-1 relative flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-[#6C2BD9]" />
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Drag and drop your file here or</p>
                <span className="px-2.5 py-0.5 bg-white border border-slate-300 rounded-md text-[10px] font-extrabold text-slate-700 inline-block shadow-2xs">Choose File</span>
              </div>

              {/* Uploaded File Card */}
              {selectedFile ? (
                <div className="border border-slate-200 bg-white rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      X
                    </div>
                    <div className="truncate">
                      <span className="font-extrabold text-slate-900 block truncate text-[11px]">{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{selectedFile.size}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedFile(null); setRecords([]); setIsValidated(false); }} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-2.5 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  No file selected
                </div>
              )}
            </div>

            <p className="text-[9px] text-slate-400 text-center">Supported formats: .xlsx, .csv (Max size: 10 MB)</p>
          </div>
        </div>

        {/* Card 3: Validate Data */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Validate Data</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Check data for errors, duplicates and master data validation.</p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              disabled={!selectedFile || !records.length || isValidating}
              onClick={handleValidateFile}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                selectedFile
                  ? 'bg-[#6C2BD9] hover:bg-[#5B21B6] text-white shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Search className="w-4 h-4" /> {isValidating ? 'Validating Data...' : 'Validate File'}
            </button>
          </div>
        </div>

        {/* Card 4: Submit */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">4</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Submit</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Submit valid records to create or update assets.</p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              disabled={!isValidated || isSubmitting || !records.some(row => row.status === "Valid" || row.status === "Warning")}
              onClick={handleSubmitUpload}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isValidated
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4 text-slate-500" /> {isSubmitting ? 'Processing Upload...' : 'Submit Upload'}
            </button>
          </div>
        </div>

      </div>

      {/* Preview & Validation Results Table Section (Matching Screenshot 1-to-1 with Enterprise UI Tabulation) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        
        {/* Header Bar & Summary Stat Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-black text-base tracking-tight">Preview &amp; Validation Results</h3>
            <p className="text-xs text-slate-500 font-medium">Review the uploaded asset data, filter status, and resolve errors before submission.</p>
          </div>

          {/* Interactive Filter Cards / Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                statusFilter === 'All' ? 'bg-purple-100 border-[#6C2BD9] text-black font-black shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-[#6C2BD9]" />
              <span>All ({stats.total})</span>
            </button>

            <button
              type="button"
              onClick={() => { setStatusFilter('Valid'); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                statusFilter === 'Valid' ? 'bg-emerald-100 border-emerald-500 text-black font-black shadow-2xs' : 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Valid ({stats.valid})</span>
            </button>

            <button
              type="button"
              onClick={() => { setStatusFilter('Warning'); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                statusFilter === 'Warning' ? 'bg-amber-100 border-amber-500 text-black font-black shadow-2xs' : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Warnings ({stats.warning})</span>
            </button>

            <button
              type="button"
              onClick={() => { setStatusFilter('Error'); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border transition-all cursor-pointer ${
                statusFilter === 'Error' ? 'bg-rose-100 border-rose-500 text-black font-black shadow-2xs' : 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Errors ({stats.error})</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar above table */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-black font-bold">
            <ListFilter className="w-4 h-4 text-[#6C2BD9]" />
            <span>Showing <strong className="text-black">{filteredRecords.length}</strong> records ({statusFilter} Filter)</span>
          </div>

          {(stats.error > 0 || stats.warning > 0) && (
            <button
              type="button"
              onClick={handleDownloadErrorReport}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold rounded-lg border border-rose-200 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" /> Export Unresolved Error Report (.CSV)
            </button>
          )}
        </div>

        {/* Validation Results Standard Enterprise Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left border-collapse text-xs text-black">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                <tr className="bg-slate-50 border-b border-slate-200 text-black font-black uppercase text-[11px] tracking-wider select-none">
                  <th className="px-4 py-3.5 w-10 text-black">
                    <span className="w-4 block" />
                  </th>
                  <th className="px-4 py-3.5 text-black">Row</th>
                  <th className="px-4 py-3.5 text-black">Status</th>
                  <th className="px-4 py-3.5 text-black">Asset ID</th>
                  <th className="px-4 py-3.5 text-black">Asset Name</th>
                  <th className="px-4 py-3.5 text-black">Category</th>
                  <th className="px-4 py-3.5 text-black">Serial Number</th>
                  <th className="px-4 py-3.5 text-black">Location</th>
                  <th className="px-4 py-3.5 text-black">Custodian</th>
                  <th className="px-4 py-3.5 text-black">Remarks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white font-medium text-black">
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((r) => {
                    return (
                      <tr key={r.row} className="hover:bg-purple-50/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="w-4 block" />
                        </td>

                        <td className="px-4 py-3.5 text-black font-mono font-bold">{r.row}</td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1.5 border ${
                            r.status === 'Valid' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                            r.status === 'Warning' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                            'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {r.status === 'Valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {r.status === 'Warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                            {r.status === 'Error' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                            {r.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono font-extrabold text-black whitespace-nowrap">{r.assetId}</td>
                        <td className="px-4 py-3.5 font-black text-black">{r.name}</td>
                        <td className="px-4 py-3.5 text-black font-semibold">{r.category}</td>
                        <td className="px-4 py-3.5 font-mono text-black font-semibold">
                          {r.serialNumber === '-' ? <span className="text-slate-400 font-medium">-</span> : r.serialNumber}
                        </td>
                        <td className="px-4 py-3.5 text-black font-semibold">
                          {r.location === '-' ? <span className="text-slate-400 font-medium">-</span> : r.location}
                        </td>
                        <td className="px-4 py-3.5 text-black font-semibold">
                          {r.custodian === '-' ? <span className="text-slate-400 font-medium">-</span> : r.custodian}
                        </td>

                        {/* Remarks */}
                        <td className="px-4 py-3.5">
                          {r.status === 'Error' ? (
                            <span className="text-rose-600 font-bold text-xs">{r.remarks}</span>
                          ) : r.status === 'Warning' ? (
                            <span className="text-rose-700 font-bold text-xs">{r.remarks}</span>
                          ) : (
                            <span className="text-slate-400 font-medium">{r.remarks}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No records match the selected status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {paginatedRecords.length} of {filteredRecords.length} records</span>
            <div className="flex items-center gap-2">
              <select aria-label="Rows per page" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
              <span>{currentPage} / {totalPages}</span>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>

      </div>



      {/* ================= MODALS ================= */}

      {/* Upload History Modal */}
      {activeModal === 'UPLOAD_HISTORY' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6C2BD9]" /> Bulk Upload History &amp; Batch References
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <th className="p-3">Batch Ref</th>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Uploaded By</th>
                      <th className="p-3">Date / Time</th>
                      <th className="p-3 text-center">Success</th>
                      <th className="p-3 text-center">Failed</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {historyJobs.map((j) => (
                      <tr key={j.batchRef} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#6C2BD9]">{j.batchRef}</td>
                        <td className="p-3 font-bold text-slate-900">{j.fileName}</td>
                        <td className="p-3 text-slate-600">{j.uploadedBy}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{j.uploadDate}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{j.successCount}</td>
                        <td className="p-3 text-center font-bold text-rose-600">{j.failedCount}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            ✓ {j.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {historyJobs.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No upload history found.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">Showing {historyJobs.length} records</span>
                <span className="text-slate-400">Scroll down to view all records</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Guide Modal */}
      {activeModal === 'TEMPLATE_GUIDE' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6C2BD9]" /> Bulk Upload Template Guide &amp; Validation Rules
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block">Mandatory Fields:</span>
                <p className="text-[11px] text-slate-600">Asset ID, Asset Name, Category, Serial Number (for serialized categories), Location.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block">Uniqueness Rules:</span>
                <p className="text-[11px] text-slate-600">Asset ID, Serial Number, Barcode, and RFID EPC must be unique across all existing enterprise assets.</p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-1 text-purple-950">
                <span className="font-extrabold block">Master Data Cross-References:</span>
                <p className="text-[11px] text-purple-900">Categories, Companies, Sites, Buildings, Rooms, and Custodians must match exact names in Master Data. Unrecognized custodians will raise a Warning and leave custody unassigned.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer">Close Guide</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BulkUpload;
