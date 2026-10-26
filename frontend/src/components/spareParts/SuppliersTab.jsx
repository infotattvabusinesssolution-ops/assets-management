import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Edit,
  Eye,
  Star,
  Plus,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2,
  Building2,
  Trash2,
  Download,
  Upload,
  Globe,
  DollarSign,
  Clock,
  ShieldCheck
} from 'lucide-react';

const INITIAL_SUPPLIERS = [
  {
    id: 1,
    code: 'SUP-001',
    name: 'Al Futtaim Trading LLC',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Ahmed Khan',
    phone: '+971 4 331 2000',
    email: 'ahmed.khan@futtaim.ae',
    status: 'Active',
    isPreferred: true,
    address: 'PO Box 12345, Dubai, UAE',
    trn: 'TRN123456789000',
    paymentTerms: '30 Days',
    leadTimeDays: 7,
    currency: 'AED',
    website: 'www.futtaim.ae',
    remarks: 'Authorized distributor for HVAC and electrical spare parts.',
    documents: [
      { name: 'Trade_License_2026.pdf', type: 'PDF', size: '1.2 MB', date: '10 Jan 2026' },
      { name: 'VAT_Tax_Certificate.pdf', type: 'PDF', size: '420 KB', date: '15 Jan 2026' },
      { name: 'Authorized_Distributor_Agreement.pdf', type: 'PDF', size: '2.8 MB', date: '01 Feb 2026' }
    ]
  },
  {
    id: 2,
    code: 'SUP-002',
    name: 'ABB Middle East',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Ramesh Nair',
    phone: '+971 4 424 0000',
    email: 'ramesh.nair@ae.abb.com',
    status: 'Active',
    isPreferred: false,
    address: 'DIC Industrial Area, Dubai, UAE',
    trn: 'TRN987654321000',
    paymentTerms: '45 Days',
    leadTimeDays: 14,
    currency: 'AED',
    website: 'www.abb.com/ae',
    remarks: 'OEM supplier for heavy switchgear and circuit breakers.',
    documents: [
      { name: 'ABB_Vendor_Registration.pdf', type: 'PDF', size: '890 KB', date: '12 Feb 2026' }
    ]
  },
  {
    id: 3,
    code: 'SUP-003',
    name: 'Emirates Trading Co.',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Sarah Ahmed',
    phone: '+971 4 295 0000',
    email: 'sarah@emiratestrading.ae',
    status: 'Active',
    isPreferred: true,
    address: 'Deira Hardware Market, Dubai, UAE',
    trn: 'TRN456789123000',
    paymentTerms: '30 Days',
    leadTimeDays: 5,
    currency: 'AED',
    website: 'www.emiratestrading.ae',
    remarks: 'Primary supplier for plumbing valves and pipe fittings.',
    documents: []
  },
  {
    id: 4,
    code: 'SUP-004',
    name: 'Honeywell Middle East',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'James Smith',
    phone: '+971 4 450 0000',
    email: 'james.smith@honeywell.com',
    status: 'Active',
    isPreferred: false,
    address: 'Emaar Business Park, Dubai, UAE',
    trn: 'TRN112233445566',
    paymentTerms: '60 Days',
    leadTimeDays: 21,
    currency: 'AED',
    website: 'www.honeywell.com',
    remarks: 'Fire alarm sensors and building automation controllers supplier.',
    documents: []
  },
  {
    id: 5,
    code: 'SUP-005',
    name: 'Schneider Electric',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Khalid Omar',
    phone: '+971 4 372 0000',
    email: 'khalid.omar@se.com',
    status: 'Active',
    isPreferred: true,
    address: 'Silicon Oasis, Dubai, UAE',
    trn: 'TRN998877665544',
    paymentTerms: '30 Days',
    leadTimeDays: 10,
    currency: 'AED',
    website: 'www.se.com/ae',
    remarks: 'Approved electrical component partner.',
    documents: []
  },
  {
    id: 6,
    code: 'SUP-006',
    name: 'BuildCare LLC',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Fatima Ali',
    phone: '+971 4 288 0000',
    email: 'fatima@buildcare.ae',
    status: 'Active',
    isPreferred: false,
    address: 'Al Quoz Industrial 3, Dubai, UAE',
    trn: 'TRN334455667788',
    paymentTerms: '30 Days',
    leadTimeDays: 7,
    currency: 'AED',
    website: 'www.buildcare.ae',
    remarks: 'Civil construction materials and structural fasteners.',
    documents: []
  },
  {
    id: 7,
    code: 'SUP-007',
    name: 'Al Bahar',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Yousef Mahmoud',
    phone: '+971 4 395 0000',
    email: 'yousef@albahar.ae',
    status: 'Active',
    isPreferred: false,
    address: 'Sharjah Industrial Area 1, UAE',
    trn: 'TRN776655443322',
    paymentTerms: '45 Days',
    leadTimeDays: 7,
    currency: 'AED',
    website: 'www.albahar.com',
    remarks: 'Caterpillar generator parts and engine filters.',
    documents: []
  },
  {
    id: 8,
    code: 'SUP-008',
    name: 'Philips',
    type: 'Parts Supplier',
    country: 'Netherlands',
    contactPerson: 'Mark Johnson',
    phone: '+31 40 27 9000',
    email: 'mark.johnson@philips.com',
    status: 'Active',
    isPreferred: false,
    address: 'Eindhoven, Netherlands',
    trn: 'NL801234567B01',
    paymentTerms: '60 Days',
    leadTimeDays: 30,
    currency: 'EUR',
    website: 'www.philips.com',
    remarks: 'Direct OEM import for specialized LED lighting drivers.',
    documents: []
  },
  {
    id: 9,
    code: 'SUP-009',
    name: 'Emirates General Supplies',
    type: 'Service Supplier',
    country: 'UAE',
    contactPerson: 'Omar Hassan',
    phone: '+971 4 333 1000',
    email: 'omar@egs.ae',
    status: 'Inactive',
    isPreferred: false,
    address: 'Jebel Ali Free Zone, Dubai, UAE',
    trn: 'TRN556677889900',
    paymentTerms: '15 Days',
    leadTimeDays: 14,
    currency: 'AED',
    website: 'www.egs.ae',
    remarks: 'Service vendor currently under contract renegotiation.',
    documents: []
  },
  {
    id: 10,
    code: 'SUP-010',
    name: 'Atlas Copco',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: 'Lisa Brown',
    phone: '+971 4 880 0000',
    email: 'lisa.brown@atlascopco.com',
    status: 'Active',
    isPreferred: false,
    address: 'JAFZA South, Dubai, UAE',
    trn: 'TRN123987456000',
    paymentTerms: '30 Days',
    leadTimeDays: 10,
    currency: 'AED',
    website: 'www.atlascopco.com',
    remarks: 'Air compressor spares and pneumatic maintenance.',
    documents: []
  }
];

