import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  UploadCloud,
  Trash2,
  Info,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check
} from 'lucide-react';

export default function CreateAudit() {
  const navigate = useNavigate();

  // Stepper state: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // 1. Basic Information State (Matching Screenshot)
  // ---------------------------------------------------------------------------
  const [auditName, setAuditName] = useState('HQ Annual IT Asset Audit 2026');
  const [auditType, setAuditType] = useState('Physical Verification');
  const [referenceNo, setReferenceNo] = useState('AUD-2026-0013');
  const [description, setDescription] = useState(
    'Annual physical verification of all IT assets at Dubai HQ including laptops, desktops, monitors and peripherals.'
  );
  const [auditObjective, setAuditObjective] = useState(
    'Verify asset existence, location and condition. Identify discrepancies and update records.'
  );
  const [company, setCompany] = useState('Dubai HQ');
  const [businessUnit, setBusinessUnit] = useState('IT Department');
  const [currency, setCurrency] = useState('AED');

  // ---------------------------------------------------------------------------
  // 2. Audit Scope State (Dual List & Filters)
  // ---------------------------------------------------------------------------
  const [scopeTab, setScopeTab] = useState('By Location'); // 'By Location' | 'By Asset Category' | 'By Custodian' | 'By Cost Center' | 'Custom Selection'
  const [locationSearch, setLocationSearch] = useState('');

  // Collapsible tree nodes
  const [expandedNodes, setExpandedNodes] = useState({ 'dxb-hq': true });
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Available locations tree
  const availableLocations = [
    {
      id: 'dxb-hq',
      name: 'Dubai HQ',
      code: 'DXB-HQ',
      type: 'Site',
      children: [
        { id: 'blk-a', name: 'Block A', code: 'BLK-A', type: 'Building' },
        { id: 'blk-b', name: 'Block B', code: 'BLK-B', type: 'Building' },
        { id: 'blk-c', name: 'Block C', code: 'BLK-C', type: 'Building' }
      ]
    },
    { id: 'jbl', name: 'Jebel Ali', code: 'JBL-WH', type: 'Site', children: [] },
    { id: 'auh', name: 'Abu Dhabi', code: 'AUH-BR', type: 'Site', children: [] },
    { id: 'shj', name: 'Sharjah', code: 'SHJ-OPS', type: 'Site', children: [] },
    { id: 'aln', name: 'Al Ain', code: 'ALN-DC', type: 'Site', children: [] }
  ];

  // Selected locations in the right box (matching screenshot: Block B, IT Floor - 1)
  const [selectedLocations, setSelectedLocations] = useState([
    { code: 'BLK-B', name: 'Block B', type: 'Building' },
    { code: 'IT-101', name: 'IT Floor - 1', type: 'Floor' }
  ]);

  // Checked available nodes before transfer
  const [checkedAvailableIds, setCheckedAvailableIds] = useState(['blk-b']);

  const handleToggleChecked = (id) => {
    if (checkedAvailableIds.includes(id)) {
      setCheckedAvailableIds(checkedAvailableIds.filter(x => x !== id));
    } else {
      setCheckedAvailableIds([...checkedAvailableIds, id]);
    }
  };

  // Dual-list actions
  const handleTransferSelected = () => {
    const toAdd = [];
    if (checkedAvailableIds.includes('blk-a') && !selectedLocations.some(l => l.code === 'BLK-A')) {
      toAdd.push({ code: 'BLK-A', name: 'Block A', type: 'Building' });
    }
    if (checkedAvailableIds.includes('blk-b') && !selectedLocations.some(l => l.code === 'BLK-B')) {
      toAdd.push({ code: 'BLK-B', name: 'Block B', type: 'Building' });
    }
    if (checkedAvailableIds.includes('blk-c') && !selectedLocations.some(l => l.code === 'BLK-C')) {
      toAdd.push({ code: 'BLK-C', name: 'Block C', type: 'Building' });
    }
    if (checkedAvailableIds.includes('jbl') && !selectedLocations.some(l => l.code === 'JBL-WH')) {
      toAdd.push({ code: 'JBL-WH', name: 'Jebel Ali', type: 'Site' });
    }
    if (toAdd.length > 0) {
      setSelectedLocations([...selectedLocations, ...toAdd]);
      showToast(`Added ${toAdd.length} location(s) to scope.`);
    }
  };

  const handleTransferAll = () => {
    setSelectedLocations([
      { code: 'BLK-A', name: 'Block A', type: 'Building' },
      { code: 'BLK-B', name: 'Block B', type: 'Building' },
      { code: 'BLK-C', name: 'Block C', type: 'Building' },
      { code: 'IT-101', name: 'IT Floor - 1', type: 'Floor' }
    ]);
  };

  const handleRemoveLocation = (code) => {
    setSelectedLocations(selectedLocations.filter(l => l.code !== code));
  };

  const handleRemoveAllLocations = () => {
    setSelectedLocations([]);
  };

  // Additional Filters
  const [assetGroup, setAssetGroup] = useState('IT Equipment');
  const [assetCategory, setAssetCategory] = useState('Laptops, Desktops, Monitors');
  const [assetStatus, setAssetStatus] = useState('All');
  const [includeSubLocations, setIncludeSubLocations] = useState(true);

  // ---------------------------------------------------------------------------
  // 3. Audit Parameters State
  // ---------------------------------------------------------------------------
  const [plannedStartDate, setPlannedStartDate] = useState('2026-09-01');
  const [plannedEndDate, setPlannedEndDate] = useState('2026-09-15');
  const [verificationMethod, setVerificationMethod] = useState('Barcode / RFID / Manual Entry');
  const [sampling, setSampling] = useState('Full Count (All Assets)');
  const [allowUnregistered, setAllowUnregistered] = useState(true);
  const [capturePhotos, setCapturePhotos] = useState(true);
  const [auditInstructions, setAuditInstructions] = useState(
    'Ensure all assets are verified. Capture condition and actual location. Report discrepancies.'
  );

  // ---------------------------------------------------------------------------
  // 4. Notifications State
  // ---------------------------------------------------------------------------
  const [notifyUsers, setNotifyUsers] = useState('Assigned Users');
  const [additionalRecipients, setAdditionalRecipients] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  // ---------------------------------------------------------------------------
  // 5. Attachments State
  // ---------------------------------------------------------------------------
  const [attachments, setAttachments] = useState([
    { id: 'att-1', name: 'IT_Audit_Scope_Checklist_2026.pdf', size: '1.4 MB' }
  ]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = files.map((f, i) => ({
      id: `att-${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
    }));
    setAttachments([...attachments, ...newFiles]);
    showToast(`Attached ${files.length} file(s).`);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Review & Confirmation Modal
  // ---------------------------------------------------------------------------
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Save Draft
  const handleSaveDraft = async () => {
    const payload = {
      auditName,
      auditType,
      referenceNo,
      description,
      auditObjective,
      company,
      businessUnit,
      currency,
      plannedStartDate,
      plannedEndDate,
      verificationMethod,
      samplingMethod: sampling,
      allowUnregistered,
      capturePhotos,
      auditInstructions,
      notifyUsers,
      notifyEmail: sendEmailNotification,
      additionalRecipients: additionalRecipients ? [additionalRecipients] : [],
      scopeType: scopeTab,
      scopeCriteria: {
        selectedLocations,
        assetGroup,
        assetCategory,
        assetStatus,
        includeSubLocations
      },
      attachments,
      isDraft: true
    };

    try {
      setLoading(true);
      await api.post('/stocktakes/audits', payload);
      showToast('Audit saved as Draft successfully! No verification tasks generated.');
      setTimeout(() => navigate('/stocktakes/management'), 1500);
    } catch (err) {
      showToast(err.message || 'Failed to save draft.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Audit for Approval
  const handleSubmitAudit = async () => {
    const payload = {
      auditName,
      auditType,
      referenceNo,
      description,
      auditObjective,
      company,
      businessUnit,
      currency,
      plannedStartDate,
      plannedEndDate,
      verificationMethod,
      samplingMethod: sampling,
      allowUnregistered,
      capturePhotos,
      auditInstructions,
      notifyUsers,
      notifyEmail: sendEmailNotification,
      additionalRecipients: additionalRecipients ? [additionalRecipients] : [],
      scopeType: scopeTab,
      scopeCriteria: {
        selectedLocations,
        assetGroup,
        assetCategory,
        assetStatus,
        includeSubLocations
      },
      attachments,
      isDraft: false
    };

    try {
      setLoading(true);
      await api.post('/stocktakes/audits', payload);
      showToast('Audit submitted successfully! Campaign routed for managerial approval.');
      setShowReviewModal(false);
      setTimeout(() => navigate('/stocktakes/management'), 1500);
    } catch (err) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
          <button onClick={() => navigate('/stocktakes/management')} className="hover:text-[#6C2BD9] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Verification & Audit
          </button>
          <span>›</span>
          <button onClick={() => navigate('/stocktakes/management')} className="hover:text-[#6C2BD9]">
            Audit Management
          </button>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Create Audit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Audit</h1>
        <p className="text-xs text-gray-500 mt-0.5">Define audit scope, assign users and schedule the verification audit</p>

        {/* 5-Step Stepper */}
        <div className="mt-6 border-t border-gray-100 pt-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-gray-200 z-0" />

            {/* Step 1: Basic Information */}
            <div className="flex items-center gap-2 bg-white px-3 relative z-10 cursor-pointer" onClick={() => setCurrentStep(1)}>
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm ${
                currentStep === 1 ? 'bg-[#6C2BD9] text-white' : 'bg-purple-100 text-[#6C2BD9]'
              }`}>
                1
              </span>
              <span className={`text-xs ${currentStep === 1 ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                Basic Information
              </span>
            </div>

            {/* Step 2: Audit Scope */}
            <div className="flex items-center gap-2 bg-white px-3 relative z-10 cursor-pointer" onClick={() => setCurrentStep(2)}>
              <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                currentStep === 2 ? 'bg-[#6C2BD9] text-white' : 'bg-gray-100 border border-gray-300 text-gray-500'
              }`}>
                2
              </span>
              <span className={`text-xs ${currentStep === 2 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                Audit Scope
              </span>
            </div>

            {/* Step 3: Assign Users */}
            <div className="flex items-center gap-2 bg-white px-3 relative z-10 cursor-pointer" onClick={() => setCurrentStep(3)}>
              <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                currentStep === 3 ? 'bg-[#6C2BD9] text-white' : 'bg-gray-100 border border-gray-300 text-gray-500'
              }`}>
                3
              </span>
              <span className={`text-xs ${currentStep === 3 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                Assign Users
              </span>
            </div>

            {/* Step 4: Schedule */}
            <div className="flex items-center gap-2 bg-white px-3 relative z-10 cursor-pointer" onClick={() => setCurrentStep(4)}>
              <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                currentStep === 4 ? 'bg-[#6C2BD9] text-white' : 'bg-gray-100 border border-gray-300 text-gray-500'
              }`}>
                4
              </span>
              <span className={`text-xs ${currentStep === 4 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                Schedule
              </span>
            </div>

            {/* Step 5: Review & Submit */}
            <div className="flex items-center gap-2 bg-white px-3 relative z-10 cursor-pointer" onClick={() => setShowReviewModal(true)}>
              <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center">
                5
              </span>
              <span className="text-xs font-medium text-gray-500">Review & Submit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content (Grid matching Screenshot Layout) */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Section 1 (Basic Info) & Section 2 (Audit Scope) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">1. Basic Information</h2>

              {/* Row 1: Audit Name, Audit Type, Reference No */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Audit Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={auditName}
                    onChange={(e) => setAuditName(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9]"
                    placeholder="e.g. HQ Annual IT Asset Audit 2026"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Audit Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] bg-white"
                  >
                    <option>Physical Verification</option>
                    <option>Full Census</option>
                    <option>Cycle Count</option>
                    <option>Sample Count</option>
                    <option>Exception Recheck</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Reference No.</label>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] bg-gray-50 font-mono text-gray-700"
                  />
                </div>
              </div>

              {/* Row 2: Description & Audit Objective */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] resize-none"
                    placeholder="Describe the scope and purpose of the verification..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Audit Objective</label>
                  <textarea
                    rows={3}
                    value={auditObjective}
                    onChange={(e) => setAuditObjective(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] resize-none"
                    placeholder="State the objective of this audit..."
                  />
                </div>
              </div>

              {/* Row 3: Company/Entity, Business Unit, Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company / Entity <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] bg-white"
                  >
                    <option>Dubai HQ</option>
                    <option>Abu Dhabi Branch</option>
                    <option>Riyadh Distribution Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Business Unit</label>
                  <select
                    value={businessUnit}
                    onChange={(e) => setBusinessUnit(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] bg-white"
                  >
                    <option>IT Department</option>
                    <option>Finance & Accounting</option>
                    <option>Operations & Supply Chain</option>
                    <option>Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C2BD9] bg-white"
                  >
                    <option>AED</option>
                    <option>USD</option>
                    <option>SAR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. AUDIT SCOPE */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">2. Audit Scope</h2>
                <div className="flex items-center gap-1.5 bg-purple-50 text-[#6C2BD9] px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <span>Estimated Population: ~600 Assets</span>
                </div>
              </div>

              {/* Scope Tabs */}
              <div className="flex items-center gap-4 border-b border-gray-200 text-xs font-medium">
                {['By Location', 'By Asset Category', 'By Custodian', 'By Cost Center', 'Custom Selection'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setScopeTab(tab)}
                    className={`pb-2.5 transition-colors relative ${
                      scopeTab === tab
                        ? 'text-[#6C2BD9] font-bold border-b-2 border-[#6C2BD9]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Dual List Tree Picker (Matching Screenshot Exactly) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Available Locations Box (Left) */}
                <div className="md:col-span-5 border border-gray-200 rounded-lg p-3 bg-white space-y-2 h-64 overflow-y-auto">
                  <span className="text-[11px] font-bold text-gray-600 block">Available Locations</span>
                  
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-200 rounded-md outline-none"
                    />
                  </div>

                  {/* Tree Structure */}
                  <div className="space-y-1 text-xs pt-1">
                    {/* Dubai HQ Parent */}
                    <div>
                      <div className="flex items-center gap-1.5 hover:bg-gray-50 p-1 rounded">
                        <button
                          type="button"
                          onClick={() => toggleNode('dxb-hq')}
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                        >
                          {expandedNodes['dxb-hq'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <input
                          type="checkbox"
                          checked={checkedAvailableIds.includes('dxb-hq')}
                          onChange={() => handleToggleChecked('dxb-hq')}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                        <span className="font-semibold text-gray-800">Dubai HQ</span>
                      </div>

                      {/* Children: Block A, Block B, Block C */}
                      {expandedNodes['dxb-hq'] && (
                        <div className="pl-6 space-y-1 mt-0.5">
                          {['Block A', 'Block B', 'Block C'].map((blk, idx) => {
                            const bId = `blk-${blk.slice(-1).toLowerCase()}`;
                            return (
                              <div key={idx} className="flex items-center gap-1.5 hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={checkedAvailableIds.includes(bId)}
                                  onChange={() => handleToggleChecked(bId)}
                                  className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                                />
                                <span className="text-gray-700">{blk}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Other Branches */}
                    {['Jebel Ali', 'Abu Dhabi', 'Sharjah', 'Al Ain'].map((loc, i) => (
                      <div key={i} className="flex items-center gap-1.5 hover:bg-gray-50 p-1 rounded">
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <input
                          type="checkbox"
                          checked={checkedAvailableIds.includes(`loc-${i}`)}
                          onChange={() => handleToggleChecked(`loc-${i}`)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                        <span className="text-gray-700">{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transfer Action Buttons (Middle) */}
                <div className="md:col-span-1 flex md:flex-col justify-center items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTransferSelected}
                    className="w-7 h-7 border border-gray-300 rounded hover:bg-purple-50 text-gray-600 hover:text-[#6C2BD9] font-bold flex items-center justify-center text-xs"
                    title="Move Selected"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={handleTransferAll}
                    className="w-7 h-7 border border-gray-300 rounded hover:bg-purple-50 text-gray-600 hover:text-[#6C2BD9] font-bold flex items-center justify-center text-xs"
                    title="Move All"
                  >
                    »
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAllLocations}
                    className="w-7 h-7 border border-gray-300 rounded hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold flex items-center justify-center text-xs"
                    title="Remove All"
                  >
                    «
                  </button>
                </div>

                {/* Selected Locations Table (Right) */}
                <div className="md:col-span-6 border border-gray-200 rounded-lg p-3 bg-white space-y-2 h-64 overflow-y-auto">
                  <span className="text-[11px] font-bold text-gray-600 block">
                    Selected Locations ({selectedLocations.length})
                  </span>

                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-white shadow-2xs">
                      <tr className="border-b text-gray-500 font-semibold text-[11px]">
                        <th className="py-1">Location Code</th>
                        <th className="py-1">Location Name</th>
                        <th className="py-1">Type</th>
                        <th className="py-1 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {selectedLocations.map((loc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-1.5 font-semibold text-[#6C2BD9]">{loc.code}</td>
                          <td className="py-1.5">{loc.name}</td>
                          <td className="py-1.5 text-gray-500">{loc.type}</td>
                          <td className="py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLocation(loc.code)}
                              className="text-gray-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-medium text-gray-600">Showing {selectedLocations.length} locations</span>
                    <span className="text-gray-400">Scroll down to view all</span>
                  </div>
                </div>

              </div>

              {/* Additional Filters */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <span className="text-[11px] font-bold text-gray-700 block">Additional Filters</span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Asset Group</label>
                    <select
                      value={assetGroup}
                      onChange={(e) => setAssetGroup(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-1.5 outline-none bg-white"
                    >
                      <option>IT Equipment</option>
                      <option>Furniture & Fixtures</option>
                      <option>Vehicles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Asset Category</label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-1.5 outline-none bg-white"
                    >
                      <option>Laptops, Desktops, Monitors</option>
                      <option>Servers & Networking</option>
                      <option>Printers & Peripherals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Asset Status</label>
                    <select
                      value={assetStatus}
                      onChange={(e) => setAssetStatus(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-1.5 outline-none bg-white"
                    >
                      <option>All</option>
                      <option>In Service</option>
                      <option>In Store</option>
                      <option>Under Maintenance</option>
                    </select>
                  </div>

                  {/* Include Sub Locations Toggle */}
                  <div className="flex items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIncludeSubLocations(!includeSubLocations)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                        includeSubLocations ? 'bg-[#6C2BD9]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        includeSubLocations ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block">Include Sub Locations</span>
                      <span className="text-[10px] text-gray-400">{includeSubLocations ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: 3. Audit Parameters, 4. Notifications, 5. Attachments */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 3. AUDIT PARAMETERS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-900">3. Audit Parameters</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Planned Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={plannedStartDate}
                    onChange={(e) => setPlannedStartDate(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Planned End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={(e) => setPlannedEndDate(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Verification Method <span className="text-rose-500">*</span>
                </label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none bg-white"
                >
                  <option>Barcode / RFID / Manual Entry</option>
                  <option>Barcode Only</option>
                  <option>RFID Handheld Scan</option>
                  <option>Manual Serial Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sampling</label>
                <select
                  value={sampling}
                  onChange={(e) => setSampling(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none bg-white"
                >
                  <option>Full Count (All Assets)</option>
                  <option>Sample Count (10%)</option>
                  <option>Sample Count (25%)</option>
                  <option>High-Value Assets Only</option>
                </select>
              </div>

              {/* Toggles: Allow Unregistered Assets & Capture Photos */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-gray-700 block mb-1">Allow Unregistered Assets</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllowUnregistered(!allowUnregistered)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                        allowUnregistered ? 'bg-[#6C2BD9]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        allowUnregistered ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-xs text-gray-600">{allowUnregistered ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-700 block mb-1">Capture Photos</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCapturePhotos(!capturePhotos)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                        capturePhotos ? 'bg-[#6C2BD9]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        capturePhotos ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-xs text-gray-600">{capturePhotos ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Audit Instructions */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Audit Instructions</label>
                  <span className="text-[10px] text-gray-400">{auditInstructions.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={auditInstructions}
                  onChange={(e) => setAuditInstructions(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6C2BD9] resize-none"
                />
              </div>
            </div>

            {/* 4. NOTIFICATIONS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-900">4. Notifications</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notify Users</label>
                  <select
                    value={notifyUsers}
                    onChange={(e) => setNotifyUsers(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none bg-white"
                  >
                    <option>Assigned Users</option>
                    <option>Department Heads</option>
                    <option>All Stakeholders</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Recipients</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={additionalRecipients}
                      onChange={(e) => setAdditionalRecipients(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 pr-7 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emailNotify"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
                />
                <label htmlFor="emailNotify" className="text-xs text-gray-700">
                  Send email notification on audit approval and start date
                </label>
              </div>
            </div>

            {/* 5. ATTACHMENTS (OPTIONAL) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-900">5. Attachments (Optional)</h2>

              <label className="border-2 border-dashed border-purple-200 hover:border-[#6C2BD9] bg-purple-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <UploadCloud className="w-7 h-7 text-[#6C2BD9] mb-1" />
                <span className="text-xs text-gray-700 font-medium">
                  Drag and drop files here or <span className="text-[#6C2BD9] underline font-bold">click to upload</span>
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  PDF, DOCX, XLSX, JPG, PNG (Max 10 MB)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                />
              </label>

              {/* Uploaded Attachments */}
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#6C2BD9] shrink-0" />
                    <span className="truncate font-medium text-gray-800">{att.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{att.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS (BOTTOM RIGHT) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/stocktakes/management')}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveDraft}
                className="px-5 py-2.5 text-xs font-semibold text-[#6C2BD9] border border-[#6C2BD9] rounded-lg hover:bg-purple-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5B21B6] rounded-lg shadow-md transition-colors"
              >
                Next &gt;
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* REVIEW & SUBMIT CONFIRMATION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-900">Review & Submit Verification Audit</h3>
                <p className="text-xs text-gray-500">Confirm campaign parameters and governance rules before submission</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF5FF] border border-purple-200 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#6C2BD9]">{auditName}</span>
                  <span className="font-mono text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    {referenceNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-600 text-[11px] pt-1 border-t border-purple-100">
                  <div><strong>Type:</strong> {auditType}</div>
                  <div><strong>Entity:</strong> {company} ({businessUnit})</div>
                  <div><strong>Planned Timeline:</strong> {plannedStartDate} to {plannedEndDate}</div>
                  <div><strong>Verification Method:</strong> {verificationMethod}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700 block mb-1">Scoped Locations ({selectedLocations.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocations.map((l, i) => (
                    <span key={i} className="bg-gray-100 border text-gray-800 px-2 py-1 rounded text-[11px]">
                      {l.code} - {l.name} ({l.type})
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-[11px] flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>FSD Governance Policy:</strong> Upon submission, this campaign will route for Director Approval. Once approved and activated, Asset360 will automatically snapshot and freeze the expected asset population (~600 assets) to guarantee an immutable verification baseline.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitAudit}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Confirm & Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
