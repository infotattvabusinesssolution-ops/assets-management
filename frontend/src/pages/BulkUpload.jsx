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

  // Handle Download Formatted Excel Template (.xlsx) with Real Sample Data & Guide Sheet
  const handleDownloadExcelTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Asset360 Enterprise';
      workbook.created = new Date();

      // Sheet 1: Assets Import Template
      const sheet = workbook.addWorksheet('Asset Upload Template', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      sheet.columns = [
        { header: 'Asset Name', key: 'name', width: 36 },
        { header: 'Category', key: 'category', width: 22 },
        { header: 'Serial Number', key: 'serialNumber', width: 22 },
        { header: 'Location', key: 'location', width: 24 },
        { header: 'Custodian', key: 'custodian', width: 20 },
        { header: 'Acquisition Value', key: 'acquisitionValue', width: 18 },
        { header: 'Currency', key: 'currency', width: 12 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Condition', key: 'condition', width: 14 },
        { header: 'Asset ID', key: 'assetId', width: 22 }
      ];

      // Format Header Row (Brand Purple, Bold, Centered)
      const headerRow = sheet.getRow(1);
      headerRow.height = 28;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Segoe UI' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6C2BD9' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Sheet 2: Reference Guide & Allowed Values
      const guideSheet = workbook.addWorksheet('Instructions & Master Data');
      guideSheet.columns = [
        { header: 'Field Name', key: 'field', width: 22 },
        { header: 'Requirement', key: 'req', width: 24 },
        { header: 'Allowed Values & Guidelines', key: 'guide', width: 55 },
        { header: 'Sample Entry', key: 'example', width: 32 }
      ];

      const guideHeader = guideSheet.getRow(1);
      guideHeader.height = 26;
      guideHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      guideHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      guideHeader.alignment = { vertical: 'middle' };

      const guideData = [
        { field: 'Asset Name', req: 'REQUIRED', guide: 'Descriptive title of the item or equipment.', example: 'Dell Latitude 5540 15-inch Laptop' },
        { field: 'Category', req: 'REQUIRED', guide: 'Must match system: Laptop, Monitor, Printer, IT Infrastructure, Furniture, Mobile Device, Tablet, HVAC Equipment.', example: 'Laptop' },
        { field: 'Serial Number', req: 'REQUIRED for IT / Server / Mobile', guide: 'Unique manufacturer serial number.', example: 'SN-DL5540-88120' },
        { field: 'Location', req: 'RECOMMENDED', guide: 'Campus/Site name. Default: Dubai HQ Campus.', example: 'Dubai HQ Campus' },
        { field: 'Custodian', req: 'OPTIONAL', guide: 'Assigned employee name (e.g. John Doe, Jane Smith, David Miller, Facilities Team).', example: 'John Doe' },
        { field: 'Acquisition Value', req: 'RECOMMENDED', guide: 'Numeric purchase cost without symbols.', example: '1450.00' },
        { field: 'Currency', req: 'OPTIONAL', guide: 'Currency code. Defaults to USD (or AED, EUR, GBP).', example: 'USD' },
        { field: 'Status', req: 'OPTIONAL', guide: 'In Service, In Store, Under Maintenance. Defaults to In Service.', example: 'In Service' },
        { field: 'Condition', req: 'OPTIONAL', guide: 'New, Excellent, Good, Fair, Damaged. Defaults to Good.', example: 'Good' },
        { field: 'Asset ID', req: 'OPTIONAL', guide: 'Leave blank to auto-generate unique ID (AST-YYYY-XXXXX).', example: '(Leave blank)' }
      ];

      guideData.forEach(row => {
        const added = guideSheet.addRow(row);
        added.height = 20;
        added.font = { size: 10 };
        added.alignment = { vertical: 'middle' };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Asset360_Bulk_Upload_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', 'Downloaded formatted Excel (.xlsx) template with column guide!');
    } catch (err) {
      console.error('Error generating Excel template:', err);
      showToast('error', 'Could not generate Excel template. Downloading CSV template fallback.');
      handleDownloadCsvTemplate();
    }
  };

  // Handle Download Clean UTF-8 CSV Template with Sample Data
  const handleDownloadCsvTemplate = () => {
    const headers = ['Asset Name', 'Category', 'Serial Number', 'Location', 'Custodian', 'Acquisition Value', 'Currency', 'Status', 'Condition', 'Asset ID'];
    const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csvContent = '\uFEFF' + [headers].map(row => row.map(cell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Asset360_Bulk_Upload_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Downloaded CSV template !');
  };

  // Handle Download Error Report CSV
  const handleDownloadErrorReport = () => {
    const errorRows = records.filter(r => r.status === 'Error' || r.status === 'Warning');
    const headers = ['Row Number', 'Status', 'Asset ID', 'Asset Name', 'Category', 'Serial Number', 'Remarks / Error Reason'];
    const rows = errorRows.map(r => [r.row, r.status, r.assetId, r.name, r.category, r.serialNumber, r.remarks]);
    const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Asset360_Bulk_Upload_Error_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      const parsed = rows.filter(values => values.some(Boolean)).map((values, index) => {
        const userAssetId = field(values, 'assetid', 'id', 'tag');
        const autoId = userAssetId || `AST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        return {
          row: index + 2,
          assetId: autoId,
          name: field(values, 'assetname', 'name', 'description', 'assetdescription', 'itemname'),
          category: field(values, 'category', 'assetcategory', 'type'),
          serialNumber: field(values, 'serialnumber', 'serialno', 'sn', 'serial'),
          location: field(values, 'location', 'site', 'facility', 'campus') || 'Dubai HQ Campus',
          custodian: field(values, 'custodian', 'assignedto', 'owner', 'employee'),
          acquisitionValue: field(values, 'acquisitionvalue', 'acquisitioncost', 'cost', 'price', 'value'),
          currency: field(values, 'currency', 'curr') || 'USD',
          status: 'Unvalidated',
          condition: field(values, 'condition', 'assetcondition') || 'Good',
          remarks: 'Awaiting server validation'
        };
      });
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
            <p className="text-xs text-slate-500 mt-2">Download formatted template with column guide.</p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" /> Download CSV (.csv)
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('TEMPLATE_GUIDE')}
              className="text-[11px] text-[#6C2BD9] hover:underline font-bold flex items-center justify-center gap-1 cursor-pointer pt-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> View Template Guide &amp; Master Values
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
            <p className="text-xs text-slate-500 mt-2">Upload your completed spreadsheet.</p>
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
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Drag &amp; drop file or</p>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-[10px] font-extrabold text-slate-700 inline-block shadow-2xs">Browse</span>
              </div>

              {/* Uploaded File Card */}
              {selectedFile ? (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-extrabold text-slate-900 block truncate text-[11px]">{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{selectedFile.size}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedFile(null); setRecords([]); setIsValidated(false); }} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-medium">No file selected</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>Formats: .xlsx, .csv (Max 10 MB)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Validate Data */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-all ${
          selectedFile && !isValidated ? 'border-[#6C2BD9] ring-2 ring-purple-100' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Validate Data</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Check data against master catalog, sites, and serial numbers.</p>
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
              <Search className="w-4 h-4" /> {isValidating ? 'Validating Data...' : `Validate File (${records.length} Rows)`}
            </button>
          </div>
        </div>

        {/* Card 4: Submit */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-all ${
          isValidated ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#6C2BD9] text-white font-black text-xs flex items-center justify-center shrink-0">4</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Submit</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Submit valid records into database &amp; asset register.</p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              disabled={!isValidated || isSubmitting || !records.some(row => row.status === "Valid" || row.status === "Warning")}
              onClick={handleSubmitUpload}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isValidated
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" /> {isSubmitting ? 'Processing Upload...' : `Submit (${records.filter(r => r.status === 'Valid' || r.status === 'Warning').length} Valid)`}
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
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6C2BD9]" /> Bulk Upload Template Guide &amp; Master Values
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-slate-700">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950">
                <span className="font-extrabold block text-xs">💡 Quick Tips for Normal Users:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-purple-900">
                  <li><strong>Asset ID:</strong> You can leave this blank! The system will automatically generate a standard unique ID (e.g. <code>AST-2026-XXXXX</code>).</li>
                  <li><strong>Location:</strong> If left empty, it defaults automatically to <code>Dubai HQ Campus</code>.</li>
                  <li><strong>Serial Number:</strong> Required for IT hardware (Laptops, Servers, Mobile Devices). If non-serialized, you can leave it blank.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-extrabold text-slate-900 block text-xs">Supported System Categories:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">💻 Laptop</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">🖥️ Monitor</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">🖨️ Printer</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">📱 Mobile Device</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">📟 Tablet</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">🖧 IT Infrastructure</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">🪑 Furniture</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">❄️ HVAC Equipment</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-extrabold text-slate-900 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Column Name</th>
                      <th className="p-2.5">Required?</th>
                      <th className="p-2.5">Description &amp; Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold">Asset Name</td>
                      <td className="p-2.5 font-extrabold text-rose-600">Yes</td>
                      <td className="p-2.5 text-slate-600">Descriptive item title (e.g. <em>Dell Latitude 5540 15&quot;</em>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Category</td>
                      <td className="p-2.5 font-extrabold text-rose-600">Yes</td>
                      <td className="p-2.5 text-slate-600">Must match system category (e.g. <em>Laptop, Monitor, Printer</em>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Serial Number</td>
                      <td className="p-2.5 font-bold text-amber-700">Conditional</td>
                      <td className="p-2.5 text-slate-600">Required for Laptop/Server/Mobile (e.g. <em>SN-DL5540-88120</em>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Location</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-600">Defaults to <em>Dubai HQ Campus</em></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Custodian</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-600">Assigned employee (e.g. <em>John Doe, Jane Smith</em>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Acquisition Value</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-600">Purchase cost number (e.g. <em>1450.00</em>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Status</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-600"><em>In Service</em>, <em>In Store</em>, <em>Under Maintenance</em></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setActiveModal(null); handleDownloadExcelTemplate(); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Excel Template
              </button>
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BulkUpload;