export function SuppliersTab({ onShowToast, triggerAdd, triggerExport, triggerImport, onSupplierCountChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All Countries');

  const [suppliersList, setSuppliersList] = useState(INITIAL_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState(INITIAL_SUPPLIERS[0]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const supplierImportInputRef = React.useRef(null);

  // Supplier Form State
  const initialForm = {
    code: '',
    name: '',
    type: 'Parts Supplier',
    country: 'UAE',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    trn: '',
    paymentTerms: '30 Days',
    leadTimeDays: 7,
    currency: 'AED',
    website: '',
    status: 'Active',
    isPreferred: false,
    remarks: ''
  };
  const [supplierForm, setSupplierForm] = useState(initialForm);

  // Listen for trigger from parent header button
  useEffect(() => {
    if (triggerAdd) {
      handleOpenAddModal();
    }
  }, [triggerAdd]);

  useEffect(() => {
    if (triggerExport) {
      handleExportCSV();
    }
  }, [triggerExport]);

  useEffect(() => {
    if (triggerImport) {
      setShowImportModal(true);
    }
  }, [triggerImport]);

  useEffect(() => {
    onSupplierCountChange?.(suppliersList.length);
  }, [suppliersList]);

  // Open modal for Adding
  const handleOpenAddModal = () => {
    const nextNum = suppliersList.length + 1;
    const generatedCode = `SUP-${String(nextNum).padStart(3, '0')}`;
    setEditingSupplier(null);
    setSupplierForm({
      ...initialForm,
      code: generatedCode
    });
    setShowSupplierModal(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (sup) => {
    setEditingSupplier(sup);
    setSupplierForm({
      code: sup.code || '',
      name: sup.name || '',
      type: sup.type || 'Parts Supplier',
      country: sup.country || 'UAE',
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      trn: sup.trn || '',
      paymentTerms: sup.paymentTerms || '30 Days',
      leadTimeDays: sup.leadTimeDays || 7,
      currency: sup.currency || 'AED',
      website: sup.website || '',
      status: sup.status || 'Active',
      isPreferred: sup.isPreferred || false,
      remarks: sup.remarks || ''
    });
    setShowSupplierModal(true);
  };

  // Save Supplier (Create or Update)
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      onShowToast?.('Supplier Name is required.', 'error');
      return;
    }

    if (editingSupplier) {
      // Update
      const updated = {
        ...editingSupplier,
        ...supplierForm,
        leadTimeDays: parseInt(supplierForm.leadTimeDays || 7)
      };
      setSuppliersList(prev => prev.map(s => s.id === editingSupplier.id ? updated : s));
      setSelectedSupplier(updated);
      onShowToast?.(`Supplier ${updated.code} - ${updated.name} updated successfully!`);
    } else {
      // Create
      const newSup = {
        ...supplierForm,
        id: Date.now(),
        leadTimeDays: parseInt(supplierForm.leadTimeDays || 7),
        documents: []
      };
      setSuppliersList(prev => [newSup, ...prev]);
      setSelectedSupplier(newSup);
      onShowToast?.(`Supplier ${newSup.code} added successfully!`);
    }

    setShowSupplierModal(false);
    setEditingSupplier(null);
    setSupplierForm(initialForm);
  };

  // Delete Supplier
  const handleDeleteSupplier = (id, e) => {
    e?.stopPropagation();
    const sup = suppliersList.find(s => s.id === id);
    if (!window.confirm(`Are you sure you want to delete supplier "${sup?.name || 'this supplier'}"?`)) return;

    const remaining = suppliersList.filter(s => s.id !== id);
    setSuppliersList(remaining);
    setSelectedIds(prev => prev.filter(item => item !== id));
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(remaining[0] || null);
    }
    onShowToast?.(`Supplier ${sup?.code} deleted successfully.`);
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected supplier(s)?`)) return;

    const remaining = suppliersList.filter(s => !selectedIds.includes(s.id));
    setSuppliersList(remaining);
    setSelectedIds([]);
    if (selectedSupplier && selectedIds.includes(selectedSupplier.id)) {
      setSelectedSupplier(remaining[0] || null);
    }
    onShowToast?.(`${selectedIds.length} suppliers deleted.`);
  };

  // Toggle preferred star
  const togglePreferred = (id, e) => {
    e.stopPropagation();
    setSuppliersList((prev) =>
      prev.map((sup) =>
        sup.id === id ? { ...sup, isPreferred: !sup.isPreferred } : sup
      )
    );
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(prev => ({ ...prev, isPreferred: !prev.isPreferred }));
    }
    onShowToast?.('Updated preferred status');
  };

  // Selection Checkbox
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSuppliers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSuppliers.map((s) => s.id));
    }
  };

  // Filter Logic
  const filteredSuppliers = suppliersList.filter((sup) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      sup.code.toLowerCase().includes(q) ||
      sup.name.toLowerCase().includes(q) ||
      sup.contactPerson.toLowerCase().includes(q) ||
      sup.email.toLowerCase().includes(q);

    const matchesType = typeFilter === 'All Types' || sup.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || sup.status === statusFilter;
    const matchesCountry = countryFilter === 'All Countries' || sup.country === countryFilter;

    return matchesQuery && matchesType && matchesStatus && matchesCountry;
  });

  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('All Types');
    setStatusFilter('All');
    setCountryFilter('All Countries');
    onShowToast?.('Filters reset to default.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Supplier Code',
      'Supplier Name',
      'Type',
      'Country',
      'Contact Person',
      'Phone',
      'Email',
      'Status',
      'Preferred',
      'Tax Number (TRN)',
      'Payment Terms',
      'Lead Time (Days)',
      'Currency',
      'Website',
      'Address',
      'Remarks'
    ];
    const rows = filteredSuppliers.map((s) => [
      s.code,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.type,
      s.country,
      `"${(s.contactPerson || '').replace(/"/g, '""')}"`,
      s.phone,
      s.email,
      s.status,
      s.isPreferred ? 'Yes' : 'No',
      s.trn,
      s.paymentTerms,
      s.leadTimeDays,
      s.currency,
      s.website,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suppliers_directory.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Suppliers directory exported to CSV.');
  };

  // Download Sample Supplier Import CSV Template
  const handleDownloadSampleSupplierTemplate = () => {
    const headers = ['code', 'name', 'type', 'country', 'contactPerson', 'phone', 'email', 'trn', 'paymentTerms', 'leadTimeDays', 'currency', 'website', 'address', 'remarks'];
    const sampleRows = [
      ['SUP-011', 'Danfoss Middle East FZCO', 'Parts Supplier', 'UAE', 'Karim Zaki', '+971 4 812 0000', 'karim@danfoss.ae', 'TRN9988112233', '30 Days', 10, 'AED', 'www.danfoss.ae', 'Jebel Ali Free Zone, Dubai', 'HVAC expansion valves and control systems.'],
      ['SUP-012', 'Gulf Cooling Solutions', 'Service Supplier', 'UAE', 'Sultan Mansoor', '+971 4 220 5500', 'info@gulfcooling.ae', 'TRN7766554433', '15 Days', 3, 'AED', 'www.gulfcooling.ae', 'Al Quoz Industrial 2, Dubai', 'Chiller overhaul and maintenance contractor.']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suppliers_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Sample supplier import template downloaded.');
  };

  // Parse Uploaded Supplier CSV
  const handleSupplierCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) return;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          onShowToast?.('CSV file is empty or has only headers.', 'error');
          return;
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const raw = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (!raw || raw.length === 0) continue;
          const c = raw.map(v => v.trim().replace(/^"|"$/g, ''));
          parsed.push({
            id: Date.now() + i,
            code: c[0] || `SUP-${String(suppliersList.length + i).padStart(3, '0')}`,
            name: c[1] || `Supplier ${i}`,
            type: c[2] || 'Parts Supplier',
            country: c[3] || 'UAE',
            contactPerson: c[4] || 'Contact Person',
            phone: c[5] || '+971 4 000 0000',
            email: c[6] || 'vendor@example.com',
            trn: c[7] || 'TRN0000000000',
            paymentTerms: c[8] || '30 Days',
            leadTimeDays: parseInt(c[9], 10) || 7,
            currency: c[10] || 'AED',
            website: c[11] || 'www.example.com',
            address: c[12] || 'Dubai, UAE',
            remarks: c[13] || 'Imported via CSV catalog',
            status: 'Active',
            isPreferred: false,
            documents: []
          });
        }
        setImportPreviewRows(parsed);
        onShowToast?.(`Parsed ${parsed.length} supplier records from ${file.name}`);
      } catch (err) {
        onShowToast?.('Failed to parse supplier CSV file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmSupplierImport = () => {
    if (importPreviewRows.length === 0) return;
    setSuppliersList(prev => [...importPreviewRows, ...prev]);
    onShowToast?.(`Imported ${importPreviewRows.length} new supplier(s) successfully!`);
    setShowImportModal(false);
    setImportPreviewRows([]);
    setImportFileName('');
  };

  const handleDownloadDocBlob = (docName) => {
    const content = `--- Asset360 Official Document ---\nDocument: ${docName}\nSupplier: ${selectedSupplier?.name} (${selectedSupplier?.code})\nTRN: ${selectedSupplier?.trn}\nDownloaded: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Downloaded ${docName}`);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* BULK SELECTION ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
          <span className="font-bold text-[#6C2BD9]">
            {selectedIds.length} supplier(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
            >
              Deselect All
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: SUPPLIERS LIST TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Suppliers List</h2>
                <p className="text-xs text-slate-500">
                  View and manage all suppliers for spare parts and services.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" /> Export CSV
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Supplier
                </button>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by supplier name, code, contact person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] transition-colors"
                />
              </div>

              {/* Supplier Type Dropdown */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All Types">Supplier Type: All Types</option>
                  <option value="Parts Supplier">Parts Supplier</option>
                  <option value="Service Supplier">Service Supplier</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Country Dropdown */}
              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="All Countries">Country: All</option>
                  <option value="UAE">UAE</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Reset
              </button>

              {/* Filter Button */}
              <button
                onClick={() => onShowToast?.(`Filters applied (${filteredSuppliers.length} records found)`)}
                className="px-3 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 fill-current" /> Filter
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-auto max-h-[520px] border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Supplier Code</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Supplier Type</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Contact Person</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-2 text-center">Pref.</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="py-8 text-center text-slate-400">
                        No suppliers found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((sup, idx) => {
                      const isSelected = selectedSupplier?.id === sup.id;
                      return (
                        <tr
                          key={sup.id}
                          onClick={() => setSelectedSupplier(sup)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(sup.id)}
                              onChange={() => toggleSelect(sup.id)}
                              className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                            />
                          </td>

                          <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>

                          <td className="py-2.5 px-3">
                            <span className="text-[#6C2BD9] font-bold font-mono hover:underline">
                              {sup.code}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {sup.name}
                          </td>

                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{sup.type}</td>
                          <td className="py-2.5 px-3 text-slate-600">{sup.country}</td>

                          <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                            {sup.contactPerson}
                          </td>

                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {sup.phone}
                          </td>

                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {sup.email}
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${
                                sup.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-100 text-rose-700 border-rose-300'
                              }`}
                            >
                              {sup.status}
                            </span>
                          </td>

                          <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => togglePreferred(sup.id, e)}
                              className="text-[#6C2BD9] hover:scale-110 transition-transform p-1"
                              title={sup.isPreferred ? 'Preferred Supplier' : 'Set as Preferred'}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  sup.isPreferred
                                    ? 'fill-[#6C2BD9] text-[#6C2BD9]'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedSupplier(sup)}
                                className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(sup)}
                                className="p-1 rounded-md text-[#6C2BD9] hover:bg-purple-100 transition-colors"
                                title="Edit Supplier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteSupplier(sup.id, e)}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete Supplier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Table Summary */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-slate-600 font-medium text-xs">
              Showing {filteredSuppliers.length} records
            </span>
            <span className="text-slate-400 text-xs">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: SUPPLIER DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-4">
          {selectedSupplier ? (
            <div className="space-y-4">
              {/* Header with Edit and Delete Buttons */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Supplier Details</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(selectedSupplier)}
                    className="px-3 py-1 border border-[#6C2BD9] text-[#6C2BD9] rounded-lg text-xs font-semibold hover:bg-purple-50 flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteSupplier(selectedSupplier.id, e)}
                    className="p-1 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Section: General Information */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Code</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedSupplier.code}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Name</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Type</span>
                  <span className="font-medium text-slate-800">{selectedSupplier.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      selectedSupplier.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Preferred Supplier</span>
                  <button
                    onClick={(e) => togglePreferred(selectedSupplier.id, e)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        selectedSupplier.isPreferred
                          ? 'fill-[#6C2BD9] text-[#6C2BD9]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section: Contact Information */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Contact Information</h4>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                    <span>{selectedSupplier.contactPerson}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                    <span className="font-mono">{selectedSupplier.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                    <a
                      href={`mailto:${selectedSupplier.email}`}
                      className="text-[#6C2BD9] hover:underline font-mono text-[11px]"
                    >
                      {selectedSupplier.email}
                    </a>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                    <span className="text-slate-700">{selectedSupplier.address}</span>
                  </div>
                </div>
              </div>

              {/* Section: Business Information */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Business Information</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Country</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.country}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tax Number (TRN)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedSupplier.trn}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Payment Terms</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.paymentTerms}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Lead Time (Days)</span>
                    <span className="font-mono text-slate-900 font-bold">{selectedSupplier.leadTimeDays}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Currency</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.currency}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Website</span>
                    <a
                      href={`https://${selectedSupplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6C2BD9] hover:underline font-medium flex items-center gap-1"
                    >
                      {selectedSupplier.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Section: Remarks Callout Box */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium block mb-1 text-xs">Remarks</span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 italic text-[11px] leading-relaxed">
                  {selectedSupplier.remarks}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Select a supplier to view details</div>
          )}
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex justify-between items-center">
        <button
          onClick={() => onShowToast?.('Action cancelled')}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocsModal(true)}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-600" /> View Documents
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" /> Export
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" /> Add Supplier
          </button>
        </div>
      </div>

      {/* MODAL: ADD / EDIT SUPPLIER */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6C2BD9]" />
                {editingSupplier ? `Edit Supplier: ${editingSupplier.code}` : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Code *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="e.g. Al Futtaim Trading LLC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier Type</label>
                  <select
                    value={supplierForm.type}
                    onChange={(e) => setSupplierForm({ ...supplierForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Parts Supplier">Parts Supplier</option>
                    <option value="Service Supplier">Service Supplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={supplierForm.country}
                    onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    placeholder="Ahmed Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="+971 4 331 2000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="supplier@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tax Number (TRN)</label>
                  <input
                    type="text"
                    value={supplierForm.trn}
                    onChange={(e) => setSupplierForm({ ...supplierForm, trn: e.target.value })}
                    placeholder="TRN123456789000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={supplierForm.leadTimeDays}
                    onChange={(e) => setSupplierForm({ ...supplierForm, leadTimeDays: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={supplierForm.currency}
                    onChange={(e) => setSupplierForm({ ...supplierForm, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={supplierForm.website}
                    onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                    placeholder="www.company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={supplierForm.isPreferred}
                      onChange={(e) => setSupplierForm({ ...supplierForm, isPreferred: e.target.checked })}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                    />
                    Mark as Preferred Supplier
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="PO Box 12345, Dubai, UAE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={supplierForm.remarks}
                  onChange={(e) => setSupplierForm({ ...supplierForm, remarks: e.target.value })}
                  placeholder="Vendor specialization, authorization, or contract notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DOCUMENTS */}
      {showDocsModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#6C2BD9]" /> Documents: {selectedSupplier.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedSupplier.code}</p>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: `${selectedSupplier.code}_Trade_License.pdf`, type: 'PDF', size: '1.4 MB', date: '10 Jan 2026', verified: true },
                { name: `${selectedSupplier.code}_Tax_Certificate_TRN.pdf`, type: 'PDF', size: '520 KB', date: '15 Jan 2026', verified: true },
                { name: `${selectedSupplier.code}_Vendor_Agreement_2026.pdf`, type: 'PDF', size: '2.1 MB', date: '01 Feb 2026', verified: true }
              ].map((doc, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#6C2BD9]" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.date} &bull; {doc.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocBlob(doc.name)}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-[#6C2BD9] hover:bg-purple-50 rounded-md text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-1.5 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT SUPPLIERS CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#6C2BD9]" /> Import Supplier Catalog (CSV)
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreviewRows([]);
                  setImportFileName('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-3 text-purple-900 flex justify-between items-center">
                <div>
                  <p className="font-bold">Supplier Import Template</p>
                  <p className="text-[11px] text-purple-800">
                    Required fields: code, name, type, contactPerson, phone, email, trn, paymentTerms, leadTimeDays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleSupplierTemplate}
                  className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => supplierImportInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#6C2BD9] bg-slate-50/50 hover:bg-purple-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={supplierImportInputRef}
                  accept=".csv,text/csv"
                  onChange={handleSupplierCSVFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto mb-2" />
                <p className="font-bold text-slate-800">Click to upload or drag & drop Supplier CSV</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports standard comma-delimited CSV (.csv)</p>
                {importFileName && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Selected: {importFileName} ({importPreviewRows.length} vendors detected)
                  </p>
                )}
              </div>

              {/* Preview table */}
              {importPreviewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Preview ({importPreviewRows.length} suppliers ready to import)</span>
                    <span className="text-[11px] text-slate-500">Showing first {Math.min(importPreviewRows.length, 5)} rows</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-auto max-h-48">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Code</th>
                          <th className="p-2">Supplier Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Contact</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Lead Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {importPreviewRows.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-[#6C2BD9]">{row.code}</td>
                            <td className="p-2 font-semibold text-slate-900">{row.name}</td>
                            <td className="p-2 text-slate-600">{row.type}</td>
                            <td className="p-2 text-slate-800">{row.contactPerson}</td>
                            <td className="p-2 text-[#6C2BD9]">{row.email}</td>
                            <td className="p-2 font-mono">{row.leadTimeDays} days</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportPreviewRows([]);
                    setImportFileName('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importPreviewRows.length === 0}
                  onClick={handleConfirmSupplierImport}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-xs ${
                    importPreviewRows.length === 0
                      ? 'bg-purple-300 cursor-not-allowed'
                      : 'bg-[#6C2BD9] hover:bg-[#5B21B6]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Import ({importPreviewRows.length} Vendors)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
